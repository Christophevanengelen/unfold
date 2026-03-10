import { EmbeddedDomainMockup } from "./LandingMockup";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface DesignedForClarityProps {
  t: (key: string, fallback?: string) => string;
}

export function DesignedForClarity({ t }: DesignedForClarityProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header text — one cohesive block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t("clarity.title", "Designed for daily clarity")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t("clarity.subtitle", "Every screen delivers exactly what you need. Nothing more.")}
          </p>
          {/* 3 UX principles */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm font-medium text-logo-lavender/70">
            <span>{t("clarity.p1", "Read in 3 seconds")}</span>
            <span aria-hidden="true" className="text-brand-10/30">|</span>
            <span>{t("clarity.p2", "One screen, one answer")}</span>
            <span aria-hidden="true" className="text-brand-10/30">|</span>
            <span>{t("clarity.p3", "Premium, not noisy")}</span>
          </div>
        </ScrollReveal>

        {/* Phone mockup — appears after header as you scroll */}
        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.1}>
          <div
            role="img"
            aria-label="Unfold app showing a detailed domain view with daily clarity score and insights"
            className="relative h-[812px] w-[375px] overflow-hidden"
            style={{
              borderRadius: "2.25rem",
              boxShadow: "0 8px 60px rgba(20, 15, 45, 0.6), 0 2px 20px rgba(20, 15, 45, 0.35)",
            }}
          >
            <EmbeddedDomainMockup />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
