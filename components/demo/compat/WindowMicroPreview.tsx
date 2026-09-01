"use client";

import { useTheme } from "next-themes";
import type { ConnectionSummary } from "@/lib/connection-summary";
import { texteLisible } from "@/lib/contraste";
import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

interface WindowMicroPreviewProps {
  summary: ConnectionSummary | undefined;
  loading?: boolean;
}

/**
 * One-line micro-preview rendered under the connection name in the list row.
 * Examples:
 *   "Fenêtre forte maintenant · Vénus"
 *   "Alignement clair dans 3 j · Saturne"
 *   perso("compat.calme_mois", locale)
 */
export function WindowMicroPreview({ summary, loading }: WindowMicroPreviewProps) {
  const locale = detectLocale();
  const { resolvedTheme } = useTheme();
  if (loading) {
    return (
      <span
        aria-label={perso("compat.chargement", locale)}
        className="inline-block h-2.5 w-32 rounded animate-pulse"
        style={{ background: "var(--surface-medium)" }}
      />
    );
  }
  if (!summary) {
    return <span className="text-[11px] text-text-body-subtle">—</span>;
  }
  // Cette ligne est le RESUME de la connexion : c est l information que la
  // liste existe pour montrer. Elle etait peinte avec la couleur du palier
  // telle qu elle sort du moteur — 2,02 pour PEAK, 2,45 pour CLEAR et 3,19
  // pour SUBTLE sur le fond clair. La palette a ete dessinee en sombre, ou
  // elle passe (6,38 a 7,73), et le theme clair n a jamais ete mesure.
  // La couleur vient de l execution : on derive au rendu (regle 3).
  const theme = resolvedTheme === "light" ? "clair" : "sombre";
  const brut =
    summary.status === "active" ? summary.currentTierColor
      : summary.status === "upcoming" ? summary.currentTierColor
        : null;
  // taux 0 : la ligne est posee sur le fond de la liste, pas sur une tuile.
  const color = brut ? texteLisible(brut, theme, 0) : "var(--text-body-subtle)";
  const weight = summary.status === "active" ? 600 : 500;
  return (
    <span
      className="text-[11px] leading-snug"
      style={{ color, fontWeight: weight as number }}
    >
      {summary.headlineFR}
    </span>
  );
}
