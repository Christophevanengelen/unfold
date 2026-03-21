"use client";

import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { OnboardingProgress } from "./OnboardingProgress";

interface StepTimelineTeaserProps {
  onNext: () => void;
  onBack: () => void;
}

/** Mini capsules for the timeline teaser visualization */
const CAPSULES = [
  { tier: "TOC", w: 28, planets: 1, opacity: 0.3, delay: 0.3 },
  { tier: "TOC", w: 28, planets: 1, opacity: 0.35, delay: 0.4 },
  { tier: "TOCTOC", w: 38, planets: 2, opacity: 0.5, delay: 0.5 },
  { tier: "TOC", w: 28, planets: 1, opacity: 0.4, delay: 0.6 },
  { tier: "TOCTOCTOC", w: 50, planets: 4, opacity: 1, delay: 0.7 },
  { tier: "TOCTOC", w: 38, planets: 2, opacity: 0.5, delay: 0.8 },
  { tier: "TOC", w: 28, planets: 1, opacity: 0.3, delay: 0.9 },
];

/**
 * Screen 3 — Timeline Teaser: Show the concept of a momentum timeline.
 * Mini capsules connected by a spine, hinting at the full timeline feature.
 */
export function StepTimelineTeaser({ onNext, onBack }: StepTimelineTeaserProps) {
  return (
    <motion.div
      className="flex h-full flex-col"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <OnboardingProgress current={2} />

      {/* Back */}
      <motion.button
        type="button"
        onClick={onBack}
        className="mt-4 self-start text-xs font-medium"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        variants={fadeInUp}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="inline -mt-0.5 mr-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      {/* Headline */}
      <motion.div className="mt-6 text-center" variants={fadeInUp}>
        <h1
          className="font-display text-2xl font-bold"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
        >
          Your momentum
          <br />
          has a timeline.
        </h1>
      </motion.div>

      {/* Timeline visualization */}
      <motion.div
        className="mt-10 flex flex-col items-center px-4"
        variants={fadeInUp}
      >
        {/* Vertical capsule stack with spine */}
        <div className="relative flex flex-col items-center gap-3">
          {/* Spine line */}
          <div
            className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2"
            style={{ background: "color-mix(in srgb, var(--accent-purple) 20%, transparent)" }}
          />

          {CAPSULES.map((cap, i) => (
            <motion.div
              key={i}
              className="relative flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: cap.opacity, x: 0 }}
              transition={{ delay: cap.delay, duration: 0.4 }}
            >
              {/* Capsule body */}
              <div
                className="rounded-full"
                style={{
                  width: cap.w,
                  height: cap.w,
                  background: `linear-gradient(135deg, color-mix(in srgb, var(--accent-purple) ${cap.opacity * 35}%, transparent), color-mix(in srgb, var(--accent-purple) ${cap.opacity * 15}%, transparent))`,
                  border: "1px solid color-mix(in srgb, var(--accent-purple) 25%, transparent)",
                }}
              />

              {/* Planet dots + tier */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: cap.planets }).map((_, j) => (
                    <div
                      key={j}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--accent-purple)", opacity: 0.6 }}
                    />
                  ))}
                </div>
                <span
                  className="text-[9px] font-medium tracking-wider"
                  style={{ color: "var(--accent-purple)", opacity: 0.5 }}
                >
                  {cap.tier}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Body text */}
      <motion.p
        className="mt-8 text-center text-sm leading-relaxed"
        style={{ color: "var(--accent-purple)", opacity: 0.7 }}
        variants={fadeInUp}
      >
        Every momentum period — past, present, future — is a capsule on your personal timeline.
      </motion.p>

      <motion.p
        className="mt-2 text-center text-xs"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        variants={fadeInUp}
      >
        Planets tell the story. Intensity tells the strength.
      </motion.p>

      {/* CTA */}
      <motion.div className="mt-auto pt-6" variants={fadeInUp}>
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}
