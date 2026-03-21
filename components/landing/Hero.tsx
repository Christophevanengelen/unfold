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

// ─── Background Boudins (subtle, decorative) ────────────────
// Same visual language as onboarding step 2 — life scroll feel
const BG_BOUDINS = [
  { x: "8%",  y: "15%", w: 12, h: 20, color: "#8B7FC2", opacity: 0.08 },
  { x: "85%", y: "10%", w: 16, h: 28, color: "#6BA89A", opacity: 0.06 },
  { x: "15%", y: "35%", w: 10, h: 14, color: "#C4A86B", opacity: 0.07 },
  { x: "90%", y: "40%", w: 20, h: 36, color: "#9585CC", opacity: 0.08 },
  { x: "5%",  y: "60%", w: 14, h: 24, color: "#D89EA0", opacity: 0.06 },
  { x: "80%", y: "65%", w: 18, h: 32, color: "#B07CC2", opacity: 0.1 },
  { x: "20%", y: "80%", w: 12, h: 18, color: "#50C4D6", opacity: 0.06 },
  { x: "75%", y: "85%", w: 14, h: 22, color: "#6BA89A", opacity: 0.07 },
];

// ─── Signal Result — Boudin visual ──────────────────────────
function SignalResult({ signal }: { signal: GeneratedSignal }) {
  // Boudin dimensions based on tier
  const bw = signal.tier === "toctoctoc" ? 56 : signal.tier === "toctoc" ? 44 : 34;
  const bh = signal.tier === "toctoctoc" ? 96 : signal.tier === "toctoc" ? 72 : 52;
  const mainColor = "#B07CC2"; // warm purple, always

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="mx-auto mt-10 flex flex-col items-center"
    >
      {/* The boudin */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{
          width: bw,
          height: bh,
          borderRadius: bw / 2,
          background: `linear-gradient(135deg, ${mainColor}, color-mix(in srgb, ${mainColor} 60%, transparent))`,
          border: `1.5px solid ${mainColor}`,
          boxShadow: `0 0 40px color-mix(in srgb, ${mainColor} 35%, transparent), 0 0 80px color-mix(in srgb, ${mainColor} 15%, transparent)`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Planet dots inside boudin — vertical */}
        <div className="flex flex-col items-center gap-[4px]">
          {signal.planets.map((key, i) => {
            const planet = planetConfig[key];
            return (
              <motion.div
                key={key}
                className="rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: planet.color,
                  boxShadow: `0 0 6px ${planet.color}80`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 300 }}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Tier dots below boudin */}
      <motion.div
        className="mt-4 flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {Array.from({ length: signal.tier === "toctoctoc" ? 3 : signal.tier === "toctoc" ? 2 : 1 }).map((_, i) => (
          <div key={i} className="h-2 w-2 rounded-full" style={{ backgroundColor: mainColor }} />
        ))}
      </motion.div>

      {/* Planet names */}
      <motion.div
        className="mt-4 flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {signal.planets.map((key) => {
          const planet = planetConfig[key];
          return (
            <span
              key={key}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: `color-mix(in srgb, ${planet.color} 15%, transparent)`,
                color: planet.color,
              }}
            >
              {planet.label}
            </span>
          );
        })}
      </motion.div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="mt-5 max-w-xs text-center text-sm text-brand-10/60"
      >
        {signal.planets.length} planets are shaping your signal right now.
        <br />
        Download the app to see your full timeline.
      </motion.p>
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
      {/* Background boudins — subtle, floating */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {BG_BOUDINS.map((b, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.h,
              borderRadius: Math.min(b.w, b.h) / 2,
              background: `linear-gradient(135deg, color-mix(in srgb, ${b.color} 50%, transparent), color-mix(in srgb, ${b.color} 20%, transparent))`,
              border: `1px solid color-mix(in srgb, ${b.color} 20%, transparent)`,
              opacity: b.opacity,
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Headline block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center" threshold={0.05}>
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t(translations, "hero.v2.eyebrow", "Personal timing engine")}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            {t(translations, "hero.v2.title", "Some periods of your life feel more intense.")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-10 md:text-xl">
            {t(translations, "hero.v2.subtitle", "There is a reason. Enter your birthday.")}
          </p>
        </ScrollReveal>

        {/* Interactive birthday input or signal reveal */}
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

        {/* App Store badges */}
        <ScrollReveal variant="fadeUp" className="mt-6 flex flex-col items-center gap-4" threshold={0.05}>
          <AppStoreBadges />
        </ScrollReveal>
      </div>
    </section>
  );
}
