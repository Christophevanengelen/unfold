/**
 * Server-side feature + quota enforcement.
 *
 * Used in API routes to gate paid features. Throws typed errors that
 * route handlers convert to 402 / 429 responses with structured payloads
 * the client renders as the upgrade teaser.
 */

import { getAdminClient } from "@/lib/db";
import { FEATURES, weekStart, monthStart, type FeatureKey } from "./features";
import { getEntitlement } from "./entitlement";

// ─── Typed errors ────────────────────────────────────────────────

export class RequiresPlanError extends Error {
  readonly status = 402;
  readonly code = "requires_plan";
  constructor(public feature: FeatureKey) {
    super(`Feature ${feature} requires premium`);
  }
  toJSON() {
    return {
      error: this.code,
      feature: this.feature,
      message: FEATURES[this.feature].label,
    };
  }
}

export class QuotaExceededError extends Error {
  readonly status = 429;
  readonly code = "quota_exceeded";
  constructor(
    public feature: FeatureKey,
    public count: number,
    public limit: number,
    public period: "week" | "month",
  ) {
    super(`Quota ${feature} ${count}/${limit} ${period}`);
  }
  toJSON() {
    return {
      error: this.code,
      feature: this.feature,
      count: this.count,
      limit: this.limit,
      period: this.period,
      message: `Limite ${FEATURES[this.feature].label.toLowerCase()} atteinte`,
    };
  }
}

// ─── enforceFeature: throws RequiresPlanError if free user hits paid feature ─

export async function enforceFeature(
  userId: string | null | undefined,
  feature: FeatureKey,
): Promise<void> {
  const spec = FEATURES[feature];
  // Unlimited-free features always pass
  if (spec.freeQuota === -1) return;
  // Quota-bound features handled by enforceQuota separately
  if (spec.freeQuota > 0) return;

  // Pure paid feature — must be premium
  const ent = await getEntitlement(userId ?? null);
  if (ent.plan !== "premium") {
    throw new RequiresPlanError(feature);
  }
}

// ─── enforceQuota: atomic increment + check ─────────────────────────

export async function enforceQuota(
  userId: string,
  feature: FeatureKey,
): Promise<{ count: number; limit: number; isPremium: boolean }> {
  const spec = FEATURES[feature];
  if (spec.freeQuota === -1 || !spec.period) {
    // No quota to enforce
    return { count: 0, limit: -1, isPremium: false };
  }

  const ent = await getEntitlement(userId);
  if (ent.plan === "premium") {
    // Premium users still tracked for analytics, but no limit
    await incrementCounter(userId, feature, spec.period);
    return { count: 0, limit: -1, isPremium: true };
  }

  // Free user — atomic increment
  const count = await incrementCounter(userId, feature, spec.period);
  if (count > spec.freeQuota) {
    throw new QuotaExceededError(feature, count, spec.freeQuota, spec.period);
  }
  return { count, limit: spec.freeQuota, isPremium: false };
}

async function incrementCounter(
  userId: string,
  feature: FeatureKey,
  period: "week" | "month",
): Promise<number> {
  const supabase = getAdminClient();
  const periodStart = (period === "week" ? weekStart() : monthStart()).toISOString();

  const { data, error } = await supabase
    .rpc("increment_usage_counter", {
      p_user_id: userId,
      p_feature: feature,
      p_period_start: periodStart,
    });

  if (error || typeof data !== "number") {
    // Fallback: raw upsert if RPC not deployed yet (Phase 1 may not have RPC)
    const { data: existing } = await supabase
      .from("usage_counters")
      .select("count")
      .eq("user_id", userId)
      .eq("feature", feature)
      .eq("period_start", periodStart)
      .maybeSingle();
    const newCount = (existing?.count ?? 0) + 1;
    await supabase
      .from("usage_counters")
      .upsert(
        { user_id: userId, feature, period_start: periodStart, count: newCount },
        { onConflict: "user_id,feature,period_start" },
      );
    return newCount;
  }
  return data;
}
