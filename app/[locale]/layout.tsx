import { notFound } from "next/navigation";
import { isValidLocale, getDirection } from "@/i18n/config";
import { Footer } from "@/components/layout/Footer";

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
      <main id="main" className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
