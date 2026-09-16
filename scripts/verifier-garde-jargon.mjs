/**
 * Le garde-jargon fait-il vraiment ce qu il dit ?
 *
 *   node --experimental-strip-types scripts/verifier-garde-jargon.mjs
 *
 * POURQUOI CE CONTROLE EXISTE
 *
 * Le 16/09/2026, Vela a affiche « Une eclipse lunaire partielle cree une
 * periode rare d ouverture… » — un nom de mecanique celeste en clair, ce que le
 * produit interdit. J ai ajoute le motif correspondant. Il ne marchait pas.
 *
 * La cause tenait a un detail de JavaScript : `\b` ne borne rien devant un
 * caractere accentue. « é » n est pas un caractere de mot, donc /\bé/ exige une
 * lettre AVANT le é et ne matche jamais un mot qui commence par é. Le motif
 * existait, il etait lisible, il etait faux — et rien ne l aurait dit.
 *
 * Ce controle rejoue donc les DEUX sens :
 *
 *  - ce qui doit etre rejete l est (sinon le garde ne garde rien) ;
 *  - ce qui est du francais courant passe (sinon le garde rejette du texte
 *    juste, et la personne se retrouve devant un ecran vide — voir la reprise
 *    dans app/api/openai/astrologue/message/route.ts).
 *
 * Le second sens compte autant que le premier : « prendre l ascendant » est du
 * francais, et c est precisement pour ca qu « ascendant » n est pas dans les
 * motifs.
 */

import { detecterJargon, detecterAstreRepete } from "../lib/garde-jargon.ts";

/** Releves a l ecran ou attendus par la regle produit. */
const DOIT_REJETER = [
  ["eclipse accentuee", "Une éclipse lunaire partielle crée une période rare d'ouverture."],
  ["eclipse sans accent", "Une eclipse ouvre une fenetre pour toi."],
  ["retrograde", "Mercure est rétrograde en ce moment."],
  ["retrogradation", "Cette rétrogradation dure trois semaines."],
  ["lunaison", "La lunaison de septembre marque un tournant."],
  ["pleine lune", "La pleine lune de demain t'invite à conclure."],
  ["nouvelle lune", "Une nouvelle lune ouvre ce cycle."],
  ["transit", "Ce transit dure jusqu'en novembre."],
  ["conjonction", "Le Noeud Sud en conjonction avec Saturne soutient ton élan."],
  ["carre", "Un carré se forme sur ton axe de travail."],
  ["maison numerotee", "La maison 7 est activée ce mois-ci."],
  ["septieme maison", "Ta 7e maison s'allume."],
  ["natal", "Saturne natal soutient activement ton élan."],
];

/** Du francais courant, ou des lectures correctes. Aucun ne doit etre rejete. */
const DOIT_PASSER = [
  ["ascendant courant", "Tu prends l'ascendant dans les discussions en ce moment."],
  ["lecture propre", "Ce qui bouge chez toi, c'est ta façon de dire les choses. Ça s'ouvre, et ça demande d'y mettre des mots."],
  ["sensibilite", "Tu es plus sensible que d'habitude cette semaine, et ça se voit dans tes échanges."],
  ["traverser", "Tu traverses une période dense, qui demande de tenir sans forcer."],
  ["maison au sens propre", "Tu as envie de rentrer à la maison plus tôt ces temps-ci."],
];

/** Un astre peut etre cite une fois, jamais deux. */
const ASTRES = [
  ["une fois : passe", "La Lune éclaire ce moment.", false],
  ["deux fois : rejete", "La Lune éclaire ce moment, et la lune repartira ensuite.", true],
];

let fautes = 0;

for (const [nom, texte] of DOIT_REJETER) {
  if (!detecterJargon(texte)) {
    console.log(`  ✗ non detecte — ${nom}`);
    fautes += 1;
  }
}

for (const [nom, texte] of DOIT_PASSER) {
  const r = detecterJargon(texte);
  if (r) {
    console.log(`  ✗ faux positif — ${nom} rejete comme « ${r} »`);
    fautes += 1;
  }
}

for (const [nom, texte, attendu] of ASTRES) {
  const r = Boolean(detecterAstreRepete(texte));
  if (r !== attendu) {
    console.log(`  ✗ astre repete — ${nom}`);
    fautes += 1;
  }
}

if (fautes === 0) {
  console.log(
    `✓ Garde-jargon fiable — ${DOIT_REJETER.length} formes interdites detectees, ` +
      `${DOIT_PASSER.length} textes justes preserves, comptage des astres correct.`,
  );
  process.exit(0);
}
console.log(`\n  ${fautes} defaut(s) dans le garde-jargon.`);
process.exit(1);
