/**
 * LA REGLE DE SILENCE — le portier unique.
 *
 * REPORTING-REGLES.md : « On ne parle que quand plusieurs techniques
 * independantes pointent la meme maison sur la meme fenetre. »
 *
 * Ce fichier ne calcule AUCUNE astrologie. Il ne fait que trois choses sur des
 * valeurs deja produites par le moteur de Marie-Ange :
 *   1. donner a chaque boudin sa FENETRE (celle du moteur, jamais inventee) ;
 *   2. donner a chaque boudin sa FAMILLE de technique (regroupement, pas calcul) ;
 *   3. COMPTER les familles distinctes qui pointent la meme maison au meme moment.
 *
 * La maison vient de lib/maison-du-boudin.ts, qui relit `periodHousePlacement`,
 * `profectedHouse`, `natalPoint`+`nh`. Zero appel reseau supplementaire.
 *
 * ─── LES CHIFFRES QUI ONT SERVI A CALIBRER, MESURES LE 02/09/2026 ───────────
 *
 * Sur le theme de reference (1985-04-12 08:30 Europe/Brussels), toctoc-app-short
 * rend 2022 boudins couvrant 1985-03-29 → 2085-04-21, soit 36 549 jours.
 * Couverture = fraction des jours ou au moins une carte existerait :
 *
 *   K=2, sans regle fond/declencheur ............ 26,5 %  (380 fenetres)
 *   K=2, avec regle fond/declencheur ............  7,8 %  (137 fenetres, 1,4/an)
 *   K=3, avec regle fond/declencheur ............  0,4 %  (10 fenetres en 100 ans)
 *
 * K=3 est inexploitable : dix fenetres dans une vie. K=2 seul depasse la barre
 * des 30 % annoncee comme plafond. C est la regle fond+declencheur qui fait le
 * travail, pas le seuil.
 */

import { type Referentiel, maisonDuBoudin } from "./maison-du-boudin";

/** Nombre de techniques INDEPENDANTES exigees pour qu une carte existe. */
export const SEUIL_TECHNIQUES = 2;

/**
 * La coupure fond / declencheur, lue dans l histogramme des durees du moteur.
 *
 * Durees rendues par toctoc-app-short, en jours, comptage exact :
 *   5:89  6:15  9:3  11:17  14:1  15:641  24:1  29:338  31:409  34:1  41:1
 *   43:70 | 51:347 | 61:2  106:1  121:1  196:1  241:5  361:31  451:5 ... 811:3
 *
 * Deux bandes VIDES : 44-50 et 52-60. Les seuils ci-dessous tombent dedans,
 * donc aucun boudin mesure ne change de camp si on les bouge de quelques jours.
 * Mesure de sensibilite : 31 j → 7,1 % ; 45 j → 7,8 % ; 60 j → 15,3 %.
 * Le saut a 60 j vient des 347 chapitres ZR L3 de 51 jours qui deviendraient
 * des « declencheurs » alors qu ils ne datent rien a mieux de sept semaines.
 */
export const SEUIL_DECLENCHEUR_JOURS = 45;
export const SEUIL_FOND_JOURS = 60;

/**
 * Part de la duree du plus court participant que l intersection doit couvrir.
 * A 0, deux fenetres qui se frolent d un jour comptent comme un accord.
 * Mesure : 0 → 8,2 % ; 0,5 → 7,8 % ; 1 → 6,5 %. Le reglage est plat, on prend
 * la moitie : le declencheur doit etre a moitie DEDANS, pas a cheval sur le bord.
 */
export const RECOUVREMENT_MINIMAL = 0.5;

/**
 * Tolerance appliquee aux categories que toctoc-year rend en evenement PONCTUEL
 * (startDate === endDate). Ce ne sont pas des nombres inventes : c est la
 * fenetre que le MEME moteur donne pour le MEME objet dans toctoc-app-short.
 *
 * Verifie le 02/09/2026, par appariement sur groupId :
 *   station_Venus_SD_Venus   year 2025-03-02 → court 2025-02-28 / 2025-03-04  (±2 j)
 *   eclipse_5-11_2026        year 2027-02-06 → court 2027-01-30 / 2027-02-13  (±7 j)
 *   Saturn_square_Uranus     year windowStart/End 2025-01-28 / 2025-02-11
 *                                     === court 2025-01-28 / 2025-02-11       (exact)
 * Et sur les 2022 boudins du paquet long : eclipse = 14 j (216/216),
 * station = 4 j (89/89). Ces largeurs sont des constantes du moteur.
 *
 * Les autres categories n en ont pas besoin : elles portent `windowStart` /
 * `windowEnd` dans toctoc-year (transit, anniversary, profection_year_change,
 * monthly_profection_loy_hit, firdaria_major_change — verifie 02/09/2026).
 */
export const TOLERANCE_JOURS: Readonly<Record<string, number>> = {
  eclipse: 7,
  station: 2,
};

/** Le zodiaque, pour l inversion topic → maison. Bijection verifiee 12/12. */
export const TOPIC_DE_MAISON: Readonly<Record<number, string>> = {
  1: "identity", 2: "money", 3: "communication", 4: "home", 5: "creativity",
  6: "health", 7: "relationships", 8: "transformation", 9: "philosophy",
  10: "career", 11: "community", 12: "solitude",
};

const MAISON_DE_TOPIC: Readonly<Record<string, number>> = Object.fromEntries(
  Object.entries(TOPIC_DE_MAISON).map(([h, t]) => [t, Number(h)]),
);

const JOUR = 86_400_000;
export const enJours = (iso: string): number =>
  Math.round(new Date(`${iso.slice(0, 10)}T00:00:00Z`).getTime() / JOUR);
export const enIso = (n: number): string => new Date(n * JOUR).toISOString().slice(0, 10);

// ───────────────────────────────────────────────────────────────────────────
// L INDEPENDANCE
// ───────────────────────────────────────────────────────────────────────────
//
// Deux boudins comptent pour DEUX techniques seulement si leurs horloges sont
// differentes. Quatre regroupements, chacun adosse a un fait mesure :
//
//  a. ZR L2 et ZR L3 sont EMBOITES — le L3 est une subdivision du L2, meme lot,
//     meme signe. Mesure : `convergence.events` de toctoc-boudin-detail liste
//     tt_895 (L2 Pisces Fortune) ET tt_896 (L3 Pisces Fortune) comme deux
//     evenements distincts. Les compter deux fois, c est compter deux fois la
//     meme chose. La famille est donc le LOT (fortune / spirit / eros), pas le
//     niveau. Trois lots = trois series, chacune partant d un point different.
//
//  b. Une STATION de Mercure et un TRANSIT de Mercure, c est le meme corps sur
//     la meme orbite. Famille commune : le corps en transit.
//
//  c. Les ECLIPSES se produisent AUX NOEUDS. Un transit de Noeud Nord et une
//     eclipse ne sont pas deux temoins : c est le meme cycle draconitique.
//     Famille commune « nodal ». Mesure : 216 eclipses + 107 transits de noeud
//     sur la vie, tous rabattus sur une seule famille.
//
//  d. PROFECTION annuelle, ANNIVERSAIRE et PROFECTION MENSUELLE sortent tous
//     du meme compteur d annees. Mesure : `anniversary` et
//     `profection_year_change` portent le MEME `profectedHouse` (5) et la meme
//     `windowStart` (2025-04-05) — un seul fait, rendu deux fois. Famille
//     commune « profection ».
//
// Ce qui reste independant : zr:fortune, zr:spirit, zr:eros, profection,
// nodal, firdaria, et un transit par corps (Saturn, Jupiter, Uranus, Neptune,
// Pluto, Mercury, Venus, Mars, Sun, Moon). Soit au plus 16 familles.

const NOEUDS = new Set(["North Node", "South Node"]);

export type Famille = string;

interface BoudinConvergence {
  id?: string;
  category?: string;
  cat?: string;
  lotType?: string | string[] | null;
  transitPlanet?: string | null;
  tp?: string | null;
  startDate?: string;
  endDate?: string | null;
  windowStart?: string | null;
  windowEnd?: string | null;
  s?: string;
  e?: string;
  score?: number;
  sc?: number;
  type?: string;
  label?: string;
  lbl?: string;
}

const categorieDe = (b: BoudinConvergence) => b.category ?? b.cat ?? "";
const planeteDe = (b: BoudinConvergence) => b.transitPlanet ?? b.tp ?? null;

/**
 * Toutes les familles d un boudin. Un boudin ZR fusionne par le moteur porte
 * plusieurs lots (`lotType: ["fortune","eros"]`, mesure : 9 combinaisons
 * distinctes sur 884 boudins ZR). Chacun est une serie reelle et separee.
 * MAIS voir `AUTORISER_MULTI_LOT` : par defaut on n en garde qu un, parce qu un
 * boudin unique ne doit pas suffire a se donner raison a lui-meme.
 */
export function famillesDe(b: BoudinConvergence): Famille[] {
  const cat = categorieDe(b);
  switch (cat) {
    case "zr": {
      const lots = Array.isArray(b.lotType) ? b.lotType : b.lotType ? [b.lotType] : [];
      return lots.length ? lots.map((l) => `zr:${l}`) : ["zr:?"];
    }
    case "eclipse":
      return ["nodal"];
    case "transit": {
      const p = planeteDe(b);
      if (!p) return [];
      return [NOEUDS.has(p) ? "nodal" : `tr:${p}`];
    }
    case "station": {
      const p = planeteDe(b);
      return p ? [`tr:${p}`] : [];
    }
    case "profection_year_change":
    case "anniversary":
    case "monthly_profection_loy_hit":
      return ["profection"];
    case "firdaria_major_change":
      return ["firdaria"];
    default:
      return [];
  }
}

/**
 * Un boudin ZR fusionne (deux lots dans le meme objet) suffit-il a former une
 * convergence a lui tout seul ? Mesure : l autoriser fait passer la couverture
 * de 20,0 % a 26,5 % a K=2. On refuse : un accord doit se lire sur DEUX objets
 * que le moteur a rendus separement, sinon on compte une ligne d affichage
 * pour une preuve.
 */
export const AUTORISER_MULTI_LOT = false;

// ───────────────────────────────────────────────────────────────────────────
// LA FENETRE
// ───────────────────────────────────────────────────────────────────────────

/**
 * La fenetre du moteur, jamais une fenetre fabriquee.
 * Ordre de preference, chacun verifie present le 02/09/2026 :
 *   1. `windowStart` / `windowEnd` (toctoc-year : transit 13/13, anniversary
 *      3/3, profection 3/3, monthly 3/3, firdaria 1/1) ;
 *   2. `s` / `e` (toctoc-app-short : 2022/2022) ;
 *   3. `startDate` / `endDate` ;
 *   4. si la duree obtenue est plus courte que la fenetre que le moteur donne
 *      ailleurs pour cette categorie (TOLERANCE_JOURS), on l elargit A CETTE
 *      LARGEUR-LA, centree sur la date exacte.
 *
 * Ne JAMAIS appliquer ici les ±21 / ±45 jours de lib/momentum-adapter.ts:91-98 :
 * ces deux nombres n existent nulle part dans le moteur. Mesure du 02/09 :
 * Saturne carre Uranus natal, fenetre reelle 2025-01-28 → 2025-02-11 (14 j),
 * fenetre fabriquee par l adaptateur 42 j. Rapport 3.
 */
export function fenetreDe(b: BoudinConvergence): { debut: number; fin: number; estimee: boolean } {
  const dISO = b.windowStart ?? b.s ?? b.startDate;
  const fISO = b.windowEnd ?? b.e ?? b.endDate ?? dISO;
  if (!dISO) return { debut: NaN, fin: NaN, estimee: true };
  let debut = enJours(dISO);
  let fin = enJours(fISO ?? dISO);
  if (fin < debut) [debut, fin] = [fin, debut];
  const tol = TOLERANCE_JOURS[categorieDe(b)];
  let estimee = false;
  if (tol != null && fin - debut < 2 * tol) {
    const centre = Math.round((debut + fin) / 2);
    debut = centre - tol;
    fin = centre + tol;
    estimee = true; // largeur du moteur, centre du moteur — mais pas rendue telle quelle
  }
  return { debut, fin, estimee };
}

// ───────────────────────────────────────────────────────────────────────────
// LE VOTE
// ───────────────────────────────────────────────────────────────────────────

export interface Vote {
  boudinId: string;
  categorie: string;
  famille: Famille;
  maison: number;
  debut: number;
  fin: number;
  /** Duree en jours, bornes incluses. Sert a separer fond et declencheur. */
  duree: number;
  /** L echelle « toc » du moteur, 1 a 4. JAMAIS `intensityScore`. */
  niveau: number;
  etiquette: string;
  /** false = maison deduite par convention, ne compte pas dans la Force. */
  donneeDuMoteur: boolean;
  fenetreElargie: boolean;
}

/**
 * INTERDIT D ADDITIONNER LES `intensityScore`.
 *
 * Mesure du 02/09/2026, meme reponse HTTP, meme personne :
 *   zr                     20 … 60
 *   transit           -58 500 … +29 400   (et 17 640 pour le boudin focal de
 *                                          toctoc-boudin-detail, -5 460 pour un
 *                                          Saturne carre Uranus)
 *   eclipse                94 … 187
 *   station                     20
 *   profection / monthly        10
 *   anniversary                 20
 *
 * Quatre echelles sans unite commune, dont une signee. Les additionner, les
 * moyenner, les comparer, ou en tirer un « score de la fenetre » produit un
 * nombre que le moteur n a jamais calcule — la premiere classe de bug.
 *
 * Le SEUL champ comparable entre categories est `score` (`sc` dans le format
 * court) : 1 a 4, verifie sur les 8 categories, et c est exactement ce que le
 * moteur ecrit en toutes lettres dans `label` (« toc », « toc toc »,
 * « toc toc toc ») et dans `w` (thin / medium / large). Mesure : 199 boudins a
 * sc=1, 1312 a sc=2, 445 a sc=3, 66 a sc=4 ; correspondance sc↔w parfaite.
 *
 * On ne s en sert que pour ORDONNER deux fenetres a egalite de Force, jamais
 * pour fabriquer une intensite.
 */
export function niveauDe(b: BoudinConvergence): number {
  const n = b.score ?? b.sc;
  return typeof n === "number" && n >= 1 && n <= 4 ? n : 1;
}

export function votesDepuisBoudins(
  boudins: BoudinConvergence[],
  ref: Referentiel | null,
  options: { compterConventions?: boolean } = {},
): Vote[] {
  const votes: Vote[] = [];
  for (const b of boudins) {
    const familles = famillesDe(b);
    if (familles.length === 0) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = maisonDuBoudin(b as any, ref);
    if (r.maison == null) continue;
    if (!r.donneeDuMoteur && !options.compterConventions) continue;
    const { debut, fin, estimee } = fenetreDe(b);
    if (!Number.isFinite(debut)) continue;
    const retenues = AUTORISER_MULTI_LOT ? familles : familles.slice(0, 1);
    for (const famille of retenues) {
      votes.push({
        boudinId: b.id ?? `${categorieDe(b)}:${debut}`,
        categorie: categorieDe(b),
        famille,
        maison: r.maison,
        debut,
        fin,
        duree: fin - debut + 1,
        niveau: niveauDe(b),
        etiquette: b.type ?? b.label ?? b.lbl ?? "",
        donneeDuMoteur: r.donneeDuMoteur,
        fenetreElargie: estimee,
      });
    }
  }
  return votes;
}

// ───────────────────────────────────────────────────────────────────────────
// LE CHEVAUCHEMENT
// ───────────────────────────────────────────────────────────────────────────

export interface FenetreDAccord {
  maison: number;
  debut: number;
  fin: number;
  /** Nombre de familles distinctes. C est la « Force » de la carte. */
  force: number;
  /** Un participant par famille : le plus court, celui qui date la fenetre. */
  participants: Vote[];
  declencheur: Vote;
  fond: Vote;
  /** Vrai si au moins un participant a une fenetre elargie par TOLERANCE_JOURS. */
  approximee: boolean;
}

/**
 * BALAYAGE — pourquoi pas une intersection naive.
 *
 * Les durees vont de 0 jour (eclipse, anniversaire dans toctoc-year) a 4 018
 * jours (firdaria). Une intersection naive a trois defauts mesures :
 *
 *  1. elle rend VRAI pour un evenement ponctuel qui tombe le dernier jour d une
 *     periode de 600 jours — un artefact de bord, pas un accord ;
 *  2. elle rend FAUX pour une eclipse dont le moteur dit lui-meme, dans l autre
 *     paquet, qu elle agit sur 14 jours ;
 *  3. elle ne dit rien de la fenetre a AFFICHER : l intersection d une
 *     profection de 365 jours et d une station de 4 jours, c est 4 jours, et
 *     c est cette fenetre-la qui repond a « Quand ».
 *
 * D ou trois regles, dans cet ordre :
 *
 *  A. chaque vote est d abord porte a la largeur que le moteur lui donne
 *     (fenetreDe) — l eclipse ponctuelle devient ±7 jours, la station ±2 ;
 *  B. la fenetre d accord est l INTERSECTION, donc toujours pilotee par le plus
 *     court : c est la date la plus precise que les techniques permettent ;
 *  C. cette intersection doit valoir au moins RECOUVREMENT_MINIMAL de la duree
 *     du plus court participant. Sinon le declencheur n est pas dans la periode,
 *     il l effleure.
 *
 * Et la regle qui fait vraiment le tri :
 *
 *  D. il faut au moins un FOND (>= SEUIL_FOND_JOURS) et au moins un
 *     DECLENCHEUR (<= SEUIL_DECLENCHEUR_JOURS). Deux chapitres de 600 jours qui
 *     se recouvrent ne datent rien : ils decrivent la meme annee deux fois.
 *     Deux transits de 14 jours ne disent pas de quoi il s agit : ils n ont pas
 *     de fond. Mesure : cette seule regle fait tomber la couverture de 20,0 %
 *     a 7,8 % a K=2, sans toucher au seuil.
 */
export function fenetresDeConvergence(
  votes: Vote[],
  options: {
    seuil?: number;
    exigerFondEtDeclencheur?: boolean;
    recouvrementMinimal?: number;
  } = {},
): FenetreDAccord[] {
  const seuil = options.seuil ?? SEUIL_TECHNIQUES;
  const exiger = options.exigerFondEtDeclencheur ?? true;
  const recouvrement = options.recouvrementMinimal ?? RECOUVREMENT_MINIMAL;

  const parMaison = new Map<number, Vote[]>();
  for (const v of votes) {
    const l = parMaison.get(v.maison) ?? [];
    l.push(v);
    parMaison.set(v.maison, l);
  }

  const sorties: FenetreDAccord[] = [];
  for (const [maison, liste] of parMaison) {
    // Bornes elementaires : chaque debut, et chaque lendemain de fin.
    const bornes = [...new Set(liste.flatMap((v) => [v.debut, v.fin + 1]))].sort((a, b) => a - b);
    let courante: FenetreDAccord | null = null;
    for (let i = 0; i < bornes.length - 1; i++) {
      const a = bornes[i];
      const z = bornes[i + 1] - 1;
      const actifs = liste.filter((v) => v.debut <= a && v.fin >= z);

      // Un participant par famille : le plus court. Deux transits de Saturne
      // dans la meme fenetre = une seule voix, celle qui date le mieux.
      const parFamille = new Map<Famille, Vote>();
      for (const v of actifs) {
        const dejala = parFamille.get(v.famille);
        if (!dejala || v.duree < dejala.duree) parFamille.set(v.famille, v);
      }
      // Un meme boudin ne vote qu une fois, meme s il porte deux lots.
      const vus = new Set<string>();
      const participants = [...parFamille.values()]
        .filter((v) => (vus.has(v.boudinId) ? false : (vus.add(v.boudinId), true)))
        .sort((x, y) => x.duree - y.duree);

      let retenu = participants.length >= seuil;
      if (retenu && exiger) {
        retenu =
          participants.some((v) => v.duree <= SEUIL_DECLENCHEUR_JOURS) &&
          participants.some((v) => v.duree >= SEUIL_FOND_JOURS);
      }
      if (retenu) {
        const inter = z - a + 1;
        retenu = inter >= Math.max(1, recouvrement * participants[0].duree);
      }

      if (!retenu) {
        if (courante) { sorties.push(courante); courante = null; }
        continue;
      }
      const declencheur = participants.find((v) => v.duree <= SEUIL_DECLENCHEUR_JOURS) ?? participants[0];
      const fond = [...participants].reverse().find((v) => v.duree >= SEUIL_FOND_JOURS) ?? participants[participants.length - 1];
      const bloc: FenetreDAccord = {
        maison, debut: a, fin: z,
        force: participants.length,
        participants, declencheur, fond,
        approximee: participants.some((v) => v.fenetreElargie),
      };
      // Fusion des intervalles elementaires adjacents portant le meme jeu.
      const memeJeu =
        courante &&
        courante.fin + 1 === a &&
        courante.participants.length === bloc.participants.length &&
        courante.participants.every((v, k) => v.boudinId === bloc.participants[k].boudinId);
      if (memeJeu && courante) courante.fin = z;
      else { if (courante) sorties.push(courante); courante = bloc; }
    }
    if (courante) sorties.push(courante);
  }

  // Ordre : la Force d abord (jamais une somme), puis la precision de la date,
  // puis le niveau « toc » du declencheur. Aucun `intensityScore` n intervient.
  return sorties.sort(
    (x, y) =>
      y.force - x.force ||
      (x.fin - x.debut) - (y.fin - y.debut) ||
      y.declencheur.niveau - x.declencheur.niveau ||
      x.debut - y.debut,
  );
}

// ───────────────────────────────────────────────────────────────────────────
// LE PORTIER
// ───────────────────────────────────────────────────────────────────────────

/**
 * COMPTE, ne juge pas. Deux sources, dans cet ordre :
 *
 *  1. si le moteur a rendu un `convergence` pour ce boudin (toctoc-boudin-detail),
 *     on le RABAT sur les familles independantes — sans jamais l arrondir a la
 *     hausse. Mesure du 02/09 : `overlappingEvents: 9`, mais ces neuf
 *     evenements contiennent tt_895 (ZR L2 Fortune Pisces) ET tt_896 (ZR L3
 *     Fortune Pisces), soit la meme serie deux fois. Afficher « 9 techniques
 *     d accord » serait faux. Apres rabattement : 7 familles, et une seule
 *     partage la maison du boudin — ce que le moteur dit lui-meme avec
 *     `sameHouseEvents: 1`.
 *  2. sinon, le compte de nos propres fenetres.
 *
 * `convergence.events[]` ne porte PAS de maison — seulement `topics`, des
 * chaines. `houseTopics` de la meme reponse est une bijection maison↔topic
 * (12/12 verifie), donc l inversion est exacte et ne calcule rien.
 */
export function techniquesDAccord(
  entree:
    | { convergence?: ConvergenceMoteur | null; maison?: number | null }
    | FenetreDAccord
    | null
    | undefined,
): number {
  if (!entree) return 0;
  if ("force" in entree && typeof entree.force === "number") return entree.force;
  const conv = "convergence" in entree ? entree.convergence : null;
  const maison = "maison" in entree ? entree.maison : null;
  if (!conv || !Array.isArray(conv.events) || maison == null) return 0;
  const topicVise = TOPIC_DE_MAISON[maison];
  if (!topicVise) return 0;
  const familles = new Set<Famille>();
  for (const e of conv.events) {
    if (!e.topics?.includes(topicVise)) continue;
    for (const f of famillesDepuisEvenement(e)) familles.add(f);
  }
  return familles.size;
}

export function onParle(entree: Parameters<typeof techniquesDAccord>[0]): boolean {
  return techniquesDAccord(entree) >= SEUIL_TECHNIQUES;
}

export interface EvenementConvergence {
  id?: string;
  category?: string;
  label?: string;
  score?: number;
  summary?: string;
  topics?: string[];
}
export interface ConvergenceMoteur {
  level?: string;
  overlappingEvents?: number;
  sameHouseEvents?: number;
  events?: EvenementConvergence[];
}

/**
 * `convergence.events[]` ne porte ni `lotType` ni `transitPlanet` : le seul
 * champ exploitable est `summary` (« ZR fortune L2 », « Saturn conjunction
 * Saturn », « Mercury SR sur Mercury » — mesure sur les 9 evenements du
 * 02/09/2026). On en tire la famille par lecture, pas par devinette, et on rend
 * un identifiant OPAQUE quand on ne sait pas : un evenement non classe compte
 * pour lui-meme, jamais fusionne avec un autre, jamais eclate en deux.
 */
export function famillesDepuisEvenement(e: EvenementConvergence): Famille[] {
  const s = e.summary ?? e.label ?? "";
  const lot = /\bZR\s+(fortune|spirit|eros)\b/i.exec(s);
  if (lot) return [`zr:${lot[1].toLowerCase()}`];
  if (e.category === "eclipse" || /\bNode\b/.test(s)) return ["nodal"];
  const corps = /^([A-Z][a-z]+)\s/.exec(s);
  if ((e.category === "transit" || e.category === "station") && corps) return [`tr:${corps[1]}`];
  if (e.category === "anniversary" || e.category?.startsWith("profection") || e.category === "monthly_profection_loy_hit") return ["profection"];
  if (e.category === "firdaria_major_change") return ["firdaria"];
  return [`inconnu:${e.id ?? s}`];
}

// ───────────────────────────────────────────────────────────────────────────
// LE SILENCE
// ───────────────────────────────────────────────────────────────────────────

export type EtatDuJour =
  | { parle: true; fenetre: FenetreDAccord }
  | { parle: false; raison: "aucun-accord"; fond: Vote | null; prochaine: FenetreDAccord | null }
  | { parle: false; raison: "referentiel-indisponible" | "donnees-absentes" };

/**
 * Quand rien ne converge, l app ne montre NI une carte, NI une erreur.
 *
 * lib/momentum-store.tsx:71 fait aujourd hui
 * `if (phases.length === 0) throw new Error("No signals found")` : zero signal
 * bascule l ecran sur « connexion perdue ». C est l inverse de la regle —
 * on rapporte un succes du moteur comme une panne reseau.
 *
 * Ce que l on montre a la place, et rien d autre :
 *   - le CHAPITRE de fond en cours (le ZR L2 courant : sa maison et sa
 *     `signification`, telles que le moteur les ecrit), presente comme un decor,
 *     sans Force, sans cle d action, sans texte de modele ;
 *   - la DATE de la prochaine fenetre d accord si elle existe dans l horizon.
 *     Mesure : ecart median entre deux fenetres 102 jours, p90 914 jours,
 *     maximum 1 866 jours. Un « rien avant deux ans » est un resultat normal
 *     et doit s afficher comme tel.
 */
export function etatDuJour(
  fenetres: FenetreDAccord[],
  votes: Vote[],
  jour: number,
): EtatDuJour {
  const active = fenetres.find((f) => f.debut <= jour && f.fin >= jour);
  if (active) return { parle: true, fenetre: active };
  const fonds = votes
    .filter((v) => v.debut <= jour && v.fin >= jour && v.duree >= SEUIL_FOND_JOURS && v.famille.startsWith("zr:"))
    .sort((a, b) => b.duree - a.duree);
  const prochaine = fenetres.filter((f) => f.debut > jour).sort((a, b) => a.debut - b.debut)[0] ?? null;
  return { parle: false, raison: "aucun-accord", fond: fonds[0] ?? null, prochaine };
}
