/**
 * Les grands mouvements d une vie, et leur cache.
 *
 * ─── POURQUOI CE FICHIER EXISTE ─────────────────────────────────────────────
 *
 * Christophe, le 17/09 : « quand on donne une date, une heure, un lieu, ca doit
 * telecharger toute la vie entiere, la mettre en cache, et normalement on n a
 * plus besoin d aller reinterroger l API. Elle a bien fait tout ca. »
 *
 * Il a raison, et c est deja le fonctionnement de `lib/momentum-store.tsx` :
 * une naissance, un appel, puis IndexedDB et localStorage, la clef portant
 * l empreinte de la naissance. L ecran affiche le cache tout de suite.
 *
 * La route `/api/chapitres`, ecrite le meme jour, ne suivait PAS ce modele :
 * elle rappelait le moteur a chaque ouverture de l ecran « Ma vie ». Ce fichier
 * la range dans le modele existant plutot que d en inventer un autre.
 *
 * ─── POURQUOI LE CACHE N EXPIRE PAS ────────────────────────────────────────
 *
 * Meme raison que pour le match : ces periodes ne dependent pas de la date du
 * jour. Elles decoupent une vie entiere a partir d une seule naissance, et une
 * naissance ne change pas. Ce qui se perime, c est la naissance elle-meme — et
 * la clef est faite d elle, donc une correction d heure produit une autre clef
 * et un autre calcul.
 *
 * Consequence voulue : le second passage sur l ecran est instantane, et sans
 * reseau. Les quatre megaoctets que la route allege ne repartent jamais deux
 * fois pour la meme personne.
 */

import { apiFetch } from "@/lib/api-client";
import { birthHash, type BirthData } from "@/lib/birth-data";
import type { PeriodeBrute } from "@/lib/chapitres-vie";

const CLE = "unfold_cache_chapitres_v1";

/** Au-dela, on jette les plus anciennes. Une entree pese environ 7 ko. */
const MAX_ENTREES = 12;

type Magasin = Record<string, PeriodeBrute[]>;

function lireMagasin(): Magasin {
  if (typeof window === "undefined") return {};
  try {
    const brut = localStorage.getItem(CLE);
    return brut ? (JSON.parse(brut) as Magasin) : {};
  } catch {
    return {};
  }
}

function ecrireMagasin(m: Magasin): void {
  try {
    const clefs = Object.keys(m);
    if (clefs.length > MAX_ENTREES) {
      for (const c of clefs.slice(0, clefs.length - MAX_ENTREES)) delete m[c];
    }
    localStorage.setItem(CLE, JSON.stringify(m));
  } catch {
    /* Stockage plein ou refuse : on se passe du cache, pas du resultat. */
  }
}

/** Ce que le cache garde deja pour cette naissance, ou `null`. */
export function chapitresEnCache(naissance: BirthData): PeriodeBrute[] | null {
  return lireMagasin()[birthHash(naissance)] ?? null;
}

/**
 * Les periodes, du cache si elles y sont, du moteur sinon.
 *
 * Rend `null` quand le moteur n a pas repondu : l ecran se passe alors de l arc
 * et garde tout le reste. On ne met JAMAIS un echec en cache — c est le defaut
 * qui avait garde un rapport de couple en panne pendant vingt-quatre heures.
 */
export async function chargerChapitres(naissance: BirthData): Promise<PeriodeBrute[] | null> {
  const clef = birthHash(naissance);
  const magasin = lireMagasin();
  const garde = magasin[clef];
  if (garde) return garde;

  try {
    const res = await apiFetch("/api/chapitres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: naissance.birthDate,
        birthTime: naissance.birthTime || "00:00",
        latitude: naissance.latitude,
        longitude: naissance.longitude,
        timezone: naissance.timezone,
      }),
    });
    if (!res.ok) return null;
    const paquet = (await res.json()) as { success?: boolean; periodes?: PeriodeBrute[] };
    if (!paquet?.success || !Array.isArray(paquet.periodes) || paquet.periodes.length === 0) {
      return null;
    }
    magasin[clef] = paquet.periodes;
    ecrireMagasin(magasin);
    return paquet.periodes;
  } catch {
    return null;
  }
}
