"use client";

import { useState, type ReactNode } from "react";
import { ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";

interface PricingToggleProps {
  labels: { monthly: string; yearly: string; save: string };
  freeCard: ReactNode;
  premiumCard: ReactNode;
  premiumMonthly: ReactNode;
  premiumYearly: ReactNode;
  premiumFeatures: ReactNode;
}

export function PricingToggle({
  labels,
  freeCard,
  premiumCard,
  premiumMonthly,
  premiumYearly,
  premiumFeatures,
}: PricingToggleProps) {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      {/* Monthly / Yearly toggle */}
      <div className="mt-10 flex justify-center">
        <div
          className="inline-flex items-center gap-1 rounded-full p-1"
          style={{ background: "color-mix(in srgb, white 6%, transparent)" }}
        >
          <button
            onClick={() => setYearly(false)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              !yearly
                ? "bg-white/10 text-white shadow-sm"
                : "text-brand-10 hover:text-white"
            }`}
          >
            {labels.monthly}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
              yearly
                ? "bg-white/10 text-white shadow-sm"
                : "text-brand-10 hover:text-white"
            }`}
          >
            {labels.yearly}
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-accent-green"
              style={{ background: "color-mix(in srgb, var(--accent-green) 12%, transparent)" }}
            >
              {labels.save}
            </span>
          </button>
        </div>
      </div>

      <ScrollRevealGroup className="mt-12 grid gap-8 md:grid-cols-2" stagger={0.24}>
        {/* Free tier */}
        <ScrollRevealItem variant="slideLeft">
          {freeCard}
        </ScrollRevealItem>

        {/* Premium tier */}
        <ScrollRevealItem variant="slideRight">
          <div
            className="landing-glass relative overflow-hidden p-8"
            style={{
              borderWidth: 2,
              borderColor: "#9585CC",
              boxShadow: "0 0 50px color-mix(in srgb, #9585CC 20%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 5%, transparent)",
            }}
          >
            {premiumCard}
            <div className="mt-6">
              {yearly ? premiumYearly : premiumMonthly}
            </div>
            {premiumFeatures}
          </div>
        </ScrollRevealItem>
      </ScrollRevealGroup>
    </>
  );
}
