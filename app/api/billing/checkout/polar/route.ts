import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/billing/auth-helper";
import { createPolarCheckout, polarConfigured } from "@/lib/billing/polar";

export const runtime = "nodejs";

/**
 * POST /api/billing/checkout/polar
 *
 * Merchant-of-Record checkout (no company / VAT number needed on our side —
 * Polar is the seller of record). Mirrors the Stripe checkout contract:
 *
 * Body:     { priceId: "monthly" | "annual" }
 * Response: { url } — client redirects to the hosted Polar checkout.
 *
 * The webhook at /api/billing/webhook/polar inserts the subscription row.
 * Returns 503 until POLAR_* env vars are configured, so this route can
 * ship ahead of the Polar organization being created.
 */
export async function POST(req: NextRequest) {
  if (!polarConfigured()) {
    return NextResponse.json({ error: "polar_not_configured" }, { status: 503 });
  }

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

  const plan = body.priceId;
  if (plan !== "monthly" && plan !== "annual") {
    return NextResponse.json({ error: "priceId must be 'monthly' or 'annual'" }, { status: 400 });
  }

  try {
    const { url } = await createPolarCheckout({
      plan,
      userId,
      successUrl: `${req.nextUrl.origin}/app?upgraded=1`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[polar/checkout] error:", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 });
  }
}
