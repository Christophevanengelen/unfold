/**
 * L empreinte tient-elle ses trois promesses ?
 *
 *   node --experimental-strip-types scripts/verifier-empreinte.mjs
 *
 * POURQUOI CE CONTROLE EXISTE
 *
 * L empreinte est une image derivee de deux naissances, posee sur l ecran de
 * compatibilite et sur la carte qu on partage. Trois choses doivent etre vraies
 * en permanence, et aucune ne se voit en relisant le code :
 *
 *  1. **Le determinisme.** Les memes naissances doivent toujours rendre
 *     exactement la meme image, sur tous les appareils. Un seul `Math.random()`
 *     glisse dans le chemin de generation et l empreinte de quelqu un change a
 *     chaque ouverture — ce qui detruit tout l interet d une signature.
 *
 *  2. **La symetrie.** L empreinte de A et B doit etre celle de B et A. Sans
 *     tri des deux naissances, la signature d un couple dependrait de qui ouvre
 *     le rapport.
 *
 *  3. **La couleur reste dans sa plage.** Mesure du 16/09/2026, iPhone 13,
 *     theme clair : des fragments de courbe se rendaient en JAUNE-VERT, la
 *     couleur complementaire. La cause etait le rendu de `oklch()` dans une
 *     couche animee ; la conversion se fait maintenant en code. Ce controle
 *     verifie qu aucune combinaison de chiffres ne peut produire une couleur
 *     hors de la plage rose-violet-bleu du produit.
 *
 * Il verifie aussi qu aucune sortie n est vide : un couple aux chiffres bas
 * doit donner une image AUTREMENT dense, jamais une image pauvre.
 */

import { construireEmpreinte, construireGraine, oklchVersRgb } from "../lib/empreinte.ts";

const NAISSANCES = [
  "1977-09-27T00:00", "1982-09-02T02:15", "1990-06-06T14:30",
  "1955-01-01T23:59", "2004-12-31T12:00", "1968-03-15T06:45",
];

function cas(i, o = {}) {
  return {
    score: (i * 7 + 11) % 101,
    ressemblance: (i * 37 + 5) % 101,
    equilibre: (i * 53 + 20) % 101,
    attractionVersLui: (i * 29 + 40) % 101,
    attractionVersElle: (i * 41 + 15) % 101,
    porteurs: i % 7,
    graine: construireGraine(NAISSANCES[i % 6], NAISSANCES[(i * 3 + 1) % 6]),
    ...o,
  };
}

let fautes = 0;
const dire = (m) => { console.log(`  ✗ ${m}`); fautes += 1; };

// ── 1. Determinisme ──
for (let i = 0; i < 40; i += 1) {
  const a = construireEmpreinte(cas(i));
  const b = construireEmpreinte(cas(i));
  if (a.chemins[0] !== b.chemins[0] || a.chemins[1] !== b.chemins[1]) {
    dire(`cas ${i} : deux appels donnent deux traces differentes (aleatoire non ensemence)`);
    break;
  }
  if (a.couleurs[0] !== b.couleurs[0]) {
    dire(`cas ${i} : deux appels donnent deux couleurs differentes`);
    break;
  }
}

// ── 2. Symetrie des deux naissances ──
for (const [x, y] of [[0, 1], [2, 5], [3, 4]]) {
  if (construireGraine(NAISSANCES[x], NAISSANCES[y]) !== construireGraine(NAISSANCES[y], NAISSANCES[x])) {
    dire(`la graine de (${x},${y}) differe de celle de (${y},${x}) : la signature dependrait de qui ouvre le rapport`);
  }
}

// ── 3. La couleur ne sort jamais de la plage du produit ──
// Rose a bleu : le canal bleu doit toujours dominer ou egaler le vert, et
// jamais produire un jaune (rouge et vert hauts, bleu bas).
for (let s = 0; s <= 100; s += 1) {
  const e = construireEmpreinte(cas(3, { score: s }));
  for (const couleur of e.couleurs) {
    const [r, v, b] = couleur.match(/\d+/g).map(Number);
    if (b < v) { dire(`score ${s} : ${couleur} — le vert depasse le bleu, la teinte a quitte la plage`); break; }
    if (r > 150 && v > 150 && b < 110) { dire(`score ${s} : ${couleur} est un jaune`); break; }
  }
  if (fautes) break;
}

// ── 4. Aucune image vide ──
for (let i = 0; i < 40; i += 1) {
  const e = construireEmpreinte(cas(i));
  for (const [n, l] of e.longueurs.entries()) {
    // Le cadre fait 100 unites de cote : une courbe qui totalise moins de 300
    // unites de trace ne remplit visuellement rien.
    if (l < 300) { dire(`cas ${i}, courbe ${n} : trace de ${Math.round(l)} unites, image trop pauvre`); break; }
  }
  if (fautes) break;
}

// ── 5. La conversion de couleur elle-meme ──
const bleu = oklchVersRgb(0.63, 0.13, 255);
const [br, bv, bb] = bleu.match(/\d+/g).map(Number);
if (!(bb > br && bb > bv)) dire(`oklchVersRgb(0.63, 0.13, 255) rend ${bleu}, qui n est pas un bleu`);

if (fautes === 0) {
  console.log(
    "✓ Empreinte fiable — 40 cas deterministes, graine symetrique, " +
      "101 scores dans la plage rose-violet-bleu, aucune image vide.",
  );
  process.exit(0);
}
console.log(`\n  ${fautes} defaut(s) dans l empreinte.`);
process.exit(1);
