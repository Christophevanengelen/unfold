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

// Two timelines: boudins for person A and person B
// When they overlap in time = shared momentum = highlighted
const PERSON_A = [
  { y: 0,   h: 34, color: "#B07CC2", shared: false },
  { y: 44,  h: 22, color: "#6BA89A", shared: false },
  { y: 76,  h: 40, color: "#9585CC", shared: true },   // shared!
  { y: 126, h: 18, color: "#C4A86B", shared: false },
  { y: 154, h: 50, color: "#B07CC2", shared: true },   // shared!
  { y: 214, h: 28, color: "#6BA89A", shared: false },
];

const PERSON_B = [
  { y: 10,  h: 28, color: "#D89EA0", shared: false },
  { y: 48,  h: 18, color: "#50C4D6", shared: false },
  { y: 80,  h: 36, color: "#8B7FC2", shared: true },   // shared!
  { y: 130, h: 24, color: "#6BA89A", shared: false },
  { y: 160, h: 44, color: "#D89EA0", shared: true },   // shared!
  { y: 218, h: 22, color: "#50C4D6", shared: false },
];

/**
 * Compatibility section — two timelines side by side.
 *
 * Animation: timelines start separated, then slide together.
 * Shared periods (where both have boudins at the same time)
 * light up with a glow bridge between them.
 */
export function Compatibility({ translations }: CompatibilityProps) {
  const [phase, setPhase] = useState<"apart" | "together">("apart");
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

  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(
      () => setPhase(p => p === "apart" ? "together" : "apart"),
      phase === "apart" ? 2500 : 4000,
    );
    return () => clearTimeout(timer);
  }, [started, phase]);

  const isTogether = phase === "together";

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t(translations, "compat.v2.eyebrow", "Shared timing")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t(translations, "compat.v2.title", "Compare two timelines. Find the peaks you share.")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t(translations, "compat.v2.subtitle", "Invite someone. See when your momentum periods overlap. Plan around your shared windows.")}
          </p>
        </ScrollReveal>

        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.15}>
          <div
            ref={sectionRef}
            className="landing-glass w-full max-w-lg overflow-hidden p-8 md:p-12"
          >
            {/* Labels */}
            <div className="flex justify-between mb-4 px-8">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#B07CC2" }}>You</span>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#D89EA0" }}>Them</span>
            </div>

            {/* Two timeline strips */}
            <div className="relative flex justify-center" style={{ height: 260 }}>
              {/* Person A — left */}
              <motion.div
                className="absolute"
                style={{ left: "50%" }}
                animate={{ x: isTogether ? -28 : -60 }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                {PERSON_A.map((b, i) => (
                  <motion.div
                    key={`a-${i}`}
                    className="absolute"
                    style={{
                      top: b.y,
                      left: -10,
                      width: 20,
                      height: b.h,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, color-mix(in srgb, ${b.color} 60%, transparent), color-mix(in srgb, ${b.color} 25%, transparent))`,
                      border: `1px solid color-mix(in srgb, ${b.color} 35%, transparent)`,
                    }}
                    animate={{
                      boxShadow: isTogether && b.shared
                        ? `0 0 16px color-mix(in srgb, ${b.color} 40%, transparent)`
                        : "0 0 0px transparent",
                      opacity: isTogether && b.shared ? 1 : 0.6,
                    }}
                    transition={{ duration: 0.4, delay: b.shared ? 0.3 : 0 }}
                  />
                ))}
              </motion.div>

              {/* Person B — right */}
              <motion.div
                className="absolute"
                style={{ left: "50%" }}
                animate={{ x: isTogether ? 28 : 60 }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                {PERSON_B.map((b, i) => (
                  <motion.div
                    key={`b-${i}`}
                    className="absolute"
                    style={{
                      top: b.y,
                      left: -10,
                      width: 20,
                      height: b.h,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, color-mix(in srgb, ${b.color} 60%, transparent), color-mix(in srgb, ${b.color} 25%, transparent))`,
                      border: `1px solid color-mix(in srgb, ${b.color} 35%, transparent)`,
                    }}
                    animate={{
                      boxShadow: isTogether && b.shared
                        ? `0 0 16px color-mix(in srgb, ${b.color} 40%, transparent)`
                        : "0 0 0px transparent",
                      opacity: isTogether && b.shared ? 1 : 0.6,
                    }}
                    transition={{ duration: 0.4, delay: b.shared ? 0.3 : 0 }}
                  />
                ))}
              </motion.div>

              {/* Shared bridges — horizontal glow between matching boudins */}
              {isTogether && PERSON_A.filter(b => b.shared).map((b, i) => (
                <motion.div
                  key={`bridge-${i}`}
                  className="absolute"
                  style={{
                    left: "50%",
                    transform: "translateX(-50%)",
                    top: b.y + b.h / 2 - 1,
                    width: 56,
                    height: 2,
                    borderRadius: 1,
                    background: "linear-gradient(to right, #B07CC2, #D89EA0)",
                  }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 0.5, scaleX: 1 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.3 }}
                />
              ))}
            </div>

            {/* Shared peak count */}
            <motion.div
              className="mt-6 text-center"
              animate={{ opacity: isTogether ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm font-semibold text-white">
                {isTogether ? "2 shared momentum peaks found" : "Comparing timelines..."}
              </p>
              <p className="mt-1 text-xs text-brand-10/50">
                {isTogether ? "Plan your most aligned moments together." : ""}
              </p>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
