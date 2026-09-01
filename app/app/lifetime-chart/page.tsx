"use client";

import { useEffect, useState } from "react";
import { EcranRapportVide } from "@/components/demo/EcranRapportVide";

const SESSION_KEY = "report:lifetime";

export default function LifetimeChartPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      setHtml(stored);
      sessionStorage.removeItem(SESSION_KEY);
    }
    setChecked(true);
  }, []);

  if (!checked) return null;

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
