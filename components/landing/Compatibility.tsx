import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface CompatibilityProps {
  t: (key: string, fallback?: string) => string;
}

export function Compatibility({ t }: CompatibilityProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header text — one cohesive block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t("compat.eyebrow", "Better together")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t("compat.title", "Compare your rhythms")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t("compat.subtitle", "Share your invite code. Discover how your momentum aligns with someone who matters. Find your shared peak moments.")}
          </p>
        </ScrollReveal>

        {/* Illustration — appears after header as you scroll */}
        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.15}>
          <div className="landing-glass p-12 text-center">
            <Image
              src="/illustrations/compare.svg"
              alt=""
              width={280}
              height={280}
              className="mx-auto"
            />
            <p className="mt-6 font-display text-xl font-semibold text-white">
              {t("compat.cta", "Invite someone. Compare your signals.")}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
