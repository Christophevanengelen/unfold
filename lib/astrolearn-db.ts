import { Pool } from "pg";

let pool: Pool | null = null;
let bubblePool: Pool | null = null;

function readConnectionString(): string {
  if (process.env.ASTROLEARN_DATABASE_URL) {
    return process.env.ASTROLEARN_DATABASE_URL;
  }
  return "postgresql://postgres:L%7B3Agn%2FYcr%25%5B%3C~%3FXJ5zU@localhost:5432/astrolearn";
}

function readBubbleConnectionString(): string {
  if (process.env.BUBBLE_DATABASE_URL) {
    return process.env.BUBBLE_DATABASE_URL;
  }
  return "postgresql://postgres:L%7B3Agn%2FYcr%25%5B%3C~%3FXJ5zU@localhost:5432/bubble";
}

export function getAstrolearnPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: readConnectionString() });
  }
  return pool;
}

export function getBubblePool(): Pool {
  if (!bubblePool) {
    bubblePool = new Pool({ connectionString: readBubbleConnectionString() });
  }
  return bubblePool;
}
