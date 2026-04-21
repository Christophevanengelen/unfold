/**
 * Connection Brief API — wraps /api/connection-brief (via /api/toctoc proxy).
 * Returns raw ActivePeriod[] alongside adapted MatchingWindow[] so callers
 * can feed the raw data to the LLM delineation pipeline.
 *
 * API docs: D:\51.full-suite-api\knowledge\API-COMPLETE-DOCUMENTATION.md#connection-brief
 */

import type { BirthData } from "@/lib/birth-data";
import type { RelationshipType, MatchingWindow } from "@/lib/matching-narratives";
import type { PlanetKey } from "@/lib/domain-config";

// ─── API response types (exported for delineation pipeline) ──

export interface ConnectionBriefSignal {
  category: "transit" | "eclipse" | "zr";
  planetOrType: string;
  natalPoint: string;
  aspectOrMarker: string;
  score: number;
}

export interface RawEvent {
  label: string;
  score: number;
  category: string;
  aspect: string | null;
  date?: string | null;
}

export interface RawProfection {
  house: number;
  houseName: string;
  annualTheme: string;
}

export interface PersonFocus {
  dominantDomains: string[];
  primarySignal: ConnectionBriefSignal;
  challenges: string[];
  constructiveDirection: string;
  profectionHouse?: number;
  profectionTheme?: string;
  rawData?: {
    profection?: RawProfection;
    events?: RawEvent[];
    monthScore?: { total: number; zr: number; transit: number };
  };
}

export interface ActivePeriod {
  monthKey: string; // "YYYY-MM"
  startDate: string;
  endDate: string;
  tier: "PEAK" | "CLEAR" | "SUBTLE";
  tierScore: number;
  personAFocus: PersonFocus;
  personBFocus: PersonFocus;
  sharedTheme: string;
  sharedInsight: string;
  actionTogether: string;
}

export interface ConnectionBriefResult {
  windows: MatchingWindow[];
  periods: ActivePeriod[];
}

interface ConnectionBriefResponse {
  success: boolean;
  connectionBrief: {
    relationship: string;
    targetDate: string;
    activePeriods: ActivePeriod[];
  };
  computeTimeSeconds?: number;
}

// ─── Planet name → PlanetKey ─────────────────────────────

const PLANET_KEY_MAP: Record<string, PlanetKey> = {
  Saturn: "saturn",
  Jupiter: "jupiter",
  Venus: "venus",
  Mars: "mars",
  Moon: "moon",
  Sun: "sun",
  Mercury: "mercury",
  Uranus: "uranus",
  Neptune: "neptune",
  Pluto: "neptune",
  "North Node": "north-node",
  "South Node": "south-node",
};

function toPlanetKey(signal: ConnectionBriefSignal): PlanetKey {
  if (signal.category === "eclipse") {
    return signal.planetOrType?.toLowerCase().includes("solar")
      ? "solar-eclipse"
      : "lunar-eclipse";
  }
  return PLANET_KEY_MAP[signal.planetOrType] ?? "sun";
}

// ─── Tier colors ─────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  PEAK: "#D89EA0",
  CLEAR: "#6BA89A",
  SUBTLE: "#8B7FC2",
};

const MONTH_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTH_SHORT = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

// ─── Adapter: ActivePeriod[] → MatchingWindow[] ──────────

function adaptPeriods(
  periods: ActivePeriod[],
  relationship: RelationshipType,
): MatchingWindow[] {
  const today = new Date();

  return periods.map((p): MatchingWindow => {
    const [year, month] = p.monthKey.split("-").map(Number);
    const monthDate = new Date(year, month - 1, 15);
    const isCurrentMonth =
      monthDate.getMonth() === today.getMonth() &&
      monthDate.getFullYear() === today.getFullYear();
    const isPast = monthDate < new Date(today.getFullYear(), today.getMonth(), 1);
    const status = isCurrentMonth ? "active" : isPast ? "past" : "upcoming";
    const daysLeft = Math.max(
      0,
      Math.round((monthDate.getTime() - today.getTime()) / 86_400_000),
    );

    const tierColor = TIER_COLORS[p.tier] ?? "#8B7FC2";
    const title = isCurrentMonth
      ? "Alignement actif"
      : p.tier === "PEAK"
        ? `Fenêtre forte — ${MONTH_FR[month - 1]}`
        : `Alignement ${MONTH_FR[month - 1]}`;

    return {
      title,
      dateRange: `${MONTH_SHORT[month - 1]} ${year}`,
      monthKey: p.monthKey,
      daysLeft,
      status,
      tier: p.tier,
      tierColor,
      relationship,
      you: {
        description: p.personAFocus.constructiveDirection,
        planet: toPlanetKey(p.personAFocus.primarySignal),
        category: p.personAFocus.primarySignal.category,
      },
      them: {
        description: p.personBFocus.constructiveDirection,
        planet: toPlanetKey(p.personBFocus.primarySignal),
        category: p.personBFocus.primarySignal.category,
      },
      sharedTheme: p.sharedTheme,
      insight: p.sharedInsight,
      action: p.actionTogether,
    };
  });
}

// ─── Sort helper ──────────────────────────────────────────

function sortWindows(windows: MatchingWindow[]): MatchingWindow[] {
  const active = windows.filter((w) => w.status === "active");
  const upcoming = windows.filter((w) => w.status === "upcoming");
  const past = windows.filter((w) => w.status === "past");
  const result = [...active, ...upcoming];
  if (result.length < 3) result.push(...past.slice(0, 3 - result.length));
  return result.slice(0, 6);
}

// ─── Main fetch ───────────────────────────────────────────

export async function fetchConnectionBrief(
  personA: BirthData,
  personB: BirthData,
  relationship: RelationshipType,
  theirName: string,
  months = 3,
): Promise<ConnectionBriefResult> {
  const today = new Date().toISOString().slice(0, 10);

  const payload = {
    endpoint: "connection-brief",
    relationship,
    targetDate: today,
    personA: {
      birthDate: personA.birthDate,
      birthTime: personA.birthTime,
      latitude: personA.latitude,
      longitude: personA.longitude,
      timezone: personA.timezone,
    },
    personB: {
      birthDate: personB.birthDate,
      birthTime: personB.birthTime,
      latitude: personB.latitude,
      longitude: personB.longitude,
      timezone: personB.timezone,
    },
    responseWindow: { mode: "connection_month_plus_next", months },
  };

  const res = await fetch("/api/toctoc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`connection-brief returned ${res.status}`);

  const raw = await res.json();
  // API wraps: { success, data: { success, connectionBrief }, timestamp }
  const data = (raw?.data ?? raw) as ConnectionBriefResponse;
  if (!data?.connectionBrief?.activePeriods) {
    throw new Error("Invalid connection-brief response");
  }

  const periods = data.connectionBrief.activePeriods;
  const allWindows = adaptPeriods(periods, relationship);
  const windows = sortWindows(allWindows);

  // Return raw periods in the same order as sorted windows
  const sortedMonthKeys = windows.map((w) => w.monthKey);
  const sortedPeriods = sortedMonthKeys
    .map((mk) => periods.find((p) => p.monthKey === mk))
    .filter((p): p is ActivePeriod => p !== undefined);

  return { windows, periods: sortedPeriods };
}
