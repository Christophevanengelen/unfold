import type { Metadata } from "next";

export function generateLandingMetadata(locale: string): Metadata {
  const titles: Record<string, string> = {
    en: "Unfold — Know When Life Moves in Your Favor",
    fr: "Unfold — Sachez quand la vie joue en votre faveur",
    es: "Unfold — Sabe cuándo la vida juega a tu favor",
  };

  const descriptions: Record<string, string> = {
    en: "Your personal momentum engine. Understand your daily rhythms across Love, Health, and Work. Download the app.",
    fr: "Votre moteur de momentum personnel. Comprenez vos rythmes quotidiens en Amour, Santé et Travail. Téléchargez l'app.",
    es: "Tu motor de momentum personal. Comprende tus ritmos diarios en Amor, Salud y Trabajo. Descarga la app.",
  };

  return {
    title: titles[locale] ?? titles.en,
    description: descriptions[locale] ?? descriptions.en,
    openGraph: {
      title: titles[locale] ?? titles.en,
      description: descriptions[locale] ?? descriptions.en,
      type: "website",
      siteName: "Unfold",
    },
  };
}
