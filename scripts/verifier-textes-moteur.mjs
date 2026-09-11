/**
 * Les phrases que le produit ne doit jamais dire, et qui partaient quand meme.
 *
 * Quatre textes du moteur — `constructiveDirection`, `sharedTheme`,
 * `sharedInsight`, `actionTogether` — s affichent TELS QUELS des que l IA
 * echoue ou que la personne n est pas payante. Ils contenaient, mot pour mot,
 * ce que connection-prompt.md interdit : « Zodiaque Déchaîné », « une
 * complémentarité à cultiver », « Vous êtes dans une période de transitions
 * majeures », « alignement ».
 *
 * Le nettoyage vit dans lib/nettoyer-texte-moteur.ts. Ce controle rejoue les
 * gabarits reels, releves sur le moteur les 02 et 04/09/2026
 * (PROMPT-MATCH-AMELIORATION.md §2), et verifie qu aucun mot interdit ne
 * ressort. Si le moteur change de gabarit, c est ici que ca doit casser —
 * pas sur l ecran de quelqu un.
 *
 *   node --experimental-strip-types scripts/verifier-textes-moteur.mjs
 */

import { nettoyerTexteMoteur } from "../lib/nettoyer-texte-moteur.ts";

/** Releves sur le moteur, pas inventes. */
const GABARITS = [
  "Vous êtes dans une période de transitions majeures du Lot de Fortune dans votre Zodiaque Déchaîné. Votre année de vie traverse une année de santé, de routine et de service — un terrain où le quotidien compte plus que les grands gestes.",
  "Vous êtes dans une période de transitions de fond du Lot d'Esprit dans votre Zodiaque Déchaîné. Votre année de vie traverse une année de carrière.",
  "\"Carrière\" pour l'un et \"Communication\" pour l'autre — une complémentarité à cultiver ensemble ce mois-ci.",
  "Des signaux rares sont actifs pour l'un ou les deux — un alignement à ne pas laisser passer.",
  "Naviguer une transition de cycle majeure dans le registre de la libération zodiacale.",
  "Alignement actif entre vos deux thèmes.",
];

/** Aucun de ces mots ne doit survivre au nettoyage. */
const INTERDITS = [
  "Zodiaque Déchaîné",
  "Zodiaque Dechaine",
  "libération zodiacale",
  "Lot de Fortune",
  "Lot d'Esprit",
  "complémentarité à cultiver",
  "alignement",
  "Alignement",
  "période de transitions",
];

let fautes = 0;
const sorties = [];

for (const brut of GABARITS) {
  const propre = nettoyerTexteMoteur(brut);
  sorties.push(propre);
  for (const mot of INTERDITS) {
    if (propre.includes(mot)) {
      fautes++;
      console.log(`\n  « ${mot} » ressort encore :\n    ${propre}`);
    }
  }
  // Un nettoyage qui vide la phrase n est pas un nettoyage : l ecran
  // afficherait un blanc a la place du texte.
  if (brut.length > 40 && propre.length < 15) {
    fautes++;
    console.log(`\n  Phrase videe par le nettoyage :\n    ${brut}\n    -> « ${propre} »`);
  }
  // Un remplacement qui ignore l article casse l accord : « la libération
  // zodiacale » ne doit pas devenir « la chapitre de vie ».
  for (const casse of ["la chapitre", "une chapitre", "du circonstances",
                       "le circonstances", "de la chapitre"]) {
    if (propre.toLowerCase().includes(casse)) {
      fautes++;
      console.log(`\n  Accord casse (« ${casse} ») :\n    ${propre}`);
    }
  }
  // Une phrase doit commencer par une majuscule ou un guillemet.
  if (propre && !/^[«"A-ZÀ-ÖØ-Þ]/.test(propre)) {
    fautes++;
    console.log(`\n  Debut de phrase casse :\n    « ${propre} »`);
  }
}

// Le texte vide reste vide, il ne devient pas un point.
if (nettoyerTexteMoteur("") !== "" || nettoyerTexteMoteur(null) !== "") {
  fautes++;
  console.log("\n  Un texte absent ne doit pas produire de caracteres.");
}

if (fautes === 0) {
  console.log(`\n  ${GABARITS.length} gabarits du moteur, 0 mot interdit. Rien ne fuit.\n`);
  for (const s of sorties) console.log(`    ${s}`);
  console.log("");
} else {
  console.log(`\n  ${fautes} fuite(s). Le texte du moteur arrive tel quel sur l ecran.\n`);
  process.exit(1);
}
