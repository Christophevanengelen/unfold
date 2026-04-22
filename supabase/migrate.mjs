#!/usr/bin/env node
/**
 * Supabase migration runner — idempotent.
 * Reads SUPABASE_DB_URL from .env.local (or env) and executes
 * every *.sql file in this folder in alphabetical order.
 *
 * Usage: npm run db:migrate
 */

import pg from "pg";
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config as loadEnv } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local → fallback .env
loadEnv({ path: join(__dirname, "..", ".env.local") });
loadEnv({ path: join(__dirname, "..", ".env") });

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error(
    "✗ SUPABASE_DB_URL missing from .env.local\n" +
    "  Expected: postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres",
  );
  process.exit(1);
}

const sqlFiles = readdirSync(__dirname)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (sqlFiles.length === 0) {
  console.error("✗ No .sql files found in supabase/");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log(`→ Connected to Supabase PostgreSQL`);

  for (const file of sqlFiles) {
    const sql = readFileSync(join(__dirname, file), "utf-8");
    process.stdout.write(`→ Running ${file}... `);
    await client.query(sql);
    console.log("✓");
  }

  // Verify
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`,
  );
  const tables = rows.map((r) => r.table_name);
  console.log(`\n✓ ${tables.length} tables in public schema: ${tables.join(", ")}`);
} catch (err) {
  console.error(`\n✗ Migration failed: ${err.message}`);
  if (err.detail) console.error(`  detail: ${err.detail}`);
  if (err.hint) console.error(`  hint: ${err.hint}`);
  process.exit(1);
} finally {
  await client.end();
}
