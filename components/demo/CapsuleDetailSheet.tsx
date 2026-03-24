"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Fire, CalendarMonth, Lightbulb, ChevronDown, ArrowRight, ShareNodes } from "flowbite-react-icons/outline";
import { ShareSignalCard } from "./ShareSignalCard";
import { getPersonalizedText, type PersonalizedText } from "@/lib/openai-personalize";
import { getUserProfileSync } from "@/lib/user-profile";
import { getBirthDataSync } from "@/lib/birth-data";
import { getObservedProfileSync, trackCapsuleOpen, trackDomainClick, trackDomainReadTime } from "@/lib/observed-profile";
import { buildEffectiveProfile, needsRefresh, getStaleFields } from "@/lib/effective-profile";
import { FeedbackThumb } from "@/components/demo/FeedbackThumb";
import { PremiumBlur } from "@/components/demo/PremiumBlur";
import { isPremium } from "@/lib/premium-gate";
import { MicroRefresh } from "@/components/demo/MicroRefresh";
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
  getTopicsNarrative,
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
    isVipTransit?: boolean;
    windowStart?: string;
    windowEnd?: string;
    exactDates?: string[];
    parileDate?: string;
    isReturn?: boolean;
    isHalfReturn?: boolean;
    stationType?: string;
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
  isFuture,
  onClose,
}: {
  capsule: CapsuleData;
  isFuture?: boolean;
  onClose: () => void;
}) {
  // Gate: blur AI sections for free users on future capsules
  const shouldBlurAi = (isFuture ?? capsule.isFuture) && !isPremium();
  const [showMore, setShowMore] = useState(false);
  const [aiText, setAiText] = useState<PersonalizedText | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showRefresh, setShowRefresh] = useState<"stressLevel" | "currentGoal" | null>(null);
  const [showShare, setShowShare] = useState(false);
  const openedAt = useState(() => Date.now())[0];

  // Dismiss on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Track capsule open + domain click (observed profile)
  // After 3 opens, trigger PersonalizeFlow if profile is incomplete
  useEffect(() => {
    trackCapsuleOpen().then((count) => {
      if (count === 3) {
        const profile = getUserProfileSync();
        if (!profile?.lifePhase) {
          // User has priorities from onboarding but not full profile yet
          // Trigger PersonalizeFlow via custom event
          window.dispatchEvent(new CustomEvent("unfold:show-personalize"));
        }
      }
    });
    const domain = capsule.phases[0]?.domain;
    if (domain) trackDomainClick(domain, capsule.id);
  }, [capsule]);

  // Track read time on unmount
  useEffect(() => {
    return () => {
      const domain = capsule.phases[0]?.domain;
      if (domain) trackDomainReadTime(domain, capsule.id, Date.now() - openedAt);
    };
  }, [capsule, openedAt]);

  // Check if volatile fields need refresh
  useEffect(() => {
    const profile = getUserProfileSync();
    if (!profile) return;
    const stale = getStaleFields(profile);
    if (stale.stressLevel) setShowRefresh("stressLevel");
    else if (stale.currentGoal) setShowRefresh("currentGoal");
  }, []);

  // Load personalized AI text (using effective profile)
  const loadAiText = useCallback(async () => {
    const declaredProfile = getUserProfileSync();
    const birthData = getBirthDataSync();
    if (!declaredProfile || !birthData) return;

    // Build effective profile from declared + observed
    const observed = getObservedProfileSync();
    const userProfile = buildEffectiveProfile(declaredProfile, observed);

    setAiLoading(true);
    try {
      const phase = capsule.phases[0] as import("@/types/momentum").MomentumPhase | undefined;
      const capsuleContext = {
        tier: capsule.tier,
        isCurrent: capsule.isCurrent,
        isFuture: capsule.isFuture,
        planets: capsule.planets,
        score: phase?.score,
        domain: phase?.domain,
        apiLabel: phase?.apiLabel,
        apiCategory: phase?.apiCategory,
        transitPlanet: phase?.transitPlanet,
        natalPoint: phase?.natalPoint,
        aspect: phase?.aspect,
        apiTopics: phase?.apiTopics,
        startDate: capsule.startDate.toISOString(),
        endDate: capsule.endDate.toISOString(),
        lifetimeNumber: phase?.lifetimeNumber,
        lifetimeTotal: phase?.lifetimeTotal,
        isVipTransit: phase?.isVipTransit,
        durationWeeks: phase?.durationWeeks,
      };
      const result = await getPersonalizedText(
        capsule.id,
        capsuleContext,
        userProfile,
        birthData.placeOfBirth ?? "",
        "fr",
        phase?.boudinIndex,
        phase?.boudinId
      );
      if (result) setAiText(result);
    } catch {
      // Silently fail — fallback to template text
    } finally {
      setAiLoading(false);
    }
  }, [capsule]);

  useEffect(() => {
    loadAiText();
  }, [loadAiText]);

  const phase = capsule.phases[0];
  const tc = getTimeContext(capsule.isCurrent, capsule.isFuture);
  const tierLabel = getTierLabel(capsule.tier);
  const domain = phase?.domain ?? "work";
  const house = domainKeyToHouse(domain);
  const houseMeta = houseConfig[house];
  const houseColor = capsule.color ?? houseMeta?.color ?? "var(--accent-purple)";
  const progress = getProgressPercent(capsule.startDate, capsule.endDate);
  const duration = formatDuration(capsule.startDate, capsule.endDate);
  // Client-computed count by planet signature (how many times same planet combo repeats)
  const rarityText = getRarityText(capsule.tierOccurrence, capsule.tierTotal, capsule.tier);
  const domainNarrative = getDomainNarrative(domain, tc.context);
  const transitNarrative = getTransitNarrative(phase);
  const planetNarrative = transitNarrative || getPlanetNarrative(capsule.planets);
  const topicsNarrative = getTopicsNarrative(phase?.apiTopics, tc.context);
  const cycleNarrative = getCycleNarrative(phase);
  const lifetimeNarrative = getLifetimeNarrative(phase);
  const guidance = getContextualGuidance(domain, tc.context, phase?.guidance, phase?.peakMoment, phase?.apiTopics);

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

        {/* ── Micro-refresh (stale volatile fields) ── */}
        {showRefresh && (
          <MicroRefresh
            field={showRefresh}
            onDone={() => {
              // After stress, check if goal also needs refresh
              if (showRefresh === "stressLevel") {
                const p = getUserProfileSync();
                const stale = getStaleFields(p);
                setShowRefresh(stale.currentGoal ? "currentGoal" : null);
              } else {
                setShowRefresh(null);
              }
              // Reload AI text with fresh profile
              loadAiText();
            }}
          />
        )}

        {/* ── Section 2: Hero — Tier + Score + Rarity + Dates ── */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: "var(--accent-purple)" }}
            >
              {tierLabel}
            </span>
            {phase?.score && (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold tabular-nums"
                style={{
                  background: `color-mix(in srgb, ${houseColor} 15%, transparent)`,
                  color: houseColor,
                }}
              >
                {phase.score}/4
              </span>
            )}
          </div>

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

        {/* ── Section 3: Life Areas — fluid phrase with color dots ── */}
        {phase?.apiTopics && phase.apiTopics.length > 0 ? (
          <div className="mb-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {phase.apiTopics.map((topic: { house: number; color: string; topic: string }, i: number) => {
                const hm = houseConfig[topic.house as HouseNumber];
                return hm ? (
                  <div key={i} className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                    style={{
                      background: `color-mix(in srgb, ${topic.color} 10%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${topic.color} 20%, transparent)`,
                    }}>
                    <div className="h-2 w-2 rounded-full" style={{ background: topic.color }} />
                    <span className="text-[11px] font-medium" style={{ color: topic.color }}>{hm.label}</span>
                  </div>
                ) : null;
              })}
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-body-subtle)" }}>
              {topicsNarrative}
            </p>
          </div>
        ) : houseMeta ? (
          <div className="mb-5">
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 w-fit mb-2"
              style={{
                background: `color-mix(in srgb, ${houseColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${houseColor} 20%, transparent)`,
              }}>
              <div className="h-2 w-2 rounded-full" style={{ background: houseColor }} />
              <span className="text-[11px] font-medium" style={{ color: houseColor }}>{houseMeta.label}</span>
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-body-subtle)" }}>
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
        {phase && (shouldBlurAi ? (
          <div className="mb-5">
            <PremiumBlur feature="ai" blurAmount={10}>
              <div className="px-1 py-2">
                <span
                  className="text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--accent-purple)" }}
                >
                  {tc.storyLabel}
                </span>
                <h3 className="mt-1.5 text-lg font-semibold leading-tight" style={{ color: "var(--text-heading)" }}>
                  {phase.title}
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--text-body)" }}>
                  {phase.description}
                </p>
              </div>
            </PremiumBlur>
          </div>
        ) : (
          <div className="mb-5">
            <span
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--accent-purple)" }}
            >
              {tc.storyLabel}
            </span>
            <h3 className="mt-1.5 text-lg font-semibold leading-tight" style={{ color: "var(--text-heading)" }}>
              {phase.title}
            </h3>
            {/* Show translated API label — the real transit name */}
            {phase.apiLabel && (
              <p className="mt-1 text-[11px] font-medium" style={{ color: houseColor, opacity: 0.8 }}>
                {translateApiLabel(phase.apiLabel)}
              </p>
            )}
            {phase.subtitle && !phase.apiLabel && (
              <p className="mt-1 text-xs" style={{ color: "var(--text-body-subtle)" }}>
                {phase.subtitle}
              </p>
            )}
            <AnimatePresence mode="wait">
              <motion.p
                key={aiText?.story ? "ai" : "template"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 text-[13px] leading-relaxed"
                style={{ color: "var(--text-body)" }}
              >
                {aiText?.story ?? phase.description}
              </motion.p>
            </AnimatePresence>
            {aiText && !aiLoading && (
              <motion.p
                className="mt-1.5 text-[9px] font-medium uppercase tracking-wider"
                style={{ color: "var(--accent-purple)", opacity: 0.4 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Personnalisé pour toi
              </motion.p>
            )}
            {aiLoading && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full animate-pulse" style={{ background: "var(--accent-purple)" }} />
                <span className="text-[9px]" style={{ color: "var(--text-body-subtle)" }}>Personnalisation...</span>
              </div>
            )}
          </div>
        ))}

        {/* ── Section 6: Insight Card + Cycle Info ── */}
        {phase?.keyInsight && (shouldBlurAi ? (
          <div className="mb-4">
            <PremiumBlur feature="ai" blurAmount={10}>
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))" }}
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
            </PremiumBlur>
          </div>
        ) : (
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
            <AnimatePresence mode="wait">
              <motion.p
                key={aiText?.insight ? "ai" : "template"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-body)" }}
              >
                {aiText?.insight ?? phase.keyInsight}
              </motion.p>
            </AnimatePresence>
          </div>
        ))}

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
        {shouldBlurAi ? (
          <div className="mb-4">
            <PremiumBlur feature="ai" blurAmount={10}>
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))" }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowRight size={12} style={{ color: "var(--accent-purple)" }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
                    Pour vous préparer
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
                  {guidance}
                </p>
              </div>
            </PremiumBlur>
          </div>
        ) : (
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
            <AnimatePresence mode="wait">
              <motion.p
                key={aiText?.guidance ? "ai" : "template"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-body)" }}
              >
                {aiText?.guidance ?? guidance}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

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

        {/* ── Feedback + Share ── */}
        {aiText && (
          <div className="flex items-center justify-end gap-3 mb-3">
            {!capsule.isFuture && (
              <button
                type="button"
                onClick={() => setShowShare(true)}
                className="flex items-center justify-center h-7 w-7 rounded-full transition-opacity duration-200"
                style={{
                  color: "var(--text-body-subtle)",
                  opacity: 0.3,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.3"; }}
              >
                <ShareNodes size={14} />
              </button>
            )}
            <FeedbackThumb capsuleId={capsule.id} />
          </div>
        )}

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
                {capsule.tierOccurrence > 0 && (
                  <DetailRow
                    label="Occurrence"
                    value={`${capsule.tierOccurrence}e ${getTierLabel(capsule.tier).toLowerCase()} sur ${capsule.tierTotal}`}
                  />
                )}
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
                {phase?.isReturn && (
                  <DetailRow label="Retour" value={phase?.isHalfReturn ? "Demi-retour" : "Retour complet"} />
                )}
                {phase?.stationType && (
                  <DetailRow label="Station" value={phase.stationType === "SR" ? "Reprise directe" : "Pause rétrograde"} />
                )}
                {phase?.windowStart && phase?.windowEnd && (
                  <DetailRow label="Fenêtre" value={`${phase.windowStart} → ${phase.windowEnd}`} />
                )}
                {phase?.markers && phase.markers.length > 0 && (
                  <DetailRow label="Marqueurs" value={phase.markers.map((m: string) =>
                    m === "LB" ? "Pivot de vie (LB)" :
                    m === "Cu" ? "Culmination (Cu)" :
                    m === "pre-LB" ? "Pré-pivot (pre-LB)" : m
                  ).join(", ")} />
                )}
                {phase?.cycle && phase.cycle.totalHits > 1 && (
                  <>
                    <DetailRow label="Passage" value={`${phase.cycle.hitNumber} / ${phase.cycle.totalHits}`} />
                    {phase.cycle.pattern && (
                      <DetailRow label="Schéma" value={phase.cycle.pattern} />
                    )}
                  </>
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

      {/* ── Share Signal Card Overlay ── */}
      <AnimatePresence>
        {showShare && (
          <ShareSignalCard capsule={capsule} onClose={() => setShowShare(false)} />
        )}
      </AnimatePresence>
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
