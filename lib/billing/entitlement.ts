/**
 * Server-side entitlement check.
 *
 * Returns the user's effective plan + active subscription window.
 * Single Supabase query against `subscriptions` with `idx_subs_user_active`
 * index — ~5ms p95. No in-memory cache (cross-pod inconsistency on Vercel
 * was flagged in eng review). If latency becomes an issue, move to
 * Vercel KV with `EXPIRE 300`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/db";
import type { Plan } from "./features";

export interface Entitlement {
  plan: Plan;
  status: "trialing" | "active" | "past_due" | "canceled" | "expired" | "none";
  source?: "stripe" | "apple" | "google";
  productId?: string;
  trialEnd?: string;
  currentPeriodEnd?: string;
}

const FREE: Entitlement = { plan: "free", status: "none" };

/**
 * Fetch the most-current active or trialing subscription for a user.
 * If multiple exist (e.g. user double-paid via Stripe + iOS), pick the
 * one with latest `version_timestamp`.
 */
export async function getEntitlement(userId: string | null | undefined): Promise<Entitlement> {
  if (!userId) return FREE;
  let supabase: SupabaseClient;
  try {
    supabase = getAdminClient();
  } catch {
    return FREE;                                // env missing — fail-closed
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, source, product_id, trial_end, current_period_end, version_timestamp")
    .eq("user_id", userId)
    .in("status", ["trialing", "active"])
    .order("version_timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return FREE;

  return {
    plan: "premium",
    status: data.status,
    source: data.source,
    productId: data.product_id,
    trialEnd: data.trial_end ?? undefined,
    currentPeriodEnd: data.current_period_end ?? undefined,
  };
}

/** Convenience boolean. */
export async function isPremium(userId: string | null | undefined): Promise<boolean> {
  const ent = await getEntitlement(userId);
  return ent.plan === "premium";
}
