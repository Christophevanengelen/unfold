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

  test("le partage envoie une IMAGE, pas une phrase", async ({ page }) => {
    await ouvrirRapport(page);

    // Jusqu au 16/09, `navigator.share` recevait une ligne de texte : la carte
    // ne voyageait jamais. Elle est maintenant peinte au Canvas 2D et partagee
    // en fichier.
    //
    // On intercepte `navigator.share` pour attraper ce qui part reellement.
    // C est le seul moyen de verifier le contenu d un partage : le geste natif
    // est hors de portee du test.
    const envoi = await page.evaluate(
      () =>
        new Promise<{
          type: string; octets: number; largeur: number; hauteur: number; encre: number;
        } | null>(
          (resoudre) => {
            // On remplace volontairement l API du navigateur : le geste natif de
            // partage est hors de portee d un test, seul son CONTENU est verifiable.
            navigator.share = async (d: { files?: File[] }) => {
              const f = d.files?.[0];
              if (!f) return resoudre(null);
              const url = URL.createObjectURL(f);
              const img = new Image();
              img.onload = () => {
                // On COMPTE L ENCRE plutot que de peser le fichier. Un PNG de
                // fond degrade pese deja plusieurs centaines de kilo-octets :
                // une carte sans le moindre trait passerait une pesee. On
                // examine donc une bande qui ne contient QUE la figure — ni
                // titre, ni initiales — et on compte les pixels nettement plus
                // clairs que le fond autour d eux.
                const c = document.createElement("canvas");
                c.width = img.width;
                c.height = img.height;
                const x = c.getContext("2d");
                if (!x) return resoudre(null);
                x.drawImage(img, 0, 0);
                const h0 = Math.round(img.height * 0.58);
                const h1 = Math.round(img.height * 0.78);
                const px = x.getImageData(0, h0, img.width, h1 - h0).data;
                let clairs = 0;
                for (let i = 0; i < px.length; i += 4) {
                  // Le fond de cette bande tourne autour de 40 de luminance.
                  if (px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11 > 85) clairs += 1;
                }
                resoudre({
                  type: f.type,
                  octets: f.size,
                  largeur: img.width,
                  hauteur: img.height,
                  encre: clairs,
                });
              };
              img.onerror = () => resoudre(null);
              img.src = url;
            };
            navigator.canShare = () => true;
            [...document.querySelectorAll("button")]
              .find((x) => /share|partager/i.test(x.textContent ?? ""))
              ?.click();
            setTimeout(() => resoudre(null), 20000);
          },
        ),
    );

    expect(envoi, "aucun fichier n a ete partage").not.toBeNull();
    expect(envoi!.type).toBe("image/png");
    // Le portrait 4:5 des recits partages. Un cadre constant, un contenu unique.
    expect(envoi!.largeur).toBe(1080);
    expect(envoi!.hauteur).toBe(1350);
    // L encre : le nombre de pixels de trace dans la bande centrale. Deux
    // courbes de neuf cents points en laissent des dizaines de milliers. Zero
    // veut dire que la carte est partie vide — le symptome exact du « premier
    // rendu vide » qu on a evite en ne capturant aucun DOM.
    expect(envoi!.encre, `${envoi!.encre} pixels de trace : la carte est vide`)
      .toBeGreaterThan(20_000);
  });

  test("la devinette ne se joue qu une fois", async ({ page }) => {
    await ouvrirRapport(page);
    // Elle a ete marquee comme jouee par la graine : on ne doit pas la revoir.
    await expect(page.getByRole("button", { name: /^Voir$|^See$/ })).toHaveCount(0);
  });
});

/**
 * La vitrine — la PREMIERE chose qu on voit dans l onglet Match quand on n a
 * encore invite personne.
 *
 * Le 17/09, apres trois livraisons sur TestFlight, Christophe : « je vois rien
 * qui bouge ». Il avait raison. Le rapport avait ete entierement refait, mais
 * cette vitrine montrait encore l ancienne fiche — et quelqu un sans connexion
 * n a aucun autre chemin vers le nouveau produit.
 *
 * La lecon tient en une phrase : quand on refait un ecran, il faut chercher
 * TOUS les endroits qui le representent. Ce test est la pour que l ecart entre
 * la vitrine et le produit se voie tout de suite.
 */
test.describe("la vitrine montre le produit d aujourd hui", () => {
  test("sans connexion, l empreinte est la — et c est la SIENNE", async ({ page }) => {
    /**
     * REECRIT LE 17/09 AU SOIR. Ce test exigeait « /100 » a l ecran : il
     * gardait le score d exemple, qui etait justement le defaut. Un test peut
     * verrouiller une faute aussi surement qu il protege une qualite, et
     * celui-ci l a fait pendant une journee.
     *
     * L intention d origine reste, et elle est bonne : la vitrine doit montrer
     * le produit d AUJOURD HUI, pas une ancienne fiche. Ce qui change, c est ce
     * qui en tient lieu de preuve — l empreinte, et le fait qu elle soit tiree
     * de la naissance de la personne et non d un couple invente.
     */
    await brancherReseau(page);
    await semer(page); // aucune connexion : c est tout l objet du test
    await page.addInitScript(() => {
      try { localStorage.removeItem("unfold_connections"); } catch { /* stockage refuse */ }
    });
    await aller(page, "/app/compatibility");

    await expect(page.locator("[data-vitrine-vide]")).toBeVisible({ timeout: 15000 });

    // L empreinte : sans elle, la vitrine est retombee sur l ancienne fiche.
    const traces = await page.evaluate(
      () =>
        [...document.querySelectorAll("svg path")].filter(
          (p) => (p.getAttribute("d") ?? "").length > 400,
        ).length,
    );
    expect(traces, "aucune empreinte dans la vitrine : elle montre l ancien ecran").toBeGreaterThan(0);
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

test.describe("le rapport ne chiffre que ce qu il a recu", () => {
  test("aucune dimension a zero quand le moteur n envoie pas le champ", async ({ page }) => {
    /**
     * Le 17/09 au soir, le moteur a change la forme de `gift` : de
     * `{ score, label, desc }` a deux directions nommees, chacune avec sa
     * maison et son domaine. C etait la demande n° 1 de MATCHING-CONTRAT.md —
     * l asymetrie exposee en champs — et c est une rupture silencieuse.
     *
     * L app lisait `gift.score`, ne trouvait rien, et affichait « Generosite
     * 0/100 », etiquetee « faible ». Personne n a rien vu : un champ absent ne
     * leve aucune erreur, `undefined` se propage, et zero est une valeur
     * PARFAITEMENT VALIDE — c est une mesure, « au plus bas ».
     *
     * Ce test refuse tout zero dans les dimensions du rapport. Un zero vrai
     * existe, mais il est assez rare pour qu on prefere le perdre plutot que
     * de laisser passer un champ absent maquille en mesure.
     */
    await brancherReseau(page);
    await semer(page, { connexions: [ALEX] });
    await ouvrirRapport(page);
    await page.waitForTimeout(1200);

    // On vise les DIMENSIONS, pas les axes : sur un axe, un zero est une vraie
    // mesure — une personne peut n avoir aucun point dessus, et la fixture en
    // contient. Sur une dimension, un zero ne peut venir que d un champ absent.
    const valeurs = await page.evaluate(() =>
      [...document.querySelectorAll("[data-dimension]")].map((e) =>
        Number(e.getAttribute("data-dimension")),
      ),
    );

    expect(valeurs.length, "aucune dimension a l ecran").toBeGreaterThan(0);
    expect(
      valeurs.filter((v) => v === 0),
      `dimension(s) a zero : ${valeurs.join(", ")}`,
    ).toEqual([]);
  });
});

test.describe("ce que chacun apporte", () => {
  test.beforeEach(async ({ page }) => {
    await brancherReseau(page);
    await semer(page, { connexions: [ALEX] });
  });

  test("les DEUX sens s affichent, et ils different", async ({ page }) => {
    /**
     * La seule chose du rapport que personne d autre ne fait : ce qui va de A
     * vers B et ce qui va de B vers A, separement.
     *
     * Le moteur l a expose en champs le 17/09, apres la demande n° 1 de
     * MATCHING-CONTRAT.md. Avant, les deux sens etaient enfermes dans une
     * phrase dont on ne pouvait rien tirer.
     *
     * Ce test verifie les DEUX blocs ET le fait qu ils disent des choses
     * differentes. Compter deux blocs n aurait rien prouve : afficher deux fois
     * la meme phrase donnerait deux blocs et detruirait tout l interet.
     */
    await ouvrirRapport(page);
    await page.waitForTimeout(1500);

    const blocs = page.locator("[data-cadeau]");
    await expect(blocs, "les deux sens ne sont pas la").toHaveCount(2);

    const textes = await blocs.allInnerTexts();
    expect(textes[0].trim().length, "un sens est vide").toBeGreaterThan(10);
    expect(textes[1].trim().length, "un sens est vide").toBeGreaterThan(10);
    expect(
      textes[0].trim(),
      "les deux sens disent la meme chose — l asymetrie a disparu",
    ).not.toBe(textes[1].trim());
  });
});

test.describe("l ecran sans aucune connexion", () => {
  test.beforeEach(async ({ page }) => {
    await brancherReseau(page);
    await semer(page);
    await page.addInitScript(() => {
      try { localStorage.removeItem("unfold_connections"); } catch { /* stockage refuse */ }
    });
  });

  test("aucun chiffre invente, et surtout pas un score", async ({ page }) => {
    /**
     * Christophe, le 17/09 : « pour l ecran de demarrage, j aimerais quelque
     * chose qui vende beaucoup mieux ».
     *
     * L ecran montrait une carte d exemple avec un score de 73/100. Trois
     * defauts en un, et le premier est le plus grave : LE PREMIER CHIFFRE QUE
     * LA PERSONNE VOYAIT ETAIT FAUX. Un produit qui vend un resultat calcule ne
     * peut pas apprendre, sur son ecran d accueil, que ses nombres sont
     * decoratifs. Il posait en plus une ancre a 73, contre laquelle un vrai
     * score de 54 se serait vecu comme un echec.
     *
     * Ce test interdit le retour de tout nombre sur cet ecran. Pas seulement
     * « 73 » : n importe quel score, n importe quelle jauge. Tant qu il n y a
     * qu une naissance, il n y a rien a chiffrer.
     */
    await aller(page, "/app/compatibility");
    await expect(page.locator("[data-vitrine-vide]")).toBeVisible({ timeout: 20_000 });

    const texte = await page.locator("[data-vitrine-vide]").innerText();

    // Un score, une note, un pourcentage : aucun n a de raison d exister avant
    // qu il y ait deux naissances.
    expect(texte, `chiffre a l ecran : ${texte}`).not.toMatch(/\d/);
    expect(texte).not.toMatch(/\/\s*100/);

    // Et aucune barre de progression : une jauge dit remplissage, donc
    // performance, donc promesse.
    const jauges = await page.locator("[data-vitrine-vide] [role='img']").count();
    expect(jauges, "une jauge est revenue sur l ecran vide").toBe(0);
  });

  test("le verre montre la meme courbe, pas une seconde personne", async ({ page }) => {
    /**
     * Le concept de l ecran : UNE empreinte, la sienne, et un disque de verre
     * dans lequel la MEME courbe se lit decalee. Dessiner une seconde empreinte
     * serait inventer un deuxieme humain — exactement la faute qu on vient de
     * retirer, sous une autre forme.
     *
     * Deux traces, une seule graine : c est ce qu on verifie.
     */
    await aller(page, "/app/compatibility");
    await expect(page.locator("[data-vitrine-vide]")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("[data-vitrine-verre]")).toHaveCount(1);

    const traces = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll("[data-vitrine-vide] svg")];
      return svgs.map((s) => [...s.querySelectorAll("path")].map((p) => p.getAttribute("d")).join("|"));
    });

    expect(traces.length, "il faut deux rendus de la courbe").toBe(2);
    expect(traces[0], "les deux rendus ne dessinent pas la meme courbe").toBe(traces[1]);
  });

  test("« J ai recu un code » ouvre vraiment le formulaire de saisie", async ({ page }) => {
    /**
     * Christophe, le 17/09 au soir : « je ne peux pas encoder le code ». Il
     * cliquait sur « J ai recu un code » et rien ne se passait.
     *
     * La cause etait double, et aucune des deux ne se voit en lisant un seul
     * fichier :
     *
     *  1. Ce lien pointait vers `/app/invite/join`, une page qui n attend QUE
     *     des parametres d URL (`?name=X&code=X&...`) et qui redirige vers
     *     cette meme page des qu ils manquent. Sans lien profond, la page ne
     *     montre jamais de formulaire — elle n en porte pas.
     *
     *  2. Le VRAI formulaire de saisie existait deja, plus bas sur cette page
     *     — mais entierement a l interieur du bloc reserve a « il y a deja des
     *     connexions ». Premier utilisateur, zero connexion, cercle vicieux :
     *     le seul geste qui aurait pu en creer une etait cache par l absence
     *     de la premiere.
     *
     * Ce test clique le bouton et exige que le CHAMP DE SAISIE apparaisse.
     * Verifier que le bouton existe n aurait rien prouve : il existait, et il
     * ne faisait rien.
     */
    await aller(page, "/app/compatibility");
    await expect(page.locator("[data-vitrine-vide]")).toBeVisible({ timeout: 20_000 });

    // On cible le bouton par son role et sa position — juste sous le bouton
    // principal « Inviter » — plutot que par un texte fige dans une langue :
    // le libelle change selon la locale du navigateur.
    const boutons = page.locator("[data-vitrine-vide] button, [data-vitrine-vide] a");
    const bouton = boutons.last();
    await bouton.click();

    const champ = page.getByPlaceholder("FAV-XXXX");
    await expect(champ, "le formulaire de saisie ne s ouvre pas").toBeVisible({ timeout: 5000 });

    await champ.fill("FAV-TEST");
    await expect(champ).toHaveValue("FAV-TEST");
  });
});
