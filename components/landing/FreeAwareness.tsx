interface FreeAwarenessProps {
  t: (key: string, fallback?: string) => string;
}

export function FreeAwareness({ t }: FreeAwarenessProps) {
  return (
    <section className="bg-bg-primary py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-purple">
            {t("free.eyebrow", "Free forever")}
          </p>
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            {t("free.title", "Daily momentum awareness")}
          </h2>
          <p className="mt-6 text-lg text-text-body-subtle">
            {t("free.subtitle", "Every day, understand your rhythms across three axes. No guesswork. No noise. Just clarity.")}
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            { icon: "💜", label: t("free.love", "Love"), desc: t("free.love.desc", "Relational momentum and emotional clarity") },
            { icon: "💚", label: t("free.health", "Health"), desc: t("free.health.desc", "Physical vitality and energy rhythms") },
            { icon: "💼", label: t("free.work", "Work"), desc: t("free.work.desc", "Creative focus and professional timing") },
          ].map((axis) => (
            <div key={axis.label} className="rounded-2xl border border-border-light bg-bg-secondary p-8 text-center">
              <div className="text-4xl">{axis.icon}</div>
              <h3 className="mt-4 font-display text-xl font-semibold">{axis.label}</h3>
              <p className="mt-2 text-text-body-subtle">{axis.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
