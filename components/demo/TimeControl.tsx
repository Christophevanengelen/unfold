"use client";

import { motion } from "motion/react";

export type TimeView = "yesterday" | "today" | "tomorrow";

interface TimeControlProps {
  value: TimeView;
  onChange: (view: TimeView) => void;
}

const options: { key: TimeView; label: string }[] = [
  { key: "yesterday", label: "Yesterday" },
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
];

/**
 * Minimal text-only time switcher.
 * Active label is bold with an animated underline dot.
 * Tapping "Tomorrow" can optionally trigger the premium teaser.
 */
export function TimeControl({ value, onChange }: TimeControlProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      {options.map((opt) => {
        const isActive = value === opt.key;

        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className="relative flex flex-col items-center gap-1 py-1 transition-opacity"
            style={{ opacity: isActive ? 1 : 0.5 }}
          >
            <span
              className="text-xs font-medium"
              style={{
                color: isActive ? "var(--text-heading)" : "var(--text-body-subtle)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {opt.label}
            </span>

            {/* Active indicator dot */}
            {isActive && (
              <motion.div
                layoutId="time-dot"
                className="h-1 w-1 rounded-full"
                style={{ background: "var(--accent-purple)" }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
