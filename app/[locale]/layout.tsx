import { notFound } from "next/navigation";
import { isValidLocale, getDirection } from "@/i18n/config";
import { Footer } from "@/components/layout/Footer";
import { StructuredData } from "@/components/seo/StructuredData";

/**
 * Requis par output: "export" (build natif). Declare ici une seule fois, ce
 * layout couvre toutes les pages sous /[locale]. Sur le web on renvoie une
 * liste vide : rien ne change, les pages restent rendues a la demande.
 */
export function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_NATIVE !== "true") return [];
  return [{ locale: "fr" }, { locale: "en" }, { locale: "es" }];
}


/**
 * /[locale] layout — deliberately light. The DB-backed components that were
 * causing the /[locale] 500s stay out; the landing page itself is fully
 * self-contained (hero + narrative sections + CTAs, copy from
 * lib/landing-copy.ts, no database).
 *
 * Footer is wired back in (2026-08-04): it has no DB dependency — labels for
 * the 10 locales live in the component — and it carries the hi-def.be
 * signature. It had been dropped in April along with Header/CookieConsent,
 * which left the signature rendered nowhere.
 *
 * Header & cookie consent still to return as separate stable components.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <div
      lang={locale}
      dir={getDirection(locale)}
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--bg-primary, #1B1535)" }}
    >
      {/* Lien d evitement.
          
          Il existait dans components/layout/Header.tsx, l en-tete abandonne en
          avril : sa disparition a emporte avec elle la seule facon d atteindre
          le contenu sans traverser toute la page au clavier. Le site a bien un
          <main id="main">, mais plus rien n y menait.
          
          Il reste invisible jusqu au premier appui sur Tab, donc il ne change
          rien au dessin de la page — contrairement a l en-tete lui-meme, dont
          le retour serait une decision de design. */}
      <a
        href="#main"
        className="sr-only rounded-lg px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50"
        style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
      >
        {locale === "fr" ? "Aller au contenu" : "Skip to content"}
      </a>

      {/* Donnees structurees. Ecrites il y a des mois, jamais montees : le
          site declarait donc au moteur de recherche une application sans nom,
          sans categorie et sans offre. Verifie avant de le brancher — les prix
          correspondent bien a lib/billing/features.ts, et la mention de la
          carte mensuelle a ete retiree, cet ecran ayant ete sorti du produit. */}
      <StructuredData />
      <main id="main" className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
