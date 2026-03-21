"use client";

import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { OnboardingProgress } from "./OnboardingProgress";

export interface OnboardingFormData {
  nickname: string;
  dob: string;
  timeOfBirth: string;
  placeOfBirth: string;
}

interface StepInputProps {
  formData: OnboardingFormData;
  onChange: (data: OnboardingFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

const fields = [
  {
    key: "nickname" as const,
    label: "Nickname",
    type: "text",
    placeholder: "How should we call you?",
  },
  {
    key: "dob" as const,
    label: "Date of birth",
    type: "date",
    placeholder: "",
  },
  {
    key: "timeOfBirth" as const,
    label: "Time of birth",
    type: "time",
    placeholder: "HH:MM",
    helper: "The more precise, the better your signal.",
  },
  {
    key: "placeOfBirth" as const,
    label: "Place of birth",
    type: "text",
    placeholder: "City, Country",
  },
];

/**
 * Screen 6 — Configure Your Signal: All fields feel expected, none marked optional.
 * Configuration tone, not bureaucratic. All 4 fields required.
 */
export function StepInput({
  formData,
  onChange,
  onNext,
  onBack,
}: StepInputProps) {
  const isValid =
    formData.nickname.trim() !== "" &&
    formData.dob !== "" &&
    formData.timeOfBirth !== "" &&
    formData.placeOfBirth.trim() !== "";

  const handleChange = (key: keyof OnboardingFormData, value: string) => {
    onChange({ ...formData, [key]: value });
  };

  return (
    <motion.div
      className="flex h-full flex-col"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <OnboardingProgress current={3} />

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
      <motion.h1
        className="mt-5 font-display text-2xl font-bold"
        style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
        variants={fadeInUp}
      >
        Your timing is unique.
      </motion.h1>
      <motion.p
        className="mt-1.5 text-sm"
        style={{ color: "var(--accent-purple)", opacity: 0.7 }}
        variants={fadeInUp}
      >
        Born at a different moment, different signal. Enter yours.
      </motion.p>

      {/* Form fields */}
      <div className="mt-5 space-y-3.5">
        {fields.map((field, i) => (
          <motion.div
            key={field.key}
            className="rounded-2xl border border-border-light bg-bg-secondary px-4 py-3.5 transition-colors duration-200 focus-within:border-accent-purple"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.35 }}
          >
            <label>
              <span
                className="font-medium uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--accent-purple)",
                  opacity: 0.5,
                }}
              >
                {field.label}
              </span>
              <input
                type={field.type}
                value={formData[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1 w-full bg-transparent text-base font-medium outline-none placeholder:text-brand-5"
                style={{ color: "var(--accent-purple)" }}
              />
            </label>
            {"helper" in field && field.helper && (
              <p
                className="mt-1"
                style={{ fontSize: 10, color: "var(--accent-purple)", opacity: 0.5 }}
              >
                {field.helper}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Reassurance */}
      <motion.p
        className="mt-4 text-center text-xs"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        variants={fadeInUp}
      >
        Your details are only used to prepare your personal rhythm.
      </motion.p>

      {/* CTA */}
      <motion.div className="mt-auto pt-4" variants={fadeInUp}>
        <button
          type="button"
          onClick={() => isValid && onNext()}
          className={`flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition-all ${
            isValid
              ? "bg-bg-brand text-text-on-brand shadow-lg active:scale-95"
              : "cursor-not-allowed bg-brand-4 text-text-disabled"
          }`}
        >
          Prepare my signal
        </button>
      </motion.div>
    </motion.div>
  );
}
