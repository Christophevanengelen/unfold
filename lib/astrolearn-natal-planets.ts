export type NatalPlanets = Record<string, number[]>;

export type NatalLots = Partial<
  Record<"fortune" | "spirit" | "eros", { longitude?: number }>
>;

const NATAL_LONGITUDE_KEYS: Record<string, string[]> = {
  Sun: ["Sun"],
  Moon: ["Moon"],
  Mercury: ["Mercury"],
  Venus: ["Venus"],
  Mars: ["Mars"],
  Jupiter: ["Jupiter"],
  Saturn: ["Saturn"],
  Uranus: ["Uranus"],
  Neptune: ["Neptune"],
  Pluto: ["Pluto"],
  Chiron: ["Chiron"],
  "North Node": ["North Node", "NNode", "node", "NN"],
  "South Node": ["South Node", "SNode"],
  "Lot of Fortune": ["Lot of Fortune", "Fortune", "Part of Fortune"],
  "Lot of Spirit": ["Lot of Spirit", "Spirit", "Part of Spirit"],
  "Lot of Eros": ["Lot of Eros", "Eros", "Part of Eros"],
};

const EPHEMERIS_PLANET_ALIASES: Record<string, string> = {
  NNode: "North Node",
  "North Node": "North Node",
  node: "North Node",
  NN: "North Node",
  SNode: "South Node",
  "South Node": "South Node",
  Fortune: "Lot of Fortune",
  "Part of Fortune": "Lot of Fortune",
  "Lot of Fortune": "Lot of Fortune",
  Spirit: "Lot of Spirit",
  "Part of Spirit": "Lot of Spirit",
  "Lot of Spirit": "Lot of Spirit",
  Eros: "Lot of Eros",
  "Part of Eros": "Lot of Eros",
  "Lot of Eros": "Lot of Eros",
};

function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

function readLongitude(values: number[] | undefined): number | null {
  if (!values || values.length === 0) {
    return null;
  }
  const longitude = Number(values[0]);
  return Number.isFinite(longitude) ? normalizeLongitude(longitude) : null;
}

function writeLongitude(
  planets: NatalPlanets,
  key: string,
  longitude: number
): void {
  if (readLongitude(planets[key]) !== null) {
    return;
  }
  planets[key] = [normalizeLongitude(longitude)];
}

export function normalizeEphemerisPlanet(planet: string): string {
  const trimmed = planet.trim();
  return EPHEMERIS_PLANET_ALIASES[trimmed] ?? trimmed;
}

export function getNatalLongitude(
  natalPlanets: NatalPlanets,
  planet: string
): number | null {
  const trimmed = planet.trim();
  const canonical = normalizeEphemerisPlanet(trimmed);
  const keys = new Set<string>([
    trimmed,
    canonical,
    ...(NATAL_LONGITUDE_KEYS[canonical] ?? []),
    ...(NATAL_LONGITUDE_KEYS[trimmed] ?? []),
  ]);

  for (const key of keys) {
    const longitude = readLongitude(natalPlanets[key]);
    if (longitude !== null) {
      return longitude;
    }
  }

  return null;
}

export function enrichNatalPlanetsForJump(
  planets: NatalPlanets,
  lots?: NatalLots
): NatalPlanets {
  const enriched: NatalPlanets = { ...planets };

  for (const keys of Object.values(NATAL_LONGITUDE_KEYS)) {
    const longitude = keys
      .map((key) => readLongitude(enriched[key]))
      .find((value): value is number => value !== null);
    if (longitude === undefined) {
      continue;
    }

    for (const key of keys) {
      writeLongitude(enriched, key, longitude);
    }
  }

  const northNode = getNatalLongitude(enriched, "North Node");
  if (northNode !== null) {
    const southNode = normalizeLongitude(northNode + 180);
    writeLongitude(enriched, "North Node", northNode);
    writeLongitude(enriched, "NNode", northNode);
    writeLongitude(enriched, "South Node", southNode);
    writeLongitude(enriched, "SNode", southNode);
  }

  const lotMappings: Array<[keyof NatalLots, string]> = [
    ["fortune", "Lot of Fortune"],
    ["spirit", "Lot of Spirit"],
    ["eros", "Lot of Eros"],
  ];

  for (const [lotKey, label] of lotMappings) {
    const longitude = Number(lots?.[lotKey]?.longitude);
    if (!Number.isFinite(longitude)) {
      continue;
    }
    writeLongitude(enriched, label, longitude);
  }

  return enriched;
}
