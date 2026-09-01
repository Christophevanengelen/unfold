/**
 * Ou revenir apres avoir paye.
 *
 * LE DEFAUT QUE CE FICHIER CORRIGE. Le parcours etait :
 *
 *   1. on touche une periode A VENIR — celle du 22 octobre, disons
 *   2. le detail s ouvre, floute
 *   3. on touche le flou : l ecran de vente s ouvre
 *   4. on touche le bouton : on QUITTE la fiche pour l ecran des prix
 *   5. on paie : on est depose en haut de la timeline
 *
 * Quelqu un a paye pour savoir ce qui l attend le 22 octobre, et se retrouve
 * ailleurs — a devoir retrouver la periode et se rappeler pourquoi il a paye.
 * Le paiement n a AUCUNE recompense visible. C est le moment ou l on doit
 * prouver que l argent valait quelque chose, et il ne se passe rien.
 *
 * Ce qu on veut : le flou se leve sur CE QU ON REGARDAIT, immediatement.
 *
 * On retient donc ce que la personne essayait de voir au moment ou le mur s est
 * dresse, et on l y ramene une fois l achat abouti. La memoire est volontairement
 * courte — une heure — parce qu au-dela ce n est plus le meme geste : quelqu un
 * qui revient le lendemain veut son accueil, pas la capsule d hier.
 */

const CLE = "favorable_retour_apres_achat";
const VALIDITE = 60 * 60 * 1000;

interface Retour {
  capsuleId: string;
  pose: number;
}

/** A appeler quand le mur se dresse, avec ce que la personne voulait voir. */
export function memoriserIntention(capsuleId: string | null | undefined): void {
  if (!capsuleId) return;
  try {
    const r: Retour = { capsuleId, pose: Date.now() };
    sessionStorage.setItem(CLE, JSON.stringify(r));
  } catch {
    /* stockage refuse : on perdra le retour, pas l achat */
  }
}

/**
 * Ce que la personne voulait voir, si c est encore d actualite.
 * Consomme la valeur : on ne rouvre pas la meme capsule a chaque lancement.
 */
export function intentionEnAttente(): string | null {
  try {
    const brut = sessionStorage.getItem(CLE);
    if (!brut) return null;
    sessionStorage.removeItem(CLE);
    const r = JSON.parse(brut) as Retour;
    if (!r?.capsuleId || Date.now() - r.pose > VALIDITE) return null;
    return r.capsuleId;
  } catch {
    return null;
  }
}

/** L evenement que la timeline ecoute pour rouvrir la capsule. */
export const EVENEMENT_RETOUR = "unfold:rouvrir-capsule";
