/**
 * UserProfile — Personalization layer for premium AI interpretations.
 *
 * MVP: 7 fields that meaningfully change how text is generated.
 * Phase 2 fields are optional, collected later via Settings.
 */

// ─── MVP Fields (collected post-first-use) ──────────────

export type LifePhase =
  | "stable"
  | "transition"
  | "crisis"
  | "reconstruction"
  | "expansion";

export type WorkStatus =
  | "employee"
  | "freelance"
  | "entrepreneur"
  | "student"
  | "job_seeking"
  | "career_transition"
  | "other";

export type RelationshipStatus =
  | "single"
  | "in_relationship"
  | "unclear"
  | "separation"
  | "other";

export type PriorityDomain =
  | "love"
  | "career"
  | "money"
  | "family"
  | "health_energy"
  | "creativity"
  | "home"
  | "friends_network"
  | "meaning_spirituality";

export type CurrentGoalPreset =
  | "stabilize"
  | "clarify"
  | "advance"
  | "protect"
  | "change";

export type GuidanceStyle =
  | "direct"
  | "reassuring"
  | "inspiring"
  | "pragmatic";

export type StressLevel = "low" | "medium" | "high";

// ─── Profile Type ────────────────────────────────────────

export interface UserProfile {
  // MVP (7 fields)
  lifePhase?: LifePhase;
  workStatus?: WorkStatus;
  relationshipStatus?: RelationshipStatus;
  priorities?: PriorityDomain[]; // max 3
  currentGoal?: CurrentGoalPreset | string; // preset or free text
  guidanceStyle?: GuidanceStyle;
  stressLevel?: StressLevel;

  // Phase 2 (collected later via Settings)
  ageRange?: "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+";
  parentalStatus?: "no_children" | "has_children";
  energyLevel?: "low" | "medium" | "high";
  emotionalLoad?: "low" | "medium" | "high";
  uncertaintyTolerance?: "low" | "medium" | "high";
  biggestQuestionNow?: string;

  // Metadata
  completedAt?: string; // ISO date when profile was first completed
  updatedAt?: string;   // ISO date of last update

  // Volatile field timestamps (for TTL-based refresh)
  stressLevelSetAt?: string;   // ISO date — TTL 5-7 days
  currentGoalSetAt?: string;   // ISO date — TTL 10-14 days
  prioritiesSetAt?: string;    // ISO date — TTL 21-30 days
}

// ─── Observed Profile (learned from behavior) ────────────

export interface ObservedProfile {
  /** Raw behavior events */
  events: { domain: PriorityDomain; type: string; capsuleId: string; value: number; ts: number }[];
  /** Unique capsule IDs opened per domain */
  seenCapsules: Partial<Record<PriorityDomain, string[]>>;
  /** Click count per domain — infers priorities */
  domainClicks: Partial<Record<PriorityDomain, number>>;
  /** Time spent reading per domain (ms) */
  domainReadTime: Partial<Record<PriorityDomain, number>>;
  /** Positive feedback count per guidance style */
  styleFeedback: Partial<Record<GuidanceStyle, number>>;
  /** Total capsule opens (triggers PersonalizeFlow) */
  capsuleOpenCount: number;
  /** Last updated */
  updatedAt?: string;
}

export const EMPTY_OBSERVED: ObservedProfile = {
  events: [],
  seenCapsules: {},
  domainClicks: {},
  domainReadTime: {},
  styleFeedback: {},
  capsuleOpenCount: 0,
};

// ─── Effective Profile (fusion of declared + observed) ───

export interface EffectiveProfile extends UserProfile {
  /** Priorities merged from declared + observed behavior */
  effectivePriorities: PriorityDomain[];
  /** Style from declared or best-observed or default */
  effectiveStyle: GuidanceStyle;
  /** Stress from fresh declared or fallback */
  effectiveStress: StressLevel;
}

// ─── TTL Constants ───────────────────────────────────────

export const TTL_STRESS = 7 * 24 * 60 * 60 * 1000;      // 7 days
export const TTL_GOAL = 14 * 24 * 60 * 60 * 1000;        // 14 days
export const TTL_PRIORITIES = 30 * 24 * 60 * 60 * 1000;   // 30 days
export const TTL_STABLE = 90 * 24 * 60 * 60 * 1000;       // 90 days

// ─── Helpers ─────────────────────────────────────────────

/** Check if profile has the 4 essential fields filled */
export function isProfileMinimal(p: UserProfile | null): boolean {
  if (!p) return false;
  return !!(p.lifePhase && p.priorities && p.priorities.length > 0 && p.guidanceStyle);
}

/** Check if full MVP is complete (all 7 fields) */
export function isProfileComplete(p: UserProfile | null): boolean {
  if (!p) return false;
  return !!(
    p.lifePhase &&
    p.workStatus &&
    p.relationshipStatus &&
    p.priorities &&
    p.priorities.length > 0 &&
    p.guidanceStyle &&
    p.stressLevel
  );
}

/** Create a hash of the profile for cache keying */
export function profileHash(p: UserProfile | null): string {
  if (!p) return "none";
  const key = [
    p.lifePhase ?? "",
    p.workStatus ?? "",
    p.relationshipStatus ?? "",
    (p.priorities ?? []).sort().join(","),
    p.currentGoal ?? "",
    p.guidanceStyle ?? "",
    p.stressLevel ?? "",
  ].join("|");
  // Simple hash for cache key (not crypto)
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
