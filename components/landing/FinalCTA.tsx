import { AppStoreBadges } from "./AppStoreBadges";

interface FinalCTAProps {
  t: (key: string, fallback?: string) => string;
}

export function FinalCTA({ t }: FinalCTAProps) {
  return (
    <section className="bg-bg-brand-strong py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold text-white md:text-5xl">
            {t("cta.title", "Your momentum is waiting")}
          </h2>
          <p className="mt-6 text-lg text-brand-7">
            {t("cta.subtitle", "Download Unfold and discover the rhythms that move your life forward.")}
          </p>
          <div className="mt-10">
            <AppStoreBadges />
          </div>
        </div>
      </div>
    </section>
  );
}
