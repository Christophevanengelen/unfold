/**
 * PARCOURS 1 — de l ecran vide a la premiere timeline.
 *
 * Le parcours qui decide si quelqu un reste. Tout le reste du produit est
 * derriere lui : si une seule etape ne repond pas, il n y a pas d utilisateur.
 *
 * CE QUE CES TESTS EMPECHENT DE REVENIR
 *
 *   01/09/2026 — « un guide qui encadrait une zone vide », « un bouton qui ne
 *   declenchait rien ». Le motif commun de la journee : un ecran qui compile,
 *   qui s affiche, et sur lequel le geste suivant ne produit rien. On
 *   n affirme donc JAMAIS ici qu un bouton existe. On clique, et on verifie
 *   que l ecran d apres est arrive.
 *
 *   L arrivee est verifiee sur une CAPSULE, pas sur l URL ni sur un conteneur :
 *   /app/timeline repond 200 avec une roue de chargement, et c est exactement
 *   l etat que personne ne veut voir apres avoir donne sa date de naissance.
 */

import { test, expect } from "@playwright/test";
import { aller, brancherReseau, ouvrirTimeline, semer, TITRE_PERIODE_COURANTE } from "./aide/app";

test.beforeEach(async ({ page }) => {
  await brancherReseau(page);
});

test("sans donnees de naissance, la timeline renvoie a l onboarding", async ({ page }) => {
  // La garde a une vraie histoire : elle laissait passer vers un ecran vide.
  // On verifie le DEPLACEMENT, pas la presence d un composant garde.
  await semer(page, { naissance: null, premiereFois: true });
  await aller(page, "/app/timeline");

  await expect(page).toHaveURL(/\/app\/onboarding/);
  await expect(page.getByRole("button", { name: "Show me" })).toBeVisible();
});

test("l onboarding complet mene a des capsules reelles", async ({ page }) => {
  // Cinq ecrans, un formulaire et un calcul : le budget de 60 s ne suffit pas,
  // l ecran de preparation prend a lui seul une quinzaine de secondes de
  // revelation avant d offrir sa sortie.
  test.setTimeout(120_000);

  await semer(page, { naissance: null, premiereFois: true });
  await aller(page, "/app/onboarding");

  // ── Ecrans 0 a 2 : chaque clic doit AMENER l ecran suivant ────────────────
  await page.getByRole("button", { name: "Show me" }).click();
  await expect(page.getByRole("button", { name: "What does it mean?" })).toBeVisible();

  await page.getByRole("button", { name: "What does it mean?" }).click();
  await expect(page.getByRole("button", { name: "Reveal my signal" })).toBeVisible();

  await page.getByRole("button", { name: "Reveal my signal" }).click();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();

  // ── Ecran 3 : les priorites ──────────────────────────────────────────────
  // Le bouton restait tapable sans etre actif : un tap ne produisait rien et
  // rien ne disait pourquoi. On verifie donc l ETAT du bouton avant et apres.
  const continuer = page.getByRole("button", { name: "Continue" });
  await expect(continuer).toBeDisabled();

  await page.getByRole("button", { name: "Career" }).click();
  await expect(continuer).toBeEnabled();

  await continuer.click();
  await expect(page.getByRole("button", { name: "Prepare my signal" })).toBeVisible();

  // ── Ecran 4 : la saisie ──────────────────────────────────────────────────
  const preparer = page.getByRole("button", { name: "Prepare my signal" });
  await expect(preparer).toBeDisabled();

  // Les quatre champs sont requis et deux seulement le disaient : le bouton
  // restait eteint SANS UN MOT, et on relisait l ecran en cherchant lequel
  // n allait pas. La liste des manques est desormais nommee sous le bouton.
  // On la suit champ par champ — c est a la fois l assertion de ce
  // comportement et ce qui donne au formulaire le temps de se remettre a jour
  // entre deux saisies, comme un doigt le ferait.
  //
  // `#champs-manquants` est la cible de l `aria-describedby` du bouton : un
  // contrat d accessibilite, pas un accroche-style.
  const manques = page.locator("#champs-manquants");
  await expect(manques).toContainText("First name");

  await page.getByLabel(/First name/).fill("Test");
  await expect(manques).not.toContainText("First name");

  // Format europeen : le champ est un texte masque, pas un <input type=date>.
  // Entree valide la saisie, comme le ferait le passage au champ suivant.
  await page.getByLabel(/Date of birth/).fill("12/04/1985");
  await page.getByLabel(/Date of birth/).press("Enter");
  await expect(manques).not.toContainText("Date of birth");

  await page.getByLabel(/Time of birth/).fill("08:30");
  await expect(manques).not.toContainText("Time of birth");

  // Le lieu doit etre SITUE, pas seulement saisi : taper « Brussels » sans
  // choisir dans la liste laissait passer avec des coordonnees absentes, et
  // l ecran suivant repliait en silence sur un autre theme.
  await page.getByRole("combobox").fill("Brussels");
  await page.getByRole("option", { name: /Brussels/ }).first().click();

  await expect(manques).toHaveCount(0);
  await expect(preparer).toBeEnabled();
  await preparer.click();

  // ── Ecran 5 : le calcul, puis la sortie ──────────────────────────────────
  const voirSignal = page.getByRole("button", { name: "See my signal" });
  await expect(voirSignal).toBeVisible({ timeout: 90_000 });
  await voirSignal.click();

  // ── L ARRIVEE ────────────────────────────────────────────────────────────
  // Pas « la page a repondu » : de vraies capsules, cliquables, et la periode
  // en cours nommee. C est la seule assertion qui distingue une timeline d une
  // roue de chargement.
  await expect(page).toHaveURL(/\/app\/timeline/);
  await expect(page.locator('[data-guide="capsule"]').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("[data-guide-courant]")).toHaveCount(1);

  // Et le contenu est celui du theme demande, pas un decor.
  await page.getByRole("button", { name: "List view" }).click();
  await expect(
    page.getByRole("button", { name: new RegExp(TITRE_PERIODE_COURANTE) }).first(),
  ).toBeVisible();
});

test("taper une capsule ouvre sa fiche, et la fermer la referme", async ({ page }) => {
  // Le troisieme pas du guide dit « touche une capsule ». Il a deja menti une
  // fois sur ce qu il designait (01/09/2026) ; qu il dise vrai suppose au
  // minimum que le geste fasse quelque chose.
  await semer(page);
  await ouvrirTimeline(page);

  const capsuleCourante = page.locator("[data-guide-courant]");
  await expect(capsuleCourante).toBeVisible();

  await capsuleCourante.click();
  // « What's unfolding » n existe QUE dans la fiche de detail, et seulement
  // pour une periode en cours. Voir lib/detail-helpers.ts.
  const fiche = page.getByText("What's unfolding");
  await expect(fiche).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(fiche).toBeHidden();
});
