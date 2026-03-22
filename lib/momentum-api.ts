/**
 * Momentum Engine API client.
 * Wraps calls to Marie Ange's toctoc API via our proxy at /api/toctoc.
 * Uses IndexedDB-backed StorageService for persistent caching.
 * Results are deterministic per birth data (same input = same output).
 */

import type { BirthData } from "./birth-data";
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
  // ZR-specific
  lotType?: string | string[];
  level?: number;
  periodSign?: string;
  markers?: string[];
  isCulmination?: boolean;
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

// ─── Cache (IndexedDB-backed) ───────────────────────────────

function birthHash(birth: BirthData): string {
  return `${birth.birthDate}_${birth.birthTime}_${birth.latitude.toFixed(2)}_${birth.longitude.toFixed(2)}`;
}

// ─── API Calls ──────────────────────────────────────────────

async function callProxy(
  endpoint: string,
  birth: BirthData
): Promise<unknown> {
  const res = await fetch("/api/toctoc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint,
      birthDate: birth.birthDate,
      birthTime: birth.birthTime,
      latitude: birth.latitude,
      longitude: birth.longitude,
      timezone: birth.timezone,
    }),
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

/** Full lifetime sausages (30-120s). Use for background enrichment. */
export async function fetchAppData(
  birth: BirthData
): Promise<TocTocAppResponse> {
  const cacheKey = `unfold_app_${birthHash(birth)}`;
  const cached = await storage.getCache<TocTocAppResponse>(cacheKey);
  if (cached) {
    console.log("[Momentum] App data from cache (lifetime sausages)");
    return cached;
  }

  const data = (await callProxy("toctoc-app", birth)) as TocTocAppResponse;
  if (data?.success || data?.data?.success) {
    await storage.setCache(cacheKey, data);
    console.log("[Momentum] App data fetched & cached");
  }
  return data;
}
