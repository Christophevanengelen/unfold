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
      desc: "Hero main headline",
      en: "Know when life moves in your favor",
      fr: "Sachez quand la vie joue en votre faveur",
      es: "Descubre cuándo la vida se mueve a tu favor",
    },
    "hero.subtitle": {
      desc: "Hero subtitle line 1 — GEO: free + momentum + time windows",
      en: "Free daily momentum for Yesterday, Today, and Tomorrow.",
      fr: "Momentum quotidien gratuit pour Hier, Aujourd'hui et Demain.",
      es: "Impulso diario gratuito para Ayer, Hoy y Mañana.",
    },
    "hero.subtitle2": {
      desc: "Hero subtitle line 2 — axes + signal",
      en: "Love, Health, Work — in one clear daily signal.",
      fr: "Amour, Santé, Travail — en un signal quotidien clair.",
      es: "Amor, Salud, Trabajo — en una señal diaria clara.",
    },
    // ─── Free Awareness ───
    "free.eyebrow": {
      desc: "Free section eyebrow",
      en: "Always free",
      fr: "Toujours gratuit",
      es: "Siempre gratis",
    },
    "free.title": {
      desc: "Free section H2 — SEO/GEO: free + daily momentum + score",
      en: "Your free daily momentum score",
      fr: "Votre score de momentum quotidien gratuit",
      es: "Tu score de impulso diario gratuito",
    },
    "free.subtitle": {
      desc: "Free section subtitle — GEO anchor",
      en: "Free forever: your daily momentum across Love, Health, and Work.",
      fr: "Gratuit pour toujours : votre momentum quotidien en Amour, Santé et Travail.",
      es: "Gratis para siempre: tu impulso diario en Amor, Salud y Trabajo.",
    },
    "free.signals": {
      desc: "Free section intro line above cards",
      en: "Three signals. Complete clarity.",
      fr: "Trois signaux. Une clarté totale.",
      es: "Tres señales. Claridad total.",
    },
    "free.love.title": { desc: "Love card title", en: "Love", fr: "Amour", es: "Amor" },
    "free.love.desc": {
      desc: "Love card description",
      en: "Your relational momentum. Connections, openness, emotional clarity.",
      fr: "Votre momentum relationnel. Connexions, ouverture, clarté émotionnelle.",
      es: "Tu impulso relacional. Conexiones, apertura, claridad emocional.",
    },
    "free.health.title": { desc: "Health card title", en: "Health", fr: "Santé", es: "Salud" },
    "free.health.desc": {
      desc: "Health card description",
      en: "Your physical rhythm. Energy, vitality, peak performance.",
      fr: "Votre rythme physique. Énergie, vitalité, performance optimale.",
      es: "Tu ritmo físico. Energía, vitalidad, rendimiento óptimo.",
    },
    "free.work.title": { desc: "Work card title", en: "Work", fr: "Travail", es: "Trabajo" },
    "free.work.desc": {
      desc: "Work card description",
      en: "Your creative clarity. Focus, decisions, professional timing.",
      fr: "Votre clarté créative. Concentration, décisions, timing professionnel.",
      es: "Tu claridad creativa. Enfoque, decisiones, timing profesional.",
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
      desc: "Compatibility subtitle — GEO: code + compatibility + axes",
      en: "Share your code. Discover your compatibility across Love, Health, and Work.",
      fr: "Partagez votre code. Découvrez votre compatibilité en Amour, Santé et Travail.",
      es: "Comparte tu código. Descubre tu compatibilidad en Amor, Salud y Trabajo.",
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
      desc: "Premium H2 — SEO/GEO: future + mapped",
      en: "Your future, mapped",
      fr: "Votre avenir, cartographié",
      es: "Tu futuro, mapeado",
    },
    "premium.subtitle": {
      desc: "Premium subtitle — GEO: strongest windows",
      en: "See your strongest windows before they arrive.",
      fr: "Voyez vos fenêtres optimales avant qu'elles n'arrivent.",
      es: "Ve tus ventanas más fuertes antes de que lleguen.",
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
      desc: "Science H2 — SEO/GEO: precision + not prediction",
      en: "Powered by precision, not prediction.",
      fr: "Fondé sur la précision, pas la prédiction.",
      es: "Basado en precisión, no en predicción.",
    },
    "science.subtitle": {
      desc: "Science subtitle — GEO: JPL + AI + privacy",
      en: "Built on JPL/NASA ephemerides, real-time planetary calculations, and proprietary AI models.",
      fr: "Fondé sur les éphémérides JPL/NASA, des calculs planétaires en temps réel et des modèles d'IA propriétaires.",
      es: "Basado en efemérides JPL/NASA, cálculos planetarios en tiempo real y modelos de IA propietarios.",
    },
    "science.pattern.title": {
      desc: "Pattern title",
      en: "High-precision data",
      fr: "Données haute précision",
      es: "Datos de alta precisión",
    },
    "science.pattern.desc": {
      desc: "Pattern desc",
      en: "Built on JPL/NASA ephemerides and real-time planetary calculations.",
      fr: "Fondé sur les éphémérides JPL/NASA et des calculs planétaires en temps réel.",
      es: "Basado en efemérides JPL/NASA y cálculos planetarios en tiempo real.",
    },
    "science.personal.title": {
      desc: "Personal calibration title",
      en: "Personal models",
      fr: "Modèles personnels",
      es: "Modelos personales",
    },
    "science.personal.desc": {
      desc: "Personal calibration desc",
      en: "Proprietary AI models adapt to your rhythm over time.",
      fr: "Des modèles d'IA propriétaires s'adaptent à votre rythme au fil du temps.",
      es: "Modelos de IA propietarios se adaptan a tu ritmo con el tiempo.",
    },
    "science.privacy.title": {
      desc: "Privacy title",
      en: "Private by design",
      fr: "Privé par conception",
      es: "Privado por diseño",
    },
    "science.privacy.desc": {
      desc: "Privacy desc",
      en: "Your personal data stays personal.",
      fr: "Vos données personnelles restent personnelles.",
      es: "Tus datos personales se mantienen personales.",
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
      desc: "Pricing subtitle",
      en: "Your daily momentum is always free. Premium unlocks the full picture.",
      fr: "Votre momentum quotidien est toujours gratuit. Premium débloque le tableau complet.",
      es: "Tu impulso diario es siempre gratis. Premium desbloquea la imagen completa.",
    },
    "pricing.free.name": {
      desc: "Free plan name",
      en: "Free",
      fr: "Gratuit",
      es: "Gratis",
    },
    "pricing.free.desc": {
      desc: "Free plan desc",
      en: "Your daily momentum signal, always.",
      fr: "Votre signal de momentum quotidien, toujours.",
      es: "Tu señal de impulso diaria, siempre.",
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
      desc: "Pricing subscription justification",
      en: "Premium is designed as an evolving subscription because your future momentum updates over time.",
      fr: "Premium est conçu comme un abonnement évolutif car votre momentum futur se met à jour au fil du temps.",
      es: "Premium está diseñado como una suscripción evolutiva porque tu impulso futuro se actualiza con el tiempo.",
    },
    // ─── CTA ───
    "cta.title": {
      desc: "Final CTA H2 — direct, no ambiguity",
      en: "Download Unfold",
      fr: "Téléchargez Unfold",
      es: "Descarga Unfold",
    },
    "cta.subtitle": {
      desc: "Final CTA subtitle — GEO: category + platforms + free",
      en: "Your personal timing app for Love, Health, and Work. Free on iOS and Android.",
      fr: "Votre app de timing personnel pour Amour, Santé et Travail. Gratuit sur iOS et Android.",
      es: "Tu app de timing personal para Amor, Salud y Trabajo. Gratis en iOS y Android.",
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
