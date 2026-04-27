import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_PRICE_IDS, TRIAL_DAYS } from "@/lib/billing/stripe";
import { getUserIdFromRequest } from "@/lib/billing/auth-helper";
import { getAdminClient } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/billing/checkout
 *
 * Creates a Stripe Checkout Session with a 7-day free trial.
 * Returns { url } — client redirects to it.
 *
 * Body: { priceId: "monthly" | "annual" }
 */
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  let body: { priceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const { priceId: priceKey } = body;
  if (priceKey !== "monthly" && priceKey !== "annual") {
    return NextResponse.json({ error: "priceId must be 'monthly' or 'annual'" }, { status: 400 });
  }

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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : customerEmail,
    line_items: [{ price: stripePrice, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { userId },
    },
    metadata: { userId },
    success_url: `${origin}/demo?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    locale: "fr",
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
