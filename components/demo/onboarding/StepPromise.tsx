"use client";

import { motion } from "motion/react";
/* eslint-disable @next/next/no-img-element */

interface StepPromiseProps {
  onNext: () => void;
}

/**
 * Step 1 — Emotional Hook.
 *
 * "Have you ever felt that some periods of your life
 *  were more intense than others?"
 *
 * Logo + one powerful question. Silence visuelle = puissance.
 * The user thinks "yes" and taps.
 */
export function StepPromise({ onNext }: StepPromiseProps) {
  return (
    <div className="flex h-full flex-col items-center text-center">
      {/* Subtle halo glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, var(--bg-brand-soft) 0%, transparent 55%)",
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Logo zone — golden ratio 61.8% */}
      <motion.div
        className="relative z-10 flex flex-[1.618] flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
      >
        <img
          src="/logo-unfold-start.svg"
          alt="Unfold"
          width={190}
          height={162}
        />
      </motion.div>

      {/* Text zone — 38.2% */}
      <motion.div
        className="relative z-10 flex flex-[1] shrink-0 flex-col items-center px-6"
      >
        {/* The question */}
        <motion.h1
          className="font-display text-[24px] font-bold leading-tight"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Some periods of your life
          <br />
          feel more intense.
        </motion.h1>

        <motion.p
          className="mt-4 max-w-[260px] text-sm leading-relaxed"
          style={{ color: "var(--accent-purple)", opacity: 0.6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          There is a reason.
        </motion.p>

        {/* CTA */}
        <motion.div
          className="mt-auto pb-8 pt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-bg-brand px-8 py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
          >
            Show me
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
