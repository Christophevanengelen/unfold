"use client";

import { motion } from "motion/react";
import { OnboardingProgress } from "./OnboardingProgress";

interface StepSignalPreviewProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 2 — Life scroll.
 *
 * Boudins arranged vertically from birth (bottom) to future (top).
 * The whole strip scrolls upward rapidly (childhood flying by),
 * then decelerates gracefully until landing on "now".
 * Age labels on the left mark the decades.
 *
 * Like fast-forwarding through your life and stopping at the present.
 */

// Boudins from birth to future, positioned bottom-to-top
// y=0 = NOW (center after scroll), negative = past, positive = future
const BOUDINS = [
  // Far past (childhood)
  { y: -520, w: 14, h: 20,  color: "#8B7FC2", opacity: 0.5, dots: 1, age: 5 },
  { y: -460, w: 18, h: 28,  color: "#6BA89A", opacity: 0.5, dots: 1, age: 10 },
  // Teens
  { y: -390, w: 16, h: 22,  color: "#9585CC", opacity: 0.5, dots: 1, age: 15 },
  { y: -340, w: 22, h: 36,  color: "#C4A86B", opacity: 0.5, dots: 2, age: 18 },
  // Twenties
  { y: -270, w: 26, h: 44,  color: "#B07CC2", opacity: 0.6, dots: 2, age: 22 },
  { y: -200, w: 20, h: 30,  color: "#6BA89A", opacity: 0.6, dots: 2, age: 25 },
  { y: -150, w: 30, h: 50,  color: "#9585CC", opacity: 0.7, dots: 3, age: 28 },
  // Thirties
  { y: -80,  w: 24, h: 36,  color: "#D89EA0", opacity: 0.7, dots: 2, age: 32 },
  { y: -30,  w: 28, h: 44,  color: "#6BA89A", opacity: 0.8, dots: 3, age: 36 },
  // NOW zone
  { y: 30,   w: 38, h: 64,  color: "#B07CC2", opacity: 1,   dots: 4, age: 40, isCurrent: true },
  // Near future
  { y: 110,  w: 26, h: 40,  color: "#6BA89A", opacity: 0.5, dots: 3, age: 43 },
  { y: 166,  w: 16, h: 20,  color: "#50C4D6", opacity: 0.35, dots: 1, age: 46 },
  { y: 200,  w: 24, h: 36,  color: "#C4A86B", opacity: 0.3, dots: 2, age: 50 },
];

// Age markers for the left side
const AGE_MARKERS = [
  { y: -500, label: "5" },
  { y: -380, label: "15" },
  { y: -260, label: "25" },
  { y: -70,  label: "35" },
  { y: 40,   label: "now" },
];

// The strip starts scrolled down (showing birth) and scrolls up to NOW
const SCROLL_DISTANCE = 550; // how far down it starts
const SCROLL_DURATION = 3;   // seconds for the life scroll

export function StepSignalPreview({ onNext, onBack }: StepSignalPreviewProps) {
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

      {/* Scrolling life strip */}
      <div className="relative mt-4 flex-1 overflow-hidden">
        {/* The entire strip translates upward */}
        <motion.div
          className="absolute left-0 right-0"
          style={{ top: "50%" }}
          initial={{ y: SCROLL_DISTANCE }}
          animate={{ y: 0 }}
          transition={{ duration: SCROLL_DURATION, ease: [0.15, 0.85, 0.2, 1] }}
        >
          {/* NOW marker — fixed at y=0 (center after scroll) */}
          <motion.div
            className="absolute left-0 right-0 flex items-center gap-2"
            style={{ top: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: SCROLL_DURATION - 0.3, duration: 0.4 }}
          >
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.2))" }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-2"
              style={{ color: "white", opacity: 0.5 }}>
              now
            </span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.2))" }} />
          </motion.div>

          {/* Age markers on the left */}
          {AGE_MARKERS.map(m => (
            <span
              key={m.label}
              className="absolute text-[8px] font-medium uppercase tracking-widest"
              style={{
                top: m.y,
                left: 16,
                color: m.label === "now" ? "var(--accent-purple)" : "rgba(255,255,255,0.2)",
                fontWeight: m.label === "now" ? 700 : 400,
              }}
            >
              {m.label === "now" ? "" : m.label}
            </span>
          ))}

          {/* Boudins */}
          {BOUDINS.map((s, i) => {
            const left = `calc(50% - ${s.w / 2}px + ${(i % 2 === 0 ? -1 : 1) * 12}px)`;

            return (
              <div
                key={i}
                className="absolute"
                style={{ top: s.y, left, width: s.w, height: s.h }}
              >
                <div
                  className="h-full w-full"
                  style={{
                    borderRadius: Math.min(s.w, s.h) / 2,
                    background: s.isCurrent
                      ? `linear-gradient(135deg, ${s.color}, color-mix(in srgb, ${s.color} 60%, transparent))`
                      : `linear-gradient(135deg, color-mix(in srgb, ${s.color} 50%, transparent), color-mix(in srgb, ${s.color} 20%, transparent))`,
                    border: s.isCurrent
                      ? `1.5px solid ${s.color}`
                      : `1px solid color-mix(in srgb, ${s.color} 30%, transparent)`,
                    boxShadow: s.isCurrent
                      ? `0 0 20px color-mix(in srgb, ${s.color} 30%, transparent)`
                      : "none",
                    opacity: s.opacity,
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
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* CTA — appears after scroll lands */}
      <motion.div
        className="pt-2 pb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: SCROLL_DURATION + 0.2, duration: 0.4 }}
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
