import { AppStoreBadges } from "./AppStoreBadges";
import { EmbeddedHeroMockup } from "./LandingMockup";
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
            {t("hero.eyebrow", "Personal timing app")}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            {t("hero.title", "Your personal signal, decoded")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-10 md:text-xl">
            {t("hero.subtitle", "Every momentum period has a signature — a unique combination of signals that shape your timing.")}
            <br />
            {t("hero.subtitle2", "See yours, free.")}
          </p>
          <div className="mt-10">
            <AppStoreBadges />
          </div>
        </ScrollReveal>

        {/* Product mockup — static on Today */}
        <ScrollReveal variant="scaleIn" className="mt-12 flex justify-center" threshold={0.05}>
          <div
            className="relative mx-auto"
            style={{ width: 293, height: 634 }}
          >
            <div
              role="img"
              aria-label="Unfold app showing your current momentum signal with planet keywords"
              className="absolute inset-0 origin-top-left overflow-hidden"
              style={{
                width: 375,
                height: 812,
                transform: "scale(0.78)",
                borderRadius: "2.25rem",
                boxShadow: "0 8px 60px rgba(20, 15, 45, 0.6), 0 2px 20px rgba(20, 15, 45, 0.35)",
              }}
            >
              <EmbeddedHeroMockup />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
