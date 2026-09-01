"use client";

/**
 * Un rapport HTML depose dans le stockage du navigateur, lu une seule fois.
 *
 * ─── POURQUOI CE FICHIER ───────────────────────────────────────────────────
 *
 * Trois ecrans plein cadre — Lifetime Chart, Spirit Wave, Birthday Graph —
 * faisaient exactement la meme danse : deux etats (`html`, `checked`), un effet
 * qui lit le stockage APRES le montage, et deux setState dans le corps de cet
 * effet. React 19 le signale a juste titre : le premier rendu est faux et le
 * second le corrige. Sur un rapport qui occupe tout l ecran, cela fait une
 * image vide avant l iframe.
 *
 * Le rapport vit HORS de React — sessionStorage ou localStorage — donc c est
 * useSyncExternalStore qui convient, comme dans lib/use-locale.ts.
 *
 * ─── POURQUOI DEUX MORCEAUX PLUTOT QU UN ───────────────────────────────────
 *
 * On ne peut pas tout mettre dans useSyncExternalStore : sa lecture doit etre
 * PURE et rendre deux fois de suite la meme valeur. Or lire ce rapport le
 * CONSOMME — il est retire du stockage une fois affiche, pour qu un retour
 * arriere ne le ressorte pas. La deuxieme lecture ne trouverait plus rien et
 * l ecran s effacerait tout seul.
 *
 * D ou le partage :
 *
 *   • useHydrate() (voir _hydrate.ts) ne porte qu un booleen, « l hydratation
 *     est passee ». C est la seule chose qui vit hors de React et qui change.
 *     Le serveur repond « non », donc l ecran ne rend rien — exactement ce que
 *     faisait `checked === false` — et le client rend le rapport des la
 *     premiere image apres hydratation, sans ecart a signaler.
 *
 *   • L initialiseur PARESSEUX de useState porte la valeur. Il s execute une
 *     fois par montage : pas de cache global qui garderait un rapport perime
 *     quand un nouveau vient d etre depose sous la meme clef. Il ne fait que
 *     LIRE, donc le double rendu de developpement ne coute rien.
 *
 *   • L effacement, lui, est un effet de bord sur un systeme externe : c est
 *     precisement le travail d un effet, et il n y a aucun setState dedans.
 */

import { useEffect, useState } from "react";

import { useHydrate } from "./_hydrate";

/** Ou le rapport a ete depose par l ecran qui l a demande. */
export type Stockage = "session" | "local";

function coffre(ou: Stockage): Storage {
  return ou === "session" ? sessionStorage : localStorage;
}

/**
 * Le rapport a afficher.
 *
 * @returns `null` tant que l hydratation n est pas passee — l ecran ne rend
 *          alors rien ; `""` quand il n y a aucun rapport en attente ; sinon le
 *          HTML du rapport.
 */
export function useRapportStocke(cle: string, ou: Stockage): string | null {
  const hydrate = useHydrate();

  const [rapport] = useState<string>(() => {
    // Le rendu serveur n a pas de stockage. La valeur n est de toute facon pas
    // affichee avant l hydratation.
    if (typeof window === "undefined") return "";
    try {
      return coffre(ou).getItem(cle) ?? "";
    } catch {
      // Navigation privee, stockage refuse : pas de rapport, pas de panne.
      return "";
    }
  });

  useEffect(() => {
    if (!rapport) return;
    // Consomme. Le rapport est a usage unique : on le redemande, on ne le
    // rouvre pas par un retour arriere.
    try {
      coffre(ou).removeItem(cle);
    } catch {
      /* meme raison que plus haut */
    }
  }, [cle, ou, rapport]);

  return hydrate ? rapport : null;
}
