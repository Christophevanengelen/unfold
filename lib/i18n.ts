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
      // Le type dit ce que la requete rend vraiment, au lieu de renoncer avec
      // `any`. Une colonne renommee en base devient alors une erreur de
      // compilation plutot qu un `undefined` a l ecran.
      // La requete rend contentKey comme un TABLEAU, pas un objet : le typage
      // le dit maintenant, alors que `any` laissait croire au contraire. Si
      // cette forme change en base, la compilation le signale.
      type Ligne = { value: string; contentKey: { key: string }[] };
      for (const row of data as unknown as Ligne[]) {
        const cle = row.contentKey?.[0]?.key;
        if (cle) map[cle] = row.value;
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
