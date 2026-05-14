"use client";

import {
  ChevronDoubleLeft,
  ChevronDoubleRight,
  Clock,
  Pause,
  Play,
} from "flowbite-react-icons/outline";

export type TransitSpeedPreset = "slow" | "normal" | "fast" | "rapid";
export type TransitStepUnit = "second" | "minute" | "day" | "year";

export const TRANSIT_MIN_DATE = "1800-01-01";
export const TRANSIT_MAX_DATE = "2200-12-31";

export const SPEED_OPTIONS: Array<{
  id: TransitSpeedPreset;
  label: string;
  intervalMs: number;
}> = [
  { id: "slow", label: "2s / step", intervalMs: 2000 },
  { id: "normal", label: "0.5s / step", intervalMs: 500 },
  { id: "fast", label: "0.25s / step", intervalMs: 250 },
  { id: "rapid", label: "0.1s / step", intervalMs: 100 },
];

export const STEP_UNIT_OPTIONS: Array<{ id: TransitStepUnit; label: string }> = [
  { id: "second", label: "Second" },
  { id: "minute", label: "Minute" },
  { id: "day", label: "Day" },
  { id: "year", label: "Year" },
];

export function getLookaheadDays(preset: TransitSpeedPreset): number {
  const option = SPEED_OPTIONS.find((entry) => entry.id === preset) ?? SPEED_OPTIONS[1];
  const stepsPerSecond = 1000 / option.intervalMs;
  return Math.min(180, Math.max(14, Math.ceil(stepsPerSecond * 4)));
}

function getFutureStepDates(
  fromDate: string,
  stepUnit: TransitStepUnit,
  count: number
): string[] {
  let instant = noonUtcMs(fromDate);
  const dates: string[] = [];

  for (let step = 1; step <= count; step += 1) {
    instant = addUtcStep(instant, stepUnit, 1);
    dates.push(clampTransitDate(dateKeyFromInstant(instant)));
  }

  return dates;
}

export function getPrefetchDates(
  fromDate: string,
  stepUnit: TransitStepUnit,
  preset: TransitSpeedPreset
): string[] {
  const lookaheadDays = getLookaheadDays(preset);

  if (stepUnit === "year") {
    return getFutureStepDates(fromDate, stepUnit, Math.max(4, Math.ceil(lookaheadDays / 365)));
  }

  if (stepUnit === "day") {
    return getFutureStepDates(fromDate, stepUnit, lookaheadDays);
  }

  const stepsToCover = Math.max(lookaheadDays, Math.ceil(lookaheadDays * 86_400_000 / getStepMs(stepUnit)));
  return getFutureStepDates(fromDate, stepUnit, Math.min(180, stepsToCover));
}

function getStepMs(unit: TransitStepUnit): number {
  switch (unit) {
    case "second":
      return 1000;
    case "minute":
      return 60_000;
    case "day":
      return 86_400_000;
    case "year":
      return 365 * 86_400_000;
  }
}

export function nowUtcMs(): number {
  return Date.now();
}

export function todayUtcDate(): string {
  return formatUtcDate(new Date(nowUtcMs()));
}

export function formatUtcDate(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function dateKeyFromInstant(instantMs: number): string {
  return formatUtcDate(new Date(instantMs));
}

export function noonUtcMs(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return Date.UTC(year, month - 1, day, 12, 0, 0, 0);
}

export function clampTransitDate(dateStr: string): string {
  if (dateStr < TRANSIT_MIN_DATE) return TRANSIT_MIN_DATE;
  if (dateStr > TRANSIT_MAX_DATE) return TRANSIT_MAX_DATE;
  return dateStr;
}

export function clampTransitInstant(instantMs: number): number {
  const minMs = noonUtcMs(TRANSIT_MIN_DATE);
  const maxMs = Date.UTC(2200, 11, 31, 23, 59, 59, 999);
  return Math.min(maxMs, Math.max(minMs, instantMs));
}

export function addUtcDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return formatUtcDate(date);
}

export function addUtcStep(
  instantMs: number,
  unit: TransitStepUnit,
  direction: 1 | -1
): number {
  const date = new Date(instantMs);

  switch (unit) {
    case "second":
      return instantMs + direction * 1000;
    case "minute":
      return instantMs + direction * 60_000;
    case "day":
      return Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() + direction,
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
      );
    case "year":
      return Date.UTC(
        date.getUTCFullYear() + direction,
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
      );
  }
}

export function formatTransitInstantLabel(instantMs: number, stepUnit: TransitStepUnit): string {
  const date = new Date(instantMs);
  const options: Intl.DateTimeFormatOptions =
    stepUnit === "second" || stepUnit === "minute"
      ? {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "UTC",
          hour12: false,
        }
      : {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        };

  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

interface TransitTimeControlsProps {
  instantMs: number;
  stepUnit: TransitStepUnit;
  playing: boolean;
  speed: TransitSpeedPreset;
  loading: boolean;
  error?: string;
  onNow: () => void;
  onDateChange: (date: string) => void;
  onPlayingChange: (playing: boolean) => void;
  onSpeedChange: (speed: TransitSpeedPreset) => void;
  onStepUnitChange: (unit: TransitStepUnit) => void;
  onStep: (direction: 1 | -1) => void;
}

export default function TransitTimeControls({
  instantMs,
  stepUnit,
  playing,
  speed,
  loading,
  error,
  onNow,
  onDateChange,
  onPlayingChange,
  onSpeedChange,
  onStepUnitChange,
  onStep,
}: TransitTimeControlsProps) {
  const date = dateKeyFromInstant(instantMs);
  const atMin = date <= TRANSIT_MIN_DATE;
  const atMax = date >= TRANSIT_MAX_DATE;
  const stepLabel = STEP_UNIT_OPTIONS.find((option) => option.id === stepUnit)?.label ?? "Day";

  return (
    <div
      className="mx-auto w-full max-w-[580px] rounded-2xl px-4 py-3 space-y-3"
      style={{
        background: "rgba(19,15,39,0.9)",
        border: "1px solid rgba(46,38,84,0.8)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8C7FAE]">
          Transit time
        </p>
        <p className="text-sm font-semibold text-white tabular-nums">
          {formatTransitInstantLabel(instantMs, stepUnit)}
          {loading ? <span className="ml-2 text-[#8C7FAE] font-normal">Updating…</span> : null}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={atMin}
          aria-label={`Step back one ${stepLabel.toLowerCase()}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2E2654] text-[#9585CC] transition-colors hover:bg-[#2E2654]/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronDoubleLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onPlayingChange(!playing)}
          aria-label={playing ? "Pause transit animation" : "Play transit animation"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors"
          style={{ background: "#9585CC" }}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={atMax}
          aria-label={`Step forward one ${stepLabel.toLowerCase()}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2E2654] text-[#9585CC] transition-colors hover:bg-[#2E2654]/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronDoubleRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onNow}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#9585CC] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#9585CC]/20"
        >
          <Clock className="h-3.5 w-3.5" />
          Now
        </button>

        <label className="flex items-center gap-2 text-xs text-[#8C7FAE]">
          <span className="font-semibold uppercase tracking-wider">Step</span>
          <select
            value={stepUnit}
            onChange={(event) => onStepUnitChange(event.target.value as TransitStepUnit)}
            className="rounded-lg border border-[#2E2654] bg-[#0F0C22] px-2 py-1.5 text-xs font-medium text-white outline-none"
          >
            {STEP_UNIT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-[#8C7FAE]">
          <span className="font-semibold uppercase tracking-wider">Tempo</span>
          <select
            value={speed}
            onChange={(event) => onSpeedChange(event.target.value as TransitSpeedPreset)}
            className="rounded-lg border border-[#2E2654] bg-[#0F0C22] px-2 py-1.5 text-xs font-medium text-white outline-none"
          >
            {SPEED_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-[#8C7FAE]">
          <span className="font-semibold uppercase tracking-wider">Jump</span>
          <input
            type="date"
            value={date}
            min={TRANSIT_MIN_DATE}
            max={TRANSIT_MAX_DATE}
            onChange={(event) => onDateChange(clampTransitDate(event.target.value))}
            className="rounded-lg border border-[#2E2654] bg-[#0F0C22] px-2 py-1.5 text-xs font-medium text-white outline-none"
          />
        </label>
      </div>

      {error ? <p className="text-center text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
