export const JUMP_SIGN_NAMES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export const JUMP_MOVING_PLANET_NAMES = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "North Node",
  "South Node",
] as const;

export const JUMP_NATAL_POINT_NAMES = [
  ...JUMP_MOVING_PLANET_NAMES,
  "Chiron",
  "Lot of Fortune",
  "Lot of Spirit",
  "Lot of Eros",
] as const;

export const JUMP_ASPECT_NAMES = [
  "conjunction",
  "sextile",
  "square",
  "trine",
  "opposition",
] as const;

export type JumpDirection = "next" | "previous";
export type JumpMatchMode = "all" | "any";
export type AspectTargetKind = "transit" | "natal";

export interface DegreeJumpCriterion {
  id: string;
  planet: string;
  degree: number;
  minute: number;
  sign: string;
}

export interface AspectJumpCriterion {
  id: string;
  planet: string;
  aspect: string;
  target: AspectTargetKind;
  targetPlanet: string;
}

export function createDegreeCriterion(
  partial?: Partial<DegreeJumpCriterion>
): DegreeJumpCriterion {
  return {
    id: partial?.id ?? `degree-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    planet: partial?.planet ?? "Mars",
    degree: partial?.degree ?? 0,
    minute: partial?.minute ?? 0,
    sign: partial?.sign ?? JUMP_SIGN_NAMES[0],
  };
}

export function createAspectCriterion(
  partial?: Partial<AspectJumpCriterion>
): AspectJumpCriterion {
  return {
    id: partial?.id ?? `aspect-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    planet: partial?.planet ?? "Mars",
    aspect: partial?.aspect ?? "conjunction",
    target: partial?.target ?? "natal",
    targetPlanet: partial?.targetPlanet ?? "Sun",
  };
}

export function normalizeJumpDirection(value: unknown): JumpDirection {
  return String(value ?? "next").toLowerCase() === "previous" ? "previous" : "next";
}

export function normalizeJumpMatchMode(value: unknown): JumpMatchMode {
  return String(value ?? "all").toLowerCase() === "any" ? "any" : "all";
}

export function signDegreeToLongitude(
  sign: string,
  degree: number,
  minute = 0
): number | null {
  const signIndex = JUMP_SIGN_NAMES.findIndex(
    (entry) => entry.toLowerCase() === sign.trim().toLowerCase()
  );
  if (signIndex < 0) {
    return null;
  }

  const inSign = degree + minute / 60;
  if (inSign < 0 || inSign >= 30) {
    return null;
  }

  return signIndex * 30 + inSign;
}

export function longitudeToSignAndDegreeInSign(longitude: number): {
  sign: string;
  degreeInSign: number;
} {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return {
    sign: JUMP_SIGN_NAMES[signIndex],
    degreeInSign: normalized - signIndex * 30,
  };
}

export function longitudeToSignDegree(longitude: number): {
  sign: string;
  degree: number;
  minute: number;
} {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const inSign = normalized % 30;
  const degree = Math.floor(inSign);
  const minute = Math.floor((inSign - degree) * 60);
  return {
    sign: JUMP_SIGN_NAMES[signIndex],
    degree,
    minute,
  };
}

export const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  semisextile: 30,
  semisquare: 45,
  sextile: 60,
  square: 90,
  trine: 120,
  sesquiquadrate: 135,
  quincunx: 150,
  opposition: 180,
};

export function formatDegreeMinuteInSign(degreeInSign: number): string {
  const normalized = Math.max(0, Math.min(29.999999, degreeInSign));
  let degrees = Math.floor(normalized);
  let minutes = Math.floor((normalized - degrees) * 60);
  let seconds = Math.round(((normalized - degrees) * 60 - minutes) * 60);

  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }
  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
  }

  return `${degrees}° ${String(minutes).padStart(2, "0")}'`;
}

export function formatJumpEventDescription(description: string): string {
  return description.replace(/(\d+(?:\.\d+)?)°/g, (_match, value: string) =>
    formatDegreeMinuteInSign(Number(value))
  );
}

export function angularDistanceDeg(left: number, right: number): number {
  let delta = Math.abs(((left % 360) + 360) % 360 - (((right % 360) + 360) % 360));
  if (delta > 180) {
    delta = 360 - delta;
  }
  return delta;
}
