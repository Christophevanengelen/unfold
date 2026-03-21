"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { scaleIn } from "@/lib/animations";
import { CheckCircle } from "flowbite-react-icons/solid";
import { useMomentum } from "@/lib/momentum-store";
import { saveBirthData, resolveCity, type BirthData } from "@/lib/birth-data";
import type { OnboardingFormData } from "./StepInput";

const statusLines = [
  "Reading your planetary signals",
  "Building your momentum timeline",
  "Preparing your first capsule",
];

/**
 * Screen 5 — Preparing Your Signal.
 * Calls the real Momentum Engine API with the user's birth data.
 * Status lines track real progress. Explicit CTA when done.
 */
export function StepPreparing({ formData }: { formData?: OnboardingFormData }) {
  const router = useRouter();
  const { loadSignals, state } = useMomentum();
  const [completed, setCompleted] = useState<number[]>([]);
  const [visible, setVisible] = useState<number[]>([0]);
  const [error, setError] = useState<string | null>(null);
  const allDone = completed.length === statusLines.length;
  const didStart = useRef(false);

  useEffect(() => {
    if (didStart.current) return;
    didStart.current = true;

    async function run() {
      // Step 1: Reading signals (show immediately)
      setVisible([0]);

      // Build birth data from form or use demo defaults
      const coords = resolveCity(formData?.placeOfBirth || "Brussels");
      const birthData: BirthData = {
        nickname: formData?.nickname || "You",
        birthDate: formData?.dob || "1990-01-15",
        birthTime: formData?.timeOfBirth || "12:00",
        latitude: coords.lat,
        longitude: coords.lng,
        timezone: coords.tz,
        placeOfBirth: formData?.placeOfBirth || "Brussels",
      };

      // Save birth data to localStorage
      saveBirthData(birthData);

      try {
        // Step 1 complete + show step 2
        setTimeout(() => {
          setCompleted((c) => [...c, 0]);
          setVisible((v) => [...v, 1]);
        }, 800);

        // Call the real API
        await loadSignals(birthData);

        // Step 2 complete + show step 3
        setCompleted((c) => [...c, 1]);
        setVisible((v) => [...v, 2]);

        // Step 3 complete (brief delay for animation)
        setTimeout(() => {
          setCompleted((c) => [...c, 2]);
        }, 600);
      } catch {
        setError("Connection issue — using sample data instead.");
        // Complete all steps so CTA appears (mock data fallback)
        setCompleted([0, 1, 2]);
        setVisible([0, 1, 2]);
      }
    }

    run();
  }, [formData, loadSignals]);

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
        className="mb-2 font-display text-xl font-bold"
        style={{ color: "var(--accent-purple)", letterSpacing: -0.3 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {allDone
          ? "Your signal is ready."
          : "Preparing your personal signal"}
      </motion.h1>

      {/* Body */}
      {!allDone && (
        <motion.p
          className="mb-6 max-w-[240px] text-xs leading-relaxed"
          style={{ color: "var(--accent-purple)", opacity: 0.5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          We&apos;re reading your planetary signals and building your
          momentum timeline.
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
                      color: "var(--accent-purple)",
                      opacity: completed.includes(i) ? 0.7 : 0.5,
                    }}
                  >
                    {text}
                  </span>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>

      {/* Error banner (subtle) */}
      {error && allDone && (
        <motion.p
          className="mt-4 max-w-[240px] text-center text-[11px]"
          style={{ color: "var(--accent-purple)", opacity: 0.5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

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
