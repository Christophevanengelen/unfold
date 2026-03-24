"use client";

/**
 * Step 3.5 — What matters most.
 *
 * Ultra-light priority selection: tap 1-3 pills.
 * This is the ONLY personalization data collected during onboarding.
 * Feeds GPT with priorities to customize text from day 1.
 *
 * Stored immediately in user-profile for the AI pipeline.
 */

import { useState } from "react";
import { motion } from "motion/react";

import { S } from "@/lib/layout-constants";
import type { PriorityDomain } from "@/types/user-profile";

const EASE = [0.4, 0, 0.2, 1] as const;
const MAX_PICKS = 3;

interface PriorityOption {
  key: PriorityDomain;
  label: string;
  color: string;
}

const OPTIONS: PriorityOption[] = [
  { key: "love",                label: "Love",         color: "#BC7A96" },
  { key: "career",              label: "Career",       color: "#7B8CC4" },
  { key: "money",               label: "Money",        color: "#B8A472" },
  { key: "family",              label: "Family",       color: "#C48A6A" },
  { key: "health_energy",       label: "Health",       color: "#7BA88A" },
  { key: "creativity",          label: "Creativity",   color: "#A07FBD" },
  { key: "home",                label: "Home",         color: "#C4727A" },
  { key: "friends_network",     label: "Friends",      color: "#6FA3A0" },
  { key: "meaning_spirituality", label: "Meaning",     color: "#9B85C4" },
];

interface StepPrioritiesProps {
  selected: PriorityDomain[];
  onChange: (priorities: PriorityDomain[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPriorities({ selected, onChange, onNext, onBack }: StepPrioritiesProps) {
  const [touched, setTouched] = useState(false);

  const toggle = (key: PriorityDomain) => {
    setTouched(true);
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else if (selected.length < MAX_PICKS) {
      onChange([...selected, key]);
    }
  };

  const canContinue = selected.length >= 1;

  return (
    <motion.div className="flex h-full flex-col">

      {/* Back — top */}
      <motion.button
        type="button"
        onClick={onBack}
        className="self-start text-xs font-medium"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5 mr-1">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      {/* Headline — stays at top */}
      <motion.h1
        className="mt-5 text-center font-display text-2xl font-bold"
        style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
      >
        What matters most?
      </motion.h1>

      <motion.p
        className="mt-1.5 text-center text-sm"
        style={{ color: "var(--accent-purple)", opacity: 0.7 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
      >
        Pick up to {MAX_PICKS}. This shapes your signal.
      </motion.p>

      {/* Pills — centered vertically in remaining space */}
      <div className="flex flex-1 flex-col items-center justify-center">

      {/* Priority pills */}
      <motion.div
        className="mt-6 flex flex-wrap justify-center"
        style={{ gap: S.sm }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
      >
        {OPTIONS.map((opt, i) => {
          const isSelected = selected.includes(opt.key);
          const isDisabled = !isSelected && selected.length >= MAX_PICKS;

          return (
            <motion.button
              key={opt.key}
              type="button"
              onClick={() => !isDisabled && toggle(opt.key)}
              className="rounded-full font-medium transition-all"
              style={{
                fontSize: 13,
                padding: `${S.sm + 2}px ${S.md}px`,
                minHeight: S.touch,
                color: isSelected ? "#fff" : opt.color,
                background: isSelected
                  ? `color-mix(in srgb, ${opt.color} 80%, transparent)`
                  : `color-mix(in srgb, ${opt.color} 10%, transparent)`,
                border: `1.5px solid ${isSelected ? opt.color : `color-mix(in srgb, ${opt.color} 25%, transparent)`}`,
                opacity: isDisabled ? 0.35 : 1,
                boxShadow: isSelected ? `0 0 16px color-mix(in srgb, ${opt.color} 25%, transparent)` : "none",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isDisabled ? 0.35 : 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.05, duration: 0.4, ease: EASE }}
              whileTap={{ scale: 0.95 }}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Counter */}
      <motion.p
        className="mt-4 text-center text-xs"
        style={{ color: "var(--accent-purple)", opacity: touched ? 0.5 : 0 }}
        animate={{ opacity: touched ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {selected.length} / {MAX_PICKS} selected
      </motion.p>
      </div>

      {/* CTA */}
      <motion.div
        className="mt-auto"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          type="button"
          onClick={() => canContinue && onNext()}
          className={`flex w-full items-center justify-center rounded-full text-sm font-semibold transition-all ${
            canContinue
              ? "bg-bg-brand text-text-on-brand shadow-lg active:scale-95"
              : "cursor-not-allowed bg-brand-4 text-text-disabled"
          }`}
          style={{ minHeight: S.touch, padding: `${S.sm + S.xs}px 0` }}
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}
