"use client";

import type { ReactNode } from "react";
import { VERRE_PILULE } from "./verre";

/**
 * La pilule a plusieurs positions — un seul patron pour deux ecrans.
 *
 * Timeline choisit entre deux icones (vue d'ensemble / liste), Ma vie entre
 * trois echelles de temps (vie / annee / mois) : deux besoins differents,
 * mais le MEME dessin — anneau de verre, segment actif en --bg-brand,
 * segments inactifs en --text-body-subtle — code deux fois avec des tailles
 * qui avaient fini par diverger (44px d'un cote, 28px de l'autre, sans
 * raison). Christophe, le 18/09 : « reutiliser les memes composants dans ma
 * vie et partout dans l'application. » `taille` choisit un des deux
 * echelons deja definis dans app/globals.css — jamais une troisieme valeur.
 */
export interface SegmentBascule<T extends string> {
  valeur: T;
  contenu: ReactNode;
  /** Requis quand `contenu` est une icone seule, sans texte visible. */
  libelle?: string;
}

export function BasculeSegmentee<T extends string>({
  options,
  valeur,
  onChange,
  taille = "tactile",
  role = "group",
  ariaLabel,
  className,
}: {
  options: SegmentBascule<T>[];
  valeur: T;
  onChange: (v: T) => void;
  /** "tactile" = 44px (icones seules) ; "pastille" = 28px (texte court). */
  taille?: "tactile" | "pastille";
  role?: "group" | "tablist";
  ariaLabel?: string;
  className?: string;
}) {
  const dimension = taille === "tactile" ? "var(--taille-tactile-min)" : "var(--taille-pastille)";
  const estOnglet = role === "tablist";

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={`flex items-center gap-0.5 rounded-full p-0.5 ${className ?? ""}`}
      style={VERRE_PILULE}
    >
      {options.map((opt) => {
        const actif = opt.valeur === valeur;
        return (
          <button
            key={opt.valeur}
            type="button"
            role={estOnglet ? "tab" : undefined}
            aria-selected={estOnglet ? actif : undefined}
            aria-pressed={!estOnglet ? actif : undefined}
            aria-label={opt.libelle}
            onClick={() => onChange(opt.valeur)}
            className={`relative flex items-center justify-center rounded-full text-[9px] font-semibold uppercase tracking-wider transition-all duration-200 ${
              // Sous 44px de haut, le trait visuel ne peut pas etre la zone
              // tactile : avant elargit celle-ci sans changer le dessin — le
              // meme filet que les autres pastilles de l'app.
              taille === "pastille" ? "before:absolute before:-inset-y-2.5 before:inset-x-0 before:content-['']" : ""
            }`}
            style={{
              height: dimension,
              minWidth: dimension,
              paddingInline: taille === "pastille" ? 10 : undefined,
              color: actif ? "var(--text-on-brand)" : "var(--text-body-subtle)",
              background: actif ? "var(--bg-brand)" : "transparent",
            }}
          >
            {opt.contenu}
          </button>
        );
      })}
    </div>
  );
}
