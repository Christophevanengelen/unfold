export const TRANSIT_MIN_DATE = "1800-01-01";
export const TRANSIT_MAX_DATE = "2200-12-31";

export type TransitStepUnit = "second" | "minute" | "day" | "week" | "month" | "year";

/** Birth / observer IANA zone (e.g. Europe/Brussels). Falls back to browser local. */
let activeTransitTimeZone: string | undefined;

export function setActiveTransitTimeZone(timeZone: string | undefined) {
  activeTransitTimeZone = timeZone?.trim() || undefined;
}

export function getDefaultTransitTimeZone(): string {
  if (typeof Intl === "undefined") {
    return "UTC";
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function resolveTransitTimeZone(timeZone?: string): string {
  return timeZone ?? activeTransitTimeZone ?? getDefaultTransitTimeZone();
}

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getZonedParts(instantMs: number, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date(instantMs));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

/** YYYY-MM-DD in the given IANA timezone. */
export function formatTransitDateKey(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: resolveTransitTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function instantAtZonedWallTime(
  dateKey: string,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  for (let utcHour = -12; utcHour <= 36; utcHour += 1) {
    const candidate = Date.UTC(year, month - 1, day, utcHour, minute, second);
    const parts = getZonedParts(candidate, timeZone);
    const key = formatTransitDateKey(new Date(candidate), timeZone);
    if (
      key === dateKey &&
      parts.hour === hour &&
      parts.minute === minute &&
      parts.second === second
    ) {
      return candidate;
    }
  }
  return new Date(year, month - 1, day, hour, minute, second).getTime();
}

export function nowUtcMs(): number {
  return Date.now();
}

export function todayTransitDate(timeZone?: string): string {
  return dateKeyFromInstant(nowUtcMs(), timeZone);
}

export function dateKeyFromInstant(instantMs: number, timeZone?: string): string {
  return formatTransitDateKey(new Date(instantMs), timeZone);
}

/** Noon on the given calendar date in the active (or supplied) IANA timezone. */
export function noonOnDateMs(dateStr: string, timeZone?: string): number {
  return instantAtZonedWallTime(dateStr, 12, 0, 0, resolveTransitTimeZone(timeZone));
}

/** @deprecated Use noonOnDateMs */
export const noonUtcMs = noonOnDateMs;

/** @deprecated Use todayTransitDate */
export const todayUtcDate = todayTransitDate;

export function clampTransitDate(dateStr: string): string {
  if (dateStr < TRANSIT_MIN_DATE) return TRANSIT_MIN_DATE;
  if (dateStr > TRANSIT_MAX_DATE) return TRANSIT_MAX_DATE;
  return dateStr;
}

export function clampTransitInstant(instantMs: number, timeZone?: string): number {
  const tz = resolveTransitTimeZone(timeZone);
  const minMs = noonOnDateMs(TRANSIT_MIN_DATE, tz);
  const maxMs = instantAtZonedWallTime(TRANSIT_MAX_DATE, 23, 59, 59, tz);
  return Math.min(maxMs, Math.max(minMs, instantMs));
}

export function addTransitCalendarDays(
  dateStr: string,
  days: number,
  timeZone?: string
): string {
  const tz = resolveTransitTimeZone(timeZone);
  if (days === 0) {
    return dateStr;
  }

  let current = dateStr;
  const step = days > 0 ? 1 : -1;
  for (let index = 0; index < Math.abs(days); index += 1) {
    let probe = noonOnDateMs(current, tz) + step * 43_200_000;
    while (true) {
      const key = formatTransitDateKey(new Date(probe), tz);
      if (key !== current) {
        current = key;
        break;
      }
      probe += step * 3_600_000;
    }
  }
  return current;
}

/** @deprecated Use addTransitCalendarDays */
export const addUtcDays = addTransitCalendarDays;

export function addTransitStep(
  instantMs: number,
  unit: TransitStepUnit,
  direction: 1 | -1,
  timeZone?: string
): number {
  const tz = resolveTransitTimeZone(timeZone);
  const wall = getZonedParts(instantMs, tz);
  const dateKey = formatTransitDateKey(new Date(instantMs), tz);

  switch (unit) {
    case "second":
      return instantMs + direction * 1000;
    case "minute":
      return instantMs + direction * 60_000;
    case "day":
      return instantAtZonedWallTime(
        addTransitCalendarDays(dateKey, direction, tz),
        wall.hour,
        wall.minute,
        wall.second,
        tz
      );
    case "week":
      return instantAtZonedWallTime(
        addTransitCalendarDays(dateKey, direction * 7, tz),
        wall.hour,
        wall.minute,
        wall.second,
        tz
      );
    case "month": {
      const monthIndex = wall.month - 1 + direction;
      const year = wall.year + Math.floor(monthIndex / 12);
      const month = ((monthIndex % 12) + 12) % 12;
      const day = Math.min(wall.day, new Date(year, month + 1, 0).getDate());
      const nextKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return instantAtZonedWallTime(nextKey, wall.hour, wall.minute, wall.second, tz);
    }
    case "year": {
      const nextKey = `${wall.year + direction}-${String(wall.month).padStart(2, "0")}-${String(wall.day).padStart(2, "0")}`;
      return instantAtZonedWallTime(nextKey, wall.hour, wall.minute, wall.second, tz);
    }
  }
}

/** @deprecated Use addTransitStep */
export const addUtcStep = addTransitStep;

export function formatTransitInstantLabel(
  instantMs: number,
  stepUnit: TransitStepUnit,
  timeZone?: string
): string {
  const date = new Date(instantMs);
  const tz = resolveTransitTimeZone(timeZone);
  const options: Intl.DateTimeFormatOptions =
    stepUnit === "second" || stepUnit === "minute"
      ? {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: tz,
          hour12: false,
        }
      : {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: tz,
        };

  return new Intl.DateTimeFormat("en-GB", options).format(date);
}
