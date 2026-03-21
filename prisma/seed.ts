import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Languages ---
  const languages = [
    { code: "en", name: "English", nativeName: "English", direction: "ltr" },
    { code: "fr", name: "French", nativeName: "Français", direction: "ltr" },
    { code: "es", name: "Spanish", nativeName: "Español", direction: "ltr" },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
  }

  // --- App ---
  const app = await prisma.app.upsert({
    where: { slug: "unfold" },
    update: {},
    create: { name: "Unfold", slug: "unfold" },
  });

  // --- Namespace ---
  const ns = await prisma.contentNamespace.upsert({
    where: { appId_name: { appId: app.id, name: "landing" } },
    update: {},
    create: { appId: app.id, name: "landing" },
  });

  // --- Content keys + translations ---
  const content: Record<string, { desc: string; en: string; fr: string; es: string }> = {
    // ─── Hero ───
    "hero.eyebrow": {
      desc: "Hero eyebrow — category framing for SEO/GEO",
      en: "Personal timing app",
      fr: "App de timing personnel",
      es: "App de timing personal",
    },
    "hero.title": {
      desc: "Hero main headline — emotional hook, curiosity-driven",
      en: "Your days have a rhythm. See yours.",
      fr: "Vos jours ont un rythme. Voyez le vôtre.",
      es: "Tus días tienen un ritmo. Descubre el tuyo.",
    },
    "hero.subtitle": {
      desc: "Hero subtitle — invites action, birthday input context",
      en: "Enter your birthday and discover the signal shaping your timing right now.",
      fr: "Entrez votre date de naissance et découvrez le signal qui façonne votre timing.",
      es: "Introduce tu fecha de nacimiento y descubre la señal que da forma a tu timing.",
    },
    "hero.cta": {
      desc: "Hero birthday submit button",
      en: "See my signal",
      fr: "Voir mon signal",
      es: "Ver mi señal",
    },
    "hero.social": {
      desc: "Hero micro social proof — trust line below input",
      en: "Trusted by 2,400+ people who value clarity",
      fr: "Adopté par plus de 2 400 personnes qui valorisent la clarté",
      es: "Usado por más de 2.400 personas que valoran la claridad",
    },
    // ─── Narrative Transitions ───
    "transition.free_to_clarity": {
      desc: "Transition after Free section — builds curiosity for product depth",
      en: "Your signal is free. But your story goes deeper.",
      fr: "Votre signal est gratuit. Mais votre histoire va plus loin.",
      es: "Tu señal es gratis. Pero tu historia va más allá.",
    },
    "transition.timeline_to_social": {
      desc: "Transition after Timeline — bridges to social proof",
      en: "Thousands already read their signal. Here\u2019s what they say.",
      fr: "Des milliers de personnes lisent déjà leur signal. Voici ce qu\u2019elles en disent.",
      es: "Miles de personas ya leen su señal. Esto es lo que dicen.",
    },
    "transition.free_to_premium": {
      desc: "Transition before Premium — creates tension/cliffhanger",
      en: "Free reads today. Premium reveals what\u2019s forming ahead.",
      fr: "Gratuit lit aujourd\u2019hui. Premium révèle ce qui se forme devant.",
      es: "Gratis lee hoy. Premium revela lo que se forma adelante.",
    },
    // ─── Free Awareness ───
    "free.eyebrow": {
      desc: "Free section eyebrow",
      en: "Always free",
      fr: "Toujours gratuit",
      es: "Siempre gratis",
    },
    "free.title": {
      desc: "Free section H2 — warm, personal",
      en: "Three dimensions. One clear picture.",
      fr: "Trois dimensions. Une image claire.",
      es: "Tres dimensiones. Una imagen clara.",
    },
    "free.subtitle": {
      desc: "Free section subtitle — warm, inviting",
      en: "Every day, Unfold reads your Love, Health, and Work signal. Always free.",
      fr: "Chaque jour, Unfold lit votre signal Amour, Santé et Travail. Toujours gratuit.",
      es: "Cada día, Unfold lee tu señal de Amor, Salud y Trabajo. Siempre gratis.",
    },
    "free.signals": {
      desc: "Free section intro line above cards",
      en: "Three signals that shape your day.",
      fr: "Trois signaux qui façonnent votre journée.",
      es: "Tres señales que dan forma a tu día.",
    },
    "free.love.title": { desc: "Love card title", en: "Love", fr: "Amour", es: "Amor" },
    "free.love.desc": {
      desc: "Love card description — warm, human",
      en: "How open are you today? Connections, conversations, emotional clarity.",
      fr: "À quel point êtes-vous ouvert aujourd'hui ? Connexions, conversations, clarté émotionnelle.",
      es: "¿Qué tan abierto estás hoy? Conexiones, conversaciones, claridad emocional.",
    },
    "free.health.title": { desc: "Health card title", en: "Health", fr: "Santé", es: "Salud" },
    "free.health.desc": {
      desc: "Health card description — warm, human",
      en: "Is today a push day or a rest day? Energy, vitality, physical timing.",
      fr: "Aujourd'hui, c'est effort ou repos ? Énergie, vitalité, timing physique.",
      es: "¿Hoy es día de esfuerzo o de descanso? Energía, vitalidad, timing físico.",
    },
    "free.work.title": { desc: "Work card title", en: "Work", fr: "Travail", es: "Trabajo" },
    "free.work.desc": {
      desc: "Work card description — warm, human",
      en: "When should you decide, create, or negotiate? Focus, clarity, professional timing.",
      fr: "Quand décider, créer ou négocier ? Concentration, clarté, timing professionnel.",
      es: "¿Cuándo decidir, crear o negociar? Enfoque, claridad, timing profesional.",
    },
    // ─── Daily Scores ───
    "daily.eyebrow": {
      desc: "Daily scores eyebrow",
      en: "Yesterday · Today · Tomorrow",
      fr: "Hier · Aujourd'hui · Demain",
      es: "Ayer · Hoy · Mañana",
    },
    "daily.title": {
      desc: "Daily scores title",
      en: "Yesterday. Today. Tomorrow.",
      fr: "Hier. Aujourd'hui. Demain.",
      es: "Ayer. Hoy. Mañana.",
    },
    "daily.subtitle": {
      desc: "Daily scores subtitle",
      en: "Understand what happened. See where you stand. Know what's coming.",
      fr: "Comprenez ce qui s'est passé. Voyez où vous en êtes. Sachez ce qui arrive.",
      es: "Comprende lo que pasó. Mira dónde estás. Anticipa lo que viene.",
    },
    "daily.yesterday": {
      desc: "Yesterday moment description",
      en: "Understand what happened",
      fr: "Comprenez ce qui s'est passé",
      es: "Comprende lo que pasó",
    },
    "daily.today": {
      desc: "Today moment description",
      en: "See where you stand right now",
      fr: "Voyez où vous en êtes maintenant",
      es: "Mira dónde estás ahora",
    },
    "daily.tomorrow": {
      desc: "Tomorrow moment description",
      en: "Know what's coming next",
      fr: "Sachez ce qui arrive demain",
      es: "Anticipa lo que viene",
    },
    // ─── Compatibility ───
    "compat.eyebrow": {
      desc: "Compatibility eyebrow",
      en: "Better together",
      fr: "Mieux ensemble",
      es: "Mejor juntos",
    },
    "compat.title": {
      desc: "Compatibility H2 — SEO: compatibility + between",
      en: "See what happens between you",
      fr: "Voyez ce qui se passe entre vous",
      es: "Ve lo que sucede entre ustedes",
    },
    "compat.subtitle": {
      desc: "Compatibility subtitle — warm, relational",
      en: "Share your code with someone. See where your rhythms sync \u2014 and where they don\u2019t.",
      fr: "Partagez votre code avec quelqu\u2019un. Voyez où vos rythmes se synchronisent \u2014 et où ils divergent.",
      es: "Comparte tu código con alguien. Mira dónde se sincronizan vuestros ritmos \u2014 y dónde no.",
    },
    "compat.process": {
      desc: "Compatibility process micro-line",
      en: "Share your code → Connect → Compare",
      fr: "Partagez votre code → Connectez → Comparez",
      es: "Comparte tu código → Conecta → Compara",
    },
    // ─── Premium ───
    "premium.eyebrow": {
      desc: "Premium eyebrow",
      en: "Premium",
      fr: "Premium",
      es: "Premium",
    },
    "premium.transition": {
      desc: "Premium editorial transition",
      en: "Free helps you read today. Premium helps you see what's next.",
      fr: "Gratuit vous aide à lire aujourd'hui. Premium vous aide à voir la suite.",
      es: "Gratis te ayuda a leer el hoy. Premium te ayuda a ver lo que viene.",
    },
    "premium.title": {
      desc: "Premium H2 — cliffhanger tension",
      en: "Your signal today is strong",
      fr: "Votre signal aujourd'hui est fort",
      es: "Tu señal hoy es fuerte",
    },
    "premium.subtitle": {
      desc: "Premium subtitle — the cliffhanger question",
      en: "But what about the next 7 days?",
      fr: "Mais qu'en est-il des 7 prochains jours ?",
      es: "Pero, ¿qué pasa con los próximos 7 días?",
    },
    "premium.chart_label": {
      desc: "Label above the 7-day bar chart",
      en: "Your next 7 days",
      fr: "Vos 7 prochains jours",
      es: "Tus próximos 7 días",
    },
    "premium.reveal_cta": {
      desc: "CTA button to reveal blurred future days",
      en: "Reveal your full week",
      fr: "Révélez votre semaine complète",
      es: "Revela tu semana completa",
    },
    "premium.reveal_msg": {
      desc: "Message shown after revealing future days",
      en: "Premium shows your peaks before they arrive. Every day. Every week.",
      fr: "Premium montre vos pics avant qu'ils n'arrivent. Chaque jour. Chaque semaine.",
      es: "Premium muestra tus picos antes de que lleguen. Cada día. Cada semana.",
    },
    "premium.forecast.title": {
      desc: "Forecast feature title",
      en: "See your next strong days",
      fr: "Voyez vos prochains jours forts",
      es: "Ve tus próximos días fuertes",
    },
    "premium.forecast.desc": {
      desc: "Forecast feature desc",
      en: "See your upcoming peaks before they arrive. Plan your week around your natural rhythms.",
      fr: "Voyez vos pics à venir avant qu'ils n'arrivent. Planifiez votre semaine autour de vos rythmes naturels.",
      es: "Ve tus próximos picos antes de que lleguen. Planifica tu semana según tus ritmos naturales.",
    },
    "premium.map.title": {
      desc: "Map feature title",
      en: "Plan around your peak windows",
      fr: "Planifiez autour de vos fenêtres optimales",
      es: "Planifica en torno a tus ventanas óptimas",
    },
    "premium.map.desc": {
      desc: "Map feature desc",
      en: "A bird's-eye view of your month. Spot patterns, plan ahead, stay aligned.",
      fr: "Une vue d'ensemble de votre mois. Repérez les schémas, planifiez, restez aligné.",
      es: "Una vista panorámica de tu mes. Detecta patrones, planifica, mantente alineado.",
    },
    "premium.alerts.title": {
      desc: "Alerts feature title",
      en: "Get alerts before key moments",
      fr: "Recevez des alertes avant les moments clés",
      es: "Recibe alertas antes de los momentos clave",
    },
    "premium.alerts.desc": {
      desc: "Alerts feature desc",
      en: "Real-time notifications when exceptional momentum windows open.",
      fr: "Notifications en temps réel quand des fenêtres de momentum exceptionnelles s'ouvrent.",
      es: "Notificaciones en tiempo real cuando se abren ventanas de impulso excepcionales.",
    },
    "premium.compat.title": {
      desc: "Advanced compat title",
      en: "Go deeper with advanced compatibility",
      fr: "Allez plus loin avec la compatibilité avancée",
      es: "Profundiza con la compatibilidad avanzada",
    },
    "premium.compat.desc": {
      desc: "Advanced compat desc",
      en: "Deep relational analysis. Shared peak discovery. Timing synergy reports.",
      fr: "Analyse relationnelle profonde. Découverte de pics partagés. Rapports de synergie temporelle.",
      es: "Análisis relacional profundo. Descubrimiento de picos compartidos. Informes de sinergia temporal.",
    },
    // ─── Science ───
    "science.eyebrow": {
      desc: "Science eyebrow",
      en: "Built on signal, not noise",
      fr: "Construit sur le signal, pas le bruit",
      es: "Construido sobre señales, no ruido",
    },
    "science.title": {
      desc: "Science H2 — warm but credible",
      en: "Real science. Real data. No guesswork.",
      fr: "Vraie science. Vraies données. Aucune devinette.",
      es: "Ciencia real. Datos reales. Sin adivinanzas.",
    },
    "science.subtitle": {
      desc: "Science subtitle — accessible, warm but credible",
      en: "Unfold uses the same planetary data as NASA, combined with AI that learns your personal rhythm.",
      fr: "Unfold utilise les mêmes données planétaires que la NASA, combinées à une IA qui apprend votre rythme personnel.",
      es: "Unfold usa los mismos datos planetarios que la NASA, combinados con IA que aprende tu ritmo personal.",
    },
    "science.pattern.title": {
      desc: "Pattern title — warmer",
      en: "Real planetary data",
      fr: "Données planétaires réelles",
      es: "Datos planetarios reales",
    },
    "science.pattern.desc": {
      desc: "Pattern desc — warmer, less technical",
      en: "Your signal is calculated from real planetary positions, not generic horoscopes. Same data NASA uses.",
      fr: "Votre signal est calculé à partir de positions planétaires réelles, pas d'horoscopes génériques. Les mêmes données que la NASA.",
      es: "Tu señal se calcula a partir de posiciones planetarias reales, no horóscopos genéricos. Los mismos datos que usa la NASA.",
    },
    "science.personal.title": {
      desc: "Personal calibration title — warmer",
      en: "Learns your rhythm",
      fr: "Apprend votre rythme",
      es: "Aprende tu ritmo",
    },
    "science.personal.desc": {
      desc: "Personal calibration desc — warmer",
      en: "AI models that adapt to you over time. The more you use Unfold, the more precise your signal becomes.",
      fr: "Des modèles d'IA qui s'adaptent à vous. Plus vous utilisez Unfold, plus votre signal devient précis.",
      es: "Modelos de IA que se adaptan a ti. Cuanto más uses Unfold, más precisa se vuelve tu señal.",
    },
    "science.privacy.title": {
      desc: "Privacy title",
      en: "Your data stays yours",
      fr: "Vos données restent les vôtres",
      es: "Tus datos son tuyos",
    },
    "science.privacy.desc": {
      desc: "Privacy desc — warmer, more reassuring",
      en: "No tracking, no selling, no sharing. Your personal rhythm is exactly that \u2014 personal.",
      fr: "Pas de tracking, pas de vente, pas de partage. Votre rythme personnel est exactement ça \u2014 personnel.",
      es: "Sin rastreo, sin venta, sin compartir. Tu ritmo personal es exactamente eso \u2014 personal.",
    },
    // ─── Clarity ───
    "clarity.title": {
      desc: "Clarity title",
      en: "Designed for daily clarity",
      fr: "Conçu pour la clarté quotidienne",
      es: "Diseñado para la claridad diaria",
    },
    "clarity.subtitle": {
      desc: "Clarity subtitle",
      en: "Every screen delivers exactly what you need. Nothing more.",
      fr: "Chaque écran délivre exactement ce dont vous avez besoin. Rien de plus.",
      es: "Cada pantalla entrega exactamente lo que necesitas. Nada más.",
    },
    "clarity.p1": {
      desc: "Clarity principle 1",
      en: "Read in 3 seconds",
      fr: "Lisible en 3 secondes",
      es: "Legible en 3 segundos",
    },
    "clarity.p2": {
      desc: "Clarity principle 2",
      en: "One screen, one answer",
      fr: "Un écran, une réponse",
      es: "Una pantalla, una respuesta",
    },
    "clarity.p3": {
      desc: "Clarity principle 3",
      en: "Premium, not noisy",
      fr: "Premium, pas bruyant",
      es: "Premium, no ruidoso",
    },
    // ─── Pricing ───
    "pricing.title": {
      desc: "Pricing H2 — SEO/GEO: free forever + premium",
      en: "Free forever. Premium when you're ready.",
      fr: "Gratuit pour toujours. Premium quand vous êtes prêt.",
      es: "Gratis para siempre. Premium cuando estés listo.",
    },
    "pricing.subtitle": {
      desc: "Pricing subtitle — warm, personal",
      en: "Read your signal every day for free. When you want to see further, Premium is here.",
      fr: "Lisez votre signal chaque jour gratuitement. Quand vous voulez voir plus loin, Premium est là.",
      es: "Lee tu señal cada día gratis. Cuando quieras ver más allá, Premium está aquí.",
    },
    "pricing.free.name": {
      desc: "Free plan name",
      en: "Free",
      fr: "Gratuit",
      es: "Gratis",
    },
    "pricing.free.desc": {
      desc: "Free plan desc — warm",
      en: "Your daily signal, always.",
      fr: "Votre signal quotidien, toujours.",
      es: "Tu señal diaria, siempre.",
    },
    "pricing.free.price": {
      desc: "Free plan price",
      en: "$0",
      fr: "0 €",
      es: "0 €",
    },
    "pricing.premium.name": {
      desc: "Premium plan name",
      en: "Premium",
      fr: "Premium",
      es: "Premium",
    },
    "pricing.premium.desc": {
      desc: "Premium plan desc",
      en: "Your future, mapped.",
      fr: "Votre avenir, cartographié.",
      es: "Tu futuro, mapeado.",
    },
    "pricing.premium.price": {
      desc: "Premium plan price",
      en: "$4",
      fr: "4 €",
      es: "4 €",
    },
    "pricing.premium.period": {
      desc: "Premium billing period — monthly",
      en: "/month",
      fr: "/mois",
      es: "/mes",
    },
    "pricing.premium.period.year": {
      desc: "Premium billing period — yearly",
      en: "/year",
      fr: "/an",
      es: "/año",
    },
    "pricing.premium.badge": {
      desc: "Premium badge label",
      en: "Most popular",
      fr: "Le plus populaire",
      es: "Más popular",
    },
    "pricing.toggle.monthly": {
      desc: "Pricing toggle — monthly label",
      en: "Monthly",
      fr: "Mensuel",
      es: "Mensual",
    },
    "pricing.toggle.yearly": {
      desc: "Pricing toggle — yearly label",
      en: "Yearly",
      fr: "Annuel",
      es: "Anual",
    },
    "pricing.toggle.save": {
      desc: "Pricing toggle — save percentage",
      en: "Save 39%",
      fr: "Économisez 39 %",
      es: "Ahorra 39 %",
    },
    "pricing.free.f1": {
      desc: "Free plan feature 1",
      en: "Today's momentum score",
      fr: "Score de momentum du jour",
      es: "Score de impulso del día",
    },
    "pricing.free.f2": {
      desc: "Free plan feature 2",
      en: "Love, Health & Work breakdown",
      fr: "Détail Amour, Santé & Travail",
      es: "Detalle Amor, Salud & Trabajo",
    },
    "pricing.free.f3": {
      desc: "Free plan feature 3",
      en: "Yesterday's review",
      fr: "Bilan d'hier",
      es: "Resumen de ayer",
    },
    "pricing.free.f4": {
      desc: "Free plan feature 4",
      en: "Basic compatibility",
      fr: "Compatibilité de base",
      es: "Compatibilidad básica",
    },
    "pricing.premium.f1": {
      desc: "Premium feature 1",
      en: "Everything in Free",
      fr: "Tout ce qui est gratuit",
      es: "Todo lo gratuito",
    },
    "pricing.premium.f2": {
      desc: "Premium feature 2",
      en: "Tomorrow's forecast",
      fr: "Prévision de demain",
      es: "Pronóstico de mañana",
    },
    "pricing.premium.f3": {
      desc: "Premium feature 3",
      en: "Future momentum windows",
      fr: "Fenêtres de momentum futures",
      es: "Ventanas de impulso futuras",
    },
    "pricing.premium.f4": {
      desc: "Premium feature 4",
      en: "Monthly momentum map",
      fr: "Carte de momentum mensuelle",
      es: "Mapa de impulso mensual",
    },
    "pricing.premium.f5": {
      desc: "Premium feature 5",
      en: "Peak alerts",
      fr: "Alertes de pic",
      es: "Alertas de pico",
    },
    "pricing.premium.f6": {
      desc: "Premium feature 6",
      en: "Advanced compatibility",
      fr: "Compatibilité avancée",
      es: "Compatibilidad avanzada",
    },
    "pricing.justification": {
      desc: "Pricing subscription justification — warm, honest",
      en: "Your rhythm evolves. Premium evolves with it \u2014 new insights every day, every week, every month.",
      fr: "Votre rythme évolue. Premium évolue avec lui \u2014 de nouvelles découvertes chaque jour, chaque semaine, chaque mois.",
      es: "Tu ritmo evoluciona. Premium evoluciona con él \u2014 nuevos descubrimientos cada día, cada semana, cada mes.",
    },
    // ─── CTA ───
    "cta.title": {
      desc: "Final CTA H2 — direct, no ambiguity",
      en: "Download Unfold",
      fr: "Téléchargez Unfold",
      es: "Descarga Unfold",
    },
    "cta.subtitle": {
      desc: "Final CTA subtitle — warm, personal, inviting",
      en: "See your rhythm. Plan your best days. Free on iOS and Android.",
      fr: "Voyez votre rythme. Planifiez vos meilleurs jours. Gratuit sur iOS et Android.",
      es: "Ve tu ritmo. Planifica tus mejores días. Gratis en iOS y Android.",
    },
  };

  for (const [key, data] of Object.entries(content)) {
    const contentKey = await prisma.contentKey.upsert({
      where: { namespaceId_key: { namespaceId: ns.id, key } },
      update: { description: data.desc },
      create: { namespaceId: ns.id, key, description: data.desc },
    });

    for (const lang of ["en", "fr", "es"] as const) {
      await prisma.translation.upsert({
        where: {
          contentKeyId_languageCode: {
            contentKeyId: contentKey.id,
            languageCode: lang,
          },
        },
        update: { value: data[lang], status: lang === "en" ? "READY" : "DRAFT" },
        create: {
          contentKeyId: contentKey.id,
          languageCode: lang,
          value: data[lang],
          status: lang === "en" ? "READY" : "DRAFT",
        },
      });
    }
  }

  console.log("Seed complete: 3 languages, 1 app, 1 namespace, " + Object.keys(content).length + " keys");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
