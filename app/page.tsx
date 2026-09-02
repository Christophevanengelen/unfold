import type { Metadata } from "next";
import { defaultLocale, locales } from "@/i18n/config";

/**
 * Le filet de la racine.
 *
 * Sur le web, personne n arrive ici : middleware.ts intercepte « / » et
 * redirige vers « /{langue} » selon l en-tete Accept-Language (verifie le
 * 02/09/2026 — favorable.day repond 307 vers /en).
 *
 * Ce fichier est ce qui s affiche SI cette redirection ne se produit pas : le
 * matcher du middleware change, une exportation statique le desactive, un
 * hebergeur ne l execute pas. Il contenait encore le gabarit de demarrage de
 * Next.js — logo Next, « To get started, edit the page.tsx file. » et un bouton
 * « Deploy Now » vers Vercel. Le filet renvoyait donc chez quelqu un d autre.
 *
 * Pas de redirect() ici : le build natif exporte en statique, ou une
 * redirection cote serveur n existe pas. Une balise refresh fonctionne dans les
 * deux mondes, et les liens en clair restent utilisables si elle est ignoree.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  // La redirection passe par les metadonnees : app/layout.tsx rend deja
  // <html> et <head>, une page ne peut pas rendre les siens.
  other: { refresh: `0; url=/${defaultLocale}` },
};

export default function Racine() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        background: "var(--bg-primary)",
        color: "var(--text-heading)",
      }}
    >
      <p style={{ margin: 0, fontSize: "1.125rem" }}>Favorable</p>
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "center",
          maxWidth: "28rem",
        }}
      >
        {locales.map((l) => (
          <a
            key={l.code}
            href={`/${l.code}`}
            hrefLang={l.code}
            dir={l.dir}
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            {l.nativeName}
          </a>
        ))}
      </nav>
    </main>
  );
}
