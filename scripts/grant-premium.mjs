/**
 * One-shot script: grant lifetime premium to a user by email.
 * Usage: node scripts/grant-premium.mjs marieangelevan@yahoo.fr
 *
 * Run from the project root so .env is picked up.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env manually (no dotenv dep needed)
const envPath = resolve(process.cwd(), ".env");
const envLocal = resolve(process.cwd(), ".env.local");

function parseEnv(path) {
  try {
    return Object.fromEntries(
      readFileSync(path, "utf8")
        .split("\n")
        .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
        .map((l) => {
          const idx = l.indexOf("=");
          return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
        })
    );
  } catch {
    return {};
  }
}

const env = { ...parseEnv(envPath), ...parseEnv(envLocal) };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/grant-premium.mjs <email>");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Find user by email
const { data: { users }, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listErr) { console.error("listUsers error:", listErr); process.exit(1); }

const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.error(`User not found: ${email}`);
  console.log("Existing users:", users.map((u) => u.email).join(", "));
  process.exit(1);
}

console.log(`Found user: ${user.id} (${user.email})`);

// 2. Upsert lifetime subscription
const now = new Date().toISOString();
const { error: upsertErr } = await admin
  .from("subscriptions")
  .upsert(
    {
      user_id: user.id,
      source: "stripe",
      status: "lifetime",
      product_id: "lifetime",
      external_subscription_id: `manual_lifetime_${user.id}`,
      external_customer_id: null,
      current_period_end: "2099-12-31T23:59:59.000Z",
      created_at: now,
      updated_at: now,
    },
    { onConflict: "source,external_subscription_id" }
  );

if (upsertErr) {
  console.error("Upsert error:", upsertErr);
  process.exit(1);
}

console.log(`✓ ${email} is now lifetime premium until 2099.`);
