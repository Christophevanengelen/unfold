/**
 * Resolve the authenticated user from an incoming request.
 *
 * Two paths supported:
 *  1. Bearer JWT in Authorization header (mobile / cross-origin)
 *  2. Supabase cookie session (web / same-origin)
 *
 * Returns null when both fail — caller decides whether to 401 or
 * fall back to anonymous (e.g. landing /api/landing/signal route is
 * intentionally anonymous).
 */

import type { NextRequest } from "next/server";
import { getUserFromBearer } from "@/lib/db";

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  // 1) Bearer token (mobile)
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const user = await getUserFromBearer(auth);
    if (user) return user.id;
  }

  // 2) Supabase cookie session (web)
  try {
    const { getUserClient } = await import("@/lib/db");
    const supabase = await getUserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user.id;
  } catch {
    // Cookie context not available (or anon key missing) — fall through
  }

  return null;
}
