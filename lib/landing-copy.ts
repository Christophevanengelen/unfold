import type { TranslationMap } from "@/lib/i18n";

/**
 * Landing copy — hardcoded, zero-dependency source of truth.
 *
 * The narrative landing sections (`components/landing/*`) all read their
 * strings from a `TranslationMap`. That map used to come from Supabase via
 * `getTranslations()`, but the `Translation` / `ContentKey` /
 * `ContentNamespace` tables don't exist in production yet — which is what
 * took the landing page down (500) and forced the emergency inline rewrite.
 *
 * This module ships the same map as plain data, so the landing renders
 * identically with the DB completely offline. `en` is the complete base;
 * every other locale is a partial override merged on top of it, so a missing
 * key can never render as a raw dotted identifier.
 *
 * Adding a language: extend `LocaleCode`, add an override block, and register
 * it in `OVERRIDES`. Adding a string: add it to `EN` first (it becomes the
 * universal fallback), then translate.
 */

export type LocaleCode =
  | "fr"
  | "en"
  | "es"
  | "de"
  | "it"
  | "pt"
  | "nl"
  | "ja"
  | "zh"
  | "ar";

// ─── English — complete base (every key lives here) ──────────────────────

const EN: TranslationMap = {
  "hero.signal.unavailable":
    "We cannot compute your signal right now. Try again in a moment.",
  "hero.signal.disabled":
    "Signal computation is paused right now. Come back in a little while.",
  // Hero
  "hero.v2.eyebrow": "Personal timing engine",
  "hero.v2.title": "Some periods of your life feel more intense.",
  "hero.v2.subtitle": "There is a reason. Enter your birthday.",
  "hero.cta": "See my signal",
  "hero.privacy":
    "Your data is never stored without your consent. Anonymous 7-day cache, deleted on request.",
  // No audience-size claim here: we have no figure we could back up.
  "hero.social":
    "Your signal is computed from your birth chart — never written in advance.",
  "hero.signal.actI": "Understand your past",
  "hero.signal.actII": "Your signal today",
  "hero.signal.actIII": "Prepare what’s coming",
  "hero.signal.pastIntro":
    "Before we light up your today, here are the major windows that shaped you. Recognising your past is how you understand today’s momentum.",
  "hero.signal.pastQuestion":
    "Tap a year to see how it still resonates today.",
  "hero.signal.eyebrow": "Active signal",
  "hero.signal.activeNow": "Active now",
  "hero.signal.futureIntro":
    "Your path is not a single point. Here is what is lining up ahead — anticipate the peaks, defuse the tensions, cross the transitions.",
  "hero.signal.futureBody":
    "The exact day, the natal angle and the moves to make are in the app.",
  "hero.signal.nextWindow": "Your next strong window",
  "hero.signal.teaserTitle": "Your next 12 months",
  "hero.signal.teaserBody":
    "Every peak calls for a different posture. Know which one, in advance.",
  "hero.signal.appCta": "Start preparing in the app",
  "hero.signal.finalPitch":
    "Understand where you come from, live what is happening, prepare what is coming.",

  // Free awareness
  "free.eyebrow": "Always free",
  "free.title": "Three signals. One clear picture.",
  "free.subtitle":
    "Every day, Favorable reads your past, present, and next momentum — free, forever.",
  "free.past.title": "Past signal",
  "free.past.desc":
    "See which planets shaped your last momentum period and what it meant.",
  "free.present.title": "Present signal",
  "free.present.desc":
    "Your current momentum signature — the planets active right now and their intensity.",
  "free.future.title": "Next signal",
  "free.future.desc":
    "A preview of the momentum forming ahead. Know what rhythm is coming.",

  // Narrative transitions
  "transition.free_to_clarity":
    "Your signal is free. But your story goes deeper.",
  "transition.timeline_to_social":
    "That’s your rhythm. Here’s what Favorable commits to doing with it.",
  "transition.free_to_premium":
    "Free reads today. Premium reveals what’s forming ahead.",
  "transition.premium_to_teasers":
    "Three ways to see the whole arc. Enter your birth data — the rest unfolds.",

  // Life domains
  "domains.eyebrow": "Beyond the basics",
  "domains.title": "Twelve life domains. Not just three.",
  "domains.subtitle":
    "Each signal tells you exactly which area of your life is activated. Career, love, money, home, creativity... and seven more.",
  "domains.closer": "The domain tells you what. The planets tell you why.",

  // Timeline
  "timeline.eyebrow": "Your story",
  "timeline.title": "Your rhythm has a story",
  "timeline.subtitle":
    "Every momentum period from birth to now — and what’s forming ahead. Tap to explore.",
  "timeline.caption":
    "From birth to what’s forming — your complete momentum map.",

  // Product promise (formerly "social proof")
  // Brand-owned commitments — no invented testimonials, no audience counter,
  // no App Store rating we cannot evidence.
  "social.eyebrow": "Our product promise",
  "social.title": "Built to be useful the day you open it",
  "social.subtitle":
    "Three things your signal is built to do, described exactly as they work.",
  "social.promise1.label": "Daily clarity",
  "social.promise1.title": "Know what today is asking of you",
  "social.promise1.body":
    "Favorable reads the transits active on your birth chart today and names the pattern in plain language — no horoscope, no guesswork.",
  "social.promise2.label": "Weekly rhythm",
  "social.promise2.title": "Plan with your peaks, not against them",
  "social.promise2.body":
    "Your momentum timeline shows which days carry intensity and which stay quiet, so you can place the demanding moves where they land best.",
  "social.promise3.label": "Shared timing",
  "social.promise3.title": "See where two rhythms meet",
  "social.promise3.body":
    "Compare your timeline with someone else’s and find the windows where you both peak — useful for the conversations that deserve a good day.",
  "social.pillar1": "Daily signal, free forever",
  "social.pillar2": "JPL/NASA ephemerides, computed in real time",
  "social.pillar3": "Your data is never stored without your consent",
  "social.note":
    "These are Favorable’s own product commitments, written by the team — not customer reviews.",

  // Compatibility
  "compat.v2.eyebrow": "Shared timing",
  "compat.v2.title": "Know when your rhythms align.",
  "compat.v2.subtitle":
    "Compare two timelines. See the months where you both peak.",
  "compat.v2.you": "You",
  "compat.v2.them": "Them",
  "compat.v2.shared": "Shared peaks",
  "compat.v2.peak1.month": "June",
  "compat.v2.peak1.domain": "House X — Career",
  "compat.v2.peak1.note": "Both timelines peak here",
  "compat.v2.peak2.month": "September",
  "compat.v2.peak2.domain": "House V — Joy",
  "compat.v2.peak2.note": "A shared window of intensity",

  // Smart alerts
  "alerts.eyebrow": "Quiet intelligence",
  "alerts.title": "It watches. You live.",
  "alerts.subtitle":
    "Favorable doesn’t spam you. It watches your signal quietly — and calls when something exceptional forms.",
  "alerts.p1": "Only when it matters",
  "alerts.p2": "Never noise",
  "alerts.p3": "Always on time",

  // Premium momentum
  "premium.v2.eyebrow": "Premium",
  "premium.v2.title": "See your entire life. Past, present, future.",
  "premium.v2.subtitle":
    "Free shows you now. Premium maps your entire timeline from birth to decades ahead.",

  // Premium teasers
  "teaser.lifetime.eyebrow": "Lifetime Report · Premium",
  "teaser.lifetime.title": "Your entire life, unrolled.",
  "teaser.lifetime.sub":
    "A 100-year visual timeline of your astrological rhythm — every peak, every cycle, every window. Generated from your birth data.",
  "teaser.lifetime.cta": "See my lifetime chart",
  "teaser.birthday.eyebrow": "Birthday Graph · Premium",
  "teaser.birthday.title": "Your year, decoded.",
  "teaser.birthday.sub":
    "Every birthday opens a new chapter. See which years are pivotal — and why.",
  "teaser.birthday.cta": "See my birthday graph",
  "teaser.spirit.eyebrow": "Spirit Wave · ZR · Premium",
  "teaser.spirit.title": "Your life’s breath, as a wave.",
  "teaser.spirit.sub":
    "The Lot of Spirit reveals your great seasons of destiny. See your culminations, transitions, and where you are right now.",
  "teaser.spirit.cta": "See my Spirit Wave",

  // Science & technology
  "science.eyebrow": "Built on signal, not noise",
  "science.title": "Powered by precision, not prediction.",
  "science.subtitle":
    "Built on JPL/NASA ephemerides, real-time planetary calculations, and proprietary AI models.",
  "science.pattern.title": "High-precision data",
  "science.pattern.desc":
    "Built on JPL/NASA ephemerides and real-time planetary calculations.",
  "science.personal.title": "Personal models",
  "science.personal.desc":
    "Proprietary AI models adapt to your rhythm over time.",
  "science.privacy.title": "Private by design",
  "science.privacy.desc": "Your personal data stays personal.",

  // Pricing
  "pricing.title": "Free forever. Premium when you’re ready.",
  "pricing.subtitle":
    "Your current signal is always free. Premium unlocks your full momentum timeline.",
  "pricing.toggle.monthly": "Monthly",
  "pricing.toggle.yearly": "Yearly",
  "pricing.toggle.save": "Save 39%",
  "pricing.free.name": "Free",
  "pricing.free.desc": "Your current momentum signal, always.",
  "pricing.free.price": "$0",
  "pricing.free.f1": "Current momentum signal",
  "pricing.free.f2": "Planet keywords & intensity",
  "pricing.free.f3": "Past signal review",
  "pricing.free.f4": "Basic compatibility",
  "pricing.premium.name": "Premium",
  "pricing.premium.desc": "Your full timeline, revealed.",
  "pricing.premium.badge": "Most popular",
  "pricing.premium.period": "/month",
  "pricing.premium.period.year": "/year",
  "pricing.premium.f1": "Everything in Free",
  "pricing.premium.f2": "Full momentum timeline",
  "pricing.premium.f3": "Future signal preview",
  "pricing.premium.f4": "Peak window alerts",
  "pricing.premium.f5": "Planetary transit details",
  "pricing.premium.f6": "Advanced compatibility",
  "pricing.justification":
    "Premium evolves with you — your timeline updates as new planetary signals shape your rhythm.",
  "pricing.trial": "7 days free, then your plan. Cancel anytime.",

  // Final CTA + footer
  "cta.title": "Download Favorable",
  "cta.subtitle":
    "Your personal signal, decoded. See your momentum — past, present, and next. Free on iOS and Android.",
  "footer.legal": "© 2026 Favorable. All rights reserved.",
};

// ─── French — complete translation ───────────────────────────────────────

const FR: TranslationMap = {
  "hero.signal.unavailable":
    "Impossible de calculer ton signal en ce moment. Réessaie dans un instant.",
  "hero.signal.disabled":
    "Le calcul du signal est momentanément suspendu. Reviens dans un moment.",
  "hero.v2.eyebrow": "Moteur de timing personnel",
  "hero.v2.title": "Certaines périodes de ta vie sont plus intenses.",
  "hero.v2.subtitle": "Il y a une raison. Entre ta date de naissance.",
  "hero.cta": "Voir mon signal",
  "hero.privacy":
    "Tes données ne sont jamais conservées sans ton accord. Cache anonyme 7 jours, suppression à la demande.",
  "hero.social":
    "Ton signal est calculé depuis ton thème natal — jamais écrit d’avance.",
  "hero.signal.actI": "Comprends ton passé",
  "hero.signal.actII": "Ton signal d’aujourd’hui",
  "hero.signal.actIII": "Prépare ce qui arrive",
  "hero.signal.pastIntro":
    "Avant d’éclairer ton aujourd’hui, voici les fenêtres majeures qui t’ont façonné. Reconnaître son passé, c’est comprendre sa dynamique du jour.",
  "hero.signal.pastQuestion":
    "Touche une année pour voir comment elle résonne encore aujourd’hui.",
  "hero.signal.eyebrow": "Signal actif",
  "hero.signal.activeNow": "Actif maintenant",
  "hero.signal.futureIntro":
    "Ton chemin n’est pas un point. Voici ce qui s’aligne devant toi — anticipe les pics, désamorce les tensions, traverse les transitions.",
  "hero.signal.futureBody":
    "Le jour exact, l’angle natal et les actions à poser sont dans l’app.",
  "hero.signal.nextWindow": "Ta prochaine fenêtre forte",
  "hero.signal.teaserTitle": "Tes 12 prochains mois",
  "hero.signal.teaserBody":
    "Chaque pic appelle une attitude différente. Sache laquelle, à l’avance.",
  "hero.signal.appCta": "Active ta préparation dans l’app",
  "hero.signal.finalPitch":
    "Comprends d’où tu viens, vis ce qui se passe, prépare ce qui arrive.",

  "free.eyebrow": "Toujours gratuit",
  "free.title": "Trois signaux. Une lecture claire.",
  "free.subtitle":
    "Chaque jour, Favorable lit ton momentum passé, présent et à venir — gratuitement, pour toujours.",
  "free.past.title": "Signal passé",
  "free.past.desc":
    "Vois quelles planètes ont façonné ta dernière période de momentum, et ce qu’elle voulait dire.",
  "free.present.title": "Signal présent",
  "free.present.desc":
    "Ta signature de momentum actuelle — les planètes actives maintenant et leur intensité.",
  "free.future.title": "Signal suivant",
  "free.future.desc":
    "Un aperçu du momentum qui se forme devant toi. Sache quel rythme arrive.",

  "transition.free_to_clarity":
    "Ton signal est gratuit. Mais ton histoire va bien plus loin.",
  "transition.timeline_to_social":
    "Ça, c’est ton rythme. Voici ce qu’Favorable s’engage à en faire.",
  "transition.free_to_premium":
    "Le gratuit lit ton aujourd’hui. Premium révèle ce qui se forme devant toi.",
  "transition.premium_to_teasers":
    "Trois façons de voir l’arc complet. Entre tes données de naissance — le reste se déroule.",

  "domains.eyebrow": "Au-delà des bases",
  "domains.title": "Douze domaines de vie. Pas seulement trois.",
  "domains.subtitle":
    "Chaque signal te dit exactement quel domaine de ta vie s’active. Carrière, amour, argent, foyer, créativité... et sept autres.",
  "domains.closer":
    "Le domaine te dit quoi. Les planètes te disent pourquoi.",

  "timeline.eyebrow": "Ton histoire",
  "timeline.title": "Ton rythme raconte une histoire",
  "timeline.subtitle":
    "Chaque période de momentum, de ta naissance à aujourd’hui — et ce qui se forme ensuite. Touche pour explorer.",
  "timeline.caption":
    "De la naissance à ce qui se forme — ta carte complète de momentum.",

  "social.eyebrow": "Notre promesse produit",
  "social.title": "Pensé pour t’être utile dès le premier jour",
  "social.subtitle":
    "Trois choses que ton signal sait faire, décrites exactement comme elles fonctionnent.",
  "social.promise1.label": "Clarté quotidienne",
  "social.promise1.title": "Sache ce que ta journée te demande",
  "social.promise1.body":
    "Favorable lit les transits actifs sur ton thème natal aujourd’hui et nomme la dynamique en mots clairs — pas d’horoscope, pas d’à-peu-près.",
  "social.promise2.label": "Rythme de la semaine",
  "social.promise2.title": "Compose avec tes pics, pas contre eux",
  "social.promise2.body":
    "Ta chronologie de momentum montre quels jours portent l’intensité et lesquels restent calmes : place les moments exigeants là où ils portent le mieux.",
  "social.promise3.label": "Timing partagé",
  "social.promise3.title": "Vois où deux rythmes se rejoignent",
  "social.promise3.body":
    "Compare ta chronologie à celle d’une autre personne et repère les fenêtres où vous culminez ensemble — précieux pour les conversations qui méritent un bon jour.",
  "social.pillar1": "Signal quotidien, gratuit pour toujours",
  "social.pillar2": "Éphémérides JPL/NASA, calculées en temps réel",
  "social.pillar3": "Tes données ne sont jamais conservées sans ton accord",
  "social.note":
    "Ce sont les engagements produit d’Favorable, écrits par l’équipe — ce ne sont pas des avis clients.",

  "compat.v2.eyebrow": "Timing partagé",
  "compat.v2.title": "Sache quand vos rythmes s’alignent.",
  "compat.v2.subtitle":
    "Compare deux chronologies. Vois les mois où vous êtes tous les deux au pic.",
  "compat.v2.you": "Toi",
  "compat.v2.them": "L’autre",
  "compat.v2.shared": "Pics communs",
  "compat.v2.peak1.month": "Juin",
  "compat.v2.peak1.domain": "Maison X — Carrière",
  "compat.v2.peak1.note": "Vos deux chronologies culminent ici",
  "compat.v2.peak2.month": "Septembre",
  "compat.v2.peak2.domain": "Maison V — Joie",
  "compat.v2.peak2.note": "Une fenêtre d’intensité partagée",

  "alerts.eyebrow": "Intelligence discrète",
  "alerts.title": "Elle veille. Tu vis.",
  "alerts.subtitle":
    "Favorable ne te spamme pas. L’app surveille ton signal en silence — et te prévient quand quelque chose d’exceptionnel se forme.",
  "alerts.p1": "Seulement quand ça compte",
  "alerts.p2": "Jamais de bruit",
  "alerts.p3": "Toujours à temps",

  "premium.v2.eyebrow": "Premium",
  "premium.v2.title": "Vois ta vie entière. Passé, présent, futur.",
  "premium.v2.subtitle":
    "Le gratuit te montre maintenant. Premium cartographie toute ta chronologie, de ta naissance aux décennies à venir.",

  "teaser.lifetime.eyebrow": "Rapport à vie · Premium",
  "teaser.lifetime.title": "Toute ta vie, déroulée.",
  "teaser.lifetime.sub":
    "Une chronologie visuelle de 100 ans de ton rythme astrologique — chaque pic, chaque cycle, chaque fenêtre. Générée depuis tes données de naissance.",
  "teaser.lifetime.cta": "Voir mon rapport",
  "teaser.birthday.eyebrow": "Graphe Anniversaire · Premium",
  "teaser.birthday.title": "Ton année, décodée.",
  "teaser.birthday.sub":
    "Chaque anniversaire ouvre un nouveau chapitre. Découvre quelles années sont pivots — et pourquoi.",
  "teaser.birthday.cta": "Voir mon graphe",
  "teaser.spirit.eyebrow": "Spirit Wave · ZR · Premium",
  "teaser.spirit.title": "Ton souffle de vie, en courbe.",
  "teaser.spirit.sub":
    "Le Lot de l’Esprit révèle tes grandes saisons de destin. Vois tes culminations, tes transitions, ton moment présent.",
  "teaser.spirit.cta": "Voir ma Spirit Wave",

  "science.eyebrow": "Du signal, pas du bruit",
  "science.title": "Porté par la précision, pas par la prédiction.",
  "science.subtitle":
    "Construit sur les éphémérides JPL/NASA, des calculs planétaires en temps réel et nos propres modèles d’IA.",
  "science.pattern.title": "Données de haute précision",
  "science.pattern.desc":
    "Construit sur les éphémérides JPL/NASA et des calculs planétaires en temps réel.",
  "science.personal.title": "Modèles personnels",
  "science.personal.desc":
    "Nos modèles d’IA s’adaptent à ton rythme au fil du temps.",
  "science.privacy.title": "Privé par conception",
  "science.privacy.desc": "Tes données personnelles restent personnelles.",

  "pricing.title": "Gratuit pour toujours. Premium quand tu es prêt.",
  "pricing.subtitle":
    "Ton signal du moment reste gratuit. Premium débloque toute ta chronologie de momentum.",
  "pricing.toggle.monthly": "Mensuel",
  "pricing.toggle.yearly": "Annuel",
  "pricing.toggle.save": "Économise 39 %",
  "pricing.free.name": "Gratuit",
  "pricing.free.desc": "Ton signal de momentum actuel, toujours.",
  "pricing.free.price": "0 €",
  "pricing.free.f1": "Signal de momentum actuel",
  "pricing.free.f2": "Mots-clés planétaires & intensité",
  "pricing.free.f3": "Relecture du signal passé",
  "pricing.free.f4": "Compatibilité de base",
  "pricing.premium.name": "Premium",
  "pricing.premium.desc": "Ta chronologie complète, révélée.",
  "pricing.premium.badge": "Le plus choisi",
  "pricing.premium.period": "/mois",
  "pricing.premium.period.year": "/an",
  "pricing.premium.f1": "Tout le gratuit",
  "pricing.premium.f2": "Chronologie de momentum complète",
  "pricing.premium.f3": "Aperçu du signal à venir",
  "pricing.premium.f4": "Alertes de fenêtres de pic",
  "pricing.premium.f5": "Détail des transits planétaires",
  "pricing.premium.f6": "Compatibilité avancée",
  "pricing.justification":
    "Premium évolue avec toi — ta chronologie se met à jour à mesure que de nouveaux signaux planétaires façonnent ton rythme.",
  "pricing.trial":
    "7 jours d’essai, puis votre formule. Annulable à tout moment.",

  "cta.title": "Télécharge Favorable",
  "cta.subtitle":
    "Ton signal personnel, décodé. Vois ton momentum — passé, présent et à venir. Gratuit sur iOS et Android.",
  "footer.legal": "© 2026 Favorable. Tous droits réservés.",
};

// ─── Partial overrides — inherited from the inline landing copy ──────────
// Keys not listed here resolve to the English base above.

const ES: TranslationMap = {
  "hero.v2.eyebrow": "Astrología premium · Timing personal",
  "hero.v2.title": "Descubre cuándo la vida se mueve a tu favor",
  "hero.v2.subtitle":
    "Favorable lee tu carta natal y tus tránsitos actuales para revelar tus ventanas de pico — amor, trabajo, creatividad. Sin horóscopos cursis.",
  "teaser.lifetime.eyebrow": "Informe de vida · Premium",
  "teaser.lifetime.title": "Tu vida entera, desplegada.",
  "teaser.lifetime.sub":
    "Una línea de tiempo visual de 100 años de tu ritmo astrológico — cada pico, cada ciclo, cada ventana. Generada desde tus datos de nacimiento.",
  "teaser.lifetime.cta": "Ver mi gráfico",
  "teaser.birthday.eyebrow": "Gráfico de Cumpleaños · Premium",
  "teaser.birthday.title": "Tu año, descifrado.",
  "teaser.birthday.sub":
    "Cada cumpleaños abre un nuevo capítulo. Descubre qué años son pivotales — y por qué.",
  "teaser.birthday.cta": "Ver mi gráfico de cumpleaños",
  "teaser.spirit.eyebrow": "Spirit Wave · ZR · Premium",
  "teaser.spirit.title": "El aliento de tu vida, en curva.",
  "teaser.spirit.sub":
    "El Lote del Espíritu revela tus grandes temporadas de destino. Ve tus culminaciones, transiciones y dónde estás ahora.",
  "teaser.spirit.cta": "Ver mi Spirit Wave",
  "pricing.title": "Gratis para empezar",
  "pricing.subtitle":
    "Prueba Pro de 7 días sin tarjeta. Cancela cuando quieras.",
  "pricing.trial": "7 días de prueba, luego tu plan. Cancela cuando quieras.",
  "footer.legal": "© 2026 Favorable. Todos los derechos reservados.",
};

const PT: TranslationMap = {
  "hero.v2.eyebrow": "Astrologia premium · Timing pessoal",
  "hero.v2.title": "Saiba quando a vida age a seu favor",
  "hero.v2.subtitle":
    "Favorable lê seu mapa natal e seus trânsitos atuais para revelar suas janelas de pico — amor, trabalho, criatividade. Sem horóscopo bobo.",
  "teaser.lifetime.eyebrow": "Relatório vitalício · Premium",
  "teaser.lifetime.title": "Toda a sua vida, desenrolada.",
  "teaser.lifetime.sub":
    "Uma linha do tempo visual de 100 anos do seu ritmo astrológico — cada pico, cada ciclo, cada janela. Gerada a partir dos seus dados de nascimento.",
  "teaser.lifetime.cta": "Ver meu gráfico",
  "teaser.birthday.eyebrow": "Gráfico de Aniversário · Premium",
  "teaser.birthday.title": "Seu ano, decodificado.",
  "teaser.birthday.sub":
    "Cada aniversário abre um novo capítulo. Veja quais anos são pivotais — e por quê.",
  "teaser.birthday.cta": "Ver meu gráfico de aniversário",
  "teaser.spirit.eyebrow": "Spirit Wave · ZR · Premium",
  "teaser.spirit.title": "O sopro da sua vida, em curva.",
  "teaser.spirit.sub":
    "O Lote do Espírito revela suas grandes temporadas de destino. Veja suas culminações, transições e onde você está agora.",
  "teaser.spirit.cta": "Ver minha Spirit Wave",
  "pricing.title": "Grátis para começar",
  "pricing.subtitle":
    "Teste Pro de 7 dias sem cartão. Cancele quando quiser.",
  "pricing.trial": "Teste Pro de 7 dias sem cartão. Cancele quando quiser.",
  "footer.legal": "© 2026 Favorable. Todos os direitos reservados.",
};

const DE: TranslationMap = {
  "hero.v2.eyebrow": "Premium-Astrologie · Persönliches Timing",
  "hero.v2.title": "Wisse wann das Leben für dich spielt",
  "hero.v2.subtitle":
    "Favorable liest dein Geburtshoroskop und aktuelle Transite, um deine Höhepunkt-Fenster zu zeigen — Liebe, Arbeit, Kreativität.",
  "teaser.lifetime.eyebrow": "Lebenslanger Report · Premium",
  "teaser.lifetime.title": "Dein ganzes Leben, entfaltet.",
  "teaser.lifetime.sub":
    "Eine visuelle 100-Jahres-Zeitleiste deines astrologischen Rhythmus — jeder Höhepunkt, jeder Zyklus, jedes Fenster. Aus deinen Geburtsdaten generiert.",
  "teaser.lifetime.cta": "Meinen Chart sehen",
  "teaser.birthday.eyebrow": "Geburtstags-Grafik · Premium",
  "teaser.birthday.title": "Dein Jahr, entschlüsselt.",
  "teaser.birthday.sub":
    "Jeder Geburtstag öffnet ein neues Kapitel. Sieh welche Jahre wegweisend sind — und warum.",
  "teaser.birthday.cta": "Meine Geburtstagsgrafik sehen",
  "teaser.spirit.eyebrow": "Spirit Wave · ZR · Premium",
  "teaser.spirit.title": "Der Atemzug deines Lebens, als Welle.",
  "teaser.spirit.sub":
    "Das Los des Geistes enthüllt deine großen Schicksalssaisonen. Sieh deine Höhepunkte, Übergänge und wo du jetzt stehst.",
  "teaser.spirit.cta": "Meine Spirit Wave sehen",
  "pricing.title": "Kostenlos starten",
  "pricing.subtitle":
    "7-Tage-Pro-Test, keine Kreditkarte. Jederzeit kündbar.",
  "pricing.trial": "7-Tage-Pro-Test, keine Kreditkarte. Jederzeit kündbar.",
  "footer.legal": "© 2026 Favorable. Alle Rechte vorbehalten.",
};

const IT: TranslationMap = {
  "hero.v2.eyebrow": "Astrologia premium · Timing personale",
  "hero.v2.title": "Sappi quando la vita gioca a tuo favore",
  "hero.v2.subtitle":
    "Favorable legge il tuo tema natale e i tuoi transiti attuali per rivelare le tue finestre di picco — amore, lavoro, creatività.",
  "teaser.lifetime.eyebrow": "Report a vita · Premium",
  "teaser.lifetime.title": "La tua intera vita, dispiegata.",
  "teaser.lifetime.sub":
    "Una cronologia visiva di 100 anni del tuo ritmo astrologico — ogni picco, ogni ciclo, ogni finestra. Generata dai tuoi dati di nascita.",
  "teaser.lifetime.cta": "Vedi il mio grafico",
  "teaser.birthday.eyebrow": "Grafico di Compleanno · Premium",
  "teaser.birthday.title": "Il tuo anno, decodificato.",
  "teaser.birthday.sub":
    "Ogni compleanno apre un nuovo capitolo. Scopri quali anni sono pivotali — e perché.",
  "teaser.birthday.cta": "Vedi il mio grafico di compleanno",
  "teaser.spirit.eyebrow": "Spirit Wave · ZR · Premium",
  "teaser.spirit.title": "Il respiro della tua vita, in curva.",
  "teaser.spirit.sub":
    "Il Lotto dello Spirito rivela le tue grandi stagioni di destino. Vedi le tue culminazioni, transizioni e dove sei ora.",
  "teaser.spirit.cta": "Vedi la mia Spirit Wave",
  "pricing.title": "Gratis per iniziare",
  "pricing.subtitle":
    "Prova Pro di 7 giorni senza carta. Annulla quando vuoi.",
  "pricing.trial": "Prova Pro di 7 giorni senza carta. Annulla quando vuoi.",
  "footer.legal": "© 2026 Favorable. Tutti i diritti riservati.",
};

const NL: TranslationMap = {
  "hero.v2.eyebrow": "Premium astrologie · Persoonlijke timing",
  "hero.v2.title": "Weet wanneer het leven in jouw voordeel beweegt",
  "hero.v2.subtitle":
    "Favorable leest je geboortehoroscoop en huidige transits om je piekvensters te onthullen — liefde, werk, creativiteit.",
  "teaser.lifetime.eyebrow": "Levenslang rapport · Premium",
  "teaser.lifetime.title": "Jouw hele leven, uitgerold.",
  "teaser.lifetime.sub":
    "Een visuele tijdlijn van 100 jaar van jouw astrologische ritme — elke piek, elke cyclus, elk venster. Gegenereerd uit jouw geboortegegevens.",
  "teaser.lifetime.cta": "Bekijk mijn grafiek",
  "teaser.birthday.eyebrow": "Verjaardagsgrafiek · Premium",
  "teaser.birthday.title": "Jouw jaar, ontcijferd.",
  "teaser.birthday.sub":
    "Elke verjaardag opent een nieuw hoofdstuk. Zie welke jaren pivotaal zijn — en waarom.",
  "teaser.birthday.cta": "Bekijk mijn verjaardagsgrafiek",
  "teaser.spirit.eyebrow": "Spirit Wave · ZR · Premium",
  "teaser.spirit.title": "De adem van jouw leven, als golf.",
  "teaser.spirit.sub":
    "Het Lot van de Geest onthult jouw grote lotsbestemmingen. Zie jouw hoogtepunten, overgangen en waar je nu staat.",
  "teaser.spirit.cta": "Bekijk mijn Spirit Wave",
  "pricing.title": "Gratis te starten",
  "pricing.subtitle":
    "7-daagse Pro-proefperiode, geen creditcard. Altijd opzegbaar.",
  "pricing.trial":
    "7-daagse Pro-proefperiode, geen creditcard. Altijd opzegbaar.",
  "footer.legal": "© 2026 Favorable. Alle rechten voorbehouden.",
};

const JA: TranslationMap = {
  "hero.v2.eyebrow": "プレミアム占星術 · パーソナルタイミング",
  "hero.v2.title": "人生があなたの味方をする時を知る",
  "hero.v2.subtitle":
    "Favorableはあなたのネイタルチャートと現在のトランジットを読み、あなたのピークウィンドウを明らかにします — 愛、仕事、創造性。",
  "teaser.lifetime.eyebrow": "生涯レポート · プレミアム",
  "teaser.lifetime.title": "あなたの人生全体、展開。",
  "teaser.lifetime.sub":
    "あなたの星座リズムの100年ビジュアルタイムライン — すべてのピーク、サイクル、ウィンドウ。生年月日データから生成。",
  "teaser.lifetime.cta": "生涯チャートを見る",
  "teaser.birthday.eyebrow": "バースデーグラフ · プレミアム",
  "teaser.birthday.title": "あなたの1年、解読。",
  "teaser.birthday.sub":
    "誕生日ごとに新しい章が始まります。どの年が転換点か — そしてなぜかを見てください。",
  "teaser.birthday.cta": "バースデーグラフを見る",
  "teaser.spirit.eyebrow": "Spirit Wave · ZR · プレミアム",
  "teaser.spirit.title": "あなたの人生の息吹、波として。",
  "teaser.spirit.sub":
    "スピリットのロットはあなたの運命の大きな季節を明らかにします。頂点、転換点、そして今いる場所を見てください。",
  "teaser.spirit.cta": "Spirit Waveを見る",
  "pricing.title": "無料で始める",
  "pricing.subtitle":
    "7日間Proトライアル、クレジットカード不要。いつでもキャンセル。",
  "pricing.trial":
    "7日間Proトライアル、クレジットカード不要。いつでもキャンセル。",
  "footer.legal": "© 2026 Favorable. 全権利所有。",
};

const ZH: TranslationMap = {
  "hero.v2.eyebrow": "高级占星 · 个人时机",
  "hero.v2.title": "知道何时生活向你倾斜",
  "hero.v2.subtitle":
    "Favorable读取您的本命盘和当前过运，揭示您的高峰窗口 — 爱情、工作、创造力。",
  "teaser.lifetime.eyebrow": "终身报告 · 高级",
  "teaser.lifetime.title": "您的整个人生，展开。",
  "teaser.lifetime.sub":
    "您星座节律的100年可视化时间线 — 每个高峰、每个周期、每个窗口。从您的出生数据生成。",
  "teaser.lifetime.cta": "查看我的图表",
  "teaser.birthday.eyebrow": "生日图表 · 高级",
  "teaser.birthday.title": "您的年份，解码。",
  "teaser.birthday.sub":
    "每个生日开启新篇章。看看哪些年份是关键转折点 — 以及为什么。",
  "teaser.birthday.cta": "查看我的生日图表",
  "teaser.spirit.eyebrow": "Spirit Wave · ZR · 高级",
  "teaser.spirit.title": "您生命的气息，化为波浪。",
  "teaser.spirit.sub":
    "精神之星揭示您命运的伟大季节。查看您的顶峰、过渡期以及您现在所处的位置。",
  "teaser.spirit.cta": "查看我的Spirit Wave",
  "pricing.title": "免费开始",
  "pricing.subtitle":
    "7天Pro试用，无需信用卡。随时取消。",
  "pricing.trial": "7天Pro试用，无需信用卡。随时取消。",
  "footer.legal": "© 2026 Favorable. 保留所有权利。",
};

const AR: TranslationMap = {
  "hero.v2.eyebrow":
    "علم الفلك المتميز · التوقيت الشخصي",
  "hero.v2.title":
    "اعرف متى تعمل الحياة لصالحك",
  "hero.v2.subtitle":
    "يقرأ Favorable خريطتك الفلكية والعبور الحالي لكشف نوافذ الذروة لديك — الحب والعمل والإبداع.",
  "teaser.lifetime.eyebrow":
    "تقرير العمر · متميز",
  "teaser.lifetime.title":
    "حياتك بأكملها، منشورة.",
  "teaser.lifetime.sub":
    "جدول زمني مرئي لمدة 100 عام لإيقاعك الفلكي — كل ذروة، كل دورة، كل نافذة. مُنشأ من بيانات ميلادك.",
  "teaser.lifetime.cta": "انظر مخططي",
  "teaser.birthday.eyebrow":
    "مخطط عيد الميلاد · متميز",
  "teaser.birthday.title": "عامك، مُفكَّك.",
  "teaser.birthday.sub":
    "كل عيد ميلاد يفتح فصلاً جديداً. اكتشف أي السنوات محورية — ولماذا.",
  "teaser.birthday.cta":
    "انظر مخطط عيد ميلادي",
  "teaser.spirit.eyebrow": "Spirit Wave · ZR · متميز",
  "teaser.spirit.title": "نفس حياتك، كموجة.",
  "teaser.spirit.sub":
    "قرعة الروح تكشف مواسمك الكبرى في القدر. شاهد ذروتك وانتقالاتك وأين أنت الآن.",
  "teaser.spirit.cta":
    "انظر Spirit Wave الخاصة بي",
  "pricing.title": "مجاني للبدء",
  "pricing.subtitle":
    "تجربة Pro لمدة 7 أيام، بدون بطاقة ائتمان. إلغاء في أي وقت.",
  "pricing.trial":
    "تجربة Pro لمدة 7 أيام، بدون بطاقة ائتمان. إلغاء في أي وقت.",
  "footer.legal":
    "© 2026 Favorable. جميع الحقوق محفوظة.",
};

const OVERRIDES: Record<LocaleCode, TranslationMap> = {
  en: {},
  fr: FR,
  es: ES,
  de: DE,
  it: IT,
  pt: PT,
  nl: NL,
  ja: JA,
  zh: ZH,
  ar: AR,
};

/** Every locale the landing copy covers. */
export const LANDING_LOCALES = Object.keys(OVERRIDES) as LocaleCode[];

export function isLandingLocale(locale: string): locale is LocaleCode {
  return Object.prototype.hasOwnProperty.call(OVERRIDES, locale);
}

/**
 * Build the full `TranslationMap` for a locale. English is always the base,
 * so every key resolves to real copy — never a raw dotted key.
 *
 * `extra` (optional) lets a caller layer DB-backed translations on top once
 * the Supabase content tables actually exist. It is never required.
 */
export function getLandingCopy(
  locale: string,
  extra?: TranslationMap,
): TranslationMap {
  const overrides = isLandingLocale(locale) ? OVERRIDES[locale] : {};
  return { ...EN, ...overrides, ...(extra ?? {}) };
}
