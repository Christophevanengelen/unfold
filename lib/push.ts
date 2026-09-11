/**
 * Notifications distantes, côté app.
 *
 * La règle produit est écrite dans le Drive (`NOTIFICATIONS — la règle`) : deux
 * natures d'événement seulement, une par semaine au maximum, jamais avant 8 h
 * ni après 21 h, et chaque notification ouvre la période concernée.
 *
 * Ce fichier ne s'occupe que de la permission et du jeton. Le choix de ce qu'on
 * envoie, et quand, vit côté serveur.
 *
 * **La contrainte qui gouverne tout :** sur iOS, la boîte système ne s'affiche
 * qu'une seule fois dans la vie de l'installation. Après un refus, il n'y a plus
 * rien à faire depuis l'app — il faut envoyer la personne dans les Réglages, et
 * presque personne n'y va. On ne l'appelle donc jamais au lancement, et jamais
 * sans qu'elle ait dit oui à un écran à nous d'abord.
 */

import { isNative } from "@/lib/platform";
import { getDeviceId } from "@/lib/device-id";
import { getApiBase } from "@/lib/api-client";
import type { Cadence, ReglageConnexion } from "@/lib/push-planification";
import { REGLAGE_CONNEXION_DEFAUT } from "@/lib/push-planification";

/**
 * Ce que le système répond, sans jamais rien demander.
 *
 * `indisponible` et `erreur` sont volontairement distincts. Le premier veut
 * dire « nous ne sommes pas dans l app, cette fonction n existe pas ici » et
 * justifie de ne rien afficher. Le second veut dire « nous sommes dans l app et
 * quelque chose a casse » — et là, masquer la ligne fait passer une panne pour
 * une absence de fonctionnalité. C est ce qui vient d arriver.
 */
export type EtatPermission =
  | "jamais_demande"
  | "accorde"
  | "refuse"
  | "erreur"
  | "indisponible";

const CLE_PROPOSE = "favorable_push_propose_le";

async function greffon() {
  const m = await import("@capacitor/push-notifications");
  return m.PushNotifications;
}

/**
 * Lit l'état sans rien déclencher. À appeler au démarrage.
 */
export async function etatPermission(): Promise<EtatPermission> {
  // Hors de l app, il n y a rien a montrer : ce n est pas une panne.
  if (typeof window === "undefined" || !isNative()) return "indisponible";
  try {
    const { receive } = await (await greffon()).checkPermissions();
    if (receive === "granted") return "accorde";
    if (receive === "denied") return "refuse";
    return "jamais_demande";
  } catch (e) {
    // Dans l app, un echec se dit. On garde le detail pour pouvoir le lire
    // depuis l ecran plutot que d avoir a deviner a distance.
    dernierEchec = e instanceof Error ? e.message : String(e);
    return "erreur";
  }
}

let dernierEchec: string | null = null;

/** Le detail du dernier echec, pour l affichage de secours. */
export function detailEchec(): string | null {
  return dernierEchec;
}

/**
 * Demande la permission, puis enregistre le jeton si elle est accordée.
 * À n'appeler QUE depuis un geste explicite de la personne.
 */
export async function demanderPuisEnregistrer(): Promise<EtatPermission> {
  if (typeof window === "undefined" || !isNative()) return "indisponible";
  try {
    const p = await greffon();
    const { receive } = await p.requestPermissions();
    if (receive !== "granted") return receive === "denied" ? "refuse" : "jamais_demande";
    // requestPermissions demande, register obtient le jeton : deux appels.
    await p.register();
    return "accorde";
  } catch (e) {
    dernierEchec = e instanceof Error ? e.message : String(e);
    return "erreur";
  }
}

/**
 * Branche les écoutes. À monter une seule fois, au démarrage de l'app.
 *
 * `surOuverture` reçoit la charge utile quand la personne touche une
 * notification. L'événement est conservé par le greffon jusqu'à ce qu'un
 * écouteur existe (`retainUntilConsumed`), donc un démarrage à froid n'est pas
 * une course : React peut monter tranquillement, l'événement l'attend.
 */
export async function brancherEcoutes(
  surOuverture: (donnees: unknown) => void,
): Promise<() => void> {
  if (typeof window === "undefined" || !isNative()) return () => {};

  try {
    const p = await greffon();

    const h1 = await p.addListener("registration", (t) => {
      void envoyerJeton(t.value);
    });
    const h2 = await p.addListener("registrationError", () => {
      // Rien à faire côté personne : elle n'a pas à savoir qu'Apple n'a pas
      // répondu. L'app se réenregistre au prochain démarrage.
    });
    const h3 = await p.addListener("pushNotificationActionPerformed", (a) => {
      surOuverture(a.notification?.data ?? {});
    });

    // Si la permission est déjà accordée (elle l'a acceptée un autre jour),
    // on redemande le jeton à chaque démarrage : il peut avoir changé, et
    // cela rafraîchit sa date de dernière vue côté serveur.
    if ((await p.checkPermissions()).receive === "granted") {
      await p.register();
    }

    return () => {
      void h1.remove();
      void h2.remove();
      void h3.remove();
    };
  } catch {
    return () => {};
  }
}

/**
 * Dépose le jeton côté serveur. Envoi sans attente : perdre un enregistrement
 * n'a pas de conséquence immédiate, puisque l'app rappelle cette route à chaque
 * démarrage à froid. Faire échouer un écran, si.
 */
async function envoyerJeton(jeton: string): Promise<void> {
  try {
    const plateforme =
      typeof navigator !== "undefined" && /android/i.test(navigator.userAgent)
        ? "android"
        : "ios";

    await fetch(`${getApiBase()}/api/push/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        jeton,
        // Sur iOS le greffon parle à Apple en direct : le jeton est un jeton
        // APNs, pas un jeton FCM. Les coller dans Firebase ne produirait rien.
        fournisseur: plateforme === "android" ? "fcm" : "apns",
        plateforme,
        deviceId: getDeviceId(),
        // Le fuseau de l'APPAREIL. Surtout pas celui du thème natal, qui est
        // le fuseau de naissance.
        fuseau: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: (() => {
          try {
            return localStorage.getItem("unfold_locale") ?? navigator.language?.slice(0, 2);
          } catch {
            return undefined;
          }
        })(),
      }),
    });
  } catch {
    // silence volontaire
  }
}

/** A-t-on déjà proposé l'écran de pré-demande ? */
export function dejaPropose(): boolean {
  try {
    return localStorage.getItem(CLE_PROPOSE) !== null;
  } catch {
    return true; // stockage refusé : on ne harcèle pas
  }
}

/** Mémorise qu'on a proposé, pour ne pas reposer la question à chaque écran. */
export function marquerPropose(): void {
  try {
    localStorage.setItem(CLE_PROPOSE, new Date().toISOString());
  } catch {
    /* stockage refusé */
  }
}

/**
 * La cadence choisie. Elle fait autorite cote serveur, qui decide des envois ;
 * la copie locale n existe que pour afficher le bon cran sans attendre le
 * reseau a l ouverture du tiroir.
 */
const CLE_CADENCE = "favorable_push_cadence";

export function lireCadence(): Cadence {
  try {
    const v = localStorage.getItem(CLE_CADENCE);
    if (v === "aucune" || v === "essentiel" || v === "tout") return v;
  } catch {
    /* stockage refuse */
  }
  return "normal";
}

export async function reglerCadence(cadence: Cadence): Promise<void> {
  try {
    localStorage.setItem(CLE_CADENCE, cadence);
  } catch {
    /* stockage refuse */
  }
  try {
    await fetch(`${getApiBase()}/api/push/cadence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ deviceId: getDeviceId(), cadence }),
    });
  } catch {
    // silence volontaire : le serveur garde le cran precedent, et l app
    // renverra le choix au prochain reglage.
  }
}

/**
 * Ce que chaque connexion a le droit d envoyer.
 *
 * Un seul cran pour tout le monde ne tient pas : on ne veut pas savoir la meme
 * chose de sa compagne et d un collegue. Le reglage est donc par connexion, et
 * il vit dans les parametres du compte, a cote de la cadence — pas sur la fiche
 * de la personne, ou personne ne va chercher un reglage.
 *
 * Meme partage des roles que la cadence : le serveur fait autorite puisque
 * c est lui qui envoie, la copie locale n existe que pour afficher le bon cran
 * sans attendre le reseau a l ouverture du tiroir.
 */
const CLE_CONNEXIONS = "favorable_push_connexions";

const CRANS_CONNEXION: ReglageConnexion[] = ["aucune", "communs", "avec_autre", "tout"];

function lireTousLesReglages(): Record<string, ReglageConnexion> {
  try {
    const brut = localStorage.getItem(CLE_CONNEXIONS);
    if (!brut) return {};
    const lu: unknown = JSON.parse(brut);
    if (typeof lu !== "object" || lu === null) return {};
    const propre: Record<string, ReglageConnexion> = {};
    for (const [ref, valeur] of Object.entries(lu as Record<string, unknown>)) {
      // Liste fermee : une valeur abimee vaut le defaut, elle ne traverse pas.
      if (CRANS_CONNEXION.includes(valeur as ReglageConnexion)) {
        propre[ref] = valeur as ReglageConnexion;
      }
    }
    return propre;
  } catch {
    // stockage refuse ou JSON abime : tout le monde au defaut.
    return {};
  }
}

/** Le cran de cette connexion. Le defaut est le plus discret des trois. */
export function lireReglageConnexion(ref: string): ReglageConnexion {
  return lireTousLesReglages()[ref] ?? REGLAGE_CONNEXION_DEFAUT;
}

export async function reglerConnexion(
  ref: string,
  reglage: ReglageConnexion,
): Promise<void> {
  try {
    const tous = lireTousLesReglages();
    tous[ref] = reglage;
    localStorage.setItem(CLE_CONNEXIONS, JSON.stringify(tous));
  } catch {
    /* stockage refuse */
  }
  try {
    await fetch(`${getApiBase()}/api/push/reglage-connexion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ deviceId: getDeviceId(), connexion: ref, reglage }),
    });
  } catch {
    // silence volontaire, meme raison que pour la cadence.
  }
}
