import { formatEuropeanDateInput } from "@/lib/european-date";

export type PersonEventCategory = "WORK" | "RELATIONSHIP" | "BE CAREFUL";

export const PERSON_EVENT_CATEGORIES: readonly PersonEventCategory[] = [
  "WORK",
  "RELATIONSHIP",
  "BE CAREFUL",
];

export interface PersonEvent {
  id_event: string | number;
  id_user: string;
  event_date: string;
  category: string;
  subcategory: string;
  detail: string;
}

export function personEventDateToIso(eventDate: string): string | null {
  const compact = eventDate.replace(/-/g, "");
  if (!/^\d{8}$/.test(compact)) return null;

  const iso = `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.toISOString().slice(0, 10) !== iso) return null;

  return iso;
}

export function parsePersonEventDate(eventDate: string): Date | null {
  const iso = personEventDateToIso(eventDate);
  if (!iso) return null;

  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toPersonEventCompactDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export function formatPersonEventTitle(event: Pick<PersonEvent, "subcategory" | "category">): string {
  return event.subcategory.trim() || event.category;
}

export function formatPersonEventDate(
  event: Pick<PersonEvent, "event_date">,
  locale?: string
): string {
  const iso = personEventDateToIso(event.event_date);
  if (!iso) return event.event_date;
  if (locale) {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  return formatEuropeanDateInput(iso);
}

export function getPersonEventCategoryLabel(category: string): string {
  if (category === "BE CAREFUL") return "Care";
  if (category === "RELATIONSHIP") return "Love";
  if (category === "WORK") return "Work";
  return category;
}

export function getPersonEventCategoryStyles(category: string): {
  background: string;
  color: string;
  border: string;
} {
  if (category === "RELATIONSHIP") {
    return {
      background: "rgba(245,134,203,0.14)",
      color: "#F0B8D8",
      border: "rgba(245,134,203,0.35)",
    };
  }
  if (category === "BE CAREFUL") {
    return {
      background: "rgba(245,158,11,0.12)",
      color: "#F5C26B",
      border: "rgba(245,158,11,0.35)",
    };
  }
  return {
    background: "rgba(149,133,204,0.14)",
    color: "#C8B8F0",
    border: "rgba(149,133,204,0.35)",
  };
}

export function comparePersonEventsNewestFirst(a: PersonEvent, b: PersonEvent): number {
  const aIso = personEventDateToIso(a.event_date);
  const bIso = personEventDateToIso(b.event_date);
  if (aIso && bIso && aIso !== bIso) {
    return bIso.localeCompare(aIso);
  }
  return String(b.id_event).localeCompare(String(a.id_event));
}
