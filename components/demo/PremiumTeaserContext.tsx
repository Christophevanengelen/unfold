"use client";

import { createContext, useContext } from "react";

export const PremiumTeaserContext = createContext<() => void>(() => {});
export function usePremiumTeaser() {
  return useContext(PremiumTeaserContext);
}

/* ─────────────────────────────────────────────────────────────────────────
 * CE QUI A DECLENCHE LE MUR
 *
 * Le mur ne se dresse jamais dans le vide. Il se dresse pendant que
 * quelqu un regarde UNE periode precise de sa vie — le 22 octobre, disons.
 * PremiumBlur connait deja cette periode : elle lui arrive en proprietes
 * (`quand`, `capsuleId`). L information mourait la.
 *
 * Resultat, avant le 01/09/2026 : l ecran des prix vendait un abonnement
 * generique a quelqu un qui venait de toucher une date. C etait le defaut
 * principal du parcours gratuit -> payant, et il ne se voyait pas parce que
 * chaque ecran, pris seul, avait l air correct.
 *
 * POURQUOI ICI, ET PAS DANS LA VALEUR DU CONTEXTE REACT
 *
 * Le fournisseur vit dans app/app/layout.tsx et ne transporte qu une
 * fonction d ouverture, sans charge utile. Et le trajet passe par un
 * changement de route vers /app/pricing : une variable de module suffirait
 * sur le web, pas apres un rechargement de la vue native.
 *
 * POURQUOI UNE HEURE
 *
 * Meme raison que lib/retour-apres-achat.ts : quelqu un qui revient le
 * lendemain ne vient pas pour la capsule d hier. Lui rappeler une date qu il
 * a oubliee ne fait pas personnalise, ca fait indiscret.
 * ───────────────────────────────────────────────────────────────────────── */

const CLE = "favorable_declencheur_mur";
const VALIDITE = 60 * 60 * 1000;

export interface Declencheur {
  /** La date de la periode regardee, deja mise en forme par l appelant. */
  quand?: string;
  /** L identifiant de la periode, pour y revenir revelee apres l achat. */
  capsuleId?: string;
  /** Quand le mur s est dresse. Sert a peremer la memoire. */
  pose: number;
}

/** A appeler au moment ou le mur se dresse, avec ce qui etait regarde. */
export function memoriserDeclencheur(d: Omit<Declencheur, "pose">): void {
  if (!d.quand && !d.capsuleId) return;
  try {
    sessionStorage.setItem(CLE, JSON.stringify({ ...d, pose: Date.now() }));
  } catch {
    /* stockage refuse : on perd la personnalisation, pas la vente */
  }
}

/**
 * Ce que la personne regardait, si c est encore d actualite.
 *
 * NE CONSOMME PAS la valeur, contrairement a intentionEnAttente(). L ecran de
 * vente et l ecran des prix la lisent l un apres l autre : si le premier la
 * consommait, le second retomberait sur le discours generique — exactement le
 * defaut qu on corrige.
 */
export function declencheurEnAttente(): Declencheur | null {
  try {
    const brut = sessionStorage.getItem(CLE);
    if (!brut) return null;
    const d = JSON.parse(brut) as Declencheur;
    if (!d?.pose || Date.now() - d.pose > VALIDITE) return null;
    return d;
  } catch {
    return null;
  }
}
