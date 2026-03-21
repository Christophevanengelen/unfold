"use client";

/**
 * EventDetailSheet — Bottom sheet showing full event details on tap.
 *
 * Each event category gets tailored display:
 * - Transit: planet, aspect, all passes, VIP flag, parile date
 * - Eclipse: axis, series, star badge, natal point
 * - ZR: lot type, period sign, markers, culmination
 * - Station: planet, direction, orb
 */

import { motion } from "motion/react";
import type {
  AnyTocTocEvent, TransitEvent, EclipseEvent, ZREvent, StationEvent,
} from "@/types/api";
import { tocScoreConfig, categoryConfig, formatDateRange, zrLotLabels } from "@/lib/domain-config";
import { mockNatalContext } from "@/lib/mock-data";

interface Props {
  event: AnyTocTocEvent;
  onClose: () => void;
}

export function EventDetailSheet({ event, onClose }: Props) {
  const scoreMeta = tocScoreConfig[event.score];
  const catMeta = categoryConfig[event.category];

  // Find topics from natal context
  const natalPoint = "natalPoint" in event ? (event as TransitEvent).natalPoint : null;
  const topics = natalPoint ? mockNatalContext[natalPoint]?.topics ?? [] : [];

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Sheet */}
      <motion.div
        className="relative z-10 rounded-t-3xl border-t border-white/10 bg-bg-primary"
        style={{ maxHeight: "75%" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-8 rounded-full bg-white/20" />
        </div>

        <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(75vh - 40px)" }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: event.color }}
                >
                  {catMeta.label}
                </span>
                {/* Score dots */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: event.score }).map((_, i) => (
                    <div key={i} className="h-2 w-2 rounded-full" style={{ backgroundColor: event.color }} />
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold text-text-heading leading-snug">
                {event.type}
              </h3>
              <p className="mt-1 text-xs text-text-body-subtle">
                {formatDateRange(event.date, event.endDate)} — {scoreMeta.label}
              </p>
            </div>
          </div>

          {/* Topics (life domains affected) */}
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-4">
              {topics.map(topic => (
                <span
                  key={topic}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-text-body"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Category-specific details */}
          <div className="space-y-3 border-t border-white/5 pt-4">
            {event.category === "transit" && <TransitDetails event={event as TransitEvent} />}
            {event.category === "eclipse" && <EclipseDetails event={event as EclipseEvent} />}
            {event.category === "zr" && <ZRDetails event={event as ZREvent} />}
            {event.category === "station" && <StationDetails event={event as StationEvent} />}
          </div>

          {/* Intensity score visualization */}
          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-body-subtle">Intensité</span>
              <span className="text-xs font-bold text-text-heading">
                {Math.abs(event.intensityScore).toLocaleString()}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (Math.abs(event.intensityScore) / 63000) * 100)}%`,
                  backgroundColor: event.intensityScore > 0 ? event.color : "#EF4444",
                }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-text-body-subtle">
              {event.intensityScore > 0 ? "Aspect fluide (conjonction/trigone)" : "Aspect de tension (carré/opposition)"}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Transit Details ────────────────────────────────────

function TransitDetails({ event }: { event: TransitEvent }) {
  return (
    <>
      <DetailRow label="Date exacte" value={formatDate(event.parileDate)} />
      <DetailRow label="Fenêtre" value={`${formatDate(event.windowStart)} → ${formatDate(event.windowEnd)}`} />
      <DetailRow label="Orbe" value={`${event.bestOrb.toFixed(2)}°`} />
      {event.exactDates.length > 1 && (
        <div>
          <span className="text-[10px] text-text-body-subtle">Passages ({event.pattern})</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {event.exactDates.map((d, i) => (
              <span key={d} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-text-body">
                {i + 1}/{event.exactDates.length} — {formatDate(d)}
              </span>
            ))}
          </div>
        </div>
      )}
      {event.isVipTransit && <DetailBadge label="VIP Transit" color={event.color} description="Planète lente sur point natal personnel" />}
      {event.isReturn && <DetailBadge label="Retour planétaire" color="#EAB308" description="La planète revient à sa position natale" />}
    </>
  );
}

// ─── Eclipse Details ────────────────────────────────────

function EclipseDetails({ event }: { event: EclipseEvent }) {
  return (
    <>
      <DetailRow label="Type" value={event.eclipseType === "solar" ? "Éclipse solaire" : "Éclipse lunaire"} />
      <DetailRow label="Signe" value={event.eclipseSign} />
      <DetailRow label="Axe" value={`Maisons ${event.eclipseAxis}`} accent={event.axisColor} />
      <DetailRow label="Point natal" value={event.natalPoint} />
      <DetailRow label="Orbe" value={`${event.orb.toFixed(1)}°`} />
      <DetailRow label="Série" value={`${formatDate(event.eclipseSeriesStart)} → ${formatDate(event.eclipseSeriesEnd)}`} />
      {event.isVipAspect && (
        <DetailBadge label="&#9733; Impact fort" color="#EAB308" description="Éclipse à moins de 5° d'un point natal important" />
      )}
    </>
  );
}

// ─── ZR Details ─────────────────────────────────────────

function ZRDetails({ event }: { event: ZREvent }) {
  const lotLabel = Array.isArray(event.lotType)
    ? event.lotType.map(l => zrLotLabels[l] ?? l).join(" + ")
    : zrLotLabels[event.lotType] ?? event.lotType;

  return (
    <>
      <DetailRow label="Type de pic" value={lotLabel} />
      <DetailRow label="Niveau" value={`L${event.level} — ${event.level === 2 ? "Pic majeur" : "Pic secondaire"}`} />
      <DetailRow label="Signe" value={event.periodSign} />
      {event.isCulmination && <DetailBadge label="Culmination" color="#059669" description="Point culminant du cycle" />}
      {event.markers.includes("LB") && <DetailBadge label="Bascule (Loosening of Bond)" color="#EAB308" description="Transition majeure dans ce domaine" />}
      {event.markers.includes("pre-LB") && <DetailBadge label="Pré-bascule" color="#EAB308" description="Phase préparatoire avant la transition" />}
    </>
  );
}

// ─── Station Details ────────────────────────────────────

function StationDetails({ event }: { event: StationEvent }) {
  return (
    <>
      <DetailRow label="Planète" value={event.transitPlanet} />
      <DetailRow label="Direction" value={event.stationType === "SD" ? "Station rétrograde" : "Station directe"} />
      <DetailRow label="Point natal" value={event.natalPoint} />
      <DetailRow label="Orbe" value={`${event.orb.toFixed(1)}°`} />
    </>
  );
}

// ─── Shared Components ──────────────────────────────────

function DetailRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-text-body-subtle">{label}</span>
      <span className="text-[11px] font-medium text-text-body" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
    </div>
  );
}

function DetailBadge({ label, color, description }: { label: string; color: string; description: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
      <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
      <p className="mt-0.5 text-[10px] text-text-body-subtle">{description}</p>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
