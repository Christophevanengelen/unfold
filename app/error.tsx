"use client";

import Image from "next/image";
import { perso } from "@/lib/perso-i18n";
import { detectLocale } from "@/lib/i18n-demo";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // detectLocale et non useLocale : cet ecran remplace un arbre qui vient de
  // tomber, on n y ajoute pas d abonnement.
  const locale = detectLocale();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Image src="/logo/icon-mark.svg" alt="" width={48} height={48} />
      {/* text-white sur --bg-primary, qui vaut #F5F1FA en theme clair :
          du blanc sur du blanc casse. Cet ecran est le SEUL que quelqu un voit
          quand tout le reste a echoue ; l y rendre illisible ajoute une panne a
          une panne. Jetons de texte, comme partout ailleurs. */}
      <h1 className="mt-6 font-display text-2xl font-bold" style={{ color: "var(--text-heading)" }}>
        {perso("erreur.titre", locale)}
      </h1>
      <p className="mt-3 max-w-md text-center text-sm" style={{ color: "var(--text-body)" }}>
        {perso("erreur.corps", locale)}
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-xl px-6 py-3 text-sm font-medium transition-colors hover:opacity-90"
        style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
      >
        {perso("erreur.reessayer", locale)}
      </button>
    </div>
  );
}
