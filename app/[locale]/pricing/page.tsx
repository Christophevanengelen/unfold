import type { Metadata } from "next";
import { PricingCheckout } from "@/components/landing/PricingCheckout";

export const metadata: Metadata = {
  title: "Plans — Unfold",
  description: "Commence gratuitement. Passe en Pro pour débloquer ton momentum complet.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen py-16 px-6" style={{ background: "var(--bg-primary)" }}>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-widest" style={{ color: "var(--accent-purple)" }}>
            Tarifs
          </p>
          <h1 className="font-display text-[32px] font-bold leading-tight md:text-[44px]" style={{ color: "var(--text-heading)" }}>
            Gratuit maintenant.<br />Pro quand tu es prêt.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px]" style={{ color: "var(--text-body-subtle)" }}>
            7 jours gratuits pour explorer tout le potentiel de ton timeline — sans carte bancaire.
          </p>
        </div>

        <PricingCheckout showAnnualToggle />

        {/* Back link */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="text-[12px] underline"
            style={{ color: "var(--text-body-subtle)" }}
          >
            ← Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </main>
  );
}
