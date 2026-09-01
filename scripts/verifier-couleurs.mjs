/**
 * Refuse les couleurs ecrites en dur dans les composants.
 *
 * Le systeme de design existe et il est bon : cent soixante-six jetons dans
 * app/globals.css, une nomenclature semantique, un bloc `.dark` complet. Son
 * probleme n a jamais ete l absence, c est la FUITE — un composant qui ecrit
 * `color: "white"` au lieu d un jeton, et qui devient illisible dans l autre
 * theme sans que personne ne s en apercoive.
 *
 * Le 1er septembre 2026, deux elements de l onboarding etaient invisibles en
 * theme clair : le repere « NOW » en blanc sur fond blanc, et une pastille en
 * lilas pale sur mauve pale. Les deux avaient ete dessines en sombre, et
 * personne n avait regarde en clair.
 *
 * Corriger ces deux-la n empeche pas la troisieme. Ce fichier, si.
 *
 *   node scripts/verifier-couleurs.mjs
 */

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

/**
 * Ce qui a le droit d etre ecrit en dur, et pourquoi.
 *
 * Ce ne sont pas des exceptions de confort : ce sont des couleurs qui portent
 * une DONNEE et non un theme. La couleur d un domaine de vie doit rester la
 * meme en clair et en sombre, sinon elle cesse d identifier ce qu elle designe.
 */
const AUTORISES = [
  { motif: /lib\/domain-config/, raison: "couleurs des domaines de vie — donnee, pas theme" },
  { motif: /lib\/planet-/, raison: "couleurs des planetes — donnee" },
  { motif: /StepPriorities/, raison: "couleurs des domaines, reprises du meme referentiel" },
  { motif: /StepSignalPreview/, raison: "couleurs des boudins de demonstration — donnee" },
  { motif: /opengraph-image/, raison: "image sociale rendue hors navigateur, sans theme" },
  { motif: /\.test\.|verifier-/, raison: "outils" },
  {
    motif: /^app\/api\//,
    raison:
      "rapports HTML et PDF rendus hors navigateur : ils n ont pas de theme, " +
      "leurs couleurs sont celles du document lui-meme",
  },
  {
    motif: /^app\/app\/astro\//,
    raison:
      "AstroLearn, outil interne derriere authentification — pas l app grand " +
      "public, et pas soumis au meme exigence de theme",
  },
  {
    motif: /^app\/admin\//,
    raison: "back-office interne",
  },
];

// On ne regarde que ce qui habille du TEXTE ou une SURFACE : c est la que
// l inversion clair/sombre se voit. Une couleur de trace SVG dans une
// illustration ne pose pas le meme probleme.
const SUSPECT = /(?:^|[^a-zA-Z-])(color|background|backgroundColor|borderColor)\s*:\s*["'](white|black|#[0-9A-Fa-f]{3,8}|rgba?\([^)]*\))["']/g;

const fichiers = execFileSync("git", ["ls-files", "components", "app"], { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));

const fuites = [];
for (const f of fichiers) {
  const dispense = AUTORISES.find((a) => a.motif.test(f));
  if (dispense) continue;
  const texte = readFileSync(f, "utf8");
  const lignes = texte.split("\n");
  lignes.forEach((ligne, i) => {
    if (ligne.trimStart().startsWith("//") || ligne.trimStart().startsWith("*")) return;
    SUSPECT.lastIndex = 0;
    const m = SUSPECT.exec(ligne);
    if (m) fuites.push({ f, ligne: i + 1, quoi: m[0].trim() });
  });
}

/**
 * Le cliquet.
 *
 * Cent cinquante-six couleurs figees existaient dans l app grand public au
 * 1er septembre 2026. Les corriger toutes d un coup n etait pas raisonnable, et
 * un controle qui echoue sur cent cinquante-six cas se fait desactiver le
 * lendemain — donc ne protege de rien.
 *
 * Ce nombre devient donc un PLAFOND. Une fuite de plus fait echouer le CI ; une
 * correction abaisse le plafond. La dette ne peut que decroitre, et personne
 * n a besoin d y penser.
 *
 * Quand tu corriges des couleurs, baisse ce nombre du meme compte. Le message
 * d erreur te dit lequel ecrire.
 */
const PLAFOND = 121;

if (fuites.length === 0) {
  console.log("\n  Aucune couleur ecrite en dur. Le theme tient.\n");
  process.exit(0);
}

if (fuites.length <= PLAFOND) {
  console.log(`\n  ${fuites.length} couleur(s) figee(s), plafond ${PLAFOND}. Rien de neuf.`);
  if (fuites.length < PLAFOND) {
    console.log(`\n  Le plafond peut descendre a ${fuites.length} dans scripts/verifier-couleurs.mjs.`);
  }
  console.log("");
  process.exit(0);
}

console.log(`\n  ${fuites.length} couleurs figees, plafond ${PLAFOND} : ${fuites.length - PLAFOND} de trop.\n`);
for (const x of fuites) console.log(`    ${x.f}:${x.ligne}  ${x.quoi}`);
console.log(`
  Utilise un jeton de app/globals.css plutot qu une valeur figee :

    texte courant .......... var(--text-body)
    titre .................. var(--text-heading)
    texte secondaire ....... var(--text-body-subtle)
    texte sur bouton colore  var(--text-on-brand)
    fond ................... var(--bg-primary) / var(--bg-secondary)
    bordure ................ var(--border-light)

  Une couleur qui porte une DONNEE — un domaine de vie, une planete — a le
  droit d etre figee : ajoute son fichier a AUTORISES, avec la raison.
`);
process.exit(1);
