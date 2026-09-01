"use client";

import { EcranRapportVide } from "@/components/demo/EcranRapportVide";
import { useRapportStocke } from "../_rapport-stocke";

const SESSION_KEY = "report:birthday-graph";

export default function BirthdayGraphPage() {
  // null = l hydratation n est pas passee, on ne rend rien ; "" = aucun rapport
  // en attente. Voir _rapport-stocke.ts pour la raison des trois etats.
  const html = useRapportStocke(SESSION_KEY, "local");

  if (html === null) return null;

  if (!html) return <EcranRapportVide nom="Birthday Graph" />;

  return (
    <iframe
      srcDoc={html}
      title="Birthday Graph"
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
