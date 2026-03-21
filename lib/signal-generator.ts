/**
 * Deterministic signal generator — creates a "fake but personal" momentum
 * signal from a birth date string. Same date always produces the same signal.
 *
 * Used on the landing page "Try your signal" hero interactive element.
 * NOT real astro computation — just a hash-seeded deterministic pick.
 */

import type { PlanetKey } from "@/lib/domain-config";
import type { Tier } from "@/lib/capsules";

export interface GeneratedSignal {
  intensity: number;        // 52–96
  tier: Tier;
  tierLabel: string;
  planets: PlanetKey[];     // 2–4 planets
}

// Simple string → 32-bit hash (djb2)
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Seeded pseudo-random (mulberry32)
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PLANET_POOL: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune",
];

export function generateSignalFromDate(dateString: string): GeneratedSignal {
  const seed = hash(dateString);
  const rand = seededRandom(seed);

  // Intensity: 52–96, weighted slightly toward middle (more realistic)
  const raw = rand();
  const intensity = Math.round(52 + raw * 44);

  // Tier
  let tier: Tier;
  let tierLabel: string;
  if (intensity >= 85) {
    tier = "toctoctoc";
    tierLabel = "TOCTOCTOC";
  } else if (intensity >= 70) {
    tier = "toctoc";
    tierLabel = "TOCTOC";
  } else {
    tier = "toc";
    tierLabel = "TOC";
  }

  // Planets: 2–4, shuffled deterministically
  const planetCount = tier === "toctoctoc" ? 4 : tier === "toctoc" ? 3 : 2;
  const shuffled = [...PLANET_POOL].sort(() => rand() - 0.5);
  const planets = shuffled.slice(0, planetCount);

  return { intensity, tier, tierLabel, planets };
}
