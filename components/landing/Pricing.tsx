import { Check } from "flowbite-react-icons/outline";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PricingToggle } from "./PricingToggle";

interface PricingProps {
  t: (key: string, fallback?: string) => string;
}

export function Pricing({ t }: PricingProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header text — one cohesive block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t("pricing.title", "Free forever. Premium when you're ready.")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t("pricing.subtitle", "Your current signal is always free. Premium unlocks your full momentum timeline.")}
          </p>
        </ScrollReveal>

        <PricingToggle
          labels={{
            monthly: t("pricing.toggle.monthly", "Monthly"),
            yearly: t("pricing.toggle.yearly", "Yearly"),
            save: t("pricing.toggle.save", "Save 39%"),
          }}
          freeCard={
            <div className="landing-glass p-8">
              <h3 className="font-display text-2xl font-semibold text-white">
                {t("pricing.free.name", "Free")}
              </h3>
              <p className="mt-2 text-brand-10">
                {t("pricing.free.desc", "Your current momentum signal, always.")}
              </p>
              <p className="mt-6 font-display text-4xl font-bold text-white">
                {t("pricing.free.price", "$0")}
              </p>
              <ul className="mt-8 space-y-3 text-sm text-brand-11">
                {[
                  t("pricing.free.f1", "Current momentum signal"),
                  t("pricing.free.f2", "Planet keywords & intensity"),
                  t("pricing.free.f3", "Past signal review"),
                  t("pricing.free.f4", "Basic compatibility"),
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          }
          premiumMonthly={
            <p className="font-display text-4xl font-bold text-white">
              $4
              <span className="text-base font-normal text-brand-10">
                {t("pricing.premium.period", "/month")}
              </span>
            </p>
          }
          premiumYearly={
            <div>
              <p className="font-display text-4xl font-bold text-white">
                $29
                <span className="text-base font-normal text-brand-10">
                  {t("pricing.premium.period.year", "/year")}
                </span>
              </p>
            </div>
          }
          premiumCard={
            <>
              <div className="flex items-center gap-3">
                <h3 className="font-display text-2xl font-semibold text-white">
                  {t("pricing.premium.name", "Premium")}
                </h3>
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium text-logo-lavender"
                  style={{
                    background: "color-mix(in srgb, #9585CC 15%, transparent)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {t("pricing.premium.badge", "Most popular")}
                </span>
              </div>
              <p className="mt-2 text-brand-10">
                {t("pricing.premium.desc", "Your full timeline, revealed.")}
              </p>
            </>
          }
          premiumFeatures={
            <ul className="mt-8 space-y-3 text-sm text-brand-11">
              {[
                t("pricing.premium.f1", "Everything in Free"),
                t("pricing.premium.f2", "Full momentum timeline"),
                t("pricing.premium.f3", "Future signal preview"),
                t("pricing.premium.f4", "Peak window alerts"),
                t("pricing.premium.f5", "Planetary transit details"),
                t("pricing.premium.f6", "Advanced compatibility"),
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-logo-lavender" />
                  {f}
                </li>
              ))}
            </ul>
          }
        />

        {/* Subscription justification */}
        <ScrollReveal variant="fadeUp" className="mt-8 flex justify-center">
          <div className="landing-glass max-w-xl rounded-2xl px-6 py-3">
            <p className="text-sm text-brand-10 text-center">
              {t("pricing.justification", "Premium evolves with you — your timeline updates as new planetary signals shape your rhythm.")}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
