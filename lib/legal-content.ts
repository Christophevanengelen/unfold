/**
 * Legal content for Privacy Policy and Terms of Service.
 * Hardcoded per locale (not DB-driven) because legal text is
 * version-controlled and rarely edited via CMS.
 */

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
};

// ─── Privacy Policy ───

export const privacyPolicy: Record<string, LegalDocument> = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: March 21, 2026",
    intro: [
      "Unfold (\"we\", \"our\", \"us\") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our mobile application and website (collectively, the \"Service\").",
      "By using the Service, you agree to the collection and use of information in accordance with this policy.",
    ],
    sections: [
      {
        heading: "1. Information We Collect",
        paragraphs: [
          "Account Information: When you create an account, we collect your date of birth, time of birth (optional), and birth location (optional). These are used solely to calculate your personal momentum signals.",
          "Usage Data: We collect anonymized usage analytics such as feature usage frequency, session duration, and navigation patterns. This helps us improve the app experience.",
          "Device Information: We may collect device type, operating system version, and app version for compatibility and debugging purposes.",
          "We do NOT collect or store: real names, email addresses (unless you provide one for account recovery), phone numbers, location data, photos, contacts, or any health data.",
        ],
      },
      {
        heading: "2. How We Use Your Information",
        paragraphs: [
          "We use the information we collect to: generate your personal momentum signals and timeline, provide compatibility comparisons when you choose to share, send you optional peak window notifications, and improve our algorithms and user experience.",
          "We never sell, rent, or share your personal information with third parties for marketing purposes.",
        ],
      },
      {
        heading: "3. Data Storage and Security",
        paragraphs: [
          "Your data is stored on secure servers hosted by Vercel and managed databases. We use industry-standard encryption for data in transit (TLS 1.3) and at rest.",
          "Birth data is stored separately from any identifying information and cannot be linked to you without your account credentials.",
        ],
      },
      {
        heading: "4. Data Retention",
        paragraphs: [
          "We retain your account data for as long as your account is active. If you delete your account, all associated personal data is permanently deleted within 30 days.",
          "Anonymized, aggregated analytics data may be retained indefinitely as it cannot be linked to individual users.",
        ],
      },
      {
        heading: "5. Your Rights",
        paragraphs: [
          "You have the right to: access the personal data we hold about you, request correction of inaccurate data, request deletion of your data, export your data in a portable format, and withdraw consent at any time.",
          "To exercise any of these rights, contact us at privacy@unfold.app.",
        ],
      },
      {
        heading: "6. Cookies and Tracking",
        paragraphs: [
          "Our website uses essential cookies required for the site to function. We use analytics cookies only with your explicit consent.",
          "You can manage your cookie preferences at any time through the cookie settings banner on our website.",
        ],
      },
      {
        heading: "7. Children's Privacy",
        paragraphs: [
          "The Service is not intended for children under 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.",
        ],
      },
      {
        heading: "8. International Data Transfers",
        paragraphs: [
          "Your data may be processed in countries other than your country of residence. We ensure appropriate safeguards are in place in accordance with applicable data protection laws, including GDPR.",
        ],
      },
      {
        heading: "9. Changes to This Policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the \"Last updated\" date.",
        ],
      },
      {
        heading: "10. Contact",
        paragraphs: [
          "If you have questions about this Privacy Policy, contact us at privacy@unfold.app.",
        ],
      },
    ],
  },

  fr: {
    title: "Politique de confidentialit\u00e9",
    lastUpdated: "Derni\u00e8re mise \u00e0 jour : 21 mars 2026",
    intro: [
      "Unfold (\u00ab nous \u00bb, \u00ab notre \u00bb) respecte votre vie priv\u00e9e. Cette Politique de confidentialit\u00e9 explique comment nous collectons, utilisons et prot\u00e9geons vos informations personnelles lorsque vous utilisez notre application mobile et notre site web (collectivement, le \u00ab Service \u00bb).",
      "En utilisant le Service, vous acceptez la collecte et l\u2019utilisation des informations conform\u00e9ment \u00e0 cette politique.",
    ],
    sections: [
      {
        heading: "1. Informations que nous collectons",
        paragraphs: [
          "Informations de compte : Lors de la cr\u00e9ation de votre compte, nous collectons votre date de naissance, heure de naissance (optionnel) et lieu de naissance (optionnel). Ces donn\u00e9es servent uniquement \u00e0 calculer vos signaux de momentum personnels.",
          "Donn\u00e9es d\u2019utilisation : Nous collectons des analyses d\u2019utilisation anonymis\u00e9es telles que la fr\u00e9quence d\u2019utilisation des fonctionnalit\u00e9s, la dur\u00e9e des sessions et les sch\u00e9mas de navigation.",
          "Nous ne collectons NI ne stockons : noms r\u00e9els, adresses e-mail (sauf si vous en fournissez une pour la r\u00e9cup\u00e9ration de compte), num\u00e9ros de t\u00e9l\u00e9phone, donn\u00e9es de localisation, photos, contacts ou donn\u00e9es de sant\u00e9.",
        ],
      },
      {
        heading: "2. Utilisation de vos informations",
        paragraphs: [
          "Nous utilisons les informations collect\u00e9es pour : g\u00e9n\u00e9rer vos signaux de momentum personnels et votre timeline, fournir des comparaisons de compatibilit\u00e9, envoyer des notifications optionnelles de fen\u00eatres de pic, et am\u00e9liorer nos algorithmes.",
          "Nous ne vendons, ne louons ni ne partageons jamais vos informations personnelles avec des tiers \u00e0 des fins marketing.",
        ],
      },
      {
        heading: "3. Stockage et s\u00e9curit\u00e9",
        paragraphs: [
          "Vos donn\u00e9es sont stock\u00e9es sur des serveurs s\u00e9curis\u00e9s. Nous utilisons un chiffrement standard (TLS 1.3) pour les donn\u00e9es en transit et au repos.",
        ],
      },
      {
        heading: "4. Conservation des donn\u00e9es",
        paragraphs: [
          "Nous conservons vos donn\u00e9es de compte tant que votre compte est actif. Si vous supprimez votre compte, toutes les donn\u00e9es personnelles associ\u00e9es sont d\u00e9finitivement supprim\u00e9es sous 30 jours.",
        ],
      },
      {
        heading: "5. Vos droits",
        paragraphs: [
          "Vous avez le droit de : acc\u00e9der \u00e0 vos donn\u00e9es personnelles, demander leur correction, demander leur suppression, exporter vos donn\u00e9es et retirer votre consentement \u00e0 tout moment.",
          "Pour exercer ces droits, contactez-nous \u00e0 privacy@unfold.app.",
        ],
      },
      {
        heading: "6. Cookies",
        paragraphs: [
          "Notre site web utilise des cookies essentiels au fonctionnement du site. Les cookies analytiques ne sont utilis\u00e9s qu\u2019avec votre consentement explicite.",
        ],
      },
      {
        heading: "7. Protection des mineurs",
        paragraphs: [
          "Le Service n\u2019est pas destin\u00e9 aux mineurs de moins de 16 ans. Nous ne collectons pas sciemment d\u2019informations personnelles d\u2019enfants.",
        ],
      },
      {
        heading: "8. Modifications",
        paragraphs: [
          "Nous pouvons mettre \u00e0 jour cette politique. Nous vous informerons de tout changement important en publiant la nouvelle politique sur cette page.",
        ],
      },
      {
        heading: "9. Contact",
        paragraphs: [
          "Pour toute question, contactez-nous \u00e0 privacy@unfold.app.",
        ],
      },
    ],
  },

  es: {
    title: "Pol\u00edtica de Privacidad",
    lastUpdated: "\u00daltima actualizaci\u00f3n: 21 de marzo de 2026",
    intro: [
      "Unfold (\"nosotros\", \"nuestro\") respeta tu privacidad. Esta Pol\u00edtica de Privacidad explica c\u00f3mo recopilamos, usamos y protegemos tu informaci\u00f3n personal cuando utilizas nuestra aplicaci\u00f3n m\u00f3vil y sitio web (colectivamente, el \"Servicio\").",
      "Al usar el Servicio, aceptas la recopilaci\u00f3n y el uso de informaci\u00f3n de acuerdo con esta pol\u00edtica.",
    ],
    sections: [
      {
        heading: "1. Informaci\u00f3n que recopilamos",
        paragraphs: [
          "Informaci\u00f3n de cuenta: Al crear tu cuenta, recopilamos tu fecha de nacimiento, hora de nacimiento (opcional) y lugar de nacimiento (opcional). Estos datos se usan exclusivamente para calcular tus se\u00f1ales de impulso personales.",
          "Datos de uso: Recopilamos an\u00e1lisis de uso anonimizados como la frecuencia de uso de funciones, duraci\u00f3n de sesiones y patrones de navegaci\u00f3n.",
          "NO recopilamos ni almacenamos: nombres reales, direcciones de correo (excepto para recuperaci\u00f3n de cuenta), n\u00fameros de tel\u00e9fono, datos de ubicaci\u00f3n, fotos, contactos ni datos de salud.",
        ],
      },
      {
        heading: "2. Uso de tu informaci\u00f3n",
        paragraphs: [
          "Usamos la informaci\u00f3n para: generar tus se\u00f1ales de impulso personales y tu l\u00ednea de tiempo, proporcionar comparaciones de compatibilidad, enviar notificaciones opcionales de ventanas pico, y mejorar nuestros algoritmos.",
          "Nunca vendemos, alquilamos ni compartimos tu informaci\u00f3n personal con terceros con fines de marketing.",
        ],
      },
      {
        heading: "3. Almacenamiento y seguridad",
        paragraphs: [
          "Tus datos se almacenan en servidores seguros. Utilizamos cifrado est\u00e1ndar (TLS 1.3) para datos en tr\u00e1nsito y en reposo.",
        ],
      },
      {
        heading: "4. Retenci\u00f3n de datos",
        paragraphs: [
          "Conservamos los datos de tu cuenta mientras est\u00e9 activa. Si eliminas tu cuenta, todos los datos personales asociados se eliminan permanentemente en un plazo de 30 d\u00edas.",
        ],
      },
      {
        heading: "5. Tus derechos",
        paragraphs: [
          "Tienes derecho a: acceder a tus datos personales, solicitar su correcci\u00f3n, solicitar su eliminaci\u00f3n, exportar tus datos y retirar tu consentimiento en cualquier momento.",
          "Para ejercer estos derechos, cont\u00e1ctanos en privacy@unfold.app.",
        ],
      },
      {
        heading: "6. Cookies",
        paragraphs: [
          "Nuestro sitio web utiliza cookies esenciales para el funcionamiento del sitio. Las cookies anal\u00edticas solo se usan con tu consentimiento expl\u00edcito.",
        ],
      },
      {
        heading: "7. Menores",
        paragraphs: [
          "El Servicio no est\u00e1 dirigido a menores de 16 a\u00f1os. No recopilamos intencionalmente informaci\u00f3n personal de menores.",
        ],
      },
      {
        heading: "8. Cambios",
        paragraphs: [
          "Podemos actualizar esta pol\u00edtica. Te informaremos de cualquier cambio importante publicando la nueva pol\u00edtica en esta p\u00e1gina.",
        ],
      },
      {
        heading: "9. Contacto",
        paragraphs: [
          "Para consultas, cont\u00e1ctanos en privacy@unfold.app.",
        ],
      },
    ],
  },
};

// ─── Terms of Service ───

export const termsOfService: Record<string, LegalDocument> = {
  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated: March 21, 2026",
    intro: [
      "Welcome to Unfold. These Terms of Service (\"Terms\") govern your use of the Unfold mobile application and website (the \"Service\"). By using the Service, you agree to these Terms.",
    ],
    sections: [
      {
        heading: "1. The Service",
        paragraphs: [
          "Unfold is a personal timing application that provides daily momentum signals across Love, Health, and Work based on planetary transit calculations. The Service is available as a free tier with optional paid Premium features.",
          "The momentum signals provided by Unfold are for informational and entertainment purposes. They do not constitute professional advice of any kind (medical, financial, legal, or otherwise).",
        ],
      },
      {
        heading: "2. Accounts",
        paragraphs: [
          "You must be at least 16 years old to use the Service. You are responsible for maintaining the security of your account and for all activities that occur under your account.",
          "You agree to provide accurate birth date information, as this is essential for the Service to function correctly.",
        ],
      },
      {
        heading: "3. Free and Premium Plans",
        paragraphs: [
          "The Free plan includes: your current daily momentum signal, Love/Health/Work breakdown, past signal review, and basic compatibility.",
          "The Premium plan ($4/month or $29/year) includes: full momentum timeline, future signal preview, peak window alerts, and advanced compatibility features.",
          "Premium subscriptions are billed through Apple App Store or Google Play Store. Subscription management, cancellation, and refund policies are governed by the respective platform's terms.",
        ],
      },
      {
        heading: "4. Acceptable Use",
        paragraphs: [
          "You agree not to: use the Service for any unlawful purpose, attempt to reverse-engineer or interfere with the Service, impersonate others or create multiple accounts, or use automated systems to access the Service without our permission.",
        ],
      },
      {
        heading: "5. Intellectual Property",
        paragraphs: [
          "The Service, including its design, code, algorithms, and content, is owned by Unfold and protected by intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the Service.",
        ],
      },
      {
        heading: "6. Limitation of Liability",
        paragraphs: [
          "The Service is provided \"as is\" without warranties of any kind. Unfold is not liable for any decisions you make based on momentum signals provided by the Service.",
          "To the maximum extent permitted by law, Unfold's total liability to you shall not exceed the amount you have paid us in the 12 months preceding the claim.",
        ],
      },
      {
        heading: "7. Termination",
        paragraphs: [
          "We may suspend or terminate your access to the Service at any time for violation of these Terms. You may delete your account at any time through the app settings.",
        ],
      },
      {
        heading: "8. Changes to Terms",
        paragraphs: [
          "We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms.",
        ],
      },
      {
        heading: "9. Governing Law",
        paragraphs: [
          "These Terms are governed by the laws of Belgium. Any disputes will be resolved in the courts of Brussels, Belgium.",
        ],
      },
      {
        heading: "10. Contact",
        paragraphs: [
          "For questions about these Terms, contact us at legal@unfold.app.",
        ],
      },
    ],
  },

  fr: {
    title: "Conditions d\u2019utilisation",
    lastUpdated: "Derni\u00e8re mise \u00e0 jour : 21 mars 2026",
    intro: [
      "Bienvenue sur Unfold. Ces Conditions d\u2019utilisation (\u00ab Conditions \u00bb) r\u00e9gissent votre utilisation de l\u2019application mobile et du site web Unfold (le \u00ab Service \u00bb). En utilisant le Service, vous acceptez ces Conditions.",
    ],
    sections: [
      {
        heading: "1. Le Service",
        paragraphs: [
          "Unfold est une application de timing personnel qui fournit des signaux de momentum quotidiens pour l\u2019Amour, la Sant\u00e9 et le Travail bas\u00e9s sur des calculs de transits plan\u00e9taires. Le Service est disponible en version gratuite avec des fonctionnalit\u00e9s Premium optionnelles payantes.",
          "Les signaux de momentum fournis par Unfold sont \u00e0 titre informatif et de divertissement. Ils ne constituent pas des conseils professionnels (m\u00e9dicaux, financiers, juridiques ou autres).",
        ],
      },
      {
        heading: "2. Comptes",
        paragraphs: [
          "Vous devez avoir au moins 16 ans pour utiliser le Service. Vous \u00eates responsable de la s\u00e9curit\u00e9 de votre compte et de toutes les activit\u00e9s qui y sont associ\u00e9es.",
        ],
      },
      {
        heading: "3. Plans Gratuit et Premium",
        paragraphs: [
          "Le plan Gratuit inclut : votre signal de momentum quotidien actuel, la r\u00e9partition Amour/Sant\u00e9/Travail, la revue du signal pass\u00e9 et la compatibilit\u00e9 de base.",
          "Le plan Premium (4\u20ac/mois ou 29\u20ac/an) inclut : la timeline compl\u00e8te du momentum, l\u2019aper\u00e7u du signal futur, les alertes de fen\u00eatres de pic et la compatibilit\u00e9 avanc\u00e9e.",
          "Les abonnements Premium sont factur\u00e9s via l\u2019App Store ou Google Play. La gestion des abonnements, l\u2019annulation et les politiques de remboursement sont r\u00e9gies par les conditions de la plateforme respective.",
        ],
      },
      {
        heading: "4. Utilisation acceptable",
        paragraphs: [
          "Vous vous engagez \u00e0 ne pas : utiliser le Service \u00e0 des fins ill\u00e9gales, tenter de d\u00e9compiler ou interf\u00e9rer avec le Service, usurper l\u2019identit\u00e9 d\u2019autrui, ou utiliser des syst\u00e8mes automatis\u00e9s pour acc\u00e9der au Service.",
        ],
      },
      {
        heading: "5. Propri\u00e9t\u00e9 intellectuelle",
        paragraphs: [
          "Le Service, y compris son design, son code, ses algorithmes et son contenu, est la propri\u00e9t\u00e9 d\u2019Unfold et prot\u00e9g\u00e9 par les lois sur la propri\u00e9t\u00e9 intellectuelle.",
        ],
      },
      {
        heading: "6. Limitation de responsabilit\u00e9",
        paragraphs: [
          "Le Service est fourni \u00ab tel quel \u00bb sans garantie d\u2019aucune sorte. Unfold n\u2019est pas responsable des d\u00e9cisions que vous prenez sur la base des signaux de momentum fournis par le Service.",
        ],
      },
      {
        heading: "7. R\u00e9siliation",
        paragraphs: [
          "Nous pouvons suspendre ou r\u00e9silier votre acc\u00e8s au Service \u00e0 tout moment en cas de violation de ces Conditions. Vous pouvez supprimer votre compte \u00e0 tout moment via les param\u00e8tres de l\u2019application.",
        ],
      },
      {
        heading: "8. Modifications",
        paragraphs: [
          "Nous pouvons mettre \u00e0 jour ces Conditions. L\u2019utilisation continue du Service apr\u00e8s les modifications constitue l\u2019acceptation des Conditions mises \u00e0 jour.",
        ],
      },
      {
        heading: "9. Droit applicable",
        paragraphs: [
          "Ces Conditions sont r\u00e9gies par le droit belge. Tout litige sera r\u00e9solu devant les tribunaux de Bruxelles, Belgique.",
        ],
      },
      {
        heading: "10. Contact",
        paragraphs: [
          "Pour toute question, contactez-nous \u00e0 legal@unfold.app.",
        ],
      },
    ],
  },

  es: {
    title: "T\u00e9rminos de Servicio",
    lastUpdated: "\u00daltima actualizaci\u00f3n: 21 de marzo de 2026",
    intro: [
      "Bienvenido a Unfold. Estos T\u00e9rminos de Servicio (\"T\u00e9rminos\") rigen el uso de la aplicaci\u00f3n m\u00f3vil y el sitio web de Unfold (el \"Servicio\"). Al usar el Servicio, aceptas estos T\u00e9rminos.",
    ],
    sections: [
      {
        heading: "1. El Servicio",
        paragraphs: [
          "Unfold es una aplicaci\u00f3n de timing personal que proporciona se\u00f1ales de impulso diarias para Amor, Salud y Trabajo basadas en c\u00e1lculos de tr\u00e1nsitos planetarios. El Servicio est\u00e1 disponible en una versi\u00f3n gratuita con funciones Premium opcionales de pago.",
          "Las se\u00f1ales de impulso proporcionadas por Unfold son con fines informativos y de entretenimiento. No constituyen asesoramiento profesional de ning\u00fan tipo.",
        ],
      },
      {
        heading: "2. Cuentas",
        paragraphs: [
          "Debes tener al menos 16 a\u00f1os para usar el Servicio. Eres responsable de la seguridad de tu cuenta y de todas las actividades que ocurran bajo ella.",
        ],
      },
      {
        heading: "3. Planes Gratuito y Premium",
        paragraphs: [
          "El plan Gratuito incluye: tu se\u00f1al de impulso diaria actual, desglose Amor/Salud/Trabajo, revisi\u00f3n de se\u00f1ales pasadas y compatibilidad b\u00e1sica.",
          "El plan Premium (4\u20ac/mes o 29\u20ac/a\u00f1o) incluye: l\u00ednea de tiempo completa del impulso, vista previa de se\u00f1ales futuras, alertas de ventanas pico y compatibilidad avanzada.",
          "Las suscripciones Premium se facturan a trav\u00e9s de la App Store o Google Play. La gesti\u00f3n, cancelaci\u00f3n y pol\u00edticas de reembolso se rigen por los t\u00e9rminos de la plataforma respectiva.",
        ],
      },
      {
        heading: "4. Uso aceptable",
        paragraphs: [
          "Te comprometes a no: usar el Servicio con fines ilegales, intentar descompilar o interferir con el Servicio, suplantar la identidad de otros, o usar sistemas automatizados para acceder al Servicio.",
        ],
      },
      {
        heading: "5. Propiedad intelectual",
        paragraphs: [
          "El Servicio, incluyendo su dise\u00f1o, c\u00f3digo, algoritmos y contenido, es propiedad de Unfold y est\u00e1 protegido por las leyes de propiedad intelectual.",
        ],
      },
      {
        heading: "6. Limitaci\u00f3n de responsabilidad",
        paragraphs: [
          "El Servicio se proporciona \"tal cual\" sin garant\u00edas de ning\u00fan tipo. Unfold no es responsable de las decisiones que tomes bas\u00e1ndote en las se\u00f1ales de impulso proporcionadas.",
        ],
      },
      {
        heading: "7. Terminaci\u00f3n",
        paragraphs: [
          "Podemos suspender o terminar tu acceso al Servicio en cualquier momento por violaci\u00f3n de estos T\u00e9rminos. Puedes eliminar tu cuenta en cualquier momento desde los ajustes de la aplicaci\u00f3n.",
        ],
      },
      {
        heading: "8. Cambios",
        paragraphs: [
          "Podemos actualizar estos T\u00e9rminos. El uso continuado del Servicio despu\u00e9s de los cambios constituye la aceptaci\u00f3n de los T\u00e9rminos actualizados.",
        ],
      },
      {
        heading: "9. Ley aplicable",
        paragraphs: [
          "Estos T\u00e9rminos se rigen por la legislaci\u00f3n belga. Cualquier disputa se resolver\u00e1 ante los tribunales de Bruselas, B\u00e9lgica.",
        ],
      },
      {
        heading: "10. Contacto",
        paragraphs: [
          "Para consultas, cont\u00e1ctanos en legal@unfold.app.",
        ],
      },
    ],
  },
};
