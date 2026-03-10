import type { Metadata } from "next";
import { headers } from "next/headers";
import { uniformRounded } from "@/lib/fonts";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unfold — Know When Life Moves in Your Favor",
  description: "Your personal momentum engine. Understand your daily rhythms across Love, Health, and Work.",
  icons: { icon: "/logo/logo-dark.svg" },
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
      <body className={`${uniformRounded.variable} ${uniformRounded.className} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
