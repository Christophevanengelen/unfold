"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface AnimatedNumberProps {
  /** Target value to count to */
  value: number;
  /** Duration in seconds */
  duration?: number;
  /** CSS class for the number */
  className?: string;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Controls when animation plays — mirrors ScoreRing pattern */
  isActive?: boolean;
}

/**
 * Animated counter with smart state memory.
 * Uses native requestAnimationFrame — no Motion dependency.
 *
 * Animation behavior (same contract as ScoreRing):
 * - First activation: animate 0 → value (with delay)
 * - Revisit (already animated, same value): show value immediately
 * - Value change (day switch): animate oldValue → newValue (fast)
 * - Inactive + never animated: show static value
 */
export function AnimatedNumber({
  value,
  duration = 1.8,
  className = "",
  delay = 0,
  isActive = true,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);
  const prevValue = useRef(0);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const animateFromTo = useCallback(
    (from: number, to: number, animDelay: number, dur: number) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafRef.current);

      timeoutRef.current = setTimeout(() => {
        const start = performance.now();
        const durationMs = dur * 1000;

        const step = (now: number) => {
          const elapsed = now - start;
          const t = Math.min(elapsed / durationMs, 1);
          // quintic ease-out — long deceleration for premium feel
          const eased = 1 - Math.pow(1 - t, 5);
          setDisplay(Math.round(from + eased * (to - from)));
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
    if (!isActive) return;

    if (!hasAnimated.current) {
      // First activation: animate 0 → value
      animateFromTo(0, value, delay, duration);
      hasAnimated.current = true;
      prevValue.current = value;
    } else if (prevValue.current !== value) {
      // Value changed (day switch): animate old → new, faster
      animateFromTo(prevValue.current, value, 0.05, duration * 0.6);
      prevValue.current = value;
    }
    // Revisit with same value: do nothing — display is already correct
  }, [value, isActive, delay, duration, animateFromTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Inactive cards that haven't animated yet: show value directly
  const rendered = !hasAnimated.current && !isActive ? value : display;

  return <span className={className}>{rendered}</span>;
}
