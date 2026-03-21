"use client";

import { motion } from "motion/react";

interface OnboardingProgressProps {
  current: number; // 0-6
  total?: number;
}

/**
 * 7-dot progress indicator for onboarding flow.
 * Current step is filled brand color, completed steps are brand, upcoming are muted.
 */
export function OnboardingProgress({
  current,
  total = 5,
}: OnboardingProgressProps) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="h-1.5 rounded-full"
          initial={false}
          animate={{
            width: i === current ? 24 : 12,
            backgroundColor:
              i <= current
                ? "var(--bg-brand)"
                : "var(--border-muted)",
          }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      ))}
    </div>
  );
}
