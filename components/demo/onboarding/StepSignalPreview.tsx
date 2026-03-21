"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ScoreRing } from "@/components/demo/ScoreRing";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { planetConfig } from "@/lib/domain-config";
import { getHomeCapsules, getTierLabel } from "@/lib/capsules";
import { OnboardingProgress } from "./OnboardingProgress";

interface StepSignalPreviewProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Screen 2 — Signal Preview: Show what a momentum signal looks like.
 * Uses the current capsule's planets and intensity — same data as the app home.
 */
export function StepSignalPreview({ onNext, onBack }: StepSignalPreviewProps) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const { current } = getHomeCapsules();
  const intensity = current
    ? Math.max(...current.phases.map((p) => p.intensity))
    : 76;
  const planets = current?.planets ?? ["jupiter", "sun", "mercury"];
  const tier = current ? getTierLabel(current.tier) : "TOCTOCTOC";

  return (
    <motion.div
      className="flex h-full flex-col"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <OnboardingProgress current={1} />

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
          This is your
          <br />
          current signal.
        </h1>
      </motion.div>

      {/* Signal preview */}
      <motion.div
        className="mt-8 flex flex-col items-center"
        variants={fadeInUp}
      >
        {/* Intensity ring */}
        <ScoreRing
          score={intensity}
          color="var(--accent-purple)"
          size={130}
          strokeWidth={1.5}
          isActive={active}
          delay={0.4}
          delta={0}
        >
          <span
            className="font-display leading-none"
            style={{
              fontSize: 64,
              fontWeight: 300,
              letterSpacing: -3,
              color: "var(--accent-purple)",
            }}
          >
            <AnimatedNumber
              value={intensity}
              duration={1.8}
              delay={0.4}
              isActive={active}
            />
          </span>
        </ScoreRing>

        {/* Tier label */}
        <p
          className="mt-3 font-medium uppercase"
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "var(--accent-purple)",
            opacity: 0.5,
          }}
        >
          {tier}
        </p>

        {/* Planet keyword pills */}
        <motion.div
          className="mt-5 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {planets.map((planet) => {
            const cfg = planetConfig[planet];
            return (
              <span
                key={planet}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: `color-mix(in srgb, ${cfg?.color ?? "#9585CC"} 15%, transparent)`,
                  color: cfg?.color ?? "#9585CC",
                }}
              >
                {cfg?.label ?? planet}
              </span>
            );
          })}
        </motion.div>

        {/* Insight */}
        <motion.p
          className="mt-5 max-w-[260px] text-center text-[11px] leading-relaxed"
          style={{ color: "var(--accent-purple)", opacity: 0.5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          These planets shape your current momentum period.
          Together they tell your signal story.
        </motion.p>
      </motion.div>

      {/* Body text */}
      <motion.p
        className="mt-6 text-center text-sm leading-relaxed"
        style={{ color: "var(--accent-purple)", opacity: 0.7 }}
        variants={fadeInUp}
      >
        Each momentum period has a unique combination of planetary signals and intensity.
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
