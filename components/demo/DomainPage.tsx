"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ScoreRing } from "./ScoreRing";
import { TrendCurve } from "./TrendCurve";

import { formatDelta, getDeltaColor } from "@/lib/animations";
import { StructuredInsightCard } from "./StructuredInsightCard";
import { domainConfig, type DomainKey } from "@/lib/domain-config";
import type { StructuredInsight } from "@/types/api";

/** Consistent trend curve height across all pages */
const TREND_HEIGHT = 150;

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
}

/**
 * Unified domain page — SAME hero format for all domains.
 * Unix aesthetic: thin strokes, large thin numbers, no glows, generous space.
 * Differentiation = COLOR, not chart type.
 * Uses centralized domain config — icons, colors, labels from one source.
 */
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
}: DomainPageProps) {
  const config = domainConfig[domain];
  const peakLabel = `${peakHour > 12 ? peakHour - 12 : peakHour}${peakHour >= 12 ? "pm" : "am"}`;

  return (
    <div className="flex h-full flex-col">
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
        <div className="mt-2">
          <ScoreRing
            score={score}
            color={config.color}
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
                color: config.color,
              }}
            >
              <AnimatedNumber value={score} duration={1.8} delay={0.3} isActive={isActive} />
            </span>
          </ScoreRing>
        </div>

        {/* Trend + delta + description — fixed min-height prevents layout shift */}
        <div className="mt-2 flex min-h-[44px] flex-col items-center justify-center">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium capitalize"
              style={{ color: "var(--text-body-subtle)" }}
            >
              {trend}
            </span>
            <span className={`text-sm font-semibold ${getDeltaColor(delta)}`}>
              {formatDelta(delta)}
            </span>
          </div>

          <p
            className="mt-1 text-xs"
            style={{ color: "var(--text-body-subtle)" }}
          >
            Peak at {peakLabel} &middot; {description}
          </p>
        </div>
      </div>

      {/* === TREND CURVE === */}
      <div className="mt-auto">
        <TrendCurve
          data={trendData}
          color={config.color}
          width={cardWidth}
          height={TREND_HEIGHT}
          isActive={isActive}
        />
      </div>

      {/* === STRUCTURED INSIGHT === */}
      <StructuredInsightCard insight={structuredInsight} color={config.color} />

      {/* === SEE DETAILS BUTTON === */}
      <div className="shrink-0 px-4 pb-4">
        <button
          type="button"
          onClick={onDetailTap}
          className="w-full rounded-xl py-2.5 text-xs font-medium transition-transform active:scale-[0.98]"
          style={{
            background: `color-mix(in srgb, ${config.color} 8%, var(--bg-secondary))`,
            color: config.color,
          }}
        >
          See details
        </button>
      </div>
    </div>
  );
}
