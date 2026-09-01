/**
 * Connection Brief API — wraps /api/connection-brief (via /api/toctoc proxy).
 * Returns raw ActivePeriod[] alongside adapted MatchingWindow[] so callers
 * can feed the raw data to the LLM delineation pipeline.
 *
 * API docs: D:\51.full-suite-api\knowledge\API-COMPLETE-DOCUMENTATION.md#connection-brief
 */

import type { BirthData } from "@/lib/birth-data";
import type { RelationshipType, MatchingWindow } from "@/lib/matching-narratives";
import type { PlanetKey } from "@/lib/domain-config";
import { apiFetch } from "@/lib/api-client";

// ─── API response types (exported for delineation pipeline) ──

export interface ConnectionBriefSignal {
  category: "transit" | "eclipse" | "zr";
  planetOrType: string;
  natalPoint: string;
  aspectOrMarker: string;
  score: number;
}

export interface RawEvent {
  label: string;
  score: number;
  category: string;
  aspect: string | null;
  date?: string | null;
}

export interface RawProfection {
  house: number;
  houseName: string;
  annualTheme: string;
}

export interface PersonFocus {
  dominantDomains: string[];
  primarySignal: ConnectionBriefSignal;
  challenges: string[];
  constructiveDirection: string;
  profectionHouse?: number;
  profectionTheme?: string;
  rawData?: {
    profection?: RawProfection;
    events?: RawEvent[];
    monthScore?: { total: number; zr: number; transit: number };
  };
}

export interface ActivePeriod {
  monthKey: string; // "YYYY-MM"
  startDate: string;
  endDate: string;
  tier: "PEAK" | "CLEAR" | "SUBTLE";
  tierScore: number;
  personAFocus: PersonFocus;
  personBFocus: PersonFocus;
  sharedTheme: string;
  sharedInsight: string;
  actionTogether: string;
}

export interface ConnectionBriefResult {
  windows: MatchingWindow[];
  periods: ActivePeriod[];
}

interface ConnectionBriefResponse {
  success: boolean;
  connectionBrief: {
    relationship: string;
    targetDate: string;
    activePeriods: ActivePeriod[];
  };
  computeTimeSeconds?: number;
}

// ─── Planet name → PlanetKey ─────────────────────────────

const PLANET_KEY_MAP: Record<string, PlanetKey> = {
  Saturn: "saturn",
  Jupiter: "jupiter",
  Venus: "venus",
  Mars: "mars",
  Moon: "moon",
  Sun: "sun",
  Mercury: "mercury",
  Uranus: "uranus",
  Neptune: "neptune",
  // Pluton pointait sur « neptune ». Une erreur de copie d une ligne, mais
  // toute fenetre relationnelle portee par Pluton affichait la pastille
  // Neptune, sa couleur et son recit — un signal attribue a la mauvaise
  // planete, presente comme une lecture.
  Pluto: "pluto",
  "North Node": "north-node",
  "South Node": "south-node",
};

function toPlanetKey(signal: ConnectionBriefSignal): PlanetKey | null {
  if (signal.category === "eclipse") {
    return signal.planetOrType?.toLowerCase().includes("solar")
      ? "solar-eclipse"
      : "lunar-eclipse";
  }
  // Une planete inconnue devenait le SOLEIL. La table ignore Chiron,
  // l Ascendant, le Milieu du Ciel et les lots du zodiacal releasing (Fortune,
  // Esprit, Eros) : tous s affichaient comme « Soleil », avec sa couleur et son
  // recit. lib/domain-config.tsx renvoie null dans ce cas, et c est la bonne
  // reponse — mieux vaut ne rien montrer qu attribuer au hasard.
  return PLANET_KEY_MAP[signal.planetOrType] ?? null;
}

// ─── Tier colors ─────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  PEAK: "#D89EA0",
  CLEAR: "#6BA89A",
  SUBTLE: "#8B7FC2",
};

const MONTH_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTH_SHORT = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

// ─── Adapter: ActivePeriod[] → MatchingWindow[] ──────────

function adaptPeriods(
  periods: ActivePeriod[],
  relationship: RelationshipType,
): MatchingWindow[] {
  const today = new Date();

  // flatMap et non map : une periode dont le monthKey est illisible est ecartee.
  // Avant, `new Date(NaN, NaN, 15)` produisait une date invalide qui traversait
  // tout le calcul sans jamais lever d erreur — statut « a venir », « 0 j
  // restants » et un titre « Alignement undefined ». Une fenetre relationnelle
  // entierement fabriquee, affichee a cote des vraies.
  return periods.flatMap((p): MatchingWindow[] => {
    const [year, month] = p.monthKey.split("-").map(Number);
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
      return [];
    }
    const monthDate = new Date(year, month - 1, 15);
    const isCurrentMonth =
      monthDate.getMonth() === today.getMonth() &&
      monthDate.getFullYear() === today.getFullYear();
    const isPast = monthDate < new Date(today.getFullYear(), today.getMonth(), 1);
    const status = isCurrentMonth ? "active" : isPast ? "past" : "upcoming";
    // Les jours restants se comptent jusqu a la FIN du mois, pas jusqu a son
    // debut. La formule precedente comparait a monthDate — le 1er du mois —
    // donc a partir du 2, la fenetre en cours annonçait « 0 j restants »
    // jusqu au 31. La moitie de chaque mois affichait une fenetre expiree.
    const finDuMois = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const daysLeft = Math.max(
      0,
      Math.ceil((finDuMois.getTime() - today.getTime()) / 86_400_000),
    );

    // Le repli valait la couleur de SUBTLE : un palier inconnu se peignait donc
    // exactement comme un « alignement subtil » — la couleur EST le palier dans
    // cette liste. Gris neutre : visiblement pas un palier.
    const tierColor = TIER_COLORS[p.tier] ?? "#8A8A8A";
    const title = isCurrentMonth
      ? "Alignement actif"
      : p.tier === "PEAK"
        ? `Fenêtre forte — ${MONTH_FR[month - 1]}`
        : `Alignement ${MONTH_FR[month - 1]}`;

    return [{
      title,
      dateRange: `${MONTH_SHORT[month - 1]} ${year}`,
      monthKey: p.monthKey,
      daysLeft,
      status,
      tier: p.tier,
      tierColor,
      relationship,
      you: {
        description: p.personAFocus.constructiveDirection,
        planet: toPlanetKey(p.personAFocus.primarySignal),
        category: p.personAFocus.primarySignal.category,
      },
      them: {
        description: p.personBFocus.constructiveDirection,
        planet: toPlanetKey(p.personBFocus.primarySignal),
        category: p.personBFocus.primarySignal.category,
      },
      sharedTheme: p.sharedTheme,
      insight: p.sharedInsight,
      action: p.actionTogether,
    }];
  });
}

// ─── Sort helper ──────────────────────────────────────────

function sortWindows(windows: MatchingWindow[]): MatchingWindow[] {
  const active = windows.filter((w) => w.status === "active");
  const upcoming = windows.filter((w) => w.status === "upcoming");
  const past = windows.filter((w) => w.status === "past");
  const result = [...active, ...upcoming];
  if (result.length < 3) result.push(...past.slice(0, 3 - result.length));
  return result.slice(0, 6);
}

// ─── Main fetch ───────────────────────────────────────────

export async function fetchConnectionBrief(
  personA: BirthData,
  personB: BirthData,
  relationship: RelationshipType,
  theirName: string,
  months = 3,
): Promise<ConnectionBriefResult> {
  const today = new Date().toISOString().slice(0, 10);

  const payload = {
    endpoint: "connection-brief",
    relationship,
    targetDate: today,
    personA: {
      birthDate: personA.birthDate,
      birthTime: personA.birthTime,
      latitude: personA.latitude,
      longitude: personA.longitude,
      timezone: personA.timezone,
    },
    personB: {
      birthDate: personB.birthDate,
      birthTime: personB.birthTime,
      latitude: personB.latitude,
      longitude: personB.longitude,
      timezone: personB.timezone,
    },
    responseWindow: { mode: "connection_month_plus_next", months },
  };

  const res = await apiFetch("/api/toctoc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`connection-brief returned ${res.status}`);

  const raw = await res.json();
  // API wraps: { success, data: { success, connectionBrief }, timestamp }
  const data = (raw?.data ?? raw) as ConnectionBriefResponse;
  if (!data?.connectionBrief?.activePeriods) {
    throw new Error("Invalid connection-brief response");
  }

  const periods = data.connectionBrief.activePeriods;
  const allWindows = adaptPeriods(periods, relationship);
  const windows = sortWindows(allWindows);

  // Return raw periods in the same order as sorted windows
  const sortedMonthKeys = windows.map((w) => w.monthKey);
  const sortedPeriods = sortedMonthKeys
    .map((mk) => periods.find((p) => p.monthKey === mk))
    .filter((p): p is ActivePeriod => p !== undefined);

  return { windows, periods: sortedPeriods };
}
