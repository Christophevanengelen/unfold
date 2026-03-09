import { AppStoreBadges } from "./AppStoreBadges";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface HeroProps {
  t: (key: string, fallback?: string) => string;
}

export function Hero({ t }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-28 md:py-36 lg:py-44">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* All hero text + CTA as one cohesive block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center" threshold={0.05}>
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t("hero.eyebrow", "Your personal momentum engine")}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            {t("hero.title", "Know when life moves in your favor")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-10 md:text-xl">
            {t("hero.subtitle", "Understand your daily rhythms across Love, Health, and Work. Make better decisions with clarity, not guesswork.")}
          </p>
          <div className="mt-10">
            <AppStoreBadges />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
