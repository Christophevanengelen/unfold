"use client";

import { useEffect, useState } from "react";
import { motion, animate } from "motion/react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

interface DomainHeroWorkProps {
  score: number;
  peakHour: number;
  isActive: boolean;
}

/**
 * Work domain hero — huge number + horizontal progress bar beneath.
 * Faint peak hour text in background. Blue glow.
 */
export function DomainHeroWork({ score, peakHour, isActive }: DomainHeroWorkProps) {
  const [barWidth, setBarWidth] = useState(0);

  const barTotalWidth = 220;

  useEffect(() => {
    if (!isActive) {
      setBarWidth(0);
      return;
    }
    const controls = animate(0, score, {
      duration: 1.0,
      delay: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (latest) => setBarWidth(latest),
    });
    return () => controls.stop();
  }, [score, isActive]);

  const peakLabel = `${peakHour > 12 ? peakHour - 12 : peakHour}${peakHour >= 12 ? "pm" : "am"}`;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "var(--glow-work)",
          animation: "glow-pulse 4s ease-in-out infinite",
        }}
      />

      {/* Faint peak hour in background */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 0.06 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <span
          className="font-display font-bold"
          style={{ fontSize: 160, color: "var(--accent-blue)" }}
        >
          {peakLabel}
        </span>
      </motion.div>

      {/* Domain icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent-blue)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </motion.div>

      {/* Domain label */}
      <motion.p
        className="mt-1.5 text-xs font-medium uppercase"
        style={{ letterSpacing: "0.15em", color: "var(--accent-blue)" }}
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        Work
      </motion.p>

      {/* Hero number */}
      <motion.div
        className="relative mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.2 }}
      >
        <span
          className="font-display font-bold leading-none"
          style={{
            fontSize: 120,
            letterSpacing: -4,
            color: "var(--text-heading)",
          }}
        >
          {isActive ? <AnimatedNumber value={score} duration={0.8} delay={0.3} /> : score}
        </span>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        className="mt-2 overflow-hidden rounded-full"
        style={{
          width: barTotalWidth,
          height: 4,
          background: "var(--border-muted)",
        }}
        initial={{ opacity: 0, scaleX: 0.5 }}
        animate={isActive ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.5 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(barWidth, 100)}%`,
            background: "var(--accent-blue)",
          }}
        />
      </motion.div>

      {/* Peak time label */}
      <motion.p
        className="mt-3 text-xs font-medium"
        style={{ color: "var(--accent-blue)" }}
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        Peak at {peakLabel}
      </motion.p>
    </div>
  );
}
