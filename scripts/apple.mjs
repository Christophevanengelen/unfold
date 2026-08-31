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

const SERVICE = "Favorable - cle App Store Connect (envoi TestFlight)";
const KEY_ID = "NXU52UQRN8";
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
const issuer = process.env.APPLE_ISSUER_ID ?? reste.find((a) => a.includes("-"));

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
  } else {
    console.log("Commandes : certificats | profils | identifiants | revoquer <id>");
  }
} catch (e) {
  console.error(`\n${e.message}\n`);
  process.exit(1);
}
