"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { TranslationMap } from "@/lib/i18n";

interface PremiumMomentumProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// Future momentum periods — what premium reveals
const FUTURE_BOUDINS = [
  { month: "Apr", domain: "Recovery",  w: 22, h: 34, color: "#6BA89A", dots: 2, visible: true },
  { month: "May", domain: "Connection", w: 32, h: 52, color: "#B07CC2", dots: 3, visible: true, isPeak: true },
  { month: "Jul", domain: "Acceleration", w: 36, h: 60, color: "#9585CC", dots: 4, visible: false, isPeak: true },
  { month: "Sep", domain: "Deepening", w: 24, h: 38, color: "#D89EA0", dots: 2, visible: false },
  { month: "Nov", domain: "Consolidation", w: 20, h: 30, color: "#C4A86B", dots: 1, visible: false },
];

export function PremiumMomentum({ translations }: PremiumMomentumProps) {
  const tr = (key: string, fallback?: string) => t(translations, key, fallback);
  const [revealed, setRevealed] = useState(false);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  // Auto-reveal after 4s
  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => setRevealed(true), 3500);
    return () => clearTimeout(timer);
  }, [started]);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {tr("premium.v2.eyebrow", "Premium")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {tr("premium.v2.title", "See what is forming ahead.")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {tr("premium.v2.subtitle", "Free shows you today. Premium reveals the next 5 momentum windows coming your way.")}
          </p>
        </ScrollReveal>

        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.15}>
          <div
            ref={sectionRef}
            className="landing-glass w-full max-w-xl overflow-hidden p-6 md:p-10"
          >
            {/* Future boudins as cards */}
            <div className="space-y-3">
              {FUTURE_BOUDINS.map((b, i) => {
                const isLocked = !b.visible && !revealed;
                return (
                  <motion.div
                    key={b.month}
                    className="flex items-center gap-4 rounded-2xl px-4 py-3 relative overflow-hidden"
                    style={{
                      background: "color-mix(in srgb, var(--accent-purple) 5%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--accent-purple) 10%, transparent)",
                    }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={started ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
                  >
                    {/* Mini boudin */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: b.w * 0.7,
                        height: b.h * 0.7,
                        borderRadius: (b.w * 0.7) / 2,
                        background: isLocked
                          ? "color-mix(in srgb, var(--accent-purple) 10%, transparent)"
                          : `linear-gradient(135deg, color-mix(in srgb, ${b.color} 60%, transparent), color-mix(in srgb, ${b.color} 25%, transparent))`,
                        border: isLocked
                          ? "1px solid color-mix(in srgb, var(--accent-purple) 15%, transparent)"
                          : `1px solid color-mix(in srgb, ${b.color} 35%, transparent)`,
                      }}
                    >
                      {!isLocked && (
                        <div className="flex flex-col items-center gap-[2px]">
                          {Array.from({ length: Math.min(b.dots, 3) }).map((_, j) => (
                            <div key={j} className="rounded-full" style={{ width: 3, height: 3, backgroundColor: "white", opacity: 0.7 }} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{b.month}</span>
                        {b.isPeak && !isLocked && (
                          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>Peak</span>
                        )}
                      </div>
                      <p className="text-xs text-brand-10/50">
                        {isLocked ? "Unlock with premium" : b.domain}
                      </p>
                    </div>

                    {/* Lock overlay for hidden items */}
                    {isLocked && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-end pr-4 backdrop-blur-[2px]"
                        style={{ background: "color-mix(in srgb, var(--bg-primary) 60%, transparent)" }}
                        animate={revealed ? { opacity: 0 } : { opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-10/30">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Reveal CTA or result */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={started ? { opacity: 1 } : {}}
              transition={{ delay: 1.0 }}
            >
              {!revealed ? (
                <button
                  onClick={() => setRevealed(true)}
                  className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all"
                  style={{
                    background: "var(--accent-purple)",
                    boxShadow: "0 0 20px color-mix(in srgb, var(--accent-purple) 30%, transparent)",
                  }}
                >
                  Reveal all windows
                </button>
              ) : (
                <p className="text-sm text-brand-10/50">
                  5 momentum windows. 2 peaks ahead. Your timing, mapped.
                </p>
              )}
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
