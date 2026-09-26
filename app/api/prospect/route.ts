/**
 * La liste d attente de Favorable — la seule porte de sortie de la page.
 *
 * POURQUOI CETTE ROUTE EXISTE
 *
 * Constat du 26/09/2026, verifie dans le DOM de favorable.day/fr : un visiteur
 * arrive, remplit sa date de naissance, voit son signal — et n a plus rien a
 * faire. Zero champ e-mail sur la page entiere, zero mot « liste d attente »,
 * et les deux badges de magasin sont masques (`APP_PUBLIEE = false`, a juste
 * titre : l app n est publiee nulle part). Tout visiteur interesse repart sans
 * laisser de trace. C est la fuite commerciale nommee dans
 * `_PROD/crm-central/` : « un cul-de-sac », et la raison du compteur a zero.
 *
 * POURQUOI COTE SERVEUR ET PAS EN DIRECT DEPUIS LE NAVIGATEUR
 *
 * La porte du CRM exige une signature HMAC-SHA256 avec un secret partage
 * (`LEADS_INGEST_SECRET`). Ce secret ne descend jamais dans un navigateur.
 * Cette route est donc le seul endroit du parc favorable qui le connait.
 *
 * LE CONTRAT DE LA PORTE — lu dans le fichier reel, pas deduit
 *
 * `api/leads/ingest.js` du depot `christophevanengelen-folio` (copie lue dans
 * `_PROD/crm-central/ingest.js` le 26/09/2026) :
 *   - POST seulement, sinon 405.
 *   - En-tetes `x-horodatage` (Date.now() en millisecondes) et `x-signature`
 *     (HMAC-SHA256 hexadecimal de `horodatage + '.' + corps`).
 *   - Fenetre de cinq minutes, comparaison a temps constant.
 *   - `initiative` obligatoire, sinon 400.
 *   - Idempotence par empreinte sha256 de `initiative|email|horodatage_source`.
 *
 * Le corps signe doit etre OCTET POUR OCTET celui qui part : la porte
 * re-serialise ce qu elle recoit. On signe donc une chaine, et on envoie
 * cette chaine-la, jamais un objet re-serialise en route.
 *
 * CE QUE CETTE ROUTE NE FAIT PAS
 *
 * Elle n ecrit dans aucune base locale, n envoie aucun courriel, ne pose aucun
 * temoin. Une adresse, une initiative, une porte. Le CRM central est la seule
 * memoire — c est la decision « une seule porte, un seul secret ».
 */

import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
// La signature a cinq minutes de validite : rien ici ne peut etre mis en cache.
export const dynamic = "force-dynamic";

/** La porte unique du CRM central. Surchargeable pour un essai, jamais en prod. */
const PORTE =
  process.env.CRM_PORTE ?? "https://christophevanengelen.com/api/leads/ingest";

/** Le nom de l initiative tel qu il existe deja dans la base du CRM. */
const INITIATIVE = "unfold";

/** Au-dela, la porte tronque de toute facon a 4000. On refuse avant d envoyer. */
const EMAIL_MAX = 254;

/**
 * Un robot remplit tous les champs, y compris ceux qu il ne voit pas, et il
 * les remplit vite. Les deux pieges de `contact.php` (hi-def), repris ici pour
 * que le parc se defende partout de la meme facon.
 */
const DELAI_HUMAIN_MS = 3000;

/** Volontairement simple : la porte n est pas un validateur d adresses. */
function adressePlausible(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const s = v.trim();
  return s.length >= 6 && s.length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

function texteCourt(v: unknown, max = 200): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

export async function POST(requete: Request) {
  const secret = process.env.LEADS_INGEST_SECRET;

  let recu: Record<string, unknown>;
  try {
    recu = (await requete.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, raison: "corps_illisible" }, { status: 400 });
  }

  // ---- Les deux pieges, avant tout le reste ------------------------------
  // Le pot de miel : un champ que le CSS cache et qu aucune personne ne voit.
  // On rend 200 : un robot qui recoit une erreur reessaie, un robot qui croit
  // avoir reussi passe au site suivant.
  if (texteCourt(recu.site)) {
    return NextResponse.json({ ok: true, enregistre: false });
  }
  // Le piege de vitesse : la page pose l heure d affichage, on mesure.
  const ouvertureLe = Number(recu.ouverture_le);
  if (Number.isFinite(ouvertureLe) && Date.now() - ouvertureLe < DELAI_HUMAIN_MS) {
    return NextResponse.json({ ok: true, enregistre: false });
  }

  // ---- L adresse ---------------------------------------------------------
  if (!adressePlausible(recu.email)) {
    return NextResponse.json({ ok: false, raison: "adresse_invalide" }, { status: 400 });
  }
  const email = recu.email.trim().toLowerCase();

  // ---- La configuration --------------------------------------------------
  // Un refus explicite, jamais un faux succes : quelqu un a laisse son adresse
  // en croyant etre inscrit, et il ne doit jamais l avoir cru pour rien.
  if (!secret) {
    console.error("[prospect] LEADS_INGEST_SECRET absent — l adresse n est pas partie");
    return NextResponse.json(
      { ok: false, raison: "configuration_incomplete" },
      { status: 503 },
    );
  }

  // ---- La charge, puis sa signature --------------------------------------
  // L empreinte du CRM vaut sha256(initiative | email | horodatage_source).
  // En datant a la JOURNEE, la meme personne qui s inscrit deux fois dans la
  // meme journee ne fait qu une ligne. A la milliseconde, elle en ferait deux.
  const horodatageSource = new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";

  const charge = {
    initiative: INITIATIVE,
    source: "liste-attente",
    page: texteCourt(recu.page) ?? "favorable.day",
    langue: texteCourt(recu.langue, 8),
    email,
    message: "Veut etre prevenu de la sortie de l app.",
    horodatage_source: horodatageSource,
  };

  const horodatage = String(Date.now());
  const corps = JSON.stringify(charge);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(horodatage + "." + corps)
    .digest("hex");

  // ---- L envoi -----------------------------------------------------------
  try {
    const reponse = await fetch(PORTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-horodatage": horodatage,
        "x-signature": signature,
      },
      // `corps`, pas `JSON.stringify(charge)` une seconde fois : c est la
      // chaine signee qui doit partir, a l octet pres.
      body: corps,
      cache: "no-store",
    });

    if (!reponse.ok) {
      // On journalise le code et le motif que la porte donne — elle refuse
      // toujours en le disant — sans jamais rien reveler de la signature.
      let motif = "";
      try {
        motif = String(((await reponse.json()) as { erreur?: string }).erreur ?? "");
      } catch {
        /* la porte n a pas rendu de JSON : le code suffit */
      }
      console.error("[prospect] la porte refuse", reponse.status, motif);
      return NextResponse.json({ ok: false, raison: "porte_refuse" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, enregistre: true });
  } catch (err) {
    console.error("[prospect] la porte est injoignable", err);
    return NextResponse.json({ ok: false, raison: "porte_injoignable" }, { status: 502 });
  }
}

/** Meme reponse que la porte du CRM a un GET : refuser en le disant. */
export function GET() {
  return NextResponse.json(
    { ok: false, raison: "methode_non_autorisee" },
    { status: 405 },
  );
}
