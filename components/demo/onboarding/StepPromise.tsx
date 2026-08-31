"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { t, detectLocale, type Locale } from "@/lib/i18n-demo";
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
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => { setLocale(detectLocale()); }, []);

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
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* La marque origami seule, puis le nom en typographie.
            L ancien fichier logo-unfold-start.svg portait le mot « unfold »
            dessine en courbes : impossible de le renommer sans redessiner.
            Le nom est donc pose ici dans la police de l app, en attendant un
            logotype dessine. Le paddingLeft compense l interlettrage final,
            sinon le mot penche a gauche. */}
        <img
          src="/logo/icon-mark.svg"
          alt=""
          aria-hidden="true"
          width={124}
          height={124}
        />
        <span
          className="mt-5 select-none text-[34px] font-light leading-none"
          style={{
            letterSpacing: "0.26em",
            paddingLeft: "0.26em",
            color: "var(--text-brand)",
          }}
        >
          favorable
        </span>
      </motion.div>

      {/* Text zone — 38.2% */}
      <motion.div
        className="relative z-10 flex flex-[1] shrink-0 flex-col items-center px-6"
      >
        {/* The question */}
        <motion.h1
          className="font-display text-[24px] font-bold leading-tight"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {t("onboarding.p1_headline", locale).split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </motion.h1>

        <motion.p
          className="mt-4 max-w-[260px] text-sm leading-relaxed"
          style={{ color: "var(--accent-purple)", opacity: 0.6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {t("onboarding.p1_sub", locale)}
        </motion.p>

        {/* CTA */}
        <motion.div
          className="mt-auto pb-8 pt-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-bg-brand px-8 py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
          >
            {t("onboarding.p1_cta", locale)}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
