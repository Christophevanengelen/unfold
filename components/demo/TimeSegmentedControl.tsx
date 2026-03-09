"use client";

import { motion } from "motion/react";
import { Lock } from "lucide-react";

export type TimeView = "yesterday" | "today" | "tomorrow";

interface TimeSegmentedControlProps {
  value: TimeView;
  onChange: (value: TimeView) => void;
}

const segments: { key: TimeView; label: string; premium?: boolean }[] = [
  { key: "yesterday", label: "Yesterday" },
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow", premium: true },
];

export function TimeSegmentedControl({
  value,
  onChange,
}: TimeSegmentedControlProps) {
  return (
    <div
      className="relative flex rounded-full bg-bg-secondary p-[3px]"
      style={{ height: 36 }}
    >
      {segments.map((seg) => {
        const isActive = value === seg.key;
        return (
          <button
            key={seg.key}
            onClick={() => onChange(seg.key)}
            className="relative z-10 flex flex-1 items-center justify-center gap-1 text-[13px] font-semibold transition-colors duration-200"
            style={{
              color: isActive
                ? "var(--text-heading)"
                : "var(--text-body-subtle)",
            }}
          >
            {seg.label}
            {seg.premium && (
              <Lock
                size={10}
                strokeWidth={2}
                className="text-text-body-subtle"
              />
            )}
            {isActive && (
              <motion.div
                layoutId="segmented-indicator"
                className="shadow-card absolute inset-0 rounded-full bg-bg-primary"
                style={{ zIndex: -1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
