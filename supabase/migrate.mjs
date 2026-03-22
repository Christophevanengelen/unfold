import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "001_initial_tables.sql"), "utf-8");

const connectionString =
  "postgresql://postgres:tKHwmuSXLfhec6TE@db.ykrequspwobhnlbcldam.supabase.co:5432/postgres";

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("Connected to Supabase PostgreSQL");
  await client.query(sql);
  console.log("Tables created successfully");

  // Verify
  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("Tables in public schema:", res.rows.map((r) => r.table_name).join(", "));
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
