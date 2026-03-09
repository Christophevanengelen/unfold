"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DOMAINS, domainConfig, type DomainKey } from "@/lib/domain-config";
import { formatDelta, getDeltaColor } from "@/lib/animations";

interface SatelliteScoresProps {
  love: number;
  health: number;
  work: number;
  deltas: { love: number; health: number; work: number };
  isActive: boolean;
}

/**
 * Three mini score indicators for the Overall page.
 * Display-only — users swipe to domain cards for details.
 * Uses centralized domain config — icons, colors, labels from one source.
 */
export function SatelliteScores({ love, health, work, deltas, isActive }: SatelliteScoresProps) {
  const values: Record<DomainKey, number> = { love, health, work };

  return (
    <div className="flex items-center justify-center gap-10">
      {DOMAINS.map((key) => {
        const config = domainConfig[key];
        const delta = deltas[key];

        return (
          <div
            key={key}
            className="flex flex-col items-center gap-1"
          >
            {/* Score number — thin weight */}
            <span
              className="font-display text-xl"
              style={{ color: config.color, fontWeight: 300 }}
            >
              <AnimatedNumber value={values[key]} duration={1.4} delay={0.7} isActive={isActive} />
            </span>

            {/* Delta indicator */}
            <span
              className={`text-[10px] font-semibold ${getDeltaColor(delta)}`}
              style={{ minHeight: 14 }}
            >
              {formatDelta(delta)}
            </span>

            {/* Label with icon */}
            <div
              className="flex items-center gap-1"
              style={{ color: "var(--text-body-subtle)" }}
            >
              {config.icon({ size: 12 })}
              <span
                className="font-medium"
                style={{ fontSize: 9, letterSpacing: "0.12em" }}
              >
                {config.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
