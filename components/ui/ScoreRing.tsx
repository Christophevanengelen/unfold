"use client";

import { useEffect, useState } from "react";
import { motion, animate } from "motion/react";
import { AnimatedNumber } from "./AnimatedNumber";
import { getScoreZone } from "@/lib/animations";

interface ScoreRingProps {
  /** Score value 0-100 */
  score: number;
  /** Ring diameter in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Label below the ring */
  label?: string;
  /** Show animated number inside */
  showNumber?: boolean;
  /** Delay before animation starts */
  delay?: number;
  /** Override ring color (otherwise auto from score zone) */
  colorClass?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * Animated circular progress ring with spring physics.
 * Score zones: 80+ green, 50-79 amber, 0-49 red.
 */
export function ScoreRing({
  score,
  size = 80,
  strokeWidth = 4,
  label,
  showNumber = true,
  delay = 0,
  colorClass,
  className = "",
}: ScoreRingProps) {
  const [progress, setProgress] = useState(0);
  const zone = getScoreZone(score);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Map score zone to actual stroke colors (CSS vars)
  const strokeColor = colorClass
    ? undefined
    : score >= 80
      ? "var(--accent-green)"
      : score >= 50
        ? "var(--accent-orange)"
        : "var(--danger)";

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.0,
      delay,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (latest) => setProgress(latest),
    });

    return () => controls.stop();
  }, [score, delay]);

  return (
    <motion.div
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-muted)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={colorClass}
          />
        </svg>

        {/* Center number */}
        {showNumber && (
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatedNumber
              value={score}
              delay={delay}
              className={`font-display text-${size >= 100 ? "4xl" : size >= 80 ? "2xl" : "lg"} font-bold ${zone.textColor}`}
            />
          </div>
        )}
      </div>

      {label && (
        <span className="mt-2 text-xs font-medium text-text-body-subtle">
          {label}
        </span>
      )}
    </motion.div>
  );
}
