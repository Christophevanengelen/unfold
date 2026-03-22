/**
 * StorageService — abstract persistence layer for Unfold.
 *
 * Uses IndexedDB (via idb-keyval pattern) for web.
 * Can be swapped for AsyncStorage (React Native) or SQLite later.
 *
 * All methods are async to support any backend.
 * Includes TTL support for cache entries.
 */

const DB_NAME = "unfold_store";
const DB_VERSION = 1;
const STORE_NAME = "kv";

// ─── IndexedDB helpers ──────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function idbSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail — never crash the app for storage
  }
}

async function idbDelete(key: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail
  }
}

// ─── StorageService (public API) ────────────────────────────

interface CacheEntry<T> {
  data: T;
  ts: number;
}

/** Default TTL: 24 hours */
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export const storage = {
  /**
   * Get a value by key. Returns null if not found or expired.
   * If ttlMs is provided, checks if the entry is still fresh.
   */
  async get<T>(key: string, ttlMs?: number): Promise<T | null> {
    if (typeof window === "undefined") return null;

    const entry = await idbGet<CacheEntry<T>>(key);
    if (!entry || !entry.data) return null;

    // If TTL is specified, check freshness
    if (ttlMs !== undefined && entry.ts) {
      if (Date.now() - entry.ts > ttlMs) {
        await idbDelete(key);
        return null;
      }
    }

    return entry.data;
  },

  /**
   * Store a value with a timestamp (for TTL checks later).
   */
  async set<T>(key: string, data: T): Promise<void> {
    if (typeof window === "undefined") return;
    const entry: CacheEntry<T> = { data, ts: Date.now() };
    await idbSet(key, entry);
  },

  /**
   * Remove a single key.
   */
  async remove(key: string): Promise<void> {
    if (typeof window === "undefined") return;
    await idbDelete(key);
  },

  /**
   * Convenience: get with 24h TTL (for API cache).
   */
  async getCache<T>(key: string): Promise<T | null> {
    return this.get<T>(key, DEFAULT_TTL_MS);
  },

  /**
   * Convenience: set cache entry (same as set, timestamps automatically).
   */
  async setCache<T>(key: string, data: T): Promise<void> {
    return this.set(key, data);
  },

  /**
   * Get a value without TTL check (persistent data like birth info).
   */
  async getPersistent<T>(key: string): Promise<T | null> {
    return this.get<T>(key);
  },

  /**
   * Store a persistent value (no expiry).
   */
  async setPersistent<T>(key: string, data: T): Promise<void> {
    return this.set(key, data);
  },
};

// ─── Migration: copy localStorage → IndexedDB (one-time) ───

/**
 * Migrate existing localStorage entries to IndexedDB.
 * Runs once on first load, then never again.
 * This ensures users don't lose their cached data when we switch backends.
 */
export async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return;

  const MIGRATION_KEY = "unfold_idb_migrated";
  const alreadyMigrated = await idbGet<boolean>(MIGRATION_KEY);
  if (alreadyMigrated) return;

  const keysToMigrate = [
    "unfold_birth_data",
  ];

  // Also migrate any unfold_year_* and unfold_app_* cache entries
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("unfold_year_") || key.startsWith("unfold_app_"))) {
      keysToMigrate.push(key);
    }
  }

  for (const key of keysToMigrate) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      // localStorage cache entries have { data, ts } shape
      if (parsed.data && parsed.ts) {
        await idbSet(key, parsed); // Already in CacheEntry format
      } else {
        // Birth data is stored directly (no wrapper)
        await idbSet(key, { data: parsed, ts: Date.now() });
      }
    } catch {
      // Skip corrupted entries
    }
  }

  await idbSet(MIGRATION_KEY, true);
  console.log("[Storage] Migrated localStorage → IndexedDB");
}
