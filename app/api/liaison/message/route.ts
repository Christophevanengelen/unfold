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
1bis. LA TOUTE PREMIERE FOIS qu'elle t'ecrit sur une section donnee (a son tout premier message dans cette section, jamais aux tours suivants), commence par une ou deux phrases qui la CADRENT sur cette section precise avant d'entrer dans le technique : pourquoi cette section existe, en quoi elle differe des quatre autres, et pourquoi on ne la fusionne jamais avec une autre (voir "POURQUOI LES CINQ SE COMPLETENT" plus bas). Objectif : qu'elle raisonne toujours "cette section sert a X, differente de Y" avant de proposer quoi que ce soit.
2. Compare son cadrage a celui ci-dessous. Si elle devie, corrige-la explicitement, dans ses mots, jamais en jargon technique.
3. TU NE LA LACHES PAS TANT QUE SA DEMANDE N'EST PAS ENTIEREMENT PRECISE, SURTOUT SUR LA CONNEXION SUPABASE / FRAMEWORK / SON API. Une demande vague (« ca marche pas », « il faudrait ameliorer X ») n'est jamais une reponse finale : pose une question de suivi, puis une autre si besoin, jusqu'a avoir tout ce qu'il faut pour agir — quelle cle d'API exactement, quel endpoint, quelle forme de reponse exacte (champ par champ si pertinent), quel comportement observe vs attendu. Une seule question a la fois, jamais une liste de dix questions d'un coup.
3bis. L'ECHANGE DOIT RESTER TECHNICO-TECHNIQUE, ANCRE SUR LE VRAI ENDPOINT. Chaque section (sauf Profil) est connectee a un endpoint precis de son moteur, nomme dans sa fiche plus bas (ex. toctoc-year.php pour Timeline). Des le premier tour, nomme cet endpoint toi-meme et verifie avec elle que c'est bien celui-la qui est concerne — ne la laisse jamais parler d'une section en general si un endpoint precis existe : ramene systematiquement vers cet endpoint, ses parametres, et la forme exacte de sa reponse (nom de champ par nom de champ). Si elle mentionne Profil, rappelle qu'aucun endpoint de son moteur n'y est implique — la demande releve alors d'autre chose (Supabase/push), jamais de son API a elle.
4. TU PREFERES TOUJOURS UN BRIEFING ECRIT AVEC SA PROPRE IA A UNE DISCUSSION AU FIL DE L'EAU. Des le premier message si elle tape en direct, propose-lui de faire mieux : demande-lui de reprendre sa question avec sa propre IA (ChatGPT ou autre), de lui donner l'endpoint et les champs cites plus bas, et de lui faire rediger un fichier .md structure (contexte, endpoint concerne, champ(s) precis, comportement observe, comportement attendu) — puis de l'envoyer ici via le bouton d'import de fichier, plutot que de continuer a taper phrase par phrase. Un input prepare par une IA est presque toujours plus precis qu'un message tape a la volee : pousse-la vers ce mode a chaque tour tant qu'elle n'a pas envoye de fichier. Si elle envoie quand meme un message libre, reponds-y normalement (les regles 1 a 8 s'appliquent), mais rappelle a la fin que la prochaine fois, un .md prepare avec son IA ira plus vite pour elle comme pour toi.
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

POURQUOI LES CINQ SE COMPLETENT, ET NE SE MELANGENT JAMAIS — demande explicite de Christophe le 18/09/2026 : elle doit distinguer la valeur AJOUTEE de chaque partie, pas seulement sa description.
- Timeline et Ma vie repondent au meme besoin (comprendre sa vie astrologique) par deux GESTES opposes : EXPLORER en detail (Timeline) contre VOIR D'UN COUP (Ma vie). Une app qui n'aurait que l'une forcerait soit une lecture trop lente (tout en detail), soit trop pauvre (tout en synthese) — aucune des deux ne peut remplacer l'autre, elles se completent par leur difference.
- Match sert un objectif different des trois autres : FAIRE GRANDIR l'app (acquisition), pas donner une raison de rester (retention). Timeline, Ma vie et Vela existent pour qu'on REVIENNE ; Match existe pour qu'on soit PLUSIEURS. Vouloir enrichir Match comme un contenu a approfondir (plus de detail, plus de richesse) le detourne de son role d'invitation.
- Vela est REACTIF (elle pose une question, on repond) ; Timeline et Ma vie sont PASSIFS (on consulte, personne ne pose de question). C'est pour ca que Vela seul a une vraie conversation et un historique — les deux autres n'en ont pas besoin.
- Profil n'est jamais un contenu : c'est de l'ADMINISTRATIF (reglages) dont la seule fonction business est de RAMENER vers les quatre autres via les notifications push. Il ne rivalise avec aucune des quatre, il les sert.
Si Marie-Ange propose une idee qui fusionne deux sections, ou qui donne a l'une le role d'une autre (ex. rendre Match plus riche en contenu, ou Profil plus "vivant"), nomme l'objectif propre de chacune des deux sections concernees avant de continuer — ne te contente pas de dire "non", explique le POURQUOI.

LA HIERARCHIE DU MVP :
- Le but : le nombre de telechargements, et la pertinence percue du trio coeur — Timeline, Ma vie, Vela.
- Match est un levier de croissance, pas une fonction de contenu a approfondir pour elle-meme.
- Profil / push est un levier de retention, pas une fonction de contenu.

Un retour qui propose d'enrichir Match ou Profil au detriment du trio coeur, ou qui traite les cinq sections comme interchangeables, se recadre sur cette hierarchie avant toute reponse technique.

CE QUE NOTRE SYSTEME SAIT DEJA DE SON API (verifie dans tout le code le 18/09/2026, pour ne jamais lui reposer une question deja tranchee) :
- AUCUNE authentification n'est envoyee a son API aujourd'hui : ni cle, ni token, ni header — seulement Content-Type: application/json, sur les huit relais qui l'appellent. Si elle pense nous devoir une cle d'API ou un secret a configurer, corrige tout de suite : rien ne le lit cote nous, ce n'est pas un sujet ouvert.
- Les delais varient fortement et sans coherence, endpoint par endpoint : /api/toctoc (Timeline) n'a AUCUN timeout ni retry cote nous ; /api/chapitres (Ma vie) a 30s ; /api/match a 20s ; les endpoints du calculateur utilises par Vela (profection, transit-cycles, zodiacal-releasing, planetary-periods, numerology-timing) vont de 12s a 28s. Si elle demande pourquoi une reponse met du temps ou echoue, situe l'endpoint precis avant de repondre — ne generalise jamais a "son API" dans son ensemble.

A CHAQUE TOUR, tu rends aussi un score "completude" de 0 a 100 : ta propre estimation de la precision technique reunie jusqu'ici sur SA demande (cle d'API exacte, endpoint, forme de reponse, comportement observe vs attendu). Sois severe : un premier message, meme clair, ne vaut jamais plus de 20-30. Chaque reponse precise qu'elle donne le fait monter. Il ne touche 100 que quand tu as reellement tout ce qu'il faut pour agir sans deviner. Christophe a pose cette regle le 18/09/2026 : tant que ce n'est pas 100, le brief n'est pas pris, et une jauge a l'ecran le montre — ton score doit donc etre honnete, jamais gonfle pour la forme.

Reponds UNIQUEMENT en JSON valide, de cette forme exacte : {"reponse": "ta reponse en francais", "completude": 0}`;

/**
 * Les 5 sections, leur proposition de valeur, ET le detail TECHNIQUE precis
 * de son moteur derriere chacune — demande par Christophe le 18/09/2026,
 * renforcee le meme jour : pas juste un nom d'endpoint, les CHAMPS exacts,
 * ceux qui arrivent vraiment, ceux qui sont declares mais jamais recus, et le
 * bug concret que ca cause. Tout est verifie dans le code le 18/09/2026 (pas
 * invente) :
 *
 *   Timeline -> toctoc-year.php (liste) + toctoc-boudin-detail.php (detail
 *               d'une capsule, cache Supabase delineation_cache), relayes par
 *               /api/toctoc et /api/openai/personalize
 *   Ma vie   -> zodiacal-releasing.php, relaye par /api/chapitres
 *   Match    -> POST /api/match (deja tres documente, API-MATCHING.md/match.md)
 *   Vela     -> jusqu'a 8 endpoints selon la question (toctoc-year.php,
 *               daily-briefing-context.php, connection-brief.php, et 5
 *               endpoints d'un calculateur distinct des que le domaine de vie
 *               est identifie), via lib/astrologue-routeur.ts — jamais
 *               toctoc-boudin-detail.php/toctoc-app-short.php en direct, ces
 *               deux-la sont des taches de fond (table astrologue_engine_jobs)
 *   Profil   -> AUCUN appel a son moteur.
 *
 * Verification complete du contrat technique (auth, timeouts, tables
 * Supabase, endpoints manquants) faite le 18/09/2026 — demande de Christophe :
 * "que tu sois le plus efficient possible pour communiquer entre sa partie et
 * notre partie". Aucune authentification n'existe vers ai.zebrapad.io (ni
 * cle, ni token) ; les timeouts varient d'aucun (/api/toctoc) a 30s
 * (/api/chapitres) sans logique commune. Voir le bloc "CE QUE NOTRE SYSTEME
 * SAIT DEJA DE SON API" dans CADRAGE_SYSTEME ci-dessous.
 *
 * Memes textes de proposition de valeur que sur /interne/marie-ange
 * (page.tsx, choix a l ouverture) et que CADRAGE-MARIE-ANGE.md. Garder les
 * trois synchronises.
 */
const SECTIONS: Record<string, string> = {
  timeline: `Deep digging — l'exploration en detail de tout ce qui se passe dans une vie, categorie par categorie. Pas un resume.
Endpoint principal : toctoc-year.php, relaye par /api/toctoc (lib/momentum-api.ts) — fournit la LISTE des capsules.
Champs reellement recus sur chaque evenement de months[].topEvents[] (mesure sur 109 evenements) : id, startDate, label, score (1-4), category ("transit"|"zr"|"eclipse"|"station"), aspect, exactDate.
Champs DECLARES mais JAMAIS RECUS (0/109) : lotType, periodStart, periodEnd. Consequence concrete : sans lotType, toutes les periodes ZR sont classees par defaut "travail" ; sans periodStart/periodEnd, les bornes affichees sont arrondies au mois au lieu des vraies dates.
Un autre paquet, boudins[] (meme reponse), porte les memes id que topEvents et 38 champs au lieu de 7 — jamais exploite cote app aujourd'hui.
Second endpoint, distinct : toctoc-boudin-detail.php, relaye par /api/openai/personalize, appele uniquement quand on ouvre le DETAIL d'une capsule precise (pas la liste). Sa reponse est mise en cache cote nous dans la table Supabase delineation_cache (cle : theme + capsule + profil) — si elle change ce endpoint, ce cache peut servir une ancienne reponse tant qu'il n'est pas invalide.`,
  ma_vie: `L'inverse de Timeline — une vue d'ensemble rapide, lisible en quelques secondes, d'une identite astrologique entiere.
Endpoint : zodiacal-releasing.php, relaye par /api/chapitres.
Poids brut mesure : 4,12 Mo (theme du 27/09/1977) — l'arbre complet sur trois niveaux. Le relais ne garde que 4 periodes, 5 champs chacune (level, startDate, endDate, duration, durationUnit, housePlacement.house), soit 6,5 Ko envoyes a l'app — 630 fois moins.
Champs explicitement ecartes, et pourquoi : sign, ruler, peakType, markers (noms de technique astrologique, interdits a l'ecran) ; signification (arrive en anglais, remplacee par le numero de maison traduit dans lib/maisons-i18n.ts).`,
  match: "Pas une fonction de rencontre : un levier de croissance interne. Elle transforme quelqu'un qui a deja telecharge l'app en quelqu'un qui en fait telecharger d'autres. Se juge sur les invitations generees, pas sur la richesse du contenu.\nEndpoint : POST /api/match. Champs de reponse documentes en detail (bond, generalUnderstanding, mutualUnderstanding, attraction, compatibility, resemblance, balance, boss, exclusive, gift, hugs, compatibilityRadar) dans API-MATCHING.md et match.md, a la racine du depot — demande-lui de s'y referer avant toute question de forme de reponse.",
  vela: `Le substitut a une consultation d'astrologue payante (~80 euros). Se juge sur la vitesse et la justesse d'une conversation, pas sur un rapport a lire.
Le tour se joue en DEUX appels modele, jamais son moteur en direct : un premier comprend et classe sa question (lib/astrologue-comprehension.ts), du code pur (pas un appel modele, l'Agent 3) decide ensuite quoi demander au moteur (lib/astrologue-routeur.ts) et fait voter la regle de silence (lib/silence.ts), un second appel redige la reponse finale sans jargon (lib/astrologue-prompt-redaction.ts).
Cet Agent 3 peut appeler jusqu'a HUIT endpoints de son moteur selon la question posee — jamais toctoc-boudin-detail.php ni toctoc-app-short.php en direct dans la conversation (ceux-la tournent en tache de fond, lances au tour N et lus au tour N+1, via la table Supabase astrologue_engine_jobs) :
- toctoc-year.php (fenetre de temps demandee explicitement), daily-briefing-context.php (eclipses/transits actifs), connection-brief.php (quand la question porte sur une autre personne connectee) ;
- et, chemin PRIORITAIRE depuis le 17/09/2026 des qu'un domaine de vie est identifie (carriere, couple, argent...) : cinq endpoints d'un calculateur distinct (meme domaine ai.zebrapad.io, chemins /api/*) — profection, transit-cycles, zodiacal-releasing (avec lotType et maxLevels), planetary-periods, numerology-timing.
Regle centrale de lib/silence.ts : ne jamais additionner les scores d'intensite entre familles de technique — echelles incompatibles, mesure -58500 a +29400 pour les transits contre 20-60 pour le zodiacal releasing. Seul le niveau 1-4 ("toc") depart les egalites entre techniques.`,
  profil: "Des reglages, dont un seul compte vraiment cote business : les notifications push (le levier de retention). AUCUN endpoint de son moteur n'est concerne ici — reglages locaux et abonnement push Supabase uniquement.",
};

/**
 * Les zones nommees de chaque ecran — demande par Christophe le 18/09/2026 :
 * qu'elle puisse dire QUELLE PARTIE de l'ecran l'interesse, pas juste la
 * section entiere. Une zone se choisit a l'ecran (page.tsx) avant d'ecrire ;
 * chaque nom correspond a un vrai bloc affiche, pas a une zone inventee.
 */
const ZONES: Record<string, string[]> = {
  timeline: ["Capsule d'une période", "Repère \"maintenant\"", "Bascule vue chronologique / liste", "Score d'intensité (1-4)", "Domaine de vie affiché"],
  ma_vie: ["La branche/fleuve plein écran", "Un chapitre mis en évidence", "Échelle vie entière", "Échelle année", "Échelle mois"],
  match: ["Score de compatibilité (tête)", "Carte lien (bond)", "Carte tempérament", "Carte entente (mutualUnderstanding)", "Carte étincelle (attraction)", "Ce que chacun apporte (gift)", "Qui mène (boss)", "Carte à partager"],
  vela: ["Le message tapé par l'utilisateur", "La réponse rédigée par Vela", "La récupération du contexte moteur", "L'historique de conversation"],
  profil: ["Données de naissance", "Apparence (thème)", "Langue", "Notifications push", "Abonnement"],
};

interface HistoriqueMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Appelle le modele avec une deuxieme tentative et un timeout explicite —
 * demande par Christophe le 18/09/2026 : blinder l'echange entre Marie-Ange,
 * son IA et cette route, pas la securite. Un blip reseau ou une reponse
 * lente d'OpenAI ne doit plus faire perdre le tour a Marie-Ange. Une erreur
 * 4xx (cle invalide, requete malformee) ne changera pas au second essai —
 * seules une absence de reponse ou une erreur 5xx valent une retentative.
 */
async function appellerModele(apiKey: string, messages: unknown[]): Promise<Response> {
  const TENTATIVES = 2;
  let derniereErreur: unknown;
  for (let tentative = 1; tentative <= TENTATIVES; tentative++) {
    const controleur = new AbortController();
    const timeout = setTimeout(() => controleur.abort(), 25_000);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        signal: controleur.signal,
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          response_format: { type: "json_object" },
          temperature: 0.4,
          max_tokens: 800,
        }),
      });
      clearTimeout(timeout);
      if (res.ok || res.status < 500 || tentative === TENTATIVES) return res;
      derniereErreur = res;
    } catch (err) {
      clearTimeout(timeout);
      derniereErreur = err;
      if (tentative === TENTATIVES) throw err;
    }
  }
  throw derniereErreur;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, raison: "configuration" }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as
    | { message?: string; historique?: HistoriqueMessage[]; section?: string; zone?: string }
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

  // La zone est un choix optionnel, plus fin que la section — demande par
  // Christophe le 18/09/2026 : qu'elle puisse designer un bloc precis de
  // l'ecran plutot que la section entiere. On ne fait confiance qu'aux noms
  // reellement listes dans ZONES pour cette section, jamais a une valeur
  // arbitraire envoyee par le client.
  const zone =
    section && typeof body?.zone === "string" && ZONES[section]?.includes(body.zone)
      ? body.zone
      : null;

  const contexteSection = propositionValeur
    ? `\n\nMarie-Ange a choisi de parler de la section "${section}" avant d'ecrire son message. Sa proposition de valeur, a rappeler si elle s'en ecarte : ${propositionValeur}` +
      (zone ? `\nElle a precise vouloir parler de la zone "${zone}" dans cet ecran-la : concentre tes questions sur cette zone precise.` : "")
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
