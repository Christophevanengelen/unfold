import { AppStoreBadges } from "./AppStoreBadges";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface FinalCTAProps {
  t: (key: string, fallback?: string) => string;
}

export function FinalCTA({ t }: FinalCTAProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* All CTA content — one cohesive block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t("cta.title", "Download Unfold")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t("cta.subtitle", "Your personal signal, decoded. See your momentum — past, present, and next. Free on iOS and Android.")}
          </p>
          <div className="mt-10">
            <AppStoreBadges />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
