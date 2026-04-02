/**
 * Momentum Adapter — transforms raw API events into MomentumPhase[]
 * that the existing buildCapsules() / getHomeCapsules() pipeline consumes.
 *
 * API events (monthly, score 1-4) → MomentumPhase (domain, intensity 0-100, planets)
 * No visual components change — only the data source changes.
 */

import type { MomentumPhase } from "@/types/momentum";
import type { ApiEvent, MonthData, TocTocYearResponse, TocTocAppShortResponse, ShortBoudinData } from "@/lib/momentum-api";
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
      ev.level,
      ev.markers
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
    // Angles (ASC, MC, IC, Desc) are not celestial bodies — skip
    const ANGLE_NAMES_YEAR = new Set(["ASC", "MC", "IC", "Desc", "Ascendant", "Midheaven", "Descendant"]);
    const planets: PlanetKey[] = [planet];
    const natal = extractNatalPoint(label);
    if (natal && !ANGLE_NAMES_YEAR.has(natal)) {
      const natalPlanet = extractPlanet(`${natal} `);
      if (natalPlanet !== planet && !planets.includes(natalPlanet)) {
        planets.push(natalPlanet);
      }
    }

    phases.push({
      id: `api-${phaseIndex}`,
      boudinIndex: phaseIndex++,
      domain,
      title: meta.title,
      subtitle: meta.subtitle,
      description: meta.description,
      startDate,
      endDate,
      durationWeeks,
      intensity,
      score: rawMax <= 4 ? rawMax : (rawMax >= 80 ? 4 : rawMax >= 60 ? 3 : rawMax >= 40 ? 2 : 1),
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

// ─── App Data (short boudins) → MomentumPhase[] ─────────────
// Uses toctoc-app-short.php (~475 KB vs ~11 MB for full toctoc-app)
// Each boudin is already a single event with abbreviated field names.
// Detail data (LLM payload, natal context) fetched on-demand via toctoc-boudin-detail.

export function appDataToPhases(
  response: TocTocAppShortResponse
): MomentumPhase[] {
  // Handle double-nested API response: .data.data.boudins or .data.boudins
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData = response.data as any;
  const data = rawData?.data?.boudins ? rawData.data : rawData;
  if (!data?.boudins) return [];

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const phases: MomentumPhase[] = [];

  // Sort boudins by start date (should already be sorted, but ensure)
  const sorted = [...data.boudins]
    .filter((b: ShortBoudinData) => b.s)
    .sort((a: ShortBoudinData, b: ShortBoudinData) => a.s.localeCompare(b.s));

  for (let i = 0; i < sorted.length; i++) {
    const b = sorted[i] as ShortBoudinData;
    if (b.sc < 1) continue;

    const startDate = b.s;
    const endDate = b.e || startDate;
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    const label = b.lbl || "";
    const lotType = Array.isArray(b.lotType) ? b.lotType[0] : undefined;
    const domain = inferDomain(b.cat, label, lotType);
    const intensity = scoreToIntensity(b.sc);

    // ZR boudins have no planets — they're time-lord technique, not transits
    // Eclipse boudins use the eclipse key, not a planet
    const planets: PlanetKey[] = [];
    if (b.cat !== "zr") {
      const planet = b.tp
        ? extractPlanet(`${b.tp} `)
        : extractPlanet(label);
      planets.push(planet);
      // Angles (ASC, MC, IC, Desc) are not celestial bodies — skip adding as planet pill
      const ANGLE_NAMES = new Set(["ASC", "MC", "IC", "Desc", "Ascendant", "Midheaven", "Descendant"]);
      if (b.np && !ANGLE_NAMES.has(b.np)) {
        const natalPlanet = extractPlanet(`${b.np} `);
        if (natalPlanet !== planet && !planets.includes(natalPlanet)) {
          planets.push(natalPlanet);
        }
      }
    }

    // Topic colors come pre-resolved as hex array from short API
    const topicColors = b.tc || [];
    const firstTopicColor = topicColors[0] || b.col;

    // Determine status
    let status: "past" | "current" | "future";
    if (endDate < todayStr) {
      status = "past";
    } else if (startDate <= todayStr) {
      status = "current";
    } else {
      status = "future";
    }

    const durationMs = endMs - startMs;
    const durationWeeks = Math.max(1, Math.round(durationMs / (7 * 86400000)));

    const meta = getEventMeta(b.cat, label, b.asp, lotType, b.lvl, b.markers);

    // Map short cycle to detail format
    const rawCycle = b.cyc ? {
      hitNumber: b.cyc.h,
      totalHits: b.cyc.t,
      pattern: '',
      // Include all exact hit dates if available (from cyc.all)
      allHits: b.cyc.all
        ? b.cyc.all.map((date, idx) => ({ date, hitNumber: idx + 1, isCurrent: idx + 1 === b.cyc!.h }))
        : [] as { date: string; hitNumber: number; isCurrent?: boolean }[],
    } : undefined;

    phases.push({
      id: `phase-${i}`,
      boudinIndex: i,
      domain: domain as "love" | "health" | "work",
      title: meta.title,
      subtitle: meta.subtitle,
      description: meta.description,
      startDate,
      endDate,
      durationWeeks,
      intensity,
      score: b.sc,
      planets,
      topicColors: topicColors.length > 0 ? topicColors : undefined,
      status,
      keyInsight: meta.keyInsight,
      guidance:
        status === "current"
          ? "Ce signal est actif en ce moment. Observe les thèmes liés dans ton quotidien."
          : undefined,
      color: firstTopicColor,
      // Raw API fields for detail sheet (mapped from short names)
      apiLabel: label,
      apiCategory: b.cat,
      transitPlanet: b.tp,
      natalPoint: b.np,
      aspect: b.asp,
      cycle: rawCycle,
      apiTopics: topicColors.map((c, idx) => ({ house: b.th?.[idx] ?? b.nh ?? b.pH ?? idx + 1, color: c, topic: '', source: '' })),
      lotType,
      zrLevel: b.lvl,
      periodSign: b.pSign,
      markers: b.markers,
      isPeakPeriod: b.isPeak,
      isCulmination: b.isCu || b.markers?.includes("Cu"),
      isLB: b.isLB || b.markers?.includes("LB"),
      isPreLB: b.isPreLB || b.markers?.includes("pre-LB"),
      linkedLB: b.lnkLB,
      linkedForeshadow: b.lnkFS,
      eclipseType: b.eType,
      lifetimeNumber: b.ltNum,
      lifetimeTotal: b.ltTot,
      allPeriods: b.allP,
      stationType: b.stType,
      // Use the exact sausage ID (hit-specific for multi-hit transits, e.g. transit_abc_h3)
      // The detail API uses calculateTocTocApp which creates the same _h{n} IDs
      boudinId: b.id,
    });
  }

  return phases;
}
