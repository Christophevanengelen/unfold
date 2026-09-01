"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CTA_IMMEDIAT, CTA_DEPART, CTA_ARRIVEE } from "@/lib/onboarding-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ScoreRing } from "@/components/demo/ScoreRing";
import { SatelliteScores } from "@/components/demo/SatelliteScores";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useMemo } from "react";
import { useMomentum } from "@/lib/momentum-store";
import { previsionSemaine, scoresDuJour, phaseDominante } from "@/lib/prevision-semaine";

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
  const { phases } = useMomentum();
  const { scoreDuJour, ecartVeille, aujourdhui, ecarts, dominante } = useMemo(() => {
    const hier = new Date();
    hier.setHours(0, 0, 0, 0);
    hier.setDate(hier.getDate() - 1);
    const ce = new Date(hier);
    ce.setDate(ce.getDate() + 1);
    const p = previsionSemaine(phases ?? [], hier, 2);
    const h = scoresDuJour(phases ?? [], hier);
    const a = scoresDuJour(phases ?? [], ce);
    return {
      scoreDuJour: p[1].momentum,
      ecartVeille: p[1].momentum - p[0].momentum,
      aujourdhui: a,
      // Ce qui est vrai aujourd hui, plutot qu une analyse fabriquee.
      dominante: phaseDominante(phases ?? [], ce),
      ecarts: { love: a.love - h.love, health: a.health - h.health, work: a.work - h.work },
    };
  }, [phases]);

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
          // Le vrai score du jour, calcule depuis les phases de la personne.
          //
          // C etait mockToday.overall : un chiffre invente, le meme pour tout
          // le monde, montre pendant l onboarding comme si c etait le sien. La
          // promesse du produit est de lire SON rythme ; commencer par un
          // chiffre fabrique la contredit des la premiere seconde.
          score={scoreDuJour}
          color="var(--accent-purple)"
          size={130}
          strokeWidth={1.5}
          isActive={active}
          delay={0.4}
          // L ecart avec la veille, reel lui aussi.
          delta={ecartVeille}
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
              value={scoreDuJour}
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
            love={aujourdhui.love}
            health={aujourdhui.health}
            work={aujourdhui.work}
            deltas={ecarts}
            isActive={active}
          />
        </div>

        {/* Insight line */}
        <motion.p
          className="mt-5 max-w-[260px] text-center text-[11px] leading-relaxed"
          // --text-brand : accent-purple a 50 % d opacite passait sous le seuil.
          style={{ color: "var(--text-brand)", opacity: 0.85 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          {/* Le titre de la periode reellement ouverte. Quand il n y en a
              aucune, la ligne disparait — c est plus honnete qu une phrase
              generique, et cela n arrive que les jours effectivement calmes. */}
          {dominante?.title ?? ""}
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
      <motion.div className="mt-auto pt-6" initial={CTA_DEPART} animate={CTA_ARRIVEE} transition={CTA_IMMEDIAT}>
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
