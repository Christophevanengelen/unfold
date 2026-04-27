import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { uniformRounded } from "@/lib/fonts";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unfold — Premium Astrology Timing & Personal Momentum",
  description: "Pro-level astrological timing for modern life. See your peak windows, understand transits across love, work, and growth — without the horoscope cringe. 7-day free trial.",
  keywords: [
    "astrology", "horoscope", "astrology app", "transits", "natal chart",
    "personal timing", "astrology timing", "momentum", "compatibility",
    "astrology premium", "best astrology app", "co-star alternative",
    "astrologie", "astrología", "astrologia",
  ],
  openGraph: {
    title: "Unfold — Premium Astrology Timing",
    description: "Pro-level astrological timing for modern life. See your peak windows before they arrive.",
    type: "website",
    images: [{ url: "/logo/icon-mark.svg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unfold — Premium Astrology Timing",
    description: "See your peak windows before they arrive. 7-day free trial.",
  },
  icons: {
    icon: "/logo/logo-dark.svg",
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
  const h = await headers();
  const lang = h.get("x-locale") || "en";

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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
