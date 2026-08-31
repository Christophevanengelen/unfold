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

export const runtime = "nodejs";                  // crypto + Supabase admin client

const TOCTOC_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";
const OPENAI_MODEL = "gpt-4o-mini";

const DAILY_BRIEF_SYSTEM_PROMPT = `Tu es le moteur de briefing quotidien d'Unfold pour les signaux RAPIDES.

Tu reçois les signaux personnalisés actifs AUJOURD'HUI : transits de Mars et planètes rapides vers des points nataux, nouvelles/pleines lunes dans les maisons natales, pics ZR niveau 4.

FORMAT JSON strict :
{
  "greeting": "1 phrase d'accroche ancrée dans un domaine concret touché aujourd'hui",
  "summary": "2-3 phrases max. Nomme la planète, le domaine de vie, ce qui bouge maintenant. Reste dans les 24-48 prochaines heures.",
  "action": "1 directive concrète et immédiate liée au signal le plus fort.",
  "activeDomains": ["max 3 domaines"]
}

RÈGLES STRICTES :
- Maximum 60 mots total (greeting + summary + action)
- Signaux RAPIDES seulement : Mars, Vénus, Mercure, Soleil, Lune, nouvelle/pleine lune en maison, ZR L4
- Si aucun signal fort : dis-le simplement, sans inventer de transit. N affirme jamais
  qu une journee est calme ou active si le calcul n a pas abouti.
- NE PAS inventer des signaux qui ne sont pas dans les données reçues
- Tutoie l'utilisateur (tu/ton/ta/tes)
- Ton sobre, direct, actionnable
- Quand une Nouvelle ou Pleine Lune approche, nomme la maison natale concernée et le domaine de vie

VOCABULAIRE AUTORISÉ : signal, fenêtre, timing, rythme, terrain, domaine, transit, maison
VOCABULAIRE INTERDIT : énergie, chance, destin, univers, vibration, cosmique, astral, attirer, aligner`;

// On n'invente jamais une lecture. L'ancien contenu affirmait « Journée de
// transit calme aujourd'hui », ce qui est une affirmation sur le theme de la
// personne, rendue avec un code 200, alors qu'aucun calcul n'avait abouti.
const FALLBACK_BRIEF = {
  greeting: "On ne peut pas calculer ton signal en ce moment.",
  summary:
    "Le calcul n'a pas abouti. On préfère te le dire plutôt que d'inventer une lecture.",
  action: "Réessaie dans quelques minutes.",
  activeDomains: [],
};

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

async function handlePost(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  let guard: AiGuardResult | undefined;

  try {
    const body = await request.json();
    const { birthData } = body as { birthData: BirthDataPayload };

    if (!birthData?.birthDate || !birthData?.birthTime) {
      return NextResponse.json({ error: "Missing birthData" }, { status: 400 });
    }

    // ── BUDGET GATE ──
    // This route spends the OpenAI key and used to be reachable by anyone with
    // no identification, no quota and no rate limit. The guard runs after input
    // validation and before the first outbound call, so a refused request costs
    // neither an OpenAI token nor a hit on Marie-Ange's API.
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
        console.error("[DailyBrief] guard unavailable:", err.reason);
        return NextResponse.json(err.toJSON(), { status: err.status });
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
        timezone: birthData.timezone ?? "Europe/Brussels",
      }),
    });

    if (!briefRes.ok) {
      console.error("[DailyBrief] daily-brief endpoint error:", briefRes.status);
      return applyGuardCookie(guard, NextResponse.json(FALLBACK_BRIEF));
    }

    const briefData: DailyBriefResponse = await briefRes.json();

    if (!briefData.success || !briefData.signals || briefData.signals.length === 0) {
      return applyGuardCookie(guard, NextResponse.json(FALLBACK_BRIEF));
    }

    // ── Build user message from signal llmPayloads ──
    const today = new Date().toISOString().split("T")[0];
    const signalTexts = briefData.signals
      .map((s, i) => `Signal ${i + 1} (priorité ${s.priority}): ${s.llmPayload}`)
      .join("\n");

    const lunationNote = briefData.nextLunation
      ? `\nProchaine lunation : ${briefData.nextLunation.type === "NEW_MOON" ? "Nouvelle Lune" : "Pleine Lune"} en ${briefData.nextLunation.sign} (maison ${briefData.nextLunation.natalHouse} — ${briefData.nextLunation.houseMeaning}) dans ${briefData.nextLunation.daysFromNow} jour(s).`
      : "";

    const userMessage = `Signaux rapides actifs aujourd'hui (${today}) :

${signalTexts}${lunationNote}`;

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
          { role: "system", content: DAILY_BRIEF_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 250,
      }),
    });

    if (!openaiRes.ok) {
      console.error("[DailyBrief] OpenAI error:", openaiRes.status);
      return applyGuardCookie(guard, NextResponse.json(FALLBACK_BRIEF));
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return applyGuardCookie(guard, NextResponse.json(FALLBACK_BRIEF));

    const parsed = JSON.parse(content);
    return applyGuardCookie(guard, NextResponse.json({
      greeting: parsed.greeting ?? FALLBACK_BRIEF.greeting,
      summary: parsed.summary ?? FALLBACK_BRIEF.summary,
      action: parsed.action ?? FALLBACK_BRIEF.action,
      activeDomains: parsed.activeDomains ?? [],
    }));
  } catch (error) {
    console.error("[DailyBrief] Error:", error);
    return applyGuardCookie(guard, NextResponse.json(FALLBACK_BRIEF));
  }
}


export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// Les en-tetes CORS doivent etre sur la reponse REELLE, pas seulement sur le
// preflight : sans eux le navigateur jette le resultat malgre un preflight
// accepte. C est ce qui empechait l app d enregistrer les profils.
export const POST = corsHandler(handlePost);
