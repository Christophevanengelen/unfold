/**
 * Streak tracking — pure localStorage, synchronous.
 *
 * Tracks consecutive days the user opens the app.
 * Storage key: "unfold_streak"
 */

const STORAGE_KEY = "unfold_streak";

interface StreakData {
  count: number;
  lastDate: string; // YYYY-MM-DD
}

/** Get today's date as YYYY-MM-DD in local timezone */
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Get yesterday's date as YYYY-MM-DD in local timezone */
function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Read current streak from localStorage.
 */
export function getStreak(): StreakData {
  if (typeof window === "undefined") return { count: 0, lastDate: "" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, lastDate: "" };
    const parsed = JSON.parse(raw) as StreakData;
    return {
      count: parsed.count ?? 0,
      lastDate: parsed.lastDate ?? "",
    };
  } catch {
    return { count: 0, lastDate: "" };
  }
}

/**
 * Check and update streak on app open.
 *
 * - If lastDate is yesterday -> increment
 * - If lastDate is today -> no change
 * - If lastDate is older or absent -> reset to 1
 *
 * Returns the new streak count.
 */
export function checkAndUpdateStreak(): number {
  if (typeof window === "undefined") return 0;

  const today = todayStr();
  const yesterday = yesterdayStr();
  const current = getStreak();

  let newCount: number;

  if (current.lastDate === today) {
    // Already checked in today — no change
    return current.count;
  } else if (current.lastDate === yesterday) {
    // Consecutive day — increment
    newCount = current.count + 1;
  } else {
    // Gap or first visit — reset
    newCount = 1;
  }

  const updated: StreakData = { count: newCount, lastDate: today };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable — silently fail
  }

  return newCount;
}
