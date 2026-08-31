import type { MetadataRoute } from "next";
import { localeCodes } from "@/i18n/config";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://favorable.day";

export default function sitemap(): MetadataRoute.Sitemap {
  // Landing pages for each locale
  const landingPages = localeCodes.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1.0,
  }));

  // Legal pages for each locale
  const legalPages = localeCodes.flatMap((locale) => [
    {
      url: `${BASE_URL}/${locale}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/${locale}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      // Page d assistance : champ obligatoire d App Store Connect, et la
      // seule page qui explique comment supprimer son compte et resilier.
      // Priorite plus haute que les textes legaux : les gens la cherchent.
      url: `${BASE_URL}/${locale}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]);

  return [...landingPages, ...legalPages];
}
