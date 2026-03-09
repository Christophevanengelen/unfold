import { AppStoreBadges } from "./AppStoreBadges";

interface HeroProps {
  t: (key: string, fallback?: string) => string;
}

export function Hero({ t }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-bg-brand-strong py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-purple">
            {t("hero.eyebrow", "Your personal momentum engine")}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-7xl">
            {t("hero.title", "Know when life moves in your favor")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-7 md:text-xl">
            {t("hero.subtitle", "Understand your daily rhythms across Love, Health, and Work. Make better decisions with clarity, not guesswork.")}
          </p>
          <div className="mt-10">
            <AppStoreBadges />
          </div>
        </div>
      </div>
      {/* Gradient orb decoration */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent-purple/20 blur-3xl" />
    </section>
  );
}
