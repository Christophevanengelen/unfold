"use client";

import { useEffect, useState } from "react";
import { EcranRapportVide } from "@/components/demo/EcranRapportVide";

const SESSION_KEY = "report:spirit-wave";

export default function SpiritWavePage() {
  const [html, setHtml] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setHtml(stored);
      localStorage.removeItem(SESSION_KEY);
    }
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!html) return <EcranRapportVide nom="Spirit Wave" />;

  return (
    <iframe
      srcDoc={html}
      title="Spirit Wave"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
      }}
      sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"
    />
  );
}
