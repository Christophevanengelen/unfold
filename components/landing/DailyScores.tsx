import { EmbeddedOverallMockup } from "./LandingMockup";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface DailyScoresProps {
  t: (key: string, fallback?: string) => string;
}

export function DailyScores({ t }: DailyScoresProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header text — one cohesive block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t("scores.title", "Yesterday. Today. Tomorrow.")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t("scores.subtitle", "See where your momentum was, where it is, and where it's heading. Three days of clarity at a glance.")}
          </p>
        </ScrollReveal>

        {/* Phone mockup — appears after header as you scroll */}
        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.1}>
          <div
            className="relative h-[812px] w-[375px] overflow-hidden"
            style={{
              borderRadius: "2.25rem",
              boxShadow: "0 8px 60px rgba(20, 15, 45, 0.6), 0 2px 20px rgba(20, 15, 45, 0.35)",
            }}
          >
            <EmbeddedOverallMockup />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
