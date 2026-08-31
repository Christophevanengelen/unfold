"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { useAstrolearnSubjectReload } from "@/lib/use-astrolearn-subject-reload";
import { useAstrolearnSessionTime } from "@/lib/astrolearn-session-time";
import { apiFetch } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChartData {
  planets: Record<string, number[]>;
  cusps: number[];
  person?: { birthDate?: string; birthTime?: string; name?: string };
}

interface ProfectionSlice {
  house?: number;
  sign?: string;
  ruler?: string;
  rulerLocation?: { house?: number; sign?: string };
  planetsInHouse?: string[];
  srRulerHouse?: number;
}

interface NatalPlanetData {
  house?: number;
  sign?: string;
  longitude?: number;
  degree?: number;
}

interface ProfectionData {
  annualProfection?: ProfectionSlice;
  monthlyProfection?: ProfectionSlice;
  profectionYearBoundaries?: { startDate?: string; endDate?: string };
  natalAscendant?: { longitude?: number };
  natalChartComplete?: { ascendant?: number; planets?: Record<string, NatalPlanetData> };
  age?: number;
  monthsSinceBirthday?: number;
  // nested response format (username endpoint)
  profection?: ProfectionData;
  // legacy fallbacks
  currentYear?: { house?: number; sign?: string; lord?: string };
  activatedHouse?: number;
  lord?: string;
  sign?: string;
  [key: string]: unknown;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_COLORS: Record<string, string> = {
  Aries: "#E06060", Taurus: "#70A870", Gemini: "#D0C060", Cancer: "#80A8C0",
  Leo: "#E0A040", Virgo: "#90B880", Libra: "#C090C0", Scorpio: "#904060",
  Sagittarius: "#E08040", Capricorn: "#708090", Aquarius: "#60A0C0", Pisces: "#8080C0",
};

const SIGN_RULERS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    astrology: any;
  }
}

// ─── Chart helpers (mirrored from chart/page.tsx) ────────────────────────────

interface ChartMetrics {
  size: number;
  wheelCusp0: number;
  cx: number;
  cy: number;
}

function computeWSHCusps(ascLon: number): number[] {
  const ascSign = Math.floor(ascLon / 30);
  return Array.from({ length: 12 }, (_, i) => ((ascSign + i) % 12) * 30);
}

function lonToSVGAngle(lon: number, wheelCusp0: number): number {
  const shift = 360 - wheelCusp0;
  const deg = ((180 - (lon + shift)) % 360 + 360) % 360;
  return (deg * Math.PI) / 180;
}

function getChartMetrics(container: HTMLDivElement, chartData: ChartData): ChartMetrics {
  const rawWidth = container.offsetWidth;
  const size = Math.min(rawWidth > 0 ? rawWidth : 360, 580);
  const ascLon = chartData.planets["As"]?.[0] ?? chartData.cusps[0];
  const wheelCusp0 = computeWSHCusps(ascLon)[0];
  return { size, wheelCusp0, cx: size / 2, cy: size / 2 };
}

function getHouseSign(houseNumber: number, ascLon: number): string {
  return SIGNS[(Math.floor(ascLon / 30) + houseNumber - 1) % 12];
}

// ─── House highlight overlay ──────────────────────────────────────────────────

function addHouseHighlight(
  svg: SVGSVGElement,
  metrics: ChartMetrics,
  _ascLon: number,
  houseNum: number,
  color: string,
  fillOpacity: number,
) {
  const { cx, cy, size, wheelCusp0 } = metrics;
  const R = size / 2 - 50;
  const R_inner = R * 0.35;

  // WSH sectors start at 0° of the ASC sign (wheelCusp0), NOT the exact ascendant degree
  const sa = lonToSVGAngle(((wheelCusp0 + (houseNum - 1) * 30) % 360 + 360) % 360, wheelCusp0);
  const ea = lonToSVGAngle(((wheelCusp0 + houseNum * 30) % 360 + 360) % 360, wheelCusp0);

  const d = [
    `M ${cx + R * Math.cos(sa)} ${cy + R * Math.sin(sa)}`,
    `A ${R} ${R} 0 0 0 ${cx + R * Math.cos(ea)} ${cy + R * Math.sin(ea)}`,
    `L ${cx + R_inner * Math.cos(ea)} ${cy + R_inner * Math.sin(ea)}`,
    `A ${R_inner} ${R_inner} 0 0 1 ${cx + R_inner * Math.cos(sa)} ${cy + R_inner * Math.sin(sa)}`,
    "Z",
  ].join(" ");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement;
  path.setAttribute("d", d);
  path.setAttribute("fill", color);
  path.setAttribute("fill-opacity", String(fillOpacity));
  path.setAttribute("pointer-events", "none");
  svg.appendChild(path);
}

// ─── Date utilities ───────────────────────────────────────────────────────────

function addMonthsToDate(isoDate: string, months: number): string {
  const d = new Date(isoDate + "T12:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().split("T")[0];
}

function birthdayForAge(birthDate: string, age: number): string {
  const d = new Date(birthDate + "T12:00:00Z");
  const origDay = d.getUTCDate();
  d.setUTCFullYear(d.getUTCFullYear() + age);
  // Feb 29 → Feb 28 in non-leap years
  if (d.getUTCDate() !== origDay) d.setUTCDate(0);
  return d.toISOString().split("T")[0];
}

function fmtDate(iso: string): string {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfectionsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const originalProfDataRef = useRef<ProfectionData | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [profData, setProfData] = useState<ProfectionData | null>(null);
  const [viewAge, setViewAge] = useState<number>(0);
  const [liveAge, setLiveAge] = useState<number>(0);
  const [viewMonth, setViewMonth] = useState<number>(0);
  const [liveMonth, setLiveMonth] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"year" | "monthly">("year");

  const reloadKey = useAstrolearnSubjectReload();
  const { referenceDate } = useAstrolearnSessionTime();

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      apiFetch("/api/astrolearn/chart-data").then((r) => r.json()),
      fetch(`/api/astrolearn/profections?date=${referenceDate}`).then((r) => r.json()),
    ])
      .then(([chartJson, profJson]) => {
        if (chartJson.error) throw new Error(chartJson.error as string);
        if (profJson.error) throw new Error(profJson.error as string);
        // Handle both { annualProfection, ... } and { profection: { annualProfection, ... } }
        const rawPd = (profJson.data ?? profJson) as ProfectionData;
        const pd = (rawPd.profection ?? rawPd) as ProfectionData;
        originalProfDataRef.current = pd;
        setChartData(chartJson.data as ChartData);
        setProfData(pd);
        const age = pd.age ?? 0;
        const month = pd.monthsSinceBirthday ?? 0;
        setLiveAge(age);
        setViewAge(age);
        setLiveMonth(month);
        setViewMonth(month);
      })
      .catch((e: Error) => setError(e.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  }, [reloadKey, referenceDate]);

  const navigateToAge = useCallback((age: number) => {
    const orig = originalProfDataRef.current;
    if (!orig || !chartData) return;

    setViewAge(age);

    const ascLon =
      orig.natalAscendant?.longitude ??
      orig.natalChartComplete?.ascendant ??
      chartData.planets["As"]?.[0] ?? 0;
    const natalPlanets = orig.natalChartComplete?.planets ?? {};
    const birthDate = chartData.person?.birthDate ?? "";

    const annualHouse = (age % 12) + 1;
    const annualSign = getHouseSign(annualHouse, ascLon);
    const annualLord = SIGN_RULERS[annualSign] ?? "";
    const rulerHouse = annualLord ? natalPlanets[annualLord]?.house : undefined;
    const rulerSign = annualLord ? (natalPlanets[annualLord]?.sign ?? "") : "";

    const isLiveYear = age === liveAge;
    const monthlyHouse = isLiveYear ? orig.monthlyProfection?.house : annualHouse;
    const monthlySign = isLiveYear ? (orig.monthlyProfection?.sign ?? annualSign) : annualSign;
    const monthlyLord = isLiveYear ? (orig.monthlyProfection?.ruler ?? annualLord) : annualLord;
    const monthlyRulerHouse = isLiveYear ? orig.monthlyProfection?.rulerLocation?.house : rulerHouse;
    const monthlyRulerSign = isLiveYear ? (orig.monthlyProfection?.rulerLocation?.sign ?? rulerSign) : rulerSign;
    const srRulerHouse = isLiveYear ? orig.annualProfection?.srRulerHouse : undefined;

    const birthday = birthDate ? birthdayForAge(birthDate, age) : "";
    const nextBirthday = birthDate ? birthdayForAge(birthDate, age + 1) : "";

    setViewMonth(age === liveAge ? liveMonth : 0);

    setProfData({
      ...orig,
      age,
      annualProfection: {
        ...orig.annualProfection,
        house: annualHouse,
        sign: annualSign,
        ruler: annualLord,
        rulerLocation: { house: rulerHouse, sign: rulerSign },
        srRulerHouse,
      },
      monthlyProfection: {
        house: monthlyHouse,
        sign: monthlySign,
        ruler: monthlyLord,
        rulerLocation: { house: monthlyRulerHouse, sign: monthlyRulerSign },
      },
      profectionYearBoundaries: { startDate: birthday, endDate: nextBirthday },
    });

    // Fetch SR house in background for non-live years
    if (!isLiveYear && birthday && annualLord) {
      const srYear = new Date(birthday + "T12:00:00Z").getUTCFullYear();
      const capturedAge = age;
      const capturedLord = annualLord;
      fetch(`/api/astrolearn/solar-return?year=${srYear}`)
        .then((r) => r.json())
        .then((json: Record<string, unknown>) => {
          const data = (json.data ?? json) as Record<string, unknown>;
          const planets = data.planets as Record<string, { house?: number }> | undefined;
          const srH = planets?.[capturedLord]?.house;
          if (srH) {
            setProfData((prev) => {
              if (!prev || prev.age !== capturedAge) return prev;
              return {
                ...prev,
                annualProfection: { ...prev.annualProfection, srRulerHouse: srH },
              };
            });
          }
        })
        .catch(() => {});
    }
  }, [chartData, liveAge, liveMonth]);

  const navigateToMonth = useCallback((month: number) => {
    const orig = originalProfDataRef.current;
    if (!orig || !chartData) return;

    const m = Math.max(0, Math.min(11, month));
    setViewMonth(m);

    const ascLon =
      orig.natalAscendant?.longitude ??
      orig.natalChartComplete?.ascendant ??
      chartData.planets["As"]?.[0] ?? 0;
    const natalPlanets = orig.natalChartComplete?.planets ?? {};

    const annualHouse = (viewAge % 12) + 1;
    const monthlyHouse = ((annualHouse - 1 + m) % 12) + 1;
    const monthlySign = getHouseSign(monthlyHouse, ascLon);
    const monthlyLord = SIGN_RULERS[monthlySign] ?? "";
    const monthlyRulerHouse = monthlyLord ? natalPlanets[monthlyLord]?.house : undefined;
    const monthlyRulerSign = monthlyLord ? (natalPlanets[monthlyLord]?.sign ?? "") : "";

    setProfData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        monthlyProfection: {
          house: monthlyHouse,
          sign: monthlySign,
          ruler: monthlyLord,
          rulerLocation: { house: monthlyRulerHouse, sign: monthlyRulerSign },
        },
      };
    });
  }, [chartData, viewAge]);

  const renderChart = useCallback(() => {
    if (!chartData || !containerRef.current || !window.astrology || !profData) return;

    const container = containerRef.current;
    container.innerHTML = "";
    const metrics = getChartMetrics(container, chartData);
    const { size } = metrics;

    const chart = new window.astrology.Chart("profection-chart-container", size, size, {
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
    chart.radix({ planets: chartData.planets, cusps: computeWSHCusps(ascLon) });
    container.querySelector('[id$="-radix-axis"]')?.remove();

    const svg = container.querySelector("svg") as SVGSVGElement | null;
    if (!svg) return;

    const annualHouse   = profData.annualProfection?.house ?? profData.currentYear?.house ?? profData.activatedHouse;
    const annualSign    = profData.annualProfection?.sign  ?? profData.currentYear?.sign  ?? profData.sign ?? "";
    const rulerHouse    = profData.annualProfection?.rulerLocation?.house;
    const rulerSign     = profData.annualProfection?.rulerLocation?.sign ?? "";
    const monthlyHouse  = profData.monthlyProfection?.house;
    const monthlySign   = profData.monthlyProfection?.sign ?? "";
    const monthlyRulerHouse = profData.monthlyProfection?.rulerLocation?.house;
    const srRulerHouse = profData.annualProfection?.srRulerHouse;

    const aColor = SIGN_COLORS[annualSign]  ?? "#9585CC";
    const mColor = SIGN_COLORS[monthlySign] ?? "#9585CC";

    // Build a de-duplicated ordered list: softest → brightest
    const seen = new Set<number>();
    const push = (h: number | undefined, color: string, opacity: number) => {
      if (!h || seen.has(h)) return;
      seen.add(h);
      addHouseHighlight(svg!, metrics, ascLon, h, color, opacity);
    };

    if (activeTab === "year") {
      // Annual chain: SR lord (softest) → natal lord → annual house (brightest)
      push(srRulerHouse, aColor, 0.10);
      push(rulerHouse,   aColor, 0.17);
      push(annualHouse,  aColor, 0.28);
    } else {
      // Monthly chain: monthly lord → monthly house
      push(monthlyRulerHouse, mColor, 0.12);
      push(monthlyHouse,      mColor, 0.20);
    }
  }, [chartData, profData, activeTab]);

  useEffect(() => {
    if (scriptReady && chartData && profData) renderChart();
  }, [scriptReady, chartData, profData, renderChart]);

  // ─── Early returns ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#9585CC] border-t-transparent animate-spin" />
        <p className="text-[#8C7FAE] text-sm">Calculating profections…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 text-center mt-8">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  // ─── Derived values ───────────────────────────────────────────────────────

  const annualHouse = profData?.annualProfection?.house ?? profData?.currentYear?.house ?? profData?.activatedHouse;
  const annualSign  = profData?.annualProfection?.sign  ?? profData?.currentYear?.sign  ?? profData?.sign ?? "";
  const annualLord  = profData?.annualProfection?.ruler ?? profData?.currentYear?.lord  ?? profData?.lord ?? "";
  const rulerHouse  = profData?.annualProfection?.rulerLocation?.house;
  const rulerSign   = profData?.annualProfection?.rulerLocation?.sign ?? "";
  const monthlyHouse = profData?.monthlyProfection?.house;
  const monthlySign  = profData?.monthlyProfection?.sign ?? "";
  const monthlyLord  = profData?.monthlyProfection?.ruler ?? "";
  const monthlyRulerHouse = profData?.monthlyProfection?.rulerLocation?.house;
  const monthlyRulerSign  = profData?.monthlyProfection?.rulerLocation?.sign ?? "";
  const srRulerHouse = profData?.annualProfection?.srRulerHouse;

  const aColor = SIGN_COLORS[annualSign]  ?? "#9585CC";
  const mColor = SIGN_COLORS[monthlySign] ?? "#9585CC";

  const ascLon =
    profData?.natalAscendant?.longitude ??
    profData?.natalChartComplete?.ascendant ??
    chartData?.planets["As"]?.[0] ??
    0;

  const birthDate = chartData?.person?.birthDate ?? null;
  const boundaries = profData?.profectionYearBoundaries;

  // Month date range (for Monthly tab header)
  const yearStartIso = birthDate ? birthdayForAge(birthDate, viewAge) : "";
  const monthStartIso = yearStartIso ? addMonthsToDate(yearStartIso, viewMonth) : "";
  const monthEndIso = monthStartIso
    ? (() => {
        const d = new Date(addMonthsToDate(yearStartIso, viewMonth + 1) + "T12:00:00Z");
        d.setUTCDate(d.getUTCDate() - 1);
        return d.toISOString().split("T")[0];
      })()
    : "";

  // Year-by-year list: 80 rows, computed from ascendant & birth date
  const years = Array.from({ length: 80 }, (_, i) => {
    const house = (i % 12) + 1;
    const sign  = getHouseSign(house, ascLon);
    return {
      age: i,
      house,
      sign,
      lord:       SIGN_RULERS[sign] ?? "",
      birthday:   birthDate ? birthdayForAge(birthDate, i) : null,
      isCurrent:  i === liveAge,
      isSelected: i === viewAge,
    };
  });

  return (
    <>
      <Script
        src="/js/astrochart.min.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />

      <div className="space-y-5">

        {/* ── Navigation header (tab-aware) ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              activeTab === "year"
                ? navigateToAge(Math.max(0, viewAge - 1))
                : navigateToMonth(viewMonth - 1)
            }
            disabled={activeTab === "year" ? viewAge <= 0 : viewMonth <= 0}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xl text-[#8C7FAE] hover:text-white transition-colors disabled:opacity-30"
            style={{ background: "rgba(46,38,84,0.5)", border: "1px solid rgba(46,38,84,0.8)" }}
          >
            ‹
          </button>

          <div className="flex-1 text-center">
            {activeTab === "year" ? (
              <>
                <div className="text-[10px] uppercase tracking-widest text-[#4A4070]">
                  Age {viewAge}{viewAge === liveAge ? " · Now" : ""}
                </div>
                <div className="text-lg font-bold text-white leading-tight">
                  {annualSign}{annualHouse ? ` · H${annualHouse}` : ""}
                </div>
                {boundaries?.startDate && boundaries?.endDate && (
                  <div className="text-[11px] text-[#4A4070] mt-0.5">
                    {fmtDate(boundaries.startDate)}
                    <span className="mx-1 opacity-50">→</span>
                    {fmtDate(boundaries.endDate)}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-widest text-[#4A4070]">
                  Month {viewMonth + 1} of 12{viewAge === liveAge && viewMonth === liveMonth ? " · Now" : ""}
                </div>
                <div className="text-lg font-bold text-white leading-tight">
                  {monthlySign}{monthlyHouse ? ` · H${monthlyHouse}` : ""}
                </div>
                {monthStartIso && monthEndIso && (
                  <div className="text-[11px] text-[#4A4070] mt-0.5">
                    {fmtDate(monthStartIso)}
                    <span className="mx-1 opacity-50">→</span>
                    {fmtDate(monthEndIso)}
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={() =>
              activeTab === "year"
                ? navigateToAge(Math.min(79, viewAge + 1))
                : navigateToMonth(viewMonth + 1)
            }
            disabled={activeTab === "year" ? viewAge >= 79 : viewMonth >= 11}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xl text-[#8C7FAE] hover:text-white transition-colors disabled:opacity-30"
            style={{ background: "rgba(46,38,84,0.5)", border: "1px solid rgba(46,38,84,0.8)" }}
          >
            ›
          </button>
        </div>

        {/* ── Natal wheel ── */}
        <div
          ref={containerRef}
          id="profection-chart-container"
          className="w-full max-w-[580px] mx-auto"
          style={{ aspectRatio: "1/1" }}
        />

        {/* ── Tab switcher ── */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(46,38,84,0.6)", background: "rgba(15,12,34,0.6)" }}
        >
          {(["year", "monthly"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all"
              style={
                activeTab === tab
                  ? { background: "#2E2654", color: "#ffffff" }
                  : { color: "#4A4070" }
              }
            >
              {tab === "year" ? "Year" : "Monthly"}
            </button>
          ))}
        </div>

        {/* ── Year tab ── */}
        {activeTab === "year" && (
          <>
            {/* Annual legend pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {annualHouse && (
                <span className="text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background: `${aColor}22`, color: aColor, border: `1px solid ${aColor}44` }}>
                  H{annualHouse} · Annual
                </span>
              )}
              {rulerHouse && (
                <span className="text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background: `${aColor}16`, color: aColor, border: `1px solid ${aColor}32` }}>
                  H{rulerHouse} · {annualLord}
                </span>
              )}
              {srRulerHouse && srRulerHouse !== rulerHouse && srRulerHouse !== annualHouse && (
                <span className="text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background: `${aColor}0e`, color: aColor, border: `1px solid ${aColor}22` }}>
                  H{srRulerHouse} · {annualLord} SR
                </span>
              )}
            </div>

            {/* Annual card */}
            {annualSign && (
              <div
                className="rounded-2xl p-5"
                style={{
                  background: `radial-gradient(ellipse at top, ${aColor}15 0%, rgba(19,15,39,0.9) 70%)`,
                  border: `1px solid ${aColor}35`,
                }}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: aColor, opacity: 0.8 }}>
                  Annual · H{annualHouse}
                </div>
                <div className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
                  {annualSign}
                </div>
                <div className="space-y-1.5">
                  {annualLord && (
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: `${aColor}99` }}>Lord</span>
                      <span className="font-semibold" style={{ color: aColor }}>
                        {annualLord}{rulerHouse ? ` · H${rulerHouse} ${rulerSign}` : ""}
                      </span>
                    </div>
                  )}
                  {srRulerHouse && (
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: `${aColor}70` }}>In SR</span>
                      <span className="font-semibold" style={{ color: `${aColor}cc` }}>
                        {annualLord} · H{srRulerHouse}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Year-by-year list */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-[#4A4070] uppercase tracking-widest">Year by Year</h2>
              <div className="space-y-0.5">
                {years.map((y) => {
                  const yc = SIGN_COLORS[y.sign] ?? "#8C7FAE";
                  return (
                    <button
                      key={y.age}
                      onClick={() => navigateToAge(y.age)}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-all"
                      style={{
                        background: y.isSelected ? `${yc}18` : y.isCurrent ? `${yc}09` : "rgba(19,15,39,0.35)",
                        border: `1px solid ${y.isSelected ? yc + "44" : y.isCurrent ? yc + "25" : "rgba(46,38,84,0.25)"}`,
                      }}
                    >
                      <span className="text-xs font-mono text-[#4A4070] w-5 flex-shrink-0 text-right">{y.age}</span>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: yc }} />
                      <span className="text-[11px] text-[#4A4070] w-[88px] flex-shrink-0 leading-none">
                        {y.birthday ? fmtDate(y.birthday) : ""}
                      </span>
                      <span
                        className="flex-1 text-sm font-semibold leading-none"
                        style={{ color: y.isSelected || y.isCurrent ? "white" : "#9ca3af" }}
                      >
                        {y.sign}
                      </span>
                      <span className="text-[11px] font-mono text-[#4A4070] flex-shrink-0">H{y.house}</span>
                      <span className="text-[11px] text-[#6B5FA0] w-14 text-right flex-shrink-0">{y.lord}</span>
                      {y.isCurrent && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: `${yc}18`, color: yc, border: `1px solid ${yc}33` }}
                        >
                          NOW
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Monthly tab ── */}
        {activeTab === "monthly" && (
          <>
            {/* Monthly legend pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {monthlyHouse && (
                <span className="text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background: `${mColor}22`, color: mColor, border: `1px solid ${mColor}44` }}>
                  H{monthlyHouse} · Monthly
                </span>
              )}
              {monthlyRulerHouse && monthlyRulerHouse !== monthlyHouse && (
                <span className="text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background: `${mColor}14`, color: mColor, border: `1px solid ${mColor}28` }}>
                  H{monthlyRulerHouse} · {monthlyLord}
                </span>
              )}
            </div>

            {/* Monthly card */}
            {monthlySign && (
              <div
                className="rounded-2xl p-5"
                style={{
                  background: `radial-gradient(ellipse at top, ${mColor}15 0%, rgba(19,15,39,0.9) 70%)`,
                  border: `1px solid ${mColor}35`,
                }}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: mColor, opacity: 0.8 }}>
                  Monthly · H{monthlyHouse}
                </div>
                <div className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
                  {monthlySign}
                </div>
                <div className="space-y-1.5">
                  {monthlyLord && (
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: `${mColor}99` }}>Lord</span>
                      <span className="font-semibold" style={{ color: mColor }}>
                        {monthlyLord}{monthlyRulerHouse ? ` · H${monthlyRulerHouse} ${monthlyRulerSign}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </>
  );
}
