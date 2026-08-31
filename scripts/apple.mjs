/**
 * Parler a App Store Connect depuis le terminal.
 *
 * Pourquoi cet outil existe : le portail Apple est un site web, et chaque
 * geste qu il reclame est une interruption. Onze certificats crees par erreur
 * ont demande onze revocations a la main. Avec l API, ce sont onze lignes.
 *
 * La clef est lue dans le TROUSSEAU, jamais dans un fichier : les .p8 d Apple
 * ne se retelechargent pas, et laisser une clef irremplacable dans un dossier
 * de telechargements est une mauvaise idee qui finit toujours par se voir.
 *
 * L Issuer ID se passe en variable d environnement (APPLE_ISSUER_ID) ou en
 * premier argument.
 *
 *   node scripts/apple.mjs certificats
 *   node scripts/apple.mjs profils
 *   node scripts/apple.mjs identifiants
 *   node scripts/apple.mjs revoquer <id>
 */

import { createSign, createPrivateKey } from "node:crypto";
import { execFileSync } from "node:child_process";

// Clef dediee au suivi, role App Manager : elle lit les builds et les
// certificats, mais ne touche ni aux finances ni aux utilisateurs. La clef
// d envoi du CI, elle, est Admin et vit dans les secrets GitHub — on ne s en
// sert pas ici.
const SERVICE = process.env.APPLE_KEY_SERVICE ?? "Favorable - cle API App Store Connect (suivi)";
const KEY_ID = process.env.APPLE_KEY_ID ?? "CQ2G2DGBXM";
const ISSUER_DEFAUT = "e5b862d8-37cd-432e-93db-564a94fb08c2";
/** Favorable. Apple exige un filtre d application pour trier par version. */
const APP = process.env.APPLE_APP_ID ?? "6807001088";
const BASE = "https://api.appstoreconnect.apple.com/v1";

function clefDepuisTrousseau() {
  try {
    const b64 = execFileSync("security",
      ["find-generic-password", "-s", SERVICE, "-w"], { encoding: "utf8" }).trim();
    return Buffer.from(b64, "base64").toString("utf8");
  } catch {
    throw new Error(
      `Clef introuvable dans le trousseau ("${SERVICE}"). ` +
      `Elle y a ete rangee le 31/08/2026 ; si elle n y est plus, il faut la recreer chez Apple.`,
    );
  }
}

function jeton(issuer) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const maintenant = Math.floor(Date.now() / 1000);
  const entete = b64({ alg: "ES256", kid: KEY_ID, typ: "JWT" });
  // Apple refuse tout jeton valable plus de vingt minutes.
  const charge = b64({
    iss: issuer,
    iat: maintenant,
    exp: maintenant + 15 * 60,
    aud: "appstoreconnect-v1",
  });
  const s = createSign("SHA256");
  s.update(`${entete}.${charge}`);
  // Format brut r||s, pas le DER d OpenSSL : Apple repond sinon
  // « Authentication credentials are missing or invalid », sans plus de detail.
  const signature = s.sign({
    key: createPrivateKey(clefDepuisTrousseau()),
    dsaEncoding: "ieee-p1363",
  });
  return `${entete}.${charge}.${signature.toString("base64url")}`;
}

async function appel(issuer, chemin, options = {}) {
  const reponse = await fetch(`${BASE}${chemin}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${jeton(issuer)}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (reponse.status === 204) return null;
  const texte = await reponse.text();
  let corps;
  try { corps = JSON.parse(texte); } catch { corps = { brut: texte }; }
  if (!reponse.ok) {
    const detail = corps?.errors?.map((e) => `${e.title} — ${e.detail}`).join("\n  ") ?? texte;
    throw new Error(`HTTP ${reponse.status}\n  ${detail}`);
  }
  return corps;
}

const [commande, ...reste] = process.argv.slice(2);
const issuer = process.env.APPLE_ISSUER_ID ?? reste.find((a) => a.includes("-")) ?? ISSUER_DEFAUT;

if (!issuer) {
  console.error("Il manque l Issuer ID. APPLE_ISSUER_ID=... ou en argument.");
  console.error("App Store Connect > Users and Access > Integrations.");
  process.exit(1);
}

try {
  if (commande === "certificats") {
    const r = await appel(issuer, "/certificates?limit=200");
    console.log(`\n${r.data.length} certificat(s) :\n`);
    for (const c of r.data) {
      const a = c.attributes;
      console.log(`  ${a.certificateType.padEnd(24)} ${(a.name ?? "").slice(0, 34).padEnd(36)} expire ${a.expirationDate?.slice(0, 10)}  ${c.id}`);
    }
    const parType = {};
    for (const c of r.data) parType[c.attributes.certificateType] = (parType[c.attributes.certificateType] ?? 0) + 1;
    console.log("\n  par type :", JSON.stringify(parType));
  } else if (commande === "profils") {
    const r = await appel(issuer, "/profiles?limit=200");
    console.log(`\n${r.data.length} profil(s) :\n`);
    for (const p of r.data) {
      const a = p.attributes;
      console.log(`  ${a.profileType.padEnd(28)} ${a.name.slice(0, 38).padEnd(40)} ${a.profileState}  ${p.id}`);
    }
  } else if (commande === "identifiants") {
    const r = await appel(issuer, "/bundleIds?limit=200");
    console.log(`\n${r.data.length} identifiant(s) :\n`);
    for (const b of r.data) {
      console.log(`  ${b.attributes.identifier.padEnd(40)} ${b.attributes.name ?? ""}  ${b.id}`);
    }
  } else if (commande === "revoquer") {
    const id = reste.find((a) => !a.includes("-") || a.length < 30) ?? reste[0];
    await appel(issuer, `/certificates/${id}`, { method: "DELETE" });
    console.log(`  certificat ${id} revoque`);
  } else if (commande === "revue") {
    // L etat qui compte est externalBuildState, porte par buildBetaDetails :
    // il dit ou en est la revue beta. La relation betaAppReviewSubmission, elle,
    // ne remonte pas dans une liste de builds.
    const r = await appel(issuer,
      `/builds?limit=8&sort=-version&filter[app]=${APP}` +
      "&include=buildBetaDetail" +
      "&fields[builds]=version,processingState,buildBetaDetail" +
      "&fields[buildBetaDetails]=externalBuildState,internalBuildState");
    const details = Object.fromEntries(
      (r.included ?? [])
        .filter((i) => i.type === "buildBetaDetails")
        .map((i) => [i.id, i.attributes]),
    );
    const lisible = {
      PROCESSING: "en traitement",
      READY_FOR_BETA_TESTING: "TESTABLE",
      IN_BETA_TESTING: "EN TEST",
      WAITING_FOR_BETA_REVIEW: "en attente de revue",
      IN_BETA_REVIEW: "EN COURS DE REVUE",
      BETA_REJECTED: "REFUSEE",
      EXPIRED: "expiree",
      READY_FOR_BETA_SUBMISSION: "pas soumise",
      PROCESSING_EXCEPTION: "erreur de traitement",
    };
    console.log("\n  build   interne              externe");
    for (const b of r.data) {
      const lien = b.relationships?.buildBetaDetail?.data;
      const d = lien ? details[lien.id] : null;
      const int = lisible[d?.internalBuildState] ?? d?.internalBuildState ?? "?";
      const ext = lisible[d?.externalBuildState] ?? d?.externalBuildState ?? "?";
      console.log(`  ${String(b.attributes.version).padStart(5)}   ${int.padEnd(20)} ${ext}`);
    }
    console.log("");
  } else {
    console.log("Commandes : revue | certificats | profils | identifiants | revoquer <id>");
  }
} catch (e) {
  console.error(`\n${e.message}\n`);
  process.exit(1);
}
