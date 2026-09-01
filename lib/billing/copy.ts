/**
 * ⚠ CE FICHIER N EST IMPORTE PAR AUCUN AUTRE. Verifie le 01/09/2026.
 *
 * Il est laisse en place parce qu il porte une regle qui compte — l anti-
 * steering d Apple, article 3.1.1 — mais il ne doit PAS etre rebranche tel
 * quel. Deux raisons :
 *
 *  1. Il annonce « annulable a tout moment ». C est FAUX :
 *     `app/api/billing/checkout` ouvre un Stripe Checkout `subscription` avec
 *     `payment_method_types: ["card"]`. La carte est collectee avant l essai.
 *     Une affirmation fausse sur les conditions d un essai paye est un
 *     probleme de conformite, pas une coquille.
 *  2. Ses textes sont en francais uniquement, pour un produit en dix langues.
 *
 * L ecran de prix a ete refait le 01/09 et porte desormais ses propres textes,
 * traduits, avec la mention exacte : « 7 jours gratuits, puis 5,99 EUR par
 * mois. Annulable a tout moment. »
 */

/**
 * Platform-aware paywall copy.
 *
 * iOS bundle (Apple App Store) → ZERO mention of price, currency, or
 * external payment links per anti-steering rule 3.1.1.
 * Web + Android → full marketing copy with prices.
 *
 * The ONLY place in `components/demo/**` allowed to read platform.
 */

import { getPlatform } from "@/lib/platform";
import { PLANS } from "./features";

export interface PaywallCopy {
  cta: string;                          // button label
  ctaShort: string;                     // short alt for compact contexts
  trialPitch: string;                   // "7 jours gratuits..."
  ctaSheet: string;                     // CTA inside PremiumTeaser sheet
  finePrint: string;                    // small text under CTA
  showPrice: boolean;                   // whether to render the price block
  showAnnualToggle: boolean;
}

/**
 * Returns the right copy for the current platform.
 * Web + Android: full pricing.
 * iOS: vague-by-design — Apple will reject anything else.
 */
export function getPaywallCopy(): PaywallCopy {
  const platform = getPlatform();
  if (platform === "ios") {
    return {
      cta: "Débloque dans la version Pro",
      ctaShort: "Voir Pro",
      trialPitch: "Essai gratuit de 7 jours",
      ctaSheet: "Continuer",
      finePrint: "Tu pourras gérer ton abonnement à tout moment dans Réglages.",
      showPrice: false,
      showAnnualToggle: false,
    };
  }
  // Web + Android
  return {
    cta: "Voir les plans",
    ctaShort: `${PLANS.monthly.priceEUR.toFixed(2)} €/mois`,
    trialPitch: "7 jours gratuits, annulable a tout moment",
    ctaSheet: "Démarrer 7 jours gratuits",
    finePrint:
      "Renouvellement automatique. Annulable à tout moment depuis ton compte. Droit de rétractation 14 jours.",
    showPrice: true,
    showAnnualToggle: true,
  };
}
