export const defaultLocale = "en";

export const locales = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" as const },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" as const },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr" as const },
] as const;

export type Locale = (typeof locales)[number]["code"];

export const localeCodes = locales.map((l) => l.code);

export function isValidLocale(code: string): code is Locale {
  return localeCodes.includes(code as Locale);
}

export function getLocaleConfig(code: string) {
  return locales.find((l) => l.code === code);
}

export function getDirection(code: string): "ltr" | "rtl" {
  return getLocaleConfig(code)?.dir ?? "ltr";
}
