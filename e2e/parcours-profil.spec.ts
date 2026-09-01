/**
 * PARCOURS 2 et 3 — corriger sa naissance, et revoir le guide.
 *
 * ─── LE DEFAUT QUE CE FICHIER EMPECHE DE REVENIR ───────────────────────────
 *
 * 01/09/2026, signale par Christophe : « une modification de date de naissance
 * sans effet ». Le bouton enregistrait, la feuille se fermait, et la timeline
 * restait rigoureusement identique. Le defaut avait TROIS causes empilees, et
 * corriger deux d entre elles ne changeait rien a l ecran :
 *
 *   1. lib/supabase-store.ts n utilisait pas apiFetch : depuis le telephone,
 *      l ecriture n atteignait jamais le serveur.
 *   2. La clef de revalidation SWR ne portait que la DATE. Corriger l heure ou
 *      le lieu ne declenchait donc aucun recalcul.
 *   3. Les caches d affichage etaient globaux : l ancienne timeline etait
 *      resservie pendant le calcul, et definitivement si le moteur echouait.
 *
 * Aucune de ces trois causes ne se voit dans un controle statique. Les trois se
 * voient si — et seulement si — on ENREGISTRE et qu on regarde ce que la
 * timeline montre ensuite. C est ce que font les deux premiers tests.
 *
 * 01/09/2026, egalement : « un bouton "revoir le guide" qui ne declenchait
 * rien ». Inerte DEUX FOIS, pour deux raisons differentes — d abord parce que
 * le guide n etait monte que dans le `onDone` de l ecran d accueil, qui ne se
 * rejoue jamais ; puis, apres correction, parce que la demande etait lue au
 * montage de la timeline alors qu on est deja dessus quand on appuie. Le
 * dernier test couvre le cas reel : on appuie DEPUIS la timeline.
 */

import { test, expect } from "@playwright/test";
import {
  ageAffiche,
  brancherReseau,
  ouvrirProfil,
  ouvrirTimeline,
  semer,
  TITRE_APRES_1970,
  TITRE_AVANT_1970,
  type Journal,
} from "./aide/app";

let journal: Journal;

test.beforeEach(async ({ page }) => {
  journal = await brancherReseau(page);
  await semer(page);
  await ouvrirTimeline(page);
});

/** Ouvre la feuille d edition depuis le profil. */
async function ouvrirEdition(page: import("@playwright/test").Page) {
  await ouvrirProfil(page);
  await page.getByRole("button", { name: /Birth data/ }).click();
  // « Your birth details » n apparait que dans la feuille d edition. Le tiroir
  // de profil doit s etre ferme : une seule feuille a la fois.
  await expect(page.getByText("Your birth details")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
}

test("changer la date de naissance change la timeline", async ({ page }) => {
  test.setTimeout(90_000);

  const ageAvant = await ageAffiche(page);
  // 1985 : la personne de reference a la quarantaine passee.
  expect(ageAvant).toBeGreaterThan(30);

  // On passe en vue liste : c est la que le CONTENU de la periode en cours est
  // ecrit en toutes lettres. Le moteur simule rend un evenement different selon
  // l annee de naissance, exactement comme le vrai — c est ce qui permet de
  // distinguer « la timeline a ete recalculee » de « l ancien cache a ete
  // resservi ».
  await page.getByRole("button", { name: "List view" }).click();
  const periodeCourante = (titre: string) =>
    page.getByRole("button", { name: new RegExp(titre) }).first();
  await expect(periodeCourante(TITRE_APRES_1970)).toBeVisible();

  const appelsAvant = journal.moteur.length;

  await ouvrirEdition(page);
  await page.getByLabel(/Date of birth/).fill("12/04/1960");
  // Le champ ne valide qu au blur : sans cela on enregistrerait l ancienne
  // date tout en affichant la nouvelle.
  await page.getByLabel(/Date of birth/).press("Enter");
  await page.getByRole("button", { name: "Save" }).click();

  // ── Preuve 1 : le moteur a ete RAPPELE, avec les nouvelles donnees. ──
  // C est la cause n°2 : la clef de revalidation doit porter l empreinte, pas
  // seulement la date.
  await expect
    .poll(() => journal.moteur.filter((a) => a.birthDate === "1960-04-12").length, {
      timeout: 30_000,
      message: "le moteur n a jamais recu la nouvelle date de naissance",
    })
    .toBeGreaterThan(0);
  expect(journal.moteur.length).toBeGreaterThan(appelsAvant);

  // ── Preuve 2 : LE CONTENU affiche est celui de la NOUVELLE naissance. ──
  // C est la cause n°3. Sans invalidation des caches d affichage, l ancienne
  // timeline est resservie : le reseau a bien travaille, et l ecran ment quand
  // meme. C est litteralement ce que Christophe a decrit — « je modifie, rien
  // ne change ».
  await expect(periodeCourante(TITRE_AVANT_1970)).toBeVisible({ timeout: 30_000 });
  await expect(periodeCourante(TITRE_APRES_1970)).toBeHidden();

  // ── Preuve 3 : le curseur d age suit lui aussi. ──
  await expect
    .poll(() => ageAffiche(page), {
      timeout: 30_000,
      message: "le curseur d age montre encore l ancienne date de naissance",
    })
    .toBeGreaterThan(ageAvant + 15);
});

test("changer la seule HEURE de naissance relance aussi le calcul", async ({ page }) => {
  // Le cas exact de la cause n°2. Avec une clef de revalidation qui ne porte
  // que la date, ce test echoue et le precedent passe : l heure de naissance
  // deplace l Ascendant de plusieurs signes, donc une timeline calculee sur la
  // mauvaise heure est la timeline de quelqu un d autre.
  test.setTimeout(90_000);

  await ouvrirEdition(page);
  await page.getByLabel(/Time of birth/).fill("21:45");
  await page.getByRole("button", { name: "Save" }).click();

  await expect
    .poll(() => journal.moteur.filter((a) => a.birthTime === "21:45").length, {
      timeout: 30_000,
      message: "corriger l heure de naissance n a declenche aucun recalcul",
    })
    .toBeGreaterThan(0);
});

test("annuler l edition ne touche a rien", async ({ page }) => {
  // Le pendant du test precedent : un enregistrement qui part sur « Annuler »
  // est aussi grave qu un enregistrement qui ne part pas.
  const ageAvant = await ageAffiche(page);

  await ouvrirEdition(page);
  await page.getByLabel(/Date of birth/).fill("12/04/1960");
  await page.getByLabel(/Date of birth/).press("Enter");
  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page.getByText("Your birth details")).toBeHidden();
  await expect(page.locator('[data-guide="capsule"]').first()).toBeVisible();
  expect(await ageAffiche(page)).toBe(ageAvant);
  expect(journal.moteur.some((a) => a.birthDate === "1960-04-12")).toBe(false);
});

test("« revoir le guide » ouvre reellement le guide, depuis la timeline", async ({ page }) => {
  // On est DEJA sur la timeline quand on appuie : c est le cas frequent, et
  // c est celui que la premiere correction avait manque. La timeline ne
  // remonte pas, donc un declencheur pose au montage ne part jamais.
  await ouvrirProfil(page);
  await page.getByRole("button", { name: "Replay the guide" }).click();

  // Le guide s annonce par son role et sa progression. Le nombre de pas depend
  // de ceux dont la cible existe reellement a l ecran — un pas sans cible est
  // retire, precisement parce que l ancien guide encadrait du vide.
  const guide = page.getByRole("dialog", { name: /Step 1 of \d/ });
  await expect(guide).toBeVisible({ timeout: 15_000 });

  // Et il AVANCE : le pas suivant doit changer l annonce.
  // `exact` parce que la surcouche de developpement de Next ajoute un bouton
  // « Open Next.js Dev Tools », que « Next » attraperait aussi.
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("dialog", { name: /Step 2 of \d/ })).toBeVisible();

  // Et il se termine.
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator('[data-guide="capsule"]').first()).toBeVisible();
});

test("le guide designe des cibles reelles, pas une zone vide", async ({ page }) => {
  // 01/09/2026 : « un guide qui encadrait une zone vide ». L ancien posait son
  // halo a « 55 % de largeur, 280 px de rayon », ecrits en dur, jamais
  // confrontes a un element. On verifie donc que CHAQUE pas conserve a l ecran
  // un element qui porte le repere qu il pretend designer.
  await ouvrirProfil(page);
  await page.getByRole("button", { name: "Replay the guide" }).click();
  await expect(page.getByRole("dialog", { name: /Step 1 of \d/ })).toBeVisible({ timeout: 15_000 });

  // Les trois cibles du guide, dans l ordre de ses trois pas.
  await expect(page.locator('[data-guide="curseur-age"]')).toHaveCount(1);
  await expect(page.locator('[data-guide="capsule"]').first()).toBeVisible();
  await expect(page.locator("[data-guide-courant]")).toHaveCount(1);
});
