"use client";

import { motion } from "motion/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { houseConfig, type HouseNumber } from "@/lib/domain-config";
import type { TranslationMap } from "@/lib/i18n";

interface LifeDomainsProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// 12 domains, most relatable first, in 2 rows of 6
const ROW_1: HouseNumber[] = [10, 7, 2, 5, 1, 4];
const ROW_2: HouseNumber[] = [6, 9, 11, 8, 3, 12];

/**
 * LifeDomains — replaces "DesignedForClarity".
 *
 * Shows the 12 life domains as an elegant horizontal scroll
 * of colored pills. The message: "Not 3 categories. Twelve
 * precise life domains. Like a pro astrologer reads them."
 */
export function LifeDomains({ translations }: LifeDomainsProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-2xl text-center">
          <p className="mb-3 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t(translations, "domains.eyebrow", "Beyond the basics")}
          </p>
          <h2 className="font-display text-3xl font-bold leading-tight text-white md:text-5xl">
            {t(translations, "domains.title", "Twelve life domains. Not just three.")}
          </h2>
          <p className="mt-4 text-lg text-brand-10/70">
            {t(translations, "domains.subtitle", "Each signal tells you exactly which area of your life is activated. Career, love, money, home, creativity... and seven more.")}
          </p>
        </ScrollReveal>

        {/* Domain pills — 2 rows */}
        <div className="mt-14 space-y-4">
          {[ROW_1, ROW_2].map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-3 flex-wrap">
              {row.map((house, i) => {
                const config = houseConfig[house];
                return (
                  <ScrollReveal
                    key={house}
                    variant="fadeUp"
                    className="inline-block"
                  >
                    <motion.div
                      className="flex items-center gap-2.5 rounded-full px-5 py-2.5"
                      style={{
                        background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--accent-purple) 12%, transparent)",
                      }}
                      whileHover={{
                        scale: 1.05,
                        borderColor: config.color + "40",
                        transition: { duration: 0.2 },
                      }}
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="text-sm font-medium text-white/80">
                        {config.label}
                      </span>
                    </motion.div>
                  </ScrollReveal>
                );
              })}
            </div>
          ))}
        </div>

        {/* Punchy closer */}
        <ScrollReveal variant="fadeUp" className="mt-12 text-center">
          <p className="text-sm text-brand-10/50">
            {t(translations, "domains.closer", "What a pro astrologer sees in your chart, made readable in seconds.")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
