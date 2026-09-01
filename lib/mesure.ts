/**
 * Mesure d usage, cote client.
 *
 * Le projet n avait aucune mesure : le seul emetteur d evenements vivait dans
 * components/landing/Hero.tsx et ecrivait dans la console du navigateur.
 * L app, elle, n emettait rien. On ne savait donc pas combien de gens
 * finissaient l onboarding, ni combien revenaient.
 *
 * Trois principes tenus ici :
 *
 * 1. La mesure ne casse jamais le produit. Tout est en « on envoie et on
 *    oublie » : aucune attente, aucune exception qui remonte, aucun ecran qui
 *    depend d une reponse. Perdre un evenement est sans consequence, faire
 *    echouer un ecran ne l est pas.
 *
 * 2. Aucune donnee personnelle. Pas de date de naissance, pas de nom, pas de
 *    lieu. L identifiant d installation est tire au sort sur l appareil : il
 *    distingue deux installations, il ne dit rien de la personne et ne la suit
 *    pas d un appareil a l autre. Le drapeau « ne pas me suivre » du navigateur
 *    coupe l envoi en amont.
 *
 * 3. La retention ne s emet pas, elle se calcule. On envoie une ouverture
 *    d app ; la part de gens revenus en J+1 ou J+7 se lit ensuite par une
 *    requete (fonction retention_app, migration 009). Une app ne sait pas de
 *    facon fiable quel jour elle en est, surtout si on change d appareil.
 */

import { getApiBase } from "@/lib/api-client";
import { isNative } from "@/lib/platform";

const CLE_INSTALLATION = "favorable_install_id";

/** Les seuls noms acceptes. La route serveur tient la meme liste. */
export type Evenement =
  | "app_ouverte"
  | "onboarding_demarre"
  | "onboarding_termine"
  | "premier_signal_vu"
  | "signal_ouvert"
  // Les notifications. Au 01/09/2026 la base compte ZERO jeton enregistre,
  // et rien ne permet de dire pourquoi : personne n a vu la proposition, ou
  // tout le monde echoue a l enregistrement ? Sans ces quatre evenements la
  // question reste sans reponse, et une panne se confond avec une absence
  // d usage.
  | "notif_demandee"
  | "notif_accordee"
  | "notif_refusee"
  | "notif_echec";

function identifiantInstallation(): string | null {
  try {
    const existant = localStorage.getItem(CLE_INSTALLATION);
    if (existant) return existant;
    const neuf =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(CLE_INSTALLATION, neuf);
    return neuf;
  } catch {
    // Navigation privee, stockage refuse : on renonce a mesurer plutot que de
    // fabriquer un identifiant a chaque appel, qui gonflerait les chiffres.
    return null;
  }
}

function langue(): string | undefined {
  try {
    return localStorage.getItem("unfold_locale") ?? navigator.language?.slice(0, 2);
  } catch {
    return undefined;
  }
}

/**
 * Envoie un evenement. Ne renvoie rien, ne leve jamais, n attend jamais.
 */
export function mesurer(event: Evenement, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  try {
    if (navigator.doNotTrack === "1") return;

    const installId = identifiantInstallation();
    if (!installId) return;

    const corps = JSON.stringify({
      event,
      installId,
      surface: isNative() ? "app" : "web",
      locale: langue(),
      props: props ?? {},
    });

    const url = `${getApiBase()}/api/events`;

    // sendBeacon survit a une navigation ou a une mise en arriere-plan, ce qui
    // compte pour un evenement emis au moment ou l on quitte un ecran. Il ne
    // sait poster que vers la meme origine : en natif on retombe donc sur
    // fetch, avec keepalive.
    if (!isNative() && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url, new Blob([corps], { type: "application/json" }));
      return;
    }

    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: corps,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silence volontaire : voir principe 1
  }
}

/**
 * A n emettre qu une fois par installation. Sert aux evenements de parcours
 * qu on ne veut pas compter deux fois si la personne revient sur l ecran.
 */
export function mesurerUneFois(event: Evenement, props?: Record<string, unknown>): void {
  const cle = `favorable_mesure_${event}`;
  try {
    if (localStorage.getItem(cle)) return;
    localStorage.setItem(cle, "1");
  } catch {
    return;
  }
  mesurer(event, props);
}
