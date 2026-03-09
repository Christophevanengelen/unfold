import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    // Hero
    "hero.eyebrow": {
      desc: "Hero eyebrow text",
      en: "Your personal momentum engine",
      fr: "Votre moteur de momentum personnel",
      es: "Tu motor de impulso personal",
    },
    "hero.title": {
      desc: "Hero main headline",
      en: "Know when life moves in your favor",
      fr: "Sachez quand la vie joue en votre faveur",
      es: "Descubre cuándo la vida se mueve a tu favor",
    },
    "hero.subtitle": {
      desc: "Hero subtitle",
      en: "Understand your daily rhythms across Love, Health, and Work. See yesterday, feel today, prepare tomorrow.",
      fr: "Comprenez vos rythmes quotidiens en Amour, Santé et Travail. Voyez hier, ressentez aujourd'hui, préparez demain.",
      es: "Comprende tus ritmos diarios en Amor, Salud y Trabajo. Mira ayer, siente hoy, prepara mañana.",
    },
    // Free Awareness
    "free.eyebrow": {
      desc: "Free section eyebrow",
      en: "Always free",
      fr: "Toujours gratuit",
      es: "Siempre gratis",
    },
    "free.title": {
      desc: "Free section title",
      en: "Your daily momentum, on us",
      fr: "Votre momentum quotidien, offert",
      es: "Tu impulso diario, por nuestra cuenta",
    },
    "free.subtitle": {
      desc: "Free section subtitle",
      en: "Every day, Unfold reveals your personal momentum across three dimensions that matter most.",
      fr: "Chaque jour, Unfold révèle votre momentum personnel à travers trois dimensions essentielles.",
      es: "Cada día, Unfold revela tu impulso personal en tres dimensiones que más importan.",
    },
    "free.love.title": { desc: "Love card title", en: "Love", fr: "Amour", es: "Amor" },
    "free.love.desc": {
      desc: "Love card description",
      en: "Relationships, connection, emotional openness. Know when your heart is strongest.",
      fr: "Relations, connexion, ouverture émotionnelle. Sachez quand votre cœur est le plus fort.",
      es: "Relaciones, conexión, apertura emocional. Sabe cuándo tu corazón está más fuerte.",
    },
    "free.health.title": { desc: "Health card title", en: "Health", fr: "Santé", es: "Salud" },
    "free.health.desc": {
      desc: "Health card description",
      en: "Energy, vitality, physical rhythm. Align your body with your best days.",
      fr: "Énergie, vitalité, rythme physique. Alignez votre corps avec vos meilleurs jours.",
      es: "Energía, vitalidad, ritmo físico. Alinea tu cuerpo con tus mejores días.",
    },
    "free.work.title": { desc: "Work card title", en: "Work", fr: "Travail", es: "Trabajo" },
    "free.work.desc": {
      desc: "Work card description",
      en: "Focus, decision-making, creative flow. Time your ambitions with precision.",
      fr: "Concentration, prise de décision, flux créatif. Synchronisez vos ambitions avec précision.",
      es: "Enfoque, toma de decisiones, flujo creativo. Sincroniza tus ambiciones con precisión.",
    },
    // Daily Scores
    "daily.eyebrow": { desc: "Daily scores eyebrow", en: "Yesterday · Today · Tomorrow", fr: "Hier · Aujourd'hui · Demain", es: "Ayer · Hoy · Mañana" },
    "daily.title": { desc: "Daily scores title", en: "Your momentum, day by day", fr: "Votre momentum, jour après jour", es: "Tu impulso, día a día" },
    "daily.subtitle": {
      desc: "Daily scores subtitle",
      en: "Review yesterday's signals. Understand today's momentum. Prepare for tomorrow's peaks.",
      fr: "Revoyez les signaux d'hier. Comprenez le momentum d'aujourd'hui. Préparez les pics de demain.",
      es: "Revisa las señales de ayer. Comprende el impulso de hoy. Prepara los picos de mañana.",
    },
    // Compatibility
    "compat.eyebrow": { desc: "Compatibility eyebrow", en: "Better together", fr: "Mieux ensemble", es: "Mejor juntos" },
    "compat.title": { desc: "Compatibility title", en: "Compare your rhythms", fr: "Comparez vos rythmes", es: "Compara tus ritmos" },
    "compat.subtitle": {
      desc: "Compatibility subtitle",
      en: "Share your invite code. Discover how your momentum aligns with someone who matters. Find your shared peak moments.",
      fr: "Partagez votre code d'invitation. Découvrez comment votre momentum s'aligne avec quelqu'un qui compte. Trouvez vos moments de pic partagés.",
      es: "Comparte tu código de invitación. Descubre cómo tu impulso se alinea con alguien que importa. Encuentra tus momentos pico compartidos.",
    },
    "compat.cta": { desc: "Compatibility CTA", en: "Invite someone. Compare your signals.", fr: "Invitez quelqu'un. Comparez vos signaux.", es: "Invita a alguien. Compara tus señales." },
    // Premium
    "premium.eyebrow": { desc: "Premium eyebrow", en: "Premium", fr: "Premium", es: "Premium" },
    "premium.title": { desc: "Premium title", en: "See further. Move smarter.", fr: "Voyez plus loin. Agissez plus intelligemment.", es: "Mira más lejos. Muévete mejor." },
    "premium.subtitle": { desc: "Premium subtitle", en: "Unlock the full power of your personal momentum engine.", fr: "Débloquez toute la puissance de votre moteur de momentum.", es: "Desbloquea todo el poder de tu motor de impulso." },
    "premium.forecast.title": { desc: "Forecast feature title", en: "Future momentum windows", fr: "Fenêtres de momentum futures", es: "Ventanas de impulso futuras" },
    "premium.forecast.desc": { desc: "Forecast feature desc", en: "See your upcoming peaks before they arrive. Plan your week around your natural rhythms.", fr: "Voyez vos pics à venir avant qu'ils n'arrivent. Planifiez votre semaine autour de vos rythmes naturels.", es: "Ve tus próximos picos antes de que lleguen. Planifica tu semana según tus ritmos naturales." },
    "premium.map.title": { desc: "Map feature title", en: "Monthly momentum map", fr: "Carte de momentum mensuelle", es: "Mapa de impulso mensual" },
    "premium.map.desc": { desc: "Map feature desc", en: "A bird's-eye view of your month. Spot patterns, plan ahead, stay aligned.", fr: "Une vue d'ensemble de votre mois. Repérez les schémas, planifiez, restez aligné.", es: "Una vista panorámica de tu mes. Detecta patrones, planifica, mantente alineado." },
    "premium.alerts.title": { desc: "Alerts feature title", en: "Peak alerts", fr: "Alertes de pic", es: "Alertas de pico" },
    "premium.alerts.desc": { desc: "Alerts feature desc", en: "Real-time notifications when exceptional momentum windows open.", fr: "Notifications en temps réel quand des fenêtres de momentum exceptionnelles s'ouvrent.", es: "Notificaciones en tiempo real cuando se abren ventanas de impulso excepcionales." },
    "premium.compat.title": { desc: "Advanced compat title", en: "Advanced compatibility", fr: "Compatibilité avancée", es: "Compatibilidad avanzada" },
    "premium.compat.desc": { desc: "Advanced compat desc", en: "Deep relational analysis. Shared peak discovery. Timing synergy reports.", fr: "Analyse relationnelle profonde. Découverte de pics partagés. Rapports de synergie temporelle.", es: "Análisis relacional profundo. Descubrimiento de picos compartidos. Informes de sinergia temporal." },
    // Science
    "science.eyebrow": { desc: "Science eyebrow", en: "Built on signal, not noise", fr: "Construit sur le signal, pas le bruit", es: "Construido sobre señales, no ruido" },
    "science.title": { desc: "Science title", en: "The technology behind your timing", fr: "La technologie derrière votre timing", es: "La tecnología detrás de tu timing" },
    "science.subtitle": { desc: "Science subtitle", en: "Unfold combines behavioral science with advanced pattern recognition to surface your personal momentum signals.", fr: "Unfold combine la science comportementale avec la reconnaissance de patterns pour révéler vos signaux de momentum.", es: "Unfold combina la ciencia del comportamiento con el reconocimiento de patrones para revelar tus señales de impulso." },
    "science.pattern.title": { desc: "Pattern title", en: "Pattern recognition", fr: "Reconnaissance de patterns", es: "Reconocimiento de patrones" },
    "science.pattern.desc": { desc: "Pattern desc", en: "Advanced algorithms identify recurring rhythms in your daily momentum data.", fr: "Des algorithmes avancés identifient les rythmes récurrents dans vos données de momentum.", es: "Algoritmos avanzados identifican ritmos recurrentes en tus datos de impulso." },
    "science.personal.title": { desc: "Personal calibration title", en: "Personal calibration", fr: "Calibration personnelle", es: "Calibración personal" },
    "science.personal.desc": { desc: "Personal calibration desc", en: "Your signals are uniquely yours. The engine learns and adapts to your patterns.", fr: "Vos signaux sont uniques. Le moteur apprend et s'adapte à vos schémas.", es: "Tus señales son únicas. El motor aprende y se adapta a tus patrones." },
    "science.privacy.title": { desc: "Privacy title", en: "Privacy-first", fr: "Vie privée d'abord", es: "Privacidad primero" },
    "science.privacy.desc": { desc: "Privacy desc", en: "Your data belongs to you. Encrypted. Private. Never shared.", fr: "Vos données vous appartiennent. Chiffrées. Privées. Jamais partagées.", es: "Tus datos te pertenecen. Cifrados. Privados. Nunca compartidos." },
    // Clarity
    "clarity.title": { desc: "Clarity title", en: "Designed for clarity", fr: "Conçu pour la clarté", es: "Diseñado para la claridad" },
    "clarity.subtitle": { desc: "Clarity subtitle", en: "No clutter. No noise. Every screen is designed to give you exactly what you need — nothing more, nothing less.", fr: "Pas de désordre. Pas de bruit. Chaque écran est conçu pour vous donner exactement ce dont vous avez besoin.", es: "Sin desorden. Sin ruido. Cada pantalla está diseñada para darte exactamente lo que necesitas." },
    // Pricing
    "pricing.title": { desc: "Pricing title", en: "Start free. Unlock more.", fr: "Commencez gratuitement. Débloquez plus.", es: "Empieza gratis. Desbloquea más." },
    "pricing.subtitle": { desc: "Pricing subtitle", en: "Your daily momentum signal is always free. Premium unlocks the full picture.", fr: "Votre signal de momentum quotidien est toujours gratuit. Premium débloque le tableau complet.", es: "Tu señal de impulso diaria es siempre gratis. Premium desbloquea la imagen completa." },
    "pricing.free.name": { desc: "Free plan name", en: "Free", fr: "Gratuit", es: "Gratis" },
    "pricing.free.desc": { desc: "Free plan desc", en: "Your daily momentum signal, always.", fr: "Votre signal de momentum quotidien, toujours.", es: "Tu señal de impulso diaria, siempre." },
    "pricing.free.price": { desc: "Free plan price", en: "$0", fr: "0 €", es: "0 €" },
    "pricing.premium.name": { desc: "Premium plan name", en: "Premium", fr: "Premium", es: "Premium" },
    "pricing.premium.desc": { desc: "Premium plan desc", en: "See further. Move smarter.", fr: "Voyez plus loin. Agissez plus intelligemment.", es: "Mira más lejos. Muévete mejor." },
    "pricing.premium.price": { desc: "Premium plan price", en: "$4.99", fr: "4,99 €", es: "4,99 €" },
    "pricing.premium.period": { desc: "Premium billing period", en: "/month", fr: "/mois", es: "/mes" },
    // CTA
    "cta.title": { desc: "Final CTA title", en: "Your momentum is waiting", fr: "Votre momentum vous attend", es: "Tu impulso te espera" },
    "cta.subtitle": { desc: "Final CTA subtitle", en: "Download Unfold and discover the rhythms that move your life forward.", fr: "Téléchargez Unfold et découvrez les rythmes qui font avancer votre vie.", es: "Descarga Unfold y descubre los ritmos que mueven tu vida hacia adelante." },
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
