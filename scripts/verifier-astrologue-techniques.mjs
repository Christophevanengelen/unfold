/**
 * Le navigateur de techniques de Vela fait-il le bon tri de domaine ?
 *
 *   node --experimental-strip-types scripts/verifier-astrologue-techniques.mjs
 *
 * POURQUOI CE CONTROLE EXISTE
 *
 * Le 17/09/2026, une question « quand ca va bouger au travail » recevait
 * « rien de net sur le travail, c est la communication ». La personne etait
 * en annee de maison 10, Lune natale en 10 sous un cycle Pluton, ZR L3 en
 * pic. Le moteur avait les faits ; Vela ne les ouvrait pas.
 *
 * Ce controle fige le TRI, sans reseau : maison du travail, axe 4/10 des
 * eclipses, transit qui touche un point de la 10, annee de profection,
 * seigneur du Taureau = Venus. Si un de ces tests casse, on reviendra a
 * repondre a cote.
 */

import {
  anneesAvantMaison,
  eclipseToucheAxe,
  maisonMensuelle,
  maisonOpposee,
  maisonsEtAxe,
  maisonsPourTopics,
  moisAvantMaisonMensuelle,
  numeroFavorable,
  positionDansLesPassages,
  seigneurDuSigne,
  signeDeMaison,
  transitToucheMaisons,
} from "../lib/astrologue-domaine.ts";

let echecs = 0;

function ok(nom, condition, detail) {
  if (condition) {
    console.log(`  ✓ ${nom}`);
    return;
  }
  echecs += 1;
  console.error(`  ✗ ${nom}${detail ? ` — ${detail}` : ""}`);
}

console.log("Domaine → maisons");
ok("travail = maison 10", maisonsPourTopics(["career"]).join() === "10");
ok("couple = maison 7", maisonsPourTopics(["relationships"]).join() === "7");
ok("axe du travail = 10 et 4", maisonsEtAxe([10]).sort((a, b) => a - b).join() === "4,10");
ok("opposee de 10 = 4", maisonOpposee(10) === 4);
ok("opposee de 4 = 10", maisonOpposee(4) === 10);
ok("opposee de 1 = 7", maisonOpposee(1) === 7);

console.log("Seigneur du signe (MC Taureau → Venus)");
ok("Taurus → Venus", seigneurDuSigne("Taurus") === "Venus");
ok("Libra → Venus", seigneurDuSigne("Libra") === "Venus");
ok("maison 10 Taurus depuis annuelle 10 Taurus", signeDeMaison(10, 10, "Taurus") === "Taurus");
ok("maison 7 depuis annuelle 10 Taurus = Aquarius", signeDeMaison(7, 10, "Taurus") === "Aquarius");

console.log("Profection : quand le domaine revient");
ok("deja en 10 → 0 an", anneesAvantMaison(10, 10) === 0);
ok("en 3, prochaine 10 → 7 ans", anneesAvantMaison(3, 10) === 7);
ok("mensuelle mois 0 = annuelle", maisonMensuelle(10, 0) === 10);
ok("mensuelle 2 mois plus tard = 12", maisonMensuelle(10, 2) === 12);
ok("prochain mois 10 depuis annuelle 10 = 0", moisAvantMaisonMensuelle(10, 10) === 0);
ok("prochain mois 10 depuis annuelle 3 = 7", moisAvantMaisonMensuelle(3, 10) === 7);

console.log("Transits filtres sur le domaine");
ok(
  "Pluton carre Lune en maison 10 = travail",
  transitToucheMaisons({ natalPoint: "Moon", natalHouseDuPoint: 10, maisons: [10] }),
);
ok(
  "MC touche la carriere",
  transitToucheMaisons({ natalPoint: "MC", natalHouseDuPoint: null, maisons: [10] }),
);
ok(
  "passage par la maison 10",
  transitToucheMaisons({ natalPoint: "10", houseTransitNumber: 10, maisons: [10] }),
);
ok(
  "Neptune en maison 9 n'est PAS le travail",
  !transitToucheMaisons({ natalPoint: "9", houseTransitNumber: 9, natalHouseDuPoint: 9, maisons: [10] }),
);

console.log("Eclipses axe 4/10");
ok("axe 4-10", eclipseToucheAxe({ axis: "4-10", maisons: [4, 10] }));
ok("houses [4,10]", eclipseToucheAxe({ houses: [4, 10], maisons: [4, 10] }));
ok("axe 5-11 ignore le travail", !eclipseToucheAxe({ axis: "5-11", maisons: [4, 10] }));

console.log("Passages d'un cycle (entre 3e et 4e)");
{
  const pos = positionDansLesPassages("2026-09-17", [
    "2025-03-01", "2025-07-01", "2026-01-01", "2026-10-01",
  ]);
  ok("apres le 3e", pos?.apres === 3);
  ok("avant le 4e", pos?.avant === 4);
  ok("prochain = oct 2026", pos?.prochain === "2026-10-01");
}

console.log("Numerologie favorable");
ok("annee 8", numeroFavorable(8));
ok("annee 1", numeroFavorable(1));
ok("annee 4 non", !numeroFavorable(4));

if (echecs > 0) {
  console.error(`\n${echecs} cas faux — le tri de domaine a recule.`);
  process.exit(1);
}
console.log("\n✓ Tri de domaine de Vela a jour.");
