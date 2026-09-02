/**
 * Tous les controles, en une commande.
 *
 *   npm run verifier
 *
 * Ils etaient eparpilles : personne ne les lançait tous, et le CI etait le
 * premier a voir les problemes. Ici, ils s enchainent et le rapport tient en un
 * ecran.
 *
 * Cinq d entre eux fonctionnent au CLIQUET — couleurs figees, textes non
 * traduits, erreurs de lint, composants debranches, cibles tactiles. Les
 * corriger tous d un coup n etait pas raisonnable, et un controle qui echoue
 * sur des dizaines de cas existants se fait desactiver, donc ne protege de
 * rien. Le nombre actuel est un plafond : une regression le depasse et echoue,
 * une correction l abaisse. La dette ne peut que decroitre.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POURQUOI CE FICHIER A CHANGE LE 01/09/2026
 *
 * Il affichait « ok » puis « Tout passe » alors qu il restait 102 couleurs
 * figees, 49 textes non traduits et 37 erreurs de lint. Chaque controle
 * imprimait pourtant son chiffre — l orchestrateur le jetait.
 *
 * Un cliquet vert ne veut pas dire « c est propre », il veut dire « ce n est
 * pas pire qu hier ». Confondre les deux, c est se mentir sur l etat du
 * produit ; ca s est vu, et ca a coute la confiance dans mes comptes rendus.
 *
 * Desormais le chiffre de chaque cliquet est affiche, et le total de la dette
 * restante est rappele en pied de rapport. Un rapport doit pouvoir etre lu par
 * quelqu un qui n ouvrira aucun des cinq scripts.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { execFileSync } from "node:child_process";

const CONTROLES = [
  { nom: "Types", cmd: ["npx", ["tsc", "--noEmit", "-p", "tsconfig.json"]] },
  { nom: "Contraste des deux themes", cmd: ["node", ["scripts/verifier-contraste.mjs"]] },
  { nom: "Cibles tactiles", cmd: ["node", ["scripts/verifier-cibles.mjs"]], cliquet: true },
  { nom: "Couleurs figees", cmd: ["node", ["scripts/verifier-couleurs.mjs"]], cliquet: true },
  { nom: "Composants debranches", cmd: ["node", ["scripts/verifier-code-mort.mjs"]], cliquet: true },
  { nom: "Textes non traduits", cmd: ["node", ["scripts/verifier-traductions.mjs"]], cliquet: true },
  { nom: "Erreurs de lint", cmd: ["node", ["scripts/verifier-lint.mjs"]], cliquet: true },
  { nom: "Notifications APNs", cmd: ["node", ["scripts/verifier-apns.mjs"]] },
  { nom: "Choix des notifications", cmd: ["node", ["scripts/verifier-planification.mjs"]] },
  { nom: "Prevision de la semaine", cmd: ["node", ["scripts/verifier-prevision.mjs"]] },
  { nom: "Liens magiques", cmd: ["node", ["scripts/verifier-liens-profonds.mjs"]] },
  { nom: "Cibles du guide", cmd: ["node", ["scripts/verifier-guide.mjs"]] },
  { nom: "Recits en dix langues", cmd: ["node", ["scripts/verifier-recits.mjs"]] },
  { nom: "Pages jetables", cmd: ["node", ["scripts/verifier-pages-jetables.mjs"]] },
  { nom: "Gabarit d environnement", cmd: ["node", ["scripts/verifier-env-exemple.mjs"]] },
  { nom: "Secrets en clair", cmd: ["node", ["scripts/verifier-secrets.mjs"]] },
];

/**
 * Les cliquets terminent par une ligne du genre
 *   « 102 couleur(s) figee(s), plafond 102. Rien de neuf. »
 * On en tire le compte courant et le plafond. Si la forme change un jour, on
 * renvoie null et le rapport affiche « ok » comme avant : un rapport qui
 * planterait parce qu une phrase a bouge serait pire que le probleme d origine.
 */
function chiffres(sortie) {
  const m = /(\d+)\s+[^\n]*?plafond\s+(\d+)/i.exec(sortie);
  if (!m) return null;
  return { restant: Number(m[1]), plafond: Number(m[2]) };
}

/** Le sujet compte, pas la tournure : « 102 couleur(s) figee(s), » -> « couleurs figees ». */
function sujet(sortie) {
  const m = /\d+\s+([^,\.]+?)\s*,\s*plafond/i.exec(sortie);
  return m ? m[1].replace(/\(s\)/g, "s").trim() : "";
}

let echecs = 0;
const dette = [];

console.log("");
for (const c of CONTROLES) {
  process.stdout.write(`  ${c.nom.padEnd(28)}`);
  let sortie = "";
  let ok = true;
  try {
    sortie = String(
      execFileSync(c.cmd[0], c.cmd[1], { stdio: "pipe", maxBuffer: 64 * 1024 * 1024 }) ?? "",
    );
  } catch (e) {
    ok = false;
    echecs++;
    sortie = String(e.stdout ?? "") + String(e.stderr ?? "");
  }

  if (!ok) {
    console.log("ECHEC");
    continue;
  }

  const n = c.cliquet ? chiffres(sortie) : null;
  if (!n) {
    console.log("ok");
    continue;
  }

  if (n.restant === 0) {
    console.log("ok        zero");
    continue;
  }

  // Le plafond peut avoir pris du retard sur la realite : une correction
  // ailleurs fait tomber le compte sans que personne ne descende le plafond.
  // On le dit, sinon la marge se remplit en silence et le cliquet ne mord plus.
  const marge = n.plafond > n.restant ? `  (plafond ${n.plafond} — a descendre)` : "";
  console.log(`ok        ${String(n.restant).padStart(3)} restants${marge}`);
  dette.push({ quoi: sujet(sortie), restant: n.restant, plafond: n.plafond });
}

console.log("");

if (echecs) {
  console.log(`  ${echecs} controle(s) en echec. Relance-le seul pour le detail :\n`);
  for (const c of CONTROLES) console.log(`    ${c.cmd[0]} ${c.cmd[1].join(" ")}`);
  console.log("");
  process.exit(1);
}

// Ces treize controles sont STATIQUES. Aucun n ouvre l app, aucun ne clique.
//
// C est leur limite, et elle a coute cher : un bouton de relance branche sur une
// clef qu il n effacait pas, un guide suspendu a un evenement devenu impossible,
// un reglage qui n enregistrait rien, une route qui lisait la reponse du moteur
// un niveau trop haut. Les quatre compilaient. Les quatre passaient ici.
//
// Les parcours vivent dans e2e/ et s executent en 36 secondes. Ils ne sont pas
// dans cette suite parce qu ils ont besoin d un serveur, mais ils sont dans
// `npm run avant-build`, qui est la commande a lancer avant de livrer.
console.log("  Ces controles sont statiques : aucun n ouvre l app.");
console.log("  Avant de livrer : npm run avant-build  (ceux-ci + les 21 parcours)\n");

if (dette.length) {
  const total = dette.reduce((s, d) => s + d.restant, 0);
  console.log("  Aucune regression. Ce qui reste a corriger :\n");
  for (const d of dette) console.log(`    ${String(d.restant).padStart(4)}  ${d.quoi}`);
  console.log(`\n    ${String(total).padStart(4)}  au total\n`);
} else {
  console.log("  Tout passe, et il ne reste rien.\n");
}
