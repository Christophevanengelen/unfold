"use client";

/**
 * FirstUseGuide — interactive spotlight onboarding on the timeline.
 *
 * Best practices applied (2025):
 * - Spotlight + coach marks: dim everything except the target element
 * - Learning by doing: each step asks the user to ACT, not just read
 * - Progressive disclosure: 3 steps max, each reveals one concept
 * - Position-aware: tooltip points to the actual UI element
 * - Auto-dismiss: skip after timeout, never block
 *
 * Sources:
 * - plotline.so/blog/coachmarks-and-spotlight-ui-mobile-apps
 * - appcues.com/blog/choosing-the-right-onboarding-ux-pattern
 * - guidejar.com/blog/7-user-onboarding-best-practices-that-actually-work-in-2025
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { S } from "@/lib/layout-constants";

const STORAGE_KEY = "unfold_first_use_done";
const EASE = [0.4, 0, 0.2, 1] as const;

// ─── Steps: each targets a real UI zone ──────────────────

interface GuideStep {
  /** Main instruction — short, action-oriented */
  text: string;
  /** Supporting detail */
  subtext: string;
  /** Where the tooltip appears */
  tooltipPosition: "top" | "center" | "bottom";
  /** What area to spotlight (CSS description for the "hole" in the overlay) */
  spotlightZone: "now-line" | "capsule" | "scroll-area";
  /** CTA label — what the user should do */
  cta: string;
  /** Auto-advance timeout (ms) */
  timeout: number;
}

const STEPS: GuideStep[] = [
  {
    text: "You are here.",
    subtext: "This line marks today. Everything above is your future. Everything below, your past.",
    tooltipPosition: "top",
    spotlightZone: "now-line",
    cta: "Got it",
    timeout: 8000,
  },
  {
    text: "These are your signals.",
    subtext: "Each capsule is a period shaped by planetary momentum. The bigger it is, the stronger the signal.",
    tooltipPosition: "top",
    spotlightZone: "capsule",
    cta: "Next",
    timeout: 8000,
  },
  {
    text: "Tap any capsule to explore.",
    subtext: "You'll see which planets are active, which areas of your life are touched, and what it means for you.",
    tooltipPosition: "center",
    spotlightZone: "scroll-area",
    cta: "Start exploring",
    timeout: 10000,
  },
];

// ─── Component ───────────────────────────────────────────

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

  // Auto-advance after timeout
  useEffect(() => {
    const timer = setTimeout(advance, STEPS[step].timeout);
    return () => clearTimeout(timer);
  }, [step, advance]);

  const current = STEPS[step];

  // Tooltip vertical position
  const tooltipStyle: React.CSSProperties =
    current.tooltipPosition === "top"
      ? { top: "15%", left: S.lg, right: S.lg }
      : current.tooltipPosition === "bottom"
        ? { bottom: "20%", left: S.lg, right: S.lg }
        : { top: "50%", left: S.lg, right: S.lg, transform: "translateY(-50%)" };

  return (
    <motion.div
      className="absolute inset-0 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {/* Dark overlay with spotlight "hole" */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(17, 13, 36, 0.65)" }}
      />

      {/* Spotlight ring — pulses around the target zone */}
      {current.spotlightZone === "now-line" && (
        <motion.div
          className="absolute left-0 right-0"
          style={{ top: "50%", transform: "translateY(-50%)", height: 48, zIndex: 1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full w-full"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, rgba(124, 107, 191, 0.08) 40%, rgba(124, 107, 191, 0.08) 60%, transparent 100%)",
              border: "none",
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}

      {current.spotlightZone === "capsule" && (
        <motion.div
          className="absolute"
          style={{
            top: "35%", left: "25%", width: 100, height: 120,
            borderRadius: 24,
            border: "1.5px solid rgba(124, 107, 191, 0.4)",
            boxShadow: "0 0 40px rgba(124, 107, 191, 0.15)",
            zIndex: 1,
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Tooltip card */}
      <div className="absolute" style={{ ...tooltipStyle, zIndex: 2 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="rounded-2xl text-center"
            style={{
              background: "rgba(124, 107, 191, 0.12)",
              backdropFilter: "blur(32px)",
              border: "1px solid rgba(124, 107, 191, 0.25)",
              padding: `${S.lg}px ${S.lg}px ${S.md}px`,
            }}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {/* Step counter */}
            <p
              className="font-semibold uppercase"
              style={{
                fontSize: 9,
                letterSpacing: "0.15em",
                color: "var(--accent-purple)",
                opacity: 0.5,
                marginBottom: S.sm,
              }}
            >
              {step + 1} / {STEPS.length}
            </p>

            {/* Main text */}
            <p
              className="font-medium"
              style={{
                fontSize: 17,
                lineHeight: 1.4,
                color: "rgba(255, 255, 255, 0.95)",
                marginBottom: S.sm,
              }}
            >
              {current.text}
            </p>

            {/* Subtext */}
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--accent-purple)",
                opacity: 0.7,
                marginBottom: S.lg,
              }}
            >
              {current.subtext}
            </p>

            {/* CTA button — actionable */}
            <motion.button
              type="button"
              onClick={advance}
              className="rounded-full font-semibold"
              style={{
                fontSize: 13,
                padding: `${S.sm + S.xs}px ${S.lg}px`, // 12px 24px
                background: "var(--accent-purple)",
                color: "#fff",
                minHeight: S.touch, // 44px — Apple HIG
                width: "100%",
              }}
              whileTap={{ scale: 0.97 }}
            >
              {current.cta}
            </motion.button>

            {/* Skip option */}
            {step < STEPS.length - 1 && (
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(STORAGE_KEY, "true");
                  onDone();
                }}
                className="mt-3 w-full"
                style={{
                  fontSize: 11,
                  color: "var(--accent-purple)",
                  opacity: 0.35,
                  padding: `${S.sm}px 0`,
                  minHeight: S.touch,
                }}
              >
                Skip tour
              </button>
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
