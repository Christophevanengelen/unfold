/**
 * Une couleur d ACCENT ne peut pas etre la couleur d un texte qu on lit.
 *
 *   node scripts/verifier-couleur-texte.mjs
 *
 * ─── LE DEFAUT QUI A REVELE L ANGLE MORT ────────────────────────────────────
 *
 * Christophe, le 17/09 : « on voit pas ce qu on tape ». C etait litteral : le
 * texte saisi dans le formulaire de naissance s ecrivait en
 * `var(--accent-purple)`, qui vaut 4,00 sur le fond clair de la feuille. Le
 * seuil pour du texte courant est 4,5.
 *
 * `verifier-contraste.mjs` ne l a jamais vu, et ne pouvait pas : il verifie les
 * PAIRES DE JETONS declarees dans le feuillet — texte sur fond, bouton sur son
 * aplat. Il n a aucune idee de ce qu un composant fait avec un jeton. Or
 * `--accent-purple` passe ses propres controles : c est une couleur d accent
 * valide, pour des pastilles, des libelles courts, un grand chiffre. Le defaut
 * n est pas la couleur, c est son EMPLOI.
 *
 * Ce controle regarde donc l emploi : aucun element qui porte du texte qu on
 * LIT — un champ de saisie, un paragraphe, un texte courant — ne peut prendre
 * une couleur d accent.
 *
 * ─── CE QU IL N INTERDIT PAS ────────────────────────────────────────────────
 *
 * L accent reste l accent. Un libelle en capitales, un grand chiffre, une
 * pastille : ce sont des signaux, pas de la lecture, et le seuil de 4,5 ne les
 * vise pas. Le controle ne s en occupe pas.
 *
 * Et il n a aucun avis sur le design : il dit qu un texte doit etre lisible,
 * pas de quelle couleur il doit etre.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Les couleurs qui sont des ACCENTS, jamais du texte de lecture. */
const ACCENTS = ["--accent-purple", "--accent-pink", "--accent-orange", "--accent-blue", "--accent-green"];

/** Les elements dont le contenu se LIT. */
const LECTURE = ["input", "textarea", "select"];

function fichiers(racine) {
  const sortie = [];
  for (const nom of readdirSync(racine)) {
    if (nom === "node_modules" || nom === ".next" || nom.startsWith(".")) continue;
    const chemin = join(racine, nom);
    if (statSync(chemin).isDirectory()) sortie.push(...fichiers(chemin));
    else if (nom.endsWith(".tsx")) sortie.push(chemin);
  }
  return sortie;
}

const fautes = [];

for (const chemin of [...fichiers("components"), ...fichiers("app")]) {
  const src = readFileSync(chemin, "utf8");
  const lignes = src.split("\n");

  for (let i = 0; i < lignes.length; i += 1) {
    const ligne = lignes[i];
    const accent = ACCENTS.find((a) => ligne.includes(`color: "var(${a})"`));
    if (!accent) continue;

    // Une opacite sur la meme ligne dit que c est decoratif — et de toute
    // facon un texte a demi transparent n est pas du texte de lecture.
    if (/opacity/.test(ligne)) continue;

    // On remonte jusqu a la balise ouvrante pour savoir CE QUI porte la
    // couleur. Vingt lignes suffisent : au-dela, l attribut de style n est plus
    // dans la meme balise.
    let balise = null;
    for (let j = i; j >= Math.max(0, i - 20); j -= 1) {
      const m = lignes[j].match(/<\s*([a-zA-Z][a-zA-Z0-9]*)\b/);
      if (m) { balise = m[1]; break; }
    }
    if (balise && LECTURE.includes(balise)) {
      fautes.push({ chemin, ligne: i + 1, balise, accent });
    }
  }
}

if (fautes.length === 0) {
  console.log(
    `✓ Aucune couleur d accent employee comme couleur de texte saisi — ` +
      `${LECTURE.join(", ")} verifies dans components/ et app/.`,
  );
  process.exit(0);
}

console.log(`\n  ${fautes.length} champ(s) dont le texte s ecrit en couleur d accent :\n`);
for (const f of fautes) {
  console.log(`    ${f.chemin}:${f.ligne}  <${f.balise}>  ${f.accent}`);
}
console.log(`
  Un accent sert aux pastilles, aux libelles courts et aux grands chiffres.
  Ce qu une personne TAPE doit s ecrire en --text-heading : c est le dernier
  endroit d une app ou l on peut se permettre d etre decoratif.
`);
process.exit(1);
