"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { TranslationMap } from "@/lib/i18n";

interface CompatibilityProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// Exact same colors as Premium section boudins
const STRIP_A = [
  { w: 16, h: 24, color: "#6BA89A", dots: 2, shared: false },   // sage
  { w: 24, h: 40, color: "#9585CC", dots: 3, shared: true },    // purple
  { w: 28, h: 50, color: "#B07CC2", dots: 4, shared: true },    // warm purple
  { w: 18, h: 28, color: "#C4A86B", dots: 2, shared: false },   // gold
];

const STRIP_B = [
  { w: 18, h: 28, color: "#50C4D6", dots: 2, shared: false },   // teal
  { w: 24, h: 40, color: "#8B7FC2", dots: 3, shared: true },    // lavender
  { w: 26, h: 48, color: "#D89EA0", dots: 3, shared: true },    // rose
  { w: 16, h: 24, color: "#6BA89A", dots: 2, shared: false },   // sage
];

// Shared peak insights — uses house domain labels, not old 3-category system
// House 10 = career/reputation, House 5 = creation/pleasure
const SHARED_INSIGHTS_KEYS = [
  { monthKey: "compat.v2.peak1.month", domainKey: "compat.v2.peak1.domain", noteKey: "compat.v2.peak1.note", monthFallback: "June", domainFallback: "House X — Career", noteFallback: "Both timelines peak here" },
  { monthKey: "compat.v2.peak2.month", domainKey: "compat.v2.peak2.domain", noteKey: "compat.v2.peak2.note", monthFallback: "September", domainFallback: "House V — Joy", noteFallback: "A shared window of intensity" },
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
        <SectionHeader
          translations={translations}
          eyebrowKey="compat.v2.eyebrow"
          eyebrowFallback="Shared timing"
          titleKey="compat.v2.title"
          titleFallback="Know when your rhythms align."
          subtitleKey="compat.v2.subtitle"
          subtitleFallback="Compare two timelines. See the months where you both peak."
        />

        {/* Visual: two strips + shared insights */}
        <div className="mt-16 flex flex-col items-center gap-10 md:flex-row md:justify-center md:gap-16">

          {/* Left strip: You */}
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, x: -20 }}
            animate={revealed ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#B07CC2" }}>{t(translations, "compat.v2.you", "You")}</span>
            <div className="flex flex-col items-center gap-2">
              {STRIP_A.map((b, i) => (
                <motion.div
                  key={`a-${i}`}
                  className="relative"
                  style={{
                    width: b.w,
                    height: b.h,
                    borderRadius: Math.min(b.w, b.h) / 2,
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
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px]">
                    {Array.from({ length: b.dots }).map((_, j) => (
                      <div key={j} className="rounded-full" style={{ width: 3, height: 3, backgroundColor: "white", opacity: 0.6 }} />
                    ))}
                  </div>
                </motion.div>
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
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">{t(translations, "compat.v2.shared", "Shared peaks")}</p>
            {SHARED_INSIGHTS_KEYS.map((insight, i) => (
              <motion.div
                key={insight.monthKey}
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
                  <span className="text-sm font-semibold text-white">{t(translations, insight.monthKey, insight.monthFallback)}</span>
                  <span className="text-[10px] text-white/40">{t(translations, insight.domainKey, insight.domainFallback)}</span>
                </div>
                <span className="text-xs text-brand-10/50">{t(translations, insight.noteKey, insight.noteFallback)}</span>
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
            <span className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#D89EA0" }}>{t(translations, "compat.v2.them", "Them")}</span>
            <div className="flex flex-col items-center gap-2">
              {STRIP_B.map((b, i) => (
                <motion.div
                  key={`b-${i}`}
                  className="relative"
                  style={{
                    width: b.w,
                    height: b.h,
                    borderRadius: Math.min(b.w, b.h) / 2,
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
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px]">
                    {Array.from({ length: b.dots }).map((_, j) => (
                      <div key={j} className="rounded-full" style={{ width: 3, height: 3, backgroundColor: "white", opacity: 0.6 }} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
