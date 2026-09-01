/**
 * Trouve les textes visibles ecrits en dur.
 *
 * Le 1er septembre 2026, deux ecrans ont ete decouverts non traduits — par
 * Christophe, pas par un outil :
 *
 *   - l ecran de saisie de l onboarding : « Time of birth », « Place of birth »,
 *     « City, Country », et des aides qui disaient « Optional » alors que les
 *     champs etaient devenus requis ;
 *   - le guide de premiere utilisation : « You are here. », « Tap a capsule. »
 *
 * Les deux tournaient ainsi dans les dix langues du produit. Le systeme de
 * traduction existe pourtant et il est complet : le probleme est qu on peut
 * l oublier sans que rien ne le signale.
 *
 * Ce controle cherche les chaines qui ATTEIGNENT L OEIL : les proprietes
 * `label`, `title`, `placeholder`, `helper`, `subtext`, et le texte pose
 * directement dans le JSX. Il ne regarde pas les chaines techniques.
 *
 *   node scripts/verifier-traductions.mjs
 */

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

/**
 * Le plafond. Meme raison que pour les couleurs : un controle qui echoue sur
 * des dizaines de cas existants se fait desactiver, donc ne protege de rien.
 * Ce nombre ne peut que descendre.
 */
// ─────────────────────────────────────────────────────────────────────────────
// Les cles de lib/perso-i18n.ts appelees depuis le code existent-elles ?
//
// perso() renvoie la cle brute quand elle est inconnue : une faute de frappe
// afficherait « phase.stbale » dans une liste de choix, sans rien casser. Le
// controle vit ici plutot qu a l execution, pour que l erreur arrive pendant la
// compilation et non sous les yeux de quelqu un.
// ─────────────────────────────────────────────────────────────────────────────
function verifierClesPerso() {
  const module = readFileSync("lib/perso-i18n.ts", "utf8");
  const connues = new Set(
    [...module.matchAll(/^ {2}"([a-z0-9._]+)":/gm)].map((m) => m[1]),
  );
  const fautives = [];
  for (const fichier of fichiers) {
    const src = readFileSync(fichier, "utf8");
    for (const m of src.matchAll(/\bperso\(\s*"([^"]+)"/g)) {
      if (!connues.has(m[1])) fautives.push(`${fichier} : perso("${m[1]}")`);
    }
  }
  return { connues: connues.size, fautives };
}

const PLAFOND = 3;

/** Ce qui n a pas a etre traduit. */
const AUTORISES = [
  { motif: /^app\/(api|admin)\//, raison: "serveur et back-office" },
  { motif: /^app\/app\/astro\//, raison: "outil interne AstroLearn" },
  { motif: /^components\/(landing|seo|legal)\//, raison: "le site a son propre systeme (lib/landing-copy.ts)" },
  { motif: /^app\/\[locale\]\//, raison: "pages du site, deja localisees" },
  { motif: /^components\/admin\//, raison: "back-office interne" },
  {
    motif: /^app\/app\/pricing\//,
    raison:
      "porte ses propres tables de traduction en ligne, une par locale — " +
      "verifie a la lecture, ce n est pas une fuite",
  },
  {
    motif: /^app\/layout\.tsx$/,
    raison: "metadonnees du document, pas du texte d interface",
  },
  { motif: /verifier-|\.test\./, raison: "outils" },
];

/** Proprietes dont la valeur s affiche a l ecran. */
const PROPRIETES = /(?:^|[^a-zA-Z])(label|title|placeholder|helper|subtext|subtitle|heading|cta)\s*:\s*"([^"]{4,})"/g;

/**
 * Une chaine qui ne contient ni lettre accentuee ni espace est probablement
 * technique — une clef, un identifiant, une classe. On ne retient que ce qui
 * ressemble a une phrase.
 */
function ressembleAUnTexte(v) {
  if (!/\s/.test(v)) return false;              // un seul mot : souvent technique
  if (/^[a-z-]+$/.test(v)) return false;        // kebab-case
  if (/^(https?:|\/|#|var\(|rgba?\()/.test(v)) return false;
  if (/^[0-9\s:.,%-]+$/.test(v)) return false;  // que des chiffres
  return /[A-Za-zÀ-ÿ]{3,}/.test(v);
}

const fichiers = execFileSync("git", ["ls-files", "components", "app"], { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.endsWith(".tsx"));

const fuites = [];
for (const f of fichiers) {
  if (AUTORISES.some((a) => a.motif.test(f))) continue;
  const texte = readFileSync(f, "utf8");
  texte.split("\n").forEach((ligne, i) => {
    const nu = ligne.trimStart();
    if (nu.startsWith("//") || nu.startsWith("*") || nu.startsWith("/*")) return;
    if (ligne.includes("t(")) return;           // deja traduit sur cette ligne
    PROPRIETES.lastIndex = 0;
    let m;
    while ((m = PROPRIETES.exec(ligne))) {
      if (ressembleAUnTexte(m[2])) fuites.push({ f, ligne: i + 1, prop: m[1], texte: m[2] });
    }
  });
}

// Une cle inconnue passee a perso() s afficherait telle quelle a l ecran.
const { connues, fautives } = verifierClesPerso();
if (fautives.length > 0) {
  console.log(`\n  Cle(s) inexistante(s) dans lib/perso-i18n.ts (${connues} connues) :\n`);
  for (const x of fautives) console.log(`    ${x}`);
  console.log(`
  perso() renvoie la cle telle quelle quand elle est inconnue : ces appels
  afficheraient un identifiant technique dans l interface, sans rien casser.
`);
  process.exit(1);
}

if (fuites.length <= PLAFOND) {
  console.log(`\n  ${fuites.length} texte(s) en dur, plafond ${PLAFOND}. Rien de neuf.\n`);
  process.exit(0);
}

console.log(`\n  ${fuites.length} texte(s) visible(s) ecrit(s) en dur, plafond ${PLAFOND} :\n`);
for (const x of fuites) console.log(`    ${x.f}:${x.ligne}  ${x.prop}: "${x.texte.slice(0, 50)}"`);
console.log(`
  Ces textes s affichent tels quels dans les dix langues du produit.

  Ajoute une clef dans lib/i18n-demo.ts et appelle t("section.clef", locale).
  Voir components/demo/onboarding/StepInput.tsx pour l exemple le plus recent.
`);
process.exit(1);
