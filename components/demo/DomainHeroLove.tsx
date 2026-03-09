"use client";

import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

interface DomainHeroLoveProps {
  score: number;
  isActive: boolean;
}

/**
 * Love domain hero — huge number + breathing heartbeat wave SVG.
 * Pink glow behind. The wave oscillates continuously via CSS keyframe.
 */
export function DomainHeroLove({ score, isActive }: DomainHeroLoveProps) {
  // Wave path — gentle sine wave
  const waveWidth = 260;
  const waveHeight = 60;
  const points = [];
  for (let x = 0; x <= waveWidth; x += 2) {
    const y =
      waveHeight / 2 +
      Math.sin((x / waveWidth) * Math.PI * 3) * 12 +
      Math.sin((x / waveWidth) * Math.PI * 1.5) * 6;
    points.push(`${x},${y.toFixed(1)}`);
  }
  const wavePath = `M ${points.join(" L ")}`;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "var(--glow-love)",
          animation: "glow-pulse 4s ease-in-out infinite",
        }}
      />

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
          stroke="var(--accent-pink)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </motion.div>

      {/* Domain label */}
      <motion.p
        className="mt-1.5 text-xs font-medium uppercase"
        style={{ letterSpacing: "0.15em", color: "var(--accent-pink)" }}
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        Love
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

      {/* Heartbeat wave behind the number */}
      <motion.div
        className="pointer-events-none"
        style={{
          marginTop: -20,
          animation: "love-breathe 3s ease-in-out infinite",
          transformOrigin: "center center",
        }}
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <svg
          width={waveWidth}
          height={waveHeight}
          viewBox={`0 0 ${waveWidth} ${waveHeight}`}
        >
          <path
            d={wavePath}
            fill="none"
            stroke="var(--accent-pink)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0.3}
          />
        </svg>
      </motion.div>
    </div>
  );
}
