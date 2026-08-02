"use client";

import { useEffect, useMemo, useState } from "react";
import { useAstrolearnSubjectReload } from "@/lib/use-astrolearn-subject-reload";
import { useAstrolearnSessionTime } from "@/lib/astrolearn-session-time";

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
  zodiacAxis?: string;
  axisColor: string;
  seriesStart: string;
  seriesEnd: string;
  lastAxisTouch: string;
  lifetimeNumber?: number;
  lifetimeTotal?: number;
  allEclipses: AxisEclipse[];
  natalHits: NatalHit[];
};

const HOUSE_AXIS_LABELS: Record<string, string> = {
  "1-7": "Houses 1 and 7",
  "2-8": "Houses 2 and 8",
  "3-9": "Houses 3 and 9",
  "4-10": "Houses 4 and 10",
  "5-11": "Houses 5 and 11",
  "6-12": "Houses 6 and 12",
};

const ZODIAC_AXIS_LABELS: Record<string, string> = {
  "1-7": "Aries / Libra eclipse axis",
  "2-8": "Taurus / Scorpio eclipse axis",
  "3-9": "Gemini / Sagittarius eclipse axis",
  "4-10": "Cancer / Capricorn eclipse axis",
  "5-11": "Leo / Aquarius eclipse axis",
  "6-12": "Virgo / Pisces eclipse axis",
};

function hitsForEclipse(eclipseDate: string, hits: NatalHit[]) {
  const eclipseMs = Date.parse(`${eclipseDate.slice(0, 10)}T00:00:00Z`);
  return hits.filter((hit) => {
    const hitMs = Date.parse(`${hit.date.slice(0, 10)}T00:00:00Z`);
    const deltaDays = (eclipseMs - hitMs) / 86_400_000;
    return deltaDays >= 0 && deltaDays <= 7;
  });
}

function formatDate(date: string) {
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatRange(start: string, end: string) {
  return `${formatDate(start)} to ${formatDate(end)}`;
}

function EclipseTypeBadge({ type }: { type: "solar" | "lunar" }) {
  const isSolar = type === "solar";
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={
        isSolar
          ? { background: "rgba(244,196,48,0.12)", color: "#F4C430", border: "1px solid rgba(244,196,48,0.25)" }
          : { background: "rgba(149,133,204,0.12)", color: "#9585CC", border: "1px solid rgba(149,133,204,0.25)" }
      }
    >
      {isSolar ? "Solar" : "Lunar"}
    </span>
  );
}

function AspectLabel({ aspect }: { aspect: string }) {
  const normalized = aspect.toLowerCase();
  const label =
    normalized === "conjunction"
      ? "conjunct"
      : normalized === "opposition"
        ? "opposite"
        : normalized === "square"
          ? "square"
          : normalized === "trine"
            ? "trine"
            : normalized === "sextile"
              ? "sextile"
              : aspect;

  return <span className="text-[#8C7FAE]">{label}</span>;
}

function SeriesStat({ value, label, accent }: { value: number; label: string; accent?: string }) {
  return (
    <div className="mt-1 first:mt-0">
      <span className="font-semibold" style={accent ? { color: accent } : undefined}>
        {value}
      </span>{" "}
      {label}
    </div>
  );
}

function EclipseRow({
  eclipse,
  hits,
  referenceDate,
}: {
  eclipse: AxisEclipse;
  hits: NatalHit[];
  referenceDate: string;
}) {
  const isPast = eclipse.date < referenceDate;
  const hasNatalContact = hits.length > 0;
  const hasVip = hits.some((hit) => hit.isVipAspect);

  return (
    <EclipseRowContent
      eclipse={eclipse}
      hits={hits}
      isPast={isPast}
      hasNatalContact={hasNatalContact}
      hasVip={hasVip}
    />
  );
}

function EclipseRowContent({
  eclipse,
  hits,
  isPast,
  hasNatalContact,
  hasVip,
}: {
  eclipse: AxisEclipse;
  hits: NatalHit[];
  isPast: boolean;
  hasNatalContact: boolean;
  hasVip: boolean;
}) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: hasVip ? "rgba(244,196,48,0.06)" : "rgba(27,21,53,0.65)",
        border: `1px solid ${hasVip ? "rgba(244,196,48,0.22)" : "rgba(46,38,84,0.45)"}`,
        opacity: isPast ? 0.72 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <EclipseTypeBadge type={eclipse.type} />
            {eclipse.sign ? (
              <span className="text-xs text-[#8C7FAE]">
                {typeof eclipse.degree === "number" ? `${eclipse.degree}° ` : ""}
                {eclipse.sign}
              </span>
            ) : null}
            {hasVip ? (
              <span
                className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ color: "#F4C430", background: "rgba(244,196,48,0.12)" }}
              >
                VIP
              </span>
            ) : null}
          </div>

          {hasNatalContact ? (
            <div className="mt-2 space-y-1">
              {hits.map((hit) => (
                <p key={`${hit.date}-${hit.natalPoint}-${hit.aspect}`} className="text-sm text-white">
                  Eclipse
                  {eclipse.sign ? (
                    <span className="text-[#8C7FAE]"> in {eclipse.sign}</span>
                  ) : null}{" "}
                  <span className="text-[#8C7FAE]">
                    <AspectLabel aspect={hit.aspect} />
                  </span>{" "}
                  <span className="text-[#C0B0E0]">natal {hit.natalPoint}</span>
                  {typeof hit.orb === "number" ? (
                    <span className="text-[#6E6296] ml-2">orb {hit.orb.toFixed(1)}°</span>
                  ) : null}
                  {hit.isVipAspect ? (
                    <span className="text-[#F4C430] ml-2 text-[11px] uppercase tracking-wide">VIP</span>
                  ) : null}
                  {hit.isExactAspect ? (
                    <span className="text-[#F4C430] ml-2 text-[11px] uppercase tracking-wide">Exact</span>
                  ) : null}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-[#6E6296]">No natal contact on this eclipse.</p>
          )}
        </div>

        <div className="text-xs font-mono text-right shrink-0" style={{ color: isPast ? "#4A4070" : "#9585CC" }}>
          {formatDate(eclipse.date)}
          {isPast ? <div className="text-[10px] text-[#4A4070]">past</div> : null}
        </div>
      </div>
    </div>
  );
}

function EclipseSeriesCard({
  series,
  referenceDate,
  variant,
}: {
  series: EclipseSeries;
  referenceDate: string;
  variant: SeriesFilter;
}) {
  const hitsByDate = useMemo(() => {
    const map = new Map<string, NatalHit[]>();
    for (const eclipse of series.allEclipses) {
      const matches = hitsForEclipse(eclipse.date, series.natalHits);
      if (matches.length > 0) {
        map.set(eclipse.date, matches);
      }
    }
    return map;
  }, [series.allEclipses, series.natalHits]);

  const houseLabel = HOUSE_AXIS_LABELS[series.axis] ?? `Houses ${series.axis}`;
  const zodiacLabel = series.zodiacAxis ? ZODIAC_AXIS_LABELS[series.zodiacAxis] : undefined;
  const vipCount = series.natalHits.filter((hit) => hit.isVipAspect).length;

  const borderColor =
    variant === "active"
      ? "rgba(149,133,204,0.35)"
      : variant === "upcoming"
        ? "rgba(96,128,192,0.3)"
        : "rgba(46,38,84,0.5)";
  const backgroundColor =
    variant === "active"
      ? "rgba(149,133,204,0.07)"
      : variant === "upcoming"
        ? "rgba(96,128,192,0.06)"
        : "rgba(19,15,39,0.75)";
  const glowStyle =
    variant === "active" ? { boxShadow: "0 0 24px rgba(149,133,204,0.12)" } : {};

  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{ background: backgroundColor, border: `1px solid ${borderColor}`, ...glowStyle }}
    >
      <div className="px-5 py-4 border-b border-[#2E2654]/60">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  color: series.axisColor,
                  background: `${series.axisColor}22`,
                  border: `1px solid ${series.axisColor}55`,
                }}
              >
                {houseLabel}
              </span>
              <span className="text-xs text-[#6E6296] font-mono">{series.seriesId}</span>
            </div>
            {zodiacLabel && series.zodiacAxis !== series.axis ? (
              <p className="text-xs text-[#8C7FAE] mt-1">{zodiacLabel}</p>
            ) : null}
            <p className="text-sm text-[#C0B0E0] mt-1">{formatRange(series.seriesStart, series.seriesEnd)}</p>
            <p className="text-xs text-[#8C7FAE] mt-1">
              Last axis touch {formatDate(series.lastAxisTouch)}
              {series.lifetimeTotal && series.lifetimeTotal > 1 && series.lifetimeNumber
                ? ` · Series ${series.lifetimeNumber} of ${series.lifetimeTotal} on this axis`
                : ""}
            </p>
          </div>

          <SeriesStats
            eclipseCount={series.allEclipses.length}
            natalCount={series.natalHits.length}
            vipCount={vipCount}
          />
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6E6296]">All eclipses in series</p>
        {series.allEclipses.length === 0 ? (
          <p className="text-sm text-[#8C7FAE]">No dated eclipses were returned for this series.</p>
        ) : (
          <div className="space-y-2">
            {series.allEclipses.map((eclipse) => (
              <EclipseRow
                key={`${eclipse.date}-${eclipse.type}`}
                eclipse={eclipse}
                hits={hitsByDate.get(eclipse.date) ?? []}
                referenceDate={referenceDate}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SeriesStats({
  eclipseCount,
  natalCount,
  vipCount,
}: {
  eclipseCount: number;
  natalCount: number;
  vipCount: number;
}) {
  return (
    <div className="text-right text-xs text-[#8C7FAE]">
      <SeriesStat value={eclipseCount} label="eclipses in series" />
      <SeriesStat value={natalCount} label="natal contacts" />
      {vipCount > 0 ? <SeriesStat value={vipCount} label="VIP aspects" accent="#F4C430" /> : null}
    </div>
  );
}

type SeriesFilter = "active" | "upcoming" | "past";

function classifySeries(series: EclipseSeries, referenceDate: string): SeriesFilter {
  if (series.lastAxisTouch < referenceDate) return "past";
  if (series.seriesStart > referenceDate) return "upcoming";
  return "active";
}

function SeriesList({
  series,
  referenceDate,
  seriesFilter,
}: {
  series: EclipseSeries[];
  referenceDate: string;
  seriesFilter: SeriesFilter;
}) {
  const visibleSeries = series.filter((item) => classifySeries(item, referenceDate) === seriesFilter);

  if (visibleSeries.length === 0) {
    return (
      <p className="text-center py-12 text-sm" style={{ color: "#4A4070" }}>
        {seriesFilter === "active"
          ? "No active eclipse series right now."
          : seriesFilter === "upcoming"
            ? "No upcoming eclipse series in the scan window."
            : "No past eclipse series found."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {visibleSeries.map((item) => (
        <EclipseSeriesCard
          key={item.seriesId}
          series={item}
          referenceDate={referenceDate}
          variant={seriesFilter}
        />
      ))}
    </div>
  );
}

function EclipseSeriesFilterBar({
  seriesFilter,
  setSeriesFilter,
  activeCount,
  upcomingCount,
  pastCount,
}: {
  seriesFilter: SeriesFilter;
  setSeriesFilter: (filter: SeriesFilter) => void;
  activeCount: number;
  upcomingCount: number;
  pastCount: number;
}) {
  return (
    <div className="flex gap-2">
      {(["active", "upcoming", "past"] as SeriesFilter[]).map((filter) => {
        const count =
          filter === "active" ? activeCount : filter === "upcoming" ? upcomingCount : pastCount;
        const isSelected = seriesFilter === filter;
        const accentColor =
          filter === "active" ? "#9585CC" : filter === "upcoming" ? "#6080C0" : "#A89070";

        return (
          <button
            key={filter}
            type="button"
            onClick={() => setSeriesFilter(filter)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={
              isSelected
                ? {
                    background: `${accentColor}22`,
                    color: accentColor,
                    border: `1px solid ${accentColor}44`,
                  }
                : {
                    background: "rgba(19,15,39,0.6)",
                    color: "#4A4070",
                    border: "1px solid rgba(46,38,84,0.5)",
                  }
            }
          >
            <span className="capitalize">{filter}</span>
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
  );
}

export default function EclipsesPage() {
  const [series, setSeries] = useState<EclipseSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seriesFilter, setSeriesFilter] = useState<SeriesFilter>("active");

  const reloadKey = useAstrolearnSubjectReload();
  const { referenceDate } = useAstrolearnSessionTime();

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/astrolearn/eclipses?date=${referenceDate}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setSeries(Array.isArray(d.data) ? d.data : []);
      })
      .catch(() => setError("Failed to load eclipse series"))
      .finally(() => setLoading(false));
  }, [reloadKey, referenceDate]);

  const activeSeries = series.filter((item) => classifySeries(item, referenceDate) === "active");
  const upcomingSeries = series.filter((item) => classifySeries(item, referenceDate) === "upcoming");
  const pastSeries = series.filter((item) => classifySeries(item, referenceDate) === "past");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#9585CC] border-t-transparent animate-spin" />
        <p className="text-[#8C7FAE] text-sm">Calculating eclipse series…</p>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Eclipse Series</h1>
        <p className="text-sm text-[#8C7FAE] mt-1">
          Full axis cycles with every eclipse date and natal VIP contacts for the reference date.
        </p>
      </div>

      {series.length === 0 ? (
        <div
          className="rounded-2xl px-6 py-12 text-center"
          style={{ background: "rgba(19,15,39,0.7)", border: "1px solid rgba(46,38,84,0.5)" }}
        >
          <p className="text-[#8C7FAE] text-sm">No eclipse series overlap the current reference window.</p>
        </div>
      ) : (
        <>
          <EclipseSeriesFilterBar
            seriesFilter={seriesFilter}
            setSeriesFilter={setSeriesFilter}
            activeCount={activeSeries.length}
            upcomingCount={upcomingSeries.length}
            pastCount={pastSeries.length}
          />
          <SeriesList series={series} referenceDate={referenceDate} seriesFilter={seriesFilter} />
        </>
      )}
    </div>
  );
}
