"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface ScoreRingProps {
  score: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  isActive: boolean;
  delay?: number;
  delta?: number;
  children: React.ReactNode;
}

/**
 * Full 360° score ring — wraps around the hero number on every page.
 * Colored fill stops at score% (clockwise from 12 o'clock).
 * Uses native requestAnimationFrame — no Motion dependency.
 *
 * Animation behavior:
 * - First activation: animate from 0 → score
 * - Revisit (already animated): show score immediately (no replay)
 * - Score change (day switch): animate from old → new value
 */
export function ScoreRing({
  score,
  color,
  size = 160,
  strokeWidth = 1.5,
  isActive,
  delay = 0.3,
  delta,
  children,
}: ScoreRingProps) {
  const [progress, setProgress] = useState(0);
  const hasAnimated = useRef(false);
  const prevScore = useRef(score);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const hasDelta = delta !== undefined && delta !== 0;
  const absDelta = Math.abs(delta ?? 0);
  const deltaColor = delta && delta > 0 ? "var(--accent-green)" : "var(--danger)";

  // Single unified animation:
  // For +delta: domain arc draws 0→(score-delta), then green arc continues (score-delta)→score
  // For -delta: domain arc draws 0→score, red zone sits static beyond fill
  const splitPoint = hasDelta && delta! > 0 ? score - delta! : score;
  const domainProgress = Math.min(progress, splitPoint);
  const domainOffset = circumference * (1 - Math.min(domainProgress / 100, 1));

  // Delta arc picks up exactly where domain arc stops
  let deltaLen = 0;
  let deltaOffset = 0;
  if (hasDelta && delta! > 0) {
    const visible = Math.max(0, progress - splitPoint);
    deltaLen = (visible / 100) * circumference;
    deltaOffset = -(splitPoint / 100) * circumference;
  } else if (hasDelta && delta! < 0) {
    deltaLen = (absDelta / 100) * circumference;
    deltaOffset = -(score / 100) * circumference;
  }

  /** Animate progress from `from` to `to` with smooth quintic ease-out */
  const animateFromTo = useCallback(
    (from: number, to: number, animDelay: number) => {
      // Cancel any running animation
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafRef.current);

      timeoutRef.current = setTimeout(() => {
        const start = performance.now();
        const durationMs = 2000;

        const step = (now: number) => {
          const elapsed = now - start;
          const t = Math.min(elapsed / durationMs, 1);
          // quintic ease-out — long smooth deceleration
          const eased = 1 - Math.pow(1 - t, 5);
          setProgress(from + eased * (to - from));
          if (t < 1) {
            rafRef.current = requestAnimationFrame(step);
          }
        };

        rafRef.current = requestAnimationFrame(step);
      }, animDelay * 1000);
    },
    [],
  );

  useEffect(() => {
    if (!isActive) return; // Don't reset progress when inactive!

    if (!hasAnimated.current) {
      // First activation: animate from 0 → score
      animateFromTo(0, score, delay);
      hasAnimated.current = true;
      prevScore.current = score;
    } else if (prevScore.current !== score) {
      // Score changed (e.g. day switch): animate old → new
      animateFromTo(prevScore.current, score, 0.05);
      prevScore.current = score;
    }
    // Revisit with same score: do nothing — ring stays filled
  }, [score, isActive, delay, animateFromTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-muted)"
          strokeWidth={strokeWidth}
          opacity={0.7}
        />
        {/* Main fill arc — domain color */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={domainOffset}
        />
        {/* Delta zone — green (gain) or red (loss) */}
        {hasDelta && deltaLen > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={deltaColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${deltaLen} ${circumference - deltaLen}`}
            strokeDashoffset={deltaOffset}
          />
        )}
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
