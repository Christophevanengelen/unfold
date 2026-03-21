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

// ─── Signal Result — Rich mini-report ───────────────────────
function SignalResult({ signal }: { signal: GeneratedSignal }) {
  const mainColor = "#B07CC2";
  const tierLabel = signal.tier === "toctoctoc" ? "Strong" : signal.tier === "toctoc" ? "Clear" : "Subtle";
  // Simulated rich data based on signal (deterministic from intensity)
  const durationWeeks = Math.round(4 + (signal.intensity / 100) * 12);
  const upcomingCount = 2 + (signal.intensity % 3);
  const bw = signal.tier === "toctoctoc" ? 48 : signal.tier === "toctoc" ? 38 : 30;
  const bh = signal.tier === "toctoctoc" ? 80 : signal.tier === "toctoc" ? 60 : 44;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="mx-auto mt-10 max-w-md"
    >
      <div
        className="landing-glass relative overflow-hidden rounded-3xl p-6 md:p-8"
        style={{
          border: "1px solid color-mix(in srgb, var(--accent-purple) 25%, transparent)",
          boxShadow: "0 0 40px color-mix(in srgb, var(--accent-purple) 12%, transparent)",
        }}
      >
        {/* Top row: boudin + signal summary */}
        <div className="flex items-center gap-5">
          {/* Boudin */}
          <motion.div
            className="relative flex-shrink-0 flex items-center justify-center"
            style={{
              width: bw,
              height: bh,
              borderRadius: bw / 2,
              background: `linear-gradient(135deg, ${mainColor}, color-mix(in srgb, ${mainColor} 60%, transparent))`,
              border: `1.5px solid ${mainColor}`,
              boxShadow: `0 0 30px color-mix(in srgb, ${mainColor} 30%, transparent)`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="flex flex-col items-center gap-[3px]">
              {signal.planets.map((key) => {
                const planet = planetConfig[key];
                return (
                  <div key={key} className="rounded-full"
                    style={{ width: 5, height: 5, backgroundColor: planet.color, boxShadow: `0 0 4px ${planet.color}80` }} />
                );
              })}
            </div>
          </motion.div>

          {/* Signal summary */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: mainColor }}>
              Your current signal
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {tierLabel} intensity
            </p>
            <p className="mt-0.5 text-sm text-brand-10/60">
              ~{durationWeeks} weeks remaining
            </p>
          </motion.div>
        </div>

        {/* Planet pills */}
        <motion.div
          className="mt-5 flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {signal.planets.map((key) => {
            const planet = planetConfig[key];
            return (
              <span key={key} className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: `color-mix(in srgb, ${planet.color} 12%, transparent)`, color: planet.color }}>
                {planet.label}
              </span>
            );
          })}
        </motion.div>

        {/* Divider */}
        <div className="my-5 h-px w-full" style={{ background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)" }} />

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div>
            <p className="text-2xl font-bold text-white">{upcomingCount}</p>
            <p className="text-xs text-brand-10/50">momentum periods this year</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{signal.planets.length}</p>
            <p className="text-xs text-brand-10/50">planets active right now</p>
          </div>
        </motion.div>

        {/* Teaser */}
        <motion.p
          className="mt-5 text-sm text-brand-10/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          This is just a preview. The app reveals your full timeline, peak windows, and life domains.
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
