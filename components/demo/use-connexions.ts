"use client";

/**
 * Les connexions de la personne, sans rendu en trop.
 *
 * Deux composants faisaient la meme danse que celle decrite dans
 * lib/use-locale.ts : un etat vide, un effet qui appelle getConnections() apres
 * le montage, un setState. La barre d onglets affichait donc « 0 » puis le vrai
 * nombre, et l ecran de detail une liste vide puis la liste — un scintillement
 * a chaque montage, et ce que React 19 signale par
 * react-hooks/set-state-in-effect.
 *
 * La liste vit dans localStorage, donc HORS de React : useSyncExternalStore est
 * exactement fait pour ca. Le serveur rend une liste vide, le client rend la
 * vraie des la PREMIERE image.
 *
 * ─── POURQUOI ICI ET PAS DANS lib/connections-store.ts ──────────────────────
 *
 * Le magasin ne previent personne quand il ecrit : addConnection,
 * removeConnection et updateRelationship posent dans localStorage et s en vont.
 * Les appeler depuis app/app/compatibility et app/app/invite/connected sans
 * rien emettre, c est le contrat actuel du magasin. Un abonnement par evenement
 * laisserait donc un cache perime des qu une de ces pages ecrit.
 *
 * D ou la lecture ci-dessous : on relit le magasin a chaque instantane, mais on
 * ne rend un NOUVEAU tableau que si le contenu a reellement change. C est ce
 * qu exige useSyncExternalStore, qui compare les instantanes par IDENTITE — un
 * tableau frais a chaque appel ferait une boucle de rendu infinie, c est le
 * piege classique de ce hook.
 *
 * Le jour ou le magasin emettra un evenement, ce fichier pourra s y abonner et
 * la comparaison de contenu disparaitra.
 */

import { useSyncExternalStore } from "react";
import { getConnections, type RealConnection } from "@/lib/connections-store";

const VIDE: RealConnection[] = [];

let cache: RealConnection[] = VIDE;
/** La signature du contenu deja rendu. null tant qu on n a rien lu. */
let signature: string | null = null;

function lire(): RealConnection[] {
  const fraiches = getConnections();
  const s = JSON.stringify(fraiches);
  if (s !== signature) {
    signature = s;
    cache = fraiches;
  }
  return cache;
}

function lireServeur(): RealConnection[] {
  // Le serveur n a pas de stockage. Renvoyer une CONSTANTE et non `[]` : deux
  // tableaux vides frais ne sont pas identiques, et le rendu boucherait.
  return VIDE;
}

function abonner(prevenir: () => void): () => void {
  // Un autre onglet peut avoir ajoute ou retire une connexion. Dans cet
  // onglet-ci, c est la relecture de `lire` qui fait le travail.
  window.addEventListener("storage", prevenir);
  return () => window.removeEventListener("storage", prevenir);
}

export function useConnexions(): RealConnection[] {
  return useSyncExternalStore(abonner, lire, lireServeur);
}
