import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_PRICE_IDS, TRIAL_DAYS, toStripeLocale, toCustomerLocale } from "@/lib/billing/stripe";
import { getUserIdFromRequest } from "@/lib/billing/auth-helper";
import { getAdminClient } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/billing/checkout
 *
 * Creates a Stripe Checkout Session with a 7-day free trial.
 * Returns { url } — client redirects to it.
 *
 * Body: { priceId: "monthly" | "annual", locale?: string }
 *
 * The locale (FR/EN/PT/ES/DE/IT/NL/JA/ZH/AR) is forwarded to Stripe so the
 * Checkout page renders in the user's language. Defaults to "auto".
 */
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  let body: { priceId?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const { priceId: priceKey, locale: rawLocale } = body;
  if (priceKey !== "monthly" && priceKey !== "annual") {
    return NextResponse.json({ error: "priceId must be 'monthly' or 'annual'" }, { status: 400 });
  }

  const stripeLocale = toStripeLocale(rawLocale);

  const stripePrice = STRIPE_PRICE_IDS[priceKey];
  if (!stripePrice) {
    return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
  }

  const origin = req.nextUrl.origin;

  // Fetch user email from Supabase auth to pre-fill Checkout
  let customerEmail: string | undefined;
  try {
    const db = getAdminClient();
    const { data } = await db.auth.admin.getUserById(userId);
    customerEmail = data?.user?.email ?? undefined;
  } catch {
    // Non-fatal — Stripe will ask for email
  }

  // Check if user already has a Stripe customer ID
  let stripeCustomerId: string | undefined;
  try {
    const db = getAdminClient();
    const { data } = await db
      .from("subscriptions")
      .select("external_customer_id")
      .eq("user_id", userId)
      .eq("source", "stripe")
      .limit(1)
      .maybeSingle();
    stripeCustomerId = data?.external_customer_id ?? undefined;
  } catch {
    // Non-fatal
  }

  const stripe = getStripe();
  const customerLocale = toCustomerLocale(rawLocale);

  // If we already have a Stripe customer, refresh their preferred_locales so
  // invoices/receipts come in the right language. Fire-and-forget — we don't
  // block checkout creation on this.
  if (stripeCustomerId) {
    stripe.customers.update(stripeCustomerId, {
      preferred_locales: [customerLocale],
    }).catch(() => {});
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : customerEmail,
    line_items: [{ price: stripePrice, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { userId, locale: rawLocale ?? "" },
    },
    metadata: { userId, locale: rawLocale ?? "" },
    success_url: `${origin}/demo?checkout=success`,
    cancel_url: `${origin}/demo/pricing?checkout=cancelled`,
    locale: stripeLocale,
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },                  // Stripe Tax → EU VAT auto
    billing_address_collection: "auto",
    consent_collection: { terms_of_service: "none" },
  });

  return NextResponse.json({ url: session.url });
}
