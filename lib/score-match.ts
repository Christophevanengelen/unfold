/**
 * La fiche de compatibilité entre deux personnes.
 *
 * ─── CE QUE LE PRODUIT VEUT ─────────────────────────────────────────────────
 *
 * Christophe, 11/09/2026 : « les gens, ce qu'ils veulent, c'est avoir un score
 * de compatibilité en testant leur dating, donc une fiche de compatibilité
 * générale plutôt que dans le temps. Tu peux laisser une indication temps si
 * elle est extrêmement pertinente. »
 *
 * Donc : un score global en tête, des axes, ce qui rassemble et ce qui
 * complète. Le moment ne passe qu'en dernier, et seulement s'il se détache.
 *
 * ─── CE QUE LE MOTEUR DONNE, MESURÉ LE 11/09/2026 ───────────────────────────
 *
 * Aucune route de synastrie n'existe côté AstroLearn : `synastry-chart`,
 * `composite-chart`, `query/relationships` répondent tous 404. Il n'y a donc
 * pas, aujourd'hui, de comparaison entre deux thèmes de naissance — ni aspects
 * croisés, ni composite. C'est demandé à Marie-Ange.
 *
 * Ce qui existe : `connection-brief` accepte DEUX NAISSANCES LIBRES (date,
 * heure, lieu, fuseau), répond en 3 s, et rend jusqu'à SIX périodes — six, quel
 * que soit le nombre de mois demandé, mesuré à 12 et à 24. Chaque période porte
 * un objet `comparaison` calculé par le moteur : domaines communs, domaines
 * propres à chacun, charge, tonalité, tempo, écart.
 *
 * Le score de cette fiche agrège ces six périodes. Ce n'est donc pas une
 * compatibilité de caractère au sens des sites d'astrologie — ça, le moteur ne
 * le calcule pas. C'est la part de terrain que deux vies partagent sur tout ce
 * qu'on peut voir d'elles. Le texte de l'écran le dit ainsi, sans jamais
 * promettre autre chose.
 *
 * ─── POURQUOI QUATRE AXES ET PAS UN SEUL CHIFFRE ────────────────────────────
 *
 * Veille du 11/09 sur Co-Star, The Pattern, Sanctuary, CHANI, Cafe Astrology,
 * TimePassages, Astrotheme, Stellium, Nebula, Astrology Zone : aucun acteur
 * crédible n'affiche un pourcentage unique nu. Les sérieux donnent un score par
 * axe, ou un nom de catégorie, ou rien. Cafe Astrology, qui publie pourtant un
 * barème : « it IS desirable to have some challenging aspects in a
 * relationship ». On garde donc le chiffre que Christophe demande — il se lit
 * et se partage — mais on l'accompagne de quatre axes qui, eux, se lisent.
 *
 * Et deux règles qui ne bougent pas : aucun nom de technique n'en sort, et le
 * mot « incompatible » n'existe pas ici. Un lien intense et rugueux n'est pas
 * un lien raté.
 */

import type { Comparaison } from "@/lib/connection-brief-api";

/** Les douze domaines, dans les mots du produit. Le mot « maison » ne sort jamais d ici. */
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

export interface Axe {
  /** 0 a 100. Les axes ne s additionnent jamais entre eux. */
  valeur: number;
  niveau: Niveau;
}

export interface Moment {
  /** Clef de mois, « 2026-11 ». */
  mois: string;
  /** Ce qui s y partage. */
  domaines: number[];
}

export interface FicheCompatibilite {
  /** Le chiffre de tete : la part de terrain partagee. */
  score: number;
  /** Les quatre axes, lus separement. */
  terrain: Axe;
  climat: Axe;
  equilibre: Axe;
  rythme: Axe;
  /** Ce qui revient le plus souvent chez les deux — ce qui vous rassemble. */
  rassemble: number[];
  /** Ce que chacun porte sans l autre — la complementarite. */
  toiSeul: number[];
  autreSeul: number[];
  /** Le meilleur mois, seulement s il se detache nettement. Sinon null. */
  moment: Moment | null;
  /** Nombre de periodes reellement mesurees. Sous 2, on n affiche pas de score. */
  mesures: number;
}

const POIDS_CHARGE: Record<Comparaison["charge"]["A"], number> = {
  vide: 0,
  leger: 34,
  charge: 67,
  pic: 100,
};

/** « mixte » n est pas la moitie d un bon climat : c est un climat qui tire dans
 *  deux sens, donc plus proche du milieu que du haut. */
const POIDS_TONALITE: Record<Comparaison["tonalite"]["A"], number> = {
  soutien: 100,
  neutre: 62,
  mixte: 45,
  friction: 22,
};

const POIDS_TEMPO: Record<Comparaison["tempo"]["A"], number> = {
  lent: 0,
  moyen: 50,
  rapide: 100,
};

function niveauDe(v: number): Niveau {
  if (v >= 67) return "fort";
  if (v >= 34) return "moyen";
  return "faible";
}

function axe(valeur: number): Axe {
  const v = Math.max(0, Math.min(100, Math.round(valeur)));
  return { valeur: v, niveau: niveauDe(v) };
}

function moyenne(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Les valeurs les plus frequentes d abord, jusqu a `max`. */
function lesPlusFrequents(compte: Map<number, number>, max: number): number[] {
  return [...compte.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, max)
    .map(([d]) => d);
}

/**
 * Agrege les periodes rendues par le moteur en une fiche.
 *
 * Rend `null` sous deux periodes mesurees : un score tire d un seul mois serait
 * un score de ce mois-la, presente comme une compatibilite. C est exactement ce
 * qu on refuse de faire.
 */
export function lireCompatibilite(
  periodes: { monthKey: string; comparaison?: Comparaison }[],
): FicheCompatibilite | null {
  const utiles = periodes.filter(
    (p): p is { monthKey: string; comparaison: Comparaison } =>
      Boolean(p.comparaison) && !p.comparaison!.silence,
  );
  if (utiles.length < 2) return null;

  const parts: number[] = [];
  const climats: number[] = [];
  const equilibres: number[] = [];
  const rythmes: number[] = [];
  const communs = new Map<number, number>();
  const propresA = new Map<number, number>();
  const propresB = new Map<number, number>();

  for (const { comparaison: c } of utiles) {
    const union = new Set([...c.domainesA, ...c.domainesB]);
    parts.push(union.size === 0 ? 0 : (c.memesDomaines.length / union.size) * 100);

    climats.push((POIDS_TONALITE[c.tonalite.A] + POIDS_TONALITE[c.tonalite.B]) / 2);

    // L equilibre : 100 quand les deux portent autant, 0 quand l un porte tout.
    // C est la seule facon honnete de dire « l un traverse beaucoup, l autre
    // rien » sans en faire un defaut de l un des deux.
    equilibres.push(100 - Math.abs(POIDS_CHARGE[c.charge.A] - POIDS_CHARGE[c.charge.B]));

    // Le rythme : meme tempo = 100. L ecart du moteur corrige a la marge, parce
    // qu il voit des choses que le tempo seul ne dit pas.
    const memeTempo = 100 - Math.abs(POIDS_TEMPO[c.tempo.A] - POIDS_TEMPO[c.tempo.B]);
    const bonus = c.ecart === "synchrone" ? 12 : c.ecart === "asymetrique" ? -12 : 0;
    rythmes.push(memeTempo + bonus);

    for (const d of c.memesDomaines) communs.set(d, (communs.get(d) ?? 0) + 1);
    for (const d of c.domainesA) if (!c.domainesB.includes(d)) propresA.set(d, (propresA.get(d) ?? 0) + 1);
    for (const d of c.domainesB) if (!c.domainesA.includes(d)) propresB.set(d, (propresB.get(d) ?? 0) + 1);
  }

  // Le moment ne s affiche que s il se detache : au moins un tiers de terrain
  // partage de plus que la moyenne, et pas le premier mois venu. Sinon, rien —
  // une « meilleure periode » qui n en est pas une serait une invention.
  const moyennePart = moyenne(parts);
  let moment: Moment | null = null;
  let meilleur = -1;
  utiles.forEach(({ monthKey, comparaison: c }, i) => {
    if (parts[i] > meilleur && parts[i] >= moyennePart * 1.33 && c.memesDomaines.length > 0) {
      meilleur = parts[i];
      moment = { mois: monthKey, domaines: [...c.memesDomaines] };
    }
  });

  return {
    score: Math.round(moyennePart),
    terrain: axe(moyennePart),
    climat: axe(moyenne(climats)),
    equilibre: axe(moyenne(equilibres)),
    rythme: axe(moyenne(rythmes)),
    rassemble: lesPlusFrequents(communs, 3),
    toiSeul: lesPlusFrequents(propresA, 2),
    autreSeul: lesPlusFrequents(propresB, 2),
    moment,
    mesures: utiles.length,
  };
}

/**
 * Une fiche d exemple, pour montrer la fonction a quelqu un qui n a encore
 * connecte personne. Elle est marquee « exemple » a l ecran : ce ne sont les
 * donnees de personne, et le produit ne presente jamais un exemple comme une
 * lecture.
 */
export const FICHE_EXEMPLE: FicheCompatibilite = {
  score: 64,
  terrain: axe(64),
  climat: axe(71),
  equilibre: axe(48),
  rythme: axe(82),
  rassemble: [3, 5, 10],
  toiSeul: [2],
  autreSeul: [4],
  moment: null,
  mesures: 6,
};
