"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMomentum } from "@/lib/momentum-store";

const EASE = [0.4, 0, 0.2, 1] as const;
const STORAGE_KEY = "unfold_timeline_welcomed";

/**
 * First-time welcome overlay for the timeline.
 *
 * Shows ONCE after onboarding. A cinematic moment:
 * name → personal message → the timeline fades in behind.
 *
 * After dismissal, never shows again (localStorage flag).
 */
export function TimelineWelcome({ onDone }: { onDone: () => void }) {
  const { birthData } = useMomentum();
  const name = birthData?.nickname || "You";

  const [phase, setPhase] = useState<"name" | "message" | "fade">("name");

  useEffect(() => {
    // name → message → fade out
    const t1 = setTimeout(() => setPhase("message"), 2000);
    const t2 = setTimeout(() => setPhase("fade"), 5500);
    const t3 = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "true");
      onDone();
    }, 6800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase !== "fade" ? (
        <motion.div
          key="welcome"
          className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center px-8"
          style={{ background: "var(--bg-primary)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <AnimatePresence mode="wait">
            {phase === "name" && (
              <motion.div
                key="name"
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <motion.p
                  className="text-sm font-medium"
                  style={{ color: "var(--accent-purple)", opacity: 0.6 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
                >
                  Welcome,
                </motion.p>
                <motion.h1
                  className="mt-2 font-display text-4xl font-bold"
                  style={{ color: "var(--accent-purple)", letterSpacing: -1 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1, ease: EASE }}
                >
                  {name}.
                </motion.h1>
              </motion.div>
            )}

            {phase === "message" && (
              <motion.div
                key="message"
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <motion.p
                  className="max-w-[260px] text-lg font-medium leading-relaxed"
                  style={{ color: "var(--accent-purple)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 1, ease: EASE }}
                >
                  This is your rhythm.
                </motion.p>
                <motion.p
                  className="mt-3 max-w-[240px] text-sm leading-relaxed"
                  style={{ color: "var(--accent-purple)", opacity: 0.5 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1, ease: EASE }}
                >
                  Every signal from birth to what lies ahead.
                  <br />
                  Tap any capsule to explore.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        // Fade phase — overlay dissolves, timeline appears behind
        <motion.div
          key="fade"
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ background: "var(--bg-primary)" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
        />
      )}
    </AnimatePresence>
  );
}

/** Check if this is the first visit */
export function shouldShowWelcome(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(STORAGE_KEY);
}
