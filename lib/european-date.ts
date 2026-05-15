export const EU_DATE_PLACEHOLDER = "DD/MM/YYYY";

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function formatIsoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function normalizeBirthIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return formatIsoDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  }

  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return match[1];
  }

  return trimmed.split("T")[0] ?? "";
}

export function formatEuropeanDateInput(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

export function formatEuropeanDateDraft(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (!digits) {
    return "";
  }
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function parseEuropeanDateInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (isValidCalendarDate(year, month, day)) {
      return formatIsoDate(year, month, day);
    }
    return null;
  }

  const localMatch = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (localMatch) {
    const day = Number(localMatch[1]);
    const month = Number(localMatch[2]);
    let year = Number(localMatch[3]);
    if (year < 100) {
      year += year >= 50 ? 1900 : 2000;
    }
    if (isValidCalendarDate(year, month, day)) {
      return formatIsoDate(year, month, day);
    }
  }

  return null;
}

export function formatEuropeanDisplayDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
): string {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

export function isIsoDateWithinRange(value: string, min?: string, max?: string): boolean {
  if (min && value < min) {
    return false;
  }
  if (max && value > max) {
    return false;
  }
  return true;
}
