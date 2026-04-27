"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface LoadingNarratorProps {
  /** External signal that the request finished — used to advance to the final stage immediately. */
  done?: boolean;
}

const STAGES = [
  { eyebrow: "Étape 1 / 3", text: "Calcul de ton thème natal", minMs: 1800 },
  { eyebrow: "Étape 2 / 3", text: "Lecture des transits actifs", minMs: 2400 },
  { eyebrow: "Étape 3 / 3", text: "Synthèse par notre IA", minMs: 2800 },
] as const;

/**
 * 3-stage narration for the Hero signal reveal.
 * Stages auto-advance on a paced timer (so a fast cache-hit still reads as
 * "intentional depth" rather than "what just happened?"). When `done` flips
 * true mid-cycle, we coalesce to the final stage.
 */
export function LoadingNarrator({ done }: LoadingNarratorProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (done) {
      setStage(STAGES.length - 1);
      return;
    }
    if (stage >= STAGES.length - 1) return;
    const t = setTimeout(() => setStage((s) => s + 1), STAGES[stage].minMs);
    return () => clearTimeout(t);
  }, [stage, done]);

  const current = STAGES[stage];
  const progress = ((stage + 1) / STAGES.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto mt-10 w-full max-w-md"
    >
      <div className="landing-glass relative overflow-hidden rounded-2xl border border-white/10 px-6 py-7">
        {/* Pulsing boudin */}
        <div className="mb-4 flex justify-center">
          <motion.div
            className="h-3 w-12 rounded-full"
            style={{
              background: "linear-gradient(90deg, var(--accent-purple), color-mix(in srgb, var(--accent-purple) 40%, transparent))",
            }}
            animate={{ scaleX: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Stage text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.eyebrow}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-center"
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--accent-purple)", opacity: 0.7 }}
            >
              {current.eyebrow}
            </p>
            <p className="mt-1.5 font-display text-base font-medium text-white/90">
              {current.text}
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                aria-hidden
              >
                …
              </motion.span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full"
            style={{ background: "var(--accent-purple)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
