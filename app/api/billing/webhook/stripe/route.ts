import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/billing/stripe";
import { getAdminClient } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/billing/webhook/stripe
 *
 * Handles Stripe webhook events. Signature-verified, idempotent.
 * Inserts into billing_events first (UNIQUE constraint), then processes.
 *
 * Events handled:
 *   customer.subscription.created  → insert subscription row
 *   customer.subscription.updated  → update (version_timestamp monotonic)
 *   customer.subscription.deleted  → status = 'canceled'
 *   invoice.payment_failed         → status = 'past_due'
 *   charge.refunded                → status = 'canceled'
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new NextResponse("Missing signature or webhook secret", { status: 400 });
  }

  const rawBody = await req.arrayBuffer();
  const buf = Buffer.from(rawBody);

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const db = getAdminClient();

  // ── Idempotency: claim the event first ──
  const { data: claim } = await db
    .from("billing_events")
    .insert({
      source: "stripe",
      event_id: event.id,
      event_type: event.type,
      event_timestamp: new Date(event.created * 1000).toISOString(),
      payload: event as unknown as Record<string, unknown>,
    })
    .select("id")
    .maybeSingle();

  if (!claim) {
    // Already processed — Stripe may retry; respond 200 so it stops
    return new NextResponse("ok", { status: 200 });
  }

  try {
    await dispatchEvent(event, db);
    await db
      .from("billing_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", claim.id);
  } catch (err) {
    console.error("[stripe/webhook] processing error:", err);
    await db
      .from("billing_events")
      .update({
        error: err instanceof Error ? err.message : String(err),
        processing_attempts: 1,
      })
      .eq("id", claim.id);
    // Return 500 so Stripe retries
    return new NextResponse("Processing error", { status: 500 });
  }

  return new NextResponse("ok", { status: 200 });
}

type SupabaseClient = ReturnType<typeof getAdminClient>;

async function dispatchEvent(event: Stripe.Event, db: SupabaseClient) {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await upsertSubscription(sub, db);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db
        .from("subscriptions")
        .update({
          status: "canceled",
          version_timestamp: new Date(event.created * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("source", "stripe")
        .eq("external_subscription_id", sub.id)
        .lt("version_timestamp", new Date(event.created * 1000).toISOString());
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // v22: subscription reference moved to invoice.parent.subscription_details.subscription
      const subRef = invoice.parent?.subscription_details?.subscription;
      const subId = typeof subRef === "string" ? subRef : subRef?.id;
      if (subId) {
        await db
          .from("subscriptions")
          .update({
            status: "past_due",
            version_timestamp: new Date(event.created * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("source", "stripe")
          .eq("external_subscription_id", subId)
          .lt("version_timestamp", new Date(event.created * 1000).toISOString());
      }
      break;
    }
    case "charge.refunded": {
      // Find subscription via customer and mark canceled
      const charge = event.data.object as Stripe.Charge;
      const customerId = typeof charge.customer === "string"
        ? charge.customer
        : charge.customer?.id;
      if (customerId) {
        await db
          .from("subscriptions")
          .update({
            status: "canceled",
            version_timestamp: new Date(event.created * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("source", "stripe")
          .eq("external_customer_id", customerId)
          .in("status", ["active", "trialing"]);
      }
      break;
    }
    default:
      // Unhandled event — no-op, already claimed
      break;
  }
}

async function upsertSubscription(sub: Stripe.Subscription, db: SupabaseClient) {
  const userId = sub.metadata?.userId;
  if (!userId) {
    console.warn("[stripe/webhook] subscription missing userId metadata", sub.id);
    return;
  }

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price?.id ?? "";
  const productId = priceId === process.env.STRIPE_PRICE_MONTHLY
    ? "monthly"
    : priceId === process.env.STRIPE_PRICE_ANNUAL
      ? "annual"
      : priceId;

  const versionTs = new Date(sub.created * 1000).toISOString();
  // v22: current_period_* moved to SubscriptionItem level
  const item0 = sub.items.data[0];
  const periodStart = item0?.current_period_start;
  const periodEnd = item0?.current_period_end;

  const row = {
    user_id: userId,
    source: "stripe",
    external_subscription_id: sub.id,
    external_customer_id: customerId,
    product_id: productId,
    status: sub.status,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
    version_timestamp: versionTs,
    raw_payload: sub as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };

  await db
    .from("subscriptions")
    .upsert(row, { onConflict: "source,external_subscription_id" });
}
