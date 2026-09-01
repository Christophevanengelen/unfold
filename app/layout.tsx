import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { uniformRounded } from "@/lib/fonts";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MouvementProvider } from "@/components/MouvementProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Favorable — Premium Astrology Timing & Personal Momentum",
  description: "Pro-level astrological timing for modern life. See your peak windows, understand transits across love, work, and growth — without the horoscope cringe. 7-day free trial.",
  keywords: [
    "astrology", "horoscope", "astrology app", "transits", "natal chart",
    "personal timing", "astrology timing", "momentum", "compatibility",
    "astrology premium", "best astrology app", "co-star alternative",
    "astrologie", "astrología", "astrologia",
  ],
  openGraph: {
    title: "Favorable — Premium Astrology Timing",
    description: "Pro-level astrological timing for modern life. See your peak windows before they arrive.",
    type: "website",
    images: [{ url: "/logo/icon-mark.svg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Favorable — Premium Astrology Timing",
    description: "See your peak windows before they arrive. 7-day free trial.",
  },
  icons: {
    // La marque seule, pas le logotype complet. logo-dark.svg fait 563x173 et
    // contient le mot ecrit en toutes lettres : a seize pixels dans un onglet,
    // il devient une tache illisible. icon-mark.svg est carre et lisible a
    // cette taille — c est a ça que sert un favicon.
    //
    // Effet de bord heureux : le logotype porte encore le mot « unfold »
    // vectorise, qu aucun remplacement de texte ne peut atteindre. Le favicon
    // cesse donc de l afficher en attendant qu un nouveau logotype existe.
    icon: "/logo/icon-mark.svg",
    apple: "/logo/icon-mark.svg",
  },
  manifest: "/site.webmanifest",
};

// viewport-fit=cover is required for CSS env(safe-area-inset-*) to resolve correctly
// on iPhone notch / Dynamic Island / home indicator. Without this, safe-area values = 0.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // En build natif il n y a ni serveur ni middleware : headers() n existe pas.
  // La langue de l app est de toute facon choisie cote client (lib/i18n-demo).
  const lang =
    process.env.NEXT_PUBLIC_NATIVE === "true"
      ? "fr"
      : (await headers()).get("x-locale") || "en";

  return (
    <html lang={lang} suppressHydrationWarning>
      {/* react-scan: visual re-render overlay in dev — activate with ?react-scan in URL */}
      {process.env.NODE_ENV === "development" && (
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (window.location.search.includes('react-scan')) {
                  import('https://unpkg.com/react-scan/dist/auto.global.js');
                }
              `,
            }}
          />
        </head>
      )}
      <body className={`${uniformRounded.variable} ${uniformRounded.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <MouvementProvider>{children}</MouvementProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
