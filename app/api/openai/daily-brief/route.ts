/**
 * POST /api/openai/daily-brief
 *
 * Fast-signal daily brief — signals active TODAY only.
 * Calls /endpoints/daily-brief.php which computes:
 *   - Fast transits (Mars, Venus, Mercury, Sun) aspecting natal points
 *   - Moon conjunct natal points
 *   - New/Full Moon in natal houses
 *   - ZR L4 peak periods (Fortune + Spirit)
 *
 * Distinct from /api/openai/daily-briefing which covers slow outer planets (period context).
 *
 * ─── FORME DE LA REPONSE (contrat avec le client) ────────────────
 *
 * Identique a /api/openai/daily-briefing. Un echec ne doit JAMAIS ressembler
 * a une reussite : les deux formes sont disjointes et se distinguent par le
 * seul champ `ok`.
 *
 * SUCCES — HTTP 200
 *   {
 *     ok: true,
 *     greeting: string,        // non vide, garanti present
 *     summary: string,         // non vide, garanti present
 *     action: string,          // non vide, garanti present
 *     activeDomains: string[]  // 1 a 3 entrees non vides
 *   }
 *   Les quatre champs viennent du modele. Aucun n'est comble par un texte
 *   ecrit ici : si le modele en manque un, la reponse bascule en echec.
 *
 * ECHEC — HTTP 400, 429, 500, 502 ou 503
 *   {
 *     ok: false,
 *     raison: string   // code machine stable, voir RAISONS ci-dessous
 *   }
 *   Une reponse d'echec ne contient jamais greeting/summary/action : le
 *   client n'a rien a afficher et ne peut pas se tromper.
 *   Les echecs du garde-fou de budget conservent en plus leurs champs
 *   d'origine (error, scope, retryAfter, message) pour l'i18n existante.
 *
 * RAISONS possibles :
 *   birthdata_manquant     400  entree client incomplete
 *   fuseau_manquant        400  fuseau de naissance absent : sans lui le
 *                               theme serait calcule pour Bruxelles
 *   budget_depasse         429  quota AI atteint
 *   configuration          500  cle OpenAI absente
 *   erreur_interne         500  exception inattendue
 *   signaux_indisponibles  502  l'API d'astrologie n'a rendu aucun signal
 *   modele_indisponible    502  OpenAI a repondu en erreur ou a vide
 *   reponse_illisible      502  le JSON du modele n'est pas parsable
 *   reponse_invalide       502  champ absent, vide ou du mauvais type
 *   reponse_trop_longue    502  au-dela de LIMITE_MOTS mots
 *   jargon_technique       502  mecanique celeste laissee dans le texte
 *   garde_indisponible     503  le garde-fou ne peut pas se prononcer
 */

import { NextRequest, NextResponse } from "next/server";
import {
  enforceAiBudget,
  applyGuardCookie,
  budgetErrorHeaders,
  AiBudgetError,
  AiGuardUnavailableError,
  type AiGuardResult,
} from "@/lib/ai-guard";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";
import { instructionLangue } from "@/lib/instruction-langue";

export const runtime = "nodejs";                  // crypto + Supabase admin client

const TOCTOC_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";
const OPENAI_MODEL = "gpt-4o-mini";

// La limite vit ici et nulle part ailleurs : elle est injectee dans le prompt
// ET verifiee sur la reponse. Un prompt qui annonce une limite que personne ne
// controle produit des cartes qui debordent de l'ecran.
const LIMITE_MOTS = 60;

const DAILY_BRIEF_SYSTEM_PROMPT = `Tu es le moteur de briefing quotidien d'Unfold pour les signaux RAPIDES.

Tu reçois les signaux personnalisés actifs AUJOURD'HUI : transits de planètes rapides vers des points nataux, nouvelles/pleines lunes dans les maisons natales, pics ZR niveau 4.

FORMAT JSON strict — les quatre champs sont obligatoires :
{
  "greeting": "1 phrase d'accroche ancrée dans un domaine concret touché aujourd'hui",
  "summary": "2-3 phrases max. Le domaine de vie touché et ce qui y bouge maintenant. Reste dans les 24-48 prochaines heures.",
  "action": "1 directive concrète et immédiate liée au signal le plus fort.",
  "activeDomains": ["1 à 3 domaines"]
}

DE LA MÉCANIQUE AU DOMAINE DE VIE — LA RÈGLE CENTRALE :
Le payload te donne des planètes, des aspects, des maisons. C'est ta matière de travail, pas ton vocabulaire. Traduis systématiquement :
- la maison natale → le domaine de vie concret (travail quotidien et santé, argent partagé, couple, carrière, foyer, déplacements...)
- l'aspect → la nature du mouvement (ça se tend, ça s'ouvre, ça se décante, ça demande un arbitrage)
- la vitesse du signal → la fenêtre de temps (aujourd'hui, ces deux jours)
Écris le résultat de cette traduction. N'écris jamais l'opération elle-même.

INTERDIT DANS LE TEXTE RENDU — sans exception :
- aucun numéro de maison : ni "6e maison", ni "maison 6"
- aucun nom d'aspect : carré, opposition, conjonction, trigone, sextile, quinconce
- jamais la formule "avec ton X natal", ni "point natal", ni "thème natal"
- le nom d'un astre : UNE SEULE FOIS au maximum dans tout le briefing. "Nouvelle Lune" ou "Pleine Lune" consomme cette unique mention, et se dit sans jamais nommer la maison qu'elle touche — seulement le domaine de vie.

RÈGLES STRICTES :
- Maximum ${LIMITE_MOTS} mots au total pour greeting + summary + action. Au-delà, la réponse est rejetée et l'utilisateur ne voit rien : compte tes mots.
- Une phrase finie vaut mieux qu'une phrase riche : coupe le contenu, jamais la phrase
- Signaux RAPIDES seulement : ce que le payload contient, rien d'autre
- NE PAS inventer des signaux qui ne sont pas dans les données reçues, et ne jamais affirmer qu'une journée est calme ou active si le payload ne le dit pas
- Tutoie l'utilisateur (tu/ton/ta/tes)
- Ton sobre, direct, actionnable

VOCABULAIRE AUTORISÉ : signal, fenêtre, timing, rythme, terrain, domaine
VOCABULAIRE INTERDIT : énergie, chance, destin, univers, vibration, cosmique, astral, attirer, aligner
NE JAMAIS produire de phrases qui pourraient s'appliquer à n'importe qui. L'ancrage se voit à la précision du domaine de vie nommé, pas à la mention de la mécanique céleste.`;

interface BirthDataPayload {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface DailyBriefSignal {
  priority: number;
  type: string;
  llmPayload: string;
  natalHouse?: number;
  houseMeaning?: string;
  transitPlanet?: string;
  aspect?: string;
  natalPoint?: string;
  orb?: number;
  sign?: string;
  date?: string;
  daysFromNow?: number;
  lotType?: string;
}

interface DailyBriefResponse {
  success: boolean;
  signals: DailyBriefSignal[];
  allSignalCount: number;
  signalSummary: {
    highestPriority: number;
    activeSignalCount: number;
    dominantHouses: number[];
    dominantDomains: string[];
    topSignal: string | null;
  };
  nextLunation?: {
    type: string;
    date: string;
    daysFromNow: number;
    sign: string;
    natalHouse: number;
    houseMeaning: string;
  } | null;
  error?: string;
}

// ─── Reponse d'echec ─────────────────────────────────────

// Un echec se dit comme un echec. Meme forme pour tous les cas, jamais la
// forme d'une reussite : le client teste `ok` et n'affiche rien si c'est faux.
// L'ancien code renvoyait un objet greeting/summary/action en 200 OK, donc
// indiscernable d'une vraie lecture a l'ecran.
function echec(
  raison: string,
  status: number,
  guard?: AiGuardResult,
  extra?: Record<string, unknown>,
) {
  return applyGuardCookie(
    guard,
    NextResponse.json({ ok: false, raison, ...extra }, { status }),
  );
}

// ─── Validation de la reponse du modele ──────────────────

// Duplique volontairement depuis /api/openai/daily-briefing : les deux routes
// ont des limites de mots differentes et aucun module partage n'existe pour ca.
// Toute correction ici doit etre reportee la-bas.

interface BriefValide {
  greeting: string;
  summary: string;
  action: string;
  activeDomains: string[];
}

type Validation =
  | { valide: true; brief: BriefValide }
  | { valide: false; raison: string; detail: string };

// Les tokens de ponctuation seule ne sont pas des mots. Pas de \p{...} ici :
// les proprietes Unicode demandent une cible ES2018 et la cible du projet est
// ES2017 — la classe explicite couvre les lettres accentuees du francais.
/**
 * Compte les mots d un texte, quelle que soit son ecriture.
 *
 * L ancienne version faisait `.split(/\s+/)` puis gardait les tokens contenant
 * `[a-zA-Z0-9À-ɏ]`. Deux trous, et ils se combinaient :
 *
 *  1. Le japonais et le chinois ne separent pas les mots par des espaces. Un
 *     paragraphe entier ressortait comme UN token.
 *  2. La classe `À-ɏ` s arrete au latin etendu : ni les ideogrammes, ni
 *     l arabe, ni le cyrillique ne la satisfont. Le token unique etait donc
 *     ecarte par le filtre, et le compte tombait a ZERO.
 *
 * Resultat : `mots > LIMITE_MOTS` valait `0 > 80`, donc faux. La limite de
 * longueur ne s appliquait pas du tout en ja, zh et ar — les trois langues ou
 * un modele part le plus facilement en longueur.
 *
 * Ici : les ideogrammes se comptent un a un, le reste par tokens, et
 * `\p{L}\p{N}` accepte toutes les ecritures. Un ideogramme portant a peu pres
 * deux fois plus qu un mot latin, on divise leur compte par deux — approximation
 * assumee, mais qui remet la limite en service au lieu de la laisser inerte.
 */
const IDEOGRAMMES = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;

function compterMots(...textes: string[]): number {
  const texte = textes.join(" ");
  const cjk = (texte.match(IDEOGRAMMES) ?? []).length;
  const reste = texte
    .replace(IDEOGRAMMES, " ")
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
  return reste + Math.ceil(cjk / 2);
}

// Le prompt interdit la mecanique celeste dans le texte rendu, mais une regle
// de prompt qui n'est pas verifiee est une regle qui saute. On ne detecte que
// des formes qui n'ont aucune raison d'exister dans une lecture correcte, pour
// ne pas rejeter du texte valide.
const MOTIFS_JARGON: Array<{ nom: string; motif: RegExp }> = [
  { nom: "numero de maison", motif: /\b\d{1,2}\s*(?:e|è|ème|eme|er|re|ère|ere)?\s*[-–]?\s*(?:\d{1,2}\s*(?:e|è|ème|eme)?\s*)?maisons?\b/i },
  { nom: "maison numerotee", motif: /\bmaisons?\s+(?:n°\s*)?\d{1,2}\b/i },
  { nom: "nom d'aspect", motif: /\b(?:carr[ée]e?s?|oppositions?|conjonctions?|trigones?|sextiles?|quinconces?)\b/i },
  { nom: "reference au natal", motif: /\bnatal(?:e|es|aux)?\b/i },
];

function detecterJargon(...textes: string[]): string | null {
  const texte = textes.join(" ");
  for (const { nom, motif } of MOTIFS_JARGON) {
    if (motif.test(texte)) return nom;
  }
  return null;
}

// Aucun repli champ par champ : si le modele n'a pas rendu un champ, la reponse
// n'est pas valide. Combler un trou avec un texte ecrit ici revient a servir du
// contenu d'echec sous les apparences d'une lecture.
function validerBrief(brut: unknown): Validation {
  if (!brut || typeof brut !== "object" || Array.isArray(brut)) {
    return { valide: false, raison: "reponse_invalide", detail: "objet attendu" };
  }

  const objet = brut as Record<string, unknown>;
  const textes: Record<"greeting" | "summary" | "action", string> = {
    greeting: "",
    summary: "",
    action: "",
  };

  for (const champ of ["greeting", "summary", "action"] as const) {
    const valeur = objet[champ];
    if (typeof valeur !== "string" || valeur.trim().length === 0) {
      return { valide: false, raison: "reponse_invalide", detail: `champ ${champ} absent ou vide` };
    }
    textes[champ] = valeur.trim();
  }

  if (!Array.isArray(objet.activeDomains)) {
    return { valide: false, raison: "reponse_invalide", detail: "activeDomains absent" };
  }
  const domaines = objet.activeDomains
    .filter((d): d is string => typeof d === "string" && d.trim().length > 0)
    .map((d) => d.trim())
    .slice(0, 3);
  if (domaines.length === 0) {
    return { valide: false, raison: "reponse_invalide", detail: "activeDomains vide" };
  }

  // On ne tronque pas : une lecture coupee au milieu d'une phrase est pire
  // qu'une lecture absente. Trop long = pas une reponse valide.
  const mots = compterMots(textes.greeting, textes.summary, textes.action);
  if (mots > LIMITE_MOTS) {
    return { valide: false, raison: "reponse_trop_longue", detail: `${mots} mots pour une limite de ${LIMITE_MOTS}` };
  }

  const jargon = detecterJargon(textes.greeting, textes.summary, textes.action);
  if (jargon) {
    return { valide: false, raison: "jargon_technique", detail: jargon };
  }

  return {
    valide: true,
    brief: { ...textes, activeDomains: domaines },
  };
}

async function handlePost(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return echec("configuration", 500);
  }

  let guard: AiGuardResult | undefined;

  try {
    const body = await request.json();
    const { birthData, locale } = body as { birthData: BirthDataPayload; locale?: string };

    if (!birthData?.birthDate || !birthData?.birthTime) {
      return echec("birthdata_manquant", 400);
    }

    // Le fuseau est OBLIGATOIRE, il n a pas de valeur par defaut acceptable.
    //
    // Ce fichier faisait `birthData.timezone ?? "Europe/Brussels"` : sans
    // fuseau, tout le theme etait calcule pour Bruxelles. Les positions
    // planetaires de quelqu un ne a Tokyo devenaient celles de quelqu un ne en
    // Belgique. Ce n est pas une approximation, c est la vie d une autre
    // personne, servie avec la meme assurance. Le meme defaut a ete corrige
    // dans personalize/route.ts le 01/09 ; il survivait ici.
    if (!birthData.timezone) {
      return echec("fuseau_manquant", 400);
    }

    // ── BUDGET GATE ──
    // This route spends the OpenAI key and used to be reachable by anyone with
    // no identification, no quota and no rate limit. The guard runs after input
    // validation and before the first outbound call, so a refused request costs
    // neither an OpenAI token nor a hit on Marie-Ange's API.
    try {
      guard = await enforceAiBudget(request, "openai");
    } catch (err) {
      // On garde les champs d'origine (error, scope, retryAfter) que l'i18n du
      // client utilise deja, et on ajoute `ok: false` pour que le test soit le
      // meme sur toutes les reponses de cette route.
      if (err instanceof AiBudgetError) {
        return NextResponse.json({ ok: false, raison: "budget_depasse", ...err.toJSON() }, {
          status: err.status,
          headers: budgetErrorHeaders(err),
        });
      }
      if (err instanceof AiGuardUnavailableError) {
        console.error("[DailyBrief] guard unavailable:", err.reason);
        return NextResponse.json({ ok: false, raison: "garde_indisponible", ...err.toJSON() }, { status: err.status });
      }
      throw err;
    }

    // ── Call the dedicated daily-brief endpoint ──
    const briefRes = await fetch(`${TOCTOC_BASE}/endpoints/daily-brief.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        latitude: birthData.latitude,
        longitude: birthData.longitude,
        timezone: birthData.timezone,
      }),
    });

    if (!briefRes.ok) {
      console.error("[DailyBrief] daily-brief endpoint error:", briefRes.status);
      return echec("signaux_indisponibles", 502, guard);
    }

    // L ENVELOPPE DU MOTEUR.
    //
    // `endpoints/daily-brief.php` rend `{ success, data: { success, signals, … } }`.
    // Cette ligne lisait `briefData.signals` un niveau TROP HAUT, ou il n y a ni
    // `signals` ni `success` : la condition ci-dessous etait donc toujours
    // vraie, et la route sortait en 502 avant meme d appeler le modele.
    //
    // Consequence : le briefing « Aujourd hui » n a JAMAIS fonctionne. Seul
    // « En ce moment », servi par l autre route, arrivait dans le centre de
    // messages. Le message d erreur — « aucun signal rapide exploitable » —
    // decrivait une journee calme, ce qui rendait le defaut invisible dans les
    // journaux : on croyait lire un jour sans signal.
    //
    // Le meme contournement existe deja explicitement dans
    // lib/momentum-adapter.ts:173 pour les boudins. Le typage de
    // `DailyBriefResponse` decrivait la reponse SANS son enveloppe, et
    // confirmait donc la lecture fausse au lieu de la signaler.
    //
    // Trouve par le test de bout en bout contre le vrai moteur, le 01/09/2026.
    const brut = (await briefRes.json()) as DailyBriefResponse & { data?: DailyBriefResponse };
    const briefData: DailyBriefResponse = brut.data ?? brut;

    if (!briefData.success || !briefData.signals || briefData.signals.length === 0) {
      console.error("[DailyBrief] aucun signal rapide exploitable");
      return echec("signaux_indisponibles", 502, guard);
    }

    // ── Build user message from signal llmPayloads ──
    const today = new Date().toISOString().split("T")[0];
    const signalTexts = briefData.signals
      .map((s, i) => `Signal ${i + 1} (priorité ${s.priority}): ${s.llmPayload}`)
      .join("\n");

    const lunationNote = briefData.nextLunation
      ? `\nProchaine lunation : ${briefData.nextLunation.type === "NEW_MOON" ? "Nouvelle Lune" : "Pleine Lune"} en ${briefData.nextLunation.sign} (maison ${briefData.nextLunation.natalHouse} — ${briefData.nextLunation.houseMeaning}) dans ${briefData.nextLunation.daysFromNow} jour(s).`
      : "";

    // Le moteur CALCULE les domaines dominants et les rend deja en langage
    // courant : signalSummary.dominantDomains vaut par exemple
    // ["finances", "creativite"]. On ne les lisait pas, et on demandait au
    // modele de produire lui-meme `activeDomains` — donc de deviner une reponse
    // qui arrivait dans la meme reponse HTTP.
    //
    // On ne les affiche pas tels quels : ils sortent en francais alors que
    // l app repond en dix langues. Ils sont donc donnes au modele comme SOURCE
    // a reformuler, ce qui est exactement le contrat — il traduit ce qui a ete
    // calcule, il n invente pas ce qui ne l a pas ete.
    const domainesCalcules = briefData.signalSummary?.dominantDomains;
    const noteDomaines =
      Array.isArray(domainesCalcules) && domainesCalcules.length > 0
        ? `\nDomaines calcules par le moteur (a reprendre pour activeDomains, traduits dans la langue de reponse, sans en ajouter) : ${domainesCalcules.join(", ")}.`
        : "";

    const userMessage = `Signaux rapides actifs aujourd'hui (${today}) :

${signalTexts}${lunationNote}${noteDomaines}`;

    // ── OpenAI call ──
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: DAILY_BRIEF_SYSTEM_PROMPT + instructionLangue(locale) },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 250,
      }),
    });

    if (!openaiRes.ok) {
      console.error("[DailyBrief] OpenAI error:", openaiRes.status);
      return echec("modele_indisponible", 502, guard);
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("[DailyBrief] reponse OpenAI sans contenu");
      return echec("modele_indisponible", 502, guard);
    }

    // Le JSON du modele peut etre malforme malgre response_format : c'est un
    // echec, pas un cas a rattraper.
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("[DailyBrief] JSON du modele illisible");
      return echec("reponse_illisible", 502, guard);
    }

    const validation = validerBrief(parsed);
    if (!validation.valide) {
      console.error(`[DailyBrief] rejet ${validation.raison}: ${validation.detail}`);
      return echec(validation.raison, 502, guard);
    }

    return applyGuardCookie(
      guard,
      NextResponse.json({ ok: true, ...validation.brief }),
    );
  } catch (error) {
    console.error("[DailyBrief] Error:", error);
    return echec("erreur_interne", 500, guard);
  }
}


export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// Les en-tetes CORS doivent etre sur la reponse REELLE, pas seulement sur le
// preflight : sans eux le navigateur jette le resultat malgre un preflight
// accepte. C est ce qui empechait l app d enregistrer les profils.
export const POST = corsHandler(handlePost);
