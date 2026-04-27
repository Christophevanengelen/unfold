import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { uniformRounded } from "@/lib/fonts";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unfold — Know When Life Moves in Your Favor",
  description: "Your personal momentum engine. Understand your daily rhythms across Love, Health, and Work.",
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
