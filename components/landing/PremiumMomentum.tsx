import { ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";

interface PremiumMomentumProps {
  t: (key: string, fallback?: string) => string;
}

export function PremiumMomentum({ t }: PremiumMomentumProps) {
  const features = [
    {
      title: t("premium.forecast.title", "Future momentum windows"),
      desc: t("premium.forecast.desc", "See your upcoming peaks before they arrive. Plan your week around your natural rhythms."),
    },
    {
      title: t("premium.map.title", "Monthly momentum map"),
      desc: t("premium.map.desc", "A bird's-eye view of your month. Spot patterns, plan ahead, stay aligned."),
    },
    {
      title: t("premium.alerts.title", "Peak alerts"),
      desc: t("premium.alerts.desc", "Real-time notifications when exceptional momentum windows open."),
    },
    {
      title: t("premium.compat.title", "Advanced compatibility"),
      desc: t("premium.compat.desc", "Deep relational analysis. Shared peak discovery. Timing synergy reports."),
    },
  ];

  return (
    <section className="bg-bg-brand-strong py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t("premium.eyebrow", "Premium")}
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-5xl">
            {t("premium.title", "See further. Move smarter.")}
          </h2>
          <p className="mt-6 text-lg text-brand-7">
            {t("premium.subtitle", "Unlock the full power of your personal momentum engine.")}
          </p>
        </div>
        <ScrollRevealGroup className="mt-16 grid gap-6 md:grid-cols-2" stagger={0.12}>
          {features.map((f) => (
            <ScrollRevealItem key={f.title} variant="fadeUp">
              <div className="rounded-2xl border border-brand-8/30 bg-brand-11/50 p-8">
                <h3 className="font-display text-xl font-semibold text-white">{f.title}</h3>
                <p className="mt-3 text-brand-7">{f.desc}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}
