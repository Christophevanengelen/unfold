"use client";

import { motion } from "motion/react";
import { AppStoreBadges } from "./AppStoreBadges";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MiniStatusBar } from "@/components/ui/MiniStatusBar";
import { BottomNav } from "@/components/ui/BottomNav";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { MonthLabel } from "@/components/ui/MonthLabel";
import { planetConfig } from "@/lib/domain-config";
import type { TranslationMap } from "@/lib/i18n";

interface HeroProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

const PLANETS: { color: string; key: string }[] = [
  { color: planetConfig.jupiter.color, key: "jupiter" },
  { color: planetConfig.sun.color, key: "sun" },
  { color: planetConfig.mercury.color, key: "mercury" },
  { color: planetConfig.moon.color, key: "moon" },
];

export function Hero({ translations }: HeroProps) {
  const CAPSULE_W = 56;
  const CAPSULE_R = CAPSULE_W / 2;

  return (
    <section className="relative overflow-hidden py-28 md:py-36 lg:py-44">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center" threshold={0.05}>
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t(translations, "hero.eyebrow", "Personal timing app")}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            {t(translations, "hero.title", "Your personal signal, decoded")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-10 md:text-xl">
            {t(translations, "hero.subtitle", "Every momentum period has a signature. A unique combination of signals that shape your timing.")}
          </p>
        </ScrollReveal>

        <ScrollReveal variant="scaleIn" className="mt-12 flex justify-center" threshold={0.05}>
          <div className="phone-parallax phone-glow-wrap relative mx-auto" style={{ width: 300, height: 650 }}>
            <div
              role="img"
              aria-label="Unfold app Timeline Focus view showing momentum capsules with planet dots and a NOW marker"
              className="absolute inset-0 origin-top-left overflow-hidden"
              style={{ width: 375, height: 812, transform: "scale(0.8)", borderRadius: "2.5rem", background: "var(--bg-primary)", border: "1px solid color-mix(in srgb, var(--brand-6) 40%, transparent)" }}
            >
              <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: ["radial-gradient(ellipse 140% 45% at 50% -5%, var(--gradient-top) 0%, transparent 65%)", "radial-gradient(circle 250px at 90% 90%, var(--gradient-right) 0%, transparent 70%)"].join(", ") }} />

              <div className="relative z-10 flex h-full flex-col">
                <MiniStatusBar />
                <div className="flex items-center justify-between px-5 pt-1 pb-3">
                  <span className="text-[22px] font-bold tabular-nums" style={{ color: "var(--text-heading)" }}>39</span>
                  <ViewToggle />
                </div>

                <div className="relative flex-1 overflow-hidden">
                  <MonthLabel label="Mar" y={14} />
                  <MonthLabel label="Feb" y={38} />
                  <MonthLabel label="2027" y={62} bold />
                  <MonthLabel label="Dec" y={86} />
                  <MonthLabel label="Nov" y={110} />
                  <MonthLabel label="Oct" y={134} />
                  <MonthLabel label="Sep" y={158} />
                  <MonthLabel label="Aug" y={182} />
                  <MonthLabel label="Jul" y={206} />
                  <MonthLabel label="Jun" y={230} />
                  <MonthLabel label="May" y={254} />
                  <MonthLabel label="Apr" y={278} />
                  <MonthLabel label="Mar" y={302} />
                  <MonthLabel label="Feb" y={326} />
                  <MonthLabel label="2026" y={350} bold />
                  <MonthLabel label="Nov" y={374} />
                  <MonthLabel label="Oct" y={398} />
                  <MonthLabel label="Sep" y={418} />
                  <MonthLabel label="Aug" y={438} />
                  <MonthLabel label="Jul" y={458} />

                  <div className="absolute" aria-hidden="true" style={{ left: "50%", top: 0, bottom: 0, width: 1, background: "linear-gradient(to bottom, color-mix(in srgb, var(--brand-5) 8%, transparent) 0%, color-mix(in srgb, var(--brand-5) 15%, transparent) 30%, color-mix(in srgb, var(--brand-5) 15%, transparent) 70%, color-mix(in srgb, var(--brand-5) 8%, transparent) 100%)" }} />

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="absolute z-10" style={{ top: 306, left: 44, right: 16 }}>
                    <div style={{ height: 1, background: "var(--accent-purple)", boxShadow: "0 0 12px var(--accent-purple)" }} />
                    <div className="absolute -top-[3px] left-0 h-[7px] w-[7px] rounded-full" style={{ background: "var(--accent-purple)", boxShadow: "0 0 10px var(--accent-purple)", animation: "dot-breathe 2s ease-in-out infinite" }} />
                    <div className="absolute -top-2.5 right-0 text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--accent-purple)" }}>Now</div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 25 }} className="absolute left-1/2 -translate-x-1/2" style={{ top: 30, width: CAPSULE_W, height: 380, borderRadius: CAPSULE_R, background: "color-mix(in srgb, var(--brand-7) 30%, var(--bg-secondary))", border: "1px solid color-mix(in srgb, var(--brand-8) 35%, transparent)", zIndex: 5 }}>
                    <div className="pointer-events-none absolute inset-0" style={{ borderRadius: CAPSULE_R, background: "radial-gradient(ellipse 80% 20% at 50% 90%, color-mix(in srgb, var(--accent-purple) 10%, transparent) 0%, transparent 70%)" }} />
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center" style={{ paddingBottom: CAPSULE_R - 2, gap: 8 }}>
                      <span className="text-[18px] font-semibold tabular-nums leading-none" style={{ color: "var(--text-heading)" }}>7</span>
                      {PLANETS.map((p, pi) => (
                        <motion.div key={p.key} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + pi * 0.06, type: "spring", stiffness: 300 }} className="rounded-full" style={{ width: 14, height: 14, background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                      ))}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 25 }} className="absolute left-1/2 -translate-x-1/2" style={{ top: 418, width: CAPSULE_W, height: 120, borderRadius: CAPSULE_R, background: "color-mix(in srgb, var(--brand-6) 20%, var(--bg-secondary))", border: "1px solid color-mix(in srgb, var(--brand-6) 12%, transparent)", zIndex: 2 }}>
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center" style={{ paddingBottom: CAPSULE_R - 2, gap: 8 }}>
                      <span className="text-[14px] font-semibold tabular-nums leading-none" style={{ color: "var(--text-heading)" }}>6</span>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring", stiffness: 300 }} className="rounded-full" style={{ width: 12, height: 12, background: planetConfig.jupiter.color, boxShadow: `0 0 8px ${planetConfig.jupiter.color}` }} />
                    </div>
                  </motion.div>

                  <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-20" aria-hidden="true" style={{ background: "linear-gradient(to top, var(--bg-primary), transparent)" }} />
                </div>

                <BottomNav active="timeline" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" className="mt-10 flex flex-col items-center gap-4" threshold={0.05}>
          <AppStoreBadges />
        </ScrollReveal>
      </div>
    </section>
  );
}
