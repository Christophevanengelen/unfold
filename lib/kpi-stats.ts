/**
 * Lecture honnete d'un petit echantillon.
 *
 * Avec quelques dizaines de personnes, « 40 % » sur 12 n'est pas un resultat :
 * c'est une piste. On affiche donc toujours le nombre brut, un intervalle de
 * Wilson a 80 %, et rien du tout sous le seuil.
 */

/** En dessous, aucun pourcentage n'est affiche. */
export const SEUIL_LECTURE = 30;

const Z_80 = 1.2816;

export type Intervalle = { bas: number; haut: number };

/** Intervalle de Wilson a 80 % pour une part k sur n. Valeurs entre 0 et 1. */
export function wilson(k: number, n: number): Intervalle | null {
  if (n <= 0 || k < 0 || k > n) return null;
  const p = k / n;
  const z2 = Z_80 * Z_80;
  const centre = (p + z2 / (2 * n)) / (1 + z2 / n);
  const marge = (Z_80 * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / (1 + z2 / n);
  return { bas: Math.max(0, centre - marge), haut: Math.min(1, centre + marge) };
}

export type Lecture =
  | { etat: "insuffisant"; k: number; n: number; manque: number }
  | { etat: "lisible"; k: number; n: number; part: number; intervalle: Intervalle };

export function lire(k: number, n: number): Lecture {
  if (n < SEUIL_LECTURE) return { etat: "insuffisant", k, n, manque: SEUIL_LECTURE - n };
  const intervalle = wilson(k, n);
  return { etat: "lisible", k, n, part: k / n, intervalle: intervalle ?? { bas: 0, haut: 1 } };
}

export function formaterPart(l: Lecture): string {
  if (l.etat === "insuffisant") return "pas assez de données";
  return `${Math.round(l.part * 100)} %`;
}

export function formaterIntervalle(l: Lecture): string {
  if (l.etat === "insuffisant") return `${l.n} sur ${SEUIL_LECTURE} requis`;
  return `entre ${Math.round(l.intervalle.bas * 100)} % et ${Math.round(l.intervalle.haut * 100)} %`;
}

/**
 * Deux parts sont discernables seulement si leurs intervalles ne se
 * chevauchent pas. Sinon on dit « ecart indiscernable du hasard ».
 */
export function discernables(a: Lecture, b: Lecture): boolean {
  if (a.etat !== "lisible" || b.etat !== "lisible") return false;
  return a.intervalle.haut < b.intervalle.bas || b.intervalle.haut < a.intervalle.bas;
}
