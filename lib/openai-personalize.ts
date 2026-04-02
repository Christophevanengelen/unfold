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
  rawCycle?: { hitNumber?: number; totalHits?: number; pattern?: string; allHits?: { date: string; hitNumber: number; isCurrent?: boolean }[] } | null;
  rawLifetime?: { number?: number | null; total?: number | null } | null;
  allPeriods?: { date: string; endDate?: string; lifetimeNumber: number; isCurrent?: boolean; totalHits?: number }[] | null;
};

// ─── Constants ──────────────────────────────────────────────

const TTL_30_DAYS = 30 * 24 * 60 * 60 * 1000;
const PRE_GENERATE_DELAY_MS = 500;

// ─── Cache key builder ──────────────────────────────────────

function cacheKey(capsuleId: string, profile: UserProfile | null): string {
  return `ai_v10_${capsuleId}_${profileHash(profile)}`;
}

// ─── Main API ───────────────────────────────────────────────

// ─── Partial corps extractor (streaming) ────────────────────

/**
 * Extracts the partially-received `corps` value from an incomplete JSON string.
 * Returns null if the `corps` field hasn't started yet.
 *
 * Handles all standard JSON escape sequences correctly, including French apostrophes
 * (\u2019 / \' / straight ') which were previously causing truncation artifacts.
 */
function extractPartialCorps(accumulated: string): string | null {
  const match = accumulated.match(/"corps"\s*:\s*"/);
  if (!match || match.index === undefined) return null;

  const rest = accumulated.slice(match.index + match[0].length);
  let result = "";
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "\\" && i + 1 < rest.length) {
      const next = rest[i + 1];
      if (next === "n") { result += "\n"; i++; }
      else if (next === "r") { result += "\r"; i++; }
      else if (next === "t") { result += "\t"; i++; }
      else if (next === '"') { result += '"'; i++; }
      else if (next === "\\") { result += "\\"; i++; }
      else if (next === "'") { result += "'"; i++; } // non-standard but safe
      else if (next === "u" && i + 5 < rest.length) {
        // \uXXXX unicode escape — decode properly
        const hex = rest.slice(i + 2, i + 6);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          result += String.fromCharCode(parseInt(hex, 16));
          i += 5;
        } else {
          result += next; i++;
        }
      } else {
        result += next; i++;
      }
    } else if (rest[i] === '"') {
      break; // End of field value
    } else {
      result += rest[i];
    }
  }
  return result || null;
}

// ─── Main API ───────────────────────────────────────────────

/**
 * Get personalized text for a capsule.
 * Checks cache first (30-day TTL), then calls the server route.
 * Supports streaming: calls onStreaming with partial corps text as tokens arrive.
 */
export async function getPersonalizedText(
  capsuleId: string,
  capsuleContext: Record<string, unknown>,
  userProfile: UserProfile | null,
  birthCity: string | null,
  locale: string,
  boudinIndex?: number,
  boudinId?: string,
  onStreaming?: (partial: { corps: string }) => void
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

    // ── Handle SSE streaming response ──
    if (response.headers.get("content-type")?.includes("text/event-stream") && response.body) {
      return new Promise<PersonalizedText | null>((resolve) => {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = ""; // OpenAI delta tokens

        function processBuffer() {
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const block of events) {
            let eventType = "";
            let eventData = "";
            for (const line of block.split("\n")) {
              if (line.startsWith("event: ")) eventType = line.slice(7).trim();
              if (line.startsWith("data: ")) eventData = line.slice(6).trim();
            }
            if (!eventData) continue;

            if (eventType === "delta") {
              try {
                const { c } = JSON.parse(eventData) as { c: string };
                accumulated += c;
                if (onStreaming) {
                  const partial = extractPartialCorps(accumulated);
                  if (partial) onStreaming({ corps: partial });
                }
              } catch { /* skip */ }
            } else if (eventType === "done") {
              try {
                const result = JSON.parse(eventData) as PersonalizedText;
                storage.set(key, result);
                resolve(result);
              } catch {
                resolve(null);
              }
            } else if (eventType === "error") {
              resolve(null);
            }
          }
        }

        (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              processBuffer();
            }
          } catch {
            resolve(null);
          }
        })();
      });
    }

    // ── Non-streaming fallback (cache hits return plain JSON) ──
    const result: PersonalizedText = await response.json();
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
