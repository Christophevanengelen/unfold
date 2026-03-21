"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { OnboardingProgress } from "./OnboardingProgress";

interface StepSignalPreviewProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 2 — Life scroll.
 *
 * The strip scrolls upward from birth to now. A fixed NOW line sits
 * at the center. Each boudin highlights as it passes the line, then
 * fades back. The last one (current) stays lit.
 * A year counter on the left counts up from birth to present.
 */

// Boudins positioned relative to NOW (y=0). Negative = past, positive = future.
const BOUDINS = [
  { y: -520, w: 14, h: 20,  color: "#8B7FC2", opacity: 0.4, dots: 1, year: 1985 },
  { y: -450, w: 18, h: 28,  color: "#6BA89A", opacity: 0.4, dots: 1, year: 1990 },
  { y: -380, w: 16, h: 22,  color: "#9585CC", opacity: 0.4, dots: 1, year: 1995 },
  { y: -320, w: 22, h: 36,  color: "#C4A86B", opacity: 0.5, dots: 2, year: 1999 },
  { y: -250, w: 26, h: 44,  color: "#B07CC2", opacity: 0.5, dots: 2, year: 2003 },
  { y: -190, w: 20, h: 30,  color: "#6BA89A", opacity: 0.5, dots: 2, year: 2007 },
  { y: -130, w: 30, h: 50,  color: "#9585CC", opacity: 0.6, dots: 3, year: 2011 },
  { y: -65,  w: 24, h: 36,  color: "#D89EA0", opacity: 0.6, dots: 2, year: 2016 },
  { y: -10,  w: 28, h: 44,  color: "#6BA89A", opacity: 0.7, dots: 3, year: 2020 },
  // NOW
  { y: 55,   w: 38, h: 64,  color: "#B07CC2", opacity: 1,   dots: 4, year: 2026, isCurrent: true },
  // Future
  { y: 135,  w: 26, h: 40,  color: "#6BA89A", opacity: 0.35, dots: 3, year: 2029 },
  { y: 190,  w: 16, h: 20,  color: "#50C4D6", opacity: 0.25, dots: 1, year: 2032 },
  { y: 226,  w: 24, h: 36,  color: "#C4A86B", opacity: 0.2,  dots: 2, year: 2036 },
];

const SCROLL_DISTANCE = 580;
const SCROLL_DURATION = 3.2;
const SCROLL_EASE: [number, number, number, number] = [0.12, 0.8, 0.15, 1];

// Calculate when each boudin crosses center (0) during the scroll
// Scroll goes from y=SCROLL_DISTANCE to y=0 over SCROLL_DURATION
// A boudin at position `by` crosses center when scrollOffset + by = 0
// → scrollOffset = -by → progress = (SCROLL_DISTANCE - (-by)) / SCROLL_DISTANCE
function getCrossTime(boudinY: number): number {
  const progress = (SCROLL_DISTANCE - boudinY) / SCROLL_DISTANCE;
  // Apply approximate ease timing (linear approximation of the cubic-bezier)
  return Math.max(0, Math.min(1, progress)) * SCROLL_DURATION;
}

export function StepSignalPreview({ onNext, onBack }: StepSignalPreviewProps) {
  // Year counter
  const [displayYear, setDisplayYear] = useState(1985);

  useEffect(() => {
    const startYear = 1985;
    const endYear = 2026;
    const duration = SCROLL_DURATION * 1000;
    const startTime = Date.now() + 300; // slight delay

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Apply easing (approximate)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const year = Math.round(startYear + (endYear - startYear) * eased);
      setDisplayYear(year);
      if (progress >= 1) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div className="flex h-full flex-col">
      <OnboardingProgress current={1} />

      <motion.button
        type="button"
        onClick={onBack}
        className="mt-4 self-start text-xs font-medium"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5 mr-1">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-bold"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}>
          There is a pattern.
        </h1>
      </motion.div>

      {/* Life strip area */}
      <div className="relative mt-4 flex-1 overflow-hidden">

        {/* Fixed NOW line — always at center */}
        <div
          className="absolute left-0 right-0 flex items-center gap-2 z-10"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.25))" }} />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-2"
            style={{ color: "white", opacity: 0.6 }}>
            now
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.25))" }} />
        </div>

        {/* Year counter — fixed left */}
        <motion.div
          className="absolute z-10"
          style={{ left: 16, top: "50%", transform: "translateY(-50%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.3 }}
        >
          <span className="font-display text-lg font-bold tabular-nums"
            style={{ color: "var(--accent-purple)" }}>
            {displayYear}
          </span>
        </motion.div>

        {/* Scrolling strip */}
        <motion.div
          className="absolute left-0 right-0"
          style={{ top: "50%" }}
          initial={{ y: -SCROLL_DISTANCE }}
          animate={{ y: 0 }}
          transition={{ duration: SCROLL_DURATION, ease: SCROLL_EASE }}
        >
          {BOUDINS.map((s, i) => {
            const left = `calc(50% - ${s.w / 2}px + ${(i % 2 === 0 ? -1 : 1) * 10}px)`;
            const crossTime = getCrossTime(s.y);
            const isLast = s.isCurrent;

            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ top: s.y, left, width: s.w, height: s.h }}
                // Highlight sequence: dim → bright (at cross time) → dim (or stay if current)
                animate={{
                  scale: isLast ? [1, 1, 1.15] : [1, 1.15, 1],
                  opacity: isLast ? [s.opacity * 0.6, s.opacity * 0.6, 1] : [s.opacity, 1, s.opacity],
                }}
                transition={{
                  duration: isLast ? SCROLL_DURATION + 0.5 : 1.2,
                  delay: isLast ? SCROLL_DURATION - 0.5 : Math.max(0.1, crossTime - 0.3),
                  times: isLast ? [0, 0.7, 1] : [0, 0.4, 1],
                  ease: "easeOut",
                }}
              >
                <motion.div
                  className="h-full w-full"
                  style={{
                    borderRadius: Math.min(s.w, s.h) / 2,
                    background: s.isCurrent
                      ? `linear-gradient(135deg, ${s.color}, color-mix(in srgb, ${s.color} 60%, transparent))`
                      : `linear-gradient(135deg, color-mix(in srgb, ${s.color} 50%, transparent), color-mix(in srgb, ${s.color} 20%, transparent))`,
                    border: s.isCurrent
                      ? `1.5px solid ${s.color}`
                      : `1px solid color-mix(in srgb, ${s.color} 30%, transparent)`,
                  }}
                  animate={{
                    boxShadow: isLast
                      ? [`0 0 0px transparent`, `0 0 0px transparent`, `0 0 24px color-mix(in srgb, ${s.color} 40%, transparent)`]
                      : [`0 0 0px transparent`, `0 0 16px color-mix(in srgb, ${s.color} 30%, transparent)`, `0 0 0px transparent`],
                  }}
                  transition={{
                    duration: isLast ? SCROLL_DURATION + 0.5 : 1.2,
                    delay: isLast ? SCROLL_DURATION - 0.5 : Math.max(0.1, crossTime - 0.3),
                    times: isLast ? [0, 0.7, 1] : [0, 0.4, 1],
                  }}
                />
                {s.dots > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px]">
                    {Array.from({ length: s.dots }).map((_, j) => (
                      <div key={j} className="rounded-full"
                        style={{
                          width: s.isCurrent ? 5 : 4,
                          height: s.isCurrent ? 5 : 4,
                          backgroundColor: "white",
                          opacity: s.isCurrent ? 0.8 : 0.5,
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        className="pt-2 pb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: SCROLL_DURATION + 0.3, duration: 0.4 }}
      >
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
        >
          What does it mean?
        </button>
      </motion.div>
    </motion.div>
  );
}
