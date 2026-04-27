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
    trialPitch: "7 jours gratuits, sans carte bancaire",
    ctaSheet: "Démarrer 7 jours gratuits",
    finePrint:
      "Renouvellement automatique. Annulable à tout moment depuis ton compte. Droit de rétractation 14 jours.",
    showPrice: true,
    showAnnualToggle: true,
  };
}
