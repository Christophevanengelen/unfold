/**
 * Classement de produits sans seuils inventes.
 *
 * Aucun repere publie n'existe pour une app d'astrologie : fixer « 40 % =
 * bon » serait une invention. On classe donc les produits LES UNS PAR RAPPORT
 * AUX AUTRES, critere par critere (rang 1 = meilleur), et le « score » est la
 * moyenne des rangs. Un critere sous le seuil de lecture (30 personnes) ne
 * compte pas. Un produit ne recoit un rang moyen que s'il a au moins deux
 * criteres lisibles et qu'il a au moins un concurrent de sa famille lisible.
 *
 * On ne classe jamais ensemble des produits de familles differentes (une
 * landing et une app ne mesurent pas la meme chose).
 */

/** Rang par valeur decroissante (la plus haute = 1). Les ex aequo partagent le meme rang. null reste null. */
export function rangs(valeurs: (number | null)[]): (number | null)[] {
  const lisibles = valeurs.filter((v): v is number => v !== null);
  return valeurs.map((v) => {
    if (v === null) return null;
    return 1 + lisibles.filter((x) => x > v).length;
  });
}

/** Moyenne des rangs disponibles ; null si moins de deux criteres. */
export function moyenneDesRangs(parCritere: (number | null)[], minimum = 2): number | null {
  const dispo = parCritere.filter((r): r is number => r !== null);
  if (dispo.length < minimum) return null;
  return dispo.reduce((a, b) => a + b, 0) / dispo.length;
}
