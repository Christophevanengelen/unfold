/**
 * PARCOURS 5 — la bascule timeline / liste, et les notifications.
 *
 * ─── LES DEFAUTS QUE CES TESTS EMPECHENT DE REVENIR ────────────────────────
 *
 * 01/09/2026, « un reglage de notifications qui n enregistrait pas ». Deux
 * fautes distinctes, toutes deux invisibles a la compilation :
 *
 *   — Les quatre crans de frequence portaient un `disabled` conditionne a la
 *     permission systeme. Comme personne ne l avait accordee, ils etaient
 *     desactives EN PERMANENCE : quatre boutons affiches, aucun ne repondait,
 *     et rien ne disait pourquoi. Un reglage mort sans explication est pire
 *     qu un reglage absent — on croit l app cassee.
 *   — Il n existait aucun moyen de COUPER les envois. Une fois la permission
 *     accordee, la ligne devenait inerte. Le cran « Aucune » est le bouton
 *     d arret ; il doit atteindre le serveur, sans quoi les envois continuent
 *     pendant que l ecran affiche « Rien ne t est envoye ».
 *
 * La bascule de vue, elle, a un passe de superposition : les deux vues se
 * fondaient l une dans l autre et on lisait les boudins par-dessus les lignes
 * de la liste. On verifie donc qu apres la bascule la vue sortante n est plus
 * VISIBLE, et pas seulement qu elle est transparente.
 */

import { test, expect } from "@playwright/test";
import {
  brancherReseau,
  fairePasserPourNative,
  ouvrirProfil,
  ouvrirTimeline,
  semer,
  TITRE_PERIODE_COURANTE,
  type Journal,
} from "./aide/app";

let journal: Journal;

test.describe("bascule timeline / liste", () => {
  test.beforeEach(async ({ page }) => {
    await brancherReseau(page);
    await semer(page);
    await ouvrirTimeline(page);
  });

  test("basculer change reellement de vue, dans les deux sens", async ({ page }) => {
    // La ligne de la periode en cours n existe que dans la vue LISTE. Les deux
    // vues restent montees, donc « presente dans le DOM » ne prouve rien : on
    // demande la VISIBILITE, que Playwright evalue sur `visibility` et
    // `opacity` — exactement ce qui separe les deux vues ici.
    const ligneListe = page
      .getByRole("button", { name: new RegExp(TITRE_PERIODE_COURANTE) })
      .first();
    const capsuleGraphique = page.locator('[data-guide="capsule"]').first();

    await expect(ligneListe).toBeHidden();

    await page.getByRole("button", { name: "List view" }).click();
    await expect(ligneListe).toBeVisible();
    await expect(capsuleGraphique).toBeHidden();

    await page.getByRole("button", { name: "Timeline view" }).click();
    await expect(capsuleGraphique).toBeVisible();
    await expect(ligneListe).toBeHidden();
  });

  test("la vue choisie survit au rechargement", async ({ page }) => {
    // Le choix est enregistre dans unfold_view_mode. Sans persistance, on
    // retombe en vue graphique a chaque ouverture de l app — et le guide, qui
    // refuse de se montrer en vue liste, changerait de comportement selon un
    // reglage que la personne croit avoir pose.
    await page.getByRole("button", { name: "List view" }).click();
    await expect(
      page.getByRole("button", { name: new RegExp(TITRE_PERIODE_COURANTE) }).first(),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("button", { name: new RegExp(TITRE_PERIODE_COURANTE) }).first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('[data-guide="capsule"]').first()).toBeHidden();
  });

  test("les commandes de defilement ne sont pas avalees par un calque", async ({ page }) => {
    /**
     * Christophe, le 17/09 : « les boutons haut, bas et maintenant ne
     * fonctionnent pas bien, on dirait qu il y a un layer au-dessus ».
     *
     * C etait litteralement cela. Le selecteur de vue est pose dans un
     * conteneur `left-0 right-0` : sa boite fait TOUTE la largeur de l ecran
     * alors qu on n y voit qu une pastille centree. Le vide autour etait
     * cliquable, exactement a la hauteur du bouton MAINTENANT et des fleches.
     * Playwright nommait le coupable : « <div class="absolute left-0 right-0
     * z-20 …"> intercepts pointer events ».
     *
     * Le z-index ne reglait rien : les fleches sont en z-30 DANS le sous-arbre
     * de la vue, le conteneur en z-20 au niveau du composant — deux contextes
     * d empilement, des nombres qui ne se comparent pas.
     *
     * CE TEST CLIQUE ET MESURE LE DEFILEMENT. Verifier que les boutons sont
     * visibles n aurait rien prouve : ils l etaient, et ils ne faisaient rien.
     */

    await ouvrirTimeline(page);
    await page.waitForTimeout(2000);

    const defilement = () => page.evaluate(() => {
      const e = [...document.querySelectorAll("*")].find((x) => x.scrollHeight > x.clientHeight + 200 && x.scrollTop > 0) as HTMLElement | undefined;
      return e ? Math.round(e.scrollTop) : -1;
    });

    /** L age lu par le curseur — la seule mesure que la personne voit. */
    const ageLu = () =>
      page.evaluate(() => Number(document.querySelector("[data-age-lu]")?.getAttribute("data-age-lu") ?? NaN));

    const fleches = page.locator("div.absolute.right-2:visible button");
    console.log("fleches trouvees :", await fleches.count());

    const avant = await defilement();
    await fleches.nth(0).click({ timeout: 4000 });
    await page.waitForTimeout(1400);
    const apresHaut = await defilement();
    console.log("HAUT :", avant, "->", apresHaut, apresHaut !== avant ? "BOUGE" : "FIGE");

    await fleches.nth(1).click({ timeout: 4000 });
    await page.waitForTimeout(1400);
    const apresBas = await defilement();
    console.log("BAS  :", apresHaut, "->", apresBas, apresBas !== apresHaut ? "BOUGE" : "FIGE");

    // MAINTENANT n apparait que loin d aujourd hui.
    // On defile le conteneur lui-meme : la molette de la souris ne vise pas
    // forcement la bonne boite dans une pile d elements absolus.
    await page.evaluate(() => {
      const e = [...document.querySelectorAll("*")].find((x) => x.scrollHeight > x.clientHeight + 200) as HTMLElement | undefined;
      if (e) e.scrollTop = Math.max(0, e.scrollTop - 6000);
    });
    await page.waitForTimeout(1500);
    const now = page.locator("button", { hasText: /^now$|^maintenant$/i }).first();
    const vu = await now.isVisible().catch(() => false);
    console.log("MAINTENANT visible :", vu);
    // Le bouton n apparait que loin d aujourd hui. S il n a pas paru, on ne
    // conclut rien : on ne transforme pas une absence en succes.
    expect(vu, "le bouton MAINTENANT n est pas apparu — le test ne prouve rien").toBe(true);

    const avantNow = await defilement();
    await now.click({ timeout: 4000 });
    await page.waitForTimeout(1600);
    const apresNow = await defilement();
    console.log("NOW  :", avantNow, "->", apresNow);
    expect(apresNow, "le bouton MAINTENANT ne fait rien").not.toBe(avantNow);

    expect(apresHaut, "la fleche HAUT ne fait rien").not.toBe(avant);
    expect(apresBas, "la fleche BAS ne fait rien").not.toBe(apresHaut);
  });

  test("les fleches sautent d une annee, pas d une distance", async ({ page }) => {
    /**
     * Christophe, le 17/09 : « les boutons haut et bas, c est pour sauter
     * d une annee a l autre ».
     *
     * Le test au-dessus prouve seulement que l ecran BOUGE. Bouger n est pas
     * sauter d une annee : un defilement de trois mois passerait aussi, et le
     * jour ou quelqu un touche la hauteur d un mois — `PX_PER_MONTH` — le saut
     * deviendrait silencieusement faux sans qu aucun test ne bronche.
     *
     * On mesure donc l AGE, pas les pixels. C est le seul nombre que la
     * personne voit, et il ne peut changer d exactement un que si le saut vaut
     * douze mois.
     */
    await ouvrirTimeline(page);
    await page.waitForTimeout(2000);

    const ageLu = () =>
      page.evaluate(() => Number(document.querySelector("[data-age-lu]")?.getAttribute("data-age-lu") ?? NaN));

    const fleches = page.locator("div.absolute.right-2:visible button");
    const depart = await ageLu();
    expect(Number.isFinite(depart), "aucun age lisible a l ecran").toBe(true);

    await fleches.nth(1).click();
    await page.waitForTimeout(1600);
    const apresBas = await ageLu();
    expect(apresBas, `bas : ${depart} -> ${apresBas}, ce n est pas une annee`).toBe(depart - 1);

    await fleches.nth(0).click();
    await page.waitForTimeout(1600);
    const apresHaut = await ageLu();
    expect(apresHaut, `haut : ${apresBas} -> ${apresHaut}, ce n est pas une annee`).toBe(depart);
  });

  test("la feuille d un signal se lit, et ne dit aucun nom de technique", async ({ page }) => {
    /**
     * Christophe, le 17/09, capture a l appui : « il y a encore de graves
     * problemes de contraste, le "en cours" est illisible, le vert fluo sur le
     * fond mauve clair passe pas du tout ». Et sur la meme image, en clair :
     * « Cycle de vie Fortune+Spirit L2 Scorpio ».
     *
     * DEUX DEFAUTS, UNE SEULE CAUSE DE FOND : personne ne mesurait cet ecran.
     * Le controle de contraste du depot ne l ouvre pas, et le garde-jargon ne
     * regarde pas les libelles traduits a la volee.
     *
     * Six textes sous le seuil en theme clair, zero en sombre. Tous peints dans
     * une couleur de DOMAINE ou de PLANETE — des teintes faites pour des
     * pastilles sur fond sombre, illisibles en lettres de 11 px sur du mauve
     * clair. C est le deuxieme motif recurrent du depot.
     *
     * Ce test ouvre la feuille et mesure chaque texte contre son fond reel,
     * dans les deux themes. Il verifie aussi qu aucun nom de lot, de niveau ou
     * de signe n atteint l ecran.
     */
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      await ouvrirTimeline(page);
      await page.waitForTimeout(1600);
      await page.locator("[data-guide-courant='1']").first().click();
      await page.waitForTimeout(1800);

      const bilan = await page.evaluate(() => {
        // `color(srgb r g b)` donne des composantes de 0 a 1, `rgb()` de 0 a
        // 255. Les confondre fait lire un lavande clair comme du noir, et
        // fabrique des defauts qui n existent pas : le premier instrument de
        // mesure ecrit pour cet ecran s est trompe exactement ainsi.
        const comp = (c: string): number[] | null => {
          const m = c.match(/[-\d.]+/g);
          if (!m) return null;
          const v = m.slice(0, 3).map(Number);
          const a = m.length > 3 ? Number(m[3]) : 1;
          if (a < 0.85) return null;
          return c.startsWith("color(") ? v.map((x) => x * 255) : v;
        };
        const lum = (c: string) => {
          const v = comp(c);
          if (!v) return null;
          const f = (x: number) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(v[0]) + 0.7152 * f(v[1]) + 0.0722 * f(v[2]);
        };
        const fond = (el: Element): string => {
          let e: Element | null = el;
          while (e) {
            const bg = getComputedStyle(e).backgroundColor;
            if (bg && !/rgba?\((0, ){3}0\)|transparent/.test(bg) && comp(bg)) return bg;
            e = e.parentElement;
          }
          return "rgb(255, 255, 255)";
        };
        const feuille = [...document.querySelectorAll("div")].find((d) =>
          d.className.toString().includes("z-[60]"),
        );
        if (!feuille) return null;
        const faibles: string[] = [];
        for (const el of feuille.querySelectorAll("*")) {
          const txt = (el as HTMLElement).innerText?.trim() ?? "";
          if (!txt || txt.length > 60 || el.children.length > 0) continue;
          const st = getComputedStyle(el as HTMLElement);
          const lt = lum(st.color);
          const lf = lum(fond(el));
          if (lt === null || lf === null) continue;
          const c = (Math.max(lt, lf) + 0.05) / (Math.min(lt, lf) + 0.05);
          if (c < 4.5) faibles.push(`${c.toFixed(2)} ${st.fontSize} « ${txt.slice(0, 30)} »`);
        }
        const plein = (feuille as HTMLElement).innerText;
        const jargon = ["Fortune", "Spirit", "Scorpio", "Capricorn", "Aquarius", "Sagittarius", "L1", "L2", "L3"]
          .filter((j) => plein.includes(j));
        return { faibles, jargon };
      });

      expect(bilan, `${theme} : la feuille ne s est pas ouverte`).not.toBeNull();
      expect(
        bilan!.faibles,
        `${theme} : ${bilan!.faibles.length} texte(s) sous 4,5 —\n      ${bilan!.faibles.join("\n      ")}`,
      ).toEqual([]);
      expect(
        bilan!.jargon,
        `${theme} : nom de technique a l ecran : ${bilan!.jargon.join(", ")}`,
      ).toEqual([]);

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    /**
     * Et maintenant une AUTRE periode, parce que celle en cours ne suffit pas.
     *
     * La fixture porte deux libelles bruts du type « ZR L2 — Virgo (fortune) »,
     * qui sont exactement ceux qui produisaient « Cycle de vie Fortune+Spirit
     * L2 Scorpio » a l ecran. Mais la periode EN COURS du jeu de test est un
     * transit, dont le libelle ne contient aucun de ces mots : retirer le
     * garde-fou ne changeait donc rien, et le sabotage passait.
     *
     * Une fixture qui n atteint pas le code teste rend le test decoratif. On
     * ouvre donc aussi les autres periodes.
     */
    await page.emulateMedia({ colorScheme: "light" });
    await ouvrirTimeline(page);
    await page.waitForTimeout(1600);

    const capsules = page.locator("[data-guide='capsule']");
    const total = Math.min(await capsules.count(), 6);
    expect(total, "aucune periode a ouvrir").toBeGreaterThan(1);

    const vus: string[] = [];
    for (let i = 0; i < total; i++) {
      await capsules.nth(i).click();
      await page.waitForTimeout(900);
      const texte = await page.evaluate(() => {
        const f = [...document.querySelectorAll("div")].find((d) =>
          d.className.toString().includes("z-[60]"),
        );
        return f ? (f as HTMLElement).innerText : "";
      });
      if (texte) vus.push(texte);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }

    const MOTS = ["Fortune", "Spirit", "Scorpio", "Virgo", "Leo", "Capricorn", "Aquarius", "L1", "L2", "L3"];
    for (const texte of vus) {
      const fautifs = MOTS.filter((m) => texte.includes(m));
      expect(fautifs, `nom de technique dans une feuille : ${fautifs.join(", ")}`).toEqual([]);
    }
  });

  test("les anneaux du ciel sont centres sur leur planete", async ({ page }) => {
    /**
     * Christophe, le 17/09 : « les planetes ne sont pas au centre des cercles ».
     *
     * Elles ne l etaient pas, et la cause vaut d etre retenue : l anneau etait
     * pose en `left: 50%; top: 50%` plus un `translate(-50%, -50%)` dans le
     * style. C est le reflexe habituel, et il est FAUX des que `motion` anime
     * une transformation sur le meme element — il compose la sienne et ECRASE
     * celle du style. L anneau se retrouvait avec son coin sur le point.
     *
     * Rien ne le signale : ni les types, ni le linter. Le CSS est correct, il
     * est simplement remplace a l execution.
     *
     * Ce test MESURE la distance entre les deux centres. Verifier que l anneau
     * existe n aurait rien prouve : il existait, et il etait a cote.
     */
    await ouvrirTimeline(page);
    await page.waitForTimeout(1600);
    await page.locator("[data-guide-courant='1']").first().click();
    await page.waitForTimeout(3600);

    const ecarts = await page.evaluate(() =>
      [...document.querySelectorAll("[data-planete]")]
        .map((point) => {
          const parent = point.parentElement;
          if (!parent) return null;
          const anneau = [...parent.children].find((c) => c !== point) as HTMLElement | undefined;
          if (!anneau) return null;
          const a = point.getBoundingClientRect();
          const b = anneau.getBoundingClientRect();
          return Math.round(
            Math.hypot(a.x + a.width / 2 - (b.x + b.width / 2), a.y + a.height / 2 - (b.y + b.height / 2)),
          );
        })
        .filter((x): x is number => x !== null),
    );

    expect(ecarts.length, "aucune planete dessinee dans le ciel").toBeGreaterThan(0);
    for (const e of ecarts) {
      expect(e, `un anneau est decale de ${e} px de sa planete`).toBeLessThanOrEqual(2);
    }
  });

  test("la periode en cours se distingue par la NETTETE, pas par la lueur", async ({ page }) => {
    /**
     * Christophe, le 17/09 : « le halo lumineux des cercles actifs, on les
     * confond avec ceux du futur ».
     *
     * Il avait raison, et la cause etait mesurable : la periode en cours
     * portait `0 0 16px` a 20 % — une lueur diffuse — pendant que les periodes
     * a venir portent `blur(2px)`. DEUX TRAITEMENTS FLOUS. L oeil ne separe
     * pas deux flous ; il separe le net du flou.
     *
     * Ce test verrouille l inversion : la periode en cours n a AUCUN flou et
     * porte un lisere franc ; les periodes a venir gardent le leur. Reposer une
     * lueur sur la capsule en cours le fera echouer.
     */
    await ouvrirTimeline(page);
    await page.waitForTimeout(1500);

    const mesures = await page.evaluate(() => {
      const courant = document.querySelector("[data-guide-courant='1']") as HTMLElement | null;
      const toutes = [...document.querySelectorAll("[data-guide='capsule']")] as HTMLElement[];
      const futures = toutes.filter((e) => e !== courant && getComputedStyle(e).filter !== "none");
      if (!courant) return null;
      const s = getComputedStyle(courant);
      return {
        filtreCourant: s.filter,
        ombreCourant: s.boxShadow,
        repere: !!courant.querySelector("span[aria-hidden]"),
        nbFutursFlous: futures.length,
      };
    });

    expect(mesures, "aucune periode en cours a l ecran").not.toBeNull();

    // La nettete : aucun flou sur la periode ouverte.
    expect(mesures!.filtreCourant, "la periode en cours est floutee").toMatch(/^none$/);

    // Un lisere INTERIEUR, franc. Une lueur s ecrit sans `inset` et avec un
    // rayon de flou ; un lisere s ecrit avec `inset` et un rayon nul.
    expect(mesures!.ombreCourant, "la periode en cours n a pas de lisere franc").toContain("inset");
    expect(
      mesures!.ombreCourant,
      `lueur diffuse revenue sur la periode en cours : ${mesures!.ombreCourant}`,
    ).not.toMatch(/(?<!inset.*)\b(1[0-9]|[2-9][0-9])px\b/);

    // Le repere qui bat.
    expect(mesures!.repere, "le repere « en ce moment » a disparu").toBe(true);

    // Et le flou reste la marque du futur, sinon la distinction n existe plus.
    expect(mesures!.nbFutursFlous, "plus aucune periode a venir n est floutee").toBeGreaterThan(0);
  });

  test("en theme clair comme en sombre, la liste montre la periode en cours", async ({ page }) => {
    // Le titre de la ligne en cours a ete blanc EN DUR : lisible en sombre,
    // invisible en clair (1,1 de contraste). Le controle de contraste ne le
    // voyait pas, parce qu il n ouvre pas l app. Celui-ci l ouvre.
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      await page.getByRole("button", { name: "List view" }).click();
      await expect(
        page.getByRole("button", { name: new RegExp(TITRE_PERIODE_COURANTE) }).first(),
      ).toBeVisible();
      await page.getByRole("button", { name: "Timeline view" }).click();
      await expect(page.locator('[data-guide="capsule"]').first()).toBeVisible();
    }
  });
});

test.describe("notifications", () => {
  test.beforeEach(async ({ page }) => {
    journal = await brancherReseau(page);
    // Sans coque native, lib/push.ts rend « indisponible » et TOUT le bloc
    // notifications disparait du DOM. Il n y a alors rien a tester sur le web,
    // ce qui est precisement pourquoi ces reglages ont pu rester morts si
    // longtemps sans que personne le voie.
    await fairePasserPourNative(page);
    await semer(page);
    await ouvrirTimeline(page);
  });

  test("les crans de frequence repondent au doigt", async ({ page }) => {
    // Le defaut : `disabled` tant que la permission n etait pas accordee,
    // c est-a-dire toujours. On verifie donc que le cran choisi devient le cran
    // ACTIF — aria-pressed, que le produit expose deja.
    await ouvrirProfil(page);

    const equilibre = page.getByRole("button", { name: "Balanced" });
    const essentiel = page.getByRole("button", { name: "Essential only" });

    await expect(equilibre).toBeVisible();
    await expect(equilibre).toHaveAttribute("aria-pressed", "true");
    await expect(essentiel).toHaveAttribute("aria-pressed", "false");

    await essentiel.click();

    await expect(essentiel).toHaveAttribute("aria-pressed", "true");
    await expect(equilibre).toHaveAttribute("aria-pressed", "false");
  });

  test("« Aucune » coupe la planification, cote ecran ET cote serveur", async ({ page }) => {
    // Le bouton d ARRET. C est le seul cran dont l echec est silencieux et
    // grave : l ecran annonce « Rien ne t est envoye » pendant que le serveur
    // continue d envoyer. On verifie les deux bouts.
    await ouvrirProfil(page);

    const aucune = page.getByRole("button", { name: "None" });
    await expect(aucune).toHaveAttribute("aria-pressed", "false");

    await aucune.click();

    // Cote ecran : le cran est pris, et la ligne d explication dit ce que ce
    // cran envoie reellement.
    await expect(aucune).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByText("Nothing is sent to you. You can turn it back on anytime."),
    ).toBeVisible();

    // Cote serveur : le choix est PARTI. Sans cet appel, la planification n est
    // jamais videe et l ecran ment.
    await expect
      .poll(() => journal.cadence.map((c) => c.cadence), {
        timeout: 15_000,
        message: "le cran « Aucune » n a jamais atteint /api/push/cadence",
      })
      .toContain("aucune");

    // L identifiant d appareil part avec : sans lui la route repond 400 et le
    // reglage est perdu en silence.
    const dernier = journal.cadence[journal.cadence.length - 1];
    expect(dernier.deviceId.length).toBeGreaterThanOrEqual(8);
  });

  test("le cran choisi survit au rechargement", async ({ page }) => {
    // La copie locale existe pour afficher le bon cran sans attendre le
    // reseau. Si elle n est pas ecrite, le reglage « revient » a son ancienne
    // valeur des qu on rouvre le tiroir, et on croit que rien n a ete pris.
    await ouvrirProfil(page);
    await page.getByRole("button", { name: "Everything" }).click();
    await expect(page.getByRole("button", { name: "Everything" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.reload();
    await expect(page.locator('[data-guide="capsule"]').first()).toBeVisible({ timeout: 30_000 });
    await ouvrirProfil(page);
    await expect(page.getByRole("button", { name: "Everything" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("demander les notifications DECLENCHE quelque chose, et le mesure", async ({ page }) => {
    // Ce qu un navigateur ne peut pas faire : accorder une permission iOS. La
    // boite systeme n existe pas ici, et pretendre la tester serait un test qui
    // ment.
    //
    // Ce qu il PEUT faire, et qui est le vrai defaut du 01/09 : verifier que la
    // ligne existe, qu elle repond au doigt, et que le geste laisse une trace.
    // La table des jetons etait vide ce jour-la, et rien ne permettait de dire
    // si personne n avait demande ou si tout le monde echouait — parce que la
    // demande n etait pas mesuree. « notif_demandee » est emis AVANT l issue,
    // exactement pour cette raison.
    await ouvrirProfil(page);

    const ligne = page.getByRole("button", { name: /Notify me/ });
    await expect(ligne).toBeVisible();
    await expect(ligne).toBeEnabled();

    await ligne.click();

    await expect
      .poll(() => journal.evenements, {
        timeout: 15_000,
        message: "le clic sur « Notify me » n a emis aucune mesure : un silence de plus",
      })
      .toContain("notif_demandee");

    // CE QU ON NE PEUT PAS TESTER ICI, et pourquoi on ne fait pas semblant :
    // l ISSUE de la demande. Dans un navigateur, l appel au greffon Capacitor
    // part vers un pont natif qui n existe pas et ne revient jamais — la
    // promesse ne se resout ni ne rejette. Aucun des trois evenements
    // « notif_accordee / refusee / echec » ne peut donc arriver hors de la
    // coque, et ecrire une assertion dessus donnerait un test qui echoue pour
    // une raison sans rapport avec le produit. L issue se verifie sur
    // l appareil, avec les compteurs de lib/mesure.ts.
  });

  test("hors de l app, le bloc notifications n est pas affiche", async ({ browser }) => {
    // Le pendant du test precedent, et la moitie de la regle : « indisponible »
    // veut dire « nous ne sommes pas dans l app, cette fonction n existe pas
    // ici ». Un reglage de notifications distantes sur la vitrine web serait un
    // bouton qui ne peut rien faire.
    const contexte = await browser.newContext();
    const onglet = await contexte.newPage();
    await brancherReseau(onglet);
    await semer(onglet);
    await ouvrirTimeline(onglet);

    await ouvrirProfil(onglet);
    await expect(onglet.getByRole("button", { name: /Notify me/ })).toHaveCount(0);
    await expect(onglet.getByRole("button", { name: "Balanced" })).toHaveCount(0);

    await contexte.close();
  });
});
