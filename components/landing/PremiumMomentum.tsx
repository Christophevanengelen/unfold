"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";
import type { TranslationMap } from "@/lib/i18n";

interface PremiumMomentumProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// ─── Timeline bar data (7 days) ──────────────────────────────
const DAYS = [
  { label: "Mon", value: 62, visible: true },
  { label: "Tue", value: 78, visible: true },
  { label: "Wed", value: 85, visible: true, isPeak: true },
  { label: "Thu", value: 71, visible: true },
  { label: "Fri", value: 91, visible: false, isPeak: true },
  { label: "Sat", value: 68, visible: false },
  { label: "Sun", value: 88, visible: false, isPeak: true },
];

export function PremiumMomentum({ translations }: PremiumMomentumProps) {
  const tr = (key: string, fallback?: string) => t(translations, key, fallback);
  const [revealed, setRevealed] = useState(false);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Start animation when scrolled into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Auto-reveal after 4 seconds
  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => setRevealed(true), 4000);
    return () => clearTimeout(timer);
  }, [started]);

  const features = [
    {
      title: tr("premium.timeline.title", "Your full momentum timeline"),
      desc: tr("premium.timeline.desc", "See every momentum period from birth to now \u2014 and what\u2019s forming ahead."),
    },
    {
      title: tr("premium.peaks.title", "Spot your peak windows"),
      desc: tr("premium.peaks.desc", "Know when intensity builds. Plan your week around your strongest rhythms."),
    },
    {
      title: tr("premium.alerts.title", "Get alerts before key moments"),
      desc: tr("premium.alerts.desc", "Real-time notifications when exceptional momentum windows open."),
    },
    {
      title: tr("premium.compat.title", "Compare signals with someone"),
      desc: tr("premium.compat.desc", "Deep compatibility analysis. Shared peak discovery. Timing synergy reports."),
    },
  ];

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div ref={sectionRef} className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {tr("premium.eyebrow", "Premium")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {tr("premium.title", "Your signal today is strong")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {tr("premium.subtitle", "But what about the next 7 days?")}
          </p>
        </ScrollReveal>

        {/* Cliffhanger timeline — bars that blur after "today" */}
        <ScrollReveal variant="scaleIn" className="mt-12 flex justify-center">
          <div
            className="landing-glass w-full max-w-2xl overflow-hidden p-8"
            style={{
              borderColor: "color-mix(in srgb, var(--accent-purple) 30%, transparent)",
              borderWidth: 1,
            }}
          >
            <p className="mb-6 text-[11px] font-medium uppercase tracking-wider text-brand-10/50">
              {tr("premium.chart_label", "Your next 7 days")}
            </p>

            {/* Bar chart with blur transition */}
            <div className="flex items-end justify-between gap-3" style={{ height: 140 }}>
              {DAYS.map((day, i) => {
                const barH = Math.max(24, (day.value / 100) * 130);
                const isBlurred = !day.visible && !revealed;
                const isPeak = day.isPeak;

                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    {/* Value label */}
                    <motion.span
                      className="text-xs font-semibold tabular-nums"
                      style={{
                        color: isPeak ? "var(--accent-purple)" : "var(--text-body-subtle)",
                        filter: isBlurred ? "blur(6px)" : "none",
                        transition: "filter 0.8s ease",
                      }}
                    >
                      {day.value}
                    </motion.span>

                    {/* Bar */}
                    <motion.div
                      className="w-full rounded-lg"
                      initial={{ height: 0 }}
                      animate={started ? { height: barH } : {}}
                      transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 150, damping: 20 }}
                      style={{
                        background: isPeak
                          ? "linear-gradient(to top, var(--accent-purple), color-mix(in srgb, var(--accent-purple) 60%, white))"
                          : "color-mix(in srgb, var(--brand-6) 30%, transparent)",
                        boxShadow: isPeak ? "0 0 16px color-mix(in srgb, var(--accent-purple) 30%, transparent)" : "none",
                        filter: isBlurred ? "blur(8px)" : "none",
                        transition: "filter 0.8s ease",
                      }}
                    />

                    {/* Day label */}
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider"
                      style={{
                        color: day.visible || revealed ? "var(--text-body-subtle)" : "var(--text-disabled)",
                      }}
                    >
                      {day.label}
                    </span>

                    {/* Peak dot */}
                    {isPeak && (
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: "var(--accent-purple)",
                          boxShadow: "0 0 6px var(--accent-purple)",
                          filter: isBlurred ? "blur(4px)" : "none",
                          transition: "filter 0.8s ease",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Blur overlay + CTA (visible before reveal) */}
            {!revealed && (
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <button
                  onClick={() => setRevealed(true)}
                  className="rounded-xl px-8 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
                  style={{
                    background: "var(--accent-purple)",
                    boxShadow: "0 0 24px color-mix(in srgb, var(--accent-purple) 25%, transparent)",
                  }}
                >
                  {tr("premium.reveal_cta", "Reveal your full week")}
                </button>
              </motion.div>
            )}

            {/* Post-reveal message */}
            {revealed && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center text-sm text-brand-10/60"
              >
                {tr("premium.reveal_msg", "Premium shows your peaks before they arrive. Every day. Every week.")}
              </motion.p>
            )}
          </div>
        </ScrollReveal>

        {/* Feature cards */}
        <ScrollRevealGroup className="mt-16 grid gap-6 md:grid-cols-2" stagger={0.12}>
          {features.map((f) => (
            <ScrollRevealItem key={f.title} variant="fadeUp">
              <div className="landing-glass p-8">
                <h3 className="font-display text-xl font-semibold text-white">{f.title}</h3>
                <p className="mt-3 text-brand-10">{f.desc}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}
