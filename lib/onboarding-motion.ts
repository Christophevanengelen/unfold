import type { Transition } from "motion/react";

/**
 * Regle d interface : une action ne se cache jamais derriere une animation.
 *
 * Pourquoi. Les ecrans de l onboarding racontent quelque chose, et l animation
 * sert ce recit. Mais la personne qui a compris au bout d une seconde ne doit
 * pas attendre la fin du spectacle pour continuer. Sur les ecrans 2 et 3, le
 * bouton n etait pas seulement invisible : il portait pointerEvents "none", donc
 * taper dessus ne faisait rien. Constate sur iPhone le 31 aout 2026.
 *
 * Ce qu on applique. Le bouton principal apparait des la premiere image, en
 * fondu court, et il est actif immediatement. L animation decorative continue
 * derriere, sans rien bloquer. Celui qui veut regarder regarde ; celui qui veut
 * avancer avance.
 *
 * Ce qui reste legitime. Desactiver un bouton parce que le formulaire est
 * incomplet (isValid, canContinue) : ca depend de la personne, pas d une
 * horloge. On ne touche pas a ca.
 */
export const CTA_IMMEDIAT: Transition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
};

/** Etat de depart du bouton principal : un fondu court, jamais de deplacement. */
export const CTA_DEPART = { opacity: 0 } as const;

/** Etat d arrivee du bouton principal. */
export const CTA_ARRIVEE = { opacity: 1 } as const;
