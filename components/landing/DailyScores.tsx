interface DailyScoresProps {
  t: (key: string, fallback?: string) => string;
}

export function DailyScores({ t }: DailyScoresProps) {
  return (
    <section className="bg-bg-secondary py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            {t("scores.title", "Yesterday. Today. Tomorrow.")}
          </h2>
          <p className="mt-6 text-lg text-text-body-subtle">
            {t("scores.subtitle", "See where your momentum was, where it is, and where it's heading. Three days of clarity at a glance.")}
          </p>
        </div>
        {/* iPhone mockup placeholder */}
        <div className="mt-16 flex justify-center">
          <div className="h-[600px] w-[300px] rounded-[3rem] border-4 border-border-dark bg-bg-brand-strong p-4">
            <div className="flex h-full flex-col items-center justify-center rounded-[2.25rem] bg-brand-12 text-center text-brand-7">
              <p className="text-sm font-medium">iPhone Mockup</p>
              <p className="mt-1 text-xs">Yesterday / Today / Tomorrow</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
