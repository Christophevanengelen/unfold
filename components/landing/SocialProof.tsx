"use client";

import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";
import type { TranslationMap } from "@/lib/i18n";

interface SocialProofProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

/**
 * This section used to carry invented customer testimonials, an invented
 * App Store rating and an animated "2,400+ users" counter. None of those
 * claims could be substantiated, so they are gone. What remains are the
 * product's own commitments, owned by the brand, fully translatable, and
 * explicitly labelled as such (see `social.note`).
 */
const PROMISES = [
  { id: "promise1", index: "01", accent: "var(--accent-pink)" },
  { id: "promise2", index: "02", accent: "var(--accent-blue)" },
  { id: "promise3", index: "03", accent: "var(--accent-green)" },
] as const;

const PILLARS = [
  { id: "pillar1", accent: "var(--accent-pink)" },
  { id: "pillar2", accent: "var(--accent-blue)" },
  { id: "pillar3", accent: "var(--accent-green)" },
] as const;

const PROMISE_FALLBACKS: Record<
  string,
  { label: string; title: string; body: string }
> = {
  promise1: {
    label: "Daily clarity",
    title: "Know what today is asking of you",
    body: "Unfold reads the transits active on your birth chart today and names the pattern in plain language — no horoscope, no guesswork.",
  },
  promise2: {
    label: "Weekly rhythm",
    title: "Plan with your peaks, not against them",
    body: "Your momentum timeline shows which days carry intensity and which stay quiet, so you can place the demanding moves where they land best.",
  },
  promise3: {
    label: "Shared timing",
    title: "See where two rhythms meet",
    body: "Compare your timeline with someone else's and find the windows where you both peak — useful for the conversations that deserve a good day.",
  },
};

const PILLAR_FALLBACKS: Record<string, string> = {
  pillar1: "Daily signal, free forever",
  pillar2: "JPL/NASA ephemerides, computed in real time",
  pillar3: "Your data is never stored without your consent",
};

export function SocialProof({ translations }: SocialProofProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Eyebrow pill */}
        <ScrollReveal variant="fadeUp" className="flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-brand-10/10 bg-brand-10/5 px-6 py-3">
            <span className="flex gap-1" aria-hidden="true">
              {PROMISES.map((p) => (
                <span
                  key={p.id}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: p.accent }}
                />
              ))}
            </span>
            <span className="text-sm font-medium text-brand-10/70">
              {t(translations, "social.eyebrow", "Our product promise")}
            </span>
          </div>
        </ScrollReveal>

        {/* Headline */}
        <ScrollReveal variant="fadeUp" className="mt-8 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t(translations, "social.title", "Built to be useful the day you open it")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-brand-10/70 md:text-lg">
            {t(
              translations,
              "social.subtitle",
              "Three things your signal is built to do, described exactly as they work.",
            )}
          </p>
        </ScrollReveal>

        {/* Promise cards */}
        <ScrollRevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {PROMISES.map((item) => {
            const fallback = PROMISE_FALLBACKS[item.id];
            return (
              <ScrollRevealItem key={item.id} variant="fadeUp">
                <div className="landing-glass flex h-full flex-col p-8">
                  {/* Accent line at top */}
                  <div
                    className="mb-6 h-0.5 w-12 rounded-full"
                    style={{ background: item.accent }}
                  />
                  <h3 className="font-display text-xl font-semibold leading-snug text-white">
                    {t(translations, `social.${item.id}.title`, fallback.title)}
                  </h3>
                  <p className="mt-4 flex-1 text-base leading-relaxed text-brand-10">
                    {t(translations, `social.${item.id}.body`, fallback.body)}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold tabular-nums"
                      style={{
                        background: `color-mix(in srgb, ${item.accent} 20%, transparent)`,
                        color: item.accent,
                      }}
                    >
                      {item.index}
                    </div>
                    <p className="text-sm font-semibold text-brand-10/70">
                      {t(translations, `social.${item.id}.label`, fallback.label)}
                    </p>
                  </div>
                </div>
              </ScrollRevealItem>
            );
          })}
        </ScrollRevealGroup>

        {/* Commitments — what the product guarantees, no third-party metrics */}
        <ScrollReveal
          variant="fadeUp"
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {PILLARS.map((pillar) => (
            <span
              key={pillar.id}
              className="inline-flex items-center gap-2.5 rounded-2xl border border-brand-10/8 bg-brand-10/3 px-5 py-3 text-sm text-brand-10/70"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: pillar.accent }}
                aria-hidden="true"
              />
              {t(translations, `social.${pillar.id}`, PILLAR_FALLBACKS[pillar.id])}
            </span>
          ))}
        </ScrollReveal>

        {/* Honest framing — these are our words, not someone else's */}
        <ScrollReveal variant="fadeUp" className="mt-8 text-center">
          <p className="mx-auto max-w-xl text-xs leading-relaxed text-brand-10/40">
            {t(
              translations,
              "social.note",
              "These are Unfold's own product commitments, written by the team — not customer reviews.",
            )}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
