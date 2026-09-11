/**
 * La fiche de match entre deux personnes.
 *
 * ─── CE QUE LE MARCHE FAIT, ET POURQUOI ON NE LE FAIT PAS ───────────────────
 *
 * Veille du 11/09/2026 sur Co-Star, The Pattern, Sanctuary, CHANI, Cafe
 * Astrology, TimePassages, Astrotheme, Stellium, Nebula, Astrology Zone.
 *
 * Aucun acteur credible n affiche un pourcentage unique de compatibilite. Les
 * serieux font l un de trois choix : un score PAR AXE sans total (Sanctuary,
 * TimePassages), un NOM de categorie sans chiffre (The Pattern, sept niveaux),
 * ou pas de score du tout (Astrology Zone, astro.com). Le pourcentage unique
 * est le marqueur des calculateurs clones et des entonnoirs de vente.
 *
 * Les astrologues eux-memes le disent. Cafe Astrology, qui publie pourtant une
 * grille de +4 a -4 : « I have always skipped past score sheets » et « it IS
 * desirable to have some challenging aspects in a relationship ». Astrotheme
 * precise que sa note dit « how smoothly your relationship is likely to
 * develop. It does not address its quality ».
 *
 * Et la recherche est plus severe encore, sans parler d astrologie : Finkel et
 * al. 2012 (Psychological Science in the Public Interest) ne trouvent aucune
 * preuve qu un algorithme d appariement fonctionne, parce que ce qui predit un
 * couple — la maniere de traverser le stress ensemble — n existe pas dans des
 * donnees collectees avant la rencontre. Joel, Eastwick & Finkel 2017 : plus de
 * cent mesures par personne, et le modele ne predit presque rien de l attirance
 * d une personne precise pour une autre.
 *
 * ─── CE QU ON FAIT A LA PLACE ───────────────────────────────────────────────
 *
 * Un chiffre, oui — Christophe le demande et il a raison, un chiffre se lit et
 * se partage. Mais un chiffre DATE, qui ne dit jamais si deux personnes se
 * conviennent :
 *
 *   « Ce mois-ci, vous etes sur le meme terrain a 72 % »
 *   et non « vous etes compatibles a 72 % ».
 *
 * Le premier se verifie, change le mois suivant, et n exclut personne. Le
 * second est un verdict sur des gens. C est toute la difference, et c est le
 * terrain que The Pattern a nomme sans jamais l outiller : chacune de leurs
 * sept categories se termine par « sauf si le timing est mauvais entre vous ».
 *
 * Trois choses qu aucun concurrent ne fait, et qui viennent de nos donnees :
 *
 *  1. DEUX AXES SEPARES, jamais additionnes. L intensite (a quel point ce mois
 *     vous remue tous les deux) et l aisance (a quel point il est simple). Un
 *     lien fort et rugueux n est pas un lien rate — c est l observation de Cafe
 *     Astrology, que personne n a mise a l ecran.
 *  2. L ASYMETRIE. Ce que A vit avec B n est pas ce que B vit avec A. Aucun
 *     produit du marche n ecrit deux lectures differentes pour un meme lien.
 *  3. LA DATE. Le score porte un mois, il est vrai ce mois-la, et il bouge.
 *
 * ─── D OU VIENNENT LES CHIFFRES ─────────────────────────────────────────────
 *
 * De `Comparaison`, calcule par le moteur de Marie-Ange (couche 3, 02/09/2026)
 * et rendu par `connection-brief` sur chaque periode. On ne compare rien
 * nous-memes, on ne recalcule rien : on met en forme ce que le moteur dit.
 *
 * Aucun mot de technique n en sort : ni planete, ni aspect, ni maison — c est
 * une regle du produit, voir REPORTING-REGLES.md.
 */

import type { Comparaison } from "@/lib/connection-brief-api";

/** Les douze domaines, dans les mots du produit. La clef est la maison, mais
 *  ce mot ne sort jamais d ici. */
export const DOMAINE: Record<number, string> = {
  1: "domaine.identite",
  2: "domaine.argent",
  3: "domaine.proches",
  4: "domaine.foyer",
  5: "domaine.creation",
  6: "domaine.sante",
  7: "domaine.couple",
  8: "domaine.partage",
  9: "domaine.idees",
  10: "domaine.metier",
  11: "domaine.amis",
  12: "domaine.retrait",
};

export type Niveau = "fort" | "moyen" | "faible";

export interface AxeMatch {
  /** 0 a 100. Jamais additionne a un autre axe. */
  valeur: number;
  niveau: Niveau;
}

export interface LectureUne {
  /** Ce que cette personne-ci porte ce mois : vide, leger, charge, pic. */
  charge: Comparaison["charge"]["A"];
  /** Soutien, mixte, friction, neutre. */
  tonalite: Comparaison["tonalite"]["A"];
  tempo: Comparaison["tempo"]["A"];
  /** Les domaines qui lui sont propres ce mois — ce que l autre ne vit pas. */
  domainesPropres: number[];
}

export interface FicheMatch {
  /** Le mois que cette fiche decrit. Un score sans sa date est un verdict. */
  mois: string;
  /** Terrain commun, en pourcentage des domaines ouverts chez l un ou l autre. */
  terrainCommun: number;
  /** Les domaines partages ce mois. */
  communs: number[];
  /** A quel point ce mois remue les deux. Ne se confond pas avec l aisance. */
  intensite: AxeMatch;
  /** A quel point il est simple. Un lien intense peu aise reste un lien fort. */
  aisance: AxeMatch;
  /** Synchrone, decale, asymetrique — le rythme, pas la qualite. */
  ecart: Comparaison["ecart"];
  /** La lecture de chacun, differente par construction. */
  toi: LectureUne;
  autre: LectureUne;
  /** Vrai : le moteur n a rien de solide a dire. On se tait, on n invente pas. */
  silence: boolean;
}

const POIDS_CHARGE: Record<Comparaison["charge"]["A"], number> = {
  vide: 0,
  leger: 34,
  charge: 67,
  pic: 100,
};

/** Le confort de chacun. « mixte » n est pas la moitie d un bon mois : c est un
 *  mois qui tire dans deux sens, donc plus proche du milieu que du haut. */
const POIDS_TONALITE: Record<Comparaison["tonalite"]["A"], number> = {
  soutien: 100,
  neutre: 62,
  mixte: 45,
  friction: 22,
};

function niveauDe(v: number): Niveau {
  if (v >= 67) return "fort";
  if (v >= 34) return "moyen";
  return "faible";
}

function axe(valeur: number): AxeMatch {
  const v = Math.max(0, Math.min(100, Math.round(valeur)));
  return { valeur: v, niveau: niveauDe(v) };
}

/**
 * Met en forme la comparaison du moteur. Rend `null` si la comparaison manque :
 * une fiche sans donnees serait une fiche inventee.
 */
export function lireFiche(
  comparaison: Comparaison | undefined,
  mois: string,
): FicheMatch | null {
  if (!comparaison) return null;

  const { memesDomaines, domainesA, domainesB, charge, tonalite, tempo, ecart, silence } =
    comparaison;

  // Le terrain commun se mesure sur l union de ce qui est ouvert chez l un ou
  // chez l autre — pas sur douze domaines fixes, dont la plupart sont fermes
  // chez tout le monde ce mois-ci. Un denominateur qui ne bouge jamais rendrait
  // tous les scores faibles et tous les mois identiques.
  const union = new Set([...domainesA, ...domainesB]);
  const terrainCommun = union.size === 0 ? 0 : Math.round((memesDomaines.length / union.size) * 100);

  // L intensite est la charge des DEUX : un mois ou l un traverse tout et
  // l autre rien n est un mois intense pour un seul, et la fiche doit le dire
  // par l asymetrie, pas par une moyenne qui l efface.
  const intensite = axe((POIDS_CHARGE[charge.A] + POIDS_CHARGE[charge.B]) / 2);
  const aisance = axe((POIDS_TONALITE[tonalite.A] + POIDS_TONALITE[tonalite.B]) / 2);

  const propres = (mien: number[], sien: number[]) => mien.filter((d) => !sien.includes(d));

  return {
    mois,
    terrainCommun,
    communs: [...memesDomaines],
    intensite,
    aisance,
    ecart,
    toi: {
      charge: charge.A,
      tonalite: tonalite.A,
      tempo: tempo.A,
      domainesPropres: propres(domainesA, domainesB),
    },
    autre: {
      charge: charge.B,
      tonalite: tonalite.B,
      tempo: tempo.B,
      domainesPropres: propres(domainesB, domainesA),
    },
    silence,
  };
}

/**
 * Une fiche d exemple, pour montrer la fonction a quelqu un qui n a encore
 * connecte personne. Elle est marquee comme exemple a l ecran : ce ne sont les
 * donnees de personne, et le produit ne presente jamais un exemple comme une
 * lecture.
 */
export const FICHE_EXEMPLE: FicheMatch = {
  mois: "",
  terrainCommun: 60,
  communs: [3, 10],
  intensite: axe(83),
  aisance: axe(53),
  ecart: "decale",
  toi: { charge: "pic", tonalite: "mixte", tempo: "lent", domainesPropres: [2] },
  autre: { charge: "charge", tonalite: "soutien", tempo: "rapide", domainesPropres: [4] },
  silence: false,
};
