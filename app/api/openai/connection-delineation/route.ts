/**
 * POST /api/openai/connection-delineation
 *
 * Sends one ActivePeriod's raw astrological data to OpenAI using
 * connection-prompt.md as the system prompt.
 * Returns structured ConnectionDelineation JSON.
 *
 * Two-tier cache:
 *   L1 = client IndexedDB (7d TTL)      — see lib/connection-delineation.ts
 *   L2 = Supabase delineation_cache     — shared across devices/users
 *
 * Cache key (order-independent for the pair):
 *   birth_hash   = sorted(md5(A|time|lat|lng), md5(B|time|lat|lng)).join("_")
 *   boudin_id    = "couple_{relationship}_{monthKey}_v{PROMPT_VERSION}"
 *   profile_hash = "v1" (reserved for mood/priorities injection)
 */

import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { supabase } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/billing/auth-helper";
import { enforceFeature, enforceQuota, RequiresPlanError, QuotaExceededError } from "@/lib/billing/enforce";
import { corsPreflightResponse } from "@/lib/cors";

export const runtime = "nodejs";

export function OPTIONS(req: NextRequest) { return corsPreflightResponse(req); }

// ─── Load system prompt ────────────────────────────────────
// Extract just the "SYSTEM PROMPT" code block from the markdown file.

function loadSystemPrompt(): string {
  const raw = readFileSync(
    join(process.cwd(), "connection-prompt.md"),
    "utf-8",
  );
  const match = raw.match(/## SYSTEM PROMPT\s*\n```[^\n]*\n([\s\S]*?)\n```/);
  if (match?.[1]) return match[1].trim();
  return raw
    .replace(/^#+\s.*$/gm, "")
    .replace(/```[\s\S]*?```/gm, "")
    .trim();
}

// ─── Constants ────────────────────────────────────────────

const OPENAI_MODEL = "gpt-4o";

/** Bump when connection-prompt.md rules change meaningfully (invalidates all cached couple delineations). */
const PROMPT_VERSION = "v1";

// ─── L2 Cache helpers ─────────────────────────────────────

interface PayloadPerson {
  birthDate: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
  primarySignal?: unknown;
  rawData?: {
    events?: Array<{ date?: string | null }>;
  };
}

function normalizeTime(t: string | undefined): string {
  if (!t) return "00:00";
  // Accept "HH:mm" or "HH:mm:ss" — collapse to HH:mm
  return t.slice(0, 5);
}

/**
 * Make a per-person identity hash. We avoid md5 deps and rely on a stable
 * string — cheaper and enough for hash-key equality across devices.
 */
function personHash(bd: { birthDate: string; birthTime: string }, lat?: number, lng?: number): string {
  const latStr = typeof lat === "number" ? lat.toFixed(2) : "??";
  const lngStr = typeof lng === "number" ? lng.toFixed(2) : "??";
  return `${bd.birthDate}_${normalizeTime(bd.birthTime)}_${latStr}_${lngStr}`;
}

/** Compose the order-independent pair hash. Sorted so (A,B) === (B,A). */
function pairHash(a: string, b: string): string {
  return [a, b].sort().join("|");
}

function boudinIdFor(relationship: string, monthKey: string): string {
  return `couple_${relationship}_${monthKey}_${PROMPT_VERSION}`;
}

async function getCachedDelineation(
  birthHash: string,
  boudinId: string,
  profileHash: string,
) {
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
    console.log("[connection-delineation] CACHE HIT", boudinId);
    return data.delineation as Record<string, unknown>;
  } catch {
    return null;
  }
}

function cacheDelineation(
  birthHash: string,
  boudinId: string,
  profileHash: string,
  delineation: Record<string, unknown>,
): void {
  if (!supabase) return;
  supabase
    .from("delineation_cache")
    .upsert(
      {
        birth_hash: birthHash,
        boudin_id: boudinId,
        profile_hash: profileHash,
        delineation,
        model: OPENAI_MODEL,
      },
      { onConflict: "birth_hash,boudin_id,profile_hash" },
    )
    .then(({ error }) => {
      if (error) console.warn("[connection-delineation] CACHE WRITE failed:", error.message);
      else console.log("[connection-delineation] CACHE WRITE ok", boudinId);
    });
}

// ─── Route handler ─────────────────────────────────────────

interface RequestBody {
  relationship?: string;
  monthKey?: string;
  personA?: PayloadPerson;
  personB?: PayloadPerson;
  [k: string]: unknown;
}

export async function POST(req: NextRequest) {
  const SYSTEM_PROMPT = loadSystemPrompt();
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 },
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // ── BILLING GATE: must run BEFORE cache return AND BEFORE OpenAI call.
  //    Connection delineation is gated on:
  //      1) future months (FUTURE_CAPSULES feature, premium-only)
  //      2) AI quota (1/week free, unlimited paid)
  const userId = await getUserIdFromRequest(req);
  const isInternalLandingCall = req.headers.get("x-unfold-internal") === "1";
  if (!userId && !isInternalLandingCall) {
    return NextResponse.json(
      { error: "auth_required", message: "Connecte-toi pour accéder à la délinéation IA." },
      { status: 401 },
    );
  }
  if (userId) {
    const monthKeyStr = String(body.monthKey ?? "");
    const todayMonth = new Date().toISOString().slice(0, 7);
    const isFuture = monthKeyStr > todayMonth;
    try {
      if (isFuture) {
        await enforceFeature(userId, "FUTURE_CAPSULES");
      }
      await enforceQuota(userId, "AI_DELINEATION");
    } catch (err) {
      if (err instanceof RequiresPlanError) {
        return NextResponse.json(err.toJSON(), { status: err.status });
      }
      if (err instanceof QuotaExceededError) {
        return NextResponse.json(err.toJSON(), { status: err.status });
      }
      throw err;
    }
  }

  // ── L2 Cache check ──
  // We hash the pair using lat/lng from the caller's payload if present.
  // The client (lib/connection-delineation.ts) doesn't send lat/lng today — we
  // fall back to birthDate+birthTime only, which is a weaker but still correct
  // identity for cache (same birth chart = same delineation).
  const relationship = body.relationship ?? "partner";
  const monthKey = body.monthKey ?? "0000-00";
  let birthHash: string | null = null;
  if (body.personA?.birthDate && body.personB?.birthDate) {
    const a = personHash(
      { birthDate: body.personA.birthDate, birthTime: String(body.personA.birthTime ?? "") },
      body.personA.latitude,
      body.personA.longitude,
    );
    const b = personHash(
      { birthDate: body.personB.birthDate, birthTime: String(body.personB.birthTime ?? "") },
      body.personB.latitude,
      body.personB.longitude,
    );
    birthHash = pairHash(a, b);
  }
  const boudinId = boudinIdFor(relationship, monthKey);
  const profileHash = "v1"; // reserved for future mood injection

  if (birthHash) {
    const cached = await getCachedDelineation(birthHash, boudinId, profileHash);
    if (cached) return NextResponse.json(cached);
  }

  // ── OpenAI call (cache miss) ──
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      max_tokens: 1200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(body) },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.json().catch(() => ({}));
    console.error("[connection-delineation] OpenAI error:", openaiRes.status, err);
    return NextResponse.json(
      { error: "OpenAI API error", status: openaiRes.status },
      { status: 502 },
    );
  }

  const result = await openaiRes.json();
  const text = result.choices?.[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    // Fire-and-forget cache write (doesn't block response)
    if (birthHash) cacheDelineation(birthHash, boudinId, profileHash, parsed);
    return NextResponse.json(parsed);
  } catch {
    console.error(
      "[connection-delineation] Failed to parse OpenAI response:",
      text.slice(0, 200),
    );
    return NextResponse.json(
      { error: "Invalid LLM response" },
      { status: 500 },
    );
  }
}
