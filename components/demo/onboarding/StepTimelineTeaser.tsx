"use client";

import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { OnboardingProgress } from "./OnboardingProgress";
import { houseConfig, type HouseNumber } from "@/lib/domain-config";

interface StepTimelineTeaserProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 3 — Depth: What the signals map to.
 *
 * Step 2 showed the VISUAL pattern.
 * Step 3 reveals the MEANING: each signal maps to a precise life domain.
 * The "it covers EVERYTHING" moment.
 *
 * Visual: a mini boudin "opens" into a domain label.
 * Then the full 12-domain grid appears.
 */

// Most relatable domains first
const DOMAIN_ORDER: HouseNumber[] = [10, 7, 2, 5, 1, 4, 6, 9, 11, 8, 3, 12];

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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5 mr-1">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      {/* Headline */}
      <motion.div className="mt-6 text-center" variants={fadeInUp}>
        <h1 className="font-display text-2xl font-bold"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}>
          Each signal maps to
          <br />
          a part of your life.
        </h1>
      </motion.div>

      <motion.p
        className="mt-3 text-center text-xs leading-relaxed px-4"
        style={{ color: "var(--accent-purple)", opacity: 0.45 }}
        variants={fadeInUp}
      >
        Not just three categories. Twelve precise life domains.
      </motion.p>

      {/* 12 domains grid */}
      <motion.div className="mt-7 grid grid-cols-3 gap-2.5 px-3" variants={fadeInUp}>
        {DOMAIN_ORDER.map((house, i) => {
          const config = houseConfig[house];
          return (
            <motion.div
              key={house}
              className="relative flex flex-col items-center gap-2 rounded-2xl py-3.5 px-2"
              style={{
                background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent-purple) 12%, transparent)",
              }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.35, ease: "easeOut" }}
            >
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: config.color }} />
              <span className="text-[11px] font-semibold text-center leading-tight"
                style={{ color: "var(--text-heading)" }}>
                {config.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Punchy closer */}
      <motion.p
        className="mt-5 text-center text-sm leading-relaxed px-6"
        style={{ color: "var(--accent-purple)", opacity: 0.65 }}
        variants={fadeInUp}
      >
        Career, love, money, home, creativity...
        <br />
        You see exactly what is activated, and when.
      </motion.p>

      {/* CTA */}
      <motion.div className="mt-auto pt-4" variants={fadeInUp}>
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
