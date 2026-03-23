"use client";

/**
 * MicroRefresh — contextual micro-prompt for volatile profile fields.
 *
 * Shows as a subtle banner at the top of the detail sheet when
 * stressLevel or currentGoal are stale (expired TTL).
 *
 * NOT a modal, NOT a form. Just 1 question with chip answers.
 * Appears inline, dismisses with a tap.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { StressLevel, CurrentGoalPreset } from "@/types/user-profile";
import { getUserProfileSync, saveUserProfile } from "@/lib/user-profile";

interface MicroRefreshProps {
  field: "stressLevel" | "currentGoal";
  onDone: () => void;
}

const STRESS_OPTIONS: { value: StressLevel; label: string }[] = [
  { value: "low", label: "Calme" },
  { value: "medium", label: "Modéré" },
  { value: "high", label: "Élevé" },
];

const GOAL_OPTIONS: { value: CurrentGoalPreset; label: string }[] = [
  { value: "stabilize", label: "Stabiliser" },
  { value: "clarify", label: "Clarifier" },
  { value: "advance", label: "Avancer" },
  { value: "protect", label: "Protéger" },
  { value: "change", label: "Changer" },
];

export function MicroRefresh({ field, onDone }: MicroRefreshProps) {
  const [dismissed, setDismissed] = useState(false);

  const question = field === "stressLevel"
    ? "Ton niveau de charge en ce moment ?"
    : "Ton focus du moment ?";

  const options = field === "stressLevel" ? STRESS_OPTIONS : GOAL_OPTIONS;

  const handleSelect = async (value: string) => {
    const profile = getUserProfileSync() ?? {};
    if (field === "stressLevel") {
      profile.stressLevel = value as StressLevel;
      profile.stressLevelSetAt = new Date().toISOString();
    } else {
      profile.currentGoal = value as CurrentGoalPreset;
      profile.currentGoalSetAt = new Date().toISOString();
    }
    await saveUserProfile(profile);
    setDismissed(true);
    setTimeout(onDone, 300);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden mb-4"
        >
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "color-mix(in srgb, var(--accent-purple) 8%, var(--bg-tertiary))",
              border: "1px solid color-mix(in srgb, var(--accent-purple) 15%, transparent)",
            }}
          >
            <p
              className="text-[11px] font-medium mb-2.5"
              style={{ color: "var(--text-body)" }}
            >
              {question}
            </p>
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(opt.value)}
                  className="rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors"
                  style={{
                    background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)",
                    color: "var(--accent-purple)",
                    border: "1px solid color-mix(in srgb, var(--accent-purple) 20%, transparent)",
                  }}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
