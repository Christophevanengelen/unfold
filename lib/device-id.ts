/**
 * Device identity — stable UUID per browser, stored in localStorage.
 * Used as anonymous ownership key in Supabase until auth ships.
 */

const DEVICE_ID_KEY = "unfold_device_id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
