/**
 * Deterministic signal generator — creates a "fake but personal" momentum
 * signal from a birth date string. Same date always produces the same signal.
 *
 * Used on the landing page "Try your signal" hero interactive element.
 * NOT real astro computation — just a hash-seeded deterministic pick.
 */

import type { PlanetKey, HouseNumber } from "@/lib/domain-config";
import type { Tier } from "@/lib/capsules";

export interface GeneratedSignal {
  intensity: number;        // 52–96
  tier: Tier;
  tierLabel: string;
  planets: PlanetKey[];     // 2–4 planets
  house: HouseNumber;       // primary life domain
  durationWeeks: number;    // 4–16
  score: 1 | 2 | 3 | 4;
  narrative: string;        // AI-style insight
  action: string;           // actionable guidance
  secondaryHouse?: HouseNumber; // secondary domain for high tiers
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

// Narrative pool — deterministic, no jargon, actionable
const NARRATIVES: { narrative: string; action: string }[] = [
  { narrative: "Une fen\u00eatre de repositionnement s\u2019ouvre. Ce que vous construisez maintenant va durer bien au-del\u00e0 de cette p\u00e9riode.", action: "Prenez une d\u00e9cision que vous repoussez \u2014 le timing est bon." },
  { narrative: "Vos relations proches sont activ\u00e9es. Un dialogue important se pr\u00e9pare, peut-\u00eatre avec quelqu\u2019un que vous n\u2019attendiez pas.", action: "Ouvrez la conversation que vous \u00e9vitez." },
  { narrative: "Votre cr\u00e9ativit\u00e9 est \u00e0 son pic. Les projets lanc\u00e9s maintenant portent une \u00e9nergie particuli\u00e8re.", action: "Commencez ce projet cr\u00e9atif \u2014 m\u00eame imparfait." },
  { narrative: "Une transformation profonde est en cours. Ce qui ne fonctionne plus s\u2019efface pour laisser place \u00e0 quelque chose de plus solide.", action: "Acceptez ce qui change \u2014 c\u2019est le signal." },
  { narrative: "Votre quotidien demande des ajustements. Les habitudes que vous posez maintenant d\u00e9finissent les 6 prochains mois.", action: "Changez une routine qui ne vous sert plus." },
  { narrative: "Votre r\u00e9seau s\u2019active. Les bonnes connexions arrivent \u2014 soyez visible et pr\u00e9sent.", action: "Acceptez cette invitation que vous h\u00e9sitiez." },
  { narrative: "Un signal touche vos finances. Revenus, investissements, rapport \u00e0 la valeur \u2014 restez attentif aux opportunit\u00e9s.", action: "Revoyez vos priorit\u00e9s financi\u00e8res cette semaine." },
  { narrative: "Votre horizon s\u2019\u00e9largit. Voyages, formations, nouvelles perspectives \u2014 suivez l\u2019appel.", action: "Explorez quelque chose de nouveau \u2014 cours, lieu, id\u00e9e." },
];

const HOUSE_POOL: HouseNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function generateSignalFromDate(dateString: string): GeneratedSignal {
  const seed = hash(dateString);
  const rand = seededRandom(seed);

  // Intensity: 52–96, weighted slightly toward middle (more realistic)
  const raw = rand();
  const intensity = Math.round(52 + raw * 44);

  // Tier + score
  let tier: Tier;
  let tierLabel: string;
  let score: 1 | 2 | 3 | 4;
  if (intensity >= 85) {
    tier = "toctoctoc";
    tierLabel = "PEAK";
    score = 4;
  } else if (intensity >= 70) {
    tier = "toctoc";
    tierLabel = "CLEAR";
    score = rand() > 0.5 ? 3 : 2;
  } else {
    tier = "toc";
    tierLabel = "SUBTLE";
    score = rand() > 0.5 ? 2 : 1;
  }

  // Planets: 2–4, shuffled deterministically
  const planetCount = tier === "toctoctoc" ? 4 : tier === "toctoc" ? 3 : 2;
  const shuffled = [...PLANET_POOL].sort(() => rand() - 0.5);
  const planets = shuffled.slice(0, planetCount);

  // House (primary life domain)
  const houseIdx = Math.floor(rand() * 12);
  const house = HOUSE_POOL[houseIdx];
  const secondaryHouseIdx = (houseIdx + 3 + Math.floor(rand() * 6)) % 12;
  const secondaryHouse = tier !== "toc" ? HOUSE_POOL[secondaryHouseIdx] : undefined;

  // Duration
  const durationWeeks = Math.round(4 + (intensity / 100) * 12);

  // Narrative (deterministic pick)
  const narrativeIdx = Math.floor(rand() * NARRATIVES.length);
  const { narrative, action } = NARRATIVES[narrativeIdx];

  return { intensity, tier, tierLabel, planets, house, durationWeeks, score, narrative, action, secondaryHouse };
}
