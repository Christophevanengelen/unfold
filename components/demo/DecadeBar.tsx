"use client";

/**
 * DecadeBar — Delight #3: Life intensity at a glance.
 *
 * Shows a horizontal bar chart of event intensity per decade.
 * Users immediately see which decades of their life are/were most active.
 */

import type { DecadeTimeline, ScoreCounts } from "@/types/api";

interface DecadeBarProps {
  decades: DecadeTimeline;
  birthYear: number;
  currentAge: number;
}

function totalScore(counts: ScoreCounts): number {
  return counts.toc + counts.tocToc * 2 + counts.tocTocToc * 3 + counts.tocTocTocToc * 4;
}

export function DecadeBar({ decades, birthYear, currentAge }: DecadeBarProps) {
  const entries = Object.entries(decades).map(([range, counts]) => ({
    range,
    label: range.split("-")[0],
    score: totalScore(counts),
    hasTocTocTocToc: counts.tocTocTocToc > 0,
    hasTocTocToc: counts.tocTocToc > 0,
  }));

  const maxScore = Math.max(...entries.map(e => e.score), 1);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-text-body-subtle">
          Intensité par décennie
        </span>
        <span className="text-[9px] text-text-body-subtle">
          né en {birthYear}
        </span>
      </div>

      <div className="flex items-end gap-1" style={{ height: 40 }}>
        {entries.map(entry => {
          const height = Math.max((entry.score / maxScore) * 36, 3);
          const ageStart = parseInt(entry.label);
          const isCurrent = currentAge >= ageStart && currentAge < ageStart + 10;
          const isPast = currentAge >= ageStart + 10;

          return (
            <div key={entry.range} className="flex flex-1 flex-col items-center gap-0.5">
              <div
                className={`w-full rounded-sm transition-all ${
                  isCurrent
                    ? "bg-accent-purple"
                    : entry.hasTocTocTocToc
                      ? isPast ? "bg-amber-500/40" : "bg-amber-500/60"
                      : entry.hasTocTocToc
                        ? isPast ? "bg-white/15" : "bg-white/25"
                        : isPast ? "bg-white/8" : "bg-white/12"
                }`}
                style={{ height }}
              />
              <span className={`text-[8px] ${
                isCurrent ? "text-accent-purple font-bold" : "text-text-body-subtle/60"
              }`}>
                {entry.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
