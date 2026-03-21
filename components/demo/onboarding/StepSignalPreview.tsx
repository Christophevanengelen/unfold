"use client";

import { motion } from "motion/react";
import { OnboardingProgress } from "./OnboardingProgress";

interface StepSignalPreviewProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 2 — Visual Revelation.
 * "There is a pattern." Boudins on a vertical axis.
 */

const BOUDINS = [
  { y: 0,   w: 20, h: 28,  color: "#8B7FC2", opacity: 0.18, dots: 1, delay: 0.2 },
  { y: 36,  w: 14, h: 18,  color: "#6BA89A", opacity: 0.15, dots: 0, delay: 0.28 },
  { y: 62,  w: 26, h: 40,  color: "#9585CC", opacity: 0.22, dots: 2, delay: 0.36 },
  { y: 108, w: 12, h: 12,  color: "#C4A86B", opacity: 0.45, dots: 1, delay: 0.44 },
  { y: 130, w: 28, h: 44,  color: "#6BA89A", opacity: 0.8,  dots: 3, delay: 0.52, isCurrent: true },
  { y: 220, w: 38, h: 64,  color: "#B07CC2", opacity: 0.95, dots: 4, delay: 0.6, isCurrent: true },
  { y: 290, w: 28, h: 46,  color: "#6BA89A", opacity: 0.8,  dots: 3, delay: 0.68, isCurrent: true },
  { y: 342, w: 16, h: 16,  color: "#D89EA0", opacity: 0.3,  dots: 1, delay: 0.76 },
  { y: 364, w: 24, h: 38,  color: "#50C4D6", opacity: 0.35, dots: 2, delay: 0.84 },
  { y: 408, w: 12, h: 12,  color: "#C4A86B", opacity: 0.25, dots: 1, delay: 0.92 },
  { y: 426, w: 30, h: 48,  color: "#6BA89A", opacity: 0.35, dots: 3, delay: 1.0 },
];

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

      <div className="relative mt-4 flex-1 overflow-hidden flex items-center justify-center">
        <div className="relative w-full" style={{ height: 480 }}>

          <motion.div
            className="absolute left-0 right-0 flex items-center gap-2"
            style={{ top: 196 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.2))" }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-2"
              style={{ color: "white", opacity: 0.5 }}>
              now
            </span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.2))" }} />
          </motion.div>

          {BOUDINS.map((s, i) => {
            const left = `calc(50% - ${s.w / 2}px + ${(i % 2 === 0 ? -1 : 1) * 12}px)`;

            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ top: s.y, left, width: s.w, height: s.h }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: s.opacity, scale: 1 }}
                transition={{ delay: s.delay, duration: 0.4, ease: "easeOut" }}
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
        </div>
      </div>

      <motion.div
        className="pt-2 pb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4 }}
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
