/**
 * Completude de lib/recits-i18n.ts.
 *
 * Deux controles, parce que « traduit » a deux facons d etre faux :
 *   1. une langue MANQUE dans une entree ;
 *   2. les dix langues portent la MEME valeur — c est du copier-coller, pas
 *      une traduction. Sauf pour un gabarit qui est vraiment identique
 *      partout, et il n y en a aucun ici.
 */
import { readFileSync } from "node:fs";

const LANGUES = ["fr","en","es","de","it","pt","nl","ja","zh","ar"];
// Le chemin est fixe : ce controle a une seule cible, et le passer en argument
// obligeait a s en souvenir a chaque lancement — donc a l oublier dans
// verifier-tout.mjs.
const src = readFileSync(process.argv[2] ?? "lib/recits-i18n.ts", "utf8");

// On isole le corps de RECITS puis chaque entree "cle": { ... }
const debut = src.indexOf("const RECITS");
const corps = src.slice(debut, src.indexOf("\n};", debut));

const entrees = [];
// Indentation LIBRE.
//
// La forme exigeait exactement deux espaces en debut de ligne. Un passage de
// prettier ou un reformatage a quatre espaces faisait tomber le compte a ZERO
// entree — et le controle annoncait « Complet », en vert, sur un fichier qu il
// n avait pas lu. Un controle qui se tait quand il ne comprend plus ne protege
// de rien.
const re = /^\s*"([a-z0-9._]+)":\s*\{([\s\S]*?)\},\s*$/gm;
let m;
while ((m = re.exec(corps))) entrees.push({ cle: m[1], bloc: m[2] });

const manquantes = [];
const identiques = [];
const vides = [];

for (const { cle, bloc } of entrees) {
  const valeurs = {};
  const rv = /(?:^|[\s,{])([a-z]{2})\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let v;
  while ((v = rv.exec(bloc))) if (LANGUES.includes(v[1])) valeurs[v[1]] = v[2];
  const absentes = LANGUES.filter((l) => !(l in valeurs));
  if (absentes.length) manquantes.push(`${cle} : ${absentes.join(", ")}`);
  for (const l of LANGUES) if (valeurs[l] === "") vides.push(`${cle} : ${l}`);
  const distinctes = new Set(Object.values(valeurs));
  if (Object.keys(valeurs).length === 10 && distinctes.size === 1) identiques.push(cle);
}

// Zero entree n est pas un succes : c est que le fichier n a pas ete compris.
if (entrees.length < 100) {
  console.log(`\n  ${entrees.length} entrees analysees, ce qui est trop peu.`);
  console.log(`  Le fichier compte normalement plus de 150 entrees. Soit la forme`);
  console.log(`  du fichier a change, soit ce controle ne sait plus le lire.\n`);
  process.exit(1);
}

console.log(`  ${entrees.length} entrees x ${LANGUES.length} langues = ${entrees.length * LANGUES.length} traductions attendues`);
const total = entrees.reduce((n, e) => {
  const rv = /(?:^|[\s,{])([a-z]{2})\s*:\s*"/g;
  let c = 0, v;
  while ((v = rv.exec(e.bloc))) if (LANGUES.includes(v[1])) c++;
  return n + c;
}, 0);
console.log(`  ${total} trouvees`);

/**
 * Les clefs CONSTRUITES a la volee.
 *
 * Le controle comptait ce qui est declare, jamais ce qui est appele. On a
 * verifie : supprimer `domaine.passe.7` — une clef que detail-helpers.ts
 * fabrique par `domaine.${temps}.${maison}` — le laissait VERT, alors que la
 * fiche affichait ensuite la clef en clair.
 *
 * Ces familles sont enumerees a la main parce qu aucune analyse statique ne
 * peut resoudre un gabarit. Si une dimension change dans detail-helpers.ts,
 * elle doit changer ici — c est le prix d un gabarit, et c est moins cher que
 * de decouvrir le trou a l ecran.
 */
// Les trois noms viennent de CLE_TEMPS dans lib/detail-helpers.ts : ils ne
// sont PAS passe/present/futur. Les recopier de memoire a produit douze fausses
// alertes au premier essai.
const TEMPS = ["passe", "encours", "avenir"];
const MAISONS = Array.from({ length: 12 }, (_, i) => i + 1);
const NIVEAUX = ["toc", "toctoc", "toctoctoc"];

const ATTENDUES = [
  ...TEMPS.flatMap((t) => ["banniere", "recit", "insight"].map((s) => `temps.${t}.${s}`)),
  ...NIVEAUX.map((n) => `niveau.${n}`),
  ...TEMPS.flatMap((t) => MAISONS.map((m) => `domaine.${t}.${m}`)),
  ...TEMPS.flatMap((t) => MAISONS.map((m) => `action.${t}.${m}`)),
  "eclipse.solaire",
  "eclipse.lunaire",
  "station.pause",
];

const declarees = new Set(entrees.map((e) => e.cle));
const absentes = ATTENDUES.filter((c) => !declarees.has(c));

let ko = false;
if (absentes.length) {
  ko = true;
  console.log(`\n  Clef(s) construite(s) par le code mais absente(s) du fichier :`);
  absentes.forEach((c) => console.log(`    ${c}`));
  console.log(`  Ces clefs sont fabriquees a la volee dans lib/detail-helpers.ts.`);
}

if (manquantes.length) { ko = true; console.log(`\n  Langue(s) manquante(s) :`); manquantes.forEach((x) => console.log(`    ${x}`)); }
if (vides.length)      { ko = true; console.log(`\n  Valeur(s) vide(s) :`); vides.forEach((x) => console.log(`    ${x}`)); }
if (identiques.length) { ko = true; console.log(`\n  Entree(s) identiques dans les dix langues (traduction oubliee) :`); identiques.forEach((x) => console.log(`    ${x}`)); }
if (!ko) console.log(`\n  Complet. Aucune langue manquante, aucune entree copiee-collee.\n`);
process.exit(ko ? 1 : 0);
