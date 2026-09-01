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
    notifications: string;
    notif_active: string;
    notif_reglages: string;
    trial_days: string;
    notif_cadence: string;
    notif_activer: string;
    notif_essentiel: string;
    notif_normal: string;
    notif_tout: string;
    delete_warning: string;
    delete_confirm: string;
    delete_cancel: string;
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
    signing_in: string;
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
  accueil: { ligne: string };
  fiche: {
    sens: string; usage: string; vigilance: string; apres: string;
  };
  guide: {
    p1_titre: string; p1_corps: string;
    p2_titre: string; p2_corps: string;
    p3_titre: string; p3_corps: string;
    suivant: string; commencer: string; passer: string;
    progression: string;
    revoir: string;
  };
  common: {
    echec_titre: string;
    echec_corps: string;
    echec_reessayer: string;
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
    p6_nom: string; p6_nom_ex: string; p6_date: string; p6_heure: string;
    p6_heure_aide: string; p6_lieu: string; p6_lieu_ex: string; p6_lieu_aide: string;
    p6_error: string; p6_signal_active: string; p6_built_real: string; p6_built_sample: string;
  };
  connexions: {
    titre: string;
    compte: string;
    compris: string;
    code_soi: string;
    code_deja: string;
    code_introuvable: string;
    code_erreur: string;
    code_reseau: string;
    code_ou_lien: string;
    partage_sous: string;
    votre_code: string;
    bouton_sms: string;
    copier: string;
    copie: string;
    retour_liste: string;
    partage_message: string;
    partage_sujet: string;
    moi: string;
    quelquun: string;
    connexion_en_cours: string;
    connecte_avec: string;
  };
  boudin: {
    titre: string;
  };
};

const FR: Strings = {
  premium: {
    headline: "Débloque ton timing complet",
    sub: "Toutes tes périodes, passées et à venir",
    feature_forecast: "Prévision 7 jours avec marqueurs de pic",
    feature_alerts: "Prévenu la veille d'un basculement",
    feature_map: "Carte mensuelle de momentum",
    feature_unlimited_ai: "Délinéations IA illimitées",
    feature_brief: "Brief quotidien personnalisé",
    cta_web: "Démarrer 7 jours gratuits",
    cta_ios: "Continuer",
    dismiss: "Plus tard",
    trial_pitch: "7 jours d'essai, annulable à tout moment",
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
    notifications: "Me prévenir",
    notif_active: "Activé",
    notif_reglages: "À réactiver dans les Réglages",
    trial_days: "{n} j d'essai",
    notif_cadence: "Fréquence",
    notif_activer: "Activer",
    notif_essentiel: "L'essentiel",
    notif_normal: "Équilibré",
    notif_tout: "Tout",
    delete_warning: "Cela efface définitivement ta naissance, tes signaux et tes connexions. Rien n'est récupérable.",
    delete_confirm: "Oui, tout supprimer",
    delete_cancel: "Annuler",
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
    signing_in: "Connexion en cours…",
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
  accueil: { ligne: "Chaque période, de ta naissance aux mois qui viennent." },
  fiche: { sens: "Ce que ça veut dire", usage: "Ce qui aide", vigilance: "À surveiller", apres: "Quand ça s'allège" },
  guide: {
    p1_titre: "Tu es ici, aujourd'hui.", p1_corps: "Cette ligne et ce chiffre donnent l'âge de ce que tu regardes. Fais défiler, ils suivent.",
    p2_titre: "Ta vie, de bas en haut.", p2_corps: "En bas, ta naissance. En haut, les mois qui viennent. Chaque capsule est une période.",
    p3_titre: "Touche une capsule.", p3_corps: "Elle ouvre la période : ses dates, les planètes qui la traversent, ce que ça déplace.",
    suivant: "Suivant", commencer: "Commencer", passer: "Passer",
    progression: "Étape {n} sur {total}", revoir: "Revoir le guide",
  },
  common: {
    echec_titre: "Ta timeline n'a pas pu être calculée",
    echec_corps: "Le calcul n'a pas répondu. Ça arrive, et ce n'est pas perdu — tes données sont intactes.",
    echec_reessayer: "Réessayer",
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
    p6_nom: "Prénom", p6_nom_ex: "Comment t'appeler ?", p6_date: "Date de naissance", p6_heure: "Heure de naissance",
    p6_heure_aide: "Requis — l'heure change tout le calcul", p6_lieu: "Lieu de naissance", p6_lieu_ex: "Ville, pays", p6_lieu_aide: "Requis — tape et choisis dans la liste",
    p6_error: "Problème de connexion. Données d'exemple utilisées.", p6_signal_active: "Ton signal est actif", p6_built_real: "Calculé depuis les données planétaires exactes de ta naissance.", p6_built_sample: "Explore avec des données d'exemple. Saisis ta naissance pour une lecture personnelle.",
  },
  connexions: {
    titre: "Connexions",
    compte: "{n} connecté(s)",
    compris: "Compris",
    code_soi: "C'est votre propre code.",
    code_deja: "Déjà connecté avec ce code.",
    code_introuvable: "Code introuvable. Demande à la personne de rouvrir Favorable une fois pour synchroniser son code.",
    code_erreur: "Erreur de connexion. Réessaie dans un instant.",
    code_reseau: "Erreur réseau. Réessaie dans un instant.",
    code_ou_lien: "Ou demande le lien d'invitation complet pour une connexion sans code.",
    partage_sous: "Envoyez ce lien pour comparer vos rythmes.",
    votre_code: "Votre code",
    bouton_sms: "Message",
    copier: "Copier le lien",
    copie: "Copié !",
    retour_liste: "Retour aux connexions",
    partage_message: "Je compare nos rythmes sur Favorable. Clique ici pour voir notre compatibilité : {url}",
    partage_sujet: "Comparons nos rythmes sur Favorable",
    moi: "Moi",
    quelquun: "quelqu'un",
    connexion_en_cours: "Connexion en cours…",
    connecte_avec: "Connecté avec {name}",
  },
  boudin: {
    titre: "Timeline de vie",
  },
};

const EN: Strings = {
  premium: {
    headline: "Unlock your timing advantage",
    sub: "All your periods, past and ahead",
    feature_forecast: "7-day forecast with peak markers",
    feature_alerts: "Told the day before a shift",
    feature_map: "Monthly momentum map",
    feature_unlimited_ai: "Unlimited AI delineations",
    feature_brief: "Personalized daily brief",
    cta_web: "Start 7-day free trial",
    cta_ios: "Continue",
    dismiss: "Maybe later",
    trial_pitch: "7-day trial, cancel anytime",
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
    notifications: "Notify me",
    notif_active: "On",
    notif_reglages: "Turn back on in Settings",
    trial_days: "{n} days left",
    notif_cadence: "Frequency",
    notif_activer: "Turn on",
    notif_essentiel: "Essential only",
    notif_normal: "Balanced",
    notif_tout: "Everything",
    delete_warning: "This permanently erases your birth data, your signals and your connections. Nothing can be recovered.",
    delete_confirm: "Yes, delete everything",
    delete_cancel: "Cancel",
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
    signing_in: "Signing you in…",
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
  accueil: { ligne: "Every period, from your birth to the coming months." },
  fiche: { sens: "What it means", usage: "What helps", vigilance: "Watch out for", apres: "When it eases" },
  guide: {
    p1_titre: "You are here, today.", p1_corps: "This line and this number show the age of whatever you are looking at. Scroll, they follow.",
    p2_titre: "Your life, bottom to top.", p2_corps: "Birth at the bottom. The coming months at the top. Each capsule is one period.",
    p3_titre: "Tap a capsule.", p3_corps: "It opens the period: its dates, the planets moving through it, what that shifts.",
    suivant: "Next", commencer: "Start", passer: "Skip",
    progression: "Step {n} of {total}", revoir: "Replay the guide",
  },
  common: {
    echec_titre: "Your timeline couldn't be calculated",
    echec_corps: "The calculation didn't respond. It happens, and nothing is lost — your data is intact.",
    echec_reessayer: "Try again",
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
    p6_nom: "First name", p6_nom_ex: "What should we call you?", p6_date: "Date of birth", p6_heure: "Time of birth",
    p6_heure_aide: "Required — the time changes the whole calculation", p6_lieu: "Place of birth", p6_lieu_ex: "City, country", p6_lieu_aide: "Required — type and pick from the list",
    p6_error: "Connection issue. Using sample data instead.", p6_signal_active: "Your signal is active", p6_built_real: "Built from real planetary data for your exact birth moment.", p6_built_sample: "Explore with sample data. Enter your birth info for a personal reading.",
  },
  connexions: {
    titre: "Connections",
    compte: "{n} connected",
    compris: "Got it",
    code_soi: "That's your own code.",
    code_deja: "Already connected with this code.",
    code_introuvable: "Code not found. Ask the other person to open Favorable once so their code syncs.",
    code_erreur: "Connection error. Try again in a moment.",
    code_reseau: "Network error. Try again in a moment.",
    code_ou_lien: "Or ask for the full invite link to connect without a code.",
    partage_sous: "Send this link to compare your rhythms.",
    votre_code: "Your code",
    bouton_sms: "Message",
    copier: "Copy link",
    copie: "Copied!",
    retour_liste: "Back to connections",
    partage_message: "I'm comparing our rhythms on Favorable. Click here to see how we match: {url}",
    partage_sujet: "Let's compare our rhythms on Favorable",
    moi: "Me",
    quelquun: "someone",
    connexion_en_cours: "Connecting…",
    connecte_avec: "Connected with {name}",
  },
  boudin: {
    titre: "Lifetime timeline",
  },
};

const ES: Strings = {
  premium: {
    headline: "Desbloquea tu ventaja de timing",
    sub: "Todos tus periodos, pasados y por venir",
    feature_forecast: "Pronóstico de 7 días con picos",
    feature_alerts: "Aviso el día antes de un cambio",
    feature_map: "Mapa mensual de momentum",
    feature_unlimited_ai: "Análisis IA ilimitados",
    feature_brief: "Brief diario personalizado",
    cta_web: "Empezar 7 días gratis",
    cta_ios: "Continuar",
    dismiss: "Más tarde",
    trial_pitch: "7 días de prueba, cancela cuando quieras",
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
    notifications: "Avisarme",
    notif_active: "Activado",
    notif_reglages: "Reactivar en Ajustes",
    trial_days: "{n} días de prueba",
    notif_cadence: "Frecuencia",
    notif_activer: "Activar",
    notif_essentiel: "Lo esencial",
    notif_normal: "Equilibrado",
    notif_tout: "Todo",
    delete_warning: "Esto borra definitivamente tus datos de nacimiento, tus señales y tus conexiones. Nada se puede recuperar.",
    delete_confirm: "Sí, borrar todo",
    delete_cancel: "Cancelar",
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
    signing_in: "Iniciando sesión…",
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
  accueil: { ligne: "Cada periodo, desde tu nacimiento hasta los meses que vienen." },
  fiche: { sens: "Qué significa", usage: "Qué ayuda", vigilance: "A qué prestar atención", apres: "Cuándo se alivia" },
  guide: {
    p1_titre: "Estás aquí, hoy.", p1_corps: "Esta línea y este número dan la edad de lo que miras. Desplaza, te siguen.",
    p2_titre: "Tu vida, de abajo arriba.", p2_corps: "Abajo, tu nacimiento. Arriba, los meses que vienen. Cada cápsula es un periodo.",
    p3_titre: "Toca una cápsula.", p3_corps: "Abre el periodo: sus fechas, los planetas que lo atraviesan, lo que mueve.",
    suivant: "Siguiente", commencer: "Empezar", passer: "Saltar",
    progression: "Paso {n} de {total}", revoir: "Volver a ver la guía",
  },
  common: {
    echec_titre: "No se pudo calcular tu línea de tiempo",
    echec_corps: "El cálculo no respondió. Pasa, y no se ha perdido nada: tus datos están intactos.",
    echec_reessayer: "Reintentar",
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
    p6_nom: "Nombre", p6_nom_ex: "¿Cómo te llamamos?", p6_date: "Fecha de nacimiento", p6_heure: "Hora de nacimiento",
    p6_heure_aide: "Obligatorio — la hora cambia todo el cálculo", p6_lieu: "Lugar de nacimiento", p6_lieu_ex: "Ciudad, país", p6_lieu_aide: "Obligatorio — escribe y elige de la lista",
    p6_error: "Problema de conexión. Usando datos de ejemplo.", p6_signal_active: "Tu señal está activa", p6_built_real: "Basado en datos planetarios reales de tu momento de nacimiento exacto.", p6_built_sample: "Explora con datos de ejemplo. Ingresa tus datos de nacimiento para una lectura personal.",
  },
  connexions: {
    titre: "Conexiones",
    compte: "{n} conectado(s)",
    compris: "Entendido",
    code_soi: "Ese es tu propio código.",
    code_deja: "Ya estás conectado con este código.",
    code_introuvable: "Código no encontrado. Pídele a la otra persona que abra Favorable una vez para sincronizar su código.",
    code_erreur: "Error de conexión. Inténtalo de nuevo en un momento.",
    code_reseau: "Error de red. Inténtalo de nuevo en un momento.",
    code_ou_lien: "O pide el enlace de invitación completo para conectar sin código.",
    partage_sous: "Envía este enlace para comparar vuestros ritmos.",
    votre_code: "Tu código",
    bouton_sms: "Mensaje",
    copier: "Copiar el enlace",
    copie: "¡Copiado!",
    retour_liste: "Volver a las conexiones",
    partage_message: "Estoy comparando nuestros ritmos en Favorable. Haz clic aquí para ver nuestra compatibilidad: {url}",
    partage_sujet: "Comparemos nuestros ritmos en Favorable",
    moi: "Yo",
    quelquun: "alguien",
    connexion_en_cours: "Conectando…",
    connecte_avec: "Conectado con {name}",
  },
  boudin: {
    titre: "Línea de tiempo de vida",
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
    notifications: "Benachrichtigen",
    notif_active: "An",
    notif_reglages: "In den Einstellungen wieder aktivieren",
    trial_days: "noch {n} Tage",
    notif_cadence: "Häufigkeit",
    notif_activer: "Aktivieren",
    notif_essentiel: "Nur Wichtiges",
    notif_normal: "Ausgewogen",
    notif_tout: "Alles",
    delete_warning: "Dies löscht deine Geburtsdaten, deine Signale und deine Verbindungen endgültig. Nichts lässt sich wiederherstellen.",
    delete_confirm: "Ja, alles löschen",
    delete_cancel: "Abbrechen",
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
    signing_in: "Anmeldung läuft…",
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
  accueil: { ligne: "Jede Phase, von deiner Geburt bis zu den kommenden Monaten." },
  fiche: { sens: "Was es bedeutet", usage: "Was hilft", vigilance: "Worauf achten", apres: "Wann es leichter wird" },
  guide: {
    p1_titre: "Du bist hier, heute.", p1_corps: "Diese Linie und diese Zahl zeigen das Alter dessen, was du siehst. Scrolle, sie folgen.",
    p2_titre: "Dein Leben, von unten.", p2_corps: "Unten deine Geburt. Oben die kommenden Monate. Jede Kapsel ist eine Phase.",
    p3_titre: "Tippe eine Kapsel an.", p3_corps: "Sie öffnet die Phase: ihre Daten, die Planeten darin, was sich verschiebt.",
    suivant: "Weiter", commencer: "Starten", passer: "Überspringen",
    progression: "Schritt {n} von {total}", revoir: "Anleitung erneut ansehen",
  },
  common: {
    echec_titre: "Deine Timeline konnte nicht berechnet werden",
    echec_corps: "Die Berechnung hat nicht geantwortet. Das kommt vor, nichts ist verloren — deine Daten sind intakt.",
    echec_reessayer: "Erneut versuchen",
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
    p6_nom: "Vorname", p6_nom_ex: "Wie sollen wir dich nennen?", p6_date: "Geburtsdatum", p6_heure: "Geburtszeit",
    p6_heure_aide: "Erforderlich — die Zeit ändert die ganze Berechnung", p6_lieu: "Geburtsort", p6_lieu_ex: "Stadt, Land", p6_lieu_aide: "Erforderlich — tippe und wähle aus der Liste",
    p6_error: "Verbindungsproblem. Beispieldaten werden verwendet.", p6_signal_active: "Dein Signal ist aktiv", p6_built_real: "Basiert auf echten Planetendaten für deinen genauen Geburtsmoment.", p6_built_sample: "Erkunde mit Beispieldaten. Gib deine Geburtsdaten für eine persönliche Lesung ein.",
  },
  connexions: {
    titre: "Verbindungen",
    compte: "{n} verbunden",
    compris: "Verstanden",
    code_soi: "Das ist dein eigener Code.",
    code_deja: "Mit diesem Code bereits verbunden.",
    code_introuvable: "Code nicht gefunden. Bitte die andere Person, Favorable einmal zu öffnen, damit ihr Code synchronisiert wird.",
    code_erreur: "Verbindungsfehler. Versuch es gleich noch einmal.",
    code_reseau: "Netzwerkfehler. Versuch es gleich noch einmal.",
    code_ou_lien: "Oder frag nach dem vollständigen Einladungslink, um dich ohne Code zu verbinden.",
    partage_sous: "Schick diesen Link, um eure Rhythmen zu vergleichen.",
    votre_code: "Dein Code",
    bouton_sms: "Nachricht",
    copier: "Link kopieren",
    copie: "Kopiert!",
    retour_liste: "Zurück zu den Verbindungen",
    partage_message: "Ich vergleiche unsere Rhythmen auf Favorable. Klick hier, um unsere Übereinstimmung zu sehen: {url}",
    partage_sujet: "Vergleichen wir unsere Rhythmen auf Favorable",
    moi: "Ich",
    quelquun: "jemandem",
    connexion_en_cours: "Verbindung läuft…",
    connecte_avec: "Mit {name} verbunden",
  },
  boudin: {
    titre: "Lebens-Zeitleiste",
  },
};

const IT: Strings = {
  premium: {
    headline: "Sblocca il tuo vantaggio temporale",
    sub: "Vedi cosa arriva prima che arrivi",
    feature_forecast: "Previsione 7 giorni con picchi",
    feature_alerts: "Avvisato il giorno prima di un cambio",
    feature_map: "Mappa mensile del momentum",
    feature_unlimited_ai: "Analisi IA illimitate",
    feature_brief: "Brief quotidiano personalizzato",
    cta_web: "Inizia 7 giorni gratis",
    cta_ios: "Continua",
    dismiss: "Più tardi",
    trial_pitch: "7 giorni di prova, disdici quando vuoi",
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
    notifications: "Avvisami",
    notif_active: "Attivo",
    notif_reglages: "Riattiva nelle Impostazioni",
    trial_days: "{n} giorni di prova",
    notif_cadence: "Frequenza",
    notif_activer: "Attiva",
    notif_essentiel: "L'essenziale",
    notif_normal: "Equilibrato",
    notif_tout: "Tutto",
    delete_warning: "Questo cancella definitivamente i tuoi dati di nascita, i tuoi segnali e le tue connessioni. Nulla è recuperabile.",
    delete_confirm: "Sì, elimina tutto",
    delete_cancel: "Annulla",
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
    signing_in: "Accesso in corso…",
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
  accueil: { ligne: "Ogni periodo, dalla tua nascita ai mesi che vengono." },
  fiche: { sens: "Cosa significa", usage: "Cosa aiuta", vigilance: "A cosa fare attenzione", apres: "Quando si alleggerisce" },
  guide: {
    p1_titre: "Sei qui, oggi.", p1_corps: "Questa linea e questo numero danno l'età di ciò che guardi. Scorri, ti seguono.",
    p2_titre: "La tua vita, dal basso.", p2_corps: "In basso la nascita. In alto i mesi che vengono. Ogni capsula è un periodo.",
    p3_titre: "Tocca una capsula.", p3_corps: "Apre il periodo: le sue date, i pianeti che lo attraversano, ciò che sposta.",
    suivant: "Avanti", commencer: "Iniziare", passer: "Salta",
    progression: "Passo {n} di {total}", revoir: "Rivedere la guida",
  },
  common: {
    echec_titre: "Non è stato possibile calcolare la tua timeline",
    echec_corps: "Il calcolo non ha risposto. Capita, e non si è perso nulla: i tuoi dati sono intatti.",
    echec_reessayer: "Riprova",
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
    p6_nom: "Nome", p6_nom_ex: "Come ti chiamiamo?", p6_date: "Data di nascita", p6_heure: "Ora di nascita",
    p6_heure_aide: "Obbligatorio — l'ora cambia tutto il calcolo", p6_lieu: "Luogo di nascita", p6_lieu_ex: "Città, paese", p6_lieu_aide: "Obbligatorio — scrivi e scegli dalla lista",
    p6_error: "Problema di connessione. Uso dati di esempio.", p6_signal_active: "Il tuo segnale è attivo", p6_built_real: "Basato su dati planetari reali per il tuo esatto momento di nascita.", p6_built_sample: "Esplora con dati di esempio. Inserisci i tuoi dati di nascita per una lettura personale.",
  },
  connexions: {
    titre: "Connessioni",
    compte: "{n} connesso/i",
    compris: "Ho capito",
    code_soi: "È il tuo stesso codice.",
    code_deja: "Già connesso con questo codice.",
    code_introuvable: "Codice non trovato. Chiedi all'altra persona di aprire Favorable una volta per sincronizzare il suo codice.",
    code_erreur: "Errore di connessione. Riprova tra un istante.",
    code_reseau: "Errore di rete. Riprova tra un istante.",
    code_ou_lien: "Oppure chiedi il link d'invito completo per connetterti senza codice.",
    partage_sous: "Invia questo link per confrontare i vostri ritmi.",
    votre_code: "Il tuo codice",
    bouton_sms: "Messaggio",
    copier: "Copia il link",
    copie: "Copiato!",
    retour_liste: "Torna alle connessioni",
    partage_message: "Sto confrontando i nostri ritmi su Favorable. Clicca qui per vedere la nostra compatibilità: {url}",
    partage_sujet: "Confrontiamo i nostri ritmi su Favorable",
    moi: "Io",
    quelquun: "qualcuno",
    connexion_en_cours: "Connessione in corso…",
    connecte_avec: "Connesso con {name}",
  },
  boudin: {
    titre: "Timeline di vita",
  },
};

const PT: Strings = {
  premium: {
    headline: "Desbloqueie sua vantagem de timing",
    sub: "Veja o que vem antes de chegar",
    feature_forecast: "Previsão de 7 dias com picos",
    feature_alerts: "Avisado na véspera de uma mudança",
    feature_map: "Mapa mensal de momentum",
    feature_unlimited_ai: "Análises de IA ilimitadas",
    feature_brief: "Resumo diário personalizado",
    cta_web: "Começar 7 dias grátis",
    cta_ios: "Continuar",
    dismiss: "Mais tarde",
    trial_pitch: "7 dias de teste, cancela quando quiseres",
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
    notifications: "Avise-me",
    notif_active: "Ativado",
    notif_reglages: "Reativar nos Ajustes",
    trial_days: "{n} dias de teste",
    notif_cadence: "Frequência",
    notif_activer: "Ativar",
    notif_essentiel: "O essencial",
    notif_normal: "Equilibrado",
    notif_tout: "Tudo",
    delete_warning: "Isso apaga definitivamente seus dados de nascimento, seus sinais e suas conexões. Nada pode ser recuperado.",
    delete_confirm: "Sim, excluir tudo",
    delete_cancel: "Cancelar",
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
    signing_in: "A iniciar sessão…",
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
  accueil: { ligne: "Cada período, do teu nascimento aos meses que vêm." },
  fiche: { sens: "O que significa", usage: "O que ajuda", vigilance: "A que prestar atenção", apres: "Quando alivia" },
  guide: {
    p1_titre: "Estás aqui, hoje.", p1_corps: "Esta linha e este número dão a idade do que estás a ver. Desliza, acompanham.",
    p2_titre: "A tua vida, de baixo.", p2_corps: "Em baixo o nascimento. Em cima os meses que vêm. Cada cápsula é um período.",
    p3_titre: "Toca numa cápsula.", p3_corps: "Abre o período: as suas datas, os planetas que o atravessam, o que desloca.",
    suivant: "Seguinte", commencer: "Começar", passer: "Saltar",
    progression: "Passo {n} de {total}", revoir: "Rever o guia",
  },
  common: {
    echec_titre: "Não foi possível calcular a tua linha do tempo",
    echec_corps: "O cálculo não respondeu. Acontece, e nada se perdeu — os teus dados estão intactos.",
    echec_reessayer: "Tentar de novo",
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
    p6_nom: "Nome", p6_nom_ex: "Como te chamamos?", p6_date: "Data de nascimento", p6_heure: "Hora de nascimento",
    p6_heure_aide: "Obrigatório — a hora muda todo o cálculo", p6_lieu: "Local de nascimento", p6_lieu_ex: "Cidade, país", p6_lieu_aide: "Obrigatório — escreve e escolhe da lista",
    p6_error: "Problema de conexão. Usando dados de exemplo.", p6_signal_active: "Teu sinal está ativo", p6_built_real: "Baseado em dados planetários reais para teu exato momento de nascimento.", p6_built_sample: "Explore com dados de exemplo. Insira seu nascimento para uma leitura pessoal.",
  },
  connexions: {
    titre: "Ligações",
    compte: "{n} ligado(s)",
    compris: "Entendido",
    code_soi: "Esse é o teu próprio código.",
    code_deja: "Já estás ligado com este código.",
    code_introuvable: "Código não encontrado. Pede à outra pessoa para abrir o Favorable uma vez para sincronizar o código.",
    code_erreur: "Erro de ligação. Tenta de novo daqui a pouco.",
    code_reseau: "Erro de rede. Tenta de novo daqui a pouco.",
    code_ou_lien: "Ou pede o link de convite completo para ligar sem código.",
    partage_sous: "Envia este link para comparar os vossos ritmos.",
    votre_code: "O teu código",
    bouton_sms: "Mensagem",
    copier: "Copiar o link",
    copie: "Copiado!",
    retour_liste: "Voltar às ligações",
    partage_message: "Estou a comparar os nossos ritmos no Favorable. Clica aqui para ver a nossa compatibilidade: {url}",
    partage_sujet: "Vamos comparar os nossos ritmos no Favorable",
    moi: "Eu",
    quelquun: "alguém",
    connexion_en_cours: "A ligar…",
    connecte_avec: "Ligado com {name}",
  },
  boudin: {
    titre: "Linha do tempo de vida",
  },
};

const NL: Strings = {
  premium: {
    headline: "Ontgrendel je timing-voordeel",
    sub: "Al je periodes, verleden en toekomst",
    feature_forecast: "7-daagse voorspelling met pieken",
    feature_alerts: "Real-time piekwaarschuwingen",
    feature_map: "Maandelijkse momentum-kaart",
    feature_unlimited_ai: "Onbeperkte AI-analyses",
    feature_brief: "Persoonlijke dagelijkse briefing",
    cta_web: "Start 7 dagen gratis",
    cta_ios: "Doorgaan",
    dismiss: "Later",
    trial_pitch: "7 dagen proberen, altijd opzegbaar",
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
    notifications: "Waarschuw me",
    notif_active: "Aan",
    notif_reglages: "Weer inschakelen in Instellingen",
    trial_days: "nog {n} dagen",
    notif_cadence: "Frequentie",
    notif_activer: "Inschakelen",
    notif_essentiel: "Alleen belangrijk",
    notif_normal: "Gebalanceerd",
    notif_tout: "Alles",
    delete_warning: "Dit wist je geboortegegevens, je signalen en je connecties definitief. Niets kan worden hersteld.",
    delete_confirm: "Ja, alles verwijderen",
    delete_cancel: "Annuleren",
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
    signing_in: "Je wordt aangemeld…",
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
  accueil: { ligne: "Elke periode, van je geboorte tot de komende maanden." },
  fiche: { sens: "Wat het betekent", usage: "Wat helpt", vigilance: "Waar op letten", apres: "Wanneer het lichter wordt" },
  guide: {
    p1_titre: "Je bent hier, vandaag.", p1_corps: "Deze lijn en dit getal tonen de leeftijd van wat je ziet. Scroll, ze volgen.",
    p2_titre: "Je leven, van onderaf.", p2_corps: "Onderaan je geboorte. Bovenaan de komende maanden. Elke capsule is een periode.",
    p3_titre: "Tik op een capsule.", p3_corps: "Ze opent de periode: de data, de planeten erdoorheen, wat er verschuift.",
    suivant: "Volgende", commencer: "Beginnen", passer: "Overslaan",
    progression: "Stap {n} van {total}", revoir: "Gids opnieuw bekijken",
  },
  common: {
    echec_titre: "Je tijdlijn kon niet worden berekend",
    echec_corps: "De berekening reageerde niet. Dat gebeurt, en er is niets verloren — je gegevens zijn intact.",
    echec_reessayer: "Opnieuw proberen",
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
    p6_nom: "Voornaam", p6_nom_ex: "Hoe noemen we je?", p6_date: "Geboortedatum", p6_heure: "Geboortetijd",
    p6_heure_aide: "Vereist — de tijd verandert de hele berekening", p6_lieu: "Geboorteplaats", p6_lieu_ex: "Stad, land", p6_lieu_aide: "Vereist — typ en kies uit de lijst",
    p6_error: "Verbindingsprobleem. Voorbeeldgegevens worden gebruikt.", p6_signal_active: "Jouw signaal is actief", p6_built_real: "Gebaseerd op echte planetaire gegevens voor jouw exacte geboortemoment.", p6_built_sample: "Verken met voorbeeldgegevens. Voer je geboortegegevens in voor een persoonlijke lezing.",
  },
  connexions: {
    titre: "Connecties",
    compte: "{n} verbonden",
    compris: "Begrepen",
    code_soi: "Dat is je eigen code.",
    code_deja: "Al verbonden met deze code.",
    code_introuvable: "Code niet gevonden. Vraag de ander om Favorable één keer te openen zodat de code synchroniseert.",
    code_erreur: "Verbindingsfout. Probeer het zo opnieuw.",
    code_reseau: "Netwerkfout. Probeer het zo opnieuw.",
    code_ou_lien: "Of vraag om de volledige uitnodigingslink om zonder code te verbinden.",
    partage_sous: "Stuur deze link om jullie ritmes te vergelijken.",
    votre_code: "Jouw code",
    bouton_sms: "Bericht",
    copier: "Link kopiëren",
    copie: "Gekopieerd!",
    retour_liste: "Terug naar connecties",
    partage_message: "Ik vergelijk onze ritmes op Favorable. Klik hier om onze match te zien: {url}",
    partage_sujet: "Laten we onze ritmes vergelijken op Favorable",
    moi: "Ik",
    quelquun: "iemand",
    connexion_en_cours: "Verbinden…",
    connecte_avec: "Verbonden met {name}",
  },
  boudin: {
    titre: "Levenstijdlijn",
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
    notifications: "通知を受け取る",
    notif_active: "オン",
    notif_reglages: "設定で再度オンにしてください",
    trial_days: "残り{n}日",
    notif_cadence: "頻度",
    notif_activer: "オンにする",
    notif_essentiel: "重要なものだけ",
    notif_normal: "標準",
    notif_tout: "すべて",
    delete_warning: "出生情報、シグナル、つながりが完全に削除されます。復元はできません。",
    delete_confirm: "はい、すべて削除",
    delete_cancel: "キャンセル",
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
    signing_in: "サインインしています…",
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
  accueil: { ligne: "誕生からこれからの数か月まで、すべての期間。" },
  fiche: { sens: "意味すること", usage: "助けになること", vigilance: "気をつけること", apres: "和らぐとき" },
  guide: {
    p1_titre: "今日のあなたはここ。", p1_corps: "この線と数字は、見ている場所の年齢です。スクロールすると一緒に動きます。",
    p2_titre: "下から上へ、あなたの人生。", p2_corps: "下が誕生。上がこれからの数か月。カプセル一つが一つの期間です。",
    p3_titre: "カプセルに触れる。", p3_corps: "期間が開きます。日付、通過する惑星、何が動くか。",
    suivant: "次へ", commencer: "はじめる", passer: "スキップ",
    progression: "{total} 中 {n} 番目", revoir: "ガイドをもう一度",
  },
  common: {
    echec_titre: "タイムラインを計算できませんでした",
    echec_corps: "計算が応答しませんでした。よくあることで、データは失われていません。",
    echec_reessayer: "再試行",
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
    p6_nom: "名前", p6_nom_ex: "何とお呼びしますか？", p6_date: "生年月日", p6_heure: "出生時刻",
    p6_heure_aide: "必須 — 時刻で計算が変わります", p6_lieu: "出生地", p6_lieu_ex: "都市、国", p6_lieu_aide: "必須 — 入力して一覧から選択",
    p6_error: "接続の問題。サンプルデータを使用中。", p6_signal_active: "あなたのシグナルは活性化中", p6_built_real: "あなたの正確な誕生時の惑星データから構築。", p6_built_sample: "サンプルデータで探索。個人的なリーディングのために誕生情報を入力してください。",
  },
  connexions: {
    titre: "つながり",
    compte: "{n}人とつながっています",
    compris: "了解",
    code_soi: "それはあなた自身のコードです。",
    code_deja: "このコードではすでにつながっています。",
    code_introuvable: "コードが見つかりません。相手に Favorable を一度開いてコードを同期してもらってください。",
    code_erreur: "接続エラーです。少ししてからもう一度お試しください。",
    code_reseau: "ネットワークエラーです。少ししてからもう一度お試しください。",
    code_ou_lien: "または招待リンク全体をもらえば、コードなしでつながれます。",
    partage_sous: "このリンクを送って、お互いのリズムを比べましょう。",
    votre_code: "あなたのコード",
    bouton_sms: "メッセージ",
    copier: "リンクをコピー",
    copie: "コピーしました",
    retour_liste: "つながり一覧に戻る",
    partage_message: "Favorable でお互いのリズムを比べています。相性はこちらから: {url}",
    partage_sujet: "Favorable でお互いのリズムを比べよう",
    moi: "自分",
    quelquun: "だれか",
    connexion_en_cours: "接続中…",
    connecte_avec: "{name} とつながりました",
  },
  boudin: {
    titre: "生涯タイムライン",
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
    notifications: "通知我",
    notif_active: "已开启",
    notif_reglages: "请在设置中重新开启",
    trial_days: "还剩 {n} 天",
    notif_cadence: "频率",
    notif_activer: "开启",
    notif_essentiel: "仅重要内容",
    notif_normal: "均衡",
    notif_tout: "全部",
    delete_warning: "这将永久删除您的出生信息、信号和连接。无法恢复。",
    delete_confirm: "是的，全部删除",
    delete_cancel: "取消",
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
    signing_in: "正在登录…",
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
  accueil: { ligne: "从出生到接下来的月份，每一个阶段。" },
  fiche: { sens: "这意味着什么", usage: "什么有帮助", vigilance: "需要留意", apres: "何时会缓解" },
  guide: {
    p1_titre: "你在这里，今天。", p1_corps: "这条线和这个数字显示你正在看的年龄。滚动时它们会跟随。",
    p2_titre: "你的一生，由下而上。", p2_corps: "下方是出生。上方是接下来的月份。每个胶囊是一个阶段。",
    p3_titre: "点一个胶囊。", p3_corps: "它会打开这个阶段：日期、经过的行星、以及带来的变化。",
    suivant: "下一步", commencer: "开始", passer: "跳过",
    progression: "第 {n} 步，共 {total} 步", revoir: "重看引导",
  },
  common: {
    echec_titre: "无法计算你的时间线",
    echec_corps: "计算没有响应。这种情况会发生，你的数据没有丢失。",
    echec_reessayer: "重试",
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
    p6_nom: "名字", p6_nom_ex: "如何称呼你？", p6_date: "出生日期", p6_heure: "出生时间",
    p6_heure_aide: "必填 — 时间会改变整个计算", p6_lieu: "出生地", p6_lieu_ex: "城市、国家", p6_lieu_aide: "必填 — 输入并从列表中选择",
    p6_error: "连接问题。使用示例数据。", p6_signal_active: "您的信号正在激活", p6_built_real: "基于您精确出生时刻的真实行星数据构建。", p6_built_sample: "用示例数据探索。输入您的出生信息以获得个人解读。",
  },
  connexions: {
    titre: "连接",
    compte: "已连接 {n} 人",
    compris: "知道了",
    code_soi: "这是你自己的代码。",
    code_deja: "已通过此代码连接。",
    code_introuvable: "找不到该代码。请对方打开一次 Favorable 以同步代码。",
    code_erreur: "连接出错。请稍后再试。",
    code_reseau: "网络出错。请稍后再试。",
    code_ou_lien: "或者索取完整的邀请链接，无需代码即可连接。",
    partage_sous: "发送此链接，比较你们的节奏。",
    votre_code: "你的代码",
    bouton_sms: "短信",
    copier: "复制链接",
    copie: "已复制",
    retour_liste: "返回连接列表",
    partage_message: "我在 Favorable 上比较我们的节奏。点击这里查看我们的契合度：{url}",
    partage_sujet: "在 Favorable 上比较我们的节奏",
    moi: "我",
    quelquun: "某人",
    connexion_en_cours: "正在连接…",
    connecte_avec: "已与 {name} 连接",
  },
  boudin: {
    titre: "一生时间线",
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
    notifications: "أبلغني",
    notif_active: "مفعّل",
    notif_reglages: "أعد التفعيل من الإعدادات",
    trial_days: "{n} أيام متبقية",
    notif_cadence: "التكرار",
    notif_activer: "تفعيل",
    notif_essentiel: "الأهم فقط",
    notif_normal: "متوازن",
    notif_tout: "الكل",
    delete_warning: "سيؤدي هذا إلى محو بيانات ميلادك وإشاراتك واتصالاتك نهائيًا. لا يمكن استرجاع أي شيء.",
    delete_confirm: "نعم، احذف كل شيء",
    delete_cancel: "إلغاء",
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
    signing_in: "جارٍ تسجيل الدخول…",
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
  accueil: { ligne: "كل فترة، من ميلادك إلى الأشهر القادمة." },
  fiche: { sens: "ما معناه", usage: "ما الذي يساعد", vigilance: "ما ينبغي الانتباه له", apres: "متى يخفّ" },
  guide: {
    p1_titre: "أنت هنا، اليوم.", p1_corps: "هذا الخط وهذا الرقم يعطيان عمر ما تنظر إليه. مرّر، وسيتبعانك.",
    p2_titre: "حياتك، من الأسفل.", p2_corps: "في الأسفل ميلادك. في الأعلى الأشهر القادمة. كل كبسولة فترة.",
    p3_titre: "المس كبسولة.", p3_corps: "تفتح الفترة: تواريخها، الكواكب التي تعبرها، وما تحرّكه.",
    suivant: "التالي", commencer: "ابدأ", passer: "تخطّي",
    progression: "الخطوة {n} من {total}", revoir: "إعادة عرض الدليل",
  },
  common: {
    echec_titre: "تعذّر حساب مخططك الزمني",
    echec_corps: "لم تستجب العملية الحسابية. يحدث هذا أحيانًا، ولم تُفقد بياناتك.",
    echec_reessayer: "إعادة المحاولة",
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
    p6_nom: "الاسم", p6_nom_ex: "بماذا نناديك؟", p6_date: "تاريخ الميلاد", p6_heure: "وقت الميلاد",
    p6_heure_aide: "مطلوب — الوقت يغيّر الحساب كله", p6_lieu: "مكان الميلاد", p6_lieu_ex: "المدينة، البلد", p6_lieu_aide: "مطلوب — اكتب واختر من القائمة",
    p6_error: "مشكلة في الاتصال. استخدام بيانات نموذجية.", p6_signal_active: "إشارتك نشطة", p6_built_real: "مبني من بيانات كوكبية حقيقية للحظة ميلادك الدقيقة.", p6_built_sample: "استكشف مع بيانات نموذجية. أدخل معلومات ميلادك للحصول على قراءة شخصية.",
  },
  connexions: {
    titre: "الاتصالات",
    compte: "{n} متصل",
    compris: "فهمت",
    code_soi: "هذا رمزك أنت.",
    code_deja: "أنت متصل بهذا الرمز بالفعل.",
    code_introuvable: "لم يُعثر على الرمز. اطلب من الشخص الآخر فتح Favorable مرة واحدة لمزامنة رمزه.",
    code_erreur: "خطأ في الاتصال. أعد المحاولة بعد قليل.",
    code_reseau: "خطأ في الشبكة. أعد المحاولة بعد قليل.",
    code_ou_lien: "أو اطلب رابط الدعوة الكامل للاتصال بدون رمز.",
    partage_sous: "أرسل هذا الرابط لمقارنة إيقاعيكما.",
    votre_code: "رمزك",
    bouton_sms: "رسالة",
    copier: "نسخ الرابط",
    copie: "تم النسخ",
    retour_liste: "العودة إلى الاتصالات",
    partage_message: "أقارن إيقاعينا على Favorable. اضغط هنا لرؤية توافقنا: {url}",
    partage_sujet: "لنقارن إيقاعينا على Favorable",
    moi: "أنا",
    quelquun: "شخص ما",
    connexion_en_cours: "جارٍ الاتصال…",
    connecte_avec: "متصل مع {name}",
  },
  boudin: {
    titre: "الجدول الزمني للحياة",
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
