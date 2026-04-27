import { notFound } from "next/navigation";
import { isValidLocale, getDirection } from "@/i18n/config";

/**
 * /[locale] layout — kept minimal so the marketing landing renders even
 * when DB-backed components fail. The new /[locale]/page.tsx is fully
 * self-contained: hero + features + CTAs + footer copy. No Header/Footer/
 * CookieConsent dependencies that were causing 500s.
 *
 * Header & cookie consent will return as separate stable components in V1.1
 * when we verify each renders cleanly across all 10 locales.
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
    </div>
  );
}
