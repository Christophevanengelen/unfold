"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppStoreBadges } from "./AppStoreBadges";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { generateSignalFromDate, type GeneratedSignal } from "@/lib/signal-generator";
import { planetConfig } from "@/lib/domain-config";
import { ScoreRing } from "@/components/demo/ScoreRing";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import type { TranslationMap } from "@/lib/i18n";

interface HeroProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// ─── Decorative phone status bar ─────────────────────────────
function MiniStatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-2.5 pb-1.5">
      <span className="text-[10px] font-medium" style={{ color: "var(--text-body-subtle)" }}>
        9:41
      </span>
      <div className="flex gap-1">
        <div className="h-[3px] w-[3px] rounded-full" style={{ background: "var(--text-body-subtle)" }} />
        <div className="h-[3px] w-[3px] rounded-full" style={{ background: "var(--text-body-subtle)" }} />
        <div className="h-[3px] w-[3px] rounded-full" style={{ background: "var(--text-body-subtle)" }} />
      </div>
    </div>
  );
}

// ─── Signal result display inside phone ──────────────────────
function SignalResult({ signal, isActive }: { signal: GeneratedSignal; isActive: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center px-4 pt-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Mode label */}
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--accent-purple)" }}
      >
        Your signal
      </p>

      {/* Planet keyword pills with shimmer */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {signal.planets.map((planet, i) => {
          const pc = planetConfig[planet];
          return (
            <motion.div
              key={planet}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 300 }}
              className="planet-pill-shimmer flex items-center gap-1.5 rounded-full px-2 py-0.5"
              style={{
                background: `color-mix(in srgb, ${pc.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${pc.color} 25%, transparent)`,
                "--shimmer-color": pc.color,
              } as React.CSSProperties}
            >
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: pc.color, boxShadow: `0 0 6px ${pc.color}` }}
              />
              <span className="text-[10px] font-medium" style={{ color: pc.color }}>
                {pc.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Intensity ring + number */}
      <motion.div
        className="mt-5"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <ScoreRing
          score={signal.intensity}
          color="var(--accent-purple)"
          size={110}
          strokeWidth={1.5}
          isActive={isActive}
          delay={0.2}
          delta={0}
        >
          <span
            className="font-display leading-none"
            style={{
              fontSize: 52,
              fontWeight: 300,
              letterSpacing: -2,
              color: "var(--accent-purple)",
            }}
          >
            <AnimatedNumber
              value={signal.intensity}
              duration={1.5}
              delay={0.2}
              isActive={isActive}
            />
          </span>
        </ScoreRing>
      </motion.div>

      {/* Tier label */}
      <motion.p
        className="mt-2 font-semibold uppercase"
        style={{
          fontSize: 10,
          letterSpacing: "0.15em",
          color: "var(--accent-purple)",
          opacity: 0.6,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.5 }}
      >
        {signal.tierLabel}
      </motion.p>

      {/* Mini insight */}
      <motion.p
        className="mt-3 max-w-[200px] text-center text-[10px] leading-relaxed"
        style={{ color: "var(--text-body-subtle)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {signal.planets.length} planets shape your current momentum.
        {signal.intensity >= 85
          ? " An exceptionally strong signal."
          : signal.intensity >= 70
            ? " A powerful rhythm is active."
            : " A steady signal is building."}
      </motion.p>
    </motion.div>
  );
}

// ─── Date input state inside phone ───────────────────────────
function DateInputPrompt({ onGenerate }: { onGenerate: (date: string) => void }) {
  const [date, setDate] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      className="flex flex-col items-center px-5 pt-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p
        className="text-center text-[11px] font-medium leading-relaxed"
        style={{ color: "var(--accent-purple)", opacity: 0.7 }}
      >
        Enter your birthday to see
        <br />
        your personal signal
      </p>

      <div className="mt-5 w-full max-w-[200px]">
        <input
          ref={inputRef}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-center text-sm font-medium outline-none transition-colors"
          style={{
            borderColor: "color-mix(in srgb, var(--accent-purple) 30%, transparent)",
            color: "var(--accent-purple)",
          }}
        />
      </div>

      <motion.button
        type="button"
        onClick={() => date && onGenerate(date)}
        className="mt-4 w-full max-w-[200px] rounded-full py-2.5 text-xs font-semibold transition-all"
        style={{
          background: date ? "var(--bg-brand)" : "color-mix(in srgb, var(--accent-purple) 15%, transparent)",
          color: date ? "var(--text-on-brand)" : "var(--text-disabled)",
          cursor: date ? "pointer" : "not-allowed",
        }}
        whileTap={date ? { scale: 0.96 } : undefined}
      >
        See my signal
      </motion.button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO — Interactive "Try your signal" with phone frame
// ═══════════════════════════════════════════════════════════════

export function Hero({ translations }: HeroProps) {
  const [signal, setSignal] = useState<GeneratedSignal | null>(null);
  const [isActive, setIsActive] = useState(false);

  const handleGenerate = (date: string) => {
    const generated = generateSignalFromDate(date);
    setSignal(generated);
    setIsActive(false);
    // Trigger animation on next frame
    requestAnimationFrame(() => setIsActive(true));
  };

  return (
    <section className="relative overflow-hidden py-28 md:py-36 lg:py-44">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* All hero text + CTA */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center" threshold={0.05}>
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t(translations, "hero.eyebrow", "Personal timing app")}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            {t(translations, "hero.title", "Your personal signal, decoded")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-10 md:text-xl">
            {t(translations, "hero.subtitle", "Every momentum period has a signature — a unique combination of signals that shape your timing.")}
            <br />
            {t(translations, "hero.subtitle2", "Try it now.")}
          </p>
        </ScrollReveal>

        {/* Interactive phone mockup */}
        <ScrollReveal variant="scaleIn" className="mt-12 flex justify-center" threshold={0.05}>
          <div
            className="phone-parallax relative mx-auto"
            style={{ width: 280, height: 520 }}
          >
            <div
              role="img"
              aria-label="Interactive signal preview — enter your birthday to see your personal momentum signal"
              className="absolute inset-0 origin-top-left overflow-hidden"
              style={{
                width: 320,
                height: 594,
                transform: "scale(0.875)",
                borderRadius: "2.25rem",
                boxShadow: "0 8px 60px rgba(20, 15, 45, 0.6), 0 2px 20px rgba(20, 15, 45, 0.35)",
                background: "var(--bg-primary)",
              }}
            >
              {/* Gradient mesh background */}
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                  background: [
                    "radial-gradient(ellipse 140% 45% at 50% -5%, var(--gradient-top) 0%, transparent 65%)",
                    "radial-gradient(circle 300px at 15% 75%, var(--gradient-left) 0%, transparent 70%)",
                    "radial-gradient(circle 250px at 90% 90%, var(--gradient-right) 0%, transparent 70%)",
                  ].join(", "),
                }}
              />

              <div className="relative z-10 flex h-full flex-col">
                <MiniStatusBar />

                <AnimatePresence mode="wait">
                  {signal ? (
                    <SignalResult key="result" signal={signal} isActive={isActive} />
                  ) : (
                    <DateInputPrompt key="input" onGenerate={handleGenerate} />
                  )}
                </AnimatePresence>

                {/* Reset link when signal is shown */}
                {signal && (
                  <motion.div
                    className="mt-auto pb-4 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSignal(null);
                        setIsActive(false);
                      }}
                      className="text-[10px] font-medium transition-opacity hover:opacity-80"
                      style={{ color: "var(--accent-purple)", opacity: 0.5 }}
                    >
                      Try another date
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* App Store badges + demo link below mockup */}
        <ScrollReveal variant="fadeUp" className="mt-10 flex flex-col items-center gap-4" threshold={0.05}>
          <AppStoreBadges />
          <a
            href="/demo"
            className="text-sm font-medium text-brand-10 transition-colors hover:text-white"
          >
            {t(translations, "hero.demo_cta", "or try the interactive demo")} &rarr;
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
