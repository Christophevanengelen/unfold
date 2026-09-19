/**
 * Les PICS du Releasing zodiacal, un par lot, au niveau demande.
 *
 * ── POURQUOI CETTE ROUTE EXISTE ────────────────────────────────────────────
 *
 * La branche de « Ma vie » ne se peint plus a partir des evenements toctoc :
 * une fleur = une periode de pic du Releasing, rien d autre. Or le paquet
 * `toctoc-app-short.php` ne porte AUCUNE information de pic — mesure du
 * 19/09/2026 sur deux themes reels : `isPeak` absent sur 642/642 et 884/884
 * boudins ZR, `isCu`/`isLB`/`isPreLB` absents aussi, et `markers` ne contient
 * jamais que `Cu`, `LB` ou `pre-LB`. Le champ `isPeakPeriod` de MomentumPhase
 * etait donc TOUJOURS `undefined` : filtrer dessus ne rendait rien, et l arbre
 * perdait ses fleurs sans qu aucune erreur ne soit levee.
 *
 * `zodiacal-releasing.php`, lui, le porte — c est la source que lit deja la
 * courbe ZR du depot 63.astrolearn (`ZRWaveChart.tsx`) : chaque niveau porte
 * ses `subPeriods`, et chaque sous-periode porte son propre `isPeakPeriod`
 * avec ses dates exactes (extraction partagee dans `lib/zr-pics.ts`).
 *
 * ── LES TROIS ECHELLES DE L ARBRE ──────────────────────────────────────────
 *
 * « vie » lit les pics L2 (decennie), « annee » les pics L3 dans l annee en
 * cours, « mois » les pics L4 dans le mois en cours. Le niveau 4 est CHER
 * (resolution de 5 heures sur une vie entiere) — l API demande explicitement
 * `l4Year` pour ne le generer que pour une annee precise, jamais la vie
 * entiere. On le transmet donc uniquement pour `niveau: 4`.
 *
 * ── CE QUI EST JETE, ET POURQUOI ───────────────────────────────────────────
 *
 * Meme raison que `/api/chapitres` : le moteur rend des megaoctets, l ecran
 * n a besoin que des bornes. On ne garde que les pics, et on rend quelques
 * kilo-octets. Les trois lots partent en parallele : un aller-retour, pas
 * trois. On ne fait remonter ni `sign`, ni `ruler`, ni `peakType` : ce sont
 * des noms de technique, l app a une regle qui les interdit a l affichage.
 */

import { NextRequest, NextResponse } from "next/server";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";
import { LOTS_ZR, lireLesPicsDunLot, type LotZR, type PicZR } from "@/lib/zr-pics";

const BASE_URL = "https://ai.zebrapad.io/full-suite-spiritual-api";

/** Le moteur met plusieurs secondes par lot. Les trois partent ensemble. */
const DELAI_MAX_MS = 45_000;

async function pourUnLot(
  corps: Record<string, unknown>,
  lot: LotZR,
  niveau: 2 | 3 | 4,
  l4Year: number | undefined,
  signal: AbortSignal,
): Promise<PicZR[]> {
  const requete: Record<string, unknown> = { ...corps, lotType: lot, maxLevels: niveau };
  if (niveau === 4 && l4Year) requete.l4Year = l4Year;
  const res = await fetch(`${BASE_URL}/zodiacal-releasing.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requete),
    signal,
  });
  if (!res.ok) throw new Error(`moteur ${res.status} (${lot})`);
  const brut = await res.json();
  // Le moteur emballe tantot dans `data`, tantot non — les deux ont ete vues
  // en production. On tolere les deux plutot que celle du jour.
  const enveloppe = (brut?.data ?? brut) as { releasing?: { periods?: unknown } } | null;
  return lireLesPicsDunLot(enveloppe?.releasing?.periods, lot, niveau);
}

async function handlePost(req: NextRequest) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "corps illisible" }, { status: 400 });
  }
  if (!corps || typeof corps !== "object") {
    return NextResponse.json({ success: false, error: "corps illisible" }, { status: 400 });
  }
  const { niveau: niveauBrut, l4Year: l4YearBrut, ...naissance } = corps as Record<string, unknown>;
  const niveau: 2 | 3 | 4 = niveauBrut === 3 ? 3 : niveauBrut === 4 ? 4 : 2;
  const l4Year = typeof l4YearBrut === "number" ? l4YearBrut : undefined;
  if (niveau === 4 && !l4Year) {
    return NextResponse.json({ success: false, error: "l4Year requis pour niveau 4" }, { status: 400 });
  }

  const controleur = new AbortController();
  const minuteur = setTimeout(() => controleur.abort(), DELAI_MAX_MS);

  try {
    const parLot = await Promise.all(
      LOTS_ZR.map((lot) => pourUnLot(naissance, lot, niveau, l4Year, controleur.signal)),
    );
    const pics = parLot.flat().sort((a, b) => a.startDate.localeCompare(b.startDate));
    return NextResponse.json({ success: true, pics });
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
