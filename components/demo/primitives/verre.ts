import type { CSSProperties } from "react";

/**
 * Le verre depoli des commandes flottantes — anneaux, pilules, boutons ronds.
 *
 * Existait deux fois, mot pour mot identique : `PILL_STYLE` dans
 * MomentumTimelineV2.tsx et `VERRE` dans BrancheDeVie.tsx. Christophe, le
 * 18/09 : « on invente des nouvelles tailles, des nouvelles choses, et ce
 * n'est pas pro » — la meme remarque vaut pour un style duplique. Une seule
 * definition, importee partout.
 */
export const VERRE_PILULE: CSSProperties = {
  background: "var(--glass-pill-strong)",
  color: "var(--text-brand)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};
