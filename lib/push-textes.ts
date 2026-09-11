/**
 * Ce que dit une notification.
 *
 * Trois regles d ecriture, et la troisieme n est pas negociable.
 *
 * 1. **Court.** iOS coupe le titre vers 35 caracteres sur l ecran verrouille.
 *    Ce qui compte doit tenir avant la coupe.
 * 2. **Descriptif, jamais predictif.** « Une periode s ouvre » decrit un
 *    calendrier. « Une bonne semaine t attend » promet l avenir. La premiere
 *    forme est honnete et passe la revue d Apple ; la seconde nous mettrait
 *    dans la categorie que l article 4.3(b) refuse de laisser grandir.
 * 3. **Aucun mot sur le contenu meme.** La notification annonce qu il se passe
 *    quelque chose, pas ce que c est. Ce qui se dit dans la notification ne se
 *    lit plus dans l app.
 *
 * Les dix langues du produit sont couvertes. Les textes sont volontairement
 * pauvres : c est ce qui les rend traduisibles sans trahison.
 */

import type { Notification } from "@/lib/push-planification";
import { nomMaison } from "@/lib/maisons-i18n";

type Textes = {
  /** Une periode courte s ouvre demain. */
  periodeTitre: string;
  periodeCorps: string;
  /** Un basculement, plus rare et plus marque. */
  basculeTitre: string;
  basculeCorps: string;
  /** Debut de mois, avec le nombre de moments dans CE mois. */
  moisTitre: string;
  /** `{n}` est remplace par le compte. */
  moisCorps: string;
  moisCorpsUn: string;
  /** Une periode se termine. */
  sortieTitre: string;

  // ── Ce qui se passe entre deux personnes ─────────────────────────────────
  //
  // Le nom de l autre n apparait NULLE PART, volontairement. Une notification
  // se lit sur un ecran verrouille, posé sur une table, par n importe qui. Le
  // prenom de quelqu un d autre n a rien a y faire — et il n est pas
  // necessaire : la notification ouvre la fiche de cette connexion-la, donc
  // l app dit qui des le premier coup d oeil.
  //
  // Le conseil non plus n est pas ici. « Ce qui se termine entre vous » tient
  // sur l ecran verrouille ; « comment bien gerer cette transition » demande
  // des phrases, et ces phrases se lisent dans l app. Une notification qui
  // dirait tout se substituerait a l ecran qu elle ouvre.
  /** Un moment commun s ouvre demain. */
  communTitre: string;
  communCorps: string;
  /** Un moment commun se termine demain. */
  finTitre: string;
  finCorps: string;
  /** Une bascule de leur cote. */
  autreTitre: string;
  autreCorps: string;
};

const T: Record<string, Textes> = {
  fr: {
    periodeTitre: "Une période s'ouvre demain",
    sortieTitre: "Une période se termine demain",
    periodeCorps: "Elle est sur ta timeline.",
    basculeTitre: "Un basculement demain",
    basculeCorps: "Ces moments-là sont rares.",
    moisTitre: "Ton mois",
    moisCorps: "{n} moments à regarder.",
    moisCorpsUn: "Un moment à regarder.",
    communTitre: "Un moment commun demain",
    communCorps: "Vous y êtes tous les deux.",
    finTitre: "Un moment commun finit demain",
    finCorps: "Une transition à préparer à deux.",
    autreTitre: "Un changement de leur côté",
    autreCorps: "Quelque chose bouge chez eux.",
  },
  en: {
    periodeTitre: "A period opens tomorrow",
    sortieTitre: "A period ends tomorrow",
    periodeCorps: "It's on your timeline.",
    basculeTitre: "A turning point tomorrow",
    basculeCorps: "These are rare.",
    moisTitre: "Your month",
    moisCorps: "{n} moments to look at.",
    moisCorpsUn: "One moment to look at.",
    communTitre: "A shared moment tomorrow",
    communCorps: "You're both in it.",
    finTitre: "A shared moment ends tomorrow",
    finCorps: "A transition to prepare together.",
    autreTitre: "A shift on their side",
    autreCorps: "Something is moving for them.",
  },
  es: {
    periodeTitre: "Mañana se abre un periodo",
    sortieTitre: "Mañana termina un periodo",
    periodeCorps: "Está en tu línea de tiempo.",
    basculeTitre: "Mañana, un punto de inflexión",
    basculeCorps: "Son poco frecuentes.",
    moisTitre: "Tu mes",
    moisCorps: "{n} momentos que mirar.",
    moisCorpsUn: "Un momento que mirar.",
    communTitre: "Mañana, un momento común",
    communCorps: "Los dos estáis en ello.",
    finTitre: "Un momento común acaba mañana",
    finCorps: "Una transición que preparar juntos.",
    autreTitre: "Un cambio de su lado",
    autreCorps: "Algo se mueve en su vida.",
  },
  de: {
    periodeTitre: "Morgen beginnt eine Phase",
    sortieTitre: "Morgen endet eine Phase",
    periodeCorps: "Sie steht auf deiner Timeline.",
    basculeTitre: "Morgen ein Wendepunkt",
    basculeCorps: "Diese sind selten.",
    moisTitre: "Dein Monat",
    moisCorps: "{n} Momente zum Ansehen.",
    moisCorpsUn: "Ein Moment zum Ansehen.",
    communTitre: "Morgen ein gemeinsamer Moment",
    communCorps: "Ihr seid beide darin.",
    finTitre: "Gemeinsamer Moment endet morgen",
    finCorps: "Ein Übergang, gemeinsam vorzubereiten.",
    autreTitre: "Eine Änderung auf ihrer Seite",
    autreCorps: "Bei ihnen bewegt sich etwas.",
  },
  it: {
    periodeTitre: "Domani si apre un periodo",
    sortieTitre: "Domani finisce un periodo",
    periodeCorps: "È sulla tua timeline.",
    basculeTitre: "Domani, una svolta",
    basculeCorps: "Sono rare.",
    moisTitre: "Il tuo mese",
    moisCorps: "{n} momenti da guardare.",
    moisCorpsUn: "Un momento da guardare.",
    communTitre: "Domani, un momento comune",
    communCorps: "Ci siete dentro entrambi.",
    finTitre: "Domani finisce un momento comune",
    finCorps: "Una transizione da preparare in due.",
    autreTitre: "Un cambiamento dal loro lato",
    autreCorps: "Qualcosa si muove da loro.",
  },
  pt: {
    periodeTitre: "Amanhã abre um período",
    sortieTitre: "Amanhã termina um período",
    periodeCorps: "Está na tua linha do tempo.",
    basculeTitre: "Amanhã, uma viragem",
    basculeCorps: "São raras.",
    moisTitre: "O teu mês",
    moisCorps: "{n} momentos para ver.",
    moisCorpsUn: "Um momento para ver.",
    communTitre: "Amanhã, um momento comum",
    communCorps: "Estão os dois nele.",
    finTitre: "Amanhã acaba um momento comum",
    finCorps: "Uma transição a preparar a dois.",
    autreTitre: "Uma mudança do lado deles",
    autreCorps: "Algo se move do lado deles.",
  },
  nl: {
    periodeTitre: "Morgen begint een periode",
    sortieTitre: "Morgen eindigt een periode",
    periodeCorps: "Ze staat op je tijdlijn.",
    basculeTitre: "Morgen een omslagpunt",
    basculeCorps: "Die zijn zeldzaam.",
    moisTitre: "Jouw maand",
    moisCorps: "{n} momenten om te bekijken.",
    moisCorpsUn: "Eén moment om te bekijken.",
    communTitre: "Morgen een gedeeld moment",
    communCorps: "Jullie zitten er allebei in.",
    finTitre: "Gedeeld moment eindigt morgen",
    finCorps: "Een overgang om samen voor te bereiden.",
    autreTitre: "Een verschuiving bij hen",
    autreCorps: "Bij hen beweegt er iets.",
  },
  ja: {
    periodeTitre: "明日、新しい期間が始まります",
    sortieTitre: "明日、期間が終わります",
    periodeCorps: "タイムラインで確認できます。",
    basculeTitre: "明日、転換点があります",
    basculeCorps: "めったにありません。",
    moisTitre: "今月のあなた",
    moisCorps: "見どころが{n}つあります。",
    moisCorpsUn: "見どころが1つあります。",
    communTitre: "明日、ふたりに共通の時期",
    communCorps: "どちらもその中にいます。",
    finTitre: "明日、共通の時期が終わります",
    finCorps: "ふたりで備える切り替えです。",
    autreTitre: "相手の側で変化があります",
    autreCorps: "相手の側で何かが動いています。",
  },
  zh: {
    periodeTitre: "明天开启一个新阶段",
    sortieTitre: "明天一个阶段结束",
    periodeCorps: "已在你的时间线上。",
    basculeTitre: "明天是一个转折点",
    basculeCorps: "这样的时刻很少见。",
    moisTitre: "你的这个月",
    moisCorps: "有 {n} 个值得一看的时刻。",
    moisCorpsUn: "有一个值得一看的时刻。",
    communTitre: "明天有一个共同的时刻",
    communCorps: "你们都身在其中。",
    finTitre: "明天一个共同的时刻结束",
    finCorps: "这是需要两人一起准备的转换。",
    autreTitre: "对方那边有变化",
    autreCorps: "对方那边有些东西在动。",
  },
  ar: {
    periodeTitre: "تبدأ فترة جديدة غدًا",
    sortieTitre: "تنتهي فترة غدًا",
    periodeCorps: "ستجدها في مخططك الزمني.",
    basculeTitre: "غدًا نقطة تحوّل",
    basculeCorps: "هذه اللحظات نادرة.",
    moisTitre: "شهرك",
    moisCorps: "{n} لحظات تستحق النظر.",
    moisCorpsUn: "لحظة واحدة تستحق النظر.",
    communTitre: "غداً، لحظة مشتركة",
    communCorps: "كلاكما فيها.",
    finTitre: "غداً تنتهي لحظة مشتركة",
    finCorps: "انتقال تُحضّرانه معاً.",
    autreTitre: "تغيّر من جهتهم",
    autreCorps: "شيء يتحرّك من جهتهم.",
  },
};

/**
 * Ecrit le titre et le corps. La langue vient du jeton, elle-meme choisie dans
 * l app ; on retombe sur l anglais plutot que sur le francais, parce qu une
 * personne dont la langue nous manque a plus de chances de lire l anglais.
 */
/**
 * Ecrit le corps d une notification de bascule, avec ce qui permet de decider :
 * le domaine touche, la duree, et l intensite.
 *
 * « Une periode s ouvre » ne permet rien. « Carriere · 28 jours · marque »
 * permet de reorganiser sa semaine, ou de ne rien faire en connaissance de
 * cause.
 *
 * Trois faits, separes par des points medians. Pas de phrase : sur l ecran
 * verrouille, une enumeration se lit d un coup d oeil, une phrase se lit.
 */
export function ecrireBascule(
  b: { sens: "entree" | "sortie"; duree_jours?: number | null; maison?: number | null; score: number },
  locale: string | null | undefined,
): { titre: string; corps: string } {
  const t = T[(locale ?? "en").slice(0, 2).toLowerCase()] ?? T.en;
  const lang = (locale ?? "en").slice(0, 2).toLowerCase();

  const morceaux: string[] = [];

  const domaine = b.maison ? nomMaison(b.maison, locale) : null;
  if (domaine) morceaux.push(domaine);

  if (b.duree_jours && b.duree_jours > 0) morceaux.push(duree(b.duree_jours, lang));

  // L intensite ne se dit qu au-dela de l ordinaire : l annoncer a chaque fois
  // la viderait de son sens.
  if (b.score >= 3) morceaux.push(INTENSITE[lang]?.[b.score >= 4 ? 1 : 0] ?? INTENSITE.en[b.score >= 4 ? 1 : 0]);

  return {
    titre: b.sens === "entree" ? t.periodeTitre : t.sortieTitre,
    corps: morceaux.join(" · ") || t.periodeCorps,
  };
}

/** Une duree lisible : des jours, puis des semaines, puis des mois. */
function duree(jours: number, lang: string): string {
  const u = UNITES[lang] ?? UNITES.en;
  if (jours <= 21) return u.jours.replace("{n}", String(jours));
  if (jours <= 70) return u.semaines.replace("{n}", String(Math.round(jours / 7)));
  return u.mois.replace("{n}", String(Math.round(jours / 30)));
}

const UNITES: Record<string, { jours: string; semaines: string; mois: string }> = {
  fr: { jours: "{n} jours", semaines: "{n} semaines", mois: "{n} mois" },
  en: { jours: "{n} days", semaines: "{n} weeks", mois: "{n} months" },
  es: { jours: "{n} días", semaines: "{n} semanas", mois: "{n} meses" },
  de: { jours: "{n} Tage", semaines: "{n} Wochen", mois: "{n} Monate" },
  it: { jours: "{n} giorni", semaines: "{n} settimane", mois: "{n} mesi" },
  pt: { jours: "{n} dias", semaines: "{n} semanas", mois: "{n} meses" },
  nl: { jours: "{n} dagen", semaines: "{n} weken", mois: "{n} maanden" },
  ja: { jours: "{n}日", semaines: "{n}週間", mois: "{n}か月" },
  zh: { jours: "{n} 天", semaines: "{n} 周", mois: "{n} 个月" },
  ar: { jours: "{n} يوم", semaines: "{n} أسابيع", mois: "{n} أشهر" },
};

/** Deux crans seulement : « marque » et « rare ». Trois seraient du bruit. */
const INTENSITE: Record<string, [string, string]> = {
  fr: ["marqué", "rare"], en: ["marked", "rare"], es: ["marcado", "raro"],
  de: ["deutlich", "selten"], it: ["marcato", "raro"], pt: ["marcado", "raro"],
  nl: ["uitgesproken", "zeldzaam"], ja: ["強め", "まれ"], zh: ["明显", "罕见"],
  ar: ["واضح", "نادر"],
};

export function ecrire(
  n: Notification,
  locale: string | null | undefined,
): { titre: string; corps: string } {
  const t = T[(locale ?? "en").slice(0, 2).toLowerCase()] ?? T.en;

  if (n.nature === "mois") {
    const compte = n.compte ?? 1;
    return {
      titre: t.moisTitre,
      corps: compte === 1 ? t.moisCorpsUn : t.moisCorps.replace("{n}", String(compte)),
    };
  }

  // Ce qui se passe entre deux personnes. Meme forme que ecrireBascule : le
  // domaine d abord, la mention ensuite, separes par un point median. Sur un
  // ecran verrouille, « Couple · Une transition a preparer a deux. » se lit
  // d un coup d oeil et permet de decider ; « Un moment commun » seul ne
  // permet rien.
  if (n.nature === "connexion") {
    const paire =
      n.importance === "commun_fin"
        ? [t.finTitre, t.finCorps]
        : n.importance === "bascule_autre"
          ? [t.autreTitre, t.autreCorps]
          : [t.communTitre, t.communCorps];

    // Le domaine vient du moteur. Absent, on ne le remplace par rien : une
    // maison devinee serait une donnee fabriquee.
    const domaine = n.domaine ? nomMaison(n.domaine, locale) : null;
    return {
      titre: paire[0],
      corps: domaine ? `${domaine} · ${paire[1]}` : paire[1],
    };
  }

  if (n.importance === "bascule") {
    return { titre: t.basculeTitre, corps: t.basculeCorps };
  }

  return { titre: t.periodeTitre, corps: t.periodeCorps };
}

/** Les langues couvertes, pour les tests. */
export const LANGUES = Object.keys(T);
