"use client";

import { useEffect, useState } from "react";
import { useAstrolearnSubjectReload } from "@/lib/use-astrolearn-subject-reload";
import { useAstrolearnSessionTime } from "@/lib/astrolearn-session-time";
import { getHouseTransitWindow, parseNatalHouseNumber } from "@/lib/transit-cycle-passes";

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
  const datePart = dateStr.trim().split(" ")[0].split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function cycleNowDate(now: number) {
  const d = new Date(now);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fmtMonthYear(dateStr: string) {
  return parseDateParts(dateStr).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function fmtShort(dateStr: string) {
  return parseDateParts(dateStr).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

function fmtShortWithYear(dateStr: string) {
  return parseDateParts(dateStr).toLocaleDateString("en-GB", {
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

function activePassMessage(periods: HitPeriod[], now: number, houseTransit: boolean) {
  if (!periods.length) return null;

  const entries = periods
    .map((period, index) => ({ index, ts: dateToTs(period.bestHit.date) }))
    .sort((a, b) => a.ts - b.ts);

  const nowTs = dateToTs(cycleNowDate(now));
  const first = entries[0];
  const last = entries[entries.length - 1];

  if (nowTs < first.ts) {
    return `You are before the ${passLabel(first.index, houseTransit)}`;
  }

  if (nowTs >= last.ts) {
    return `You are after the ${passLabel(last.index, houseTransit)}`;
  }

  for (let i = 0; i < entries.length - 1; i++) {
    if (nowTs >= entries[i].ts && nowTs < entries[i + 1].ts) {
      return `You are between the ${passLabel(entries[i].index, houseTransit)} and ${passLabel(
        entries[i + 1].index,
        houseTransit
      )}`;
    }
  }

  return null;
}

const TIMELINE_LABEL_WIDTH_PX = 84;
const TIMELINE_TRACK_WIDTH_PX = 300;
const TIMELINE_LABEL_ROW_HEIGHT = 34;

type TimelineLabelPlacement = {
  kind: "entry" | "today";
  index?: number;
  posPct: number;
  lane: number;
};

function labelAnchorStyle(posPct: number): { left: string; transform: string } {
  if (posPct <= 8) {
    return { left: `${posPct}%`, transform: "translateX(0)" };
  }
  if (posPct >= 92) {
    return { left: `${posPct}%`, transform: "translateX(-100%)" };
  }
  return { left: `${posPct}%`, transform: "translateX(-50%)" };
}

function labelExtentPct(posPct: number): [number, number] {
  const widthPct = (TIMELINE_LABEL_WIDTH_PX / TIMELINE_TRACK_WIDTH_PX) * 100;
  if (posPct <= 8) {
    return [posPct, posPct + widthPct];
  }
  if (posPct >= 92) {
    return [posPct - widthPct, posPct];
  }
  const halfWidthPct = widthPct / 2;
  return [posPct - halfWidthPct, posPct + halfWidthPct];
}

function labelExtentsOverlap(posA: number, posB: number) {
  const [startA, endA] = labelExtentPct(posA);
  const [startB, endB] = labelExtentPct(posB);
  return startA < endB && startB < endA;
}

function assignTimelineLabelLanes(
  periods: HitPeriod[],
  firstHit: string,
  lastHit: string,
  todayPosPct: number | null
): TimelineLabelPlacement[] {
  const labels: TimelineLabelPlacement[] = periods.map((period, index) => ({
    kind: "entry",
    index,
    posPct: posInRange(period.bestHit.date, firstHit, lastHit) * 100,
    lane: 0,
  }));

  if (todayPosPct !== null) {
    labels.push({ kind: "today", posPct: todayPosPct, lane: 0 });
  }

  labels.sort((a, b) => a.posPct - b.posPct || (a.kind === "today" ? 1 : 0) - (b.kind === "today" ? 1 : 0));

  const lanePositions: number[][] = [];

  for (const label of labels) {
    let lane = 0;
    for (; lane < lanePositions.length; lane++) {
      const overlaps = lanePositions[lane].some((pos) => labelExtentsOverlap(label.posPct, pos));
      if (!overlaps) break;
    }
    if (lane === lanePositions.length) lanePositions.push([]);
    lanePositions[lane].push(label.posPct);
    label.lane = lane;
  }

  return labels;
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
  const { firstHit, lastHit } = resolveCycleWindow(cycle);
  const { periods, isInMiddleOfCycle } = cycle;
  const todayPos = posInRange(cycleNowDate(now), firstHit, lastHit);
  const todayTs = dateToTs(cycleNowDate(now));
  const todayPosPct = todayPos * 100;
  const timelineLabels = assignTimelineLabelLanes(
    periods,
    firstHit,
    lastHit,
    isInMiddleOfCycle ? todayPosPct : null
  );
  const entryLabels = timelineLabels.filter(
    (label): label is TimelineLabelPlacement & { kind: "entry"; index: number } =>
      label.kind === "entry" && label.index !== undefined
  );
  const todayLabel = timelineLabels.find((label) => label.kind === "today");
  const labelLaneCount = timelineLabels.reduce((max, label) => Math.max(max, label.lane + 1), 0);
  const labelAreaHeight = labelLaneCount * TIMELINE_LABEL_ROW_HEIGHT;

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
              width: `${Math.min(100, todayPosPct)}%`,
              background:
                "linear-gradient(90deg, rgba(149,133,204,0.4) 0%, rgba(149,133,204,0.85) 100%)",
            }}
          />
        )}

        {/* Hit dots */}
        {periods.map((period, i) => {
          const pos = posInRange(period.bestHit.date, firstHit, lastHit);
          const isPast = period.bestHit.date && todayTs > dateToTs(period.bestHit.date);
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
              left: `${todayPosPct}%`,
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
      <div className="relative mt-2" style={{ height: `${labelAreaHeight}px` }}>
        {entryLabels.map((label) => {
          const period = periods[label.index];
          const isPast = period.bestHit.date && todayTs > dateToTs(period.bestHit.date);
          const anchor = labelAnchorStyle(label.posPct);
          return (
            <div
              key={label.index}
              className="absolute text-center px-1.5 py-0.5 rounded-md"
              style={{
                ...anchor,
                top: label.lane * TIMELINE_LABEL_ROW_HEIGHT,
                width: `${TIMELINE_LABEL_WIDTH_PX}px`,
                background: "rgba(19,15,39,0.72)",
              }}
            >
              <div
                className="text-[11px] font-semibold leading-tight whitespace-nowrap"
                style={{ color: isPast ? "#C8B8F0" : "#8A7BC8" }}
              >
                {passLabel(label.index, houseTransit)}
              </div>
              <div
                className="text-[10px] leading-tight whitespace-nowrap"
                style={{ color: isPast ? "#9A8FC0" : "#6A5FAE" }}
              >
                {fmtMonthYear(period.bestHit.date)}
              </div>
            </div>
          );
        })}

        {todayLabel && (
          <div
            className="absolute text-center px-1.5 py-0.5 rounded-md"
            style={{
              ...labelAnchorStyle(todayLabel.posPct),
              top: todayLabel.lane * TIMELINE_LABEL_ROW_HEIGHT,
              width: `${TIMELINE_LABEL_WIDTH_PX}px`,
              background: "rgba(240,234,255,0.12)",
            }}
          >
            <div className="text-[10px] font-bold leading-tight whitespace-nowrap" style={{ color: "#F0EAFF" }}>
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
    isInMiddleOfCycle,
    status,
    hitsCount,
    daysToFirstHit,
    daysToLastHit,
  } = cycle;

  const { firstHit, lastHit } = resolveCycleWindow(cycle);
  const isHouse = isHouseTransit(cycle);
  const hasDateRange = firstHit !== lastHit;
  const showTimeline = hasMultiPassTimeline(cycle);
  const passCount = multiPassCount(cycle);
  const activeMessage = showTimeline ? activePassMessage(cycle.periods, now, isHouse) : null;
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
        {isHouse && hasDateRange && months > 0 && isSingle && (
          <>
            <span>·</span>
            <span>{months} months</span>
          </>
        )}
        {isSingle && isUpcoming && daysToFirstHit >= 0 && !hasDateRange && (
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

      {isActive && showTimeline && activeMessage && (
        <div
          className="mt-3 text-[11px] px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(149,133,204,0.08)", color: "#9585CC" }}
        >
          {activeMessage}
        </div>
      )}
    </div>
  );
}

// ─── Helpers for house transit display ───────────────────────────────────────

function isHouseTransit(cycle: TransitCycle) {
  if (cycle.aspect === "house_transit") return true;
  const isNode =
    cycle.transitPlanet === "North Node" || cycle.transitPlanet === "South Node";
  return isNode && parseNatalHouseNumber(cycle.natalPoint) !== null;
}

function resolveCycleWindow(cycle: TransitCycle): { firstHit: string; lastHit: string } {
  if (isHouseTransit(cycle)) {
    const { start, end } = getHouseTransitWindow(cycle);
    if (start && end) return { firstHit: start, lastHit: end };
  }
  return { firstHit: cycle.firstHit, lastHit: cycle.lastHit };
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

type CycleFilter = "active" | "upcoming" | "past";

export default function TransitsPage() {
  const reloadKey = useAstrolearnSubjectReload();
  const { referenceInstantMs, referenceDate } = useAstrolearnSessionTime();
  const [cycleFilter, setCycleFilter] = useState<CycleFilter>("active");

  const now = referenceInstantMs;

  // L etat du chargement est DERIVE, il n est plus pose par quatre setState en
  // tete d effet.
  //
  // Ces quatre-la (chargement, erreur, liste, « deja recu ») decrivaient UN
  // seul fait — « la reponse ne correspond plus a la date demandee » — et
  // devaient rester d accord entre eux a la main. L effet les remettait a zero
  // apres coup, donc React rendait d abord les anciens cycles, puis le
  // chargement : deux images, et l avertissement de React 19.
  //
  // La reponse est desormais rangee AVEC la clef qui l a demandee. Une reponse
  // arrivee en retard ne peut plus ecraser la suivante.
  const cle = `${reloadKey}|${referenceDate}`;
  const [reponse, setReponse] = useState<{
    cle: string;
    cycles: TransitCycle[];
    erreur: string;
  } | null>(null);

  const cyclesLoading = reponse?.cle !== cle;
  const cyclesError = cyclesLoading ? "" : reponse.erreur;
  const cycles = cyclesLoading ? [] : reponse.cycles;
  const cyclesFetched = !cyclesLoading && !cyclesError;

  // Load cycles on mount
  useEffect(() => {
    fetch(`/api/astrolearn/transit-cycles?date=${referenceDate}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setReponse({ cle, cycles: [], erreur: d.error });
        } else {
          const list: TransitCycle[] = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [];
          setReponse({ cle, cycles: list, erreur: "" });
        }
      })
      .catch(() => setReponse({ cle, cycles: [], erreur: "Failed to load transit cycles" }));
  }, [cle, referenceDate]);

  const activeCycles = cycles.filter((c) => c.isInMiddleOfCycle);
  const upcomingCycles = cycles.filter((c) => !c.isInMiddleOfCycle && c.daysToFirstHit > 0);
  const pastCycles = cycles.filter((c) => !c.isInMiddleOfCycle && c.daysToLastHit < 0);

  const visibleCycles =
    cycleFilter === "active" ? activeCycles :
    cycleFilter === "upcoming" ? upcomingCycles :
    pastCycles;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Transits</h1>
        <p className="text-sm mt-1" style={{ color: "#8C7FAE" }}>
          Slow planet cycles and exact aspects to your natal chart
        </p>
      </div>

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
    </div>
  );
}
