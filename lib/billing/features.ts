/**
 * Billing features definitions — single source of truth shared between
 * client (UI gates / paywall copy) and server (enforcement).
 *
 * Mental model:
 *   PAST + PRESENT  → free for all
 *   FUTURE          → paywalled
 *   MATCHING        → free unlimited (viral growth loop)
 *   AI delineation  → 1/week free, unlimited paid
 *   Daily brief     → paid only
 *   Peak alerts     → paid only
 *
 * Family plan deferred to Phase 2 (Apple Family Sharing collision).
 */

export type Plan = "free" | "premium";

export type FeatureKey =
  /** Future capsules (date > today). Paid only. */
  | "FUTURE_CAPSULES"
  /** AI delineation calls (own or partner). 1/week free, unlimited paid. */
  | "AI_DELINEATION"
  /** Daily briefing notification + screen. Paid only. */
  | "DAILY_BRIEFING"
  /** Push notification when a peak window opens. Paid only. */
  | "PEAK_ALERTS"
  /** Weekly digest email. Paid only. */
  | "WEEKLY_DIGEST"
  /** Connection (matching) creation. Free unlimited. */
  | "MATCHING_CONNECTION";

export interface FeatureSpec {
  /** Free-tier quota per period, or 0 if entirely paid. -1 = unlimited free. */
  freeQuota: number;
  /** "week" | "month" | undefined (one-shot). */
  period?: "week" | "month";
  /** Pretty label for paywall copy. */
  label: string;
}

export const FEATURES: Record<FeatureKey, FeatureSpec> = {
  FUTURE_CAPSULES: {
    freeQuota: 0,
    label: "Capsules futures",
  },
  AI_DELINEATION: {
    freeQuota: 1,
    period: "week",
    label: "Délinéation IA",
  },
  DAILY_BRIEFING: {
    freeQuota: 0,
    label: "Briefing quotidien",
  },
  PEAK_ALERTS: {
    freeQuota: 0,
    label: "Alertes de pic",
  },
  WEEKLY_DIGEST: {
    freeQuota: 0,
    label: "Digest hebdomadaire",
  },
  MATCHING_CONNECTION: {
    freeQuota: -1,                 // unlimited free
    label: "Connexions",
  },
};

/** Plans available for purchase. Family plan deferred Phase 2. */
export const PLANS = {
  // Prix decides le 31 aout 2026 apres analyse de marche : 5,99 €/mois,
  // 39,99 €/an, essai de sept jours. Le code portait encore 9,99 / 89, ce que
  // le site affichait a tout le monde.
  //
  // CES VALEURS DOIVENT CORRESPONDRE aux produits crees dans App Store Connect
  // et chez le prestataire de paiement. Trois endroits, une seule verite : si
  // l un derive, la personne voit un prix et en paie un autre.
  monthly: {
    id: "monthly",
    label: "Mensuel",
    priceEUR: 5.99,
    period: "month" as const,
  },
  // Les trois valeurs derivees qui vivaient ici — monthlyEquivalent, savingsEUR,
  // savingsPct — ont ete retirees le 01/09/2026. Elles etaient ecrites a la
  // main a cote des prix dont elles decoulent : deux verites pour un seul fait,
  // et rien pour les tenir ensemble quand un prix bouge. Personne ne les lisait
  // (verifie), et l ecran des prix affichait pendant ce temps un « -25% » ecrit
  // en dur dans les dix langues alors que l economie reelle est de 44 %.
  // Voir economieAnnuelle() plus bas : elle se calcule, donc elle ne ment pas.
  annual: {
    id: "annual",
    label: "Annuel",
    priceEUR: 39.99,
    period: "year" as const,
  },
  // Paiement unique, acces permanent (period_end = 2099-12-31).
  //
  // ATTENTION — ce prix n a jamais ete decide et il est devenu incoherent avec
  // les nouveaux tarifs : 49 € a vie contre 39,99 €/an, c est quinze mois
  // d abonnement. Quelqu un qui compte deux minutes ne prendra jamais l annuel.
  // Il faut soit relever le prix a vie, soit retirer l offre. En attendant,
  // l offre n est de toute facon montree que sur le web (voir `!ios` dans
  // app/app/pricing/page.tsx).
  lifetime: {
    id: "lifetime",
    label: "À vie",
    priceEUR: 49.0,
    period: undefined as never,
  },
};

/**
 * Ce que l annuel fait economiser, CALCULE a partir des deux prix.
 *
 * Rien ici n est un montant nouveau : c est la soustraction des deux tarifs
 * ci-dessus. Un chiffre d economie ecrit a la main derive du jour ou un prix
 * change, et il derive silencieusement — c est exactement ce qui s etait passe.
 *
 *   5,99 x 12 = 71,88   contre   39,99   =>   31,89 economises, soit 44 %
 */
export function economieAnnuelle(): { euros: number; pourcent: number } {
  const douzeMois = PLANS.monthly.priceEUR * 12;
  const euros = douzeMois - PLANS.annual.priceEUR;
  return { euros, pourcent: Math.round((euros / douzeMois) * 100) };
}

/** ISO week start (Mon 00:00 UTC) for a given date. */
export function weekStart(d: Date = new Date()): Date {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  const day = dt.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;          // Mon-anchored
  dt.setUTCDate(dt.getUTCDate() + diff);
  return dt;
}

/** Month start (1st 00:00 UTC) for a given date. */
export function monthStart(d: Date = new Date()): Date {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  dt.setUTCDate(1);
  return dt;
}
