/**
 * Les outils communs aux parcours.
 *
 * Trois gestes, toujours dans cet ordre :
 *   1. brancherReseau  — le moteur et les routes serveur, simules et OBSERVES.
 *   2. semer           — l etat de depart, pose avant que React ne monte.
 *   3. ouvrirTimeline  — arriver sur la timeline et attendre de VRAIES capsules.
 *
 * Puis, selon le parcours : ouvrirProfil, ageAffiche, fairePasserPourNative.
 *
 * Regle de selection appliquee partout dans cette suite : on vise par ROLE et
 * par TEXTE ACCESSIBLE, jamais par classe CSS. Le dessin bouge toutes les
 * semaines dans ce depot ; les intentions, non. Les deux seules exceptions sont
 * commentees a l endroit ou elles servent.
 */

import { expect, type Page } from "@playwright/test";
import { NAISSANCE, reponseAnnee, reponseVie, type Naissance } from "./moteur";

export {
  NAISSANCE,
  TITRE_PERIODE_COURANTE,
  TITRE_APRES_1970,
  TITRE_AVANT_1970,
} from "./moteur";
export type { Naissance } from "./moteur";

/** Ce que le reseau a reellement recu. Un test peut l inspecter. */
export interface Journal {
  /** Un par appel au moteur : quel endpoint, pour quelles donnees de naissance. */
  moteur: { endpoint: string; birthDate: string; birthTime: string; latitude: number }[];
  /** Un par reglage de cadence envoye au serveur. */
  cadence: { cadence: string; deviceId: string }[];
  /** Les evenements de mesure emis par l app (lib/mesure.ts). */
  evenements: string[];
}

/**
 * Simule le moteur et neutralise le reste du serveur.
 *
 * Le filtre porte sur `/api/` dans l URL COMPLETE, pas sur un chemin relatif :
 * quand l app se croit native (voir `fairePasserPourNative`), lib/api-client.ts
 * prefixe tout par https://favorable.day. Sans ce filtre large, les tests de
 * notification taperaient la production.
 */
export async function brancherReseau(
  page: Page,
  options: {
    /** Aucune periode ouverte aujourd hui : le produit se tait, la boite reste
     *  vide. C est un etat reel, pas une panne — voir parcours-messages. */
    sansPeriodeCourante?: boolean;
  } = {},
): Promise<Journal> {
  const journal: Journal = { moteur: [], cadence: [], evenements: [] };

  const servirMoteur = (endpoint: string, corps: Record<string, unknown>) => {
    const naissance = {
      birthDate: String(corps.birthDate ?? ""),
      birthTime: String(corps.birthTime ?? ""),
      latitude: Number(corps.latitude ?? 0),
    };
    journal.moteur.push({ endpoint, ...naissance });
    return endpoint === "toctoc-year"
      ? reponseAnnee(naissance, options.sansPeriodeCourante)
      : reponseVie(naissance);
  };

  /** Le corps de la requete, ou un objet vide. Ne leve jamais : certaines
   *  requetes n en ont pas, et sendBeacon en envoie un qui n est pas du JSON
   *  aux yeux de Playwright. */
  const lireCorps = (route: import("@playwright/test").Route): Record<string, unknown> => {
    try {
      return (route.request().postDataJSON() ?? {}) as Record<string, unknown>;
    } catch {
      try {
        return JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;
      } catch {
        return {};
      }
    }
  };

  await page.route(/\/api\//, async (route) => {
    const chemin = new URL(route.request().url()).pathname;
    const corps = lireCorps(route);
    const json = (valeur: unknown) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(valeur) });

    if (chemin.endsWith("/api/toctoc")) {
      return json(servirMoteur(String(corps.endpoint ?? "toctoc-year"), corps));
    }

    if (chemin.endsWith("/api/geocode")) {
      // Une seule ville, toujours la meme : le champ de saisie de l onboarding
      // exige un lieu SITUE, et une liste vide bloquerait le parcours.
      return json({
        results: [{
          id: 2800866, name: "Brussels", latitude: 50.8503, longitude: 4.3517,
          timezone: "Europe/Brussels", country: "Belgium", admin1: "Brussels Capital",
        }],
      });
    }

    if (chemin.endsWith("/api/billing/me")) return json({ plan: "free" });

    if (chemin.endsWith("/api/match")) {
      // La reponse REELLE du moteur de compatibilite, relevee le 16/09/2026 sur
      // deux naissances libres — y compris son enveloppe `data`, que le relais
      // deballe. On ne la simplifie pas : une fixture plus propre que la
      // realite ferait passer un test que la production echouerait.
      //
      // Les sept axes a zero sur dix sont vrais eux aussi. C est ce qui a
      // decide de ne pas dessiner de radar a dix branches, et un test doit
      // pouvoir montrer ce cas.
      return json({
        ok: true,
        match: {
          compatibility: { score: 73, label: "Good" },
          resemblance: { score: 82 },
          balance: { score: 82 },
          attraction: { aToB: 53, bToA: 56 },
          boss: { who: "person2", confidence: 63 },
          exclusive: { score: 59 },
          generalUnderstanding: { score: 48 },
          gift: { score: 57 },
          hugs: { score: 50 },
          compatibilityRadar: [
            { planet: "Sun", pointsperc: 0, pointsperc2: 0 },
            { planet: "Moon", pointsperc: 44, pointsperc2: 27 },
            { planet: "Mercury", pointsperc: 0, pointsperc2: 0 },
            { planet: "Venus", pointsperc: 0, pointsperc2: 82 },
            { planet: "Mars", pointsperc: 0, pointsperc2: 0 },
            { planet: "Jupiter", pointsperc: 0, pointsperc2: 0 },
            { planet: "Saturn", pointsperc: 61, pointsperc2: 58 },
            { planet: "Uranus", pointsperc: 0, pointsperc2: 0 },
            { planet: "Neptune", pointsperc: 0, pointsperc2: 0 },
            { planet: "Pluto", pointsperc: 0, pointsperc2: 0 },
          ],
          person1: { dominantPlanet: { planet: "Moon" } },
          person2: { dominantPlanet: { planet: "Venus" } },
        },
      });
    }

    if (chemin.endsWith("/api/openai/astrologue/message")) {
      // Une reponse de Vela, dans la forme exacte que rend la route : les temps
      // titres, et le champ `visuel` qui porte ce qui a ete MESURE.
      //
      // La premiere phrase est la regle de pertinence : le moteur n a rien sur
      // le domaine demande, et Vela le DIT au lieu de repondre a cote. C est le
      // defaut le plus grave de cette fonction, corrige le 16/09, et un test
      // doit empecher qu il revienne.
      return json({
        ok: true,
        sessionId: "e2e-session",
        turn: 1,
        message: {
          role: "assistant",
          content:
            "Sur le travail precisement, rien de net ne ressort en ce moment. Ce qui bouge chez toi, c est ta facon de dire les choses.",
        },
        parties: {
          cePasse:
            "Sur le travail precisement, rien de net ne ressort en ce moment. Ce qui bouge chez toi, c est ta facon de dire les choses.",
          dOuCaVient: "Ca s ouvre, et ca demande d y mettre des mots.",
          ceQuiChange: "Ca dure encore quelques semaines, sans a-coup.",
        },
        visuel: { forme: "signaux", priorites: [4, 3, 3] },
        needsClarification: false,
        awaitingDetail: false,
      });
    }

    if (chemin.includes("/api/astrologue/")) {
      // La liste et la relecture d une conversation : aucune archive.
      return json({ ok: true, messages: [] });
    }

    if (chemin.endsWith("/api/positions")) {
      /**
       * Des positions VRAIES, mesurees le 17/09/2026 sur le moteur pour le
       * 15 juin 2019. Longitudes ecliptiques en degres.
       *
       * On ne met pas des angles ronds : 84,1186 et 288,9135 ont un ecart de
       * 155,2°, et c est cet ecart que la corde dessine. Des valeurs rondes
       * donneraient une figure trop reguliere, donc un test qui ne verrait pas
       * une figure fausse.
       */
      return json({
        success: true,
        date: "2019-06-15",
        positions: [
          { planete: "sun", longitude: 84.1186, retrograde: false },
          { planete: "saturn", longitude: 288.9135, retrograde: true },
        ],
      });
    }

    if (chemin.endsWith("/api/chapitres")) {
      /**
       * Les quatre mouvements, recopies du VRAI paquet du 17/09/2026 apres
       * allegement (thème du 27/09/1977, Bruxelles).
       *
       * Le quatrieme est conserve tel quel, avec son ecart voulu : il annonce
       * quinze ans de duree et une date de fin quinze MOIS plus tard, parce
       * que cette date est l horizon de calcul du moteur. C est exactement le
       * cas que `finALHorizon` doit attraper ; une fixture « propre » rendrait
       * le test incapable d echouer.
       */
      return json({
        success: true,
        periodes: [
          { level: 1, startDate: "1977-09-26T23:00:00.000Z", endDate: "2004-05-07T22:00:00.000Z",
            duration: 27, durationUnit: "years", housePlacement: { house: 7 } },
          { level: 1, startDate: "2004-05-07T22:00:00.000Z", endDate: "2033-12-01T23:00:00.000Z",
            duration: 30, durationUnit: "years", housePlacement: { house: 8 } },
          { level: 1, startDate: "2033-12-01T23:00:00.000Z", endDate: "2045-09-29T22:00:00.000Z",
            duration: 12, durationUnit: "years", housePlacement: { house: 9 } },
          { level: 1, startDate: "2045-09-29T22:00:00.000Z", endDate: "2046-12-31T22:59:59.000Z",
            duration: 15, durationUnit: "years", housePlacement: { house: 10 } },
        ],
      });
    }

    if (chemin.endsWith("/api/openai/daily-brief")) {
      // L ANCIEN briefing, servi valide.
      //
      // L app ne l appelle plus depuis le 17/09 : une seule communication par
      // jour, dessinee a partir des periodes locales. Mais la fixture doit le
      // servir quand meme, sinon le test « une seule communication » ne peut
      // pas echouer — on peut rebrancher l ancienne route sans qu aucun test ne
      // bronche, puisque rien ne lui repond. Un test qui ne peut pas echouer ne
      // teste rien.
      return json({
        ok: true,
        greeting: "Short greeting.",
        summary: "An older briefing, kept only so the parcours can prove a second message would show.",
        action: "Nothing to do.",
        activeDomains: ["work"],
      });
    }

    if (chemin.includes("/api/openai/")) {
      // Aucun briefing. Les tests du centre de messages posent eux-memes les
      // messages qu ils veulent : un briefing venu du reseau rendrait le
      // nombre de non-lus dependant d un modele de langage.
      return json({ ok: false, echec: true });
    }

    if (chemin.endsWith("/api/push/cadence")) {
      journal.cadence.push({
        cadence: String(corps.cadence ?? ""),
        deviceId: String(corps.deviceId ?? ""),
      });
      return route.fulfill({ status: 204, body: "" });
    }

    if (chemin.endsWith("/api/events")) {
      // La mesure. Elle est en « on envoie et on oublie », donc elle est
      // souvent la SEULE trace observable d un geste dont l issue depend du
      // systeme — voir le test d activation des notifications.
      if (typeof corps.event === "string") journal.evenements.push(corps.event);
      return route.fulfill({ status: 204, body: "" });
    }

    // Tout le reste — profil, invitations, connexions — repond « oui »
    // sans rien faire. Ces routes n ont aucun effet sur ce qu on teste, mais
    // les laisser passer ferait ecrire dans la vraie base depuis un test.
    return json({ ok: true });
  });

  // L app qui se croit native appelle le moteur EN DIRECT, sans passer par le
  // proxy Next. Voir callProxy() dans lib/momentum-api.ts.
  await page.route(/ai\.zebrapad\.io/, async (route) => {
    const chemin = new URL(route.request().url()).pathname;
    const endpoint = chemin.split("/").pop()?.replace(/\.php$/, "") ?? "toctoc-year";
    const corps = lireCorps(route);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(servirMoteur(endpoint, corps)),
    });
  });

  return journal;
}

export interface Graines {
  /** Les donnees de naissance. `null` pour rester devant l onboarding. */
  naissance?: Naissance | null;
  /** Le mode de vue au demarrage. Defaut : la timeline. */
  vue?: "overview" | "list";
  /** Les messages deja recus. */
  messages?: { id: string; type: string; corps: string; lu: boolean }[];
  /** Rejouer l accueil et le guide de premiere utilisation. Defaut : non. */
  premiereFois?: boolean;
  /** Les connexions posees dans l appareil. Defaut : aucune. */
  connexions?: {
    id: string; name: string; initial: string; relationship: string;
    birthData: Naissance; connectedSince: string; inviteCode: string;
  }[];
  /**
   * Rejouer la devinette d ouverture du rapport de compatibilite. Defaut :
   * non — elle ne se joue qu une fois par lien, et un test qui la subit
   * mesurerait l ecran de la devinette au lieu du rapport.
   */
  rejouerDevinette?: boolean;
}

/**
 * Pose l etat de depart AVANT que React ne monte.
 *
 * `addInitScript` rejoue a chaque navigation, y compris apres un rechargement.
 * Sans le temoin, un test qui modifie ses donnees de naissance puis recharge
 * verrait les anciennes revenir — et le test passerait en verifiant le
 * contraire de ce qu il croit verifier.
 */
export async function semer(page: Page, graines: Graines = {}): Promise<void> {
  const naissance = graines.naissance === undefined ? NAISSANCE : graines.naissance;

  await page.addInitScript((g) => {
    try {
      if (localStorage.getItem("e2e_graines_posees") === "1") return;
      localStorage.setItem("e2e_graines_posees", "1");

      // La langue est FIGEE. Sans elle, detectLocale() suit navigator.languages
      // et la suite entiere change de libelles selon la machine qui la lance.
      localStorage.setItem("unfold_locale", "en");

      if (g.naissance) localStorage.setItem("unfold_birth_data", JSON.stringify(g.naissance));
      localStorage.setItem("unfold_view_mode", g.vue);

      if (!g.premiereFois) {
        localStorage.setItem("unfold_timeline_welcomed", "true");
        localStorage.setItem("unfold_first_use_done", "1");
      }

      // « On a deja propose les notifications » : sinon la feuille de
      // proposition s ouvre par-dessus la timeline des que l app se croit
      // native, et recouvre ce que les tests vont cliquer.
      localStorage.setItem("favorable_push_propose_le", new Date().toISOString());

      if (g.connexions.length > 0) {
        localStorage.setItem("unfold_connections", JSON.stringify(g.connexions));
      }

      // Les liens dont la devinette est deja jouee. La clef suit celle de
      // components/demo/compat/RapportMatch.tsx : date et heure de naissance.
      if (!g.rejouerDevinette && g.connexions.length > 0) {
        localStorage.setItem(
          "unfold_match_devine",
          JSON.stringify(g.connexions.map((c) => `${c.birthData.birthDate}|${c.birthData.birthTime}`)),
        );
      }

      if (g.messages.length > 0) {
        const maintenant = new Date().toISOString();
        localStorage.setItem(
          "favorable_messages",
          JSON.stringify(g.messages.map((m) => ({ ...m, date: maintenant }))),
        );
      }
    } catch {
      /* stockage refuse : le test echouera plus loin, et plus clairement */
    }
  }, {
    naissance,
    vue: graines.vue ?? "overview",
    messages: graines.messages ?? [],
    premiereFois: graines.premiereFois ?? false,
    connexions: graines.connexions ?? [],
    rejouerDevinette: graines.rejouerDevinette ?? false,
  });
}

/**
 * Fait croire a l app qu elle tourne dans la coque Capacitor.
 *
 * Sans cela, lib/push.ts rend « indisponible » et TOUT le bloc notifications
 * du profil disparait du DOM : il n y a rien a tester sur le web. Voir
 * etatPermission() — la ligne existe pour ne pas afficher des reglages qui
 * n ont aucun sens dans un navigateur.
 *
 * A appeler AVANT la premiere navigation.
 */
export async function fairePasserPourNative(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Poser `window.Capacitor` ne suffit pas : @capacitor/core s installe au
    // chargement du paquet et ECRASE l objet, avec un isNativePlatform() qui
    // rend faux sur le web. On intercepte donc l affectation et on force les
    // deux seules methodes que lib/platform.ts consulte, quel que soit ce que
    // le vrai greffon ecrit ensuite.
    let reel: Record<string, unknown> = {};
    Object.defineProperty(window, "Capacitor", {
      configurable: true,
      get() {
        return new Proxy(reel, {
          get(cible, prop) {
            if (prop === "isNativePlatform") return () => true;
            if (prop === "getPlatform") return () => "ios";
            return Reflect.get(cible, prop);
          },
        });
      },
      set(valeur: Record<string, unknown>) {
        reel = valeur ?? {};
      },
    });
  });
}

/**
 * `?desktop=1` : l app se dessine en plein ecran au lieu du cadre de telephone.
 *
 * Voir app/app/layout.tsx. Sans ce parametre, le cadre fait 375x812 A
 * L INTERIEUR d une fenetre de 375x812 avec 16 points de marge : il deborde,
 * la page prend des barres de defilement, et la moitie des controles flottants
 * se retrouvent hors de la fenetre. Ce n est pas un contournement de test —
 * c est exactement le rendu de l app sur le telephone.
 */
function adresse(chemin: string): string {
  return `${chemin}${chemin.includes("?") ? "&" : "?"}desktop=1`;
}

export async function aller(page: Page, chemin: string): Promise<void> {
  await page.goto(adresse(chemin));
}

/**
 * Arrive sur la timeline et attend de VRAIES capsules.
 *
 * Le point de ce helper est la derniere ligne : on n attend pas « la page a
 * repondu », on attend qu une capsule cliquable existe. C est la difference
 * exacte entre les douze controles statiques et ce que Christophe testait — un
 * ecran de chargement compile, passe le typage, et ne montre rien.
 */
export async function ouvrirTimeline(page: Page): Promise<void> {
  await aller(page, "/app/timeline");
  await expect(page.getByRole("button", { name: "Timeline view" })).toBeVisible({ timeout: 30_000 });
  // Les capsules de la vue graphique sont des boutons sans texte : leur seul
  // repere stable est l attribut data-guide, que le guide de premiere
  // utilisation mesure deja. C est un contrat du produit, pas une classe CSS.
  await expect(page.locator('[data-guide="capsule"]').first()).toBeVisible({ timeout: 30_000 });
}

/** Ouvre le tiroir de profil depuis la barre d onglets. */
export async function ouvrirProfil(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Profile" }).click();
  await expect(page.getByRole("button", { name: /Birth data/ })).toBeVisible();
}

/**
 * L age affiche par le curseur de lecture.
 *
 * Meme exception que ci-dessus : cet element est repere par data-guide parce
 * que le guide le mesure. Il ne porte ni role ni texte accessible propre.
 */
export async function ageAffiche(page: Page): Promise<number> {
  const texte = await page.locator('[data-guide="curseur-age"]').innerText();
  return Number(texte.trim());
}
