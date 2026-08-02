import { NextRequest, NextResponse } from "next/server";
import {
  AstrologySubjectError,
  getCalculatorRequest,
  resolveAstrologySubject,
} from "@/lib/astrology-subject";
import { callCalculatorEndpoint } from "@/lib/astrolearn-calculator";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type AxisEclipse = {
  date: string;
  type: "solar" | "lunar";
  sign?: string;
  degree?: number;
};

type NatalHit = {
  date: string;
  eclipseType: "solar" | "lunar";
  natalPoint: string;
  aspect: string;
  orb?: number;
  isVipAspect: boolean;
  isExactAspect: boolean;
};

type EclipseSeries = {
  seriesId: string;
  axis: string;
  zodiacAxis: string;
  axisColor: string;
  seriesStart: string;
  seriesEnd: string;
  lastAxisTouch: string;
  lifetimeNumber?: number;
  lifetimeTotal?: number;
  allEclipses: AxisEclipse[];
  natalHits: NatalHit[];
};

function resolveTargetDate(request: NextRequest): string {
  const requested = request.nextUrl.searchParams.get("date");
  if (requested && DATE_RE.test(requested)) {
    return requested;
  }
  return new Date().toISOString().split("T")[0];
}

function shiftIsoDate(isoDate: string, months: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, day));
  return date.toISOString().split("T")[0];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeEclipseType(value: unknown): "solar" | "lunar" {
  return String(value).toLowerCase() === "lunar" ? "lunar" : "solar";
}

function extractSausages(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload);
  if (!root) return [];

  const direct = root.allSausages;
  if (Array.isArray(direct)) {
    return direct.filter((item): item is Record<string, unknown> => asRecord(item) !== null);
  }

  const nested = asRecord(root.data);
  if (!nested) return [];

  const nestedSausages = nested.allSausages;
  if (Array.isArray(nestedSausages)) {
    return nestedSausages.filter((item): item is Record<string, unknown> => asRecord(item) !== null);
  }

  const doubleNested = asRecord(nested.data);
  const doubleSausages = doubleNested?.allSausages;
  if (Array.isArray(doubleSausages)) {
    return doubleSausages.filter((item): item is Record<string, unknown> => asRecord(item) !== null);
  }

  return [];
}

function normalizeAxisEclipses(value: unknown): AxisEclipse[] {
  if (!Array.isArray(value)) return [];

  const eclipses: AxisEclipse[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      eclipses.push({ date: item.slice(0, 10), type: "solar" });
      continue;
    }

    const row = asRecord(item);
    if (!row) continue;

    const date = asString(row.date) ?? asString(row.startDate);
    if (!date) continue;

    eclipses.push({
      date: date.slice(0, 10),
      type: normalizeEclipseType(row.type ?? row.eclipseType),
      sign: asString(row.sign) ?? asString(row.eclipseSign),
      degree: asNumber(row.degree),
    });
  }

  return eclipses;
}

function mergeAxisEclipses(existing: AxisEclipse[], incoming: AxisEclipse[]): AxisEclipse[] {
  const map = new Map<string, AxisEclipse>();
  for (const eclipse of [...existing, ...incoming]) {
    map.set(`${eclipse.date}|${eclipse.type}`, eclipse);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function formatHouseAxis(houses: unknown): string | undefined {
  if (!Array.isArray(houses)) return undefined;
  const nums = houses.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  if (nums.length < 2) return undefined;
  nums.sort((a, b) => a - b);
  return `${nums[0]}-${nums[nums.length - 1]}`;
}

function deriveSeriesBounds(
  allEclipses: AxisEclipse[],
  fallback: { seriesStart?: string; seriesEnd?: string; lastAxisTouch?: string },
  referenceDate: string
): Pick<EclipseSeries, "seriesStart" | "seriesEnd" | "lastAxisTouch"> {
  if (allEclipses.length > 0) {
    const dates = allEclipses.map((eclipse) => eclipse.date);
    return {
      seriesStart: dates[0],
      seriesEnd: dates[dates.length - 1],
      lastAxisTouch: dates[dates.length - 1],
    };
  }

  const seriesStart = fallback.seriesStart ?? referenceDate;
  const seriesEnd = fallback.seriesEnd ?? seriesStart;
  return {
    seriesStart,
    seriesEnd,
    lastAxisTouch: fallback.lastAxisTouch ?? seriesEnd,
  };
}

function seriesOverlapsScan(
  series: Pick<EclipseSeries, "seriesStart" | "seriesEnd">,
  scanStartDate: string,
  scanEndDate: string
): boolean {
  return series.seriesStart <= scanEndDate && series.seriesEnd >= scanStartDate;
}

function collectSeriesHits(sausage: Record<string, unknown>): NatalHit[] {
  const hits: NatalHit[] = [];
  const natalPoint = asString(sausage.natalPoint);
  const hitDate = (asString(sausage.startDate) ?? asString(sausage.date))?.slice(0, 10);
  const aspect =
    asString(sausage.aspect) ??
    (String(sausage.label ?? sausage.type ?? "").toLowerCase().includes("conj")
      ? "conjunction"
      : "aspect");
  const eclipseType = normalizeEclipseType(sausage.eclipseType);

  if (natalPoint && hitDate) {
    hits.push({
      date: hitDate,
      eclipseType,
      natalPoint,
      aspect,
      orb: asNumber(sausage.orb),
      isVipAspect: asBoolean(sausage.isVipAspect),
      isExactAspect: asBoolean(sausage.isExactAspect),
    });
  }

  const seriesAllDates = sausage.seriesAllDates;
  if (!Array.isArray(seriesAllDates)) return hits;

  for (const item of seriesAllDates) {
    const row = asRecord(item);
    if (!row) continue;

    const date = asString(row.date)?.slice(0, 10);
    const point = asString(row.natalPoint);
    if (!date || !point) continue;

    hits.push({
      date,
      eclipseType,
      natalPoint: point,
      aspect,
      orb: asNumber(row.orb),
      isVipAspect: asBoolean(sausage.isVipAspect),
      isExactAspect: asBoolean(row.isExactAspect) || asBoolean(row.isExact),
    });
  }

  return hits;
}

function buildEclipseSeries(
  sausages: Record<string, unknown>[],
  referenceDate: string,
  scanStartDate: string,
  scanEndDate: string
): EclipseSeries[] {
  const groups = new Map<string, EclipseSeries>();

  for (const sausage of sausages) {
    if (sausage.category !== "eclipse") continue;

    const seriesId = asString(sausage.eclipseSeriesId) ?? asString(sausage.groupId);
    if (!seriesId) continue;

    const startDate = asString(sausage.startDate) ?? asString(sausage.date);
    const houseAxis = formatHouseAxis(sausage.eclipseHouses);
    const zodiacAxis = asString(sausage.eclipseAxis) ?? "—";
    const axis = houseAxis ?? zodiacAxis;
    const axisColor = asString(sausage.axisColor) ?? "#9585CC";
    const seriesStart = asString(sausage.eclipseSeriesStart) ?? startDate;
    const seriesEnd = asString(sausage.eclipseSeriesEnd) ?? startDate;
    const lastAxisTouch = asString(sausage.lastAxisTouch) ?? seriesEnd;
    const axisEclipses = normalizeAxisEclipses(sausage.eclipseSeriesAllAxisDates);

    const existing = groups.get(seriesId);
    if (!existing) {
      groups.set(seriesId, {
        seriesId,
        axis,
        zodiacAxis,
        axisColor,
        seriesStart: seriesStart ?? referenceDate,
        seriesEnd: seriesEnd ?? referenceDate,
        lastAxisTouch: lastAxisTouch ?? seriesEnd ?? referenceDate,
        lifetimeNumber: asNumber(sausage.lifetimeNumber),
        lifetimeTotal: asNumber(sausage.lifetimeTotal),
        allEclipses: axisEclipses,
        natalHits: [],
      });
    } else {
      if (houseAxis) existing.axis = houseAxis;
      if (zodiacAxis !== "—") existing.zodiacAxis = zodiacAxis;
      if (seriesStart && seriesStart < existing.seriesStart) existing.seriesStart = seriesStart;
      if (seriesEnd && seriesEnd > existing.seriesEnd) existing.seriesEnd = seriesEnd;
      if (lastAxisTouch && lastAxisTouch > existing.lastAxisTouch) existing.lastAxisTouch = lastAxisTouch;
      existing.allEclipses = mergeAxisEclipses(existing.allEclipses, axisEclipses);
      if (existing.lifetimeNumber == null) existing.lifetimeNumber = asNumber(sausage.lifetimeNumber);
      if (existing.lifetimeTotal == null) existing.lifetimeTotal = asNumber(sausage.lifetimeTotal);
    }

    const target = groups.get(seriesId);
    if (!target) continue;

    for (const hit of collectSeriesHits(sausage)) {
      target.natalHits.push(hit);
    }
  }

  const series = Array.from(groups.values())
    .map((item) => {
      const uniqueHits = new Map<string, NatalHit>();
      for (const hit of item.natalHits) {
        const key = `${hit.date}|${hit.natalPoint}|${hit.aspect}`;
        const current = uniqueHits.get(key);
        if (!current || (hit.orb ?? 99) < (current.orb ?? 99)) {
          uniqueHits.set(key, hit);
        }
      }

      const allEclipses = [...item.allEclipses].sort((a, b) => a.date.localeCompare(b.date));
      const natalHits = Array.from(uniqueHits.values()).sort((a, b) => a.date.localeCompare(b.date));
      const bounds = deriveSeriesBounds(allEclipses, item, referenceDate);

      return {
        ...item,
        ...bounds,
        allEclipses,
        natalHits,
      };
    })
    .filter((item) => seriesOverlapsScan(item, scanStartDate, scanEndDate))
    .sort((a, b) => a.seriesStart.localeCompare(b.seriesStart));

  return series;
}

export async function GET(request: NextRequest) {
  try {
    const subject = await resolveAstrologySubject();
    const referenceDate = resolveTargetDate(request);
    const scanStartDate = shiftIsoDate(referenceDate, -60);
    const scanEndDate = shiftIsoDate(referenceDate, 36);

    const { endpoint, input } = getCalculatorRequest(subject, "toctoc-app");
    const raw = await callCalculatorEndpoint(endpoint, {
      ...input,
      _scanStartDate: scanStartDate,
      _scanEndDate: scanEndDate,
    });

    const sausages = extractSausages(raw);
    const series = buildEclipseSeries(sausages, referenceDate, scanStartDate, scanEndDate);

    return NextResponse.json({
      success: true,
      referenceDate,
      scanStartDate,
      scanEndDate,
      data: series,
      total: series.length,
    });
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/astrolearn/eclipses]", err);
    return NextResponse.json({ error: "Failed to calculate eclipse series" }, { status: 500 });
  }
}
