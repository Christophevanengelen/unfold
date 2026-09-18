/**
 * PARCOURS 8 — le resume du jour.
 *
 * ─── CE QU IL REMPLACE ──────────────────────────────────────────────────────
 *
 * Christophe, le 17/09 : « pour le daily briefing, sers-toi des boudins actifs
 * pour en faire un resume important en UNE SEULE communication ». La boite en
 * recevait deux, ecrites chacune par un appel modele a partir des trois signaux
 * bruts les plus forts — alors que l appareil tenait deja toutes les periodes,
 * leurs dates, leur domaine et leur qualite.
 *
 * ─── CE QUE CES TESTS PROTEGENT ────────────────────────────────────────────
 *
 *  — **Une communication, pas deux.** C est la demande, et c est la premiere
 *    chose qui se perdrait en rebranchant une ancienne route « au cas ou ».
 *  — **Le dessin ne depend d aucun reseau.** Les periodes sont locales ; si la
 *    synthese ecrite echoue, la carte doit rester entiere. C est ce qui
 *    distingue ce resume des briefings qu il remplace, lesquels disparaissaient
 *    entierement des que le modele toussait.
 *  — **La frise ne dessine que ce qui est documente.** Sur un jeu qui ne couvre
 *    que l annee en cours, elle affichait quarante colonnes vides — donc
 *    quarante annees ou « il ne s est rien passe ». C est une donnee fabriquee
 *    par omission.
 *
 * Le resume de la vie entiere (la frise/l arc "grands mouvements") avait ses
 * tests ici aussi — retires le 18/09/2026 avec le composant ResumeVie
 * lui-meme (Christophe : « Elimine ce truc [...] ca colle pas avec ce qu on
 * montre au-dessus » — la branche de prunier, BrancheDeVie, l a remplace).
 */

import { test, expect } from "@playwright/test";
import { brancherReseau, semer, ouvrirTimeline } from "./aide/app";

async function ouvrirLaBoite(page: import("@playwright/test").Page) {
  await ouvrirTimeline(page);
  const pastille = page.getByRole("button", { name: "Open messages" });
  await expect(pastille).toBeVisible({ timeout: 30_000 });
  // Le depot passe par un effet puis un appel reseau : on laisse le temps.
  await page.waitForTimeout(4000);
  await pastille.click();
}

test.describe("le resume du jour", () => {
  test.beforeEach(async ({ page }) => {
    await brancherReseau(page);
    await semer(page);
  });

  test("une seule communication, et elle est dessinee", async ({ page }) => {
    await ouvrirLaBoite(page);

    // On attend la phrase de rarete, pas le compte : depuis le 17/09 le compte
    // ne s affiche qu au pluriel, et l ancrer dessus rendrait ce test
    // dependant du nombre de periodes ouvertes ce jour-la.
    await expect(page.getByText(/once in your whole life|whole lifetime/i)).toBeVisible({
      timeout: 20_000,
    });

    // UNE communication, pas deux.
    //
    // On compte les ARTICLES de la boite, pas une tournure de phrase : la
    // premiere version cherchait « period open » dans le texte, or les anciens
    // briefings n emploient pas cette formule. Le test passait donc en
    // rebranchant exactement ce qu il devait interdire.
    const cartes = await page.evaluate(() => document.querySelectorAll("article").length);
    expect(cartes, `${cartes} communications dans la boite au lieu d une`).toBe(1);
  });

  test("la rarete dans une vie est le sujet de la carte", async ({ page }) => {
    await ouvrirLaBoite(page);

    // LE FAIT QUI FAIT L ECRAN.
    //
    // La premiere version affichait « 1 periode ouverte, 1 domaine touche » —
    // de la metadonnee. Christophe, le 17/09 : « je me mets a la place du user,
    // je trouve pas ca super ». Il avait raison.
    //
    // Le moteur envoie, sur 70 boudins sur 77, `lifetimeNumber` et
    // `lifetimeTotal` : la N-ieme fois sur M dans TOUTE une vie. Quand M vaut
    // 1, la chose ne reviendra pas. C est un fait de calendrier, verifiable,
    // et c est ce qu une personne a envie de lire.
    //
    // La donnee etait jetee a l entree par `yearDataToPhases` — declaree nulle
    // part, donc lue nulle part, alors qu elle arrivait a chaque appel.
    await expect(
      page.getByText(/once in your whole life|of \d+ times in a whole lifetime/i),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("le compte des periodes ne prend pas la place du fait", async ({ page }) => {
    await ouvrirLaBoite(page);
    await expect(page.getByText(/once in your whole life/i)).toBeVisible({ timeout: 20_000 });

    // « 1 periode ouverte » n apprend rien a personne et occupait la ligne du
    // seul fait qui compte. Le compte ne s affiche qu au pluriel.
    const texte = await page.evaluate(() => document.body.innerText);
    expect(texte, "le compte au singulier est revenu").not.toMatch(/\b1 period open\b/i);
    expect(texte, "le compte de domaines au singulier est revenu").not.toMatch(/\b1 area touched\b/i);
  });

  test("le dessin tient meme si la synthese ecrite echoue", async ({ page }) => {
    // La route de redaction tombe. Le dessin, lui, vient des periodes locales :
    // il doit rester entier. C est precisement ce que les anciens briefings ne
    // savaient pas faire.
    await page.route("**/api/openai/resume-jour", (route) =>
      route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, raison: "modele_indisponible" }),
      }),
    );
    await ouvrirLaBoite(page);
    await expect(page.getByText(/once in your whole life|whole lifetime/i)).toBeVisible({
      timeout: 20_000,
    });
  });

  test("le repere d aujourd hui est sur la barre", async ({ page }) => {
    await ouvrirLaBoite(page);
    await expect(page.getByText(/once in your whole life|whole lifetime/i)).toBeVisible({
      timeout: 20_000,
    });

    // Un trait vertical fin, pose quelque part sur une barre. Sans lui, la
    // barre dit la duree mais pas ou l on en est — ce qui est tout le sujet.
    const reperes = await page.evaluate(
      () =>
        [...document.querySelectorAll("span")].filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.width <= 3 && r.height >= 10 && r.height <= 18;
        }).length,
    );
    expect(reperes, "aucun repere d aujourd hui sur les barres").toBeGreaterThan(0);
  });
});
