/**
 * Connection Delineation — client-side LLM pipeline.
 * Sends one ActivePeriod's raw data to /api/openai/connection-delineation
 * and returns structured French prose for the compatibility UI.
 *
 * Cache: IndexedDB, 7-day TTL (transits don't change day to day).
 * Cache key: connection_delineation_v1_{birthDateA}_{birthDateB}_{rel}_{monthKey}
 */

import { storage } from "@/lib/storage";
import type { ActivePeriod } from "@/lib/connection-brief-api";
import type { RelationshipType } from "@/lib/matching-narratives";

// ─── Types ────────────────────────────────────────────────

export interface PersonDelineation {
  titre: string;   // 3-5 words
  corps: string;   // 2-3 sentences
  defi: string;    // 1 sentence challenge
}

export interface EnsembleDelineation {
  titre: string;            // shared dynamic title
  pourquoiCeMois: string;   // why this month matters for both
  dynamique: string;        // nature of the dynamic
  aFaireEnsemble: string;   // 2-3 actionable sentences
}

export interface ConnectionDelineation {
  personA: PersonDelineation;
  personB: PersonDelineation;
  ensemble: EnsembleDelineation;
}

// ─── Cache config ──────────────────────────────────────────

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_VERSION = "v5"; // bumped: simplified prompt + API synthesis fields in payload

function cacheKey(
  birthDateA: string,
  birthDateB: string,
  relationship: string,
  monthKey: string,
): string {
  return `connection_delineation_${CACHE_VERSION}_${birthDateA}_${birthDateB}_${relationship}_${monthKey}`;
}

// ─── Main function ────────────────────────────────────────

/**
 * Per-person identity payload for delineation. Includes coords so the
 * server-side cache can key on chart identity, not just birth date.
 */
interface PersonIdentity {
  birthDate: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
}

/** Backwards-compatible: accepts either `string` (birthDate only) or full identity. */
type PersonArg = string | PersonIdentity;

function toIdentity(arg: PersonArg): PersonIdentity {
  return typeof arg === "string" ? { birthDate: arg } : arg;
}

export async function getConnectionDelineation(
  period: ActivePeriod,
  relationship: RelationshipType,
  personAArg: PersonArg,
  personBArg: PersonArg,
): Promise<ConnectionDelineation | null> {
  const idA = toIdentity(personAArg);
  const idB = toIdentity(personBArg);
  const key = cacheKey(idA.birthDate, idB.birthDate, relationship, period.monthKey);

  // L1 check — IndexedDB (offline-capable, per-device)
  const cached = await storage.get<ConnectionDelineation>(key, CACHE_TTL_MS);
  if (cached) return cached;

  // Build payload — include rawData (profection + event list) so the LLM
  // can reason from actual transit labels, scores, and ZR details.
  const buildPersonPayload = (focus: typeof period.personAFocus, id: PersonIdentity) => ({
    birthDate: id.birthDate,
    birthTime: id.birthTime,
    latitude: id.latitude,
    longitude: id.longitude,
    primarySignal: focus.primarySignal,
    dominantDomains: focus.dominantDomains,
    profection: focus.rawData?.profection ?? {
      house: focus.profectionHouse,
      houseName: focus.profectionTheme,
    },
    events: focus.rawData?.events ?? [],
    monthScore: focus.rawData?.monthScore,
    challenges: focus.challenges,
  });

  const payload = {
    relationship,
    monthKey: period.monthKey,
    tier: period.tier,
    // API's own synthesis — LLM uses these as anchors, not as-is
    sharedTheme: period.sharedTheme,
    sharedInsight: period.sharedInsight,
    apiSuggestedAction: period.actionTogether,
    personA: buildPersonPayload(period.personAFocus, idA),
    personB: buildPersonPayload(period.personBFocus, idB),
  };

  try {
    const res = await fetch("/api/openai/connection-delineation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;

    const delineation = await res.json() as ConnectionDelineation;
    if (!delineation?.personA || !delineation?.personB || !delineation?.ensemble) {
      return null;
    }

    // Cache the result
    await storage.set(key, delineation);
    return delineation;
  } catch (err) {
    console.error("[connection-delineation] Failed:", err);
    return null;
  }
}
