"use client";

import { useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HitPeriod {
  startDate: string;
  endDate: string;
  startDateFormatted: string;
  endDateFormatted: string;
  bestHit: {
    date: string;
    transitPosition: number;
    orb: number;
    hitType: string;
  };
}

interface TransitCycle {
  transitPlanet: string;
  natalPoint: string;
  aspect: string;
  firstHit: string;
  lastHit: string;
  periods: HitPeriod[];
  hitsCount: number;
  hitType: "cycle" | "single";
  status: "active" | "upcoming" | "recent" | "past" | "spanning";
  isInMiddleOfCycle: boolean;
  daysToFirstHit: number;
  daysToLastHit: number;
  periodsFormatted?: string;
  houseTransitInfo?: {
    houseNumber: number;
    entryDates: string[];
    exitDates: string[];
    durations: number[];
  };
}

interface SimpleEvent {
  date?: string;
  exactDate?: string;
  transitPlanet?: string;
  planet?: string;
  aspect?: string;
  natalPlanet?: string;
  natal?: string;
  orb?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PLANET_COLORS: Record<string, string> = {
  Sun: "#F4C430",
  Moon: "#C8D8E8",
  Mercury: "#B8A0CC",
  Venus: "#E8A090",
  Mars: "#E06060",
  Jupiter: "#A0B8E0",
  Saturn: "#A89070",
  Uranus: "#70D0C0",
  Neptune: "#6080C0",
  Pluto: "#906080",
  Chiron: "#80A870",
  "North Node": "#C0A050",
  "South Node": "#C0A050",
  Asc: "#D0C8F0",
  MC: "#D0C8F0",
  Desc: "#D0C8F0",
  IC: "#D0C8F0",
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: "☌",
  opposition: "☍",
  trine: "△",
  square: "□",
  sextile: "⚹",
  quincunx: "⚻",
  semisextile: "⚺",
};

const ASPECT_NAMES: Record<string, string> = {
  conjunction: "Conjunction",
  opposition: "Opposition",
  trine: "Trine",
  square: "Square",
  sextile: "Sextile",
  quincunx: "Quincunx",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pColor(name: string) {
  return PLANET_COLORS[name] ?? "#8C7FAE";
}

function parseDateParts(dateStr: string) {
  const [year, month, day] = dateStr.split(" ")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

function fmtMonthYear(dateStr: string) {
  return parseDateParts(dateStr).toLocaleDateString("en", { month: "short", year: "numeric" });
}

function fmtShort(dateStr: string) {
  return parseDateParts(dateStr).toLocaleDateString("en", { month: "short", day: "numeric" });
}

function fmtShortWithYear(dateStr: string) {
  return parseDateParts(dateStr).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtCycleRange(firstHit: string, lastHit: string, houseTransit: boolean) {
  const start = parseDateParts(firstHit);
  const end = parseDateParts(lastHit);
  const sameYear = start.getFullYear() === end.getFullYear();
  const startText = (houseTransit || !sameYear ? fmtShortWithYear : fmtShort)(firstHit);
  const endText = fmtShortWithYear(lastHit);
  if (firstHit === lastHit) return endText;
  return `${startText} – ${endText}`;
}

function dateToTs(dateStr: string) {
  return parseDateParts(dateStr).getTime();
}

function posInRange(dateStr: string, firstHit: string, lastHit: string): number {
  const first = dateToTs(firstHit);
  const last = dateToTs(lastHit);
  if (last <= first) return 0;
  return Math.max(0, Math.min(1, (dateToTs(dateStr) - first) / (last - first)));
}

function cycleDurationMonths(firstHit: string, lastHit: string): number {
  const ms = dateToTs(lastHit) - dateToTs(firstHit);
  return Math.round(ms / (1000 * 60 * 60 * 24 * 30));
}

function ordinalLabel(index: number) {
  if (index === 0) return "1st";
  if (index === 1) return "2nd";
  if (index === 2) return "3rd";
  return `${index + 1}th`;
}

function passLabel(index: number, houseTransit: boolean) {
  const ordinal = ordinalLabel(index);
  return houseTransit ? `${ordinal} entry` : ordinal;
}

function hasMultiPassTimeline(cycle: TransitCycle) {
  if (!isHouseTransit(cycle)) return cycle.hitsCount > 1;
  return (
    cycle.hitsCount > 1 ||
    (cycle.periods?.length ?? 0) > 1 ||
    (cycle.houseTransitInfo?.entryDates?.length ?? 0) > 1
  );
}

function multiPassCount(cycle: TransitCycle) {
  return Math.max(
    cycle.hitsCount,
    cycle.periods?.length ?? 0,
    cycle.houseTransitInfo?.entryDates?.length ?? 0
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanetTag({ name }: { name: string }) {
  const c = pColor(name);
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${c}1A`, color: c, border: `1px solid ${c}33` }}
    >
      {name}
    </span>
  );
}

function StatusBadge({ status }: { status: TransitCycle["status"] }) {
  const cfg = status === "active" || status === "spanning"
    ? { label: "ACTIVE", color: "#9585CC" }
    : status === "upcoming"
    ? { label: "UPCOMING", color: "#6080C0" }
    : status === "recent"
    ? { label: "RECENT", color: "#A89070" }
    : { label: "PAST", color: "#4A4070" };

  return (
    <span
      className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full flex-shrink-0"
      style={{
        background: `${cfg.color}1A`,
        color: cfg.color,
        border: `1px solid ${cfg.color}33`,
      }}
    >
      {cfg.label}
    </span>
  );
}

function CycleTimeline({
  cycle,
  now,
  houseTransit = false,
}: {
  cycle: TransitCycle;
  now: number;
  houseTransit?: boolean;
}) {
  const { firstHit, lastHit, periods, isInMiddleOfCycle } = cycle;
  const todayPos = posInRange(new Date(now).toISOString(), firstHit, lastHit);

  return (
    <div className="mt-4 select-none">
      {/* Track */}
      <div className="relative mx-3" style={{ height: "20px" }}>
        {/* Background rail */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 rounded-full"
          style={{ height: "3px", background: "rgba(46,38,84,0.8)" }}
        />

        {/* Progress fill */}
        {isInMiddleOfCycle && (
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 rounded-full"
            style={{
              height: "3px",
              width: `${Math.min(100, todayPos * 100)}%`,
              background:
                "linear-gradient(90deg, rgba(149,133,204,0.4) 0%, rgba(149,133,204,0.85) 100%)",
            }}
          />
        )}

        {/* Hit dots */}
        {periods.map((period, i) => {
          const pos = posInRange(period.bestHit.date, firstHit, lastHit);
          const isPast = period.bestHit.date && now > dateToTs(period.bestHit.date);
          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full z-10 flex items-center justify-center"
              style={{
                left: `${pos * 100}%`,
                width: "16px",
                height: "16px",
                background: isPast ? "#9585CC" : "rgba(19,15,39,0.95)",
                border: `2px solid ${isPast ? "#9585CC" : "#6A5FAE"}`,
                boxShadow: isPast ? "0 0 8px rgba(149,133,204,0.5)" : "none",
              }}
            >
              <span
                className="text-[8px] font-bold"
                style={{ color: isPast ? "#E0D8FF" : "#6A5FAE" }}
              >
                {i + 1}
              </span>
            </div>
          );
        })}

        {/* TODAY needle */}
        {isInMiddleOfCycle && (
          <div
            className="absolute top-0 z-20 flex flex-col items-center"
            style={{
              left: `${Math.min(96, Math.max(4, todayPos * 100))}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div
              style={{
                width: "1.5px",
                height: "20px",
                background: "#F0EAFF",
                boxShadow: "0 0 6px rgba(240,234,255,0.8)",
              }}
            />
          </div>
        )}
      </div>

      {/* Labels row */}
      <div className="relative mt-1" style={{ height: "36px" }}>
        {periods.map((period, i) => {
          const pos = posInRange(period.bestHit.date, firstHit, lastHit);
          const isPast = period.bestHit.date && now > dateToTs(period.bestHit.date);
          // Clamp label to prevent overflow
          const clampedPos = Math.min(90, Math.max(10, pos * 100));
          return (
            <div
              key={i}
              className="absolute text-center"
              style={{
                left: `${clampedPos}%`,
                transform: "translateX(-50%)",
                width: "64px",
              }}
            >
              <div
                className="text-[10px] font-semibold"
                style={{ color: isPast ? "#9585CC" : "#6A5FAE" }}
              >
                {passLabel(i, houseTransit)}
              </div>
              <div
                className="text-[9px] leading-tight"
                style={{ color: isPast ? "#7A6FAE" : "#4A4070" }}
              >
                {fmtMonthYear(period.bestHit.date)}
              </div>
            </div>
          );
        })}

        {/* TODAY label */}
        {isInMiddleOfCycle && (
          <div
            className="absolute text-center"
            style={{
              left: `${Math.min(94, Math.max(6, todayPos * 100))}%`,
              transform: "translateX(-50%)",
              bottom: 0,
            }}
          >
            <div className="text-[9px] font-bold" style={{ color: "#F0EAFF" }}>
              TODAY
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CycleCard({ cycle, now }: { cycle: TransitCycle; now: number }) {
  const {
    transitPlanet,
    natalPoint,
    aspect,
    firstHit,
    lastHit,
    isInMiddleOfCycle,
    status,
    hitsCount,
    daysToFirstHit,
    daysToLastHit,
  } = cycle;

  const isHouse = isHouseTransit(cycle);
  const showTimeline = hasMultiPassTimeline(cycle);
  const passCount = multiPassCount(cycle);
  const isSingle = !showTimeline;
  const isActive = isInMiddleOfCycle;
  const isUpcoming = !isInMiddleOfCycle && daysToFirstHit > 0;
  const isPast = !isInMiddleOfCycle && daysToLastHit < 0;
  const badgeStatus: TransitCycle["status"] = isActive
    ? "active"
    : isUpcoming
    ? "upcoming"
    : isPast
    ? "past"
    : status;
  const aspectSym = ASPECT_SYMBOLS[aspect.toLowerCase()] ?? aspect;
  const months = cycleDurationMonths(firstHit, lastHit);

  const borderColor = isActive
    ? "rgba(149,133,204,0.35)"
    : isUpcoming
    ? "rgba(96,128,192,0.3)"
    : "rgba(46,38,84,0.5)";

  const bgColor = isActive
    ? "rgba(149,133,204,0.07)"
    : isUpcoming
    ? "rgba(96,128,192,0.06)"
    : "rgba(19,15,39,0.6)";

  const glowStyle = isActive
    ? { boxShadow: "0 0 24px rgba(149,133,204,0.12)" }
    : {};

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: bgColor, border: `1px solid ${borderColor}`, ...glowStyle }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <PlanetTag name={transitPlanet} />
          {!isHouseTransit(cycle) && (
            <>
              <span className="text-base" style={{ color: "#8C7FAE" }}>
                {aspectSym}
              </span>
              <span className="text-xs" style={{ color: "#4A4070" }}>
                natal
              </span>
              <PlanetTag name={natalPoint} />
            </>
          )}
          {isHouseTransit(cycle) && (
            <span className="text-xs font-medium" style={{ color: "#6A5FAE" }}>
              through {houseLabel(natalPoint)}
            </span>
          )}
        </div>
        <StatusBadge status={badgeStatus} />
      </div>

      {/* Meta line */}
      <div
        className="mt-1.5 flex items-center gap-2 text-[11px]"
        style={{ color: "#4A4070" }}
      >
        <span>{isHouseTransit(cycle) ? "House transit" : (ASPECT_NAMES[aspect.toLowerCase()] ?? aspect)}</span>
        {!isSingle && (
          <>
            <span>·</span>
            <span>
              {passCount} {isHouse ? "visits" : "passes"}
            </span>
            {months > 0 && (
              <>
                <span>·</span>
                <span>{months} months</span>
              </>
            )}
          </>
        )}
        {isSingle && isUpcoming && daysToFirstHit >= 0 && (
          <>
            <span>·</span>
            <span>in {daysToFirstHit} days</span>
          </>
        )}
      </div>

      {showTimeline ? (
        <>
          <CycleTimeline cycle={cycle} now={now} houseTransit={isHouse} />
          <div
            className="mt-3 text-xs font-mono"
            style={{ color: "#6A5FAE" }}
          >
            {fmtCycleRange(firstHit, lastHit, isHouse)}
          </div>
        </>
      ) : (
        <div
          className="mt-3 text-xs font-mono"
          style={{ color: "#6A5FAE" }}
        >
          {fmtCycleRange(firstHit, lastHit, isHouse)}
        </div>
      )}

      {isHouse && cycle.periodsFormatted?.includes(" R ") && (
        <div
          className="mt-2 text-[11px] leading-relaxed"
          style={{ color: "#7A6FAE" }}
        >
          {cycle.periodsFormatted}
        </div>
      )}

      {isActive && showTimeline && (
        <div
          className="mt-3 text-[11px] px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(149,133,204,0.08)", color: "#9585CC" }}
        >
          {isHouse
            ? `You are between the ${ordinalLabel(0)} and ${ordinalLabel(passCount - 1)} entry`
            : `You are between the ${ordinalLabel(0)} and ${ordinalLabel(passCount - 1)} pass`}
        </div>
      )}
    </div>
  );
}

// ─── Simple events list (secondary view) ─────────────────────────────────────

function SimpleTransitRow({ ev }: { ev: SimpleEvent }) {
  const date = (ev.exactDate || ev.date || "").slice(0, 10);
  const tPlanet = ev.transitPlanet || ev.planet || "";
  const aspect = ev.aspect || "";
  const nPlanet = ev.natalPlanet || ev.natal || "";
  const sym = ASPECT_SYMBOLS[aspect.toLowerCase()] ?? "";
  const color = pColor(tPlanet);
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
      style={{ background: "rgba(19,15,39,0.6)", border: "1px solid rgba(46,38,84,0.4)" }}
    >
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0"
        style={{ background: `${color}1A`, color, border: `1px solid ${color}33` }}
      >
        {tPlanet.slice(0, 2)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-medium">
          <span style={{ color }}>{tPlanet}</span>
          {sym && <span className="mx-1.5" style={{ color: "#8C7FAE" }}>{sym}</span>}
          {!sym && aspect && <span className="mx-1.5 text-xs" style={{ color: "#8C7FAE" }}>{aspect}</span>}
          {nPlanet && <span style={{ color: "#C0B0E0" }}>{nPlanet}</span>}
        </div>
        <div className="text-xs font-mono mt-0.5" style={{ color: "#4A4070" }}>{date}</div>
      </div>
      {ev.orb != null && (
        <div className="text-xs flex-shrink-0 font-mono" style={{ color: "#4A4070" }}>
          {Number(ev.orb).toFixed(1)}°
        </div>
      )}
    </div>
  );
}

// ─── Helpers for house transit display ───────────────────────────────────────

function isHouseTransit(cycle: TransitCycle) {
  return cycle.aspect === "house_transit";
}

function houseLabel(natalPoint: string) {
  const n = parseInt(natalPoint);
  if (!isNaN(n)) {
    const suffixes = ["th","st","nd","rd"];
    const suffix = n <= 3 ? suffixes[n] : "th";
    return `House ${n}`;
  }
  return natalPoint;
}

// ─── Main page ────────────────────────────────────────────────────────────────

type MainView = "cycles" | "events";
type CycleFilter = "active" | "upcoming" | "past";

export default function TransitsPage() {
  const [view, setView] = useState<MainView>("cycles");
  const [cycleFilter, setCycleFilter] = useState<CycleFilter>("active");

  // Cycles state
  const [cycles, setCycles] = useState<TransitCycle[]>([]);
  const [cyclesLoading, setCyclesLoading] = useState(false);
  const [cyclesError, setCyclesError] = useState("");
  const [cyclesFetched, setCyclesFetched] = useState(false);

  // Events state
  const [events, setEvents] = useState<SimpleEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");

  const now = Date.now();

  // Load cycles on mount
  useEffect(() => {
    setCyclesLoading(true);
    fetch("/api/astrolearn/transit-cycles")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setCyclesError(d.error);
        } else {
          const list: TransitCycle[] = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [];
          setCycles(list);
          setCyclesFetched(true);
        }
      })
      .catch(() => setCyclesError("Failed to load transit cycles"))
      .finally(() => setCyclesLoading(false));
  }, []);

  // Load events only when switching to events view
  useEffect(() => {
    if (view !== "events" || events.length > 0 || eventsLoading) return;
    setEventsLoading(true);
    fetch("/api/astrolearn/transits")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setEventsError(d.error);
        else {
          const list: SimpleEvent[] = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [];
          setEvents(list);
        }
      })
      .catch(() => setEventsError("Failed to load transits"))
      .finally(() => setEventsLoading(false));
  }, [view, events.length, eventsLoading]);

  // Filter cycles by bucket — strict criteria
  const activeCycles = cycles.filter((c) => c.isInMiddleOfCycle);
  const upcomingCycles = cycles.filter((c) => !c.isInMiddleOfCycle && c.daysToFirstHit > 0);
  const pastCycles = cycles.filter((c) => !c.isInMiddleOfCycle && c.daysToLastHit < 0);

  const visibleCycles =
    cycleFilter === "active" ? activeCycles :
    cycleFilter === "upcoming" ? upcomingCycles :
    pastCycles;

  // Group events by month
  function groupByMonth(evs: SimpleEvent[]) {
    const g: Record<string, SimpleEvent[]> = {};
    for (const ev of evs) {
      const raw = ev.exactDate || ev.date || "";
      const key = raw.slice(0, 7);
      if (!g[key]) g[key] = [];
      g[key].push(ev);
    }
    return g;
  }

  function monthLabel(key: string) {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Transits</h1>
        <p className="text-sm mt-1" style={{ color: "#8C7FAE" }}>
          Slow planet cycles and exact aspects to your natal chart
        </p>
      </div>

      {/* View toggle */}
      <div
        className="flex rounded-xl p-1 gap-1"
        style={{ background: "rgba(19,15,39,0.8)", border: "1px solid rgba(46,38,84,0.5)" }}
      >
        {(["cycles", "events"] as MainView[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              view === v
                ? { background: "rgba(149,133,204,0.2)", color: "#E0D8FF", border: "1px solid rgba(149,133,204,0.3)" }
                : { color: "#4A4070" }
            }
          >
            {v === "cycles" ? "Cycles" : "Events"}
          </button>
        ))}
      </div>

      {/* ── CYCLES VIEW ── */}
      {view === "cycles" && (
        <>
          {cyclesLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div
                className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#9585CC", borderTopColor: "transparent" }}
              />
              <p className="text-sm" style={{ color: "#8C7FAE" }}>
                Calculating slow planet cycles…
              </p>
              <p className="text-xs" style={{ color: "#4A4070" }}>
                This may take up to a minute
              </p>
            </div>
          )}

          {cyclesError && !cyclesLoading && (
            <div
              className="rounded-2xl p-5 text-center"
              style={{ background: "rgba(224,96,96,0.08)", border: "1px solid rgba(224,96,96,0.2)" }}
            >
              <p className="text-sm" style={{ color: "#E06060" }}>{cyclesError}</p>
            </div>
          )}

          {/* Filter pills — Active / Upcoming / Past */}
          {!cyclesLoading && !cyclesError && cyclesFetched && (
            <>
              <div className="flex gap-2">
                {(["active", "upcoming", "past"] as CycleFilter[]).map((f) => {
                  const count = f === "active" ? activeCycles.length : f === "upcoming" ? upcomingCycles.length : pastCycles.length;
                  const isSelected = cycleFilter === f;
                  const accentColor = f === "active" ? "#9585CC" : f === "upcoming" ? "#6080C0" : "#A89070";
                  return (
                    <button
                      key={f}
                      onClick={() => setCycleFilter(f)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={
                        isSelected
                          ? { background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44` }
                          : { background: "rgba(19,15,39,0.6)", color: "#4A4070", border: "1px solid rgba(46,38,84,0.5)" }
                      }
                    >
                      <span className="capitalize">{f}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{
                          background: isSelected ? `${accentColor}33` : "rgba(46,38,84,0.6)",
                          color: isSelected ? accentColor : "#4A4070",
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {visibleCycles.length === 0 ? (
                <p className="text-center py-12 text-sm" style={{ color: "#4A4070" }}>
                  {cycleFilter === "active"
                    ? "No active cycles right now."
                    : cycleFilter === "upcoming"
                    ? "No upcoming cycles in the next 2 years."
                    : "No past cycles found."}
                </p>
              ) : (
                <div className="space-y-3">
                  {visibleCycles.map((c, i) => (
                    <CycleCard key={i} cycle={c} now={now} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── EVENTS VIEW ── */}
      {view === "events" && (
        <>
          {eventsLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#9585CC", borderTopColor: "transparent" }}
              />
              <p className="text-sm" style={{ color: "#8C7FAE" }}>
                Loading transit events…
              </p>
            </div>
          )}

          {eventsError && !eventsLoading && (
            <div
              className="rounded-2xl p-5 text-center"
              style={{ background: "rgba(224,96,96,0.08)", border: "1px solid rgba(224,96,96,0.2)" }}
            >
              <p className="text-sm" style={{ color: "#E06060" }}>{eventsError}</p>
            </div>
          )}

          {!eventsLoading && !eventsError && (() => {
            const groups = groupByMonth(events);
            const months = Object.keys(groups).sort();
            if (months.length === 0) {
              return (
                <p className="text-center py-12 text-sm" style={{ color: "#4A4070" }}>
                  No events found.
                </p>
              );
            }
            return (
              <div className="space-y-6">
                {months.map((month) => (
                  <div key={month}>
                    <h2
                      className="text-[10px] font-bold uppercase tracking-widest mb-3"
                      style={{ color: "#4A4070" }}
                    >
                      {monthLabel(month)}
                    </h2>
                    <div className="space-y-2">
                      {groups[month].map((ev, i) => (
                        <SimpleTransitRow key={i} ev={ev} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
