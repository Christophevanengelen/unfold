import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/billing/webhook/revenuecat
 *
 * Handles RevenueCat webhook events for Apple IAP + Google Play Billing.
 * Signature: Bearer token in Authorization header matches REVENUECAT_WEBHOOK_SECRET.
 * Idempotent via billing_events UNIQUE (source, event_id).
 * version_timestamp is event_timestamp_ms from RC payload (monotonic).
 *
 * Events handled:
 *   INITIAL_PURCHASE    → insert subscription row (trialing if trial, else active)
 *   RENEWAL             → update to active, extend period_end
 *   CANCELLATION        → update cancel_at (sub stays active until expiry)
 *   EXPIRATION          → update to expired/canceled
 *   REFUND              → update to canceled immediately
 *   BILLING_ISSUE       → update to past_due
 *   BILLING_ISSUE_RESOLVED → update back to active
 *   NON_RENEWING_PURCHASE  → insert one-time row (ignore for subs model)
 */

// ── RevenueCat event shape (subset we use) ──────────────────────────────────
interface RCEvent {
  id: string;
  type: string;
  app_user_id: string;
  original_app_user_id: string;
  product_id: string;
  store: "APP_STORE" | "PLAY_STORE" | "STRIPE" | string;
  environment: "PRODUCTION" | "SANDBOX" | string;
  transaction_id: string;
  original_transaction_id: string;
  subscription_id?: string;
  purchased_at_ms: number;
  event_timestamp_ms: number;
  expiration_at_ms?: number;
  grace_period_expiration_at_ms?: number;
  cancel_reason?: string;
  period_type?: "NORMAL" | "TRIAL" | "INTRO" | string;
  price?: number;
  currency?: string;
  country_code?: string;
}

interface RCWebhookBody {
  api_version: string;
  event: RCEvent;
}

export async function POST(req: NextRequest) {
  // ── Auth: shared secret ───────────────────────────────────────────────────
  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!webhookSecret) {
    console.error("[rc/webhook] REVENUECAT_WEBHOOK_SECRET not set");
    return new NextResponse("Server misconfiguration", { status: 500 });
  }

  const expectedBearer = `Bearer ${webhookSecret}`;
  if (!authHeader || authHeader !== expectedBearer) {
    console.warn("[rc/webhook] unauthorized — bad or missing Authorization header");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: RCWebhookBody;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const evt = body.event;
  if (!evt || !evt.id || !evt.type) {
    return new NextResponse("Missing event fields", { status: 400 });
  }

  const db = getAdminClient();

  // ── Idempotency: claim first ──────────────────────────────────────────────
  const source = rcStoreToSource(evt.store);
  const eventTs = new Date(evt.event_timestamp_ms).toISOString();

  const { data: claim } = await db
    .from("billing_events")
    .insert({
      source,
      event_id: evt.id,
      event_type: evt.type,
      event_timestamp: eventTs,
      payload: body as unknown as Record<string, unknown>,
    })
    .select("id")
    .maybeSingle();

  if (!claim) {
    // Already processed — RC retries; 200 to stop
    return new NextResponse("ok", { status: 200 });
  }

  // Skip SANDBOX events in production (don't pollute prod DB)
  if (evt.environment === "SANDBOX" && process.env.NODE_ENV === "production") {
    console.log("[rc/webhook] skipping SANDBOX event in production:", evt.type, evt.id);
    await db
      .from("billing_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", claim.id);
    return new NextResponse("ok", { status: 200 });
  }

  // ── Dispatch ──────────────────────────────────────────────────────────────
  try {
    await dispatchEvent(evt, source, db);
    await db
      .from("billing_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", claim.id);
  } catch (err) {
    console.error("[rc/webhook] processing error:", err);
    await db
      .from("billing_events")
      .update({
        error: err instanceof Error ? err.message : String(err),
        processing_attempts: 1,
      })
      .eq("id", claim.id);
    // 500 → RC will retry
    return new NextResponse("Processing error", { status: 500 });
  }

  return new NextResponse("ok", { status: 200 });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function rcStoreToSource(store: string): "apple" | "google" | "stripe" {
  if (store === "APP_STORE") return "apple";
  if (store === "PLAY_STORE") return "google";
  return "stripe";
}

/** Map RevenueCat product_id to our internal product_id. */
function rcProductToInternal(productId: string): string {
  if (productId.includes("monthly")) return "monthly";
  if (productId.includes("annual") || productId.includes("yearly")) return "annual";
  return productId;
}

type DB = ReturnType<typeof getAdminClient>;

async function dispatchEvent(evt: RCEvent, source: string, db: DB) {
  const userId = evt.app_user_id;
  const versionTs = new Date(evt.event_timestamp_ms).toISOString();

  switch (evt.type) {
    // ── New purchase / trial start ──────────────────────────────────────────
    case "INITIAL_PURCHASE": {
      const isTrial = evt.period_type === "TRIAL";
      await upsertSubscription({
        userId,
        source,
        evt,
        status: isTrial ? "trialing" : "active",
        versionTs,
        db,
      });
      break;
    }

    // ── Renewal (payment succeeded) ─────────────────────────────────────────
    case "RENEWAL": {
      const expiresAt = evt.expiration_at_ms
        ? new Date(evt.expiration_at_ms).toISOString()
        : null;
      await db
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: new Date(evt.purchased_at_ms).toISOString(),
          current_period_end: expiresAt,
          trial_end: null,
          cancel_at: null,
          version_timestamp: versionTs,
          updated_at: new Date().toISOString(),
        })
        .eq("source", source)
        .eq("external_subscription_id", rcSubId(evt))
        .lt("version_timestamp", versionTs);
      break;
    }

    // ── User cancelled (sub stays active until expiry) ──────────────────────
    case "CANCELLATION": {
      const cancelAt = evt.expiration_at_ms
        ? new Date(evt.expiration_at_ms).toISOString()
        : null;
      await db
        .from("subscriptions")
        .update({
          cancel_at: cancelAt,
          version_timestamp: versionTs,
          updated_at: new Date().toISOString(),
        })
        .eq("source", source)
        .eq("external_subscription_id", rcSubId(evt))
        .lt("version_timestamp", versionTs);
      break;
    }

    // ── Subscription fully expired ───────────────────────────────────────────
    case "EXPIRATION": {
      await db
        .from("subscriptions")
        .update({
          status: "expired",
          version_timestamp: versionTs,
          updated_at: new Date().toISOString(),
        })
        .eq("source", source)
        .eq("external_subscription_id", rcSubId(evt))
        .lt("version_timestamp", versionTs);
      break;
    }

    // ── Refund → cancel immediately ──────────────────────────────────────────
    case "REFUND": {
      await db
        .from("subscriptions")
        .update({
          status: "canceled",
          version_timestamp: versionTs,
          updated_at: new Date().toISOString(),
        })
        .eq("source", source)
        .eq("external_subscription_id", rcSubId(evt))
        .lt("version_timestamp", versionTs);
      break;
    }

    // ── Payment failed ────────────────────────────────────────────────────────
    case "BILLING_ISSUE": {
      // RC may give a grace period — keep active until grace expires
      const gracePeriodEnd = evt.grace_period_expiration_at_ms
        ? new Date(evt.grace_period_expiration_at_ms).toISOString()
        : null;
      await db
        .from("subscriptions")
        .update({
          status: "past_due",
          current_period_end: gracePeriodEnd ?? undefined,
          version_timestamp: versionTs,
          updated_at: new Date().toISOString(),
        })
        .eq("source", source)
        .eq("external_subscription_id", rcSubId(evt))
        .lt("version_timestamp", versionTs);
      break;
    }

    // ── Billing issue resolved (retry succeeded) ─────────────────────────────
    case "BILLING_ISSUE_RESOLVED": {
      await db
        .from("subscriptions")
        .update({
          status: "active",
          version_timestamp: versionTs,
          updated_at: new Date().toISOString(),
        })
        .eq("source", source)
        .eq("external_subscription_id", rcSubId(evt))
        .lt("version_timestamp", versionTs);
      break;
    }

    // ── One-time purchase (not a sub) — no-op for sub model ─────────────────
    case "NON_RENEWING_PURCHASE":
      console.log("[rc/webhook] NON_RENEWING_PURCHASE — skipped for sub model:", evt.product_id);
      break;

    // ── Trial converted to paid (use RENEWAL handler) ────────────────────────
    case "PRODUCT_CHANGE":
      console.log("[rc/webhook] PRODUCT_CHANGE — sub product changed:", evt.product_id);
      break;

    default:
      console.log("[rc/webhook] unhandled event type:", evt.type);
      break;
  }
}

/** Canonical subscription ID for RC: prefer subscription_id, fall back to original_transaction_id. */
function rcSubId(evt: RCEvent): string {
  return evt.subscription_id ?? evt.original_transaction_id;
}

async function upsertSubscription({
  userId,
  source,
  evt,
  status,
  versionTs,
  db,
}: {
  userId: string;
  source: string;
  evt: RCEvent;
  status: string;
  versionTs: string;
  db: DB;
}) {
  const subId = rcSubId(evt);
  const expiresAt = evt.expiration_at_ms
    ? new Date(evt.expiration_at_ms).toISOString()
    : null;
  const isTrial = evt.period_type === "TRIAL";

  const row = {
    user_id: userId,
    source,
    external_subscription_id: subId,
    external_customer_id: userId, // RC uses app_user_id as customer reference
    product_id: rcProductToInternal(evt.product_id),
    status,
    current_period_start: new Date(evt.purchased_at_ms).toISOString(),
    current_period_end: expiresAt,
    trial_end: isTrial ? expiresAt : null,
    cancel_at: null,
    version_timestamp: versionTs,
    raw_payload: evt as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };

  const { error } = await db
    .from("subscriptions")
    .upsert(row, { onConflict: "source,external_subscription_id" });

  if (error) {
    console.error("[rc/webhook] upsert failed:", error.message, "userId:", userId, "subId:", subId);
    throw new Error(`Upsert failed: ${error.message}`);
  }
}
