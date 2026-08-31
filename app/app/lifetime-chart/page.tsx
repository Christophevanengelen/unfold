"use client";

import { useEffect, useState } from "react";

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

  if (!html) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#1B1535",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#b59a4a",
              marginBottom: 12,
            }}
          >
            Lifetime Chart · Premium
          </p>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#E6E2F2",
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            No chart data found
          </h1>
          <p style={{ fontSize: 13, color: "#BFB6D6", marginBottom: 24 }}>
            Generate your 100-year timeline from the landing page.
          </p>
          <a
            href="/en"
            style={{
              display: "inline-block",
              background: "#b59a4a",
              color: "#fff",
              borderRadius: 50,
              padding: "12px 28px",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Retour à Favorable →
          </a>
        </div>
      </div>
    );
  }

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
