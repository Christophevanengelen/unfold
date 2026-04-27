import Stripe from "stripe";
import type { Locale } from "@/lib/i18n-demo";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  return _stripe;
}

export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? "",
  annual: process.env.STRIPE_PRICE_ANNUAL ?? "",
};

export const TRIAL_DAYS = 7;

/**
 * Map our app locale to a Stripe Checkout Session `locale` value.
 * Reference: https://docs.stripe.com/payments/checkout/customization/appearance#localization
 *
 * Centralized so adding a language only requires one entry here.
 * "auto" lets Stripe detect from the browser when our locale is unsupported.
 * Arabic isn't in Stripe's Checkout locale list yet → falls back to "auto".
 */
type StripeCheckoutLocale = NonNullable<Stripe.Checkout.SessionCreateParams["locale"]>;

const APP_TO_STRIPE: Record<Locale, StripeCheckoutLocale> = {
  fr: "fr",
  en: "en",
  es: "es",
  de: "de",
  it: "it",
  pt: "pt-BR",       // Stripe uses "pt-BR" for Brazilian Portuguese
  nl: "nl",
  ja: "ja",
  zh: "zh",
  ar: "auto",        // Arabic not in Stripe Checkout supported locales — auto-detect
};

export function toStripeLocale(loc: Locale | string | undefined | null): StripeCheckoutLocale {
  if (!loc) return "auto";
  return (APP_TO_STRIPE as Record<string, StripeCheckoutLocale>)[loc] ?? "auto";
}

/**
 * Stripe Customer "preferred_locales" — used on the Customer object so
 * invoices, receipts, and Customer Portal default to user's language.
 * Accepts ISO-639 codes; broader than Checkout locale list.
 */
const APP_TO_CUSTOMER_LOCALE: Record<Locale, string> = {
  fr: "fr", en: "en", es: "es", de: "de", it: "it",
  pt: "pt-BR", nl: "nl", ja: "ja", zh: "zh-CN", ar: "ar",
};

export function toCustomerLocale(loc: Locale | string | undefined | null): string {
  if (!loc) return "en";
  return APP_TO_CUSTOMER_LOCALE[loc as Locale] ?? "en";
}
