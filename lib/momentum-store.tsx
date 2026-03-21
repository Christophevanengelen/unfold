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
import { getBirthData, saveBirthData, type BirthData } from "@/lib/birth-data";
import { fetchYearData, fetchAppData } from "@/lib/momentum-api";
import { yearDataToPhases, appDataToPhases } from "@/lib/momentum-adapter";
import { mockTimeline, type MomentumPhase } from "@/lib/mock-timeline";

// ─── Context shape ──────────────────────────────────────────

type LoadState = "idle" | "loading" | "ready" | "error";

interface MomentumContextValue {
  /** Current phases for home capsules (from year data or mock) */
  phases: MomentumPhase[];
  /** Full lifetime phases for timeline (from app data, or year data as fallback) */
  timelinePhases: MomentumPhase[];
  /** Loading state */
  state: LoadState;
  /** Error message if any */
  error: string | null;
  /** Whether using real API data vs mock fallback */
  isLive: boolean;
  /** Whether the lifetime data is still loading in background */
  isLoadingLifetime: boolean;
  /** Current birth data (null if using mock) */
  birthData: BirthData | null;
  /** Birth date string for timeline coordinate system */
  birthDateStr: string;
  /** Trigger a fetch with new or existing birth data */
  loadSignals: (birth?: BirthData) => Promise<void>;
  /** Switch to mock data (demo mode) */
  useMockData: () => void;
}

const MomentumContext = createContext<MomentumContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────

export function MomentumProvider({ children }: { children: ReactNode }) {
  const [phases, setPhases] = useState<MomentumPhase[]>(mockTimeline);
  const [timelinePhases, setTimelinePhases] =
    useState<MomentumPhase[]>(mockTimeline);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoadingLifetime, setIsLoadingLifetime] = useState(false);
  const [birthData, setBirthData] = useState<BirthData | null>(null);

  // Default birth date for timeline when using mock
  const birthDateStr =
    birthData?.birthDate || "1986-05-14"; // matches mock-timeline default

  const loadSignals = useCallback(async (birth?: BirthData) => {
    const bd = birth || getBirthData();
    if (!bd) {
      // No birth data — use mock
      setPhases(mockTimeline);
      setTimelinePhases(mockTimeline);
      setIsLive(false);
      setState("ready");
      return;
    }

    setBirthData(bd);
    if (birth) saveBirthData(bd);
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

      setPhases(yearPhases);
      setTimelinePhases(yearPhases); // temporary until lifetime loads
      setIsLive(true);
      setState("ready");

      // Background: fetch lifetime sausages (30-120s)
      setIsLoadingLifetime(true);
      fetchAppData(bd)
        .then((appResponse) => {
          if (appResponse?.data?.success && appResponse.data.allSausages?.length) {
            const lifetimePhases = appDataToPhases(appResponse);
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
      // Fallback to mock
      setPhases(mockTimeline);
      setTimelinePhases(mockTimeline);
      setIsLive(false);
      setState("error");
    }
  }, []);

  const useMockData = useCallback(() => {
    setPhases(mockTimeline);
    setTimelinePhases(mockTimeline);
    setIsLive(false);
    setBirthData(null);
    setState("ready");
    setError(null);
  }, []);

  // Auto-load on mount if birth data exists
  useEffect(() => {
    const stored = getBirthData();
    if (stored) {
      loadSignals(stored);
    } else {
      setState("ready"); // start with mock, no loading needed
    }
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
        loadSignals,
        useMockData,
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
