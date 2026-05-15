"use client";

import { useEffect, useRef, useState, useCallback, type MutableRefObject } from "react";
import Script from "next/script";
import { useAstrolearnSubjectReload } from "@/lib/use-astrolearn-subject-reload";
import { useAstrolearnSessionTime } from "@/lib/astrolearn-session-time";
import { formatJumpEventDescription } from "@/lib/astrolearn-transit-jump";
import { formatEuropeanDateInput } from "@/lib/european-date";
import { personEventDateToIso, type PersonEvent } from "@/lib/person-events";
import PersonEventSelector from "./PersonEventSelector";
import TransitTimeControls, {
  addUtcDays,
  addUtcStep,
  clampTransitDate,
  clampTransitInstant,
  dateKeyFromInstant,
  getPrefetchDates,
  noonUtcMs,
  nowUtcMs,
  setActiveTransitTimeZone,
  SPEED_OPTIONS,
  type TransitSpeedPreset,
  type TransitStepUnit,
} from "./TransitTimeControls";

interface ChartData {
  planets: Record<string, number[]>;
  cusps: number[];
  lots?: {
    fortune?: { longitude?: number };
    spirit?: { longitude?: number };
    eros?: { longitude?: number };
  };
}

interface PersonInfo {
  name: string;
  birthDate: string;
  birthTime: string;
  city: string;
  timezone?: string;
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

function formatPlanetLongitude(lon: number): string {
  const normalized = ((lon % 360) + 360) % 360;
  const sign = SIGNS[Math.floor(normalized / 30)];
  const inSign = normalized % 30;
  let degrees = Math.floor(inSign);
  let minutes = Math.floor((inSign - degrees) * 60);
  let seconds = Math.round(((inSign - degrees) * 60 - minutes) * 60);

  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }
  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
  }

  const minuteText = String(minutes).padStart(2, "0");
  if (seconds > 0) {
    const secondText = String(seconds).padStart(2, "0");
    return `${degrees}° ${minuteText}' ${secondText}" ${sign}`;
  }
  return `${degrees}° ${minuteText}' ${sign}`;
}

interface PlanetTooltipHandlers {
  show: (label: string, clientX: number, clientY: number) => void;
  hide: () => void;
}

function getNatalPlanetRadius(metrics: ChartMetrics): number {
  const ringRadius = metrics.size / 2 - 50;
  return ringRadius - ringRadius / 8 - 18 * 0.6;
}

const NATAL_PLANET_DOM_ALIASES: Record<string, string[]> = {
  NNode: ["NNode", "North Node"],
  SNode: ["SNode", "South Node"],
};

function findNatalPlanetGroup(svg: SVGSVGElement, planetName: string): SVGGElement | null {
  const names = NATAL_PLANET_DOM_ALIASES[planetName] ?? [planetName];

  for (const name of names) {
    const selectors = [
      `g[id$="-radix-planets-${name}"]`,
      `g[id$="-radix-${name}"]`,
      `g[id$="-${name}"]`,
    ];

    for (const selector of selectors) {
      const match = svg.querySelector(selector);
      if (match instanceof SVGGElement) {
        return match;
      }
    }
  }

  return null;
}

function resolveNatalPlanetCenter(
  svg: SVGSVGElement,
  planetName: string,
  lon: number,
  metrics: ChartMetrics
): { x: number; y: number } {
  const radixGroup = findNatalPlanetGroup(svg, planetName);
  if (radixGroup) {
    try {
      const bbox = radixGroup.getBBox();
      if (bbox.width > 0 || bbox.height > 0) {
        return {
          x: bbox.x + bbox.width / 2,
          y: bbox.y + bbox.height / 2,
        };
      }
    } catch {
      // Ignore missing layout boxes while the SVG is still rendering.
    }
  }

  const radius = getNatalPlanetRadius(metrics);
  const angle = lonToSVGAngle(lon, metrics.wheelCusp0);
  return {
    x: metrics.cx + radius * Math.cos(angle),
    y: metrics.cy + radius * Math.sin(angle),
  };
}

function bringNatalHoverLayerToFront(svg: SVGSVGElement) {
  const layer = svg.querySelector("#natal-hover-layer");
  if (layer) {
    svg.appendChild(layer);
  }
}

function attachPlanetHoverTarget(
  group: SVGGElement,
  lon: number,
  handlers: PlanetTooltipHandlers,
  center?: { x: number; y: number },
  planetName?: string
) {
  group.setAttribute("data-lon", String(lon));
  if (planetName) {
    group.setAttribute("data-planet", planetName);
  }

  const svg = group.ownerSVGElement;
  if (!svg) return;

  let hit = group.querySelector('[data-role="hit"]') as SVGCircleElement | null;
  if (!hit) {
    hit = document.createElementNS(svg.namespaceURI, "circle") as SVGCircleElement;
    hit.setAttribute("data-role", "hit");
    hit.setAttribute("fill", "transparent");
    hit.setAttribute("pointer-events", "all");
    group.appendChild(hit);
  }

  hit.setAttribute("r", "22");

  if (center) {
    hit.setAttribute("cx", String(center.x));
    hit.setAttribute("cy", String(center.y));
  } else {
    try {
      const bbox = group.getBBox();
      if (bbox.width > 0 || bbox.height > 0) {
        hit.setAttribute("cx", String(bbox.x + bbox.width / 2));
        hit.setAttribute("cy", String(bbox.y + bbox.height / 2));
      }
    } catch {
      // Ignore missing layout boxes while the SVG is still rendering.
    }
  }

  group.appendChild(hit);

  if (hit.getAttribute("data-hover-bound") === "1") {
    return;
  }

  hit.setAttribute("data-hover-bound", "1");
  hit.style.cursor = "default";

  const show = (event: MouseEvent) => {
    const raw = group.getAttribute("data-lon");
    if (!raw) return;
    const label = formatPlanetLongitude(Number(raw));
    const name = group.getAttribute("data-planet");
    handlers.show(name ? `${name} · ${label}` : label, event.clientX, event.clientY);
  };

  hit.addEventListener("mouseenter", show);
  hit.addEventListener("mousemove", show);
  hit.addEventListener("mouseleave", () => handlers.hide());
}

function bindNatalPlanetHovers(
  container: HTMLDivElement,
  planets: Record<string, number[]>,
  handlers: PlanetTooltipHandlers,
  metrics: ChartMetrics
) {
  const svg = container.querySelector("svg");
  if (!svg) return;

  let layer = svg.querySelector("#natal-hover-layer") as SVGGElement | null;
  if (!layer) {
    layer = document.createElementNS(svg.namespaceURI, "g") as SVGGElement;
    layer.setAttribute("id", "natal-hover-layer");
    svg.appendChild(layer);
  }

  layer.replaceChildren();

  for (const [name, values] of Object.entries(planets)) {
    const lon = getPlanetLon(values);
    const center = resolveNatalPlanetCenter(svg, name, lon, metrics);
    const group = document.createElementNS(svg.namespaceURI, "g") as SVGGElement;
    group.setAttribute("pointer-events", "all");
    attachPlanetHoverTarget(group, lon, handlers, center, name);
    layer.appendChild(group);
  }

  bringNatalHoverLayerToFront(svg);
}

function scheduleNatalPlanetHovers(
  container: HTMLDivElement | null,
  planets: Record<string, number[]> | undefined,
  handlers: PlanetTooltipHandlers,
  metrics: ChartMetrics | null
) {
  if (!container || !planets || !metrics) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!container.isConnected) return;
      bindNatalPlanetHovers(container, planets, handlers, metrics);
    });
  });
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

type RetroStatus = "R" | "SR" | "SD" | null;

interface PlanetLayout {
  name: string;
  lon: number;
  retroStatus: RetroStatus;
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

const ALWAYS_RETROGRADE = new Set(["NNode", "SNode"]);

function getRetroStatus(values: number[], name?: string): RetroStatus {
  if (name && ALWAYS_RETROGRADE.has(name)) return null;
  const apiFlag = values[1] === 1;
  const speed = values.length >= 3 ? values[2] : 0;
  if (apiFlag && speed < 0) return "R";
  if (apiFlag && speed >= 0) return "SR";
  if (!apiFlag && speed < 0) return "SD";
  return null;
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

function extrapolatePlanetsAcrossSegment(
  anchorPlanets: Record<string, number[]>,
  anchorInstant: number,
  currentInstant: number
): Record<string, number[]> {
  const elapsedDays = (currentInstant - anchorInstant) / 86_400_000;
  const moved: Record<string, number[]> = {};

  for (const [name, values] of Object.entries(anchorPlanets)) {
    const lon = getPlanetLon(values);
    const speed = getPlanetSpeed(values);
    const nextLon = normalizeLon(lon + speed * elapsedDays);
    const retro = speed < 0 ? 1 : values[1] === 1 ? 1 : 0;
    moved[name] = [nextLon, retro, speed];
  }

  return normalizeTransitPlanets(moved);
}

function blendPlanetsForSegmentInstant(
  anchorPlanets: Record<string, number[]>,
  anchorInstant: number,
  targetPlanets: Record<string, number[]>,
  targetInstant: number,
  currentInstant: number
): Record<string, number[]> {
  const span = targetInstant - anchorInstant;
  const progress = span === 0 ? 0 : (currentInstant - anchorInstant) / span;
  const clamped = Math.min(1, Math.max(0, progress));
  const blended: Record<string, number[]> = {};

  for (const name of new Set([...Object.keys(anchorPlanets), ...Object.keys(targetPlanets)])) {
    const from = anchorPlanets[name];
    const to = targetPlanets[name];
    if (!from || !to) continue;

    const fromSpeed = getPlanetSpeed(from);
    const toSpeed = getPlanetSpeed(to);
    const speed = fromSpeed + (toSpeed - fromSpeed) * clamped;
    const lon = lerpLon(getPlanetLon(from), getPlanetLon(to), clamped);
    const retro = speed < 0 || (clamped < 0.5 ? getPlanetRetro(from) : getPlanetRetro(to));

    blended[name] = [lon, retro ? 1 : 0, speed];
  }

  return normalizeTransitPlanets(blended);
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
      retroStatus: getRetroStatus(data, name),
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
  reposition = false,
  tooltipHandlers?: PlanetTooltipHandlers
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
      const status = layout.retroStatus;
      retroMark.textContent = status ?? "R";
      retroMark.setAttribute("x", String(layout.x));
      retroMark.setAttribute("y", String(layout.y + 10));
      retroMark.setAttribute("font-size", status && status !== "R" ? "8" : "10");
      retroMark.setAttribute(
        "fill",
        status === "SD" ? "#7AB8FF" : status === "SR" ? "#FFD580" : "#FF9B71"
      );
      retroMark.style.display = status ? "block" : "none";
    }

    if (tooltipHandlers) {
      attachPlanetHoverTarget(
        planetGroup,
        layout.lon,
        tooltipHandlers,
        { x: layout.x, y: layout.y },
        layout.name
      );
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

type ViewMode = "natal" | "transit";

export default function BirthChartPage() {
  const reloadKey = useAstrolearnSubjectReload();
  const {
    selectedEventId,
    referenceInstantMs,
    isLiveNow,
    selectEvent,
    goToLiveNow,
    clearSelectedEvent,
  } = useAstrolearnSessionTime();
  const transitTimeZoneSyncedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const planetTooltipRef = useRef<HTMLDivElement>(null);
  const transitCacheRef = useRef<Map<string, Record<string, number[]>>>(new Map());
  const transitAbortRef = useRef<AbortController | null>(null);
  const prefetchInFlightRef = useRef<Set<string>>(new Set());
  const prefetchQueueRef = useRef<string[]>([]);
  const prefetchActiveRef = useRef(0);
  const transitRadiiRef = useRef<Map<string, number>>(new Map());
  const chartMetricsRef = useRef<ChartMetrics | null>(null);
  const chartPlanetsRef = useRef<Record<string, number[]> | null>(null);
  const playbackRafRef = useRef<number | null>(null);
  const lastKnownPlanetsRef = useRef<{ planets: Record<string, number[]>; instantMs: number } | null>(null);
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
  const playbackDirectionRef = useRef<1 | -1>(1);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [person, setPerson] = useState<PersonInfo | null>(null);
  const [transitPlanets, setTransitPlanets] = useState<Record<string, number[]> | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("natal");
  const [transitDate, setTransitDate] = useState(() => dateKeyFromInstant(referenceInstantMs));
  const [transitInstantMs, setTransitInstantMs] = useState(() => referenceInstantMs);
  const transitInstantRef = useRef(transitInstantMs);
  const [stepUnit, setStepUnit] = useState<TransitStepUnit>("day");
  const [playbackDirection, setPlaybackDirection] = useState<1 | -1>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedPreset, setSpeedPreset] = useState<TransitSpeedPreset>("normal");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [transitLoading, setTransitLoading] = useState(false);
  const [transitError, setTransitError] = useState("");
  const [positionJumpLoading, setPositionJumpLoading] = useState(false);
  const [positionJumpNote, setPositionJumpNote] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [personEvents, setPersonEvents] = useState<PersonEvent[]>([]);

  const showPlanetTooltip = useCallback((label: string, clientX: number, clientY: number) => {
    const tooltip = planetTooltipRef.current;
    const wrapper = chartWrapperRef.current;
    if (!tooltip || !wrapper) return;

    const bounds = wrapper.getBoundingClientRect();
    tooltip.textContent = label;
    tooltip.style.left = `${clientX - bounds.left}px`;
    tooltip.style.top = `${clientY - bounds.top}px`;
    tooltip.style.opacity = "1";
  }, []);

  const hidePlanetTooltip = useCallback(() => {
    const tooltip = planetTooltipRef.current;
    if (!tooltip) return;
    tooltip.style.opacity = "0";
  }, []);

  const planetTooltipHandlers = useRef<PlanetTooltipHandlers>({
    show: () => {},
    hide: () => {},
  });

  useEffect(() => {
    planetTooltipHandlers.current = {
      show: showPlanetTooltip,
      hide: hidePlanetTooltip,
    };
  }, [showPlanetTooltip, hidePlanetTooltip]);

  const handlePlaybackDirectionChange = useCallback((direction: 1 | -1) => {
    playbackDirectionRef.current = direction;
    setPlaybackDirection(direction);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const startedAt = performance.now();
    fetch("/api/astrolearn/chart-data")
      .then((r) => r.json())
      .then((chartRes) => {
        if (chartRes.error) {
          setError(chartRes.error);
          return;
        }
        setChartData(chartRes.data);
        const nextPerson = chartRes.data?.person ?? null;
        setPerson(nextPerson);
        if (nextPerson?.timezone) {
          setActiveTransitTimeZone(nextPerson.timezone);
        }
      })
      .catch(() => setError("Failed to load chart data"))
      .finally(() => {
        console.log("[AstroLearn birth chart] chart-data fetch", {
          ms: Math.round(performance.now() - startedAt),
        });
        setLoading(false);
      });
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;
    setPersonEvents([]);

    fetch("/api/astrolearn/events")
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        setPersonEvents(Array.isArray(payload.data) ? payload.data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setPersonEvents([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!selectedEventId || personEvents.length === 0) return;

    const selectedEvent = personEvents.find(
      (event) => String(event.id_event) === selectedEventId
    );
    if (!selectedEvent) {
      clearSelectedEvent();
      return;
    }

    const eventIso = personEventDateToIso(selectedEvent.event_date);
    if (!eventIso || clampTransitDate(eventIso) !== transitDate) {
      clearSelectedEvent();
    }
  }, [clearSelectedEvent, personEvents, selectedEventId, transitDate]);

  useEffect(() => {
    if (!selectedEventId) return;

    setViewMode("transit");
    setTransitInstantMs(referenceInstantMs);
    setTransitDate(dateKeyFromInstant(referenceInstantMs));
  }, [referenceInstantMs, selectedEventId]);

  useEffect(() => {
    chartPlanetsRef.current = chartData?.planets ?? null;
  }, [chartData]);

  useEffect(() => {
    transitTimeZoneSyncedRef.current = false;
  }, [reloadKey]);

  useEffect(() => {
    if (!person?.timezone) {
      return;
    }

    setActiveTransitTimeZone(person.timezone);

    if (selectedEventId || !isLiveNow || transitTimeZoneSyncedRef.current) {
      return;
    }

    transitTimeZoneSyncedRef.current = true;
    const nowMs = nowUtcMs();
    const nowDate = dateKeyFromInstant(nowMs);
    transitInstantRef.current = nowMs;
    setTransitInstantMs(nowMs);
    setTransitDate(nowDate);
    goToLiveNow();
  }, [goToLiveNow, isLiveNow, person?.timezone, selectedEventId]);

  const applyPlanetsToOverlay = useCallback((
    planets: Record<string, number[]>,
    reposition = false
  ) => {
    const container = containerRef.current;
    const metrics = chartMetricsRef.current;
    if (!container || !metrics) return;

    const svg = container.querySelector("svg") as SVGSVGElement | null;
    if (!svg) return;

    updateTransitOverlay(
      svg,
      planets,
      metrics,
      transitRadiiRef,
      reposition,
      planetTooltipHandlers.current
    );

    // Natal planets don't move — skip the expensive hover-target rebuild during playback.
    if (!isPlayingRef.current) {
      scheduleNatalPlanetHovers(
        container,
        chartPlanetsRef.current ?? undefined,
        planetTooltipHandlers.current,
        metrics
      );
    }
  }, []);

  const stopPlayback = useCallback(() => {
    isPlayingRef.current = false;
    if (playbackRafRef.current !== null) {
      cancelAnimationFrame(playbackRafRef.current);
      playbackRafRef.current = null;
    }
  }, []);

  const prefetchTransitDate = useCallback((
    date: string,
    priorityDates: string[] = [],
    direction: 1 | -1 = playbackDirectionRef.current
  ) => {
    const cache = transitCacheRef.current;
    const inFlight = prefetchInFlightRef.current;
    const preset = speedPresetRef.current;
    const unit = stepUnitRef.current;
    const queued = new Set(prefetchQueueRef.current);
    const orderedDates = [
      ...priorityDates,
      ...getPrefetchDates(date, unit, preset, direction),
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
    const direction = playbackDirectionRef.current;
    const preset = SPEED_OPTIONS.find((option) => option.id === speedPresetRef.current) ?? SPEED_OPTIONS[1];
    const targetInstant = clampTransitInstant(addUtcStep(anchorInstant, unit, direction));
    playbackSegmentRef.current = {
      anchorInstant,
      targetInstant,
      startedAt: performance.now(),
      intervalMs: preset.intervalMs,
    };
    const anchorDate = dateKeyFromInstant(anchorInstant);
    const targetDate = dateKeyFromInstant(targetInstant);
    // Only prefetch anchor + target explicitly. getPrefetchDates queues step-sized lookahead.
    // Intermediate daily dates between large steps (e.g. 365 dates for a year) would saturate
    // the 3-slot concurrency for ~24 s and starve the next step's actual target.
    prefetchTransitDate(anchorDate, [anchorDate, targetDate], direction);
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
    const anchorDate = dateKeyFromInstant(segment.anchorInstant);
    const targetDate = dateKeyFromInstant(segment.targetInstant);
    const anchorPlanets = cache.get(anchorDate);
    const targetPlanets = cache.get(targetDate);
    const segmentSpansMultipleDays =
      Math.abs(segment.targetInstant - segment.anchorInstant) > 86_400_000;

    if (!anchorPlanets) {
      // Anchor still loading via prefetch — extrapolate from the last successfully rendered
      // frame so the animation stays visually continuous instead of freezing.
      const last = lastKnownPlanetsRef.current;
      if (last) {
        applyPlanetsToOverlay(
          extrapolatePlanetsAcrossSegment(last.planets, last.instantMs, currentInstant)
        );
      }
      // Reset segment timer so the step plays at full duration once real data arrives.
      playbackSegmentRef.current = { ...segment, startedAt: performance.now() };
      playbackRafRef.current = requestAnimationFrame(runPlaybackFrame);
      return;
    }

    // Anchor is cached — compute this frame's positions from real data.
    let displayPlanets: Record<string, number[]>;

    if (segmentSpansMultipleDays) {
      displayPlanets = targetPlanets
        ? blendPlanetsForSegmentInstant(
            anchorPlanets,
            segment.anchorInstant,
            targetPlanets,
            segment.targetInstant,
            currentInstant
          )
        : extrapolatePlanetsAcrossSegment(anchorPlanets, segment.anchorInstant, currentInstant);
    } else {
      const currentDate = dateKeyFromInstant(currentInstant);
      const dayPlanets = cache.get(currentDate) ?? anchorPlanets;
      displayPlanets = extrapolatePlanetsForInstant(dayPlanets, currentDate, currentInstant);
    }

    lastKnownPlanetsRef.current = { planets: displayPlanets, instantMs: currentInstant };
    applyPlanetsToOverlay(displayPlanets);

    if (progress < 1) {
      playbackRafRef.current = requestAnimationFrame(runPlaybackFrame);
      return;
    }

    transitInstantRef.current = segment.targetInstant;
    setTransitInstantMs(segment.targetInstant);
    if (targetDate !== anchorDate) {
      setTransitDate(targetDate);
      if (targetPlanets) {
        setTransitPlanets(targetPlanets);
      }
    }

    const direction = playbackDirectionRef.current;
    const nextTarget = clampTransitInstant(
      addUtcStep(segment.targetInstant, stepUnitRef.current, direction)
    );
    if (nextTarget === segment.targetInstant) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      playbackRafRef.current = null;
      return;
    }

    startPlaybackSegment(segment.targetInstant);
    playbackRafRef.current = requestAnimationFrame(runPlaybackFrame);
  }, [applyPlanetsToOverlay, startPlaybackSegment]);

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
      const container = containerRef.current;
      const svg = container?.querySelector("svg") as SVGSVGElement | null;
      removeTransitOverlay(svg);
      scheduleNatalPlanetHovers(
        container,
        chartPlanetsRef.current ?? undefined,
        planetTooltipHandlers.current,
        chartMetricsRef.current
      );
    }
    setViewMode(mode);
  }, [stopPlayback]);

  const handleGoToNow = useCallback(() => {
    setIsPlaying(false);
    stopPlayback();
    handlePlaybackDirectionChange(1);
    transitRadiiRef.current = new Map();
    goToLiveNow();
    const nowMs = nowUtcMs();
    const nowDate = dateKeyFromInstant(nowMs);
    setTransitInstantMs(nowMs);
    setTransitDate(nowDate);
    prefetchTransitDate(nowDate, [nowDate]);
  }, [goToLiveNow, handlePlaybackDirectionChange, prefetchTransitDate, stopPlayback]);

  const handlePersonEventSelect = useCallback((event: PersonEvent | null) => {
    if (!event) {
      handleGoToNow();
      return;
    }

    const eventIso = personEventDateToIso(event.event_date);
    if (!eventIso) return;

    setIsPlaying(false);
    stopPlayback();
    transitRadiiRef.current = new Map();
    setPositionJumpNote("");

    const normalized = clampTransitDate(eventIso);
    selectEvent(event);
    setTransitDate(normalized);
    setTransitInstantMs(noonUtcMs(normalized));
    setViewMode("transit");
    prefetchTransitDate(normalized, [normalized]);
  }, [handleGoToNow, prefetchTransitDate, selectEvent, stopPlayback]);

  const handleTransitDateChange = useCallback((date: string) => {
    setIsPlaying(false);
    stopPlayback();
    transitRadiiRef.current = new Map();
    setPositionJumpNote("");
    const normalized = clampTransitDate(date);
    setTransitDate(normalized);
    setTransitInstantMs(noonUtcMs(normalized));
  }, [stopPlayback]);

  const handleTransitJump = useCallback(async (payload: {
    degrees: Array<{
      id: string;
      planet: string;
      degree: number;
      minute: number;
      sign: string;
    }>;
    aspects: Array<{
      id: string;
      planet: string;
      aspect: string;
      target: "transit" | "natal";
      targetPlanet: string;
    }>;
    match: "all" | "any";
    direction: "next" | "previous";
  }) => {
    setIsPlaying(false);
    stopPlayback();
    handlePlaybackDirectionChange(payload.direction === "previous" ? -1 : 1);
    setPositionJumpLoading(true);
    setPositionJumpNote("");
    setTransitError("");

    try {
      const fromInstant = transitInstantRef.current;
      const response = await fetch("/api/astrolearn/transit-jump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          degrees: payload.degrees.map((row) => ({
            planet: row.planet,
            degree: row.degree,
            minute: row.minute,
            sign: row.sign,
          })),
          aspects: payload.aspects.map((row) => ({
            planet: row.planet,
            aspect: row.aspect,
            target: row.target,
            target_planet: row.targetPlanet,
          })),
          match: payload.match,
          direction: payload.direction,
          from_date: dateKeyFromInstant(fromInstant),
          from_datetime: new Date(fromInstant).toISOString(),
          timezone: person?.timezone,
          natal_planets: chartData?.planets ?? {},
          natal_lots: chartData?.lots,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to find the requested transit jump.");
      }

      const targetMs = Date.parse(result.data.datetime);
      if (!Number.isFinite(targetMs)) {
        throw new Error("The calculator returned an invalid date.");
      }

      const targetInstant = clampTransitInstant(targetMs);
      const targetDate = dateKeyFromInstant(targetInstant);
      transitInstantRef.current = targetInstant;
      transitRadiiRef.current = new Map();
      setTransitInstantMs(targetInstant);
      setTransitDate(targetDate);
      const fallbackNote =
        payload.direction === "previous"
          ? `Previous match on ${targetDate}.`
          : `Next match on ${targetDate}.`;
      setPositionJumpNote(
        result.data.description
          ? formatJumpEventDescription(result.data.description)
          : fallbackNote
      );
      await loadTransitDate(targetDate);
      prefetchTransitDate(targetDate, [targetDate], playbackDirectionRef.current);
    } catch (err) {
      setTransitError(
        err instanceof Error ? err.message : "Failed to find the requested transit jump."
      );
    } finally {
      setPositionJumpLoading(false);
    }
  }, [chartData?.planets, handlePlaybackDirectionChange, loadTransitDate, prefetchTransitDate, stopPlayback]);

  const handleStepUnitChange = useCallback((unit: TransitStepUnit) => {
    stepUnitRef.current = unit;
    setStepUnit(unit);
    prefetchQueueRef.current = [];
    if (viewModeRef.current === "transit") {
      prefetchTransitDate(dateKeyFromInstant(transitInstantRef.current), [], 1);
    }
  }, [prefetchTransitDate]);

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

    if (unit === "day" || unit === "week" || unit === "month" || unit === "year") {
      if (unit === "year" || unit === "month") {
        transitRadiiRef.current = new Map();
      }
      setTransitDate(nextDate);
      // loadTransitDate is triggered by the transitDate effect — no second call needed here.
      // For manual steps, skip intermediate daily dates (those are only needed for
      // smooth animation during playback); prefetch the next steps in direction instead.
      prefetchTransitDate(nextDate, [], direction);
      return;
    }

    if (nextDate !== currentDate) {
      setTransitDate(nextDate);
      prefetchTransitDate(nextDate, [], direction);
    }
  }, [prefetchTransitDate, stopPlayback]);

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

    if (svg) {
      scheduleNatalPlanetHovers(
        containerRef.current,
        chartData.planets,
        planetTooltipHandlers.current,
        metrics
      );
    }
  }, [chartData]);

  useEffect(() => {
    if (!scriptReady || !chartData) return;
    renderNatalChart();
    transitRadiiRef.current = new Map();
  }, [scriptReady, chartData, renderNatalChart]);

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
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-start">
            <div className="text-center md:col-start-2">
              <h2 className="text-2xl font-bold text-white">{person.name}</h2>
              <p className="text-sm text-[#8C7FAE] mt-0.5">
                {formatEuropeanDateInput(person.birthDate)} {person.birthTime}
                {person.city ? ` · ${person.city}` : ""}
              </p>
            </div>
            {personEvents.length > 0 ? (
              <div className="w-full md:col-start-3 md:justify-self-end">
                <PersonEventSelector
                  events={personEvents}
                  selectedEventId={selectedEventId}
                  onSelect={handlePersonEventSelect}
                  disabled={loading || transitLoading}
                />
              </div>
            ) : null}
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
        <div ref={chartWrapperRef} className="flex justify-center relative">
          <div
            ref={containerRef}
            id="astro-chart-container"
            className="w-full max-w-[580px]"
            style={{ aspectRatio: "1/1" }}
          />
          <div
            ref={planetTooltipRef}
            className="pointer-events-none absolute z-50 rounded-lg border border-[#2E2654] bg-[#130F27]/95 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg"
            style={{ opacity: 0, transform: "translate(-50%, calc(-100% - 8px))" }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center bg-[#0F0C22]/60 rounded-xl transition-opacity duration-200"
            style={{
              opacity: transitLoading ? 1 : 0,
              pointerEvents: transitLoading ? "auto" : "none",
              transitionDelay: transitLoading ? "120ms" : "0ms",
            }}
          >
            <div className="w-6 h-6 rounded-full border-2 border-[#9585CC] border-t-transparent animate-spin" />
          </div>
        </div>

        {viewMode === "transit" ? (
          <TransitTimeControls
            instantMs={transitInstantMs}
            timeZone={person?.timezone}
            stepUnit={stepUnit}
            playing={isPlaying}
            playbackDirection={playbackDirection}
            speed={speedPreset}
            loading={transitLoading}
            error={transitError}
            positionJumpLoading={positionJumpLoading}
            positionJumpNote={positionJumpNote}
            onNow={handleGoToNow}
            onDateChange={handleTransitDateChange}
            onPlaybackDirectionChange={handlePlaybackDirectionChange}
            onTransitJump={handleTransitJump}
            onPlayingChange={setIsPlaying}
            onSpeedChange={setSpeedPreset}
            onStepUnitChange={handleStepUnitChange}
            onStep={handleTransitStep}
          />
        ) : null}

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
