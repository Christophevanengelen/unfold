import { notFound } from "next/navigation";
import { isValidLocale, getDirection } from "@/i18n/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import { CookieConsent } from "@/components/legal/CookieConsent";

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
    <div dir={getDirection(locale)} className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--bg-primary, #1B1535)" }}>
      <StructuredData />
      <Header locale={locale} />
      <main id="main" className="flex-1">{children}</main>
      <Footer locale={locale} />
      <CookieConsent locale={locale} />
    </div>
  );
}
