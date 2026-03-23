/**
 * Effective Profile — merges declared + observed profiles.
 *
 * Rules (from GPT's framework):
 * - Declared data always takes precedence when fresh
 * - Observed data fills gaps or augments stale declared data
 * - Volatile fields (stress, goal) expire and need refresh
 * - Stable fields (work, relationship) last 90 days
 */

import type {
  UserProfile,
  ObservedProfile,
  EffectiveProfile,
  PriorityDomain,
  GuidanceStyle,
  StressLevel,
} from "@/types/user-profile";
import {
  TTL_STRESS,
  TTL_GOAL,
  TTL_PRIORITIES,
} from "@/types/user-profile";
import { inferPriorities, inferGuidanceStyle } from "@/lib/observed-profile";

// ─── Freshness Check ─────────────────────────────────────

function isFresh(isoDate: string | undefined, ttlMs: number): boolean {
  if (!isoDate) return false;
  return Date.now() - new Date(isoDate).getTime() < ttlMs;
}

// ─── Stale Field Detection ───────────────────────────────

export interface StaleFields {
  stressLevel: boolean;
  currentGoal: boolean;
  priorities: boolean;
}

/** Check which volatile fields need a refresh prompt */
export function getStaleFields(declared: UserProfile | null): StaleFields {
  if (!declared) return { stressLevel: true, currentGoal: true, priorities: true };
  return {
    stressLevel: !isFresh(declared.stressLevelSetAt, TTL_STRESS),
    currentGoal: !isFresh(declared.currentGoalSetAt, TTL_GOAL),
    priorities: !isFresh(declared.prioritiesSetAt, TTL_PRIORITIES),
  };
}

/** Returns true if any volatile field needs refresh */
export function needsRefresh(declared: UserProfile | null): boolean {
  const stale = getStaleFields(declared);
  return stale.stressLevel || stale.currentGoal;
}

// ─── Profile Fusion ──────────────────────────────────────

export function buildEffectiveProfile(
  declared: UserProfile | null,
  observed: ObservedProfile | null
): EffectiveProfile {
  const d = declared ?? {};
  const o = observed ?? { domainClicks: {}, domainReadTime: {}, styleFeedback: {}, capsuleOpenCount: 0 };

  // ── Priorities: declared (if fresh) + observed fallback ──
  const declaredPriorities = d.priorities ?? [];
  const observedPriorities = inferPriorities(o);

  let effectivePriorities: PriorityDomain[];
  if (declaredPriorities.length > 0 && isFresh(d.prioritiesSetAt, TTL_PRIORITIES)) {
    // Declared is fresh — use it, but append top observed if < 3
    const merged = [...declaredPriorities];
    for (const op of observedPriorities) {
      if (merged.length >= 3) break;
      if (!merged.includes(op)) merged.push(op);
    }
    effectivePriorities = merged;
  } else if (declaredPriorities.length > 0) {
    // Declared exists but stale — blend 50/50
    const merged = [...declaredPriorities];
    for (const op of observedPriorities) {
      if (merged.length >= 3) break;
      if (!merged.includes(op)) merged.push(op);
    }
    effectivePriorities = merged;
  } else {
    // No declared — use observed
    effectivePriorities = observedPriorities.slice(0, 3);
  }

  // ── Guidance style: declared → observed → default ──
  const inferredStyle = inferGuidanceStyle(o);
  const effectiveStyle: GuidanceStyle =
    d.guidanceStyle ?? inferredStyle ?? "pragmatic";

  // ── Stress: fresh declared → last known → medium ──
  const effectiveStress: StressLevel =
    (d.stressLevel && isFresh(d.stressLevelSetAt, TTL_STRESS))
      ? d.stressLevel
      : d.stressLevel ?? "medium";

  return {
    ...d,
    effectivePriorities,
    effectiveStyle,
    effectiveStress,
  };
}
