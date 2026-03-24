/**
 * POST /api/openai/daily-briefing
 *
 * Generates a daily AI briefing by synthesizing all currently-active signals.
 *
 * Flow:
 * 1. Receive POST with { birthData }
 * 2. Call Marie Ange's toctoc-year.php → get current active events
 * 3. Extract top 3 active events (highest score, isCurrent or closest future)
 * 4. For each, call toctoc-boudin-detail.php → get systemPrompt + llmPayload
 * 5. Compose a SINGLE GPT call that synthesizes all signals into one daily briefing
 * 6. Return parsed JSON
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

VOIX UNFOLD — RÈGLES STRICTES :
- Français, ton sobre, direct, premium
- Maximum 80 mots total
- Nomme la planète et le domaine de vie concret (carrière, finances, relation, santé...)
- Mentionne la période ou la durée quand c'est pertinent
- Calibre selon l'intensité du signal (fort = rare et impactant, faible = subtil)

VOCABULAIRE AUTORISÉ : signal, momentum, fenêtre, période, timing, rythme, terrain, domaine, intensité
VOCABULAIRE INTERDIT : énergie, chance, destin, univers, vibration, cosmique, astral, nourrir ton esprit, attirer, aligner, harmoniser
NE JAMAIS produire de phrases qui pourraient s'appliquer à n'importe qui. Chaque phrase doit être ancrée dans un signal précis.`;

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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { birthData } = body as { birthData: BirthDataPayload };

    if (!birthData?.birthDate || !birthData?.birthTime) {
      return NextResponse.json({ error: "Missing birthData" }, { status: 400 });
    }

    // ── Step 1: Get current year data from Marie Ange's API ──
    let topEvents: YearEvent[] = [];

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

      // Find current month and nearby months
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      // Collect events from current month + adjacent months
      const relevantMonths = months.filter((m) => {
        const diff = monthDiff(currentMonthStr, m.month);
        return diff >= -1 && diff <= 1; // previous, current, next month
      });

      // Flatten all events and pick the most active ones
      const allEvents: YearEvent[] = relevantMonths.flatMap((m) => m.topEvents ?? []);

      // Filter for currently active events (period includes today)
      const todayMs = now.getTime();
      const activeEvents = allEvents.filter((e) => {
        if (e.periodStart && e.periodEnd) {
          const start = new Date(e.periodStart).getTime();
          const end = new Date(e.periodEnd).getTime();
          return start <= todayMs && end >= todayMs;
        }
        return true; // If no period info, include it
      });

      // Sort by score (highest first) and take top 3
      const sorted = (activeEvents.length > 0 ? activeEvents : allEvents)
        .sort((a, b) => b.score - a.score);
      topEvents = sorted.slice(0, 3);
    } catch (err) {
      console.error("[DailyBriefing] Year API error:", err);
      // Continue with empty events — will use fallback or minimal briefing
    }

    // If no events found at all, return the static fallback
    if (topEvents.length === 0) {
      return NextResponse.json(FALLBACK_BRIEFING);
    }

    // ── Step 2: Get detail for each event ──
    const signalDetails: string[] = [];

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
            // Use the event label to find matching boudin
            boudinLabel: event.label,
          }),
        });

        if (detailRes.ok) {
          const detail = await detailRes.json();
          const llmPayload = detail.llmPayload ?? detail.data?.llmPayload;
          if (llmPayload) {
            signalDetails.push(
              typeof llmPayload === "string" ? llmPayload : JSON.stringify(llmPayload)
            );
          } else {
            // Use the event label as a minimal signal description
            signalDetails.push(`Signal actif: ${event.label} (intensité ${event.score}/4)`);
          }
        } else {
          signalDetails.push(`Signal actif: ${event.label} (intensité ${event.score}/4)`);
        }
      } catch {
        signalDetails.push(`Signal actif: ${event.label} (intensité ${event.score}/4)`);
      }
    }

    // ── Step 3: Single GPT call to synthesize all signals ──
    const hour = new Date().getHours();
    const timeContext =
      hour < 12 ? "matin" : hour < 18 ? "après-midi" : "soir";

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

// ─── Helpers ─────────────────────────────────────────────

/** Compute month difference between two YYYY-MM strings */
function monthDiff(a: string, b: string): number {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}
