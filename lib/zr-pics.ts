/**
 * Les PICS du Releasing zodiacal — un lot, un niveau, une periode reelle.
 *
 * `lireLesPicsDunLot` est partagee avec `app/api/zr-pics/route.ts` (qui
 * appelle le moteur et fait le tri) — jamais dupliquee. `fetchZrPics`, plus
 * bas, est le cote client : elle appelle TOUJOURS notre propre route, jamais
 * le moteur directement. `apiFetch` route deja cet appel vers le bon serveur
 * qu on soit sur le web (route Next.js locale) ou en natif Capacitor
 * (favorable.day, qui porte la meme route) — voir `lib/api-client.ts`.
 *
 * ── POURQUOI CE FICHIER EXISTE ─────────────────────────────────────────────
 *
 * Mesure du 19/09/2026 sur deux themes reels : `toctoc-app-short.php` ne porte
 * JAMAIS `isPeakPeriod` sur ses boudins ZR (0/642 et 0/884). Le seul endroit
 * ou le pic existe est `zodiacal-releasing.php`, dans les `subPeriods` d un
 * niveau L(n-1) — chaque sous-periode porte son propre `isPeakPeriod` et ses
 * propres dates, jamais deduites. C est aussi ce que lit la courbe ZR du
 * depot 63.astrolearn (`ZRWaveChart.tsx`, `buildChartL2Data`).
 */

import { apiFetch } from "@/lib/api-client";
import { storage } from "@/lib/storage";
import { birthHash, type BirthData } from "@/lib/birth-data";

export const LOTS_ZR = ["eros", "spirit", "fortune"] as const;
export type LotZR = (typeof LOTS_ZR)[number];

/**
 * Un marqueur, reduit a ce que la branche dessine : un lot, deux dates, un
 * genre. Trois genres distincts, jamais confondus (Marie-Ange, 19/09,
 * `files (7)/zr-page-lotus-branche.patch` + les deux SVG de reference) :
 *   — un pic ordinaire (`isPeakPeriod`) -> une fleur ;
 *   — une pre-ombre (`isPreLB`/marker "pre-LB") -> une GRAINE : la brindille
 *     porte des bourgeons, pas une fleur ouverte — la periode n a pas encore
 *     fleuri, elle l annonce (le futur LB, ~8 ans plus tard) ;
 *   — un Loosing of the Bond (`isLoosingOfBond`/marker "LB") -> un LOTUS :
 *     un eclat de rayons depuis la pointe, le pivot majeur de la sequence.
 * Les trois sont independants : un LB ou une pre-ombre n est pas force ment
 * un pic angulaire, et inversement. On garde donc une periode des qu ELLE
 * PORTE UN DE CES TROIS DRAPEAUX, jamais seulement `isPeakPeriod`.
 */
export interface PicZR {
  lot: LotZR;
  startDate: string;
  endDate: string;
  /** Pic ordinaire, angulaire depuis le Lot de Fortune. */
  peak: boolean;
  /** Pivot majeur (Loosing of the Bond) -> lotus. */
  lb: boolean;
  /** Pre-ombre d un LB a venir -> graine. */
  preLB: boolean;
  /** Apogee de cycle (culmination). */
  cu: boolean;
  /**
   * Uniquement sur une graine (`preLB`) : la date du LB qu elle annonce — le
   * premier LB du meme lot qui suit chronologiquement. La pre-ombre est,
   * par definition, la premiere visite du signe que le LB va occuper ~8 ans
   * plus tard (voir `docs/zr-doctrine.md`) : il y a donc toujours EXACTEMENT
   * un LB a venir a associer, jamais un a deviner.
   */
  lbDate?: string;
}

interface SousPeriodeMoteur {
  startDate?: unknown;
  endDate?: unknown;
  isPeakPeriod?: unknown;
  isCulmination?: unknown;
  isLoosingOfBond?: unknown;
  isForeshadowing?: unknown;
  markers?: unknown;
  subPeriods?: unknown;
}

function texte(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

/**
 * Descend l arbre `periods` (L1 -> subPeriods -> L2 -> subPeriods -> ...)
 * jusqu au niveau demande et n en garde que les pics reels.
 *
 * `niveau` compte depuis L1 = 1 : niveau 2 lit `periods[].subPeriods` (ce que
 * `zodiacal-releasing.php` appelle des L2), niveau 3 descend un cran de plus,
 * niveau 4 un cran encore.
 */
export function lireLesPicsDunLot(periodesL1: unknown, lot: LotZR, niveau: 2 | 3 | 4): PicZR[] {
  if (!Array.isArray(periodesL1)) return [];
  let couche: unknown[] = periodesL1;
  // Descendre (niveau - 1) fois dans `subPeriods` pour atteindre le niveau vise.
  for (let d = 1; d < niveau; d++) {
    const suivante: unknown[] = [];
    for (const p of couche) {
      const sous = (p as SousPeriodeMoteur | null)?.subPeriods;
      if (Array.isArray(sous)) suivante.push(...sous);
    }
    couche = suivante;
  }
  const pics: PicZR[] = [];
  for (const p of couche) {
    if (!p || typeof p !== "object") continue;
    const sp = p as SousPeriodeMoteur;
    const marqueurs = Array.isArray(sp.markers) ? sp.markers.map(String) : [];
    const peak = sp.isPeakPeriod === true;
    const lb = sp.isLoosingOfBond === true || marqueurs.includes("LB");
    const preLB = sp.isForeshadowing === true || marqueurs.includes("pre-LB");
    // Ni pic, ni pivot, ni pre-ombre : rien a dessiner sur la branche.
    if (!peak && !lb && !preLB) continue;
    const debut = texte(sp.startDate);
    const fin = texte(sp.endDate);
    // Une periode sans ses deux bornes ne se dessine pas : la brindille va
    // d une date a l autre. On la laisse tomber plutot que d en inventer une.
    if (!debut || !fin) continue;
    pics.push({
      lot,
      startDate: debut,
      endDate: fin,
      peak,
      lb,
      preLB,
      cu: sp.isCulmination === true || marqueurs.includes("Cu"),
    });
  }
  pics.sort((a, b) => a.startDate.localeCompare(b.startDate));
  // Relier chaque graine au LB qu elle annonce : le premier LB du meme lot,
  // chronologiquement APRES elle. Toujours exactement un — voir le champ.
  for (const p of pics) {
    if (!p.preLB) continue;
    const lb = pics.find((q) => q.lb && q.startDate > p.startDate);
    if (lb) p.lbDate = lb.startDate;
  }
  return pics;
}

/** Les pics d un theme et d un niveau ne changent jamais : autant les garder. */
const TTL_PICS = 365 * 24 * 60 * 60 * 1000;

/**
 * Les pics reels d un niveau, tous lots confondus.
 *
 * `l4Year` distingue le cache d une annee sur l autre au niveau 4 (le seul ou
 * le moteur exige une annee precise — voir `app/api/zr-pics/route.ts`) ; les
 * niveaux 2 et 3 ne varient jamais pour un theme donne, donc jamais dans la
 * clef de cache.
 */
export async function fetchZrPics(birth: BirthData, niveau: 2 | 3 | 4, l4Year?: number): Promise<PicZR[]> {
  const cacheKey = `unfold_zr_pics_${birthHash(birth)}_${niveau}${niveau === 4 && l4Year ? `_${l4Year}` : ""}`;
  const frais = await storage.get<PicZR[]>(cacheKey, TTL_PICS);
  if (frais) return frais;

  try {
    const res = await apiFetch("/api/zr-pics", {
      method: "POST",
      body: JSON.stringify({
        birthDate: birth.birthDate,
        birthTime: birth.birthTime,
        latitude: birth.latitude,
        longitude: birth.longitude,
        timezone: birth.timezone,
        niveau,
        ...(niveau === 4 && l4Year ? { l4Year } : {}),
      }),
    });
    const data = await res.json();
    if (data?.success && Array.isArray(data.pics)) {
      await storage.setCache(cacheKey, data.pics);
      return data.pics as PicZR[];
    }
    throw new Error(data?.error ?? "reponse invalide");
  } catch (erreur) {
    // Le moteur n a pas repondu : une reponse perimee vaut mieux qu un arbre
    // sans fleurs — les pics d un theme ne changent pas d une visite a l autre.
    const perime = await storage.get<PicZR[]>(cacheKey);
    if (perime) return perime;
    throw erreur;
  }
}
