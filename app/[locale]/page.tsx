import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { generateLandingMetadata } from "@/lib/metadata";

// Native build: expose static params so Next.js knows which locales to pre-render
export function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_NATIVE !== "true") return [];
  return [{ locale: "fr" }, { locale: "en" }, { locale: "es" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateLandingMetadata(locale);
}

// ─── Hardcoded landing copy (resilient: no DB dep) ─────────────────────
// We tried DB-backed Prisma translations but the production tables don't
// exist in Supabase yet. To unblock revenue + SEO, we ship an
// astrology-focused landing with inline copy. Marketing iterates on this
// component instead of the seed.

type LocaleCode = "fr" | "en" | "es" | "de" | "it" | "pt" | "nl" | "ja" | "zh" | "ar";

const COPY: Record<LocaleCode, {
  hero_eyebrow: string;
  hero_title: string;
  hero_sub: string;
  cta_primary: string;
  cta_secondary: string;
  feat1_title: string; feat1_body: string;
  feat2_title: string; feat2_body: string;
  feat3_title: string; feat3_body: string;
  pricing_title: string;
  pricing_sub: string;
  trial: string;
  footer_legal: string;
}> = {
  fr: {
    hero_eyebrow: "Astrologie premium · Timing personnel",
    hero_title: "Sache quand la vie joue en ta faveur",
    hero_sub: "Unfold lit ton thème natal et tes transits actuels pour révéler tes pics énergétiques — amour, travail, créativité. Sans horoscope cucul.",
    cta_primary: "Ouvrir l'app",
    cta_secondary: "Voir les plans",
    feat1_title: "Tes pics, en temps réel",
    feat1_body: "Détection des transits planétaires majeurs sur ton thème — pas un horoscope générique, ton timing à toi.",
    feat2_title: "12 domaines de vie",
    feat2_body: "Maison par maison : amour, carrière, foyer, finances, créativité, santé. Vois où l'énergie se concentre cette semaine.",
    feat3_title: "Compatibilité de timing",
    feat3_body: "Compare ton momentum avec celui de tes proches. Quand vos pics s'alignent, tout devient plus fluide.",
    pricing_title: "Gratuit pour commencer",
    pricing_sub: "7 jours d'essai Pro sans carte bancaire. Annulable à tout moment.",
    trial: "Essai gratuit 7 jours",
    footer_legal: "© 2026 Unfold. Tous droits réservés.",
  },
  en: {
    hero_eyebrow: "Premium astrology · Personal timing",
    hero_title: "Know when life moves in your favor",
    hero_sub: "Unfold reads your natal chart and current transits to reveal your peak windows — love, work, creativity. Without the horoscope cringe.",
    cta_primary: "Open the app",
    cta_secondary: "See plans",
    feat1_title: "Your peaks, in real time",
    feat1_body: "Detects major planetary transits across your chart — not a generic horoscope, your actual timing.",
    feat2_title: "12 life domains",
    feat2_body: "House by house: love, career, home, money, creativity, health. See where the energy is concentrating this week.",
    feat3_title: "Timing compatibility",
    feat3_body: "Compare your momentum with people you care about. When your peaks align, everything flows easier.",
    pricing_title: "Free to start",
    pricing_sub: "7-day Pro trial, no credit card. Cancel anytime.",
    trial: "Free 7-day trial",
    footer_legal: "© 2026 Unfold. All rights reserved.",
  },
  es: {
    hero_eyebrow: "Astrología premium · Timing personal",
    hero_title: "Descubre cuándo la vida se mueve a tu favor",
    hero_sub: "Unfold lee tu carta natal y tus tránsitos actuales para revelar tus ventanas de pico — amor, trabajo, creatividad. Sin horóscopos cursis.",
    cta_primary: "Abrir la app",
    cta_secondary: "Ver planes",
    feat1_title: "Tus picos, en tiempo real",
    feat1_body: "Detecta los tránsitos planetarios mayores en tu carta — no un horóscopo genérico, tu timing real.",
    feat2_title: "12 dominios de vida",
    feat2_body: "Casa por casa: amor, carrera, hogar, dinero, creatividad, salud. Ve dónde se concentra la energía esta semana.",
    feat3_title: "Compatibilidad de timing",
    feat3_body: "Compara tu momentum con tus seres queridos. Cuando vuestros picos se alinean, todo fluye mejor.",
    pricing_title: "Gratis para empezar",
    pricing_sub: "Prueba Pro de 7 días sin tarjeta. Cancela cuando quieras.",
    trial: "Prueba gratis 7 días",
    footer_legal: "© 2026 Unfold. Todos los derechos reservados.",
  },
  pt: {
    hero_eyebrow: "Astrologia premium · Timing pessoal",
    hero_title: "Saiba quando a vida age a seu favor",
    hero_sub: "Unfold lê seu mapa natal e seus trânsitos atuais para revelar suas janelas de pico — amor, trabalho, criatividade. Sem horóscopo bobo.",
    cta_primary: "Abrir o app",
    cta_secondary: "Ver planos",
    feat1_title: "Seus picos, em tempo real",
    feat1_body: "Detecta os trânsitos planetários maiores no seu mapa — não um horóscopo genérico, o seu timing real.",
    feat2_title: "12 áreas da vida",
    feat2_body: "Casa por casa: amor, carreira, lar, dinheiro, criatividade, saúde. Veja onde a energia está concentrada esta semana.",
    feat3_title: "Compatibilidade de timing",
    feat3_body: "Compare seu momentum com pessoas próximas. Quando seus picos se alinham, tudo flui melhor.",
    pricing_title: "Grátis para começar",
    pricing_sub: "Teste Pro de 7 dias sem cartão. Cancele quando quiser.",
    trial: "Teste grátis 7 dias",
    footer_legal: "© 2026 Unfold. Todos os direitos reservados.",
  },
  de: {
    hero_eyebrow: "Premium-Astrologie · Persönliches Timing",
    hero_title: "Wisse wann das Leben für dich spielt",
    hero_sub: "Unfold liest dein Geburtshoroskop und aktuelle Transite, um deine Höhepunkt-Fenster zu zeigen — Liebe, Arbeit, Kreativität.",
    cta_primary: "App öffnen",
    cta_secondary: "Pläne ansehen",
    feat1_title: "Deine Höhepunkte, in Echtzeit",
    feat1_body: "Erkennt große planetare Transite über dein Horoskop — kein generisches Horoskop, dein echtes Timing.",
    feat2_title: "12 Lebensbereiche",
    feat2_body: "Haus für Haus: Liebe, Karriere, Zuhause, Geld, Kreativität, Gesundheit. Sieh wo sich die Energie diese Woche konzentriert.",
    feat3_title: "Timing-Kompatibilität",
    feat3_body: "Vergleiche dein Momentum mit Menschen, die dir wichtig sind. Wenn eure Höhepunkte sich ausrichten, fließt alles leichter.",
    pricing_title: "Kostenlos starten",
    pricing_sub: "7-Tage-Pro-Test, keine Kreditkarte. Jederzeit kündbar.",
    trial: "7 Tage kostenlos testen",
    footer_legal: "© 2026 Unfold. Alle Rechte vorbehalten.",
  },
  it: {
    hero_eyebrow: "Astrologia premium · Timing personale",
    hero_title: "Sappi quando la vita gioca a tuo favore",
    hero_sub: "Unfold legge il tuo tema natale e i tuoi transiti attuali per rivelare le tue finestre di picco — amore, lavoro, creatività.",
    cta_primary: "Apri l'app",
    cta_secondary: "Vedi piani",
    feat1_title: "I tuoi picchi, in tempo reale",
    feat1_body: "Rileva i transiti planetari maggiori sul tuo tema — non un oroscopo generico, il tuo timing reale.",
    feat2_title: "12 ambiti di vita",
    feat2_body: "Casa per casa: amore, carriera, casa, denaro, creatività, salute. Vedi dove si concentra l'energia questa settimana.",
    feat3_title: "Compatibilità di timing",
    feat3_body: "Confronta il tuo momentum con le persone a cui tieni. Quando i vostri picchi si allineano, tutto scorre meglio.",
    pricing_title: "Gratis per iniziare",
    pricing_sub: "Prova Pro di 7 giorni senza carta. Annulla quando vuoi.",
    trial: "Prova gratis 7 giorni",
    footer_legal: "© 2026 Unfold. Tutti i diritti riservati.",
  },
  nl: {
    hero_eyebrow: "Premium astrologie · Persoonlijke timing",
    hero_title: "Weet wanneer het leven in jouw voordeel beweegt",
    hero_sub: "Unfold leest je geboortehoroscoop en huidige transits om je piekvensters te onthullen — liefde, werk, creativiteit.",
    cta_primary: "Open de app",
    cta_secondary: "Bekijk abonnementen",
    feat1_title: "Jouw pieken, in real-time",
    feat1_body: "Detecteert grote planetaire transits over je horoscoop — geen generieke horoscoop, jouw echte timing.",
    feat2_title: "12 levensdomeinen",
    feat2_body: "Huis voor huis: liefde, carrière, thuis, geld, creativiteit, gezondheid. Zie waar de energie deze week zit.",
    feat3_title: "Timing-compatibiliteit",
    feat3_body: "Vergelijk je momentum met dierbaren. Wanneer jullie pieken samenvallen, gaat alles makkelijker.",
    pricing_title: "Gratis te starten",
    pricing_sub: "7-daagse Pro-proefperiode, geen creditcard. Altijd opzegbaar.",
    trial: "7 dagen gratis",
    footer_legal: "© 2026 Unfold. Alle rechten voorbehouden.",
  },
  ja: {
    hero_eyebrow: "プレミアム占星術 · パーソナルタイミング",
    hero_title: "人生があなたの味方をする時を知る",
    hero_sub: "Unfoldはあなたのネイタルチャートと現在のトランジットを読み、あなたのピークウィンドウを明らかにします — 愛、仕事、創造性。",
    cta_primary: "アプリを開く",
    cta_secondary: "プランを見る",
    feat1_title: "あなたのピーク、リアルタイム",
    feat1_body: "あなたのチャートの主要な惑星トランジットを検出 — 一般的な占いではなく、あなた本当のタイミング。",
    feat2_title: "12のライフドメイン",
    feat2_body: "ハウス毎: 愛、キャリア、家、お金、創造性、健康。今週どこにエネルギーが集中するかを見る。",
    feat3_title: "タイミングの相性",
    feat3_body: "大切な人とあなたのモメンタムを比較。ピークが揃うと、すべてがスムーズに。",
    pricing_title: "無料で始める",
    pricing_sub: "7日間Proトライアル、クレジットカード不要。いつでもキャンセル。",
    trial: "7日間無料トライアル",
    footer_legal: "© 2026 Unfold. 全権利所有。",
  },
  zh: {
    hero_eyebrow: "高级占星 · 个人时机",
    hero_title: "知道何时生活向你倾斜",
    hero_sub: "Unfold读取您的本命盘和当前过运,揭示您的高峰窗口 — 爱情、工作、创造力。",
    cta_primary: "打开应用",
    cta_secondary: "查看计划",
    feat1_title: "您的高峰,实时显示",
    feat1_body: "检测您星图上的主要行星过运 — 不是通用星座,而是您真实的时机。",
    feat2_title: "12个生活领域",
    feat2_body: "宫位逐一: 爱情、事业、家庭、金钱、创造力、健康。看本周能量聚集在哪里。",
    feat3_title: "时机兼容性",
    feat3_body: "将您的动量与亲近的人比较。当您的高峰对齐时,一切更加顺畅。",
    pricing_title: "免费开始",
    pricing_sub: "7天Pro试用,无需信用卡。随时取消。",
    trial: "免费7天试用",
    footer_legal: "© 2026 Unfold. 保留所有权利。",
  },
  ar: {
    hero_eyebrow: "علم الفلك المتميز · التوقيت الشخصي",
    hero_title: "اعرف متى تعمل الحياة لصالحك",
    hero_sub: "يقرأ Unfold خريطتك الفلكية والعبور الحالي لكشف نوافذ الذروة لديك — الحب والعمل والإبداع.",
    cta_primary: "افتح التطبيق",
    cta_secondary: "اعرض الخطط",
    feat1_title: "ذروتك، في الوقت الفعلي",
    feat1_body: "اكتشف العبور الكوكبي الرئيسي عبر خريطتك — ليس برجاً عاماً، بل توقيتك الحقيقي.",
    feat2_title: "12 مجالاً حياتياً",
    feat2_body: "بيت بيت: الحب، المسيرة المهنية، المنزل، المال، الإبداع، الصحة. شاهد أين تتركز الطاقة هذا الأسبوع.",
    feat3_title: "توافق التوقيت",
    feat3_body: "قارن زخمك مع من تهتم بهم. عندما تتوافق ذروات، يتدفق كل شيء بسهولة أكبر.",
    pricing_title: "مجاني للبدء",
    pricing_sub: "تجربة Pro لمدة 7 أيام، بدون بطاقة ائتمان. إلغاء في أي وقت.",
    trial: "تجربة مجانية لمدة 7 أيام",
    footer_legal: "© 2026 Unfold. جميع الحقوق محفوظة.",
  },
};

function getCopy(locale: string) {
  return COPY[locale as LocaleCode] ?? COPY.en;
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // In native builds there's no landing page — go straight to the app
  if (process.env.NEXT_PUBLIC_NATIVE === "true") {
    redirect("/demo");
  }

  const { locale } = await params;
  const c = getCopy(locale);
  const isRTL = locale === "ar";

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen" style={{ background: "var(--bg-primary, #1B1535)" }}>
      {/* Ambient gradient */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124, 107, 191, 0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 0% 80%, rgba(233, 61, 130, 0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-20 pb-24 text-center">
        {/* Logo */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <Image src="/logo/icon-mark.svg" alt="" width={36} height={36} priority />
          <span className="font-display text-[22px] font-normal text-brand-11" style={{ letterSpacing: "0.2em" }}>
            unfold
          </span>
        </div>

        {/* Hero */}
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--accent-purple, #9585CC)" }}>
          {c.hero_eyebrow}
        </p>
        <h1
          className="font-display text-[40px] font-bold leading-[1.05] md:text-[56px]"
          style={{ color: "var(--text-heading, #E6E2F2)", letterSpacing: -1 }}
        >
          {c.hero_title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed md:text-[17px]" style={{ color: "var(--text-body-subtle, #BFB6D6)" }}>
          {c.hero_sub}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[14px] font-semibold transition-transform hover:scale-105"
            style={{
              background: "var(--accent-purple, #9585CC)",
              color: "#fff",
              boxShadow: "0 0 30px color-mix(in srgb, var(--accent-purple, #9585CC) 35%, transparent), 0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            {c.cta_primary}
          </Link>
          <Link
            href="/demo/pricing"
            className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[14px] font-semibold transition-opacity hover:opacity-80"
            style={{
              border: "1px solid color-mix(in srgb, var(--accent-purple, #9585CC) 30%, transparent)",
              color: "var(--accent-purple, #9585CC)",
            }}
          >
            {c.cta_secondary}
          </Link>
        </div>
        <p className="mt-3 text-[12px]" style={{ color: "var(--text-body-subtle, #BFB6D6)" }}>
          {c.trial}
        </p>

        {/* Features */}
        <div className="mt-24 grid gap-6 text-left md:grid-cols-3">
          {[
            { t: c.feat1_title, b: c.feat1_body },
            { t: c.feat2_title, b: c.feat2_body },
            { t: c.feat3_title, b: c.feat3_body },
          ].map((f) => (
            <div
              key={f.t}
              className="rounded-2xl p-6"
              style={{
                background: "color-mix(in srgb, var(--accent-purple, #9585CC) 5%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent-purple, #9585CC) 12%, transparent)",
              }}
            >
              <h3 className="text-[16px] font-bold" style={{ color: "var(--text-heading, #E6E2F2)" }}>
                {f.t}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-body-subtle, #BFB6D6)" }}>
                {f.b}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing teaser */}
        <div className="mt-20 text-center">
          <h2
            className="font-display text-[28px] font-bold md:text-[36px]"
            style={{ color: "var(--text-heading, #E6E2F2)", letterSpacing: -0.5 }}
          >
            {c.pricing_title}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px]" style={{ color: "var(--text-body-subtle, #BFB6D6)" }}>
            {c.pricing_sub}
          </p>
          <Link
            href="/demo/pricing"
            className="mt-6 inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[14px] font-semibold transition-transform hover:scale-105"
            style={{
              background: "var(--accent-purple, #9585CC)",
              color: "#fff",
              boxShadow: "0 0 30px color-mix(in srgb, var(--accent-purple, #9585CC) 35%, transparent)",
            }}
          >
            {c.cta_secondary}
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-24 text-[10px]" style={{ color: "var(--text-body-subtle, #BFB6D6)", opacity: 0.6 }}>
          {c.footer_legal}
        </p>
      </div>
    </main>
  );
}
