/**
 * Signed loopback marker for server-to-server calls inside the deployment.
 *
 * The problem it replaces: `/api/openai/personalize` and
 * `/api/openai/connection-delineation` used to accept the literal header
 * `x-unfold-internal: 1` as proof that the caller was our own landing route,
 * and skipped the auth gate on that basis. Anyone can send a header. The gate
 * was therefore decorative: both "protected" routes were reachable without an
 * account by adding one line to a curl command.
 *
 * The marker is now `<unix-seconds>.<hmac>`, signed server-side and valid for
 * a short window. It proves the call came from code holding the server secret.
 * It does NOT grant unlimited spend: the entry point that emits it
 * (/api/landing/signal) runs the AI budget guard first, so the loopback call
 * is already accounted for and skips a second count.
 */

import crypto from "crypto";
import type { NextRequest } from "next/server";

export const INTERNAL_HEADER = "x-unfold-internal";

/** Tolerated clock skew between the two lambdas, in seconds. */
const MAX_AGE_S = 300;

function internalSecret(): string | null {
  return (
    process.env.INTERNAL_CALL_SECRET ||
    process.env.API_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    null
  );
}

function sign(payload: string, key: string): string {
  return crypto.createHmac("sha256", key).update(payload).digest("base64url");
}

/** Header value for a loopback call, or null when no secret is configured. */
export function internalCallToken(): string | null {
  const key = internalSecret();
  if (!key) return null;
  const ts = Math.floor(Date.now() / 1000).toString();
  return `${ts}.${sign(ts, key)}`;
}

/** Headers object ready to spread into a loopback fetch. */
export function internalCallHeaders(): Record<string, string> {
  const token = internalCallToken();
  return token ? { [INTERNAL_HEADER]: token } : {};
}

/** True only for a call carrying a fresh, correctly signed marker. */
export function isInternalCall(req: NextRequest): boolean {
  const key = internalSecret();
  if (!key) return false;

  const raw = req.headers.get(INTERNAL_HEADER);
  if (!raw) return false;

  const dot = raw.indexOf(".");
  if (dot <= 0) return false;

  const ts = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!/^\d{1,12}$/.test(ts)) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(ts));
  if (age > MAX_AGE_S) return false;

  const expected = sign(ts, key);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
