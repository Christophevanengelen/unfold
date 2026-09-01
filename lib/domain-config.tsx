/**
 * Unfold — 12 Life Domains (Houses) + Planet Config
 * ==================================================
 * Maps the real TocToc API house system to user-friendly labels.
 * No astrology jargon visible to the user — pragmatic domain names only.
 *
 * Colors come from the API's houseColors field, but we define defaults
 * here for mock data and fallback rendering.
 */

import type { EventCategory, TocScore } from "@/types/api";
import type { Locale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

// ─── House (Life Domain) Configuration ───────────────────

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface HouseMeta {
  /**
   * La CLEF de traduction, pas un libelle. Meme conversion que
   * components/demo/compat/relationshipConfig.ts, meme raison.
   *
   * Se lit avec perso(cleLabel, locale). Les douze mots sont ceux de
   * lib/maisons-i18n.ts, pour qu un domaine porte le meme nom dans l app et
   * dans une notification.
   */
  cleLabel: string;
  /**
   * Le libelle francais, uniquement pour les ecrans pas encore convertis.
   *
   * @deprecated Passe a cleLabel + perso(). Ce champ servait de libelle
   * d interface a dix langues : un lecteur japonais lisait « Identité ».
   */
  label: string;
  /** One-line description for tooltips/detail sheets */
  description: string;
  /** Default hex color (API overrides with natal-specific colors) */
  color: string;
  /** Flowbite icon name (outline) for UI rendering */
  iconName: string;
}

// Colors: muted premium palette that works on dark purple backgrounds.
// In production, the API provides natal-specific houseColors per user.
// These defaults are fallbacks — subtle, distinguishable, never loud.
export const houseConfig: Record<HouseNumber, HouseMeta> = {
  1:  { cleLabel: "maison.1",  label: "Identité",        description: "Corps, image, manière d'être",               color: "#C2A0D4" /* soft lilac */,     iconName: "user" },
  2:  { cleLabel: "maison.2",  label: "Argent",          description: "Revenus, biens, valeurs",                    color: "#C4A86B" /* warm gold */,      iconName: "cash" },
  3:  { cleLabel: "maison.3",  label: "Communication",   description: "Échanges, déplacements, entourage",          color: "#7BBFAF" /* sage teal */,      iconName: "chat-bubble" },
  4:  { cleLabel: "maison.4",  label: "Foyer",           description: "Logement, famille, racines",                 color: "#6BA89A" /* muted sage */,     iconName: "home" },
  5:  { cleLabel: "maison.5",  label: "Créativité",      description: "Plaisir, enfants, romance",                  color: "#D89EA0" /* dusty rose */,     iconName: "sparkles" },
  6:  { cleLabel: "maison.6",  label: "Quotidien",       description: "Travail du jour, santé, routines",           color: "#8BAFC2" /* steel blue */,     iconName: "clipboard-check" },
  7:  { cleLabel: "maison.7",  label: "Couple",          description: "Partenaires, contrats, engagement",          color: "#B07CC2" /* warm purple */,    iconName: "heart" },
  8:  { cleLabel: "maison.8",  label: "Transformations", description: "Crises, héritage, profondeur",               color: "#8B7FC2" /* muted indigo */,   iconName: "fire" },
  9:  { cleLabel: "maison.9",  label: "Horizon",         description: "Voyages, études, philosophie",               color: "#9585CC" /* accent purple */,  iconName: "globe-alt" },
  10: { cleLabel: "maison.10", label: "Carrière",        description: "Réputation, statut, vie publique",           color: "#A88BC4" /* lavender */,       iconName: "briefcase" },
  11: { cleLabel: "maison.11", label: "Réseau",          description: "Amis, communautés, projets",                 color: "#7BA5C2" /* soft blue */,      iconName: "user-group" },
  12: { cleLabel: "maison.12", label: "Intériorité",     description: "Isolement, secrets, lâcher-prise",           color: "#9E7CA0" /* muted mauve */,    iconName: "eye-slash" },
};

/**
 * Le nom du domaine, dans la langue de la personne. « ? » si le numero est
 * hors des douze.
 *
 * La signature prend une locale depuis que le libelle n est plus du francais
 * fige : sans elle, cette fonction ne pouvait rendre qu une seule langue.
 */
export function getHouseLabel(house: number, locale: Locale): string {
  const meta = houseConfig[house as HouseNumber];
  return meta ? perso(meta.cleLabel, locale) : "?";
}

/** Get house meta from number */
export function getHouseMeta(house: number): HouseMeta | null {
  return houseConfig[house as HouseNumber] ?? null;
}

/** All house numbers in order */
export const HOUSE_NUMBERS: HouseNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// ─── Toc Score Display ───────────────────────────────────

export interface TocScoreMeta {
  label: string;
  tocLabel: string;
  description: string;
  /** Sausage width in px for timeline rendering */
  sausageWidth: number;
}

export const tocScoreConfig: Record<TocScore, TocScoreMeta> = {
  1: { label: "Notable",      tocLabel: "toc",                     description: "Fast-planet station or basic eclipse",                sausageWidth: 36 },
  2: { label: "Significatif", tocLabel: "toc toc",                 description: "Saturn/Jupiter transit or ZR L3 peak",               sausageWidth: 48 },
  3: { label: "Majeur",       tocLabel: "toc toc toc",             description: "Outer planet transit, ZR L2 peak, or Saturn Return", sausageWidth: 64 },
  4: { label: "Exceptionnel", tocLabel: "toc toc toc toc",         description: "Pluto/Neptune conjunction on VIP natal point",       sausageWidth: 80 },
};

// ─── Event Category Display ──────────────────────────────

export interface CategoryMeta {
  label: string;
  description: string;
  /** Default color for this category type */
  color: string;
}

export const categoryConfig: Record<EventCategory, CategoryMeta> = {
  transit: {
    label: "Transit",
    description: "Planète lente touche un point natal. Semaines à mois.",
    color: "#8B7FC2",
  },
  eclipse: {
    label: "Éclipse",
    description: "Reset ou culmination sur un axe de vie. Effet 6 mois.",
    color: "#C4A86B",
  },
  zr: {
    label: "Pic de vie",
    description: "Période de Fortune, Esprit ou Éros activée. Mois à années.",
    color: "#6BA89A",
  },
  station: {
    label: "Station",
    description: "Planète rapide s'arrête sur un point natal — quelques jours",
    color: "#9CA3AF",
  },
};

// ─── ZR Lot Type Labels ─────────────────────────────────

export const zrLotLabels: Record<string, string> = {
  fortune: "Circonstances",
  spirit: "Vocation",
  eros: "Désir",
};

// ─── Planet Config (kept from previous, extended) ────────

export type PlanetKey =
  | "sun" | "moon" | "mercury" | "venus" | "mars"
  | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto"
  | "north-node" | "south-node"
  | "solar-eclipse" | "lunar-eclipse";

interface PlanetMeta {
  /**
   * La CLEF de traduction, pas un libelle. Se lit avec perso(cleLabel, locale).
   *
   * Les noms de planetes sont des noms astronomiques : chaque langue a le sien.
   */
  cleLabel: string;
  /**
   * Le nom francais, uniquement pour les ecrans pas encore convertis.
   *
   * @deprecated Passe a cleLabel + perso(). Ce champ servait « Saturne » et
   * « Nœud Nord » aux dix langues du produit.
   */
  label: string;
  color: string;
  /** Unicode symbol for compact display */
  symbol: string;
}

export const planetConfig: Record<PlanetKey, PlanetMeta> = {
  sun:             { cleLabel: "planete.soleil",          label: "Soleil",          color: "#C9A86C", symbol: "☉" },  // warm gold — muted
  moon:            { cleLabel: "planete.lune",            label: "Lune",            color: "#A8B0C4", symbol: "☽" },  // silver mauve
  mercury:         { cleLabel: "planete.mercure",         label: "Mercure",         color: "#8AADA6", symbol: "☿" },  // sage teal
  venus:           { cleLabel: "planete.venus",           label: "Vénus",           color: "#B88A9E", symbol: "♀" },  // dusty rose
  mars:            { cleLabel: "planete.mars",            label: "Mars",            color: "#B87A76", symbol: "♂" },  // muted terracotta
  jupiter:         { cleLabel: "planete.jupiter",         label: "Jupiter",         color: "#8A9ABF", symbol: "♃" },  // soft periwinkle
  saturn:          { cleLabel: "planete.saturne",         label: "Saturne",         color: "#A89478", symbol: "♄" },  // warm taupe
  uranus:          { cleLabel: "planete.uranus",          label: "Uranus",          color: "#7AAAB5", symbol: "♅" },  // dusty cyan
  neptune:         { cleLabel: "planete.neptune",         label: "Neptune",         color: "#9B85C4", symbol: "♆" },  // lavender — on-brand
  pluto:           { cleLabel: "planete.pluton",          label: "Pluton",          color: "#7A6B8A", symbol: "♇" },  // deep mauve — transformative
  "north-node":    { cleLabel: "planete.noeud_nord",      label: "Nœud Nord",       color: "#B5C98A", symbol: "☊" },  // sage green — growth direction
  "south-node":    { cleLabel: "planete.noeud_sud",       label: "Nœud Sud",        color: "#C4A07A", symbol: "☋" },  // warm amber — release
  "solar-eclipse": { cleLabel: "planete.eclipse_solaire", label: "Éclipse solaire", color: "#D4C5A0", symbol: "●" },  // warm ivory — corona glow
  "lunar-eclipse": { cleLabel: "planete.eclipse_lunaire", label: "Éclipse lunaire", color: "#A07090", symbol: "◐" },  // mauve pink
};

/**
 * Le nom de la planete, dans la langue de la personne. null quand le moteur
 * nomme un point qu on ne sait pas representer — on n affiche alors rien
 * plutot qu une planete inventee.
 */
export function getPlanetLabel(planet: PlanetKey | null | undefined, locale: Locale): string | null {
  if (!planet) return null;
  const meta = planetConfig[planet];
  return meta ? perso(meta.cleLabel, locale) : null;
}

export const PLANET_KEYS: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
  "north-node", "south-node",
  "solar-eclipse", "lunar-eclipse",
];

// ─── Transit Planet → PlanetKey mapping ──────────────────
/** Maps API transitPlanet names to our PlanetKey for color/icon lookup */
export function transitPlanetToKey(transitPlanet: string): PlanetKey | null {
  const map: Record<string, PlanetKey> = {
    "Pluto": "pluto",
    "Neptune": "neptune",
    "Uranus": "uranus",
    "Saturn": "saturn",
    "Jupiter": "jupiter",
    "Mars": "mars",
    "Venus": "venus",
    "Mercury": "mercury",
    "North Node": "north-node",
    "South Node": "south-node",
    "eclipse": "solar-eclipse",
  };
  return map[transitPlanet] ?? null;
}

// ─── Helpers ─────────────────────────────────────────────

/** Format a date range as "Mar '26 — Jun '26" */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const s = `${months[start.getMonth()]} '${String(start.getFullYear()).slice(2)}`;
  const e = `${months[end.getMonth()]} '${String(end.getFullYear()).slice(2)}`;
  return s === e ? s : `${s} — ${e}`;
}

/** Calculate duration in weeks between two dates */
export function durationWeeks(startDate: string, endDate: string): number {
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000));
}

/** Get the sausage width for a given score */
export function getSausageWidth(score: TocScore): number {
  return tocScoreConfig[score]?.sausageWidth ?? 36;
}

// ─── BACKWARD COMPAT (old 3-domain system) ──────────────
// TODO: Remove once old components are fully migrated to 12-house system.

/** @deprecated Use HouseNumber instead */
export type DomainKey = "love" | "health" | "work";

/** @deprecated Use HOUSE_NUMBERS instead */
export const DOMAINS: DomainKey[] = ["love", "health", "work"];

/** @deprecated Use houseConfig instead */
export const domainConfig: Record<DomainKey, { label: string; color: string; iconName: string }> = {
  love:   { label: "Couple",    color: "#EC4899", iconName: "heart" },
  health: { label: "Quotidien", color: "#22C55E", iconName: "clipboard-check" },
  work:   { label: "Carrière",  color: "#A855F7", iconName: "briefcase" },
};
