"use client";

import { motion } from "motion/react";
import { OnboardingProgress } from "./OnboardingProgress";
import { houseConfig, type HouseNumber } from "@/lib/domain-config";

interface StepTimelineTeaserProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 3 — What signals map to.
 * A circle of 12 colored dots (like a clock) with key labels.
 * Minimal, graphical, premium.
 */

const HOUSES: HouseNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Only label the 4 most relatable domains (cardinal positions)
const LABELED: Record<number, true> = { 10: true, 7: true, 2: true, 4: true };

export function StepTimelineTeaser({ onNext, onBack }: StepTimelineTeaserProps) {
  const radius = 110;
  const center = 140;

  return (
    <motion.div className="flex h-full flex-col">
      <OnboardingProgress current={2} />

      <motion.button
        type="button"
        onClick={onBack}
        className="mt-4 self-start text-xs font-medium"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5 mr-1">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="font-display text-2xl font-bold"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}>
          Each signal maps to
          <br />
          a part of your life.
        </h1>
      </motion.div>

      {/* Circle of 12 domains */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative" style={{ width: center * 2, height: center * 2 }}>
          {HOUSES.map((house, i) => {
            const config = houseConfig[house];
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            const isLabeled = LABELED[house];

            return (
              <motion.div
                key={house}
                className="absolute flex flex-col items-center"
                style={{
                  left: x,
                  top: y,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.4, ease: "easeOut" }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: isLabeled ? 10 : 6,
                    height: isLabeled ? 10 : 6,
                    backgroundColor: config.color,
                    boxShadow: isLabeled ? `0 0 12px ${config.color}40` : "none",
                  }}
                />
                {isLabeled && (
                  <motion.span
                    className="mt-1.5 text-[10px] font-semibold whitespace-nowrap"
                    style={{ color: config.color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.6 + i * 0.06 }}
                  >
                    {config.label}
                  </motion.span>
                )}
              </motion.div>
            );
          })}

          {/* Center text */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <span className="font-display text-[40px] font-bold"
              style={{ color: "var(--accent-purple)", opacity: 0.15 }}>
              12
            </span>
          </motion.div>
        </div>
      </div>

      <motion.p
        className="text-center text-sm leading-relaxed px-6 pb-2"
        style={{ color: "var(--accent-purple)", opacity: 0.6 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Not just love, health, work.
        <br />
        Twelve precise life domains.
      </motion.p>

      <motion.div
        className="pt-2 pb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
        >
          Make it personal
        </button>
      </motion.div>
    </motion.div>
  );
}
