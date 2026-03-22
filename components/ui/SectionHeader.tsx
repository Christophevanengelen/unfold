"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { TranslationMap } from "@/lib/i18n";

type TranslateFn = (key: string, fallback?: string) => string;

interface SectionHeaderProps {
  /** Pass either translations map OR a t() function */
  translations?: TranslationMap;
  t?: TranslateFn;
  eyebrowKey?: string;
  eyebrowFallback?: string;
  titleKey: string;
  titleFallback: string;
  subtitleKey?: string;
  subtitleFallback?: string;
  /** Max-width class for the text container. Default: "max-w-3xl" */
  maxWidth?: string;
}

/**
 * SectionHeader — atomic, reusable header for all landing sections.
 *
 * Enforces consistent spacing, typography and hierarchy:
 * - Eyebrow: sm uppercase lavender, mb-4
 * - Title: display 3xl→5xl bold white, tracking-tight
 * - Subtitle: lg body text, mt-6, brand-10
 */
export function SectionHeader({
  translations,
  t: tFn,
  eyebrowKey,
  eyebrowFallback,
  titleKey,
  titleFallback,
  subtitleKey,
  subtitleFallback,
  maxWidth = "max-w-3xl",
}: SectionHeaderProps) {
  const tr = tFn
    ? tFn
    : (key: string, fallback?: string) => translations?.[key] ?? fallback ?? key;

  return (
    <ScrollReveal variant="fadeUp" className={`mx-auto ${maxWidth} text-center`}>
      {eyebrowKey && (
        <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
          {tr(eyebrowKey, eyebrowFallback)}
        </p>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
        {tr(titleKey, titleFallback)}
      </h2>
      {subtitleKey && (
        <p className="mt-6 text-lg text-brand-10">
          {tr(subtitleKey, subtitleFallback)}
        </p>
      )}
    </ScrollReveal>
  );
}
