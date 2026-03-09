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
            {t("pricing.title", "Start free. Unlock more.")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t("pricing.subtitle", "Your daily momentum signal is always free. Premium unlocks the full picture.")}
          </p>
        </ScrollReveal>

        <PricingToggle
          labels={{
            monthly: t("pricing.toggle.monthly", "Monthly"),
            yearly: t("pricing.toggle.yearly", "Yearly"),
            save: t("pricing.toggle.save", "Save 17%"),
          }}
          freeCard={
            <div className="landing-glass p-8">
              <h3 className="font-display text-2xl font-semibold text-white">
                {t("pricing.free.name", "Free")}
              </h3>
              <p className="mt-2 text-brand-10">
                {t("pricing.free.desc", "Your daily momentum signal, always.")}
              </p>
              <p className="mt-6 font-display text-4xl font-bold text-white">
                {t("pricing.free.price", "$0")}
              </p>
              <ul className="mt-8 space-y-3 text-sm text-brand-11">
                {[
                  t("pricing.free.f1", "Today's momentum score"),
                  t("pricing.free.f2", "Love, Health & Work breakdown"),
                  t("pricing.free.f3", "Yesterday's review"),
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
              $2.99
              <span className="text-base font-normal text-brand-10">
                {t("pricing.premium.period", "/month")}
              </span>
            </p>
          }
          premiumYearly={
            <div>
              <p className="font-display text-4xl font-bold text-white">
                $29.90
                <span className="text-base font-normal text-brand-10">
                  {t("pricing.premium.period.year", "/year")}
                </span>
              </p>
              <p className="mt-1 text-sm text-brand-10">
                {t("pricing.premium.permonth", "$2.49/month, billed annually")}
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
                {t("pricing.premium.desc", "See further. Move smarter.")}
              </p>
            </>
          }
          premiumFeatures={
            <ul className="mt-8 space-y-3 text-sm text-brand-11">
              {[
                t("pricing.premium.f1", "Everything in Free"),
                t("pricing.premium.f2", "Tomorrow's forecast"),
                t("pricing.premium.f3", "Future momentum windows"),
                t("pricing.premium.f4", "Monthly momentum map"),
                t("pricing.premium.f5", "Peak alerts"),
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
      </div>
    </section>
  );
}
