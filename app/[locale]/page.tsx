import { generateLandingMetadata } from "@/lib/metadata";
import { getTranslations, t } from "@/lib/i18n";
import { Hero } from "@/components/landing/Hero";
import { FreeAwareness } from "@/components/landing/FreeAwareness";
import { DesignedForClarity } from "@/components/landing/DesignedForClarity";
import { TimelineShowcase } from "@/components/landing/TimelineShowcase";
import { SocialProof } from "@/components/landing/SocialProof";
import { Compatibility } from "@/components/landing/Compatibility";
import { SmartAlerts } from "@/components/landing/SmartAlerts";
import { PremiumMomentum } from "@/components/landing/PremiumMomentum";
import { ScienceTechnology } from "@/components/landing/ScienceTechnology";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { NarrativeTransition } from "@/components/landing/NarrativeTransition";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateLandingMetadata(locale);
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const translations = await getTranslations(locale, "landing");
  const tr = (key: string, fallback?: string) => t(translations, key, fallback);

  return (
    <div className="landing-immersive">
      <div className="landing-gradients" aria-hidden="true" />
      <div className="relative z-10">
        {/* 1. Hook — emotional headline + interactive signal reveal */}
        <Hero translations={translations} />

        {/* 2. Foundation — what you get for free */}
        <FreeAwareness t={tr} />

        {/* transition: free → depth */}
        <NarrativeTransition text={tr("transition.free_to_clarity", "Your signal is free. But your story goes deeper.")} />

        {/* 3. Product proof — see the actual app */}
        <DesignedForClarity translations={translations} />

        {/* 4. Revelation — your life has a pattern */}
        <TimelineShowcase translations={translations} />

        {/* transition: timeline → social proof */}
        <NarrativeTransition text={tr("transition.timeline_to_social", "Thousands already read their signal. Here\u2019s what they say.")} />

        {/* 5. Social proof — trust (MOVED UP from position 9) */}
        <SocialProof translations={translations} />

        {/* 6. Relational dimension */}
        <Compatibility translations={translations} />

        {/* 7. Quiet intelligence — alerts */}
        <SmartAlerts translations={translations} />

        {/* transition: free → premium cliffhanger */}
        <NarrativeTransition text={tr("transition.free_to_premium", "Free reads today. Premium reveals what\u2019s forming ahead.")} />

        {/* 8. Premium cliffhanger */}
        <PremiumMomentum translations={translations} />

        {/* 9. Credibility */}
        <ScienceTechnology t={tr} />

        {/* 10. Conversion */}
        <Pricing t={tr} />

        {/* 11. Final CTA */}
        <FinalCTA t={tr} />
      </div>
    </div>
  );
}
