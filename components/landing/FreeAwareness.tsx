import { Clock } from "flowbite-react-icons/outline";
import { Eye } from "flowbite-react-icons/outline";
import { ArrowRight } from "flowbite-react-icons/outline";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface FreeAwarenessProps {
  t: (key: string, fallback?: string) => string;
  translations?: import("@/lib/i18n").TranslationMap;
}

export function FreeAwareness({ t, translations }: FreeAwarenessProps) {
  const signals = [
    {
      icon: Clock,
      color: "var(--accent-purple)",
      twColor: "text-accent-purple",
      label: t("free.past.title", "Past signal"),
      desc: t("free.past.desc", "See which planets shaped your last momentum period and what it meant."),
    },
    {
      icon: Eye,
      color: "var(--accent-purple)",
      twColor: "text-accent-purple",
      label: t("free.present.title", "Present signal"),
      desc: t("free.present.desc", "Your current momentum signature — the planets active right now and their intensity."),
    },
    {
      icon: ArrowRight,
      color: "var(--accent-purple)",
      twColor: "text-accent-purple",
      label: t("free.future.title", "Next signal"),
      desc: t("free.future.desc", "A preview of the momentum forming ahead. Know what rhythm is coming."),
    },
  ];

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <SectionHeader
          translations={translations}
          eyebrowKey="free.eyebrow"
          eyebrowFallback="Always free"
          titleKey="free.title"
          titleFallback="Three signals. One clear picture."
          subtitleKey="free.subtitle"
          subtitleFallback="Every day, Unfold reads your past, present, and next momentum — free, forever."
        />

        {/* Cards — stagger in after header */}
        <ScrollRevealGroup className="mt-12 grid gap-8 md:grid-cols-3" stagger={0.15}>
          {signals.map((signal) => (
            <ScrollRevealItem key={signal.label} variant="fadeUp">
              <div className="p-8 text-center">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: `color-mix(in srgb, ${signal.color} 10%, transparent)` }}
                >
                  <signal.icon className={`h-7 w-7 ${signal.twColor}`} />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">{signal.label}</h3>
                <p className="mt-2 text-brand-10">{signal.desc}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}
