/**
 * Aucune page jetable ne part en production.
 *
 * POURQUOI CE CONTROLE EXISTE
 *
 * Le 01/09/2026, une equipe a cree `app/[locale]/verif-contours/page.tsx` pour
 * regarder son travail a l ecran. Elle l a honnetement marquee « PAGE JETABLE —
 * A SUPPRIMER apres la revue », et ne l a pas supprimee.
 *
 * Le fichier n etait pas suivi par git, donc invisible dans `git diff` et dans
 * toute relecture. Il serait parti au premier `git add -A` — c est-a-dire au
 * commit suivant — et l export statique aurait livre une route de debug montant
 * des composants hors de leur contexte, atteignable par n importe qui.
 *
 * Ce controle regarde le DISQUE, pas l index de git : c est justement ce que
 * personne ne regardait.
 */

import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Les mots par lesquels quelqu un signale son propre code temporaire. */
const AVEUX = [
  "PAGE JETABLE",
  "A SUPPRIMER",
  "À SUPPRIMER",
  "FICHIER JETABLE",
  "TEMPORAIRE — A RETIRER",
];

function routes(racine, acc = []) {
  let entrees;
  try {
    entrees = readdirSync(racine);
  } catch {
    return acc;
  }
  for (const nom of entrees) {
    const chemin = join(racine, nom);
    if (statSync(chemin).isDirectory()) routes(chemin, acc);
    else if (/^(page|route|layout)\.tsx?$/.test(nom)) acc.push(chemin);
  }
  return acc;
}

const fautives = [];
for (const f of routes("app")) {
  const contenu = readFileSync(f, "utf8");
  const aveu = AVEUX.find((a) => contenu.includes(a));
  if (aveu) fautives.push({ f, aveu });
}

console.log("");
if (fautives.length) {
  console.log("  Page(s) de debug encore presente(s) dans app/ :\n");
  for (const x of fautives) console.log(`    ${x.f}\n        se declare « ${x.aveu} »`);
  console.log("\n  Une route dans app/ est livree par l export statique, donc");
  console.log("  atteignable par n importe qui. Retire-la, ou retire l aveu si");
  console.log("  elle doit rester.\n");
  process.exit(1);
}
console.log(`  ${routes("app").length} routes, aucune page jetable.\n`);
