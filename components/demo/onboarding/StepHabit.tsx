"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ScoreRing } from "@/components/demo/ScoreRing";
import { SatelliteScores } from "@/components/demo/SatelliteScores";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { mockToday, mockDeltas } from "@/lib/mock-data";

interface StepHabitProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Screen 2 — Daily Signal: Sell immediate utility with a real product preview.
 * Uses the REAL demo components — ScoreRing, AnimatedNumber, SatelliteScores —
 * same design, same animations, no container wrapping.
 */
export function StepHabit({ onNext, onBack }: StepHabitProps) {
  // Delay activation by one frame to avoid React Strict Mode double-effect
  // cancelling the animation before it starts (same issue as main app swipe).
  const [active, setActive] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <motion.div
      className="flex h-full flex-col"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >

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
          Your daily signal,
          <br />
          in seconds.
        </h1>
      </motion.div>

      {/* Real animated preview — same components as main app, no container */}
      <motion.div
        className="mt-8 flex flex-col items-center"
        variants={fadeInUp}
      >
        {/* ScoreRing + big animated number — exact same as OverallPage */}
        <ScoreRing
          score={mockToday.overall}
          color="var(--accent-purple)"
          size={130}
          strokeWidth={1.5}
          isActive={active}
          delay={0.4}
          delta={mockDeltas.overall}
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
              value={mockToday.overall}
              duration={1.8}
              delay={0.4}
              isActive={active}
            />
          </span>
        </ScoreRing>

        {/* Momentum label */}
        <p
          className="mt-3 font-medium uppercase"
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "var(--accent-purple)",
            opacity: 0.5,
          }}
        >
          Momentum
        </p>

        {/* SatelliteScores — same component as main app */}
        <div className="mt-5">
          <SatelliteScores
            love={mockToday.scores.love.value}
            health={mockToday.scores.health.value}
            work={mockToday.scores.work.value}
            deltas={{
              love: mockDeltas.love,
              health: mockDeltas.health,
              work: mockDeltas.work,
            }}
            isActive={active}
          />
        </div>

        {/* Insight line */}
        <motion.p
          className="mt-5 max-w-[260px] text-center text-[11px] leading-relaxed"
          style={{ color: "var(--accent-purple)", opacity: 0.5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          {mockToday.insight}
        </motion.p>
      </motion.div>

      {/* Body text */}
      <motion.p
        className="mt-6 text-center text-sm leading-relaxed"
        style={{ color: "var(--accent-purple)", opacity: 0.7 }}
        variants={fadeInUp}
      >
        See what&apos;s strongest today, when to use it, and what opens next.
      </motion.p>

      {/* Support */}
      <motion.p
        className="mt-2 text-center text-xs"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        variants={fadeInUp}
      >
        Built for Yesterday, Today, and Tomorrow.
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
