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
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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
    <>
      <ScrollReveal variant="fadeIn" threshold={0.05}>
        <Hero t={(key, fallback) => t(translations, key, fallback)} />
      </ScrollReveal>
      <ScrollReveal variant="fadeUp" delay={0}>
        <FreeAwareness t={(key, fallback) => t(translations, key, fallback)} />
      </ScrollReveal>
      <ScrollReveal variant="fadeUp">
        <DailyScores t={(key, fallback) => t(translations, key, fallback)} />
      </ScrollReveal>
      <ScrollReveal variant="fadeUp">
        <Compatibility t={(key, fallback) => t(translations, key, fallback)} />
      </ScrollReveal>
      <ScrollReveal variant="fadeUp">
        <PremiumMomentum t={(key, fallback) => t(translations, key, fallback)} />
      </ScrollReveal>
      <ScrollReveal variant="scaleIn">
        <ScienceTechnology t={(key, fallback) => t(translations, key, fallback)} />
      </ScrollReveal>
      <ScrollReveal variant="fadeUp">
        <DesignedForClarity t={(key, fallback) => t(translations, key, fallback)} />
      </ScrollReveal>
      <ScrollReveal variant="scaleIn">
        <Pricing t={(key, fallback) => t(translations, key, fallback)} />
      </ScrollReveal>
      <ScrollReveal variant="fadeUp">
        <FinalCTA t={(key, fallback) => t(translations, key, fallback)} />
      </ScrollReveal>
    </>
  );
}
