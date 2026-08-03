import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/db";
import { verifyPolarWebhook, mapPolarStatus, toProductKey } from "@/lib/billing/polar";

export const runtime = "nodejs";

/**
 * POST /api/billing/webhook/polar
 *
 * Merchant-of-Record webhook — the web-side source of truth for premium.
 * Same pipeline as the Stripe webhook: idempotency claim in
 * `billing_events`, then a versioned upsert into `subscriptions`
 * (source: "polar").
 *
 * Handled events:
 *   subscription.created / subscription.updated / subscription.active
 *     → upsert row (status from Polar, monotonic version_timestamp)
 *   subscription.canceled  → status stays until current_period_end (Polar
 *     sends updated with cancel_at_period_end; the final revoked closes it)
 *   subscription.revoked   → status canceled immediately
 */

interface PolarSubscription {
  id: string;
  status?: string;
  metadata?: { userId?: string };
  customer_id?: string;
  customer?: { id?: string; email?: string };
  product_id?: string;
  product?: { id?: string };
  current_period_start?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
  created_at?: string;
  modified_at?: string | null;
}

interface PolarEvent {
  type: string;
  data: PolarSubscription;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const valid = verifyPolarWebhook(rawBody, {
    id: req.headers.get("webhook-id"),
    timestamp: req.headers.get("webhook-timestamp"),
    signature: req.headers.get("webhook-signature"),
  });
  if (!valid) {
    return new NextResponse("invalid signature", { status: 403 });
  }

  let event: PolarEvent;
  try {
    event = JSON.parse(rawBody) as PolarEvent;
  } catch {
    return new NextResponse("bad json", { status: 400 });
  }

  const db = getAdminClient();
  const eventId = req.headers.get("webhook-id") ?? `polar_${Date.now()}`;
  const eventTs = new Date(
    Number(req.headers.get("webhook-timestamp")) * 1000 || Date.now()
  ).toISOString();

  // ── Idempotency: claim the event first (same pattern as Stripe) ──
  const { data: claim } = await db
    .from("billing_events")
    .insert({
      source: "polar",
      event_id: eventId,
      event_type: event.type,
      event_timestamp: eventTs,
      payload: event as unknown as Record<string, unknown>,
    })
    .select("id")
    .maybeSingle();

  if (!claim) {
    return new NextResponse("ok", { status: 200 }); // already processed
  }

  try {
    await dispatchEvent(event, eventTs, db);
    await db
      .from("billing_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", claim.id);
  } catch (err) {
    console.error("[polar/webhook] processing error:", err);
    await db
      .from("billing_events")
      .update({
        error: err instanceof Error ? err.message : String(err),
        processing_attempts: 1,
      })
      .eq("id", claim.id);
    return new NextResponse("Processing error", { status: 500 }); // Polar retries
  }

  return new NextResponse("ok", { status: 200 });
}

async function dispatchEvent(event: PolarEvent, eventTs: string, db: SupabaseClient) {
  switch (event.type) {
    case "subscription.created":
    case "subscription.updated":
    case "subscription.active": {
      await upsertSubscription(event.data, eventTs, db);
      break;
    }
    case "subscription.canceled": {
      // Cancel scheduled at period end — keep access until then; the row's
      // status/current_period_end from the accompanying update reflects it.
      await upsertSubscription(event.data, eventTs, db);
      break;
    }
    case "subscription.revoked": {
      await db
        .from("subscriptions")
        .update({
          status: "canceled",
          version_timestamp: eventTs,
          updated_at: new Date().toISOString(),
        })
        .eq("source", "polar")
        .eq("external_subscription_id", event.data.id)
        .lt("version_timestamp", eventTs);
      break;
    }
    default:
      // benefit.*, order.*, checkout.* — not needed for entitlement
      break;
  }
}

async function upsertSubscription(sub: PolarSubscription, eventTs: string, db: SupabaseClient) {
  const userId = sub.metadata?.userId;
  if (!userId) {
    console.warn("[polar/webhook] subscription missing userId metadata", sub.id);
    return;
  }

  const row = {
    user_id: userId,
    source: "polar",
    external_subscription_id: sub.id,
    external_customer_id: sub.customer_id ?? sub.customer?.id ?? null,
    product_id: toProductKey(sub.product_id ?? sub.product?.id),
    status: mapPolarStatus(sub.status),
    current_period_start: sub.current_period_start ?? null,
    current_period_end: sub.current_period_end ?? null,
    trial_end: sub.trial_end ?? null,
    version_timestamp: eventTs,
    updated_at: new Date().toISOString(),
  };

  // Monotonic guard: never let an out-of-order retry regress the row.
  const { data: existing } = await db
    .from("subscriptions")
    .select("id, version_timestamp")
    .eq("source", "polar")
    .eq("external_subscription_id", sub.id)
    .maybeSingle();

  if (!existing) {
    await db.from("subscriptions").insert(row);
  } else if (!existing.version_timestamp || existing.version_timestamp < eventTs) {
    await db.from("subscriptions").update(row).eq("id", existing.id);
  }
}
