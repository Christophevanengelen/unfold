export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { generateLandingMetadata } from "@/lib/metadata";
import { LifetimeChartTeaser } from "@/components/landing/LifetimeChartTeaser";
import { BirthdayGraphTeaser } from "@/components/landing/BirthdayGraphTeaser";
import { ZRSpiritTeaser } from "@/components/landing/ZRSpiritTeaser";

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
  chart_eyebrow: string;
  chart_title: string;
  chart_sub: string;
  chart_cta: string;
  birthday_eyebrow: string;
  birthday_title: string;
  birthday_sub: string;
  birthday_cta: string;
  spirit_eyebrow: string;
  spirit_title: string;
  spirit_sub: string;
  spirit_cta: string;
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
    chart_eyebrow: "Rapport à vie · Premium",
    chart_title: "Toute ta vie, déroulée.",
    chart_sub: "Une chronologie visuelle de 100 ans de ton rythme astrologique — chaque pic, chaque cycle, chaque fenêtre. Générée depuis tes données de naissance.",
    chart_cta: "Voir mon rapport",
    birthday_eyebrow: "Graphe Anniversaire · Premium",
    birthday_title: "Ton année, décodée.",
    birthday_sub: "Chaque anniversaire ouvre un nouveau chapitre. Découvre quelles années sont pivots — et pourquoi.",
    birthday_cta: "Voir mon graphe",
    spirit_eyebrow: "Spirit Wave · ZR · Premium",
    spirit_title: "Ton souffle de vie, en courbe.",
    spirit_sub: "Le Lot de l'Esprit révèle tes grandes saisons de destin. Vois tes culminations, tes transitions, ton moment présent.",
    spirit_cta: "Voir ma Spirit Wave",
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
    chart_eyebrow: "Lifetime Report · Premium",
    chart_title: "Your entire life, unrolled.",
    chart_sub: "A 100-year visual timeline of your astrological rhythm — every peak, every cycle, every window. Generated from your birth data.",
    chart_cta: "See my lifetime chart",
    birthday_eyebrow: "Birthday Graph · Premium",
    birthday_title: "Your year, decoded.",
    birthday_sub: "Every birthday opens a new chapter. See which years are pivotal — and why.",
    birthday_cta: "See my birthday graph",
    spirit_eyebrow: "Spirit Wave · ZR · Premium",
    spirit_title: "Your life's breath, as a wave.",
    spirit_sub: "The Lot of Spirit reveals your great seasons of destiny. See your culminations, transitions, and where you are right now.",
    spirit_cta: "See my Spirit Wave",
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
    chart_eyebrow: "Informe de vida · Premium",
    chart_title: "Tu vida entera, desplegada.",
    chart_sub: "Una línea de tiempo visual de 100 años de tu ritmo astrológico — cada pico, cada ciclo, cada ventana. Generada desde tus datos de nacimiento.",
    chart_cta: "Ver mi gráfico",
    birthday_eyebrow: "Gráfico de Cumpleaños · Premium",
    birthday_title: "Tu año, descifrado.",
    birthday_sub: "Cada cumpleaños abre un nuevo capítulo. Descubre qué años son pivotales — y por qué.",
    birthday_cta: "Ver mi gráfico de cumpleaños",
    spirit_eyebrow: "Spirit Wave · ZR · Premium",
    spirit_title: "El aliento de tu vida, en curva.",
    spirit_sub: "El Lote del Espíritu revela tus grandes temporadas de destino. Ve tus culminaciones, transiciones y dónde estás ahora.",
    spirit_cta: "Ver mi Spirit Wave",
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
    chart_eyebrow: "Relatório vitalício · Premium",
    chart_title: "Toda a sua vida, desenrolada.",
    chart_sub: "Uma linha do tempo visual de 100 anos do seu ritmo astrológico — cada pico, cada ciclo, cada janela. Gerada a partir dos seus dados de nascimento.",
    chart_cta: "Ver meu gráfico",
    birthday_eyebrow: "Gráfico de Aniversário · Premium",
    birthday_title: "Seu ano, decodificado.",
    birthday_sub: "Cada aniversário abre um novo capítulo. Veja quais anos são pivotais — e por quê.",
    birthday_cta: "Ver meu gráfico de aniversário",
    spirit_eyebrow: "Spirit Wave · ZR · Premium",
    spirit_title: "O sopro da sua vida, em curva.",
    spirit_sub: "O Lote do Espírito revela suas grandes temporadas de destino. Veja suas culminações, transições e onde você está agora.",
    spirit_cta: "Ver minha Spirit Wave",
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
    chart_eyebrow: "Lebenslanger Report · Premium",
    chart_title: "Dein ganzes Leben, entfaltet.",
    chart_sub: "Eine visuelle 100-Jahres-Zeitleiste deines astrologischen Rhythmus — jeder Höhepunkt, jeder Zyklus, jedes Fenster. Aus deinen Geburtsdaten generiert.",
    chart_cta: "Meinen Chart sehen",
    birthday_eyebrow: "Geburtstags-Grafik · Premium",
    birthday_title: "Dein Jahr, entschlüsselt.",
    birthday_sub: "Jeder Geburtstag öffnet ein neues Kapitel. Sieh welche Jahre wegweisend sind — und warum.",
    birthday_cta: "Meine Geburtstagsgrafik sehen",
    spirit_eyebrow: "Spirit Wave · ZR · Premium",
    spirit_title: "Der Atemzug deines Lebens, als Welle.",
    spirit_sub: "Das Los des Geistes enthüllt deine großen Schicksalssaisonen. Sieh deine Höhepunkte, Übergänge und wo du jetzt stehst.",
    spirit_cta: "Meine Spirit Wave sehen",
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
    chart_eyebrow: "Report a vita · Premium",
    chart_title: "La tua intera vita, dispiegata.",
    chart_sub: "Una cronologia visiva di 100 anni del tuo ritmo astrologico — ogni picco, ogni ciclo, ogni finestra. Generata dai tuoi dati di nascita.",
    chart_cta: "Vedi il mio grafico",
    birthday_eyebrow: "Grafico di Compleanno · Premium",
    birthday_title: "Il tuo anno, decodificato.",
    birthday_sub: "Ogni compleanno apre un nuovo capitolo. Scopri quali anni sono pivotali — e perché.",
    birthday_cta: "Vedi il mio grafico di compleanno",
    spirit_eyebrow: "Spirit Wave · ZR · Premium",
    spirit_title: "Il respiro della tua vita, in curva.",
    spirit_sub: "Il Lotto dello Spirito rivela le tue grandi stagioni di destino. Vedi le tue culminazioni, transizioni e dove sei ora.",
    spirit_cta: "Vedi la mia Spirit Wave",
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
    chart_eyebrow: "Levenslang rapport · Premium",
    chart_title: "Jouw hele leven, uitgerold.",
    chart_sub: "Een visuele tijdlijn van 100 jaar van jouw astrologische ritme — elke piek, elke cyclus, elk venster. Gegenereerd uit jouw geboortegegevens.",
    chart_cta: "Bekijk mijn grafiek",
    birthday_eyebrow: "Verjaardagsgrafiek · Premium",
    birthday_title: "Jouw jaar, ontcijferd.",
    birthday_sub: "Elke verjaardag opent een nieuw hoofdstuk. Zie welke jaren pivotaal zijn — en waarom.",
    birthday_cta: "Bekijk mijn verjaardagsgrafiek",
    spirit_eyebrow: "Spirit Wave · ZR · Premium",
    spirit_title: "De adem van jouw leven, als golf.",
    spirit_sub: "Het Lot van de Geest onthult jouw grote lotsbestemmingen. Zie jouw hoogtepunten, overgangen en waar je nu staat.",
    spirit_cta: "Bekijk mijn Spirit Wave",
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
    chart_eyebrow: "生涯レポート · プレミアム",
    chart_title: "あなたの人生全体、展開。",
    chart_sub: "あなたの星座リズムの100年ビジュアルタイムライン — すべてのピーク、サイクル、ウィンドウ。生年月日データから生成。",
    chart_cta: "生涯チャートを見る",
    birthday_eyebrow: "バースデーグラフ · プレミアム",
    birthday_title: "あなたの1年、解読。",
    birthday_sub: "誕生日ごとに新しい章が始まります。どの年が転換点か — そしてなぜかを見てください。",
    birthday_cta: "バースデーグラフを見る",
    spirit_eyebrow: "Spirit Wave · ZR · プレミアム",
    spirit_title: "あなたの人生の息吹、波として。",
    spirit_sub: "スピリットのロットはあなたの運命の大きな季節を明らかにします。頂点、転換点、そして今いる場所を見てください。",
    spirit_cta: "Spirit Waveを見る",
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
    chart_eyebrow: "终身报告 · 高级",
    chart_title: "您的整个人生，展开。",
    chart_sub: "您星座节律的100年可视化时间线 — 每个高峰、每个周期、每个窗口。从您的出生数据生成。",
    chart_cta: "查看我的图表",
    birthday_eyebrow: "生日图表 · 高级",
    birthday_title: "您的年份，解码。",
    birthday_sub: "每个生日开启新篇章。看看哪些年份是关键转折点 — 以及为什么。",
    birthday_cta: "查看我的生日图表",
    spirit_eyebrow: "Spirit Wave · ZR · 高级",
    spirit_title: "您生命的气息，化为波浪。",
    spirit_sub: "精神之星揭示您命运的伟大季节。查看您的顶峰、过渡期以及您现在所处的位置。",
    spirit_cta: "查看我的Spirit Wave",
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
    chart_eyebrow: "تقرير العمر · متميز",
    chart_title: "حياتك بأكملها، منشورة.",
    chart_sub: "جدول زمني مرئي لمدة 100 عام لإيقاعك الفلكي — كل ذروة، كل دورة، كل نافذة. مُنشأ من بيانات ميلادك.",
    chart_cta: "انظر مخططي",
    birthday_eyebrow: "مخطط عيد الميلاد · متميز",
    birthday_title: "عامك، مُفكَّك.",
    birthday_sub: "كل عيد ميلاد يفتح فصلاً جديداً. اكتشف أي السنوات محورية — ولماذا.",
    birthday_cta: "انظر مخطط عيد ميلادي",
    spirit_eyebrow: "Spirit Wave · ZR · متميز",
    spirit_title: "نفس حياتك، كموجة.",
    spirit_sub: "قرعة الروح تكشف مواسمك الكبرى في القدر. شاهد ذروتك وانتقالاتك وأين أنت الآن.",
    spirit_cta: "انظر Spirit Wave الخاصة بي",
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
    redirect("/app");
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
            href="/app"
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
            href="/app/pricing"
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

        {/* Premium chart teasers — desktop only, side by side */}
        <div className="mt-24 hidden md:grid md:grid-cols-2 md:gap-6">
          <LifetimeChartTeaser
            chartEyebrow={c.chart_eyebrow}
            chartTitle={c.chart_title}
            chartSub={c.chart_sub}
            chartCta={c.chart_cta}
          />
          <BirthdayGraphTeaser
            eyebrow={c.birthday_eyebrow}
            title={c.birthday_title}
            sub={c.birthday_sub}
            cta={c.birthday_cta}
          />
        </div>

        {/* Spirit Wave teaser — full width */}
        <div className="mt-6 hidden md:block">
          <ZRSpiritTeaser
            eyebrow={c.spirit_eyebrow}
            title={c.spirit_title}
            sub={c.spirit_sub}
            cta={c.spirit_cta}
          />
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
            href="/app/pricing"
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
