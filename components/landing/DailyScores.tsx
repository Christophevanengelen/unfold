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
            {t("daily.title", "Past. Present. Next.")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t("daily.subtitle", "Each momentum period has its own signature — a unique combination of planetary signals and intensity.")}
          </p>
          {/* Three signal descriptions */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-brand-10/60">
            <span>{t("daily.past", "Understand what shaped you")}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{t("daily.present", "Read your current signal")}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{t("daily.next", "See what rhythm is forming")}</span>
          </div>
        </ScrollReveal>

        {/* Phone mockup — appears after header as you scroll */}
        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.1}>
          <div
            role="img"
            aria-label="Unfold app showing your current momentum signal with planet keywords and intensity"
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
