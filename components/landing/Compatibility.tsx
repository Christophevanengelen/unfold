"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { planetConfig, type PlanetKey } from "@/lib/domain-config";
import type { TranslationMap } from "@/lib/i18n";

interface CompatibilityProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// Two example signal profiles
const SIGNAL_A = {
  label: "You",
  intensity: 89,
  color: "var(--accent-purple)",
};

const SIGNAL_B = {
  label: "Them",
  intensity: 74,
  color: "#D87EA0", // venus rose
};

// Shared planets between A and B
const SHARED_PLANETS: PlanetKey[] = ["moon", "jupiter"];
const SYNC_SCORE = 82;

export function Compatibility({ translations }: CompatibilityProps) {
  const [phase, setPhase] = useState<"separate" | "overlap">("separate");
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Start when scrolled into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Cycle: separate 3s → overlap 4s → separate...
  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(
      () => setPhase((p) => (p === "separate" ? "overlap" : "separate")),
      phase === "separate" ? 3000 : 4000,
    );
    return () => clearTimeout(timer);
  }, [started, phase]);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t(translations, "compat.eyebrow", "Better together")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t(translations, "compat.title", "See what happens between you")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t(translations, "compat.subtitle", "Share your code. Compare planetary signals. Discover your shared momentum peaks.")}
          </p>
        </ScrollReveal>

        {/* Animated signal overlap visualization */}
        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.15}>
          <div
            ref={sectionRef}
            className="landing-glass w-full max-w-lg overflow-hidden p-8 md:p-12"
          >
            {/* Two rings */}
            <div className="relative flex items-center justify-center" style={{ height: 200 }}>
              {/* Ring A */}
              <motion.div
                className="absolute flex flex-col items-center"
                animate={{
                  x: phase === "overlap" ? 30 : -50,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                <svg width={120} height={120} viewBox="0 0 120 120">
                  <circle cx={60} cy={60} r={54} fill="none" stroke="var(--border-muted)" strokeWidth={1.5} opacity={0.5} />
                  <circle
                    cx={60} cy={60} r={54}
                    fill="none"
                    stroke={SIGNAL_A.color}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - SIGNAL_A.intensity / 100)}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="font-display text-3xl font-light"
                    style={{ color: "var(--accent-purple)", letterSpacing: -1 }}
                  >
                    {SIGNAL_A.intensity}
                  </span>
                  <span className="text-[9px] font-medium" style={{ color: "var(--accent-purple)", opacity: 0.6 }}>
                    {SIGNAL_A.label}
                  </span>
                </div>
              </motion.div>

              {/* Ring B */}
              <motion.div
                className="absolute flex flex-col items-center"
                animate={{
                  x: phase === "overlap" ? -30 : 50,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                <svg width={120} height={120} viewBox="0 0 120 120">
                  <circle cx={60} cy={60} r={54} fill="none" stroke="var(--border-muted)" strokeWidth={1.5} opacity={0.5} />
                  <circle
                    cx={60} cy={60} r={54}
                    fill="none"
                    stroke={SIGNAL_B.color}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - SIGNAL_B.intensity / 100)}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="font-display text-3xl font-light"
                    style={{ color: SIGNAL_B.color, letterSpacing: -1 }}
                  >
                    {SIGNAL_B.intensity}
                  </span>
                  <span className="text-[9px] font-medium" style={{ color: SIGNAL_B.color, opacity: 0.6 }}>
                    {SIGNAL_B.label}
                  </span>
                </div>
              </motion.div>

              {/* Shared score — appears on overlap */}
              <motion.div
                className="absolute flex flex-col items-center"
                animate={{
                  opacity: phase === "overlap" ? 1 : 0,
                  scale: phase === "overlap" ? 1 : 0.5,
                  y: phase === "overlap" ? 0 : 10,
                }}
                transition={{ duration: 0.4 }}
                style={{ bottom: -8 }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--accent-purple)" }}
                >
                  {SYNC_SCORE}% sync
                </span>
              </motion.div>
            </div>

            {/* Shared planets — appear on overlap */}
            <motion.div
              className="mt-6 flex flex-col items-center gap-3"
              animate={{ opacity: phase === "overlap" ? 1 : 0, y: phase === "overlap" ? 0 : 10 }}
              transition={{ duration: 0.4, delay: phase === "overlap" ? 0.2 : 0 }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-body-subtle)" }}
              >
                Shared planets
              </p>
              <div className="flex gap-2">
                {SHARED_PLANETS.map((planet) => {
                  const pc = planetConfig[planet];
                  return (
                    <div
                      key={planet}
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                      style={{
                        background: `color-mix(in srgb, ${pc.color} 15%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${pc.color} 30%, transparent)`,
                        boxShadow: `0 0 10px color-mix(in srgb, ${pc.color} 20%, transparent)`,
                      }}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ background: pc.color, boxShadow: `0 0 6px ${pc.color}` }}
                      />
                      <span className="text-[11px] font-medium" style={{ color: pc.color }}>
                        {pc.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Process steps */}
            <motion.div
              className="mt-8 text-center"
              animate={{ opacity: phase === "overlap" ? 0.7 : 0.4 }}
            >
              <p className="font-display text-sm font-medium uppercase tracking-wider text-brand-10/60">
                {t(translations, "compat.process", "Share your code \u2192 Compare signals \u2192 Discover peaks")}
              </p>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
