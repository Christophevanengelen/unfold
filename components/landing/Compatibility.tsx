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

// Timeline months with boudins for each person
const MONTHS = [
  { label: "Mar", a: { h: 30, color: "#B07CC2" }, b: null },
  { label: "Apr", a: { h: 22, color: "#6BA89A" }, b: { h: 26, color: "#D89EA0" } },
  { label: "May", a: null,                         b: { h: 18, color: "#50C4D6" } },
  { label: "Jun", a: { h: 38, color: "#9585CC" }, b: { h: 34, color: "#8B7FC2" }, shared: true, domain: "Career" },
  { label: "Jul", a: { h: 16, color: "#C4A86B" }, b: null },
  { label: "Aug", a: null,                         b: { h: 20, color: "#6BA89A" } },
  { label: "Sep", a: { h: 42, color: "#B07CC2" }, b: { h: 36, color: "#D89EA0" }, shared: true, domain: "Love" },
  { label: "Oct", a: { h: 20, color: "#6BA89A" }, b: null },
  { label: "Nov", a: null,                         b: { h: 24, color: "#50C4D6" } },
  { label: "Dec", a: { h: 28, color: "#9585CC" }, b: { h: 30, color: "#8B7FC2" }, shared: true, domain: "Creativity" },
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
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t(translations, "compat.v2.eyebrow", "Shared timing")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t(translations, "compat.v2.title", "Know when your rhythms align.")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t(translations, "compat.v2.subtitle", "Compare two timelines. See the months where you both peak. Plan what matters around those windows.")}
          </p>
        </ScrollReveal>

        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.15}>
          <div
            ref={sectionRef}
            className="landing-glass w-full max-w-xl overflow-hidden p-6 md:p-10"
          >
            {/* Labels */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#B07CC2" }} />
                <span className="text-xs font-semibold text-white/70">You</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white/70">Them</span>
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#D89EA0" }} />
              </div>
            </div>

            {/* Month-by-month dual timeline */}
            <div className="flex items-end gap-1.5 justify-center" style={{ height: 180 }}>
              {MONTHS.map((month, i) => (
                <motion.div
                  key={month.label}
                  className="flex flex-col items-center gap-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={revealed ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                >
                  {/* Boudins column */}
                  <div className="flex flex-col items-center gap-0.5" style={{ height: 140 }}>
                    <div className="flex-1 flex flex-col items-center justify-end gap-1">
                      {/* Person A boudin */}
                      {month.a && (
                        <motion.div
                          style={{
                            width: 18,
                            height: month.a.h,
                            borderRadius: 9,
                            background: `linear-gradient(135deg, color-mix(in srgb, ${month.a.color} 60%, transparent), color-mix(in srgb, ${month.a.color} 25%, transparent))`,
                            border: `1px solid color-mix(in srgb, ${month.a.color} 35%, transparent)`,
                          }}
                          animate={revealed && month.shared ? {
                            boxShadow: `0 0 14px color-mix(in srgb, ${month.a.color} 40%, transparent)`,
                            opacity: 1,
                          } : { opacity: 0.5 }}
                          transition={{ delay: month.shared ? 0.8 : 0, duration: 0.4 }}
                        />
                      )}
                      {/* Person B boudin */}
                      {month.b && (
                        <motion.div
                          style={{
                            width: 18,
                            height: month.b.h,
                            borderRadius: 9,
                            background: `linear-gradient(135deg, color-mix(in srgb, ${month.b.color} 60%, transparent), color-mix(in srgb, ${month.b.color} 25%, transparent))`,
                            border: `1px solid color-mix(in srgb, ${month.b.color} 35%, transparent)`,
                          }}
                          animate={revealed && month.shared ? {
                            boxShadow: `0 0 14px color-mix(in srgb, ${month.b.color} 40%, transparent)`,
                            opacity: 1,
                          } : { opacity: 0.5 }}
                          transition={{ delay: month.shared ? 0.8 : 0, duration: 0.4 }}
                        />
                      )}
                      {/* Empty space if no boudin */}
                      {!month.a && !month.b && <div style={{ height: 20 }} />}
                    </div>
                  </div>

                  {/* Month label */}
                  <span className={`text-[9px] font-medium ${month.shared ? "text-white/80" : "text-white/30"}`}>
                    {month.label}
                  </span>

                  {/* Shared domain badge */}
                  {month.shared && (
                    <motion.span
                      className="text-[7px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--accent-purple)" }}
                      initial={{ opacity: 0 }}
                      animate={revealed ? { opacity: 1 } : {}}
                      transition={{ delay: 1.0 }}
                    >
                      {month.domain}
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Result card — appears after animation */}
            <motion.div
              className="mt-6 rounded-2xl p-4"
              style={{
                background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent-purple) 15%, transparent)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              <p className="text-sm font-semibold text-white">3 shared peaks this year</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-brand-10/60">
                  <span className="text-white/80 font-medium">June</span> Career momentum aligned. Best month for a joint project.
                </p>
                <p className="text-xs text-brand-10/60">
                  <span className="text-white/80 font-medium">September</span> Love energy peaks together. Plan something meaningful.
                </p>
                <p className="text-xs text-brand-10/60">
                  <span className="text-white/80 font-medium">December</span> Creative sync. Ideal for shared experiences.
                </p>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
