/**
 * Les composants d interface que plus rien n importe.
 *
 * Ce controle existe a cause d une perte precise. components/ThemeToggle.tsx —
 * le seul selecteur de theme du produit — etait monte dans
 * components/layout/Header.tsx, un fichier qu AUCUNE page n importait plus.
 * La fonctionnalite etait ecrite, testable, et invisible. Rien dans le depot ne
 * signalait sa disparition, et elle a tenu des mois.
 *
 * L audit du 01/09/2026 a trouve qu elle n etait pas un cas isole : le
 * selecteur de LANGUE avait disparu par le meme fichier, avec le bandeau
 * cookies, les donnees structurees SEO et l ecran de detail par domaine —
 * environ 6 550 lignes jamais atteintes.
 *
 * Le controle ne supprime rien : supprimer demande un jugement humain, un
 * composant pouvant etre garde en attente d etre rebranche. Il refuse
 * seulement que le nombre AUGMENTE. Une fonctionnalite ne peut plus se
 * debrancher en silence.
 *
 * LIMITE CONNUE, et elle compte : le controle ne suit pas la chaine. Un
 * composant importe UNIQUEMENT par du code lui-meme mort passe pour vivant.
 * C est exactement le cas de ThemeToggle, importe par le seul Header — le
 * controle voit Header, pas ThemeToggle. Il aurait donc signale la racine et
 * pas la feuille, ce qui suffit : on remonte a la racine et on trouve le reste.
 *
 * Teste le 01/09/2026 en debranchant OnboardingProgress d une page vivante :
 * le compte est passe de 23 a 24 et la verification a echoue.
 *
 *   node scripts/verifier-code-mort.mjs
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const PLAFOND = 23;

const fichiers = execFileSync("git", ["ls-files", "components", "app", "lib"], {
  encoding: "utf8",
})
  .split("\n")
  .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));

// Ce que Next monte tout seul : ces fichiers n ont pas a etre importes.
const ENTREES =
  /(^|\/)(page|layout|route|template|loading|error|not-found|global-error|default|middleware|sitemap|robots|opengraph-image|icon|apple-icon)\.tsx?$/;

const source = new Map();
for (const f of fichiers) {
  try {
    source.set(f, readFileSync(f, "utf8"));
  } catch {
    /* fichier disparu entre-temps */
  }
}

/** Un fichier est-il nomme quelque part ailleurs que dans lui-meme ? */
function estImporte(fichier) {
  const nom = basename(fichier).replace(/\.tsx?$/, "");
  // On cherche le nom du module dans un chemin d import, pas le nom du
  // composant : deux composants peuvent partager un nom, un chemin non.
  const motif = new RegExp(`["'\`][^"'\`]*/${nom}["'\`]|["'\`]\\./${nom}["'\`]`);
  for (const [autre, texte] of source) {
    if (autre === fichier) continue;
    if (motif.test(texte)) return true;
  }
  return false;
}

const morts = [];
for (const f of fichiers) {
  if (ENTREES.test(f)) continue;
  // Seuls les composants nous interessent : une fonction utilitaire inutilisee
  // ne fait perdre aucune fonctionnalite a personne.
  if (!f.endsWith(".tsx")) continue;
  if (!estImporte(f)) morts.push(f);
}

morts.sort();

if (morts.length <= PLAFOND) {
  console.log(`\n  ${morts.length} composant(s) non importe(s), plafond ${PLAFOND}. Rien de neuf.\n`);
  if (morts.length < PLAFOND) {
    console.log(`  Le plafond peut descendre a ${morts.length} dans scripts/verifier-code-mort.mjs.\n`);
  }
  process.exit(0);
}

console.log(`\n  ${morts.length} composant(s) que plus rien n importe, plafond ${PLAFOND} :\n`);
for (const f of morts) {
  const lignes = (source.get(f) ?? "").split("\n").length;
  console.log(`    ${f}  (${lignes} lignes)`);
}
console.log(`
  Un composant que rien n importe ne s affiche nulle part. S il porte une
  fonctionnalite, celle-ci est perdue sans que personne l ait decide — c est
  ainsi que le selecteur de theme a disparu pendant des mois.

  Soit on le rebranche, soit on le supprime. Le garder en l etat, c est le
  perdre en croyant l avoir.
`);
process.exit(1);
