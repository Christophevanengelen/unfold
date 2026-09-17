/**
 * Les deux resumes disent-ils la verite ?
 *
 *   node --experimental-strip-types scripts/verifier-resumes.mjs
 *
 * POURQUOI CE CONTROLE EXISTE
 *
 * `lireLeJour` et `lireLaVie` sont les seules fonctions du produit qui
 * RESUMENT. Un resume est exactement l endroit ou une donnee se fabrique sans
 * qu on s en apercoive : il suffit de compter une periode qui n a pas commence,
 * d etendre une frise au-dela de ce que le moteur couvre, ou d arrondir un
 * avancement, pour afficher un fait qui n existe pas.
 *
 * Les trois regles verifiees ici sont celles du produit, pas des preferences :
 *
 *  1. **On ne compte que ce qui est ouvert.** Une periode future n est pas
 *     ouverte ; une periode passee non plus. Le jour de bascule compte.
 *  2. **On ne s etend jamais au-dela des donnees.** La frise part de la
 *     premiere annee documentee. Quarante colonnes vides diraient « il ne s est
 *     rien passe » la ou le calcul n a simplement rien a dire.
 *  3. **On ne propose pas d affiche sur une vie qu on ne couvre pas.** En
 *     dessous de huit annees documentees, l objet ne tient pas sa promesse.
 *
 * Les fonctions sont PURES et prennent l instant en parametre : c est ce qui
 * les rend testables. Un resume qui lirait l horloge ne se testerait pas.
 */

import { lireLeJour } from "../lib/resume-jour.ts";
import { lireLaVie } from "../lib/resume-vie.ts";
import { afficheDisponible, ANNEES_MINIMUM } from "../lib/resume-vie.ts";

const JOUR = 86400000;
const MAINTENANT = Date.UTC(2026, 8, 17);
const iso = (decalageJours) => new Date(MAINTENANT + decalageJours * JOUR).toISOString().slice(0, 10);

let fautes = 0;
const dire = (m) => { console.log(`  ✗ ${m}`); fautes += 1; };
const phase = (o) => ({
  id: o.id, domain: "work", title: o.title ?? o.id, subtitle: "", description: "",
  startDate: o.debut, endDate: o.fin, durationWeeks: 1, intensity: o.intensite ?? 50,
  planets: [], status: "current", house: o.maison, zrLevel: o.zr, ...o,
});

// ── 1. On ne compte que ce qui est ouvert ──
{
  const phases = [
    phase({ id: "ouverte", debut: iso(-10), fin: iso(10) }),
    phase({ id: "finie-hier", debut: iso(-30), fin: iso(-1) }),
    phase({ id: "demain", debut: iso(1), fin: iso(20) }),
    phase({ id: "finit-aujourdhui", debut: iso(-5), fin: iso(0) }),
    phase({ id: "commence-aujourdhui", debut: iso(0), fin: iso(5) }),
    phase({ id: "sans-fin", debut: iso(-3), fin: undefined }),
  ];
  const r = lireLeJour(phases, MAINTENANT);
  const ids = r.ouvertes.map((o) => o.phase.id).sort();
  const attendu = ["commence-aujourdhui", "finit-aujourdhui", "ouverte", "sans-fin"];
  if (JSON.stringify(ids) !== JSON.stringify(attendu)) {
    dire(`periodes ouvertes : ${ids.join(", ")} — attendu ${attendu.join(", ")}`);
  }
  if (r.bientot.length !== 1 || r.bientot[0].dans !== 1) {
    dire(`« bientot » devrait contenir la periode de demain, a 1 jour (recu ${JSON.stringify(r.bientot.map((b) => b.dans))})`);
  }
  const sansFin = r.ouvertes.find((o) => o.phase.id === "sans-fin");
  if (sansFin?.restants !== null || sansFin?.avancement !== null) {
    dire("une periode sans fin connue ne doit avoir ni restants ni avancement — les inventer serait une promesse");
  }
}

// ── 2. L avancement est juste, et borne ──
{
  const r = lireLeJour([phase({ id: "moitie", debut: iso(-10), fin: iso(10) })], MAINTENANT);
  const a = r.ouvertes[0].avancement;
  if (a === null || Math.abs(a - 50) > 1) dire(`avancement a mi-parcours : ${a}, attendu 50`);
}

// ── 3. La vie ne s etend pas au-dela des donnees ──
{
  const naissance = "1985-04-12";
  const phases = [
    phase({ id: "a", debut: "2020-01-01", fin: "2021-01-01" }),
    phase({ id: "b", debut: "2024-01-01", fin: "2025-01-01" }),
    phase({ id: "c", debut: "2026-01-01", fin: "2026-12-01" }),
  ];
  const v = lireLaVie(phases, naissance, MAINTENANT);
  if (v.vide) dire("trois periodes datees devraient suffire a lire une vie");
  if (v.premiereDocumentee === null || v.premiereDocumentee < 30) {
    dire(`premiereDocumentee = ${v.premiereDocumentee} : la frise partirait de la naissance alors que le calcul ne couvre que les dernieres annees`);
  }
  // Les annees non couvertes existent dans le tableau, a zero : c est l ECRAN
  // qui les coupe. Si elles portaient un compte, la frise mentirait.
  if (v.annees.slice(0, 20).some((x) => x.periodes > 0)) {
    dire("des annees non couvertes par le moteur portent un compte");
  }
  if (v.pointHaut === null || v.pointHaut.periodes < 1) dire("aucun point haut trouve");
}

// ── 4. Aucune periode anterieure a la naissance ──
{
  const v = lireLaVie(
    [phase({ id: "avant", debut: "1980-01-01", fin: "1981-01-01" }),
     phase({ id: "apres", debut: "2020-01-01", fin: "2021-01-01" }),
     phase({ id: "apres2", debut: "2022-01-01", fin: "2023-01-01" })],
    "1985-04-12", MAINTENANT,
  );
  if (v.total !== 2) dire(`total = ${v.total} : une periode anterieure a la naissance a ete comptee`);
}

// ── 5. Le seuil de l affiche ──
{
  const cas = [
    [{ vide: false, age: 41, premiereDocumentee: 41 }, false, "une seule annee documentee"],
    [{ vide: false, age: 41, premiereDocumentee: 41 - ANNEES_MINIMUM + 2 }, false, "une annee de moins que le seuil"],
    [{ vide: false, age: 41, premiereDocumentee: 41 - ANNEES_MINIMUM + 1 }, true, "exactement le seuil"],
    [{ vide: false, age: 41, premiereDocumentee: 6 }, true, "une vie largement couverte"],
    [{ vide: true, age: 0, premiereDocumentee: null }, false, "aucune donnee"],
  ];
  for (const [entree, attendu, nom] of cas) {
    if (afficheDisponible(entree) !== attendu) {
      dire(`seuil de l affiche — ${nom} : attendu ${attendu}`);
    }
  }
}

// ── 6. Rien du tout est une reponse, pas une panne ──
{
  const r = lireLeJour([phase({ id: "future", debut: iso(60), fin: iso(90) })], MAINTENANT);
  if (!r.aucune) dire("aucune periode ouverte devrait rendre `aucune: true`");
  if (r.principale !== null) dire("sans periode ouverte, il ne peut y avoir de periode principale");
}

if (fautes === 0) {
  console.log(
    "✓ Resumes fiables — comptage des periodes ouvertes, avancement, bornes de la vie, " +
      `seuil de l affiche a ${ANNEES_MINIMUM} annees, et le silence rendu comme une reponse.`,
  );
  process.exit(0);
}
console.log(`\n  ${fautes} defaut(s) dans les resumes.`);
process.exit(1);
