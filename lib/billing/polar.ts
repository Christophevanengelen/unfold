/**
 * Polar.sh billing — Merchant of Record for the WEB checkout.
 *
 * Why Polar next to Stripe: Polar sells to the end customer on our behalf
 * (MoR) — it collects payment, handles VAT/invoices/disputes and pays out
 * to an individual. No company / VAT number required on our side, which
 * Stripe ultimately does require. Same `subscriptions` pipeline, new
 * source: "polar".
 *
 * Zero-SDK integration: plain REST + standard-webhooks HMAC verification
 * (node:crypto), so no new dependency enters the bundle.
 *
 * Env (all optional — routes return 503 until configured):
 *   POLAR_ACCESS_TOKEN      Dashboard → Settings → API tokens
 *   POLAR_WEBHOOK_SECRET    created with the webhook endpoint (whsec_…)
 *   POLAR_PRODUCT_MONTHLY   Polar product id for the monthly sub
 *   POLAR_PRODUCT_ANNUAL    Polar product id for the annual sub
 *   POLAR_SERVER            "sandbox" while testing (default: production)
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const API_BASE =
  process.env.POLAR_SERVER === "sandbox"
    ? "https://sandbox-api.polar.sh/v1"
    : "https://api.polar.sh/v1";

export function polarConfigured(): boolean {
  return Boolean(
    process.env.POLAR_ACCESS_TOKEN &&
    (process.env.POLAR_PRODUCT_MONTHLY || process.env.POLAR_PRODUCT_ANNUAL)
  );
}

/** Map our plan keys to Polar product ids (mirrors STRIPE_PRICE_IDS). */
export function polarProductId(plan: "monthly" | "annual"): string | undefined {
  return plan === "monthly"
    ? process.env.POLAR_PRODUCT_MONTHLY
    : process.env.POLAR_PRODUCT_ANNUAL;
}

/** Reverse map: Polar product id → our product key. */
export function toProductKey(polarProduct: string | undefined | null): string {
  if (!polarProduct) return "";
  if (polarProduct === process.env.POLAR_PRODUCT_MONTHLY) return "monthly";
  if (polarProduct === process.env.POLAR_PRODUCT_ANNUAL) return "annual";
  return polarProduct;
}

interface CreateCheckoutArgs {
  plan: "monthly" | "annual";
  userId: string;
  successUrl: string;
  customerEmail?: string | null;
}

/**
 * POST /v1/checkouts — returns the hosted checkout URL.
 * metadata.userId is echoed back on every webhook payload, which is how
 * the webhook attributes the subscription to a Supabase user (exactly
 * like the Stripe flow's subscription metadata).
 */
export async function createPolarCheckout(args: CreateCheckoutArgs): Promise<{ url: string }> {
  const productId = polarProductId(args.plan);
  if (!productId) throw new Error(`polar product not configured for plan ${args.plan}`);

  const res = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      products: [productId],
      success_url: args.successUrl,
      ...(args.customerEmail ? { customer_email: args.customerEmail } : {}),
      metadata: { userId: args.userId },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`polar checkout failed: ${res.status} ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error("polar checkout: no url in response");
  return { url: data.url };
}

/**
 * Verify a Polar webhook (standard-webhooks spec):
 *   signed content = `${webhook-id}.${webhook-timestamp}.${rawBody}`
 *   signature      = base64(HMAC-SHA256(base64decode(secret after "whsec_")))
 *   header webhook-signature = "v1,<sig> [v1,<sig2> …]"
 * Rejects timestamps older than 5 minutes (replay protection).
 */
export function verifyPolarWebhook(
  rawBody: string,
  headers: { id?: string | null; timestamp?: string | null; signature?: string | null }
): boolean {
  const secretRaw = process.env.POLAR_WEBHOOK_SECRET;
  const { id, timestamp, signature } = headers;
  if (!secretRaw || !id || !timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const secret = Buffer.from(secretRaw.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", secret)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest("base64");
  const expectedBuf = Buffer.from(expected);

  for (const part of signature.split(" ")) {
    const candidate = part.startsWith("v1,") ? part.slice(3) : part;
    const candidateBuf = Buffer.from(candidate);
    if (
      candidateBuf.length === expectedBuf.length &&
      timingSafeEqual(candidateBuf, expectedBuf)
    ) {
      return true;
    }
  }
  return false;
}

/** Map a Polar subscription status onto our `subscriptions.status` vocab. */
export function mapPolarStatus(polarStatus: string | undefined): string {
  switch (polarStatus) {
    case "active": return "active";
    case "trialing": return "trialing";
    case "past_due": return "past_due";
    case "canceled":
    case "revoked": return "canceled";
    default: return polarStatus ?? "none";
  }
}
