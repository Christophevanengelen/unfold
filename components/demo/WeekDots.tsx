"use client";

import type { TimeView } from "./TimeControl";

interface WeekDotsProps {
  activeDay: TimeView;
}

/**
 * 7-day week position indicator.
 * Shows 5 visible dots (days 2–6), hides first & last day as spacers.
 * The 3 middle dots map to yesterday/today/tomorrow — only the active
 * day is highlighted. Edge dots are more subtle, giving a sense of
 * position within a wider weekly rhythm.
 */

const DAY_MAP: Record<number, TimeView> = {
  2: "yesterday",
  3: "today",
  4: "tomorrow",
};

export function WeekDots({ activeDay }: WeekDotsProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        // Day 0 and 6 are invisible spacers (first & last day of week)
        if (i === 0 || i === 6) {
          return <div key={i} style={{ width: 6 }} />;
        }

        const isActive = DAY_MAP[i] === activeDay;
        const isEdge = i === 1 || i === 5;

        return (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: isActive ? 8 : 6,
              height: isActive ? 8 : 6,
              background: isActive ? "var(--accent-purple)" : "var(--text-body-subtle)",
              opacity: isActive ? 1 : isEdge ? 0.3 : 0.5,
            }}
          />
        );
      })}
    </div>
  );
}
