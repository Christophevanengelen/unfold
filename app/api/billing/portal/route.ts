import { NextRequest, NextResponse } from "next/server";
import { getStripe, toStripeLocale, toCustomerLocale } from "@/lib/billing/stripe";
import { getUserIdFromRequest } from "@/lib/billing/auth-helper";
import { getAdminClient } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/billing/portal
 *
 * Creates a Stripe Customer Portal session for subscription management.
 * Locale propagates from request body → portal UI language + customer
 * preferred_locales (so future invoices/receipts use it too).
 *
 * Returns { url } — client redirects to it.
 */
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  let body: { locale?: string } = {};
  try { body = await req.json(); } catch { /* no body is fine */ }

  const db = getAdminClient();
  const { data } = await db
    .from("subscriptions")
    .select("external_customer_id")
    .eq("user_id", userId)
    .eq("source", "stripe")
    .limit(1)
    .maybeSingle();

  if (!data?.external_customer_id) {
    return NextResponse.json({ error: "no_stripe_customer" }, { status: 404 });
  }

  const stripe = getStripe();
  const origin = req.nextUrl.origin;
  const portalLocale = toStripeLocale(body.locale);
  const customerLocale = toCustomerLocale(body.locale);

  // Refresh customer's preferred_locales so invoices/receipts use it.
  // Fire-and-forget — non-blocking on the portal session create.
  stripe.customers.update(data.external_customer_id, {
    preferred_locales: [customerLocale],
  }).catch(() => {});

  const session = await stripe.billingPortal.sessions.create({
    customer: data.external_customer_id,
    return_url: `${origin}/demo`,
    locale: portalLocale,
  });

  return NextResponse.json({ url: session.url });
}
