import localFont from "next/font/local";
import { Inter } from "next/font/google";

export const goodly = localFont({
  src: [
    { path: "../public/fonts/GoodlyExtraLight.woff2", weight: "200" },
    { path: "../public/fonts/GoodlyLight.woff2", weight: "300" },
    { path: "../public/fonts/GoodlyRegular.woff2", weight: "400" },
    { path: "../public/fonts/GoodlyMedium.woff2", weight: "500" },
    { path: "../public/fonts/GoodlySemibold.woff2", weight: "600" },
    { path: "../public/fonts/GoodlyBold.woff2", weight: "700" },
  ],
  variable: "--font-goodly",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});
