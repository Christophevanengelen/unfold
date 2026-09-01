/**
 * Tous les controles, en une commande.
 *
 *   npm run verifier
 *
 * Ils etaient eparpilles : personne ne les lançait tous, et le CI etait le
 * premier a voir les problemes. Ici, ils s enchainent et le rapport tient en un
 * ecran.
 *
 * Trois d entre eux fonctionnent au CLIQUET — couleurs figees, textes non
 * traduits, erreurs de lint. Les corriger tous d un coup n etait pas
 * raisonnable, et un controle qui echoue sur des dizaines de cas existants se
 * fait desactiver, donc ne protege de rien. Le nombre actuel est un plafond :
 * une regression le depasse et echoue, une correction l abaisse. La dette ne
 * peut que decroitre.
 */

import { execFileSync } from "node:child_process";

const CONTROLES = [
  { nom: "Types", cmd: ["npx", ["tsc", "--noEmit", "-p", "tsconfig.json"]] },
  { nom: "Contraste des deux themes", cmd: ["node", ["scripts/verifier-contraste.mjs"]] },
  { nom: "Couleurs figees (cliquet)", cmd: ["node", ["scripts/verifier-couleurs.mjs"]] },
  { nom: "Textes non traduits (cliquet)", cmd: ["node", ["scripts/verifier-traductions.mjs"]] },
  { nom: "Erreurs de lint (cliquet)", cmd: ["node", ["scripts/verifier-lint.mjs"]] },
  { nom: "Notifications APNs", cmd: ["node", ["scripts/verifier-apns.mjs"]] },
  { nom: "Choix des notifications", cmd: ["node", ["scripts/verifier-planification.mjs"]] },
  { nom: "Liens magiques", cmd: ["node", ["scripts/verifier-liens-profonds.mjs"]] },
];

let echecs = 0;
console.log("");
for (const c of CONTROLES) {
  process.stdout.write(`  ${c.nom.padEnd(34)}`);
  try {
    execFileSync(c.cmd[0], c.cmd[1], { stdio: "pipe", maxBuffer: 64 * 1024 * 1024 });
    console.log("ok");
  } catch {
    console.log("ECHEC");
    echecs++;
  }
}

console.log("");
if (echecs) {
  console.log(`  ${echecs} controle(s) en echec. Relance-le seul pour le detail :\n`);
  for (const c of CONTROLES) console.log(`    ${c.cmd[0]} ${c.cmd[1].join(" ")}`);
  console.log("");
  process.exit(1);
}
console.log("  Tout passe.\n");
