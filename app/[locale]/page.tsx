export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Image from "next/image";
import { generateLandingMetadata } from "@/lib/metadata";
import { getLandingCopy } from "@/lib/landing-copy";
import type { TranslationMap } from "@/lib/i18n";

import { Hero } from "@/components/landing/Hero";
import { FreeAwareness } from "@/components/landing/FreeAwareness";
import { NarrativeTransition } from "@/components/landing/NarrativeTransition";
import { LifeDomains } from "@/components/landing/LifeDomains";
import { TimelineShowcase } from "@/components/landing/TimelineShowcase";
import { SocialProof } from "@/components/landing/SocialProof";
import { Compatibility } from "@/components/landing/Compatibility";
import { SmartAlerts } from "@/components/landing/SmartAlerts";
import { PremiumMomentum } from "@/components/landing/PremiumMomentum";
import { LifetimeChartTeaser } from "@/components/landing/LifetimeChartTeaser";
import { BirthdayGraphTeaser } from "@/components/landing/BirthdayGraphTeaser";
import { ZRSpiritTeaser } from "@/components/landing/ZRSpiritTeaser";
import { ScienceTechnology } from "@/components/landing/ScienceTechnology";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";

// Native build: expose static params so Next.js knows which locales to pre-render
export function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_NATIVE !== "true") return [];
  return [{ locale: "fr" }, { locale: "en" }, { locale: "es" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateLandingMetadata(locale);
}

/**
 * Landing copy resolution — DB-optional by design.
 *
 * The narrative sections read every string from a `TranslationMap`. That map
 * used to be fetched from Supabase (`getTranslations`), but the Translation /
 * ContentKey / ContentNamespace tables don't exist in production, which took
 * the whole page down with a 500. So the map now comes from
 * `lib/landing-copy.ts` — plain data, no I/O, no failure mode.
 *
 * Setting `LANDING_DB_TRANSLATIONS=true` re-enables the DB layer once the
 * tables are seeded: it is dynamically imported inside a try/catch and merged
 * *on top of* the hardcoded copy, so a missing table, a missing env var or a
 * network blip degrades silently back to the static strings.
 */
async function resolveTranslations(locale: string): Promise<TranslationMap> {
  if (process.env.LANDING_DB_TRANSLATIONS !== "true") {
    return getLandingCopy(locale);
  }
  try {
    const { getTranslations } = await import("@/lib/i18n");
    const remote = await getTranslations(locale, "landing");
    return getLandingCopy(locale, remote);
  } catch {
    return getLandingCopy(locale);
  }
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // In native builds there's no landing page — go straight to the app
  if (process.env.NEXT_PUBLIC_NATIVE === "true") {
    redirect("/app");
  }

  const { locale } = await params;
  const translations = await resolveTranslations(locale);
  const tr = (key: string, fallback?: string) =>
    translations[key] ?? fallback ?? key;

  return (
    <div className="landing-immersive">
      <div className="landing-gradients" aria-hidden="true" />
      <div className="relative z-10">
        {/* Brand mark — the locale layout ships no Header yet */}
        <div className="flex items-center justify-center gap-3 pt-10">
          <Image src="/logo/icon-mark.svg" alt="" width={32} height={32} priority />
          <span
            className="font-display text-[20px] font-normal text-brand-11"
            style={{ letterSpacing: "0.2em" }}
          >
            unfold
          </span>
        </div>

        {/* 1. Hook — emotional headline + interactive signal reveal */}
        <Hero translations={translations} />

        {/* 2. Foundation — what you get for free */}
        <FreeAwareness t={tr} translations={translations} />

        {/* transition: free → depth */}
        <NarrativeTransition
          text={tr(
            "transition.free_to_clarity",
            "Your signal is free. But your story goes deeper.",
          )}
        />

        {/* 3. Depth — 12 life domains */}
        <LifeDomains translations={translations} />

        {/* 4. Revelation — your life has a pattern */}
        <TimelineShowcase translations={translations} />

        {/* transition: timeline → social proof */}
        <NarrativeTransition
          text={tr(
            "transition.timeline_to_social",
            "Thousands already read their signal. Here’s what they say.",
          )}
        />

        {/* 5. Social proof — trust */}
        <SocialProof translations={translations} />

        {/* 6. Relational dimension */}
        <Compatibility translations={translations} />

        {/* 7. Quiet intelligence — alerts */}
        <SmartAlerts translations={translations} />

        {/* transition: free → premium cliffhanger */}
        <NarrativeTransition
          text={tr(
            "transition.free_to_premium",
            "Free reads today. Premium reveals what’s forming ahead.",
          )}
        />

        {/* 8. Premium cliffhanger */}
        <PremiumMomentum translations={translations} />

        {/* transition: promise → proof you can touch */}
        <NarrativeTransition
          text={tr(
            "transition.premium_to_teasers",
            "Three ways to see the whole arc. Enter your birth data — the rest unfolds.",
          )}
        />

        {/* 9. Premium proof — interactive teasers.
            Shown on every viewport: the three cards now carry their own mobile
            layout (stacked form fields, fluid chart previews), so the phone
            visitor gets the same hands-on demo as the desktop one. One column
            below md:, the original two-up grid from md: up. */}
        <section className="relative py-8 md:py-12">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <LifetimeChartTeaser
                chartEyebrow={tr("teaser.lifetime.eyebrow")}
                chartTitle={tr("teaser.lifetime.title")}
                chartSub={tr("teaser.lifetime.sub")}
                chartCta={tr("teaser.lifetime.cta")}
              />
              <BirthdayGraphTeaser
                eyebrow={tr("teaser.birthday.eyebrow")}
                title={tr("teaser.birthday.title")}
                sub={tr("teaser.birthday.sub")}
                cta={tr("teaser.birthday.cta")}
              />
            </div>
            <div className="mt-6">
              <ZRSpiritTeaser
                eyebrow={tr("teaser.spirit.eyebrow")}
                title={tr("teaser.spirit.title")}
                sub={tr("teaser.spirit.sub")}
                cta={tr("teaser.spirit.cta")}
              />
            </div>
          </div>
        </section>

        {/* 10. Credibility */}
        <ScienceTechnology t={tr} translations={translations} />

        {/* 11. Conversion */}
        <Pricing t={tr} />

        <p className="mx-auto max-w-md px-6 text-center text-[13px] text-brand-10/60">
          {tr("pricing.trial")}
        </p>

        {/* 12. Final CTA */}
        <FinalCTA t={tr} />

        <footer className="pb-10 text-center text-[10px] text-brand-10/50">
          <p>{tr("footer.legal")}</p>
          <p className="mt-1.5">
            {tr("footer.signature")}{" "}
            <a
              href="https://www.hi-def.be"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-brand-10/80"
            >
              hi-def.be
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
