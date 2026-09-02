"use client";

/**
 * Le chemin du coupon avait trois ruptures independantes. Deux sont reparees.
 *
 * 1. INJOIGNABLE (corrige le 02/09/2026). La page vit dans app/unlock/, pas
 *    dans app/[locale]/unlock/ : le middleware prefixait l adresse par la
 *    langue et /unlock partait vers /en/unlock, qui n existe pas. Mesure en
 *    production : 307 puis 404. Elle n etait donc pas seulement orpheline, elle
 *    etait inaccessible meme par lien direct — un code remis a quelqu un ne
 *    pouvait pas servir. middleware.ts la laisse desormais passer.
 *
 * 2. MAUVAISE DESTINATION (corrige le 02/09/2026). Voir plus bas.
 *
 * 3. AUCUN CODE EN PRODUCTION. lib/coupons.ts n en definit pas. Tant que c est
 *    le cas, tout code saisi repond « inactif ». Ce n est pas un defaut a
 *    corriger ici : c est une decision commerciale — veut-on des coupons, et
 *    lesquels.
 *
 * Aucun lien du produit ne mene encore ici. C est voulu tant que 3 tient.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifierCode, CLE_ACCES } from "@/lib/coupons";
import { isNative } from "@/lib/platform";


export default function UnlockPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const tryCode = async () => {
    const etat = await verifierCode(code);
    if (etat === "ok") {
      try { localStorage.setItem(CLE_ACCES, "true"); } catch {}
      setSuccess(true);
      // /app/boudin est mis de cote du paquet natif (scripts/build-native.sh).
      // Y envoyer un telephone affichait « c est bon » puis deposait la
      // personne sur l accueil, sans un mot, au moment precis ou elle venait
      // d utiliser un code. L acces est deja pose dans localStorage : l app
      // sait quoi montrer sans qu on la force sur un ecran qui n existe pas.
      const destination = isNative() ? "/app" : "/app/boudin";
      setTimeout(() => router.replace(destination), 1200);
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
