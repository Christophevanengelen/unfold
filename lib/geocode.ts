import { getApiBase } from "@/lib/api-client";
/**
 * Geocoding client — wraps our /api/geocode proxy (Open-Meteo).
 * Returns city name + lat/lng/timezone in one call.
 * No API key required.
 */

export interface GeoResult {
  id: number;
  name: string;
  displayName: string; // "Brussels, Belgium"
  latitude: number;
  longitude: number;
  timezone: string; // IANA, e.g. "Europe/Brussels"
  country: string;
  admin1?: string; // region/state
}

interface OpenMeteoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country?: string;
  admin1?: string;
}

function toGeoResult(r: OpenMeteoResult): GeoResult {
  const parts = [r.name, r.admin1, r.country].filter(Boolean);
  return {
    id: r.id,
    name: r.name,
    displayName: parts.join(", "),
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone ?? "UTC",
    country: r.country ?? "",
    admin1: r.admin1,
  };
}

/**
 * Le resultat d une recherche de ville.
 *
 * « aucune ville » et « la recherche a echoue » sont deux choses differentes, et
 * la fonction renvoyait la meme liste vide pour les deux. A l ecran, une panne
 * de reseau et une ville inexistante produisaient donc rigoureusement le meme
 * rien : la personne retapait son texte sans savoir quoi corriger.
 */
export type Recherche =
  | { etat: "ok"; villes: GeoResult[] }
  | { etat: "vide" }
  | { etat: "echec" };

/** Au-dela, on considere que la recherche ne repondra pas. */
const DELAI_MAX = 8000;

/**
 * Cherche des villes. Jusqu a six resultats.
 *
 * `signal` sert a ANNULER une recherche devenue obsolete. Sans lui, deux
 * requetes pouvaient etre en vol en meme temps et la plus lente ecrasait la
 * plus recente : on tapait « Bruxel », pause, puis « Bruxelles », et la liste
 * retombait sur les resultats de « Bruxel ». C est la liste instable sous le
 * doigt.
 */
export async function searchCities(
  query: string,
  options?: { signal?: AbortSignal; langue?: string },
): Promise<Recherche> {
  if (!query || query.trim().length < 2) return { etat: "vide" };
  try {
    // Un delai maximal, sinon un serveur qui ne repond pas laisse l ecran en
    // « recherche… » indefiniment.
    const horloge = AbortSignal.timeout(DELAI_MAX);
    const signal = options?.signal
      ? AbortSignal.any([options.signal, horloge])
      : horloge;

    const params = new URLSearchParams({ q: query.trim() });
    if (options?.langue) params.set("lang", options.langue);

    const res = await fetch(`${getApiBase()}/api/geocode?${params}`, { signal });
    if (!res.ok) return { etat: "echec" };
    const data = (await res.json()) as { results?: OpenMeteoResult[] };
    const villes = (data.results ?? []).map(toGeoResult);
    return villes.length > 0 ? { etat: "ok", villes } : { etat: "vide" };
  } catch (e) {
    // Une annulation volontaire n est pas un echec : la recherche suivante a
    // deja pris le relais, et afficher une erreur ici serait un mensonge.
    if (e instanceof DOMException && e.name === "AbortError") {
      return { etat: "vide" };
    }
    return { etat: "echec" };
  }
}
