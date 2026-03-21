"use client";

import { motion } from "motion/react";

interface PageDotsProps {
  /** Total number of pages */
  total: number;
  /** Active page index (0-based) */
  active: number;
  /** Called when a dot is tapped */
  onDotTap?: (index: number) => void;
}

/** Colors for each page dot — all purple (signal-based, not domain-based) */
const dotColors = [
  "var(--accent-purple)",
  "var(--accent-purple)",
  "var(--accent-purple)",
];

/**
 * Horizontal page indicator dots with domain-colored active dot.
 * Uses layoutId for smooth active dot transition.
 */
export function PageDots({ total, active, onDotTap }: PageDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === active;

        return (
          <button
            key={i}
            type="button"
            onClick={() => onDotTap?.(i)}
            className="relative flex h-4 w-4 items-center justify-center"
            aria-label={`Page ${i + 1}`}
          >
            {/* Inactive dot */}
            <div
              className="h-1.5 w-1.5 rounded-full transition-opacity duration-200"
              style={{
                background: "var(--border-base)",
                opacity: isActive ? 0 : 1,
              }}
            />

            {/* Active dot — animated via layoutId */}
            {isActive && (
              <motion.div
                layoutId="page-dot-active"
                className="absolute h-2 w-2 rounded-full"
                style={{ background: dotColors[i] || "var(--accent-purple)" }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
