"use client";

import { useState, useRef, useEffect, useCallback, useMemo, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { planetConfig, type DomainKey, type PlanetKey } from "@/lib/domain-config";
import { TimelineWelcome, shouldShowWelcome } from "./TimelineWelcome";
import { FirstUseGuide, shouldShowFirstUseGuide } from "./FirstUseGuide";
import {
  type MomentumPhase,
} from "@/lib/mock-timeline";
import { useMomentum } from "@/lib/momentum-store";
import { CapsuleDetailSheet } from "./CapsuleDetailSheet";
import { DailyBriefing } from "./DailyBriefing";
import { isPremium } from "@/lib/premium-gate";
import { usePremiumTeaser } from "./PremiumTeaserContext";
import { preGenerateForCapsules } from "@/lib/openai-personalize";
import { getUserProfileSync } from "@/lib/user-profile";
import { getBirthDataSync } from "@/lib/birth-data";
import { getObservedProfileSync } from "@/lib/observed-profile";
import { buildEffectiveProfile } from "@/lib/effective-profile";

// ─── Types ──────────────────────────────────────────────────
type ViewMode = "overview" | "list";

type Tier = "toc" | "toctoc" | "toctoctoc";

interface CapsuleData {
  id: string;
  phases: MomentumPhase[];
  domains: { domain: DomainKey; intensity: number; occurrence: number; totalOccurrences: number }[];
  planets: PlanetKey[]; // 1-5 planetary transits — dot colors come from here
  /** Topic colors from API — one per dot */
  topicColors?: string[];
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

// ─── House color palette — muted, purple-rooted, premium ────
// Maps API house hex colors to Unfold-branded equivalents.
// 12 hues that stay in the mauve/purple family with enough distinction.
const HOUSE_PALETTE: Record<string, string> = {
  // API color → Unfold muted equivalent
  "#EF4444": "#C4727A", // house 1  — dusty rose
  "#F97316": "#C48A6A", // house 2  — warm mauve
  "#EAB308": "#B8A472", // house 3  — muted gold
  "#22C55E": "#7BA88A", // house 4  — sage
  "#14B8A6": "#6FA3A0", // house 5  — teal muted
  "#06B6D4": "#7A9EBB", // house 6  — dusty blue
  "#3B82F6": "#7B8CC4", // house 7  — periwinkle
  "#6366F1": "#8B80C9", // house 8  — soft indigo
  "#8B5CF6": "#9B85C4", // house 9  — lavender
  "#A855F7": "#A07FBD", // house 10 — orchid
  "#D946EF": "#B07AAF", // house 11 — mauve pink
  "#EC4899": "#BC7A96", // house 12 — dusty pink
  // toctoc-app sausage colors (different palette from API)
  "#F17E7A": "#C4727A", // → dusty rose
  "#FF9040": "#C48A6A", // → warm mauve
  "#FED857": "#B8A472", // → muted gold
  "#AAD681": "#7BA88A", // → sage
  "#FF7CA4": "#BC7A96", // → dusty pink
  "#F375CB": "#B07AAF", // → mauve pink
  "#89A4FF": "#7B8CC4", // → periwinkle
  "#FFB898": "#C49882", // → warm sand
  "#9B1C1C": "#8B5060", // → deep burgundy muted
};
function mapHouseColor(apiColor?: string): string | undefined {
  if (!apiColor) return undefined;
  return HOUSE_PALETTE[apiColor.toUpperCase()] || HOUSE_PALETTE[apiColor] || apiColor;
}

import { S, LAYOUT } from "@/lib/layout-constants";

// ─── Constants ──────────────────────────────────────────────
let LANE_COUNT = 7;
const PX_PER_MONTH = 112;
const LANE_SPACING = 6;
const MIN_GAP_MS = 0;

// Tier from raw API score (1-4) — no interpretation, direct from backend
function getTier(_intensity: number, score?: number): Tier {
  const s = score ?? 1;
  if (s >= 3) return "toctoctoc"; // score 3-4 — major transits (large)
  if (s >= 2) return "toctoc";    // score 2 — clear transits (medium)
  return "toc";                   // score 1 — subtle (thin)
}
function getTierWidth(tier: Tier): number {
  if (tier === "toc") return 14;       // score 1 — fin
  if (tier === "toctoc") return 21;    // score 2 — moyen (x1.5)
  return 28;                           // score 3-4 — large (x2)
}

// ─── Lane assignment: temporal collision detection ──────────
// Three passes: TOCTOCTOC first (strongest → left lanes, most visible),
// then TOCTOC (medium → middle), then TOC (lightest → right).
// Within each tier, capsules go on the first free lane (no overlap).
// Left = lightest (toc), right = strongest (toctoctoc, thumb zone)
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

/** Compute X position for a lane based on actual tier widths — uniform gap between edges */
function getLaneX(lane: number, capsules: CapsuleData[], gap: number): number {
  // Build lane→tier map (each lane has one tier since assignLanes groups by tier)
  const laneTier = new Map<number, Tier>();
  for (const c of capsules) {
    if (!laneTier.has(c.lane)) laneTier.set(c.lane, c.tier);
  }
  let x = 0;
  for (let i = 0; i < lane; i++) {
    const tier = laneTier.get(i) ?? "toctoc";
    x += getTierWidth(tier) + gap;
  }
  return x;
}

const TIMELINE_PAD = 80;

// ─── Shared glass pill style (matches ViewToggle glass effect) ──────────────
// Uses a semi-opaque dark base so small buttons stay readable over capsules
const PILL_STYLE: React.CSSProperties = {
  background: "color-mix(in srgb, var(--accent-purple) 20%, rgba(27, 21, 53, 0.75))",
  color: "var(--accent-purple)",
  border: "1px solid color-mix(in srgb, var(--accent-purple) 30%, transparent)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

// ─── Date helpers ───────────────────────────────────────────
// These are now computed inside the component from the hook's birthDateStr.
// Module-level placeholders used by helper functions — overwritten in the component.
let birthDate = new Date();
let timelineStartDate = new Date();
let timelineEndDate = new Date();

function initDates(birthStr: string) {
  if (!birthStr) return;
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
const BIRTH_EASTER_EGG_PAD = 280; // padding below birth: easter egg content + breathing room
function getTotalHeight() { return TIMELINE_PAD * 2 + getTotalMonths() * PX_PER_MONTH + BIRTH_EASTER_EGG_PAD; }

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

/** Number of dots for a capsule (topics from API, or fallback to planets) */
function getDotCount(c: CapsuleData): number {
  return c.topicColors?.length || c.planets.length;
}

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

  // No merge — each sausage = one capsule, even current ones
  const birthMs = birthDate.getTime();
  const nowMs = Date.now();

  for (const phase of sorted) {
    const rawStart = parseDate(phase.startDate);
    const end = phase.endDate
      ? parseDate(phase.endDate)
      : new Date(rawStart.getTime() + phase.durationWeeks * 7 * 24 * 60 * 60 * 1000);

    if (end.getTime() < birthMs) continue;
    const start = rawStart.getTime() < birthMs ? new Date(birthMs) : rawStart;

    domainCounter[phase.domain] = (domainCounter[phase.domain] || 0) + 1;

    const tier = getTier(phase.intensity, phase.score);
    const isCurrent = start.getTime() <= nowMs && end.getTime() >= nowMs;

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
      topicColors: phase.topicColors,
      startDate: start,
      endDate: end,
      lane: 0,
      tier,
      tierOccurrence: 0,
      tierTotal: 0,
      isCurrent,
      isFuture: start.getTime() > nowMs,
      color: phase.color,
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
  const [scrollRange, setScrollRange] = useState<[number, number]>([0, 2000]);

  const scrollToNow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const viewportH = el.clientHeight || 700;
    el.scrollTo({ top: Math.max(0, nowY - viewportH * 0.5), behavior: "smooth" });
  }, [nowY]);

  // Dynamic lane sizing — adapt to actual container width (responsive)
  const [containerWidth, setContainerWidth] = useState(375);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth || 375);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const labelMargin = 32;
  const rightMargin = 12;
  const availableWidth = containerWidth - labelMargin - rightMargin;
  // Compute total width from actual lane widths (variable per tier)
  const totalLanesWidth = getLaneX(LANE_COUNT, capsules, LANE_SPACING);
  const laneWidth = LANE_COUNT > 0 ? totalLanesWidth / LANE_COUNT : 28; // avg for legacy refs
  const adjustedOffsetX = labelMargin + Math.max(0, (availableWidth - totalLanesWidth) / 2);

  // Auto-scroll so NOW is centered — instant on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const viewportH = scrollRef.current.clientHeight || 700;
    const scrollTop = Math.max(0, nowY - viewportH * 0.50);
    scrollRef.current.scrollTop = scrollTop;
    setScrollRange([scrollTop, scrollTop + viewportH]);
  }, [nowY]);

  // Pre-compute capsule positions with collision resolution
  const fitsNaturally = totalLanesWidth <= availableWidth;

  const overviewPositions = useMemo(() => {
    const CAPSULE_GAP = 6;

    // Max Y = birth date position (nothing below birth)
    const birthY = dateToY(birthDate);
    const birthMs = birthDate.getTime();

    // Filter out capsules that end before birth
    const visibleCapsules = capsules.filter(c => c.endDate.getTime() >= birthMs);

    const items = visibleCapsules.map((capsule, i) => {
      let topY = dateToY(capsule.endDate);
      // Clamp: capsule can't extend below birth
      const rawBottomY = dateToY(capsule.startDate);
      const bottomY = Math.min(rawBottomY, birthY);
      // 3 visually distinct widths from getTierWidth
      const w = getTierWidth(capsule.tier);
      const dc = getDotCount(capsule);
      const ds = capsule.isCurrent ? 11 : 8;
      const dg = 4;
      const dotsH = dc * ds + (dc - 1) * dg;
      const oCapPad = w / 2;
      const minH = Math.max(w, dotsH + oCapPad * 2);
      let h = Math.max(minH, bottomY - topY);
      // Clamp: if minH pushes capsule below birth, shift it up
      if (topY + h > birthY) topY = birthY - h;
      // Position by accumulating actual widths per lane — uniform gap between capsule edges
      const laneX = adjustedOffsetX + getLaneX(capsule.lane, capsules, LANE_SPACING);
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

    // Final clamp: remove any capsule pushed entirely below birth by overlap resolver
    return items.filter(it => it.topY < birthY);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capsules]); // recalculate when data (and thus initDates) changes

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

  const jumpByYear = useCallback((direction: "past" | "future") => {
    const el = scrollRef.current;
    if (!el || isJumping.current) return;

    const oneYear = 12 * PX_PER_MONTH;
    const delta = direction === "past" ? oneYear : -oneYear;
    const targetScroll = Math.max(0, Math.min(el.scrollHeight - el.clientHeight, el.scrollTop + delta));

    isJumping.current = true;
    el.scrollTo({ top: targetScroll, behavior: "smooth" });
    setTimeout(() => { isJumping.current = false; }, 800);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let lastAge = -1;
    let lastAway = false;
    let rafPending = false;

    const onScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        // Track visible scroll range for month label virtualization
        setScrollRange([el.scrollTop, el.scrollTop + el.clientHeight]);
        const centerY = el.scrollTop + el.clientHeight / 2;
        const d = yToDate(centerY);
        const diffMs = d.getTime() - birthDate.getTime();
        const age = Math.max(0, Math.min(100, Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000))));
        if (age !== lastAge) { lastAge = age; onAgeChange(age); }
        const away = Math.abs(centerY - nowY) > el.clientHeight * 0.8;
        if (away !== lastAway) { lastAway = away; setIsAwayFromNow(away); }
      });
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

          {/* Month labels on the left — virtualized: only render visible range + buffer */}
          {monthLabels.filter(({ y }) => y > scrollRange[0] - 500 && y < scrollRange[1] + 500).map(({ month, year, y, isJan, isCurrent }) => (
            <div key={`${year}-${month}`} className="absolute" style={{ top: y, left: 4 }}>
              {/* Current month: pill badge */}
              {isCurrent ? (
                <div
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    top: -8,
                    left: -2,
                    width: 30,
                    height: 16,
                    background: "color-mix(in srgb, var(--accent-purple) 18%, transparent)",
                  }}
                >
                  <span
                    className="tabular-nums uppercase"
                    style={{
                      color: "var(--accent-purple)",
                      fontWeight: 700,
                      fontSize: 8,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {month}
                  </span>
                </div>
              ) : (
                <>
                  {/* Tick mark */}
                  <div
                    className="absolute"
                    style={{
                      top: 0,
                      left: 24,
                      width: isJan ? 12 : 6,
                      height: 1,
                      background: isJan
                        ? "color-mix(in srgb, var(--brand-6) 40%, transparent)"
                        : "color-mix(in srgb, var(--brand-5) 15%, transparent)",
                    }}
                  />
                  {/* Month name */}
                  <span
                    className="absolute -top-1.5 tabular-nums"
                    style={{
                      left: 0,
                      width: 22,
                      textAlign: "right",
                      color: isJan ? "var(--text-body-subtle)" : "var(--text-disabled)",
                      fontWeight: isJan ? 600 : 400,
                      fontSize: isJan ? 8 : 7,
                    }}
                  >
                    {isJan ? year : month}
                  </span>
                </>
              )}
            </div>
          ))}

          {/* Capsules — content anchored at bottom, height = duration */}
          {overviewPositions.map(({ capsule, topY: adjTopY, h: capsuleH, w, laneX, idx: i }) => {
            const hc = mapHouseColor(capsule.color);
            const oDotSize = capsule.isCurrent ? 8 : 6;
            const oDotGap = 3;
            const oCapPad = w / 2;
            return (
            <motion.button
              key={capsule.id}
              type="button"
              onClick={() => onTapCapsule(capsule)}
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute"
              style={{
                left: laneX,
                top: adjTopY,
                width: w,
                height: capsuleH,
                borderRadius: w / 2,
                background: `color-mix(in srgb, ${hc ?? "var(--accent-purple)"} ${capsule.isCurrent ? "12" : "8"}%, transparent)`,
                border: `1.5px solid color-mix(in srgb, ${hc ?? "var(--accent-purple)"} ${capsule.isCurrent ? "30" : "18"}%, transparent)`,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: capsule.isCurrent
                  ? `0 0 16px color-mix(in srgb, ${hc ?? "var(--accent-purple)"} 20%, transparent)`
                  : "none",
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
                      `radial-gradient(ellipse 80% 25% at 50% 85%, color-mix(in srgb, ${hc ?? "var(--accent-purple)"} 12%, transparent) 0%, transparent 70%)`,
                  }}
                />
              )}
              {/* Content block — anchored at bottom inside rounded cap */}
              <div
                className="absolute bottom-0 left-0 right-0 flex flex-col items-center"
                style={{ paddingBottom: oCapPad - 2, gap: oDotGap }}
              >
                {(capsule.topicColors?.length ? capsule.topicColors : capsule.planets.map(p => planetConfig[p].color)).map((color, pi) => {
                  const dc = capsule.isFuture ? "rgba(255, 255, 255, 0.6)" : color;
                  const dg = capsule.isFuture
                    ? "0 0 4px rgba(255,255,255,0.15)"
                    : capsule.isCurrent
                      ? `0 0 8px ${color}`
                      : `0 0 4px color-mix(in srgb, ${color} 40%, transparent)`;
                  return (
                    <div
                      key={`dot-${pi}`}
                      className="rounded-full"
                      style={{ width: oDotSize, height: oDotSize, background: dc, boxShadow: dg }}
                    />
                  );
                })}
              </div>
            </motion.button>
            );
          })}

          {/* Birth Easter egg — just above the age-0 bar */}
          <div
            className="absolute left-0 right-0 flex flex-col items-center"
            style={{
              top: getTotalHeight() - BIRTH_EASTER_EGG_PAD + 60,
            }}
          >
            {/* Message — the easter egg */}
            <p
              className="max-w-[240px] text-center leading-relaxed"
              style={{
                fontSize: 13,
                color: "color-mix(in srgb, var(--accent-purple) 80%, transparent)",
                fontWeight: 400,
              }}
            >
              You weren&apos;t even crawling yet.
              <br />
              But the planets were already busy.
            </p>

            {/* Divider line */}
            <div
              className="w-10 mt-5 mb-3"
              style={{
                height: 1,
                background: "linear-gradient(90deg, transparent, var(--accent-purple), transparent)",
                opacity: 0.3,
              }}
            />

            {/* Birth date — secondary, quiet */}
            <p
              className="font-display tracking-tight"
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: "color-mix(in srgb, var(--accent-purple) 45%, transparent)",
                letterSpacing: "-0.02em",
              }}
            >
              {birthDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* NOW button — center bottom */}
      <AnimatePresence>
        {isAwayFromNow && (
          <motion.button
            type="button"
            onClick={scrollToNow}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 z-30 flex h-8 items-center justify-center rounded-full px-3"
            style={{ ...PILL_STYLE, bottom: 68 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider">Now</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Up/Down — right side, stacked vertically, thumb zone */}
      <div className="absolute right-3 z-30 flex flex-col items-center gap-2" style={{ bottom: 68 }}>
        <motion.button
          type="button"
          onClick={() => jumpByYear("future")}
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={PILL_STYLE}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 7.5L6 3.5L10 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
        <motion.button
          type="button"
          onClick={() => jumpByYear("past")}
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={PILL_STYLE}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
  onAgeChange,
}: {
  capsules: CapsuleData[];
  onTapCapsule: (capsule: CapsuleData) => void;
  onAgeChange?: (age: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLButtonElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [isAwayFromNow, setIsAwayFromNow] = useState(false);

  // Sort chronologically (most recent first for natural reading)
  const sorted = useMemo(() => {
    return [...capsules].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }, [capsules]);

  // Flatten sorted capsules into a list of { type: "header" | "capsule" } items for virtualization
  type FlatItem = { type: "header"; monthKey: string } | { type: "capsule"; capsule: CapsuleData };
  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    let lastMonthKey = "";
    for (const capsule of sorted) {
      const monthKey = `${MONTH_NAMES[capsule.startDate.getMonth()]} ${capsule.startDate.getFullYear()}`;
      if (monthKey !== lastMonthKey) {
        items.push({ type: "header", monthKey });
        lastMonthKey = monthKey;
      }
      items.push({ type: "capsule", capsule });
    }
    return items;
  }, [sorted]);

  // Find the index of the current capsule for initial scroll
  const currentIndex = useMemo(() => {
    return flatItems.findIndex(item => item.type === "capsule" && item.capsule.isCurrent);
  }, [flatItems]);

  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => flatItems[index]?.type === "header" ? 36 : 64,
    overscan: 10,
  });

  // Auto-scroll to current on mount
  useEffect(() => {
    if (currentIndex >= 0) {
      virtualizer.scrollToIndex(currentIndex, { align: "center" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Cache birth year once (avoid localStorage reads on every scroll)
  const birthYearRef = useRef<number>(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('unfold_birth_data');
      birthYearRef.current = raw ? parseInt(JSON.parse(raw).birthDate?.split('-')[0] || '1985') : 1985;
    } catch { birthYearRef.current = 1985; }
  }, []);

  // Track visible age from virtualizer scroll offset (no manual scroll listener needed)
  // useVirtualizer returns a new object each render with updated scrollOffset,
  // so we derive age reactively from the virtual items.
  const virtualItems = virtualizer.getVirtualItems();
  const scrollOffset = virtualizer.scrollOffset ?? 0;
  const scrollSize = scrollRef.current?.clientHeight ?? 700;

  useEffect(() => {
    if (!onAgeChange || virtualItems.length === 0) return;
    const viewportCenter = scrollOffset + scrollSize / 2;
    // Find the virtual item closest to viewport center
    let closestCapsule: CapsuleData | null = null;
    let closestDist = Infinity;
    for (const vItem of virtualItems) {
      const itemCenter = vItem.start + vItem.size / 2;
      const dist = Math.abs(itemCenter - viewportCenter);
      if (dist < closestDist) {
        const fi = flatItems[vItem.index];
        if (fi?.type === "capsule") {
          closestDist = dist;
          closestCapsule = fi.capsule;
        }
      }
    }
    if (closestCapsule) {
      onAgeChange(closestCapsule.startDate.getFullYear() - birthYearRef.current);
    }
    // Detect if we're away from "now"
    if (currentIndex >= 0) {
      const firstVisible = virtualItems[0]?.index ?? 0;
      const lastVisible = virtualItems[virtualItems.length - 1]?.index ?? 0;
      const away = currentIndex < firstVisible || currentIndex > lastVisible;
      setIsAwayFromNow(away);
    }
  }, [virtualItems, scrollOffset, scrollSize, flatItems, onAgeChange, currentIndex]);

  const scrollToNow = useCallback(() => {
    if (currentIndex >= 0) {
      virtualizer.scrollToIndex(currentIndex, { align: "center", behavior: "smooth" });
    }
  }, [currentIndex, virtualizer]);

  // Jump by year — find the next year-boundary header in flatItems relative to current viewport
  const jumpByYear = useCallback((direction: "future" | "past") => {
    const el = scrollRef.current;
    if (!el) return;
    // Find which flatItem is currently centered
    const viewportCenter = el.scrollTop + el.clientHeight / 2;
    let centerIdx = 0;
    const items = virtualizer.getVirtualItems();
    for (const item of items) {
      if (item.start + item.size / 2 >= viewportCenter) { centerIdx = item.index; break; }
      centerIdx = item.index;
    }
    // Extract current year from center item
    let currentYear = new Date().getFullYear();
    for (let i = centerIdx; i >= 0; i--) {
      const fi = flatItems[i];
      if (fi?.type === "header") {
        const y = parseInt(fi.monthKey.split(" ").pop() || "");
        if (!isNaN(y)) { currentYear = y; break; }
      }
      if (fi?.type === "capsule") {
        currentYear = fi.capsule.startDate.getFullYear();
        break;
      }
    }
    // Sorted is most recent first → "future" = earlier index, "past" = later index
    const targetYear = direction === "future" ? currentYear + 1 : currentYear - 1;
    // Find header for target year
    const targetIdx = flatItems.findIndex(
      (fi) => fi.type === "header" && fi.monthKey.endsWith(String(targetYear))
    );
    if (targetIdx >= 0) {
      virtualizer.scrollToIndex(targetIdx, { align: "start", behavior: "smooth" });
    }
  }, [flatItems, virtualizer]);

  return (
    <div className="relative h-full">
      {/* NOW button — absolute, centered bottom */}
      {isAwayFromNow && (
        <button
          type="button"
          onClick={scrollToNow}
          className="absolute left-1/2 -translate-x-1/2 z-30 flex h-8 items-center justify-center rounded-full px-3"
          style={{ ...PILL_STYLE, bottom: 68 }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider">Now</span>
        </button>
      )}

      {/* Up/Down — absolute right, jump by year like overview */}
      <div className="absolute right-3 z-30 flex flex-col items-center gap-2" style={{ bottom: 68 }}>
        <button type="button" onClick={() => jumpByYear("future")} className="flex h-8 w-8 items-center justify-center rounded-full" style={PILL_STYLE}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 7.5L6 3.5L10 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button type="button" onClick={() => jumpByYear("past")} className="flex h-8 w-8 items-center justify-center rounded-full" style={PILL_STYLE}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div ref={scrollRef} className="no-scrollbar h-full overflow-y-auto px-4 pb-6">
      {/* Spine + virtualized rows */}
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

        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = flatItems[virtualRow.index];
            if (!item) return null;

            if (item.type === "header") {
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div className="mt-4 mb-2 ml-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--accent-purple)", opacity: 0.5 }}>
                      {item.monthKey}
                    </span>
                  </div>
                </div>
              );
            }

            const capsule = item.capsule;
            const phase = capsule.phases[0];
            if (!phase) return null;

            const tierLabel = capsule.tier === "toctoctoc" ? "PEAK" : capsule.tier === "toctoc" ? "CLEAR" : "SUBTLE";
            const startLabel = `${capsule.startDate.getDate()} ${MONTH_NAMES[capsule.startDate.getMonth()]} '${String(capsule.startDate.getFullYear()).slice(2)}`;
            const endLabel = capsule.isCurrent
              ? "now"
              : `${capsule.endDate.getDate()} ${MONTH_NAMES[capsule.endDate.getMonth()]} '${String(capsule.endDate.getFullYear()).slice(2)}`;
            const maxIntensity = Math.max(...capsule.phases.map(p => p.intensity));
            const dotColors = capsule.topicColors?.length ? capsule.topicColors : capsule.planets.map(p => planetConfig[p].color);

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${virtualRow.start}px)` }}
              >
              <button
                ref={capsule.isCurrent ? currentRef : undefined}
                type="button"
                onClick={() => onTapCapsule(capsule)}
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
                        ? (capsule.color || "var(--accent-purple)")
                        : `color-mix(in srgb, ${capsule.color || "var(--accent-purple)"} 70%, transparent)`,
                      boxShadow: capsule.isCurrent
                        ? `0 0 10px ${capsule.color || "rgba(149, 133, 204, 0.6)"}`
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
                      {dotColors.map((color, pi) => (
                        <div
                          key={`dot-${pi}`}
                          className="h-[5px] w-[5px] rounded-full"
                          style={{
                            background: capsule.isFuture ? "rgba(255,255,255,0.4)" : color,
                            boxShadow: capsule.isFuture ? "none" : `0 0 3px ${color}`,
                          }}
                        />
                      ))}
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
              </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
// Persist view mode preference
function getSavedViewMode(): ViewMode {
  if (typeof window === "undefined") return "overview";
  const saved = localStorage.getItem("unfold_view_mode");
  if (saved === "overview" || saved === "list") return saved;
  return "overview";
}

export function MomentumTimelineV2() {
  const { timelinePhases, phases, birthDateStr, state, isLoadingLifetime } = useMomentum();
  const openPremium = usePremiumTeaser();
  const [viewMode, _setViewMode] = useState<ViewMode>(getSavedViewMode);
  const setViewMode = useCallback((mode: ViewMode) => {
    startTransition(() => _setViewMode(mode));
    if (typeof window !== "undefined") localStorage.setItem("unfold_view_mode", mode);
  }, []);
  const [selectedCapsule, setSelectedCapsule] = useState<CapsuleData | null>(null);
  const [showWelcome, setShowWelcome] = useState(() => shouldShowWelcome());
  const [showGuide, setShowGuide] = useState(() => !shouldShowWelcome() && shouldShowFirstUseGuide());
  const [briefingDismissed, setBriefingDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("unfold_briefing_dismissed");
    return stored === new Date().toISOString().slice(0, 10);
  });

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

  // Use timeline (lifetime) phases when available, fall back to year phases for instant display
  const allCapsules = useMemo(
    () => buildCapsules(timelinePhases.length > 0 ? timelinePhases : phases),
    [timelinePhases, phases]
  );

  // Pre-warm AI text for the top 3 most relevant capsules as soon as data loads.
  // By the time the user taps, the L1 cache is hot → text appears instantly.
  useEffect(() => {
    if (!allCapsules.length) return;
    const declaredProfile = getUserProfileSync();
    const birthData = getBirthDataSync();
    if (!declaredProfile || !birthData) return;

    const observed = getObservedProfileSync();
    const effectiveProfile = buildEffectiveProfile(declaredProfile, observed);

    const tierOrder: Record<string, number> = { toctoctoc: 0, toctoc: 1, toc: 2 };
    const top = [...allCapsules]
      .filter(c => c.isCurrent || (!c.isFuture || isPremium()))
      .sort((a, b) => {
        if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
        return (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9);
      })
      .slice(0, 3);

    const ids = top.map(c => c.id);
    const contexts = top.map(c => {
      const phase = c.phases[0];
      return {
        tier: c.tier,
        isCurrent: c.isCurrent,
        isFuture: c.isFuture,
        planets: c.planets,
        score: phase?.score,
        domain: phase?.domain,
        apiLabel: phase?.apiLabel,
        apiCategory: phase?.apiCategory,
        transitPlanet: phase?.transitPlanet,
        natalPoint: phase?.natalPoint,
        aspect: phase?.aspect,
        apiTopics: phase?.apiTopics,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate.toISOString(),
        isVipTransit: phase?.isVipTransit,
        durationWeeks: phase?.durationWeeks,
        cycle: phase?.cycle,
        windowStart: phase?.windowStart,
        windowEnd: phase?.windowEnd,
        exactDates: phase?.exactDates,
        parileDate: phase?.parileDate,
        isReturn: phase?.isReturn,
        isHalfReturn: phase?.isHalfReturn,
        stationType: phase?.stationType,
        eclipseType: phase?.eclipseType,
        markers: phase?.markers,
      };
    });
    const boudinIds = top.map(c => c.phases[0]?.boudinId) as string[];
    const boudinIndices = top.map(c => c.phases[0]?.boudinIndex) as number[];

    preGenerateForCapsules(
      ids, contexts, effectiveProfile,
      birthData.placeOfBirth ?? "", "fr",
      boudinIndices, boudinIds
    );
  }, [allCapsules]);

  const handleTapCapsule = useCallback((capsule: CapsuleData) => {
    // Native haptic feedback on capsule tap
    if (typeof window !== "undefined" && window.Capacitor) {
      import("@capacitor/haptics").then(({ Haptics, ImpactStyle }) => {
        Haptics.impact({ style: capsule.isFuture ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
      });
    }
    if (capsule.isFuture && !isPremium()) {
      openPremium();
      return;
    }
    setSelectedCapsule(capsule);
  }, [openPremium]);

  const handleAgeChange = useCallback((age: number) => {
    setVisibleAge(age);
  }, []);

  // Show spinner only when we have NO data at all.
  // If year data (phases) arrived, show timeline immediately — lifetime loads in background.
  const hasAnyData = phases.length > 0 || timelinePhases.length > 0;
  if (
    (state === "loading" && !hasAnyData) ||
    (isLoadingLifetime && !hasAnyData)
  ) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--accent-purple)", borderRightColor: "var(--accent-purple)" }}
        />
        <p className="text-xs text-text-body-subtle">
          {isLoadingLifetime ? "Construction de votre timeline..." : "Chargement de votre timeline..."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* ── First-time welcome overlay ── */}
      {showWelcome && (
        <TimelineWelcome onDone={() => {
          setShowWelcome(false);
          // After welcome fades, show the guide
          if (shouldShowFirstUseGuide()) {
            setTimeout(() => setShowGuide(true), 800);
          }
        }} />
      )}

      {/* ── First-use guide hints ── */}
      <AnimatePresence>
        {showGuide && (
          <FirstUseGuide onDone={() => setShowGuide(false)} />
        )}
      </AnimatePresence>

      {/* ── View toggle — top, below header — hidden during welcome/guide ── */}
      {!showWelcome && !showGuide && <div className="absolute left-0 right-0 z-20 flex items-center justify-center" style={{ top: LAYOUT.toggleTop, paddingInline: S.px }}>
        <div
          className="flex items-center gap-0.5 rounded-full p-0.5"
          style={PILL_STYLE}
        >
          {(["overview", "list"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className="relative flex items-center justify-center rounded-full p-1.5 transition-all duration-200"
              style={{
                color: viewMode === mode ? "#fff" : "var(--text-disabled)",
                background: viewMode === mode ? "var(--accent-purple)" : "transparent",
                width: 28,
                height: 28,
              }}
              aria-label={mode === "overview" ? "Timeline view" : "List view"}
            >
              {mode === "overview" ? (
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <rect x="1" y="1" width="3" height="12" rx="1.5" fill="currentColor" />
                  <rect x="5.5" y="4" width="3" height="9" rx="1.5" fill="currentColor" />
                  <rect x="10" y="2" width="3" height="11" rx="1.5" fill="currentColor" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <rect x="4" y="2" width="9" height="2" rx="1" fill="currentColor" />
                  <rect x="4" y="6" width="9" height="2" rx="1" fill="currentColor" />
                  <rect x="4" y="10" width="9" height="2" rx="1" fill="currentColor" />
                  <circle cx="1.5" cy="3" r="1.5" fill="currentColor" />
                  <circle cx="1.5" cy="7" r="1.5" fill="currentColor" />
                  <circle cx="1.5" cy="11" r="1.5" fill="currentColor" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>}

      {/* Daily Briefing — pinned at top, only after welcome + guide are done */}
      {viewMode === "overview" && !showWelcome && !showGuide && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-5 pointer-events-none">
          <div className="pointer-events-auto w-full">
            <DailyBriefing onDismiss={() => setBriefingDismissed(true)} />
          </div>
        </div>
      )}

      {/* Both views stay mounted — crossfade transition for premium feel */}
      <div
        className="absolute inset-0 pt-9"
        style={{
          opacity: viewMode === "overview" ? 1 : 0,
          scale: viewMode === "overview" ? "1" : "0.97",
          pointerEvents: viewMode === "overview" ? "auto" : "none",
          transition: "opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), scale 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "opacity, transform",
        }}
      >
        <OverviewView capsules={allCapsules} onTapCapsule={handleTapCapsule} onAgeChange={handleAgeChange} />
      </div>
      <div
        className="absolute inset-0 pt-9"
        style={{
          opacity: viewMode === "list" ? 1 : 0,
          scale: viewMode === "list" ? "1" : "0.97",
          pointerEvents: viewMode === "list" ? "auto" : "none",
          transition: "opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), scale 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "opacity, transform",
        }}
      >
        <ListView capsules={allCapsules} onTapCapsule={handleTapCapsule} onAgeChange={handleAgeChange} />
      </div>

      {/* Fixed age indicator — minimal, premium.
          A thin line across the screen with the age on the right.
          Quiet when browsing past/future. Glows when aligned with today. */}
      {(() => {
        const isToday = visibleAge === currentAge;
        return (
        <div
          className="pointer-events-none absolute left-0 right-0 z-20"
          style={{ top: "calc(50% + 20px)" }}
        >
          {/* Thin horizontal line — full width, mauve accent */}
          <div
            style={{
              height: 1,
              marginLeft: 56,
              marginRight: 12,
              background: isToday
                ? "linear-gradient(90deg, color-mix(in srgb, var(--accent-purple) 10%, transparent), color-mix(in srgb, var(--accent-purple) 60%, transparent) 30%, color-mix(in srgb, var(--accent-purple) 60%, transparent) 70%, transparent)"
                : "linear-gradient(90deg, color-mix(in srgb, var(--accent-purple) 8%, transparent), color-mix(in srgb, var(--accent-purple) 25%, transparent) 30%, color-mix(in srgb, var(--accent-purple) 25%, transparent) 70%, transparent)",
              transition: "all 0.5s ease-out",
            }}
          />
          {/* Age sticker — floats above capsules, glass effect like toggle */}
          <div
            className="absolute right-2 flex items-center justify-center rounded-full"
            style={{
              top: -14,
              minWidth: 32,
              height: 28,
              padding: "0 10px",
              background: isToday
                ? "color-mix(in srgb, var(--accent-purple) 25%, rgba(27, 21, 53, 0.85))"
                : "color-mix(in srgb, var(--accent-purple) 15%, rgba(27, 21, 53, 0.8))",
              border: `1px solid ${isToday
                ? "color-mix(in srgb, var(--accent-purple) 40%, transparent)"
                : "color-mix(in srgb, var(--accent-purple) 30%, transparent)"}`,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              transition: "all 0.5s ease-out",
            }}
          >
            <span
              className="font-display tabular-nums leading-none"
              style={{
                color: isToday
                  ? "color-mix(in srgb, var(--accent-purple) 90%, white)"
                  : "color-mix(in srgb, var(--accent-purple) 60%, white)",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "-0.02em",
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
              className="absolute inset-0 z-[55]"
              style={{ background: "rgba(0,0,0,0.4)" }}
              onClick={() => setSelectedCapsule(null)}
            />
            <CapsuleDetailSheet capsule={selectedCapsule} isFuture={selectedCapsule.isFuture} onClose={() => setSelectedCapsule(null)} />
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
