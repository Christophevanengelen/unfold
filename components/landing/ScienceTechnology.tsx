import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";

interface ScienceTechnologyProps {
  t: (key: string, fallback?: string) => string;
}

export function ScienceTechnology({ t }: ScienceTechnologyProps) {
  const items = [
    { title: t("science.pattern.title", "High-precision data"), desc: t("science.pattern.desc", "Built on JPL/NASA ephemerides and real-time planetary calculations."), color: "#9585CC" },
    { title: t("science.personal.title", "Personal models"), desc: t("science.personal.desc", "Proprietary AI models adapt to your rhythm over time."), color: "#5B7FEE" },
    { title: t("science.privacy.title", "Private by design"), desc: t("science.privacy.desc", "Your personal data stays personal."), color: "#3CB179" },
  ];

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header text — one cohesive block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t("science.eyebrow", "Built on signal, not noise")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t("science.title", "Powered by precision, not prediction.")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t("science.subtitle", "Built on JPL/NASA ephemerides, real-time planetary calculations, and proprietary AI models.")}
          </p>
        </ScrollReveal>

        {/* Cards — stagger in after header */}
        <ScrollRevealGroup className="mt-16 grid gap-8 md:grid-cols-3" stagger={0.12}>
          {items.map((item) => (
            <ScrollRevealItem key={item.title} variant="fadeUp">
              <div className="landing-glass relative overflow-hidden p-8 text-center">
                {/* Colored accent line at top */}
                <div
                  className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
                />
                <h3 className="font-display text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-brand-10">{item.desc}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}
