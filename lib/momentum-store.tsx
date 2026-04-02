"use client";

/**
 * MomentumProvider — React Context with SWR caching.
 *
 * Pattern: Stale-While-Revalidate
 * 1. Mount → read cached phases from localStorage (instant, sync)
 * 2. Display cached data immediately (stale)
 * 3. Background → fetch fresh data from API (revalidate)
 * 4. On success → update UI + write to cache (IndexedDB + localStorage)
 * 5. On error → keep showing stale data
 *
 * Sources: swr.vercel.app, RFC 5861
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { getBirthData, getBirthDataSync, saveBirthData, type BirthData } from "@/lib/birth-data";
import { migrateFromLocalStorage, storage } from "@/lib/storage";
import { fetchYearData, fetchAppData } from "@/lib/momentum-api";
import { yearDataToPhases, appDataToPhases } from "@/lib/momentum-adapter";
import type { MomentumPhase } from "@/types/momentum";

// ─── Cache layer — dual-write (IndexedDB + localStorage) ──────

const CACHE_YEAR = "unfold_cache_year_phases_v4";
const CACHE_LIFETIME = "unfold_cache_lifetime_phases_v4";

function readSync(key: string): MomentumPhase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persist(key: string, data: MomentumPhase[]) {
  storage.setPersistent(key, data).catch(() => {});
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
}

// ─── SWR fetchers ────────────────────────────────────────────

async function fetchYear(bd: BirthData): Promise<MomentumPhase[]> {
  const res = await fetchYearData(bd);
  if (!res?.data?.success) throw new Error("Year API failed");
  const phases = yearDataToPhases(res);
  if (phases.length === 0) throw new Error("No signals found");
  persist(CACHE_YEAR, phases);
  return phases;
}

async function fetchLifetime(bd: BirthData): Promise<MomentumPhase[]> {
  const res = await fetchAppData(bd);
  const phases = appDataToPhases(res);
  if (phases.length > 0) {
    persist(CACHE_LIFETIME, phases);
    console.log("[Momentum] Lifetime cached:", phases.length, "phases");
  }
  return phases;
}

// ─── Context ──────────────────────────────────────────────────

type LoadState = "idle" | "loading" | "ready" | "error";

interface MomentumContextValue {
  phases: MomentumPhase[];
  timelinePhases: MomentumPhase[];
  state: LoadState;
  error: string | null;
  isLive: boolean;
  isLoadingLifetime: boolean;
  birthData: BirthData | null;
  birthDateStr: string;
  needsOnboarding: boolean;
  loadSignals: (birth?: BirthData) => Promise<void>;
}

const MomentumContext = createContext<MomentumContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export function MomentumProvider({ children }: { children: ReactNode }) {
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Resolve birth data on mount
  useEffect(() => {
    (async () => {
      await migrateFromLocalStorage();
      const bd = await getBirthData();
      if (bd) {
        setBirthData(bd);
      } else {
        setNeedsOnboarding(true);
      }
      setMounted(true);
    })();
  }, []);

  // SWR: year phases (fast, 2-5s)
  const {
    data: yearPhases,
    error: yearError,
    isValidating: isLoadingYear,
  } = useSWR(
    birthData ? ["year-phases", birthData.birthDate] : null,
    () => fetchYear(birthData!),
    {
      fallbackData: readSync(CACHE_YEAR),
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60_000, // don't refetch within 1 min
    }
  );

  // SWR: lifetime phases (slow, 30-120s)
  const {
    data: lifetimePhases,
    isValidating: isLoadingLifetime,
  } = useSWR(
    birthData ? ["lifetime-phases", birthData.birthDate] : null,
    () => fetchLifetime(birthData!),
    {
      fallbackData: readSync(CACHE_LIFETIME),
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300_000, // don't refetch within 5 min
    }
  );

  const phases = yearPhases ?? readSync(CACHE_YEAR);
  const timelinePhases = lifetimePhases ?? readSync(CACHE_LIFETIME);

  const state: LoadState = yearError
    ? "error"
    : (!mounted || (isLoadingYear && phases.length === 0))
      ? "loading"
      : "ready";

  const isLive = phases.length > 0;
  const birthDateStr = birthData?.birthDate || "";

  // Manual trigger for onboarding flow
  const loadSignals = useCallback(async (birth?: BirthData) => {
    const bd = birth || (await getBirthData()) || getBirthDataSync();
    if (!bd) {
      setNeedsOnboarding(true);
      return;
    }
    if (birth) await saveBirthData(bd);
    setBirthData(bd);
    setNeedsOnboarding(false);
  }, []);

  const errorMsg = yearError?.message ?? null;

  const value = useMemo<MomentumContextValue>(() => ({
    phases,
    timelinePhases,
    state,
    error: errorMsg,
    isLive,
    isLoadingLifetime,
    birthData,
    birthDateStr,
    needsOnboarding,
    loadSignals,
  }), [phases, timelinePhases, state, errorMsg, isLive, isLoadingLifetime, birthData, birthDateStr, needsOnboarding, loadSignals]);

  return (
    <MomentumContext.Provider value={value}>
      {children}
    </MomentumContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────

export function useMomentum(): MomentumContextValue {
  const ctx = useContext(MomentumContext);
  if (!ctx) {
    throw new Error("useMomentum must be used within <MomentumProvider>");
  }
  return ctx;
}
