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
import { detectLocale, type Locale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";
import { nettoyerTexteMoteur } from "@/lib/nettoyer-texte-moteur";

// ─── API response types (exported for delineation pipeline) ──

export interface ConnectionBriefSignal {
  /** Observé en direct : aussi `station`, `profection`, `unknown`. */
  category: "transit" | "eclipse" | "zr" | "station" | "profection" | "unknown" | string;
  planetOrType: string;
  natalPoint: string;
  aspectOrMarker: string;
  score: number;
  houses?: number[];
  startDate?: string | null;
  endDate?: string | null;
  cycle?: { hitNumber: number; totalHits: number; pattern?: string };
}

/**
 * Un evenement du moteur.
 *
 * Les sept derniers champs sont arrives cote moteur le 04/09/2026. Avant eux,
 * le prompt demandait au modele d ecrire « ZR L3 Scorpion (Spirit) » et de
 * situer une periode dans le temps, alors que rien dans la reponse ne portait
 * ni le lot, ni le niveau, ni une date : le modele les inventait. Et surtout
 * `houses` manquait — donc rien ne permettait de dire que deux personnes
 * travaillent le meme domaine, qui est pourtant tout le produit.
 *
 * Ils ne sont pas optionnels par prudence : ils le sont parce qu un evenement
 * `transit` n a ni `lotType` ni `level`, et qu un evenement peut arriver sans
 * `markers`.
 */
export interface RawEvent {
  label: string;
  score: number;
  category: string;
  aspect: string | null;
  date?: string | null;
  /** Bornes reelles de la periode. Un ZR dure des mois ou des annees. */
  startDate?: string | null;
  endDate?: string | null;
  /** Les domaines de vie touches. La seule base d une comparaison entre deux personnes. */
  houses?: number[];
  /** `Cu` culmination, `LB` fin de chapitre, `pre-LB` approche de la fin. */
  markers?: string[];
  /** ZR seulement. */
  lotType?: "fortune" | "spirit" | "eros" | string;
  level?: number;
  periodSign?: string;
  /** Transits a passages multiples. */
  cycle?: { hitNumber: number; totalHits: number; pattern?: string };
  /** Eclipses. */
  eclipseAxis?: string;
  eclipseSeriesId?: string;
  eclipseSeriesStart?: string;
  eclipseSeriesEnd?: string;
}

/**
 * Comparaison deja calculee par le moteur (couche 3, 02/09/2026).
 * Le modele ne compare plus : il reformule cet objet.
 */
export interface Comparaison {
  memesDomaines: number[];
  domainesA: number[];
  domainesB: number[];
  memeAxeEclipse: string | null;
  charge: { A: "vide" | "leger" | "charge" | "pic"; B: "vide" | "leger" | "charge" | "pic" };
  tonalite: { A: "soutien" | "mixte" | "friction" | "neutre"; B: "soutien" | "mixte" | "friction" | "neutre" };
  tempo: { A: "lent" | "moyen" | "rapide"; B: "lent" | "moyen" | "rapide" };
  ecart: "synchrone" | "decale" | "asymetrique" | "aucun";
  techniquesAccordA: number;
  techniquesAccordB: number;
  /** Vrai = la carte doit se taire plutot que fabriquer une lecture. */
  silence: boolean;
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
  /** Calcule cote moteur depuis le 02/09/2026. Absent = ancien cache. */
  comparaison?: Comparaison;
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

/**
 * Les noms de mois venaient de deux tables francaises, servies aux dix langues
 * du produit : quelqu un en japonais lisait « Sep 2026 » et « Septembre ».
 * Intl les connait partout, et il n y a plus de table a tenir a jour.
 */
function mois(monthDate: Date, locale: Locale, forme: "long" | "short"): string {
  const m = new Intl.DateTimeFormat(locale, { month: forme, year: "numeric" })
    .format(monthDate);
  return m.charAt(0).toUpperCase() + m.slice(1);
}


// ─── Adapter: ActivePeriod[] → MatchingWindow[] ──────────

function adaptPeriods(
  periods: ActivePeriod[],
  relationship: RelationshipType,
  locale: Locale,
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
    // Deux comptes differents, parce que les deux phrases sont differentes.
    //
    // « 12 j restants » se compte jusqu a la FIN du mois. La formule d avant
    // comparait au 1er : a partir du 2, la fenetre en cours annonçait « 0 j
    // restants » jusqu au 31. La moitie de chaque mois affichait une fenetre
    // expiree.
    //
    // « dans 12 j » se compte jusqu au DEBUT du mois — sinon octobre, lu le
    // 11 septembre, annonçait « dans 50 j », c est-a-dire le jour ou il se
    // termine. Les deux comptes tombaient dans la meme variable.
    const debutDuMois = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const finDuMois = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const cible = status === "upcoming" ? debutDuMois : finDuMois;
    const daysLeft = Math.max(
      0,
      Math.ceil((cible.getTime() - today.getTime()) / 86_400_000),
    );

    // Le repli valait la couleur de SUBTLE : un palier inconnu se peignait donc
    // exactement comme un « alignement subtil » — la couleur EST le palier dans
    // cette liste. Gris neutre : visiblement pas un palier.
    const tierColor = TIER_COLORS[p.tier] ?? "#8A8A8A";
    // Le titre disait « Alignement actif », « Alignement Septembre ». Or
    // « alignement » est sur la liste des mots interdits du prompt — le repli
    // de l app contredisait donc le texte que l app produit. Le mois, lui, est
    // vrai dans les dix langues et n annonce rien.
    //
    // Le palier n est pas repete ici : la pastille de palier le dit deja, a
    // trois centimetres de la.
    const title = mois(monthDate, locale, "long");

    return [{
      title,
      dateRange: mois(monthDate, locale, "short"),
      monthKey: p.monthKey,
      daysLeft,
      status,
      tier: p.tier,
      tierColor,
      relationship,
      you: {
        description: nettoyerTexteMoteur(p.personAFocus.constructiveDirection),
        planet: toPlanetKey(p.personAFocus.primarySignal),
        category: p.personAFocus.primarySignal.category,
      },
      them: {
        description: nettoyerTexteMoteur(p.personBFocus.constructiveDirection),
        planet: toPlanetKey(p.personBFocus.primarySignal),
        category: p.personBFocus.primarySignal.category,
      },
      sharedTheme: nettoyerTexteMoteur(p.sharedTheme),
      insight: nettoyerTexteMoteur(p.sharedInsight),
      action: nettoyerTexteMoteur(p.actionTogether),
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
  const allWindows = adaptPeriods(periods, relationship, detectLocale());
  const windows = sortWindows(allWindows);

  // Return raw periods in the same order as sorted windows
  const sortedMonthKeys = windows.map((w) => w.monthKey);
  const sortedPeriods = sortedMonthKeys
    .map((mk) => periods.find((p) => p.monthKey === mk))
    .filter((p): p is ActivePeriod => p !== undefined);

  return { windows, periods: sortedPeriods };
}
