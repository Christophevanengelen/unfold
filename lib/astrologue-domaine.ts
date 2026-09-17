/**
 * Du domaine de vie pose par la personne vers les maisons et les points
 * natals a aller chercher dans les techniques.
 *
 * Aucun appel reseau. Le routeur (lib/astrologue-routeur.ts) classifie via
 * Appel A (`topicCandidats`) ; ce module dit OU regarder : la maison du
 * domaine, son axe oppose (eclipses 4/10 pour le travail), le milieu du ciel
 * pour la carriere, le seigneur du signe qui tient cette maison.
 *
 * Mesure du 17/09/2026 : une question « quand ca va bouger au travail »
 * recevait « rien de net sur le travail, c est la communication » alors que
 * la personne etait en annee de maison 10, Lune natale en 10, et ZR L3 en
 * pic. Le trou n etait pas le moteur — c etait de ne pas ouvrir les
 * techniques du domaine demande.
 *
 * La bijection topic → maison est recopiee de lib/silence.ts (TOPIC_DE_MAISON).
 * On ne l importe pas : ce fichier doit rester chargeable hors Next (le
 * controle scripts/verifier-astrologue-techniques.mjs), et silence.ts tire
 * maison-du-boudin. Douze entrees, verifiees par ce controle.
 */

export type TopicMaison =
  | "identity" | "money" | "communication" | "home" | "creativity" | "health"
  | "relationships" | "transformation" | "philosophy" | "career" | "community" | "solitude";

const MAISON_DE_TOPIC: Readonly<Record<TopicMaison, number>> = {
  identity: 1, money: 2, communication: 3, home: 4, creativity: 5, health: 6,
  relationships: 7, transformation: 8, philosophy: 9, career: 10, community: 11, solitude: 12,
};

export const SIGNES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export type Signe = (typeof SIGNES)[number];

/** Seigneurs traditionnels (domicile). Scorpio → Mars, Aquarius → Saturn. */
export const SEIGNEUR_DU_SIGNE: Readonly<Record<Signe, string>> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

const ALIAS_POINTS: Readonly<Record<string, string>> = {
  moon: "Moon",
  lune: "Moon",
  sun: "Sun",
  soleil: "Sun",
  mercury: "Mercury",
  mercure: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  saturne: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
  pluton: "Pluto",
  mc: "MC",
  midheaven: "MC",
  "medium coeli": "MC",
  "medium-coeli": "MC",
  asc: "Ascendant",
  as: "Ascendant",
  ascendant: "Ascendant",
  ic: "IC",
  "imum coeli": "IC",
  desc: "Descendant",
  descendant: "Descendant",
  dsc: "Descendant",
};

/** Maison opposee : l axe que les eclipses activent par paires. */
export function maisonOpposee(maison: number): number {
  return ((maison + 5) % 12) + 1;
}

export function maisonsPourTopics(topics: TopicMaison[]): number[] {
  const vues = new Set<number>();
  for (const t of topics) {
    const h = MAISON_DE_TOPIC[t];
    if (typeof h === "number") vues.add(h);
  }
  return [...vues];
}

/** Maisons du domaine + axe oppose, pour les eclipses. */
export function maisonsEtAxe(maisons: number[]): number[] {
  const vues = new Set<number>();
  for (const h of maisons) {
    vues.add(h);
    vues.add(maisonOpposee(h));
  }
  return [...vues];
}

export function normaliserSigne(valeur: string | null | undefined): Signe | null {
  if (!valeur) return null;
  const propre = valeur.trim();
  const exact = SIGNES.find((s) => s.toLowerCase() === propre.toLowerCase());
  return exact ?? null;
}

export function seigneurDuSigne(signe: string | null | undefined): string | null {
  const s = normaliserSigne(signe);
  return s ? SEIGNEUR_DU_SIGNE[s] : null;
}

export function normaliserPointNatal(valeur: string | null | undefined): string | null {
  if (!valeur) return null;
  const cle = valeur.trim().toLowerCase();
  return ALIAS_POINTS[cle] ?? valeur.trim();
}

/**
 * Signe d une maison, connaissant le signe et le numero de la maison annuelle
 * (profection). Les maisons avancent en signes entiers.
 */
export function signeDeMaison(
  maison: number,
  maisonAnnuelle: number,
  signeAnnuel: string,
): Signe | null {
  const s = normaliserSigne(signeAnnuel);
  if (!s || maison < 1 || maison > 12 || maisonAnnuelle < 1 || maisonAnnuelle > 12) {
    return null;
  }
  const idx = SIGNES.indexOf(s);
  const delta = maison - maisonAnnuelle;
  return SIGNES[(idx + delta + 120) % 12];
}

/** Prochaine annee (0 = celle-ci) ou la profection annuelle tombe sur `cible`. */
export function anneesAvantMaison(maisonActuelle: number, cible: number): number {
  if (maisonActuelle < 1 || maisonActuelle > 12 || cible < 1 || cible > 12) return -1;
  return (cible - maisonActuelle + 12) % 12;
}

/**
 * Maison de la profection mensuelle : elle avance d une maison par mois depuis
 * l anniversaire. `moisDepuisAnniversaire` = 0 le mois d anniversaire.
 */
export function maisonMensuelle(maisonAnnuelle: number, moisDepuisAnniversaire: number): number {
  if (maisonAnnuelle < 1 || maisonAnnuelle > 12) return -1;
  const mois = ((Math.floor(moisDepuisAnniversaire) % 12) + 12) % 12;
  return ((maisonAnnuelle - 1 + mois) % 12) + 1;
}

/** Mois (0-11 depuis l anniversaire) ou la mensuelle atteint `cible`. */
export function moisAvantMaisonMensuelle(maisonAnnuelle: number, cible: number): number {
  if (maisonAnnuelle < 1 || maisonAnnuelle > 12 || cible < 1 || cible > 12) return -1;
  return (cible - maisonAnnuelle + 12) % 12;
}

/**
 * Un transit touche le domaine si le point natal vise vit dans une des
 * maisons, si c est un angle de ce domaine (MC = carriere), ou si c est un
 * passage par la maison elle-meme.
 */
export function transitToucheMaisons(input: {
  natalPoint?: string | null;
  natalHouseDuPoint?: number | null;
  houseTransitNumber?: number | null;
  maisons: number[];
}): boolean {
  const maisons = new Set(input.maisons);
  if (input.houseTransitNumber && maisons.has(input.houseTransitNumber)) return true;
  if (input.natalHouseDuPoint && maisons.has(input.natalHouseDuPoint)) return true;

  const point = normaliserPointNatal(input.natalPoint);
  if (!point) return false;
  if (point === "MC" && maisons.has(10)) return true;
  if (point === "IC" && maisons.has(4)) return true;
  if (point === "Ascendant" && maisons.has(1)) return true;
  if (point === "Descendant" && maisons.has(7)) return true;
  return false;
}

/** Eclipse sur l axe du domaine (ex. 4-10 pour le travail). */
export function eclipseToucheAxe(input: {
  axis?: string | null;
  houses?: number[] | null;
  maisons: number[];
}): boolean {
  const maisons = new Set(input.maisons);
  if (input.houses) {
    for (const h of input.houses) {
      if (maisons.has(h)) return true;
    }
  }
  const axis = input.axis ?? "";
  const nums = [...axis.matchAll(/\d{1,2}/g)].map((m) => Number(m[0]));
  return nums.some((n) => maisons.has(n));
}

/**
 * Entre quels passages on se trouve. `passages` dates ISO triees.
 * Retourne { apres: 3, avant: 4 } pour « between the 3rd and 4th ».
 */
export function positionDansLesPassages(
  aujourdhui: string,
  passages: string[],
): { apres: number; avant: number | null; prochain: string | null } | null {
  if (passages.length === 0) return null;
  const jour = aujourdhui.slice(0, 10);
  const tries = [...passages].map((d) => d.slice(0, 10)).sort();
  let apres = 0;
  for (const d of tries) {
    if (d <= jour) apres += 1;
    else break;
  }
  if (apres === 0) return { apres: 0, avant: 1, prochain: tries[0] };
  if (apres >= tries.length) return { apres: tries.length, avant: null, prochain: null };
  return { apres, avant: apres + 1, prochain: tries[apres] };
}

/** Annees personnelles / mois numerologiques souvent « favorables » a agir. */
export const NUMEROS_FAVORABLES = new Set([1, 5, 8]);

export function numeroFavorable(n: number | null | undefined): boolean {
  return typeof n === "number" && NUMEROS_FAVORABLES.has(n);
}
