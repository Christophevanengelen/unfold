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
 * Un seul mot de passe, sur la page (`/interne/*`, Basic Auth via le
 * middleware — meme garde que `/admin`). Cette route elle-meme n'en
 * redemande pas un second : essaye le 18/09/2026 (Basic Auth revalidee ici
 * aussi), Christophe a tranche — « pas de protection, on n'est pas une
 * banque ». Le seul filtre reste le mot de passe de la page.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";

const CADRAGE_SYSTEME = `Tu es le garde-fou produit entre Marie-Ange et l'equipe de Favorable (Christophe).

Marie-Ange est data scientist et creative : elle maitrise le moteur de matching, pas le mindset business ni le mindset utilisateur. Sans cadre, elle melange les cinq sections du MVP entre elles.

SON SEUL TERRAIN : la connexion technique entre Supabase, notre JavaScript/framework, et son API a elle. Rien d'autre. Si elle parle branding, design, interaction design, UX, UI ou service design, tu l'arretes tout de suite : "ca, c'est le terrain de Christophe, pas le tien — reviens a l'API." Elle n'a aucune autorite ni contribution attendue sur ces sujets-la.

TU NE PRENDS JAMAIS UN MESSAGE D'ELLE COMME UN BESOIN FINAL. A chaque tour :
1. Elle a deja choisi sa section a l'ecran avant d'ecrire (voir plus bas) : ne la lui redemande pas, mais reste vigilant si son message s'en ecarte quand meme — rappelle-lui alors la bonne section et sa proposition de valeur avant de continuer.
2. Compare son cadrage a celui ci-dessous. Si elle devie, corrige-la explicitement, dans ses mots, jamais en jargon technique.
3. TU NE LA LACHES PAS TANT QUE SA DEMANDE N'EST PAS ENTIEREMENT PRECISE, SURTOUT SUR LA CONNEXION SUPABASE / FRAMEWORK / SON API. Une demande vague (« ca marche pas », « il faudrait ameliorer X ») n'est jamais une reponse finale : pose une question de suivi, puis une autre si besoin, jusqu'a avoir tout ce qu'il faut pour agir — quelle cle d'API exactement, quel endpoint, quelle forme de reponse exacte (champ par champ si pertinent), quel comportement observe vs attendu. Une seule question a la fois, jamais une liste de dix questions d'un coup.
4. Si elle reste vague ou desorganisee apres une ou deux relances, invite-la explicitement a reformuler sa demande avec sa propre IA avant de te la redonner : elle ne sait pas toujours communiquer un besoin technique de facon precise et professionnelle, et une IA peut l'aider a le structurer avant de te l'envoyer.
5. Tu l'empeches de diverger : si elle part sur un autre sujet avant d'avoir termine le premier, ramene-la ("on finit d'abord [sujet en cours], ensuite [nouveau sujet] si tu veux").
6. TU NE VALIDES JAMAIS une idee, une proposition ou une decision d'implementation de sa part, ni en ton nom ni au nom de Christophe : tu recueilles et tu recadres, tu ne decides pas, et un "d'accord" ou "ca me semble bon" ne sort jamais de ta bouche en cours de route.
7. UNE FOIS SEULEMENT que tu as reellement tout ce qu'il te faut de precis sur la connexion Supabase/framework/API, tu peux cloturer avec une phrase du genre : "OK, j'ai tout ce qu'il me faut. Merci de ta participation a ce beau projet." Jamais avant.
8. Reponses courtes, directes, en francais.

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

Un retour qui propose d'enrichir Match ou Profil au detriment du trio coeur, ou qui traite les cinq sections comme interchangeables, se recadre sur cette hierarchie avant toute reponse technique.

A CHAQUE TOUR, tu rends aussi un score "completude" de 0 a 100 : ta propre estimation de la precision technique reunie jusqu'ici sur SA demande (cle d'API exacte, endpoint, forme de reponse, comportement observe vs attendu). Sois severe : un premier message, meme clair, ne vaut jamais plus de 20-30. Chaque reponse precise qu'elle donne le fait monter. Il ne touche 100 que quand tu as reellement tout ce qu'il faut pour agir sans deviner. Christophe a pose cette regle le 18/09/2026 : tant que ce n'est pas 100, le brief n'est pas pris, et une jauge a l'ecran le montre — ton score doit donc etre honnete, jamais gonfle pour la forme.

Reponds UNIQUEMENT en JSON valide, de cette forme exacte : {"reponse": "ta reponse en francais", "completude": 0}`;

/**
 * Les 5 sections et leur proposition de valeur — memes textes que sur
 * /interne/marie-ange (page.tsx, choix a l ouverture) et que
 * CADRAGE-MARIE-ANGE.md. Garder les trois synchronises.
 */
const SECTIONS: Record<string, string> = {
  timeline: "Deep digging — l'exploration en detail de tout ce qui se passe dans une vie, categorie par categorie. Pas un resume.",
  ma_vie: "L'inverse de Timeline — une vue d'ensemble rapide, lisible en quelques secondes, d'une identite astrologique entiere.",
  match: "Pas une fonction de rencontre : un levier de croissance interne. Elle transforme quelqu'un qui a deja telecharge l'app en quelqu'un qui en fait telecharger d'autres. Se juge sur les invitations generees, pas sur la richesse du contenu.",
  vela: "Le substitut a une consultation d'astrologue payante (~80 euros). Se juge sur la vitesse et la justesse d'une conversation, pas sur un rapport a lire.",
  profil: "Des reglages, dont un seul compte vraiment cote business : les notifications push (le levier de retention).",
};

interface HistoriqueMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, raison: "configuration" }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as
    | { message?: string; historique?: HistoriqueMessage[]; section?: string }
    | null;
  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json({ ok: false, raison: "message_vide" }, { status: 400 });
  }
  // Les 20 derniers tours suffisent au cadrage ; au-dela, ca gonfle le cout
  // sans ajouter de contexte utile a une conversation de recadrage.
  const historique = Array.isArray(body?.historique) ? body!.historique!.slice(-20) : [];

  // La section est choisie a l ecran AVANT que Marie-Ange puisse ecrire quoi
  // que ce soit (voir page.tsx) : on ne demande plus au modele de la
  // deviner, on la lui donne, avec sa vraie proposition de valeur — posee
  // par Christophe le 18/09/2026 pour qu elle ne se trompe jamais de section.
  const section = typeof body?.section === "string" ? body.section : null;
  const propositionValeur = section ? SECTIONS[section] : null;
  const contexteSection = propositionValeur
    ? `\n\nMarie-Ange a choisi de parler de la section "${section}" avant d'ecrire son message. Sa proposition de valeur, a rappeler si elle s'en ecarte : ${propositionValeur}`
    : "";

  const admin = getAdminClient();
  try {
    await admin.from("liaison_marie_ange").insert({ role: "user", content: message });
  } catch {
    /* le journal est un confort, jamais un blocage de la conversation */
  }

  let reponse: string;
  let completude: number;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: CADRAGE_SYSTEME + contexteSection },
          ...historique,
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 500,
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, raison: "modele_indisponible" }, { status: 502 });
    }
    const data = await res.json();
    const brut = data?.choices?.[0]?.message?.content;
    if (!brut) {
      return NextResponse.json({ ok: false, raison: "reponse_illisible" }, { status: 502 });
    }
    // Le modele est prie de rendre { reponse, completude }, mais un JSON qui
    // parse sans avoir ces deux champs ne doit pas planter la conversation :
    // on retombe sur le texte brut et une jauge a zero plutot que d echouer.
    let parsed: unknown;
    try {
      parsed = JSON.parse(brut);
    } catch {
      parsed = null;
    }
    if (parsed && typeof parsed === "object" && "reponse" in parsed) {
      const p = parsed as { reponse?: unknown; completude?: unknown };
      reponse = typeof p.reponse === "string" ? p.reponse : brut;
      completude = typeof p.completude === "number" && Number.isFinite(p.completude)
        ? Math.max(0, Math.min(100, Math.round(p.completude)))
        : 0;
    } else {
      reponse = brut;
      completude = 0;
    }
  } catch {
    return NextResponse.json({ ok: false, raison: "erreur_reseau" }, { status: 502 });
  }

  try {
    await admin.from("liaison_marie_ange").insert({ role: "assistant", content: reponse });
  } catch {
    /* idem : le journal ne doit jamais faire echouer la reponse */
  }

  return NextResponse.json({ ok: true, reponse, completude });
}
