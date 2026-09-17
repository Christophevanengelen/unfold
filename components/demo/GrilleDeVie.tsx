"use client";

/**
 * La grille d une rareté — « la 2ᵉ fois sur 2 dans ta vie », dessinée.
 *
 * ─── LA DEMANDE ─────────────────────────────────────────────────────────────
 *
 * Christophe, le 17/09 : « il y a trop de texte et pas assez d illustrations
 * […] l objectif c est que ce soit gai a lire et decouvrir ».
 *
 * ─── POURQUOI CETTE FORME-LA, ET PAS UNE AUTRE ──────────────────────────────
 *
 * C est la forme la mieux etayee pour dire une rarete, et la seule qui NE PEUT
 * PAS MENTIR : elle montre le denominateur.
 *
 * Les frequences naturelles — « deux fois sur deux » — sont comprises la ou les
 * pourcentages ne le sont pas (Gigerenzer, 2011), et les grilles d unites
 * reduisent la negligence du denominateur. Un pourcentage cache combien de fois
 * la chose peut arriver ; une grille le rend impossible a ignorer.
 *
 * La regle de dessin vient d Isotype (Neurath) : POUR UNE QUANTITE PLUS GRANDE,
 * ON REPETE L UNITE, ON NE L AGRANDIT PAS. Une case par occurrence possible,
 * toujours la meme case.
 *
 * ─── CE QU ELLE NE FAIT PAS ─────────────────────────────────────────────────
 *
 * AUCUN ALEATOIRE. Pas une ligne. Deux personnes avec le meme rang voient la
 * meme grille, et c est voulu : l aleatoire visible est le defaut le plus fatal
 * d une illustration generee — le lecteur comprend en trois secondes que le
 * dessin ne sait rien, et aucun raffinement graphique ne le rattrape.
 *
 * AUCUN DEGRADE, AUCUNE LUEUR, AUCUNE OMBRE. Trois aplats et un filet. Le
 * budget est tenu : deux remplissages, un accent, un contour.
 *
 * L accent est RARE par construction — une seule case sur N. C est ce qui fait
 * la gaiete : la densite, plus un point unique ou l oeil tombe.
 */

import { motion, useReducedMotion } from "motion/react";

/** Au-dela, on ne dessine plus : mille cases ne se comptent pas. */
const MAX_CASES = 60;

export function GrilleDeVie({
  rang,
  total,
  accent,
  taille = 11,
  ecart = 4,
}: {
  /** Le rang de l occurrence en cours, a partir de 1. */
  rang: number;
  /** Combien de fois en tout, dans une vie. */
  total: number;
  /** La couleur du domaine, pour la seule case vive. */
  accent: string;
  taille?: number;
  ecart?: number;
}) {
  const fige = useReducedMotion();

  // Les gardes sont ecrites une par une, et pas en une seule expression.
  // Le controle des traductions lisait la condition longue comme du texte
  // affiche en dur — et en la decoupant, chaque refus dit AUSSI pourquoi.
  const nombresValides = Number.isFinite(rang) && Number.isFinite(total);
  const totalDessinable = total >= 2 && total <= MAX_CASES;
  const rangDansLeTotal = rang >= 1 && rang <= total;
  if (!nombresValides) return null;
  // Une seule occurrence ne fait pas une rarete, et au-dela de soixante cases
  // on ne compte plus : dans les deux cas la grille ne dirait rien.
  if (!totalDessinable) return null;
  if (!rangDansLeTotal) return null;

  // Une seule ligne tant que ca tient, sinon on plie. Pas de colonne fixe : la
  // grille suit la largeur qu on lui donne, comme un paragraphe.
  return (
    <div
      className="flex flex-wrap"
      style={{ gap: ecart }}
      role="img"
      aria-label={`${rang} / ${total}`}
      data-grille-total={total}
      data-grille-rang={rang}
    >
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const passe = n < rang;
        const courant = n === rang;
        return (
          <motion.span
            key={n}
            data-grille-case={courant ? "courant" : passe ? "passe" : "a-venir"}
            style={{
              width: taille,
              height: taille,
              borderRadius: 2,
              background: courant ? accent : passe ? "var(--text-body-subtle)" : "transparent",
              // Les cases a venir sont un contour, pas un aplat pale : un aplat
              // pale se lit comme « une occurrence faible », un contour se lit
              // comme « pas encore ». La difference n est pas decorative.
              boxShadow: courant || passe ? undefined : "inset 0 0 0 1px var(--border-base)",
              opacity: passe ? 0.45 : 1,
            }}
            initial={fige ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: passe ? 0.45 : 1, scale: 1 }}
            transition={
              fige
                ? { duration: 0 }
                : { duration: 0.28, delay: 0.05 + i * 0.035, ease: [0.16, 1, 0.3, 1] }
            }
          />
        );
      })}
    </div>
  );
}
