"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppStoreBadges } from "./AppStoreBadges";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { planetConfig } from "@/lib/domain-config";
import { generateSignalFromDate } from "@/lib/signal-generator";
import type { GeneratedSignal } from "@/lib/signal-generator";
import type { TranslationMap } from "@/lib/i18n";

interface HeroProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// ─── Signal Result Card ──────────────────────────────────────
function SignalResult({ signal }: { signal: GeneratedSignal }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="mx-auto mt-8 max-w-sm"
    >
      <div
        className="landing-glass relative overflow-hidden rounded-3xl p-8 text-center"
        style={{
          border: "1px solid color-mix(in srgb, var(--accent-purple) 30%, transparent)",
          boxShadow: "0 0 40px color-mix(in srgb, var(--accent-purple) 15%, transparent)",
        }}
      >
        {/* Intensity number */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          <span
            className="font-display text-6xl font-bold tabular-nums"
            style={{ color: "var(--text-heading)" }}
          >
            {signal.intensity}
          </span>
        </motion.div>

        {/* Tier label */}
        <p
          className="mt-2 text-xs font-bold uppercase tracking-[0.3em]"
          style={{ color: "var(--accent-purple)" }}
        >
          {signal.tierLabel.charAt(0) + signal.tierLabel.slice(1).toLowerCase()}
        </p>

        {/* Planet dots */}
        <div className="mt-5 flex items-center justify-center gap-3">
          {signal.planets.map((key, i) => {
            const planet = planetConfig[key];
            return (
              <motion.div
                key={key}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 300 }}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{
                    background: planet.color,
                    boxShadow: `0 0 10px ${planet.color}`,
                  }}
                />
                <span className="text-[9px] uppercase tracking-wider text-brand-10/50">
                  {planet.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-sm text-brand-10/60"
        >
          Add your birth time in the app for full precision.
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─── Birthday Input ──────────────────────────────────────────
function BirthdayInput({
  onSubmit,
  ctaLabel,
}: {
  onSubmit: (date: string) => void;
  ctaLabel: string;
}) {
  const [date, setDate] = useState("");

  const handleSubmit = () => {
    if (date) onSubmit(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mx-auto mt-8 flex max-w-md items-center gap-3"
    >
      <div className="relative flex-1">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white backdrop-blur-sm transition-colors placeholder:text-brand-10/40 focus:border-logo-lavender/40 focus:outline-none focus:ring-1 focus:ring-logo-lavender/20"
          max={new Date().toISOString().split("T")[0]}
          min="1920-01-01"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!date}
        className="rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-30"
        style={{
          background: "var(--accent-purple)",
          boxShadow: date ? "0 0 20px color-mix(in srgb, var(--accent-purple) 30%, transparent)" : "none",
        }}
      >
        {ctaLabel}
      </button>
    </motion.div>
  );
}

// ─── Main Hero ───────────────────────────────────────────────
export function Hero({ translations }: HeroProps) {
  const [signal, setSignal] = useState<GeneratedSignal | null>(null);

  const handleDateSubmit = (dateString: string) => {
    setSignal(generateSignalFromDate(dateString));
  };

  return (
    <section className="relative overflow-hidden py-28 md:py-36 lg:py-44">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Headline block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center" threshold={0.05}>
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t(translations, "hero.eyebrow", "Personal timing app")}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            {t(translations, "hero.title", "Your days have a rhythm. See yours.")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-10 md:text-xl">
            {t(translations, "hero.subtitle", "Enter your birthday and discover the signal shaping your timing right now.")}
          </p>
        </ScrollReveal>

        {/* Interactive birthday → signal reveal */}
        <AnimatePresence mode="wait">
          {!signal ? (
            <BirthdayInput
              key="input"
              onSubmit={handleDateSubmit}
              ctaLabel={t(translations, "hero.cta", "See my signal")}
            />
          ) : (
            <SignalResult key="result" signal={signal} />
          )}
        </AnimatePresence>

        {/* Micro social proof */}
        <ScrollReveal variant="fadeUp" className="mt-8 text-center" threshold={0.05}>
          <p className="text-sm text-brand-10/40">
            {t(translations, "hero.social", "Trusted by 2,400+ people who value clarity")}
          </p>
        </ScrollReveal>

        {/* App Store badges — always visible */}
        <ScrollReveal variant="fadeUp" className="mt-6 flex flex-col items-center gap-4" threshold={0.05}>
          <AppStoreBadges />
        </ScrollReveal>
      </div>
    </section>
  );
}
