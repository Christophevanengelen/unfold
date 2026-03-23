/**
 * Observed Profile — learns user preferences from behavior.
 *
 * Scoring (GPT-validated):
 * - +2 first open of a capsule in a domain
 * - +0.5 repeat opens (capped at 6)
 * - +1 per 15s read time (capped at 3)
 * - +2 thumb up on domain
 * - -1 thumb down on domain
 * - Time decay: 100% (0-7d), 70% (8-21d), 40% (22-45d), 20% (>45d)
 *
 * Thumb feedback tracks RELEVANCE, not style.
 * Style is NOT inferred from thumbs (GPT correction #2).
 */

import { storage } from "@/lib/storage";
import type {
  PriorityDomain,
  GuidanceStyle,
} from "@/types/user-profile";

const STORAGE_KEY = "unfold_observed_profile";

// ─── Types ───────────────────────────────────────────────

interface DomainEvent {
  domain: PriorityDomain;
  type: "open" | "read" | "thumb_up" | "thumb_down";
  capsuleId: string;
  value: number; // ms for read, 1 for others
  ts: number;    // Date.now()
}

export interface ObservedProfile {
  events: DomainEvent[];
  /** Unique capsule IDs opened per domain (for first-open detection) */
  seenCapsules: Partial<Record<PriorityDomain, string[]>>;
  /** Total capsule opens (triggers PersonalizeFlow) */
  capsuleOpenCount: number;
  updatedAt?: string;
}

export const EMPTY_OBSERVED: ObservedProfile = {
  events: [],
  seenCapsules: {},
  capsuleOpenCount: 0,
};

// ─── Read / Write ────────────────────────────────────────

export async function getObservedProfile(): Promise<ObservedProfile> {
  const data = await storage.getPersistent<ObservedProfile>(STORAGE_KEY);
  return data ?? { ...EMPTY_OBSERVED, events: [], seenCapsules: {} };
}

export function getObservedProfileSync(): ObservedProfile {
  if (typeof window === "undefined") return { ...EMPTY_OBSERVED, events: [], seenCapsules: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { ...EMPTY_OBSERVED, events: [], seenCapsules: {} };
  } catch {
    return { ...EMPTY_OBSERVED, events: [], seenCapsules: {} };
  }
}

async function saveObserved(profile: ObservedProfile): Promise<void> {
  profile.updatedAt = new Date().toISOString();
  // Keep max 500 events (prune oldest)
  if (profile.events.length > 500) {
    profile.events = profile.events.slice(-500);
  }
  await storage.setPersistent(STORAGE_KEY, profile);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch { /* ignore */ }
}

// ─── Tracking Events ─────────────────────────────────────

export async function trackCapsuleOpen(): Promise<number> {
  const p = await getObservedProfile();
  p.capsuleOpenCount = (p.capsuleOpenCount ?? 0) + 1;
  await saveObserved(p);
  return p.capsuleOpenCount;
}

export async function trackDomainClick(domain: string, capsuleId: string): Promise<void> {
  const mapped = mapApiDomainToPriority(domain);
  if (!mapped) return;
  const p = await getObservedProfile();

  // Track if first open for this capsule in this domain
  if (!p.seenCapsules[mapped]) p.seenCapsules[mapped] = [];
  const isFirstOpen = !p.seenCapsules[mapped]!.includes(capsuleId);
  if (isFirstOpen) p.seenCapsules[mapped]!.push(capsuleId);

  p.events.push({
    domain: mapped,
    type: "open",
    capsuleId,
    value: isFirstOpen ? 1 : 0, // 1 = first, 0 = repeat
    ts: Date.now(),
  });
  await saveObserved(p);
}

export async function trackDomainReadTime(domain: string, capsuleId: string, ms: number): Promise<void> {
  if (ms < 2000) return;
  const mapped = mapApiDomainToPriority(domain);
  if (!mapped) return;
  const p = await getObservedProfile();
  p.events.push({
    domain: mapped,
    type: "read",
    capsuleId,
    value: ms,
    ts: Date.now(),
  });
  await saveObserved(p);
}

/** Track relevance feedback (NOT style — GPT correction #2) */
export async function trackDomainFeedback(
  domain: string,
  capsuleId: string,
  positive: boolean
): Promise<void> {
  const mapped = mapApiDomainToPriority(domain);
  if (!mapped) return;
  const p = await getObservedProfile();
  p.events.push({
    domain: mapped,
    type: positive ? "thumb_up" : "thumb_down",
    capsuleId,
    value: 1,
    ts: Date.now(),
  });
  await saveObserved(p);
}

// ─── Time Decay ──────────────────────────────────────────

function timeDecay(eventTs: number): number {
  const daysAgo = (Date.now() - eventTs) / (24 * 60 * 60 * 1000);
  if (daysAgo <= 7) return 1.0;
  if (daysAgo <= 21) return 0.7;
  if (daysAgo <= 45) return 0.4;
  return 0.2;
}

// ─── Scoring (GPT-validated) ─────────────────────────────

export interface InferredPriority {
  domain: PriorityDomain;
  score: number;
  confidence: number; // 0-1
}

const REPEAT_CAP = 6;
const READ_BUCKET_MS = 15000; // 15 seconds
const READ_CAP = 3;

export function inferPrioritiesWithConfidence(observed: ObservedProfile): InferredPriority[] {
  const scores: Partial<Record<PriorityDomain, number>> = {};
  const repeatCounts: Partial<Record<PriorityDomain, number>> = {};

  for (const event of observed.events) {
    const decay = timeDecay(event.ts);
    const d = event.domain;

    switch (event.type) {
      case "open":
        if (event.value === 1) {
          // First open: +2
          scores[d] = (scores[d] ?? 0) + 2 * decay;
        } else {
          // Repeat open: +0.5, capped
          const repeats = (repeatCounts[d] ?? 0);
          if (repeats < REPEAT_CAP) {
            scores[d] = (scores[d] ?? 0) + 0.5 * decay;
            repeatCounts[d] = repeats + 1;
          }
        }
        break;
      case "read": {
        // +1 per 15s bucket, capped at 3
        const buckets = Math.min(Math.floor(event.value / READ_BUCKET_MS), READ_CAP);
        scores[d] = (scores[d] ?? 0) + buckets * decay;
        break;
      }
      case "thumb_up":
        scores[d] = (scores[d] ?? 0) + 2 * decay;
        break;
      case "thumb_down":
        scores[d] = (scores[d] ?? 0) - 1 * decay;
        break;
    }
  }

  // Normalize and compute confidence
  const entries = Object.entries(scores)
    .filter(([, s]) => (s ?? 0) > 0)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0));

  if (entries.length === 0) return [];

  const maxScore = entries[0][1] ?? 1;

  return entries
    .slice(0, 3) // top 3 max
    .filter(([, s]) => (s ?? 0) >= 2) // minimum score threshold
    .map(([domain, score]) => ({
      domain: domain as PriorityDomain,
      score: score ?? 0,
      confidence: Math.min((score ?? 0) / Math.max(maxScore, 5), 1), // normalized 0-1
    }));
}

/** Simple top domains (backward compat) */
export function inferPriorities(observed: ObservedProfile): PriorityDomain[] {
  return inferPrioritiesWithConfidence(observed).map(p => p.domain);
}

/**
 * Style inference — NOT from thumbs (GPT correction #2).
 * Thumbs track relevance, not style preference.
 * Style should be declared or learned via micro-question.
 * This stub returns null — effective-profile falls back to declared or "pragmatic".
 */
export function inferGuidanceStyle(_observed: ObservedProfile): GuidanceStyle | null {
  // Future: learn from micro-questions or A/B structure tests (not tone)
  return null;
}

// ─── Domain Mapping ──────────────────────────────────────

const API_DOMAIN_MAP: Record<string, PriorityDomain> = {
  love: "love",
  relationships: "love",
  career: "career",
  work: "career",
  money: "money",
  family: "family",
  home: "home",
  health: "health_energy",
  creativity: "creativity",
  network: "friends_network",
  inner: "meaning_spirituality",
  horizon: "meaning_spirituality",
  communication: "friends_network",
  identity: "health_energy",
  transformations: "meaning_spirituality",
};

function mapApiDomainToPriority(domain: string): PriorityDomain | null {
  return API_DOMAIN_MAP[domain] ?? null;
}
