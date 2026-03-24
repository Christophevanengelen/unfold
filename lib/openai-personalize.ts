/**
 * Client-side helper for OpenAI personalized capsule texts.
 *
 * Handles caching (30-day TTL) and background pre-generation.
 */

import { storage } from "@/lib/storage";
import { profileHash } from "@/types/user-profile";
import type { UserProfile } from "@/types/user-profile";

// ─── Types ──────────────────────────────────────────────────

export type PersonalizedText = {
  story: string;
  insight: string;
  guidance: string;
  // Extended fields from Marie Ange's OpenAI format
  titre?: string;
  sousTitre?: string;
  corps?: string;
  avecLeRecul?: string;
  hitInfo?: string;        // AI-written cycle narrative (D-R-D pass explanation)
  lifetimeInfo?: string;   // AI-written lifetime narrative
  convergenceNote?: string; // when multiple signals converge
  // Raw data from boudin-detail endpoint (for direct display)
  rawCycle?: { hitNumber?: number; totalHits?: number; pattern?: string } | null;
  rawLifetime?: { number?: number | null; total?: number | null } | null;
};

// ─── Constants ──────────────────────────────────────────────

const TTL_30_DAYS = 30 * 24 * 60 * 60 * 1000;
const PRE_GENERATE_DELAY_MS = 500;

// ─── Cache key builder ──────────────────────────────────────

function cacheKey(capsuleId: string, profile: UserProfile | null): string {
  return `ai_${capsuleId}_${profileHash(profile)}`;
}

// ─── Main API ───────────────────────────────────────────────

/**
 * Get personalized text for a capsule.
 * Checks cache first (30-day TTL), then calls the server route.
 */
export async function getPersonalizedText(
  capsuleId: string,
  capsuleContext: Record<string, unknown>,
  userProfile: UserProfile | null,
  birthCity: string | null,
  locale: string,
  boudinIndex?: number,
  boudinId?: string
): Promise<PersonalizedText | null> {
  const key = cacheKey(capsuleId, userProfile);

  // Check cache
  const cached = await storage.get<PersonalizedText>(key, TTL_30_DAYS);
  if (cached) return cached;

  // Get birth data for TocToc API
  const { getBirthDataSync } = await import("@/lib/birth-data");
  const birthData = getBirthDataSync();
  if (!birthData || (boudinId === undefined && boudinIndex === undefined)) {
    console.error("[AI] Missing birthData or boudinId/boudinIndex");
    return null;
  }

  // Call server — boudinId priority, boudinIndex fallback
  try {
    const response = await fetch("/api/openai/personalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthData,
        ...(boudinId !== undefined ? { boudinId } : { boudinIndex }),
        capsuleContext, userProfile, birthCity, locale,
      }),
    });

    if (!response.ok) {
      console.error("[AI] Personalize failed:", response.status);
      return null;
    }

    const result: PersonalizedText = await response.json();

    // Cache the result
    await storage.set(key, result);

    return result;
  } catch (error) {
    console.error("[AI] Personalize error:", error);
    return null;
  }
}

// ─── Background pre-generation ──────────────────────────────

/**
 * Fire-and-forget pre-generation for a batch of capsules.
 * Staggers requests with 500ms delay to avoid rate limits.
 */
export function preGenerateForCapsules(
  capsuleIds: string[],
  capsuleContexts: Record<string, unknown>[],
  userProfile: UserProfile | null,
  birthCity: string | null,
  locale: string,
  boudinIndices?: number[],
  boudinIds?: string[]
): void {
  // Run in background — don't block the caller
  (async () => {
    for (let i = 0; i < capsuleIds.length; i++) {
      const id = capsuleIds[i];
      const context = capsuleContexts[i];
      if (!id || !context) continue;

      // Skip if already cached
      const key = cacheKey(id, userProfile);
      const cached = await storage.get<PersonalizedText>(key, TTL_30_DAYS);
      if (cached) continue;

      await getPersonalizedText(id, context, userProfile, birthCity, locale, boudinIndices?.[i], boudinIds?.[i]);

      // Delay between calls to stay under rate limits
      if (i < capsuleIds.length - 1) {
        await new Promise((r) => setTimeout(r, PRE_GENERATE_DELAY_MS));
      }
    }
  })();
}
