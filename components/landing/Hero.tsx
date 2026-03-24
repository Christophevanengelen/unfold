"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppStoreBadges } from "./AppStoreBadges";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { planetConfig, houseConfig } from "@/lib/domain-config";
import { Lightbulb, ArrowRight, Fire } from "flowbite-react-icons/outline";
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

// ─── Tier helpers ───────────────────────────────────────────
function tierDisplayLabel(tier: string): string {
  if (tier === "toctoctoc") return "Moment fort";
  if (tier === "toctoc") return "Signal clair";
  return "Signal subtil";
}

// ─── Signal Result — Premium mini detail sheet ──────────────
function SignalResult({ signal }: { signal: GeneratedSignal }) {
  const hm = houseConfig[signal.house];
  const houseColor = hm.color;
  const secondaryHm = signal.secondaryHouse ? houseConfig[signal.secondaryHouse] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="mx-auto mt-10 max-w-md"
    >
      <div
        className="landing-glass relative overflow-hidden rounded-3xl"
        style={{
          border: "1px solid color-mix(in srgb, var(--accent-purple) 25%, transparent)",
          boxShadow: "0 0 60px color-mix(in srgb, var(--accent-purple) 15%, transparent)",
        }}
      >
        {/* ── Header: context banner ── */}
        <div className="px-6 pt-6 pb-0 md:px-8 md:pt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: `color-mix(in srgb, ${houseColor} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${houseColor} 25%, transparent)`,
              }}>
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: houseColor }} />
              <Fire size={10} style={{ color: houseColor }} />
              <span className="text-[10px] font-semibold" style={{ color: houseColor }}>
                Signal actif
              </span>
            </div>
            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{
                background: "color-mix(in srgb, var(--accent-purple) 15%, transparent)",
                color: "var(--accent-purple)",
              }}>
              {signal.score}/4
            </span>
          </motion.div>
        </div>

        {/* ── Tier + title ── */}
        <div className="px-6 pt-3 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: "var(--accent-purple)" }}>
              {tierDisplayLabel(signal.tier)}
            </p>
            <p className="mt-1 font-display text-xl font-bold text-white" style={{ letterSpacing: "-0.01em" }}>
              Votre signal actuel
            </p>
          </motion.div>

          {/* Date + duration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-1.5 flex items-center gap-2"
          >
            <span className="text-[11px] text-brand-10/50">
              {`~${signal.durationWeeks} semaines restantes`}
            </span>
          </motion.div>
        </div>

        {/* ── House topic pills ── */}
        <div className="px-6 pt-4 md:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap gap-2"
          >
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: `color-mix(in srgb, ${houseColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${houseColor} 20%, transparent)`,
              }}>
              <div className="h-2 w-2 rounded-full" style={{ background: houseColor }} />
              <span className="text-[11px] font-medium" style={{ color: houseColor }}>{hm.label}</span>
            </div>
            {secondaryHm && (
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{
                  background: `color-mix(in srgb, ${secondaryHm.color} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${secondaryHm.color} 20%, transparent)`,
                }}>
                <div className="h-2 w-2 rounded-full" style={{ background: secondaryHm.color }} />
                <span className="text-[11px] font-medium" style={{ color: secondaryHm.color }}>{secondaryHm.label}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Planet pills (staggered) ── */}
        <div className="px-6 pt-3 md:px-8">
          <div className="flex flex-wrap gap-2">
            {signal.planets.map((key, i) => {
              const pc = planetConfig[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 300 }}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{
                    background: `color-mix(in srgb, ${pc.color} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${pc.color} 25%, transparent)`,
                  }}
                >
                  <div className="h-2 w-2 rounded-full"
                    style={{ background: pc.color, boxShadow: `0 0 6px ${pc.color}` }} />
                  <span className="text-[11px] font-medium" style={{ color: pc.color }}>{pc.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Narrative ── */}
        <div className="px-6 pt-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="text-[12px] leading-relaxed text-brand-10/70">
              {signal.narrative}
            </p>
          </motion.div>
        </div>

        {/* ── Insight card ── */}
        <div className="px-6 pt-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.4 }}
            className="rounded-xl px-4 py-3"
            style={{
              background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb size={11} style={{ color: "var(--accent-purple)" }} />
              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
                En pratique
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-brand-10/70">
              {signal.action}
            </p>
          </motion.div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-6 my-4 h-px md:mx-8" style={{ background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)" }} />

        {/* ── Teaser CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="px-6 pb-6 md:px-8 md:pb-8 flex items-center gap-3"
        >
          <ArrowRight size={14} style={{ color: "var(--accent-purple)", opacity: 0.6 }} />
          <p className="text-[11px] text-brand-10/40">
            {"Ceci est un aper\u00e7u. L\u2019app r\u00e9v\u00e8le votre timeline compl\u00e8te, vos fen\u00eatres cl\u00e9s et vos domaines de vie."}
          </p>
        </motion.div>
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
