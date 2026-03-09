import { Heart } from "flowbite-react-icons/outline";
import { Briefcase } from "flowbite-react-icons/outline";
import { CheckCircle } from "flowbite-react-icons/outline";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";

interface FreeAwarenessProps {
  t: (key: string, fallback?: string) => string;
}

export function FreeAwareness({ t }: FreeAwarenessProps) {
  const axes = [
    { icon: Heart, color: "var(--accent-pink)", twColor: "text-accent-pink", label: t("free.love", "Love"), desc: t("free.love.desc", "Relational momentum and emotional clarity") },
    { icon: CheckCircle, color: "var(--accent-green)", twColor: "text-accent-green", label: t("free.health", "Health"), desc: t("free.health.desc", "Physical vitality and energy rhythms") },
    { icon: Briefcase, color: "var(--accent-blue)", twColor: "text-accent-blue", label: t("free.work", "Work"), desc: t("free.work.desc", "Creative focus and professional timing") },
  ];

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header text — one cohesive block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t("free.eyebrow", "Free forever")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t("free.title", "Daily momentum awareness")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t("free.subtitle", "Every day, understand your rhythms across three axes. No guesswork. No noise. Just clarity.")}
          </p>
        </ScrollReveal>

        {/* Cards — stagger in after header */}
        <ScrollRevealGroup className="mt-16 grid gap-8 md:grid-cols-3" stagger={0.15}>
          {axes.map((axis) => (
            <ScrollRevealItem key={axis.label} variant="fadeUp">
              <div className="p-8 text-center">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: `color-mix(in srgb, ${axis.color} 10%, transparent)` }}
                >
                  <axis.icon className={`h-7 w-7 ${axis.twColor}`} />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">{axis.label}</h3>
                <p className="mt-2 text-brand-10">{axis.desc}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}
