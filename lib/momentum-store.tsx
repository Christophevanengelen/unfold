"use client";

/**
 * MomentumProvider — React Context with SWR caching.
 *
 * Pattern: Stale-While-Revalidate
 * 1. Mount → read cached phases from localStorage (instant, sync)
 * 2. Display cached data immediately (stale)
 * 3. Background → fetch fresh data from API (revalidate)
 * 4. On success → update UI + write to cache (IndexedDB + localStorage)
 * 5. On error → keep showing stale data
 *
 * Sources: swr.vercel.app, RFC 5861
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { getBirthData, getBirthDataSync, saveBirthData, birthHash, type BirthData } from "@/lib/birth-data";
import { migrateFromLocalStorage, storage } from "@/lib/storage";
import { fetchYearData, fetchAppData } from "@/lib/momentum-api";
import { yearDataToPhases, appDataToPhases } from "@/lib/momentum-adapter";
import { syncConnections, getMyInviteCode } from "@/lib/connections-store";
import { upsertProfile } from "@/lib/supabase-store";
import type { MomentumPhase } from "@/types/momentum";
import { deposerPourWidget, deposerBascules } from "@/lib/widget";

// ─── Cache layer — dual-write (IndexedDB + localStorage) ──────

// Les caches d affichage portent desormais l empreinte de la naissance.
//
// Ils etaient globaux et rien ne les invalidait jamais. Apres avoir corrige sa
// date, la personne revoyait donc les phases de l ANCIENNE date pendant tout le
// recalcul — et definitivement si le moteur echouait, puisque le repli les
// resservait. « Je modifie, rien ne change » : c est exactement ce qui etait
// decrit.
//
// L empreinte couvre date + heure + latitude + longitude, donc corriger sa
// seule heure de naissance change aussi la clef.
const CACHE_YEAR_BASE = "unfold_cache_year_phases_v5";
const CACHE_LIFETIME_BASE = "unfold_cache_lifetime_phases_v5";
const cleAnnee = (b: BirthData | null) => `${CACHE_YEAR_BASE}_${b ? birthHash(b) : "vide"}`;
const cleViager = (b: BirthData | null) => `${CACHE_LIFETIME_BASE}_${b ? birthHash(b) : "vide"}`;

function readSync(key: string): MomentumPhase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persist(key: string, data: MomentumPhase[]) {
  storage.setPersistent(key, data).catch(() => {});
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
}

// ─── SWR fetchers ────────────────────────────────────────────

async function fetchYear(bd: BirthData): Promise<MomentumPhase[]> {
  const res = await fetchYearData(bd);
  if (!res?.data?.success) throw new Error("Year API failed");
  const phases = yearDataToPhases(res);
  // Zero phase n est PAS une panne. On levait ici « No signals found », et
  // l ecran affichait « connexion perdue » alors que le moteur avait repondu :
  // il n avait simplement rien a dire sur la fenetre. La regle du produit est
  // que le silence est une fonctionnalite (REPORTING-REGLES.md). On rend une
  // liste vide — et on ne la met PAS en cache : trente jours de vide seraient
  // une vraie panne, silencieuse celle-la.
  if (phases.length === 0) return phases;
  persist(cleAnnee(bd), phases);
  // Le widget iOS lit un resume depose ici. Ce sont les phases de l annee qui
  // l alimentent et non celles de la vie entiere : le widget ne montre que la
  // periode en cours et la suivante, et celles-la arrivent en deux secondes au
  // lieu de deux minutes.
  void deposerPourWidget(phases);
  // Les dates de bascule partent au meme moment : elles decoulent des memes
  // phases, et le cron n aura plus a rappeler le moteur pour les retrouver.
  void deposerBascules(phases);
  return phases;
}

async function fetchLifetime(bd: BirthData): Promise<MomentumPhase[]> {
  const res = await fetchAppData(bd);
  const phases = appDataToPhases(res);
  if (phases.length > 0) {
    persist(cleViager(bd), phases);
    console.log("[Momentum] Lifetime cached:", phases.length, "phases");
  }
  return phases;
}

// ─── Context ──────────────────────────────────────────────────

type LoadState = "idle" | "loading" | "ready" | "error";

interface MomentumContextValue {
  phases: MomentumPhase[];
  timelinePhases: MomentumPhase[];
  state: LoadState;
  error: string | null;
  isLive: boolean;
  isLoadingLifetime: boolean;
  birthData: BirthData | null;
  birthDateStr: string;
  needsOnboarding: boolean;
  /** Redemander le calcul apres un echec du moteur. */
  reessayer: () => void;
  loadSignals: (birth?: BirthData) => Promise<void>;
}

const MomentumContext = createContext<MomentumContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export function MomentumProvider({ children }: { children: ReactNode }) {
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Resolve birth data on mount
  useEffect(() => {
    (async () => {
      await migrateFromLocalStorage();
      const bd = await getBirthData();
      if (bd) {
        setBirthData(bd);
        // Fire-and-forget Supabase syncs on mount — never block UI.
        // 1) Push local birth data (profile upsert is idempotent; catches the
        //    case where early-onboarded users never made it to the server).
        // 2) Ensure our own invite code is registered server-side.
        // 3) Pull any remote connections into local cache (cross-device merge).
        upsertProfile(bd).catch(() => {});
        try { getMyInviteCode(); } catch { /* only runs in the browser */ }
        syncConnections().catch(() => {});
      } else {
        setNeedsOnboarding(true);
      }
      setMounted(true);
    })();
  }, []);

  // SWR: year phases (fast, 2-5s)
  const {
    data: yearPhases,
    error: yearError,
    isValidating: isLoadingYear,
    mutate: rechargerAnnee,
  } = useSWR(
    // L empreinte, pas la date seule : le resultat du moteur depend aussi de
    // l heure et du lieu. Avec la date seule, corriger son heure de naissance
    // ne declenchait AUCUNE revalidation.
    birthData ? ["year-phases", birthHash(birthData)] : null,
    () => fetchYear(birthData!),
    {
      fallbackData: readSync(cleAnnee(birthData)),
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60_000, // don't refetch within 1 min
    }
  );

  // SWR: lifetime phases (slow, 30-120s)
  const {
    data: lifetimePhases,
    isValidating: isLoadingLifetime,
  } = useSWR(
    birthData ? ["lifetime-phases", birthHash(birthData)] : null,
    () => fetchLifetime(birthData!),
    {
      fallbackData: readSync(cleViager(birthData)),
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300_000, // don't refetch within 5 min
    }
  );

  const phases = yearPhases ?? readSync(cleAnnee(birthData));
  const timelinePhases = lifetimePhases ?? readSync(cleViager(birthData));

  const state: LoadState = yearError
    ? "error"
    : (!mounted || (isLoadingYear && phases.length === 0))
      ? "loading"
      : "ready";

  const isLive = phases.length > 0;
  const birthDateStr = birthData?.birthDate || "";

  // Manual trigger for onboarding flow
  const loadSignals = useCallback(async (birth?: BirthData) => {
    const bd = birth || (await getBirthData()) || getBirthDataSync();
    if (!bd) {
      setNeedsOnboarding(true);
      return;
    }
    if (birth) await saveBirthData(bd);
    setBirthData(bd);
    setNeedsOnboarding(false);
  }, []);

  const errorMsg = yearError?.message ?? null;

  /**
   * Redemander le calcul apres un echec.
   *
   * Le moteur est un service tiers ; il tombe, il est lent, il repond mal. Sans
   * ce bouton, une panne passagere condamnait l ecran jusqu au redemarrage de
   * l app — et le testeur d Apple, lui, ne redemarre pas : il conclut que
   * l app est vide.
   */
  const reessayer = useCallback(() => {
    void rechargerAnnee();
  }, [rechargerAnnee]);

  const value = useMemo<MomentumContextValue>(() => ({
    phases,
    timelinePhases,
    state,
    error: errorMsg,
    isLive,
    isLoadingLifetime,
    birthData,
    birthDateStr,
    needsOnboarding,
    loadSignals,
    reessayer,
  }), [phases, timelinePhases, state, errorMsg, isLive, isLoadingLifetime, birthData, birthDateStr, needsOnboarding, loadSignals, reessayer]);

  return (
    <MomentumContext.Provider value={value}>
      {children}
    </MomentumContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────

export function useMomentum(): MomentumContextValue {
  const ctx = useContext(MomentumContext);
  if (!ctx) {
    throw new Error("useMomentum must be used within <MomentumProvider>");
  }
  return ctx;
}
