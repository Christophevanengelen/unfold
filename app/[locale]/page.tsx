import { generateLandingMetadata } from "@/lib/metadata";
import { getTranslations, t } from "@/lib/i18n";
import { Hero } from "@/components/landing/Hero";
import { FreeAwareness } from "@/components/landing/FreeAwareness";
import { DailyScores } from "@/components/landing/DailyScores";
import { Compatibility } from "@/components/landing/Compatibility";
import { PremiumMomentum } from "@/components/landing/PremiumMomentum";
import { ScienceTechnology } from "@/components/landing/ScienceTechnology";
import { DesignedForClarity } from "@/components/landing/DesignedForClarity";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";

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

  return (
    <div className="landing-immersive">
      <div className="landing-gradients" aria-hidden="true" />
      <div className="relative z-10">
        <Hero t={(key, fallback) => t(translations, key, fallback)} />
        <FreeAwareness t={(key, fallback) => t(translations, key, fallback)} />
        <DailyScores t={(key, fallback) => t(translations, key, fallback)} />
        <Compatibility t={(key, fallback) => t(translations, key, fallback)} />
        <PremiumMomentum t={(key, fallback) => t(translations, key, fallback)} />
        <ScienceTechnology t={(key, fallback) => t(translations, key, fallback)} />
        <DesignedForClarity t={(key, fallback) => t(translations, key, fallback)} />
        <Pricing t={(key, fallback) => t(translations, key, fallback)} />
        <FinalCTA t={(key, fallback) => t(translations, key, fallback)} />
      </div>
    </div>
  );
}
