/**
 * PARCOURS 7 — le tchat avec Vela, a l ecran.
 *
 * ─── POURQUOI CE PARCOURS EXISTE ───────────────────────────────────────────
 *
 * C est l ecran qui a casse trois fois, et les trois fois le defaut etait
 * INVISIBLE cote serveur : la route repondait 200 avec un texte juste, et
 * l ecran affichait « Je n ai pas pu repondre cette fois ».
 *
 * `astrologue-reel.spec.ts` couvre deja la route contre les vrais services.
 * Il n a jamais rien vu de ces trois pannes, parce qu il n ouvre pas l ecran.
 * D ou ce parcours : il ne teste pas si Vela repond bien, il teste si ce
 * qu elle repond ARRIVE.
 *
 * Les quatre defauts qu il empeche de revenir :
 *
 *  — 502 sur rejet du garde-jargon : le texte etait bon, refuse pour un mot, et
 *    la personne se retrouvait devant rien, de facon repetable.
 *  — La reponse en quatre temps affichee comme un bloc, ou pas du tout.
 *  — Le champ `visuel` ignore : ce qui a ete mesure ne se voyait nulle part.
 *  — Le composeur recouvert par la barre d onglets flottante, donc inatteignable.
 */

import { test, expect } from "@playwright/test";
import { brancherReseau, semer, aller } from "./aide/app";

async function ouvrirVela(page: import("@playwright/test").Page) {
  await aller(page, "/app/astrologue");
  await expect(page.getByRole("textbox")).toBeVisible({ timeout: 15000 });
}

async function demander(page: import("@playwright/test").Page, question: string) {
  const champ = page.getByRole("textbox");
  await champ.click();
  await champ.fill(question);
  await page.keyboard.press("Enter");
}

test.describe("tchat avec Vela", () => {
  test.beforeEach(async ({ page }) => {
    await brancherReseau(page);
    await semer(page);
  });

  test("une question recoit une reponse, et pas un message d echec", async ({ page }) => {
    await ouvrirVela(page);
    await demander(page, "What is happening for me at work right now");

    // Le defaut historique : la route repond 200, l ecran affiche l echec.
    // On verifie donc les DEUX : la reponse est la, et l echec ne l est pas.
    await expect(page.getByText(/work is in the spotlight/i)).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/pas pu répondre|couldn't answer|could not answer/i)).toHaveCount(0);
  });

  test("la reponse arrive en temps titres, pas en bloc", async ({ page }) => {
    await ouvrirVela(page);
    await demander(page, "What is happening for me at work right now");
    await expect(page.getByText(/work is in the spotlight/i)).toBeVisible({ timeout: 20000 });

    // Les trois titres de l ecran 4 de Vela. S ils manquent, l interface est
    // retombee sur le bloc unique — ce qui veut dire que `parties` a ete perdu
    // quelque part entre la route et la bulle.
    //
    // On repere les titres par leur `text-transform`, PAS en comparant la
    // casse du texte : les capitales sont posees par CSS, donc `textContent`
    // rend « What's going on » en minuscules. Un detecteur qui compare la casse
    // trouve zero titre sur un ecran parfaitement correct.
    const titres = await page.evaluate(() =>
      [...document.querySelectorAll("span")]
        .filter((e) => getComputedStyle(e).textTransform === "uppercase")
        .map((e) => (e.textContent ?? "").trim())
        .filter((t) => t.length > 2),
    );
    expect(titres.length, `titres trouves : ${titres.join(" | ")}`).toBeGreaterThanOrEqual(3);
  });

  test("ce qui a ete mesure se voit", async ({ page }) => {
    await ouvrirVela(page);
    await demander(page, "What is happening for me at work right now");
    await expect(page.getByText(/work is in the spotlight/i)).toBeVisible({ timeout: 20000 });

    // Le champ `visuel` porte une fenetre : un domaine, des dates, et un
    // nombre de techniques. Zero frise veut dire que le champ a ete ignore.
    const mesure = await page.evaluate(() => {
      const texte = document.body.innerText;
      return {
        phrase: /4 techniques point|4 techniques pointent/i.test(texte),
        frise: [...document.querySelectorAll("div")].filter((e) => {
          const s = getComputedStyle(e);
          const r = e.getBoundingClientRect();
          return parseFloat(s.borderRadius) > 100 && r.height > 3 && r.height < 12 && r.width > 40;
        }).length,
      };
    });
    expect(mesure.phrase, "la phrase qui compte les techniques est absente").toBe(true);
    expect(mesure.frise, "aucune frise de fenetre dessinee").toBeGreaterThanOrEqual(1);
  });

  test("le composeur reste atteignable sous la barre d onglets", async ({ page }) => {
    await ouvrirVela(page);
    await demander(page, "What is happening for me at work right now");
    await expect(page.getByText(/work is in the spotlight/i)).toBeVisible({ timeout: 20000 });

    // La barre d onglets flotte au-dessus du contenu. Si le composeur passe
    // dessous, on ne peut plus ecrire — et rien dans le code ne le dit.
    const recouvert = await page.evaluate(() => {
      const champ = document.querySelector("textarea");
      if (!champ) return "pas de champ";
      const r = champ.getBoundingClientRect();
      const dessus = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return dessus === champ || champ.contains(dessus) ? null : (dessus?.tagName ?? "inconnu");
    });
    expect(recouvert, `le composeur est recouvert par : ${recouvert}`).toBeNull();
  });

  test("rien ne deborde de la largeur de l ecran", async ({ page }) => {
    await ouvrirVela(page);
    await demander(page, "What is happening for me at work right now");
    await expect(page.getByText(/work is in the spotlight/i)).toBeVisible({ timeout: 20000 });
    const deborde = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(deborde, "l ecran de Vela deborde horizontalement").toBeLessThanOrEqual(1);
  });

  test("la conversation se garde dans l appareil", async ({ page }) => {
    await ouvrirVela(page);
    await demander(page, "What is happening for me at work right now");
    await expect(page.getByText(/work is in the spotlight/i)).toBeVisible({ timeout: 20000 });

    // Le titre est tire des premiers mots de la personne, jamais d un appel
    // modele. Sans cette ligne, l ecran d historique est vide alors que la
    // conversation a bien eu lieu.
    const garde = await page.evaluate(() => {
      try {
        const l = JSON.parse(localStorage.getItem("unfold_vela_conversations") ?? "[]");
        return Array.isArray(l) ? l.map((c) => c.titre) : [];
      } catch {
        return [];
      }
    });
    expect(garde.length, "la conversation n a pas ete gardee").toBeGreaterThan(0);
    expect(garde[0]).toContain("What is happening");
  });
});
