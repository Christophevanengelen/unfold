/**
 * POST /api/liaison/message
 *
 * Le canal de cadrage avec Marie-Ange (data scientist, moteur de matching),
 * demande par Christophe le 18/09/2026 pour remplacer WhatsApp : elle ne sait
 * plus dire quelle cle d'API elle vise, elle melange les cinq sections du
 * MVP, et un echange en direct sur WhatsApp ne laisse aucune trace lisible
 * plus tard.
 *
 * CE QUE CE ROUTE FAIT, ET NE FAIT PAS
 *
 * Un seul appel modele par tour, un prompt systeme qui EMPECHE le modele de
 * traiter un message d'elle comme un besoin final : il doit d'abord nommer la
 * section du MVP concernee, la corriger si elle deborde du cadrage produit,
 * et ne jamais valider une decision d'implementation en son nom. Voir
 * CADRAGE-MARIE-ANGE.md a la racine — c'est la source du prompt ci-dessous,
 * garde-la synchronisee si le cadrage produit change.
 *
 * Chaque tour (son message, puis la reponse) est journalise dans la table
 * `liaison_marie_ange` : Christophe et moi devons pouvoir relire l'echange
 * sans dependre de son telephone.
 *
 * AUTHENTIFICATION
 *
 * /interne/* est protege par le middleware (Basic Auth, meme garde que
 * /admin), mais le middleware ne couvre PAS /api (voir middleware.ts,
 * matcher). Cette route revalide donc le meme mot de passe elle-meme.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";

const CADRAGE_SYSTEME = `Tu es le garde-fou produit entre Marie-Ange et l'equipe de Favorable (Christophe).

Marie-Ange est data scientist et creative : elle maitrise le moteur de matching, pas le mindset business ni le mindset utilisateur. Sans cadre, elle melange les cinq sections du MVP entre elles.

TU NE PRENDS JAMAIS UN MESSAGE D'ELLE COMME UN BESOIN FINAL. A chaque tour :
1. Identifie de quelle section elle parle vraiment (Timeline, Ma vie, Match, Vela, ou Profil). Si c'est ambigu ou qu'elle en melange plusieurs, arrete-toi et demande-lui laquelle avant d'aller plus loin.
2. Compare son cadrage a celui ci-dessous. Si elle devie, corrige-la explicitement, dans ses mots, jamais en jargon technique.
3. Si elle est vague sur un detail technique (quelle cle d'API, quel endpoint, quelle forme de reponse exactement), demande-lui de preciser au lieu de deviner a sa place.
4. Tu ne valides et ne promets jamais une decision d'implementation en son nom ou au nom de Christophe : tu recueilles et tu recadres, tu ne decides pas.
5. Reponses courtes, directes, en francais.

LES CINQ SECTIONS, LEUR FONCTION REELLE :
- Timeline : deep digging. L'exploration en detail de tout ce qui se passe dans une vie, categorie par categorie. Pas un resume.
- Ma vie : l'inverse de Timeline. Une vue d'ensemble rapide, lisible en quelques secondes, d'une identite astrologique entiere. Si Marie-Ange traite Ma vie comme un lieu de detail ou Timeline comme une synthese, corrige immediatement : ce sont deux postures opposees.
- Match : PAS une fonction de rencontre ou d'attraction. Un levier de croissance interne : elle transforme quelqu'un qui a deja telecharge l'app en quelqu'un qui invite d'autres personnes. Sa mesure de succes, ce sont des telechargements generes par invitation — pas la qualite d'une lecture de compatibilite en soi.
- Vela : le substitut a une consultation d'astrologue payante (~80 euros). La promesse : remplacer cette depense par une conversation instantanee. Se juge sur la vitesse et la justesse d'une vraie conversation, pas sur la richesse d'un rapport a lire.
- Profil : des reglages, dont un compte plus que les autres : les notifications push (le levier de retention du MVP). Le reste (naissance, apparence, langue, abonnement) est utilitaire.

LA HIERARCHIE DU MVP :
- Le but : le nombre de telechargements, et la pertinence percue du trio coeur — Timeline, Ma vie, Vela.
- Match est un levier de croissance, pas une fonction de contenu a approfondir pour elle-meme.
- Profil / push est un levier de retention, pas une fonction de contenu.

Un retour qui propose d'enrichir Match ou Profil au detriment du trio coeur, ou qui traite les cinq sections comme interchangeables, se recadre sur cette hierarchie avant toute reponse technique.`;

interface HistoriqueMessage {
  role: "user" | "assistant";
  content: string;
}

function motDePasseValide(request: NextRequest): boolean {
  const attendu = process.env.LIAISON_PASSWORD;
  if (!attendu) return false;
  const header = request.headers.get("authorization");
  if (!header) return false;
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return false;
  try {
    const decoded = atob(encoded);
    const [, pwd] = decoded.split(":");
    return pwd === attendu;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!motDePasseValide(request)) {
    return NextResponse.json({ ok: false, raison: "acces_refuse" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, raison: "configuration" }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as
    | { message?: string; historique?: HistoriqueMessage[] }
    | null;
  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json({ ok: false, raison: "message_vide" }, { status: 400 });
  }
  // Les 20 derniers tours suffisent au cadrage ; au-dela, ca gonfle le cout
  // sans ajouter de contexte utile a une conversation de recadrage.
  const historique = Array.isArray(body?.historique) ? body!.historique!.slice(-20) : [];

  const admin = getAdminClient();
  try {
    await admin.from("liaison_marie_ange").insert({ role: "user", content: message });
  } catch {
    /* le journal est un confort, jamais un blocage de la conversation */
  }

  let reponse: string;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: CADRAGE_SYSTEME },
          ...historique,
          { role: "user", content: message },
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, raison: "modele_indisponible" }, { status: 502 });
    }
    const data = await res.json();
    reponse = data?.choices?.[0]?.message?.content;
    if (!reponse) {
      return NextResponse.json({ ok: false, raison: "reponse_illisible" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ ok: false, raison: "erreur_reseau" }, { status: 502 });
  }

  try {
    await admin.from("liaison_marie_ange").insert({ role: "assistant", content: reponse });
  } catch {
    /* idem : le journal ne doit jamais faire echouer la reponse */
  }

  return NextResponse.json({ ok: true, reponse });
}
