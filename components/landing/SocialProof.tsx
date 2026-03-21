"use client";

import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";
import { Star } from "flowbite-react-icons/solid";
import type { TranslationMap } from "@/lib/i18n";

interface SocialProofProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

const TESTIMONIALS = [
  {
    quote: "Finally an app that explains timing without the noise. I check my signal every morning.",
    name: "Sarah M.",
    detail: "Using Unfold for 3 months",
  },
  {
    quote: "The momentum timeline changed how I plan my week. Seeing when peaks form ahead is invaluable.",
    name: "David K.",
    detail: "Premium subscriber",
  },
  {
    quote: "Clean, clear, and genuinely useful. This is what personal timing should feel like.",
    name: "Lena R.",
    detail: "Using Unfold for 6 months",
  },
];

export function SocialProof({ translations }: SocialProofProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Rating badge */}
        <ScrollReveal variant="fadeUp" className="flex justify-center">
          <div className="flex items-center gap-2 rounded-full border border-brand-10/10 bg-brand-10/5 px-5 py-2.5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 text-[#E5A940]" />
              ))}
            </div>
            <span className="text-sm font-semibold text-white">4.8</span>
            <span className="text-sm text-brand-10/60">
              {t(translations, "social.rating", "on the App Store")}
            </span>
          </div>
        </ScrollReveal>

        {/* Headline */}
        <ScrollReveal variant="fadeUp" className="mt-8 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t(translations, "social.title", "Trusted by people who value clarity")}
          </h2>
        </ScrollReveal>

        {/* Testimonial cards */}
        <ScrollRevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {TESTIMONIALS.map((item) => (
            <ScrollRevealItem key={item.name} variant="fadeUp">
              <div className="landing-glass flex h-full flex-col p-8">
                <p className="flex-1 text-base leading-relaxed text-brand-10">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  {/* Avatar placeholder — initials */}
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: "color-mix(in srgb, var(--accent-purple) 20%, transparent)",
                      color: "var(--accent-purple)",
                    }}
                  >
                    {item.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-brand-10/50">{item.detail}</p>
                  </div>
                </div>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>

        {/* User counter */}
        <ScrollReveal variant="fadeUp" className="mt-10 text-center">
          <p className="text-sm text-brand-10/60">
            {t(translations, "social.counter", "Join 2,400+ people reading their signal.")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
