/**
 * AI budget guard — durable bounds on every route that spends the OpenAI key.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Every `/api/openai/*` route bills a single personal OpenAI key. The repo is
 * public, so the paths are known. A bound that lives in process memory is not
 * a bound: on Vercel each lambda instance keeps its own `Map` and loses it on
 * cold start, so a `new Map()` limiter caps nothing across the fleet. That
 * exact trap is documented at the top of lib/billing/entitlement.ts. Counters
 * therefore live in Postgres (supabase/008_ai_guard.sql).
 *
 * THREE LAYERS, LISTED BY HOW MUCH THEY REALLY PROTECT THE BILL
 * -------------------------------------------------------------
 *  1. GLOBAL per day    — the only hard ceiling. An attacker can rotate
 *                         cookies and IP addresses; they cannot rotate this.
 *  2. PER IP per hour   — stops one machine from looping.
 *  3. PER CALLER per day — signed-in user id when there is one, otherwise an
 *                         anonymous session id we mint server-side and sign.
 *                         Honest caveat: an anonymous caller who throws the
 *                         cookie away gets a fresh bucket, so this layer shapes
 *                         normal usage; layers 1 and 2 are what stop abuse.
 *
 * WHY A SERVER-MINTED SESSION COOKIE AND NOT A PAYWALL
 * ----------------------------------------------------
 * v1 ships free. The goal is to bound, not to sell. Requiring an account would
 * kill the landing and the demo, and lib/device-id.ts is a localStorage value
 * the client chooses, so it identifies nothing on the server. An HttpOnly
 * cookie carrying `uuid.hmac(uuid)` is the cheapest thing that (a) survives
 * across instances, (b) cannot be forged into someone else's bucket, and
 * (c) needs no sign-up.
 *
 * FAIL-CLOSED
 * -----------
 * If the counter store is unreachable the request is refused (503) instead of
 * being let through unmetered. `AI_GUARD_DISABLED=true` skips the guard and is
 * honoured only outside production.
 */

import crypto from "crypto";
import type { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/billing/auth-helper";

// ─── Configuration ───────────────────────────────────────────────

/** Cookie holding the anonymous caller id. HttpOnly, never read by JS. */
export const AI_SESSION_COOKIE = "fd_ai_sid";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const COOKIE_MAX_AGE_S = 365 * 24 * 60 * 60;

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Limits. All overridable from Vercel without touching the code. */
export function aiGuardLimits() {
  return {
    callerPerDay: intEnv("AI_LIMIT_CALLER_PER_DAY", 20),
    ipPerHour: intEnv("AI_LIMIT_IP_PER_HOUR", 30),
    globalPerDay: intEnv("AI_LIMIT_GLOBAL_PER_DAY", 2000),
  };
}

/**
 * HMAC key. `API_SESSION_SECRET` when set, otherwise the Supabase service-role
 * key, which is already required for the counters and never leaves the server.
 * Nothing here is ever sent to the client in clear.
 */
function guardSecret(): string | null {
  return (
    process.env.API_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    null
  );
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function guardDisabled(): boolean {
  return !isProduction() && process.env.AI_GUARD_DISABLED === "true";
}

// ─── Typed errors ────────────────────────────────────────────────

export class AiBudgetError extends Error {
  readonly status = 429;
  readonly code = "ai_budget_exceeded";
  constructor(
    public scope: "caller" | "ip" | "global",
    public retryAfterSeconds: number,
  ) {
    super(`AI budget exceeded (${scope})`);
  }
  toJSON() {
    return {
      error: this.code,
      scope: this.scope,
      retryAfter: this.retryAfterSeconds,
      // User-facing wording stays out of here on purpose: the client renders
      // its own translated message. See lib/i18n-demo.ts.
      message: "ai_budget_exceeded",
    };
  }
}

export class AiGuardUnavailableError extends Error {
  readonly status = 503;
  readonly code = "ai_guard_unavailable";
  constructor(public reason: string) {
    super(`AI guard unavailable: ${reason}`);
  }
  toJSON() {
    return { error: this.code, message: "ai_guard_unavailable" };
  }
}

// ─── Signing helpers ─────────────────────────────────────────────

function hmac(value: string, key: string): string {
  return crypto.createHmac("sha256", key).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** One-way, keyed digest. Keeps raw IPs out of the database (GDPR). */
function digest(value: string, key: string): string {
  return crypto.createHmac("sha256", key).update(value).digest("hex").slice(0, 32);
}

// ─── Caller identity ─────────────────────────────────────────────

function readCookie(req: NextRequest, name: string): string | null {
  // NextRequest exposes a parsed cookie jar; fall back to the raw header so
  // this helper also works when the route is reached through a plain Request.
  const fromJar = req.cookies?.get?.(name)?.value;
  if (fromJar) return fromJar;
  const raw = req.headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function verifySessionCookie(value: string, key: string): string | null {
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!/^[0-9a-f-]{16,64}$/i.test(id)) return null;
  return safeEqual(sig, hmac(id, key)) ? id : null;
}

function mintSessionCookie(key: string): { id: string; value: string } {
  const id = crypto.randomUUID();
  return { id, value: `${id}.${hmac(id, key)}` };
}

function serializeCookie(value: string): string {
  const secure = isProduction();
  // SameSite=None is required for the Capacitor WebView, which reaches the API
  // cross-origin. None demands Secure, which we cannot use on http://localhost,
  // hence the dev fallback to Lax.
  const sameSite = secure ? "None" : "Lax";
  return [
    `${AI_SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${sameSite}`,
    secure ? "Secure" : "",
    `Max-Age=${COOKIE_MAX_AGE_S}`,
  ]
    .filter(Boolean)
    .join("; ");
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

// ─── Durable counter ─────────────────────────────────────────────

function dayStart(now = new Date()): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function hourStart(now = new Date()): Date {
  const d = new Date(now);
  d.setUTCMinutes(0, 0, 0);
  return d;
}

/**
 * Atomic increment, returns the post-increment count.
 * Throws AiGuardUnavailableError when the store cannot be reached, so the
 * caller fails closed instead of silently running unmetered.
 */
async function increment(
  scope: "caller" | "ip" | "global",
  subject: string,
  bucket: string,
  windowStart: Date,
): Promise<number> {
  let supabase;
  try {
    supabase = getAdminClient();
  } catch {
    throw new AiGuardUnavailableError("supabase env missing");
  }

  const iso = windowStart.toISOString();

  const { data, error } = await supabase.rpc("increment_ai_usage", {
    p_scope: scope,
    p_subject: subject,
    p_bucket: bucket,
    p_window_start: iso,
  });
  if (!error && typeof data === "number") return data;

  // Fallback for a deployment where 008_ai_guard.sql created the table but the
  // function is not there yet. Read-then-write: slightly racy under heavy
  // concurrency, which can only undercount by a hair, never unbound.
  const { data: existing, error: readErr } = await supabase
    .from("ai_usage_counters")
    .select("count")
    .eq("scope", scope)
    .eq("subject", subject)
    .eq("bucket", bucket)
    .eq("window_start", iso)
    .maybeSingle();
  if (readErr) throw new AiGuardUnavailableError(readErr.message);

  const next = (existing?.count ?? 0) + 1;
  const { error: writeErr } = await supabase
    .from("ai_usage_counters")
    .upsert(
      {
        scope,
        subject,
        bucket,
        window_start: iso,
        count: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "scope,subject,bucket,window_start" },
    );
  if (writeErr) throw new AiGuardUnavailableError(writeErr.message);
  return next;
}

// ─── Public API ──────────────────────────────────────────────────

export interface AiGuardResult {
  /** "user" when a Supabase session was resolved, "session" for the cookie. */
  callerKind: "user" | "session";
  /** Opaque identity used as the counter subject. Never a raw IP. */
  callerKey: string;
  /** Set-Cookie value to append to the response, when a cookie was minted. */
  setCookie?: string;
  /** Post-increment counts, handy for logging. */
  counts: { caller: number; ip: number; global: number };
}

/**
 * Bound one request that is about to spend the OpenAI key.
 * Call it AFTER input validation and BEFORE any outbound call, cache read
 * included, so a rejected request costs nothing downstream.
 *
 * @throws AiBudgetError            429, one of the three layers is full
 * @throws AiGuardUnavailableError  503, counters unreachable (fail-closed)
 */
export async function enforceAiBudget(
  req: NextRequest,
  bucket = "openai",
): Promise<AiGuardResult> {
  if (guardDisabled()) {
    return {
      callerKind: "session",
      callerKey: "dev-bypass",
      counts: { caller: 0, ip: 0, global: 0 },
    };
  }

  const key = guardSecret();
  if (!key) throw new AiGuardUnavailableError("no signing secret configured");

  const limits = aiGuardLimits();
  const now = new Date();
  const day = dayStart(now);
  const hour = hourStart(now);

  // ── Identity ──
  let callerKind: "user" | "session" = "session";
  let callerKey: string;
  let setCookie: string | undefined;

  const userId = await getUserIdFromRequest(req);
  if (userId) {
    callerKind = "user";
    callerKey = `u:${userId}`;
  } else {
    const raw = readCookie(req, AI_SESSION_COOKIE);
    const verified = raw ? verifySessionCookie(raw, key) : null;
    if (verified) {
      callerKey = `s:${verified}`;
    } else {
      const minted = mintSessionCookie(key);
      callerKey = `s:${minted.id}`;
      setCookie = serializeCookie(minted.value);
    }
  }

  // ── Layer 3: per caller, per day ──
  const callerCount = await increment("caller", callerKey, bucket, day);
  if (callerCount > limits.callerPerDay) {
    throw new AiBudgetError("caller", secondsUntil(day.getTime() + DAY_MS, now));
  }

  // ── Layer 2: per IP, per hour ──
  const ipCount = await increment("ip", digest(clientIp(req), key), bucket, hour);
  if (ipCount > limits.ipPerHour) {
    throw new AiBudgetError("ip", secondsUntil(hour.getTime() + HOUR_MS, now));
  }

  // ── Layer 1: global, per day — the actual ceiling on the bill ──
  const globalCount = await increment("global", "all", bucket, day);
  if (globalCount > limits.globalPerDay) {
    console.error("[ai-guard] GLOBAL DAILY CEILING REACHED", {
      bucket,
      count: globalCount,
      limit: limits.globalPerDay,
    });
    throw new AiBudgetError("global", secondsUntil(day.getTime() + DAY_MS, now));
  }

  return {
    callerKind,
    callerKey,
    setCookie,
    counts: { caller: callerCount, ip: ipCount, global: globalCount },
  };
}

function secondsUntil(targetMs: number, now: Date): number {
  return Math.max(1, Math.ceil((targetMs - now.getTime()) / 1000));
}

/**
 * Attach the minted session cookie to any outgoing response.
 * Safe to call with an undefined guard (error paths) and with a plain
 * `Response`, which is what the streaming personalize route returns.
 */
export function applyGuardCookie<T extends Response>(
  guard: AiGuardResult | undefined,
  res: T,
): T {
  if (guard?.setCookie) res.headers.append("Set-Cookie", guard.setCookie);
  return res;
}

/** Headers to return alongside a 429 so clients can back off politely. */
export function budgetErrorHeaders(err: AiBudgetError): Record<string, string> {
  return {
    "Retry-After": String(err.retryAfterSeconds),
    "Cache-Control": "no-store",
  };
}
