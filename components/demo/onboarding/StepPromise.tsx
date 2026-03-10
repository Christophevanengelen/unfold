"use client";

import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import Image from "next/image";

interface StepPromiseProps {
  onNext: () => void;
}

/**
 * Screen 1 — Core Promise
 * Classic app first screen: logo hero in the upper zone with generous
 * breathing room, text + CTA anchored in the bottom zone.
 * Golden-ratio split: logo zone 61.8%, text zone 38.2%.
 */
export function StepPromise({ onNext }: StepPromiseProps) {
  return (
    <div className="flex h-full flex-col items-center text-center">
      {/* Subtle halo glow — centered on logo zone */}
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

      {/* ── LOGO ZONE — 61.8% of height, centered logo with generous air ── */}
      <motion.div
        className="relative z-10 flex flex-[1.618] flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
      >
        <Image
          src="/logo-unfold-start.svg"
          alt="Unfold"
          width={190}
          height={162}
          priority
        />
      </motion.div>

      {/* ── TEXT ZONE — 38.2% of height, text + CTA at bottom ── */}
      <motion.div
        className="relative z-10 flex flex-[1] shrink-0 flex-col items-center px-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Headline */}
        <motion.h1
          className="font-display text-[28px] font-bold leading-tight"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
          variants={fadeInUp}
        >
          Know when life moves
          <br />
          in your favor.
        </motion.h1>

        {/* Body */}
        <motion.p
          className="mt-3 max-w-[260px] text-sm leading-relaxed"
          style={{ color: "var(--accent-purple)", opacity: 0.7 }}
          variants={fadeInUp}
        >
          A daily read of your personal rhythm across Love, Health, and Work.
        </motion.p>

        {/* Support line */}
        <motion.p
          className="mt-1.5 text-xs"
          style={{ color: "var(--accent-purple)", opacity: 0.5 }}
          variants={fadeInUp}
        >
          Clear today. Better timing ahead.
        </motion.p>

        {/* CTA — anchored at bottom of text zone */}
        <motion.div className="mt-auto pb-8 pt-6" variants={fadeInUp}>
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-bg-brand px-8 py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
