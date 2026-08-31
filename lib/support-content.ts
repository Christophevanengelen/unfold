/**
 * La page d assistance.
 *
 * Apple en exige une : l URL d assistance est un champ obligatoire d App Store
 * Connect, et le relecteur l ouvre. Elle repondait 404.
 *
 * Elle sert aussi a autre chose de plus utile qu une case a cocher. Une app qui
 * touche a l intime doit dire clairement comment on la quitte, comment on
 * recupere ses donnees et a qui on ecrit. C est ce que cette page fait, dans
 * cet ordre.
 *
 * Trois langues, comme les autres textes du site ; les sept restantes reçoivent
 * l anglais. Voir AVANT-PUBLICATION.md.
 */

/**
 * ⚠️ Cette boite doit EXISTER avant la soumission a Apple.
 *
 * Les anciens textes pointaient vers cve@hi-def.be et cve@hi-def.be —
 * un domaine qui ne nous appartient pas et qui n a aucun enregistrement MX.
 * Toute demande RGPD partait donc dans le vide. Ne pas reproduire l erreur :
 * creer la boite d abord, verifier qu elle reçoit, et seulement ensuite
 * publier.
 */
export const CONTACT = "hello@favorable.day";

export type SupportDoc = {
  title: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

export const supportContent: Record<string, SupportDoc> = {
  fr: {
    title: "Aide",
    intro:
      "Favorable est fait par deux personnes. Écrivez-nous, c'est l'une d'elles qui répondra.",
    sections: [
      {
        heading: "Nous écrire",
        body: [
          `${CONTACT} — en français, en anglais ou en néerlandais.`,
          "Nous répondons sous quelques jours. Si votre message concerne un problème dans l'app, indiquez votre modèle d'iPhone et la version d'iOS : ça nous fait gagner un aller-retour.",
        ],
      },
      {
        heading: "Supprimer votre compte et vos données",
        body: [
          "Dans l'app : onglet Profil, puis « Supprimer mon compte ». La suppression est immédiate et définitive — vos données de naissance, vos connexions et votre historique sont effacés de nos serveurs.",
          "Cela n'annule pas un abonnement en cours. Les abonnements se gèrent dans les réglages de votre compte Apple.",
        ],
      },
      {
        heading: "Gérer ou annuler un abonnement",
        body: [
          "Réglages de votre iPhone → votre nom → Abonnements → Favorable.",
          "Apple gère la facturation et les remboursements. Nous n'avons pas accès à votre moyen de paiement et ne pouvons pas rembourser à leur place.",
        ],
      },
      {
        heading: "Vos données",
        body: [
          "Ce que nous conservons, pourquoi, et combien de temps : voir la politique de confidentialité.",
          "Vous pouvez demander une copie de vos données, leur correction ou leur effacement en nous écrivant. C'est votre droit et nous y répondons.",
        ],
      },
      {
        heading: "Ce que Favorable ne fait pas",
        body: [
          "Favorable décrit un calendrier calculé à partir de votre thème natal. Il ne prédit pas l'avenir et ne dit pas ce qui va vous arriver.",
          "Ce n'est ni un avis médical, ni juridique, ni financier. Aucune décision qui vous appartient ne devrait être prise sur cette seule base.",
        ],
      },
    ],
  },
  en: {
    title: "Help",
    intro: "Favorable is made by two people. Write to us and one of them answers.",
    sections: [
      {
        heading: "Write to us",
        body: [
          `${CONTACT} — in English, French or Dutch.`,
          "We answer within a few days. If it is about a problem in the app, tell us your iPhone model and iOS version — it saves a round trip.",
        ],
      },
      {
        heading: "Delete your account and your data",
        body: [
          "In the app: Profile tab, then “Delete my account”. Deletion is immediate and permanent — your birth data, your connections and your history are erased from our servers.",
          "This does not cancel an active subscription. Subscriptions are managed in your Apple account settings.",
        ],
      },
      {
        heading: "Manage or cancel a subscription",
        body: [
          "iPhone Settings → your name → Subscriptions → Favorable.",
          "Apple handles billing and refunds. We have no access to your payment method and cannot refund on their behalf.",
        ],
      },
      {
        heading: "Your data",
        body: [
          "What we keep, why, and for how long: see the privacy policy.",
          "You can ask for a copy of your data, for corrections, or for erasure by writing to us. It is your right and we answer.",
        ],
      },
      {
        heading: "What Favorable does not do",
        body: [
          "Favorable describes a calendar computed from your natal chart. It does not predict the future and does not tell you what will happen to you.",
          "It is not medical, legal or financial advice. No decision that is yours to make should rest on this alone.",
        ],
      },
    ],
  },
  es: {
    title: "Ayuda",
    intro: "Favorable lo hacen dos personas. Escríbenos y una de ellas responde.",
    sections: [
      {
        heading: "Escríbenos",
        body: [
          `${CONTACT} — en español, francés o inglés.`,
          "Respondemos en unos días. Si se trata de un problema en la app, indícanos tu modelo de iPhone y la versión de iOS.",
        ],
      },
      {
        heading: "Eliminar tu cuenta y tus datos",
        body: [
          "En la app: pestaña Perfil, luego “Eliminar mi cuenta”. El borrado es inmediato y definitivo.",
          "Esto no cancela una suscripción activa. Las suscripciones se gestionan en los ajustes de tu cuenta de Apple.",
        ],
      },
      {
        heading: "Gestionar o cancelar una suscripción",
        body: [
          "Ajustes del iPhone → tu nombre → Suscripciones → Favorable.",
          "Apple gestiona la facturación y los reembolsos. No tenemos acceso a tu método de pago.",
        ],
      },
      {
        heading: "Tus datos",
        body: [
          "Qué conservamos, por qué y durante cuánto tiempo: consulta la política de privacidad.",
          "Puedes pedir una copia de tus datos, su corrección o su eliminación escribiéndonos.",
        ],
      },
      {
        heading: "Lo que Favorable no hace",
        body: [
          "Favorable describe un calendario calculado a partir de tu carta natal. No predice el futuro.",
          "No es asesoramiento médico, jurídico ni financiero.",
        ],
      },
    ],
  },
};
