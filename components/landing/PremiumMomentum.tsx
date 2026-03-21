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

// Life timeline boudins — past visible, future locked then revealed
const BOUDINS = [
  // Past (visible, faded)
  { y: 0,   w: 16, h: 24, color: "#8B7FC2", opacity: 0.4 },
  { y: 30,  w: 20, h: 34, color: "#6BA89A", opacity: 0.4 },
  { y: 70,  w: 14, h: 18, color: "#C4A86B", opacity: 0.35 },
  { y: 94,  w: 24, h: 40, color: "#9585CC", opacity: 0.5 },
  { y: 140, w: 18, h: 28, color: "#D89EA0", opacity: 0.45 },
  // NOW
  { y: 178, w: 30, h: 50, color: "#B07CC2", opacity: 1, isCurrent: true },
  // Future (locked, then revealed)
  { y: 238, w: 22, h: 36, color: "#6BA89A", opacity: 0.7, isFuture: true },
  { y: 280, w: 28, h: 48, color: "#9585CC", opacity: 0.7, isFuture: true, isPeak: true },
  { y: 334, w: 16, h: 22, color: "#50C4D6", opacity: 0.6, isFuture: true },
  { y: 362, w: 24, h: 40, color: "#B07CC2", opacity: 0.7, isFuture: true, isPeak: true },
  { y: 408, w: 18, h: 28, color: "#6BA89A", opacity: 0.6, isFuture: true },
];

const NOW_Y = 205;
const STRIP_HEIGHT = 450;

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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Auto-reveal after 4s
  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => setRevealed(true), 4000);
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
            {tr("premium.v2.title", "See your entire life. Past, present, future.")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {tr("premium.v2.subtitle", "Free shows you now. Premium maps your entire timeline from birth to decades ahead.")}
          </p>
        </ScrollReveal>

        {/* Visual: life timeline with future reveal */}
        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.15}>
          <div
            ref={sectionRef}
            className="relative w-full max-w-xs overflow-hidden"
            style={{ height: STRIP_HEIGHT }}
          >

            {/* NOW line */}
            <div className="absolute left-0 right-0 z-10 flex items-center gap-2" style={{ top: NOW_Y }}>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.2))" }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-2"
                style={{ color: "white", opacity: 0.5 }}>now</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.2))" }} />
            </div>

            {/* Future blur overlay — dissolves on reveal */}
            <motion.div
              className="absolute left-0 right-0 z-10"
              style={{
                top: NOW_Y + 20,
                bottom: 0,
                background: "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--bg-primary) 70%, transparent) 20%, color-mix(in srgb, var(--bg-primary) 90%, transparent) 60%)",
                backdropFilter: "blur(3px)",
              }}
              animate={{ opacity: revealed ? 0 : 1 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
            />

            {/* "Unlock" label on blur */}
            {!revealed && (
              <motion.div
                className="absolute left-0 right-0 z-20 flex flex-col items-center"
                style={{ top: NOW_Y + 80 }}
                animate={{ opacity: started ? 1 : 0 }}
                transition={{ delay: 1.0 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 mb-2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-xs font-semibold text-white/40">Premium</span>
              </motion.div>
            )}

            {/* Boudins */}
            {BOUDINS.map((b, i) => {
              const isFuture = b.isFuture;
              const isVisible = !isFuture || revealed;
              const left = `calc(50% - ${b.w / 2}px + ${(i % 2 === 0 ? -1 : 1) * 10}px)`;

              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ top: b.y, left, width: b.w, height: b.h }}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={started ? {
                    opacity: isFuture ? (revealed ? b.opacity : 0.15) : (b.isCurrent ? 1 : b.opacity),
                    scale: 1,
                  } : {}}
                  transition={{
                    delay: isFuture && revealed ? 0.3 + (i - 6) * 0.15 : 0.1 + i * 0.06,
                    duration: 0.4,
                  }}
                >
                  <div
                    className="h-full w-full"
                    style={{
                      borderRadius: Math.min(b.w, b.h) / 2,
                      background: b.isCurrent
                        ? `linear-gradient(135deg, ${b.color}, color-mix(in srgb, ${b.color} 60%, transparent))`
                        : `linear-gradient(135deg, color-mix(in srgb, ${b.color} 50%, transparent), color-mix(in srgb, ${b.color} 20%, transparent))`,
                      border: b.isCurrent
                        ? `1.5px solid ${b.color}`
                        : `1px solid color-mix(in srgb, ${b.color} 30%, transparent)`,
                      boxShadow: b.isCurrent
                        ? `0 0 24px color-mix(in srgb, ${b.color} 35%, transparent)`
                        : "none",
                    }}
                  />
                  {/* Dots inside */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px]">
                    {Array.from({ length: b.isCurrent ? 4 : b.isPeak ? 3 : 2 }).map((_, j) => (
                      <div key={j} className="rounded-full"
                        style={{ width: b.isCurrent ? 4 : 3, height: b.isCurrent ? 4 : 3, backgroundColor: "white", opacity: b.isCurrent ? 0.8 : 0.5 }} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* CTA or result text */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={started ? { opacity: 1 } : {}}
          transition={{ delay: 1.0 }}
        >
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="rounded-full px-8 py-3 text-sm font-semibold text-white transition-all active:scale-95"
              style={{
                background: "var(--accent-purple)",
                boxShadow: "0 0 24px color-mix(in srgb, var(--accent-purple) 30%, transparent)",
              }}
            >
              Reveal your future
            </button>
          ) : (
            <motion.p
              className="text-sm text-brand-10/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your full timeline. Every peak. Every shift. From birth to decades ahead.
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
