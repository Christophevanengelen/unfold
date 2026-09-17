/**
 * Les positions reelles des planetes a une date donnee.
 *
 * ─── POURQUOI CETTE ROUTE EXISTE ────────────────────────────────────────────
 *
 * Christophe, le 17/09 : « je veux voir la petite animation avec les bonnes
 * planetes et leur position qui fait qu en fait, on sait quoi dire. […] on a
 * une petite indication visuelle qui montre que c est connecte a la NASA en
 * direct. Et ca rend ca plus reel. »
 *
 * Le mot qui compte est REEL. Une periode de la timeline ne porte que des NOMS
 * de planetes — aucun degre, aucune position. Dessiner des points a des angles
 * choisis au hasard donnerait une jolie image qui ne sait rien, et c est
 * exactement ce que la veille de ce jour-la appelle une visualisation
 * decorative : « chacun de ces choix dit que ce dessin ne sait rien ».
 *
 * `ephemeris-expert.php` du moteur rend la position VRAIE, a n importe quelle
 * date, passee ou future. Mesure du 17/09 sur le 15 juin 2019 : le Soleil a
 * 84,1186° de longitude ecliptique, 430 octets, une reponse immediate.
 *
 * ─── CE QU ON GARDE, ET CE QU ON JETTE ──────────────────────────────────────
 *
 * On garde `longitude` — un angle de 0 a 360, qui se pose directement sur un
 * cercle — et `retrograde`, qui est un fait d observation : la planete parait
 * reculer. C est de l astronomie, pas une technique d interpretation.
 *
 * On jette `sign` et `degree_in_sign`. Ce sont des noms de technique, l app
 * s interdit de les afficher, et le plus sur est qu ils n arrivent jamais
 * jusqu a elle : on ne peut pas montrer par megarde un champ qui n existe pas.
 *
 * ─── LE COUT, ET POURQUOI IL EST ACCEPTABLE ─────────────────────────────────
 *
 * Un appel par planete. Une periode en compte une a cinq, donc cinq appels au
 * pire — groupes ici, en parallele, cote serveur.
 *
 * Christophe tient a ce que l app n aille pas reinterroger le moteur : « une
 * date, une heure, un lieu, ca telecharge toute la vie et on n a plus besoin ».
 * Une position ne peut pas se pre-telecharger pour toute une vie, elle varie en
 * continu. Mais la date d une periode, elle, ne bouge pas : le resultat est
 * donc mis en cache cote client sans expiration, une fois par periode ouverte.
 * Voir `lib/positions-api.ts`.
 */

import { NextRequest, NextResponse } from "next/server";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";

const BASE_URL = "https://ai.zebrapad.io/full-suite-spiritual-api";
const DELAI_MS = 15_000;

/** Les noms que le moteur accepte, dans sa casse a lui. */
const NOMS: Record<string, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
};

export interface Position {
  /** La clef telle que l app la nomme, en minuscules. */
  planete: string;
  /** Longitude ecliptique, de 0 a 360. C est l angle sur le cercle. */
  longitude: number;
  /** Vrai quand la planete parait reculer. Un fait d observation. */
  retrograde: boolean;
}

async function unePosition(
  planete: string,
  date: string,
  signal: AbortSignal,
): Promise<Position | null> {
  const nom = NOMS[planete];
  if (!nom) return null;
  try {
    const res = await fetch(`${BASE_URL}/ephemeris-expert.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query_type: "planet_position", planet: nom, date }),
      signal,
    });
    if (!res.ok) return null;
    const brut = await res.json();
    // Le moteur emballe deux fois : { success, data: { success, result } }.
    const r = brut?.data?.result ?? brut?.result;
    const longitude = typeof r?.longitude === "number" ? r.longitude : null;
    if (longitude === null || !Number.isFinite(longitude)) return null;
    return {
      planete,
      longitude: ((longitude % 360) + 360) % 360,
      retrograde: r?.retrograde === true,
    };
  } catch {
    return null;
  }
}

async function handlePost(req: NextRequest) {
  let corps: { date?: unknown; planetes?: unknown };
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "corps illisible" }, { status: 400 });
  }

  const date = typeof corps.date === "string" ? corps.date.slice(0, 10) : null;
  const demandees = Array.isArray(corps.planetes)
    ? corps.planetes.filter((p): p is string => typeof p === "string").slice(0, 6)
    : [];

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || demandees.length === 0) {
    return NextResponse.json({ success: false, error: "date ou planetes manquantes" }, { status: 400 });
  }

  const controleur = new AbortController();
  const minuteur = setTimeout(() => controleur.abort(), DELAI_MS);
  try {
    const positions = (
      await Promise.all(demandees.map((p) => unePosition(p.toLowerCase(), date, controleur.signal)))
    ).filter((p): p is Position => p !== null);

    // Zero position n est pas une erreur a montrer : l ecran se passe du
    // dessin et garde tout son texte. Mais on le dit, pour que l appelant ne
    // mette pas un tableau vide en cache comme si c etait un resultat.
    if (positions.length === 0) {
      return NextResponse.json({ success: false, error: "aucune position" }, { status: 502 });
    }
    return NextResponse.json({ success: true, date, positions });
  } finally {
    clearTimeout(minuteur);
  }
}

export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

export const POST = corsHandler(handlePost);
