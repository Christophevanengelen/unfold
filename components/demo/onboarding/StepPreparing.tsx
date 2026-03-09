"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { scaleIn } from "@/lib/animations";
import { CheckCircle } from "flowbite-react-icons/solid";

const statusLines = [
  "Reading your core timing",
  "Mapping your daily momentum",
  "Preparing your first signal",
];

/**
 * Screen 7 — Preparing Your Rhythm.
 * Total sequence under 3.5s. No artificial delay. Explicit CTA when done.
 */
export function StepPreparing() {
  const router = useRouter();
  const [completed, setCompleted] = useState<number[]>([]);
  const [visible, setVisible] = useState<number[]>([0]);
  const allDone = completed.length === statusLines.length;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    statusLines.forEach((_, i) => {
      // Show step
      timers.push(
        setTimeout(() => {
          setVisible((v) => [...v, i]);
        }, i * 1000)
      );

      // Mark complete (~1s per step)
      timers.push(
        setTimeout(() => {
          setCompleted((c) => [...c, i]);
        }, (i + 1) * 1000)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      {/* Ring indicator */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <svg width="88" height="88" viewBox="0 0 88 88">
          {/* Track */}
          <circle
            cx="44"
            cy="44"
            r="38"
            fill="none"
            stroke="var(--border-muted)"
            strokeWidth="3"
          />
          {/* Animated arc (loading) */}
          {!allDone && (
            <motion.circle
              cx="44"
              cy="44"
              r="38"
              fill="none"
              stroke="var(--accent-purple)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="80 159"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ transformOrigin: "44px 44px" }}
            />
          )}
          {/* Completed — full ring with success color */}
          {allDone && (
            <motion.circle
              cx="44"
              cy="44"
              r="38"
              fill="none"
              stroke="var(--success)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}
        </svg>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="mb-2 font-display text-xl font-bold text-text-heading"
        style={{ letterSpacing: -0.3 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {allDone
          ? "Your first reading is ready."
          : "Preparing your personal rhythm"}
      </motion.h1>

      {/* Body */}
      {!allDone && (
        <motion.p
          className="mb-6 max-w-[240px] text-xs leading-relaxed text-text-body-subtle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          We&apos;re configuring your timing profile and generating your
          first momentum signals.
        </motion.p>
      )}

      {/* Status lines */}
      <div className="w-full max-w-[240px] space-y-3 text-left">
        <AnimatePresence>
          {statusLines.map(
            (text, i) =>
              visible.includes(i) && (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Spinner → Check */}
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {completed.includes(i) ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        }}
                      >
                        <CheckCircle
                          className="h-4 w-4"
                          style={{ color: "var(--success)" }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <div
                          className="h-3.5 w-3.5 rounded-full border-2 border-transparent"
                          style={{
                            borderTopColor: "var(--accent-purple)",
                            borderRightColor: "var(--accent-purple)",
                          }}
                        />
                      </motion.div>
                    )}
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      color: completed.includes(i)
                        ? "var(--text-body)"
                        : "var(--text-body-subtle)",
                    }}
                  >
                    {text}
                  </span>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>

      {/* Explicit CTA — appears only when done */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            className="mt-8 w-full max-w-[240px]"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <button
              type="button"
              onClick={() => router.push("/demo")}
              className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
            >
              See my signal
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
