/**
 * Les chapitres d une vie, alleges.
 *
 * ── LE PROBLEME QUE CETTE ROUTE RESOUT ─────────────────────────────────────
 *
 * `zodiacal-releasing.php` renvoie 4,12 Mo (mesure du 17/09/2026, thème du
 * 27/09/1977). Il descend l arbre complet sur trois niveaux, soit des milliers
 * de sous-periodes, alors que la question posee n en veut que quatre.
 *
 * Quatre megaoctets pour peindre un ecran, c est une dizaine de secondes en
 * 4G et une facture de donnees que la personne voit passer. Sur un telephone,
 * c est inutilisable.
 *
 * Mais ce poids n existe que sur le DERNIER lien. Entre ce serveur et le
 * moteur, quatre megaoctets ne coutent rien. On les prend ici, on jette
 * `subPeriods` — qui est 99 % du paquet — et on rend 6,5 Ko.
 *
 *     4 124 302 octets  ->  6 546 octets     630 fois moins
 *
 * ── CE QU ON GARDE, ET POURQUOI SI PEU ─────────────────────────────────────
 *
 * Quatre periodes, cinq champs chacune. Rien d autre ne sert a l ecran, et
 * tout ce qui passe par ici finit par etre lu par quelqu un qui n a pas
 * demande a apprendre l astrologie. On ne fait pas remonter `sign`, `ruler`,
 * `peakType` ni `markers` : ce sont des noms de technique, l app a une regle
 * qui les interdit a l affichage, et le plus sur est qu ils n arrivent jamais
 * jusqu a elle.
 *
 * On ne garde pas non plus `signification` : elle arrive en anglais. Le numero
 * de maison suffit, `lib/maisons-i18n.ts` le nomme dans les dix langues.
 */

import { NextRequest, NextResponse } from "next/server";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";

const BASE_URL = "https://ai.zebrapad.io/full-suite-spiritual-api";

/**
 * Le moteur met plusieurs secondes a sortir quatre megaoctets. Trente
 * secondes laissent de la marge sans laisser une requete pendre indefiniment.
 */
const DELAI_MAX_MS = 30_000;

interface PeriodeMoteur {
  level?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  duration?: unknown;
  durationUnit?: unknown;
  housePlacement?: { house?: unknown } | null;
}

function texte(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function nombre(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/** Une periode reduite aux cinq champs dont l ecran a besoin. */
function alleger(p: PeriodeMoteur) {
  return {
    level: nombre(p.level),
    startDate: texte(p.startDate),
    endDate: texte(p.endDate),
    duration: nombre(p.duration),
    durationUnit: texte(p.durationUnit),
    housePlacement: { house: nombre(p.housePlacement?.house) },
  };
}

async function handlePost(req: NextRequest) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "corps illisible" }, { status: 400 });
  }

  const controleur = new AbortController();
  const minuteur = setTimeout(() => controleur.abort(), DELAI_MAX_MS);

  try {
    const res = await fetch(`${BASE_URL}/zodiacal-releasing.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corps),
      signal: controleur.signal,
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `moteur ${res.status}` },
        { status: 502 },
      );
    }

    const brut = await res.json();

    // Le moteur emballe tantot dans `data`, tantot non. Les deux formes ont ete
    // vues en production sur d autres points d entree — on tolere les deux
    // plutot que de dependre de celle du jour.
    const enveloppe = (brut?.data ?? brut) as { releasing?: { periods?: unknown } } | null;
    const periodes = enveloppe?.releasing?.periods;

    if (!Array.isArray(periodes)) {
      return NextResponse.json(
        { success: false, error: "aucune periode dans la reponse du moteur" },
        { status: 502 },
      );
    }

    const chapitres = periodes
      .filter((p): p is PeriodeMoteur => !!p && typeof p === "object")
      .map(alleger)
      .filter((p) => p.level === 1 || p.level === undefined);

    return NextResponse.json({ success: true, periodes: chapitres });
  } catch (e) {
    const expire = e instanceof Error && e.name === "AbortError";
    return NextResponse.json(
      { success: false, error: expire ? "le moteur n a pas repondu a temps" : String(e) },
      { status: expire ? 504 : 502 },
    );
  } finally {
    clearTimeout(minuteur);
  }
}

export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

export const POST = corsHandler(handlePost);
