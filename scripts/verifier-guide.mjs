/**
 * Le guide designe-t-il des choses qui existent ?
 *
 * POURQUOI CE CONTROLE EXISTE
 *
 * Le 01/09/2026, le deuxieme pas du guide encadrait un rectangle vide. Sa
 * cible etait « l union de tous les data-guide » ; il n en existait que deux,
 * aux deux extremites de l ecran. Le guide framait donc le vide entre eux, en
 * annoncant « ta vie, de bas en haut ».
 *
 * Rien ne pouvait attraper ca : le code compilait, les textes etaient traduits,
 * les contrastes passaient. C est la troisieme fois de la journee qu un
 * declencheur pointe vers quelque chose qui n existe pas — le bouton de
 * relance du guide, l evenement de montage, et maintenant une cible.
 *
 * Ce controle ferme la famille : chaque selecteur declare dans FirstUseGuide
 * doit correspondre a un attribut REELLEMENT pose dans un composant.
 *
 * Il ne prouve pas que la cible est visible a l ecran — seul un vrai parcours
 * le prouverait. Il prouve qu elle est posee quelque part, ce qui est
 * exactement le defaut qu on vient de payer.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const GUIDE = "components/demo/FirstUseGuide.tsx";

function fichiers(racine, acc = []) {
  for (const nom of readdirSync(racine)) {
    const chemin = join(racine, nom);
    if (statSync(chemin).isDirectory()) fichiers(chemin, acc);
    else if (/\.tsx?$/.test(nom)) acc.push(chemin);
  }
  return acc;
}

const source = readFileSync(GUIDE, "utf8");

// selecteur: '[data-guide="capsule"]'  ou  selecteur: "[data-guide-courant]"
const selecteurs = [...source.matchAll(/selecteur:\s*(['"])(.*?)\1/g)].map((m) => m[2]);

if (selecteurs.length === 0) {
  console.log("\n  Aucun selecteur trouve dans le guide. La forme du fichier a change.\n");
  process.exit(1);
}

// On cherche l attribut, pas le selecteur : dans le JSX il s ecrit
// `data-guide="capsule"` ou `data-guide-courant={...}`.
function attendu(selecteur) {
  const avecValeur = /^\[([a-z-]+)="([^"]+)"\]$/.exec(selecteur);
  if (avecValeur) return { attribut: avecValeur[1], valeur: avecValeur[2] };
  const nu = /^\[([a-z-]+)\]$/.exec(selecteur);
  if (nu) return { attribut: nu[1], valeur: null };
  return null;
}

/**
 * On ne lit que le CODE, jamais les commentaires.
 *
 * Premiere version de ce controle : elle passait alors que le repere venait
 * d etre retire du JSX. La ligne de commentaire juste au-dessus contenait
 * data-guide="capsule" pour expliquer a quoi il servait — et le controle la
 * comptait comme une preuve. Un controle qui se satisfait de sa propre
 * documentation ne verifie rien.
 *
 * Filtrage par ligne plutot que par expression : retirer « // jusqu a la fin
 * de la ligne » couperait aussi les adresses https:// et pourrait emporter du
 * vrai code place sur la meme ligne.
 */
function sansCommentaires(source) {
  return source
    .split("\n")
    .filter((ligne) => {
      const l = ligne.trim();
      return !l.startsWith("//") && !l.startsWith("*") && !l.startsWith("/*");
    })
    .join("\n");
}

const sources = [...fichiers("components"), ...fichiers("app")].filter((f) => f !== GUIDE);
const corpus = sources.map((f) => sansCommentaires(readFileSync(f, "utf8")));

const manquants = [];
for (const sel of selecteurs) {
  const a = attendu(sel);
  if (!a) {
    manquants.push({ sel, raison: "forme de selecteur non reconnue" });
    continue;
  }
  const motif = a.valeur
    ? new RegExp(`${a.attribut}\\s*=\\s*(["'\`])${a.valeur}\\1`)
    : new RegExp(`${a.attribut}\\s*=`);
  const trouve = corpus.some((c) => motif.test(c));
  if (!trouve) manquants.push({ sel, raison: "aucun composant ne pose cet attribut" });
}

console.log("");
if (manquants.length) {
  console.log("  Le guide designe des cibles qui n existent pas :\n");
  for (const m of manquants) console.log(`    ${m.sel}\n        ${m.raison}`);
  console.log("\n  Un pas qui pointe le vide est pire que pas de pas.\n");
  process.exit(1);
}
console.log(`  ${selecteurs.length} cible(s) du guide, toutes posees dans un composant.\n`);
