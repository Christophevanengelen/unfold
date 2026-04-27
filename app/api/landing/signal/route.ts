import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/landing/signal
 *
 * Hero-page aggregator. Single round-trip from the client:
 *   1) toctoc-app-short  → list of boudins (current month + future)
 *   2) findActiveBoudin   → pick today's strongest signal
 *   3) personalize        → GPT-4o delineation (cached at L2 / Supabase)
 *
 * Returns:
 *   { active: { boudinId, planet, house, tier, score, dateRange, delineation },
 *     futureMonths: [{ monthKey, tier, color, score }],
 *     fromCache: boolean,
 *     fallback?: "mock" }
 *
 * Failure modes:
 *  - toctoc 5xx | timeout (>10s)  → 503 with `fallback: "mock"` flag (client renders deterministic mock)
 *  - personalize 5xx | timeout    → 200 with `delineation: null` (client renders template card)
 *  - rate limit (5/IP/min)        → 429
 *  - bad input                    → 400
 *
 * Privacy: never logs full birth data. Uses an SHA-256 hash prefix for telemetry.
 */

import crypto from "crypto";

const TOCTOC_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";
const TOCTOC_TIMEOUT_MS = 25_000;
const PERSONALIZE_TIMEOUT_MS = 15_000;

// In-memory rate limiter (per Vercel function instance — see TODO Upstash KV).
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RL_WINDOW_MS = 60_000;
const RL_MAX = 5;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RL_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RL_MAX;
}

function logHash(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex").slice(0, 8);
}

// ─── Types from Marie Ange's API ───────────────────────────

interface ShortBoudin {
  id: string;
  cat: string;          // category: transit | zr | eclipse | station
  s: string;            // startDate
  e?: string;           // endDate
  sc: number;           // score (1-4)
  col: string;          // hex color
  lbl: string;          // label
  tp?: string;          // transitPlanet
  np?: string;          // natalPoint
  asp?: string;         // aspect
  nh?: number;          // natalHouse
  past?: boolean;
  pSign?: string;       // ZR period sign
  eType?: string;       // eclipse type
}

interface TocTocAppShortBody {
  data?: { boudins?: ShortBoudin[] };
  boudins?: ShortBoudin[];
}

// ─── Helpers ────────────────────────────────────────────────

function tierFromScore(score: number): "PEAK" | "CLEAR" | "SUBTLE" {
  if (score >= 3) return "PEAK";
  if (score === 2) return "CLEAR";
  return "SUBTLE";
}

function planetKeyFromBoudin(b: ShortBoudin): string {
  if (b.cat === "eclipse") {
    return (b.eType ?? "").toLowerCase().includes("solar") ? "solar-eclipse" : "lunar-eclipse";
  }
  if (b.cat === "zr") return "zr";
  return (b.tp ?? "").toLowerCase();
}

function inWindow(b: ShortBoudin, isoDate: string): boolean {
  const start = b.s;
  const end = b.e ?? b.s;
  return start <= isoDate && isoDate <= end;
}

function findActiveBoudin(boudins: ShortBoudin[], todayISO: string): ShortBoudin | null {
  // Active = window contains today, not past. Prefer highest score.
  const active = boudins
    .filter((b) => !b.past && inWindow(b, todayISO))
    .sort((a, b) => b.sc - a.sc);
  if (active.length > 0) return active[0];
  // Fallback: nearest upcoming high-score boudin
  const upcoming = boudins
    .filter((b) => !b.past && b.s > todayISO)
    .sort((a, b) => {
      if (b.sc !== a.sc) return b.sc - a.sc;
      return a.s.localeCompare(b.s);
    });
  return upcoming[0] ?? null;
}

function buildFutureMonths(boudins: ShortBoudin[], todayISO: string, count = 12): Array<{
  monthKey: string;
  tier: "PEAK" | "CLEAR" | "SUBTLE";
  color: string;
  score: number;
}> {
  const futures = boudins.filter((b) => !b.past && b.s > todayISO);
  const byMonth = new Map<string, ShortBoudin>();
  for (const b of futures) {
    const month = b.s.slice(0, 7);
    const existing = byMonth.get(month);
    if (!existing || b.sc > existing.sc) byMonth.set(month, b);
  }
  return Array.from(byMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, count)
    .map(([monthKey, b]) => ({
      monthKey,
      tier: tierFromScore(b.sc),
      color: b.col,
      score: b.sc,
    }));
}

/**
 * Find the next major window (score >= 3) within ~36 months.
 * Returns vague "month-to-month" boundary — not exact dates — so the visitor
 * gets a teaser without the actionable info that lives behind the paywall.
 */
function findNextMajorWindow(
  boudins: ShortBoudin[],
  todayISO: string,
): { startMonth: string; endMonth: string; planet: string; house: number | null; tier: "PEAK" | "CLEAR" } | null {
  const candidates = boudins
    .filter((b) => !b.past && b.s > todayISO && b.sc >= 3)
    .sort((a, b) => a.s.localeCompare(b.s));
  const next = candidates[0];
  if (!next) return null;
  const endISO = next.e ?? next.s;
  return {
    startMonth: next.s.slice(0, 7),
    endMonth: endISO.slice(0, 7),
    planet: planetKeyFromBoudin(next),
    house: typeof next.nh === "number" ? next.nh : null,
    tier: next.sc >= 3 ? "PEAK" : "CLEAR",
  };
}

/** Lifetime counts — past vs upcoming, by tier intensity. */
function buildLifetimeStats(boudins: ShortBoudin[], todayISO: string): {
  pastPeak: number;
  pastClear: number;
  upcomingPeak: number;
  upcomingClear: number;
  totalLifetime: number;
} {
  let pastPeak = 0;
  let pastClear = 0;
  let upcomingPeak = 0;
  let upcomingClear = 0;
  for (const b of boudins) {
    const isPast = b.past || (b.e ?? b.s) < todayISO;
    if (b.sc >= 3) {
      if (isPast) pastPeak++;
      else upcomingPeak++;
    } else if (b.sc === 2) {
      if (isPast) pastClear++;
      else upcomingClear++;
    }
  }
  return {
    pastPeak,
    pastClear,
    upcomingPeak,
    upcomingClear,
    totalLifetime: pastPeak + pastClear + upcomingPeak + upcomingClear,
  };
}

/**
 * Top 3 past peaks — recognizable memory hooks.
 * Returns year + planet + house so the visitor can recognize SPECIFIC
 * past periods (validation: "ah oui, 2019, j'ai changé de boulot").
 */
function findPastPeaks(boudins: ShortBoudin[], todayISO: string, count = 3): Array<{
  year: number;
  monthKey: string;
  planet: string;
  house: number | null;
  label: string;
  tier: "PEAK";
}> {
  const past = boudins
    .filter((b) => (b.past || (b.e ?? b.s) < todayISO) && b.sc >= 3)
    .sort((a, b) => {
      // Prioritize most recent + highest score
      if (b.sc !== a.sc) return b.sc - a.sc;
      return b.s.localeCompare(a.s);
    });

  // Pick 3 with year diversity (don't show 3 from the same year)
  const picked: typeof past = [];
  const usedYears = new Set<number>();
  for (const b of past) {
    const year = parseInt(b.s.slice(0, 4), 10);
    if (!usedYears.has(year)) {
      picked.push(b);
      usedYears.add(year);
      if (picked.length >= count) break;
    }
  }
  // Fill if we ran out of unique years
  if (picked.length < count) {
    for (const b of past) {
      if (!picked.includes(b)) {
        picked.push(b);
        if (picked.length >= count) break;
      }
    }
  }

  // Sort chronologically (oldest first → reads as a journey)
  picked.sort((a, b) => a.s.localeCompare(b.s));

  return picked.map((b) => ({
    year: parseInt(b.s.slice(0, 4), 10),
    monthKey: b.s.slice(0, 7),
    planet: planetKeyFromBoudin(b),
    house: typeof b.nh === "number" ? b.nh : null,
    label: b.lbl,
    tier: "PEAK" as const,
  }));
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

// ─── Route handler ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate-limit by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "rate_limited", message: "Trop de tentatives. Réessaie dans une minute." },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: {
    birthDate?: string;
    birthTime?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const { birthDate, birthTime, latitude, longitude, timezone } = body;
  if (
    !birthDate ||
    !birthTime ||
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !timezone
  ) {
    return NextResponse.json(
      { error: "missing_fields", message: "birthDate, birthTime, latitude, longitude, timezone are required" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Validate ranges
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || birthDate < "1900-01-01" || birthDate > new Date().toISOString().slice(0, 10)) {
    return NextResponse.json({ error: "invalid_birth_date" }, { status: 400 });
  }
  if (!/^\d{2}:\d{2}/.test(birthTime)) {
    return NextResponse.json({ error: "invalid_birth_time" }, { status: 400 });
  }

  const birthLog = logHash(`${birthDate}_${birthTime}_${latitude.toFixed(2)}_${longitude.toFixed(2)}`);
  console.log("[landing/signal] start", { birthLog, ipHash: logHash(ip) });

  const todayISO = new Date().toISOString().slice(0, 10);

  // ── Step 1: toctoc-app-short for the boudins list ──
  let boudins: ShortBoudin[] = [];
  try {
    const t0 = Date.now();
    const tocRes = await fetchWithTimeout(
      `${TOCTOC_BASE}/toctoc-app-short.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthTime, latitude, longitude, timezone }),
      },
      TOCTOC_TIMEOUT_MS,
    );
    if (!tocRes.ok) {
      console.warn("[landing/signal] toctoc not ok", { status: tocRes.status, birthLog });
      return NextResponse.json(
        { error: "toctoc_unavailable", fallback: "mock" },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    const tocJson = (await tocRes.json()) as TocTocAppShortBody;
    boudins = tocJson.data?.boudins ?? tocJson.boudins ?? [];
    console.log("[landing/signal] toctoc ok", { boudins: boudins.length, ms: Date.now() - t0, birthLog });
  } catch (err) {
    console.warn("[landing/signal] toctoc failed", err);
    return NextResponse.json(
      { error: "toctoc_unavailable", fallback: "mock" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (boudins.length === 0) {
    return NextResponse.json(
      { error: "no_data", fallback: "mock" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  // ── Step 2: pick the active boudin ──
  const active = findActiveBoudin(boudins, todayISO);
  if (!active) {
    return NextResponse.json(
      { error: "no_active_boudin", fallback: "mock" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  // ── Step 3: personalize via L2-cached endpoint (loopback) ──
  const baseUrl = req.nextUrl.origin;
  let delineation: Record<string, unknown> | null = null;
  let personalizeFromCache = false;
  try {
    const t0 = Date.now();
    const personRes = await fetchWithTimeout(
      `${baseUrl}/api/openai/personalize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Loopback marker — bypasses auth-required gate on personalize
          // since landing is intentionally anonymous (visitors not signed in).
          "x-unfold-internal": "1",
        },
        body: JSON.stringify({
          birthData: { birthDate, birthTime, latitude, longitude, timezone },
          boudinId: active.id,
        }),
      },
      PERSONALIZE_TIMEOUT_MS,
    );
    if (personRes.ok) {
      delineation = await personRes.json();
      // The personalize route logs CACHE HIT on its own; we infer from latency
      personalizeFromCache = Date.now() - t0 < 800;
      console.log("[landing/signal] personalize ok", {
        ms: Date.now() - t0,
        cached: personalizeFromCache,
        birthLog,
      });
    } else {
      console.warn("[landing/signal] personalize not ok", { status: personRes.status, birthLog });
    }
  } catch (err) {
    console.warn("[landing/signal] personalize failed", err);
    // Soft-fail — return the card without LLM text
  }

  // ── Step 4: build narrative payload (past hooks + present + future tease) ──
  const futureMonths = buildFutureMonths(boudins, todayISO, 12);
  const nextMajor = findNextMajorWindow(boudins, todayISO);
  const lifetime = buildLifetimeStats(boudins, todayISO);
  const pastPeaks = findPastPeaks(boudins, todayISO, 3);

  return NextResponse.json(
    {
      active: {
        boudinId: active.id,
        planet: planetKeyFromBoudin(active),
        house: typeof active.nh === "number" ? active.nh : null,
        tier: tierFromScore(active.sc),
        score: active.sc,
        color: active.col,
        label: active.lbl,
        category: active.cat,
        startDate: active.s,
        endDate: active.e ?? active.s,
        delineation,
      },
      nextMajor,
      lifetime,
      pastPeaks,
      futureMonths,
      fromCache: personalizeFromCache,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
