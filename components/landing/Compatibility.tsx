"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { TranslationMap } from "@/lib/i18n";

interface CompatibilityProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// Person A boudins (left strip)
const STRIP_A = [
  { h: 28, color: "#B07CC2", shared: false },
  { h: 18, color: "#6BA89A", shared: false },
  { h: 36, color: "#9585CC", shared: true },
  { h: 14, color: "#C4A86B", shared: false },
  { h: 42, color: "#B07CC2", shared: true },
  { h: 22, color: "#6BA89A", shared: false },
  { h: 30, color: "#D89EA0", shared: false },
];

// Person B boudins (right strip)
const STRIP_B = [
  { h: 22, color: "#D89EA0", shared: false },
  { h: 30, color: "#50C4D6", shared: false },
  { h: 32, color: "#8B7FC2", shared: true },
  { h: 18, color: "#6BA89A", shared: false },
  { h: 38, color: "#D89EA0", shared: true },
  { h: 16, color: "#C4A86B", shared: false },
  { h: 26, color: "#50C4D6", shared: false },
];

// Shared peak insights
const SHARED_INSIGHTS = [
  { month: "June", domain: "Career", note: "Best month for a joint project" },
  { month: "September", domain: "Love", note: "Plan something meaningful" },
];

export function Compatibility({ translations }: CompatibilityProps) {
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRevealed(true); },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden py-24 md:py-32" ref={sectionRef}>
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t(translations, "compat.v2.eyebrow", "Shared timing")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t(translations, "compat.v2.title", "Know when your rhythms align.")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t(translations, "compat.v2.subtitle", "Compare two timelines. See the months where you both peak.")}
          </p>
        </ScrollReveal>

        {/* Visual: two strips + shared insights */}
        <div className="mt-16 flex flex-col items-center gap-10 md:flex-row md:justify-center md:gap-16">

          {/* Left strip: You */}
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, x: -20 }}
            animate={revealed ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#B07CC2" }}>You</span>
            <div className="flex flex-col items-center gap-2">
              {STRIP_A.map((b, i) => (
                <motion.div
                  key={`a-${i}`}
                  style={{
                    width: 22,
                    height: b.h,
                    borderRadius: 11,
                    background: `linear-gradient(135deg, color-mix(in srgb, ${b.color} 55%, transparent), color-mix(in srgb, ${b.color} 22%, transparent))`,
                    border: `1px solid color-mix(in srgb, ${b.color} 30%, transparent)`,
                  }}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={revealed ? {
                    opacity: b.shared ? 1 : 0.5,
                    scale: 1,
                    boxShadow: b.shared ? `0 0 16px color-mix(in srgb, ${b.color} 35%, transparent)` : "none",
                  } : {}}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.4 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Center: shared insights */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Shared peaks</p>
            {SHARED_INSIGHTS.map((insight, i) => (
              <motion.div
                key={insight.month}
                className="flex items-center gap-3 rounded-2xl px-5 py-3"
                style={{
                  background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--accent-purple) 12%, transparent)",
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={revealed ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 1.0 + i * 0.2, duration: 0.4 }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{insight.month}</span>
                  <span className="text-[10px] text-white/40">{insight.domain}</span>
                </div>
                <span className="text-xs text-brand-10/50">{insight.note}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Right strip: Them */}
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, x: 20 }}
            animate={revealed ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#D89EA0" }}>Them</span>
            <div className="flex flex-col items-center gap-2">
              {STRIP_B.map((b, i) => (
                <motion.div
                  key={`b-${i}`}
                  style={{
                    width: 22,
                    height: b.h,
                    borderRadius: 11,
                    background: `linear-gradient(135deg, color-mix(in srgb, ${b.color} 55%, transparent), color-mix(in srgb, ${b.color} 22%, transparent))`,
                    border: `1px solid color-mix(in srgb, ${b.color} 30%, transparent)`,
                  }}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={revealed ? {
                    opacity: b.shared ? 1 : 0.5,
                    scale: 1,
                    boxShadow: b.shared ? `0 0 16px color-mix(in srgb, ${b.color} 35%, transparent)` : "none",
                  } : {}}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.4 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
