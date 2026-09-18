"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { VERRE_PILULE } from "./verre";

/**
 * La fleche ronde de navigation verticale — un seul composant, trois
 * montages (Timeline vue d'ensemble, Timeline liste, Ma vie).
 *
 * Meme tracé SVG copié trois fois, avec le temps deux tailles differentes :
 * 44px sur Timeline, 28px sur Ma vie. Christophe, le 18/09 : « ils etaient
 * adaptes au pouce » — la taille du pouce ne change pas d un ecran a
 * l autre, donc la cible non plus.
 */
export function BoutonFleche({
  sens,
  onClick,
  ariaLabel,
  className,
  style,
}: {
  sens: "haut" | "bas";
  onClick: () => void;
  ariaLabel: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex h-[var(--taille-tactile-min)] w-[var(--taille-tactile-min)] items-center justify-center rounded-full ${className ?? ""}`}
      style={{ ...VERRE_PILULE, ...style }}
      whileTap={{ scale: 0.9 }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d={sens === "haut" ? "M2 7.5L6 3.5L10 7.5" : "M2 4.5L6 8.5L10 4.5"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}
