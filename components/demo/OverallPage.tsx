"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ScoreRing } from "./ScoreRing";
import { SatelliteScores } from "./SatelliteScores";
import { TrendCurve } from "./TrendCurve";

import { StructuredInsightCard } from "./StructuredInsightCard";
import { formatDelta, getDeltaColor } from "@/lib/animations";
import type { DailyMomentum, StructuredInsight } from "@/types/api";

/** Consistent trend curve height across all pages */
const TREND_HEIGHT = 150;

interface OverallPageProps {
  isActive: boolean;
  data: DailyMomentum;
  deltas: { love: number; health: number; work: number; overall: number };
  label: string;
  structuredInsight: StructuredInsight;
  trendData: number[];
  cardWidth: number;
}

/**
 * Cover page (Page 0) — overall momentum score.
 * Unix aesthetic: thin strokes, large thin numbers, no glows.
 *
 * Layout: TrendCurve is absolutely positioned at a fixed offset from the
 * card bottom. It NEVER moves when switching time views.
 */

/** Fixed distance from card bottom to trend curve bottom edge */
const TREND_BOTTOM_OFFSET = 160;

export function OverallPage({
  isActive,
  data,
  deltas,
  label,
  structuredInsight,
  trendData,
  cardWidth,
}: OverallPageProps) {
  return (
    <div className="relative flex h-full flex-col">
      {/* === HERO SECTION === */}
      <div className="flex flex-col items-center pt-6">
        {/* Score ring + BIG number */}
        <ScoreRing
          score={data.overall}
          color="var(--accent-purple)"
          size={160}
          isActive={isActive}
          delay={0.3}
          delta={deltas.overall}
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
            <AnimatedNumber value={data.overall} duration={1.8} delay={0.3} isActive={isActive} />
          </span>
        </ScoreRing>

        {/* Label — fixed min-height prevents layout shift across time views */}
        <div className="mt-3 flex min-h-[44px] flex-col items-center justify-center">
          <div className="flex items-center gap-2">
            <p
              className="font-medium uppercase"
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "var(--text-body-subtle)",
              }}
            >
              Momentum
            </p>
            <span className={`text-sm font-semibold ${getDeltaColor(deltas.overall)}`}>
              {formatDelta(deltas.overall)}
            </span>
          </div>
          {label && (
            <p style={{ fontSize: 12, color: "var(--text-body)", marginTop: 2 }}>
              {label}
            </p>
          )}
        </div>

        {/* Satellite scores — now includes delta display */}
        <div className="mt-6">
          <SatelliteScores
            love={data.scores.love.value}
            health={data.scores.health.value}
            work={data.scores.work.value}
            deltas={{ love: deltas.love, health: deltas.health, work: deltas.work }}
            isActive={isActive}
          />
        </div>
      </div>

      {/* Spacer — absorbs remaining vertical space */}
      <div className="flex-1" />

      {/* === BOTTOM CONTENT — insight card, always at card bottom === */}
      <div className="relative shrink-0" style={{ zIndex: 2 }}>
        <StructuredInsightCard insight={structuredInsight} color="var(--accent-purple)" />
      </div>

      {/* === TREND CURVE — absolutely positioned, NEVER moves === */}
      <div
        className="pointer-events-none absolute inset-x-0"
        style={{ bottom: TREND_BOTTOM_OFFSET, height: TREND_HEIGHT, zIndex: 1 }}
      >
        <TrendCurve
          data={trendData}
          color="var(--accent-purple)"
          width={cardWidth}
          height={TREND_HEIGHT}
          isActive={isActive}
        />
      </div>
    </div>
  );
}
