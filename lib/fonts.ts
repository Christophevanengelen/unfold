import localFont from "next/font/local";

export const uniformRounded = localFont({
  src: [
    { path: "../public/fonts/UniformRoundedLight.woff2", weight: "300" },
    { path: "../public/fonts/UniformRounded.woff2", weight: "400" },
    { path: "../public/fonts/UniformRoundedMedium.woff2", weight: "500" },
    { path: "../public/fonts/UniformRoundedBold.woff2", weight: "700" },
    { path: "../public/fonts/UniformRoundedBlack.woff2", weight: "900" },
  ],
  variable: "--font-uniform-rounded",
  display: "swap",
});
