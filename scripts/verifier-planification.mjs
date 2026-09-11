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
for (const f of ["push-planification", "push-textes", "push-routes"]) {
  execFileSync("npx", ["esbuild", `lib/${f}.ts`, "--bundle", "--platform=node",
    "--format=esm", `--outfile=${join(dossier, f)}.mjs`, "--log-level=error"], { stdio: "inherit" });
}
const { planifier, planifierConnexions, ESPACEMENT_MINIMUM, ESPACEMENT_CONNEXION } =
  await import(join(dossier, "push-planification.mjs"));
const { ecrire, LANGUES } = await import(join(dossier, "push-textes.mjs"));
// La destination est verifiee par le MEME code que celui qui l ouvre dans
// l app. Une notification dont la route ne sait rien faire est une
// notification qui depose la personne sur un ecran de liste.
const { cheminDepuisNotification } = await import(join(dossier, "push-routes.mjs"));

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

// ─────────────────────────────────────────────────────────────────────────────
// Ce qui se passe ENTRE deux personnes
// ─────────────────────────────────────────────────────────────────────────────
//
// `connection-brief` ne rend que trois mois par appel. Mesure du 11/09/2026 sur
// un appel reel (deux themes fixes, relation « partner ») : 3 periodes,
// 22 evenements, 22/22 dates au jour par `startDate` ET `endDate`, 22/22
// porteurs de `houses`, et une `comparaison` sur chaque periode. En revanche
// `ActivePeriod.startDate` et `endDate` valent le premier et le dernier jour du
// mois : ils bornent un mois, ils ne datent rien.
//
// Pour eprouver la fonction sur des annees comme on le fait deja pour une vie
// seule, on FABRIQUE ici des periodes a la forme relevee ci-dessus. La forme
// est mesuree, les valeurs sont arbitraires : c est un banc d essai, et il ne
// sort pas de ce fichier. Aucune de ces valeurs n atteint jamais un ecran.

function moisCommuns(nbMois, { silence = () => false } = {}) {
  // Deux mois nets sur quatre, un mois clair, un mois subtil : de quoi
  // eprouver les trois paliers que le moteur renvoie.
  const PALIERS = ["PEAK", "PEAK", "CLEAR", "SUBTLE"];
  const sortie = [];
  for (let i = 0; i < nbMois; i++) {
    const d = new Date(Date.UTC(2026, 8 + i, 1));
    const mk = d.toISOString().slice(0, 7);
    const partage = (i % 12) + 1;        // le domaine que le moteur dit commun
    const chezEux = ((i + 5) % 12) + 1;  // un domaine qui n est PAS commun
    const j = (n) => `${mk}-${String(n).padStart(2, "0")}`;
    sortie.push({
      monthKey: mk,
      tier: PALIERS[i % PALIERS.length],
      comparaison: { memesDomaines: [partage], silence: silence(i) },
      personAFocus: { rawData: { events: [
        { score: 40, category: "zr", startDate: j(4), endDate: j(19), houses: [partage], markers: [] },
      ] } },
      personBFocus: { rawData: { events: [
        { score: 30, category: "transit", startDate: j(9), endDate: j(24), houses: [partage], markers: [] },
        { score: 20, category: "transit", startDate: j(14), endDate: j(27), houses: [chezEux], markers: [] },
      ] } },
    });
  }
  return sortie;
}

console.log("\nLes connexions");

const TROIS_ANS = 36;
const MOIS_COMMUNS = moisCommuns(TROIS_ANS);
const joursLongs = jours(365 * 3);
const uneConnexion = (reglage, periodes = MOIS_COMMUNS, ref = "conn_1756900000000") =>
  [{ ref, reglage, periodes }];
const recolter = (liste) => joursLongs.flatMap((j) => planifierConnexions(liste, j, {}));

const tousLesAvis = recolter(uneConnexion("tout"));

verifier(`${tousLesAvis.length} rendez-vous communs sur trois ans, tous dates au jour`,
  tousLesAvis.length > 0 && tousLesAvis.every((n) => /^\d{4}-\d{2}-\d{2}$/.test(n.jour)));

// Le controle le plus important du lot : on ne se contente pas de regarder le
// champ, on demande a la route ce qu elle en ferait. Une notification sans
// reference ouvre la LISTE des connexions, et la personne doit chercher.
verifier("chaque avis de connexion ouvre SA connexion, pas la liste",
  tousLesAvis.every((n) =>
    n.ecran === "compatibility" &&
    typeof n.ref === "string" && n.ref.length > 0 &&
    cheminDepuisNotification(n) === `/app/compatibility/view/?c=${encodeURIComponent(n.ref)}`));

verifier("une connexion sans identifiant ne produit rien",
  recolter([{ ref: "", reglage: "tout", periodes: MOIS_COMMUNS }]).length === 0 &&
  recolter([{ reglage: "tout", periodes: MOIS_COMMUNS }]).length === 0);

verifier("chaque clef tient sous les 128 caracteres que la base accepte",
  tousLesAvis.every((n) => n.cle.length <= 128));

const vuesCx = new Set();
let repeteeCx = false;
for (const n of tousLesAvis) {
  if (vuesCx.has(n.cle)) repeteeCx = true;
  vuesCx.add(n.cle);
}
verifier("aucune clef de connexion repetee sur trois ans", !repeteeCx);

verifier("« ce qui se termine entre vous » existe, date et situe dans un domaine",
  tousLesAvis.some((n) => n.importance === "commun_fin") &&
  tousLesAvis.filter((n) => n.importance === "commun_fin")
    .every((n) => n.jour && typeof n.domaine === "number"));

// Le domaine annonce ne peut pas etre le notre : il doit venir de la liste que
// le moteur a declaree commune. C est ce qui separe « on lit le moteur » de
// « on fabrique une lecture ».
const domainesDuMoteur = new Set(MOIS_COMMUNS.flatMap((p) => p.comparaison.memesDomaines));
verifier("le domaine annonce comme commun vient de la comparaison du moteur",
  tousLesAvis.filter((n) => n.importance !== "bascule_autre")
    .every((n) => domainesDuMoteur.has(n.domaine)));

console.log("\nLe reglage, connexion par connexion");

const parReglage = Object.fromEntries(
  ["aucune", "communs", "avec_autre", "tout"].map((r) => [r, recolter(uneConnexion(r))]),
);
const clefsDe = (r) => new Set(parReglage[r].map((n) => n.cle));
const contenuDans = (petit, grand) => [...petit].every((c) => grand.has(c));

verifier("« aucune » coupe cette connexion-la, et elle seule",
  parReglage.aucune.length === 0);
verifier(`communs ${parReglage.communs.length} < et leurs bascules ` +
  `${parReglage.avec_autre.length} < tout ${parReglage.tout.length}, sur trois ans`,
  parReglage.communs.length < parReglage.avec_autre.length &&
  parReglage.avec_autre.length < parReglage.tout.length);
verifier("chaque cran contient le precedent, il n echange rien",
  contenuDans(clefsDe("communs"), clefsDe("avec_autre")) &&
  contenuDans(clefsDe("avec_autre"), clefsDe("tout")));
verifier("« moments communs » ne parle jamais de la vie de l autre seul",
  parReglage.communs.every((n) => n.importance !== "bascule_autre"));
verifier("« et leurs bascules » en parle, lui",
  parReglage.avec_autre.some((n) => n.importance === "bascule_autre"));
verifier("le cran par defaut est le plus discret",
  recolter([{ ref: "conn_1", periodes: MOIS_COMMUNS }]).length === parReglage.communs.length);

verifier("plus le cran est ouvert, plus le plancher d espacement est court",
  ESPACEMENT_CONNEXION.communs > ESPACEMENT_CONNEXION.avec_autre &&
  ESPACEMENT_CONNEXION.avec_autre > ESPACEMENT_CONNEXION.tout);
verifier("une connexion attend plus longtemps qu une vie seule",
  ESPACEMENT_CONNEXION.communs > ESPACEMENT_MINIMUM.normal);

console.log("\nLa regle de silence");

verifier("le moteur dit de se taire : rien ne part",
  recolter(uneConnexion("tout", moisCommuns(TROIS_ANS, { silence: () => true }))).length === 0);
verifier("un mois sans comparaison ne produit rien — on ne devine pas un domaine commun",
  recolter(uneConnexion("tout",
    MOIS_COMMUNS.map(({ comparaison, ...reste }) => reste))).length === 0);
// Le cas le plus frequent en production : le mois est net pour la paire, mais
// les deux ne travaillent pas le meme domaine. Il n y a alors rien de COMMUN a
// dire, et « moments communs » doit se taire completement.
const sansDomaineCommun = MOIS_COMMUNS.map((p) => ({
  ...p,
  comparaison: { ...p.comparaison, memesDomaines: [] },
}));
verifier("aucun domaine commun ce mois-la : rien de commun n est annonce",
  recolter(uneConnexion("communs", sansDomaineCommun)).length === 0 &&
  recolter(uneConnexion("tout", sansDomaineCommun))
    .every((n) => n.importance === "bascule_autre"));
verifier("un mois subtil ne derange personne",
  tousLesAvis.every((n) => {
    const mois = n.jour.slice(0, 7);
    const p = MOIS_COMMUNS.find((x) => x.monthKey === mois);
    return p && p.tier !== "SUBTLE";
  }));
verifier("moteur muet cote connexions : aucune notification, aucune exception",
  planifierConnexions(null, new Date(Date.UTC(2026, 8, 15)), {}).length === 0 &&
  planifierConnexions(undefined, new Date(Date.UTC(2026, 8, 15)), {}).length === 0 &&
  planifierConnexions([], new Date(Date.UTC(2026, 8, 15)), {}).length === 0);

console.log("\nUne vie et deux vies dans la meme liste");

const mele = (j, cadence = "tout") =>
  planifier(releasing, j, { cadence, connexions: uneConnexion("tout") });

verifier("jamais plus d une notification le meme matin, connexions comprises",
  joursLongs.every((j) => mele(j).length <= 1));
verifier("meme jour, meme resultat — connexions comprises",
  JSON.stringify(mele(new Date("2026-10-03T04:00:00Z"))) ===
  JSON.stringify(mele(new Date("2026-10-03T22:00:00Z"))));
verifier("« aucune » cadence coupe aussi les connexions",
  joursLongs.every((j) => mele(j, "aucune").length === 0));
verifier("sans connexion gardee, la planification d une vie seule ne bouge pas",
  joursLongs.every((j) =>
    JSON.stringify(planifier(releasing, j, { cadence: "tout" })) ===
    JSON.stringify(planifier(releasing, j, { cadence: "tout", connexions: [] }))));
// Un classement qui enterrerait toujours les connexions rendrait le chantier
// inutile sans faire echouer aucun autre controle.
verifier("les connexions atteignent vraiment la personne",
  joursLongs.flatMap((j) => mele(j)).some((n) => n.nature === "connexion"));

console.log("\nLes textes");
const base = { cle: "x", nature: "periode", ecran: "timeline", regroupement: "periode",
               importance: "sommet", jour: "2026-12-31" };
const baseCx = { cle: "cx", nature: "connexion", ecran: "compatibility", ref: "conn_1",
                 regroupement: "connexion:conn_1", jour: "2026-12-31" };
const cas = [base, { ...base, importance: "bascule" },
             { ...base, nature: "mois", importance: "mois", compte: 3 },
             { ...base, nature: "mois", importance: "mois", compte: 1 },
             { ...baseCx, importance: "commun", domaine: 7 },
             { ...baseCx, importance: "commun_fin", domaine: 10 },
             { ...baseCx, importance: "bascule_autre", domaine: 4 },
             // Domaine absent : le moteur ne l a pas donne. Le texte doit
             // rester une phrase, pas un trou.
             { ...baseCx, importance: "commun" }];

let complets = true, courts = true, substitue = true, propres = true;
for (const langue of LANGUES) {
  for (const c of cas) {
    const { titre, corps } = ecrire(c, langue);
    if (!titre || !corps) complets = false;
    // iOS coupe le titre vers 35 caracteres sur l ecran verrouille.
    if ([...titre].length > 35) { courts = false; console.log(`      trop long (${langue}) : ${titre}`); }
    if ((titre + corps).includes("{n}")) substitue = false;
    // Un champ manquant ne laisse ni « undefined », ni un separateur orphelin.
    if (/undefined|null/.test(titre + corps) || corps.startsWith("·") || corps.trim().endsWith("·")) {
      propres = false;
      console.log(`      trou (${langue}) : ${corps}`);
    }
  }
}
verifier(`les ${LANGUES.length} langues ont un titre et un corps`, complets);
verifier("aucun titre ne depasse la coupe d iOS", courts);
verifier("le nombre est substitue partout", substitue);
verifier("aucun champ manquant ne laisse de trou dans le texte", propres);

// Les trois natures de connexion disent trois choses differentes, dans les dix
// langues. Deux textes identiques voudraient dire qu on a perdu la distinction
// en route — et la personne lirait « un moment commun » quand quelque chose se
// termine.
let distinctes = true, domaineNomme = true;
for (const langue of LANGUES) {
  const titres = new Set(
    ["commun", "commun_fin", "bascule_autre"]
      .map((i) => ecrire({ ...baseCx, importance: i, domaine: 7 }, langue).titre),
  );
  if (titres.size !== 3) distinctes = false;
  const avec = ecrire({ ...baseCx, importance: "commun", domaine: 10 }, langue).corps;
  const sans = ecrire({ ...baseCx, importance: "commun" }, langue).corps;
  if (avec === sans || !avec.includes("·")) domaineNomme = false;
}
verifier("les trois natures de connexion se disent differemment, en dix langues", distinctes);
verifier("le domaine du moteur est nomme dans la langue de la personne", domaineNomme);
verifier("langue inconnue : anglais, pas de plantage",
  ecrire(base, "xx").titre === ecrire(base, "en").titre);
verifier("langue absente : anglais",
  ecrire(base, null).titre === ecrire(base, "en").titre);
verifier("un seul moment se dit au singulier",
  ecrire({ ...base, nature: "mois", compte: 1 }, "fr").corps.includes("Un moment"));

rmSync(dossier, { recursive: true, force: true });
console.log(echecs === 0 ? "\nTout passe.\n" : `\n${echecs} echec(s).\n`);
process.exit(echecs === 0 ? 0 : 1);
