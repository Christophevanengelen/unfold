"use client";

import { EcranRapportVide } from "@/components/demo/EcranRapportVide";
import { useRapportStocke } from "../_rapport-stocke";

const SESSION_KEY = "report:lifetime";

export default function LifetimeChartPage() {
  // null = l hydratation n est pas passee, on ne rend rien ; "" = aucun rapport
  // en attente. Voir _rapport-stocke.ts pour la raison des trois etats.
  const html = useRapportStocke(SESSION_KEY, "session");

  if (html === null) return null;

  if (!html) return <EcranRapportVide nom="Lifetime Chart" />;

  return (
    <iframe
      srcDoc={html}
      title="Lifetime Chart"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
      }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
