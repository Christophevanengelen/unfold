/**
 * Cliquet sur les erreurs ESLint.
 *
 * Quatre-vingt-une erreurs existaient au 1er septembre 2026 — pour l essentiel
 * la severite accrue de React 19 (`set-state-in-effect`, `refs`). Aucune n est
 * active aujourd hui, et les corriger toutes d un coup n etait pas raisonnable.
 *
 * Meme logique que pour les couleurs et les traductions : ce nombre est un
 * plafond. Une erreur de plus fait echouer le CI, une correction abaisse le
 * plafond. La dette ne peut que decroitre.
 *
 * Le linter avait d ailleurs rattrape ce jour-la une vraie regression :
 * `checkAndUpdateStreak()` supprime par erreur, ce qui aurait fige la serie de
 * tout le monde a zero, sans erreur nulle part.
 *
 * ELARGI LE 17 SEPTEMBRE 2026 A TOUT LE DEPOT. Il ne regardait que lib, app et
 * components : une erreur dans scripts/ passait sans bruit, et il y en avait
 * une (`module` reaffecte dans verifier-traductions.mjs). Le passage a `eslint .`
 * n a ete possible qu apres avoir mis ios/ et android/ dans les ignores — sinon
 * le controle lisait l export statique recopie par Capacitor, soit cent
 * cinquante erreurs du compilateur, remises a zero a chaque `cap sync`.
 *
 *   node scripts/verifier-lint.mjs
 */

import { execFileSync } from "node:child_process";

/**
 * On ne linte QUE ce que git suit.
 *
 * Elargir le controle a tout le depot le 17/09 a d abord fait lire ios/ et
 * android/, ou Capacitor recopie l export compile. Ecartes dans
 * eslint.config.mjs, ils ont ete suivis le meme jour par e2e/.rapport/, le
 * rapport HTML que Playwright venait d ecrire — 259 erreurs d un coup, dont
 * 186 dans le code minifie de son propre visualiseur.
 *
 * Ecarter les dossiers un par un est une course perdue : chaque outil ajoute
 * le sien, et le controle ne tombe qu APRES avoir tourne. La question n est
 * pas « quels dossiers exclure » mais « qu est-ce qui est a nous » — et git le
 * sait deja. Tout ce qui est engendre est dans un .gitignore, y compris celui
 * de e2e/ qu une liste centrale aurait oublie.
 */
function fichiersSuivis() {
  const sortie = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return sortie
    .split("\0")
    .filter((f) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f));
}

const PLAFOND = 0;

/**
 * Second plafond, sur un avertissement precis.
 *
 * `react-hooks/set-state-in-effect` est passe en avertissement dans
 * eslint.config.mjs — la raison longue y est ecrite : l app est livree en
 * export statique, et ces treize effets lisent tous quelque chose qui n existe
 * que dans le navigateur. Les supprimer creerait des divergences
 * d hydratation.
 *
 * Un avertissement sans compteur est un avertissement mort. Celui-ci est donc
 * plafonne comme les erreurs : quatorze fait echouer, douze abaisse le
 * plafond.
 */
const REGLE_PLAFONNEE = "react-hooks/set-state-in-effect";
const PLAFOND_REGLE = 13;

let sortie = "[]";
try {
  sortie = execFileSync("npx", ["eslint", "--no-warn-ignored", "-f", "json", ...fichiersSuivis()], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
} catch (e) {
  // ESLint sort en erreur des qu il trouve quelque chose : c est attendu.
  sortie = e.stdout || "[]";
}

let erreurs = 0;
let plafonnee = 0;
const parRegle = new Map();
for (const f of JSON.parse(sortie)) {
  for (const m of f.messages) {
    if (m.ruleId === REGLE_PLAFONNEE && m.severity === 1) plafonnee++;
    if (m.severity !== 2) continue;
    erreurs++;
    const r = m.ruleId ?? "?";
    parRegle.set(r, (parRegle.get(r) ?? 0) + 1);
  }
}

if (plafonnee > PLAFOND_REGLE) {
  console.log(`
  ${plafonnee} cas de ${REGLE_PLAFONNEE}, plafond ${PLAFOND_REGLE} : ${plafonnee - PLAFOND_REGLE} de trop.

  Un etat pose en tete d effet. Si la valeur est lisible au rendu, calcule-la au
  rendu. Si elle n existe que dans le navigateur — stockage local, barre
  d adresse — l effet est la bonne reponse : ajoute le cas au plafond et dis
  pourquoi. Ne l enveloppe pas dans un IIFE asynchrone, ca ne differe rien.

  npx eslint .   pour le detail.
`);
  process.exit(1);
}
if (plafonnee < PLAFOND_REGLE) {
  console.log(`\n  ${REGLE_PLAFONNEE} : ${plafonnee} cas, le plafond peut descendre a ${plafonnee}.`);
}

if (erreurs <= PLAFOND) {
  console.log(`\n  ${erreurs} erreur(s) ESLint, plafond ${PLAFOND}. Rien de neuf.`);
  if (erreurs < PLAFOND) console.log(`\n  Le plafond peut descendre a ${erreurs} dans scripts/verifier-lint.mjs.`);
  console.log("");
  process.exit(0);
}

console.log(`\n  ${erreurs} erreurs ESLint, plafond ${PLAFOND} : ${erreurs - PLAFOND} de trop.\n`);
for (const [r, n] of [...parRegle].sort((a, b) => b[1] - a[1])) console.log(`    ${String(n).padStart(3)}  ${r}`);
console.log(`
  npx eslint .   pour le detail.
`);
process.exit(1);
