import { Check } from "flowbite-react-icons/outline";
import { ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";

interface PricingProps {
  t: (key: string, fallback?: string) => string;
}

export function Pricing({ t }: PricingProps) {
  return (
    <section className="bg-bg-secondary py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            {t("pricing.title", "Start free. Unlock more.")}
          </h2>
          <p className="mt-6 text-lg text-text-body-subtle">
            {t("pricing.subtitle", "Your daily momentum signal is always free. Premium unlocks the full picture.")}
          </p>
        </div>
        <ScrollRevealGroup className="mt-16 grid gap-8 md:grid-cols-2" stagger={0.18}>
          {/* Free tier */}
          <ScrollRevealItem variant="slideLeft">
            <div className="rounded-2xl border border-border-light bg-bg-primary p-8">
              <h3 className="font-display text-2xl font-semibold">
                {t("pricing.free.name", "Free")}
              </h3>
              <p className="mt-2 text-text-body-subtle">
                {t("pricing.free.desc", "Your daily momentum signal, always.")}
              </p>
              <p className="mt-6 font-display text-4xl font-bold">
                {t("pricing.free.price", "$0")}
              </p>
              <ul className="mt-8 space-y-3 text-sm text-text-body">
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
          </ScrollRevealItem>
          {/* Premium tier */}
          <ScrollRevealItem variant="slideRight">
            <div className="rounded-2xl border-2 border-accent-purple bg-bg-primary p-8 shadow-lg">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-2xl font-semibold">
                  {t("pricing.premium.name", "Premium")}
                </h3>
                <span className="rounded-full bg-bg-brand-soft px-3 py-1 text-xs font-medium text-accent-purple">
                  {t("pricing.premium.badge", "Most popular")}
                </span>
              </div>
              <p className="mt-2 text-text-body-subtle">
                {t("pricing.premium.desc", "See further. Move smarter.")}
              </p>
              <p className="mt-6 font-display text-4xl font-bold">
                {t("pricing.premium.price", "$4.99")}
                <span className="text-base font-normal text-text-body-subtle">
                  {t("pricing.premium.period", "/month")}
                </span>
              </p>
              <ul className="mt-8 space-y-3 text-sm text-text-body">
                {[
                  t("pricing.premium.f1", "Everything in Free"),
                  t("pricing.premium.f2", "Tomorrow's forecast"),
                  t("pricing.premium.f3", "Future momentum windows"),
                  t("pricing.premium.f4", "Monthly momentum map"),
                  t("pricing.premium.f5", "Peak alerts"),
                  t("pricing.premium.f6", "Advanced compatibility"),
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-purple" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollRevealItem>
        </ScrollRevealGroup>
      </div>
    </section>
  );
}
