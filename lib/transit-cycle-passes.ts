const SAME_PASS_MERGE_DAYS = 30;

type TransitCyclePeriod = {
  startDate?: string;
  endDate?: string;
  startDateFormatted?: string;
  endDateFormatted?: string;
  dateRange?: string;
  bestHit?: {
    date?: string;
    transitPosition?: number;
    orb?: number;
    hitType?: string;
  };
};

type TransitCycleLike = {
  transitPlanet?: string;
  aspect?: string;
  natalPoint?: string;
  firstHit?: string;
  lastHit?: string;
  periods?: TransitCyclePeriod[];
  hitsCount?: number;
  hitType?: "cycle" | "single";
  periodsFormatted?: string;
  houseTransitInfo?: {
    houseNumber?: number;
    entryDates?: string[];
    exitDates?: string[];
    durations?: number[];
  };
};

// ─── Natal point alias normalization ─────────────────────────────────────────

// Maps short/alternate forms to the canonical name used for deduplication.
const NATAL_POINT_CANONICAL: Record<string, string> = {
  Desc: "Descendant",
  Dsc: "Descendant",
  Asc: "Ascendant",
};

function canonicalNatalPoint(natalPoint: string): string {
  return NATAL_POINT_CANONICAL[natalPoint] ?? natalPoint;
}

// ─── North/South Node swap ────────────────────────────────────────────────────

// The calculator API has North Node / South Node labels swapped for natal
// points (e.g. returns "South Node" when the natal point is actually the
// North Node at 16 Leo). Swap them back here.
const NATAL_NODE_SWAP: Record<string, string> = {
  "North Node": "South Node",
  "South Node": "North Node",
};

const NODE_TRANSIT_PLANETS = new Set(["North Node", "South Node"]);

/** Natal house index 1–12 when the API encodes a house as a numeric natal point. */
export function parseNatalHouseNumber(natalPoint: string | undefined): number | null {
  if (!natalPoint) return null;
  const trimmed = natalPoint.trim();
  const direct = /^(\d{1,2})$/.exec(trimmed);
  if (direct) {
    const n = Number(direct[1]);
    return n >= 1 && n <= 12 ? n : null;
  }
  const prefixed = /^house\s*(\d{1,2})$/i.exec(trimmed);
  if (prefixed) {
    const n = Number(prefixed[1]);
    return n >= 1 && n <= 12 ? n : null;
  }
  return null;
}

function isNodeTransitPlanet(planet: string | undefined): boolean {
  return !!planet && NODE_TRANSIT_PLANETS.has(planet);
}

/** Nodes crossing a house should be house_transit, not “conjunction natal 7”. */
function promoteNodeHouseTransit(cycle: TransitCycleLike): TransitCycleLike {
  if (!isNodeTransitPlanet(cycle.transitPlanet) || cycle.aspect === "house_transit") {
    return cycle;
  }

  const houseNumber = parseNatalHouseNumber(cycle.natalPoint);
  if (houseNumber === null) return cycle;

  const entryDates: string[] = [];
  const exitDates: string[] = [];

  if (cycle.houseTransitInfo?.entryDates?.length) {
    entryDates.push(...cycle.houseTransitInfo.entryDates.filter(Boolean));
  }
  if (cycle.houseTransitInfo?.exitDates?.length) {
    exitDates.push(...cycle.houseTransitInfo.exitDates.filter(Boolean));
  }

  for (const period of cycle.periods ?? []) {
    const start = period.startDate?.slice(0, 10) ?? period.bestHit?.date?.slice(0, 10);
    const end = period.endDate?.slice(0, 10);
    if (start) entryDates.push(start);
    if (end && end !== start) exitDates.push(end);
  }

  if (!entryDates.length && cycle.firstHit) {
    entryDates.push(cycle.firstHit.slice(0, 10));
  }
  if (!exitDates.length && cycle.lastHit) {
    const last = cycle.lastHit.slice(0, 10);
    const first = entryDates[0];
    if (!first || last !== first) exitDates.push(last);
  }

  return {
    ...cycle,
    aspect: "house_transit",
    natalPoint: String(houseNumber),
    houseTransitInfo: {
      houseNumber,
      entryDates,
      exitDates,
      durations: cycle.houseTransitInfo?.durations ?? [],
    },
  };
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function parseCycleDate(dateStr: string): Date {
  const datePart = dateStr.trim().split(" ")[0].split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function diffDays(a: string, b: string): number {
  return Math.abs(parseCycleDate(a).getTime() - parseCycleDate(b).getTime()) / 86_400_000;
}

function formatCycleDate(dateStr: string): string {
  return parseCycleDate(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function dateSlice(dateStr: string): string {
  return dateStr.trim().split(" ")[0].split("T")[0];
}

function sortDateStrings(dates: string[]): string[] {
  return [...dates]
    .map(dateSlice)
    .filter(Boolean)
    .sort((a, b) => parseCycleDate(a).getTime() - parseCycleDate(b).getTime());
}

function addDaysToDate(dateStr: string, days: number): string {
  const d = parseCycleDate(dateStr);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** First entry into the house → last exit (for card date range). */
export function getHouseTransitWindow(cycle: {
  firstHit?: string;
  lastHit?: string;
  houseTransitInfo?: TransitCycleLike["houseTransitInfo"];
}): { start: string; end: string } {
  const info = cycle.houseTransitInfo;
  const entries = sortDateStrings(info?.entryDates ?? []);
  const exits = sortDateStrings(info?.exitDates ?? []);
  const start = entries[0] ?? (cycle.firstHit ? dateSlice(cycle.firstHit) : "");
  const end =
    exits[exits.length - 1] ??
    (cycle.lastHit ? dateSlice(cycle.lastHit) : "") ??
    start;
  return { start, end };
}

function applyHouseTransitWindow(cycle: TransitCycleLike): TransitCycleLike {
  const info = cycle.houseTransitInfo;
  let entries = sortDateStrings(info?.entryDates ?? []);
  let exits = sortDateStrings(info?.exitDates ?? []);

  const durations = info?.durations ?? [];
  if (durations.length && entries.length) {
    const fromDuration: string[] = [];
    for (let i = 0; i < entries.length; i++) {
      const days = durations[i];
      if (typeof days === "number" && days > 0) {
        fromDuration.push(addDaysToDate(entries[i], days));
      }
    }
    exits = sortDateStrings([...exits, ...fromDuration]);
  }

  if (!entries.length && cycle.firstHit) {
    entries = [dateSlice(cycle.firstHit)];
  }
  if (!exits.length && cycle.lastHit) {
    const last = dateSlice(cycle.lastHit);
    const first = entries[0];
    if (!first || last !== first) {
      exits = [last];
    }
  }

  let periodStart = entries[0];
  let periodEnd = exits[exits.length - 1] ?? entries[entries.length - 1];
  if (!periodStart || !periodEnd) return cycle;

  // Wider firstHit/lastHit from API (full house stay) overrides conjunction-only dates
  if (cycle.firstHit && cycle.lastHit) {
    const fh = dateSlice(cycle.firstHit);
    const lh = dateSlice(cycle.lastHit);
    if (parseCycleDate(fh) < parseCycleDate(periodStart)) {
      entries = sortDateStrings([fh, ...entries]);
      periodStart = entries[0];
    }
    if (parseCycleDate(lh) > parseCycleDate(periodEnd)) {
      exits = sortDateStrings([...exits, lh]);
      periodEnd = exits[exits.length - 1];
    }
  }

  let periods = cycle.periods;
  if (entries.length > 0 && (!periods?.length || periods.length < entries.length)) {
    periods = entries.map((entry, i) => ({
      startDate: entry,
      endDate: exits[i] ?? periodEnd,
      bestHit: { date: entry },
    }));
  }

  const hitCount = Math.max(cycle.hitsCount ?? 0, entries.length, periods?.length ?? 0);

  return {
    ...cycle,
    houseTransitInfo: {
      houseNumber: info?.houseNumber ?? parseNatalHouseNumber(cycle.natalPoint) ?? undefined,
      entryDates: entries,
      exitDates: exits.length ? exits : [periodEnd],
      durations,
    },
    firstHit: periodStart,
    lastHit: periodEnd,
    periods,
    hitsCount: hitCount,
    hitType: hitCount > 1 ? "cycle" : cycle.hitType ?? "single",
  };
}

// ─── Period merging ───────────────────────────────────────────────────────────

function mergeTransitCyclePeriods(periods: TransitCyclePeriod[]): TransitCyclePeriod[] {
  const withDates = periods.filter((period) => period.bestHit?.date);
  if (withDates.length <= 1) return withDates;

  const sorted = [...withDates].sort(
    (a, b) =>
      parseCycleDate(a.bestHit!.date!).getTime() - parseCycleDate(b.bestHit!.date!).getTime()
  );

  const merged: TransitCyclePeriod[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const period = sorted[i];
    const last = merged[merged.length - 1];
    const gap = diffDays(period.bestHit!.date!, last.bestHit!.date!);
    if (gap <= SAME_PASS_MERGE_DAYS) {
      if ((period.bestHit?.orb ?? Number.POSITIVE_INFINITY) < (last.bestHit?.orb ?? Number.POSITIVE_INFINITY)) {
        merged[merged.length - 1] = period;
      }
      continue;
    }
    merged.push(period);
  }

  return merged.map((period) => {
    const bestDate = period.bestHit!.date!;
    const formatted = formatCycleDate(bestDate);
    return {
      ...period,
      startDate: bestDate.slice(0, 10),
      endDate: bestDate.slice(0, 10),
      startDateFormatted: formatted,
      endDateFormatted: formatted,
      dateRange: formatted,
    };
  });
}

// ─── Single cycle normalization ───────────────────────────────────────────────

function normalizeTransitCycle(cycle: TransitCycleLike): TransitCycleLike {
  // 1. Fix natal node label (API returns them swapped)
  let result: TransitCycleLike = cycle;
  if (result.natalPoint && NATAL_NODE_SWAP[result.natalPoint]) {
    result = { ...result, natalPoint: NATAL_NODE_SWAP[result.natalPoint] };
  }

  // 2. Canonicalize natal point alias (Desc → Descendant, etc.)
  if (result.natalPoint && NATAL_POINT_CANONICAL[result.natalPoint]) {
    result = { ...result, natalPoint: canonicalNatalPoint(result.natalPoint) };
  }

  // 2b. Node + numeric natal point = house transit (not conjunction to “natal 7”)
  result = promoteNodeHouseTransit(result);

  // 3. House transits: first entry → last exit (not just the next exact hit date)
  if (result.aspect === "house_transit") {
    return applyHouseTransitWindow(result);
  }

  // 4. Merge close passes for aspect cycles
  if (!result.periods?.length) return result;

  const periods = mergeTransitCyclePeriods(result.periods);
  if (periods.length === result.periods.length) return result;

  const firstDate = periods[0].bestHit?.date ?? result.firstHit;
  const lastDate = periods[periods.length - 1].bestHit?.date ?? result.lastHit;

  return {
    ...result,
    periods,
    hitsCount: periods.length,
    hitType: periods.length > 1 ? "cycle" : "single",
    firstHit: firstDate,
    lastHit: lastDate,
    periodsFormatted: periods
      .map((period) => period.dateRange || period.startDateFormatted)
      .filter(Boolean)
      .join(" and "),
  };
}

// ─── Deduplication ────────────────────────────────────────────────────────────

// Key = transitPlanet + "|" + aspect + "|" + canonical natalPoint.
// When two cycles share a key, keep the one with more information (more periods,
// or earlier/later firstHit/lastHit that extends the window).
function deduplicateCycles(cycles: TransitCycleLike[]): TransitCycleLike[] {
  const seen = new Map<string, TransitCycleLike>();

  for (const cycle of cycles) {
    const planet = cycle.transitPlanet ?? "";
    const aspect = cycle.aspect ?? "";
    const natal = canonicalNatalPoint(cycle.natalPoint ?? "");
    const key = `${planet}|${aspect}|${natal}`;

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, cycle);
      continue;
    }

    // Prefer the entry with more periods or a wider date range
    const existingPeriods = existing.periods?.length ?? 0;
    const newPeriods = cycle.periods?.length ?? 0;
    if (newPeriods > existingPeriods) {
      seen.set(key, cycle);
    }
  }

  return Array.from(seen.values());
}

// ─── Public export ────────────────────────────────────────────────────────────

export function normalizeTransitCyclesPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const root = payload as { data?: unknown };

  if (Array.isArray(root.data)) {
    const normalized = root.data.map((cycle) =>
      cycle && typeof cycle === "object" ? normalizeTransitCycle(cycle as TransitCycleLike) : cycle
    );
    return { ...root, data: deduplicateCycles(normalized as TransitCycleLike[]) };
  }

  if (Array.isArray(payload)) {
    const normalized = (payload as unknown[]).map((cycle) =>
      cycle && typeof cycle === "object" ? normalizeTransitCycle(cycle as TransitCycleLike) : cycle
    );
    return deduplicateCycles(normalized as TransitCycleLike[]);
  }

  return payload;
}
