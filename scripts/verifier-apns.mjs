/**
 * Verifie lib/apns.ts sans appeler Apple.
 *
 * Pourquoi ce fichier existe : deux details d APNs se trompent silencieusement
 * et ne se voient qu en production, sur un vrai telephone, un jour ou l autre.
 *
 *   1. La signature ES256 doit etre au format brut r||s. OpenSSL produit du DER
 *      par defaut. Les deux signent sans erreur ; seule Apple fait la
 *      difference, en repondant InvalidProviderToken.
 *   2. Le 410 d Apple veut dire « cette personne a desinstalle l app ». Le
 *      manquer, c est continuer a pousser dans le vide pour toujours.
 *
 * On fabrique donc une clef P-256 pour l occasion et un faux APNs local, et on
 * confronte le vrai code aux vraies reponses.
 *
 *   node scripts/verifier-apns.mjs
 */

import http2 from "node:http2";
import { generateKeyPairSync, createSign, createVerify, createPrivateKey } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let echecs = 0;
const verifier = (nom, condition) => {
  if (!condition) echecs++;
  console.log(`${condition ? "  ok  " : "ECHEC "} ${nom}`);
};

const { privateKey, publicKey } = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

console.log("\nLa signature ES256");

// Les variables d environnement mangent les retours a la ligne : une clef collee
// dans Vercel arrive avec des \n litteraux. On reproduit cette maltraitance.
const commeDansVercel = privateKey.replace(/\n/g, "\\n");
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const entete = b64({ alg: "ES256", kid: "ABCD123XYZ" });
const charge = b64({ iss: "LD9N97K83G", iat: Math.floor(Date.now() / 1000) });

const signeur = createSign("SHA256");
signeur.update(`${entete}.${charge}`);
const signature = signeur.sign({
  key: createPrivateKey(commeDansVercel.replace(/\\n/g, "\n")),
  dsaEncoding: "ieee-p1363",
});

verifier("une clef aux retours a la ligne echappes se relit", signature.length > 0);
verifier("signature de 64 octets (brut r||s, ce qu Apple attend)", signature.length === 64);

const vExact = createVerify("SHA256");
vExact.update(`${entete}.${charge}`);
verifier("signature verifiable", vExact.verify({ key: publicKey, dsaEncoding: "ieee-p1363" }, signature));

// Si c etait du DER, cette lecture-ci reussirait. Elle doit echouer.
const vDer = createVerify("SHA256");
vDer.update(`${entete}.${charge}`);
let derRefuse = false;
try { derRefuse = !vDer.verify({ key: publicKey, dsaEncoding: "der" }, signature); } catch { derRefuse = true; }
verifier("illisible en DER, donc bien du brut", derRefuse);

console.log("\nLe dialogue avec APNs");

const dossier = mkdtempSync(join(tmpdir(), "apns-"));
const construit = join(dossier, "apns.mjs");
execFileSync(
  "npx",
  ["esbuild", "lib/apns.ts", "--bundle", "--platform=node", "--format=esm",
   `--outfile=${construit}`, "--external:node:*", "--log-level=error"],
  { stdio: "inherit" },
);

process.env.APNS_KEY_ID = "ABCD123XYZ";
process.env.APNS_TEAM_ID = "LD9N97K83G";
process.env.APNS_PRIVATE_KEY = commeDansVercel;
process.env.APNS_BUNDLE_ID = "day.favorable.app";

const { surUneConnexion } = await import(construit);

const recu = [];
const faussaire = http2.createServer();
faussaire.on("stream", (flux, entetes) => {
  let corps = "";
  flux.on("data", (c) => (corps += c));
  flux.on("end", () => {
    recu.push({ entetes, corps: JSON.parse(corps) });
    const chemin = entetes[":path"];
    if (chemin.endsWith("DESINSTALLE")) {
      flux.respond({ ":status": 410, "content-type": "application/json" });
      flux.end(JSON.stringify({ reason: "Unregistered" }));
    } else if (chemin.endsWith("XCODE")) {
      flux.respond({ ":status": 400, "content-type": "application/json" });
      flux.end(JSON.stringify({ reason: "BadDeviceToken" }));
    } else {
      flux.respond({ ":status": 200 });
      flux.end();
    }
  });
});

await new Promise((r) => faussaire.listen(0, "127.0.0.1", r));
const port = faussaire.address().port;

const resultats = await surUneConnexion(`http://127.0.0.1:${port}`, [
  { jeton: "VIVANT", titre: "Une periode s ouvre", corps: "Trois semaines qui comptent.",
    donnees: { ecran: "timeline" }, regroupement: "periode-2026-09" },
  { jeton: "DESINSTALLE", titre: "x", corps: "y", donnees: { ecran: "monthly" } },
  { jeton: "XCODE", titre: "x", corps: "y", donnees: { ecran: "timeline" } },
]);
const par = Object.fromEntries(resultats.map((r) => [r.jeton, r]));

verifier("un jeton vivant est accepte", par.VIVANT?.ok === true && par.VIVANT?.jetonMort === false);
verifier("410 Unregistered enterre le jeton", par.DESINSTALLE?.ok === false && par.DESINSTALLE?.jetonMort === true);
verifier("BadDeviceToken remonte, pour la bascule sandbox", par.XCODE?.raison === "BadDeviceToken");

const v = recu.find((x) => x.entetes[":path"].endsWith("VIVANT"));
verifier("chemin /3/device/<jeton>", v?.entetes[":path"] === "/3/device/VIVANT");
verifier("apns-topic vaut le bundle", v?.entetes["apns-topic"] === "day.favorable.app");
verifier("apns-push-type vaut alert", v?.entetes["apns-push-type"] === "alert");
verifier("autorisation bearer portant un JWT a trois segments",
  v?.entetes.authorization?.startsWith("bearer ") &&
  v.entetes.authorization.slice(7).split(".").length === 3);
verifier("apns-collapse-id pose, pour ne pas empiler deux fois le meme sujet",
  v?.entetes["apns-collapse-id"] === "periode-2026-09");
verifier("expiration a environ 24 h",
  Math.abs(Number(v?.entetes["apns-expiration"]) - (Date.now() / 1000 + 86400)) < 120);
verifier("titre et corps dans aps.alert",
  v?.corps.aps.alert.title === "Une periode s ouvre" &&
  v?.corps.aps.alert.body === "Trois semaines qui comptent.");
verifier("la clef d ecran voyage a cote de aps, jamais dedans",
  v?.corps.ecran === "timeline" && v?.corps.aps.ecran === undefined);
verifier("aucun chemin brut dans la charge utile",
  !JSON.stringify(v?.corps ?? {}).includes("/app/"));

faussaire.close();
rmSync(dossier, { recursive: true, force: true });

console.log(echecs === 0 ? "\nTout passe.\n" : `\n${echecs} echec(s).\n`);
process.exit(echecs === 0 ? 0 : 1);
