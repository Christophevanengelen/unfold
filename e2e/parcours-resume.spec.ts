/**
 * PARCOURS 8 — les deux resumes : le jour, et la vie entiere.
 *
 * ─── CE QU ILS REMPLACENT ──────────────────────────────────────────────────
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
 */

import { test, expect } from "@playwright/test";
import { brancherReseau, semer, aller, ouvrirTimeline } from "./aide/app";

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

test.describe("le resume d une vie", () => {
  test.beforeEach(async ({ page }) => {
    await brancherReseau(page);
    await semer(page);
  });

  test("la frise se dessine, et ne montre que ce qui est documente", async ({ page }) => {
    await aller(page, "/app/vie");
    await expect(page.getByText(/periods, across|period, across/i)).toBeVisible({ timeout: 20_000 });

    // On compte les colonnes NOMMEES, pas tous les `span` de la page. La
    // premiere version en attrapait d autres et diluait le rapport au point de
    // passer alors que la frise s etendait bien au-dela des donnees.
    const frise = await page.evaluate(() => {
      const barres = [...document.querySelectorAll("[data-frise]")];
      return {
        colonnes: barres.length,
        portantes: barres.filter((e) => Number(e.getAttribute("data-frise")) > 0).length,
      };
    });

    expect(frise.colonnes, "aucune colonne dans la frise").toBeGreaterThan(0);
    // Le garde-fou qui compte : si presque tout est vide, la frise ment par
    // omission au lieu de se borner aux annees que le calcul couvre.
    expect(
      frise.portantes / frise.colonnes,
      `${frise.portantes} colonnes portantes sur ${frise.colonnes} : la frise s etend au-dela des donnees`,
    ).toBeGreaterThan(0.25);
  });

  test("on y arrive par la barre du bas, et le clic navigue vraiment", async ({ page }) => {
    await ouvrirTimeline(page);

    /**
     * Le defaut du 17/09, signale par Christophe : « quand on clique sur Ta
     * vie entiere, ca ne marche pas ».
     *
     * L ecran vivait dans le tiroir profil, derriere un <Link> dont le onClick
     * fermait le tiroir. La feuille se demontait AVANT que le routeur traite le
     * clic, donc l ancre disparaissait et la navigation etait annulee — sans
     * une erreur nulle part, l URL restait simplement la meme.
     *
     * Ce test verifie les deux choses d un coup : que l entree est dans la
     * barre du bas, et que le clic change VRAIMENT d ecran. Verifier la
     * presence du lien n aurait rien prouve : il etait bien present, et bien
     * visible, et il ne faisait rien.
     */
    const onglet = page.getByRole("link", { name: /my life|ma vie/i });
    await expect(onglet, "l entree « Ma vie » manque dans la barre du bas").toHaveCount(1);

    await onglet.first().click();
    await expect(page, "le clic n a pas change d ecran").toHaveURL(/\/app\/vie/);
    await expect(page.locator("[data-arc-total]")).toBeVisible({ timeout: 20_000 });
  });

  test("l arc dessine les mouvements a l echelle de leur duree", async ({ page }) => {
    await aller(page, "/app/vie");

    // L arc arrive apres le reste : il attend le moteur.
    await expect(page.locator("[data-arc-total]")).toBeVisible({ timeout: 20_000 });

    const arc = await page.evaluate(() => {
      const barre = document.querySelector("[data-arc-total]") as HTMLElement | null;
      if (!barre) return null;
      // `offsetWidth` et non `getBoundingClientRect()` : les segments entrent
      // en `scaleX`, et le rectangle client rend la boite APRES transformation.
      // Mesure prise pendant l animation : 0,1 % au lieu de 32 %. La largeur de
      // mise en page, elle, porte le fait qu on teste et ignore la transition.
      const large = barre.offsetWidth;
      const segments = [...barre.querySelectorAll("[data-arc-segment]")].map((e) => ({
        maison: Number(e.getAttribute("data-arc-segment")),
        part: (e as HTMLElement).offsetWidth / large,
      }));
      return { total: Number(barre.getAttribute("data-arc-total")), segments };
    });

    expect(arc, "l arc ne s est pas dessine").not.toBeNull();
    // 27 + 30 + 12 + 15 dans la fixture : la DUREE annoncee, pas la
    // soustraction des dates, qui donnerait 27 + 30 + 12 + 1.
    expect(arc!.total, "la duree totale ne vient pas de duration").toBe(84);
    expect(arc!.segments.map((s) => s.maison)).toEqual([7, 8, 9, 10]);

    // Chaque segment large comme sa duree : c est ce qui fait que la barre est
    // une vie a l echelle et pas quatre cases egales. Une tolerance d un point
    // absorbe les bordures d un pixel et demi entre les blocs.
    const attendu = [27 / 84, 30 / 84, 12 / 84, 15 / 84];
    arc!.segments.forEach((seg, i) => {
      expect(
        Math.abs(seg.part - attendu[i]),
        `segment ${i} : ${(seg.part * 100).toFixed(1)} % au lieu de ${(attendu[i] * 100).toFixed(1)} %`,
      ).toBeLessThan(0.02);
    });
  });

  test("le dernier mouvement ne se ferme pas sur l horizon du moteur", async ({ page }) => {
    await aller(page, "/app/vie");
    await expect(page.locator("[data-arc-total]")).toBeVisible({ timeout: 20_000 });

    // La quatrieme ligne porte la maison 10. Sa date de fin dans le paquet est
    // l horizon de calcul, pas la fin du chapitre : l ecran doit ecrire « a
    // partir de », jamais une fourchette fermee qui serait fausse de 14 ans.
    const ligne = page.locator("[data-arc-ligne='10']");
    await expect(ligne).toBeVisible();
    await expect(ligne).toContainText(/from \d+ onwards/i);

    // Les trois autres sont fermes pour de bon.
    for (const maison of [7, 8, 9]) {
      await expect(page.locator(`[data-arc-ligne='${maison}']`)).toContainText(/\d+ to \d+/);
    }
  });

  test("aucun age negatif dans les mouvements", async ({ page }) => {
    await aller(page, "/app/vie");
    await expect(page.locator("[data-arc-total]")).toBeVisible({ timeout: 20_000 });

    /**
     * Une vie commence a zero.
     *
     * Le premier chapitre demarre a la naissance, mais pas a la meme seconde
     * que la date qu on a en magasin : le moteur l ecrit en UTC, on la lit en
     * heure locale. Quelques heures d ecart suffisent a faire basculer
     * l arrondi et a afficher « -1 a 26 ans ». Vu a l ecran le 17/09.
     *
     * On lit les nombres de chaque ligne plutot que la mise en forme : le
     * signe moins reste un signe moins dans les dix langues.
     */
    const lignes = await page.evaluate(() =>
      [...document.querySelectorAll("[data-arc-ligne]")].map((e) => (e as HTMLElement).innerText),
    );

    expect(lignes.length, "aucune ligne de mouvement").toBeGreaterThan(0);
    for (const ligne of lignes) {
      expect(ligne, `age negatif a l ecran : ${ligne}`).not.toMatch(/-\s*\d/);
    }
  });

  test("aucun nom de technique dans les mouvements", async ({ page }) => {
    await aller(page, "/app/vie");
    await expect(page.locator("[data-arc-total]")).toBeVisible({ timeout: 20_000 });

    // La regle de silence du produit. Le paquet du moteur porte tous ces mots ;
    // la route les jette avant qu ils partent, et ce test le prouve a l ecran.
    const texte = await page.evaluate(() => document.body.innerText);
    for (const jargon of [/zodiacal/i, /releasing/i, /\blot of\b/i, /fortune/i, /capricorn/i, /aquarius/i, /\bruler\b/i]) {
      expect(texte, `nom de technique a l ecran : ${jargon}`).not.toMatch(jargon);
    }
  });

  test("aucun jugement sur une vie", async ({ page }) => {
    await aller(page, "/app/vie");
    await expect(page.getByText(/periods, across|period, across/i)).toBeVisible({ timeout: 20_000 });

    // On compte, on ne juge pas. « L annee la plus chargee » est un compte ;
    // « la plus dure », « la meilleure » seraient des jugements qu aucune
    // mesure ne porte.
    const texte = await page.evaluate(() => document.body.innerText);
    for (const interdit of [/hardest/i, /best year/i, /worst/i, /difficult year/i, /lucky/i]) {
      expect(texte, `jugement a l ecran : ${interdit}`).not.toMatch(interdit);
    }
  });
});
