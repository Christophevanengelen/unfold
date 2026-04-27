-- Unfold — Billing schema
-- Tables: subscriptions, billing_events (idempotency log), usage_counters,
--         gdpr_deletions (audit trail).
--
-- Decisions baked in:
--  - Hybrid model: Stripe (web) + Apple IAP + Google Play, all in same table
--    via `source` enum.
--  - Per-provider rows (NOT one row per user) so out-of-order webhooks can
--    reconcile via `version_timestamp` from event payload.
--  - usage_counters with atomic INSERT...ON CONFLICT...DO UPDATE for races.
--  - RLS strict: service-role writes only, authenticated reads own rows.
--
-- Idempotent.

-- ─── subscriptions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('stripe', 'apple', 'google')),
  external_subscription_id TEXT NOT NULL,
  external_customer_id TEXT,
  product_id TEXT NOT NULL,                            -- 'monthly' | 'annual'
  status TEXT NOT NULL CHECK (status IN
    ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'expired', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  -- Source-of-truth timestamp from the event payload (Stripe.created,
  -- RC.event_timestamp). Used for monotonic UPDATE WHERE version_timestamp < $new.
  version_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_subscriptions_external UNIQUE (source, external_subscription_id)
);

CREATE INDEX IF NOT EXISTS idx_subs_user_active
  ON subscriptions(user_id)
  WHERE status IN ('trialing', 'active');

CREATE INDEX IF NOT EXISTS idx_subs_user
  ON subscriptions(user_id);

-- updated_at auto-maintain (reuses trigger function from 001)
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION unfold_set_updated_at();

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_users_read_own_subs" ON subscriptions;
CREATE POLICY "auth_users_read_own_subs"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ─── billing_events ─────────────────────────────────────────────
-- Idempotency log. Every webhook delivery inserts here BEFORE processing
-- the event. INSERT...ON CONFLICT DO NOTHING ensures duplicate deliveries
-- short-circuit before mutating subscriptions.
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                                         -- nullable: events arriving before user resolved
  source TEXT NOT NULL,                                 -- 'stripe' | 'apple' | 'google' | 'revenuecat'
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL,                               -- provider-supplied unique id
  event_timestamp TIMESTAMPTZ NOT NULL,                 -- from event payload
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  processing_attempts INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_billing_events UNIQUE (source, event_id)
);

CREATE INDEX IF NOT EXISTS idx_billing_events_unprocessed
  ON billing_events(created_at)
  WHERE processed_at IS NULL;

ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
-- service-role only

-- ─── usage_counters ─────────────────────────────────────────────
-- Atomic per-period quota counters. Free tier limits enforced via:
--   INSERT INTO usage_counters (user_id, feature, period_start, count)
--   VALUES ($1, $2, date_trunc('week', now()), 1)
--   ON CONFLICT (user_id, feature, period_start)
--   DO UPDATE SET count = usage_counters.count + 1
--   RETURNING count;
-- The RETURNING is the post-increment count — caller checks against quota.
CREATE TABLE IF NOT EXISTS usage_counters (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,                                -- 'AI_DELINEATION' | 'CONNECTION_DELINEATION' | etc.
  period_start TIMESTAMPTZ NOT NULL,                    -- start of current week (Mon 00:00 UTC) or month
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, feature, period_start)
);

CREATE INDEX IF NOT EXISTS idx_usage_user_feature
  ON usage_counters(user_id, feature);

ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_users_read_own_usage" ON usage_counters;
CREATE POLICY "auth_users_read_own_usage"
  ON usage_counters FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ─── gdpr_deletions ─────────────────────────────────────────────
-- Audit trail of GDPR right-to-be-forgotten requests. Required for
-- legal compliance — keeps a record that deletion happened, with what
-- resources were purged, even after the underlying user is gone.
CREATE TABLE IF NOT EXISTS gdpr_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                                         -- the deleted user (now orphaned)
  email TEXT NOT NULL,                                  -- for cross-reference in support
  birth_hash TEXT,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_by TEXT NOT NULL DEFAULT 'self',              -- 'self' | 'admin' | 'support'
  resources JSONB NOT NULL DEFAULT '{}'::jsonb,         -- {profile: 1, subs: N, cache: N, stripe_customer: 'cus_xxx', revenuecat_id: 'rc_xxx'}
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_gdpr_deletions_email ON gdpr_deletions(email);
CREATE INDEX IF NOT EXISTS idx_gdpr_deletions_at ON gdpr_deletions(deleted_at DESC);

ALTER TABLE gdpr_deletions ENABLE ROW LEVEL SECURITY;
-- service-role only — never exposed to authenticated user
