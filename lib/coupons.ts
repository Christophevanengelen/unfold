/**
 * Les codes d acces au graphique de vie.
 *
 * Ce fichier existe parce que la meme fonction etait recopiee dans trois
 * fichiers — app/unlock, l ecran de prix et le teaser du site — et que les
 * trois se trompaient de la meme facon.
 *
 * L ETAT REEL, constate le 01/09/2026 : NEXT_PUBLIC_CHART_COUPONS n est defini
 * dans AUCUN environnement Vercel. La liste des codes valides est donc vide
 * partout, et les trois champs refusent tous les codes, tout le temps.
 *
 * Le probleme n est pas qu ils refusent, c est CE QU ILS DISENT en refusant :
 * « Invalid code — check spelling and try again. » Quelqu un a qui on a donne
 * un code s entend repondre qu il l a mal tape, reessaie, et se croit fautif.
 * L application accuse la personne d une panne qui lui appartient.
 *
 * D ou les trois etats distincts ci-dessous : « inactif » n est pas « inconnu »,
 * et la personne merite de savoir lequel des deux la concerne.
 *
 * Note pour plus tard : le prefixe NEXT_PUBLIC_ met la valeur dans le paquet
 * javascript envoye a chaque visiteur. Si des codes sont un jour definis ainsi,
 * n importe qui pourra les lire dans les outils de developpement du navigateur.
 * Un code distribue a quelques proches ne doit pas passer par une variable
 * NEXT_PUBLIC_ ; il faut une verification cote serveur.
 */

export type EtatCode = "ok" | "inconnu" | "inactif";

export const CLE_ACCES = "unfold_chart_access";

/** Les codes acceptes. Vide tant que la variable n est pas definie. */
export function codesValides(): string[] {
  const brut = process.env.NEXT_PUBLIC_CHART_COUPONS ?? "";
  return brut
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
}

/**
 * Ce que vaut un code saisi. « inactif » veut dire qu aucun code n existe dans
 * cet environnement : ce n est pas la faute de la personne, et on ne doit pas
 * lui dire de verifier son orthographe.
 */
export function verifierCode(saisi: string): EtatCode {
  const valides = codesValides();
  if (valides.length === 0) return "inactif";
  return valides.includes(saisi.trim().toUpperCase()) ? "ok" : "inconnu";
}
