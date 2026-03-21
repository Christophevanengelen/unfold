"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
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
    quote: "I used to overthink every big decision. Now I check my signal first. Last month it told me Tuesday was my peak day for presentations \u2014 I nailed it.",
    name: "Sarah M.",
    detail: "Product designer, 3 months",
    accent: "var(--accent-pink)",
  },
  {
    quote: "The momentum timeline changed how I plan my week. I schedule important calls on peak days and keep low-signal days for admin. Game changer.",
    name: "David K.",
    detail: "Premium subscriber",
    accent: "var(--accent-blue)",
  },
  {
    quote: "My partner and I both use it. Seeing when our signals sync helps us pick the best days for big conversations. Surprisingly accurate.",
    name: "Lena R.",
    detail: "Using Unfold for 6 months",
    accent: "var(--accent-green)",
  },
];

// ─── Animated counter ────────────────────────────────────────
function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      // Ease-out curve
      const progress = 1 - Math.pow(1 - step / steps, 3);
      setCount(Math.round(target * progress));
      if (step >= steps) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}+
    </span>
  );
}

export function SocialProof({ translations }: SocialProofProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Rating badge */}
        <ScrollReveal variant="fadeUp" className="flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-brand-10/10 bg-brand-10/5 px-6 py-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 text-[#E5A940]" />
              ))}
            </div>
            <span className="text-base font-bold text-white">4.8</span>
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
                {/* Accent line at top */}
                <div
                  className="mb-6 h-0.5 w-12 rounded-full"
                  style={{ background: item.accent }}
                />
                <p className="flex-1 text-base leading-relaxed text-brand-10">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: `color-mix(in srgb, ${item.accent} 20%, transparent)`,
                      color: item.accent,
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

        {/* Animated user counter */}
        <ScrollReveal variant="fadeUp" className="mt-12 text-center">
          <motion.div
            className="inline-flex items-center gap-2 rounded-2xl border border-brand-10/8 bg-brand-10/3 px-8 py-4"
          >
            <span className="text-2xl font-bold text-white">
              <AnimatedCounter target={2400} />
            </span>
            <span className="text-sm text-brand-10/60">
              {t(translations, "social.counter_label", "people reading their signal")}
            </span>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
