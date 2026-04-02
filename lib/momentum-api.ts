/**
 * Momentum Engine API client.
 * Wraps calls to Marie Ange's toctoc API via our proxy at /api/toctoc.
 * Uses IndexedDB-backed StorageService for persistent caching.
 * Results are deterministic per birth data (same input = same output).
 */

import { birthHash, type BirthData } from "./birth-data";
import { storage } from "./storage";

// ─── API Response Types ─────────────────────────────────────

export interface ApiEvent {
  label: string;
  score: number; // 1-4 (toc levels)
  category: "transit" | "zr" | "eclipse" | "station";
  aspect?: string;
  exactDate?: string;
  periodStart?: string;
  periodEnd?: string;
  lotType?: string; // "fortune" | "spirit" | "eros"
  level?: number;
  periodSign?: string;
  color?: string;
  cyclePassNumber?: number;
  cyclePasses?: number;
  eclipseAxis?: string;
  axisColor?: string;
  markers?: string[];
  isCulmination?: boolean;
}

export interface MonthData {
  month: string; // "YYYY-MM"
  totalScore: number;
  zrScore: number;
  transitScore: number;
  topEvents: ApiEvent[];
  isPast?: boolean;
  isCurrentMonth?: boolean;
  age?: number;
}

export interface YearData {
  year: number;
  sumScore: number;
  peakMonthScore: number;
  peakMonth: string;
  positiveMonths: number;
  negativeMonths: number;
  avgMonthScore?: number;
}

export interface TocTocYearResponse {
  success: boolean;
  data: {
    success: boolean;
    person: {
      name: string;
      birthDate: string;
      birthTime: string;
      city: string;
      timezone: string;
    };
    window: {
      startDate: string;
      endDate: string;
      years: number[];
      monthCount: number;
    };
    fortuneInfo: {
      sign: string;
      isDayChart: boolean;
      angularSigns: string[];
      natalSigns: Record<string, string>;
    };
    currentMonth: MonthData;
    peakUpcomingMonths: MonthData[];
    years: YearData[];
    months: MonthData[];
    computeTimeSeconds?: number;
  };
}

export interface SausageData {
  id: string;
  color: string;
  groupId: string;
  date?: string;
  startDate?: string; // sausages from toctoc-app use startDate
  endDate: string;
  score: number;
  label: string;
  category: string;
  type?: string;
  isPast: boolean;
  age: number;
  intensityScore: number;
  // Transit-specific
  transitPlanet?: string;
  natalPoint?: string;
  aspect?: string;
  parileDate?: string;
  windowStart?: string;
  windowEnd?: string;
  exactDates?: string[];
  pattern?: string;
  isVipTransit?: boolean;
  isReturn?: boolean;
  isHalfReturn?: boolean;
  bestOrb?: number;
  // ZR-specific
  lotType?: string | string[];
  level?: number;
  periodSign?: string;
  markers?: string[];
  isPeakPeriod?: boolean;
  isCulmination?: boolean;
  isLB?: boolean;
  isPreLB?: boolean;
  linkedLB?: { lbSign: string; lbStart: string; lbEnd: string } | null;
  linkedForeshadow?: { foreshadowSign: string; foreshadowStart: string; foreshadowEnd: string } | null;
  // Lifetime context (transits, stations, ZR, eclipses)
  lifetimeNumber?: number;
  lifetimeTotal?: number;
  allPeriods?: { date: string; endDate?: string; lifetimeNumber: number }[];
  // Eclipse-specific
  eclipseType?: string;
  eclipseAxis?: string;
  axisColor?: string;
  // Station-specific
  stationType?: string;
  // Sausage enrichment
  width?: "thin" | "medium" | "large";
  topics?: { house: number; color: string; label?: string }[];
  cycle?: { hitNumber: number; totalHits: number; pattern?: string; allHits: { date: string; hitNumber: number }[] };
}

/** Short boudin from toctoc-app-short — minimal fields for timeline rendering */
export interface ShortBoudinData {
  id: string;
  cat: string;         // category: transit|zr|eclipse|station
  s: string;           // startDate
  e?: string;          // endDate
  sc: number;          // score (1-4)
  w: string;           // width: thin|medium|large
  col: string;         // hex color
  lbl: string;         // label
  gid?: string;        // groupId
  asp?: string;        // aspect
  tp?: string;         // transitPlanet
  np?: string;         // natalPoint
  tc?: string[];       // topicColors (hex array)
  th?: number[];       // topicHouses (per-topic house numbers)
  past?: boolean;      // isPast
  nh?: number;         // natalHouse
  nhc?: string;        // natalHouseColor
  bid?: string;        // base boudin ID (before _h{n} suffix for multi-hit transits)
  cyc?: { h: number; t: number; all?: string[] }; // cycle: hitNumber/totalHits/allExactDates
  lotType?: string[];  // ZR lot types (deduplicated)
  lvl?: number;        // ZR level
  pSign?: string;      // ZR period sign
  pH?: number;         // ZR period house
  markers?: string[];  // ZR markers: "LB", "Cu", "pre-LB"
  isPeak?: boolean;    // ZR isPeakPeriod
  isCu?: boolean;      // ZR isCulmination
  isLB?: boolean;      // ZR Loosening of the Bond
  isPreLB?: boolean;   // ZR foreshadowing period
  lnkLB?: { lbSign: string; lbStart: string; lbEnd: string } | null;          // linkedLB
  lnkFS?: { foreshadowSign: string; foreshadowStart: string; foreshadowEnd: string } | null; // linkedForeshadow
  ltNum?: number;      // lifetimeNumber
  ltTot?: number;      // lifetimeTotal
  allP?: { date: string; endDate?: string; lifetimeNumber: number }[];  // allPeriods
  eType?: string;      // eclipse type
  eSign?: string;      // eclipse sign
  eHouses?: number[];  // eclipse axis houses
  stType?: string;     // station type SR|SD
}

export interface TocTocAppResponse {
  success: boolean;
  data: {
    success: boolean;
    person: {
      name: string;
      birthDate: string;
      birthTime: string;
    };
    natalContext: Record<
      string,
      {
        houseLocated: number;
        housesRuled: number[];
        topics: { house: number; color: string }[];
      }
    >;
    houseColors: Record<string, string>;
    allSausages: SausageData[];
    months: Record<string, { sausages: SausageData[]; monthScore: number }>;
    cycles: Record<string, SausageData[]>;
  };
}

/** Response from toctoc-app-short — lightweight boudin data for timeline */
export interface TocTocAppShortResponse {
  success: boolean;
  data: {
    success: boolean;
    person: {
      name: string;
      birthDate: string;
      birthTime: string;
    };
    houseColors: Record<string, string>;
    boudins: ShortBoudinData[];
    total: number;
    computeTimeSeconds: number;
  };
}

// ─── Cache (IndexedDB-backed) ───────────────────────────────

// ─── API Calls ──────────────────────────────────────────────

const API_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";
const ALLOWED_ENDPOINTS = ["toctoc", "toctoc-app", "toctoc-app-short", "toctoc-year", "toctoc-timeline"];

/**
 * Dual-mode API caller:
 * - Dev (Next.js server running): uses /api/toctoc proxy (avoids CORS)
 * - Static export / Capacitor: calls external API directly
 */
async function callProxy(
  endpoint: string,
  birth: BirthData
): Promise<unknown> {
  if (!ALLOWED_ENDPOINTS.includes(endpoint)) {
    throw new Error(`Invalid endpoint: ${endpoint}`);
  }

  const payload = {
    birthDate: birth.birthDate,
    birthTime: birth.birthTime,
    latitude: birth.latitude,
    longitude: birth.longitude,
    timezone: birth.timezone,
  };

  // Static export / Capacitor mode: call external API directly
  const useDirectApi =
    process.env.NEXT_PUBLIC_API_MODE === "direct" ||
    typeof window !== "undefined" && "Capacitor" in window;

  if (useDirectApi) {
    const res = await fetch(`${API_BASE}/${endpoint}.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return res.json();
  }

  // Dev mode: use Next.js proxy (handles CORS)
  const res = await fetch("/api/toctoc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint, ...payload }),
  });
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

/** Fast 3-year window (2-10s). Use for initial load. */
export async function fetchYearData(
  birth: BirthData
): Promise<TocTocYearResponse> {
  const cacheKey = `unfold_year_${birthHash(birth)}`;
  const cached = await storage.getCache<TocTocYearResponse>(cacheKey);
  if (cached) {
    console.log("[Momentum] Year data from cache");
    return cached;
  }

  const data = (await callProxy("toctoc-year", birth)) as TocTocYearResponse;
  if (data?.success || data?.data?.success) {
    await storage.setCache(cacheKey, data);
    console.log("[Momentum] Year data fetched & cached");
  }
  return data;
}

/** Full lifetime boudins (~475 KB via toctoc-app-short). Use for background enrichment. */
export async function fetchAppData(
  birth: BirthData
): Promise<TocTocAppShortResponse> {
  const cacheKey = `unfold_app_short_v2_${birthHash(birth)}`;
  const cached = await storage.getCache<TocTocAppShortResponse>(cacheKey);
  if (cached) {
    console.log("[Momentum] App data from cache (short boudins)");
    return cached;
  }

  const data = (await callProxy("toctoc-app-short", birth)) as TocTocAppShortResponse;
  if (data?.success || data?.data?.success) {
    await storage.setCache(cacheKey, data);
    console.log("[Momentum] App short data fetched & cached");
  }
  return data;
}
