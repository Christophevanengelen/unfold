"use client";

import { Lock } from "lucide-react";

export type Period = "7D" | "30D" | "90D" | "1Y";

const periods: Period[] = ["7D", "30D", "90D", "1Y"];

interface TrendPeriodSelectorProps {
  activePeriod: Period;
  color: string; // domain accent CSS var
  onSelect: (period: Period) => void;
  isPremium: boolean;
}

/**
 * Period selector pills for the trend curve.
 *
 * Free tier: only 7D is selectable.
 * Locked pills (30D/90D/1Y) show a tiny lock icon.
 * Tapping a locked pill triggers the premium teaser (handled by parent via onSelect).
 */
export function TrendPeriodSelector({
  activePeriod,
  color,
  onSelect,
  isPremium,
}: TrendPeriodSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-1 px-5">
      {periods.map((period) => {
        const isActive = activePeriod === period;
        const isLocked = !isPremium && period !== "7D";

        return (
          <button
            key={period}
            type="button"
            className="relative flex items-center gap-1 rounded-full px-3 py-1 transition-all active:scale-95"
            style={{
              fontSize: 10,
              letterSpacing: "0.05em",
              fontWeight: 500,
              background: isActive
                ? `color-mix(in srgb, ${color} 10%, transparent)`
                : "transparent",
              color: isActive
                ? color
                : "var(--text-body-subtle)",
              opacity: isLocked ? 0.4 : 1,
            }}
            onClick={() => onSelect(period)}
          >
            {isLocked && (
              <Lock
                size={8}
                strokeWidth={2}
                style={{ color: "var(--text-body-subtle)" }}
              />
            )}
            {period}
          </button>
        );
      })}
    </div>
  );
}
