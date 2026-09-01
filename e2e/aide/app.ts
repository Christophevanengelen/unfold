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
export async function brancherReseau(page: Page): Promise<Journal> {
  const journal: Journal = { moteur: [], cadence: [], evenements: [] };

  const servirMoteur = (endpoint: string, corps: Record<string, unknown>) => {
    const naissance = {
      birthDate: String(corps.birthDate ?? ""),
      birthTime: String(corps.birthTime ?? ""),
      latitude: Number(corps.latitude ?? 0),
    };
    journal.moteur.push({ endpoint, ...naissance });
    return endpoint === "toctoc-year" ? reponseAnnee(naissance) : reponseVie(naissance);
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
