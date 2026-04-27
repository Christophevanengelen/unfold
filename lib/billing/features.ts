/**
 * Billing features definitions — single source of truth shared between
 * client (UI gates / paywall copy) and server (enforcement).
 *
 * Mental model:
 *   PAST + PRESENT  → free for all
 *   FUTURE          → paywalled
 *   MATCHING        → free unlimited (viral growth loop)
 *   AI delineation  → 1/week free, unlimited paid
 *   Daily brief     → paid only
 *   Peak alerts     → paid only
 *
 * Family plan deferred to Phase 2 (Apple Family Sharing collision).
 */

export type Plan = "free" | "premium";

export type FeatureKey =
  /** Future capsules (date > today). Paid only. */
  | "FUTURE_CAPSULES"
  /** AI delineation calls (own or partner). 1/week free, unlimited paid. */
  | "AI_DELINEATION"
  /** Daily briefing notification + screen. Paid only. */
  | "DAILY_BRIEFING"
  /** Push notification when a peak window opens. Paid only. */
  | "PEAK_ALERTS"
  /** Weekly digest email. Paid only. */
  | "WEEKLY_DIGEST"
  /** Connection (matching) creation. Free unlimited. */
  | "MATCHING_CONNECTION";

export interface FeatureSpec {
  /** Free-tier quota per period, or 0 if entirely paid. -1 = unlimited free. */
  freeQuota: number;
  /** "week" | "month" | undefined (one-shot). */
  period?: "week" | "month";
  /** Pretty label for paywall copy. */
  label: string;
}

export const FEATURES: Record<FeatureKey, FeatureSpec> = {
  FUTURE_CAPSULES: {
    freeQuota: 0,
    label: "Capsules futures",
  },
  AI_DELINEATION: {
    freeQuota: 1,
    period: "week",
    label: "Délinéation IA",
  },
  DAILY_BRIEFING: {
    freeQuota: 0,
    label: "Briefing quotidien",
  },
  PEAK_ALERTS: {
    freeQuota: 0,
    label: "Alertes de pic",
  },
  WEEKLY_DIGEST: {
    freeQuota: 0,
    label: "Digest hebdomadaire",
  },
  MATCHING_CONNECTION: {
    freeQuota: -1,                 // unlimited free
    label: "Connexions",
  },
};

/** Plans available for purchase. Family plan deferred Phase 2. */
export const PLANS = {
  monthly: {
    id: "monthly",
    label: "Mensuel",
    priceEUR: 9.99,
    period: "month" as const,
  },
  annual: {
    id: "annual",
    label: "Annuel",
    priceEUR: 89.0,
    period: "year" as const,
    monthlyEquivalent: 7.42,
    savingsEUR: 30.88,
    savingsPct: 26,
  },
};

/** ISO week start (Mon 00:00 UTC) for a given date. */
export function weekStart(d: Date = new Date()): Date {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  const day = dt.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;          // Mon-anchored
  dt.setUTCDate(dt.getUTCDate() + diff);
  return dt;
}

/** Month start (1st 00:00 UTC) for a given date. */
export function monthStart(d: Date = new Date()): Date {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  dt.setUTCDate(1);
  return dt;
}
