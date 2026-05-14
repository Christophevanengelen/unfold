"use client";

import { useEffect, useRef, useState, useCallback, type MutableRefObject } from "react";
import Script from "next/script";
import TransitTimeControls, {
  addUtcDays,
  addUtcStep,
  clampTransitDate,
  clampTransitInstant,
  dateKeyFromInstant,
  getPrefetchDates,
  noonUtcMs,
  nowUtcMs,
  SPEED_OPTIONS,
  todayUtcDate,
  type TransitSpeedPreset,
  type TransitStepUnit,
} from "./TransitTimeControls";

interface ChartData {
  planets: Record<string, number[]>;
  cusps: number[];
}

interface PersonInfo {
  name: string;
  birthDate: string;
  birthTime: string;
  city: string;
}

interface ProfectionInfo {
  annualHouse: number;
  monthlyHouse: number;
  annualSign: string;
  startDate: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    astrology: any;
  }
}

// ─── Zodiac sign SVG paths ────────────────────────────────────────────────────

const SIGN_PATHS: Record<string, string> = {
  Aries:        "M12 22V13M12 13C11 10 8 7 5 6C3 5 3 7 4 9M12 13C13 10 16 7 19 6C21 5 21 7 20 9",
  Taurus:       "M6 14A6 6 0 1 0 18 14M6 10C6 7 8 5 10 5M18 10C18 7 16 5 14 5",
  Gemini:       "M7 3L7 21M17 3L17 21M3 3H21M3 21H21",
  Cancer:       "M5 10C5 6 9 5 12 7C15 9 19 8 19 11M19 14C19 18 15 19 12 17C9 15 5 16 5 13",
  Leo:          "M3 12A5 5 0 1 0 13 12M13 8Q18 6 18 2",
  Virgo:        "M3 5V16M3 5C3 2 7 2 7 6V12M7 5C7 2 11 2 11 6V12C11 15 13 17 15 17C17 17 18 15 18 12",
  Libra:        "M3 17H21M3 22H21M7 17C7 13 9 11 12 11C15 11 17 13 17 17",
  Scorpio:      "M3 5V16M3 5C3 2 7 2 7 6V12M7 5C7 2 11 2 11 6V12C11 16 13 17 16 16L20 16M17 13L20 16L17 19",
  Sagittarius:  "M5 19L19 5M12 5H19V12M4 12H20",
  Capricorn:    "M3 5L9 17C10 21 13 22 15 20C17 18 16 14 13 13A4 4 0 1 0 21 13",
  Aquarius:     "M2 9Q5 5 8 9Q11 13 14 9Q17 5 20 9M2 15Q5 11 8 15Q11 19 14 15Q17 11 20 15",
  Pisces:       "M4 10Q12 3 20 10M4 14Q12 21 20 14M12 3V21",
};

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function ZodiacIcon({ sign, size = 14 }: { sign: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={sign}
    >
      <path d={SIGN_PATHS[sign]} />
    </svg>
  );
}

function lonToSign(lon: number) {
  const norm = ((lon % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  const deg = Math.floor(norm % 30);
  return { deg, name: SIGNS[idx] };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compute Whole Sign House cusps from ASC longitude (0–360). */
function computeWSHCusps(ascLon: number): number[] {
  const ascSign = Math.floor(ascLon / 30);
  return Array.from({ length: 12 }, (_, i) => ((ascSign + i) % 12) * 30);
}

/** Convert ecliptic longitude → SVG angle (radians), matching astrochart's formula. */
function lonToSVGAngle(lon: number, wheelCusp0: number): number {
  const shift = 360 - wheelCusp0;
  const deg = ((180 - (lon + shift)) % 360 + 360) % 360;
  return (deg * Math.PI) / 180;
}

/** Build an SVG donut-sector path for one house. */
function houseSectorPath(
  cusps: number[],
  houseIdx: number, // 0-based
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  asc: number
): string {
  const lon1 = cusps[houseIdx];
  const lon2 = cusps[(houseIdx + 1) % 12];
  const a1 = lonToSVGAngle(lon1, asc);
  const a2 = lonToSVGAngle(lon2, asc);
  const span = ((lon2 - lon1) + 360) % 360;
  const large = span > 180 ? 1 : 0;
  const x1o = cx + outerR * Math.cos(a1), y1o = cy + outerR * Math.sin(a1);
  const x2o = cx + outerR * Math.cos(a2), y2o = cy + outerR * Math.sin(a2);
  const x1i = cx + innerR * Math.cos(a1), y1i = cy + innerR * Math.sin(a1);
  const x2i = cx + innerR * Math.cos(a2), y2i = cy + innerR * Math.sin(a2);
  return `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${large} 0 ${x2o} ${y2o} L ${x2i} ${y2i} A ${innerR} ${innerR} 0 ${large} 1 ${x1i} ${y1i} Z`;
}

// ─── Transit overlay ─────────────────────────────────────────────────────────

const TRANSIT_SYMBOLS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  NNode: "☊", SNode: "☋",
};

interface ChartMetrics {
  size: number;
  wheelCusp0: number;
  cx: number;
  cy: number;
  baseR: number;
}

interface PlanetLayout {
  name: string;
  lon: number;
  retro: boolean;
  angle: number;
  r: number;
  x: number;
  y: number;
}

function getPlanetLon(values: number[]): number {
  return values[0] ?? 0;
}

function getPlanetRetro(values: number[]): boolean {
  return values[1] === 1 || (values.length >= 3 && values[2] < 0);
}

function normalizeTransitPlanets(
  planets: Record<string, number[]>
): Record<string, number[]> {
  const normalized: Record<string, number[]> = {};

  for (const [name, values] of Object.entries(planets)) {
    const lon = values[0] ?? 0;
    const speed = values[2] ?? 0;
    const retro = values[1] === 1 || speed < 0 ? 1 : 0;
    normalized[name] = [lon, retro, speed];
  }

  return normalized;
}

function hasTransitMotionData(planets: Record<string, number[]>): boolean {
  return Object.values(planets).every((values) => values.length >= 3);
}

function extrapolatePlanetsForInstant(
  dayPlanets: Record<string, number[]>,
  dateStr: string,
  instantMs: number
): Record<string, number[]> {
  const dayFraction = (instantMs - noonUtcMs(dateStr)) / 86_400_000;
  const moved: Record<string, number[]> = {};

  for (const [name, values] of Object.entries(dayPlanets)) {
    const lon = getPlanetLon(values);
    const speed = getPlanetSpeed(values);
    const nextLon = normalizeLon(lon + speed * dayFraction);
    const retro = speed < 0 ? 1 : values[1] === 1 ? 1 : 0;
    moved[name] = [nextLon, retro, speed];
  }

  return normalizeTransitPlanets(moved);
}

function getPlanetSpeed(values: number[]): number {
  return values[2] ?? 0;
}

function normalizeLon(lon: number): number {
  return ((lon % 360) + 360) % 360;
}

function lerpLon(from: number, to: number, t: number): number {
  let delta = to - from;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return normalizeLon(from + delta * t);
}

function interpolateTransitPlanets(
  fromPlanets: Record<string, number[]>,
  toPlanets: Record<string, number[]>,
  t: number
): Record<string, number[]> {
  const names = new Set([...Object.keys(fromPlanets), ...Object.keys(toPlanets)]);
  const blended: Record<string, number[]> = {};

  for (const name of names) {
    const from = fromPlanets[name];
    const to = toPlanets[name];
    if (!from || !to) continue;

    const fromLon = getPlanetLon(from);
    const toLon = getPlanetLon(to);
    const fromSpeed = getPlanetSpeed(from);
    const toSpeed = getPlanetSpeed(to);
    const speed = fromSpeed + (toSpeed - fromSpeed) * t;
    const lon = speed !== 0
      ? normalizeLon(fromLon + speed * t)
      : lerpLon(fromLon, toLon, t);

    const retroFlag = speed < 0
      || (t < 0.5 ? getPlanetRetro(from) : getPlanetRetro(to));

    blended[name] = [
      lon,
      retroFlag ? 1 : 0,
      speed,
    ];
  }

  return blended;
}

function computePlanetLayouts(
  planets: Record<string, number[]>,
  metrics: ChartMetrics,
  priorRadii?: Map<string, number>,
  reposition = false
): PlanetLayout[] {
  const entries = Object.entries(planets)
    .map(([name, data]) => ({
      name,
      lon: getPlanetLon(data),
      retro: getPlanetRetro(data),
    }))
    .sort((a, b) => a.lon - b.lon);

  const placed: Array<{ angle: number; r: number }> = [];
  const layouts: PlanetLayout[] = [];

  for (const planet of entries) {
    const angle = lonToSVGAngle(planet.lon, metrics.wheelCusp0);
    let r = metrics.baseR;

    if (!reposition && priorRadii?.has(planet.name)) {
      r = priorRadii.get(planet.name) ?? metrics.baseR;
    } else {
      for (const prev of placed) {
        let angDiff = Math.abs(angle - prev.angle);
        if (angDiff > Math.PI) angDiff = 2 * Math.PI - angDiff;
        const arcDist = r * angDiff;
        if (arcDist < 14 && Math.abs(r - prev.r) < 15) {
          r = Math.max(r, prev.r) + 17;
        }
      }
    }

    placed.push({ angle, r });
    layouts.push({
      ...planet,
      angle,
      r,
      x: metrics.cx + r * Math.cos(angle),
      y: metrics.cy + r * Math.sin(angle),
    });
  }

  return layouts;
}

function getChartMetrics(container: HTMLDivElement, chartData: ChartData): ChartMetrics {
  const rawWidth = container.offsetWidth;
  const size = Math.min(rawWidth > 0 ? rawWidth : 360, 580);
  const ascLon = chartData.planets["As"]?.[0] ?? chartData.cusps[0];
  const wheelCusp0 = computeWSHCusps(ascLon)[0];
  const R = size / 2 - 50;

  return {
    size,
    wheelCusp0,
    cx: size / 2,
    cy: size / 2,
    baseR: R + 26,
  };
}

function removeTransitOverlay(svg: SVGSVGElement | null) {
  svg?.querySelector("#transit-overlay")?.remove();
}

function updateTransitOverlay(
  svg: SVGSVGElement,
  planets: Record<string, number[]>,
  metrics: ChartMetrics,
  radiiRef: MutableRefObject<Map<string, number>>,
  reposition = false
) {
  svg.style.overflow = "visible";

  let overlay = svg.querySelector("#transit-overlay") as SVGGElement | null;
  if (!overlay) {
    overlay = document.createElementNS(svg.namespaceURI, "g") as SVGGElement;
    overlay.setAttribute("id", "transit-overlay");

    const ring = document.createElementNS(svg.namespaceURI, "circle") as SVGCircleElement;
    ring.setAttribute("cx", String(metrics.cx));
    ring.setAttribute("cy", String(metrics.cy));
    ring.setAttribute("r", String(metrics.baseR));
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "#2E2654");
    ring.setAttribute("stroke-width", "1");
    ring.setAttribute("stroke-dasharray", "3,3");
    overlay.appendChild(ring);
    svg.appendChild(overlay);
  }

  const layouts = computePlanetLayouts(
    planets,
    metrics,
    radiiRef.current,
    reposition
  );

  radiiRef.current = new Map(layouts.map((layout) => [layout.name, layout.r]));

  for (const layout of layouts) {
    const sym = TRANSIT_SYMBOLS[layout.name] ?? layout.name.slice(0, 2);
    let planetGroup = overlay.querySelector(
      `[data-planet="${layout.name}"]`
    ) as SVGGElement | null;

    if (!planetGroup) {
      planetGroup = document.createElementNS(svg.namespaceURI, "g") as SVGGElement;
      planetGroup.setAttribute("data-planet", layout.name);

      const tick = document.createElementNS(svg.namespaceURI, "line") as SVGLineElement;
      tick.setAttribute("data-role", "tick");
      tick.setAttribute("stroke", "#2E2654");
      tick.setAttribute("stroke-width", "0.5");
      planetGroup.appendChild(tick);

      const text = document.createElementNS(svg.namespaceURI, "text") as SVGTextElement;
      text.setAttribute("data-role", "symbol");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("font-size", "13");
      text.textContent = sym;
      planetGroup.appendChild(text);

      const retroMark = document.createElementNS(svg.namespaceURI, "text") as SVGTextElement;
      retroMark.setAttribute("data-role", "retro");
      retroMark.setAttribute("text-anchor", "middle");
      retroMark.setAttribute("dominant-baseline", "hanging");
      retroMark.setAttribute("font-size", "10");
      retroMark.setAttribute("font-weight", "700");
      retroMark.setAttribute("font-family", "Inter, system-ui, sans-serif");
      retroMark.textContent = "R";
      planetGroup.appendChild(retroMark);

      overlay.appendChild(planetGroup);
    }

    const tick = planetGroup.querySelector('[data-role="tick"]') as SVGLineElement | null;
    let text = planetGroup.querySelector('[data-role="symbol"]') as SVGTextElement | null;
    let retroMark = planetGroup.querySelector('[data-role="retro"]') as SVGTextElement | null;

    if (!text) {
      text = document.createElementNS(svg.namespaceURI, "text") as SVGTextElement;
      text.setAttribute("data-role", "symbol");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("font-size", "13");
      text.textContent = sym;
      planetGroup.appendChild(text);
    }

    if (!retroMark) {
      retroMark = document.createElementNS(svg.namespaceURI, "text") as SVGTextElement;
      retroMark.setAttribute("data-role", "retro");
      retroMark.setAttribute("text-anchor", "middle");
      retroMark.setAttribute("dominant-baseline", "hanging");
      retroMark.setAttribute("font-size", "10");
      retroMark.setAttribute("font-weight", "700");
      retroMark.setAttribute("font-family", "Inter, system-ui, sans-serif");
      retroMark.textContent = "R";
      planetGroup.appendChild(retroMark);
    }

    if (layout.r > metrics.baseR && tick) {
      const tx1 = metrics.cx + metrics.baseR * Math.cos(layout.angle);
      const ty1 = metrics.cy + metrics.baseR * Math.sin(layout.angle);
      tick.setAttribute("x1", String(tx1));
      tick.setAttribute("y1", String(ty1));
      tick.setAttribute("x2", String(layout.x));
      tick.setAttribute("y2", String(layout.y));
      tick.style.display = "";
    } else if (tick) {
      tick.style.display = "none";
    }

    if (text) {
      text.setAttribute("x", String(layout.x));
      text.setAttribute("y", String(layout.y));
      text.setAttribute("fill", "#9585CC");
    }

    if (retroMark) {
      retroMark.setAttribute("x", String(layout.x));
      retroMark.setAttribute("y", String(layout.y + 10));
      retroMark.setAttribute("fill", "#FF9B71");
      retroMark.style.display = layout.retro ? "block" : "none";
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

type ViewMode = "natal" | "transit";

export default function BirthChartPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const transitCacheRef = useRef<Map<string, Record<string, number[]>>>(new Map());
  const transitAbortRef = useRef<AbortController | null>(null);
  const prefetchInFlightRef = useRef<Set<string>>(new Set());
  const prefetchQueueRef = useRef<string[]>([]);
  const prefetchActiveRef = useRef(0);
  const transitRadiiRef = useRef<Map<string, number>>(new Map());
  const chartMetricsRef = useRef<ChartMetrics | null>(null);
  const playbackRafRef = useRef<number | null>(null);
  const playbackSegmentRef = useRef({
    anchorInstant: nowUtcMs(),
    targetInstant: nowUtcMs(),
    startedAt: 0,
    intervalMs: 500,
  });
  const isPlayingRef = useRef(false);
  const viewModeRef = useRef<ViewMode>("natal");
  const speedPresetRef = useRef<TransitSpeedPreset>("normal");
  const stepUnitRef = useRef<TransitStepUnit>("day");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [person, setPerson] = useState<PersonInfo | null>(null);
  const [transitPlanets, setTransitPlanets] = useState<Record<string, number[]> | null>(null);
  const [profection, setProfection] = useState<ProfectionInfo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("natal");
  const [transitDate, setTransitDate] = useState(todayUtcDate);
  const [transitInstantMs, setTransitInstantMs] = useState(nowUtcMs);
  const transitInstantRef = useRef(transitInstantMs);
  const [stepUnit, setStepUnit] = useState<TransitStepUnit>("day");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedPreset, setSpeedPreset] = useState<TransitSpeedPreset>("normal");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [transitLoading, setTransitLoading] = useState(false);
  const [transitError, setTransitError] = useState("");
  const [scriptReady, setScriptReady] = useState(false);

  // Fetch natal chart + profections in parallel on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/astrolearn/chart-data").then((r) => r.json()),
      fetch("/api/astrolearn/profections").then((r) => r.json()),
    ])
      .then(([chartRes, profRes]) => {
        if (chartRes.error) { setError(chartRes.error); return; }
        setChartData(chartRes.data);
        setPerson(chartRes.data?.person ?? null);

        // Extract profection data
        const pd = profRes.data || profRes;
        const currentYear = pd?.currentYear ?? {};
        const annualHouse: number = currentYear?.house ?? pd?.activatedHouse ?? 0;
        const annualSign: string = currentYear?.sign ?? pd?.sign ?? "";
        const startDateStr: string = currentYear?.startDate ?? "";

        if (annualHouse) {
          // Monthly profection: advances 1 house per month since last birthday
          let monthlyHouse = annualHouse;
          if (startDateStr) {
            const start = new Date(startDateStr);
            const now = new Date();
            const monthsElapsed =
              (now.getFullYear() - start.getFullYear()) * 12 +
              (now.getMonth() - start.getMonth());
            monthlyHouse = ((annualHouse - 1 + Math.max(0, monthsElapsed)) % 12) + 1;
          }
          setProfection({ annualHouse, monthlyHouse, annualSign, startDate: startDateStr });
        }
      })
      .catch(() => setError("Failed to load chart data"))
      .finally(() => setLoading(false));
  }, []);

  const applyPlanetsToOverlay = useCallback((
    planets: Record<string, number[]>,
    reposition = false
  ) => {
    const container = containerRef.current;
    const metrics = chartMetricsRef.current;
    if (!container || !metrics) return;

    const svg = container.querySelector("svg") as SVGSVGElement | null;
    if (!svg) return;

    updateTransitOverlay(svg, planets, metrics, transitRadiiRef, reposition);
  }, []);

  const stopPlayback = useCallback(() => {
    isPlayingRef.current = false;
    if (playbackRafRef.current !== null) {
      cancelAnimationFrame(playbackRafRef.current);
      playbackRafRef.current = null;
    }
  }, []);

  const prefetchTransitDate = useCallback((date: string, priorityDates: string[] = []) => {
    const cache = transitCacheRef.current;
    const inFlight = prefetchInFlightRef.current;
    const preset = speedPresetRef.current;
    const unit = stepUnitRef.current;
    const queued = new Set(prefetchQueueRef.current);
    const orderedDates = [
      ...priorityDates,
      ...getPrefetchDates(date, unit, preset),
    ];

    for (const target of orderedDates) {
      const normalized = clampTransitDate(target);
      if (cache.has(normalized) || inFlight.has(normalized) || queued.has(normalized)) {
        continue;
      }
      prefetchQueueRef.current.push(normalized);
      queued.add(normalized);
    }

    const MAX_PREFETCH_CONCURRENCY = 3;

    const pumpPrefetchQueue = () => {
      while (
        prefetchActiveRef.current < MAX_PREFETCH_CONCURRENCY &&
        prefetchQueueRef.current.length > 0
      ) {
        const target = prefetchQueueRef.current.shift();
        if (!target) break;
        if (cache.has(target) || inFlight.has(target)) continue;

        inFlight.add(target);
        prefetchActiveRef.current += 1;

        void fetch(`/api/astrolearn/transits-now?date=${target}`)
          .then((response) => response.json())
          .then((payload) => {
            const planets = payload.data?.planets ?? payload.planets;
            if (planets) cache.set(target, normalizeTransitPlanets(planets));
          })
          .catch(() => undefined)
          .finally(() => {
            inFlight.delete(target);
            prefetchActiveRef.current = Math.max(0, prefetchActiveRef.current - 1);
            pumpPrefetchQueue();
          });
      }
    };

    pumpPrefetchQueue();
  }, []);

  const loadTransitDate = useCallback(
    async (date: string, options?: { silent?: boolean; updateState?: boolean }) => {
      const normalized = clampTransitDate(date);
      const cache = transitCacheRef.current;
      const cached = cache.get(normalized);
      const updateState = options?.updateState ?? true;

      if (cached && hasTransitMotionData(cached)) {
        const planets = normalizeTransitPlanets(cached);
        if (updateState) {
          setTransitPlanets(planets);
          setTransitError("");
        }
        prefetchTransitDate(normalized);
        return planets;
      }

      transitAbortRef.current?.abort();
      const controller = new AbortController();
      transitAbortRef.current = controller;

      if (!options?.silent && updateState) {
        setTransitLoading(true);
      }
      if (updateState) {
        setTransitError("");
      }

      try {
        const response = await fetch(`/api/astrolearn/transits-now?date=${normalized}`, {
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load transits");
        }

        const planets = normalizeTransitPlanets(
          payload.data?.planets ?? payload.planets
        );
        if (!planets || !hasTransitMotionData(planets)) {
          throw new Error("Transit data was missing from the response");
        }

        cache.set(normalized, planets);
        if (!controller.signal.aborted) {
          if (updateState) {
            setTransitPlanets(planets);
          }
          prefetchTransitDate(normalized);
        }
        return planets;
      } catch (err) {
        if (controller.signal.aborted) return null;
        if (updateState) {
          setTransitError(err instanceof Error ? err.message : "Failed to load transits");
        }
        return null;
      } finally {
        if (!controller.signal.aborted && !options?.silent && updateState) {
          setTransitLoading(false);
        }
      }
    },
    [prefetchTransitDate]
  );

  const startPlaybackSegment = useCallback((anchorInstant: number) => {
    const unit = stepUnitRef.current;
    const preset = SPEED_OPTIONS.find((option) => option.id === speedPresetRef.current) ?? SPEED_OPTIONS[1];
    const targetInstant = clampTransitInstant(addUtcStep(anchorInstant, unit, 1));
    playbackSegmentRef.current = {
      anchorInstant,
      targetInstant,
      startedAt: performance.now(),
      intervalMs: preset.intervalMs,
    };
    const anchorDate = dateKeyFromInstant(anchorInstant);
    const targetDate = dateKeyFromInstant(targetInstant);
    prefetchTransitDate(anchorDate, [targetDate]);
  }, [prefetchTransitDate]);

  const runPlaybackFrame = useCallback(() => {
    if (!isPlayingRef.current || viewModeRef.current !== "transit") {
      playbackRafRef.current = null;
      return;
    }

    const segment = playbackSegmentRef.current;
    const cache = transitCacheRef.current;
    const elapsed = performance.now() - segment.startedAt;
    const progress = Math.min(1, elapsed / segment.intervalMs);
    const currentInstant =
      segment.anchorInstant + (segment.targetInstant - segment.anchorInstant) * progress;
    const currentDate = dateKeyFromInstant(currentInstant);
    const dayPlanets = cache.get(currentDate);

    if (!dayPlanets) {
      void loadTransitDate(currentDate, { silent: true, updateState: false });
      const anchorDate = dateKeyFromInstant(segment.anchorInstant);
      const anchorPlanets = cache.get(anchorDate);
      if (anchorPlanets) {
        applyPlanetsToOverlay(
          extrapolatePlanetsForInstant(anchorPlanets, anchorDate, segment.anchorInstant)
        );
      }
      playbackRafRef.current = requestAnimationFrame(runPlaybackFrame);
      return;
    }

    applyPlanetsToOverlay(
      extrapolatePlanetsForInstant(dayPlanets, currentDate, currentInstant)
    );

    if (progress < 1) {
      playbackRafRef.current = requestAnimationFrame(runPlaybackFrame);
      return;
    }

    const anchorDate = dateKeyFromInstant(segment.anchorInstant);
    const targetDate = dateKeyFromInstant(segment.targetInstant);
    transitInstantRef.current = segment.targetInstant;
    setTransitInstantMs(segment.targetInstant);
    if (targetDate !== anchorDate) {
      setTransitDate(targetDate);
      setTransitPlanets(dayPlanets);
    }

    const nextTarget = clampTransitInstant(
      addUtcStep(segment.targetInstant, stepUnitRef.current, 1)
    );
    if (nextTarget === segment.targetInstant) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      playbackRafRef.current = null;
      return;
    }

    startPlaybackSegment(segment.targetInstant);
    playbackRafRef.current = requestAnimationFrame(runPlaybackFrame);
  }, [applyPlanetsToOverlay, loadTransitDate, startPlaybackSegment]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    speedPresetRef.current = speedPreset;
    if (viewModeRef.current === "transit") {
      prefetchTransitDate(transitDate);
    }
  }, [speedPreset, transitDate, prefetchTransitDate]);

  useEffect(() => {
    stepUnitRef.current = stepUnit;
  }, [stepUnit]);

  useEffect(() => {
    transitInstantRef.current = transitInstantMs;
  }, [transitInstantMs]);

  useEffect(() => {
    if (viewMode !== "transit") return;
    void loadTransitDate(transitDate, { silent: isPlaying });
  }, [viewMode, transitDate, isPlaying, loadTransitDate]);

  useEffect(() => {
    if (!isPlaying || viewMode !== "transit") {
      stopPlayback();
      return;
    }

    startPlaybackSegment(transitInstantRef.current);
    playbackRafRef.current = requestAnimationFrame(runPlaybackFrame);

    return () => {
      stopPlayback();
    };
  }, [isPlaying, viewMode, runPlaybackFrame, startPlaybackSegment, stopPlayback]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    if (mode === "natal") {
      setIsPlaying(false);
      stopPlayback();
      const nowMs = nowUtcMs();
      setTransitInstantMs(nowMs);
      setTransitDate(dateKeyFromInstant(nowMs));
      const svg = containerRef.current?.querySelector("svg") as SVGSVGElement | null;
      removeTransitOverlay(svg);
    }
    setViewMode(mode);
  }, [stopPlayback]);

  const handleGoToNow = useCallback(() => {
    setIsPlaying(false);
    stopPlayback();
    transitRadiiRef.current = new Map();
    const nowMs = nowUtcMs();
    const nowDate = dateKeyFromInstant(nowMs);
    setTransitInstantMs(nowMs);
    setTransitDate(nowDate);
    prefetchTransitDate(nowDate, [nowDate]);
  }, [prefetchTransitDate, stopPlayback]);

  const handleTransitDateChange = useCallback((date: string) => {
    setIsPlaying(false);
    stopPlayback();
    transitRadiiRef.current = new Map();
    const normalized = clampTransitDate(date);
    setTransitDate(normalized);
    setTransitInstantMs(noonUtcMs(normalized));
  }, [stopPlayback]);

  const handleStepUnitChange = useCallback((unit: TransitStepUnit) => {
    stepUnitRef.current = unit;
    setStepUnit(unit);
  }, []);

  const handleTransitStep = useCallback((direction: 1 | -1) => {
    setIsPlaying(false);
    stopPlayback();

    const unit = stepUnitRef.current;
    const currentInstant = transitInstantRef.current;
    const nextInstant = clampTransitInstant(addUtcStep(currentInstant, unit, direction));
    const currentDate = dateKeyFromInstant(currentInstant);
    const nextDate = dateKeyFromInstant(nextInstant);

    transitInstantRef.current = nextInstant;
    setTransitInstantMs(nextInstant);

    if (unit === "day" || unit === "year") {
      if (unit === "year") {
        transitRadiiRef.current = new Map();
      }
      setTransitDate(nextDate);
      void loadTransitDate(nextDate);
      prefetchTransitDate(nextDate, [nextDate]);
      return;
    }

    if (nextDate !== currentDate) {
      setTransitDate(nextDate);
      prefetchTransitDate(nextDate, [nextDate]);
    }
  }, [loadTransitDate, prefetchTransitDate, stopPlayback]);

  const renderNatalChart = useCallback(() => {
    if (!chartData || !containerRef.current || !window.astrology) return;

    containerRef.current.innerHTML = "";
    const metrics = getChartMetrics(containerRef.current, chartData);
    chartMetricsRef.current = metrics;
    const { size, cx, cy } = metrics;

    const chart = new window.astrology.Chart("astro-chart-container", size, size, {
      COLOR_BACKGROUND: "#0F0C22",
      COLOR_CIRCLE_TRANSIT: "#2E2654",
      SYMBOL_SCALE: 0.6,
      MARGIN: 50,
      SHOW_DIGNITIES_TEXT: false,
      POINTS_COLOR: "#ffffff",
      POINTS_STROKE: 1.8,
      SIGNS_COLOR: "#000000",
      CIRCLE_COLOR: "#3C317F",
      LINE_COLOR: "#3C317F",
      CUSPS_FONT_COLOR: "#ffffff",
      SYMBOL_AXIS_FONT_COLOR: "#ffffff",
    });

    const ascLon = chartData.planets["As"]?.[0] ?? chartData.cusps[0];
    const cusps = computeWSHCusps(ascLon);

    chart.radix({ planets: chartData.planets, cusps });

    containerRef.current.querySelector('[id$="-radix-axis"]')?.remove();

    const svg = containerRef.current.querySelector("svg") as SVGSVGElement | null;

    if (profection && svg) {
      const pointsGroup = containerRef.current.querySelector('[id$="-radix-points"]');
      const R = size / 2 - 50;
      const innerR = R * 0.50;
      const outerR = R * 0.88;

      const overlayG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      overlayG.setAttribute("id", "profection-overlay");

      const layers: Array<{ house: number; color: string; opacity: string }> = [
        { house: profection.annualHouse, color: "#9585CC", opacity: "0.22" },
        { house: profection.monthlyHouse, color: "#7AE0D9", opacity: "0.16" },
      ];

      for (const { house, color, opacity } of layers) {
        if (!house) continue;
        const d = houseSectorPath(cusps, house - 1, cx, cy, innerR, outerR, cusps[0]);
        const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathEl.setAttribute("d", d);
        pathEl.setAttribute("fill", color);
        pathEl.setAttribute("fill-opacity", opacity);
        pathEl.setAttribute("pointer-events", "none");
        overlayG.appendChild(pathEl);
      }

      if (pointsGroup) {
        svg.insertBefore(overlayG, pointsGroup);
      }
    }
  }, [chartData, profection]);

  useEffect(() => {
    if (!scriptReady || !chartData) return;
    renderNatalChart();
    transitRadiiRef.current = new Map();
  }, [scriptReady, chartData, profection, renderNatalChart]);

  useEffect(() => {
    if (viewMode !== "transit" || !transitPlanets || isPlaying) return;
    const displayPlanets = extrapolatePlanetsForInstant(
      transitPlanets,
      transitDate,
      transitInstantMs
    );
    applyPlanetsToOverlay(displayPlanets, false);
  }, [viewMode, transitPlanets, transitDate, transitInstantMs, isPlaying, applyPlanetsToOverlay]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#9585CC] border-t-transparent animate-spin" />
        <p className="text-[#8C7FAE] text-sm">Calculating your birth chart…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="/js/astrochart.min.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />

      <div className="space-y-5">
        {/* Person header */}
        {person && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{person.name}</h2>
            <p className="text-sm text-[#8C7FAE] mt-0.5">
              {person.birthDate} {person.birthTime}
              {person.city ? ` · ${person.city}` : ""}
            </p>
          </div>
        )}

        {/* View mode toggle */}
        <div className="flex justify-center">
          <div
            className="inline-flex rounded-full p-0.5"
            style={{ background: "rgba(46,38,84,0.5)", border: "1px solid rgba(46,38,84,0.8)" }}
          >
            {(["natal", "transit"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleViewModeChange(mode)}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                style={
                  viewMode === mode
                    ? { background: "#9585CC", color: "#fff" }
                    : { color: "#8C7FAE" }
                }
              >
                {mode === "natal" ? "Birth Chart" : "+ Transits"}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="flex justify-center relative">
          <div
            ref={containerRef}
            id="astro-chart-container"
            className="w-full max-w-[580px]"
            style={{ aspectRatio: "1/1" }}
          />
          {transitLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0F0C22]/60 rounded-xl">
              <div className="w-6 h-6 rounded-full border-2 border-[#9585CC] border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        {viewMode === "transit" ? (
          <TransitTimeControls
            instantMs={transitInstantMs}
            stepUnit={stepUnit}
            playing={isPlaying}
            speed={speedPreset}
            loading={transitLoading}
            error={transitError}
            onNow={handleGoToNow}
            onDateChange={handleTransitDateChange}
            onPlayingChange={setIsPlaying}
            onSpeedChange={setSpeedPreset}
            onStepUnitChange={handleStepUnitChange}
            onStep={handleTransitStep}
          />
        ) : null}

        {/* Profection legend */}
        {profection && (
          <div
            className="flex items-center justify-center gap-4 text-xs rounded-xl px-4 py-2.5 mx-auto"
            style={{ background: "rgba(19,15,39,0.8)", border: "1px solid rgba(46,38,84,0.5)", maxWidth: 400 }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: "#9585CC" }} />
              <span className="text-[#8C7FAE]">Year</span>
              <span className="text-white font-semibold ml-0.5">H{profection.annualHouse}</span>
              {(() => { const s = lonToSign((profection.annualHouse - 1) * 30); return <ZodiacIcon sign={s.name} size={12} />; })()}
            </span>
            <span className="text-[#2E2654]">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: "#7AE0D9" }} />
              <span className="text-[#8C7FAE]">Month</span>
              <span className="text-white font-semibold ml-0.5">H{profection.monthlyHouse}</span>
              {(() => { const s = lonToSign((profection.monthlyHouse - 1) * 30); return <ZodiacIcon sign={s.name} size={12} />; })()}
            </span>
          </div>
        )}

        {/* Planet positions */}
        {chartData && (
          <details className="rounded-2xl border border-[#2E2654] bg-[#130F27]/80 p-4">
            <summary className="text-xs text-[#8C7FAE] cursor-pointer font-bold uppercase tracking-widest">
              Planet positions
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3">
              {Object.entries(chartData.planets).map(([planet, [lon]]) => {
                const sign = lonToSign(lon);
                return (
                  <div key={planet} className="text-xs flex justify-between gap-2 py-0.5">
                    <span className="text-[#9585CC] font-medium">{planet}</span>
                    <span className="text-[#8C7FAE] font-mono flex items-center gap-1">
                      {sign.deg}° {sign.name} <ZodiacIcon sign={sign.name} size={13} />
                    </span>
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>
    </>
  );
}
