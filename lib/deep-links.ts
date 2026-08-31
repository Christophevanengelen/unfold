/**
 * Ce qui se passe quand une adresse `unfold://` ouvre l app.
 *
 * Le cas qui compte est la connexion par lien magique. La panne etait double,
 * et chaque moitie suffisait a la casser :
 *
 *   1. Le schema `unfold` etait declare dans Info.plist, mais PERSONNE
 *      n ecoutait `appUrlOpen`. iOS ouvrait donc bien l app, et le jeton
 *      contenu dans l adresse partait a la poubelle sans que rien ne le dise.
 *      La personne se retrouvait devant l ecran d accueil, pas connectee, sans
 *      message d erreur — la pire forme de panne.
 *
 *   2. `window.location.origin` vaut `unfold://localhost` dans la vue web de
 *      Capacitor. Le lien repartait donc vers une adresse que Supabase doit
 *      explicitement autoriser, faute de quoi il retombe sur l adresse du site
 *      et ouvre le navigateur au lieu de l app.
 *
 * Supabase renvoie les jetons de deux facons selon la configuration : dans le
 * fragment (`#access_token=...`), ou sous forme de code a echanger
 * (`?code=...`). On accepte les deux plutot que de parier sur celle d
 * aujourd hui.
 */

import { isNative } from "@/lib/platform";
import { supabaseAuth } from "@/lib/supabase-auth";

/** L adresse de retour a utiliser dans l app. Doit etre autorisee par Supabase. */
export const RETOUR_NATIF = "unfold://localhost/auth/callback";

/**
 * Lit une adresse de retour et ouvre la session si elle en contient de quoi.
 * Renvoie vrai si quelqu un vient d etre connecte.
 *
 * Exporte pour pouvoir etre eprouvee sans telephone : c est du decoupage de
 * chaine, et c est exactement la ou les erreurs se cachent.
 */
export async function ouvrirSessionDepuisAdresse(adresse: string): Promise<boolean> {
  if (!supabaseAuth) return false;

  let url: URL;
  try {
    url = new URL(adresse);
  } catch {
    return false;
  }

  // Les jetons voyagent dans le fragment, que URL expose avec son `#`.
  const fragment = new URLSearchParams(url.hash.replace(/^#/, ""));
  const acces = fragment.get("access_token");
  const rafraichissement = fragment.get("refresh_token");

  if (acces && rafraichissement) {
    const { error } = await supabaseAuth.auth.setSession({
      access_token: acces,
      refresh_token: rafraichissement,
    });
    return !error;
  }

  // L autre forme : un code a echanger. Il peut arriver dans la requete ou
  // dans le fragment selon le chemin parcouru.
  const code = url.searchParams.get("code") ?? fragment.get("code");
  if (code) {
    const { error } = await supabaseAuth.auth.exchangeCodeForSession(code);
    return !error;
  }

  // Une erreur renvoyee par Supabase : lien expire, deja utilise. On ne la
  // fait pas passer pour un succes.
  return false;
}

/**
 * Branche l ecoute. A monter une seule fois, au demarrage.
 *
 * `surConnexion` est appele quand une session vient de s ouvrir, pour que
 * l ecran se mette a jour sans que la personne ait a faire quoi que ce soit.
 */
export async function brancherLiensProfonds(
  surConnexion: () => void,
): Promise<() => void> {
  if (typeof window === "undefined" || !isNative()) return () => {};

  try {
    const { App } = await import("@capacitor/app");

    const ecoute = await App.addListener("appUrlOpen", (evenement) => {
      void ouvrirSessionDepuisAdresse(evenement.url).then((connecte) => {
        if (connecte) surConnexion();
      });
    });

    // Si l app a ete LANCEE par le lien plutot que simplement ramenee au
    // premier plan, l evenement a pu partir avant que React ne monte. On
    // demande donc aussi l adresse de lancement.
    try {
      const lancement = await App.getLaunchUrl();
      if (lancement?.url) {
        const connecte = await ouvrirSessionDepuisAdresse(lancement.url);
        if (connecte) surConnexion();
      }
    } catch {
      /* pas d adresse de lancement : cas normal */
    }

    return () => {
      void ecoute.remove();
    };
  } catch {
    return () => {};
  }
}
