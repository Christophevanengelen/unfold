/**
 * Les routes publiques de l outil ouvert de Marie-Ange (app.astrolearn.io),
 * typees sur les formes MESUREES le 02/09/2026 (MOTEUR-SURFACE.md §5).
 *
 * Elles sont indexees par `personId` — une personne de SA base — et non par
 * naissance. Ce module sert donc a construire et tester les ecrans contre le
 * corpus (une personne de demonstration), en attendant que la porte
 * date-heure-lieu soit ouverte sur ces six routes (demande posee). Le jour ou
 * elle s ouvre, seule la fonction `cible()` change.
 *
 * Aucune astrologie n est calculee ici. Rien n est invente : ce sont les
 * phrases du moteur, telles quelles. La traduction en dix langues est le
 * travail du modele, qui reformule sans rien ajouter (REPORTING-REGLES.md).
 */
import { apiFetch } from "@/lib/api-client";

const BASE = "https://app.astrolearn.io/api/astrolearn/public";

/** Pour l instant : un personId du corpus. Demain : la naissance. */
export type Cible = { personId: string | number };
function cible(c: Cible): string {
  return `personId=${encodeURIComponent(String(c.personId))}`;
}

async function lire<T>(chemin: string): Promise<T | null> {
  try {
    const res = await apiFetch(`${BASE}/${chemin}`);
    if (!res.ok) return null;
    const j = (await res.json()) as { data?: T } & T;
    return (j.data ?? j) as T;
  } catch {
    return null;
  }
}

// ── A. Numerologie — 494 textes, en francais ────────────────────────────────
export interface AnneeNumerologique {
  year: number;
  age: number;
  lifePeriod?: string;
  dateStart: string;
  dateEnd: string;
  personalYear: number;
  personalYearTheme?: { title: string; theme: string };
  universalYearTheme?: { title: string; theme: string };
  advice?: { text?: string; universalContext?: string };
}
export interface Numerologie {
  coreNumbers: { lifePath: number; expression: number; soulUrge: number; personality: number; birthday: number; maturity: number };
  lifePlan?: { title: string; description: string; cycles?: string[] };
  hundredYearCycles: AnneeNumerologique[];
}
export const numerologie = (c: Cible) => lire<Numerologie>(`numerology?${cible(c)}`);

// ── B. Archetypes d aspects — les ages-cles, memes pour tout le monde ────────
export interface AgeCle {
  pair: [string, string];
  activationAge: number;
  activationDate: string;
  status: "past" | "active" | "upcoming" | string;
  archetypeTheme: string;
  archetypeUniversal: string;
  archetypeKeywords?: string[];
  layerA?: { title: string; description: string };
  layerB?: { quality?: string; experience?: string };
}
export interface Archetypes { presentAspects: AgeCle[]; stats?: { presentCount: number; upcomingPresent: number } }
export const archetypes = (c: Cible) => lire<Archetypes>(`aspect-archetypes?${cible(c)}`);

// ── C. Periodes planetaires (firdaria) — dates exactes ──────────────────────
export interface Jalon {
  planet: string;
  period: "greater" | "minor" | string;
  years: number;
  activationDate: string;
  activationDateDisplay?: string;
  isPast: boolean;
  daysFromToday?: number;
  status: "currently_active" | "upcoming" | "past" | string;
}
export interface PeriodesPlanetaires { currentlyActive: Jalon; nextMilestone: Jalon | null; allMilestones: Jalon[] }
export const periodesPlanetaires = (c: Cible) => lire<PeriodesPlanetaires>(`planetary-periods?${cible(c)}`);

// ── D. Revolutions solaires, chronologie — une phrase par annee ─────────────
export interface AnneeSolaire {
  year: number;
  age: number;
  birthdayStartDate: string;
  birthdayEndDate: string;
  sr?: { angularPlanets?: Array<{ meaning?: string }> };
  profection?: { annual?: { houseName?: string; description?: string } };
}
export interface ChronologieSolaire { rows: AnneeSolaire[]; pivotalTop10Years: number[]; peakYears: number[] }
export const chronologieSolaire = (c: Cible) => lire<ChronologieSolaire>(`solar-return-timeline?${cible(c)}`);

// ── E. Qualite des periodes — les trois parties de vie ──────────────────────
export interface PartieDeVie {
  order: number; label: string; startAge: number; endAge: number;
  quality: string; qualityScore: number; status: "past" | "current" | "future" | string; description: string;
}
export interface QualiteDesPeriodes {
  currentAge: number;
  lifeParts?: { parts: PartieDeVie[]; summary?: string };
  currentBackground?: { sign: string; ruler: string; startDate: string; endDate: string; grade?: string };
  chapters: Array<{ startAge: number; endAge: number; startDate: string; endDate: string; signQuality?: string; houseTopic?: string; isPeakPeriod?: boolean }>;
  counselingNote?: string;
}
export const qualiteDesPeriodes = (c: Cible, lot: "spirit" | "fortune" = "spirit") =>
  lire<QualiteDesPeriodes>(`period-quality?lot=${lot}&${cible(c)}`);

// ── F. Circumambulation — qui gouverne cette tranche de vie ─────────────────
export interface SeigneurDuTemps {
  planet: string; natalHouse?: number; periodStartAge: number; periodEndAge: number;
  natalCondition?: string; interpretation?: string; nextLord?: string;
}
export interface Circumambulation {
  primaryTimeLord: SeigneurDuTemps;
  nextParticipatingTimeLord?: { planet: string; ageOfContact: number; interpretation?: string } | null;
}
export const circumambulation = (c: Cible, date: string) =>
  lire<Circumambulation>(`circumambulation?${cible(c)}&date=${date}&releaser=ascendant`);

// ── Human Design — deux phrases, type et autorite, fr + en ──────────────────
export interface HumanDesign { type?: string; typeFr?: string; strategy?: string; authority?: string; authorityDescription?: string; authorityDescriptionFr?: string }
export const humanDesign = (c: Cible) => lire<HumanDesign>(`hd?${cible(c)}`);
