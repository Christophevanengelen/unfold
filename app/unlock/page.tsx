"use client";

/**
 * ORPHELINE, constate le 01/09/2026. Aucun lien du produit ne mene ici — ni le
 * site, ni l app, ni un mail. On n y arrive qu en tapant l adresse.
 *
 * Et si on y arrive : elle renvoie vers /app/boudin, un ecran volontairement
 * mis de cote du paquet natif (voir scripts/build-native.sh). Sur telephone, un
 * code valide afficherait donc « c est bon » puis deposerait la personne sur
 * l accueil, sans explication.
 *
 * Elle est laissee en place, branchee sur lib/coupons.ts comme les deux autres
 * champs de code, en attendant qu on decide de son sort. Elle ne nuit pas :
 * personne ne peut la trouver.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifierCode, CLE_ACCES } from "@/lib/coupons";


export default function UnlockPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const tryCode = () => {
    const etat = verifierCode(code);
    if (etat === "ok") {
      try { localStorage.setItem(CLE_ACCES, "true"); } catch {}
      setSuccess(true);
      setTimeout(() => router.replace("/app/boudin"), 1200);
    } else {
      // Voir lib/coupons.ts : aucun code n est defini en production, donc
      // demander de verifier l orthographe accuse la personne a tort.
      setError(
        etat === "inactif"
          ? "Access codes aren't active right now. It's not you."
          : "This code isn't recognized.",
      );
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, system-ui, sans-serif",
      padding: 24,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        // La carte est une TUILE d or, pas un aplat : elle se pose sur le fond
        // de page, donc elle doit suivre le theme. color-mix la recalcule sur
        // --bg-primary au lieu de supposer un fond sombre.
        background: "color-mix(in srgb, var(--bg-premium) 6%, transparent)",
        border: "1px solid color-mix(in srgb, var(--bg-premium) 22%, transparent)",
        borderRadius: 24,
        padding: "40px 32px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "var(--text-premium)", textTransform: "uppercase", marginBottom: 16 }}>
          Lifetime Chart · Premium
        </p>

        {success ? (
          <>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-heading)", marginBottom: 8 }}>✦ Unlocked</p>
            <p style={{ fontSize: 13, color: "var(--text-body-subtle)" }}>Opening your chart…</p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-heading)", marginBottom: 8, lineHeight: 1.2 }}>
              Enter your access code
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-body-subtle)", marginBottom: 28 }}>
              Type your coupon code below to unlock the Lifetime Chart.
            </p>

            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && tryCode()}
              placeholder="e.g. UNFOLD2026"
              autoFocus
              style={{
                width: "100%",
                padding: "14px 18px",
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textAlign: "center",
                background: "color-mix(in srgb, var(--bg-premium) 8%, transparent)",
                border: "1px solid color-mix(in srgb, var(--bg-premium) 30%, transparent)",
                borderRadius: 12,
                // Le champ ecrivait l or PUR sur une tuile faite du MEME or :
                // texte et fond convergeaient (regle 3). --text-premium est la
                // valeur derivee, mesuree sur cette tuile : 4,87 en clair.
                color: "var(--text-premium)",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />

            {error && (
              <p style={{ fontSize: 12, color: "var(--text-erreur)", marginTop: 10 }}>{error}</p>
            )}

            <button
              type="button"
              onClick={tryCode}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "14px",
                fontSize: 14,
                fontWeight: 700,
                // Paire de la regle 2. Le blanc d origine donnait 2,73 sur
                // cet or : le libelle du seul bouton menant au produit paye
                // etait le moins lisible du produit.
                background: "var(--bg-premium)",
                color: "var(--text-on-premium)",
                border: "none",
                borderRadius: 50,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Unlock →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
