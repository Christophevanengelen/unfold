"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarMonth,
  ChevronDoubleLeft,
  ChevronDoubleRight,
  Clock,
  Close,
  Pause,
  Play,
  Plus,
} from "flowbite-react-icons/outline";
import {
  EU_DATE_PLACEHOLDER,
  formatEuropeanDateDraft,
  formatEuropeanDateInput,
  parseEuropeanDateInput,
} from "@/lib/european-date";
import {
  createAspectCriterion,
  createDegreeCriterion,
  JUMP_ASPECT_NAMES,
  JUMP_MOVING_PLANET_NAMES,
  JUMP_NATAL_POINT_NAMES,
  JUMP_SIGN_NAMES,
  type AspectJumpCriterion,
  type DegreeJumpCriterion,
  type JumpMatchMode,
} from "@/lib/astrolearn-transit-jump";
import {
  addTransitCalendarDays,
  addTransitStep,
  clampTransitDate,
  clampTransitInstant,
  dateKeyFromInstant,
  formatTransitDateKey,
  formatTransitInstantLabel,
  getDefaultTransitTimeZone,
  noonOnDateMs,
  nowUtcMs,
  resolveTransitTimeZone,
  setActiveTransitTimeZone,
  todayTransitDate,
  TRANSIT_MAX_DATE,
  TRANSIT_MIN_DATE,
  type TransitStepUnit,
} from "@/lib/astrolearn-transit-time";

export type TransitSpeedPreset = "slow" | "normal" | "fast" | "rapid";
export type { TransitStepUnit };
export {
  addTransitCalendarDays as addUtcDays,
  addTransitStep as addUtcStep,
  clampTransitDate,
  clampTransitInstant,
  dateKeyFromInstant,
  formatTransitDateKey,
  formatTransitInstantLabel,
  getDefaultTransitTimeZone,
  noonOnDateMs as noonUtcMs,
  nowUtcMs,
  resolveTransitTimeZone,
  setActiveTransitTimeZone,
  todayTransitDate as todayUtcDate,
  TRANSIT_MAX_DATE,
  TRANSIT_MIN_DATE,
};

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
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export type JumpMode = "date" | "degrees" | "aspects";

export const JUMP_MOVING_PLANET_OPTIONS = [...JUMP_MOVING_PLANET_NAMES];
export const JUMP_NATAL_POINT_OPTIONS = [...JUMP_NATAL_POINT_NAMES];
export const JUMP_SIGN_OPTIONS = [...JUMP_SIGN_NAMES];

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
  let instant = noonOnDateMs(fromDate);
  const dates: string[] = [];

  for (let step = 1; step <= count; step += 1) {
    instant = addTransitStep(instant, stepUnit, 1);
    dates.push(clampTransitDate(dateKeyFromInstant(instant)));
  }

  return dates;
}

function getPastStepDates(
  fromDate: string,
  stepUnit: TransitStepUnit,
  count: number
): string[] {
  let instant = noonOnDateMs(fromDate);
  const dates: string[] = [];

  for (let step = 1; step <= count; step += 1) {
    instant = addTransitStep(instant, stepUnit, -1);
    dates.push(clampTransitDate(dateKeyFromInstant(instant)));
  }

  return dates;
}

export function getPrefetchDates(
  fromDate: string,
  stepUnit: TransitStepUnit,
  preset: TransitSpeedPreset,
  direction: 1 | -1 = 1
): string[] {
  const lookaheadDays = getLookaheadDays(preset);

  if (direction < 0) {
    if (stepUnit === "year") {
      return getPastStepDates(fromDate, stepUnit, Math.max(4, Math.ceil(lookaheadDays / 365)));
    }

    if (stepUnit === "month") {
      return getPastStepDates(fromDate, stepUnit, Math.max(4, Math.ceil(lookaheadDays / 30)));
    }

    if (stepUnit === "week") {
      return getPastStepDates(fromDate, stepUnit, Math.max(4, Math.ceil(lookaheadDays / 7)));
    }

    if (stepUnit === "day") {
      return getPastStepDates(fromDate, stepUnit, lookaheadDays);
    }

    const stepsToCover = Math.max(
      lookaheadDays,
      Math.ceil(lookaheadDays * 86_400_000 / getStepMs(stepUnit))
    );
    return getPastStepDates(fromDate, stepUnit, Math.min(180, stepsToCover));
  }

  if (stepUnit === "year") {
    return getFutureStepDates(fromDate, stepUnit, Math.max(4, Math.ceil(lookaheadDays / 365)));
  }

  if (stepUnit === "month") {
    return getFutureStepDates(fromDate, stepUnit, Math.max(4, Math.ceil(lookaheadDays / 30)));
  }

  if (stepUnit === "week") {
    return getFutureStepDates(fromDate, stepUnit, Math.max(4, Math.ceil(lookaheadDays / 7)));
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
    case "week":
      return 7 * 86_400_000;
    case "month":
      return 30 * 86_400_000;
    case "year":
      return 365 * 86_400_000;
  }
}

export function formatTransitDateInput(isoDate: string): string {
  return formatEuropeanDateInput(isoDate);
}

export function parseTransitDateInput(raw: string): string | null {
  return parseEuropeanDateInput(raw);
}

export type PositionJumpDirection = "next" | "previous";

interface TransitTimeControlsProps {
  instantMs: number;
  timeZone?: string;
  stepUnit: TransitStepUnit;
  playing: boolean;
  playbackDirection: 1 | -1;
  speed: TransitSpeedPreset;
  loading: boolean;
  error?: string;
  positionJumpLoading?: boolean;
  positionJumpNote?: string;
  onNow: () => void;
  onDateChange: (date: string) => void;
  onPlaybackDirectionChange: (direction: 1 | -1) => void;
  onTransitJump: (payload: {
    degrees: DegreeJumpCriterion[];
    aspects: AspectJumpCriterion[];
    match: JumpMatchMode;
    direction: PositionJumpDirection;
  }) => void;
  onPlayingChange: (playing: boolean) => void;
  onSpeedChange: (speed: TransitSpeedPreset) => void;
  onStepUnitChange: (unit: TransitStepUnit) => void;
  onStep: (direction: 1 | -1) => void;
}

export default function TransitTimeControls({
  instantMs,
  timeZone,
  stepUnit,
  playing,
  playbackDirection,
  speed,
  loading,
  error,
  positionJumpLoading = false,
  positionJumpNote,
  onNow,
  onDateChange,
  onPlaybackDirectionChange,
  onTransitJump,
  onPlayingChange,
  onSpeedChange,
  onStepUnitChange,
  onStep,
}: TransitTimeControlsProps) {
  const transitTz = resolveTransitTimeZone(timeZone);
  const date = dateKeyFromInstant(instantMs, transitTz);
  const atMin = date <= TRANSIT_MIN_DATE;
  const atMax = date >= TRANSIT_MAX_DATE;
  const stepLabel = STEP_UNIT_OPTIONS.find((option) => option.id === stepUnit)?.label ?? "Day";
  const [jumpMode, setJumpMode] = useState<JumpMode>("date");
  const [jumpMatch, setJumpMatch] = useState<JumpMatchMode>("all");
  const [degreeCriteria, setDegreeCriteria] = useState<DegreeJumpCriterion[]>([
    createDegreeCriterion(),
  ]);
  const [aspectCriteria, setAspectCriteria] = useState<AspectJumpCriterion[]>([
    createAspectCriterion(),
  ]);
  const calendarInputRef = useRef<HTMLInputElement>(null);

  // Le champ n a d etat PROPRE que pendant la saisie.
  //
  // Il en avait un en permanence, recopie depuis `date` par un effet des que le
  // champ n avait pas le focus. Chaque pas de transit rendait donc le champ
  // avec l ancienne date, puis l effet le corrigeait — le scintillement que
  // React 19 signale, sur un controle qu on actionne en rafale.
  //
  // `saisie` ne vaut autre chose que null que le temps d une frappe. Hors
  // saisie, la valeur affichee se DERIVE de `date` : il n y a plus deux
  // sources a garder d accord, donc plus rien a resynchroniser.
  const [saisie, setSaisie] = useState<string | null>(null);
  const dateDraft = saisie ?? formatTransitDateInput(date);

  const commitDateDraft = () => {
    // Rendre la main au rendu derive : que la date soit acceptee ou non, ce qui
    // s affiche ensuite est la date REELLE, y compris quand elle a ete bornee.
    setSaisie(null);
    const parsed = parseTransitDateInput(dateDraft);
    if (parsed) {
      onDateChange(clampTransitDate(parsed));
    }
  };

  const applyCalendarDate = (isoDate: string) => {
    setSaisie(null);
    onDateChange(clampTransitDate(isoDate));
  };

  const openCalendarPicker = () => {
    const input = calendarInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
    input.click();
  };

  const submitTransitJump = (direction: PositionJumpDirection) => {
    onPlaybackDirectionChange(direction === "previous" ? -1 : 1);
    onTransitJump({
      degrees: jumpMode === "degrees" ? degreeCriteria : [],
      aspects: jumpMode === "aspects" ? aspectCriteria : [],
      match: jumpMatch,
      direction,
    });
  };

  const handleStepBack = () => {
    onPlaybackDirectionChange(-1);
    if (jumpMode === "degrees" || jumpMode === "aspects") {
      submitTransitJump("previous");
      return;
    }
    onStep(-1);
  };

  const handleStepForward = () => {
    onPlaybackDirectionChange(1);
    if (jumpMode === "degrees" || jumpMode === "aspects") {
      submitTransitJump("next");
      return;
    }
    onStep(1);
  };

  const updateDegreeCriterion = (
    id: string,
    patch: Partial<DegreeJumpCriterion>
  ) => {
    setDegreeCriteria((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const updateAspectCriterion = (
    id: string,
    patch: Partial<AspectJumpCriterion>
  ) => {
    setAspectCriteria((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const fieldClass =
    "rounded-lg border border-[#2E2654] bg-[#0F0C22] px-2 py-1.5 text-xs font-medium text-white outline-none";

  const stepButtonClass = (active: boolean) =>
    `inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
      active
        ? "border-[#9585CC] bg-[#9585CC]/25 text-white"
        : "border-[#2E2654] text-[#9585CC] hover:bg-[#2E2654]/40"
    }`;

  return (
    <div
      className="mx-auto w-full max-w-[720px] rounded-2xl px-4 py-3 space-y-3"
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
          {formatTransitInstantLabel(instantMs, stepUnit, transitTz)}
          {loading ? <span className="ml-2 text-[#8C7FAE] font-normal">Updating…</span> : null}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleStepBack}
          disabled={jumpMode === "date" && atMin}
          aria-label={
            jumpMode === "degrees" || jumpMode === "aspects"
              ? "Find previous match for jump criteria"
              : `Step back one ${stepLabel.toLowerCase()}`
          }
          aria-pressed={playbackDirection === -1}
          className={stepButtonClass(playbackDirection === -1)}
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
          onClick={handleStepForward}
          disabled={jumpMode === "date" && atMax}
          aria-label={
            jumpMode === "degrees" || jumpMode === "aspects"
              ? "Find next match for jump criteria"
              : `Step forward one ${stepLabel.toLowerCase()}`
          }
          aria-pressed={playbackDirection === 1}
          className={stepButtonClass(playbackDirection === 1)}
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C7FAE]">Jump</span>
          <select
            value={jumpMode}
            onChange={(event) => setJumpMode(event.target.value as JumpMode)}
            className="rounded-lg border border-[#2E2654] bg-[#0F0C22] px-2 py-1.5 text-xs font-medium text-white outline-none"
          >
            <option value="date">Date</option>
            <option value="degrees">Degrees</option>
            <option value="aspects">Aspects</option>
          </select>

          {jumpMode === "date" ? (
            <div className="flex items-stretch overflow-hidden rounded-lg border border-[#2E2654] bg-[#0F0C22]">
              <input
                type="text"
                value={dateDraft}
                onChange={(event) => setSaisie(formatEuropeanDateDraft(event.target.value))}
                onBlur={commitDateDraft}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }
                }}
                inputMode="numeric"
                placeholder={EU_DATE_PLACEHOLDER}
                aria-label="Jump to date"
                className="w-[9.5rem] border-0 bg-transparent px-2 py-1.5 text-xs font-medium text-white outline-none"
              />
              <button
                type="button"
                onClick={openCalendarPicker}
                aria-label="Choose date from calendar"
                className="inline-flex items-center border-l border-[#2E2654] px-2 text-[#9585CC] transition-colors hover:bg-[#2E2654]/40"
              >
                <CalendarMonth className="h-3.5 w-3.5" />
              </button>
              <input
                ref={calendarInputRef}
                type="date"
                value={date}
                min={TRANSIT_MIN_DATE}
                max={TRANSIT_MAX_DATE}
                onChange={(event) => applyCalendarDate(event.target.value)}
                tabIndex={-1}
                aria-hidden
                className="sr-only"
              />
            </div>
          ) : jumpMode === "degrees" || jumpMode === "aspects" ? (
            <>
              <select
                value={jumpMatch}
                onChange={(event) => setJumpMatch(event.target.value as JumpMatchMode)}
                className={fieldClass}
                aria-label="Jump match mode"
              >
                <option value="all">All criteria</option>
                <option value="any">Any criterion</option>
              </select>
              <button
                type="button"
                onClick={() => submitTransitJump("previous")}
                disabled={positionJumpLoading}
                className="rounded-lg border border-[#9585CC] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#9585CC]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {positionJumpLoading ? "Finding…" : "Find previous"}
              </button>
              <button
                type="button"
                onClick={() => submitTransitJump("next")}
                disabled={positionJumpLoading}
                className="rounded-lg border border-[#9585CC] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#9585CC]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {positionJumpLoading ? "Finding…" : "Find next"}
              </button>
            </>
          ) : null}
        </div>

        {jumpMode === "degrees" ? (
          <div className="space-y-2">
            {degreeCriteria.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center gap-2">
                <select
                  value={row.planet}
                  onChange={(event) =>
                    updateDegreeCriterion(row.id, { planet: event.target.value })
                  }
                  className={fieldClass}
                >
                  {JUMP_MOVING_PLANET_OPTIONS.map((planet) => (
                    <option key={planet} value={planet}>
                      {planet}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  max={29}
                  value={row.degree}
                  onChange={(event) =>
                    updateDegreeCriterion(row.id, {
                      degree: Number(event.target.value),
                    })
                  }
                  className={`w-16 ${fieldClass}`}
                  aria-label="Degree in sign"
                />
                <span className="text-xs font-semibold text-[#8C7FAE]">°</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={row.minute}
                  onChange={(event) =>
                    updateDegreeCriterion(row.id, {
                      minute: Number(event.target.value),
                    })
                  }
                  className={`w-16 ${fieldClass}`}
                  aria-label="Minute in sign"
                />
                <span className="text-xs font-semibold text-[#8C7FAE]">&apos;</span>
                <select
                  value={row.sign}
                  onChange={(event) =>
                    updateDegreeCriterion(row.id, { sign: event.target.value })
                  }
                  className={fieldClass}
                >
                  {JUMP_SIGN_OPTIONS.map((sign) => (
                    <option key={sign} value={sign}>
                      {sign}
                    </option>
                  ))}
                </select>
                {degreeCriteria.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setDegreeCriteria((rows) => rows.filter((entry) => entry.id !== row.id))
                    }
                    aria-label="Remove degree criterion"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#2E2654] text-[#8C7FAE] transition-colors hover:bg-[#2E2654]/40"
                  >
                    <Close className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setDegreeCriteria((rows) => [...rows, createDegreeCriterion()])
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2E2654] px-3 py-1.5 text-xs font-semibold text-[#9585CC] transition-colors hover:bg-[#2E2654]/40"
            >
              <Plus className="h-3.5 w-3.5" />
              Add degree
            </button>
          </div>
        ) : null}

        {jumpMode === "aspects" ? (
          <div className="space-y-2">
            {aspectCriteria.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center gap-2">
                <select
                  value={row.planet}
                  onChange={(event) =>
                    updateAspectCriterion(row.id, { planet: event.target.value })
                  }
                  className={fieldClass}
                >
                  {JUMP_MOVING_PLANET_OPTIONS.map((planet) => (
                    <option key={planet} value={planet}>
                      {planet}
                    </option>
                  ))}
                </select>
                <select
                  value={row.aspect}
                  onChange={(event) =>
                    updateAspectCriterion(row.id, { aspect: event.target.value })
                  }
                  className={fieldClass}
                >
                  {JUMP_ASPECT_NAMES.map((aspect) => (
                    <option key={aspect} value={aspect}>
                      {aspect}
                    </option>
                  ))}
                </select>
                <select
                  value={row.target}
                  onChange={(event) =>
                    updateAspectCriterion(row.id, {
                      target: event.target.value as AspectJumpCriterion["target"],
                    })
                  }
                  className={fieldClass}
                >
                  <option value="transit">Transit</option>
                  <option value="natal">Natal</option>
                </select>
                <select
                  value={row.targetPlanet}
                  onChange={(event) =>
                    updateAspectCriterion(row.id, { targetPlanet: event.target.value })
                  }
                  className={fieldClass}
                >
                  {(row.target === "natal"
                    ? JUMP_NATAL_POINT_OPTIONS
                    : JUMP_MOVING_PLANET_OPTIONS
                  ).map((planet) => (
                    <option key={planet} value={planet}>
                      {planet}
                    </option>
                  ))}
                </select>
                {aspectCriteria.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setAspectCriteria((rows) => rows.filter((entry) => entry.id !== row.id))
                    }
                    aria-label="Remove aspect criterion"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#2E2654] text-[#8C7FAE] transition-colors hover:bg-[#2E2654]/40"
                  >
                    <Close className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setAspectCriteria((rows) => [...rows, createAspectCriterion()])
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2E2654] px-3 py-1.5 text-xs font-semibold text-[#9585CC] transition-colors hover:bg-[#2E2654]/40"
            >
              <Plus className="h-3.5 w-3.5" />
              Add aspect
            </button>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-center text-xs text-red-400">{error}</p> : null}
      {positionJumpNote ? <p className="text-center text-xs text-[#8C7FAE]">{positionJumpNote}</p> : null}
    </div>
  );
}
