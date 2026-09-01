/**
 * L achat integre, cote app.
 *
 * Pourquoi ce fichier a ete ecrit le 01/09/2026 : sur iPhone, l ecran des prix
 * n affichait AUCUN prix et AUCUN bouton. A leur place, un texte fixe —
 * « Disponible dans la version Pro de l app » — alors qu on est deja DANS
 * l app, sur l ecran des prix. Une impasse qui ne dit rien et n offre rien.
 *
 * Deux commentaires du code annonçaient une « Phase 4 » qui n a jamais eu lieu.
 * Toute la moitie serveur existait pourtant : le webhook RevenueCat, la table
 * des abonnements, /api/billing/me, la purge de l abonne a la suppression de
 * compte. Il manquait uniquement le SDK et la feuille d achat native.
 *
 * CE QUI RESTE A FAIRE HORS DU CODE, et sans quoi rien ne fonctionnera :
 *
 *   1. Creer les produits dans App Store Connect (abonnement mensuel et
 *      annuel), puis les declarer dans le tableau de bord RevenueCat.
 *   2. Renseigner NEXT_PUBLIC_REVENUECAT_IOS_KEY (clef PUBLIQUE de l app, pas
 *      la clef secrete du serveur — celle-ci ne doit jamais partir dans le
 *      paquet).
 *   3. Tester avec un compte bac a sable sur un vrai appareil. Un achat ne se
 *      verifie pas autrement, et je ne peux pas le faire a votre place.
 *
 * Tant que 1 et 2 ne sont pas faits, `disponible()` renvoie faux et l ecran
 * garde son message — mais un message HONNETE, pas une impasse.
 */

import { isNative } from "@/lib/platform";

/** L identifiant du droit, tel que declare dans RevenueCat. */
const DROIT = "premium";

let pret: boolean | null = null;

async function sdk() {
  const m = await import("@revenuecat/purchases-capacitor");
  return m.Purchases;
}

/** La clef publique de l app. Absente = achat non configure. */
function clef(): string {
  return process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY ?? "";
}

/**
 * L achat integre est-il utilisable ici et maintenant ?
 *
 * Faux hors de l app — le web passe par Stripe — et faux tant que la clef n est
 * pas renseignee. On ne montre jamais un bouton d achat qui ne peut pas
 * aboutir : c est ce que faisait l ecran precedent, en pire.
 */
export function disponible(): boolean {
  return isNative() && clef().length > 0;
}

/**
 * Prepare le SDK. Idempotent, appelable a chaque ouverture de l ecran.
 *
 * `appUserId` DOIT etre l identifiant que le serveur connait : le webhook
 * enregistre l abonnement sous `app_user_id`, et /api/billing/me le relit.
 * Deux identifiants differents, et l achat aboutit sans que le droit
 * n apparaisse jamais — un echec parfaitement silencieux, du cote le plus
 * couteux qui soit.
 */
export async function preparer(appUserId: string): Promise<boolean> {
  if (!disponible()) return false;
  if (pret) return true;
  try {
    await (await sdk()).configure({ apiKey: clef(), appUserID: appUserId });
    pret = true;
    return true;
  } catch (e) {
    console.error("achats : configuration refusee", e);
    pret = false;
    return false;
  }
}

export interface OffreAchat {
  /** L identifiant du paquet RevenueCat, a repasser a `acheter`. */
  id: string;
  /** Le prix DEJA formate par le magasin, dans la devise du compte. */
  prix: string;
  /** "mensuel" | "annuel" | autre, deduit du paquet. */
  periode: string;
}

/**
 * Les offres, telles que le magasin les annonce.
 *
 * On affiche TOUJOURS le prix rendu par StoreKit, jamais celui de nos
 * constantes : Apple convertit, arrondit et applique la fiscalite locale. Un
 * prix ecrit en dur finit par mentir a quelqu un, quelque part.
 */
export async function offres(): Promise<OffreAchat[]> {
  if (!disponible()) return [];
  try {
    const o = await (await sdk()).getOfferings();
    const courante = o.current;
    if (!courante) return [];
    return courante.availablePackages.map((p) => ({
      id: p.identifier,
      prix: p.product.priceString,
      periode: p.packageType,
    }));
  } catch (e) {
    console.error("achats : offres indisponibles", e);
    return [];
  }
}

export type ResultatAchat = "ok" | "annule" | "echec" | "indisponible";

/**
 * Lance la feuille d achat native.
 *
 * « annule » n est PAS une erreur : quelqu un qui ferme la feuille a pris une
 * decision, et lui montrer un message d echec serait le punir de l avoir
 * prise. Les deux cas doivent rester distincts jusqu a l interface.
 */
export async function acheter(idPaquet: string): Promise<ResultatAchat> {
  if (!disponible()) return "indisponible";
  try {
    const p = await sdk();
    const o = await p.getOfferings();
    const paquet = o.current?.availablePackages.find((x) => x.identifier === idPaquet);
    if (!paquet) return "echec";
    const res = await p.purchasePackage({ aPackage: paquet });
    return res.customerInfo.entitlements.active[DROIT] ? "ok" : "echec";
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/cancel/i.test(msg)) return "annule";
    console.error("achats : achat refuse", msg);
    return "echec";
  }
}

/**
 * Restaure les achats.
 *
 * Apple l EXIGE : sans bouton de restauration visible, l app est refusee. Et
 * c est juste — quelqu un qui change de telephone ne doit pas repayer.
 */
export async function restaurer(): Promise<boolean> {
  if (!disponible()) return false;
  try {
    const info = await (await sdk()).restorePurchases();
    return Boolean(info.customerInfo.entitlements.active[DROIT]);
  } catch (e) {
    console.error("achats : restauration refusee", e);
    return false;
  }
}

/** Le droit est-il actif, d apres le magasin ? */
export async function droitActif(): Promise<boolean> {
  if (!disponible()) return false;
  try {
    const info = await (await sdk()).getCustomerInfo();
    return Boolean(info.customerInfo.entitlements.active[DROIT]);
  } catch {
    return false;
  }
}
