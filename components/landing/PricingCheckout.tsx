"use client";

import { useState } from "react";
import { Check } from "flowbite-react-icons/outline";
import { PLANS } from "@/lib/billing/features";
import { isIOSBundle } from "@/lib/platform";

interface PricingCheckoutProps {
  showAnnualToggle?: boolean;
}

export function PricingCheckout({ showAnnualToggle = true }: PricingCheckoutProps) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ios = isIOSBundle();

  const annualMonthly = (PLANS.annual.priceEUR / 12).toFixed(2);
  const savings = (PLANS.monthly.priceEUR * 12 - PLANS.annual.priceEUR).toFixed(2);

  const handleCheckout = async (plan: "monthly" | "annual") => {
    setError(null);
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan }),
      });
      if (res.status === 401) {
        // Not authenticated — redirect to demo to sign in
        window.location.href = "/demo?auth_required=pricing";
        return;
      }
      if (!res.ok) throw new Error("Checkout non disponible");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setLoading(null);
    }
  };

  const freeFeatures = [
    "Signal du moment actuel",
    "Mots-clés planétaires",
    "Historique des signaux passés",
    "1 connexion (matching)",
    "1 délineation IA / semaine",
  ];

  const premiumFeatures = [
    "Tout le gratuit, sans limite",
    "Timeline complète 36 mois",
    "Fenêtres futures débloquées",
    "Alertes de pics en temps réel",
    "Délineations IA illimitées",
    "Brief quotidien personnalisé",
    "Connexions illimitées",
    "Digest hebdomadaire",
  ];

  return (
    <div className="w-full">
      {/* Toggle — web/Android only */}
      {showAnnualToggle && !ios && (
        <div className="mb-8 flex justify-center">
          <div
            className="flex rounded-full p-1"
            style={{ background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)" }}
          >
            {(["monthly", "annual"] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setBilling(plan)}
                className="rounded-full px-5 py-2 text-[13px] font-semibold transition-all"
                style={{
                  background: billing === plan ? "var(--accent-purple)" : "transparent",
                  color: billing === plan ? "#fff" : "var(--text-body-subtle)",
                }}
              >
                {plan === "monthly" ? "Mensuel" : (
                  <span className="flex items-center gap-1.5">
                    Annuel
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: "#22c55e20", color: "#22c55e" }}
                    >
                      -25%
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Savings callout */}
      {billing === "annual" && !ios && (
        <p className="mb-6 text-center text-[12px] font-medium" style={{ color: "#22c55e" }}>
          Tu économises {savings} € par an
        </p>
      )}

      {/* Cards */}
      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {/* Free card */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background: "var(--bg-card)",
            borderColor: "color-mix(in srgb, var(--accent-purple) 12%, transparent)",
          }}
        >
          <h3 className="text-[18px] font-bold" style={{ color: "var(--text-heading)" }}>
            Gratuit
          </h3>
          <p className="mt-1 text-[13px]" style={{ color: "var(--text-body-subtle)" }}>
            Ton signal du moment, toujours disponible.
          </p>
          <p className="mt-5 text-[32px] font-bold" style={{ color: "var(--text-heading)" }}>
            0 €
          </p>
          <ul className="mt-6 space-y-2.5">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: "var(--text-body)" }}>
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent-purple)" }} />
                {f}
              </li>
            ))}
          </ul>
          <div
            className="mt-6 w-full rounded-xl py-3 text-center text-[13px] font-semibold"
            style={{
              background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)",
              color: "var(--accent-purple)",
            }}
          >
            Ton plan actuel
          </div>
        </div>

        {/* Premium card */}
        <div
          className="relative rounded-2xl border p-6"
          style={{
            background: "var(--accent-purple)",
            borderColor: "var(--accent-purple)",
          }}
        >
          {/* Badge */}
          <span
            className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-bold"
            style={{ background: "#fff", color: "var(--accent-purple)" }}
          >
            Le plus populaire
          </span>

          <h3 className="text-[18px] font-bold text-white">
            Pro
          </h3>
          <p className="mt-1 text-[13px] text-white/70">
            Ton momentum complet, passé, présent et futur.
          </p>

          {/* Price — hidden on iOS (anti-steering) */}
          {ios ? (
            <p className="mt-5 text-[15px] font-semibold text-white">
              Essai gratuit de 7 jours
            </p>
          ) : billing === "monthly" ? (
            <p className="mt-5 text-[32px] font-bold text-white">
              {PLANS.monthly.priceEUR.toFixed(2).replace(".", ",")} €
              <span className="text-[14px] font-normal text-white/70">/mois</span>
            </p>
          ) : (
            <div className="mt-5">
              <p className="text-[32px] font-bold text-white">
                {parseFloat(annualMonthly).toFixed(2).replace(".", ",")} €
                <span className="text-[14px] font-normal text-white/70">/mois</span>
              </p>
              <p className="text-[12px] text-white/70">
                facturé {PLANS.annual.priceEUR.toFixed(2).replace(".", ",")} € / an
              </p>
            </div>
          )}

          <ul className="mt-6 space-y-2.5">
            {premiumFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[13px] text-white">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          {!ios && (
            <button
              onClick={() => handleCheckout(billing)}
              disabled={loading !== null}
              className="mt-6 w-full rounded-xl py-3 text-[14px] font-bold transition-opacity disabled:opacity-60"
              style={{ background: "#fff", color: "var(--accent-purple)" }}
            >
              {loading === billing
                ? "Redirection..."
                : "Démarrer 7 jours gratuits"}
            </button>
          )}

          {ios && (
            <button
              className="mt-6 w-full rounded-xl py-3 text-[14px] font-bold"
              style={{ background: "#fff", color: "var(--accent-purple)" }}
            >
              Continuer
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 text-center text-[12px] font-medium" style={{ color: "#f17e7a" }}>
          {error}
        </p>
      )}

      {/* EU consumer law disclosures — web/Android only */}
      {!ios && (
        <div className="mx-auto mt-8 max-w-2xl space-y-2 text-center text-[11px]" style={{ color: "var(--text-body-subtle)" }}>
          <p>Renouvellement automatique {billing === "monthly" ? "mensuel" : "annuel"}. Annulable à tout moment depuis ton compte.</p>
          <p>Droit de rétractation de 14 jours pour les services numériques (Article 16, Directive 2011/83/UE).</p>
          <p>Prix TTC, TVA incluse selon ton pays de résidence.</p>
        </div>
      )}
    </div>
  );
}
