import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, getUserFromBearer } from "@/lib/db";
import { corsPreflightResponse } from "@/lib/cors";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * POST /api/profile/forget
 * GDPR right-to-be-forgotten (Article 17 GDPR).
 *
 * Two modes:
 *
 * 1. AUTHENTICATED (with Authorization: Bearer <jwt>)
 *    Full account deletion:
 *    - Cancel + delete Stripe customer (if configured)
 *    - Delete subscriptions + billing_events rows
 *    - Delete usage_counters rows
 *    - Delete profiles row
 *    - Delete auth.users row (via service role)
 *    - Purge delineation_cache + connection_cache tied to birth hash
 *    - Log to gdpr_deletions audit table
 *
 * 2. UNAUTHENTICATED (cache-only)
 *    Legacy: purge delineation_cache + connection_cache by birthHash.
 *    Provide either { birthHash } or { birthDate, birthTime?, latitude?, longitude? }.
 *
 * Always idempotent. Missing resources (already deleted) are treated as success.
 */

export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// ─── Helpers ──────────────────────────────────────────────

interface BirthInput {
  birthDate?: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
}

function makeBirthHash(b: BirthInput): string {
  const date = b.birthDate ?? "";
  const time = (b.birthTime ?? "").slice(0, 5) || "00:00";
  const lat = typeof b.latitude === "number" ? b.latitude.toFixed(2) : "??";
  const lng = typeof b.longitude === "number" ? b.longitude.toFixed(2) : "??";
  return `${date}_${time}_${lat}_${lng}`;
}

function logHash(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex").slice(0, 8);
}

/** Cancel all active Stripe subscriptions + delete customer. Graceful no-op if key missing. */
async function purgeStripe(externalCustomerId: string | null): Promise<string[]> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !externalCustomerId) return [];

  const { getStripe } = await import("@/lib/billing/stripe");
  const stripe = getStripe();
  const actions: string[] = [];

  try {
    // Cancel any active subscriptions
    const subs = await stripe.subscriptions.list({
      customer: externalCustomerId,
      status: "active",
      limit: 10,
    });
    for (const sub of subs.data) {
      await stripe.subscriptions.cancel(sub.id);
      actions.push(`stripe:sub:${sub.id}`);
    }
    // Delete the customer (removes all payment methods, invoices, etc.)
    await stripe.customers.del(externalCustomerId);
    actions.push(`stripe:customer:${externalCustomerId}`);
  } catch (err) {
    console.warn("[profile/forget] Stripe purge partial:", err);
  }

  return actions;
}

/** Delete RevenueCat subscriber. Graceful no-op if key missing. */
async function purgeRevenueCat(appUserId: string): Promise<string[]> {
  const key = process.env.REVENUECAT_API_KEY;
  if (!key) return [];

  try {
    const resp = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (resp.ok || resp.status === 404) {
      return [`revenuecat:subscriber:${appUserId}`];
    }
    console.warn("[profile/forget] RevenueCat delete status:", resp.status);
    return [];
  } catch (err) {
    console.warn("[profile/forget] RevenueCat purge error:", err);
    return [];
  }
}

// ─── Route handler ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  const admin = getAdminClient();

  // ── Try to resolve authenticated user ───────────────────
  const authHeader = req.headers.get("authorization");
  const authUser = await getUserFromBearer(authHeader);

  // ── Parse body ──────────────────────────────────────────
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  let birthHash: string | undefined =
    typeof body?.birthHash === "string" ? body.birthHash : undefined;
  if (!birthHash && body?.birthDate) {
    birthHash = makeBirthHash(body as BirthInput);
  }

  const deletedResources: string[] = [];
  const result: Record<string, number | string> = {};

  try {
    // ── AUTHENTICATED: full account deletion ──────────────
    if (authUser) {
      const userId = authUser.id;
      const userEmail = authUser.email ?? "unknown";

      // 1. Get profile to find birth hash and Stripe customer ID
      const { data: profile } = await admin
        .from("profiles")
        .select("birth_date, birth_time, latitude, longitude")
        .eq("auth_user_id", userId)
        .maybeSingle();

      // Derive birth hash from profile if not provided in body
      if (!birthHash && profile?.birth_date) {
        birthHash = makeBirthHash({
          birthDate: profile.birth_date,
          birthTime: profile.birth_time,
          latitude: profile.latitude,
          longitude: profile.longitude,
        });
      }

      // 2. Get Stripe customer IDs from subscriptions table
      const { data: subs } = await admin
        .from("subscriptions")
        .select("source, external_customer_id, external_subscription_id")
        .eq("user_id", userId);

      const stripeCustomerId = subs?.find(s => s.source === "stripe")?.external_customer_id ?? null;
      const rcAppUserId = userId; // RevenueCat uses Supabase user ID as app_user_id

      // 3. Purge Stripe (cancel subs + delete customer)
      const stripeActions = await purgeStripe(stripeCustomerId);
      deletedResources.push(...stripeActions);

      // 4. Purge RevenueCat
      const rcActions = await purgeRevenueCat(rcAppUserId);
      deletedResources.push(...rcActions);

      // 5. Delete billing rows
      const { count: subCount } = await admin
        .from("subscriptions")
        .delete({ count: "exact" })
        .eq("user_id", userId);
      if (typeof subCount === "number") result.subscriptions = subCount;

      const { count: evtCount } = await admin
        .from("billing_events")
        .delete({ count: "exact" })
        .eq("user_id", userId);
      if (typeof evtCount === "number") result.billing_events = evtCount;

      // 6. Delete usage counters
      const { count: usageCount } = await admin
        .from("usage_counters")
        .delete({ count: "exact" })
        .eq("user_id", userId);
      if (typeof usageCount === "number") result.usage_counters = usageCount;

      // 7. Delete profile
      const { count: profileCount } = await admin
        .from("profiles")
        .delete({ count: "exact" })
        .eq("auth_user_id", userId);
      if (typeof profileCount === "number") result.profiles = profileCount;

      // 8. Delete auth user (must be last — removes JWT validity)
      const { error: authErr } = await admin.auth.admin.deleteUser(userId);
      if (authErr) {
        console.warn("[profile/forget] auth.deleteUser warning:", authErr.message);
      } else {
        deletedResources.push(`auth:user:${logHash(userId)}`);
      }

      // 9. Audit log (non-blocking, fire-and-forget)
      admin
        .from("gdpr_deletions")
        .insert({
          user_id: userId,
          email: userEmail,
          deleted_by: "self",
          resources: deletedResources,
        })
        .then(({ error }) => {
          if (error) console.warn("[profile/forget] gdpr audit log failed:", error.message);
        });

      console.log("[profile/forget] full account delete", {
        userHash: logHash(userId),
        resources: deletedResources,
      });
    }

    // ── Cache purge (both modes) ──────────────────────────
    if (birthHash) {
      // delineation_cache — exact
      const { count: delExact } = await admin
        .from("delineation_cache")
        .delete({ count: "exact" })
        .eq("birth_hash", birthHash);
      // delineation_cache — partial (couple pairs)
      const { count: delLike } = await admin
        .from("delineation_cache")
        .delete({ count: "exact" })
        .like("birth_hash", `%${birthHash}%`);
      result.delineation_cache = (delExact ?? 0) + (delLike ?? 0);

      // connection_cache
      const { count: connCount } = await admin
        .from("connection_cache")
        .delete({ count: "exact" })
        .like("pair_hash", `%${birthHash}%`);
      result.connection_cache = connCount ?? 0;

      console.log("[profile/forget] cache purge", {
        birthHashLog: logHash(birthHash),
        delineation: result.delineation_cache,
        connections: result.connection_cache,
      });
    } else if (!authUser) {
      // Unauthenticated + no birth hash = bad request
      return NextResponse.json(
        { error: "Provide Authorization header OR birthHash / birthDate in body" },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, deleted: result });
  } catch (err) {
    console.error("[profile/forget] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
