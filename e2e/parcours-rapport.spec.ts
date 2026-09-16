/**
 * PARCOURS 6 — le rapport de compatibilite.
 *
 * ─── POURQUOI CE PARCOURS EXISTE ───────────────────────────────────────────
 *
 * L ecran a ete entierement refait le 16/09/2026, et quatre des defauts
 * trouves ce jour-la n auraient ete vus par AUCUN controle statique. Ils sont
 * la raison d etre de chacun des tests ci-dessous.
 *
 *  — Le relais rendait la reponse du moteur telle quelle, alors qu elle est
 *    EMBALLEE dans un champ `data`. La lecture cherchait donc un niveau trop
 *    haut, et l ecran affichait « le calcul n a pas abouti » sur une reponse
 *    parfaitement valide. Les types passaient : `unknown` ne proteste pas.
 *
 *  — Le titre d une mesure se tronquait en deux colonnes : « Ce qui se
 *    resse… ». Un libelle coupe n est pas un libelle, et neuf des dix langues
 *    sont plus longues que le francais.
 *
 *  — L empreinte laissait passer des fragments de courbe en JAUNE-VERT en
 *    theme clair. Invisible en theme sombre, invisible dans le code.
 *
 *  — Les fenetres de timing, restees sous le rapport, affichaient du jargon en
 *    clair : « Noeud Sud en conjonction avec Saturne natal ». Le produit
 *    l interdit. Elles sont fermees ; ce parcours verifie qu elles le restent.
 *
 * ─── CE QU IL NE TESTE PAS ─────────────────────────────────────────────────
 *
 * La beaute. Elle se regarde, et c est Christophe qui la juge. Ce parcours ne
 * mesure que des faits : un chiffre present, une largeur, une couleur, un mot
 * interdit absent.
 */

import { test, expect } from "@playwright/test";
import { brancherReseau, semer, aller, NAISSANCE } from "./aide/app";

const ALEX = {
  id: "t1",
  name: "Alex",
  initial: "A",
  relationship: "friend",
  birthData: { ...NAISSANCE, nickname: "Alex", birthDate: "1982-09-02", birthTime: "02:15" },
  connectedSince: "2026-05-14",
  inviteCode: "TST123",
};

async function ouvrirRapport(page: import("@playwright/test").Page) {
  await aller(page, "/app/compatibility/t1");
  // Le chiffre de tete est le seul signal fiable que le rapport est monte :
  // il n apparait qu une fois la reponse du moteur lue ET rangee.
  await expect(page.getByText("/100")).toBeVisible({ timeout: 20000 });
}

test.describe("rapport de compatibilite", () => {
  test.beforeEach(async ({ page }) => {
    await brancherReseau(page);
    await semer(page, { connexions: [ALEX] });
  });

  test("le score du moteur s affiche", async ({ page }) => {
    await ouvrirRapport(page);
    // 73 est le score de la fixture, qui est la reponse reelle du moteur.
    await expect(page.getByText("73", { exact: true }).first()).toBeVisible();
  });

  test("une reponse encore EMBALLEE est lue quand meme", async ({ page }) => {
    // Le moteur emballe sa charge dans un champ `data`. Le relais la deballe
    // maintenant, mais une reponse gardee en cache AVANT cette correction porte
    // encore l enveloppe — et `lireMatch` la tolere explicitement pour ne pas
    // vider le cache de tout le monde sur un changement de forme.
    //
    // Sans ce test, le jour ou quelqu un « nettoie » cette tolerance, les gens
    // qui ont deja ouvert un rapport verraient « le calcul n a pas abouti » —
    // et personne ne le saurait, parce qu une installation neuve, elle,
    // marcherait parfaitement.
    await page.addInitScript(
      ([clef, valeur]) => localStorage.setItem(clef as string, valeur as string),
      [
        "unfold_match_cache",
        JSON.stringify({
          "1985-04-12|08:30|50.8503|4.3517|Europe/Brussels>1982-09-02|02:15|50.8503|4.3517|Europe/Brussels":
            {
              quand: new Date().toISOString(),
              match: {
                success: true,
                data: {
                  compatibility: { score: 61, label: "Fair" },
                  resemblance: { score: 40 },
                  balance: { score: 55 },
                  attraction: { aToB: 50, bToA: 50 },
                  boss: { who: "person1", confidence: 40 },
                  exclusive: { score: 30 },
                  generalUnderstanding: { score: 30 },
                  gift: { score: 30 },
                  hugs: { score: 30 },
                  compatibilityRadar: [{ planet: "Saturn", pointsperc: 50, pointsperc2: 40 }],
                  person1: { dominantPlanet: { planet: "Moon" } },
                  person2: { dominantPlanet: { planet: "Venus" } },
                },
              },
            },
        }),
      ],
    );
    await ouvrirRapport(page);
    await expect(page.getByText("61", { exact: true }).first()).toBeVisible();
  });

  test("aucun libelle de mesure n est tronque", async ({ page }) => {
    await ouvrirRapport(page);
    // DEUX mesures, parce qu une seule ne suffit pas.
    //
    // Le symptome — `scrollWidth` plus grand que la boite — ne se declenche que
    // si le texte deborde DANS LA LANGUE DU TEST. Les tests tournent en
    // anglais, qui est la plus courte des dix ; un libelle allemand ou
    // portugais couperait sans que ce test bronche.
    //
    // On verifie donc aussi la REGLE : un libelle de mesure ne porte jamais de
    // troncature. C est elle qu on a retiree le 16/09, et c est elle qui doit
    // rester retiree, quelle que soit la langue affichee ce jour-la.
    const fautifs = await page.evaluate(() => {
      const titres = [...document.querySelectorAll("span")].filter(
        (e) => getComputedStyle(e).fontWeight === "600" && (e.textContent ?? "").length > 6,
      );
      return {
        deborde: titres
          .filter((e) => e.scrollWidth - e.clientWidth > 1)
          .map((e) => e.textContent?.slice(0, 40)),
        tronque: titres
          .filter((e) => getComputedStyle(e).textOverflow === "ellipsis")
          .map((e) => e.textContent?.slice(0, 40)),
        combien: titres.length,
      };
    });
    expect(fautifs.combien, "aucun libelle de mesure trouve : le test ne mesure rien").toBeGreaterThan(3);
    expect(fautifs.deborde, `libelles qui debordent : ${fautifs.deborde.join(" | ")}`).toEqual([]);
    expect(fautifs.tronque, `libelles regles pour se tronquer : ${fautifs.tronque.join(" | ")}`).toEqual([]);
  });

  test("rien ne deborde de la largeur de l ecran", async ({ page }) => {
    await ouvrirRapport(page);
    const deborde = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(deborde, "le rapport deborde horizontalement").toBeLessThanOrEqual(1);
  });

  test("l empreinte se dessine, et dans la plage de couleur du produit", async ({ page }) => {
    await ouvrirRapport(page);
    const traits = await page.evaluate(() =>
      [...document.querySelectorAll("svg path")]
        .filter((p) => (p.getAttribute("d") ?? "").length > 400)
        .map((p) => getComputedStyle(p).stroke),
    );
    expect(traits.length, "aucune courbe d empreinte tracee").toBeGreaterThan(0);

    // Rose a bleu : le canal bleu ne descend jamais sous le vert. C est ce qui
    // a saute en theme clair quand la couleur passait par oklch() dans une
    // couche animee.
    for (const couleur of traits) {
      const [r, v, b] = (couleur.match(/\d+/g) ?? []).map(Number);
      expect(b, `trait hors plage : ${couleur}`).toBeGreaterThanOrEqual(v);
      expect(r > 150 && v > 150 && b < 110, `trait jaune : ${couleur}`).toBe(false);
    }
  });

  test("aucun jargon de technique n atteint l ecran", async ({ page }) => {
    await ouvrirRapport(page);
    // On deroule tout : les fenetres de timing vivaient tout en bas.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const texte = await page.evaluate(() => document.body.innerText);
    for (const interdit of [
      /Noeud Sud/i, /Nœud Sud/i, /conjonction/i, /\bnatal(e|es|aux)?\b/i,
      /Lot de Spirit/i, /loosening of the bond/i, /\bmaison\s+\d/i,
    ]) {
      expect(texte, `jargon a l ecran : ${interdit}`).not.toMatch(interdit);
    }
  });

  test("la methode se deplie, et dit ce que le produit ne pretend pas", async ({ page }) => {
    await ouvrirRapport(page);
    // On vise le bouton par son libelle, pas par sa position : un bouton
    // "dernier de la page" change des qu on ajoute une section.
    const bouton = page.getByRole("button", { name: /Where these numbers|D.où sortent ces chiffres/i });
    await bouton.scrollIntoViewIfNeeded();
    await bouton.click();
    // La phrase qui compte : elle dit qu on ne predit rien. C est la promesse
    // la plus facile a perdre dans une refonte.
    await expect(page.getByText(/pas une prédiction|not a prediction/i)).toBeVisible();
  });

  test("la devinette ne se joue qu une fois", async ({ page }) => {
    await ouvrirRapport(page);
    // Elle a ete marquee comme jouee par la graine : on ne doit pas la revoir.
    await expect(page.getByRole("button", { name: /^Voir$|^See$/ })).toHaveCount(0);
  });
});

test.describe("rapport de compatibilite — theme clair", () => {
  test.use({ colorScheme: "light" });

  test("l empreinte garde sa couleur en theme clair", async ({ page }) => {
    await brancherReseau(page);
    await semer(page, { connexions: [ALEX] });
    await ouvrirRapport(page);
    const traits = await page.evaluate(() =>
      [...document.querySelectorAll("svg path")]
        .filter((p) => (p.getAttribute("d") ?? "").length > 400)
        .map((p) => getComputedStyle(p).stroke),
    );
    expect(traits.length).toBeGreaterThan(0);
    for (const couleur of traits) {
      const [r, v, b] = (couleur.match(/\d+/g) ?? []).map(Number);
      expect(r > 150 && v > 150 && b < 110, `trait jaune en theme clair : ${couleur}`).toBe(false);
    }
  });
});
