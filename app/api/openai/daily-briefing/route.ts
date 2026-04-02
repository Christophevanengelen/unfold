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
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Config ──────────────────────────────────────────────

const TOCTOC_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";
const OPENAI_MODEL = "gpt-4o-mini";

const BRIEFING_SYSTEM_PROMPT = `Tu es le moteur de briefing quotidien d'Unfold, une app premium de momentum personnel.

Tu reçois 1 à 3 signaux actifs avec leurs interprétations. Synthétise-les en UN SEUL briefing court et actionnable.

FORMAT JSON strict :
{
  "greeting": "1 phrase d'accroche qui nomme un domaine concret touché aujourd'hui",
  "summary": "2-3 phrases synthétisant les signaux actifs. Nomme les planètes concernées, la période, l'intensité. Ancre dans un domaine de vie réel.",
  "action": "1 phrase concrète. Un conseil actionnable pour aujourd'hui, lié au signal le plus fort.",
  "activeDomains": ["max 3 domaines touchés"]
}

HIÉRARCHIE DES SIGNAUX — OBLIGATOIRE :
Les signaux ne sont PAS tous équivalents. Classe-les ainsi avant de rédiger :

NIVEAU 4 — Éclipse touchant un point natal ou un axe natal (ex. : axe 2-8, Ascendant/Descendant, MC/FC) → très rare, portée de plusieurs mois. C'est le signal le plus important à nommer. Mentionne l'axe natal concerné (ex. : "axe Lion-Verseau de ta 2e-8e maison").

NIVEAU 3 — Transit lent (Pluton, Uranus, Neptune, Saturne, Nœuds) en aspect direct à un point natal → portée de semaines à mois. Signal personnel fort.

NIVEAU 2 — Transit rapide (Jupiter, Mars, Vénus, Mercure) en aspect à un point natal → portée de jours. Signal contextuel.

NIVEAU 1 — Position de la Lune transitant dans un signe → NE PAS présenter comme un signal personnel. La Lune passe dans chaque signe en 2,5 jours : c'est un signal universel, non personnalisé. Ne dis PAS "la Lune en Lion suggère des opportunités pour toi" — ça s'applique à tout le monde ce jour-là. Si la Lune déclenche une éclipse ou touche un point natal précis, monte-la au niveau approprié.

CONTEXTE NATAL — OBLIGATOIRE quand disponible :
Quand un signal mentionne un signe (ex. : Lion), traduis-le en maison natale si elle est fournie dans le payload. Dis "ton axe 2e-8e maison (Lion-Verseau)" plutôt que simplement "Lion". La maison donne le DOMAINE DE VIE concret. Sans maison natale fournie, reste sur le domaine thématique de l'aspect.

VOIX UNFOLD — RÈGLES STRICTES :
- Français, ton sobre, direct, premium
- Maximum 80 mots total
- Nomme la planète, l'aspect (transit, éclipse, opposition...) et le domaine de vie concret (carrière, finances, relation, santé...)
- Mentionne la période ou la durée quand c'est pertinent (éclipse = mois, transit Saturne = semaines, Lune = irrelevant)
- Calibre selon l'intensité réelle : éclipse sur axe natal = phénomène rare et impactant ; Lune en transit = discret ou absent

VOCABULAIRE AUTORISÉ : signal, momentum, fenêtre, période, timing, rythme, terrain, domaine, intensité, axe, transit, éclipse, maison
VOCABULAIRE INTERDIT : énergie, chance, destin, univers, vibration, cosmique, astral, nourrir ton esprit, attirer, aligner, harmoniser, opportunités d'évolution personnelle (trop générique)
NE JAMAIS produire de phrases qui pourraient s'appliquer à n'importe qui. Chaque phrase doit être ancrée dans un signal précis avec planète + aspect + maison/domaine.`;

// ─── Fallback briefing (when API fails) ──────────────────

const FALLBACK_BRIEFING = {
  greeting: "Tes signaux sont actifs aujourd'hui.",
  summary: "Ouvre un signal sur ta timeline pour découvrir ce qui se joue en ce moment dans ta vie.",
  action: "Explore ta timeline pour comprendre ton momentum actuel.",
  activeDomains: [],
};

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

// ─── Route handler ───────────────────────────────────────

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { birthData } = body as { birthData: BirthDataPayload };

    if (!birthData?.birthDate || !birthData?.birthTime) {
      return NextResponse.json({ error: "Missing birthData" }, { status: 400 });
    }

    const hour = new Date().getHours();
    const timeContext = hour < 12 ? "matin" : hour < 18 ? "après-midi" : "soir";

    // ── Primary: natalized context endpoint ──────────────
    const signalDetails = await getSignalsFromContextEndpoint(birthData);

    // ── Fallback: toctoc-year + boudin-detail ────────────
    if (signalDetails.length === 0) {
      const fallbackDetails = await getSignalsFromYearEndpoint(birthData);
      if (fallbackDetails.length === 0) {
        return NextResponse.json(FALLBACK_BRIEFING);
      }
      signalDetails.push(...fallbackDetails);
    }

    // ── GPT synthesis ────────────────────────────────────
    const userMessage = `Moment de la journée: ${timeContext}

Signaux actifs (${signalDetails.length}):

${signalDetails.map((s, i) => `--- Signal ${i + 1} ---\n${s}`).join("\n\n")}`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: BRIEFING_SYSTEM_PROMPT },
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
      return NextResponse.json(FALLBACK_BRIEFING);
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(FALLBACK_BRIEFING);
    }

    const parsed = JSON.parse(content);

    return NextResponse.json({
      greeting: parsed.greeting ?? FALLBACK_BRIEFING.greeting,
      summary: parsed.summary ?? FALLBACK_BRIEFING.summary,
      action: parsed.action ?? FALLBACK_BRIEFING.action,
      activeDomains: parsed.activeDomains ?? [],
    });
  } catch (error) {
    console.error("[DailyBriefing] Error:", error);
    return NextResponse.json(FALLBACK_BRIEFING);
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
        timezone: birthData.timezone ?? "Europe/Brussels",
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
        timezone: birthData.timezone ?? "Europe/Brussels",
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
            timezone: birthData.timezone ?? "Europe/Brussels",
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
