/**
 * Le VRAI moteur, une fois.
 *
 * ─── POURQUOI CE FICHIER EST SEUL, ET HORS DE LA SUITE RAPIDE ──────────────
 *
 * Les parcours (e2e/parcours-*.spec.ts) simulent le moteur : ils testent la
 * chaine qui va des donnees jusqu au doigt, et c est la que vivaient les quatre
 * defauts du 01/09/2026. Mais une chaine juste branchee sur un moteur qui a
 * change de forme ne montre rien. Ce test-ci est le seul qui verifie que le
 * moteur repond ENCORE ce que l adaptateur sait lire.
 *
 * Il n est pas dans la suite rapide pour une raison precise : le moteur est un
 * service tiers, il met 30 a 120 secondes au premier appel pour un theme neuf,
 * et il tombe. Un test qui echoue une fois sur trois fait desactiver la suite
 * entiere — et emporte avec lui les quinze tests qui, eux, sont stables.
 *
 *     npm run test:e2e:moteur
 *
 * A lancer avant une mise en production, et le jour ou Marie-Ange touche a
 * l API. Un echec ici ne veut pas dire « le code est casse » : il veut dire
 * « le moteur ne repond pas, ou plus de la meme facon ». Les deux se
 * distinguent en lisant le message.
 */

import { test, expect } from "@playwright/test";
import { NAISSANCE } from "./aide/moteur";

/**
 * DEFAUT REEL, TROUVE EN ECRIVANT CETTE SUITE — 01/09/2026.
 *
 * `/api/openai/daily-brief` repond 502 { ok:false, raison:"signaux_indisponibles" }
 * a CHAQUE appel. Consequence produit : le briefing « Aujourd hui » n arrive
 * JAMAIS dans le centre de messages. La boite ne recoit que « En ce moment »,
 * servi par l autre route, qui elle repond 200.
 *
 * LA CAUSE, verifiee a la main contre le moteur :
 *
 *   endpoints/daily-brief.php rend { success, data: { success, signals, ... } }
 *   app/api/openai/daily-brief/route.ts lit briefData.signals et
 *   briefData.success — c est-a-dire le niveau du DESSUS, ou il n y a ni l un
 *   ni l autre. La condition ligne ~374 est donc toujours vraie et la route
 *   sort en 502 avant meme d appeler le modele.
 *
 *   L interface DailyBriefResponse (ligne 139) decrit la reponse SANS son
 *   enveloppe : le typage confirme la lecture fausse au lieu de la signaler.
 *   C est exactement le motif que lib/momentum-adapter.ts contourne deja
 *   explicitement — « Handle double-nested API response: .data.data.boudins ou
 *   .data.boudins ». Cette route-ci n a pas eu ce traitement.
 *
 * Le correctif tient en une ligne (lire `brut.data ?? brut`), mais il touche un
 * fichier de l app : hors du perimetre de cette suite. Le test est donc pose,
 * marque fixme, et n attend qu a etre reactive.
 *
 * Rien ici n est reproductible sans le moteur — d ou sa place dans ce fichier
 * et non dans la suite rapide.
 */
test.fixme("le briefing du jour arrive, au lieu de 502", async ({ request }) => {
  const res = await request.post("/api/openai/daily-brief", {
    data: { birthData: NAISSANCE, locale: "en" },
    timeout: 120_000,
  });

  expect(res.status(), await res.text()).toBe(200);
  const corps = (await res.json()) as { ok?: boolean; summary?: string };
  expect(corps.ok).not.toBe(false);
  // Trois mots au moins : c est le seuil que DailyBriefing.tsx applique avant
  // d accepter de deposer un message. En dessous, la boite reste vide sans que
  // rien ne le dise.
  expect((corps.summary ?? "").trim().split(/\s+/).length).toBeGreaterThanOrEqual(3);
});

test("le moteur repond, et l app en tire des capsules", async ({ page }) => {
  await page.addInitScript((naissance) => {
    try {
      localStorage.setItem("unfold_locale", "en");
      localStorage.setItem("unfold_birth_data", JSON.stringify(naissance));
      localStorage.setItem("unfold_timeline_welcomed", "true");
      localStorage.setItem("unfold_first_use_done", "1");
      localStorage.setItem("favorable_push_propose_le", new Date().toISOString());
    } catch {
      /* stockage refuse */
    }
  }, NAISSANCE);

  await page.goto("/app/timeline?desktop=1");

  // Le seul delai long de toute la suite, et il est justifie : c est le temps
  // que met reellement le moteur a calculer une vie entiere.
  await expect(page.locator('[data-guide="capsule"]').first()).toBeVisible({ timeout: 240_000 });

  // Une vie entiere, pas trois evenements : si le moteur repond une reponse
  // vide ou tronquee, l ecran se remplit quand meme et rien ne le dit.
  const capsules = await page.locator('[data-guide="capsule"]').count();
  expect(capsules, "le moteur a repondu, mais avec presque rien").toBeGreaterThan(5);

  // Et il y a un MAINTENANT. Sans periode en cours, le troisieme pas du guide
  // n a pas de cible et la vue liste ne sait pas ou se placer.
  //
  // Au moins une, et non exactement une : sur un theme reel, plusieurs
  // periodes se chevauchent souvent aujourd hui. C est le jeu d essai des
  // parcours qui n en a qu une, pour pouvoir la designer sans ambiguite.
  const courantes = await page.locator("[data-guide-courant]").count();
  expect(courantes, "aucune periode en cours : le guide n aurait rien a designer").toBeGreaterThan(0);
});
