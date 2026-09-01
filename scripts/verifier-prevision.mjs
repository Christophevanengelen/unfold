/**
 * La prevision de la semaine, verifiee.
 *
 * Cette fonction remplace mockForecast et mockToday — des chiffres inventes que
 * l onboarding montrait a chacun comme les siens, dont un ecran de VENTE
 * affichant de faux pics « for credibility ».
 *
 * Elle est pure : pas de reseau, pas d horloge implicite. On peut donc la
 * passer sur des annees de phases en une seconde, ce qui est le seul moyen
 * d etre sur qu elle ne produira pas d aberration chez quelqu un.
 *
 *   node scripts/verifier-prevision.mjs
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dossier = mkdtempSync(join(tmpdir(), "prev-"));
// npx est un .cmd sous Windows : sans shell, execFileSync le rate avec ENOENT.
execFileSync("npx", ["esbuild", "lib/prevision-semaine.ts", "--bundle",
  "--platform=node", "--format=esm", `--outfile=${join(dossier, "p.mjs")}`,
  "--log-level=error"], { stdio: "inherit", shell: true });
// import() dynamique refuse un chemin Windows brut (C:\...) : il lui faut une URL file://.
const { previsionSemaine, scoresDuJour, phaseDominante, prochainePeriodeForte } = await import(pathToFileURL(join(dossier, "p.mjs")));

let echecs = 0;
const verifier = (nom, condition) => {
  if (!condition) echecs++;
  console.log(`${condition ? "  ok  " : "ECHEC "} ${nom}`);
};

const jour = (n) => new Date(Date.UTC(2026, 8, 1) + n * 86_400_000);
const iso = (d) => d.toISOString().slice(0, 10);

const phase = (debut, fin, intensite, domain = "work") => ({
  id: `${debut}-${fin}`, domain, title: "t", subtitle: "", description: "",
  startDate: iso(jour(debut)), endDate: fin === null ? undefined : iso(jour(fin)),
  durationWeeks: 1, intensity: intensite, planets: [], status: "current",
});

console.log("\nLes bornes");

verifier("aucun score hors de 0-100, sur deux ans de phases extremes",
  Array.from({ length: 730 }, (_, i) =>
    previsionSemaine([phase(0, 800, 100), phase(0, 800, 100), phase(0, 800, 0)], jour(i)),
  ).every((s) => s.every((d) => d.momentum >= 0 && d.momentum <= 100)));

verifier("sans aucune phase, la semaine est plate et ordinaire",
  previsionSemaine([], jour(0)).every((d) => d.momentum === 62 && !d.estPic));

verifier("toujours exactement sept jours",
  previsionSemaine([phase(0, 3, 90)], jour(0)).length === 7);

console.log("\nLes bords");

verifier("le premier et le dernier jour ne peuvent pas etre des pics",
  previsionSemaine([phase(0, 10, 95)], jour(0)).every((d, i, t) =>
    (i === 0 || i === t.length - 1) ? !d.estPic : true));

verifier("une phase d un seul jour au milieu produit un pic",
  previsionSemaine([phase(3, 3, 95)], jour(0))[3].estPic === true);

console.log("\nLa forme du calcul");

verifier("deux phases moyennes ne valent pas une phase forte",
  previsionSemaine([phase(0, 10, 75), phase(0, 10, 75)], jour(0))[0].momentum <
  previsionSemaine([phase(0, 10, 100)], jour(0))[0].momentum);

verifier("une phase sans date de fin est consideree en cours",
  previsionSemaine([phase(0, null, 90)], jour(5))[0].momentum > 62);

verifier("une phase terminee hier ne compte plus aujourd hui",
  previsionSemaine([phase(0, 2, 95)], jour(5))[0].momentum === 62);

console.log("\nLes domaines");

verifier("une phase amour ne deplace que le score amour",
  (() => {
    const s = scoresDuJour([phase(0, 10, 95, "love")], jour(3));
    return s.love > 62 && s.health === 62 && s.work === 62;
  })());

verifier("la dominante est la phase la plus intense du jour",
  phaseDominante([phase(0, 10, 70), phase(0, 10, 95)], jour(3))?.intensity === 95);

verifier("aucune phase active : aucune dominante, et rien d invente",
  phaseDominante([phase(0, 2, 95)], jour(9)) === null);

console.log("\nL apercu de la prochaine periode");

verifier("une periode ordinaire n est jamais proposee",
  prochainePeriodeForte([phase(10, 20, 65)], jour(0)) === null);

verifier("une periode PASSEE n est jamais proposee",
  prochainePeriodeForte([phase(-30, -10, 95)], jour(0)) === null);

verifier("une periode en cours n est pas « a venir »",
  prochainePeriodeForte([phase(-5, 10, 95)], jour(0)) === null);

verifier("c est la PLUS PROCHE des fortes qui est proposee",
  prochainePeriodeForte([phase(60, 70, 95), phase(20, 30, 90)], jour(0))?.dansJours === 20);

verifier("la distance et la duree sont justes",
  (() => {
    const a = prochainePeriodeForte([phase(14, 28, 88)], jour(0));
    return a?.dansJours === 14 && a?.dureeJours === 14;
  })());

verifier("rien a proposer quand il n y a rien : on ne fabrique pas",
  prochainePeriodeForte([], jour(0)) === null);

rmSync(dossier, { recursive: true, force: true });

if (echecs > 0) {
  console.log(`\n  ${echecs} verification(s) en echec.\n`);
  process.exit(1);
}
console.log("\n  Tout passe.\n");
