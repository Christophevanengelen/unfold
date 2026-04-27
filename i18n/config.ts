/**
 * Landing page locales — should match lib/i18n-demo.ts SUPPORTED_LOCALES
 * for full multi-language coverage across landing + app.
 *
 * Adding a language: add an entry here AND a copy block in
 * app/[locale]/page.tsx COPY map AND lib/i18n-demo.ts STRINGS.
 */

export const defaultLocale = "en";

export const locales = [
  { code: "en", name: "English",     nativeName: "English",     dir: "ltr" as const },
  { code: "fr", name: "French",      nativeName: "Français",    dir: "ltr" as const },
  { code: "es", name: "Spanish",     nativeName: "Español",     dir: "ltr" as const },
  { code: "pt", name: "Portuguese",  nativeName: "Português",   dir: "ltr" as const },
  { code: "de", name: "German",      nativeName: "Deutsch",     dir: "ltr" as const },
  { code: "it", name: "Italian",     nativeName: "Italiano",    dir: "ltr" as const },
  { code: "nl", name: "Dutch",       nativeName: "Nederlands",  dir: "ltr" as const },
  { code: "ja", name: "Japanese",    nativeName: "日本語",        dir: "ltr" as const },
  { code: "zh", name: "Chinese",     nativeName: "中文",          dir: "ltr" as const },
  { code: "ar", name: "Arabic",      nativeName: "العربية",      dir: "rtl" as const },
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
