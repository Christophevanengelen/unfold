"use client";

/**
 * FirstUseGuide — premium spotlight coach marks.
 *
 * - Real spotlight cutout via radial-gradient mask (soft feathered edge)
 * - NO auto-advance — user taps to proceed
 * - Animated arrow pointing to target
 * - Minimal, clean tooltip
 * - One step at a time
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const STORAGE_KEY = "unfold_first_use_done";
const EASE = [0.22, 1, 0.36, 1] as const;

interface GuideStep {
  text: string;
  subtext: string;
  /** Spotlight center (CSS values relative to container) */
  spotX: string;
  spotY: string;
  /** Spotlight radius in px */
  spotRadius: number;
  /** Tooltip position */
  tooltipSide: "above" | "below";
  cta: string;
}

const STEPS: GuideStep[] = [
  {
    text: "You are here.",
    subtext: "This line marks today. Above is your future, below is your past.",
    spotX: "55%",
    spotY: "50%",
    spotRadius: 280,
    tooltipSide: "below",
    cta: "Got it",
  },
  {
    text: "Tap a capsule.",
    subtext: "See which planets are active and what it means for you.",
    spotX: "35%",
    spotY: "48%",
    spotRadius: 80,
    tooltipSide: "below",
    cta: "Start exploring",
  },
];

export function FirstUseGuide({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  const advance = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      localStorage.setItem(STORAGE_KEY, "true");
      onDone();
    }
  }, [step, onDone]);

  const skip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    onDone();
  }, [onDone]);

  const current = STEPS[step];

  // Soft spotlight: radial gradient creates a hole with feathered edges
  const overlayBg = `radial-gradient(circle at ${current.spotX} ${current.spotY}, transparent ${current.spotRadius * 0.5}px, rgba(17, 13, 36, 0.75) ${current.spotRadius}px)`;

  return (
    <motion.div
      className="absolute inset-0 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Overlay with spotlight cutout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="absolute inset-0"
          style={{ background: overlayBg }}
          onClick={advance}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>

      {/* Tooltip */}
      <div
        className="absolute left-5 right-5"
        style={{
          ...(current.tooltipSide === "above"
            ? { top: "12%" }
            : { bottom: "12%" }),
          zIndex: 2,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: current.tooltipSide === "above" ? -16 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          >
            {/* Arrow UP — when tooltip is below target */}
            {current.tooltipSide === "below" && (
              <motion.svg
                width="16" height="10" viewBox="0 0 16 10" fill="none"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M8 0L16 10H0L8 0Z" fill="rgba(149, 133, 204, 0.5)" />
              </motion.svg>
            )}

            {/* Card */}
            <div
              className="w-full rounded-2xl text-center"
              style={{
                background: "rgba(27, 21, 53, 0.85)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(149, 133, 204, 0.2)",
                padding: "24px 20px 20px",
              }}
            >
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: "rgba(255, 255, 255, 0.95)",
                  marginBottom: 6,
                }}
              >
                {current.text}
              </p>

              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "rgba(149, 133, 204, 0.7)",
                  marginBottom: 20,
                }}
              >
                {current.subtext}
              </p>

              <motion.button
                type="button"
                onClick={(e) => { e.stopPropagation(); advance(); }}
                className="w-full rounded-[16px] font-semibold"
                style={{
                  fontSize: 14,
                  padding: "14px 0",
                  background: "var(--accent-purple)",
                  color: "#fff",
                }}
                whileTap={{ scale: 0.97 }}
              >
                {current.cta}
              </motion.button>

              {step < STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); skip(); }}
                  className="mt-2 w-full"
                  style={{
                    fontSize: 11,
                    color: "rgba(149, 133, 204, 0.35)",
                    padding: "10px 0",
                  }}
                >
                  Skip
                </button>
              )}
            </div>

            {/* Arrow DOWN — when tooltip is above target */}
            {current.tooltipSide === "above" && (
              <motion.svg
                width="16" height="10" viewBox="0 0 16 10" fill="none"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M8 10L0 0H16L8 10Z" fill="rgba(149, 133, 204, 0.5)" />
              </motion.svg>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Gate ─────────────────────────────────────────────────

export function shouldShowFirstUseGuide(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("unfold_timeline_welcomed") === "true"
    && !localStorage.getItem(STORAGE_KEY);
}
