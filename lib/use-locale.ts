/**
 * La langue de la personne, sans rendu en trop.
 *
 * Six composants refaisaient la meme danse : un etat initialise a « en », un
 * effet qui appelle detectLocale() apres le montage, un ecouteur d evenement
 * pour le changement de langue, et un nettoyage. Dix ecoutes du meme evenement
 * dans le depot.
 *
 * Le probleme n est pas la duplication, c est ce qu elle produit : chaque
 * composant rendait d abord EN ANGLAIS, puis se corrigeait. Sur un ecran qui en
 * contient plusieurs, cela fait autant de rendus supplementaires et, l espace
 * d une image, un melange de deux langues. React 19 le signale a juste titre
 * (« calling setState synchronously within an effect can trigger cascading
 * renders »).
 *
 * useSyncExternalStore existe exactement pour ce cas : une valeur qui vit HORS
 * de React — ici localStorage — et qu il faut lire sans desynchroniser le rendu.
 * Le serveur rend « en », le client rend la vraie langue des la PREMIERE image,
 * et l abonnement remplace les dix ecouteurs.
 */

"use client";

import { useSyncExternalStore } from "react";
import { detectLocale, type Locale } from "@/lib/i18n-demo";

const EVENEMENT = "unfold:locale-changed";

/** Memoise : useSyncExternalStore exige une valeur stable entre deux lectures. */
let cache: Locale | null = null;

function lire(): Locale {
  if (cache === null) cache = detectLocale();
  return cache;
}

function lireServeur(): Locale {
  // Le serveur n a ni localStorage ni navigateur. « en » est la langue de repli
  // du produit, et le client corrige des la premiere image.
  return "en";
}

function abonner(prevenir: () => void): () => void {
  const surChangement = () => {
    cache = null; // la prochaine lecture recalcule
    prevenir();
  };
  window.addEventListener(EVENEMENT, surChangement);
  // Une autre fenetre ou un autre onglet peut changer la langue.
  window.addEventListener("storage", surChangement);
  return () => {
    window.removeEventListener(EVENEMENT, surChangement);
    window.removeEventListener("storage", surChangement);
  };
}

export function useLocale(): Locale {
  return useSyncExternalStore(abonner, lire, lireServeur);
}

/** A appeler apres avoir change la langue, pour que tout le monde suive. */
export function invaliderLocale(): void {
  cache = null;
}
