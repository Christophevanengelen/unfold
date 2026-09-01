/**
 * Le gabarit d environnement dit-il tout ce que le code attend ?
 *
 * POURQUOI CE CONTROLE EXISTE
 *
 * Le 01/09/2026, avant d ouvrir le depot a Marie-Ange, on a compare les
 * `process.env.X` du code au contenu de `.env.example` : le code en lisait 49,
 * le gabarit en declarait 17. Trente-huit manquaient, dont
 * NEXT_PUBLIC_SUPABASE_ANON_KEY, sans laquelle l app ne demarre simplement pas.
 *
 * Quelqu un qui clone le depot n a aucun moyen de deviner ce qui manque : une
 * variable absente ne provoque pas d erreur claire, elle produit un `undefined`
 * qui se propage. C est le motif recurrent de ce depot — l echec silencieux —
 * applique a l installation elle-meme.
 *
 * Le gabarit est SUIVI par git alors que `.gitignore` exclut `.env*` : c est
 * volontaire, et c est ce qui permet a quelqu un de le recevoir en clonant. Il
 * ne doit donc jamais contenir de valeur reelle — le controle le verifie aussi.
 */

import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

// join() produit des backslashes sous Windows : une comparaison a une chaine
// ecrite avec des slashes ne matche jamais, et le fichier finit par se lire
// lui-meme (voir MOI plus bas).
function versSlash(chemin) {
  return chemin.split("\\").join("/");
}

/** Fournies par la plateforme, jamais a declarer. */
const PLATEFORME = new Set([
  "NODE_ENV", "VERCEL_URL", "VERCEL_ENV", "CI", "npm_package_version",
]);

function fichiers(racine, acc = []) {
  let entrees;
  try {
    entrees = readdirSync(racine);
  } catch {
    return acc;
  }
  for (const nom of entrees) {
    const chemin = join(racine, nom);
    if (statSync(chemin).isDirectory()) {
      if (!/node_modules|\.next|ressources/.test(chemin)) fichiers(chemin, acc);
    } else if (/\.(tsx?|mjs)$/.test(nom)) acc.push(chemin);
  }
  return acc;
}

const lues = new Set();
// Ce fichier s exclut lui-meme : il cite `process\.env` dans son en-tete pour
// expliquer ce qu il fait, et se signalait donc une variable inexistante.
const MOI = "scripts/verifier-env-exemple.mjs";

for (const f of [...fichiers("app"), ...fichiers("lib"), ...fichiers("scripts"), ...fichiers("components")]) {
  if (versSlash(f) === MOI) continue;
  for (const m of readFileSync(f, "utf8").matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
    if (!PLATEFORME.has(m[1])) lues.add(m[1]);
  }
}

const gabarit = readFileSync(".env.example", "utf8");
const declarees = new Set(
  gabarit
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split("=")[0].trim())
    .filter(Boolean),
);

const absentes = [...lues].filter((v) => !declarees.has(v)).sort();

/**
 * Une vraie clef dans un fichier suivi par git.
 * On ne cherche pas a etre exhaustif : on attrape les formes qui ne laissent
 * aucun doute, et une longueur qui ne ressemble a rien d autre qu a un secret.
 */
const secrets = [];
for (const ligne of gabarit.split("\n")) {
  const m = /^([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/.exec(ligne.trim());
  if (!m) continue;
  const [, nom, valeur] = m;
  const v = valeur.trim();
  if (!v) continue;
  if (/^(sk-|pk_live|rk_live|whsec_|eyJ|appl_)/.test(v)) secrets.push(nom);
  else if (v.length > 40 && /[A-Za-z0-9_-]{36,}/.test(v)) secrets.push(nom);
}

console.log("");
let ko = false;

if (absentes.length) {
  ko = true;
  console.log(`  ${absentes.length} variable(s) lue(s) par le code et absente(s) du gabarit :\n`);
  absentes.forEach((v) => console.log(`    ${v}`));
  console.log("\n  Quelqu un qui clone le depot ne peut pas les deviner : une variable");
  console.log("  absente ne leve pas d erreur, elle propage un undefined.\n");
}

if (secrets.length) {
  ko = true;
  console.log(`  Valeur(s) ressemblant a un vrai secret dans un fichier SUIVI par git :\n`);
  secrets.forEach((v) => console.log(`    ${v}`));
  console.log("");
}

if (ko) process.exit(1);
console.log(`  ${lues.size} variables lues, ${declarees.size} declarees, aucun secret. Le gabarit est complet.\n`);
