/**
 * Les cibles tactiles trop petites.
 *
 * Apple demande 44 points au minimum. En dessous, on vise a cote — et
 * l impression qui reste n est pas « j ai mal vise », c est « cette app ne
 * repond pas bien ». C est un des defauts qui font qu un produit semble
 * inacheve sans qu on sache dire pourquoi.
 *
 * Trouves le 01/09/2026 : le bouton de PROFIL a 24 points, les points de
 * pagination a 16, le bouton de partage de la fiche de capsule a 28, le retour
 * de la personnalisation sans aucune taille declaree.
 *
 * La bonne correction n est pas toujours d agrandir : sur le bouton de profil,
 * passer de 24 a 44 aurait deplace tout l en-tete. On etend alors la zone de
 * touche avec un pseudo-element — `before:-inset-*` — ce qui laisse le dessin
 * intact. Le controle accepte les deux formes.
 *
 *   node scripts/verifier-cibles.mjs
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const PLAFOND = 0;

const fichiers = execFileSync("git", ["ls-files", "components", "app"], { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.endsWith(".tsx") && !f.includes("/astro/"))
  // `git ls-files` liste ce que git CONNAIT, pas ce qui existe sur le disque :
  // un fichier supprime mais pas encore indexe y figure encore. Sans ce filtre
  // le controle mourait sur un ENOENT avec une trace de pile, au lieu de dire
  // ce qu il verifiait. Un outil de verification qui plante ne verifie rien.
  .filter((f) => existsSync(f));

const petites = [];

for (const f of fichiers) {
  let texte;
  try {
    texte = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  const lignes = texte.split("\n");
  lignes.forEach((l, i) => {
    if (!/<button|motion\.button/.test(l)) return;
    // On ne lit QUE l element bouton lui-meme, jusqu a son « > » de fermeture.
    // Lire douze lignes de contexte attrapait les icones a l interieur : une
    // icone de 12 points dans un bouton de 48 n est pas un defaut, et un
    // controle qui crie au loup finit par etre ignore.
    let fin = i;
    while (fin < lignes.length && fin < i + 14 && !/^\s*>|\/>\s*$|>\s*$/.test(lignes[fin])) fin++;
    const ctx = lignes.slice(i, fin + 1).join("\n");

    // Une zone etendue par pseudo-element compte comme suffisante : c est la
    // correction volontaire quand agrandir deplacerait la mise en page.
    if (/before:-inset-/.test(ctx)) return;

    const px = /(?:height|minHeight):\s*(\d+)/.exec(ctx);
    if (px) {
      if (Number(px[1]) < 44) petites.push(`${f}:${i + 1}  ${px[1]}px`);
      return;
    }
    const tw = /\bh-(\d+)\b/.exec(ctx);
    if (tw && Number(tw[1]) * 4 < 44) {
      petites.push(`${f}:${i + 1}  h-${tw[1]} = ${Number(tw[1]) * 4}px`);
    }
  });
}

if (petites.length <= PLAFOND) {
  console.log(`\n  ${petites.length} cible(s) sous 44 points, plafond ${PLAFOND}. Rien de neuf.\n`);
  process.exit(0);
}

console.log(`\n  ${petites.length} cible(s) tactile(s) sous 44 points, plafond ${PLAFOND} :\n`);
for (const p of petites) console.log(`    ${p}`);
console.log(`
  Soit on agrandit, soit on etend la zone avec before:-inset-* quand agrandir
  deplacerait la mise en page. Les deux sont acceptes.
`);
process.exit(1);
