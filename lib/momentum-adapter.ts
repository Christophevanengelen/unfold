/**
 * Momentum Adapter — transforms raw API events into MomentumPhase[]
 * that the existing buildCapsules() / getHomeCapsules() pipeline consumes.
 *
 * API events (monthly, score 1-4) → MomentumPhase (domain, intensity 0-100, planets)
 * No visual components change — only the data source changes.
 */

import type { MomentumPhase } from "@/lib/mock-timeline";
import type { ApiEvent, MonthData, TocTocYearResponse, SausageData, TocTocAppResponse } from "@/lib/momentum-api";
import {
  inferDomain,
  extractPlanet,
  scoreToIntensity,
  getEventMeta,
  extractNatalPoint,
} from "@/lib/event-labels";
import type { PlanetKey } from "@/lib/domain-config";

// ─── Year Data → MomentumPhase[] ────────────────────────────
// Used for the initial fast load (toctoc-year.php, 2-10s)

export function yearDataToPhases(
  response: TocTocYearResponse
): MomentumPhase[] {
  const data = response.data;
  if (!data?.months) return [];

  const phases: MomentumPhase[] = [];
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Group events across months by their label (same transit = same phase)
  const eventGroups = new Map<
    string,
    { events: ApiEvent[]; months: string[]; firstMonth: string; lastMonth: string }
  >();

  for (const month of data.months) {
    if (!month.topEvents?.length) continue;
    for (const ev of month.topEvents) {
      const key = ev.label;
      const existing = eventGroups.get(key);
      if (existing) {
        existing.events.push(ev);
        existing.months.push(month.month);
        if (month.month > existing.lastMonth) existing.lastMonth = month.month;
        if (month.month < existing.firstMonth) existing.firstMonth = month.month;
      } else {
        eventGroups.set(key, {
          events: [ev],
          months: [month.month],
          firstMonth: month.month,
          lastMonth: month.month,
        });
      }
    }
  }

  let phaseIndex = 0;
  for (const [label, group] of eventGroups) {
    const ev = group.events[0]; // Representative event
    const domain = inferDomain(ev.category, label, ev.lotType);
    const planet = extractPlanet(label);
    // Year endpoint scores are raw values (8-90+), not 1-4 toc levels.
    // Map directly: abs(score) → intensity, clamped 30-98.
    const rawMax = Math.max(...group.events.map((e) => Math.abs(e.score)));
    const intensity = rawMax <= 4
      ? scoreToIntensity(rawMax, ev.cyclePasses)  // toc-level score
      : Math.min(98, Math.max(30, Math.round(rawMax * 1.1))); // raw score → intensity
    const meta = getEventMeta(
      ev.category,
      label,
      ev.aspect,
      ev.lotType,
      ev.level
    );

    // Compute date range
    let startDate: string;
    let endDate: string;

    if (ev.periodStart && ev.periodEnd) {
      // ZR events have explicit period dates
      startDate = ev.periodStart;
      endDate = ev.periodEnd;
    } else if (ev.exactDate) {
      // Transit events: use exact date as center, expand by score
      const exact = new Date(ev.exactDate);
      const windowDays = Math.abs(ev.score) >= 3 ? 45 : 21;
      const start = new Date(exact.getTime() - windowDays * 86400000);
      const end = new Date(exact.getTime() + windowDays * 86400000);
      startDate = start.toISOString().split("T")[0];
      endDate = end.toISOString().split("T")[0];
    } else {
      // Fallback: span the months this event appears in
      startDate = `${group.firstMonth}-01`;
      const lastDate = new Date(`${group.lastMonth}-01`);
      lastDate.setMonth(lastDate.getMonth() + 1);
      lastDate.setDate(lastDate.getDate() - 1);
      endDate = lastDate.toISOString().split("T")[0];
    }

    // Determine status
    let status: "past" | "current" | "future";
    if (endDate < todayStr) {
      status = "past";
    } else if (startDate <= todayStr) {
      status = "current";
    } else {
      status = "future";
    }

    // Compute duration in weeks
    const durationMs =
      new Date(endDate).getTime() - new Date(startDate).getTime();
    const durationWeeks = Math.max(1, Math.round(durationMs / (7 * 86400000)));

    // Collect planets (main transit + natal point if different)
    const planets: PlanetKey[] = [planet];
    const natal = extractNatalPoint(label);
    if (natal) {
      const natalPlanet = extractPlanet(`${natal} `);
      if (natalPlanet !== planet && !planets.includes(natalPlanet)) {
        planets.push(natalPlanet);
      }
    }

    phases.push({
      id: `api-${phaseIndex++}`,
      domain,
      title: meta.title,
      subtitle: meta.subtitle,
      description: meta.description,
      startDate,
      endDate,
      durationWeeks,
      intensity,
      planets,
      status,
      keyInsight: meta.keyInsight,
      guidance:
        status === "current"
          ? "Pay attention to this signal — it's active now."
          : status === "future"
            ? "This window is approaching — prepare accordingly."
            : undefined,
    });
  }

  return phases;
}

// ─── App Data (sausages) → MomentumPhase[] ──────────────────
// Used for the full lifetime timeline (toctoc-app.php, 30-120s)
//
// Strategy: group overlapping sausages into merged phases.
// 1309 individual events → ~40-80 life phases on the timeline.
// Grouping: sausages that overlap in time merge into one phase.
// The highest score determines the tier, planets combine.

interface RawPhase {
  startMs: number;
  endMs: number;
  maxScore: number;
  domains: Map<string, number>; // domain → max intensity
  planets: Set<string>;
  bestLabel: string;
  bestCategory: string;
  bestAspect?: string;
  bestLotType?: string;
  bestLevel?: number;
  sausageCount: number;
}

export function appDataToPhases(
  response: TocTocAppResponse
): MomentumPhase[] {
  const data = response.data;
  if (!data?.allSausages) return [];

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Sort sausages by start date
  const sorted = [...data.allSausages]
    .filter(s => (s.startDate || s.date))
    .sort((a, b) => {
      const aDate = a.startDate || a.date || "";
      const bDate = b.startDate || b.date || "";
      return aDate.localeCompare(bDate);
    });

  // Group overlapping sausages into clusters
  // Two sausages overlap if one starts before the other ends.
  // Gap tolerance of 14 days — produces ~30-40 life phases for a full lifetime.
  const GAP_MS = 14 * 86400000;
  const groups: RawPhase[] = [];
  let current: RawPhase | null = null;

  for (const s of sorted) {
    const startDate = s.startDate || s.date || todayStr;
    const endDate = s.endDate || startDate;
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    const label = s.label || s.type || "";
    const lotType = Array.isArray(s.lotType) ? s.lotType[0] : (s.lotType as string | undefined);
    const domain = inferDomain(s.category, label, lotType);
    const planet = s.transitPlanet
      ? extractPlanet(`${s.transitPlanet} `)
      : extractPlanet(label);
    const intensity = scoreToIntensity(s.score, s.cycle?.allHits);

    if (current && startMs <= current.endMs + GAP_MS) {
      // Merge into current group
      current.endMs = Math.max(current.endMs, endMs);
      current.maxScore = Math.max(current.maxScore, s.score);
      current.planets.add(planet);
      if (s.natalPoint) current.planets.add(extractPlanet(`${s.natalPoint} `));
      const prevIntensity = current.domains.get(domain) || 0;
      current.domains.set(domain, Math.max(prevIntensity, intensity));
      // Keep the label of the highest-scoring event
      if (s.score >= current.maxScore) {
        current.bestLabel = label;
        current.bestCategory = s.category;
        current.bestAspect = s.aspect;
        current.bestLotType = lotType;
        current.bestLevel = s.level;
      }
      current.sausageCount++;
    } else {
      // Start a new group
      if (current) groups.push(current);
      current = {
        startMs,
        endMs,
        maxScore: s.score,
        domains: new Map([[domain, intensity]]),
        planets: new Set([planet]),
        bestLabel: label,
        bestCategory: s.category,
        bestAspect: s.aspect,
        bestLotType: lotType,
        bestLevel: s.level,
        sausageCount: 1,
      };
      if (s.natalPoint) current.planets.add(extractPlanet(`${s.natalPoint} `));
    }
  }
  if (current) groups.push(current);

  // Convert groups to MomentumPhase[]
  const phases: MomentumPhase[] = [];

  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const startDate = new Date(g.startMs).toISOString().split("T")[0];
    const endDate = new Date(g.endMs).toISOString().split("T")[0];

    // Pick the dominant domain (highest intensity)
    let bestDomain: string = "work";
    let bestIntensity = 0;
    for (const [d, intensity] of g.domains) {
      if (intensity > bestIntensity) {
        bestDomain = d;
        bestIntensity = intensity;
      }
    }

    // Determine status
    let status: "past" | "current" | "future";
    if (endDate < todayStr) {
      status = "past";
    } else if (startDate <= todayStr) {
      status = "current";
    } else {
      status = "future";
    }

    const durationMs = g.endMs - g.startMs;
    const durationWeeks = Math.max(1, Math.round(durationMs / (7 * 86400000)));

    // Cap planets at 5 (most relevant)
    const planetList = Array.from(g.planets).slice(0, 5) as PlanetKey[];

    // Use the best event's metadata for title/description
    const meta = getEventMeta(
      g.bestCategory,
      g.bestLabel,
      g.bestAspect,
      g.bestLotType,
      g.bestLevel
    );

    // Overall intensity = max across all domains in this group
    const overallIntensity = Math.max(...Array.from(g.domains.values()));

    phases.push({
      id: `phase-${i}`,
      domain: bestDomain as "love" | "health" | "work",
      title: meta.title,
      subtitle: meta.subtitle,
      description: g.sausageCount > 1
        ? `${meta.description} (${g.sausageCount} signals active)`
        : meta.description,
      startDate,
      endDate,
      durationWeeks,
      intensity: overallIntensity,
      planets: planetList,
      status,
      keyInsight: g.sausageCount >= 3
        ? `${g.sausageCount} overlapping signals — a concentrated period.`
        : meta.keyInsight,
      guidance:
        status === "current"
          ? "Pay attention to this signal — it's active now."
          : undefined,
    });
  }

  return phases;
}
