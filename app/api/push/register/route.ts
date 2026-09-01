/**
 * Enregistrement d un jeton de notification.
 *
 * Meme style que /api/events : listes fermees, aucune donnee personnelle
 * inutile, echec silencieux qui ne casse pas l app.
 *
 * Ce que le silence coute ici, et ce qui le rachete : perdre l ecriture, c est
 * perdre la personne pour les notifications. Ce qui rend l echec silencieux
 * acceptable, c est que l app rappelle cette route a CHAQUE demarrage a froid,
 * pas une seule fois a l installation. Une ecriture ratee se repare toute seule
 * au lancement suivant. Sans cette repetition, le silence serait une faute.
 *
 * Il n existe volontairement pas de route de desenregistrement : elle offrirait
 * a un tiers connaissant un identifiant d appareil le moyen de couper les
 * notifications de quelqu un. C est le refus du fournisseur (410) qui fait
 * autorite pour invalider un jeton.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";
import { withCors, corsPreflightResponse } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FOURNISSEURS = new Set(["apns", "fcm"]);
const PLATEFORMES = new Set(["ios", "android"]);

/**
 * La liste fermee des fuseaux existe deja dans Node. Un fuseau mal ecrit se
 * voit ainsi tout de suite, au lieu de produire une notification a 3 h du matin
 * trois semaines plus tard.
 */
const FUSEAUX: Set<string> = (() => {
  try {
    return new Set(Intl.supportedValuesOf("timeZone"));
  } catch {
    return new Set<string>();
  }
})();

/**
 * Le jeton ne peut pas avoir de liste fermee. Controle de forme volontairement
 * large : les jetons APNs font 64 caracteres hexadecimaux aujourd hui, ceux de
 * FCM environ 160, et les deux formats ont deja change. Un controle trop serre
 * casse silencieusement a la prochaine evolution.
 */
const JETON = /^[A-Za-z0-9_:.-]{32,4096}$/;

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

function refus(req: NextRequest, raison: string) {
  return withCors(
    req,
    NextResponse.json({ error: raison }, { status: 400, headers: { "Cache-Control": "no-store" } }),
  );
}

export async function POST(req: NextRequest) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return refus(req, "corps_illisible");
  }

  const { jeton, fournisseur, plateforme, deviceId, fuseau, locale } = (corps ?? {}) as Record<
    string,
    unknown
  >;

  if (typeof jeton !== "string" || !JETON.test(jeton)) return refus(req, "jeton_invalide");
  if (typeof fournisseur !== "string" || !FOURNISSEURS.has(fournisseur)) {
    return refus(req, "fournisseur_inconnu");
  }
  if (typeof plateforme !== "string" || !PLATEFORMES.has(plateforme)) {
    return refus(req, "plateforme_inconnue");
  }
  if (typeof deviceId !== "string" || deviceId.length < 8 || deviceId.length > 64) {
    return refus(req, "appareil_invalide");
  }
  // Si Node ne sait pas enumerer les fuseaux, on ne bloque pas sur une liste
  // vide : on se contente d un controle de forme.
  if (typeof fuseau !== "string" || (FUSEAUX.size > 0 ? !FUSEAUX.has(fuseau) : fuseau.length > 64)) {
    return refus(req, "fuseau_invalide");
  }
  if (locale !== undefined && (typeof locale !== "string" || locale.length > 8)) {
    return refus(req, "langue_invalide");
  }

  try {
    const supabase = getAdminClient();
    // supabase-js NE REJETTE PAS sur une erreur Postgres : il resout avec un
    // objet { error }. Un try/catch autour de l appel n attrape donc RIEN —
    // fonction absente, droit refuse, contrainte violee, tout passait et la
    // route repondait 204 sans une ligne de journal.
    //
    // C est le meme piege que partout ailleurs aujourd hui : le code a l air de
    // gerer l erreur, et il ne la voit pas. Il faut LIRE error.
    const { error } = await supabase.rpc("enregistrer_push_jeton", {
      p_jeton: jeton,
      p_fournisseur: fournisseur,
      p_plateforme: plateforme,
      p_device_id: deviceId,
      p_fuseau: fuseau,
      p_locale: typeof locale === "string" ? locale : null,
    });
    if (error) throw new Error(error.message);
  } catch (e) {
    // On ne casse toujours pas l app — voir l en-tete, l enregistrement se
    // rejoue au prochain demarrage. Mais on ne perd plus l information que
    // quelqu un a ESSAYE.
    //
    // Au 01/09/2026 la table push_jetons etait vide, et ce catch muet rendait
    // la cause indecidable : personne n avait accorde la permission, ou tout
    // le monde echouait ici ? Les deux produisaient exactement le meme silence.
    // Une trace ne repare rien, mais elle tranche la question.
    const detail = e instanceof Error ? e.message : String(e);
    console.error("enregistrement du jeton refuse :", detail);
    try {
      await getAdminClient()
        .from("app_events")
        .insert({
          event: "notif_echec",
          install_id: deviceId,
          surface: "serveur",
          props: { plateforme, detail: detail.slice(0, 300) },
        });
    } catch {
      // Si meme la trace echoue, la base est injoignable : le journal Vercel
      // ci-dessus reste, et c est tout ce qu on peut faire.
    }
  }

  return withCors(
    req,
    new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } }),
  );
}
