/**
 * Shared capsule logic — single source of truth for both Timeline and Home.
 *
 * buildCapsules() creates CapsuleData from MomentumPhases.
 * Both views use the same data, same occurrence numbers, same tier logic.
 */

import type { DomainKey, PlanetKey } from "@/lib/domain-config";
import { mockTimeline, type MomentumPhase } from "@/lib/mock-timeline";

// ─── Types ──────────────────────────────────────────────────
export type Tier = "toc" | "toctoc" | "toctoctoc";

export interface CapsuleData {
  id: string;
  phases: MomentumPhase[];
  domains: { domain: DomainKey; intensity: number; occurrence: number; totalOccurrences: number }[];
  planets: PlanetKey[]; // 1-5 planetary transits — dot colors come from here
  startDate: Date;
  endDate: Date;
  lane: number;
  tier: Tier;
  tierOccurrence: number;  // chronological count within same tier (1, 2, 3...)
  tierTotal: number;       // total capsules of same tier
  isCurrent: boolean;
  isFuture: boolean;
}

// ─── Tier helpers ───────────────────────────────────────────
const LANE_COUNT = 3;

export function getTier(intensity: number): Tier {
  if (intensity >= 85) return "toctoctoc";
  if (intensity >= 70) return "toctoc";
  return "toc";
}

export function getTierLane(tier: Tier): number {
  if (tier === "toc") return 0;
  if (tier === "toctoc") return 1;
  return 2;
}

export function getTierWidth(tier: Tier): number {
  if (tier === "toc") return 36;
  if (tier === "toctoc") return 48;
  return 64;
}

export function getTierLabel(tier: Tier): string {
  if (tier === "toctoctoc") return "TOCTOCTOC";
  if (tier === "toctoc") return "TOCTOC";
  return "TOC";
}

function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

// ─── Build capsule data ─────────────────────────────────────
export function buildCapsules(phases: MomentumPhase[]): CapsuleData[] {
  const sorted = [...phases].sort(
    (a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime()
  );

  const domainCounts: Record<string, number> = {};
  for (const p of sorted) domainCounts[p.domain] = (domainCounts[p.domain] || 0) + 1;
  const domainCounter: Record<string, number> = {};

  const capsules: CapsuleData[] = [];
  const laneEndTime: number[] = new Array(LANE_COUNT).fill(0);

  const currentPhases = sorted.filter((p) => p.status === "current");
  const nonCurrentPhases = sorted.filter((p) => p.status !== "current");

  for (const phase of nonCurrentPhases) {
    const start = parseDate(phase.startDate);
    const end = phase.endDate
      ? parseDate(phase.endDate)
      : new Date(start.getTime() + phase.durationWeeks * 7 * 24 * 60 * 60 * 1000);

    domainCounter[phase.domain] = (domainCounter[phase.domain] || 0) + 1;

    const tier = getTier(phase.intensity);
    const lane = getTierLane(tier);

    capsules.push({
      id: phase.id,
      phases: [phase],
      domains: [{
        domain: phase.domain,
        intensity: phase.intensity,
        occurrence: domainCounter[phase.domain],
        totalOccurrences: domainCounts[phase.domain],
      }],
      planets: phase.planets || [phase.domain === "love" ? "venus" : phase.domain === "health" ? "mars" : "mercury"],
      startDate: start,
      endDate: end,
      lane,
      tier,
      tierOccurrence: 0,
      tierTotal: 0,
      isCurrent: false,
      isFuture: start.getTime() > Date.now(),
    });
  }

  if (currentPhases.length > 0) {
    for (const p of currentPhases) {
      domainCounter[p.domain] = (domainCounter[p.domain] || 0) + 1;
    }
    const starts = currentPhases.map((p) => parseDate(p.startDate));
    const earliest = new Date(Math.min(...starts.map((d) => d.getTime())));
    const maxIntensity = Math.max(...currentPhases.map((p) => p.intensity));
    const tier = getTier(maxIntensity);

    const mergedPlanets: PlanetKey[] = [];
    for (const p of currentPhases) {
      for (const pl of (p.planets || [])) {
        if (!mergedPlanets.includes(pl)) mergedPlanets.push(pl);
      }
    }

    capsules.push({
      id: "current-group",
      phases: currentPhases,
      domains: currentPhases.map((p) => ({
        domain: p.domain,
        intensity: p.intensity,
        occurrence: domainCounter[p.domain] || 1,
        totalOccurrences: domainCounts[p.domain] || 1,
      })),
      planets: mergedPlanets.length > 0 ? mergedPlanets : ["mercury"],
      startDate: earliest,
      endDate: new Date(),
      lane: getTierLane(tier),
      tier,
      tierOccurrence: 0,
      tierTotal: 0,
      isCurrent: true,
      isFuture: false,
    });
  }

  // Assign occurrence numbers per tier — sort by endDate
  capsules.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  const tierCounter: Record<string, number> = {};
  const tierTotals: Record<string, number> = {};
  for (const c of capsules) tierTotals[c.tier] = (tierTotals[c.tier] || 0) + 1;
  for (const c of capsules) {
    tierCounter[c.tier] = (tierCounter[c.tier] || 0) + 1;
    c.tierOccurrence = tierCounter[c.tier];
    c.tierTotal = tierTotals[c.tier];
  }

  return capsules;
}

// ─── Convenience: get the 3 capsules for the home screen ────
export function getHomeCapsules(): {
  past: CapsuleData | null;
  current: CapsuleData | null;
  future: CapsuleData | null;
} {
  const all = buildCapsules(mockTimeline);
  const current = all.find((c) => c.isCurrent) ?? null;

  // Last completed capsule (same tier as current for continuity)
  const pastCapsules = all.filter((c) => !c.isCurrent && !c.isFuture);
  const past = pastCapsules.length > 0 ? pastCapsules[pastCapsules.length - 1] : null;

  // Next upcoming capsule (first future)
  const futureCapsules = all.filter((c) => c.isFuture);
  const future = futureCapsules.length > 0 ? futureCapsules[0] : null;

  return { past, current, future };
}
