"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Fire, CalendarMonth, Lightbulb, ChevronDown, ArrowRight } from "flowbite-react-icons/outline";
import {
  planetConfig,
  houseConfig,
  type PlanetKey,
} from "@/lib/domain-config";
import {
  getTimeContext,
  getTierLabel,
  domainKeyToHouse,
  getDomainNarrative,
  getPlanetNarrative,
  getTransitNarrative,
  getCycleNarrative,
  getLifetimeNarrative,
  translateApiLabel,
  formatDuration,
  getProgressPercent,
  getRarityText,
  getContextualGuidance,
  type TimeContext,
} from "@/lib/detail-helpers";
import type { HouseNumber } from "@/lib/domain-config";

// ─── Types (imported from timeline) ──────────────────────
interface CapsuleData {
  id: string;
  phases: {
    id: string;
    domain: string;
    title: string;
    subtitle: string;
    description: string;
    intensity: number;
    score?: number;
    planets: PlanetKey[];
    status: string;
    keyInsight?: string;
    peakMoment?: string;
    guidance?: string;
    color?: string;
    startDate: string;
    endDate?: string;
    durationWeeks: number;
    // Raw API fields
    apiLabel?: string;
    apiCategory?: string;
    transitPlanet?: string;
    natalPoint?: string;
    aspect?: string;
    cycle?: { hitNumber: number; totalHits: number; pattern: string; allHits: { date: string; hitNumber: number }[] };
    apiTopics?: { house: number; color: string; topic: string; source: string }[];
    lotType?: string;
    zrLevel?: number;
    periodSign?: string;
    markers?: string[];
    eclipseType?: string;
    lifetimeNumber?: number;
    lifetimeTotal?: number;
    isVipTransit?: boolean;
  }[];
  domains: { domain: string; intensity: number; occurrence: number; totalOccurrences: number }[];
  planets: PlanetKey[];
  startDate: Date;
  endDate: Date;
  lane: number;
  tier: "toc" | "toctoc" | "toctoctoc";
  tierOccurrence: number;
  tierTotal: number;
  isCurrent: boolean;
  isFuture: boolean;
  color?: string;
}

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

// ─── Context Banner Icons ────────────────────────────────
function BannerIcon({ icon, size = 14 }: { icon: string; size?: number }) {
  if (icon === "bolt") return <Fire size={size} />;
  if (icon === "calendar") return <CalendarMonth size={size} />;
  return <Clock size={size} />;
}

// ─── Main Component ──────────────────────────────────────
export function CapsuleDetailSheet({
  capsule,
  onClose,
}: {
  capsule: CapsuleData;
  onClose: () => void;
}) {
  const [showMore, setShowMore] = useState(false);

  // Dismiss on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const phase = capsule.phases[0];
  const tc = getTimeContext(capsule.isCurrent, capsule.isFuture);
  const tierLabel = getTierLabel(capsule.tier);
  const domain = phase?.domain ?? "work";
  const house = domainKeyToHouse(domain);
  const houseMeta = houseConfig[house];
  const houseColor = capsule.color ?? houseMeta?.color ?? "var(--accent-purple)";
  const progress = getProgressPercent(capsule.startDate, capsule.endDate);
  const duration = formatDuration(capsule.startDate, capsule.endDate);
  const rarityText = getRarityText(capsule.tierOccurrence, capsule.tierTotal, capsule.tier);
  const domainNarrative = getDomainNarrative(domain, tc.context);
  const transitNarrative = getTransitNarrative(phase);
  const planetNarrative = transitNarrative || getPlanetNarrative(capsule.planets);
  const cycleNarrative = getCycleNarrative(phase);
  const lifetimeNarrative = getLifetimeNarrative(phase);
  const guidance = getContextualGuidance(domain, tc.context, phase?.guidance, phase?.peakMoment);

  // Date formatting — exact day/month/year, always show start → end
  const startLabel = `${capsule.startDate.getDate()} ${MONTH_NAMES[capsule.startDate.getMonth()]} ${capsule.startDate.getFullYear()}`;
  const endDateLabel = `${capsule.endDate.getDate()} ${MONTH_NAMES[capsule.endDate.getMonth()]} ${capsule.endDate.getFullYear()}`;
  const endLabel = capsule.isCurrent ? "maintenant" : endDateLabel;
  const dateLabel = tc.context === "future"
    ? `Prévu ${startLabel} — ${endDateLabel}`
    : tc.context === "current"
      ? `${startLabel} — ${endDateLabel}`
      : `${startLabel} — ${endDateLabel}`;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className="absolute inset-x-0 bottom-0 z-50 flex flex-col"
      style={{
        borderRadius: "1.5rem 1.5rem 0 0",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-muted)",
        maxHeight: "85%",
      }}
    >
      {/* ── Section 0: Drag handle ── */}
      <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full" style={{ background: "var(--border-base)" }} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-20">

        {/* ── Section 1: Context Banner ── */}
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5 mb-4"
          style={{
            background: `color-mix(in srgb, ${houseColor} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${houseColor} 20%, transparent)`,
            width: "fit-content",
          }}
        >
          <div style={{ color: houseColor }}>
            <BannerIcon icon={tc.bannerIcon} size={12} />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: houseColor }}>
            {tc.bannerLabel}
          </span>
          {tc.context === "current" && (
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: houseColor }}
            />
          )}
        </div>

        {/* ── Section 2: Hero — Tier + Rarity + Dates ── */}
        <div className="mb-5">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--accent-purple)" }}
          >
            {tierLabel}
          </span>

          {rarityText && (
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className="text-3xl font-bold tabular-nums font-display"
                style={{ color: "var(--text-heading)" }}
              >
                {capsule.tierOccurrence}
                <span className="text-sm font-normal align-super" style={{ color: "var(--text-body-subtle)" }}>e</span>
              </span>
              <span className="text-xs" style={{ color: "var(--text-body-subtle)" }}>
                {rarityText}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] tabular-nums" style={{ color: "var(--text-body-subtle)" }}>
              {dateLabel}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-medium"
              style={{
                background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)",
                color: "var(--accent-purple)",
              }}
            >
              {duration}
            </span>
          </div>
        </div>

        {/* ── Section 3: Life Areas Activated (from API topics or fallback) ── */}
        {phase?.apiTopics && phase.apiTopics.length > 0 ? (
          <div className="space-y-2 mb-5">
            {phase.apiTopics.map((topic, i) => {
              const hm = houseConfig[topic.house as HouseNumber];
              return hm ? (
                <div key={i} className="rounded-xl p-3" style={{
                  background: "color-mix(in srgb, var(--bg-tertiary) 80%, transparent)",
                  borderLeft: `3px solid ${topic.color}`,
                }}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ background: `color-mix(in srgb, ${topic.color} 15%, transparent)` }}>
                      <span className="text-[9px]" style={{ color: topic.color }}>{topic.house}</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-heading)" }}>{hm.label}</span>
                    <span className="text-[9px]" style={{ color: "var(--text-body-subtle)" }}>{hm.description}</span>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : houseMeta ? (
          <div
            className="rounded-xl p-4 mb-5"
            style={{
              background: "color-mix(in srgb, var(--bg-tertiary) 80%, transparent)",
              borderLeft: `3px solid ${houseColor}`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{ background: `color-mix(in srgb, ${houseColor} 15%, transparent)` }}
              >
                <span className="text-[10px]" style={{ color: houseColor }}>
                  {house}
                </span>
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--text-heading)" }}>
                {houseMeta.label}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-body-subtle)" }}>
                {houseMeta.description}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-body)" }}>
              {domainNarrative}
            </p>
          </div>
        ) : null}

        {/* ── Section 4: Planet pills + narrative ── */}
        <div className="mb-5">
          <div className="flex flex-wrap gap-2">
            {capsule.planets.map((planet) => {
              const pc = planetConfig[planet];
              const isSolarEclipse = planet === "solar-eclipse";
              return (
                <motion.div
                  key={planet}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{
                    background: `color-mix(in srgb, ${pc.color} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${pc.color} 25%, transparent)`,
                  }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: isSolarEclipse
                        ? "linear-gradient(135deg, #1a1a1a 45%, #C9A86C 55%)"
                        : pc.color,
                      boxShadow: isSolarEclipse
                        ? "0 0 6px rgba(201, 168, 108, 0.5)"
                        : `0 0 6px ${pc.color}`,
                    }}
                  />
                  <span className="text-[11px] font-medium" style={{ color: pc.color }}>
                    {pc.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
          {planetNarrative && (
            <p className="mt-3 text-[12px] leading-relaxed italic" style={{ color: "var(--text-body-subtle)" }}>
              {planetNarrative}
            </p>
          )}
        </div>

        {/* ── Section 5: Story — title + description ── */}
        {phase && (
          <div className="mb-5">
            <span
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--accent-purple)" }}
            >
              {tc.storyLabel}
            </span>
            <h3 className="mt-1.5 text-lg font-semibold leading-tight" style={{ color: "var(--text-heading)" }}>
              {translateApiLabel(phase.apiLabel) || phase.title}
            </h3>
            {phase.subtitle && (
              <p className="mt-1 text-xs" style={{ color: "var(--text-body-subtle)" }}>
                {phase.subtitle}
              </p>
            )}
            <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--text-body)" }}>
              {phase.description}
            </p>
          </div>
        )}

        {/* ── Section 6: Insight Card + Cycle Info ── */}
        {phase?.keyInsight && (
          <div
            className="rounded-xl px-4 py-3 mb-4"
            style={{
              background: tc.context === "current"
                ? "color-mix(in srgb, var(--accent-purple) 10%, var(--bg-tertiary))"
                : "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb size={12} style={{ color: "var(--accent-purple)" }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
                {tc.insightLabel}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
              {phase.keyInsight}
            </p>
          </div>
        )}

        {cycleNarrative && (
          <div
            className="rounded-xl px-4 py-3 mb-4"
            style={{
              background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
                Cycle
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
              {cycleNarrative}
            </p>
          </div>
        )}

        {/* ── Section 7: Guidance / Reflection Card + Lifetime ── */}
        <div
          className="rounded-xl px-4 py-3 mb-4"
          style={{
            background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <ArrowRight size={12} style={{ color: "var(--accent-purple)" }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
              {tc.context === "past" ? "Avec le recul" : tc.context === "current" ? "En pratique" : "Pour vous préparer"}
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
            {guidance}
          </p>
        </div>

        {lifetimeNarrative && (
          <div
            className="rounded-xl px-4 py-3 mb-5"
            style={{
              background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
                Dans votre vie
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
              {lifetimeNarrative}
            </p>
          </div>
        )}

        {/* ── Section 8: Duration Progress Bar ── */}
        <div className="mb-5">
          <div className="relative h-1 w-full rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)" }}>
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: tc.context === "past"
                  ? `color-mix(in srgb, ${houseColor} 40%, transparent)`
                  : houseColor,
              }}
            />
            {tc.context === "current" && (
              <div
                className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full animate-pulse"
                style={{
                  left: `calc(${progress}% - 5px)`,
                  background: houseColor,
                  boxShadow: `0 0 8px ${houseColor}`,
                }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] tabular-nums" style={{ color: "var(--text-body-subtle)" }}>
              {startLabel}
            </span>
            <span className="text-[9px] tabular-nums" style={{ color: tc.context === "current" ? houseColor : "var(--text-body-subtle)" }}>
              {capsule.isCurrent ? "maintenant" : endLabel}
            </span>
          </div>
        </div>

        {/* ── Section 9: Collapsible More Details ── */}
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1.5 w-full py-2"
        >
          <motion.div animate={{ rotate: showMore ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} style={{ color: "var(--text-body-subtle)" }} />
          </motion.div>
          <span className="text-[10px] font-medium" style={{ color: "var(--text-body-subtle)" }}>
            Plus de détails
          </span>
        </button>

        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pb-4 pt-1">
                <DetailRow label="Score" value={`${phase?.score ?? "—"} / 4`} />
                <DetailRow label="Intensité" value={`${phase?.intensity ?? "—"} / 100`} />
                <DetailRow label="Durée" value={`${capsule.phases[0]?.durationWeeks ?? "—"} semaines`} />
                <DetailRow
                  label="Occurrence"
                  value={`${capsule.tierOccurrence}e ${getTierLabel(capsule.tier).toLowerCase()} sur ${capsule.tierTotal}`}
                />
                {phase?.apiCategory && (
                  <DetailRow label="Catégorie" value={phase.apiCategory} />
                )}
                {phase?.transitPlanet && phase?.natalPoint && (
                  <DetailRow label="Transit" value={`${phase.transitPlanet} → ${phase.natalPoint}`} />
                )}
                {phase?.aspect && (
                  <DetailRow label="Aspect" value={phase.aspect} />
                )}
                {phase?.isVipTransit && (
                  <DetailRow label="Statut" value="Transit VIP" />
                )}
                {phase?.markers && phase.markers.length > 0 && (
                  <DetailRow label="Marqueurs" value={phase.markers.join(", ")} />
                )}
                {phase?.cycle && phase.cycle.totalHits > 1 && (
                  <DetailRow label="Passage" value={`${phase.cycle.hitNumber} / ${phase.cycle.totalHits}`} />
                )}
                {phase?.lifetimeNumber && phase?.lifetimeTotal && (
                  <DetailRow label="Vie entière" value={`${phase.lifetimeNumber}e sur ${phase.lifetimeTotal}`} />
                )}
                {capsule.phases.length > 1 && (
                  <div className="mt-3">
                    <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
                      Signaux combinés
                    </span>
                    {capsule.phases.map((p, i) => (
                      <p key={i} className="text-[11px] mt-1" style={{ color: "var(--text-body-subtle)" }}>
                        {translateApiLabel(p.apiLabel) || p.title}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Detail Row ──────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[10px]" style={{ color: "var(--text-body-subtle)" }}>{label}</span>
      <span className="text-[10px] tabular-nums font-medium" style={{ color: "var(--text-body)" }}>{value}</span>
    </div>
  );
}
