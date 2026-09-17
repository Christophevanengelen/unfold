/**
 * L appel de compatibilite, cote application.
 *
 * Il passe par notre relais `/api/match` (voir `app/api/match/route.ts`) et non
 * par le moteur en direct : l adresse de Marie-Ange est en http, et un appel en
 * clair depuis l app native serait refuse par iOS.
 *
 * LE CACHE
 *
 * Deux naissances donnent toujours le meme resultat : rien dans ce calcul ne
 * depend de la date du jour, c est tout l interet de la fiche generale qui a
 * remplace l approche par periodes. On garde donc la reponse dans l appareil,
 * sans expiration. Ce qui se perime, ce sont les naissances elles-memes — et la
 * clef du cache est faite des deux naissances, donc une correction d heure de
 * naissance produit une autre clef et un autre calcul.
 *
 * C est ce qui permet a un rapport deja consulte de s ouvrir instantanement,
 * sans le moindre reseau.
 *
 * LA CLEF A CHANGE LE 17/09/2026
 *
 * Marie-Ange a corrige `POST /api/match` : `bond` et `mutualUnderstanding`
 * sont nouveaux, `generalUnderstanding` s est enrichi, et `attraction` a
 * change de forme (un pourcentage devenu une liste d aspects). Une entree deja
 * en cache porte l ancienne forme et la porterait pour toujours — sans
 * expiration, rien ne l aurait jamais forcee a se rafraichir. On change donc
 * le nom de la clef : les caches existants sont ignores, chaque rapport
 * repasse une fois par le reseau, et la clef precedente reste abandonnee dans
 * `localStorage` (quelques ko, jamais relus).
 */

import { apiFetch } from "@/lib/api-client";
import type { BirthData } from "@/lib/birth-data";

const CLE_CACHE = "unfold_match_cache_2026_09_17";
/** Au dela, on jette les plus anciennes : une entree pese environ 4 ko. */
const MAX_ENTREES = 30;

export type RaisonMatch =
  | "naissance_incomplete"
  | "moteur_indisponible"
  | "moteur_lent"
  | "reponse_illisible"
  | "erreur_interne"
  | "reseau";

export type ResultatMatch =
  | { ok: true; match: unknown; ducache: boolean }
  | { ok: false; raison: RaisonMatch };

function personne(b: BirthData, prenom: string) {
  return {
    firstName: prenom || b.nickname || "—",
    birthDate: b.birthDate,
    birthTime: b.birthTime,
    latitude: b.latitude,
    longitude: b.longitude,
    timezone: b.timezone,
  };
}

/** Deux naissances font une clef. L ordre compte : le moteur n est pas symetrique. */
function clef(a: BirthData, b: BirthData): string {
  const p = (x: BirthData) =>
    `${x.birthDate}|${x.birthTime}|${x.latitude.toFixed(4)}|${x.longitude.toFixed(4)}|${x.timezone}`;
  return `${p(a)}>${p(b)}`;
}

type Cache = Record<string, { quand: string; match: unknown }>;

function lireCache(): Cache {
  if (typeof window === "undefined") return {};
  try {
    const brut = localStorage.getItem(CLE_CACHE);
    const c = brut ? (JSON.parse(brut) as Cache) : {};
    return c && typeof c === "object" ? c : {};
  } catch {
    return {};
  }
}

function ecrireCache(c: Cache): void {
  if (typeof window === "undefined") return;
  try {
    const entrees = Object.entries(c).sort((x, y) => (x[1].quand < y[1].quand ? 1 : -1));
    localStorage.setItem(CLE_CACHE, JSON.stringify(Object.fromEntries(entrees.slice(0, MAX_ENTREES))));
  } catch {
    /* stockage plein : le rapport marche, il repassera juste par le reseau */
  }
}

/** Ce qu on a deja, sans reseau. Rend `null` si on n a rien. */
export function matchEnCache(moi: BirthData, autre: BirthData): unknown | null {
  return lireCache()[clef(moi, autre)]?.match ?? null;
}

/**
 * Le calcul. Rend le cache tout de suite s il existe ; sinon appelle le relais.
 * Ne jette jamais : une panne se dit avec une raison, pas avec une exception.
 */
export async function fetchMatch(
  moi: BirthData,
  autre: BirthData,
  prenomAutre: string,
): Promise<ResultatMatch> {
  const k = clef(moi, autre);
  const garde = lireCache()[k];
  if (garde) return { ok: true, match: garde.match, ducache: true };

  try {
    const res = await apiFetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person1: personne(moi, moi.nickname || "Moi"),
        person2: personne(autre, prenomAutre),
      }),
    });
    const data = (await res.json()) as { ok?: boolean; raison?: RaisonMatch; match?: unknown };
    if (!res.ok || !data?.ok || !data.match) {
      return { ok: false, raison: data?.raison ?? "moteur_indisponible" };
    }
    const c = lireCache();
    c[k] = { quand: new Date().toISOString(), match: data.match };
    ecrireCache(c);
    return { ok: true, match: data.match, ducache: false };
  } catch {
    return { ok: false, raison: "reseau" };
  }
}
