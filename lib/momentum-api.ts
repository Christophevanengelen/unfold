/**
 * Momentum Engine API client.
 * Wraps calls to Marie Ange's toctoc API via our proxy at /api/toctoc.
 * Uses IndexedDB-backed StorageService for persistent caching.
 * Results are deterministic per birth data (same input = same output).
 */

import { birthHash, type BirthData } from "./birth-data";
import { storage } from "./storage";
import { apiFetch } from "@/lib/api-client";

// ─── API Response Types ─────────────────────────────────────

/**
 * Un evenement de `months[].topEvents[]` du paquet toctoc-year.
 *
 * ── Ce qui arrive VRAIMENT (mesure du 02/09/2026, 109 evenements) ──────────
 * Sept clefs, toujours les memes : id, startDate, label, score, category,
 * aspect, exactDate.
 *
 * Les champs marques « JAMAIS RECU » ci-dessous sont declares depuis longtemps
 * et n arrivent pas. Ils ne provoquent aucune erreur — ils sont optionnels,
 * donc `undefined` se propage en silence et le code prend sa branche de repli
 * comme si c etait le cas normal. Trois defauts visibles en viennent :
 *
 *   lotType absent  -> inferDomain() retombe sur "work" : TOUTES les periodes
 *                      ZR sont etiquetees « travail ».
 *   periodStart/End -> les bornes reelles sont ignorees et les dates arrondies
 *                      au mois, alors que `startDate` est la, 109 fois sur 109.
 *
 * Ils sont conserves, pas supprimes : ils existent ailleurs dans le moteur
 * (sur `boudins[]`, qui porte 38 clefs). Mais ils ne doivent pas etre lus ICI
 * sans repli explicite.
 */
export interface ApiEvent {
  /** Identifiant de l evenement, "tt_15". Present 109/109.
   *  ATTENTION : il n est PAS resoluble par toctoc-boudin-detail, qui numerote
   *  un autre espace — mesure : {"error":"Boudin not found: tt_15",
   *  "availableIds":["tt_80",...],"totalSausages":1870}. */
  id: string;
  /** Debut reel de la fenetre, "2025-02-11". Present 109/109. */
  startDate?: string;
  label: string;
  score: number; // 1-4 (toc levels)
  category: "transit" | "zr" | "eclipse" | "station";
  aspect?: string;
  exactDate?: string;
  /** JAMAIS RECU sur topEvents (0/109). Les bornes reelles sont `startDate`. */
  periodStart?: string;
  /** JAMAIS RECU sur topEvents (0/109). */
  periodEnd?: string;
  /** JAMAIS RECU sur topEvents (0/109) — d ou le repli "work" pour tous les ZR. */
  lotType?: string; // "fortune" | "spirit" | "eros"
  level?: number;
  periodSign?: string;
  color?: string;
  cyclePassNumber?: number;
  cyclePasses?: number;
  eclipseAxis?: string;
  axisColor?: string;
  markers?: string[];
  isCulmination?: boolean;
}

export interface MonthData {
  month: string; // "YYYY-MM"
  totalScore: number;
  zrScore: number;
  transitScore: number;
  topEvents: ApiEvent[];
  isPast?: boolean;
  isCurrentMonth?: boolean;
  age?: number;
}

export interface YearData {
  year: number;
  sumScore: number;
  peakMonthScore: number;
  peakMonth: string;
  positiveMonths: number;
  negativeMonths: number;
  avgMonthScore?: number;
}

export interface TocTocYearResponse {
  success: boolean;
  data: {
    success: boolean;
    person: {
      name: string;
      birthDate: string;
      birthTime: string;
      city: string;
      timezone: string;
    };
    window: {
      startDate: string;
      endDate: string;
      years: number[];
      monthCount: number;
    };
    fortuneInfo: {
      sign: string;
      isDayChart: boolean;
      angularSigns: string[];
      natalSigns: Record<string, string>;
    };
    currentMonth: MonthData;
    peakUpcomingMonths: MonthData[];
    years: YearData[];
    months: MonthData[];
    computeTimeSeconds?: number;
  };
}

export interface SausageData {
  id: string;
  color: string;
  groupId: string;
  date?: string;
  startDate?: string; // sausages from toctoc-app use startDate
  endDate: string;
  score: number;
  label: string;
  category: string;
  type?: string;
  isPast: boolean;
  age: number;
  intensityScore: number;
  // Transit-specific
  transitPlanet?: string;
  natalPoint?: string;
  aspect?: string;
  parileDate?: string;
  windowStart?: string;
  windowEnd?: string;
  exactDates?: string[];
  pattern?: string;
  isVipTransit?: boolean;
  isReturn?: boolean;
  isHalfReturn?: boolean;
  bestOrb?: number;
  // ZR-specific
  lotType?: string | string[];
  level?: number;
  periodSign?: string;
  markers?: string[];
  isPeakPeriod?: boolean;
  isCulmination?: boolean;
  isLB?: boolean;
  isPreLB?: boolean;
  linkedLB?: { lbSign: string; lbStart: string; lbEnd: string } | null;
  linkedForeshadow?: { foreshadowSign: string; foreshadowStart: string; foreshadowEnd: string } | null;
  // Lifetime context (transits, stations, ZR, eclipses)
  lifetimeNumber?: number;
  lifetimeTotal?: number;
  allPeriods?: { date: string; endDate?: string; lifetimeNumber: number }[];
  // Eclipse-specific
  eclipseType?: string;
  eclipseAxis?: string;
  axisColor?: string;
  // Station-specific
  stationType?: string;
  // Sausage enrichment
  width?: "thin" | "medium" | "large";
  topics?: { house: number; color: string; label?: string }[];
  cycle?: { hitNumber: number; totalHits: number; pattern?: string; allHits: { date: string; hitNumber: number }[] };
}

/** Short boudin from toctoc-app-short — minimal fields for timeline rendering */
export interface ShortBoudinData {
  id: string;
  cat: string;         // category: transit|zr|eclipse|station
  s: string;           // startDate
  e?: string;          // endDate
  sc: number;          // score (1-4)
  w: string;           // width: thin|medium|large
  col: string;         // hex color
  lbl: string;         // label
  gid?: string;        // groupId
  asp?: string;        // aspect
  tp?: string;         // transitPlanet
  np?: string;         // natalPoint
  tc?: string[];       // topicColors (hex array)
  th?: number[];       // topicHouses (per-topic house numbers)
  past?: boolean;      // isPast
  nh?: number;         // natalHouse
  nhc?: string;        // natalHouseColor
  bid?: string;        // base boudin ID (before _h{n} suffix for multi-hit transits)
  cyc?: { h: number; t: number; all?: string[] }; // cycle: hitNumber/totalHits/allExactDates
  lotType?: string[];  // ZR lot types (deduplicated)
  lvl?: number;        // ZR level
  pSign?: string;      // ZR period sign
  pH?: number;         // ZR period house
  markers?: string[];  // ZR markers: "LB", "Cu", "pre-LB"
  isPeak?: boolean;    // ZR isPeakPeriod
  isCu?: boolean;      // ZR isCulmination
  isLB?: boolean;      // ZR Loosening of the Bond
  isPreLB?: boolean;   // ZR foreshadowing period
  lnkLB?: { lbSign: string; lbStart: string; lbEnd: string } | null;          // linkedLB
  lnkFS?: { foreshadowSign: string; foreshadowStart: string; foreshadowEnd: string } | null; // linkedForeshadow
  ltNum?: number;      // lifetimeNumber
  ltTot?: number;      // lifetimeTotal
  allP?: { date: string; endDate?: string; lifetimeNumber: number }[];  // allPeriods
  eType?: string;      // eclipse type
  eSign?: string;      // eclipse sign
  eHouses?: number[];  // eclipse axis houses
  stType?: string;     // station type SR|SD
}

export interface TocTocAppResponse {
  success: boolean;
  data: {
    success: boolean;
    person: {
      name: string;
      birthDate: string;
      birthTime: string;
    };
    natalContext: Record<
      string,
      {
        houseLocated: number;
        housesRuled: number[];
        topics: { house: number; color: string }[];
      }
    >;
    houseColors: Record<string, string>;
    allSausages: SausageData[];
    months: Record<string, { sausages: SausageData[]; monthScore: number }>;
    cycles: Record<string, SausageData[]>;
  };
}

/** Response from toctoc-app-short — lightweight boudin data for timeline */
export interface TocTocAppShortResponse {
  success: boolean;
  data: {
    success: boolean;
    person: {
      name: string;
      birthDate: string;
      birthTime: string;
    };
    houseColors: Record<string, string>;
    boudins: ShortBoudinData[];
    total: number;
    computeTimeSeconds: number;
  };
}

// ─── Cache (IndexedDB-backed) ───────────────────────────────

// ─── API Calls ──────────────────────────────────────────────

const API_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";
const ALLOWED_ENDPOINTS = [
  "toctoc",
  "toctoc-app",
  "toctoc-app-short",
  "toctoc-year",
  "toctoc-timeline",
  "toctoc-highlights",
];

/**
 * Dual-mode API caller:
 * - Dev (Next.js server running): uses /api/toctoc proxy (avoids CORS)
 * - Static export / Capacitor: calls external API directly
 */
/**
 * Le seul transport autorise vers le moteur.
 *
 * Il existe parce que l origine native est `capacitor://localhost` : une route
 * `/api/*` n y existe pas, le build statique n embarque aucun serveur Next.js.
 * Tout appel qui court-circuite cette fonction marche en dev et meurt en
 * production, sans erreur visible. C est ce qui a garde `fetchHighlights` mort.
 */
export async function callProxy(
  endpoint: string,
  birth: BirthData
): Promise<unknown> {
  if (!ALLOWED_ENDPOINTS.includes(endpoint)) {
    throw new Error(`Invalid endpoint: ${endpoint}`);
  }

  const payload = {
    birthDate: birth.birthDate,
    birthTime: birth.birthTime,
    latitude: birth.latitude,
    longitude: birth.longitude,
    timezone: birth.timezone,
  };

  // Static export / Capacitor mode: call external API directly
  const useDirectApi =
    process.env.NEXT_PUBLIC_API_MODE === "direct" ||
    typeof window !== "undefined" && "Capacitor" in window;

  if (useDirectApi) {
    const res = await fetch(`${API_BASE}/${endpoint}.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return res.json();
  }

  // Dev mode: use Next.js proxy (handles CORS)
  const res = await apiFetch("/api/toctoc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint, ...payload }),
  });
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

/**
 * Combien de temps on garde une reponse du moteur.
 *
 * L appel n envoie AUCUNE date : uniquement les donnees de naissance. La
 * reponse ne depend donc que du theme, et le passe / en cours / a venir est
 * recalcule localement a chaque affichage (voir momentum-adapter.ts). Le TTL de
 * 24 heures qui s appliquait ne protegeait donc de rien : il redemandait chaque
 * jour un calcul identique.
 *
 * Ce qui bouge quand meme : le moteur centre sa fenetre sur SA date du jour.
 * Une reponse « annee » couvre trois ans autour d aujourd hui, donc sa bordure
 * se decale avec le temps. Un mois de decalage sur trois ans de couverture ne
 * se voit pas ; un an, si. D ou deux durees differentes.
 *
 * La vie entiere, elle, ne bouge pas : c est le theme d une personne, du debut
 * a la fin.
 *
 * L enjeu n est pas seulement d epargner le serveur de Marie-Ange. Chaque appel
 * evite est une occasion de moins de tomber sur une panne : le moteur est un
 * service tiers, et l ecran d echec ne devrait se voir qu au tout premier
 * lancement.
 */
const TTL_ANNEE = 30 * 24 * 60 * 60 * 1000;
const TTL_VIE = 365 * 24 * 60 * 60 * 1000;

/** Fast 3-year window (2-10s). Use for initial load. */
export async function fetchYearData(
  birth: BirthData
): Promise<TocTocYearResponse> {
  const cacheKey = `unfold_year_${birthHash(birth)}`;
  const frais = await storage.get<TocTocYearResponse>(cacheKey, TTL_ANNEE);
  if (frais) return frais;

  try {
    const data = (await callProxy("toctoc-year", birth)) as TocTocYearResponse;
    if (data?.success || data?.data?.success) {
      await storage.setCache(cacheKey, data);
    }
    return data;
  } catch (erreur) {
    // Le moteur n a pas repondu. Une reponse d il y a six mois vaut infiniment
    // mieux qu un ecran vide : les periodes n ont pas change, seule la bordure
    // de la fenetre a bouge. On ne montre l echec que si on n a jamais rien eu.
    const perime = await storage.get<TocTocYearResponse>(cacheKey);
    if (perime) return perime;
    throw erreur;
  }
}

/** Full lifetime boudins (~475 KB via toctoc-app-short). Use for background enrichment. */
export async function fetchAppData(
  birth: BirthData
): Promise<TocTocAppShortResponse> {
  const cacheKey = `unfold_app_short_v2_${birthHash(birth)}`;
  const frais = await storage.get<TocTocAppShortResponse>(cacheKey, TTL_VIE);
  if (frais) return frais;

  try {
    const data = (await callProxy("toctoc-app-short", birth)) as TocTocAppShortResponse;
    if (data?.success || data?.data?.success) {
      await storage.setCache(cacheKey, data);
    }
    return data;
  } catch (erreur) {
    const perime = await storage.get<TocTocAppShortResponse>(cacheKey);
    if (perime) return perime;
    throw erreur;
  }
}
