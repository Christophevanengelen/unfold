import { supabase } from "@/lib/db";
import { cache } from "react";

export type TranslationMap = Record<string, string>;

/**
 * Fetch all translations for a given locale and namespace from Supabase.
 * Uses React's cache() for request-level deduplication.
 */
export const getTranslations = cache(
  async (locale: string, namespace: string): Promise<TranslationMap> => {
    try {
      if (!supabase) return {}; // No DB connection (build time or missing env vars)
      // Join Translation → ContentKey → ContentNamespace to filter by namespace name
      const { data, error } = await supabase
        .from("Translation")
        .select(`
          value,
          contentKey:ContentKey!inner (
            key,
            namespace:ContentNamespace!inner (
              name
            )
          )
        `)
        .eq("languageCode", locale)
        .eq("contentKey.namespace.name", namespace)
        .neq("status", "NOT_STARTED");

      if (error || !data) return {};

      const map: TranslationMap = {};
      for (const row of data as any[]) {
        map[row.contentKey.key] = row.value;
      }
      return map;
    } catch {
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
