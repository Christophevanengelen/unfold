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
    success_toast: string;
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
    systeme: string;
    account: string;
    sign_in: string;
    sign_out: string;
    configure: string;
    edit: string;
    language: string;
    your_plan: string;
    manage_sub: string;
    restore_purchases: string;
    trial_ends_in: string;
    delete_account: string;
    streak_day: string;       // "Day {n}" — status bar streak counter
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
    profile: string;
  };
  common: {
    cancel: string;
    continue: string;
    close: string;
    next: string;
    back: string;
  };
  onboarding: {
    back: string;
    p1_headline: string; p1_sub: string; p1_cta: string;
    p2_headline: string; p2_signal_active: string; p2_cta: string;
    p3_headline: string; p3_sub: string; p3_planet_active: string; p3_which_ones: string; p3_cta: string;
    p4_headline: string; p4_sub: string; p4_selected: string; p4_cta: string;
    p4_love: string; p4_career: string; p4_money: string; p4_family: string;
    p4_health: string; p4_creativity: string; p4_home: string; p4_friends: string; p4_meaning: string;
    p5_headline: string; p5_sub: string;
    p5_nickname_label: string; p5_nickname_ph: string;
    p5_dob_label: string; p5_time_label: string; p5_time_helper: string;
    p5_place_label: string; p5_place_ph: string;
    p5_privacy: string; p5_cta: string;
    p6_scanning: string; p6_status1: string; p6_status2: string; p6_status3: string;
    p6_error: string; p6_signal_active: string; p6_built_real: string; p6_built_sample: string;
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
    success_toast: "Bienvenue dans Favorable Pro ✦",
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
    systeme: "Système",
    account: "Compte",
    sign_in: "Se connecter",
    sign_out: "Se déconnecter",
    configure: "Configurer",
    edit: "Modifier",
    language: "Langue",
    your_plan: "Ton abonnement",
    manage_sub: "Gérer",
    restore_purchases: "Restaurer mes achats",
    trial_ends_in: "Essai · J-{n}",
    delete_account: "Supprimer mon compte",
    streak_day: "Jour {n}",
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
    profile: "Profil",
  },
  common: {
    cancel: "Annuler",
    continue: "Continuer",
    close: "Fermer",
    next: "Suivant",
    back: "Retour",
  },
  onboarding: {
    back: "Retour",
    p1_headline: "Certaines périodes sont plus intenses.", p1_sub: "Il y a une raison.", p1_cta: "Montre-moi",
    p2_headline: "Il y a un schéma.", p2_signal_active: "Ton signal est actif", p2_cta: "Qu'est-ce que ça signifie ?",
    p3_headline: "Les planètes façonnent\nton rythme.", p3_sub: "Chacune porte un signal. Certaines sont actives.", p3_planet_active: "{planet} est actif", p3_which_ones: "Lesquelles sont les tiennes ?", p3_cta: "Révèle mon signal",
    p4_headline: "Ce qui compte le plus ?", p4_sub: "Choisis tout ce qui compte. Cela façonne ton signal.", p4_selected: "{n} sélectionné(s)", p4_cta: "Continuer",
    p4_love: "Amour", p4_career: "Carrière", p4_money: "Argent", p4_family: "Famille",
    p4_health: "Santé", p4_creativity: "Créativité", p4_home: "Maison", p4_friends: "Amis", p4_meaning: "Sens",
    p5_headline: "Ton rythme est unique.", p5_sub: "Configure le tien.",
    p5_nickname_label: "Surnom", p5_nickname_ph: "Comment t'appelle-t-on ?",
    p5_dob_label: "Date de naissance", p5_time_label: "Heure de naissance", p5_time_helper: "La précision affine ton signal.",
    p5_place_label: "Lieu de naissance", p5_place_ph: "Ville, Pays",
    p5_privacy: "Tes données servent uniquement à préparer ton rythme.", p5_cta: "Prépare mon signal",
    p6_scanning: "Analyse de ton thème natal", p6_status1: "Lecture de tes signaux planétaires", p6_status2: "Construction de ta timeline", p6_status3: "Préparation de ta première capsule",
    p6_error: "Problème de connexion. Données d'exemple utilisées.", p6_signal_active: "Ton signal est actif", p6_built_real: "Calculé depuis les données planétaires exactes de ta naissance.", p6_built_sample: "Explore avec des données d'exemple. Saisis ta naissance pour une lecture personnelle.",
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
    success_toast: "Welcome to Favorable Pro ✦",
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
    systeme: "System",
    account: "Account",
    sign_in: "Sign in",
    sign_out: "Sign out",
    configure: "Configure",
    edit: "Edit",
    language: "Language",
    your_plan: "Your plan",
    manage_sub: "Manage",
    restore_purchases: "Restore purchases",
    trial_ends_in: "Trial · {n}d left",
    delete_account: "Delete account",
    streak_day: "Day {n}",
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
    profile: "Profile",
  },
  common: {
    cancel: "Cancel",
    continue: "Continue",
    close: "Close",
    next: "Next",
    back: "Back",
  },
  onboarding: {
    back: "Back",
    p1_headline: "Some periods of your life feel more intense.", p1_sub: "There is a reason.", p1_cta: "Show me",
    p2_headline: "There is a pattern.", p2_signal_active: "Your signal is active", p2_cta: "What does it mean?",
    p3_headline: "Planets shape\nyour timing.", p3_sub: "Each one carries a signal. Some are active right now.", p3_planet_active: "{planet} is active right now", p3_which_ones: "Which ones are yours?", p3_cta: "Reveal my signal",
    p4_headline: "What matters most?", p4_sub: "Pick everything that matters. This shapes your signal.", p4_selected: "{n} selected", p4_cta: "Continue",
    p4_love: "Love", p4_career: "Career", p4_money: "Money", p4_family: "Family",
    p4_health: "Health", p4_creativity: "Creativity", p4_home: "Home", p4_friends: "Friends", p4_meaning: "Meaning",
    p5_headline: "Your timing is unique.", p5_sub: "Configure yours.",
    p5_nickname_label: "Nickname", p5_nickname_ph: "How should we call you?",
    p5_dob_label: "Date of birth", p5_time_label: "Time of birth", p5_time_helper: "Precision sharpens your signal.",
    p5_place_label: "Place of birth", p5_place_ph: "City, Country",
    p5_privacy: "Your details are only used to prepare your personal rhythm.", p5_cta: "Prepare my signal",
    p6_scanning: "Scanning your birth chart", p6_status1: "Reading your planetary signals", p6_status2: "Building your momentum timeline", p6_status3: "Preparing your first capsule",
    p6_error: "Connection issue. Using sample data instead.", p6_signal_active: "Your signal is active", p6_built_real: "Built from real planetary data for your exact birth moment.", p6_built_sample: "Explore with sample data. Enter your birth info for a personal reading.",
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
    success_toast: "Bienvenido a Favorable Pro ✦",
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
    systeme: "Sistema",
    account: "Cuenta",
    sign_in: "Iniciar sesión",
    sign_out: "Cerrar sesión",
    configure: "Configurar",
    edit: "Editar",
    language: "Idioma",
    your_plan: "Tu plan",
    manage_sub: "Gestionar",
    restore_purchases: "Restaurar compras",
    trial_ends_in: "Prueba · {n}d restantes",
    delete_account: "Eliminar cuenta",
    streak_day: "Día {n}",
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
    profile: "Perfil",
  },
  common: {
    cancel: "Cancelar",
    continue: "Continuar",
    close: "Cerrar",
    next: "Siguiente",
    back: "Atrás",
  },
  onboarding: {
    back: "Atrás",
    p1_headline: "Algunos períodos de tu vida son más intensos.", p1_sub: "Hay una razón.", p1_cta: "Muéstrame",
    p2_headline: "Hay un patrón.", p2_signal_active: "Tu señal está activa", p2_cta: "¿Qué significa?",
    p3_headline: "Los planetas moldean\ntu timing.", p3_sub: "Cada uno lleva una señal. Algunos están activos ahora.", p3_planet_active: "{planet} está activo ahora", p3_which_ones: "¿Cuáles son los tuyos?", p3_cta: "Revela mi señal",
    p4_headline: "¿Qué es lo más importante?", p4_sub: "Elige todo lo que importa. Esto moldea tu señal.", p4_selected: "{n} seleccionados", p4_cta: "Continuar",
    p4_love: "Amor", p4_career: "Carrera", p4_money: "Dinero", p4_family: "Familia",
    p4_health: "Salud", p4_creativity: "Creatividad", p4_home: "Hogar", p4_friends: "Amigos", p4_meaning: "Sentido",
    p5_headline: "Tu timing es único.", p5_sub: "Configura el tuyo.",
    p5_nickname_label: "Apodo", p5_nickname_ph: "¿Cómo te llamamos?",
    p5_dob_label: "Fecha de nacimiento", p5_time_label: "Hora de nacimiento", p5_time_helper: "La precisión afina tu señal.",
    p5_place_label: "Lugar de nacimiento", p5_place_ph: "Ciudad, País",
    p5_privacy: "Tus datos solo se usan para preparar tu ritmo personal.", p5_cta: "Prepara mi señal",
    p6_scanning: "Escaneando tu carta natal", p6_status1: "Leyendo tus señales planetarias", p6_status2: "Construyendo tu línea de tiempo", p6_status3: "Preparando tu primera cápsula",
    p6_error: "Problema de conexión. Usando datos de ejemplo.", p6_signal_active: "Tu señal está activa", p6_built_real: "Basado en datos planetarios reales de tu momento de nacimiento exacto.", p6_built_sample: "Explora con datos de ejemplo. Ingresa tus datos de nacimiento para una lectura personal.",
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
    success_toast: "Willkommen bei Favorable Pro ✦",
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
    systeme: "System",
    account: "Konto",
    sign_in: "Anmelden",
    sign_out: "Abmelden",
    configure: "Konfigurieren",
    edit: "Bearbeiten",
    language: "Sprache",
    your_plan: "Dein Abo",
    manage_sub: "Verwalten",
    restore_purchases: "Käufe wiederherstellen",
    trial_ends_in: "Test · noch {n} Tage",
    delete_account: "Konto löschen",
    streak_day: "Tag {n}",
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
    profile: "Profil",
  },
  common: {
    cancel: "Abbrechen",
    continue: "Weiter",
    close: "Schließen",
    next: "Weiter",
    back: "Zurück",
  },
  onboarding: {
    back: "Zurück",
    p1_headline: "Manche Lebensabschnitte fühlen sich intensiver an.", p1_sub: "Es gibt einen Grund.", p1_cta: "Zeig mir",
    p2_headline: "Es gibt ein Muster.", p2_signal_active: "Dein Signal ist aktiv", p2_cta: "Was bedeutet das?",
    p3_headline: "Planeten formen\ndein Timing.", p3_sub: "Jeder trägt ein Signal. Einige sind gerade aktiv.", p3_planet_active: "{planet} ist gerade aktiv", p3_which_ones: "Welche sind deine?", p3_cta: "Enthülle mein Signal",
    p4_headline: "Was ist am wichtigsten?", p4_sub: "Wähle alles, was zählt. Das formt dein Signal.", p4_selected: "{n} ausgewählt", p4_cta: "Weiter",
    p4_love: "Liebe", p4_career: "Karriere", p4_money: "Geld", p4_family: "Familie",
    p4_health: "Gesundheit", p4_creativity: "Kreativität", p4_home: "Zuhause", p4_friends: "Freunde", p4_meaning: "Sinn",
    p5_headline: "Dein Timing ist einzigartig.", p5_sub: "Konfiguriere deins.",
    p5_nickname_label: "Spitzname", p5_nickname_ph: "Wie sollen wir dich nennen?",
    p5_dob_label: "Geburtsdatum", p5_time_label: "Geburtszeit", p5_time_helper: "Präzision schärft dein Signal.",
    p5_place_label: "Geburtsort", p5_place_ph: "Stadt, Land",
    p5_privacy: "Deine Daten werden nur zur Vorbereitung deines Rhythmus verwendet.", p5_cta: "Mein Signal vorbereiten",
    p6_scanning: "Geburtshoroskop scannen", p6_status1: "Planetensignale lesen", p6_status2: "Momentum-Zeitleiste erstellen", p6_status3: "Erste Kapsel vorbereiten",
    p6_error: "Verbindungsproblem. Beispieldaten werden verwendet.", p6_signal_active: "Dein Signal ist aktiv", p6_built_real: "Basiert auf echten Planetendaten für deinen genauen Geburtsmoment.", p6_built_sample: "Erkunde mit Beispieldaten. Gib deine Geburtsdaten für eine persönliche Lesung ein.",
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
    success_toast: "Benvenuto in Favorable Pro ✦",
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
    systeme: "Sistema",
    account: "Account",
    sign_in: "Accedi",
    sign_out: "Esci",
    configure: "Configura",
    edit: "Modifica",
    language: "Lingua",
    your_plan: "Il tuo piano",
    manage_sub: "Gestisci",
    restore_purchases: "Ripristina acquisti",
    trial_ends_in: "Prova · {n}g rimasti",
    delete_account: "Elimina account",
    streak_day: "Giorno {n}",
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
    profile: "Profilo",
  },
  common: {
    cancel: "Annulla",
    continue: "Continua",
    close: "Chiudi",
    next: "Avanti",
    back: "Indietro",
  },
  onboarding: {
    back: "Indietro",
    p1_headline: "Alcuni periodi della vita sono più intensi.", p1_sub: "C'è una ragione.", p1_cta: "Mostrami",
    p2_headline: "C'è uno schema.", p2_signal_active: "Il tuo segnale è attivo", p2_cta: "Cosa significa?",
    p3_headline: "I pianeti plasmano\nil tuo timing.", p3_sub: "Ognuno porta un segnale. Alcuni sono attivi ora.", p3_planet_active: "{planet} è attivo ora", p3_which_ones: "Quali sono i tuoi?", p3_cta: "Rivela il mio segnale",
    p4_headline: "Cosa conta di più?", p4_sub: "Scegli tutto ciò che conta. Questo plasma il tuo segnale.", p4_selected: "{n} selezionati", p4_cta: "Continua",
    p4_love: "Amore", p4_career: "Carriera", p4_money: "Denaro", p4_family: "Famiglia",
    p4_health: "Salute", p4_creativity: "Creatività", p4_home: "Casa", p4_friends: "Amici", p4_meaning: "Significato",
    p5_headline: "Il tuo timing è unico.", p5_sub: "Configuralo.",
    p5_nickname_label: "Soprannome", p5_nickname_ph: "Come ti chiamiamo?",
    p5_dob_label: "Data di nascita", p5_time_label: "Ora di nascita", p5_time_helper: "La precisione affina il tuo segnale.",
    p5_place_label: "Luogo di nascita", p5_place_ph: "Città, Paese",
    p5_privacy: "I tuoi dati vengono usati solo per preparare il tuo ritmo.", p5_cta: "Prepara il mio segnale",
    p6_scanning: "Analisi del tuo tema natale", p6_status1: "Lettura dei segnali planetari", p6_status2: "Costruzione della timeline", p6_status3: "Preparazione della prima capsula",
    p6_error: "Problema di connessione. Uso dati di esempio.", p6_signal_active: "Il tuo segnale è attivo", p6_built_real: "Basato su dati planetari reali per il tuo esatto momento di nascita.", p6_built_sample: "Esplora con dati di esempio. Inserisci i tuoi dati di nascita per una lettura personale.",
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
    success_toast: "Bem-vindo ao Favorable Pro ✦",
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
    systeme: "Sistema",
    account: "Conta",
    sign_in: "Entrar",
    sign_out: "Sair",
    configure: "Configurar",
    edit: "Editar",
    language: "Idioma",
    your_plan: "Teu plano",
    manage_sub: "Gerir",
    restore_purchases: "Restaurar compras",
    trial_ends_in: "Teste · {n}d restantes",
    delete_account: "Eliminar conta",
    streak_day: "Dia {n}",
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
    profile: "Perfil",
  },
  common: {
    cancel: "Cancelar",
    continue: "Continuar",
    close: "Fechar",
    next: "Próximo",
    back: "Voltar",
  },
  onboarding: {
    back: "Voltar",
    p1_headline: "Alguns períodos da vida são mais intensos.", p1_sub: "Há uma razão.", p1_cta: "Mostre-me",
    p2_headline: "Há um padrão.", p2_signal_active: "Teu sinal está ativo", p2_cta: "O que isso significa?",
    p3_headline: "Os planetas moldam\nteu timing.", p3_sub: "Cada um carrega um sinal. Alguns estão ativos agora.", p3_planet_active: "{planet} está ativo agora", p3_which_ones: "Quais são os seus?", p3_cta: "Revela meu sinal",
    p4_headline: "O que mais importa?", p4_sub: "Escolha tudo o que importa. Isso molda seu sinal.", p4_selected: "{n} selecionados", p4_cta: "Continuar",
    p4_love: "Amor", p4_career: "Carreira", p4_money: "Dinheiro", p4_family: "Família",
    p4_health: "Saúde", p4_creativity: "Criatividade", p4_home: "Casa", p4_friends: "Amigos", p4_meaning: "Sentido",
    p5_headline: "Teu timing é único.", p5_sub: "Configure o seu.",
    p5_nickname_label: "Apelido", p5_nickname_ph: "Como devemos te chamar?",
    p5_dob_label: "Data de nascimento", p5_time_label: "Hora de nascimento", p5_time_helper: "A precisão aprimora teu sinal.",
    p5_place_label: "Local de nascimento", p5_place_ph: "Cidade, País",
    p5_privacy: "Seus dados são usados apenas para preparar teu ritmo.", p5_cta: "Prepara meu sinal",
    p6_scanning: "Analisando teu mapa natal", p6_status1: "Lendo teus sinais planetários", p6_status2: "Construindo tua linha do tempo", p6_status3: "Preparando tua primeira cápsula",
    p6_error: "Problema de conexão. Usando dados de exemplo.", p6_signal_active: "Teu sinal está ativo", p6_built_real: "Baseado em dados planetários reais para teu exato momento de nascimento.", p6_built_sample: "Explore com dados de exemplo. Insira seu nascimento para uma leitura pessoal.",
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
    success_toast: "Welkom bij Favorable Pro ✦",
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
    systeme: "Systeem",
    account: "Account",
    sign_in: "Inloggen",
    sign_out: "Uitloggen",
    configure: "Instellen",
    edit: "Bewerken",
    language: "Taal",
    your_plan: "Jouw abonnement",
    manage_sub: "Beheren",
    restore_purchases: "Aankopen herstellen",
    trial_ends_in: "Proef · nog {n}d",
    delete_account: "Account verwijderen",
    streak_day: "Dag {n}",
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
    profile: "Profiel",
  },
  common: {
    cancel: "Annuleren",
    continue: "Doorgaan",
    close: "Sluiten",
    next: "Volgende",
    back: "Terug",
  },
  onboarding: {
    back: "Terug",
    p1_headline: "Sommige perioden in je leven voelen intenser aan.", p1_sub: "Er is een reden.", p1_cta: "Laat me zien",
    p2_headline: "Er is een patroon.", p2_signal_active: "Jouw signaal is actief", p2_cta: "Wat betekent dit?",
    p3_headline: "Planeten vormen\njouw timing.", p3_sub: "Elk draagt een signaal. Sommige zijn nu actief.", p3_planet_active: "{planet} is nu actief", p3_which_ones: "Welke zijn de jouwe?", p3_cta: "Onthul mijn signaal",
    p4_headline: "Wat telt het meest?", p4_sub: "Kies alles wat telt. Dit vormt jouw signaal.", p4_selected: "{n} geselecteerd", p4_cta: "Doorgaan",
    p4_love: "Liefde", p4_career: "Carrière", p4_money: "Geld", p4_family: "Familie",
    p4_health: "Gezondheid", p4_creativity: "Creativiteit", p4_home: "Thuis", p4_friends: "Vrienden", p4_meaning: "Zingeving",
    p5_headline: "Jouw timing is uniek.", p5_sub: "Stel de jouwe in.",
    p5_nickname_label: "Bijnaam", p5_nickname_ph: "Hoe moeten we je noemen?",
    p5_dob_label: "Geboortedatum", p5_time_label: "Geboortetijd", p5_time_helper: "Precisie verscherpt jouw signaal.",
    p5_place_label: "Geboorteplaats", p5_place_ph: "Stad, Land",
    p5_privacy: "Jouw gegevens worden alleen gebruikt om jouw ritme te bepalen.", p5_cta: "Bereid mijn signaal voor",
    p6_scanning: "Geboortehoroscoop scannen", p6_status1: "Planetaire signalen lezen", p6_status2: "Momentum-tijdlijn opbouwen", p6_status3: "Eerste capsule voorbereiden",
    p6_error: "Verbindingsprobleem. Voorbeeldgegevens worden gebruikt.", p6_signal_active: "Jouw signaal is actief", p6_built_real: "Gebaseerd op echte planetaire gegevens voor jouw exacte geboortemoment.", p6_built_sample: "Verken met voorbeeldgegevens. Voer je geboortegegevens in voor een persoonlijke lezing.",
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
    success_toast: "Favorable Proへようこそ ✦",
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
    systeme: "システム",
    account: "アカウント",
    sign_in: "サインイン",
    sign_out: "サインアウト",
    configure: "設定する",
    edit: "編集",
    language: "言語",
    your_plan: "プラン",
    manage_sub: "管理",
    restore_purchases: "購入を復元",
    trial_ends_in: "試用 · あと{n}日",
    delete_account: "アカウント削除",
    streak_day: "{n}日目",
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
    profile: "プロフィール",
  },
  common: {
    cancel: "キャンセル",
    continue: "続ける",
    close: "閉じる",
    next: "次へ",
    back: "戻る",
  },
  onboarding: {
    back: "戻る",
    p1_headline: "人生のある時期はより強烈に感じる。", p1_sub: "理由がある。", p1_cta: "見せて",
    p2_headline: "パターンがある。", p2_signal_active: "あなたのシグナルは活性化中", p2_cta: "それはどういう意味？",
    p3_headline: "惑星があなたの\nタイミングを形作る。", p3_sub: "それぞれがシグナルを持つ。今活性化しているものもある。", p3_planet_active: "{planet}が今活性化中", p3_which_ones: "あなたのはどれ？", p3_cta: "シグナルを明かす",
    p4_headline: "何が一番大切？", p4_sub: "大切なものをすべて選ぶ。これがシグナルを形作る。", p4_selected: "{n} 件選択", p4_cta: "続ける",
    p4_love: "愛", p4_career: "キャリア", p4_money: "お金", p4_family: "家族",
    p4_health: "健康", p4_creativity: "創造性", p4_home: "家", p4_friends: "友達", p4_meaning: "意味",
    p5_headline: "あなたのタイミングは唯一無二。", p5_sub: "設定しよう。",
    p5_nickname_label: "ニックネーム", p5_nickname_ph: "なんと呼べばいい？",
    p5_dob_label: "生年月日", p5_time_label: "生まれた時間", p5_time_helper: "精度がシグナルを鋭くする。",
    p5_place_label: "出生地", p5_place_ph: "都市、国",
    p5_privacy: "あなたの情報はリズムの準備にのみ使用されます。", p5_cta: "シグナルを準備",
    p6_scanning: "出生チャートをスキャン中", p6_status1: "惑星シグナルを読み取り中", p6_status2: "モメンタムタイムライン構築中", p6_status3: "最初のカプセルを準備中",
    p6_error: "接続の問題。サンプルデータを使用中。", p6_signal_active: "あなたのシグナルは活性化中", p6_built_real: "あなたの正確な誕生時の惑星データから構築。", p6_built_sample: "サンプルデータで探索。個人的なリーディングのために誕生情報を入力してください。",
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
    success_toast: "欢迎加入 Favorable Pro ✦",
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
    systeme: "跟随系统",
    account: "账户",
    sign_in: "登录",
    sign_out: "退出",
    configure: "配置",
    edit: "编辑",
    language: "语言",
    your_plan: "我的计划",
    manage_sub: "管理",
    restore_purchases: "恢复购买",
    trial_ends_in: "试用 · 剩{n}天",
    delete_account: "删除账户",
    streak_day: "第{n}天",
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
    profile: "个人资料",
  },
  common: {
    cancel: "取消",
    continue: "继续",
    close: "关闭",
    next: "下一步",
    back: "返回",
  },
  onboarding: {
    back: "返回",
    p1_headline: "生命中某些时期感觉更加强烈。", p1_sub: "这是有原因的。", p1_cta: "让我看看",
    p2_headline: "有一个规律。", p2_signal_active: "您的信号正在激活", p2_cta: "这是什么意思？",
    p3_headline: "行星塑造\n您的时机。", p3_sub: "每颗都携带信号。有些现在正在激活。", p3_planet_active: "{planet}现在正在激活", p3_which_ones: "哪些是您的？", p3_cta: "揭示我的信号",
    p4_headline: "什么最重要？", p4_sub: "选择所有重要的方面。这塑造您的信号。", p4_selected: "已选 {n} 个", p4_cta: "继续",
    p4_love: "爱情", p4_career: "事业", p4_money: "金钱", p4_family: "家庭",
    p4_health: "健康", p4_creativity: "创意", p4_home: "家园", p4_friends: "友谊", p4_meaning: "意义",
    p5_headline: "您的时机是独特的。", p5_sub: "配置您的信息。",
    p5_nickname_label: "昵称", p5_nickname_ph: "我们该怎么称呼您？",
    p5_dob_label: "出生日期", p5_time_label: "出生时间", p5_time_helper: "精确度可以增强您的信号。",
    p5_place_label: "出生地", p5_place_ph: "城市，国家",
    p5_privacy: "您的信息仅用于准备您的个人节律。", p5_cta: "准备我的信号",
    p6_scanning: "扫描您的出生星图", p6_status1: "读取行星信号", p6_status2: "构建动量时间线", p6_status3: "准备第一个胶囊",
    p6_error: "连接问题。使用示例数据。", p6_signal_active: "您的信号正在激活", p6_built_real: "基于您精确出生时刻的真实行星数据构建。", p6_built_sample: "用示例数据探索。输入您的出生信息以获得个人解读。",
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
    success_toast: "مرحباً بك في Favorable Pro ✦",
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
    systeme: "النظام",
    account: "الحساب",
    sign_in: "تسجيل الدخول",
    sign_out: "تسجيل الخروج",
    configure: "تكوين",
    edit: "تعديل",
    language: "اللغة",
    your_plan: "اشتراكك",
    manage_sub: "إدارة",
    restore_purchases: "استعادة المشتريات",
    trial_ends_in: "تجربة · {n} أيام",
    delete_account: "حذف الحساب",
    streak_day: "اليوم {n}",
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
    profile: "الملف الشخصي",
  },
  common: {
    cancel: "إلغاء",
    continue: "متابعة",
    close: "إغلاق",
    next: "التالي",
    back: "رجوع",
  },
  onboarding: {
    back: "رجوع",
    p1_headline: "بعض فترات حياتك تبدو أكثر حدة.", p1_sub: "هناك سبب.", p1_cta: "أرني",
    p2_headline: "هناك نمط.", p2_signal_active: "إشارتك نشطة", p2_cta: "ماذا يعني هذا؟",
    p3_headline: "الكواكب تشكل\nتوقيتك.", p3_sub: "كل كوكب يحمل إشارة. بعضها نشط الآن.", p3_planet_active: "{planet} نشط الآن", p3_which_ones: "أيها ينتمي لك؟", p3_cta: "اكشف إشارتي",
    p4_headline: "ما الأهم بالنسبة لك؟", p4_sub: "اختر كل ما يهمك. هذا يشكل إشارتك.", p4_selected: "{n} محدد", p4_cta: "متابعة",
    p4_love: "الحب", p4_career: "المسيرة", p4_money: "المال", p4_family: "العائلة",
    p4_health: "الصحة", p4_creativity: "الإبداع", p4_home: "المنزل", p4_friends: "الأصدقاء", p4_meaning: "المعنى",
    p5_headline: "توقيتك فريد من نوعه.", p5_sub: "قم بتكوينه.",
    p5_nickname_label: "اللقب", p5_nickname_ph: "كيف يجب أن نناديك؟",
    p5_dob_label: "تاريخ الميلاد", p5_time_label: "وقت الميلاد", p5_time_helper: "الدقة تحدد إشارتك.",
    p5_place_label: "مكان الميلاد", p5_place_ph: "المدينة، الدولة",
    p5_privacy: "بياناتك تُستخدم فقط لإعداد إيقاعك الشخصي.", p5_cta: "جهز إشارتي",
    p6_scanning: "مسح خريطة ميلادك", p6_status1: "قراءة إشاراتك الكوكبية", p6_status2: "بناء خط زمن الزخم", p6_status3: "تحضير أول كبسولة",
    p6_error: "مشكلة في الاتصال. استخدام بيانات نموذجية.", p6_signal_active: "إشارتك نشطة", p6_built_real: "مبني من بيانات كوكبية حقيقية للحظة ميلادك الدقيقة.", p6_built_sample: "استكشف مع بيانات نموذجية. أدخل معلومات ميلادك للحصول على قراءة شخصية.",
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
