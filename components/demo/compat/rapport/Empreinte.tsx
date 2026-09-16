"use client";

/**
 * L empreinte, a l ecran.
 *
 * Le calcul vit dans `lib/empreinte.ts` ; ce fichier ne fait que le poser et
 * l animer. Trois decisions de rendu :
 *
 *  - **Elle se dessine, elle n apparait pas.** `pathLength` de `motion` anime
 *    le trace de 0 a 1 sans qu on ait a mesurer le chemin avec
 *    `getTotalLength()`. Deux courbes decalees de 300 ms : la seconde repond a
 *    la premiere, ce qui raconte deux personnes plutot qu une figure.
 *
 *  - **Elle respire ensuite, tres peu.** Une rotation d un degre et demi sur
 *    vingt secondes. Assez pour que l ecran ne soit pas mort, trop lent pour
 *    qu on la regarde tourner. Aucun `backdrop-filter` : c est le premier
 *    suspect quand une animation saccade dans la WebView de l app native.
 *
 *  - **Pas de grain ici.** La texture est posee par la classe `.grain` du
 *    feuillet global, en image data-URI rasterisee une fois. Un `feTurbulence`
 *    applique en direct a ce SVG serait recalcule par pixel a chaque image et
 *    n est pas accelere materiellement — c est un des pieges les mieux
 *    documentes du rendu SVG sur Safari mobile.
 *
 * `prefers-reduced-motion` rend la figure finie, immobile : elle reste le
 * sujet, elle perd seulement son entree.
 */

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { construireEmpreinte, type ParametresEmpreinte } from "@/lib/empreinte";
import { TRACE } from "@/lib/ressorts";

export function Empreinte({
  parametres,
  taille = 320,
  opacite = 1,
  aura = false,
  className,
}: {
  parametres: ParametresEmpreinte;
  taille?: number;
  /** Baissee quand elle sert de fond derriere un chiffre. */
  opacite?: number;
  /**
   * Le traitement en fond. Mesure du 16/09 sur iPhone 13 : posee telle quelle
   * derriere le score, la figure se lisait comme un gribouillis et se battait
   * avec la typographie — son contour carre, surtout, la faisait lire comme une
   * boite et non comme une signature.
   *
   * L aura corrige les deux : un fondu radial efface les bords, et le trait
   * s affine. La figure redevient une presence, ce qu elle doit etre quand elle
   * n est pas le sujet.
   */
  aura?: boolean;
  className?: string;
}) {
  const fige = useReducedMotion();
  // Le calcul est pur et deterministe : on ne le refait que si les chiffres
  // changent, jamais a chaque rendu.
  const e = useMemo(() => construireEmpreinte(parametres), [parametres]);

  const trait = (i: 0 | 1) => ({
    d: e.chemins[i],
    // Couleur deja convertie en sRGB par `lib/empreinte.ts`. OKLCH reste
    // l espace de TRAVAIL — c est lui qui garde la luminosite percue constante
    // quand la teinte suit le score — mais la valeur rendue est du `rgb()`,
    // pour les raisons expliquees dans `oklchVersRgb`.
    stroke: e.couleurs[i],
    strokeWidth: aura ? (i === 0 ? 0.3 : 0.26) : i === 0 ? 0.55 : 0.5,
    opacity: i === 0 ? 0.95 : 0.66,
  });

  return (
    <svg
      viewBox="0 0 100 100"
      width={taille}
      height={taille}
      className={className}
      style={{
        opacity: opacite,
        overflow: "visible",
        /**
         * Le fondu passe par un masque CSS, pas par un `<mask>` SVG.
         *
         * Mesure du 16/09 sur iPhone 13, theme clair : avec un masque SVG, des
         * fragments de la seconde courbe se rendaient en jaune-vert — la
         * couleur complementaire — et en tirets, la ou les traits se
         * superposent le plus. Un defaut de rasterisation du masque, invisible
         * en theme sombre et impossible a voir dans le code.
         *
         * Le masque CSS est composite par le navigateur, sans passer par le
         * pipeline de filtres SVG. Il coute moins, et il est juste.
         */
        ...(aura
          ? {
              WebkitMaskImage:
                "radial-gradient(circle at 50% 50%, black 0%, rgba(0,0,0,0.72) 38%, rgba(0,0,0,0.2) 72%, transparent 100%)",
              maskImage:
                "radial-gradient(circle at 50% 50%, black 0%, rgba(0,0,0,0.72) 38%, rgba(0,0,0,0.2) 72%, transparent 100%)",
            }
          : {}),
      }}
      aria-hidden="true"
    >
      <motion.g
        fill="none"
        strokeLinecap="round"
        style={{ transformOrigin: "50px 50px" }}
        animate={fige ? undefined : { rotate: [0, 1.5, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      >
        {([0, 1] as const).map((i) => (
          <motion.path
            key={i}
            {...trait(i)}
            initial={{ pathLength: fige ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={fige ? { duration: 0 } : { ...TRACE, delay: i * 0.3 }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
