"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clampTransitDate,
  dateKeyFromInstant,
  noonOnDateMs,
  nowUtcMs,
} from "@/lib/astrolearn-transit-time";
import { personEventDateToIso, type PersonEvent } from "@/lib/person-events";

const STORAGE_KEY = "astrolearn-session-time";

type SessionTimeState = {
  selectedEventId: string | null;
  referenceInstantMs: number;
  isLiveNow: boolean;
};

type AstrolearnSessionTimeContextValue = SessionTimeState & {
  referenceDate: string;
  selectEvent: (event: PersonEvent | null) => void;
  goToLiveNow: () => void;
  clearSelectedEvent: () => void;
};

const defaultState: SessionTimeState = {
  selectedEventId: null,
  referenceInstantMs: nowUtcMs(),
  isLiveNow: true,
};

const AstrolearnSessionTimeContext = createContext<AstrolearnSessionTimeContextValue | null>(null);

function readStoredState(): SessionTimeState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as Partial<SessionTimeState>;
    const referenceInstantMs =
      typeof parsed.referenceInstantMs === "number" && Number.isFinite(parsed.referenceInstantMs)
        ? parsed.referenceInstantMs
        : nowUtcMs();
    const selectedEventId =
      typeof parsed.selectedEventId === "string" ? parsed.selectedEventId : null;

    return {
      selectedEventId,
      referenceInstantMs,
      isLiveNow: selectedEventId ? false : parsed.isLiveNow !== false,
    };
  } catch {
    return defaultState;
  }
}

function writeStoredState(state: SessionTimeState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toReferenceDate(instantMs: number): string {
  return dateKeyFromInstant(instantMs);
}

export function AstrolearnSessionTimeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionTimeState>(() => readStoredState());

  useEffect(() => {
    writeStoredState(state);
  }, [state]);

  useEffect(() => {
    function handleSubjectChanged() {
      setState(defaultState);
    }

    window.addEventListener("astrolearn:subject-changed", handleSubjectChanged);
    return () => window.removeEventListener("astrolearn:subject-changed", handleSubjectChanged);
  }, []);

  const goToLiveNow = useCallback(() => {
    const nowMs = nowUtcMs();
    setState({
      selectedEventId: null,
      referenceInstantMs: nowMs,
      isLiveNow: true,
    });
  }, []);

  const clearSelectedEvent = useCallback(() => {
    setState((current) => ({
      ...current,
      selectedEventId: null,
      isLiveNow: true,
      referenceInstantMs: nowUtcMs(),
    }));
  }, []);

  const selectEvent = useCallback((event: PersonEvent | null) => {
    if (!event) {
      goToLiveNow();
      return;
    }

    const eventIso = personEventDateToIso(event.event_date);
    if (!eventIso) {
      return;
    }

    const normalized = clampTransitDate(eventIso);
    setState({
      selectedEventId: String(event.id_event),
      referenceInstantMs: noonOnDateMs(normalized),
      isLiveNow: false,
    });
  }, [goToLiveNow]);

  const value = useMemo<AstrolearnSessionTimeContextValue>(
    () => ({
      ...state,
      referenceDate: toReferenceDate(state.referenceInstantMs),
      selectEvent,
      goToLiveNow,
      clearSelectedEvent,
    }),
    [clearSelectedEvent, goToLiveNow, selectEvent, state]
  );

  return (
    <AstrolearnSessionTimeContext.Provider value={value}>
      {children}
    </AstrolearnSessionTimeContext.Provider>
  );
}

export function useAstrolearnSessionTime(): AstrolearnSessionTimeContextValue {
  const context = useContext(AstrolearnSessionTimeContext);
  if (!context) {
    throw new Error("useAstrolearnSessionTime must be used within AstrolearnSessionTimeProvider");
  }
  return context;
}

export function useAstrolearnReferenceNowMs(): number {
  return useAstrolearnSessionTime().referenceInstantMs;
}
