/**
 * UserProfile CRUD — persistence layer for user personalization data.
 *
 * Primary store: IndexedDB (persistent, no TTL).
 * Secondary store: localStorage (sync mirror for initial render).
 */

import { storage } from "@/lib/storage";
import { isProfileMinimal } from "@/types/user-profile";
import type { UserProfile } from "@/types/user-profile";

const STORAGE_KEY = "unfold_user_profile";

// ─── Async (IndexedDB) ──────────────────────────────────────

/** Read the user profile from IndexedDB. Returns null if not set. */
export async function getUserProfile(): Promise<UserProfile | null> {
  return storage.getPersistent<UserProfile>(STORAGE_KEY);
}

/** Save user profile to IndexedDB + sync to localStorage for SSR/initial render. */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const now = new Date().toISOString();
  profile.updatedAt = now;

  // Auto-set completedAt on first minimal completion
  if (!profile.completedAt && isProfileMinimal(profile)) {
    profile.completedAt = now;
  }

  await storage.setPersistent(STORAGE_KEY, profile);

  // Mirror to localStorage for sync reads
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Quota exceeded or private browsing — non-critical
    }
  }
}

// ─── Sync (localStorage) ────────────────────────────────────

/** Sync read from localStorage — use for initial render before IndexedDB is ready. */
export function getUserProfileSync(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}
