/**
 * Deterministic mock builder for the landing Hero.
 * Produces a `RealSignal`-shaped object so the same UI renders for both
 * live API path and fallback path (only the "Aperçu" badge differentiates).
 *
 * Numbers are seeded from the birthDate hash — same birthday = same mock,
 * which is intentional for shareability and realism.
 */

import { generateSignalFromDate } from "@/lib/signal-generator";
import type { RealSignal } from "@/components/landing/HeroSignalCard";
import { houseConfig, planetConfig, type PlanetKey, type HouseNumber } from "@/lib/domain-config";

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seeded(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MAJOR_PLANETS: PlanetKey[] = ["jupiter", "saturn", "uranus", "neptune", "pluto"];

function tierColor(tier: "PEAK" | "CLEAR" | "SUBTLE"): string {
  if (tier === "PEAK") return "#D89EA0";
  if (tier === "CLEAR") return "#6BA89A";
  return "#8B7FC2";
}

function addMonths(monthKey: string, n: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

export function buildMockRealSignal(birthDate: string): RealSignal {
  const base = generateSignalFromDate(birthDate);
  const rand = seeded(hash(birthDate + "_mock_v2"));

  const tier: "PEAK" | "CLEAR" | "SUBTLE" =
    base.tier === "toctoctoc" ? "PEAK" : base.tier === "toctoc" ? "CLEAR" : "SUBTLE";
  const houseColor = houseConfig[base.house]?.color ?? "#9585CC";
  const primaryPlanet = base.planets[0] ?? "jupiter";
  const today = new Date();
  const todayMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const birthYear = parseInt(birthDate.slice(0, 4), 10);
  const ageYears = Math.max(1, today.getFullYear() - birthYear);

  // Past peaks — 3 deterministic past major windows distributed across user's life
  // We pick 3 years roughly spaced (recent / mid-life / earlier).
  const slotYears: number[] = [];
  if (ageYears >= 12) {
    slotYears.push(today.getFullYear() - Math.max(2, Math.floor(ageYears * 0.15)));
    slotYears.push(today.getFullYear() - Math.max(5, Math.floor(ageYears * 0.45)));
    slotYears.push(today.getFullYear() - Math.max(9, Math.floor(ageYears * 0.75)));
  } else {
    // Young user — show only 1-2 past peaks
    slotYears.push(today.getFullYear() - 2);
    if (ageYears >= 6) slotYears.push(today.getFullYear() - Math.floor(ageYears * 0.6));
  }

  const pastPeaks = slotYears
    .map((y) => {
      const r = rand();
      const planet = MAJOR_PLANETS[Math.floor(r * MAJOR_PLANETS.length)];
      const house = (Math.floor(rand() * 12) + 1) as HouseNumber;
      const month = Math.floor(rand() * 12) + 1;
      return {
        year: y,
        monthKey: `${y}-${String(month).padStart(2, "0")}`,
        planet: planet as string,
        house: house as number,
        label: `${planetConfig[planet].label} en ${houseConfig[house].label}`,
        tier: "PEAK" as const,
      };
    })
    .sort((a, b) => a.year - b.year); // chronological — oldest first

  // Future months — 12 deterministic capsules
  const futureMonths = Array.from({ length: 12 }, (_, i) => {
    const monthKey = addMonths(todayMonth, i + 1);
    const r = rand();
    const score = r > 0.78 ? 4 : r > 0.55 ? 3 : r > 0.3 ? 2 : 1;
    const monthTier: "PEAK" | "CLEAR" | "SUBTLE" = score >= 3 ? "PEAK" : score === 2 ? "CLEAR" : "SUBTLE";
    return { monthKey, tier: monthTier, color: tierColor(monthTier), score };
  });

  // Pick the next "real" major window (vague month range)
  const nextMajorIdx = futureMonths.findIndex((m) => m.score >= 3);
  const nextMajor = nextMajorIdx >= 0
    ? {
        startMonth: futureMonths[nextMajorIdx].monthKey,
        endMonth: futureMonths[Math.min(nextMajorIdx + 1, futureMonths.length - 1)].monthKey,
        planet: MAJOR_PLANETS[Math.floor(rand() * MAJOR_PLANETS.length)],
        house: ((Math.floor(rand() * 12) + 1) as HouseNumber) as number,
        tier: "PEAK" as const,
      }
    : null;

  // Lifetime stats — calibrate from age (ish)
  const yearsAhead = Math.max(40, 90 - ageYears);

  // Realistic ratios: ~1 PEAK every 18 months, ~1 CLEAR every 8 months
  const pastPeak = Math.round(ageYears * (12 / 18) * (0.9 + rand() * 0.3));
  const pastClear = Math.round(ageYears * (12 / 8) * (0.9 + rand() * 0.3));
  const upcomingPeak = Math.round(yearsAhead * (12 / 18) * (0.9 + rand() * 0.3));
  const upcomingClear = Math.round(yearsAhead * (12 / 8) * (0.9 + rand() * 0.3));

  return {
    boudinId: `mock_${primaryPlanet}_h${base.house}`,
    planet: primaryPlanet,
    house: base.house,
    tier,
    score: base.score,
    color: tierColor(tier),
    label: planetConfig[primaryPlanet]?.label ?? "Signal",
    category: "transit",
    startDate: new Date(today.getTime() - 7 * 86_400_000).toISOString().slice(0, 10),
    endDate: new Date(today.getTime() + base.durationWeeks * 7 * 86_400_000).toISOString().slice(0, 10),
    delineation: {
      titre: houseConfig[base.house]?.label ?? "Signal actif",
      sousTitre: undefined,
      corps: base.narrative,
      avecLeRecul: base.action,
    },
    futureMonths,
    nextMajor,
    pastPeaks,
    lifetime: {
      pastPeak,
      pastClear,
      upcomingPeak,
      upcomingClear,
      totalLifetime: pastPeak + pastClear + upcomingPeak + upcomingClear,
    },
    fallback: "mock",
  };
  // suppress unused
  void houseColor;
}
