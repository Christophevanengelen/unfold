"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ScoreRing } from "./ScoreRing";
import { TrendCurve } from "./TrendCurve";

import { formatDelta, getDeltaColor } from "@/lib/animations";
import { StructuredInsightCard } from "./StructuredInsightCard";
import { domainConfig, type DomainKey } from "@/lib/domain-config";
import type { StructuredInsight } from "@/types/api";

/** Consistent trend curve height across all pages */
const TREND_HEIGHT = 80;

interface DomainPageProps {
  domain: DomainKey;
  isActive: boolean;
  score: number;
  trend: string;
  delta: number;
  peakHour: number;
  description: string;
  structuredInsight: StructuredInsight;
  trendData: number[];
  cardWidth: number;
  onDetailTap: () => void;
  activeDayIndex?: number;
}

/**
 * Unified domain page — SAME hero format for all domains.
 * Unix aesthetic: thin strokes, large thin numbers, no glows, generous space.
 * Differentiation = COLOR, not chart type.
 * Uses centralized domain config — icons, colors, labels from one source.
 *
 * Layout: TrendCurve is absolutely positioned at a fixed offset from the
 * card bottom. It NEVER moves when switching time views. The insight card's
 * glass effect reveals the trend behind it. Hero fills remaining space.
 */

/** Fixed vertical center position for trend curve (% from card top) — same on ALL cards */
const TREND_CENTER_PCT = 60;

export function DomainPage({
  domain,
  isActive,
  score,
  trend,
  delta,
  peakHour,
  description,
  structuredInsight,
  trendData,
  cardWidth,
  onDetailTap,
  activeDayIndex,
}: DomainPageProps) {
  const config = domainConfig[domain];
  const peakLabel = `${peakHour > 12 ? peakHour - 12 : peakHour}${peakHour >= 12 ? "pm" : "am"}`;

  return (
    <div className="relative flex h-full flex-col">
      {/* === HERO SECTION === */}
      <div className="flex flex-col items-center pt-5">
        {/* Domain icon */}
        <div style={{ color: config.color }}>{config.icon()}</div>

        {/* Domain label */}
        <p
          className="mt-1.5 font-medium"
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            color: config.color,
          }}
        >
          {config.label}
        </p>

        {/* Score ring + BIG number */}
        <div className="mt-4">
          <ScoreRing
            score={score}
            color="var(--accent-purple)"
            size={160}
            isActive={isActive}
            delay={0.3}
            delta={delta}
          >
            <span
              className="font-display leading-none"
              style={{
                fontSize: 80,
                fontWeight: 300,
                letterSpacing: -4,
                color: "var(--accent-purple)",
              }}
            >
              <AnimatedNumber value={score} duration={1.8} delay={0.3} isActive={isActive} />
            </span>
          </ScoreRing>
        </div>

        {/* Trend + delta + description — fixed min-height prevents layout shift */}
        <div className="mt-4 flex min-h-[44px] flex-col items-center justify-center">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium capitalize"
              style={{ color: "var(--accent-purple)", opacity: 0.7 }}
            >
              {trend}
            </span>
            <span className={`text-sm font-semibold ${getDeltaColor(delta)}`}>
              {formatDelta(delta)}
            </span>
          </div>

          <p
            className="mt-1 text-xs"
            style={{ color: "var(--accent-purple)", opacity: 0.5 }}
          >
            Peak at {peakLabel} &middot; {description}
          </p>
        </div>
      </div>

      {/* Spacer — absorbs remaining vertical space */}
      <div className="flex-1" />

      {/* === BOTTOM CONTENT — insight + button, always at card bottom === */}
      <div className="relative shrink-0" style={{ zIndex: 2 }}>
        <StructuredInsightCard insight={structuredInsight} color={config.color} />

        {/* Explore button */}
        <div className="mt-2 px-4 pb-4">
          <button
            type="button"
            onClick={onDetailTap}
            className="w-full rounded-2xl py-3 text-xs font-medium transition-transform active:scale-[0.98]"
            style={{
              background: `color-mix(in srgb, var(--accent-purple) 12%, var(--bg-secondary))`,
              color: "var(--accent-purple)",
            }}
          >
            Explore
          </button>
        </div>
      </div>

      {/* === TREND CURVE — absolutely positioned, centered in gap, same on ALL cards === */}
      <div
        className="pointer-events-none absolute inset-x-0 overflow-visible"
        style={{
          top: `${TREND_CENTER_PCT}%`,
          transform: "translateY(-50%)",
          height: TREND_HEIGHT,
          zIndex: 1,
        }}
      >
        <TrendCurve
          data={trendData}
          color={config.color}
          width={cardWidth}
          height={TREND_HEIGHT}
          fillHeight={TREND_HEIGHT + 300}
          isActive={isActive}
          activeDayIndex={activeDayIndex}
        />
      </div>
    </div>
  );
}
