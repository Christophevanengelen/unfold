/**
 * Les chapitres de vie ne doivent jamais laisser passer de jargon, ni fermer
 * un chapitre sur une date qu on sait fausse.
 *
 * ── CE QUE CE CONTROLE GARDE ───────────────────────────────────────────────
 *
 * 1. LA ROUTE NE FAIT REMONTER QUE CE QU ELLE DOIT.
 *
 *    `zodiacal-releasing.php` renvoie, pour chaque periode, le signe, le
 *    maitre, le type de pic, des marqueurs, et une `signification` en anglais.
 *    Tout cela est du nom de technique, que l app s interdit d afficher.
 *
 *    La regle de silence de ce produit est facile a tenir tant que le mot n
 *    arrive pas : on ne peut pas afficher par megarde un champ qui n existe
 *    pas dans le paquet. Ce controle verifie donc que `app/api/chapitres`
 *    n ajoute pas un de ces champs a sa sortie — parce que le jour ou
 *    quelqu un en aura besoin « juste pour debugger », il finira a l ecran.
 *
 * 2. LA DUREE FAIT FOI, PAS LA DATE DE FIN.
 *
 *    Mesure du 17/09/2026 : le dernier chapitre annonce `duration: 15 years`
 *    et des dates qui couvrent quinze MOIS, parce que sa date de fin est
 *    l horizon de calcul du moteur et non la fin du chapitre. Calculer la
 *    duree en soustrayant les dates ecrit « un an » sur un chapitre qui en
 *    dure quinze.
 *
 *    Ce controle exige que `lib/chapitres-vie.ts` porte le drapeau
 *    `finALHorizon` et s en serve. C est la seule protection contre le retour
 *    d une soustraction de dates qui semble evidente et qui est fausse.
 *
 *   node scripts/verifier-chapitres.mjs
 */

import { readFileSync } from "node:fs";

const ROUTE = "app/api/chapitres/route.ts";
const LIB = "lib/chapitres-vie.ts";

/**
 * Les champs du moteur qui ne doivent JAMAIS traverser la route.
 *
 * On cherche la chaine entre guillemets ou en position de clef, pas le mot
 * nu : les commentaires de la route les citent tous pour expliquer pourquoi
 * ils sont exclus, et faire echouer sur une explication apprendrait a ne plus
 * expliquer.
 */
const INTERDITS = ["sign", "ruler", "peakType", "markers", "signification", "valensPeak"];

const fautes = [];

const route = readFileSync(ROUTE, "utf8");

// On ne lit que le corps de `alleger()`, la fonction qui decide ce qui sort.
const debut = route.indexOf("function alleger(");
const fin = route.indexOf("\n}", debut);
if (debut === -1 || fin === -1) {
  fautes.push(`${ROUTE} : la fonction alleger() est introuvable — le controle ne garde plus rien.`);
} else {
  const corps = route.slice(debut, fin);
  for (const champ of INTERDITS) {
    // `champ:` en position de clef d objet, ou `p.champ` en lecture.
    const motif = new RegExp(`(^|[\\s{,])${champ}\\s*:|\\.${champ}\\b`, "m");
    if (motif.test(corps)) {
      fautes.push(`${ROUTE} : alleger() fait remonter « ${champ} », qui est un nom de technique.`);
    }
  }
}

const lib = readFileSync(LIB, "utf8");

if (!/finALHorizon/.test(lib)) {
  fautes.push(`${LIB} : le drapeau finALHorizon a disparu — un chapitre peut se fermer sur l horizon du moteur.`);
}

// La duree affichee doit venir de `duration`, pas d une soustraction de dates.
if (!/const annees = p\.duration/.test(lib)) {
  fautes.push(`${LIB} : la duree ne vient plus de p.duration. Soustraire les dates donne quinze mois la ou le moteur dit quinze ans.`);
}

if (fautes.length === 0) {
  console.log(`\n  Chapitres de vie : ${INTERDITS.length} champs de technique tenus hors de la route, duree tiree de p.duration.\n`);
  process.exit(0);
}

console.log(`\n  ${fautes.length} probleme(s) sur les chapitres de vie :\n`);
for (const f of fautes) console.log(`    ${f}`);
console.log("");
process.exit(1);
