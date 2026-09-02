/**
 * POST /api/openai/daily-briefing
 *
 * Generates a daily AI briefing by synthesizing all currently-active signals.
 *
 * Flow (primary):
 * 1. Receive POST with { birthData }
 * 2. Call daily-briefing-context.php → get priority-ranked natalized signals
 *    (eclipses on natal axes, outer planet transits, with house context)
 * 3. Take top 3 signals (highest priority, tightest orb) — filter NaN artifacts
 * 4. Single GPT call → synthesize into daily briefing JSON
 *
 * Flow (fallback — if context endpoint fails):
 * 2b. Call toctoc-year.php → get top events by score
 * 3b. Call toctoc-boudin-detail.php for each event → get llmPayload
 * 4b. Same GPT call
 *
 * ─── FORME DE LA REPONSE (contrat avec le client) ────────────────
 *
 * Un echec ne doit JAMAIS ressembler a une reussite. Les deux formes sont
 * disjointes et se distinguent par le seul champ `ok`.
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

import { lignesContexteUtilisateur } from "@/lib/profil-prompt";
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

// ─── Config ──────────────────────────────────────────────

const TOCTOC_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";
const OPENAI_MODEL = "gpt-4o-mini";

// La limite vit ici et nulle part ailleurs : elle est injectee dans le prompt
// ET verifiee sur la reponse. Avant, le prompt annoncait 80 mots et personne ne
// comptait — la carte affichee faisait 90 mots et passait sous la barre
// d'onglets. Une seule constante empeche les deux valeurs de diverger.
const LIMITE_MOTS = 80;

const BRIEFING_SYSTEM_PROMPT = `Tu es le moteur de briefing quotidien d'Unfold, une app premium de momentum personnel.

Tu reçois 1 à 3 signaux actifs avec leurs interprétations. Synthétise-les en UN SEUL briefing court et actionnable.

FORMAT JSON strict — les quatre champs sont obligatoires :
{
  "greeting": "1 phrase d'accroche qui nomme un domaine concret touché aujourd'hui",
  "summary": "2-3 phrases sur ce qui bouge dans la vie de la personne : le domaine touché, la nature du mouvement, combien de temps ça dure.",
  "action": "1 phrase concrète. Un conseil actionnable pour aujourd'hui, lié au signal le plus fort.",
  "activeDomains": ["1 à 3 domaines touchés"]
}

HIÉRARCHIE DES SIGNAUX — RAISONNEMENT INTERNE, OBLIGATOIRE :
Cette hiérarchie sert à choisir DE QUOI tu parles. Elle ne doit jamais apparaître telle quelle dans le texte rendu. Classe les signaux avant de rédiger :

NIVEAU 4 — Éclipse touchant un point ou un axe natal → très rare, portée de plusieurs mois. C'est le signal à traiter en priorité, et il mérite d'être présenté comme une période longue et marquante.

NIVEAU 3 — Transit lent (Pluton, Uranus, Neptune, Saturne, Nœuds) en aspect direct à un point natal → portée de semaines à mois. Signal personnel fort, à présenter comme un mouvement de fond.

NIVEAU 2 — Transit rapide (Jupiter, Mars, Vénus, Mercure) en aspect à un point natal → portée de jours. Signal contextuel, à présenter comme une fenêtre courte.

NIVEAU 1 — Position de la Lune transitant dans un signe → NE PAS présenter comme un signal personnel. La Lune passe dans chaque signe en 2,5 jours : ça s'applique à tout le monde ce jour-là. Si la Lune déclenche une éclipse ou touche un point natal précis, monte-la au niveau approprié.

DE LA MÉCANIQUE AU DOMAINE DE VIE — LA RÈGLE CENTRALE :
Le payload te donne des planètes, des aspects, des maisons. C'est ta matière de travail, pas ton vocabulaire. Traduis systématiquement :
- la maison natale → le domaine de vie concret (argent partagé et héritages, travail quotidien et santé, couple, carrière, foyer, apprentissage...)
- l'aspect → la nature du mouvement (ça se tend, ça s'ouvre, ça se décante, ça demande un arbitrage)
- la durée du transit → la période (aujourd'hui, cette semaine, ces prochains mois)
Écris le résultat de cette traduction. N'écris jamais l'opération elle-même.

INTERDIT DANS LE TEXTE RENDU — sans exception :
- aucun numéro de maison : ni "8e maison", ni "maison 6", ni "ta 2e-8e maison"
- aucun nom d'aspect : carré, opposition, conjonction, trigone, sextile, quinconce
- jamais la formule "avec ton X natal", ni "point natal", ni "thème natal"
- aucun nom de signe utilisé comme étiquette ("axe Lion-Verseau")
- le nom d'un astre : UNE SEULE FOIS au maximum dans tout le briefing, et seulement s'il apporte quelque chose. Zéro fois est un bon briefing.

Exemple de ce qu'il ne faut JAMAIS écrire :
"Neptune en carré avec ton Neptune natal dans ta 8e maison intensifie les réflexions sur les ressources partagées."
La même chose, correctement rendue :
"Ce qui touche à l'argent partagé — dettes, héritages, engagements à deux — sort du flou cette semaine."

VOIX UNFOLD — RÈGLES STRICTES :
- Français, ton sobre, direct, premium
- Maximum ${LIMITE_MOTS} mots au total pour greeting + summary + action. Au-delà, la réponse est rejetée et l'utilisateur ne voit rien : compte tes mots.
- Une phrase finie vaut mieux qu'une phrase riche : coupe le contenu, jamais la phrase
- Calibre selon l'intensité réelle : éclipse sur point natal = phénomène rare et impactant ; Lune en transit = discret ou absent

VOCABULAIRE AUTORISÉ : signal, momentum, fenêtre, période, timing, rythme, terrain, domaine, intensité
VOCABULAIRE INTERDIT : énergie, chance, destin, univers, vibration, cosmique, astral, nourrir ton esprit, attirer, aligner, harmoniser, opportunités d'évolution personnelle (trop générique)
NE JAMAIS produire de phrases qui pourraient s'appliquer à n'importe qui. Chaque phrase reste ancrée dans un signal précis du payload — l'ancrage se voit à la précision du domaine de vie nommé, pas à la mention de la mécanique céleste.`;

// ─── Types ───────────────────────────────────────────────

interface BirthDataPayload {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface BriefingContextSignal {
  priority: number;
  type: string;
  orb?: number | null;
  llmPayload: string;
}

interface BriefingContextResponse {
  success: boolean;
  data?: {
    activeEclipses?: BriefingContextSignal[];
    activeTransits?: BriefingContextSignal[];
    signalSummary?: {
      highestPriority: number;
      activeSignalCount: number;
      dominantDomains: string[];
      topSignal: string;
    };
  };
}

interface YearEvent {
  label: string;
  score: number;
  category: string;
  periodStart?: string;
  periodEnd?: string;
  exactDate?: string;
}

interface MonthEntry {
  month: string;
  totalScore: number;
  topEvents: YearEvent[];
  isCurrentMonth?: boolean;
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

interface BriefingValide {
  greeting: string;
  summary: string;
  action: string;
  activeDomains: string[];
}

type Validation =
  | { valide: true; briefing: BriefingValide }
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
// de prompt qui n'est pas verifiee est une regle qui saute — c'est exactement
// ce qui a produit « Neptune en carre avec ton Neptune natal dans ta 8e maison ».
// On ne detecte que des formes qui n'ont aucune raison d'exister dans une
// lecture correcte, pour ne pas rejeter du texte valide.
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
function validerBriefing(brut: unknown): Validation {
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
    briefing: { ...textes, activeDomains: domaines },
  };
}

// ─── Route handler ───────────────────────────────────────

async function handlePost(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return echec("configuration", 500);
  }

  let guard: AiGuardResult | undefined;

  try {
    const body = await request.json();
    const { birthData, locale, userProfile } = body as {
      birthData: BirthDataPayload; locale?: string; userProfile?: Record<string, unknown> | null;
    };

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
    // Same reason as /api/openai/daily-brief: this route spends the OpenAI key
    // and had no caller identification, no quota and no rate limit at all.
    // It runs before the calls to Marie-Ange's API, which are expensive too.
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
        console.error("[DailyBriefing] guard unavailable:", err.reason);
        return NextResponse.json({ ok: false, raison: "garde_indisponible", ...err.toJSON() }, { status: err.status });
      }
      throw err;
    }

    const hour = new Date().getHours();
    const timeContext = hour < 12 ? "matin" : hour < 18 ? "après-midi" : "soir";

    // ── Primary: natalized context endpoint ──────────────
    const signalDetails = await getSignalsFromContextEndpoint(birthData);

    // ── Fallback: toctoc-year + boudin-detail ────────────
    if (signalDetails.length === 0) {
      const fallbackDetails = await getSignalsFromYearEndpoint(birthData);
      if (fallbackDetails.length === 0) {
        console.error("[DailyBriefing] aucun signal exploitable (contexte + annee)");
        return echec("signaux_indisponibles", 502, guard);
      }
      signalDetails.push(...fallbackDetails);
    }

    // ── GPT synthesis ────────────────────────────────────
    const contexteUtilisateur = userProfile ? "\n\n" + lignesContexteUtilisateur(userProfile) : "";
    const userMessage = `Moment de la journée: ${timeContext}

Signaux actifs (${signalDetails.length}):

${signalDetails.map((s, i) => `--- Signal ${i + 1} ---\n${s}`).join("\n\n")}${contexteUtilisateur}`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          // Le prompt systeme est ecrit en francais, donc le modele repondait
          // en francais A TOUT LE MONDE — y compris a qui lit l app en japonais
          // ou en arabe. Et c est ce texte-la qui porte la valeur du produit.
          { role: "system", content: BRIEFING_SYSTEM_PROMPT + instructionLangue(locale) },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}));
      console.error("[DailyBriefing] OpenAI error:", openaiRes.status, err);
      return echec("modele_indisponible", 502, guard);
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[DailyBriefing] reponse OpenAI sans contenu");
      return echec("modele_indisponible", 502, guard);
    }

    // Le JSON du modele peut etre malforme malgre response_format : c'est un
    // echec, pas un cas a rattraper.
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("[DailyBriefing] JSON du modele illisible");
      return echec("reponse_illisible", 502, guard);
    }

    const validation = validerBriefing(parsed);
    if (!validation.valide) {
      console.error(`[DailyBriefing] rejet ${validation.raison}: ${validation.detail}`);
      return echec(validation.raison, 502, guard);
    }

    return applyGuardCookie(
      guard,
      NextResponse.json({ ok: true, ...validation.briefing }),
    );
  } catch (error) {
    console.error("[DailyBriefing] Error:", error);
    return echec("erreur_interne", 500, guard);
  }
}

// ─── Primary: daily-briefing-context.php ─────────────────

async function getSignalsFromContextEndpoint(birthData: BirthDataPayload): Promise<string[]> {
  try {
    const res = await fetch(`${TOCTOC_BASE}/daily-briefing-context.php`, {
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

    if (!res.ok) throw new Error(`Context API returned ${res.status}`);

    const json: BriefingContextResponse = await res.json();
    const ctx = json?.data ?? (json as unknown as BriefingContextResponse["data"]);
    if (!ctx) return [];

    // Merge eclipses + transits, sort by priority DESC then orb ASC
    const all: BriefingContextSignal[] = [
      ...(ctx.activeEclipses ?? []),
      ...(ctx.activeTransits ?? []),
    ];

    const valid = all
      .filter((s) => s.llmPayload && !s.llmPayload.includes("NaN")) // skip MC-null artifacts
      .sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return (a.orb ?? 99) - (b.orb ?? 99); // tightest orb first
      });

    return valid.slice(0, 3).map((s) => s.llmPayload);
  } catch (err) {
    console.error("[DailyBriefing] Context endpoint error:", err);
    return [];
  }
}

// ─── Fallback: toctoc-year.php + toctoc-boudin-detail.php ─

async function getSignalsFromYearEndpoint(birthData: BirthDataPayload): Promise<string[]> {
  const signals: string[] = [];

  try {
    const yearRes = await fetch(`${TOCTOC_BASE}/toctoc-year.php`, {
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

    if (!yearRes.ok) throw new Error(`Year API returned ${yearRes.status}`);

    const yearData = await yearRes.json();
    const data = yearData?.data ?? yearData;
    const months: MonthEntry[] = data?.months ?? [];

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const todayMs = now.getTime();

    const relevantMonths = months.filter((m) => {
      const diff = monthDiff(currentMonthStr, m.month);
      return diff >= -1 && diff <= 1;
    });

    const allEvents: YearEvent[] = relevantMonths.flatMap((m) => m.topEvents ?? []);
    const activeEvents = allEvents.filter((e) => {
      if (e.periodStart && e.periodEnd) {
        return new Date(e.periodStart).getTime() <= todayMs && new Date(e.periodEnd).getTime() >= todayMs;
      }
      return true;
    });

    const topEvents = (activeEvents.length > 0 ? activeEvents : allEvents)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    for (const event of topEvents) {
      try {
        const detailRes = await fetch(`${TOCTOC_BASE}/toctoc-boudin-detail.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            birthDate: birthData.birthDate,
            birthTime: birthData.birthTime,
            latitude: birthData.latitude,
            longitude: birthData.longitude,
            timezone: birthData.timezone,
            boudinLabel: event.label,
          }),
        });

        if (detailRes.ok) {
          const detail = await detailRes.json();
          const llmPayload = detail.llmPayload ?? detail.data?.llmPayload;
          signals.push(
            llmPayload
              ? (typeof llmPayload === "string" ? llmPayload : JSON.stringify(llmPayload))
              : `Signal actif: ${event.label} (intensité ${event.score}/4)`
          );
        } else {
          signals.push(`Signal actif: ${event.label} (intensité ${event.score}/4)`);
        }
      } catch {
        signals.push(`Signal actif: ${event.label} (intensité ${event.score}/4)`);
      }
    }
  } catch (err) {
    console.error("[DailyBriefing] Year API error:", err);
  }

  return signals;
}

// ─── Helpers ─────────────────────────────────────────────

function monthDiff(a: string, b: string): number {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}


export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// Les en-tetes CORS doivent etre sur la reponse REELLE, pas seulement sur le
// preflight : sans eux le navigateur jette le resultat malgre un preflight
// accepte. C est ce qui empechait l app d enregistrer les profils.
export const POST = corsHandler(handlePost);
