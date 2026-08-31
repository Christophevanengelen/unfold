/**
 * Verifie le choix des notifications, sans reseau ni base.
 *
 * planifier() est une fonction pure : on peut donc la mettre a l epreuve sur
 * deux annees entieres en une seconde, plutot que d attendre qu une vraie
 * periode s ouvre pour savoir si le reglage est bon. C est toute la raison pour
 * laquelle elle ne lit ni l heure, ni la base.
 *
 * Le fichier de reference est une reponse du moteur enregistree une fois, pour
 * que le test ne dependent pas d un service tiers.
 *
 *   node scripts/verifier-planification.mjs
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REFERENCE = "scripts/reference-zr.json";
if (!existsSync(REFERENCE)) {
  console.error(`Manque ${REFERENCE}`);
  process.exit(1);
}

const dossier = mkdtempSync(join(tmpdir(), "plan-"));
for (const f of ["push-planification", "push-textes"]) {
  execFileSync("npx", ["esbuild", `lib/${f}.ts`, "--bundle", "--platform=node",
    "--format=esm", `--outfile=${join(dossier, f)}.mjs`, "--log-level=error"], { stdio: "inherit" });
}
const { planifier, ESPACEMENT_MINIMUM } = await import(join(dossier, "push-planification.mjs"));
const { ecrire, LANGUES } = await import(join(dossier, "push-textes.mjs"));

const JOUR = 86_400_000;
let echecs = 0;
const verifier = (nom, condition) => {
  if (!condition) echecs++;
  console.log(`${condition ? "  ok  " : "ECHEC "} ${nom}`);
};

const releasing = JSON.parse(readFileSync(REFERENCE, "utf8")).data.releasing;
const jours = (n, depart = Date.UTC(2026, 8, 1)) =>
  Array.from({ length: n }, (_, i) => new Date(depart + i * JOUR));

console.log("\nLe choix");

verifier("jamais plus d une notification le meme matin",
  jours(730).every((j) => planifier(releasing, j, { cadence: "tout" }).length <= 1));

verifier("meme jour, meme resultat — la clef ne depend pas de l heure du calcul",
  JSON.stringify(planifier(releasing, new Date("2026-12-30T04:00:00Z"), {})) ===
  JSON.stringify(planifier(releasing, new Date("2026-12-30T22:00:00Z"), {})));

verifier("moteur muet : aucune notification, aucune exception",
  planifier(null, new Date(Date.UTC(2026, 8, 15)), {}).length === 0 &&
  planifier(undefined, new Date(Date.UTC(2026, 8, 15)), {}).length === 0);

verifier("un mois vide ne produit pas d avis de debut de mois",
  planifier({ periods: [] }, new Date(Date.UTC(2026, 8, 1)), {}).length === 0);

const vues = new Set();
let repetee = false;
for (const j of jours(730)) {
  for (const n of planifier(releasing, j, { cadence: "tout" })) {
    if (vues.has(n.cle)) repetee = true;
    vues.add(n.cle);
  }
}
verifier("aucune clef repetee sur deux ans — donc aucun doublon possible", !repetee);

console.log("\nLes trois crans");
const compter = (c) =>
  jours(365).reduce((t, j) => t + planifier(releasing, j, { cadence: c }).length, 0);
const [essentiel, normal, tout] = ["essentiel", "normal", "tout"].map(compter);
verifier(`essentiel ${essentiel} < normal ${normal} < tout ${tout}, sur douze mois`,
  essentiel < normal && normal < tout);
verifier("plus la cadence est dense, plus le plancher d espacement est court",
  ESPACEMENT_MINIMUM.essentiel > ESPACEMENT_MINIMUM.normal &&
  ESPACEMENT_MINIMUM.normal > ESPACEMENT_MINIMUM.tout);

console.log("\nLes textes");
const base = { cle: "x", nature: "periode", ecran: "timeline", regroupement: "periode",
               importance: "sommet", jour: "2026-12-31" };
const cas = [base, { ...base, importance: "bascule" },
             { ...base, nature: "mois", importance: "mois", compte: 3 },
             { ...base, nature: "mois", importance: "mois", compte: 1 }];

let complets = true, courts = true, substitue = true;
for (const langue of LANGUES) {
  for (const c of cas) {
    const { titre, corps } = ecrire(c, langue);
    if (!titre || !corps) complets = false;
    // iOS coupe le titre vers 35 caracteres sur l ecran verrouille.
    if ([...titre].length > 35) { courts = false; console.log(`      trop long (${langue}) : ${titre}`); }
    if ((titre + corps).includes("{n}")) substitue = false;
  }
}
verifier(`les ${LANGUES.length} langues ont un titre et un corps`, complets);
verifier("aucun titre ne depasse la coupe d iOS", courts);
verifier("le nombre est substitue partout", substitue);
verifier("langue inconnue : anglais, pas de plantage",
  ecrire(base, "xx").titre === ecrire(base, "en").titre);
verifier("langue absente : anglais",
  ecrire(base, null).titre === ecrire(base, "en").titre);
verifier("un seul moment se dit au singulier",
  ecrire({ ...base, nature: "mois", compte: 1 }, "fr").corps.includes("Un moment"));

rmSync(dossier, { recursive: true, force: true });
console.log(echecs === 0 ? "\nTout passe.\n" : `\n${echecs} echec(s).\n`);
process.exit(echecs === 0 ? 0 : 1);
