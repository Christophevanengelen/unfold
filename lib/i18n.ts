import { prisma } from "@/lib/db";
import { cache } from "react";

export type TranslationMap = Record<string, string>;

/**
 * Fetch all translations for a given locale and namespace from the database.
 * Uses React's cache() for request-level deduplication.
 */
export const getTranslations = cache(
  async (locale: string, namespace: string): Promise<TranslationMap> => {
    if (!prisma) return {};

    try {
      const translations = await prisma.translation.findMany({
        where: {
          languageCode: locale,
          contentKey: {
            namespace: {
              name: namespace,
            },
          },
          status: { not: "NOT_STARTED" },
        },
        include: {
          contentKey: true,
        },
      });

      const map: TranslationMap = {};
      for (const t of translations) {
        map[t.contentKey.key] = t.value;
      }
      return map;
    } catch {
      // DB not available yet (development without DB) — return empty
      return {};
    }
  }
);

/**
 * Helper: get a single translation value with fallback
 */
export function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}
