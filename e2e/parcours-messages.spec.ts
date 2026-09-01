/**
 * PARCOURS 4 — le centre de messages.
 *
 * ─── D OU IL VIENT ─────────────────────────────────────────────────────────
 *
 * 01/09/2026. Le briefing quotidien s affichait en DEUX cartes montees en
 * `absolute inset-0 z-30 flex items-center justify-center` : centrees
 * par-dessus la timeline entiere, chacune avec sa croix, les deux en meme
 * temps.
 *
 *   « foutre 25 fenetres a cliquer pour les closer, c est pas de l UX, c est de
 *     la punition pour user. »  — Christophe
 *
 * Les trois regles qui en sortent (lib/messages.ts) sont exactement ce que ce
 * fichier verifie, et rien d autre :
 *
 *   1. RIEN NE SE SUPERPOSE AU PRODUIT  → dernier test : la feuille fermee, la
 *      timeline reste manipulable. Si un voile survivait a la fermeture, le
 *      clic serait intercepte et le test tomberait.
 *   2. RIEN A FERMER, seulement un etat lu → ouvrir eteint le point de non-lu,
 *      et il reste eteint apres rechargement.
 *   3. UN SEUL ENDROIT → les messages sont dans la feuille, jamais sur la
 *      timeline.
 */

import { test, expect, type Page } from "@playwright/test";
import { aller, brancherReseau, semer } from "./aide/app";

const CORPS_JOUR = "Un signal net s ouvre cette semaine.";
const CORPS_PERIODE = "La periode en cours favorise les decisions longues.";

function messagesDEssai(lu = false) {
  return [
    { id: "briefing_jour_essai", type: "briefing_jour", corps: CORPS_JOUR, lu },
    { id: "briefing_periode_essai", type: "briefing_periode", corps: CORPS_PERIODE, lu },
  ];
}

/**
 * Le point de non-lu.
 *
 * EXCEPTION ASSUMEE a la regle « jamais de selecteur structurel » : ce point
 * est `aria-hidden`, sans texte et sans role — c est voulu, un lecteur d ecran
 * n a que faire d une pastille decorative. Il est le SEUL enfant du bouton en
 * dehors de l icone, donc on le compte. Si un jour le bouton gagne un autre
 * span, ce test le dira ; c est le prix, et il est petit.
 */
function pointNonLu(page: Page) {
  return page.getByRole("button", { name: "Open messages" }).locator("span");
}

test.beforeEach(async ({ page }) => {
  await brancherReseau(page);
});

test("ouvrir la boite eteint le point de non-lu, et ca tient", async ({ page }) => {
  await semer(page, { messages: messagesDEssai() });
  await aller(page, "/app/timeline");

  const pastille = page.getByRole("button", { name: "Open messages" });
  await expect(pastille).toBeVisible({ timeout: 30_000 });
  await expect(pointNonLu(page)).toHaveCount(1);

  // Avant le clic, RIEN du contenu n est a l ecran : c est la regle 1.
  await expect(page.getByText(CORPS_JOUR)).toBeHidden();

  await pastille.click();

  // Apres le clic, l etat a change : la feuille montre les deux messages.
  await expect(page.getByText("Messages")).toBeVisible();
  await expect(page.getByText(CORPS_JOUR)).toBeVisible();
  await expect(page.getByText(CORPS_PERIODE)).toBeVisible();

  // Et le point s eteint — sans qu on ait rien eu a fermer.
  await expect(pointNonLu(page)).toHaveCount(0);

  // Il reste eteint apres un rechargement : l etat lu est PERSISTE, il n est
  // pas seulement un booleen de rendu.
  await page.reload();
  await expect(page.getByRole("button", { name: "Open messages" })).toBeVisible({ timeout: 30_000 });
  await expect(pointNonLu(page)).toHaveCount(0);
});

test("la feuille fermee ne recouvre plus rien", async ({ page }) => {
  // LE test de la regle 1. Deux cartes plein ecran a z-30 vivaient ici ; si
  // quoi que ce soit de la feuille survit a sa fermeture, le clic sur la
  // bascule de vue est intercepte et Playwright le signale au lieu de
  // l ignorer.
  await semer(page, { messages: messagesDEssai() });
  await aller(page, "/app/timeline");

  const pastille = page.getByRole("button", { name: "Open messages" });
  await expect(pastille).toBeVisible({ timeout: 30_000 });

  await pastille.click();
  await expect(page.getByText(CORPS_JOUR)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByText(CORPS_JOUR)).toBeHidden();

  // La preuve : la timeline repond encore au doigt, et son etat change.
  await page.getByRole("button", { name: "List view" }).click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("unfold_view_mode")))
    .toBe("list");
});

test("boite vide : on le dit, on n allume pas la pastille", async ({ page }) => {
  // Un message qui dit que ca n a pas marche vaut moins que pas de message :
  // il allume la pastille pour rien. lib/messages.ts et DailyBriefing.tsx s en
  // gardent explicitement, et les routes /api/openai sont ici en echec.
  await semer(page, { messages: [] });
  await aller(page, "/app/timeline");

  const pastille = page.getByRole("button", { name: "Open messages" });
  await expect(pastille).toBeVisible({ timeout: 30_000 });
  await expect(pointNonLu(page)).toHaveCount(0);

  await pastille.click();
  await expect(page.getByText("Nothing yet.")).toBeVisible();
  await expect(page.getByText("Your daily signal will land here.")).toBeVisible();
});

test("un briefing recu deux fois ne rallume pas la pastille", async ({ page }) => {
  // Le briefing du jour est redepose a CHAQUE montage de l ecran. Sans la
  // conservation de l etat `lu` dans deposer(), le point se rallumerait a
  // chaque ouverture de l app pour un message deja lu — et on retomberait
  // exactement sur ce qui a fait dire « punition pour user » : une corvee qui
  // revient toute seule.
  const CORPS_RESEAU = "Trois jours d ouverture sur le travail, a partir de jeudi.";

  // Route posee APRES brancherReseau : chez Playwright, la derniere
  // enregistree l emporte.
  await page.route(/\/api\/openai\/daily-brief$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ summary: CORPS_RESEAU, action: "Bloque une matinee." }),
    }),
  );

  await semer(page, { messages: [] });
  await aller(page, "/app/timeline");

  const pastille = page.getByRole("button", { name: "Open messages" });
  await expect(pastille).toBeVisible({ timeout: 30_000 });

  // Le briefing arrive et allume le point.
  await expect(pointNonLu(page)).toHaveCount(1, { timeout: 20_000 });

  await pastille.click();
  await expect(page.getByText(CORPS_RESEAU)).toBeVisible();
  await expect(pointNonLu(page)).toHaveCount(0);
  await page.keyboard.press("Escape");

  // On rouvre l app. La collecte repasse par le meme identifiant du jour ; on
  // attend l etat final observable plutot qu un delai arbitraire, et cet etat
  // doit rester « present ET lu ».
  await page.reload();
  await expect(page.getByRole("button", { name: "Open messages" })).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(
      () =>
        page.evaluate((corps) => {
          const brut = localStorage.getItem("favorable_messages") ?? "[]";
          const liste = JSON.parse(brut) as { corps: string; lu: boolean }[];
          const m = liste.find((x) => x.corps === corps);
          return m ? (m.lu ? "lu" : "non-lu") : "absent";
        }, CORPS_RESEAU),
      { timeout: 20_000, message: "apres rechargement, le briefing deja lu est repasse en non-lu" },
    )
    .toBe("lu");

  await expect(pointNonLu(page)).toHaveCount(0);
});

test("en theme sombre, la boite s ouvre et se lit pareil", async ({ page }) => {
  // Le centre de messages est fait de jetons de verre. Les deux themes ont deja
  // produit des libelles invisibles dans ce depot ; on verifie au minimum que
  // le contenu est bien LA et visible dans les deux.
  await page.emulateMedia({ colorScheme: "dark" });
  await semer(page, { messages: messagesDEssai() });
  await aller(page, "/app/timeline");

  const pastille = page.getByRole("button", { name: "Open messages" });
  await expect(pastille).toBeVisible({ timeout: 30_000 });
  await pastille.click();

  await expect(page.getByText(CORPS_JOUR)).toBeVisible();
  await expect(pointNonLu(page)).toHaveCount(0);
});
