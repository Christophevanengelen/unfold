"use client";

/**
 * SausageCard — The fundamental visual unit of Unfold.
 *
 * Each sausage represents one TocToc event:
 * - Transit: colored by planet, width by score, shows passes
 * - Eclipse: amber marker with axis badge, star if VIP
 * - ZR: emerald band, shows lot type + period
 * - Station: compact dot/marker
 *
 * The sausage maps directly to the API's event model.
 */

import { motion } from "motion/react";
import type { AnyTocTocEvent, TransitEvent, EclipseEvent, ZREvent, StationEvent } from "@/types/api";
import { tocScoreConfig, categoryConfig, formatDateRange, zrLotLabels } from "@/lib/domain-config";

interface SausageCardProps {
  event: AnyTocTocEvent;
  /** Compact mode for timeline (no description) */
  compact?: boolean;
  /** Called when tapped */
  onTap?: (event: AnyTocTocEvent) => void;
  /** Whether this is the "current/active" event */
  isHighlighted?: boolean;
}

export function SausageCard({ event, compact = false, onTap, isHighlighted }: SausageCardProps) {
  const scoreMeta = tocScoreConfig[event.score];
  const catMeta = categoryConfig[event.category];
  const width = scoreMeta.sausageWidth;

  // Event-specific rendering
  const renderContent = () => {
    switch (event.category) {
      case "transit":
        return <TransitContent event={event as TransitEvent} compact={compact} />;
      case "eclipse":
        return <EclipseContent event={event as EclipseEvent} compact={compact} />;
      case "zr":
        return <ZRContent event={event as ZREvent} compact={compact} />;
      case "station":
        return <StationContent event={event as StationEvent} compact={compact} />;
    }
  };

  return (
    <motion.button
      onClick={() => onTap?.(event)}
      className={`group relative flex flex-col rounded-2xl border transition-all ${
        isHighlighted
          ? "border-white/20 bg-white/[0.08] shadow-lg shadow-white/5"
          : event.isPast
            ? "border-white/5 bg-white/[0.03] opacity-60"
            : "border-white/10 bg-white/[0.05] hover:border-white/15 hover:bg-white/[0.07]"
      }`}
      style={{
        minWidth: compact ? width : "100%",
        maxWidth: compact ? width * 2.5 : "100%",
      }}
      whileTap={{ scale: 0.97 }}
      layout
    >
      {/* Score indicator — colored left bar */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
        style={{ backgroundColor: event.color }}
      />

      <div className={`flex flex-col ${compact ? "px-2.5 py-2" : "px-4 py-3"}`}>
        {/* Header: category + score badge */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: event.color, opacity: 0.8 }}
          >
            {catMeta.label}
          </span>
          <div className="flex items-center gap-1">
            {/* Toc dots */}
            {Array.from({ length: event.score }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: event.color }}
              />
            ))}
          </div>
        </div>

        {/* Content varies by category */}
        {renderContent()}

        {/* Date range */}
        {!compact && (
          <span className="mt-1.5 text-[10px] text-text-body-subtle">
            {formatDateRange(event.date, event.endDate)}
          </span>
        )}
      </div>
    </motion.button>
  );
}

// ─── Transit Content ────────────────────────────────────

function TransitContent({ event, compact }: { event: TransitEvent; compact: boolean }) {
  const passes = event.exactDates.length;

  return (
    <>
      <p className={`font-semibold text-text-heading ${compact ? "text-[11px] leading-tight" : "text-sm"}`}>
        {event.transitPlanet}
        <span className="text-text-body-subtle font-normal">
          {" "}{event.aspect}{" "}
        </span>
        {event.natalPoint}
      </p>

      {!compact && (
        <div className="mt-1 flex items-center gap-2">
          {event.isVipTransit && (
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-medium text-white/70">
              VIP
            </span>
          )}
          {passes > 1 && (
            <span className="text-[10px] text-text-body-subtle">
              {passes} passages ({event.pattern})
            </span>
          )}
          {event.isReturn && (
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">
              Retour
            </span>
          )}
        </div>
      )}
    </>
  );
}

// ─── Eclipse Content ────────────────────────────────────

function EclipseContent({ event, compact }: { event: EclipseEvent; compact: boolean }) {
  return (
    <>
      <div className="flex items-center gap-1.5">
        <p className={`font-semibold text-text-heading ${compact ? "text-[11px] leading-tight" : "text-sm"}`}>
          {event.eclipseType === "solar" ? "Solaire" : "Lunaire"}
        </p>
        {event.isVipAspect && (
          <span className="text-amber-400 text-sm">&#9733;</span>
        )}
      </div>

      {!compact && (
        <div className="mt-1 flex items-center gap-2">
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
            style={{ backgroundColor: event.axisColor + "30", color: event.axisColor }}
          >
            Axe {event.eclipseAxis}
          </span>
          <span className="text-[10px] text-text-body-subtle">
            {event.eclipseSign} — {event.natalPoint}
          </span>
        </div>
      )}
    </>
  );
}

// ─── ZR Content ─────────────────────────────────────────

function ZRContent({ event, compact }: { event: ZREvent; compact: boolean }) {
  const lotLabel = Array.isArray(event.lotType)
    ? event.lotType.map(l => zrLotLabels[l] ?? l).join(" + ")
    : zrLotLabels[event.lotType] ?? event.lotType;

  return (
    <>
      <p className={`font-semibold text-text-heading ${compact ? "text-[11px] leading-tight" : "text-sm"}`}>
        Pic {lotLabel}
      </p>

      {!compact && (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] text-text-body-subtle">
            L{event.level} — {event.periodSign}
          </span>
          {event.isCulmination && (
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
              Culmination
            </span>
          )}
          {event.markers.includes("LB") && (
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">
              Bascule
            </span>
          )}
        </div>
      )}
    </>
  );
}

// ─── Station Content ────────────────────────────────────

function StationContent({ event, compact }: { event: StationEvent; compact: boolean }) {
  return (
    <>
      <p className={`font-semibold text-text-heading ${compact ? "text-[11px] leading-tight" : "text-sm"}`}>
        {event.transitPlanet}
        <span className="text-text-body-subtle font-normal">
          {" "}{event.stationType === "SD" ? "rétrograde" : "directe"}
        </span>
      </p>

      {!compact && (
        <span className="mt-1 text-[10px] text-text-body-subtle">
          sur {event.natalPoint} (orbe {event.orb.toFixed(1)}°)
        </span>
      )}
    </>
  );
}
