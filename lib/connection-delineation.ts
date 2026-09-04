/**
 * Connection Delineation — client-side LLM pipeline.
 * Sends one ActivePeriod's raw data to /api/openai/connection-delineation
 * and returns structured French prose for the compatibility UI.
 *
 * Cache: IndexedDB, 7-day TTL (transits don't change day to day).
 */

import { storage } from "@/lib/storage";
import type { ActivePeriod, PersonFocus, RawEvent } from "@/lib/connection-brief-api";
import type { RelationshipType } from "@/lib/matching-narratives";
import { apiFetch } from "@/lib/api-client";
import { detectLocale } from "@/lib/i18n-demo";

// ─── Types ────────────────────────────────────────────────

/**
 * Lecture par personne, découpée par technique.
 * `annee` est obligatoire ; eclipse / passage / fond sont null si absents
 * des données — le modèle ne doit pas inventer.
 */
export interface PersonDelineation {
  titre: string;
  /** Profection : le domaine ouvert pour TOUTE l'année. */
  annee: string;
  /** Eclipse + axe, seulement si un événement eclipse est dans `pistes`. */
  eclipse: string | null;
  /** Transit / station principal du mois, seulement si présent. */
  passage: string | null;
  /** Chapitre de fond (ZR) seulement si marqueur Cu/LB ou seul signal utile. */
  fond: string | null;
  /** Point dur vécu — pour l'empathie de l'autre. */
  defi: string;
  tempo?: "lent" | "moyen" | "rapide";
}

export interface EnsembleDelineation {
  titre: string;
  /** Comparaison des deux années (profections). */
  annees: string;
  /** Comparaison des axes d'éclipse si l'un ou l'autre en a. */
  eclipses: string | null;
  /** Comparaison des passages du mois. */
  passages: string | null;
  /** Ce que chacun doit comprendre du cycle de l'autre. */
  empathie: string;
  aFaireEnsemble: string;
}

/** @deprecated Conservé pour lectures v3 encore en cache local avant v8. */
export type LegacyPersonFlat = {
  titre: string;
  corps: string;
  defi: string;
  tempo?: "lent" | "moyen" | "rapide";
};

/** Le serveur a repondu 402 : la fonctionnalite demande le plan payant. */
export interface MurPayant { murPayant: true; feature?: string }
export function estMurPayant(r: unknown): r is MurPayant {
  return !!r && typeof r === "object" && (r as MurPayant).murPayant === true;
}

/** Le moteur (ou le modele) dit qu il n y a rien a dire ce mois-ci. */
export interface SilenceDelineation { silence: true }
export function estSilence(r: unknown): r is SilenceDelineation {
  return !!r && typeof r === "object" && (r as SilenceDelineation).silence === true
    && !("personA" in (r as object));
}

export interface ConnectionDelineation {
  personA: PersonDelineation;
  personB: PersonDelineation;
  ensemble: EnsembleDelineation;
}

export type DelineationResult = ConnectionDelineation | SilenceDelineation | MurPayant | null;

export function estLectureStructuree(r: unknown): r is ConnectionDelineation {
  if (!r || typeof r !== "object") return false;
  const d = r as ConnectionDelineation;
  return !!(
    d.personA?.annee &&
    d.personB?.annee &&
    d.ensemble?.annees &&
    d.ensemble?.empathie &&
    d.ensemble?.aFaireEnsemble
  );
}

// ─── Cache config ──────────────────────────────────────────

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
/** v8 : lecture par technique (année / eclipse / passage) + empathie croisée. */
const CACHE_VERSION = "v8";

function cacheKey(
  birthDateA: string,
  birthDateB: string,
  relationship: string,
  monthKey: string,
): string {
  return `connection_delineation_${CACHE_VERSION}_${birthDateA}_${birthDateB}_${relationship}_${monthKey}`;
}

// ─── Technique picks (ce que le modèle doit écrire, pas inventer) ──

function scoreEvent(e: RawEvent): number {
  return typeof e.score === "number" ? e.score : 0;
}

function pickBest(events: RawEvent[], pred: (e: RawEvent) => boolean): RawEvent | null {
  const hits = events.filter(pred).sort((a, b) => scoreEvent(b) - scoreEvent(a));
  return hits[0] ?? null;
}

/**
 * Extrait les pistes à écrire pour UNE personne.
 * Empêche le modèle de tout ramener au ZR permanent (« période majeure »).
 */
export function pistesTechniques(focus: PersonFocus) {
  const events = focus.rawData?.events ?? [];
  const profection = focus.rawData?.profection ?? {
    house: focus.profectionHouse,
    houseName: focus.profectionTheme ?? focus.dominantDomains?.[0],
    annualTheme: undefined as string | undefined,
  };

  const eclipse = pickBest(events, (e) => e.category === "eclipse");
  const transit = pickBest(
    events,
    (e) => e.category === "transit" || e.category === "station",
  );
  // Fond de chapitre : seulement un pic / une fin, sinon le ZR le plus fort
  // mais marqué comme décor (pas comme « ce mois »).
  const fondMarque = pickBest(
    events,
    (e) =>
      e.category === "zr" &&
      Array.isArray(e.markers) &&
      e.markers.some((m) => m === "Cu" || m === "LB" || m === "pre-LB"),
  );
  const fondZr = fondMarque ?? pickBest(events, (e) => e.category === "zr");

  return {
    annee: {
      house: profection.house ?? focus.profectionHouse ?? null,
      houseName: profection.houseName ?? focus.profectionTheme ?? null,
      annualTheme: profection.annualTheme ?? null,
    },
    eclipse: eclipse
      ? {
          label: eclipse.label,
          houses: eclipse.houses ?? [],
          axis: eclipse.eclipseAxis ?? null,
          seriesId: eclipse.eclipseSeriesId ?? null,
          startDate: eclipse.startDate ?? eclipse.date ?? null,
          endDate: eclipse.endDate ?? null,
          score: eclipse.score,
        }
      : null,
    passage: transit
      ? {
          label: transit.label,
          category: transit.category,
          aspect: transit.aspect,
          houses: transit.houses ?? [],
          startDate: transit.startDate ?? transit.date ?? null,
          endDate: transit.endDate ?? null,
          cycle: transit.cycle ?? null,
          score: transit.score,
        }
      : null,
    fond: fondZr
      ? {
          label: fondZr.label,
          houses: fondZr.houses ?? [],
          markers: fondZr.markers ?? [],
          lotType: fondZr.lotType ?? null,
          level: fondZr.level ?? null,
          periodSign: fondZr.periodSign ?? null,
          startDate: fondZr.startDate ?? null,
          endDate: fondZr.endDate ?? null,
          score: fondZr.score,
          /** true = pic/fin ; false = décor permanent, ne pas dramatiser. */
          estPicOuFin: !!(fondMarque),
        }
      : null,
    monthScore: focus.rawData?.monthScore ?? null,
  };
}

// ─── Main function ────────────────────────────────────────

interface PersonIdentity {
  birthDate: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
}

type PersonArg = string | PersonIdentity;

function toIdentity(arg: PersonArg): PersonIdentity {
  return typeof arg === "string" ? { birthDate: arg } : arg;
}

function tempoIncoherent(
  del: ConnectionDelineation,
  comparaison: ActivePeriod["comparaison"],
): boolean {
  if (!comparaison?.tempo) return false;
  const a = del.personA.tempo;
  const b = del.personB.tempo;
  if (a && a !== comparaison.tempo.A) return true;
  if (b && b !== comparaison.tempo.B) return true;
  return false;
}

/** Même texte pour A et B = lecture générique — on jette. */
function textesIdentiques(del: ConnectionDelineation): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  if (norm(del.personA.annee) === norm(del.personB.annee)) return true;
  if (norm(del.personA.defi) === norm(del.personB.defi)) return true;
  return false;
}

export async function getConnectionDelineation(
  period: ActivePeriod,
  relationship: RelationshipType,
  personAArg: PersonArg,
  personBArg: PersonArg,
): Promise<DelineationResult> {
  const idA = toIdentity(personAArg);
  const idB = toIdentity(personBArg);
  const key = cacheKey(idA.birthDate, idB.birthDate, relationship, period.monthKey);

  const cached = await storage.get<ConnectionDelineation | SilenceDelineation>(key, CACHE_TTL_MS);
  if (cached) {
    if (estSilence(cached)) return cached;
    if (estLectureStructuree(cached)) return cached;
    // Ancien format v7 en cache : on ignore et on recalcule.
  }

  if (period.comparaison?.silence === true) {
    const silent: SilenceDelineation = { silence: true };
    await storage.set(key, silent);
    return silent;
  }

  const buildPersonPayload = (focus: PersonFocus, id: PersonIdentity) => ({
    birthDate: id.birthDate,
    birthTime: id.birthTime,
    latitude: id.latitude,
    longitude: id.longitude,
    // Pistes déjà triées : le modèle écrit à partir de ça, pas de la liste brute.
    pistes: pistesTechniques(focus),
    // Events complets en secours (dates, marqueurs) — ne pas tout lister dans le texte.
    events: focus.rawData?.events ?? [],
    primarySignal: focus.primarySignal,
  });

  const payload = {
    relationship,
    monthKey: period.monthKey,
    tier: period.tier,
    aujourdhui: new Date().toISOString().slice(0, 10),
    comparaison: period.comparaison ?? null,
    personA: buildPersonPayload(period.personAFocus, idA),
    personB: buildPersonPayload(period.personBFocus, idB),
  };

  try {
    const res = await apiFetch("/api/openai/connection-delineation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, locale: detectLocale() }),
    });

    if (res.status === 402) {
      let feature: string | undefined;
      try { feature = ((await res.json()) as { feature?: string }).feature; } catch {}
      return { murPayant: true, feature };
    }
    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") console.error("[connection-delineation] HTTP", res.status);
      return null;
    }

    const raw = await res.json() as ConnectionDelineation | SilenceDelineation;

    if (estSilence(raw)) {
      await storage.set(key, raw);
      return raw;
    }

    if (!estLectureStructuree(raw)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[connection-delineation] schéma v8 incomplet — reponse jetee");
      }
      return null;
    }

    if (tempoIncoherent(raw, period.comparaison) || textesIdentiques(raw)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[connection-delineation] tempo ou textes identiques — reponse jetee");
      }
      return null;
    }

    await storage.set(key, raw);
    return raw;
  } catch (err) {
    console.error("[connection-delineation] Failed:", err);
    return null;
  }
}
