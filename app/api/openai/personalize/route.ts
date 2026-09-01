/**
 * POST /api/openai/personalize
 *
 * Two-step pipeline:
 * 1. Call Marie Ange's toctoc-boudin-detail.php → get systemPrompt + llmPayload
 * 2. Send to OpenAI with user profile context → get personalized delineation
 *
 * Marie Ange's API provides category-specific prompts (transit/eclipse/station/zr)
 * with all archetypes and keywords inline. We add the user profile layer on top.
 *
 * Bounded by lib/ai-guard.ts (durable per-caller / per-IP / global counters).
 * The previous in-memory limiter is gone: see the note where it used to live.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/billing/auth-helper";
import { enforceQuota, RequiresPlanError, QuotaExceededError } from "@/lib/billing/enforce";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";
import { isInternalCall } from "@/lib/internal-call";
import {
  enforceAiBudget,
  applyGuardCookie,
  budgetErrorHeaders,
  AiBudgetError,
  AiGuardUnavailableError,
  type AiGuardResult,
} from "@/lib/ai-guard";

export const runtime = "nodejs";                  // Stripe + raw fetch require Node, not Edge

export function OPTIONS(req: NextRequest) { return corsPreflightResponse(req); }

// ─── Config ──────────────────────────────────────────────

const TOCTOC_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";
const OPENAI_MODEL = "gpt-4o";

// ─── Output Format Spec ─────────────────────────────────
// Appended to Marie Ange's systemPrompt from the detail endpoint.
// Simple 6-field JSON — less surface area for model to go off-track.

const JSON_OUTPUT_FORMAT = `

## FORMAT DE SORTIE (JSON strict — respecte EXACTEMENT ces 6 clés)
Retourne UNIQUEMENT ce JSON valide, sans texte avant ni après, sans markdown :
{
  "titre": "3 mots max, percutant",
  "sousTitre": "1 phrase courte qui nomme le thème central",
  "corps": "2 à 4 phrases fluides. Nomme les domaines de vie (maisons). Calibre au score. 1 conseil concret.",
  "avecLeRecul": "1 phrase sur la perspective long terme ou la leçon",
  "domainesActives": ["max 3 domaines en français, ex: Identité, Relations, Finances, Foyer, Carrière"],
  "intensite": <reprends le score entier 1-4 de l'événement>
}`;

// Legacy — kept only for reference, no longer used
const TRANSIT_PLANET_PROFILE: Record<string, { verb: string; theme: string; duration: string }> = {
  Saturn:      { verb: "structurer",     theme: "tests, limites, responsabilités, maturité — confrontation avec la réalité", duration: "thème sur des mois ; pic autour de la date exacte" },
  Jupiter:     { verb: "développer",     theme: "ouverture, opportunité, croissance — dire oui avec discernement", duration: "fenêtre courte ; saisir dans la semaine" },
  Uranus:      { verb: "déverrouiller",  theme: "rupture, libération, imprévu — expérimenter, ne pas résister", duration: "sur plusieurs mois ; pics lors des exactitudes" },
  Neptune:     { verb: "dissoudre",      theme: "brouillard, idéaux, dissolution — ralentir, clarifier avant de décider", duration: "longue ; privilégier l'observation" },
  Pluto:       { verb: "transformer",    theme: "mue, vérité, pouvoir, tabous — aller au fond, arrêter de contourner", duration: "très longue ; apprentissage durable" },
  "North Node":{ verb: "attirer",        theme: "accélération, nouvelle direction, croissance — gérer la surcharge", duration: "~2 semaines d'influence" },
  "South Node":{ verb: "simplifier",     theme: "dépouillement, bilan, lâcher-prise — fermer ce qui est terminé", duration: "~2 semaines d'influence" },
};

const ASPECT_PROFILE: Record<string, { tag: string; feel: string }> = {
  conjunction: { tag: "intensifie",  feel: "met le sujet au premier plan — fusion totale, intensité maximale" },
  trine:       { tag: "soutient",    feel: "les choses coulent de source — opportunité à saisir activement" },
  sextile:     { tag: "ouvre",       feel: "porte entrouverte — un petit pas suffit pour activer" },
  square:      { tag: "pousse",      feel: "friction utile qui oblige à ajuster — inconfort nécessaire" },
  opposition:  { tag: "révèle",     feel: "tension entre deux pôles — prise de conscience via l'autre" },
};

const NATAL_POINT_THEMES: Record<string, string> = {
  Sun: "identité, vitalité, direction de vie",
  Moon: "besoins émotionnels, humeur, sécurité intérieure",
  Mercury: "pensée, communication, décisions, contrats",
  Venus: "valeurs, argent, attachement, plaisir",
  Mars: "action, conflit, courage, désir",
  Jupiter: "croissance, confiance, mentor",
  Saturn: "engagement, structure, devoir",
  ASC: "corps, image, cap de vie",
  MC: "carrière, statut, visibilité publique",
};

const HOUSE_DOMAIN: Record<number, string> = {
  1: "identité, corps, manière de se présenter",
  2: "argent gagné, ressources, valeurs personnelles",
  3: "communication, fratrie, déplacements",
  4: "foyer, famille, racines, vie privée",
  5: "créativité, plaisir, enfants, romance",
  6: "santé quotidienne, routines, charge de travail",
  7: "couple, partenariats, contrats, l'autre face à soi",
  8: "crises, argent partagé, héritage, transformation",
  9: "voyages, études, philosophie, quête de sens",
  10: "carrière, réputation, statut public",
  11: "amis, réseaux, projets collectifs, espoirs",
  12: "isolement, secrets, travail invisible, lâcher-prise",
};

const MULTI_HIT_PHASE: Record<string, Record<number, { name: string; angle: string }>> = {
  "Direct-Retrograde-Direct": {
    1: { name: "révélation", angle: "le thème apparaît clairement" },
    2: { name: "révision", angle: "retour en arrière : reconsidérer, corriger" },
    3: { name: "intégration", angle: "stabiliser une nouvelle façon de faire" },
  },
  "Direct-Retrograde-Direct-Retrograde": {
    1: { name: "révélation", angle: "le thème s'impose" },
    2: { name: "révision", angle: "ajuster ce qui ne tient pas" },
    3: { name: "ré-orientation", angle: "changer l'approche, approfondir" },
    4: { name: "résolution", angle: "trancher, conclure, assumer" },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSmartSystemPrompt(llmPayload: Record<string, any>): string {
  const cat = llmPayload.category;
  const lines: string[] = [];

  // ── Core identity ──
  lines.push(`Tu es le moteur de délinéation de l'app Unfold. Tu reçois un objet JSON décrivant un événement astrologique ("signal") et tu génères une interprétation personnalisée, concrète et bienveillante en français.`);
  lines.push("");

  // ── Hard rules ──
  lines.push("## RÈGLES ABSOLUES");
  lines.push("1. Écris en français, tutoie l'utilisateur (tu/ton/ta/tes).");
  lines.push("2. Chaque mot DOIT être complet — JAMAIS de troncature. Relis ta sortie avant de répondre.");
  lines.push("3. Vocabulaire AUTORISÉ : signal, momentum, fenêtre, période, timing, rythme, terrain, domaine, intensité.");
  lines.push("4. Vocabulaire INTERDIT : énergie, chance, destin, univers, vibration, cosmique, astral, nourrir ton esprit, attirer, aligner, harmoniser.");
  lines.push("5. Pas de listes à puces dans la sortie — paragraphe fluide uniquement.");
  lines.push("6. Chaque phrase doit être SPÉCIFIQUE à CE signal. Rien de générique.");
  lines.push("7. Commence le corps par la planète transitante ou le type d'événement. Mentionne TOUJOURS les domaines de vie concrets (maisons).");
  lines.push("8. Espace avant les parenthèses : 'maison 10 (carrière)' pas 'maison 10(carrière)'.");
  lines.push("");

  // ── Category-specific context ──
  if (cat === "transit") {
    const planet = llmPayload.transitPlanet;
    const natal = llmPayload.natalPoint;
    const aspect = llmPayload.aspect;
    const profile = TRANSIT_PLANET_PROFILE[planet];
    const aspectProfile = ASPECT_PROFILE[aspect];
    const natalThemes = NATAL_POINT_THEMES[natal];

    lines.push("## CONTEXTE DE CE SIGNAL — Transit");
    if (profile) {
      lines.push(`**${planet}** : verbe = ${profile.verb}. Thème = ${profile.theme}. Durée = ${profile.duration}.`);
    }
    if (aspectProfile) {
      lines.push(`**Aspect (${aspect})** : ${aspectProfile.tag} — ${aspectProfile.feel}.`);
    }
    if (natalThemes) {
      lines.push(`**Point natal touché (${natal})** : ${natalThemes}.`);
    }

    // Houses / topics
    const topics = llmPayload.topics as { house: number; topic: string }[] | undefined;
    if (topics?.length) {
      lines.push("**Domaines de vie activés :**");
      for (const t of topics) {
        const hDesc = HOUSE_DOMAIN[t.house] ?? "";
        lines.push(`  - Maison ${t.house} (${t.topic}) : ${hDesc}`);
      }
    }

    // Multi-hit cycle
    const cycle = llmPayload.cycle;
    if (cycle?.totalHits > 1) {
      const pattern = cycle.pattern ?? llmPayload.pattern;
      const phaseInfo = pattern ? MULTI_HIT_PHASE[pattern]?.[cycle.hitNumber] : null;
      lines.push(`**Cycle multi-passes** : passage ${cycle.hitNumber} sur ${cycle.totalHits} (pattern: ${pattern ?? "inconnu"}).`);
      if (phaseInfo) {
        lines.push(`  Phase actuelle : « ${phaseInfo.name} » — ${phaseInfo.angle}.`);
      }
      if (cycle.allHits?.length) {
        const dates = cycle.allHits.map((h: { date: string; hitNumber: number }) => `#${h.hitNumber}: ${h.date}`).join(", ");
        lines.push(`  Toutes les passes : ${dates}.`);
      }
      lines.push("→ Mentionne la passe actuelle et son angle. Cite 1 date passée + la prochaine (si future).");
    }
    lines.push("");

    // Hierarchy rule
    lines.push("## HIÉRARCHIE DE RÉDACTION");
    lines.push("1. Nomme la planète transitante + ce qu'elle fait (verbe)");
    lines.push("2. Nomme l'aspect et son effet concret");
    lines.push("3. Nomme le point natal touché + sa maison de résidence");
    lines.push("4. Nomme les maisons régies (domaines secondaires)");
    lines.push("5. Si cycle multi-passes : situe la passe et donne la perspective");
    lines.push("6. Termine par 1 directive concrète (pas de flou)");

  } else if (cat === "eclipse") {
    lines.push("## CONTEXTE DE CE SIGNAL — Éclipse");
    const type = llmPayload.eclipseType;
    lines.push(type === "solar"
      ? "**Éclipse solaire** = nouveau départ, graine plantée, début d'un chapitre. Ce qui commence ici a de l'élan."
      : "**Éclipse lunaire** = libération, lâcher-prise, fin d'un chapitre. Ce qui se termine était prêt à partir.");
    if (llmPayload.eclipseAxis) {
      const [h1, h2] = llmPayload.eclipseAxis.split("-").map(Number);
      lines.push(`**Axe activé** : maisons ${h1} (${HOUSE_DOMAIN[h1] ?? ""}) et ${h2} (${HOUSE_DOMAIN[h2] ?? ""}).`);
    }
    lines.push("→ Les éclipses ne sont pas isolées — elles appartiennent à une série de ~18 mois.");
    lines.push("→ Ne pas prédire un événement unique ; parler de catalyseur et de fenêtre.");

  } else if (cat === "zr") {
    lines.push("## CONTEXTE — Zodiacal Releasing (ZR)");

    // ── Lot identity ──
    const lotDescriptions: Record<string, string> = {
      fortune: "circonstances : corps, moyens de subsistance, ce qui t'arrive de l'extérieur",
      spirit: "vocation : choix délibérés, direction, ce que tu construis activement",
      eros: "désir : attachement profond, ce qui t'aimante",
    };
    const lotType: string = llmPayload.lotType ?? "";
    if (lotType) {
      lines.push(`**Lot** : ${lotType} — ${lotDescriptions[lotType] ?? ""}.`);
    }

    // ── Level ──
    const levelDescriptions: Record<number, string> = {
      1: "L1 — grand chapitre (années)",
      2: "L2 — chapitre actif (mois à quelques années)",
      3: "L3 — fenêtre de détail (semaines à mois)",
    };
    if (llmPayload.level) {
      lines.push(`**Niveau** : ${levelDescriptions[llmPayload.level] ?? `L${llmPayload.level}`}.`);
    }

    // ── Markers ──
    const markers = llmPayload.markers as string[] | undefined;
    if (markers?.includes("LB")) {
      lines.push("**LB (Loosening of the Bond)** = pivot structurant. La séquence saute vers un signe non adjacent — quelque chose initié dans un cycle plus ancien arrive à maturité. Souvent un des moments les plus marquants de la vie.");
    }
    if (markers?.includes("Cu")) {
      lines.push("**Cu (Culmination)** = apogée du cycle. Ce qui a été construit arrive à son point culminant — moment de visibilité ou de récolte.");
    }

    // ── Peak period (CB/Leisa Schaim definition — TAP ep. 192) ──
    const isPeak: boolean = !!(llmPayload.isPeakPeriod || markers?.includes("Peak"));
    if (isPeak) {
      // Angular angle from Fortune that triggers this peak (1, 4, 7, or 10)
      const peakAngle: number = llmPayload.peakAngle ?? llmPayload.fortuneAngle ?? 0;
      const PEAK_ANGLE_FLAVOR: Record<number, string> = {
        1: "1er angle depuis Fortune (même signe) — le thème de vocation est directement au premier plan",
        4: "4e angle depuis Fortune — la vocation passe par le foyer, les racines, la stabilité privée : construire la base qui soutient la direction",
        7: "7e angle depuis Fortune — la vocation s'exprime via les partenariats, contrats, l'autre face à soi",
        10: "10e angle depuis Fortune — la vocation entre dans la sphère publique, réputation, statut",
      };

      lines.push("");
      lines.push("**PÉRIODE DE PIC — règle ABSOLUE :**");
      lines.push("Pic = IMPORTANCE et ACTIVITÉ accrues, pas nécessairement bonnes. NE DIS JAMAIS que c'est une 'bonne période' ou que les choses iront bien.");
      lines.push("La QUALITÉ dépend de l'état du seigneur de la période (voir ci-dessous), pas du pic lui-même.");
      lines.push("Reformule : 'Ce chapitre compte davantage. Ce qui se passe ici laisse une trace durable.'");
      if (peakAngle && PEAK_ANGLE_FLAVOR[peakAngle]) {
        lines.push(`**Angle depuis Fortune** : ${PEAK_ANGLE_FLAVOR[peakAngle]}.`);
        if (lotType === "spirit" && peakAngle === 4) {
          lines.push("→ Pour Spirit au 4e angle : la direction de vie (Spirit) devient loudement active VIA le foyer/fondations (4e angle Fortune). C'est normal que 'carrière et foyer' soient tous les deux au centre — ce sont deux facettes du même pic.");
        }
      }
    }

    // ── Quality (ruler condition) ──
    if (llmPayload.periodRulerNatalCondition || llmPayload.periodRulerSectStatus || llmPayload.periodRulerReceivedHelp !== undefined) {
      lines.push("");
      lines.push("**Qualité (état du seigneur) :**");
      if (llmPayload.periodRulerReceivedHelp && !llmPayload.periodRulerUnderStrain) {
        lines.push("→ Soutenu — appui actif, avancée plus fluide si action consciente.");
      } else if (llmPayload.periodRulerUnderStrain && !llmPayload.periodRulerReceivedHelp) {
        lines.push("→ Sous tension — pression productive, nécessite tri et maturité. Les avancées coûtent un effort réel.");
      } else if (llmPayload.periodRulerReceivedHelp && llmPayload.periodRulerUnderStrain) {
        lines.push("→ Mixte/intense — appui réel mais friction. Clarifier avant d'agir.");
      } else {
        lines.push("→ Neutre — fenêtre récurrente, contexte en évolution.");
      }
    }

    lines.push("");
    lines.push("## HIÉRARCHIE DE RÉDACTION ZR");
    lines.push("1. Nomme le lot et son thème concret (Fortune=circonstances / Spirit=direction / Eros=désir)");
    lines.push("2. Nomme le signe actif et les domaines de vie activés (maisons)");
    lines.push("3. Si PIC : dis que c'est un chapitre d'importance et d'activité accrues — NE DIS PAS 'bonne période'");
    lines.push("4. Qualifie la QUALITÉ séparément via l'état du seigneur (soutenu/tendu/mixte/neutre)");
    lines.push("5. Si LB : pivot structurant, quelque chose arrive à maturité");
    lines.push("6. Si Cu : apogée, récolte ou visibilité");
    lines.push("7. Durée (startDate → endDate) + contexte récurrent si lifetimeNumber/lifetimeTotal disponible");
    lines.push("8. Termine par 1 action concrète calibrée à la qualité et au lot");

  } else if (cat === "station") {
    lines.push("## CONTEXTE DE CE SIGNAL — Station planétaire");
    const stationType = llmPayload.stationType;
    const planet = llmPayload.transitPlanet;
    const stationTemplates: Record<string, Record<string, string>> = {
      Mercury: {
        SR: "Mercure s'immobilise et commence à rétrograder. Relire, réviser, reconsidérer. Ne pas signer ni décider — ce qui semble évident mérite d'être relu.",
        SD: "Mercure reprend sa course. Ce qui était bloqué ou flou se clarifie. Prendre encore quelques jours avant d'agir.",
      },
      Venus: {
        SR: "Vénus descend dans son cycle (mythe d'Inanna). Réviser ce que tu désires vraiment, ce que tu valorises, ce que tu permets. Introspection profonde.",
        SD: "Vénus remonte et reprend sa lumière. La clarté sur ce que tu veux vraiment revient. Ce qui a été clarifié intérieurement peut se manifester.",
      },
      Mars: {
        SR: "Mars s'immobilise. Frustration, impression de tourner en rond. Ne pas forcer — rediriger plutôt que d'insister.",
        SD: "Mars reprend son élan. Ce qui était bloqué peut maintenant avancer. Agir avec intention.",
      },
    };
    if (planet && stationType && stationTemplates[planet]?.[stationType]) {
      lines.push(`**Template ${planet} ${stationType}** : ${stationTemplates[planet][stationType]}`);
    }
    lines.push("→ Ancre dans la maison concernée et les domaines régis.");
  }

  // ── Intensity calibration ──
  lines.push("");
  lines.push("## CALIBRAGE INTENSITÉ");
  const score = llmPayload.score ?? 2;
  const intensityGuide: Record<number, string> = {
    1: "Score 1 = discret. Ton informatif, signal léger mais significatif.",
    2: "Score 2 = notable. Mérite attention, ne pas ignorer.",
    3: "Score 3 = important. Moment fort, marquant dans ta vie.",
    4: "Score 4 = exceptionnel. Rare et transformateur — un des moments les plus puissants.",
  };
  lines.push(intensityGuide[score] ?? intensityGuide[2]!);

  // ── Lifetime context ──
  const rawLtNum = llmPayload.lifetimeNumber;
  const rawLtTot = llmPayload.lifetimeTotal;
  const ltNum = Array.isArray(rawLtNum) ? rawLtNum[0] : rawLtNum;
  const ltTot = Array.isArray(rawLtTot) ? rawLtTot[0] : rawLtTot;
  if (ltNum && ltTot) {
    lines.push("");
    lines.push(`## CONTEXTE VIE ENTIÈRE`);
    lines.push(`C'est la ${ltNum}e occurrence sur ${ltTot} dans la vie de l'utilisateur.`);
    if (ltNum === 1) lines.push("→ Première fois. Territoire entièrement nouveau.");
    else if (ltNum === ltTot) lines.push("→ Dernière fois. Aller au bout de ce que cette période apporte.");
    else lines.push("→ Mentionne ce contexte naturellement dans le texte.");
  }

  // ── Output format ──
  lines.push("");
  lines.push("## FORMAT DE SORTIE (JSON strict)");
  lines.push("Retourne UNIQUEMENT ce JSON, sans texte avant ni après :");
  lines.push("RÈGLES IMPORTANTES : `sousTitre` et `avecLeRecul` doivent être des phrases NON VIDES (pas de chaîne vide, pas de null).");
  lines.push("`sousTitre` = une phrase courte type « Insight clé » (ce qu'il faut comprendre maintenant).");
  lines.push("`avecLeRecul` = une phrase courte type « Avec le recul » (la leçon / l'effet long-terme).");
  lines.push(`{
  "titre": "3 mots maximum, percutant",
  "sousTitre": "1 phrase courte qui nomme le thème central",
  "corps": "3 à 5 phrases fluides. Nomme les domaines de vie. Calibre au score. Donne 1 conseil concret.",
  "avecLeRecul": "1 phrase sur ce que cette période apporte à long terme",
  "domainesActives": ["max 3 domaines en français"],
  "intensite": ${score},
  "hitInfo": "Ex: 'Passage 2 sur 3 — phase de révision' (ou null si single pass)",
  "lifetimeInfo": "Ex: '4e occurrence sur 6 dans ta vie' (ou null si pas dispo)",
  "convergenceNote": "Si d'autres signaux sont actifs en même temps, le mentionner (ou null)"
}`);

  return lines.join("\n");
}

// ─── L2 Cache (Supabase) ─────────────────────────────────
// Same birth data + boudin + profile = same delineation → no re-call to OpenAI

function makeBirthHash(bd: { birthDate: string; birthTime: string; latitude: number; longitude: number }): string {
  return `${bd.birthDate}_${bd.birthTime}_${bd.latitude.toFixed(2)}_${bd.longitude.toFixed(2)}`;
}

function makeProfileHash(profile: Record<string, unknown> | null): string {
  // v3 prefix — bumped to invalidate delineations cached with old 9-field format
  if (!profile) return "v3_none";
  const keys = ["lifePhase", "effectivePriorities", "effectiveStyle", "effectiveStress", "currentGoal", "workStatus", "relationshipStatus"];
  const vals = keys.map(k => profile[k] ?? "").map(v => Array.isArray(v) ? v.join(",") : String(v));
  return "v3_" + (vals.join("|") || "none");
}

async function getCachedDelineation(birthHash: string, boudinId: string, profileHash: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("delineation_cache")
      .select("delineation")
      .eq("birth_hash", birthHash)
      .eq("boudin_id", boudinId)
      .eq("profile_hash", profileHash)
      .single();
    if (error || !data) return null;
    console.log("[CACHE HIT] Serving cached delineation for", boudinId);
    return data.delineation;
  } catch { return null; }
}

function cacheDelineation(birthHash: string, boudinId: string, profileHash: string, delineation: Record<string, unknown>) {
  if (!supabase) return;
  supabase
    .from("delineation_cache")
    .upsert({
      birth_hash: birthHash,
      boudin_id: boudinId,
      profile_hash: profileHash,
      delineation,
      model: OPENAI_MODEL,
    }, { onConflict: "birth_hash,boudin_id,profile_hash" })
    .then(({ error }) => {
      if (error) console.warn("[CACHE WRITE] Failed:", error.message);
      else console.log("[CACHE WRITE] Saved delineation for", boudinId);
    });
}

// ─── Rate limiting ───────────────────────────────────────
// There used to be a `new Map()` limiter here, keyed by x-forwarded-for,
// 30 calls per minute. On Vercel every lambda instance holds its own copy and
// throws it away on cold start, so it capped nothing across the fleet: the same
// trap documented at the top of lib/billing/entitlement.ts. It is replaced by
// lib/ai-guard.ts, whose counters live in Postgres and are therefore shared by
// every instance and survive restarts.

// ─── Locale instruction (multi-language GPT output) ────────────
// Appended to Marie Ange's French systemPrompt so GPT generates the
// personalized text directly in the user's language. Astrological terms
// (Foyer→Home, Carrière→Career, etc.) are translated by GPT in-context.

const LOCALE_NAMES: Record<string, string> = {
  fr: "français",
  en: "English",
  es: "español",
  pt: "português brasileiro",
  de: "Deutsch",
  it: "italiano",
  nl: "Nederlands",
  ja: "日本語",
  zh: "中文",
  ar: "العربية",
};

function buildLocaleInstruction(locale: string): string {
  const lang = LOCALE_NAMES[locale];
  if (!lang || locale === "fr") return "";                // French = source content, no instruction
  return `

--- LANGUE DE SORTIE ---
**IMPORTANT**: Génère TOUS les champs de la sortie JSON (titre, sousTitre, corps, avecLeRecul, hitInfo, lifetimeInfo, convergenceNote, domainesActives) directement en ${lang}.
Traduis tous les termes astrologiques: les noms de domaines (Foyer→Home/Hogar/Lar/Heim, Carrière→Career/Carrera/Carreira/Karriere, etc.), les noms de capsules ("Brouillard créatif"→"Creative Fog", "Pivot majeur"→"Major Pivot", etc.), et les phrases d'insight.
Garde les noms de planètes (Neptune, Lune, Vénus, Mars, etc.) et les aspects techniques (square, opposition, conjunction) en standard astrologique.
NE traduis PAS les valeurs des champs JSON (clés en français comme "titre" restent), seulement le CONTENU des chaînes.
--- FIN LANGUE ---
`;
}

// ─── User profile injection (GPT-validated rules) ───────

function buildUserProfileContext(
  userProfile: Record<string, unknown> | null
): string {
  if (!userProfile) return "";

  const lines: string[] = [
    "\n\n--- RÈGLES DE VOIX UNFOLD ---",
    "Vocabulaire autorisé : signal, momentum, fenêtre, période, timing, rythme, terrain, domaine, intensité.",
    "Vocabulaire interdit : énergie, chance, destin, univers, vibration, cosmique, astral, nourrir ton esprit, attirer, aligner, harmoniser.",
    "Nomme toujours la planète et le domaine de vie concret. Mentionne la période/durée. Calibre selon l'intensité.",
    "Chaque phrase doit être spécifique à CE signal. Rien de générique.",
    "",
    "--- RÈGLES DE QUALITÉ TEXTE ---",
    "CRITIQUE : écris un texte COMPLET et lisible. Chaque mot doit être entier — pas de troncature.",
    "Mets un espace avant chaque parenthèse ouvrante : 'maison 10 (carrière)' et pas 'maison 10carrière'.",
    "Écris les numéros de maison avec un espace : 'maison 12' pas 'maison12'.",
    "Utilise 'lâcher-prise' (avec tiret), 'au sein de' (pas 'sein de').",
    "Commence TOUJOURS le corps par le nom complet de la planète transitante (ex: 'Pluton', pas 'uton').",
    "Tutoie l'utilisateur (tu/ton/ta/tes).",
    "",
    "--- CONTEXTE UTILISATEUR ---",
  ];

  if (userProfile.lifePhase) {
    const phases: Record<string, string> = {
      stable: "Phase de consolidation — angle : ajustement, continuité",
      transition: "Phase de transition — angle : pivot, réorientation, clarification",
      crisis: "Phase de crise — angle : protection, recentrage, simplification. Ton contenant, pas alarmiste.",
      reconstruction: "Phase de reconstruction — angle : reprise, redéfinition",
      expansion: "Phase d'expansion — angle : croissance, opportunité, déploiement",
    };
    lines.push(`Phase de vie : ${phases[userProfile.lifePhase as string] ?? userProfile.lifePhase}`);
  }

  if (userProfile.effectivePriorities) {
    // `?? "declared"` faisait passer pour DECLAREES des priorites dont on
    // ignorait l origine — et sautait du meme coup l avertissement de prudence.
    // Le modele affirmait alors « tu as dit que… » sur une deduction. Origine
    // inconnue = meme prudence qu une observation.
    const source = typeof userProfile.prioritySource === "string" ? userProfile.prioritySource : "inconnue";
    lines.push(`Priorités (${source}) : ${(userProfile.effectivePriorities as string[]).join(", ")}`);
    if (source !== "declared") {
      lines.push("⚠ Priorités non déclarées par la personne — personnaliser avec prudence, ne pas sur-affirmer.");
    }
  }

  if (userProfile.effectiveStyle) {
    const styles: Record<string, string> = {
      direct: "Style direct — net, court, sans détour",
      reassuring: "Style rassurant — doux, contenant, pas alarmiste",
      inspiring: "Style inspirant — mobilisateur, visionnaire",
      pragmatic: "Style pragmatique — concret, actionnable, utilitaire",
    };
    lines.push(`Ton : ${styles[userProfile.effectiveStyle as string] ?? userProfile.effectiveStyle}`);
  }

  if (userProfile.effectiveStress === "high") {
    lines.push("⚠ Stress élevé — éviter formulations alarmistes, rester concret et contenant.");
  }

  if (userProfile.currentGoal) {
    lines.push(`Objectif actuel : ${userProfile.currentGoal}`);
  }

  if (userProfile.workStatus) {
    lines.push(`Situation pro : ${userProfile.workStatus}`);
  }

  if (userProfile.relationshipStatus) {
    lines.push(`Situation relationnelle : ${userProfile.relationshipStatus}`);
  }

  lines.push("--- FIN CONTEXTE UTILISATEUR ---");
  return lines.join("\n");
}

// ─── Route handler ───────────────────────────────────────

async function handlePost(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  // A verified loopback call from /api/landing/signal. That route already ran
  // the budget guard for the visitor, so we neither re-count nor demand auth.
  // The marker is signed now: `x-unfold-internal: 1` no longer opens anything.
  const internal = isInternalCall(request);

  let guard: AiGuardResult | undefined;

  try {
    const body = await request.json();
    const { birthData, boudinIndex, userProfile, locale: rawLocale } = body;
    // boudinId is the exact sausage ID from toctoc-app-short (e.g. "transit_abc_h3" for hit 3)
    // The detail API uses calculateTocTocApp which creates the same _h{n} IDs — pass as-is
    const boudinId = body.boudinId;
    // User locale for GPT output language. Defaults to FR (Marie Ange's source content).
    const locale: string = (typeof rawLocale === "string" ? rawLocale : "fr").slice(0, 2).toLowerCase();

    if (!birthData || (boudinId === undefined && boudinIndex === undefined)) {
      return NextResponse.json({ error: "Missing birthData or boudinId/boudinIndex" }, { status: 400 });
    }

    // ── BUDGET GATE ──
    // Runs before the cache read as well as before OpenAI: a cache read still
    // costs a Supabase round-trip, and an unbounded loop on it is still abuse.
    if (!internal) {
      try {
        guard = await enforceAiBudget(request, "openai");
      } catch (err) {
        if (err instanceof AiBudgetError) {
          return NextResponse.json(err.toJSON(), {
            status: err.status,
            headers: budgetErrorHeaders(err),
          });
        }
        if (err instanceof AiGuardUnavailableError) {
          console.error("[OpenAI] guard unavailable:", err.reason);
          return NextResponse.json(err.toJSON(), { status: err.status });
        }
        throw err;
      }
    }

    // ── BILLING GATE: must run BEFORE cache return (otherwise free users
    //    see paid-cached responses for free) and BEFORE the SSE stream
    //    response (mid-stream throws can't write structured 402 JSON).
    const isDevBypass = process.env.NODE_ENV === "development" && process.env.DEV_BYPASS_AUTH === "true";
    const userId = isDevBypass ? "dev" : await getUserIdFromRequest(request);
    if (!userId) {
      // Anonymous callers are allowed only through the signed loopback from
      // /api/landing/signal (the landing is intentionally anonymous). Every
      // other anonymous call is refused. Before this change the marker was the
      // literal string "1", which any caller could send.
      if (!internal) {
        return applyGuardCookie(guard, NextResponse.json(
          { error: "auth_required", message: "Connecte-toi pour accéder à l'IA personnalisée." },
          { status: 401 },
        ));
      }
    } else if (!isDevBypass) {
      try {
        await enforceQuota(userId, "AI_DELINEATION");
      } catch (err) {
        if (err instanceof RequiresPlanError) {
          return applyGuardCookie(guard, NextResponse.json(err.toJSON(), { status: err.status }));
        }
        if (err instanceof QuotaExceededError) {
          return applyGuardCookie(guard, NextResponse.json(err.toJSON(), { status: err.status }));
        }
        throw err;
      }
    }

    // ── L2 Cache check (Supabase) ──
    const bHash = makeBirthHash(birthData);
    const pHash = makeProfileHash(userProfile);
    // Suffix locale to cache id so different languages get distinct cached outputs.
    const baseCacheId = boudinId ?? `idx_${boudinIndex}`;
    const cacheId = locale === "fr" ? baseCacheId : `${baseCacheId}_${locale}`;

    const cached = await getCachedDelineation(bHash, cacheId, pHash);
    if (cached) {
      return applyGuardCookie(guard, NextResponse.json(cached));
    }

    // ── Step 1: Get category-specific prompt + payload from Marie Ange's API ──
    // Prefer boudinId (stable across calls) over boudinIndex (position-dependent)
    // `?? "Europe/Brussels"` inventait le fuseau de naissance quand il manquait :
    // le theme entier etait alors calcule pour Bruxelles, pour quelqu un qui n y
    // est peut-etre jamais ne, et la lecture produite avait l air aussi vraie
    // qu une autre. Un fuseau absent est une donnee absente : on refuse.
    if (typeof birthData.timezone !== "string" || birthData.timezone.trim() === "") {
      return applyGuardCookie(guard, NextResponse.json(
        { error: "missing_timezone", message: "Fuseau horaire de naissance manquant — impossible de calculer sans lui." },
        { status: 400 },
      ));
    }

    const detailBody: Record<string, unknown> = {
      birthDate: birthData.birthDate,
      birthTime: birthData.birthTime,
      latitude: birthData.latitude,
      longitude: birthData.longitude,
      timezone: birthData.timezone,
    };
    if (boudinId !== undefined) {
      detailBody.boudinId = boudinId;
    } else {
      detailBody.boudinIndex = boudinIndex;
    }

    const detailRes = await fetch(`${TOCTOC_BASE}/toctoc-boudin-detail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detailBody),
      next: { revalidate: 86400 }, // 24h server-side cache — same birth+boudin = same output
    });

    if (!detailRes.ok) {
      return applyGuardCookie(guard, NextResponse.json(
        { error: "TocToc detail API error", status: detailRes.status },
        { status: 502 }
      ));
    }

    const detail = await detailRes.json();
    const systemPrompt = detail.systemPrompt ?? detail.data?.systemPrompt;
    const llmPayload = detail.llmPayload ?? detail.data?.llmPayload;

    // ── DEBUG: trace pipeline for Marie Ange audit ──
    console.log("[AUDIT] === PIPELINE TRACE ===");
    console.log("[AUDIT] Input:", JSON.stringify({ boudinId, boudinIndex, birthDate: birthData.birthDate }));
    console.log("[AUDIT] TocToc request body:", JSON.stringify(detailBody));
    console.log("[AUDIT] TocToc response keys:", Object.keys(detail));
    console.log("[AUDIT] systemPrompt length:", systemPrompt?.length ?? "MISSING");
    console.log("[AUDIT] systemPrompt first 200 chars:", systemPrompt?.substring(0, 200));
    console.log("[AUDIT] llmPayload keys:", llmPayload ? Object.keys(llmPayload) : "MISSING");
    console.log("[AUDIT] llmPayload critical fields:", JSON.stringify({
      category: llmPayload?.category,
      transitPlanet: llmPayload?.transitPlanet,
      natalPoint: llmPayload?.natalPoint,
      aspect: llmPayload?.aspect,
      score: llmPayload?.score,
      startDate: llmPayload?.startDate,
      endDate: llmPayload?.endDate,
      topics: llmPayload?.topics?.map((t: { house?: number; topic?: string }) => ({ house: t.house, topic: t.topic })),
    }));
    // ── Log cycle + lifetime data from Marie Ange's detail endpoint ──
    console.log("[AUDIT] llmPayload cycle/lifetime:", JSON.stringify({
      cycle: llmPayload?.cycle,
      hitNumber: llmPayload?.hitNumber,
      totalHits: llmPayload?.totalHits,
      lifetimeNumber: llmPayload?.lifetimeNumber,
      lifetimeTotal: llmPayload?.lifetimeTotal,
      lifetimeCount: llmPayload?.lifetimeCount,
      occurrenceCount: llmPayload?.occurrenceCount,
      sameTransitCount: llmPayload?.sameTransitCount,
      pattern: llmPayload?.pattern,
    }));
    console.log("[AUDIT] llmPayload ALL keys:", Object.keys(llmPayload || {}));
    console.log("[AUDIT] allPeriods:", JSON.stringify(llmPayload?.allPeriods));
    console.log("[AUDIT] === END TRACE ===");

    if (!llmPayload) {
      return applyGuardCookie(guard, NextResponse.json(
        { error: "Missing llmPayload from TocToc API" },
        { status: 502 }
      ));
    }

    // Le prompt de secours — « Tu es un astrologue expert… » — laissait le
    // modele ecrire librement quand le moteur n avait pas fourni sa consigne
    // par categorie. Le texte produit n etait plus une lecture du signal
    // calcule mais une improvisation, et rien ne le signalait. Sans prompt du
    // moteur, on ne genere pas : meme regle que pour llmPayload.
    if (typeof systemPrompt !== "string" || systemPrompt.trim() === "") {
      return applyGuardCookie(guard, NextResponse.json(
        { error: "Missing systemPrompt from TocToc API" },
        { status: 502 }
      ));
    }

    // ── Step 2: Build system prompt ──
    // Use Marie Ange's category-specific systemPrompt from the detail endpoint.
    // Append: our JSON output format spec + optional user profile context + locale instruction.
    const apiSystemPrompt = systemPrompt;
    const userContext = buildUserProfileContext(userProfile);
    const localeInstruction = buildLocaleInstruction(locale);
    const fullSystemPrompt = apiSystemPrompt + JSON_OUTPUT_FORMAT + userContext + localeInstruction;

    // ── Step 3: Call OpenAI with streaming ──
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: JSON.stringify(llmPayload) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.65,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}));
      console.error("[OpenAI] API error:", openaiRes.status, err);
      return applyGuardCookie(guard, NextResponse.json(
        { error: "OpenAI API error", status: openaiRes.status },
        { status: 502 }
      ));
    }

    // ── Step 4: Stream OpenAI tokens to client as SSE ──
    // Non-OpenAI metadata (from llmPayload) is sent as the first event
    const meta = {
      rawCycle: llmPayload?.cycle ?? null,
      rawLifetime: (() => {
        const rawNum = llmPayload?.lifetime?.number ?? llmPayload?.lifetimeNumber ?? null;
        const rawTot = llmPayload?.lifetime?.total ?? llmPayload?.lifetimeTotal ?? null;
        return {
          // Merged ZR events (Fortune+Eros) return arrays — take first value
          number: Array.isArray(rawNum) ? (rawNum[0] ?? null) : rawNum,
          total:  Array.isArray(rawTot) ? (rawTot[0] ?? null) : rawTot,
        };
      })(),
      allPeriods: llmPayload?.allPeriods ?? null,
    };

    const encoder = new TextEncoder();

    function buildResult(parsed: Record<string, unknown>) {
      const titre = String(parsed.titre ?? "").trim();
      const sousTitreRaw = String(parsed.sousTitre ?? "").trim();
      // Accept "corps" or legacy "cor" (model sometimes abbreviates the key)
      const corpsRaw = String(parsed.corps ?? parsed.cor ?? "").trim();
      const avecLeReculRaw = String(parsed.avecLeRecul ?? "").trim();

      // Aucun repli fabrique ici.
      //
      // `sousTitre` retombait sur la premiere phrase du corps : la carte
      // « Insight cle » repetait alors mot pour mot le debut du texte deja lu,
      // presente comme un insight distinct.
      //
      // `avecLeRecul` retombait sur la derniere phrase du corps puis, a defaut,
      // sur une phrase fixe en francais — « Avec le recul, ce chapitre t aide a
      // clarifier ce qui compte vraiment. » — servie comme guidance
      // personnalisee, identique pour tout le monde, sans aucune marque
      // distinctive. Elle contredisait aussi la consigne de langue : un lecteur
      // anglophone recevait du francais.
      //
      // Les deux champs valent "" quand le modele ne les produit pas ; le client
      // masque alors la carte correspondante.
      const sousTitre = sousTitreRaw;
      const avecLeRecul = avecLeReculRaw;

      return {
        titre,
        sousTitre,
        corps: corpsRaw,
        avecLeRecul,
        domainesActives: parsed.domainesActives ?? [],
        intensite: parsed.intensite ?? 0,
        ...meta,
        story: corpsRaw,
        insight: sousTitre,
        guidance: avecLeRecul,
      };
    }

    const stream = new ReadableStream({
      async start(controller) {
        // Send metadata first — client needs rawCycle/rawLifetime/allPeriods immediately
        controller.enqueue(encoder.encode(`event: meta\ndata: ${JSON.stringify(meta)}\n\n`));

        const reader = openaiRes.body!.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        let lineBuffer = ""; // handles SSE lines split across chunks

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            lineBuffer += decoder.decode(value, { stream: true });
            const lines = lineBuffer.split(/\r?\n/);
            lineBuffer = lines.pop() ?? ""; // keep incomplete last line

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (raw === "[DONE]") continue;
              try {
                const evt = JSON.parse(raw);
                const delta = evt.choices?.[0]?.delta?.content ?? "";
                if (delta) {
                  fullContent += delta;
                  controller.enqueue(encoder.encode(`event: delta\ndata: ${JSON.stringify({ c: delta })}\n\n`));
                }
              } catch { /* skip malformed SSE line */ }
            }
          }
          // Process any remaining data in buffer
          if (lineBuffer.startsWith("data: ")) {
            const raw = lineBuffer.slice(6).trim();
            if (raw && raw !== "[DONE]") {
              try {
                const evt = JSON.parse(raw);
                const delta = evt.choices?.[0]?.delta?.content ?? "";
                if (delta) fullContent += delta;
              } catch { /* skip */ }
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Parse full content, cache, send done event
        try {
          console.log("[AUDIT] OpenAI response length:", fullContent.length, "| sample:", fullContent.substring(0, 200));
          const parsed = JSON.parse(fullContent);
          console.log("[AUDIT] Parsed OK — titre:", parsed.titre);
          const result = buildResult(parsed);
          cacheDelineation(bHash, cacheId, pHash, result);
          controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify(result)}\n\n`));
        } catch (err) {
          console.error("[AUDIT] JSON.parse FAILED — length:", fullContent.length, "| err:", err instanceof Error ? err.message : String(err), "| content:", fullContent.substring(0, 300));
          controller.enqueue(encoder.encode(`event: error\ndata: {}\n\n`));
        }

        controller.close();
      },
    });

    return applyGuardCookie(guard, new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }));
  } catch (error) {
    console.error("[OpenAI] Personalize error:", error);
    return applyGuardCookie(guard, NextResponse.json({ error: "Failed to generate" }, { status: 500 }));
  }
}

// Les en-tetes CORS doivent etre sur la reponse reelle, pas seulement sur le preflight.
export const POST = corsHandler(handlePost);
