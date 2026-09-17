/**
 * "Parle avec un astrologue" contre le VRAI moteur et le VRAI modele.
 *
 * Meme raison d etre que moteur-reel.spec.ts, hors de la suite rapide : deux
 * services tiers reels (le moteur de Marie-Ange, OpenAI), un theme qui peut
 * mettre jusqu a 60 s a repondre (`maxDuration` de la route), et une base
 * Supabase qui doit deja porter la migration `supabase/016_astrologue.sql`.
 * Un echec ici veut dire "l un des deux services a change de forme, ou la
 * migration n est pas encore appliquee" — pas "le code est casse".
 *
 *     npm run test:e2e:moteur
 *
 * A lancer avant une mise en production, et a chaque fois que le prompt de
 * l Appel A ou de l Appel B change.
 */

import { test, expect } from "@playwright/test";
import { NAISSANCE } from "./aide/moteur";

const DEVICE_ID = "e2e-astrologue-reel-000001";

// Meme oracle que lib/garde-jargon.ts : le texte affiche ne doit JAMAIS
// contenir de numero de maison, de nom d aspect, ou le mot "natal" — c est la
// regle produit la plus stricte de toute la fonction (brief §4), et la seule
// que ce test peut verifier depuis l exterieur, sans lire le code du prompt.
const MOTIFS_JARGON = [
  /\b\d{1,2}\s*(?:e|è|ème|eme|er|re|ère|ere)?\s*[-–]?\s*(?:\d{1,2}\s*(?:e|è|ème|eme)?\s*)?maisons?\b/i,
  /\bmaisons?\s+(?:n°\s*)?\d{1,2}\b/i,
  /\b(?:carr[ée]e?s?|oppositions?|conjonctions?|trigones?|sextiles?|quinconces?)\b/i,
  /\bnatal(?:e|es|aux)?\b/i,
];

function assertSansJargon(texte: string) {
  for (const motif of MOTIFS_JARGON) {
    expect(texte, `jargon detecte (${motif}) dans: "${texte}"`).not.toMatch(motif);
  }
}

test("une conversation complete : vague, precisee, puis un sujet muet", async ({ request }) => {
  // ── Tour 1 : message vague, calibre sur le dialogue du brief (§1) ──
  const tour1 = await request.post("/api/openai/astrologue/message", {
    data: {
      deviceId: DEVICE_ID,
      birthData: NAISSANCE,
      locale: "fr",
      message: "Je n'arrive plus à décider si je reste dans ce boulot. Ça fait trois mois que ça tourne en rond.",
    },
    timeout: 30_000,
  });
  expect(tour1.status(), await tour1.text()).toBe(200);
  const corps1 = await tour1.json() as {
    ok: boolean; sessionId: string; needsClarification: boolean;
    message: { role: string; content: string };
  };
  expect(corps1.ok).toBe(true);
  expect(corps1.needsClarification).toBe(true);
  expect(corps1.message.content.trim().length).toBeGreaterThan(0);
  assertSansJargon(corps1.message.content);

  const sessionId = corps1.sessionId;
  expect(sessionId).toBeTruthy();

  // ── Tour 2 : la personne precise une periode et un domaine — l Appel A
  //    devrait cette fois se dire pret et laisser passer jusqu au moteur. ──
  const tour2 = await request.post("/api/openai/astrologue/message", {
    data: {
      deviceId: DEVICE_ID,
      sessionId,
      birthData: NAISSANCE,
      locale: "fr",
      message: "Depuis juin en fait. C'est plus ce que je vaux, j'ai l'impression qu'on ne me voit pas au travail.",
    },
    timeout: 60_000,
  });
  expect(tour2.status(), await tour2.text()).toBe(200);
  const corps2 = await tour2.json() as {
    ok: boolean; needsClarification: boolean; message: { content: string };
  };
  expect(corps2.ok).toBe(true);
  // On n exige pas needsClarification:false ici — l Appel A peut legitimement
  // redemander une precision. Ce qu on exige, c est que la reponse existe et
  // respecte la regle de jargon dans TOUS les cas.
  expect(corps2.message.content.trim().length).toBeGreaterThan(0);
  assertSansJargon(corps2.message.content);

  // ── Tour 3, nouvelle session : un sujet sur lequel rien ne devrait
  //    converger — verifie que le silence est un texte, jamais une erreur. ──
  const sessionMuette = await request.post("/api/astrologue/session", {
    data: { deviceId: `${DEVICE_ID}-silence`, birthData: NAISSANCE, locale: "fr" },
  });
  expect(sessionMuette.status(), await sessionMuette.text()).toBe(200);
  const { sessionId: sessionIdMuette } = await sessionMuette.json() as { sessionId: string };

  const tourMuet = await request.post("/api/openai/astrologue/message", {
    data: {
      deviceId: `${DEVICE_ID}-silence`,
      sessionId: sessionIdMuette,
      birthData: NAISSANCE,
      locale: "fr",
      message: "Est-ce qu'il se passe quelque chose côté maison en ce moment, genre depuis mardi dernier ?",
    },
    timeout: 60_000,
  });
  expect(tourMuet.status(), await tourMuet.text()).toBe(200);
  const corpsMuet = await tourMuet.json() as { ok: boolean; message: { content: string } };
  expect(corpsMuet.ok).toBe(true);
  assertSansJargon(corpsMuet.message.content);
});

test("une question travail au present parcourt le domaine, pas le signal le plus fort", async ({ request }) => {
  const res = await request.post("/api/openai/astrologue/message", {
    data: {
      deviceId: `${DEVICE_ID}-travail`,
      birthData: NAISSANCE,
      locale: "fr",
      message: "J'ai envie de changer de travail, quand penses-tu que ça va bouger ?",
    },
    timeout: 90_000,
  });
  expect(res.status(), await res.text()).toBe(200);
  const corps = await res.json() as {
    ok: boolean;
    message: { content: string };
    visuel?: { forme: string; maison?: number; force?: number };
  };
  expect(corps.ok).toBe(true);
  expect(corps.message.content.trim().length).toBeGreaterThan(0);
  assertSansJargon(corps.message.content);
  // La faute du 17/09 : repondre « rien de net sur le travail » alors que
  // le dossier du domaine avait des faits. Si un visuel fenetre maison 10
  // est la, cette phrase est interdite.
  if (corps.visuel?.forme === "fenetre" && corps.visuel.maison === 10) {
    expect(corps.message.content).not.toMatch(/rien de net/i);
  }
});

test("une question hors périmètre décline sans appeler le moteur", async ({ request }) => {
  const session = await request.post("/api/astrologue/session", {
    data: { deviceId: `${DEVICE_ID}-numero`, birthData: NAISSANCE, locale: "fr" },
  });
  expect(session.status(), await session.text()).toBe(200);
  const { sessionId } = await session.json() as { sessionId: string };

  const res = await request.post("/api/openai/astrologue/message", {
    data: {
      deviceId: `${DEVICE_ID}-numero`,
      sessionId,
      birthData: NAISSANCE,
      locale: "fr",
      message: "Est-ce que tu peux me faire mon chemin de vie en numérologie ?",
    },
    timeout: 15_000,
  });
  expect(res.status(), await res.text()).toBe(200);
  const corps = await res.json() as { ok: boolean; message: { content: string } };
  expect(corps.ok).toBe(true);
  // Ni "numerologie" ne doit rester sans reponse, ni la reponse ne doit
  // pretendre repondre a la question — on ne verifie pas le mot exact (i18n),
  // seulement que la reponse existe et reste courte (declin, pas une lecture).
  expect(corps.message.content.trim().length).toBeGreaterThan(0);
  expect(corps.message.content.trim().split(/\s+/).length).toBeLessThan(60);
});
