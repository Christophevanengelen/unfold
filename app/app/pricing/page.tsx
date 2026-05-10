"use client";

/**
 * /demo/pricing — In-app pricing page used by PremiumTeaser CTA.
 *
 * Why a separate page from /[locale]/pricing:
 * - Lives inside the demo layout (matches app context, safe areas, theme)
 * - Uses lib/i18n-demo.ts (10 languages with auto-detect) instead of the
 *   landing site's DB-driven 3-locale i18n
 * - No dependency on the landing /[locale] route (which has its own bug)
 * - Hidden on iOS bundle per Apple anti-steering rule 3.1.1
 *
 * Stripe Checkout receives the user's locale so the payment page renders
 * in the right language for all 10 supported languages.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronLeft } from "flowbite-react-icons/outline";
import { useAuth } from "@/lib/auth-context";
import { AuthSheet } from "@/components/demo/AuthSheet";
import { isIOSBundle } from "@/lib/platform";
import { PLANS } from "@/lib/billing/features";
import { t, detectLocale, type Locale } from "@/lib/i18n-demo";

// ─── Localized copy for this page ────────────────────────────────
// Inline since these strings are page-specific. Other UI lives in i18n-demo.ts.
const PAGE_COPY: Record<Locale, {
  title: string;
  sub: string;
  free: string;
  pro: string;
  free_desc: string;
  pro_desc: string;
  monthly: string;
  annually: string;
  save: string;
  savings: string;          // "{X} € per year"
  popular: string;
  current_plan: string;
  start_trial: string;
  current_billing_month: string;     // "/month"
  billed_annually: string;            // "billed {X} per year"
  features: { free: string[]; pro: string[] };
  disclosure: string[];                // legal lines (web only)
  back: string;
  ios_blocked: string;                 // shown on iOS in place of CTA
}> = {
  fr: {
    title: "Gratuit maintenant.\nPro quand tu es prêt.",
    sub: "7 jours gratuits pour explorer ton timeline complet — sans carte bancaire.",
    free: "Gratuit", pro: "Pro",
    free_desc: "Ton signal du moment, toujours disponible.",
    pro_desc: "Ton momentum complet — passé, présent, futur.",
    monthly: "Mensuel", annually: "Annuel", save: "-25%",
    savings: "Tu économises {x} € par an",
    popular: "Le plus populaire",
    current_plan: "Ton plan actuel",
    start_trial: "Démarrer 7 jours gratuits",
    current_billing_month: "/mois",
    billed_annually: "facturé {x} € / an",
    features: {
      free: ["Signal du moment", "Mots-clés planétaires", "Historique passé", "1 connexion (matching)", "1 délinéation IA / semaine"],
      pro:  ["Tout le gratuit, sans limite", "Timeline complète 36 mois", "Fenêtres futures débloquées", "Alertes de pics en temps réel", "Délinéations IA illimitées", "Brief quotidien personnalisé", "Connexions illimitées", "Digest hebdomadaire"],
    },
    disclosure: [
      "Renouvellement automatique. Annulable à tout moment depuis ton compte.",
      "Droit de rétractation 14 jours (Article 16, Directive 2011/83/UE).",
      "Prix TTC, TVA incluse selon ton pays de résidence.",
    ],
    back: "Retour",
    ios_blocked: "Disponible dans la version Pro de l'app",
  },
  en: {
    title: "Free now.\nPro when you're ready.",
    sub: "7 days free to explore your full timeline — no credit card.",
    free: "Free", pro: "Pro",
    free_desc: "Your current signal, always available.",
    pro_desc: "Your full momentum — past, present, future.",
    monthly: "Monthly", annually: "Annual", save: "-25%",
    savings: "You save €{x} per year",
    popular: "Most popular",
    current_plan: "Your current plan",
    start_trial: "Start 7-day free trial",
    current_billing_month: "/month",
    billed_annually: "billed €{x} per year",
    features: {
      free: ["Current signal", "Planet keywords", "Past history", "1 connection (matching)", "1 AI delineation / week"],
      pro:  ["Everything free, unlimited", "Full 36-month timeline", "Future windows unlocked", "Real-time peak alerts", "Unlimited AI delineations", "Personal daily brief", "Unlimited connections", "Weekly digest"],
    },
    disclosure: [
      "Auto-renews. Cancel anytime from your account.",
      "14-day right of withdrawal (EU Directive 2011/83/EU, Art. 16).",
      "VAT included based on your country of residence.",
    ],
    back: "Back",
    ios_blocked: "Available in the Pro version of the app",
  },
  es: {
    title: "Gratis ahora.\nPro cuando quieras.",
    sub: "7 días gratis para explorar tu línea de tiempo completa — sin tarjeta.",
    free: "Gratis", pro: "Pro",
    free_desc: "Tu señal actual, siempre disponible.",
    pro_desc: "Tu momentum completo — pasado, presente, futuro.",
    monthly: "Mensual", annually: "Anual", save: "-25%",
    savings: "Ahorras {x} € al año",
    popular: "El más popular",
    current_plan: "Tu plan actual",
    start_trial: "Empezar 7 días gratis",
    current_billing_month: "/mes",
    billed_annually: "facturado {x} € / año",
    features: {
      free: ["Señal del momento", "Palabras planetarias", "Historial pasado", "1 conexión (matching)", "1 análisis IA / semana"],
      pro:  ["Todo gratis, sin límite", "Línea de tiempo de 36 meses", "Ventanas futuras desbloqueadas", "Alertas de picos en tiempo real", "Análisis IA ilimitados", "Brief diario personalizado", "Conexiones ilimitadas", "Resumen semanal"],
    },
    disclosure: [
      "Renovación automática. Cancela cuando quieras desde tu cuenta.",
      "Derecho de desistimiento de 14 días (Directiva UE 2011/83/UE, Art. 16).",
      "IVA incluido según tu país de residencia.",
    ],
    back: "Atrás",
    ios_blocked: "Disponible en la versión Pro de la app",
  },
  pt: {
    title: "Grátis agora.\nPro quando quiser.",
    sub: "7 dias grátis para explorar sua timeline completa — sem cartão.",
    free: "Grátis", pro: "Pro",
    free_desc: "Seu sinal atual, sempre disponível.",
    pro_desc: "Seu momentum completo — passado, presente, futuro.",
    monthly: "Mensal", annually: "Anual", save: "-25%",
    savings: "Você economiza {x} € por ano",
    popular: "O mais popular",
    current_plan: "Seu plano atual",
    start_trial: "Começar 7 dias grátis",
    current_billing_month: "/mês",
    billed_annually: "cobrado {x} € por ano",
    features: {
      free: ["Sinal do momento", "Palavras planetárias", "Histórico passado", "1 conexão (matching)", "1 análise IA / semana"],
      pro:  ["Tudo grátis, sem limite", "Timeline completa 36 meses", "Janelas futuras desbloqueadas", "Alertas de pico em tempo real", "Análises IA ilimitadas", "Brief diário personalizado", "Conexões ilimitadas", "Resumo semanal"],
    },
    disclosure: [
      "Renovação automática. Cancele quando quiser pela sua conta.",
      "Direito de retratação de 14 dias (Diretiva UE 2011/83/UE, Art. 16).",
      "Imposto incluído conforme seu país de residência.",
    ],
    back: "Voltar",
    ios_blocked: "Disponível na versão Pro do app",
  },
  de: {
    title: "Jetzt kostenlos.\nPro wenn du bereit bist.",
    sub: "7 Tage gratis für deine komplette Zeitleiste — keine Kreditkarte.",
    free: "Kostenlos", pro: "Pro",
    free_desc: "Dein aktuelles Signal, immer verfügbar.",
    pro_desc: "Dein komplettes Momentum — Vergangenheit, Gegenwart, Zukunft.",
    monthly: "Monatlich", annually: "Jährlich", save: "-25%",
    savings: "Du sparst {x} € pro Jahr",
    popular: "Beliebteste",
    current_plan: "Dein aktueller Plan",
    start_trial: "7 Tage gratis starten",
    current_billing_month: "/Monat",
    billed_annually: "{x} € jährlich abgerechnet",
    features: {
      free: ["Aktuelles Signal", "Planeten-Schlüsselwörter", "Vergangenheits-Verlauf", "1 Verbindung (Matching)", "1 KI-Analyse / Woche"],
      pro:  ["Alles kostenlos, unbegrenzt", "Volle 36-Monats-Zeitleiste", "Zukunftsfenster freigeschaltet", "Echtzeit-Spitzenalarme", "Unbegrenzte KI-Analysen", "Persönliches Tages-Briefing", "Unbegrenzte Verbindungen", "Wöchentliche Zusammenfassung"],
    },
    disclosure: [
      "Automatische Verlängerung. Jederzeit über dein Konto kündbar.",
      "14-tägiges Widerrufsrecht (EU-Richtlinie 2011/83/EU, Art. 16).",
      "MwSt. inklusive je nach Wohnsitzland.",
    ],
    back: "Zurück",
    ios_blocked: "Verfügbar in der Pro-Version der App",
  },
  it: {
    title: "Gratis ora.\nPro quando sei pronto.",
    sub: "7 giorni gratis per esplorare la tua timeline completa — senza carta.",
    free: "Gratuito", pro: "Pro",
    free_desc: "Il tuo segnale attuale, sempre disponibile.",
    pro_desc: "Il tuo momentum completo — passato, presente, futuro.",
    monthly: "Mensile", annually: "Annuale", save: "-25%",
    savings: "Risparmi {x} € all'anno",
    popular: "Il più popolare",
    current_plan: "Il tuo piano attuale",
    start_trial: "Inizia 7 giorni gratis",
    current_billing_month: "/mese",
    billed_annually: "fatturato {x} € all'anno",
    features: {
      free: ["Segnale del momento", "Parole planetarie", "Cronologia passata", "1 connessione (matching)", "1 analisi IA / settimana"],
      pro:  ["Tutto gratis, senza limiti", "Timeline completa 36 mesi", "Finestre future sbloccate", "Avvisi di picco in tempo reale", "Analisi IA illimitate", "Brief quotidiano personalizzato", "Connessioni illimitate", "Riassunto settimanale"],
    },
    disclosure: [
      "Rinnovo automatico. Annulla quando vuoi dal tuo account.",
      "Diritto di recesso di 14 giorni (Direttiva UE 2011/83/UE, Art. 16).",
      "IVA inclusa secondo il tuo paese di residenza.",
    ],
    back: "Indietro",
    ios_blocked: "Disponibile nella versione Pro dell'app",
  },
  nl: {
    title: "Gratis nu.\nPro wanneer je klaar bent.",
    sub: "7 dagen gratis om je volledige tijdlijn te verkennen — geen creditcard.",
    free: "Gratis", pro: "Pro",
    free_desc: "Jouw huidige signaal, altijd beschikbaar.",
    pro_desc: "Jouw volledige momentum — verleden, heden, toekomst.",
    monthly: "Maandelijks", annually: "Jaarlijks", save: "-25%",
    savings: "Je bespaart €{x} per jaar",
    popular: "Meest populair",
    current_plan: "Jouw huidige plan",
    start_trial: "Start 7 dagen gratis",
    current_billing_month: "/maand",
    billed_annually: "€{x} per jaar gefactureerd",
    features: {
      free: ["Huidig signaal", "Planeet-trefwoorden", "Verleden geschiedenis", "1 verbinding (matching)", "1 AI-analyse / week"],
      pro:  ["Alles gratis, onbeperkt", "Volledige 36-maanden tijdlijn", "Toekomstvensters ontgrendeld", "Real-time piekwaarschuwingen", "Onbeperkte AI-analyses", "Persoonlijke dagelijkse briefing", "Onbeperkte verbindingen", "Wekelijkse samenvatting"],
    },
    disclosure: [
      "Automatische verlenging. Altijd opzegbaar via je account.",
      "14-daags herroepingsrecht (EU-richtlijn 2011/83/EU, art. 16).",
      "BTW inbegrepen volgens je woonland.",
    ],
    back: "Terug",
    ios_blocked: "Beschikbaar in de Pro-versie van de app",
  },
  ja: {
    title: "今は無料。\n準備ができたらPro。",
    sub: "完全なタイムラインを探索する7日間無料 — クレジットカード不要。",
    free: "無料", pro: "Pro",
    free_desc: "あなたの現在のシグナル、いつでも利用可能。",
    pro_desc: "あなたの完全なモメンタム — 過去、現在、未来。",
    monthly: "月額", annually: "年額", save: "-25%",
    savings: "年間{x}€節約",
    popular: "最も人気",
    current_plan: "現在のプラン",
    start_trial: "7日間無料トライアル開始",
    current_billing_month: "/月",
    billed_annually: "年間{x}€請求",
    features: {
      free: ["現在のシグナル", "惑星キーワード", "過去の履歴", "1接続(マッチング)", "週1回AI分析"],
      pro:  ["無料分すべて、無制限", "36ヶ月完全タイムライン", "未来のウィンドウのロック解除", "リアルタイムピーク通知", "無制限AI分析", "パーソナル毎日ブリーフ", "無制限接続", "週次ダイジェスト"],
    },
    disclosure: [
      "自動更新。アカウントからいつでもキャンセル可能。",
      "14日間の撤回権 (EU指令2011/83/EU、第16条)。",
      "居住国に応じたVAT込み。",
    ],
    back: "戻る",
    ios_blocked: "アプリのProバージョンで利用可能",
  },
  zh: {
    title: "现在免费。\n准备好了再升级Pro。",
    sub: "7天免费探索您的完整时间线 — 无需信用卡。",
    free: "免费", pro: "Pro",
    free_desc: "您当前的信号,始终可用。",
    pro_desc: "您完整的动量 — 过去、现在、未来。",
    monthly: "月度", annually: "年度", save: "-25%",
    savings: "每年节省 €{x}",
    popular: "最受欢迎",
    current_plan: "您当前的计划",
    start_trial: "开始7天免费试用",
    current_billing_month: "/月",
    billed_annually: "每年收费 €{x}",
    features: {
      free: ["当前信号", "行星关键词", "历史记录", "1个连接(匹配)", "每周1次AI分析"],
      pro:  ["所有免费,无限制", "完整的36个月时间线", "解锁未来窗口", "实时峰值提醒", "无限AI分析", "个性化每日简报", "无限连接", "每周摘要"],
    },
    disclosure: [
      "自动续订。可随时从您的账户取消。",
      "14天退款权 (欧盟指令2011/83/EU, 第16条)。",
      "根据您的居住国包含增值税。",
    ],
    back: "返回",
    ios_blocked: "在应用的Pro版本中可用",
  },
  ar: {
    title: "مجاني الآن.\nPro عندما تكون مستعدًا.",
    sub: "7 أيام مجانية لاستكشاف الجدول الزمني الكامل — بدون بطاقة ائتمان.",
    free: "مجاني", pro: "Pro",
    free_desc: "إشارتك الحالية، متاحة دائمًا.",
    pro_desc: "زخمك الكامل — الماضي والحاضر والمستقبل.",
    monthly: "شهري", annually: "سنوي", save: "-25%",
    savings: "توفر {x} € سنويًا",
    popular: "الأكثر شعبية",
    current_plan: "خطتك الحالية",
    start_trial: "ابدأ تجربة 7 أيام مجانية",
    current_billing_month: "/شهر",
    billed_annually: "يُفوتر {x} € سنويًا",
    features: {
      free: ["الإشارة الحالية", "الكلمات الكوكبية", "التاريخ الماضي", "1 اتصال (مطابقة)", "1 تحليل AI / أسبوع"],
      pro:  ["كل شيء مجاني، بلا حدود", "الجدول الزمني الكامل لـ 36 شهرًا", "فتح نوافذ المستقبل", "تنبيهات الذروة في الوقت الفعلي", "تحليلات AI غير محدودة", "ملخص يومي شخصي", "اتصالات غير محدودة", "ملخص أسبوعي"],
    },
    disclosure: [
      "تجديد تلقائي. إلغاء في أي وقت من حسابك.",
      "حق الانسحاب لمدة 14 يومًا (التوجيه الأوروبي 2011/83/EU, المادة 16).",
      "ضريبة القيمة المضافة مدرجة حسب بلد إقامتك.",
    ],
    back: "رجوع",
    ios_blocked: "متاح في الإصدار Pro من التطبيق",
  },
};

export default function DemoPricingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [locale, setLocaleState] = useState<Locale>("en");
  const ios = isIOSBundle();

  useEffect(() => {
    setLocaleState(detectLocale());
    const onLocaleChange = (e: Event) => {
      const detail = (e as CustomEvent<Locale>).detail;
      if (detail) setLocaleState(detail);
    };
    window.addEventListener("unfold:locale-changed", onLocaleChange);
    return () => window.removeEventListener("unfold:locale-changed", onLocaleChange);
  }, []);

  const c = PAGE_COPY[locale] ?? PAGE_COPY.en;

  const annualMonthly = (PLANS.annual.priceEUR / 12).toFixed(2);
  const savingsValue = (PLANS.monthly.priceEUR * 12 - PLANS.annual.priceEUR).toFixed(2);
  const savingsLine = c.savings.replace("{x}", savingsValue);

  const handleCheckout = async (plan: "monthly" | "annual") => {
    if (ios) return;                                  // no checkout on iOS
    if (!isAuthenticated) {
      // Need sign-in first — open AuthSheet, then user retries
      setAuthOpen(true);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan, locale }),
      });
      if (res.status === 401) {
        setAuthOpen(true);
        return;
      }
      if (!res.ok) throw new Error(t("auth.error_generic", locale));
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error_generic", locale));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full px-5 pb-12 pt-2" style={{ background: "var(--bg-primary)" }}>
      {/* Back chip */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-70"
        style={{
          color: "var(--accent-purple)",
          background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
        }}
      >
        <ChevronLeft size={14} />
        {c.back}
      </button>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1
          className="font-display text-[26px] font-bold leading-tight"
          style={{ color: "var(--text-heading)", letterSpacing: -0.5, whiteSpace: "pre-line" }}
        >
          {c.title}
        </h1>
        <p
          className="mx-auto mt-3 max-w-md text-[13px]"
          style={{ color: "var(--text-body-subtle)" }}
        >
          {c.sub}
        </p>
      </div>

      {/* Toggle — web only */}
      {!ios && (
        <div className="mb-4 flex justify-center">
          <div
            className="flex rounded-full p-1"
            style={{ background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)" }}
          >
            {(["monthly", "annual"] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setBilling(plan)}
                className="rounded-full px-5 py-2 text-[12px] font-semibold transition-all"
                style={{
                  background: billing === plan ? "var(--accent-purple)" : "transparent",
                  color: billing === plan ? "#fff" : "var(--text-body-subtle)",
                }}
              >
                {plan === "monthly" ? c.monthly : (
                  <span className="flex items-center gap-1.5">
                    {c.annually}
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ background: "#22c55e30", color: "#22c55e" }}
                    >
                      {c.save}
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Savings banner — animated entrance when toggling to Annual */}
      <AnimatePresence mode="popLayout">
        {billing === "annual" && !ios && (
          <motion.p
            key="savings-banner"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-5 text-center text-[12px] font-semibold"
            style={{ color: "var(--success)" }}
          >
            {savingsLine}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Cards */}
      <div className="space-y-3">
        {/* Free card */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl border p-5"
          style={{
            background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)",
            borderColor: "color-mix(in srgb, var(--accent-purple) 14%, transparent)",
          }}
        >
          <h3 className="text-[16px] font-bold" style={{ color: "var(--text-heading)" }}>
            {c.free}
          </h3>
          <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-body-subtle)" }}>
            {c.free_desc}
          </p>
          <p className="mt-3 text-[24px] font-bold" style={{ color: "var(--text-heading)" }}>
            0 €
          </p>
          <ul className="mt-4 space-y-1.5">
            {c.features.free.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--text-body)" }}>
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--accent-purple)" }} />
                {f}
              </li>
            ))}
          </ul>
          <div
            className="mt-4 w-full rounded-xl py-2.5 text-center text-[12px] font-semibold"
            style={{
              background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)",
              color: "var(--accent-purple)",
            }}
          >
            {c.current_plan}
          </div>
        </motion.div>

        {/* Pro card */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="relative rounded-2xl p-5"
          style={{
            background: "var(--accent-purple)",
            boxShadow:
              "0 0 40px color-mix(in srgb, var(--accent-purple) 30%, transparent), 0 12px 28px rgba(0,0,0,0.18)",
          }}
        >
          <span
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-bold"
            style={{ background: "#fff", color: "var(--accent-purple)" }}
          >
            {c.popular}
          </span>

          <h3 className="text-[16px] font-bold text-white">
            {c.pro}
          </h3>
          <p className="mt-0.5 text-[12px] text-white/75">
            {c.pro_desc}
          </p>

          {/* Price — hidden on iOS */}
          <AnimatePresence mode="popLayout" initial={false}>
          {ios ? (
            <motion.p
              key="ios"
              className="mt-3 text-[15px] font-semibold text-white"
            >
              {t("premium.trial_pitch", locale)}
            </motion.p>
          ) : billing === "monthly" ? (
            <motion.p
              key="monthly"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mt-3 text-[24px] font-bold text-white"
            >
              {PLANS.monthly.priceEUR.toFixed(2).replace(".", ",")} €
              <span className="text-[12px] font-normal text-white/75">{c.current_billing_month}</span>
            </motion.p>
          ) : (
            <motion.div
              key="annual"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mt-3"
            >
              <p className="text-[24px] font-bold text-white">
                {parseFloat(annualMonthly).toFixed(2).replace(".", ",")} €
                <span className="text-[12px] font-normal text-white/75">{c.current_billing_month}</span>
              </p>
              <p className="text-[11px] text-white/75">
                {c.billed_annually.replace("{x}", PLANS.annual.priceEUR.toFixed(2).replace(".", ","))}
              </p>
            </motion.div>
          )}
          </AnimatePresence>

          <ul className="mt-4 space-y-1.5">
            {c.features.pro.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[12px] text-white">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          {ios ? (
            <p
              className="mt-4 w-full rounded-xl py-2.5 text-center text-[12px] font-semibold"
              style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
            >
              {c.ios_blocked}
            </p>
          ) : (
            <button
              onClick={() => handleCheckout(billing)}
              disabled={loading}
              className="mt-4 w-full rounded-xl py-3 text-[13px] font-bold transition-opacity disabled:opacity-60"
              style={{ background: "#fff", color: "var(--accent-purple)" }}
            >
              {loading ? "..." : c.start_trial}
            </button>
          )}
        </motion.div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-center text-[12px] font-medium" style={{ color: "#f17e7a" }}>
          {error}
        </p>
      )}

      {/* EU consumer law disclosures — web only */}
      {!ios && (
        <div className="mx-auto mt-6 max-w-md space-y-1.5 text-center text-[10px] leading-relaxed" style={{ color: "var(--text-body-subtle)", opacity: 0.8 }}>
          {c.disclosure.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}

      {/* Auth sheet */}
      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
