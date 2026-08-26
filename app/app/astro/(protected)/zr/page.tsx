"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { DateInput } from "@/components/ui/DateInput";
import {
  parsePersonEventDate,
  PERSON_EVENT_CATEGORIES,
  toPersonEventCompactDate,
  type PersonEvent,
} from "@/lib/person-events";
import { useAstrolearnSessionTime } from "@/lib/astrolearn-session-time";
import { apiFetch } from "@/lib/api-client";

// ── Types ────────────────────────────────────────────────────────────────────

interface ZRPeriod {
  sign: string;
  startDate: string;
  endDate: string;
  isPeakPeriod?: boolean;
  isCulmination?: boolean;
  isLoosingOfBond?: boolean;
  markers?: string[];
  subPeriods?: ZRPeriod[];
}

interface ZRData {
  releasing?: {
    fromLot?: string;
    startingSign?: string;
    periods?: ZRPeriod[];
    currentPeriods?: Record<string, ZRPeriod>;
  };
}

interface ChartYear {
  year: number;
  x: Date;
  y: number;           // ZR score for that year
  isBusy: boolean;     // peak year (big flower)
  isCulmination: boolean;
  isLB: boolean;
  isPreLB: boolean;
  sign: string;        // dominant L2 sign
}

// ── Sign base scores (angularity proxy — varies by sign quality) ─────────────

const SIGN_SCORE: Record<string, number> = {
  Aries: 80,  Taurus: 120, Gemini: 100, Cancer: 90,
  Leo: 150,   Virgo: 85,   Libra: 110,  Scorpio: 95,
  Sagittarius: 130, Capricorn: 75, Aquarius: 105, Pisces: 115,
};

function isPreLbPeriod(period: Pick<ZRPeriod, "markers">): boolean {
  const markers = period.markers ?? [];
  return markers.includes("pre-LB") || markers.includes("foreshadowing");
}

// ── Build yearly chart data from ZR periods (using L2 subPeriods) ─────────────

function buildChartData(l1Periods: ZRPeriod[]): ChartYear[] {
  // Collect all L2 sub-periods with their scores
  const l2Periods: Array<{
    sign: string;
    startDate: Date;
    endDate: Date;
    isPeakPeriod: boolean;
    isCulmination: boolean;
    isLoosingOfBond: boolean;
    isPreLB: boolean;
    score: number;
  }> = [];

  for (const l1 of l1Periods) {
    const subs = l1.subPeriods ?? [];
    for (const sub of subs) {
      const base = SIGN_SCORE[sub.sign] ?? 100;
      let multiplier = 1.0;
      if (sub.isPeakPeriod) multiplier = 4.0;
      else if (sub.isCulmination) multiplier = 2.5;
      else if (sub.isLoosingOfBond) multiplier = 1.8;

      l2Periods.push({
        sign: sub.sign,
        startDate: new Date(sub.startDate),
        endDate: new Date(sub.endDate),
        isPeakPeriod: !!sub.isPeakPeriod,
        isCulmination: !!sub.isCulmination,
        isLoosingOfBond: !!sub.isLoosingOfBond,
        isPreLB: isPreLbPeriod(sub),
        score: Math.round(base * multiplier),
      });
    }
  }

  // For each year, find the L2 period that starts in that year (or the dominant one)
  const today = new Date();
  const allYears = new Set<number>();
  for (const l1 of l1Periods) {
    const s = new Date(l1.startDate).getFullYear();
    const e = new Date(l1.endDate).getFullYear();
    for (let y = s; y <= e; y++) allYears.add(y);
  }

  const chartYears: ChartYear[] = [];
  for (const yr of Array.from(allYears).sort((a, b) => a - b)) {
    const yearStart = new Date(yr, 0, 1);
    const yearEnd = new Date(yr, 11, 31);

    // Find L2 periods that OVERLAP this year — score = sum of their monthly contributions
    let totalScore = 0;
    let dominantSign = "";
    let dominantScore = 0;
    let isBusy = false;
    let isCulmination = false;
    let isLB = false;
    let isPreLB = false;

    for (const l2 of l2Periods) {
      // Months this L2 period overlaps with this year
      const overlapStart = l2.startDate > yearStart ? l2.startDate : yearStart;
      const overlapEnd = l2.endDate < yearEnd ? l2.endDate : yearEnd;
      if (overlapStart >= overlapEnd) continue;

      const months = (overlapEnd.getTime() - overlapStart.getTime()) / (30.5 * 24 * 3600 * 1000);
      const contribution = Math.round(l2.score * Math.min(months, 12) / 12);
      totalScore += contribution;

      if (contribution > dominantScore) {
        dominantScore = contribution;
        dominantSign = l2.sign;
        isBusy = isBusy || l2.isPeakPeriod;
        isCulmination = isCulmination || l2.isCulmination;
        isLB = isLB || l2.isLoosingOfBond;
        isPreLB = isPreLB || l2.isPreLB;
      }
    }

    const yearMid = new Date(yr, 6, 1);
    const activeL2 = l2Periods.find((l2) => l2.startDate <= yearMid && l2.endDate >= yearMid);
    if (activeL2) {
      isBusy = activeL2.isPeakPeriod;
      isCulmination = activeL2.isCulmination;
      isLB = activeL2.isLoosingOfBond;
      isPreLB = activeL2.isPreLB;
    }

    chartYears.push({
      year: yr,
      x: new Date(yr, 6, 1),
      y: totalScore,
      isBusy,
      isCulmination,
      isLB,
      isPreLB,
      sign: dominantSign,
    });
  }

  return chartYears;
}

// ── Chart colors ─────────────────────────────────────────────────────────────

const COLORS = {
  circle: "#7c98f5",
  circleStroke: "rgba(124,152,245,0.18)",
  line: "#7c98f5",
  event: "#9a6fe3",
  eventOwn: "#f586cb",
  eventOwnStroke: "rgba(245,134,203,0.2)",
};

// ── Main component ────────────────────────────────────────────────────────────

export default function ZRPage() {
  const { referenceInstantMs, referenceDate, selectedEventId } = useAstrolearnSessionTime();
  const [zrData, setZrData] = useState<ZRData | null>(null);
  const [chartYears, setChartYears] = useState<ChartYear[]>([]);
  const [events, setEvents] = useState<PersonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ event_date: "", category: "WORK", subcategory: "", detail: "" });
  const [saving, setSaving] = useState(false);
  const [eventsEnabled, setEventsEnabled] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [l3NavDate, setL3NavDate] = useState<string | null>(null);
  const [l3NavPeriods, setL3NavPeriods] = useState<Record<string, ZRPeriod>>({});
  const [l3NavLoading, setL3NavLoading] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const [viewportTick, setViewportTick] = useState(0);

  useEffect(() => {
    function handleSubjectChanged() {
      setReloadKey((value) => value + 1);
    }

    window.addEventListener("astrolearn:subject-changed", handleSubjectChanged);
    return () => window.removeEventListener("astrolearn:subject-changed", handleSubjectChanged);
  }, []);

  useEffect(() => {
    setL3NavDate(null);
    setL3NavPeriods({});
  }, [referenceDate]);

  useEffect(() => {
    if (l3NavDate === null) {
      setL3NavPeriods({});
      return;
    }
    setL3NavLoading(true);
    fetch(`/api/astrolearn/zr?date=${l3NavDate}`)
      .then((r) => r.json())
      .then((data) => {
        const raw = data.data ?? data;
        setL3NavPeriods(raw?.releasing?.currentPeriods ?? {});
      })
      .catch(() => {})
      .finally(() => setL3NavLoading(false));
  }, [l3NavDate]);

  useEffect(() => {
    apiFetch("/api/astrolearn/admin/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) {
          setEventsEnabled(true);
          return;
        }
        const subject = data.viewSubject as { source?: string } | null;
        setEventsEnabled(!subject || subject.source === "astrolearn");
      })
      .catch(() => setEventsEnabled(true));
  }, [reloadKey]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError("");

    const requests = [fetch(`/api/astrolearn/zr?date=${referenceDate}`).then((r) => r.json())];
    if (eventsEnabled) {
      requests.push(apiFetch("/api/astrolearn/events").then((r) => r.json()));
    }

    Promise.all(requests)
      .then((results) => {
        const zr = results[0];
        const ev = eventsEnabled ? results[1] : { data: [] };
        if (zr.error) { setError(zr.error); return; }
        const zrRaw = zr.data ?? zr;
        setZrData(zrRaw);
        const periods = zrRaw?.releasing?.periods ?? [];
        if (periods.length > 0) {
          setChartYears(buildChartData(periods));
        }
        setEvents(Array.isArray(ev.data) ? ev.data : []);
      })
      .catch(() => setError("Failed to load ZR data"))
      .finally(() => setLoading(false));
  }, [eventsEnabled, reloadKey, referenceDate]);

  // ── Draw D3 chart ──────────────────────────────────────────────────────────
  const drawChart = useCallback(() => {
    if (!chartRef.current || chartYears.length === 0) return;
    chartRef.current.innerHTML = "";

    // Stack events
    const cleanedEvents = events
      .map((ev) => { const x = parsePersonEventDate(ev.event_date); return x ? { ...ev, x } : null; })
      .filter(Boolean) as (PersonEvent & { x: Date })[];

    const yearCount: Record<number, number> = {};
    const stackedEvents = cleanedEvents.map((ev) => {
      const yr = ev.x.getFullYear();
      yearCount[yr] = (yearCount[yr] ?? 0) + 1;
      return { ...ev, stackLevel: yearCount[yr] };
    });

    const maxStack = stackedEvents.length > 0 ? Math.max(...stackedEvents.map((e) => e.stackLevel)) : 0;
    const eventExtraHeight = maxStack === 0 ? 0 : maxStack === 1 ? 125 : (65 * maxStack) + 25;

    const container = containerRef.current;
    const viewHeight = container?.clientHeight ?? 560;
    const margin = { top: 50, right: 60, bottom: 60, left: 40 };
    const COL_W = 75;
    const CHART_H = Math.max(
      320,
      viewHeight - margin.top - margin.bottom - eventExtraHeight - 20
    );
    const svgWidth = COL_W * chartYears.length + margin.left + margin.right;
    const svgHeight = CHART_H + margin.top + margin.bottom + 20 + eventExtraHeight;

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},0)`);

    const innerW = COL_W * chartYears.length;

    // Scales
    const xDomain = d3.extent(chartYears, (d) => d.x) as [Date, Date];
    const x = d3.scaleTime().domain(xDomain).range([0, innerW]);
    const yMax = Math.max(...chartYears.map((d) => d.y), 50) + 30;
    const y = d3.scaleLinear().domain([0, yMax]).range([CHART_H + margin.top, margin.top]);

    // ── Pill backgrounds ────────────────────────────────────────────────────
    const pillW = COL_W * 0.72;
    svg.append("g").selectAll("rect")
      .data(chartYears)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.x) - pillW / 2)
      .attr("y", margin.top * 0.5)
      .attr("width", pillW)
      .attr("height", CHART_H)
      .attr("rx", pillW / 2)
      .attr("ry", pillW / 2)
      .attr("fill", "rgba(30,24,66,0.55)");

    // ── X Axis ──────────────────────────────────────────────────────────────
    svg.append("g")
      .attr("transform", `translate(0,${CHART_H + margin.top + 18})`)
      .call(
        d3.axisBottom(x)
          .ticks(d3.timeYear.every(1))
          .tickFormat((d) => String((d as Date).getFullYear()))
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").remove())
      .call((g) =>
        g.selectAll(".tick text")
          .attr("fill", "#4A4070")
          .attr("font-size", "11px")
          .attr("font-family", "monospace")
      );

    // ── Dotted curve line ────────────────────────────────────────────────────
    svg.append("path")
      .datum(chartYears)
      .attr("fill", "none")
      .attr("stroke", COLORS.line)
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("stroke-dasharray", "1, 8")
      .attr("d",
        d3.line<ChartYear>()
          .curve(d3.curveMonotoneX)
          .x((d) => x(d.x))
          .y((d) => y(d.y))
      );

    // ── Events ──────────────────────────────────────────────────────────────
    const eventsBaseY = CHART_H + margin.top + 40;
    const lineFn = d3.line<{ x: number; y: number }>().x((d) => d.x).y((d) => d.y);

    const eventG = svg.append("g")
      .selectAll("g.ev")
      .data(stackedEvents)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${x(d.x)},${eventsBaseY})`);

    eventG.append("path")
      .attr("fill", "none").attr("stroke", COLORS.event)
      .attr("stroke-width", 2).attr("stroke-dasharray", "1, 8")
      .datum((d) => [{ x: 0, y: 0 }, { x: 0, y: 55 * d.stackLevel }])
      .attr("d", lineFn);

    eventG.append("circle").attr("r", 6).attr("fill", COLORS.event);

    eventG.append("circle")
      .attr("r", 10).attr("cy", (d) => 55 * d.stackLevel)
      .attr("fill", COLORS.eventOwn)
      .attr("stroke", (d) =>
        selectedEventId && String(d.id_event) === selectedEventId ? "#F4C430" : COLORS.eventOwnStroke
      )
      .attr("stroke-width", (d) =>
        selectedEventId && String(d.id_event) === selectedEventId ? 6 : 14
      )
      .style("cursor", "pointer")
      .on("click", function (_evt, d) {
        if (confirm(`Delete "${d.subcategory || d.detail}"?`)) {
          fetch(`/api/astrolearn/events?id=${d.id_event}`, { method: "DELETE" })
            .then(() => setEvents((prev) => prev.filter((e) => String(e.id_event) !== String(d.id_event))));
          d3.select(this.parentNode as SVGGElement).remove();
        }
      });

    eventG.append("text")
      .attr("x", 18).attr("y", (d) => 55 * d.stackLevel - 5)
      .attr("fill", "#C0B0E0").attr("font-size", "11px").attr("font-weight", "700")
      .text((d) => d.subcategory || d.category);

    eventG.append("text")
      .attr("x", 18).attr("y", (d) => 55 * d.stackLevel + 11)
      .attr("fill", "#8C7FAE").attr("font-size", "10px")
      .text((d) => d.detail.slice(0, 30) + (d.detail.length > 30 ? "…" : ""));

    // ── Data points ──────────────────────────────────────────────────────────
    const pointG = svg.append("g")
      .selectAll("g.pt")
      .data(chartYears)
      .enter()
      .append("g")
      .attr("class", "pt")
      .attr("transform", (d) => `translate(${x(d.x)},${y(d.y)})`)
      .style("cursor", "pointer");

    // Flower — LB (big) and pre-LB (small). flower-zr.svg: 128×114 viewBox, center at 64,57
    pointG.filter((d) => d.isLB)
      .append("image")
      .attr("x", -80).attr("y", -71)
      .attr("width", 160).attr("height", 143)
      .attr("href", "/images/flower-zr.svg")
      .attr("opacity", 0.6);

    pointG.filter((d) => d.isPreLB && !d.isLB)
      .append("image")
      .attr("x", -56).attr("y", -50)
      .attr("width", 112).attr("height", 100)
      .attr("href", "/images/flower-zr.svg")
      .attr("opacity", 0.4);

    // Circle
    pointG.append("circle")
      .attr("r", (d) => d.isBusy ? 35 : d.isCulmination ? 25 : 19)
      .attr("fill", COLORS.circle)
      .attr("stroke", COLORS.circleStroke)
      .attr("stroke-width", 16);

    // Score value inside
    pointG.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#1B1535")
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .attr("pointer-events", "none")
      .text((d) => Math.round(d.y));

    // LB badge below circle
    pointG.filter((d) => d.isLB)
      .append("text")
      .attr("text-anchor", "middle").attr("y", (d) => (d.isBusy ? 42 : d.isCulmination ? 32 : 26))
      .attr("fill", "#E0A040").attr("font-size", "9px").attr("font-weight", "700")
      .attr("pointer-events", "none").text("LB");

    // Tooltip
    const ttG = pointG.append("g")
      .attr("transform", "translate(50,-120)")
      .style("display", "none")
      .style("pointer-events", "none");

    ttG.append("rect")
      .attr("y", -30).attr("rx", 10)
      .attr("fill", "rgba(15,12,34,0.96)")
      .attr("stroke", "rgba(149,133,204,0.3)")
      .attr("width", 200).attr("height", 78);

    ttG.append("text").attr("x", 10).attr("y", -8)
      .attr("fill", "#9585CC").attr("font-size", "11px").attr("font-weight", "700")
      .text((d) => `${d.year}${d.sign ? ` · ${d.sign}` : ""}`);

    ttG.append("text").attr("x", 10).attr("y", 12)
      .attr("fill", "#8C7FAE").attr("font-size", "10px")
      .text((d) => `ZR score ${Math.round(d.y)}`);

    ttG.append("text").attr("x", 10).attr("y", 30)
      .attr("fill", "#8C7FAE").attr("font-size", "10px")
      .text((d) => d.isBusy ? "Peak period" : d.isCulmination ? "Culmination" : d.isLB ? "Loosing of Bond" : d.isPreLB ? "Pre-LB" : "—");

    pointG
      .on("mouseover", function () {
        d3.selectAll("g.pt").style("opacity", 0.2);
        d3.select(this).style("opacity", 1);
        d3.select(this).select("g").style("display", "block");
      })
      .on("mouseleave", function () {
        d3.selectAll("g.pt").style("opacity", 1);
        d3.select(this).select("g").style("display", "none");
      });

    // Scroll to today
    if (containerRef.current) {
      const focusDate = new Date(referenceInstantMs);
      const focusX = x(focusDate) + margin.left;
      const viewW = containerRef.current.clientWidth;
      if (focusX > viewW / 2) {
        containerRef.current.scrollLeft = focusX - viewW / 2;
      }
    }
  }, [chartYears, events, referenceInstantMs, selectedEventId, viewportTick]);

  useEffect(() => {
    if (!loading && chartYears.length > 0) drawChart();
  }, [loading, chartYears, drawChart]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      setViewportTick((tick) => tick + 1);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [loading, chartYears.length]);

  // ── Drag scroll ────────────────────────────────────────────────────────────
  function onMouseDown(e: React.MouseEvent) {
    const el = containerRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.pageX, scrollLeft: el.scrollLeft };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!drag.current.active || !containerRef.current) return;
    e.preventDefault();
    containerRef.current.scrollLeft = drag.current.scrollLeft - (e.pageX - drag.current.startX);
  }
  function onMouseUp() { drag.current.active = false; }

  function onTouchStart(e: React.TouchEvent) {
    const el = containerRef.current;
    if (!el || e.touches.length !== 1) return;
    drag.current = { active: true, startX: e.touches[0].pageX, scrollLeft: el.scrollLeft };
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!drag.current.active || !containerRef.current || e.touches.length !== 1) return;
    containerRef.current.scrollLeft = drag.current.scrollLeft - (e.touches[0].pageX - drag.current.startX);
  }
  function onTouchEnd() { drag.current.active = false; }

  // ── Add event ──────────────────────────────────────────────────────────────
  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!form.event_date) return;
    setSaving(true);
    try {
      const res = await apiFetch("/api/astrolearn/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, event_date: toPersonEventCompactDate(form.event_date) }),
      });
      const json = await res.json();
      if (json.data) {
        setEvents((prev) => [...prev, json.data]);
        setShowModal(false);
        setForm({ event_date: "", category: "WORK", subcategory: "", detail: "" });
      }
    } finally {
      setSaving(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const releasing = zrData?.releasing;
  const currentPeriods = releasing?.currentPeriods ?? {};
  const L1 = currentPeriods["L1"];
  const L2 = currentPeriods["L2"];
  const navPeriods = (l3NavDate && Object.keys(l3NavPeriods).length > 0) ? l3NavPeriods : currentPeriods;
  const L3 = navPeriods["L3"] as ZRPeriod | undefined;
  const L4 = navPeriods["L4"] as ZRPeriod | undefined;

  function navigateL3(dir: "prev" | "next") {
    if (!L3) return;
    const d = new Date(dir === "next" ? L3.endDate : L3.startDate);
    d.setDate(d.getDate() + (dir === "next" ? 1 : -1));
    setL3NavDate(d.toISOString().split("T")[0]);
  }

  function navigateL4(dir: "prev" | "next") {
    if (!L4) return;
    const d = new Date(dir === "next" ? L4.endDate : L4.startDate);
    d.setDate(d.getDate() + (dir === "next" ? 1 : -1));
    setL3NavDate(d.toISOString().split("T")[0]);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#9585CC] border-t-transparent animate-spin" />
        <p className="text-[#8C7FAE] text-sm">Calculating Spirit Wave…</p>
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-shrink-0 space-y-3 px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
          <h1 className="text-2xl font-bold text-white">Spirit Wave</h1>
          {releasing?.fromLot && (
            <p className="text-sm text-[#8C7FAE] mt-0.5">
              Zodiacal Releasing · Lot of{" "}
              <span className="capitalize text-[#9585CC]">{releasing.fromLot}</span>
              {releasing.startingSign && ` · starting ${releasing.startingSign}`}
            </p>
          )}
          {!eventsEnabled ? (
            <p className="text-xs text-[#8C7FAE] mt-2">
              Life events are available for AstroLearn users only.
            </p>
          ) : null}
        </div>
        {eventsEnabled ? (
        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: "#9585CC", color: "#fff" }}
        >
          + Add Event
          </button>
        ) : null}
        </div>

        {(L1 || L2) && (
          <div className="flex gap-2">
          {L1 && (
            <div className="flex-1 rounded-xl px-4 py-3" style={{ background: "rgba(19,15,39,0.8)", border: "1px solid rgba(149,133,204,0.25)" }}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#9585CC] mb-0.5">L1</div>
              <div className="text-white font-bold">{L1.sign}</div>
              <div className="text-[10px] text-[#4A4070] font-mono mt-0.5">until {L1.endDate?.slice(0, 10)}</div>
            </div>
          )}
          {L2 && (
            <div className="flex-1 rounded-xl px-4 py-3" style={{ background: "rgba(19,15,39,0.8)", border: "1px solid rgba(149,133,204,0.25)" }}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#9585CC] mb-0.5">L2</div>
              <div className="text-white font-bold">{L2.sign}</div>
              <div className="text-[10px] text-[#4A4070] font-mono mt-0.5">until {L2.endDate?.slice(0, 10)}</div>
            </div>
          )}
        </div>
      )}

      {(L3 || L4) && (
        <div className="flex gap-2 relative">
          {l3NavLoading && (
            <div className="absolute inset-0 rounded-xl z-10 flex items-center justify-center" style={{ background: "rgba(15,12,34,0.5)" }}>
              <div className="w-4 h-4 rounded-full border-2 border-[#9585CC] border-t-transparent animate-spin" />
            </div>
          )}
          {L3 && (
            <div className="flex-1 rounded-xl px-4 py-3" style={{ background: "rgba(19,15,39,0.8)", border: "1px solid rgba(149,133,204,0.25)" }}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#9585CC]">L3</div>
                {l3NavDate && (
                  <button onClick={() => setL3NavDate(null)} className="text-[9px] text-[#4A4070] hover:text-[#9585CC]">now</button>
                )}
              </div>
              <div className="text-white font-bold text-sm">
                {L3.sign}
                {L3.isPeakPeriod && <span className="ml-1.5 text-[9px] text-amber-400 font-bold">Peak</span>}
                {L3.isCulmination && <span className="ml-1.5 text-[9px] text-amber-400 font-bold">Culm</span>}
                {L3.isLoosingOfBond && <span className="ml-1.5 text-[9px] text-red-400 font-bold">LB</span>}
              </div>
              <div className="text-[10px] text-[#4A4070] font-mono mt-0.5">
                {L3.startDate?.slice(0, 10)} → {L3.endDate?.slice(0, 10)}
              </div>
              <div className="flex gap-1 mt-2">
                <button onClick={() => navigateL3("prev")} className="flex-1 text-xs py-1 rounded-lg font-semibold" style={{ background: "rgba(149,133,204,0.18)", color: "#9585CC" }}>‹ prev</button>
                <button onClick={() => navigateL3("next")} className="flex-1 text-xs py-1 rounded-lg font-semibold" style={{ background: "rgba(149,133,204,0.18)", color: "#9585CC" }}>next ›</button>
              </div>
            </div>
          )}
          {L4 && (
            <div className="flex-1 rounded-xl px-4 py-3" style={{ background: "rgba(19,15,39,0.8)", border: "1px solid rgba(149,133,204,0.25)" }}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#9585CC] mb-0.5">L4</div>
              <div className="text-white font-bold text-sm">
                {L4.sign}
                {L4.isPeakPeriod && <span className="ml-1.5 text-[9px] text-amber-400 font-bold">Peak</span>}
                {L4.isCulmination && <span className="ml-1.5 text-[9px] text-amber-400 font-bold">Culm</span>}
                {L4.isLoosingOfBond && <span className="ml-1.5 text-[9px] text-red-400 font-bold">LB</span>}
              </div>
              <div className="text-[10px] text-[#4A4070] font-mono mt-0.5">
                {L4.startDate?.slice(0, 10)} → {L4.endDate?.slice(0, 10)}
              </div>
              <div className="flex gap-1 mt-2">
                <button onClick={() => navigateL4("prev")} className="flex-1 text-xs py-1 rounded-lg font-semibold" style={{ background: "rgba(149,133,204,0.18)", color: "#9585CC" }}>‹ prev</button>
                <button onClick={() => navigateL4("next")} className="flex-1 text-xs py-1 rounded-lg font-semibold" style={{ background: "rgba(149,133,204,0.18)", color: "#9585CC" }}>next ›</button>
              </div>
            </div>
          )}
        </div>
      )}

      </div>

      {/* D3 timeline chart */}
      <div
        ref={containerRef}
        className="overflow-x-auto cursor-grab active:cursor-grabbing select-none rounded-2xl"
        style={{
          background: "rgba(11,8,26,0.95)",
          border: "1px solid rgba(46,38,84,0.5)",
          scrollbarWidth: "none",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div ref={chartRef} />
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
            style={{ background: "#130F27", border: "1px solid rgba(46,38,84,0.8)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Add an Event</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8C7FAE] text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs text-[#8C7FAE] mb-1 font-semibold uppercase tracking-wide">Date</label>
                <DateInput
                  required
                  value={form.event_date}
                  onChange={(value) => setForm((f) => ({ ...f, event_date: value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: "rgba(46,38,84,0.4)", border: "1px solid rgba(149,133,204,0.3)" }}
                />
              </div>
              <div>
                <label className="block text-xs text-[#8C7FAE] mb-2 font-semibold uppercase tracking-wide">Category</label>
                <div className="flex gap-2">
                  {PERSON_EVENT_CATEGORIES.map((cat) => (
                    <button key={cat} type="button"
                      onClick={() => setForm((f) => ({ ...f, category: cat }))}
                      className="flex-1 text-xs py-2.5 rounded-xl font-bold transition-all"
                      style={form.category === cat
                        ? { background: "#9585CC", color: "#fff" }
                        : { background: "rgba(46,38,84,0.4)", color: "#8C7FAE" }
                      }
                    >
                      {cat === "BE CAREFUL" ? "Care" : cat === "RELATIONSHIP" ? "Love" : "Work"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#8C7FAE] mb-1 font-semibold uppercase tracking-wide">Title</label>
                <input type="text" placeholder="e.g. New job, Travel, Marriage…"
                  value={form.subcategory}
                  onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-[#4A4070]"
                  style={{ background: "rgba(46,38,84,0.4)", border: "1px solid rgba(149,133,204,0.3)" }}
                />
              </div>
              <div>
                <label className="block text-xs text-[#8C7FAE] mb-1 font-semibold uppercase tracking-wide">Note</label>
                <input type="text" placeholder="Short description…"
                  value={form.detail}
                  onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-[#4A4070]"
                  style={{ background: "rgba(46,38,84,0.4)", border: "1px solid rgba(149,133,204,0.3)" }}
                />
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: saving ? "rgba(149,133,204,0.4)" : "#9585CC" }}
              >
                {saving ? "Saving…" : "Save Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
