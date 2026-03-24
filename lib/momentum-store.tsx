"use client";

/**
 * MomentumProvider — React Context that manages the full data lifecycle.
 *
 * On mount: check birth data → check cache → fetch API → adapt → phases.
 * Falls back to mock data if no birth data or API error.
 * Exposes phases for SignalPager (home) and MomentumTimelineV2 (timeline).
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getBirthData, getBirthDataSync, saveBirthData, type BirthData } from "@/lib/birth-data";
import { migrateFromLocalStorage } from "@/lib/storage";
import { fetchYearData, fetchAppData } from "@/lib/momentum-api";
import { yearDataToPhases, appDataToPhases } from "@/lib/momentum-adapter";
import type { MomentumPhase } from "@/types/momentum";

// ─── Context shape ──────────────────────────────────────────

type LoadState = "idle" | "loading" | "ready" | "error";

interface MomentumContextValue {
  /** Current phases for home capsules (from API data) */
  phases: MomentumPhase[];
  /** Full lifetime phases for timeline (from app data, or year data as fallback) */
  timelinePhases: MomentumPhase[];
  /** Loading state */
  state: LoadState;
  /** Error message if any */
  error: string | null;
  /** Whether using real API data */
  isLive: boolean;
  /** Whether the lifetime data is still loading in background */
  isLoadingLifetime: boolean;
  /** Current birth data (null if not onboarded yet) */
  birthData: BirthData | null;
  /** Birth date string for timeline coordinate system */
  birthDateStr: string;
  /** True when no birth data exists — UI should redirect to onboarding */
  needsOnboarding: boolean;
  /** Trigger a fetch with new or existing birth data */
  loadSignals: (birth?: BirthData) => Promise<void>;
}

const MomentumContext = createContext<MomentumContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────

export function MomentumProvider({ children }: { children: ReactNode }) {
  const [phases, setPhases] = useState<MomentumPhase[]>([]);
  const [timelinePhases, setTimelinePhases] = useState<MomentumPhase[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoadingLifetime, setIsLoadingLifetime] = useState(false);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const birthDateStr = birthData?.birthDate || "";

  const loadSignals = useCallback(async (birth?: BirthData) => {
    const bd = birth || (await getBirthData()) || getBirthDataSync();
    if (!bd) {
      // No birth data — signal onboarding needed
      setNeedsOnboarding(true);
      setState("ready");
      return;
    }

    setBirthData(bd);
    setNeedsOnboarding(false);
    if (birth) await saveBirthData(bd);
    setState("loading");
    setError(null);

    try {
      // Fast fetch: 3-year window (2-10s)
      const yearResponse = await fetchYearData(bd);
      if (!yearResponse?.data?.success) {
        throw new Error("API returned unsuccessful response");
      }

      const yearPhases = yearDataToPhases(yearResponse);
      if (yearPhases.length === 0) {
        throw new Error("No signals found for this birth data");
      }

      setPhases(yearPhases); // year data for signal cards only
      // Do NOT set timelinePhases with year data — they have no house colors,
      // no topics, and render as ugly dark bars. Timeline waits for lifetime sausages.
      setIsLive(true);
      setState("ready");

      // Background: fetch lifetime sausages (30-120s)
      setIsLoadingLifetime(true);
      fetchAppData(bd)
        .then((appResponse) => {
          // API response may be nested: .data.data.allSausages or .data.allSausages
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const appData = (appResponse?.data as any)?.data ?? appResponse?.data;
          console.log("[Momentum] App data loaded:", appData?.allSausages?.length ?? 0, "sausages");
          if (appData?.allSausages?.length) {
            const lifetimePhases = appDataToPhases(appResponse);
            console.log("[Momentum] Converted to", lifetimePhases.length, "phases");
            if (lifetimePhases.length > 0) {
              setTimelinePhases(lifetimePhases);
            }
          }
        })
        .catch(() => {
          // Lifetime fetch failed — year data is still good, just less timeline coverage
        })
        .finally(() => {
          setIsLoadingLifetime(false);
        });
    } catch (err) {
      console.error("[Momentum] API error:", err);
      setError(err instanceof Error ? err.message : "Failed to load signals");
      setPhases([]);
      setTimelinePhases([]);
      setIsLive(false);
      setState("error");
    }
  }, []);

  // Auto-load on mount: migrate localStorage → IndexedDB, then load
  useEffect(() => {
    (async () => {
      await migrateFromLocalStorage();
      const stored = await getBirthData();
      if (stored) {
        loadSignals(stored);
      } else {
        // No birth data — needs onboarding
        setNeedsOnboarding(true);
        setState("ready");
      }
    })();
  }, [loadSignals]);

  return (
    <MomentumContext.Provider
      value={{
        phases,
        timelinePhases,
        state,
        error,
        isLive,
        isLoadingLifetime,
        birthData,
        birthDateStr,
        needsOnboarding,
        loadSignals,
      }}
    >
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
