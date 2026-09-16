import localFont from "next/font/local";

/**
 * Goodly — la police d affichage de la marque.
 *
 * Elle etait dans `public/fonts/` depuis mars 2026, six graisses, et n avait
 * jamais ete declaree : toute l app ecrivait ses titres, ses chiffres et son
 * texte courant avec la meme sans arrondie. Une interface qui n a qu une seule
 * voix typographique ne hierarchise rien — c est une des raisons pour
 * lesquelles un ecran juste sur le fond peut rester plat a l oeil.
 *
 * Reglage retenu : Goodly porte les titres et les grands chiffres, Uniform
 * Rounded garde tout le reste. On ne prend pas une police de Google : la marque
 * possede deja la sienne, elle est embarquee dans l app, et elle ne coute donc
 * aucune requete reseau.
 */
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
