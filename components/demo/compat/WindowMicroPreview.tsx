"use client";

import type { ConnectionSummary } from "@/lib/connection-summary";

interface WindowMicroPreviewProps {
  summary: ConnectionSummary | undefined;
  loading?: boolean;
}

/**
 * One-line micro-preview rendered under the connection name in the list row.
 * Examples:
 *   "Fenêtre forte maintenant · Vénus"
 *   "Alignement clair dans 3 j · Saturne"
 *   "Calme ce mois"
 */
export function WindowMicroPreview({ summary, loading }: WindowMicroPreviewProps) {
  if (loading) {
    return (
      <span
        aria-label="Chargement"
        className="inline-block h-2.5 w-32 rounded animate-pulse"
        style={{ background: "var(--surface-medium)" }}
      />
    );
  }
  if (!summary) {
    return <span className="text-[11px] text-text-body-subtle">—</span>;
  }
  const color =
    summary.status === "active" ? summary.currentTierColor
      : summary.status === "upcoming" ? summary.currentTierColor
        : "var(--text-body-subtle)";
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
