#!/usr/bin/env node
/**
 * VERIFIER QUE LE CONTRAT DE /api/openai/astrologue/message EST A JOUR.
 *
 *     node scripts/verifier-astrologue.mjs
 *
 * Ne fait aucun appel reseau : lecture de source uniquement, comme
 * verifier-couleurs.mjs / verifier-textes-moteur.mjs. Verifie que la liste
 * RAISONS du header de la route (documentation) contient exactement les
 * codes que le code peut reellement renvoyer — ni un code fantome dans la
 * doc, ni un code reel absent de la doc. C'est le meme defaut que le
 * commentaire de daily-briefing/route.ts prevenait deja : une doc qui ment
 * sur le contrat vaut moins que pas de doc.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const RACINE = join(import.meta.dirname, "..");
const CHEMIN_ROUTE = join(RACINE, "app/api/openai/astrologue/message/route.ts");
const CHEMIN_COMPREHENSION = join(RACINE, "lib/astrologue-comprehension.ts");
const CHEMIN_GARDE = join(RACINE, "lib/garde-jargon.ts");

function lire(chemin) {
  return readFileSync(chemin, "utf8");
}

function extraireRaisonsDocumentees(source) {
  const bloc = source.match(/RAISONS possibles[\s\S]*?\*\//);
  if (!bloc) throw new Error("Bloc 'RAISONS possibles' introuvable dans le header de la route");
  const lignes = bloc[0].match(/^\s*\*\s+([a-z_]+)\s{2,}\d{3}/gm) ?? [];
  return new Set(lignes.map((l) => l.trim().split(/\s+/)[1]));
}

/** Toute chaine passee comme premier argument de echec(...), ou apres "raison:". */
function extraireRaisonsUtilisees(source) {
  const trouvees = new Set();
  for (const m of source.matchAll(/echec\(\s*"([a-z_]+)"/g)) trouvees.add(m[1]);
  for (const m of source.matchAll(/raison:\s*"([a-z_]+)"/g)) trouvees.add(m[1]);
  return trouvees;
}

/**
 * Les valeurs litterales du premier type union "a" | "b" | "c" trouve apres
 * `nom:` dans une source TS (propriete d'un type/interface — ex.
 * `raison: "x" | "y";`), jusqu'au premier point-virgule.
 */
function extraireUnionType(source, nom) {
  const re = new RegExp(`${nom}\\s*:\\s*([\\s\\S]*?);`);
  const m = source.match(re);
  if (!m) return new Set();
  return new Set([...m[1].matchAll(/"([a-z_]+)"/g)].map((x) => x[1]));
}

const sourceRoute = lire(CHEMIN_ROUTE);
const sourceComprehension = lire(CHEMIN_COMPREHENSION);
const sourceGarde = lire(CHEMIN_GARDE);

const documentees = extraireRaisonsDocumentees(sourceRoute);
const litterales = extraireRaisonsUtilisees(sourceRoute);

// resultatA.raison (lib/astrologue-comprehension.ts:ResultatComprehension) et
// validation.raison (lib/garde-jargon.ts:ValidationTexte) sont des raisons qui
// TRAVERSENT la route sans y apparaitre comme chaine litterale — il faut les
// lire dans leur propre fichier pour les compter.
const depuisComprehension = extraireUnionType(sourceComprehension, "raison");
const depuisGarde = new Set(
  [...sourceGarde.matchAll(/raison:\s*"([a-z_]+)"/g)].map((m) => m[1]),
);

const reellementPossibles = new Set([...litterales, ...depuisComprehension, ...depuisGarde]);

const manquantesDansLaDoc = [...reellementPossibles].filter((r) => !documentees.has(r));
const fantomesDansLaDoc = [...documentees].filter((r) => !reellementPossibles.has(r));

let echec = false;
if (manquantesDansLaDoc.length > 0) {
  echec = true;
  console.error("✗ Raisons renvoyees par le code mais absentes du header RAISONS :");
  for (const r of manquantesDansLaDoc) console.error(`    - ${r}`);
}
if (fantomesDansLaDoc.length > 0) {
  echec = true;
  console.error("✗ Raisons documentees dans le header mais que le code ne renvoie plus :");
  for (const r of fantomesDansLaDoc) console.error(`    - ${r}`);
}

if (echec) {
  console.error(`\n${reellementPossibles.size} raisons reelles, ${documentees.size} documentees.`);
  process.exit(1);
}

console.log(`✓ Contrat astrologue a jour — ${documentees.size} raisons, doc et code d'accord.`);
