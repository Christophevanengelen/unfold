import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

const BASE_URL = "https://ai.zebrapad.io/full-suite-spiritual-api";

// ─── connection-brief cache ──────────────────────────────
// Transits move slowly; same pair on same target_month = same raw brief.
// 24h TTL is plenty (cache miss once a day, not once per click).

const BRIEF_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function normalizeTime(t: unknown): string {
  return typeof t === "string" ? t.slice(0, 5) : "00:00";
}

function personKey(p: { birthDate?: string; birthTime?: string; latitude?: number; longitude?: number }): string {
  const lat = typeof p.latitude === "number" ? p.latitude.toFixed(2) : "??";
  const lng = typeof p.longitude === "number" ? p.longitude.toFixed(2) : "??";
  return `${p.birthDate ?? ""}_${normalizeTime(p.birthTime)}_${lat}_${lng}`;
}

function pairKey(a: object, b: object): string {
  return [personKey(a), personKey(b)].sort().join("|");
}

function getTargetMonth(targetDate: unknown): string {
  if (typeof targetDate === "string" && targetDate.length >= 7) {
    return targetDate.slice(0, 7); // "YYYY-MM"
  }
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

async function getCachedBrief(pairHash: string, targetMonth: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("connection_cache")
      .select("brief, created_at")
      .eq("pair_hash", pairHash)
      .eq("target_month", targetMonth)
      .single();
    if (error || !data) return null;
    const ageMs = Date.now() - new Date(data.created_at).getTime();
    if (ageMs > BRIEF_CACHE_TTL_MS) return null; // stale
    console.log("[toctoc] connection-brief CACHE HIT");
    return data.brief as unknown;
  } catch {
    return null;
  }
}

function cacheBrief(pairHash: string, targetMonth: string, brief: unknown): void {
  if (!supabase) return;
  supabase
    .from("connection_cache")
    .upsert(
      { pair_hash: pairHash, target_month: targetMonth, brief, created_at: new Date().toISOString() },
      { onConflict: "pair_hash,target_month" },
    )
    .then(({ error }) => {
      if (error) console.warn("[toctoc] CACHE WRITE failed:", error.message);
      else console.log("[toctoc] CACHE WRITE ok");
    });
}

// ─── Route handler ───────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint = "toctoc-year", ...payload } = body;

    const allowedEndpoints = [
      "toctoc",
      "toctoc-app",
      "toctoc-app-short",
      "toctoc-year",
      "toctoc-timeline",
      "connection-brief",
    ];
    if (!allowedEndpoints.includes(endpoint)) {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    // ── Cache check for connection-brief only ──
    let cacheKey: { pair: string; month: string } | null = null;
    if (endpoint === "connection-brief" && payload.personA && payload.personB) {
      const pair = pairKey(payload.personA, payload.personB);
      const month = getTargetMonth(payload.targetDate);
      cacheKey = { pair, month };
      const cached = await getCachedBrief(pair, month);
      if (cached) {
        // Wrap like the fresh-fetch path: the client expects {success, data, timestamp}
        return NextResponse.json(cached);
      }
    }

    const res = await fetch(`${BASE_URL}/${endpoint}.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // Fire-and-forget cache write
    if (cacheKey && res.ok) {
      cacheBrief(cacheKey.pair, cacheKey.month, data);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "API request failed", details: String(error) },
      { status: 500 },
    );
  }
}
