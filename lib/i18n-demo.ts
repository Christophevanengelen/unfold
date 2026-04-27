/**
 * Demo app i18n — auto-detects language from navigator.language with
 * graceful fallback chain. Persisted in localStorage.
 *
 * Note: Capsule names + AI text come from Marie Ange's API (currently FR
 * only). UI strings here are translated to ship multi-region day one.
 *
 * Adding a language: add an entry to STRINGS keyed by 2-letter code, fill
 * keys, done. Falls back to EN for missing keys.
 */

export type Locale =
  | "fr" | "en" | "es" | "de" | "it" | "pt" | "nl" | "ja" | "zh" | "ar";

export const SUPPORTED_LOCALES: Locale[] = [
  "fr", "en", "es", "de", "it", "pt", "nl", "ja", "zh", "ar",
];

const STORAGE_KEY = "unfold_locale";

/**
 * Detect locale from browser. Falls back to 'en'.
 * Returns one of SUPPORTED_LOCALES.
 */
export function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (SUPPORTED_LOCALES as string[]).includes(stored)) {
    return stored as Locale;
  }

  const langs = navigator.languages?.length ? navigator.languages : [navigator.language || "en"];
  for (const lang of langs) {
    const code = lang.toLowerCase().slice(0, 2) as Locale;
    if (SUPPORTED_LOCALES.includes(code)) return code;
  }
  return "en";
}

export function setLocale(locale: Locale): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, locale);
    window.dispatchEvent(new CustomEvent("unfold:locale-changed", { detail: locale }));
  }
}

// ─── Translation strings ──────────────────────────────────────────────
// Keep nested for readability. Missing keys fall back to EN.

type Strings = {
  premium: {
    headline: string;
    sub: string;
    feature_forecast: string;
    feature_alerts: string;
    feature_map: string;
    feature_unlimited_ai: string;
    feature_brief: string;
    cta_web: string;
    cta_ios: string;
    dismiss: string;
    trial_pitch: string;
    fine_print: string;
  };
  profile: {
    free_plan: string;
    premium_plan: string;
    settings: string;
    personalize: string;
    edit_birth: string;
    appearance: string;
    light: string;
    dark: string;
    account: string;
    sign_in: string;
    sign_out: string;
    configure: string;
    edit: string;
    language: string;
  };
  auth: {
    title: string;
    sub: string;
    email_placeholder: string;
    send_link: string;
    sent_title: string;
    sent_sub: string;
    error_generic: string;
  };
  blur: {
    headline_future: string;
    sub_future: string;
    headline_ai: string;
    sub_ai: string;
    headline_default: string;
    sub_default: string;
  };
  nav: {
    timeline: string;
    match: string;
  };
  common: {
    cancel: string;
    continue: string;
    close: string;
    next: string;
    back: string;
  };
};

const FR: Strings = {
  premium: {
    headline: "Débloque ton timing complet",
    sub: "Vois ce qui arrive avant que ça arrive",
    feature_forecast: "Prévision 7 jours avec marqueurs de pic",
    feature_alerts: "Alertes de pics en temps réel",
    feature_map: "Carte mensuelle de momentum",
    feature_unlimited_ai: "Délinéations IA illimitées",
    feature_brief: "Brief quotidien personnalisé",
    cta_web: "Démarrer 7 jours gratuits",
    cta_ios: "Continuer",
    dismiss: "Plus tard",
    trial_pitch: "7 jours gratuits, sans carte bancaire",
    fine_print: "Renouvellement automatique. Annulable à tout moment.",
  },
  profile: {
    free_plan: "Gratuit",
    premium_plan: "Pro",
    settings: "Réglages",
    personalize: "Personnaliser",
    edit_birth: "Ma naissance",
    appearance: "Apparence",
    light: "Clair",
    dark: "Sombre",
    account: "Compte",
    sign_in: "Se connecter",
    sign_out: "Se déconnecter",
    configure: "Configurer",
    edit: "Modifier",
    language: "Langue",
  },
  auth: {
    title: "Connexion",
    sub: "Reçois un lien magique par email — sans mot de passe.",
    email_placeholder: "ton@email.com",
    send_link: "Recevoir le lien magique",
    sent_title: "Vérifie tes emails",
    sent_sub: "Clique sur le lien pour te connecter.",
    error_generic: "Une erreur est survenue. Réessaie.",
  },
  blur: {
    headline_future: "Déverrouille ton futur",
    sub_future: "Accède à tes capsules futures et anticipe tes moments clés",
    headline_ai: "Personnalisation premium",
    sub_ai: "Des analyses IA illimitées, taillées pour ton profil",
    headline_default: "Fonctionnalité premium",
    sub_default: "Passe au niveau supérieur pour débloquer cette fonctionnalité",
  },
  nav: {
    timeline: "Timeline",
    match: "Match",
  },
  common: {
    cancel: "Annuler",
    continue: "Continuer",
    close: "Fermer",
    next: "Suivant",
    back: "Retour",
  },
};

const EN: Strings = {
  premium: {
    headline: "Unlock your timing advantage",
    sub: "See what's coming before it arrives",
    feature_forecast: "7-day forecast with peak markers",
    feature_alerts: "Real-time peak alerts",
    feature_map: "Monthly momentum map",
    feature_unlimited_ai: "Unlimited AI delineations",
    feature_brief: "Personalized daily brief",
    cta_web: "Start 7-day free trial",
    cta_ios: "Continue",
    dismiss: "Maybe later",
    trial_pitch: "7 days free, no credit card",
    fine_print: "Auto-renews. Cancel anytime.",
  },
  profile: {
    free_plan: "Free",
    premium_plan: "Pro",
    settings: "Settings",
    personalize: "Personalize",
    edit_birth: "Birth data",
    appearance: "Appearance",
    light: "Light",
    dark: "Dark",
    account: "Account",
    sign_in: "Sign in",
    sign_out: "Sign out",
    configure: "Configure",
    edit: "Edit",
    language: "Language",
  },
  auth: {
    title: "Sign in",
    sub: "Get a magic link by email — no password.",
    email_placeholder: "you@email.com",
    send_link: "Send magic link",
    sent_title: "Check your inbox",
    sent_sub: "Click the link to sign in.",
    error_generic: "Something went wrong. Try again.",
  },
  blur: {
    headline_future: "Unlock your future",
    sub_future: "See your future capsules and anticipate key moments",
    headline_ai: "Premium personalization",
    sub_ai: "Unlimited AI analysis, tailored to your profile",
    headline_default: "Premium feature",
    sub_default: "Upgrade to unlock this feature",
  },
  nav: {
    timeline: "Timeline",
    match: "Match",
  },
  common: {
    cancel: "Cancel",
    continue: "Continue",
    close: "Close",
    next: "Next",
    back: "Back",
  },
};

const ES: Strings = {
  premium: {
    headline: "Desbloquea tu ventaja de timing",
    sub: "Ve lo que viene antes de que llegue",
    feature_forecast: "Pronóstico de 7 días con picos",
    feature_alerts: "Alertas de picos en tiempo real",
    feature_map: "Mapa mensual de momentum",
    feature_unlimited_ai: "Análisis IA ilimitados",
    feature_brief: "Brief diario personalizado",
    cta_web: "Empezar 7 días gratis",
    cta_ios: "Continuar",
    dismiss: "Más tarde",
    trial_pitch: "7 días gratis, sin tarjeta",
    fine_print: "Renovación automática. Cancela cuando quieras.",
  },
  profile: {
    free_plan: "Gratis",
    premium_plan: "Pro",
    settings: "Ajustes",
    personalize: "Personalizar",
    edit_birth: "Mi nacimiento",
    appearance: "Apariencia",
    light: "Claro",
    dark: "Oscuro",
    account: "Cuenta",
    sign_in: "Iniciar sesión",
    sign_out: "Cerrar sesión",
    configure: "Configurar",
    edit: "Editar",
    language: "Idioma",
  },
  auth: {
    title: "Iniciar sesión",
    sub: "Recibe un enlace mágico por email — sin contraseña.",
    email_placeholder: "tu@email.com",
    send_link: "Enviar enlace mágico",
    sent_title: "Revisa tu email",
    sent_sub: "Haz clic en el enlace para entrar.",
    error_generic: "Algo salió mal. Inténtalo de nuevo.",
  },
  blur: {
    headline_future: "Desbloquea tu futuro",
    sub_future: "Accede a tus cápsulas futuras y anticipa momentos clave",
    headline_ai: "Personalización premium",
    sub_ai: "Análisis IA ilimitados, hechos para tu perfil",
    headline_default: "Función premium",
    sub_default: "Mejora tu plan para desbloquear esta función",
  },
  nav: {
    timeline: "Línea de tiempo",
    match: "Match",
  },
  common: {
    cancel: "Cancelar",
    continue: "Continuar",
    close: "Cerrar",
    next: "Siguiente",
    back: "Atrás",
  },
};

const DE: Strings = {
  premium: {
    headline: "Schalte dein Timing frei",
    sub: "Sieh was kommt, bevor es ankommt",
    feature_forecast: "7-Tage-Vorhersage mit Spitzen",
    feature_alerts: "Echtzeit-Spitzenalarme",
    feature_map: "Monatliche Momentum-Karte",
    feature_unlimited_ai: "Unbegrenzte KI-Analysen",
    feature_brief: "Personalisiertes Tages-Briefing",
    cta_web: "7 Tage gratis starten",
    cta_ios: "Weiter",
    dismiss: "Später",
    trial_pitch: "7 Tage gratis, keine Kreditkarte",
    fine_print: "Automatische Verlängerung. Jederzeit kündbar.",
  },
  profile: {
    free_plan: "Kostenlos",
    premium_plan: "Pro",
    settings: "Einstellungen",
    personalize: "Personalisieren",
    edit_birth: "Geburtsdaten",
    appearance: "Erscheinungsbild",
    light: "Hell",
    dark: "Dunkel",
    account: "Konto",
    sign_in: "Anmelden",
    sign_out: "Abmelden",
    configure: "Konfigurieren",
    edit: "Bearbeiten",
    language: "Sprache",
  },
  auth: {
    title: "Anmelden",
    sub: "Erhalte einen magischen Link per E-Mail — kein Passwort.",
    email_placeholder: "du@email.com",
    send_link: "Magic Link senden",
    sent_title: "Prüfe deine E-Mails",
    sent_sub: "Klicke auf den Link, um dich anzumelden.",
    error_generic: "Ein Fehler ist aufgetreten. Versuche es erneut.",
  },
  blur: {
    headline_future: "Schalte deine Zukunft frei",
    sub_future: "Sieh deine zukünftigen Kapseln und antizipiere wichtige Momente",
    headline_ai: "Premium-Personalisierung",
    sub_ai: "Unbegrenzte KI-Analysen für dein Profil",
    headline_default: "Premium-Funktion",
    sub_default: "Upgrade, um diese Funktion freizuschalten",
  },
  nav: {
    timeline: "Zeitleiste",
    match: "Match",
  },
  common: {
    cancel: "Abbrechen",
    continue: "Weiter",
    close: "Schließen",
    next: "Weiter",
    back: "Zurück",
  },
};

const IT: Strings = {
  premium: {
    headline: "Sblocca il tuo vantaggio temporale",
    sub: "Vedi cosa arriva prima che arrivi",
    feature_forecast: "Previsione 7 giorni con picchi",
    feature_alerts: "Avvisi di picco in tempo reale",
    feature_map: "Mappa mensile del momentum",
    feature_unlimited_ai: "Analisi IA illimitate",
    feature_brief: "Brief quotidiano personalizzato",
    cta_web: "Inizia 7 giorni gratis",
    cta_ios: "Continua",
    dismiss: "Più tardi",
    trial_pitch: "7 giorni gratis, senza carta",
    fine_print: "Rinnovo automatico. Annulla quando vuoi.",
  },
  profile: {
    free_plan: "Gratuito",
    premium_plan: "Pro",
    settings: "Impostazioni",
    personalize: "Personalizza",
    edit_birth: "Mia nascita",
    appearance: "Aspetto",
    light: "Chiaro",
    dark: "Scuro",
    account: "Account",
    sign_in: "Accedi",
    sign_out: "Esci",
    configure: "Configura",
    edit: "Modifica",
    language: "Lingua",
  },
  auth: {
    title: "Accedi",
    sub: "Ricevi un link magico via email — senza password.",
    email_placeholder: "tu@email.com",
    send_link: "Invia link magico",
    sent_title: "Controlla la tua email",
    sent_sub: "Clicca sul link per accedere.",
    error_generic: "Qualcosa è andato storto. Riprova.",
  },
  blur: {
    headline_future: "Sblocca il tuo futuro",
    sub_future: "Accedi alle tue capsule future e anticipa momenti chiave",
    headline_ai: "Personalizzazione premium",
    sub_ai: "Analisi IA illimitate, su misura per il tuo profilo",
    headline_default: "Funzione premium",
    sub_default: "Aggiorna per sbloccare questa funzione",
  },
  nav: {
    timeline: "Timeline",
    match: "Match",
  },
  common: {
    cancel: "Annulla",
    continue: "Continua",
    close: "Chiudi",
    next: "Avanti",
    back: "Indietro",
  },
};

const PT: Strings = {
  premium: {
    headline: "Desbloqueie sua vantagem de timing",
    sub: "Veja o que vem antes de chegar",
    feature_forecast: "Previsão de 7 dias com picos",
    feature_alerts: "Alertas de pico em tempo real",
    feature_map: "Mapa mensal de momentum",
    feature_unlimited_ai: "Análises de IA ilimitadas",
    feature_brief: "Resumo diário personalizado",
    cta_web: "Começar 7 dias grátis",
    cta_ios: "Continuar",
    dismiss: "Mais tarde",
    trial_pitch: "7 dias grátis, sem cartão",
    fine_print: "Renovação automática. Cancele quando quiser.",
  },
  profile: {
    free_plan: "Grátis",
    premium_plan: "Pro",
    settings: "Configurações",
    personalize: "Personalizar",
    edit_birth: "Meu nascimento",
    appearance: "Aparência",
    light: "Claro",
    dark: "Escuro",
    account: "Conta",
    sign_in: "Entrar",
    sign_out: "Sair",
    configure: "Configurar",
    edit: "Editar",
    language: "Idioma",
  },
  auth: {
    title: "Entrar",
    sub: "Receba um link mágico por email — sem senha.",
    email_placeholder: "voce@email.com",
    send_link: "Enviar link mágico",
    sent_title: "Verifique seu email",
    sent_sub: "Clique no link para entrar.",
    error_generic: "Algo deu errado. Tente novamente.",
  },
  blur: {
    headline_future: "Desbloqueie seu futuro",
    sub_future: "Acesse suas cápsulas futuras e antecipe momentos chave",
    headline_ai: "Personalização premium",
    sub_ai: "Análises de IA ilimitadas, feitas para seu perfil",
    headline_default: "Recurso premium",
    sub_default: "Atualize para desbloquear este recurso",
  },
  nav: {
    timeline: "Linha do tempo",
    match: "Match",
  },
  common: {
    cancel: "Cancelar",
    continue: "Continuar",
    close: "Fechar",
    next: "Próximo",
    back: "Voltar",
  },
};

const NL: Strings = {
  premium: {
    headline: "Ontgrendel je timing-voordeel",
    sub: "Zie wat komt voordat het er is",
    feature_forecast: "7-daagse voorspelling met pieken",
    feature_alerts: "Real-time piekwaarschuwingen",
    feature_map: "Maandelijkse momentum-kaart",
    feature_unlimited_ai: "Onbeperkte AI-analyses",
    feature_brief: "Persoonlijke dagelijkse briefing",
    cta_web: "Start 7 dagen gratis",
    cta_ios: "Doorgaan",
    dismiss: "Later",
    trial_pitch: "7 dagen gratis, geen creditcard",
    fine_print: "Automatische verlenging. Altijd opzegbaar.",
  },
  profile: {
    free_plan: "Gratis",
    premium_plan: "Pro",
    settings: "Instellingen",
    personalize: "Personaliseren",
    edit_birth: "Mijn geboorte",
    appearance: "Weergave",
    light: "Licht",
    dark: "Donker",
    account: "Account",
    sign_in: "Inloggen",
    sign_out: "Uitloggen",
    configure: "Instellen",
    edit: "Bewerken",
    language: "Taal",
  },
  auth: {
    title: "Inloggen",
    sub: "Ontvang een magische link per e-mail — geen wachtwoord.",
    email_placeholder: "jij@email.com",
    send_link: "Stuur magische link",
    sent_title: "Check je inbox",
    sent_sub: "Klik op de link om in te loggen.",
    error_generic: "Er ging iets mis. Probeer opnieuw.",
  },
  blur: {
    headline_future: "Ontgrendel je toekomst",
    sub_future: "Bekijk je toekomstige capsules en anticipeer op sleutelmomenten",
    headline_ai: "Premium personalisatie",
    sub_ai: "Onbeperkte AI-analyses op maat van jouw profiel",
    headline_default: "Premium-functie",
    sub_default: "Upgrade om deze functie te ontgrendelen",
  },
  nav: {
    timeline: "Tijdlijn",
    match: "Match",
  },
  common: {
    cancel: "Annuleren",
    continue: "Doorgaan",
    close: "Sluiten",
    next: "Volgende",
    back: "Terug",
  },
};

const JA: Strings = {
  premium: {
    headline: "タイミングの優位性をアンロック",
    sub: "起こる前に未来を見る",
    feature_forecast: "ピークマーカー付き7日間予報",
    feature_alerts: "リアルタイムピーク通知",
    feature_map: "月間モメンタムマップ",
    feature_unlimited_ai: "無制限AI分析",
    feature_brief: "パーソナライズされた毎日のブリーフ",
    cta_web: "7日間無料トライアル開始",
    cta_ios: "続ける",
    dismiss: "あとで",
    trial_pitch: "7日間無料、クレジットカード不要",
    fine_print: "自動更新。いつでもキャンセル可能。",
  },
  profile: {
    free_plan: "無料",
    premium_plan: "Pro",
    settings: "設定",
    personalize: "パーソナライズ",
    edit_birth: "生年月日",
    appearance: "外観",
    light: "ライト",
    dark: "ダーク",
    account: "アカウント",
    sign_in: "サインイン",
    sign_out: "サインアウト",
    configure: "設定する",
    edit: "編集",
    language: "言語",
  },
  auth: {
    title: "サインイン",
    sub: "メールでマジックリンクを受け取る — パスワード不要。",
    email_placeholder: "あなた@email.com",
    send_link: "マジックリンクを送信",
    sent_title: "メールを確認",
    sent_sub: "リンクをクリックしてサインイン。",
    error_generic: "エラーが発生しました。もう一度お試しください。",
  },
  blur: {
    headline_future: "未来をアンロック",
    sub_future: "未来のカプセルにアクセスし、重要な瞬間を予測",
    headline_ai: "プレミアムパーソナライズ",
    sub_ai: "プロフィールに合わせた無制限AI分析",
    headline_default: "プレミアム機能",
    sub_default: "アップグレードしてこの機能をアンロック",
  },
  nav: {
    timeline: "タイムライン",
    match: "マッチ",
  },
  common: {
    cancel: "キャンセル",
    continue: "続ける",
    close: "閉じる",
    next: "次へ",
    back: "戻る",
  },
};

const ZH: Strings = {
  premium: {
    headline: "解锁您的时机优势",
    sub: "在未来到来之前看见它",
    feature_forecast: "7天预测带峰值标记",
    feature_alerts: "实时峰值提醒",
    feature_map: "月度动量地图",
    feature_unlimited_ai: "无限AI分析",
    feature_brief: "个性化每日简报",
    cta_web: "开始7天免费试用",
    cta_ios: "继续",
    dismiss: "稍后",
    trial_pitch: "7天免费,无需信用卡",
    fine_print: "自动续订。随时取消。",
  },
  profile: {
    free_plan: "免费",
    premium_plan: "Pro",
    settings: "设置",
    personalize: "个性化",
    edit_birth: "出生信息",
    appearance: "外观",
    light: "浅色",
    dark: "深色",
    account: "账户",
    sign_in: "登录",
    sign_out: "退出",
    configure: "配置",
    edit: "编辑",
    language: "语言",
  },
  auth: {
    title: "登录",
    sub: "通过电子邮件获取魔法链接 — 无需密码。",
    email_placeholder: "you@email.com",
    send_link: "发送魔法链接",
    sent_title: "检查您的邮箱",
    sent_sub: "点击链接登录。",
    error_generic: "出错了。请重试。",
  },
  blur: {
    headline_future: "解锁您的未来",
    sub_future: "访问您未来的胶囊,预见关键时刻",
    headline_ai: "高级个性化",
    sub_ai: "为您的个人资料量身定制的无限AI分析",
    headline_default: "高级功能",
    sub_default: "升级以解锁此功能",
  },
  nav: {
    timeline: "时间线",
    match: "匹配",
  },
  common: {
    cancel: "取消",
    continue: "继续",
    close: "关闭",
    next: "下一步",
    back: "返回",
  },
};

const AR: Strings = {
  premium: {
    headline: "افتح ميزة التوقيت الخاصة بك",
    sub: "شاهد ما هو قادم قبل وصوله",
    feature_forecast: "توقعات 7 أيام مع علامات الذروة",
    feature_alerts: "تنبيهات الذروة في الوقت الفعلي",
    feature_map: "خريطة الزخم الشهرية",
    feature_unlimited_ai: "تحليلات AI غير محدودة",
    feature_brief: "ملخص يومي مخصص",
    cta_web: "ابدأ تجربة 7 أيام مجانية",
    cta_ios: "متابعة",
    dismiss: "لاحقًا",
    trial_pitch: "7 أيام مجانية، بدون بطاقة ائتمان",
    fine_print: "تجديد تلقائي. إلغاء في أي وقت.",
  },
  profile: {
    free_plan: "مجاني",
    premium_plan: "Pro",
    settings: "الإعدادات",
    personalize: "تخصيص",
    edit_birth: "تاريخ الميلاد",
    appearance: "المظهر",
    light: "فاتح",
    dark: "داكن",
    account: "الحساب",
    sign_in: "تسجيل الدخول",
    sign_out: "تسجيل الخروج",
    configure: "تكوين",
    edit: "تعديل",
    language: "اللغة",
  },
  auth: {
    title: "تسجيل الدخول",
    sub: "احصل على رابط سحري عبر البريد الإلكتروني — بدون كلمة مرور.",
    email_placeholder: "you@email.com",
    send_link: "إرسال الرابط السحري",
    sent_title: "تحقق من بريدك",
    sent_sub: "انقر على الرابط لتسجيل الدخول.",
    error_generic: "حدث خطأ. حاول مرة أخرى.",
  },
  blur: {
    headline_future: "افتح مستقبلك",
    sub_future: "الوصول إلى كبسولاتك المستقبلية وتوقع اللحظات الرئيسية",
    headline_ai: "تخصيص متميز",
    sub_ai: "تحليلات AI غير محدودة، مصممة لملفك الشخصي",
    headline_default: "ميزة متميزة",
    sub_default: "قم بالترقية لفتح هذه الميزة",
  },
  nav: {
    timeline: "الجدول الزمني",
    match: "مطابقة",
  },
  common: {
    cancel: "إلغاء",
    continue: "متابعة",
    close: "إغلاق",
    next: "التالي",
    back: "رجوع",
  },
};

const STRINGS: Record<Locale, Strings> = {
  fr: FR, en: EN, es: ES, de: DE, it: IT, pt: PT, nl: NL, ja: JA, zh: ZH, ar: AR,
};

/**
 * Get a translation. Falls back to EN if missing.
 *
 * Usage: t("premium.headline")
 *        t(["premium", "headline"])
 */
export function t(key: string, locale?: Locale): string {
  const loc = locale ?? detectLocale();
  const dict = STRINGS[loc] ?? EN;
  const path = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let val: any = dict;
  for (const p of path) val = val?.[p];
  if (typeof val === "string") return val;
  // Fall back to EN
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fallback: any = EN;
  for (const p of path) fallback = fallback?.[p];
  return typeof fallback === "string" ? fallback : key;
}

/** RTL languages — flip layout direction. */
export function isRTL(locale: Locale): boolean {
  return locale === "ar";
}

/** Language display names — for the picker UI. */
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  ja: "日本語",
  zh: "中文",
  ar: "العربية",
};
