"use client";

import { useTheme } from "next-themes";
import { relationshipConfig, relationshipOrder } from "./relationshipConfig";
import type { RelationshipType } from "@/lib/connections-store";
import { texteLisible } from "@/lib/contraste";
import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";
import { choisir } from "@/lib/haptique";

export type FiltreCategorie = "tous" | RelationshipType;

interface ConnectionFilterBarProps {
  valeur: FiltreCategorie;
  onChange: (v: FiltreCategorie) => void;
  /** Nombre de connexions par categorie, "tous" inclus — affiche a cote du libelle des qu il depasse 0. */
  comptes: Record<FiltreCategorie, number>;
}

/**
 * Puces de filtre par categorie de relation — la demande de Christophe mot
 * pour mot : « les trier par amour, travail, famille, etc. ».
 *
 * Meme grammaire visuelle que la selection de relation dans
 * ConnectionActionSheet (tuile a 20 % de la couleur de la categorie quand
 * active, `texteLisible` pour le texte/l icone) plutot qu une nouvelle palette
 * de puces : une categorie garde la MEME couleur partout dans l ecran, choisie
 * ou non. `role="tablist"` parce que ca filtre le contenu qui suit, pas une
 * simple bascule de reglage.
 *
 * "Tous" n a pas de couleur de categorie : il reste neutre pour rester lisible
 * comme le point de depart, pas comme une cinquieme categorie.
 */
export function ConnectionFilterBar({ valeur, onChange, comptes }: ConnectionFilterBarProps) {
  const locale = detectLocale();
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "clair" : "sombre";

  const choisirCategorie = (v: FiltreCategorie) => {
    if (v !== valeur) choisir();
    onChange(v);
  };

  return (
    <div
      role="tablist"
      aria-label={perso("compat.filtrer_categorie", locale)}
      className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5"
      style={{ scrollbarWidth: "none" }}
    >
      <Puce
        actif={valeur === "tous"}
        onClick={() => choisirCategorie("tous")}
        label={perso("compat.tous", locale)}
        compte={comptes.tous}
      />
      {relationshipOrder.map((key) => {
        const rel = relationshipConfig[key];
        const actif = valeur === key;
        return (
          <Puce
            key={key}
            actif={actif}
            onClick={() => choisirCategorie(key)}
            label={perso(rel.cleLabel, locale)}
            compte={comptes[key]}
            couleur={rel.color}
            theme={theme}
          />
        );
      })}
    </div>
  );
}

function Puce({
  actif,
  onClick,
  label,
  compte,
  couleur,
  theme,
}: {
  actif: boolean;
  onClick: () => void;
  label: string;
  compte: number;
  /** Absente pour "Tous", qui reste neutre. */
  couleur?: string;
  theme?: "clair" | "sombre";
}) {
  const teinte = couleur && theme ? texteLisible(couleur, theme, 0.2) : undefined;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={actif}
      onClick={onClick}
      // Sous les 44px de la zone tactile Apple : `before:-inset-y-2` etend la
      // zone de touche sans agrandir le dessin, meme technique que la puce
      // "pastille" de BasculeSegmentee.
      className="relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all active:scale-95 before:absolute before:-inset-y-2 before:inset-x-0 before:content-['']"
      style={{
        background: actif
          ? couleur
            ? `color-mix(in srgb, ${couleur} 20%, transparent)`
            : "var(--bg-brand)"
          : "var(--surface-light)",
        color: actif ? (teinte ?? "var(--text-on-brand)") : "var(--text-body-subtle)",
      }}
    >
      {couleur && (
        <span
          aria-hidden
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: actif ? (teinte ?? couleur) : couleur }}
        />
      )}
      {label}
      {compte > 0 && (
        <span className="text-[10px] font-normal opacity-70">{compte}</span>
      )}
    </button>
  );
}
