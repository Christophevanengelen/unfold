/**
 * Envoi vers Apple Push Notification service.
 *
 * Trois contraintes d Apple gouvernent ce fichier, et aucune n est evidente.
 *
 * 1. **APNs parle HTTP/2 uniquement.** Le `fetch` de Node ne fait que du
 *    HTTP/1.1 : il ne peut pas parler a Apple, quelle que soit la façon dont on
 *    l appelle. Il faut `node:http2`. C est la raison d etre du code de bas
 *    niveau ci-dessous, qui aurait sinon l air d une complication gratuite.
 *
 * 2. **Le jeton d autorisation se reutilise.** Apple refuse un jeton de plus
 *    d une heure, mais refuse AUSSI qu on en fabrique trop souvent
 *    (TooManyProviderTokenUpdates). On le garde donc en memoire et on ne le
 *    refait qu au bout de 50 minutes. Le fabriquer a chaque envoi ferait
 *    rejeter la campagne entiere.
 *
 * 3. **Une seule connexion pour tout un envoi.** HTTP/2 multiplexe : ouvrir une
 *    connexion par notification serait lent et Apple n aime pas. On ouvre, on
 *    envoie tout, on ferme.
 *
 * Ce que le module NE decide PAS : a qui envoyer, ni quand, ni quoi. Il prend
 * une liste et l execute. Le choix vit dans le planificateur.
 */

import http2 from "node:http2";
import { createSign, createPrivateKey } from "node:crypto";

const PROD = "https://api.push.apple.com";
const SANDBOX = "https://api.sandbox.push.apple.com";

/** Ce qu on demande a APNs pour un appareil. */
export type EnvoiAPNs = {
  jeton: string;
  titre: string;
  corps: string;
  /** Charge utile lue par lib/push-routes.ts. Une clef, jamais un chemin. */
  donnees: Record<string, string>;
  /**
   * Deux notifications de meme sujet ne doivent pas s empiler dans le centre de
   * notifications : la plus recente remplace la precedente.
   */
  regroupement?: string;
};

/** Ce qu APNs a repondu, par jeton. */
export type ResultatAPNs = {
  jeton: string;
  ok: boolean;
  /** Vrai quand Apple dit que ce jeton est mort : il faut l enterrer. */
  jetonMort: boolean;
  raison?: string;
};

/**
 * Apple refuse un jeton d autorisation vieux de plus d une heure, et refuse
 * qu on en fabrique trop souvent. On le garde 50 minutes.
 */
let jetonCache: { valeur: string; expire: number } | null = null;

function jetonAutorisation(): string {
  const maintenant = Date.now();
  if (jetonCache && jetonCache.expire > maintenant) return jetonCache.valeur;

  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const cle = process.env.APNS_PRIVATE_KEY;
  if (!keyId || !teamId || !cle) throw new Error("apns_non_configure");

  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o)).toString("base64url");

  const entete = b64({ alg: "ES256", kid: keyId });
  const charge = b64({ iss: teamId, iat: Math.floor(maintenant / 1000) });

  // Les variables d environnement mangent les retours a la ligne : une clef PEM
  // collee dans Vercel arrive souvent avec des \n litteraux. On les restaure,
  // sinon la lecture de la clef echoue avec un message incomprehensible.
  const pem = createPrivateKey(cle.replace(/\\n/g, "\n"));

  const signeur = createSign("SHA256");
  signeur.update(`${entete}.${charge}`);
  // ES256 attend une signature au format brut (r||s), pas le DER que produit
  // OpenSSL par defaut. Sans `dsaEncoding`, Apple repond InvalidProviderToken.
  const signature = signeur.sign({ key: pem, dsaEncoding: "ieee-p1363" });

  const valeur = `${entete}.${charge}.${signature.toString("base64url")}`;
  jetonCache = { valeur, expire: maintenant + 50 * 60_000 };
  return valeur;
}

/** Les refus qui veulent dire « ce jeton ne vaut plus rien, enterre-le ». */
const MORTS = new Set(["Unregistered", "BadDeviceToken", "DeviceTokenNotForTopic"]);

/**
 * Envoie une liste de notifications sur une seule connexion.
 *
 * `environnement` : les builds TestFlight et App Store sont signes en
 * distribution, donc production. Seul un build lance depuis Xcode est en
 * sandbox. On tente donc la production, et on retombe sur la sandbox quand
 * Apple repond BadDeviceToken — ce qui n arrive qu avec les appareils de
 * developpement, c est-a-dire les tiens.
 */
export async function envoyerLot(envois: EnvoiAPNs[]): Promise<ResultatAPNs[]> {
  if (envois.length === 0) return [];

  const resultats = await surUneConnexion(PROD, envois);

  const aRetenter = resultats.filter((r) => r.raison === "BadDeviceToken");
  if (aRetenter.length > 0) {
    const parJeton = new Map(envois.map((e) => [e.jeton, e]));
    const seconde = await surUneConnexion(
      SANDBOX,
      aRetenter.map((r) => parJeton.get(r.jeton)!).filter(Boolean),
    );
    const index = new Map(seconde.map((r) => [r.jeton, r]));
    return resultats.map((r) => index.get(r.jeton) ?? r);
  }

  return resultats;
}

/**
 * Un envoi sur une connexion donnee. Exporte pour pouvoir etre confronte a un
 * faux APNs local : c est le seul moyen de verifier la lecture des reponses
 * d Apple, notamment le 410 qui enterre un jeton, sans attendre qu un vrai
 * appareil desinstalle l app.
 */
export function surUneConnexion(hote: string, envois: EnvoiAPNs[]): Promise<ResultatAPNs[]> {
  return new Promise((resoudre) => {
    const sujet = process.env.APNS_BUNDLE_ID ?? "day.favorable.app";
    let autorisation: string;
    try {
      autorisation = jetonAutorisation();
    } catch (e) {
      return resoudre(
        envois.map((x) => ({
          jeton: x.jeton,
          ok: false,
          jetonMort: false,
          raison: e instanceof Error ? e.message : "erreur_jeton",
        })),
      );
    }

    const client = http2.connect(hote);
    const resultats: ResultatAPNs[] = [];
    let restants = envois.length;
    let termine = false;

    const finir = () => {
      if (termine) return;
      termine = true;
      client.close();
      resoudre(resultats);
    };

    // Une connexion qui ne repond pas ne doit pas retenir la fonction jusqu au
    // delai d execution de Vercel.
    const minuteur = setTimeout(() => {
      for (const e of envois) {
        if (!resultats.some((r) => r.jeton === e.jeton)) {
          resultats.push({ jeton: e.jeton, ok: false, jetonMort: false, raison: "delai_depasse" });
        }
      }
      finir();
    }, 20_000);

    client.on("error", () => {
      clearTimeout(minuteur);
      for (const e of envois) {
        if (!resultats.some((r) => r.jeton === e.jeton)) {
          resultats.push({ jeton: e.jeton, ok: false, jetonMort: false, raison: "connexion" });
        }
      }
      finir();
    });

    for (const envoi of envois) {
      const corps = Buffer.from(
        JSON.stringify({
          aps: {
            alert: { title: envoi.titre, body: envoi.corps },
            sound: "default",
            "thread-id": envoi.regroupement,
          },
          ...envoi.donnees,
        }),
      );

      const flux = client.request({
        ":method": "POST",
        ":path": `/3/device/${envoi.jeton}`,
        authorization: `bearer ${autorisation}`,
        "apns-topic": sujet,
        "apns-push-type": "alert",
        // Priorite 5 : Apple peut grouper l envoi pour menager la batterie.
        // Rien ici n est urgent a la seconde ; 10 serait de l impatience.
        "apns-priority": "5",
        // Une notification non delivree sous 24 h ne vaut plus la peine : elle
        // parlerait d une periode deja commencee.
        "apns-expiration": String(Math.floor(Date.now() / 1000) + 86_400),
        ...(envoi.regroupement ? { "apns-collapse-id": envoi.regroupement.slice(0, 64) } : {}),
        "content-type": "application/json",
        "content-length": String(corps.length),
      });

      let statut = 0;
      let reponse = "";
      flux.on("response", (h) => {
        statut = Number(h[":status"] ?? 0);
      });
      flux.setEncoding("utf8");
      flux.on("data", (c: string) => {
        reponse += c;
      });
      flux.on("end", () => {
        let raison: string | undefined;
        if (statut !== 200) {
          try {
            raison = JSON.parse(reponse)?.reason ?? `http_${statut}`;
          } catch {
            raison = `http_${statut}`;
          }
        }
        resultats.push({
          jeton: envoi.jeton,
          ok: statut === 200,
          // 410 est le verdict d Apple : cet appareil a desinstalle l app.
          jetonMort: statut === 410 || (raison !== undefined && MORTS.has(raison)),
          raison,
        });
        if (--restants === 0) {
          clearTimeout(minuteur);
          finir();
        }
      });
      flux.on("error", () => {
        resultats.push({ jeton: envoi.jeton, ok: false, jetonMort: false, raison: "flux" });
        if (--restants === 0) {
          clearTimeout(minuteur);
          finir();
        }
      });

      flux.end(corps);
    }
  });
}
