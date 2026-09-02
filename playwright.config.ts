import { defineConfig } from "@playwright/test";

/**
 * Trois suites, trois usages.
 *
 *   parcours       npm run test:e2e          Les parcours critiques, moteur
 *                                            simule, serveur local. C est la
 *                                            suite qu on lance a chaque
 *                                            changement : elle doit rester
 *                                            verte et sous les cinq minutes.
 *
 *   moteur         npm run test:e2e:moteur   Le VRAI moteur d astrologie. Un
 *                                            seul test, lent (30 a 120 s au
 *                                            premier appel) et dependant d un
 *                                            service tiers. Hors de la suite
 *                                            rapide exactement pour cela : un
 *                                            test qui echoue une fois sur trois
 *                                            fait desactiver tous les autres.
 *
 *   monetisation   npx playwright test --project=monetisation
 *                                            L entonnoir gratuit vers payant.
 *                                            Exige quatre variables
 *                                            d environnement (voir
 *                                            e2e/free-to-paid.spec.ts) et vise
 *                                            la preversion en ligne.
 *
 * Les projets portent un `testMatch` : sans lui, Playwright CHARGE tous les
 * fichiers de e2e/ pour n importe quelle execution, et free-to-paid.spec.ts
 * leve des son import quand ses variables manquent. La suite rapide entiere
 * echouait alors avant d avoir lance un seul test.
 */

/** Le telephone de reference : iPhone a 375 points de large. */
const TELEPHONE = {
  browserName: "chromium" as const,
  viewport: { width: 375, height: 812 },
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  // La suite entiere ecrit ses selecteurs en anglais. Sans cette ligne, les
  // libelles suivraient la langue de la machine qui lance les tests.
  locale: "en-GB",
  timezoneId: "Europe/Brussels",
};

// ── Un port PAR COPIE DE TRAVAIL ──────────────────────────────────────────
//
// Les parcours tournaient sur le port fixe 3333 avec `reuseExistingServer` :
// le premier serveur trouve gagnait, quel que soit le code qu il servait. Le
// 02/09/2026, 23 parcours ont annonce « passed » contre le serveur d une AUTRE
// copie de travail — du code jamais charge. Un test qui ment vaut moins que
// pas de test.
//
// Le port derive du chemin de cette copie : deux clones ne partagent jamais
// un serveur, et reutiliser celui de CE clone redevient sans danger.
// `npm run dev` garde 3333 pour les humains.
import { createHash } from "node:crypto";
const PORT_PARCOURS = 4100 + (parseInt(createHash("sha1").update(process.cwd()).digest("hex").slice(0, 6), 16) % 800);
//
// Next n autorise qu UNE instance `next dev` par dossier (.next/dev/lock). Si
// `npm run dev` tourne deja dans ce clone, le serveur des parcours ne peut pas
// demarrer et Playwright le dit en clair (« is another instance of next dev
// running? ») : arreter le serveur de travail, puis relancer. C est voulu. Un
// premier repli basculait sur 3333 des que le fichier de verrou existait — or
// Next le laisse derriere lui a l arret : un verrou PERIME renvoyait les tests
// sur le port partage, et rouvrait la porte au serveur d un autre clone.
const SERVEUR_LOCAL = `http://localhost:${PORT_PARCOURS}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  // Zero reprise, volontairement. Une reprise cache l instabilite au lieu de la
  // montrer, et un test instable qu on ne voit pas est un test qu on finira par
  // supprimer sans savoir ce qu il protegeait.
  retries: 0,
  // Les traces, captures et rapports vivent SOUS e2e/, dans deux dossiers
  // caches ignores par git (e2e/.gitignore). A la racine, ils laissaient un
  // `test-results/` non suivi apres chaque execution — de quoi polluer chaque
  // `git status` et finir dans un commit par accident.
  outputDir: "e2e/.resultats",
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e/.rapport" }]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "parcours",
      testMatch: /parcours-.*\.spec\.ts$/,
      use: { ...TELEPHONE, baseURL: SERVEUR_LOCAL },
    },
    {
      name: "moteur",
      testMatch: /moteur-reel\.spec\.ts$/,
      // Le moteur met 30 a 120 secondes a repondre pour un theme qu il n a
      // jamais vu. Un delai plus court ferait echouer un test parfaitement
      // correct, ce qui est la meilleure facon de faire desactiver une suite.
      timeout: 300_000,
      use: { ...TELEPHONE, baseURL: SERVEUR_LOCAL },
    },
    {
      name: "monetisation",
      testMatch: /free-to-paid\.spec\.ts$/,
      use: {
        ...TELEPHONE,
        viewport: { width: 390, height: 844 },
        baseURL: process.env.E2E_BASE_URL ?? "https://unfold-nine.vercel.app",
      },
    },
  ],
  // Le serveur des parcours est demarre s il ne tourne pas deja SUR CE PORT —
  // qui n appartient qu a cette copie de travail (voir PORT_PARCOURS).
  webServer: {
    command: `npx next dev --port ${PORT_PARCOURS}`,
    url: SERVEUR_LOCAL,
    reuseExistingServer: true,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
