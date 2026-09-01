"use client";

/**
 * « L hydratation est-elle passee ? »
 *
 * ─── POURQUOI CE FICHIER ───────────────────────────────────────────────────
 *
 * Plusieurs ecrans de /app doivent lire quelque chose que le serveur n a pas :
 * window.Capacitor, localStorage, l URL reelle. Ils le faisaient tous de la
 * meme facon — `useState(false)` + `useEffect(() => setMounted(true), [])` —
 * ce que React 19 signale : le premier rendu est faux, le second le corrige.
 *
 * Le fait « le code tourne maintenant dans un navigateur » vit HORS de React.
 * useSyncExternalStore est fait pour ca, et c est le motif du depot : voir
 * lib/use-locale.ts, qui l explique pour la langue.
 *
 * Le gain n est pas de faire disparaitre les deux passes — elles sont
 * inevitables, le serveur ne PEUT pas savoir. Il est de les declarer a React
 * plutot que de les lui imposer : pas de cascade de rendus, et la valeur du
 * premier rendu client est celle du serveur, donc aucun ecart d hydratation.
 *
 * ─── QUAND S EN SERVIR ─────────────────────────────────────────────────────
 *
 * Uniquement pour ce que le serveur ne peut pas savoir. Une valeur qui se
 * calcule a partir des props ou de l etat se DERIVE pendant le rendu, sans
 * passer par ici.
 */

import { useSyncExternalStore } from "react";

/**
 * Rien a ecouter : ce booleen ne change qu une fois, et c est React lui-meme
 * qui declenche le rendu suivant. La fonction reste au niveau du module pour
 * garder une identite stable entre deux rendus — sinon React se reabonnerait
 * a chaque fois.
 */
function abonner(): () => void {
  return () => {};
}

const surLeClient = () => true;
const surLeServeur = () => false;

/** Faux au rendu serveur ET a l hydratation, vrai ensuite. */
export function useHydrate(): boolean {
  return useSyncExternalStore(abonner, surLeClient, surLeServeur);
}
