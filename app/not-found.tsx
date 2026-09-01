"use client";

import Link from "next/link";
import { perso } from "@/lib/perso-i18n";
import { detectLocale } from "@/lib/i18n-demo";

export default function NotFound() {
  const locale = detectLocale();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-6 text-center">
      <h1 className="font-display text-6xl font-bold text-accent-purple">404</h1>
      <p className="mt-4 text-lg text-text-body">{perso("erreur.introuvable", locale)}</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-accent-purple px-6 py-3 text-sm font-medium text-white hover:opacity-90"
      >
        {perso("erreur.accueil", locale)}
      </Link>
    </div>
  );
}
