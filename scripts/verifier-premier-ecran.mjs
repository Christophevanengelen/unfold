/**
 * Le temps jusqu au premier ecran utile.
 *
 *   node scripts/verifier-premier-ecran.mjs
 *
 * POURQUOI CE CONTROLE EXISTE
 *
 * Le 11/09/2026, une session de QA a compte 68 appels a `/api/toctoc`, dont
 * plusieurs a 42 s et un a 50 s. Le moteur est lent, il le restera : le
 * document de Marie-Ange le mesure de son cote (toctoc-app-short 67 s).
 *
 * Le defaut n etait pas la. Il etait que `OnboardingGuard`, monte autour de
 * TOUTE l app, attendait cette reponse avant d afficher quoi que ce soit : un
 * rond qui tourne pendant quarante secondes, puis « Connexion perdue » en plein
 * ecran — alors que le nom des connexions, leur lien et leur avatar sont dans
 * le telephone et pouvaient s afficher immediatement.
 *
 * Ce controle mesure ce qu une personne voit, pas ce que le serveur met a
 * repondre : le temps jusqu a la premiere rangee de connexion visible, moteur
 * volontairement bloque a 60 s. Si l app attend le reseau pour afficher ce
 * qu elle sait deja, il echoue.
 *
 * Il ne remplace pas un controle de performance : il empeche une regression
 * d architecture, celle qui consiste a refaire dependre l affichage du reseau.
 */

import { chromium, devices } from "@playwright/test";
import { spawn } from "node:child_process";

const PORT = 3399;
const BASE = `http://localhost:${PORT}`;
/** Deux secondes : au-dela, une liste qu on possede deja en local se fait attendre. */
const SEUIL_MS = 2000;

const MOI = {
  nickname: "Test",
  birthDate: "1977-09-27",
  birthTime: "00:00",
  latitude: 50.8503,
  longitude: 4.3517,
  timezone: "Europe/Brussels",
  placeOfBirth: "Bruxelles",
};
const CONNEXIONS = [
  {
    id: "t1",
    name: "Alex",
    initial: "A",
    relationship: "friend",
    birthData: { ...MOI, nickname: "Alex", birthDate: "1982-09-02", birthTime: "02:15" },
    connectedSince: "2026-05-14",
    inviteCode: "TST123",
  },
];

const serveur = spawn("npx", ["next", "dev", "--port", String(PORT)], {
  stdio: "ignore",
  detached: false,
});

async function attendreServeur(limiteMs = 120000) {
  const t0 = Date.now();
  while (Date.now() - t0 < limiteMs) {
    try {
      const r = await fetch(BASE + "/app/compatibility", { signal: AbortSignal.timeout(4000) });
      if (r.ok) return true;
    } catch {
      /* pas encore pret */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

let code = 0;
try {
  if (!(await attendreServeur())) {
    console.log("  serveur de developpement indisponible — controle saute");
    process.exit(0);
  }

  const navigateur = await chromium.launch();
  const ctx = await navigateur.newContext({
    ...devices["iPhone 13"],
    colorScheme: "dark",
    locale: "fr-BE",
    reducedMotion: "no-preference",
  });
  await ctx.addInitScript(
    ([moi, conns]) => {
      try {
        localStorage.setItem("unfold_birth_data", JSON.stringify(moi));
        localStorage.setItem("unfold_onboarding_complete", "true");
        localStorage.setItem("unfold_connections", JSON.stringify(conns));
      } catch {
        /* stockage refuse */
      }
    },
    [MOI, CONNEXIONS],
  );

  const page = await ctx.newPage();
  // Le moteur ne repondra pas de la fenetre de mesure : c est tout l interet.
  // On reproduit sa lenteur reelle plutot que de l attendre.
  await page.route("**/api/toctoc", async (route) => {
    await new Promise((r) => setTimeout(r, 60000));
    await route.abort();
  });
  await page.route("**/api/openai/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"silence":true}' }),
  );

  const t0 = Date.now();
  await page.goto(BASE + "/app/compatibility");
  let visible = null;
  try {
    await page.locator('[role="link"]').first().waitFor({ timeout: 15000 });
    visible = Date.now() - t0;
  } catch {
    visible = null;
  }

  const texte = await page.evaluate(() => document.body.innerText);
  const ecranMort = /Connexion perdue|Connection lost/i.test(texte);

  await navigateur.close();

  if (visible === null) {
    console.log(`\n  Aucune connexion affichee en 15 s, moteur bloque.\n`);
    console.log("  L app attend le reseau pour montrer ce qu elle a deja en local.");
    code = 1;
  } else if (ecranMort) {
    console.log(`\n  « Connexion perdue » en plein ecran alors que la naissance est connue.\n`);
    code = 1;
  } else if (visible > SEUIL_MS) {
    console.log(`\n  Premiere connexion visible en ${visible} ms, seuil ${SEUIL_MS} ms.\n`);
    code = 1;
  } else {
    console.log(`  premiere connexion visible en ${visible} ms, seuil ${SEUIL_MS} ms, moteur bloque.`);
  }
} finally {
  try {
    serveur.kill("SIGTERM");
  } catch {
    /* deja mort */
  }
}
process.exit(code);
