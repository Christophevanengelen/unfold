"use client";

import { motion } from "motion/react";
import { formatDelta, getDeltaColor, slideInBounce } from "@/lib/animations";

interface DeltaBadgeProps {
  /** Change value (positive or negative) */
  delta: number;
  /** Delay before animation */
  delay?: number;
  /** Additional CSS class */
  className?: string;
}

/**
 * Animated badge showing score change from yesterday.
 * Slides in with bounce, color-coded by direction.
 */
export function DeltaBadge({ delta, delay = 0, className = "" }: DeltaBadgeProps) {
  if (delta === 0) return null;

  const color = getDeltaColor(delta);
  const bgColor =
    delta > 0
      ? "bg-success-soft"
      : "bg-danger-soft";

  return (
    <motion.span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${color} ${bgColor} ${className}`}
      variants={slideInBounce}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {delta > 0 && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
          <path d="M5 2L8 6H2L5 2Z" fill="currentColor" />
        </svg>
      )}
      {delta < 0 && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
          <path d="M5 8L2 4H8L5 8Z" fill="currentColor" />
        </svg>
      )}
      {formatDelta(delta)}
    </motion.span>
  );
}
