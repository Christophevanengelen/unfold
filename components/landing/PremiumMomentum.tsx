import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";
import { mockForecast } from "@/lib/mock-data";

interface PremiumMomentumProps {
  t: (key: string, fallback?: string) => string;
}

// Day abbreviations for the forecast
const DAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PremiumMomentum({ t }: PremiumMomentumProps) {
  const features = [
    {
      title: t("premium.forecast.title", "See your next strong days"),
      desc: t("premium.forecast.desc", "See your upcoming peaks before they arrive. Plan your week around your natural rhythms."),
    },
    {
      title: t("premium.map.title", "Plan around your peak windows"),
      desc: t("premium.map.desc", "A bird's-eye view of your month. Spot patterns, plan ahead, stay aligned."),
    },
    {
      title: t("premium.alerts.title", "Get alerts before key moments"),
      desc: t("premium.alerts.desc", "Real-time notifications when exceptional momentum windows open."),
    },
    {
      title: t("premium.compat.title", "Go deeper with advanced compatibility"),
      desc: t("premium.compat.desc", "Deep relational analysis. Shared peak discovery. Timing synergy reports."),
    },
  ];

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Editorial transition */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-8 text-sm italic text-brand-10/60">
            {t("premium.transition", "Free helps you read today. Premium helps you see what's next.")}
          </p>
        </ScrollReveal>

        {/* Header text — one cohesive block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t("premium.eyebrow", "Premium")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t("premium.title", "Your future, mapped")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t("premium.subtitle", "See your strongest windows before they arrive.")}
          </p>
        </ScrollReveal>

        {/* 7-day forecast visualization — app-native feel */}
        <ScrollReveal variant="scaleIn" className="mt-12 flex justify-center">
          <div
            className="landing-glass w-full max-w-lg overflow-hidden"
            style={{
              borderColor: "color-mix(in srgb, #9585CC 30%, transparent)",
              borderWidth: 1,
            }}
          >
            <div className="p-6 pb-5">
              <p className="mb-5 text-[11px] font-medium uppercase tracking-wider text-brand-10/50">
                Next 7 days
              </p>
              <div className="flex items-end gap-2 sm:gap-3" style={{ height: 130 }}>
                {mockForecast.map((day, i) => {
                  const barHeight = Math.max(24, (day.momentum / 100) * 110);
                  const dayDate = new Date(day.date);
                  const dayAbbr = DAY_ABBR[dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1];

                  return (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                      {/* Momentum number */}
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: day.isPeak ? "#9585CC" : "color-mix(in srgb, white 40%, transparent)" }}
                      >
                        {day.momentum}
                      </span>

                      {/* Bar */}
                      <div
                        className="w-full rounded-xl"
                        style={{
                          height: barHeight,
                          maxWidth: 36,
                          background: day.isPeak
                            ? "linear-gradient(to top, color-mix(in srgb, #9585CC 25%, transparent), color-mix(in srgb, #9585CC 60%, transparent))"
                            : "color-mix(in srgb, white 6%, transparent)",
                          ...(day.isPeak
                            ? { boxShadow: "0 0 16px color-mix(in srgb, #9585CC 25%, transparent)" }
                            : {}),
                        }}
                      />

                      {/* Peak indicator dot */}
                      {day.isPeak && (
                        <div
                          className="h-1 w-1 rounded-full"
                          style={{ background: "#9585CC" }}
                        />
                      )}

                      {/* Day abbreviation */}
                      <span
                        className="text-[10px]"
                        style={{
                          color: day.isPeak ? "#9585CC" : "color-mix(in srgb, white 30%, transparent)",
                          fontWeight: day.isPeak ? 500 : 400,
                        }}
                      >
                        {dayAbbr}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature cards — stagger in after header */}
        <ScrollRevealGroup className="mt-16 grid gap-6 md:grid-cols-2" stagger={0.12}>
          {features.map((f) => (
            <ScrollRevealItem key={f.title} variant="fadeUp">
              <div className="landing-glass p-8">
                <h3 className="font-display text-xl font-semibold text-white">{f.title}</h3>
                <p className="mt-3 text-brand-10">{f.desc}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}
