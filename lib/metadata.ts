import type { Metadata } from "next";
import { localeCodes } from "@/i18n/config";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://unfold-nine.vercel.app";

/**
 * Astrology-positioned, multi-language landing metadata.
 *
 * Adding a language: add an entry to TITLES + DESCRIPTIONS + KEYWORDS +
 * OG_LOCALES, and ensure i18n/config.ts + app/[locale]/page.tsx COPY +
 * lib/i18n-demo.ts STRINGS all match.
 *
 * SEO strategy: target "astrology app", "personal timing", and Co-Star
 * comparison terms. Different per market — Brazilians search differently
 * than US folks.
 */

const TITLES: Record<string, string> = {
  en: "Unfold — Premium Astrology Timing & Personal Momentum App",
  fr: "Unfold — App d'astrologie premium · Timing personnel et momentum quotidien",
  es: "Unfold — App de astrología premium · Timing personal y momentum diario",
  pt: "Unfold — App de astrologia premium · Timing pessoal e momentum diário",
  de: "Unfold — Premium-Astrologie-App · Persönliches Timing und tägliches Momentum",
  it: "Unfold — App di astrologia premium · Timing personale e momentum quotidiano",
  nl: "Unfold — Premium astrologie-app · Persoonlijke timing en dagelijks momentum",
  ja: "Unfold — プレミアム占星術アプリ · パーソナルタイミングと毎日のモメンタム",
  zh: "Unfold — 高级占星应用 · 个人时机与每日动量",
  ar: "Unfold — تطبيق علم الفلك المتميز · التوقيت الشخصي والزخم اليومي",
};

const DESCRIPTIONS: Record<string, string> = {
  en: "Pro-level astrological timing for modern life. Unfold reads your natal chart and current transits to reveal your peak windows in love, work, and growth. 7-day free trial. The Co-Star alternative built for premium users.",
  fr: "Astrologie pro pour la vie moderne. Unfold lit ton thème natal et tes transits actuels pour révéler tes pics énergétiques en amour, travail et créativité. 7 jours gratuits. L'alternative premium aux apps astro grand public.",
  es: "Astrología profesional para la vida moderna. Unfold lee tu carta natal y tus tránsitos actuales para revelar tus ventanas de pico en amor, trabajo y crecimiento. 7 días gratis. La alternativa premium a las apps de astrología masivas.",
  pt: "Astrologia profissional para a vida moderna. Unfold lê seu mapa natal e trânsitos atuais para revelar suas janelas de pico em amor, trabalho e crescimento. 7 dias grátis. A alternativa premium aos apps de astrologia populares.",
  de: "Profi-Astrologie für das moderne Leben. Unfold liest dein Geburtshoroskop und aktuelle Transite, um deine Höhepunkt-Fenster in Liebe, Arbeit und Wachstum zu zeigen. 7 Tage gratis.",
  it: "Astrologia professionale per la vita moderna. Unfold legge il tuo tema natale e i transiti attuali per rivelare le tue finestre di picco in amore, lavoro e crescita. 7 giorni gratis.",
  nl: "Professionele astrologie voor het moderne leven. Unfold leest je geboortehoroscoop en huidige transits om je piekvensters in liefde, werk en groei te onthullen. 7 dagen gratis.",
  ja: "現代生活のためのプロレベル占星術。あなたのネイタルチャートと現在のトランジットを読み、愛・仕事・成長のピークウィンドウを明らかにします。7日間無料トライアル。",
  zh: "为现代生活打造的专业占星。Unfold读取您的本命盘和当前过运,揭示您在爱情、工作和成长方面的高峰窗口。7天免费试用。",
  ar: "علم الفلك الاحترافي للحياة العصرية. يقرأ Unfold خريطتك الفلكية والعبور الحالي لكشف نوافذ الذروة في الحب والعمل والنمو. تجربة مجانية لمدة 7 أيام.",
};

const KEYWORDS: Record<string, string[]> = {
  en: ["astrology app", "horoscope", "transits", "natal chart", "personal timing", "co-star alternative", "best astrology app", "premium astrology", "compatibility", "lunar cycle"],
  fr: ["application astrologie", "horoscope", "transits", "thème natal", "timing personnel", "compatibilité astrologique", "astrologie premium", "cycle lunaire"],
  es: ["app astrología", "horóscopo", "tránsitos", "carta natal", "timing personal", "compatibilidad astrológica", "astrología premium", "ciclo lunar"],
  pt: ["app astrologia", "horóscopo", "trânsitos", "mapa natal", "timing pessoal", "compatibilidade astrológica", "astrologia premium", "ciclo lunar"],
  de: ["Astrologie App", "Horoskop", "Transite", "Geburtshoroskop", "persönliches Timing", "Astrologie Premium"],
  it: ["app astrologia", "oroscopo", "transiti", "tema natale", "timing personale", "astrologia premium"],
  nl: ["astrologie app", "horoscoop", "transits", "geboortehoroscoop", "persoonlijke timing"],
  ja: ["占星術 アプリ", "ホロスコープ", "トランジット", "ネイタルチャート", "パーソナルタイミング"],
  zh: ["占星应用", "星座", "过运", "本命盘", "个人时机"],
  ar: ["تطبيق علم الفلك", "البرج", "العبور الكوكبي", "خريطة فلكية", "التوقيت الشخصي"],
};

// Map our locale code to the OpenGraph locale tag (BCP 47)
const OG_LOCALES: Record<string, string> = {
  en: "en_US", fr: "fr_FR", es: "es_ES", pt: "pt_BR", de: "de_DE",
  it: "it_IT", nl: "nl_NL", ja: "ja_JP", zh: "zh_CN", ar: "ar_AE",
};

export function generateLandingMetadata(locale: string): Metadata {
  const title = TITLES[locale] ?? TITLES.en;
  const description = DESCRIPTIONS[locale] ?? DESCRIPTIONS.en;
  const keywords = KEYWORDS[locale] ?? KEYWORDS.en;
  const url = `${BASE_URL}/${locale}`;
  const ogLocale = OG_LOCALES[locale] ?? "en_US";

  // Build hreflang alternates — every supported locale + x-default
  const languages: Record<string, string> = {};
  for (const code of localeCodes) {
    languages[code] = `${BASE_URL}/${code}`;
  }
  languages["x-default"] = `${BASE_URL}/en`;

  // OpenGraph alternateLocales for cross-language discoverability
  const alternateLocales = Object.values(OG_LOCALES).filter((l) => l !== ogLocale);

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Unfold",
      url,
      locale: ogLocale,
      alternateLocale: alternateLocales,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@unfoldapp",
    },
    applicationName: "Unfold",
    category: "lifestyle",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
