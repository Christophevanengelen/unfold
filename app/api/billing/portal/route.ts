import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/billing/stripe";
import { getUserIdFromRequest } from "@/lib/billing/auth-helper";
import { getAdminClient } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/billing/portal
 *
 * Creates a Stripe Customer Portal session for subscription management.
 * Returns { url } — client redirects to it.
 */
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

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

  const session = await stripe.billingPortal.sessions.create({
    customer: data.external_customer_id,
    return_url: `${origin}/demo`,
  });

  return NextResponse.json({ url: session.url });
}
