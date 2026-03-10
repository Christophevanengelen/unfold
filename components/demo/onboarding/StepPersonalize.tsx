"use client";

import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { OnboardingProgress } from "./OnboardingProgress";

interface StepPersonalizeProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Minimal signal/tuning icon — inline SVG.
 * Represents signal configuration: a centered dot with two concentric arcs.
 */
function SignalIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Center dot */}
      <circle cx="20" cy="20" r="3" fill="var(--accent-purple)" />
      {/* Inner arc */}
      <path
        d="M13 20a7 7 0 0 1 14 0"
        stroke="var(--accent-purple)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Outer arc */}
      <path
        d="M8 20a12 12 0 0 1 24 0"
        stroke="var(--accent-purple)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

/**
 * Screen 5 — Personal Setup Intro
 * Transition bridge to data collection. Minimal, clear, premium.
 * Visual: Original illustration (minimal signal icon).
 */
export function StepPersonalize({ onNext, onBack }: StepPersonalizeProps) {
  return (
    <motion.div
      className="flex h-full flex-col"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <OnboardingProgress current={4} />

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

      {/* Centered content */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* Signal icon with subtle pulse */}
        <motion.div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background:
              "color-mix(in srgb, var(--accent-purple) 10%, var(--bg-secondary))",
          }}
          variants={fadeInUp}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{
            scale: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <SignalIcon size={32} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-display text-2xl font-bold"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
          variants={fadeInUp}
        >
          Now let&apos;s configure
          <br />
          your signal.
        </motion.h1>

        {/* Body */}
        <motion.p
          className="mt-3 max-w-[240px] text-sm leading-relaxed"
          style={{ color: "var(--accent-purple)", opacity: 0.7 }}
          variants={fadeInUp}
        >
          We need your birth details to prepare your personal rhythm.
        </motion.p>

        {/* Support */}
        <motion.p
          className="mt-2 text-xs"
          style={{ color: "var(--accent-purple)", opacity: 0.5 }}
          variants={fadeInUp}
        >
          This only takes a moment.
        </motion.p>
      </div>

      {/* CTA */}
      <motion.div className="pt-6" variants={fadeInUp}>
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
        >
          Start
        </button>
      </motion.div>
    </motion.div>
  );
}
