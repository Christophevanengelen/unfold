#!/usr/bin/env node
/**
 * Supabase schema verifier — prints tables + row counts.
 * Usage: npm run db:verify
 */

import pg from "pg";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config as loadEnv } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));

loadEnv({ path: join(__dirname, "..", ".env.local") });
loadEnv({ path: join(__dirname, "..", ".env") });

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error("✗ SUPABASE_DB_URL missing from .env.local");
  process.exit(1);
}

const EXPECTED_TABLES = [
  "profiles",
  "connections",
  "invite_codes",
  "delineation_cache",
  "connection_cache",
];

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`,
  );
  const present = new Set(rows.map((r) => r.table_name));

  console.log(`\nSchema verification — ${new URL(connectionString).host}\n`);

  let allPresent = true;
  for (const name of EXPECTED_TABLES) {
    if (!present.has(name)) {
      console.log(`  ✗ ${name.padEnd(22)} MISSING`);
      allPresent = false;
      continue;
    }
    const { rows: countRows } = await client.query(
      `SELECT COUNT(*)::int AS n FROM ${name}`,
    );
    console.log(`  ✓ ${name.padEnd(22)} ${countRows[0].n} row(s)`);
  }

  // Report unexpected tables
  for (const t of present) {
    if (!EXPECTED_TABLES.includes(t)) {
      console.log(`  • ${t.padEnd(22)} (unexpected — ignored)`);
    }
  }

  if (!allPresent) {
    console.log(`\n✗ Schema incomplete — run 'npm run db:migrate'\n`);
    process.exit(1);
  }
  console.log(`\n✓ All ${EXPECTED_TABLES.length} expected tables present\n`);
} catch (err) {
  console.error(`\n✗ Verify failed: ${err.message}\n`);
  process.exit(1);
} finally {
  await client.end();
}
