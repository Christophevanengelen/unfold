"use client";

import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { OnboardingProgress } from "./OnboardingProgress";

interface StepCompatibilityProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Two-rhythm SVG illustration — two sine-like paths with alignment dots.
 * Must be understood in 1 second: two people, two rhythms, moments of sync.
 */
function RhythmIllustration() {
  const w = 260;
  const h = 120;
  const mid = h / 2;

  // Path 1 (pink): gentle sine, slightly above center
  const path1 = `M 0 ${mid - 8} C 40 ${mid - 24}, 60 ${mid + 8}, 100 ${mid - 4} S 180 ${mid - 20}, 220 ${mid + 2} S 250 ${mid - 8}, ${w} ${mid - 12}`;

  // Path 2 (purple): different frequency, slightly below center
  const path2 = `M 0 ${mid + 12} C 30 ${mid + 28}, 70 ${mid - 4}, 110 ${mid + 8} S 160 ${mid + 24}, 200 ${mid - 2} S 240 ${mid + 10}, ${w} ${mid + 6}`;

  // Intersection points (approximate crossings)
  const intersections = [
    { x: 85, y: mid + 2 },
    { x: 170, y: mid + 4 },
    { x: 245, y: mid - 2 },
  ];

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      className="mx-auto"
    >
      {/* Path 1 — pink rhythm */}
      <motion.path
        d={path1}
        stroke="var(--accent-pink)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Path 2 — purple rhythm */}
      <motion.path
        d={path2}
        stroke="var(--accent-purple)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />

      {/* Intersection dots — alignment moments */}
      {intersections.map((pt, i) => (
        <motion.circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r="4"
          fill="var(--accent-purple)"
          opacity="0.7"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 1.5 + i * 0.15,
            type: "spring",
            stiffness: 300,
            damping: 15,
          }}
        />
      ))}
    </svg>
  );
}

/**
 * Screen 3 — Compatibility: Two rhythms, moments of alignment.
 * Immediately readable: two people, sync moments, desire to explore.
 */
export function StepCompatibility({
  onNext,
  onBack,
}: StepCompatibilityProps) {
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

      {/* Illustration */}
      <motion.div
        className="mt-8 rounded-2xl px-4 py-8"
        style={{
          background:
            "color-mix(in srgb, var(--accent-purple) 5%, var(--bg-secondary))",
          border: "1px solid var(--border-light)",
        }}
        variants={fadeInUp}
      >
        <RhythmIllustration />
      </motion.div>

      {/* Headline */}
      <motion.div className="mt-6 text-center" variants={fadeInUp}>
        <h1
          className="font-display text-2xl font-bold leading-tight"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
        >
          See what flows
          <br />
          between you.
        </h1>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--accent-purple)", opacity: 0.7 }}
        >
          Explore compatibility to understand where connection feels
          natural — and where timing gets more complex.
        </p>
      </motion.div>

      {/* Support */}
      <motion.p
        className="mt-2 text-center text-xs"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        variants={fadeInUp}
      >
        Personal, useful, and worth sharing.
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
