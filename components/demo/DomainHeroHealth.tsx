"use client";

import { useEffect, useState } from "react";
import { motion, animate } from "motion/react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

interface DomainHeroHealthProps {
  score: number;
  isActive: boolean;
}

/**
 * Health domain hero — huge number + 270° arc gauge (larger than old HeroScore).
 * Week dots below (7 circles, today highlighted). Green glow.
 */
export function DomainHeroHealth({ score, isActive }: DomainHeroHealthProps) {
  const [progress, setProgress] = useState(0);

  // Arc geometry — 270° sweep
  const size = 200;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const startAngle = 135; // degrees
  const endAngle = 45;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const startX = center + radius * Math.cos(startRad);
  const startY = center + radius * Math.sin(startRad);
  const endX = center + radius * Math.cos(endRad);
  const endY = center + radius * Math.sin(endRad);

  const fillRatio = Math.min(progress / 100, 1);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }
    const controls = animate(0, score, {
      duration: 1.2,
      delay: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (latest) => setProgress(latest),
    });
    return () => controls.stop();
  }, [score, isActive]);

  // Week dots — 7 days, index 6 = today
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const todayIndex = 6;

  return (
    <div className="relative flex flex-col items-center justify-center py-4">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "var(--glow-health)",
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
          stroke="var(--accent-green)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </motion.div>

      {/* Domain label */}
      <motion.p
        className="mt-1.5 text-xs font-medium uppercase"
        style={{ letterSpacing: "0.15em", color: "var(--accent-green)" }}
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        Health
      </motion.p>

      {/* Arc gauge + number */}
      <motion.div
        className="relative mt-4"
        style={{ width: size, height: size }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Background arc */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
        >
          <path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`}
            fill="none"
            stroke="var(--border-muted)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.5}
          />
        </svg>

        {/* Filled arc */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
          style={{ animation: "arc-breathe 3s ease-in-out infinite" }}
        >
          <motion.path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`}
            fill="none"
            stroke="var(--accent-green)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ pathLength: fillRatio }}
          />
        </svg>

        {/* Center number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-bold leading-none"
            style={{
              fontSize: 88,
              letterSpacing: -3,
              color: "var(--text-heading)",
            }}
          >
            {isActive ? <AnimatedNumber value={score} duration={0.8} delay={0.3} /> : score}
          </span>
        </div>
      </motion.div>

      {/* Week dots */}
      <motion.div
        className="mt-2 flex items-center gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="rounded-full"
              style={{
                width: i === todayIndex ? 8 : 6,
                height: i === todayIndex ? 8 : 6,
                background:
                  i === todayIndex
                    ? "var(--accent-green)"
                    : "var(--border-base)",
                transition: "all 0.3s ease",
              }}
            />
            <span
              className="text-[9px]"
              style={{
                color:
                  i === todayIndex
                    ? "var(--accent-green)"
                    : "var(--text-body-subtle)",
                fontWeight: i === todayIndex ? 600 : 400,
              }}
            >
              {day}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
