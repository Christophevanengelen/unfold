"use client";

import { motion } from "motion/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { houseConfig, type HouseNumber } from "@/lib/domain-config";
import type { TranslationMap } from "@/lib/i18n";

interface LifeDomainsProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// 12 domains, most relatable first, in 3 rows of 4
const ROW_1: HouseNumber[] = [10, 7, 2, 5];
const ROW_2: HouseNumber[] = [1, 4, 6, 9];
const ROW_3: HouseNumber[] = [11, 8, 3, 12];

/**
 * LifeDomains — replaces "DesignedForClarity".
 *
 * Shows the 12 life domains as an elegant horizontal scroll
 * of colored pills. The message: "Not 3 categories. Twelve
 * precise life domains. Like a pro astrologer reads them."
 */
export function LifeDomains({ translations }: LifeDomainsProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <SectionHeader
          translations={translations}
          eyebrowKey="domains.eyebrow"
          eyebrowFallback="Beyond the basics"
          titleKey="domains.title"
          titleFallback="Twelve life domains. Not just three."
          subtitleKey="domains.subtitle"
          subtitleFallback="Each signal tells you exactly which area of your life is activated. Career, love, money, home, creativity... and seven more."
        />

        {/* Domain pills — 3 rows of 4, generous spacing */}
        <div className="mt-20 space-y-5">
          {[ROW_1, ROW_2, ROW_3].map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-4">
              {row.map((house) => {
                const config = houseConfig[house];
                return (
                  <ScrollReveal
                    key={house}
                    variant="fadeUp"
                    className="inline-block"
                  >
                    <motion.div
                      className="flex items-center gap-3 rounded-full px-6 py-3"
                      style={{
                        background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--accent-purple) 15%, transparent)",
                      }}
                      whileHover={{
                        scale: 1.06,
                        background: `color-mix(in srgb, ${config.color} 10%, transparent)`,
                        borderColor: config.color + "40",
                        transition: { duration: 0.25 },
                      }}
                    >
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: config.color,
                          boxShadow: `0 0 8px ${config.color}40`,
                        }}
                      />
                      <span className="text-[15px] font-medium text-white/75 tracking-wide">
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
        <ScrollReveal variant="fadeUp" className="mt-16 text-center">
          <p className="text-sm text-brand-10/50">
            {t(translations, "domains.closer", "The domain tells you what. The planets tell you why.")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
