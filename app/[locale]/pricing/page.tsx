export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { PricingCheckout } from "@/components/landing/PricingCheckout";
import Link from "next/link";

export function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_NATIVE !== "true") return [];
  return [{ locale: "fr" }, { locale: "en" }, { locale: "es" }];
}

export const metadata: Metadata = {
  title: "Plans — Favorable",
  description: "Commence gratuitement. Passe en Pro pour débloquer ton momentum complet.",
};

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // La langue vient de l adresse, comme sur les pages voisines. Sans elle, le
  // lien de retour renvoyait vers « / » et faisait perdre sa langue au visiteur.
  const { locale } = await params;
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
          {/* Link et non <a> : un <a> vers une page interne recharge toute
              l application au lieu de naviguer. Et il pointait vers « / », ce
              qui faisait perdre sa langue a la personne. */}
          <Link
            href={`/${locale}`}
            className="text-[12px] underline"
            style={{ color: "var(--text-body-subtle)" }}
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
