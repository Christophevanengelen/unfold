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
 *   node scripts/verifier-lint.mjs
 */

import { execFileSync } from "node:child_process";

const PLAFOND = 0;

let sortie = "[]";
try {
  sortie = execFileSync("npx", ["eslint", "lib", "app", "components", "--ext", ".ts,.tsx", "-f", "json"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
} catch (e) {
  // ESLint sort en erreur des qu il trouve quelque chose : c est attendu.
  sortie = e.stdout || "[]";
}

let erreurs = 0;
const parRegle = new Map();
for (const f of JSON.parse(sortie)) {
  for (const m of f.messages) {
    if (m.severity !== 2) continue;
    erreurs++;
    const r = m.ruleId ?? "?";
    parRegle.set(r, (parRegle.get(r) ?? 0) + 1);
  }
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
  npx eslint lib app components --ext .ts,.tsx   pour le detail.
`);
process.exit(1);
