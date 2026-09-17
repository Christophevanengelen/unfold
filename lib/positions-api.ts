/**
 * Les positions planetaires d une periode, et leur cache.
 *
 * Meme contrat que partout ailleurs dans l app : on n appelle le moteur qu une
 * fois pour une question donnee, puis on lit le cache. Voir
 * `lib/chapitres-api.ts` et `lib/momentum-store.tsx`.
 *
 * ─── POURQUOI LE CACHE NE PEUT PAS ETRE CELUI DE LA VIE ENTIERE ─────────────
 *
 * Christophe tient a ce qu une naissance suffise : « ca telecharge toute la vie
 * entiere, et on n a plus besoin d aller reinterroger l API ». C est vrai des
 * PERIODES — elles sont finies, on les connait toutes d avance.
 *
 * Une position planetaire, non : elle varie en continu, il y en a une par
 * instant. On ne peut pas pre-telecharger un ciel par jour de vie.
 *
 * Mais la date d une periode ne bouge pas. Donc la question « ou etaient ces
 * planetes le 15 juin 2019 » a une reponse definitive, et une seule. On la
 * garde sans expiration, et on ne la repose jamais.
 *
 * La clef porte la date ET la liste des planetes : deux periodes au meme jour
 * mais avec des planetes differentes sont deux questions differentes.
 */

import { apiFetch } from "@/lib/api-client";

export interface Position {
  planete: string;
  /** Longitude ecliptique, de 0 a 360 : l angle sur le cercle. */
  longitude: number;
  retrograde: boolean;
}

const CLE = "unfold_cache_positions_v1";

/** Au-dela, on jette les plus anciennes. Une entree pese moins de 300 octets. */
const MAX_ENTREES = 120;

type Magasin = Record<string, Position[]>;

function clefDe(date: string, planetes: string[]): string {
  return `${date.slice(0, 10)}|${[...planetes].sort().join(",")}`;
}

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
    /* Stockage plein ou refuse : on se passe du cache, pas du dessin. */
  }
}

/** Ce que le cache garde deja pour cette question, ou `null`. */
export function positionsEnCache(date: string, planetes: string[]): Position[] | null {
  if (planetes.length === 0) return null;
  return lireMagasin()[clefDe(date, planetes)] ?? null;
}

/**
 * Les positions, du cache si elles y sont, du moteur sinon.
 *
 * Rend `null` quand le moteur n a pas repondu. L ecran renonce alors au dessin
 * et garde tout son texte — c est un supplement, pas une dependance. Et on ne
 * met JAMAIS un echec en cache : un rapport de couple en panne y est deja reste
 * vingt-quatre heures.
 */
export async function chargerPositions(
  date: string,
  planetes: string[],
): Promise<Position[] | null> {
  if (planetes.length === 0) return null;
  const clef = clefDe(date, planetes);
  const magasin = lireMagasin();
  const garde = magasin[clef];
  if (garde) return garde;

  try {
    const res = await apiFetch("/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: date.slice(0, 10), planetes }),
    });
    if (!res.ok) return null;
    const paquet = (await res.json()) as { success?: boolean; positions?: Position[] };
    if (!paquet?.success || !Array.isArray(paquet.positions) || paquet.positions.length === 0) {
      return null;
    }
    magasin[clef] = paquet.positions;
    ecrireMagasin(magasin);
    return paquet.positions;
  } catch {
    return null;
  }
}
