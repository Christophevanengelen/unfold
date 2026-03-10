"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ScoreRing } from "./ScoreRing";
import { SatelliteScores } from "./SatelliteScores";
import { StructuredInsightCard } from "./StructuredInsightCard";
import { Rocket } from "flowbite-react-icons/solid";
import type { DailyMomentum, StructuredInsight } from "@/types/api";

interface OverallPageProps {
  isActive: boolean;
  data: DailyMomentum;
  deltas: { love: number; health: number; work: number; overall: number };
  label: string;
  structuredInsight: StructuredInsight;
  trendData: number[];
  cardWidth: number;
  activeDayIndex?: number;
}

/**
 * Cover page (Page 0) — overall momentum score.
 * Unix aesthetic: thin strokes, large thin numbers, no glows.
 *
 * Layout: TrendCurve is absolutely positioned at a fixed offset from the
 * card bottom. It NEVER moves when switching time views.
 */

export function OverallPage({
  isActive,
  data,
  deltas,
  label,
  structuredInsight,
  trendData,
  cardWidth,
  activeDayIndex,
}: OverallPageProps) {
  return (
    <div className="relative flex h-full flex-col">
      {/* === HERO SECTION === */}
      <div className="flex flex-col items-center pt-5">
        {/* Momentum icon + label — top, like domain cards */}
        <div style={{ color: "var(--accent-purple)" }}>
          <Rocket className="h-5 w-5" style={{ strokeWidth: 1.5 }} />
        </div>
        <p
          className="mt-1.5 font-medium uppercase"
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "var(--accent-purple)",
          }}
        >
          Momentum
        </p>

        {/* Score ring + BIG number */}
        <div className="mt-4">
          <ScoreRing
            score={data.overall}
            color="var(--accent-purple)"
            size={160}
            isActive={isActive}
            delay={0.3}
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
        </div>

        {/* Label — fixed min-height prevents layout shift across time views */}
        <div className="mt-4 flex min-h-[44px] flex-col items-center justify-center">
          {label && (
            <p style={{ fontSize: 12, color: "var(--text-body-subtle)", marginTop: 2 }}>
              {label}
            </p>
          )}
        </div>

      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Satellite scores — absolutely positioned at fixed vertical center so
          they NEVER shift when switching days (content changes above/below) */}
      <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center"
           style={{ top: "52%" }}>
        <div className="pointer-events-auto">
          <SatelliteScores
            love={data.scores.love.value}
            health={data.scores.health.value}
            work={data.scores.work.value}
            deltas={{ love: deltas.love, health: deltas.health, work: deltas.work }}
            isActive={isActive}
          />
        </div>
      </div>

      {/* === BOTTOM CONTENT — insight card, always at card bottom === */}
      <div className="relative shrink-0 pb-5" style={{ zIndex: 2 }}>
        <StructuredInsightCard insight={structuredInsight} color="var(--accent-purple)" />
      </div>

    </div>
  );
}
