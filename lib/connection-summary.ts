/**
 * Connection summary — condenses a full ConnectionBriefResult into the
 * "what's happening now / soon / later" shape rendered in the list row.
 *
 * Pure function — no network, no caching. Feed it the brief, get a summary.
 * The brief itself comes from `fetchConnectionBrief()`, which already has
 * L1 (IndexedDB) + L2 (Supabase connection_cache) caching — so calling this
 * per-connection on the list is fast on warm cache.
 */

import { perso } from "@/lib/perso-i18n";
import type { Locale } from "@/lib/i18n-demo";
import type { ConnectionBriefResult, ActivePeriod } from "@/lib/connection-brief-api";
import type { MatchingWindow } from "@/lib/matching-narratives";

/**
 * « inconnu » n est PAS « calme ».
 *
 * extractSummary(null) renvoyait « calme ce mois » — donc une panne reseau, un
 * moteur qui ne repond pas ou un rejet de requete s affichaient comme une
 * LECTURE ASTROLOGIQUE : « c est calme entre vous ce mois-ci ». La personne
 * range l information, et elle est fausse.
 *
 * Un echec doit se dire comme un echec. Le quatrieme etat existe pour ça.
 */
export type SummaryStatus = "active" | "upcoming" | "calm" | "unknown";
export type SummaryTier = "PEAK" | "CLEAR" | "SUBTLE";

export interface ConnectionSummary {
  /** Tier of the currently-active window, or null if nothing active this month. */
  currentTier: SummaryTier | null;
  /** Color tinted for the current tier (UI ring). "transparent" when calm. */
  currentTierColor: string;
  /** Month of the next window in the future (YYYY-MM), or null if none. */
  nextWindowMonthKey: string | null;
  /** Tier of the next window. */
  nextWindowTier: SummaryTier | null;
  /** Days until the next future window starts. null when nothing upcoming. */
  daysUntilNext: number | null;
  /** Bucket used to order the list. */
  status: SummaryStatus;
  /** Planet that best represents the active/nearest window (for the micro-preview dot). */
  planet?: string;
  /** Headline rendered as the 1-line micro-preview on the row (FR). */
  headlineFR: string;
  /** Ordering score — higher = higher in list. Combines status bucket + tier. */
  sortScore: number;
}

const TIER_WEIGHT: Record<SummaryTier, number> = { PEAK: 3, CLEAR: 2, SUBTLE: 1 };
// « unknown » passe APRES « calm » au tri : une connexion dont on ignore l etat
// ne doit pas remonter devant celles qu on sait calmes, mais elle ne doit pas
// non plus disparaitre — la personne doit voir qu il manque quelque chose.
const STATUS_WEIGHT: Record<SummaryStatus, number> = { active: 300, upcoming: 150, calm: 0, unknown: -10 };

const MONTH_SHORT_FR = [
  "jan", "fév", "mar", "avr", "mai", "juin",
  "jul", "aoû", "sep", "oct", "nov", "déc",
];

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** "2026-03" → "en mar". null quand la cle n est pas un mois lisible. */
function moisCourt(monthKey: string | null, locale: Locale): string | null {
  if (!monthKey) return null;
  const [a, m] = monthKey.split("-").map(Number);
  if (!Number.isFinite(m) || m < 1 || m > 12) return null;
  // Le nom du mois vient d Intl, pas d une table francaise : « en mar » se
  // lisait « en mar » en japonais comme en arabe.
  const nom = new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(Date.UTC(a || 2026, m - 1, 1)));
  return perso("compat.q_en_mois", locale).replace("{mois}", nom);
}

// Une cle absente de la table passait par capitalize() et s affichait quand
// meme comme un nom de planete : « Mc », « Chiron-a »… La ligne annonçait alors
// un corps celeste que le moteur n a pas nomme. On renvoie "" — le titre se lit
// tres bien sans le suffixe « · planete ».
// Le suffixe « · Saturne », « · Chapitre ZR » nommait la technique sous chaque
// connexion — ce que les regles du produit interdisent, et ce qui n existait
// qu en francais. La ligne dit ce qui se passe, jamais par quel rouage.


function headline({
  status,
  tier,
  daysUntilNext,
  nextWindowMonthKey,
  locale,
}: {
  status: SummaryStatus;
  tier: SummaryTier | null;
  daysUntilNext: number | null;
  nextWindowMonthKey: string | null;
  locale: Locale;
}): string {
  if (status === "active") {
    return perso(
      tier === "PEAK" ? "compat.forte_maintenant"
        : tier === "CLEAR" ? "compat.accord_clair"
          : "compat.accord_subtil",
      locale,
    );
  }
  if (status === "upcoming" && daysUntilNext !== null) {
    const when =
      daysUntilNext <= 0 ? perso("compat.q_aujourdhui", locale)
        : daysUntilNext === 1 ? perso("compat.q_demain", locale)
          : daysUntilNext <= 14 ? perso("compat.q_dans_j", locale).replace("{n}", String(daysUntilNext))
            // MONTH_SHORT_FR[m - 1] rendait « en undefined » quand le monthKey
            // n etait pas lisible : un mois invente, affiche comme une date de
            // fenetre. On retombe sur le compte de jours, qui lui est mesure.
            : (moisCourt(nextWindowMonthKey, locale) ?? perso("compat.q_dans_j", locale).replace("{n}", String(daysUntilNext)));
    return perso(
      tier === "PEAK" ? "compat.forte_quand"
        : tier === "CLEAR" ? "compat.accord_clair_quand"
          : "compat.accord_quand",
      locale,
    ).replace("{quand}", when);
  }
  // Le retour par defaut disait « Calme ce mois » — y compris pour un statut
  // « upcoming » dont on ignore l echeance. On n annonçait pas le calme, on le
  // deduisait d une donnee manquante. Seul le vrai calme le dit.
  if (status === "calm") return perso("compat.calme_mois", locale);
  return perso("compat.signal_indispo", locale);
}

function planetOfPeriod(period: ActivePeriod | undefined): string | undefined {
  if (!period) return undefined;
  // Prefer the higher-scoring of the two people's primary signals
  const a = period.personAFocus?.primarySignal;
  const b = period.personBFocus?.primarySignal;
  const pick =
    !a ? b
      : !b ? a
        : (a.score ?? 0) >= (b.score ?? 0) ? a : b;
  if (!pick) return undefined;
  const raw = String(pick.planetOrType ?? "").trim();
  if (!raw) return undefined;
  if (pick.category === "eclipse") {
    return raw.toLowerCase().includes("solar") ? "solar-eclipse" : "lunar-eclipse";
  }
  // ZR signals don't map to a planet — use the category label instead.
  if (pick.category === "zr") return "zr";
  return raw
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Extract the list-row summary from a full brief result.
 * `today` param lets tests lock the date; default = now.
 */
export function extractSummary(
  result: ConnectionBriefResult | null | undefined,
  today: Date = new Date(),
  locale: Locale = "fr",
): ConnectionSummary {
  if (!result || result.periods.length === 0) {
    return {
      currentTier: null,
      currentTierColor: "transparent",
      nextWindowMonthKey: null,
      nextWindowTier: null,
      daysUntilNext: null,
      // Voir SummaryStatus : sans donnees, on ne sait pas — on ne declare pas
      // le calme.
      status: "unknown",
      headlineFR: perso("compat.signal_indispo", locale),
      // sortScore valait 0, soit exactement STATUS_WEIGHT.calm : l intention
      // ecrite juste au-dessus — « unknown » passe APRES « calm » — n etait pas
      // appliquee, et une connexion sans donnees se melait aux calmes.
      sortScore: STATUS_WEIGHT.unknown,
    };
  }

  const currentWindow: MatchingWindow | undefined = result.windows.find((w) => w.status === "active");
  const currentPeriod = currentWindow
    ? result.periods.find((p) => p.monthKey === currentWindow.monthKey)
    : undefined;

  const upcomingWindow = result.windows.find((w) => w.status === "upcoming");
  const upcomingPeriod = upcomingWindow
    ? result.periods.find((p) => p.monthKey === upcomingWindow.monthKey)
    : undefined;

  // Active path
  if (currentWindow) {
    const tier = currentWindow.tier as SummaryTier;
    const planet = planetOfPeriod(currentPeriod);
    return {
      currentTier: tier,
      currentTierColor: currentWindow.tierColor,
      nextWindowMonthKey: upcomingWindow?.monthKey ?? null,
      nextWindowTier: (upcomingWindow?.tier as SummaryTier) ?? null,
      daysUntilNext: upcomingWindow?.daysLeft ?? null,
      status: "active",
      planet,
      headlineFR: headline({
        status: "active",
        tier,
        daysUntilNext: null,
        nextWindowMonthKey: null,
        locale,
      }),
      sortScore: STATUS_WEIGHT.active + TIER_WEIGHT[tier] * 10 + (currentPeriod?.tierScore ?? 0),
    };
  }

  // Upcoming path (< 30 days)
  if (upcomingWindow && upcomingWindow.daysLeft <= 30) {
    const tier = upcomingWindow.tier as SummaryTier;
    const planet = planetOfPeriod(upcomingPeriod);
    return {
      currentTier: null,
      currentTierColor: upcomingWindow.tierColor,
      nextWindowMonthKey: upcomingWindow.monthKey,
      nextWindowTier: tier,
      daysUntilNext: upcomingWindow.daysLeft,
      status: "upcoming",
      planet,
      headlineFR: headline({
        status: "upcoming",
        tier,
        daysUntilNext: upcomingWindow.daysLeft,
        nextWindowMonthKey: upcomingWindow.monthKey,
        locale,
      }),
      sortScore: STATUS_WEIGHT.upcoming + TIER_WEIGHT[tier] * 10 + (upcomingPeriod?.tierScore ?? 0),
    };
  }

  // Anything beyond 30 days = calm
  const firstFuture = result.windows.find(
    (w) => w.status === "upcoming" || w.status === "active",
  );
  const firstFuturePeriod = firstFuture
    ? result.periods.find((p) => p.monthKey === firstFuture.monthKey)
    : undefined;
  const planet = planetOfPeriod(firstFuturePeriod);
  return {
    currentTier: null,
    currentTierColor: "transparent",
    nextWindowMonthKey: firstFuture?.monthKey ?? null,
    nextWindowTier: (firstFuture?.tier as SummaryTier) ?? null,
    daysUntilNext: firstFuture?.daysLeft ?? null,
    status: "calm",
    planet,
    headlineFR: perso("compat.calme_mois", locale),
    sortScore: STATUS_WEIGHT.calm,
  };
  // Silence unused param lint (reserved for future server-side TTL logic)
  void today;
}
