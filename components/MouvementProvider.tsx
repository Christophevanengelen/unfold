"use client";

/**
 * Fait respecter le reglage « Reduire les animations » d iOS et macOS.
 *
 * L app compte soixante-six fichiers animes et rien ne consultait ce reglage.
 * Quelqu un qui l active — souvent pour des raisons vestibulaires, des
 * migraines, des vertiges — subissait toutes les animations. C est un manquement
 * aux regles d accessibilite d Apple, et surtout un inconfort reel pour des
 * gens qui ont pris la peine de dire ce dont ils ont besoin.
 *
 * `reducedMotion="user"` fait consulter la preference du systeme a TOUS les
 * composants motion de l app d un seul coup. Les animations de position et de
 * taille sont supprimees ; celles d opacite sont conservees, parce qu un fondu
 * ne provoque pas de malaise et garde l interface comprehensible.
 *
 * Le pendant CSS vit dans globals.css : ce fournisseur ne couvre que les
 * animations de motion/react.
 */

import { MotionConfig } from "motion/react";

export function MouvementProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
