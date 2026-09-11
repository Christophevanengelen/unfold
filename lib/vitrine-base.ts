/**
 * Ce qu on montre a quelqu un qui n a encore connecte personne.
 *
 * POURQUOI CE MODULE EXISTE
 *
 * L ecran du Match sans connexion montrait un cadre au centre qui repetait les
 * deux boutons places juste dessous, et rien d autre. Aucune promesse, aucune
 * preuve. Or c est exactement la que se joue l invitation : on ne partage pas
 * un code parce qu un ecran le demande, on le partage parce qu on a vu ce que
 * ca donne.
 *
 * Christophe : « tant que le user n invite pas une personne, on lui montre les
 * personnes qu on a en base. Mais l objectif est que le user invite ses amis. »
 * La base est donc la vitrine, pas le produit.
 *
 * CE QU ON NE PEUT PAS ENCORE FAIRE, ET POURQUOI ON NE LE FAIT PAS
 *
 * On ne montre PAS « voici qui te ressemble » : la correspondance se calcule
 * pour une naissance donnee, et les routes qui la rendent possible n acceptent
 * aujourd hui qu un identifiant de fiche — c est la demande n° 1 faite a
 * Marie-Ange. Inventer une ressemblance serait exactement ce que ce produit
 * s interdit.
 *
 * On montre donc ce qui est vrai sans elle : ce que la base contient, ce qu on
 * y mesure, et de quoi les vies documentees parlent. La promesse est tenue le
 * jour ou la route existe, et ce module n aura qu a recevoir les chiffres de
 * la personne au lieu de ceux de la base.
 *
 * D OU VIENNENT CES CHIFFRES
 *
 * De `donnees/base-familles-2026-09-02.json`, produit par la chaine complete
 * sur 39 fiches de la base de Marie-Ange, dont 30 exploitables. La methode et
 * ses limites sont ecrites dans `BASE-CORRESPONDANCE.md`. Aucun chiffre n est
 * saisi a la main ici.
 */

import familles from "@/donnees/base-familles-2026-09-02.json";

export interface FamilleBase {
  /** Le sujet dont cette famille de vies parle le plus, en francais courant. */
  sujet: string;
  /** Les noms documentes qui en font partie. */
  noms: string[];
}

export interface VitrineBase {
  /** Nombre de vies mesurees, toutes familles confondues. */
  vies: number;
  /** Les familles, de la plus peuplee a la moins peuplee. */
  familles: FamilleBase[];
  /** La part du temps ou l on parle, chez la vie mediane de la base. */
  medianeParle: number;
}

type Brut = {
  familles: Record<string, [string, number][]>;
  rarete: [number, string, number][];
};

/** Une vie peut figurer deux fois dans un paquet (deux referentiels) : on la
 *  compte une seule fois, et on garde l ordre d apparition. */
function nomsUniques(entrees: [string, number][]): string[] {
  const vus = new Set<string>();
  const out: string[] = [];
  for (const [nom] of entrees) {
    if (vus.has(nom)) continue;
    vus.add(nom);
    out.push(nom);
  }
  return out;
}

function mediane(valeurs: number[]): number {
  if (valeurs.length === 0) return 0;
  const t = [...valeurs].sort((a, b) => a - b);
  const m = Math.floor(t.length / 2);
  return t.length % 2 === 0 ? (t[m - 1] + t[m]) / 2 : t[m];
}

let cache: VitrineBase | null = null;

export function lireVitrine(): VitrineBase {
  if (cache) return cache;
  // Le JSON est type large par TypeScript (tableaux mixtes) : on passe par
  // `unknown`, et la forme est garantie par le producteur, scripts/echantillonner-base.mjs.
  const brut = familles as unknown as Brut;

  const liste: FamilleBase[] = Object.entries(brut.familles)
    .map(([sujet, entrees]) => ({ sujet, noms: nomsUniques(entrees) }))
    .sort((a, b) => b.noms.length - a.noms.length);

  const tous = new Set<string>();
  for (const f of liste) for (const n of f.noms) tous.add(n);

  cache = {
    vies: tous.size,
    familles: liste,
    medianeParle: Math.round(mediane(brut.rarete.map(([p]) => p)) * 10) / 10,
  };
  return cache;
}

/** Les initiales d un nom, pour la pastille : « Temple Grandin » → « TG ». */
export function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase() ?? "")
    .join("");
}
