interface ScienceTechnologyProps {
  t: (key: string, fallback?: string) => string;
}

export function ScienceTechnology({ t }: ScienceTechnologyProps) {
  return (
    <section className="bg-bg-secondary py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-purple">
            {t("science.eyebrow", "Built on signal, not noise")}
          </p>
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            {t("science.title", "The technology behind your timing")}
          </h2>
          <p className="mt-6 text-lg text-text-body-subtle">
            {t("science.subtitle", "Unfold combines behavioral science with advanced pattern recognition to surface your personal momentum signals.")}
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            { title: t("science.pattern.title", "Pattern recognition"), desc: t("science.pattern.desc", "Advanced algorithms identify recurring rhythms in your daily momentum data.") },
            { title: t("science.personal.title", "Personal calibration"), desc: t("science.personal.desc", "Your signals are uniquely yours. The engine learns and adapts to your patterns.") },
            { title: t("science.privacy.title", "Privacy-first"), desc: t("science.privacy.desc", "Your data belongs to you. Encrypted. Private. Never shared.") },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-text-body-subtle">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
