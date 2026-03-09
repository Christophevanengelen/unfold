import type { Metadata } from "next";
import { goodly, inter } from "@/lib/fonts";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unfold — Know When Life Moves in Your Favor",
  description: "Your personal momentum engine. Understand your daily rhythms across Love, Health, and Work.",
  icons: { icon: "/logo/logo-dark.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${goodly.variable} ${inter.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
