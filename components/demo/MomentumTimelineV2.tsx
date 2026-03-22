"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { domainConfig, planetConfig, type DomainKey, type PlanetKey } from "@/lib/domain-config";
import {
  type MomentumPhase,
} from "@/lib/mock-timeline";
import { useMomentum } from "@/lib/momentum-store";
import { X } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────
type ViewMode = "focus" | "overview" | "list";

type Tier = "toc" | "toctoc" | "toctoctoc";

interface CapsuleData {
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
  color?: string; // hex from API — domain house color
}

// ─── Constants ──────────────────────────────────────────────
let LANE_COUNT = 7;
const PX_PER_MONTH = 40; // pixels per month — more space for temporal accuracy
const LANE_SPACING = 6;
const MIN_GAP_MS = 0; // capsules just can't overlap — no extra gap needed

// Tier thresholds & widths
function getTier(intensity: number): Tier {
  if (intensity >= 85) return "toctoctoc";
  if (intensity >= 70) return "toctoc";
  return "toc";
}
function getTierWidth(tier: Tier): number {
  if (tier === "toc") return 36;
  if (tier === "toctoc") return 48;
  return 64;
}

// ─── Lane assignment: temporal collision detection ──────────
// Three passes: TOCTOCTOC first (strongest → left lanes),
// then TOCTOC (medium → middle), then TOC (lightest → right).
// Within each tier, capsules go on the first free lane (no overlap).
// Left = lightest (toc), right = strongest (toctoctoc)
const TIER_ORDER: Tier[] = ["toc", "toctoc", "toctoctoc"];

function assignLanesForGroup(
  capsules: CapsuleData[],
  laneEnds: number[],
  laneOffset: number,
): number {
  const sorted = [...capsules].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );
  let maxLane = 0;

  for (const capsule of sorted) {
    const startMs = capsule.startDate.getTime();
    let placed = false;

    // Try existing lanes for this tier group
    for (let i = 0; i < laneEnds.length; i++) {
      if (startMs >= laneEnds[i] + MIN_GAP_MS) {
        capsule.lane = laneOffset + i;
        laneEnds[i] = capsule.endDate.getTime();
        placed = true;
        maxLane = Math.max(maxLane, i + 1);
        break;
      }
    }

    if (!placed) {
      const newIdx = laneEnds.length;
      capsule.lane = laneOffset + newIdx;
      laneEnds.push(capsule.endDate.getTime());
      maxLane = Math.max(maxLane, newIdx + 1);
    }
  }

  return maxLane;
}

function assignLanes(capsules: CapsuleData[]): void {
  let laneOffset = 0;

  for (const tier of TIER_ORDER) {
    const group = capsules.filter((c) => c.tier === tier);
    if (group.length === 0) continue;
    const laneEnds: number[] = [];
    const lanesUsed = assignLanesForGroup(group, laneEnds, laneOffset);
    laneOffset += lanesUsed;
  }

  LANE_COUNT = Math.max(1, laneOffset);
}
const TIMELINE_PAD = 80;

// ─── Shared pill button style (design system) ──────────────
const PILL_STYLE: React.CSSProperties = {
  background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)",
  color: "var(--accent-purple)",
  border: "1px solid color-mix(in srgb, var(--accent-purple) 25%, transparent)",
  backdropFilter: "blur(12px)",
};

// ─── Date helpers ───────────────────────────────────────────
// These are now computed inside the component from the hook's birthDateStr.
// Module-level placeholders used by helper functions — overwritten in the component.
let birthDate = new Date("1986-05-14T00:00:00");
let timelineStartDate = new Date(birthDate);
let timelineEndDate = new Date(birthDate);
timelineEndDate.setFullYear(timelineEndDate.getFullYear() + 120);

function initDates(birthStr: string) {
  birthDate = new Date(birthStr + "T00:00:00");
  timelineStartDate = new Date(birthDate);
  timelineEndDate = new Date(birthDate);
  timelineEndDate.setFullYear(timelineEndDate.getFullYear() + 120);
}

/** Months between two dates (fractional) */
function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + (b.getDate() - a.getDate()) / 30;
}

function getTotalMonths() { return monthsBetween(timelineStartDate, timelineEndDate) || 1200; }
function getTotalHeight() { return TIMELINE_PAD * 2 + getTotalMonths() * PX_PER_MONTH; }

/** Convert a date to Y position. Future (end date) = top, past (birth) = bottom */
function dateToY(d: Date): number {
  const months = monthsBetween(timelineStartDate, d);
  // Invert: high date = top (small Y), old date = bottom (large Y)
  return TIMELINE_PAD + (getTotalMonths() - months) * PX_PER_MONTH;
}

/** Convert Y position back to a Date (for scroll-based year display) */
function yToDate(y: number): Date {
  const months = getTotalMonths() - (y - TIMELINE_PAD) / PX_PER_MONTH;
  const result = new Date(timelineStartDate);
  result.setMonth(result.getMonth() + Math.round(months));
  return result;
}

function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Build capsule data ─────────────────────────────────────
function buildCapsules(phases: MomentumPhase[]): CapsuleData[] {
  const sorted = [...phases].sort(
    (a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime()
  );

  // Count total occurrences per domain & assign occurrence numbers
  const domainCounts: Record<string, number> = {};
  for (const p of sorted) domainCounts[p.domain] = (domainCounts[p.domain] || 0) + 1;
  const domainCounter: Record<string, number> = {};

  const capsules: CapsuleData[] = [];

  // Separate current phases to merge them into a single capsule
  const currentPhases = sorted.filter((p) => p.status === "current");
  const nonCurrentPhases = sorted.filter((p) => p.status !== "current");

  // Build non-current capsules individually
  for (const phase of nonCurrentPhases) {
    const start = parseDate(phase.startDate);
    const end = phase.endDate
      ? parseDate(phase.endDate)
      : new Date(start.getTime() + phase.durationWeeks * 7 * 24 * 60 * 60 * 1000);

    domainCounter[phase.domain] = (domainCounter[phase.domain] || 0) + 1;

    const tier = getTier(phase.intensity);

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
      lane: 0, // assigned by assignLanes()
      tier,
      tierOccurrence: 0, // assigned below
      tierTotal: 0,
      isCurrent: false,
      isFuture: start.getTime() > Date.now(),
      color: phase.color,
    });
  }

  // Merge all current phases into one capsule (same as Focus view)
  if (currentPhases.length > 0) {
    for (const p of currentPhases) {
      domainCounter[p.domain] = (domainCounter[p.domain] || 0) + 1;
    }
    const starts = currentPhases.map((p) => parseDate(p.startDate));
    const earliest = new Date(Math.min(...starts.map((d) => d.getTime())));
    const maxIntensity = Math.max(...currentPhases.map((p) => p.intensity));
    const tier = getTier(maxIntensity);

    // Merge planets, deduplicate
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
      lane: 0, // assigned by assignLanes()
      tier,
      tierOccurrence: 0, // assigned below
      tierTotal: 0,
      isCurrent: true,
      isFuture: false,
      color: currentPhases[0]?.color,
    });
  }

  // ── Assign lanes by temporal collision detection ──
  assignLanes(capsules);

  // Assign occurrence numbers for TOCTOCTOC only, by planet signature.
  // A number shows only if the same planet combo repeats across the lifetime.
  capsules.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  const pSig = (c: CapsuleData) => [...c.planets].sort().join("+");
  const sigTotals: Record<string, number> = {};
  for (const c of capsules) {
    if (c.tier !== "toctoctoc") continue;
    const sig = pSig(c);
    sigTotals[sig] = (sigTotals[sig] || 0) + 1;
  }
  const sigCounter: Record<string, number> = {};
  for (const c of capsules) {
    if (c.tier !== "toctoctoc") {
      c.tierOccurrence = 0;
      c.tierTotal = 0;
      continue;
    }
    const sig = pSig(c);
    const total = sigTotals[sig];
    if (total <= 1) {
      c.tierOccurrence = 0;
      c.tierTotal = 0;
    } else {
      sigCounter[sig] = (sigCounter[sig] || 0) + 1;
      c.tierOccurrence = sigCounter[sig];
      c.tierTotal = total;
    }
  }

  return capsules;
}

function buildCurrentCapsule(timelineData: MomentumPhase[]): CapsuleData | null {
  const currentPhases = timelineData.filter((p) => p.status === "current");
  if (currentPhases.length === 0) return null;

  // Count occurrences per domain across the full timeline (up to and including current)
  const sorted = [...timelineData]
    .filter((p) => p.status !== "future")
    .sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime());
  const domainCounts: Record<string, number> = {};
  for (const p of timelineData) domainCounts[p.domain] = (domainCounts[p.domain] || 0) + 1;
  const domainCounter: Record<string, number> = {};
  for (const p of sorted) {
    domainCounter[p.domain] = (domainCounter[p.domain] || 0) + 1;
  }

  const starts = currentPhases.map((p) => parseDate(p.startDate));
  const earliest = new Date(Math.min(...starts.map((d) => d.getTime())));

  // Use the highest intensity among current phases for tier
  const maxIntensity = Math.max(...currentPhases.map((p) => p.intensity));
  const tier = getTier(maxIntensity);

  // Merge planets from all current phases, deduplicate
  const allPlanets: PlanetKey[] = [];
  for (const p of currentPhases) {
    for (const pl of (p.planets || [])) {
      if (!allPlanets.includes(pl)) allPlanets.push(pl);
    }
  }

  // Compute tier occurrence using buildCapsules (same source of truth)
  const allCaps = buildCapsules(timelineData);
  const sameTier = allCaps.filter((c) => c.tier === tier);
  const currentInAll = allCaps.find((c) => c.isCurrent);
  const currentTierOcc = currentInAll?.tierOccurrence ?? sameTier.length;
  const tierTot = sameTier.length;

  return {
    id: "current-group",
    phases: currentPhases,
    domains: currentPhases.map((p) => ({
      domain: p.domain,
      intensity: p.intensity,
      occurrence: domainCounter[p.domain] || 1,
      totalOccurrences: domainCounts[p.domain] || 1,
    })),
    planets: allPlanets.length > 0 ? allPlanets : ["mercury"],
    startDate: earliest,
    endDate: new Date(),
    lane: currentInAll?.lane ?? 0,
    tier,
    tierOccurrence: currentTierOcc,
    tierTotal: tierTot,
    isCurrent: true,
    isFuture: false,
  };
}

// ─── Detail Sheet ───────────────────────────────────────────
function DetailSheet({ capsule, onClose }: { capsule: CapsuleData; onClose: () => void }) {
  // Dismiss on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const tierLabel = capsule.tier === "toctoctoc" ? "PEAK" : capsule.tier === "toctoc" ? "CLEAR" : "SUBTLE";
  const startLabel = `${MONTH_NAMES[capsule.startDate.getMonth()]} ${capsule.startDate.getFullYear()}`;
  const endLabel = capsule.isCurrent
    ? "Now"
    : `${MONTH_NAMES[capsule.endDate.getMonth()]} ${capsule.endDate.getFullYear()}`;
  const phase = capsule.phases[0]; // primary phase for description/insight

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className="absolute inset-x-0 bottom-0 z-50 overflow-hidden"
      style={{
        borderRadius: "1.5rem 1.5rem 0 0",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-muted)",
        maxHeight: "65%",
      }}
    >
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full" style={{ background: "var(--border-base)" }} />
      </div>

      <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(65vh - 20px)" }}>
        {/* Header — occurrence number (TOCTOCTOC only) + tier + date range */}
        <div className="flex items-center gap-3 pt-2">
          {capsule.tier === "toctoctoc" && capsule.tierOccurrence > 0 && (
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: "var(--text-heading)" }}
          >
            {capsule.tierOccurrence}
          </span>
          )}
          <div>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: "var(--accent-purple)" }}
            >
              {tierLabel}
            </span>
            <p className="text-[10px] tabular-nums" style={{ color: "var(--text-body-subtle)" }}>
              {startLabel} — {endLabel}
            </p>
          </div>
        </div>

        {/* Planet keyword pills — the dots become readable labels */}
        <div className="mt-4 flex flex-wrap gap-2">
          {capsule.planets.map((planet) => {
            const pc = planetConfig[planet];
            return (
              <motion.div
                key={planet}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{
                  background: `color-mix(in srgb, ${pc.color} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${pc.color} 25%, transparent)`,
                }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: pc.color, boxShadow: `0 0 6px ${pc.color}` }}
                />
                <span className="text-[11px] font-medium" style={{ color: pc.color }}>
                  {pc.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Description — the story these keywords tell together */}
        {phase && (
          <>
            <h3 className="mt-5 text-lg font-semibold leading-tight" style={{ color: "var(--text-heading)" }}>
              {phase.title}
            </h3>
            <p className="mt-1 text-xs" style={{ color: "var(--text-body-subtle)" }}>
              {phase.subtitle}
            </p>

            <p className="mt-4 text-[13px] leading-relaxed" style={{ color: "var(--text-body)" }}>
              {phase.description}
            </p>

            {phase.keyInsight && (
              <div
                className="mt-4 rounded-xl px-3.5 py-3"
                style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
                  Key Insight
                </p>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
                  {phase.keyInsight}
                </p>
              </div>
            )}

            {phase.guidance && (
              <div
                className="mt-3 rounded-xl px-3.5 py-3"
                style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
                  Guidance
                </p>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
                  {phase.guidance}
                </p>
              </div>
            )}

            {phase.peakMoment && (
              <p className="mt-4 text-[11px] italic" style={{ color: "var(--text-body-subtle)" }}>
                {phase.peakMoment}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Focus View ─────────────────────────────────────────────
// Shows all capsules of the same tier (Subtle/Clear/Peak) as the current
// momentum, connected by a thread. Uses the same date-based Y axis as overview
// with month/year labels on the left so the user stays oriented.

function FocusView({
  currentCapsule,
  allCapsules,
  onClose,
  onTapCapsule,
  onAgeChange,
}: {
  currentCapsule: CapsuleData;
  allCapsules: CapsuleData[];
  onClose: () => void;
  onTapCapsule: (capsule: CapsuleData) => void;
  onAgeChange: (age: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nowY = dateToY(new Date());
  const [isAwayFromNow, setIsAwayFromNow] = useState(false);

  const scrollToNow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const viewportH = el.clientHeight || 700;
    el.scrollTo({ top: Math.max(0, nowY - viewportH * 0.5), behavior: "smooth" });
  }, [nowY]);

  const capsuleWidth = 72;
  const labelMargin = 32;

  // Content sizing — number is treated as a dot (same visual weight)
  const dotCount = currentCapsule.planets.length;
  const dotSize = 12;
  const dotGap = 8;
  const numberSize = 18; // treated like a dot visually
  const contentH = numberSize + dotGap + dotCount * dotSize + (dotCount - 1) * dotGap;
  // Padding from capsule edges = half the width (the rounded cap)
  const capPad = capsuleWidth / 2;
  const MIN_H = Math.max(capsuleWidth, contentH + capPad * 2);
  const FOCUS_GAP = 6;

  // All capsules of the same tier — no limit, same numbers as Overview
  const focusPositions = useMemo(() => {
    const tierCapsules = allCapsules
      .filter((c) => c.tier === currentCapsule.tier)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Compute positions — current capsule crosses the NOW line
    const items = tierCapsules.map((capsule) => {
      let topY = dateToY(capsule.endDate);
      const bottomY = dateToY(capsule.startDate);
      const h = Math.max(MIN_H, bottomY - topY);
      // Current capsule: shift up so NOW line cuts through it (~55% from top)
      if (capsule.isCurrent) topY -= h * 0.55;
      return { capsule, topY, h };
    });

    // Resolve overlaps bidirectionally around current capsule:
    // Past capsules push DOWN, future capsules push UP — never cross NOW
    const currentIdx = items.findIndex((it) => it.capsule.isCurrent);
    const currentItem = currentIdx >= 0 ? items[currentIdx] : null;

    if (currentItem) {
      // Past capsules: below current, push DOWN (increasing topY)
      const past = items
        .filter((it) => !it.capsule.isCurrent && !it.capsule.isFuture)
        .sort((a, b) => a.topY - b.topY);
      // Ensure first past capsule doesn't overlap current
      if (past.length > 0) {
        const curBottom = currentItem.topY + currentItem.h + FOCUS_GAP;
        if (past[0].topY < curBottom) past[0].topY = curBottom;
      }
      for (let j = 1; j < past.length; j++) {
        const prevBottom = past[j - 1].topY + past[j - 1].h + FOCUS_GAP;
        if (past[j].topY < prevBottom) past[j].topY = prevBottom;
      }

      // Future capsules: above current, push UP (decreasing topY)
      const future = items
        .filter((it) => it.capsule.isFuture)
        .sort((a, b) => b.topY - a.topY); // bottom-most first
      // Ensure last future capsule doesn't overlap current
      if (future.length > 0) {
        const curTop = currentItem.topY - FOCUS_GAP;
        if (future[0].topY + future[0].h > curTop) {
          future[0].topY = curTop - future[0].h;
        }
      }
      for (let j = 1; j < future.length; j++) {
        const nextTop = future[j - 1].topY - FOCUS_GAP;
        if (future[j].topY + future[j].h > nextTop) {
          future[j].topY = nextTop - future[j].h;
        }
      }
    } else {
      // Fallback: simple top-down
      items.sort((a, b) => a.topY - b.topY);
      for (let j = 1; j < items.length; j++) {
        const prevBottom = items[j - 1].topY + items[j - 1].h + FOCUS_GAP;
        if (items[j].topY < prevBottom) items[j].topY = prevBottom;
      }
    }

    return items;
  }, [allCapsules, currentCapsule.tier, MIN_H]);

  // Month labels — same as overview
  const monthLabels = useMemo(() => {
    const now = new Date();
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();
    const labels: { month: string; year: number; y: number; isJan: boolean; isCurrent: boolean }[] = [];
    const cursor = new Date(timelineStartDate);
    while (cursor <= timelineEndDate) {
      const y = dateToY(cursor);
      labels.push({
        month: MONTH_NAMES[cursor.getMonth()],
        year: cursor.getFullYear(),
        y,
        isJan: cursor.getMonth() === 0,
        isCurrent: cursor.getMonth() === nowMonth && cursor.getFullYear() === nowYear,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return labels;
  }, []);

  // Snap points: capsule tops (where first planet sits) + NOW line.
  // When jumping, the target lands just below the fixed age bar.
  const PLANET_OFFSET = 0; // align capsule top with the age bar
  const snapPoints = useMemo(() => {
    const points = focusPositions.map((fp) => fp.topY + PLANET_OFFSET);
    points.push(nowY);
    return [...new Set(points)].sort((a, b) => a - b);
  }, [focusPositions, nowY]);

  // Auto-scroll so NOW is centered — instant on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const viewportH = scrollRef.current.clientHeight || 700;
    scrollRef.current.scrollTop = Math.max(0, nowY - viewportH * 0.50);
  }, [nowY]);

  // Capsule navigation — stateless. Each press finds the nearest capsule
  // to the bar, then scrolls to the next one in the requested direction.
  const isSnapping = useRef(false);
  const isJumping = useRef(false);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rafId = useRef(0);

  const jumpToCapsule = useCallback((direction: "past" | "future") => {
    const el = scrollRef.current;
    if (!el || isJumping.current || focusPositions.length === 0) return;

    const barInScroll = el.scrollTop + el.clientHeight * 0.52;
    const sorted = [...focusPositions].sort((a, b) => a.topY - b.topY);

    // Find closest capsule to bar
    let closestIdx = 0;
    let closestDist = Infinity;
    for (let i = 0; i < sorted.length; i++) {
      const dist = Math.abs(sorted[i].topY - barInScroll);
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    }

    // Next capsule — past = higher Y (further down), future = lower Y (further up)
    const nextIdx = direction === "past"
      ? Math.min(closestIdx + 1, sorted.length - 1)
      : Math.max(closestIdx - 1, 0);
    if (nextIdx === closestIdx) return;

    const targetScroll = Math.max(0, sorted[nextIdx].topY - el.clientHeight * 0.52);
    const start = el.scrollTop;
    const delta = targetScroll - start;
    if (Math.abs(delta) < 2) return;

    // Lock + cancel any pending animation
    isJumping.current = true;
    cancelAnimationFrame(rafId.current);

    const startTime = performance.now();
    const duration = 350; // fixed duration for consistency
    // Cubic ease-out: fast start, smooth deceleration, precise stop
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      el.scrollTop = start + delta * ease(progress);
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        // Ensure we land exactly on target
        el.scrollTop = targetScroll;
        setTimeout(() => { isJumping.current = false; }, 100);
      }
    };
    rafId.current = requestAnimationFrame(animate);
  }, [focusPositions]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const centerY = el.scrollTop + el.clientHeight / 2;
      const d = yToDate(centerY);
      const diffMs = d.getTime() - birthDate.getTime();
      const age = Math.max(0, Math.min(100, Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000))));
      onAgeChange(age);
      const distFromNow = Math.abs(centerY - nowY);
      setIsAwayFromNow(distFromNow > el.clientHeight * 0.8);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onAgeChange, nowY]);

  return (
    <div className="relative flex h-full flex-col">
      {/* Scrollable timeline */}
      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden">
        <div className="relative" style={{ height: getTotalHeight() }}>

          {/* Month labels on the left */}
          {monthLabels.map(({ month, year, y, isJan, isCurrent }) => (
            <div key={`${year}-${month}`} className="absolute" style={{ top: y, left: 4 }}>
              <div
                className="absolute"
                style={{
                  top: 0,
                  left: 24,
                  width: isCurrent ? 16 : isJan ? 12 : 6,
                  height: isCurrent ? 1.5 : 1,
                  background: isCurrent
                    ? "rgba(255,255,255,0.5)"
                    : isJan
                      ? "color-mix(in srgb, var(--brand-6) 40%, transparent)"
                      : "color-mix(in srgb, var(--brand-5) 15%, transparent)",
                }}
              />
              <span
                className="absolute -top-1.5 text-[7px] tabular-nums"
                style={{
                  left: 0,
                  width: 22,
                  textAlign: "right",
                  color: isCurrent ? "rgba(255,255,255,0.8)" : isJan ? "var(--text-body-subtle)" : "var(--text-disabled)",
                  fontWeight: isCurrent ? 600 : isJan ? 600 : 400,
                  fontSize: isCurrent ? 8 : isJan ? 8 : 7,
                }}
              >
                {isJan ? year : month}
              </span>
            </div>
          ))}

          {/* Connecting thread — spine from topmost to bottommost capsule */}
          {focusPositions.length > 1 && (() => {
            const spineTop = Math.min(...focusPositions.map((p) => p.topY));
            const spineBottom = Math.max(...focusPositions.map((p) => p.topY + p.h));
            return (
              <div
                className="absolute"
                style={{
                  left: "50%",
                  top: spineTop,
                  width: 1,
                  height: spineBottom - spineTop,
                  background:
                    "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--brand-5) 20%, transparent) 2%, color-mix(in srgb, var(--brand-5) 20%, transparent) 98%, transparent 100%)",
                }}
              />
            );
          })()}

          {/* Capsules — same tierOccurrence as Overview */}
          {focusPositions.map(({ capsule, topY: adjTopY, h }, i) => {
            return (
            <motion.button
              key={capsule.id}
              type="button"
              onClick={() => {
                if (!capsule.isFuture) onTapCapsule(capsule);
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.03, type: "spring", stiffness: 250, damping: 25 }}
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: adjTopY,
                width: capsuleWidth,
                height: h,
                borderRadius: capsuleWidth / 2,
                background: capsule.color
                  ? capsule.isCurrent
                    ? `color-mix(in srgb, ${capsule.color} 40%, var(--bg-secondary))`
                    : `color-mix(in srgb, ${capsule.color} 25%, var(--bg-secondary))`
                  : capsule.isCurrent
                    ? "color-mix(in srgb, var(--brand-7) 35%, var(--bg-secondary))"
                    : "color-mix(in srgb, var(--brand-6) 22%, var(--bg-secondary))",
                border: capsule.color
                  ? `1px solid color-mix(in srgb, ${capsule.color} ${capsule.isCurrent ? "50" : "25"}%, transparent)`
                  : capsule.isCurrent
                    ? "1px solid color-mix(in srgb, var(--brand-8) 40%, transparent)"
                    : "1px solid color-mix(in srgb, var(--brand-6) 15%, transparent)",
                filter: capsule.isFuture ? "blur(2px)" : "none",
                opacity: capsule.isFuture ? 0.4 : 1,
                zIndex: capsule.isCurrent ? 5 : 2,
              }}
              whileTap={{ scale: 0.95 }}
            >
              {capsule.isCurrent && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    borderRadius: capsuleWidth / 2,
                    background:
                      `radial-gradient(ellipse 80% 25% at 50% 85%, color-mix(in srgb, ${capsule.color ?? "var(--accent-purple)"} 12%, transparent) 0%, transparent 70%)`,
                  }}
                />
              )}
              {/* Content block — anchored at bottom, padded inside rounded cap */}
              <div
                className="absolute bottom-0 left-0 right-0 flex flex-col items-center"
                style={{ paddingBottom: capPad - 4, gap: dotGap }}
              >
                {/* Number — only shown for TOCTOCTOC (Peak) capsules */}
                {capsule.tier === "toctoctoc" && capsule.tierOccurrence > 0 && (
                <span
                  className="font-semibold tabular-nums leading-none"
                  style={{
                    color: "var(--text-heading)",
                    fontSize: capsule.isCurrent ? 18 : 14,
                    height: numberSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {capsule.tierOccurrence}
                </span>
                )}
                {/* Planet dots — same planets for all occurrences (same momentum pattern) */}
                {currentCapsule.planets.map((planet, pi) => {
                  const pc = planetConfig[planet];
                  const ds = capsule.isCurrent ? 14 : dotSize;
                  const dc = capsule.isFuture ? "rgba(255, 255, 255, 0.6)" : pc.color;
                  const dg = capsule.isFuture ? "0 0 4px rgba(255,255,255,0.15)" : `0 0 8px ${pc.color}`;
                  return (
                    <motion.div
                      key={planet}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.03 + pi * 0.04, type: "spring", stiffness: 300 }}
                      className="rounded-full"
                      style={{ width: ds, height: ds, background: dc, boxShadow: dg }}
                    />
                  );
                })}
              </div>
            </motion.button>
          );
          })}
        </div>
      </div>

      {/* Navigation: jump between capsules (past ▼ / now ● / future ▲) */}
      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2">
        {/* Past (down in timeline = older) */}
        <motion.button
          type="button"
          onClick={() => jumpToCapsule("past")}
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={PILL_STYLE}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>

        {/* Now */}
        <AnimatePresence>
          {isAwayFromNow && (
            <motion.button
              type="button"
              onClick={scrollToNow}
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              className="flex items-center justify-center rounded-full px-3 py-1 overflow-hidden"
              style={PILL_STYLE}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap">Now</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Future (up in timeline = newer) */}
        <motion.button
          type="button"
          onClick={() => jumpToCapsule("future")}
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={PILL_STYLE}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 7.5L6 3.5L10 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </div>
    </div>
  );
}

// ─── Overview View ──────────────────────────────────────────
function OverviewView({
  capsules,
  onTapCapsule,
  onAgeChange,
}: {
  capsules: CapsuleData[];
  onTapCapsule: (capsule: CapsuleData) => void;
  onAgeChange: (age: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nowY = dateToY(new Date());
  const [isAwayFromNow, setIsAwayFromNow] = useState(false);

  const scrollToNow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const viewportH = el.clientHeight || 700;
    el.scrollTo({ top: Math.max(0, nowY - viewportH * 0.5), behavior: "smooth" });
  }, [nowY]);

  // Dynamic lane sizing — adapt to actual number of lanes & container width
  const labelMargin = 32;
  const rightMargin = 12;
  const availableWidth = 375 - labelMargin - rightMargin; // phone viewport
  const maxCapsuleW = getTierWidth("toctoctoc");
  const idealLaneWidth = maxCapsuleW + LANE_SPACING;
  // If all lanes fit naturally, use natural width. Otherwise compress.
  const laneWidth = LANE_COUNT * idealLaneWidth <= availableWidth
    ? idealLaneWidth
    : Math.max(12, Math.floor(availableWidth / LANE_COUNT));
  const totalLanesWidth = LANE_COUNT * laneWidth;
  const adjustedOffsetX = labelMargin + (availableWidth - totalLanesWidth) / 2;

  // Auto-scroll so NOW is centered — instant on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const viewportH = scrollRef.current.clientHeight || 700;
    scrollRef.current.scrollTop = Math.max(0, nowY - viewportH * 0.50);
  }, [nowY]);

  // Pre-compute capsule positions with collision resolution
  const fitsNaturally = LANE_COUNT * idealLaneWidth <= availableWidth;
  const wScale = fitsNaturally ? 1 : Math.min(1, (laneWidth - LANE_SPACING) / getTierWidth("toctoctoc"));

  const overviewPositions = useMemo(() => {
    const CAPSULE_GAP = 6;
    const maxW = fitsNaturally ? getTierWidth("toctoctoc") : Math.max(10, laneWidth - LANE_SPACING);

    const items = capsules.map((capsule, i) => {
      let topY = dateToY(capsule.endDate);
      const bottomY = dateToY(capsule.startDate);
      const w = Math.max(10, Math.round(getTierWidth(capsule.tier) * wScale));
      const dc = capsule.planets.length;
      const ds = capsule.isCurrent ? 11 : 8;
      const dg = 4;
      const numH = 14; // always show occurrence number
      const dotsH = dc * ds + (dc - 1) * dg;
      const oCapPad = w / 2;
      const minH = Math.max(w, numH + dg + dotsH + oCapPad * 2);
      const h = Math.max(minH, bottomY - topY);
      // Current capsule: shift up so NOW line cuts through it (~55% from top)
      if (capsule.isCurrent) topY -= h * 0.55;
      const laneX = adjustedOffsetX + capsule.lane * laneWidth + (maxW - w) / 2;
      return { capsule, topY, h, w, laneX, idx: i };
    });

    // Group by lane and resolve overlaps
    const lanes = new Map<number, typeof items>();
    for (const item of items) {
      if (!lanes.has(item.capsule.lane)) lanes.set(item.capsule.lane, []);
      lanes.get(item.capsule.lane)!.push(item);
    }
    // Resolve overlaps bidirectionally per lane (same logic as Focus):
    // past pushes DOWN, future pushes UP — never cross NOW
    for (const [, laneItems] of lanes) {
      const cur = laneItems.find((it) => it.capsule.isCurrent);
      if (cur) {
        // Past: below current, push DOWN
        const past = laneItems
          .filter((it) => !it.capsule.isCurrent && !it.capsule.isFuture)
          .sort((a, b) => a.topY - b.topY);
        if (past.length > 0) {
          const curBottom = cur.topY + cur.h + CAPSULE_GAP;
          if (past[0].topY < curBottom) past[0].topY = curBottom;
        }
        for (let i = 1; i < past.length; i++) {
          const prevBottom = past[i - 1].topY + past[i - 1].h + CAPSULE_GAP;
          if (past[i].topY < prevBottom) past[i].topY = prevBottom;
        }
        // Future: above current, push UP
        const future = laneItems
          .filter((it) => it.capsule.isFuture)
          .sort((a, b) => b.topY - a.topY);
        if (future.length > 0) {
          const curTop = cur.topY - CAPSULE_GAP;
          if (future[0].topY + future[0].h > curTop) {
            future[0].topY = curTop - future[0].h;
          }
        }
        for (let i = 1; i < future.length; i++) {
          const nextTop = future[i - 1].topY - CAPSULE_GAP;
          if (future[i].topY + future[i].h > nextTop) {
            future[i].topY = nextTop - future[i].h;
          }
        }
      } else {
        // No current in this lane — simple top-down
        laneItems.sort((a, b) => a.topY - b.topY);
        for (let i = 1; i < laneItems.length; i++) {
          const prevBottom = laneItems[i - 1].topY + laneItems[i - 1].h + CAPSULE_GAP;
          if (laneItems[i].topY < prevBottom) {
            laneItems[i].topY = prevBottom;
          }
        }
      }
    }

    return items;
  }, [capsules, adjustedOffsetX, laneWidth]);

  // Generate month labels for the full timeline
  const monthLabels = useMemo(() => {
    const now = new Date();
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();
    const labels: { month: string; year: number; y: number; isJan: boolean; isCurrent: boolean }[] = [];
    const cursor = new Date(timelineStartDate);
    while (cursor <= timelineEndDate) {
      const y = dateToY(cursor);
      labels.push({
        month: MONTH_NAMES[cursor.getMonth()],
        year: cursor.getFullYear(),
        y,
        isJan: cursor.getMonth() === 0,
        isCurrent: cursor.getMonth() === nowMonth && cursor.getFullYear() === nowYear,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return labels;
  }, []);

  // Snap points: capsule tops (first planet position) + NOW
  const PLANET_OFFSET = 0;
  const snapPoints = useMemo(() => {
    const points = overviewPositions.map((op) => op.topY + PLANET_OFFSET);
    points.push(nowY);
    const sorted = [...new Set(points)].sort((a, b) => a - b);
    // Merge points within 40px of each other (capsules at same time across lanes)
    const merged: number[] = [];
    for (const p of sorted) {
      if (merged.length === 0 || p - merged[merged.length - 1] > 40) {
        merged.push(p);
      } else {
        // Average with previous
        merged[merged.length - 1] = (merged[merged.length - 1] + p) / 2;
      }
    }
    return merged;
  }, [overviewPositions, nowY]);

  // Capsule navigation — stateless, same approach as FocusView.
  const isSnapping = useRef(false);
  const isJumping = useRef(false);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rafId = useRef(0);

  const jumpToCapsule = useCallback((direction: "past" | "future") => {
    const el = scrollRef.current;
    if (!el || isJumping.current || overviewPositions.length === 0) return;

    const barInScroll = el.scrollTop + el.clientHeight * 0.52;
    const sorted = [...overviewPositions].sort((a, b) => a.topY - b.topY);

    let closestIdx = 0;
    let closestDist = Infinity;
    for (let i = 0; i < sorted.length; i++) {
      const dist = Math.abs(sorted[i].topY - barInScroll);
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    }

    const nextIdx = direction === "past"
      ? Math.min(closestIdx + 1, sorted.length - 1)
      : Math.max(closestIdx - 1, 0);
    if (nextIdx === closestIdx) return;

    const targetScroll = Math.max(0, sorted[nextIdx].topY - el.clientHeight * 0.52);
    const start = el.scrollTop;
    const delta = targetScroll - start;
    if (Math.abs(delta) < 2) return;

    isJumping.current = true;
    cancelAnimationFrame(rafId.current);

    const startTime = performance.now();
    const duration = 350;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      el.scrollTop = start + delta * ease(progress);
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        el.scrollTop = targetScroll;
        setTimeout(() => { isJumping.current = false; }, 100);
      }
    };
    rafId.current = requestAnimationFrame(animate);
  }, [overviewPositions]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const centerY = el.scrollTop + el.clientHeight / 2;
      const d = yToDate(centerY);
      const diffMs = d.getTime() - birthDate.getTime();
      const age = Math.max(0, Math.min(100, Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000))));
      onAgeChange(age);
      const distFromNow = Math.abs(centerY - nowY);
      setIsAwayFromNow(distFromNow > el.clientHeight * 0.8);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onAgeChange, nowY]);

  return (
    <div className="relative flex h-full flex-col">
      {/* Scrollable timeline */}
      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden">
        <div className="relative" style={{ height: getTotalHeight() }}>

          {/* Month labels on the left */}
          {monthLabels.map(({ month, year, y, isJan, isCurrent }) => (
            <div key={`${year}-${month}`} className="absolute" style={{ top: y, left: 4 }}>
              {/* Tick mark */}
              <div
                className="absolute"
                style={{
                  top: 0,
                  left: 24,
                  width: isCurrent ? 16 : isJan ? 12 : 6,
                  height: isCurrent ? 1.5 : 1,
                  background: isCurrent
                    ? "rgba(255,255,255,0.5)"
                    : isJan
                      ? "color-mix(in srgb, var(--brand-6) 40%, transparent)"
                      : "color-mix(in srgb, var(--brand-5) 15%, transparent)",
                }}
              />
              {/* Month name — show year instead of "Jan" */}
              <span
                className="absolute -top-1.5 text-[7px] tabular-nums"
                style={{
                  left: 0,
                  width: 22,
                  textAlign: "right",
                  color: isCurrent ? "rgba(255,255,255,0.8)" : isJan ? "var(--text-body-subtle)" : "var(--text-disabled)",
                  fontWeight: isJan ? 600 : 400,
                  fontSize: isJan ? 8 : 7,
                }}
              >
                {isJan ? year : month}
              </span>
            </div>
          ))}

          {/* Capsules — content anchored at bottom, height = duration */}
          {overviewPositions.map(({ capsule, topY: adjTopY, h: capsuleH, w, laneX, idx: i }) => {
            const oDotSize = capsule.isCurrent ? 11 : 8;
            const oDotGap = 4;
            const oNumSize = 14;
            const oCapPad = w / 2;
            return (
            <motion.button
              key={capsule.id}
              type="button"
              onClick={() => onTapCapsule(capsule)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 + i * 0.02, type: "spring", stiffness: 250, damping: 25 }}
              className="absolute"
              style={{
                left: laneX,
                top: adjTopY,
                width: w,
                height: capsuleH,
                borderRadius: w / 2,
                background: capsule.color
                  ? capsule.isCurrent
                    ? `color-mix(in srgb, ${capsule.color} 40%, var(--bg-secondary))`
                    : `color-mix(in srgb, ${capsule.color} 25%, var(--bg-secondary))`
                  : capsule.isCurrent
                    ? "color-mix(in srgb, var(--brand-7) 35%, var(--bg-secondary))"
                    : "color-mix(in srgb, var(--brand-6) 22%, var(--bg-secondary))",
                border: capsule.color
                  ? `1px solid color-mix(in srgb, ${capsule.color} ${capsule.isCurrent ? "50" : "25"}%, transparent)`
                  : capsule.isCurrent
                    ? "1px solid color-mix(in srgb, var(--brand-8) 40%, transparent)"
                    : "1px solid color-mix(in srgb, var(--brand-6) 15%, transparent)",
                filter: capsule.isFuture ? "blur(2px)" : "none",
                opacity: capsule.isFuture ? 0.4 : 1,
                zIndex: capsule.isCurrent ? 5 : 2,
              }}
              whileTap={{ scale: 0.95 }}
            >
              {capsule.isCurrent && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    borderRadius: w / 2,
                    background:
                      `radial-gradient(ellipse 80% 25% at 50% 85%, color-mix(in srgb, ${capsule.color ?? "var(--accent-purple)"} 12%, transparent) 0%, transparent 70%)`,
                  }}
                />
              )}
              {/* Content block — anchored at bottom inside rounded cap */}
              <div
                className="absolute bottom-0 left-0 right-0 flex flex-col items-center"
                style={{ paddingBottom: oCapPad - 2, gap: oDotGap }}
              >
                {capsule.tier === "toctoctoc" && capsule.tierOccurrence > 0 && (
                <span
                  className="font-semibold tabular-nums leading-none"
                  style={{
                    color: "var(--text-heading)",
                    fontSize: capsule.isCurrent ? 14 : 10,
                    height: oNumSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {capsule.tierOccurrence}
                </span>
                )}
                {capsule.planets.map((planet) => {
                  const pc = planetConfig[planet];
                  const dc = capsule.isFuture ? "rgba(255, 255, 255, 0.6)" : pc.color;
                  const dg = capsule.isFuture
                    ? "0 0 4px rgba(255,255,255,0.15)"
                    : capsule.isCurrent
                      ? `0 0 8px ${pc.color}`
                      : `0 0 4px color-mix(in srgb, ${pc.color} 40%, transparent)`;
                  return (
                    <div
                      key={planet}
                      className="rounded-full"
                      style={{ width: oDotSize, height: oDotSize, background: dc, boxShadow: dg }}
                    />
                  );
                })}
              </div>
            </motion.button>
            );
          })}
        </div>
      </div>

      {/* Navigation: jump between capsules */}
      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2">
        <motion.button
          type="button"
          onClick={() => jumpToCapsule("past")}
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={PILL_STYLE}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>

        <AnimatePresence>
          {isAwayFromNow && (
            <motion.button
              type="button"
              onClick={scrollToNow}
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              className="flex items-center justify-center rounded-full px-3 py-1 overflow-hidden"
              style={PILL_STYLE}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap">Now</span>
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => jumpToCapsule("future")}
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={PILL_STYLE}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 7.5L6 3.5L10 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </div>
    </div>
  );
}

// ─── List View ───────────────────────────────────────────────
// Compact vertical list with spine — scannable, chronological
function ListView({
  capsules,
  onTapCapsule,
}: {
  capsules: CapsuleData[];
  onTapCapsule: (capsule: CapsuleData) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLButtonElement>(null);

  // Sort chronologically (most recent first for natural reading)
  const sorted = useMemo(() => {
    return [...capsules].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }, [capsules]);

  // Auto-scroll to current on mount
  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, []);

  return (
    <div ref={scrollRef} className="no-scrollbar h-full overflow-y-auto px-4 pb-6">
      {/* Spine + rows */}
      <div className="relative ml-3">
        {/* Vertical spine */}
        <div
          className="absolute top-0 bottom-0"
          aria-hidden="true"
          style={{
            left: 3,
            width: 1,
            background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent-purple) 30%, transparent) 5%, color-mix(in srgb, var(--accent-purple) 30%, transparent) 95%, transparent)",
          }}
        />

        {sorted.map((capsule, i) => {
          const phase = capsule.phases[0];
          if (!phase) return null;
          const tierLabel = capsule.tier === "toctoctoc" ? "PEAK" : capsule.tier === "toctoc" ? "CLEAR" : "SUBTLE";
          const startLabel = `${MONTH_NAMES[capsule.startDate.getMonth()]} '${String(capsule.startDate.getFullYear()).slice(2)}`;
          const endLabel = capsule.isCurrent
            ? "now"
            : `${MONTH_NAMES[capsule.endDate.getMonth()]} '${String(capsule.endDate.getFullYear()).slice(2)}`;
          const maxIntensity = Math.max(...capsule.phases.map(p => p.intensity));

          return (
            <motion.button
              key={capsule.id}
              ref={capsule.isCurrent ? currentRef : undefined}
              type="button"
              onClick={() => !capsule.isFuture && onTapCapsule(capsule)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              className="relative flex w-full items-start gap-3 py-2.5 text-left"
              style={{ opacity: capsule.isFuture ? 0.45 : 1 }}
            >
              {/* Dot on spine */}
              <div className="relative z-10 mt-1.5 flex flex-shrink-0 items-center justify-center" style={{ width: 7 }}>
                <div
                  className="rounded-full"
                  style={{
                    width: capsule.isCurrent ? 9 : 6,
                    height: capsule.isCurrent ? 9 : 6,
                    background: capsule.isCurrent
                      ? "var(--accent-purple)"
                      : "color-mix(in srgb, var(--accent-purple) 50%, transparent)",
                    boxShadow: capsule.isCurrent
                      ? "0 0 10px rgba(149, 133, 204, 0.6)"
                      : "none",
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-semibold leading-tight truncate"
                    style={{ color: capsule.isCurrent ? "#fff" : "var(--text-heading)" }}
                  >
                    {phase.title}
                  </span>
                  {capsule.isCurrent && (
                    <span
                      className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider"
                      style={{
                        background: "color-mix(in srgb, var(--accent-purple) 30%, transparent)",
                        color: "#C1A7FF",
                        border: "1px solid color-mix(in srgb, var(--accent-purple) 40%, transparent)",
                      }}
                    >
                      NOW
                    </span>
                  )}
                </div>

                <span className="mt-0.5 block text-[9px]" style={{ color: "var(--text-disabled)" }}>
                  {startLabel} — {endLabel}
                </span>

                {/* Planet dots + tier */}
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {capsule.planets.map((planet) => {
                      const pc = planetConfig[planet];
                      return (
                        <div
                          key={planet}
                          className="h-[5px] w-[5px] rounded-full"
                          style={{
                            background: capsule.isFuture ? "rgba(255,255,255,0.4)" : pc.color,
                            boxShadow: capsule.isFuture ? "none" : `0 0 3px ${pc.color}`,
                          }}
                        />
                      );
                    })}
                  </div>
                  <span
                    className="text-[7px] font-semibold tracking-wider"
                    style={{ color: "color-mix(in srgb, var(--accent-purple) 60%, transparent)" }}
                  >
                    {tierLabel}
                  </span>
                </div>
              </div>

              {/* Intensity */}
              <div className="flex-shrink-0 pt-0.5">
                <span
                  className="text-[13px] font-bold tabular-nums"
                  style={{ color: capsule.isCurrent ? "#C1A7FF" : "var(--text-body-subtle)" }}
                >
                  {maxIntensity}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
// Persist view mode preference
function getSavedViewMode(): ViewMode {
  if (typeof window === "undefined") return "focus";
  return (localStorage.getItem("unfold_view_mode") as ViewMode) || "focus";
}

export function MomentumTimelineV2() {
  const { timelinePhases, birthDateStr } = useMomentum();
  const [viewMode, _setViewMode] = useState<ViewMode>(getSavedViewMode);
  const setViewMode = useCallback((mode: ViewMode) => {
    _setViewMode(mode);
    if (typeof window !== "undefined") localStorage.setItem("unfold_view_mode", mode);
  }, []);
  const [selectedCapsule, setSelectedCapsule] = useState<CapsuleData | null>(null);

  // Initialize date helpers from birth data
  useMemo(() => initDates(birthDateStr), [birthDateStr]);

  const currentAge = useMemo(() => {
    const bd = new Date(birthDateStr + "T00:00:00");
    const now = new Date();
    let age = now.getFullYear() - bd.getFullYear();
    const m = now.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
    return age;
  }, [birthDateStr]);

  const [visibleAge, setVisibleAge] = useState(currentAge);

  const currentCapsule = useMemo(() => buildCurrentCapsule(timelinePhases), [timelinePhases]);
  const allCapsules = useMemo(() => buildCapsules(timelinePhases), [timelinePhases]);

  const handleTapCapsule = useCallback((capsule: CapsuleData) => {
    if (capsule.isFuture) return;
    setSelectedCapsule(capsule);
  }, []);

  const handleAgeChange = useCallback((age: number) => {
    setVisibleAge(age);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* ── Unified header bar ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-2 pb-1">
        {/* Left — spacer (age moved to NOW bar) */}
        <div style={{ minWidth: 36 }} />

        {/* Center — 3-way toggle */}
        <div
          className="flex items-center gap-0.5 rounded-full p-0.5"
          style={{
            background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent-purple) 15%, transparent)",
          }}
        >
          {(["focus", "overview", "list"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className="relative rounded-full px-2.5 py-1 text-[8px] font-semibold uppercase tracking-wider transition-all duration-200"
              style={{
                color: viewMode === mode ? "#fff" : "var(--text-disabled)",
                background: viewMode === mode ? "var(--accent-purple)" : "transparent",
              }}
            >
              {mode === "focus" ? "Focus" : mode === "overview" ? "All" : "List"}
            </button>
          ))}
        </div>

        {/* Right — spacer for balance */}
        <div style={{ minWidth: 36 }} />
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "focus" && currentCapsule ? (
          <motion.div
            key="focus"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full pt-9"
          >
            <FocusView
              currentCapsule={currentCapsule}
              allCapsules={allCapsules}
              onClose={() => setViewMode("overview")}
              onTapCapsule={handleTapCapsule}
              onAgeChange={handleAgeChange}
            />
          </motion.div>
        ) : viewMode === "overview" ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full pt-9"
          >
            <OverviewView capsules={allCapsules} onTapCapsule={handleTapCapsule} onAgeChange={handleAgeChange} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full pt-9"
          >
            <ListView capsules={allCapsules} onTapCapsule={handleTapCapsule} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed age indicator — minimal, premium.
          A thin line across the screen with the age on the right.
          Quiet when browsing past/future. Glows when aligned with today. */}
      {viewMode !== "list" && (() => {
        const isToday = visibleAge === currentAge;
        return (
        <div
          className="pointer-events-none absolute left-0 right-0 z-20"
          style={{ top: "calc(50% + 20px)" }}
        >
          {/* Thin horizontal line — full width, subtle */}
          <div
            style={{
              height: 1,
              marginLeft: 56,
              marginRight: 12,
              background: isToday
                ? "linear-gradient(90deg, rgba(124,107,191,0.1), rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.5) 70%, transparent)"
                : "linear-gradient(90deg, rgba(124,107,191,0.08), rgba(124,107,191,0.25) 30%, rgba(124,107,191,0.25) 70%, transparent)",
              transition: "all 0.5s ease-out",
            }}
          />
          {/* Age — positioned right, vertically centered on the line */}
          <div
            className="absolute right-3 flex items-baseline gap-1"
            style={{ top: -9 }}
          >
            <span
              className="font-display tabular-nums leading-none"
              style={{
                color: isToday ? "rgba(255,255,255,0.9)" : "rgba(124,107,191,0.5)",
                fontSize: 18,
                fontWeight: 300,
                letterSpacing: "-0.02em",
                transition: "color 0.5s ease-out",
              }}
            >
              {visibleAge}
            </span>
          </div>
        </div>
        );
      })()}

      {/* Detail sheet */}
      <AnimatePresence>
        {selectedCapsule && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.4)" }}
              onClick={() => setSelectedCapsule(null)}
            />
            <DetailSheet capsule={selectedCapsule} onClose={() => setSelectedCapsule(null)} />
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
