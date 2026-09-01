/**
 * Fiche de periode — fabrication du recit.
 *
 * Ce fichier decide QUELLE phrase est servie ; lib/recits-i18n.ts porte les
 * phrases elles-memes, dans les dix langues. La separation est volontaire :
 * tant que les 177 phrases vivaient ici, elles n existaient qu en francais et
 * en anglais, melangees, et personne ne pouvait voir ce qui manquait.
 *
 * i18n : chaque fonction exportee prend une `Locale`. Quand l appelant ne la
 * passe pas encore, elle est deduite de la langue detectee — les appels
 * existants continuent donc de fonctionner, mais un appelant qui connait la
 * langue choisie doit la passer, parce que detectLocale() lit le navigateur et
 * non la preference enregistree cote serveur.
 *
 * Les regles metier ne bougent pas : une maison inconnue, une planete hors
 * table, un lot inconnu rendent une chaine vide ou null. Il n existe aucune
 * phrase de secours servie comme une lecture.
 */

import { getPlanetLabel, type HouseNumber, type PlanetKey } from "@/lib/domain-config";
import { detectLocale, type Locale } from "@/lib/i18n-demo";
import { recit, recitAvec } from "@/lib/recits-i18n";

function resolveLocale(locale?: Locale): Locale {
  return locale ?? detectLocale();
}

// ─── Time Context ────────────────────────────────────────

export type TimeContext = "past" | "current" | "future";

/**
 * Le mot francais employe dans les clefs de traduction. Les clefs de
 * lib/recits-i18n.ts sont en francais comme celles de lib/perso-i18n.ts, pour
 * qu un seul vocabulaire serve dans tout le produit.
 */
const CLE_TEMPS: Record<TimeContext, string> = {
  past: "passe",
  current: "encours",
  future: "avenir",
};

export interface TimeContextMeta {
  context: TimeContext;
  bannerLabel: string;
  bannerIcon: "clock" | "bolt" | "calendar";
  storyLabel: string;
  insightLabel: string;
}

export function getTimeContext(isCurrent: boolean, isFuture: boolean, locale?: Locale): TimeContextMeta {
  const loc = resolveLocale(locale);
  const meta = (context: TimeContext, bannerIcon: TimeContextMeta["bannerIcon"]): TimeContextMeta => {
    const t = CLE_TEMPS[context];
    return {
      context,
      bannerIcon,
      bannerLabel: recit(`temps.${t}.banniere`, loc),
      storyLabel: recit(`temps.${t}.recit`, loc),
      insightLabel: recit(`temps.${t}.insight`, loc),
    };
  };
  if (isCurrent) return meta("current", "bolt");
  if (isFuture) return meta("future", "calendar");
  return meta("past", "clock");
}

// ─── Tier Labels ─────────────────────────────────────────

export function getTierLabel(tier: "toc" | "toctoc" | "toctoctoc", locale?: Locale): string {
  return recit(`niveau.${tier}`, resolveLocale(locale));
}

// ─── Domain Key → House Number bridge ────────────────────

const DOMAIN_TO_HOUSE: Record<string, HouseNumber> = {
  love: 7,      // Couple
  health: 6,    // Quotidien
  work: 10,     // Carrière
  identity: 1,
  money: 2,
  communication: 3,
  home: 4,
  creativity: 5,
  relationships: 7,
  transformations: 8,
  horizon: 9,
  career: 10,
  network: 11,
  inner: 12,
};

/**
 * Un domaine absent ou inconnu ne DOIT pas devenir la maison 10.
 * Avec `?? 10`, une capsule sans domaine affichait « Carriere » et son recit
 * complet — « Ta carriere est sous les projecteurs… » — sans qu aucun signe ne
 * dise que la donnee manquait. C etait une lecture inventee, indiscernable
 * d une vraie. On renvoie null : l appelant n affiche rien.
 */
export function domainKeyToHouseOrNull(domain: string | undefined | null): HouseNumber | null {
  if (!domain) return null;
  return DOMAIN_TO_HOUSE[domain] ?? null;
}

/**
 * Ancienne signature. Elle retombe encore sur la maison 10 et fabrique donc la
 * meme lecture. Seul components/demo/ShareSignalCard.tsx l utilise encore, et
 * ce fichier est hors du perimetre de ce passage — a migrer vers
 * domainKeyToHouseOrNull.
 */
export function domainKeyToHouse(domain: string): HouseNumber {
  return DOMAIN_TO_HOUSE[domain] ?? 10;
}

// ─── Domain Narrative ────────────────────────────────────

/**
 * Renvoie "" quand le domaine est absent ou inconnu : sans maison identifiee,
 * il n y a aucun recit a raconter. On preferait avant celui de la maison 10.
 */
export function getDomainNarrative(domain: string | undefined | null, context: TimeContext, locale?: Locale): string {
  const house = domainKeyToHouseOrNull(domain);
  if (house === null) return "";
  return recit(`domaine.${CLE_TEMPS[context]}.${house}`, resolveLocale(locale));
}

// ─── Planet Narrative ────────────────────────────────────

/**
 * De la planete vers sa clef de traduction. La table est typee sur PlanetKey :
 * ajouter une planete sans ecrire sa phrase ne compile pas.
 */
const CLE_PLANETE: Record<PlanetKey, string> = {
  sun: "planete.soleil.recit",
  moon: "planete.lune.recit",
  mercury: "planete.mercure.recit",
  venus: "planete.venus.recit",
  mars: "planete.mars.recit",
  jupiter: "planete.jupiter.recit",
  saturn: "planete.saturne.recit",
  uranus: "planete.uranus.recit",
  neptune: "planete.neptune.recit",
  pluto: "planete.pluton.recit",
  "north-node": "planete.noeud_nord.recit",
  "south-node": "planete.noeud_sud.recit",
  "solar-eclipse": "planete.eclipse_solaire.recit",
  "lunar-eclipse": "planete.eclipse_lunaire.recit",
};

/**
 * La proposition « {planete} fait ceci », dans la langue demandee.
 *
 * Le nom de la planete vient de getPlanetLabel, PAS du champ `label` de
 * domain-config : ce champ est le nom francais, et c est lui qui produisait
 * « Soleil shines a light on what truly matters. » pour quelqu un en japonais.
 */
function proposition(pk: PlanetKey, loc: Locale): string | null {
  const cle = CLE_PLANETE[pk];
  const nom = getPlanetLabel(pk, loc);
  if (!cle || !nom) return null;
  return recitAvec(cle, loc, { planete: nom });
}

export function getPlanetNarrative(planets: PlanetKey[], locale?: Locale): string {
  const loc = resolveLocale(locale);
  if (planets.length === 0) return "";
  if (planets.length === 1) {
    const p = proposition(planets[0], loc);
    if (!p) return "";
    return recitAvec("planetes.une", loc, { clause: p });
  }
  // Trois propositions au maximum — au-dela, la fiche devient illisible.
  const parts = planets.slice(0, 3)
    .map(pk => proposition(pk, loc))
    .filter((p): p is string => Boolean(p));
  if (parts.length === 0) return "";
  if (parts.length === 1) return recitAvec("planetes.une", loc, { clause: parts[0] });
  if (parts.length === 2) return recitAvec("planetes.deux", loc, { a: parts[0], b: parts[1] });
  return recitAvec("planetes.trois", loc, { a: parts[0], b: parts[1], c: parts[2] });
}

// ─── Duration Formatting ─────────────────────────────────

export function formatDuration(startDate: Date, endDate: Date, locale?: Locale): string {
  const loc = resolveLocale(locale);
  const diffMs = endDate.getTime() - startDate.getTime();
  const totalDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  const months = Math.floor(totalDays / 30);
  const days = totalDays - months * 30;
  // Le singulier n est pas une decoration : « 1 months » et « 1 jours »
  // s affichaient tels quels. Chaque forme est une entree de traduction, parce
  // que toutes les langues ne marquent pas le pluriel au meme endroit.
  const enJours = (n: number) => recitAvec(n === 1 ? "duree.jour_un" : "duree.jours", loc, { n });
  const enMois = (n: number) => recitAvec(n === 1 ? "duree.mois_un" : "duree.mois", loc, { n });
  if (months === 0) return enJours(totalDays);
  if (days === 0) return enMois(months);
  return recitAvec("duree.mois_et_jours", loc, { mois: enMois(months), jours: enJours(days) });
}

// ─── Progress ────────────────────────────────────────────

export function getProgressPercent(startDate: Date, endDate: Date): number {
  const now = Date.now();
  if (now >= endDate.getTime()) return 100;
  if (now <= startDate.getTime()) return 0;
  return Math.round(((now - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100);
}

// ─── Rarity Text (client-computed planet signature count) ─

export function getRarityText(tierOccurrence: number, tierTotal: number, tier: string, locale?: Locale): string | null {
  // NOTE: despite the historical name, this is used to display lifetime occurrence counts.
  // It must NOT be fed tierOccurrence/tierTotal (planet-signature rarity counters).
  if (!tierOccurrence || !tierTotal || tierOccurrence <= 0 || tierTotal <= 1) return null;
  return recitAvec("compteur.sur_ta_vie", resolveLocale(locale), { total: tierTotal });
}

// ─── Cycle Text (D-R-D pass count from API) ──────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCyclePassText(phase: any, locale?: Locale): string | null {
  const cycle = phase?.cycle;
  if (!cycle || !cycle.totalHits || cycle.totalHits <= 1) return null;
  return recitAvec("compteur.passage", resolveLocale(locale), {
    n: cycle.hitNumber,
    total: cycle.totalHits,
  });
}

// ─── Guidance by context ─────────────────────────────────

/** Les maisons pour lesquelles une action existe. Hors de 1-12, rien. */
function maisonConnue(house: unknown): house is number {
  return typeof house === "number" && Number.isInteger(house) && house >= 1 && house <= 12;
}

/**
 * Renvoie null quand rien n est ancre dans la donnee.
 *
 * Avant, l absence de maison activee produisait quand meme une phrase toute
 * faite — « Ce signal est actif. Observe ce qui bouge dans ta vie. » — servie
 * dans la carte de guidance au meme titre qu une lecture calculee. Le lecteur
 * n avait aucun moyen de distinguer les deux. Sans maison ni guidance fournie
 * par le moteur, on n affiche pas la carte.
 */
export function getContextualGuidance(
  domain: string | undefined | null,
  context: TimeContext,
  existingGuidance?: string,
  peakMoment?: string,
  apiTopics?: { house: number }[],
  locale?: Locale,
): string | null {
  const loc = resolveLocale(locale);
  // Use the primary topic's house for specific guidance
  const topicHouse = apiTopics?.[0]?.house;
  const action = maisonConnue(topicHouse)
    ? (t: string) => recit(`action.${t}.${topicHouse}`, loc)
    : null;

  if (context === "current") {
    return action?.("encours") ?? existingGuidance ?? null;
  }
  if (context === "future") {
    return action?.("avenir") ?? null;
  }
  // Past
  return action?.("passe") ?? peakMoment ?? null;
}

// ─── Transit Narrative (from real API data) ─────────────

/**
 * Ce que la personne RESSENT, par planete et par aspect. Sans jargon.
 *
 * La table est indexee par le nom que le moteur envoie ; les clefs pointent
 * vers lib/recits-i18n.ts. Une planete absente d ici n a pas de phrase, et
 * c est voulu — voir plus bas.
 */
const CLE_TRANSIT: Record<string, Record<string, string>> = {
  Pluto: {
    conjunction: "transit.pluton.conjonction",
    opposition: "transit.pluton.opposition",
    square: "transit.pluton.carre",
    trine: "transit.pluton.trigone",
  },
  Neptune: {
    conjunction: "transit.neptune.conjonction",
    opposition: "transit.neptune.opposition",
    square: "transit.neptune.carre",
    trine: "transit.neptune.trigone",
  },
  Uranus: {
    conjunction: "transit.uranus.conjonction",
    opposition: "transit.uranus.opposition",
    square: "transit.uranus.carre",
    trine: "transit.uranus.trigone",
  },
  Saturn: {
    conjunction: "transit.saturne.conjonction",
    opposition: "transit.saturne.opposition",
    square: "transit.saturne.carre",
    trine: "transit.saturne.trigone",
  },
  Jupiter: {
    conjunction: "transit.jupiter.conjonction",
    opposition: "transit.jupiter.opposition",
    square: "transit.jupiter.carre",
    trine: "transit.jupiter.trigone",
  },
  "North Node": { conjunction: "transit.noeud_nord.conjonction" },
  "South Node": { conjunction: "transit.noeud_sud.conjonction" },
};

/** Les trois chapitres de vie que le moteur nomme (ZR). */
const CLE_LOT: Record<string, string> = {
  fortune: "zr.fortune",
  spirit: "zr.esprit",
  eros: "zr.eros",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTransitNarrative(phase: any, locale?: Locale): string {
  if (!phase) return "";
  const loc = resolveLocale(locale);
  const cat = phase.apiCategory;
  const planet = phase.transitPlanet;
  const aspect = phase.aspect;

  if (cat === "transit" && planet) {
    // Try specific impact phrase first
    const parAspect = CLE_TRANSIT[planet];
    if (parAspect) {
      const cle = parAspect[aspect] || parAspect.conjunction;
      if (cle) return recit(cle, loc);
    }
    // Planete hors table (Chiron, Ascendant, MC, lots…) : on ne connait pas son
    // impact. La phrase de secours — « Une energie nouvelle influence ton
    // quotidien » — s affichait exactement comme un recit calcule. Rien plutot
    // qu un recit invente.
    return "";
  }

  if (cat === "eclipse") {
    return recit(phase.eclipseType === "solar" ? "eclipse.solaire" : "eclipse.lunaire", loc);
  }

  if (cat === "zr") {
    const isPeak = phase.isPeakPeriod || (phase.markers as string[] | undefined)?.includes("Peak");
    const lot = CLE_LOT[phase.lotType];
    // Lot inconnu = on ignore de quel chapitre il s agit. « Une fenetre de
    // timing significative est ouverte pour toi » affirmait une lecture sur
    // une donnee absente.
    if (!lot) return "";
    return recit(`${lot}.${isPeak ? "pic" : "normal"}`, loc);
  }

  if (cat === "station") {
    return recit("station.pause", loc);
  }

  return "";
}

// ─── Translate API label to reader-friendly words ───────

/**
 * Les points que le moteur nomme et qui ne sont pas des planetes. Les planetes,
 * elles, passent par getPlanetLabel : leur nom est deja traduit ailleurs.
 */
const NOM_PLANETE_API: Record<string, PlanetKey> = {
  Pluto: "pluto", Neptune: "neptune", Uranus: "uranus", Saturn: "saturn",
  Jupiter: "jupiter", Mars: "mars", Venus: "venus", Mercury: "mercury",
  Sun: "sun", Moon: "moon", "North Node": "north-node", "South Node": "south-node",
};
const NOM_POINT_API: Record<string, string> = {
  Ascendant: "point.ascendant",
  MC: "point.milieu_du_ciel",
};

/**
 * Le jargon du moteur, remplace mot a mot. L ordre compte : « Solar Eclipse »
 * doit passer avant les mots isoles.
 */
const JARGON_API: [RegExp, string][] = [
  [/\bSolar Eclipse\b/gi, "libelle.nouveau_depart"],
  [/\bLunar Eclipse\b/gi, "libelle.point_culminant"],
  [/\bconjunction\b/gi, "libelle.activation"],
  [/\bconjunct\b/gi, "libelle.activation"],
  [/\bsquare\b/gi, "libelle.tension"],
  [/\bopposition\b/gi, "libelle.confrontation"],
  [/\btrine\b/gi, "libelle.flux"],
  [/\bsextile\b/gi, "libelle.ouverture"],
  [/\bnatal\b/gi, "libelle.personnel"],
  [/\bReturn\b/gi, "libelle.retour"],
  [/\bPeak\b/gi, "libelle.pic"],
  [/\bSR\b/, "libelle.reprise"],
  [/\bSD\b/, "libelle.pause"],
  [/\bZR\b/, "libelle.cycle_de_vie"],
];

/**
 * « Jupiter conjunction natal Mars » devient une phrase lisible.
 *
 * Avant, seul le francais etait traite : les huit autres langues recevaient le
 * libelle anglais brut du moteur, avec ses noms d aspects. Maintenant les dix
 * passent par la meme table.
 */
export function translateApiLabel(label: string | undefined, locale?: Locale): string | null {
  if (!label) return null;
  const loc = resolveLocale(locale);
  let result = label;
  for (const [nom, pk] of Object.entries(NOM_PLANETE_API)) {
    const traduit = getPlanetLabel(pk, loc);
    if (traduit) result = result.replace(new RegExp(`\\b${nom}\\b`, "g"), traduit);
  }
  for (const [nom, cle] of Object.entries(NOM_POINT_API)) {
    result = result.replace(new RegExp(`\\b${nom}\\b`, "g"), recit(cle, loc));
  }
  for (const [motif, cle] of JARGON_API) {
    result = result.replace(motif, recit(cle, loc));
  }
  return result;
}

// ─── Cycle Narrative ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCycleNarrative(phase: any, locale?: Locale): string | null {
  const cycle = phase?.cycle;
  if (!cycle || !cycle.totalHits || cycle.totalHits <= 1) return null;
  const loc = resolveLocale(locale);

  if (cycle.totalHits <= 3) {
    const phaseConnue = [1, 2, 3].includes(cycle.hitNumber);
    return phaseConnue
      ? recit(`cycle.phase${cycle.hitNumber}`, loc)
      : recitAvec("cycle.passage_seul", loc, { n: cycle.hitNumber });
  }
  return recitAvec("cycle.passage_sur", loc, { n: cycle.hitNumber, total: cycle.totalHits });
}

// ─── Lifetime Narrative ─────────────────────────────────
// NOTE: The API does NOT provide lifetime occurrence counts.
// This function is kept for backward compat but currently unused
// since lifetimeNumber/lifetimeTotal are always undefined from API.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLifetimeNarrative(phase: any, locale?: Locale): string | null {
  const n = phase?.lifetimeNumber;
  const total = phase?.lifetimeTotal;
  if (!n || !total || total <= 1) return null;
  const loc = resolveLocale(locale);

  if (n === 1 && total > 1) return recit("vie.premiere", loc);
  if (n === total) return recit("vie.derniere", loc);
  if (n === 2) return recit("vie.deuxieme", loc);
  return recitAvec("vie.enieme", loc, { n, total });
}

// ─── Topics Narrative (from real API topics) ────────────

export function getTopicsNarrative(
  topics: { house: number; topic: string; source: string }[] | undefined,
  context: TimeContext,
  locale?: Locale
): string {
  if (!topics || topics.length === 0) return "";
  const loc = resolveLocale(locale);

  // Une maison hors 1-12 devenait « ta vie » : on annonçait alors « Ce signal
  // touche ta vie », phrase vraie de tout signal et donc sans contenu, mais
  // presentee comme le resultat du calcul. On ecarte les maisons inconnues ; si
  // aucune ne reste, on n affiche pas la phrase.
  const parts = topics
    .filter(t => maisonConnue(t.house))
    .map(t => recit(`maison.${t.house}`, loc));
  const unique = [...new Set(parts)];
  if (unique.length === 0) return "";

  // Le separateur et la liaison portent leurs propres espaces : le japonais et
  // le chinois n en mettent pas autour de « 、», l arabe attache son « و » au
  // mot suivant.
  const joined = unique.length === 1
    ? unique[0]
    : unique.slice(0, -1).join(recit("sujets.separateur", loc))
      + recit("sujets.liaison", loc)
      + unique[unique.length - 1];

  return recitAvec(`sujets.${CLE_TEMPS[context]}`, loc, { sujets: joined });
}
