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
};

const T: Record<string, Textes> = {
  fr: {
    periodeTitre: "Une période s'ouvre demain",
    periodeCorps: "Elle est sur ta timeline.",
    basculeTitre: "Un basculement demain",
    basculeCorps: "Ces moments-là sont rares.",
    moisTitre: "Ton mois",
    moisCorps: "{n} moments à regarder.",
    moisCorpsUn: "Un moment à regarder.",
  },
  en: {
    periodeTitre: "A period opens tomorrow",
    periodeCorps: "It's on your timeline.",
    basculeTitre: "A turning point tomorrow",
    basculeCorps: "These are rare.",
    moisTitre: "Your month",
    moisCorps: "{n} moments to look at.",
    moisCorpsUn: "One moment to look at.",
  },
  es: {
    periodeTitre: "Mañana se abre un periodo",
    periodeCorps: "Está en tu línea de tiempo.",
    basculeTitre: "Mañana, un punto de inflexión",
    basculeCorps: "Son poco frecuentes.",
    moisTitre: "Tu mes",
    moisCorps: "{n} momentos que mirar.",
    moisCorpsUn: "Un momento que mirar.",
  },
  de: {
    periodeTitre: "Morgen beginnt eine Phase",
    periodeCorps: "Sie steht auf deiner Timeline.",
    basculeTitre: "Morgen ein Wendepunkt",
    basculeCorps: "Diese sind selten.",
    moisTitre: "Dein Monat",
    moisCorps: "{n} Momente zum Ansehen.",
    moisCorpsUn: "Ein Moment zum Ansehen.",
  },
  it: {
    periodeTitre: "Domani si apre un periodo",
    periodeCorps: "È sulla tua timeline.",
    basculeTitre: "Domani, una svolta",
    basculeCorps: "Sono rare.",
    moisTitre: "Il tuo mese",
    moisCorps: "{n} momenti da guardare.",
    moisCorpsUn: "Un momento da guardare.",
  },
  pt: {
    periodeTitre: "Amanhã abre um período",
    periodeCorps: "Está na tua linha do tempo.",
    basculeTitre: "Amanhã, uma viragem",
    basculeCorps: "São raras.",
    moisTitre: "O teu mês",
    moisCorps: "{n} momentos para ver.",
    moisCorpsUn: "Um momento para ver.",
  },
  nl: {
    periodeTitre: "Morgen begint een periode",
    periodeCorps: "Ze staat op je tijdlijn.",
    basculeTitre: "Morgen een omslagpunt",
    basculeCorps: "Die zijn zeldzaam.",
    moisTitre: "Jouw maand",
    moisCorps: "{n} momenten om te bekijken.",
    moisCorpsUn: "Eén moment om te bekijken.",
  },
  ja: {
    periodeTitre: "明日、新しい期間が始まります",
    periodeCorps: "タイムラインで確認できます。",
    basculeTitre: "明日、転換点があります",
    basculeCorps: "めったにありません。",
    moisTitre: "今月のあなた",
    moisCorps: "見どころが{n}つあります。",
    moisCorpsUn: "見どころが1つあります。",
  },
  zh: {
    periodeTitre: "明天开启一个新阶段",
    periodeCorps: "已在你的时间线上。",
    basculeTitre: "明天是一个转折点",
    basculeCorps: "这样的时刻很少见。",
    moisTitre: "你的这个月",
    moisCorps: "有 {n} 个值得一看的时刻。",
    moisCorpsUn: "有一个值得一看的时刻。",
  },
  ar: {
    periodeTitre: "تبدأ فترة جديدة غدًا",
    periodeCorps: "ستجدها في مخططك الزمني.",
    basculeTitre: "غدًا نقطة تحوّل",
    basculeCorps: "هذه اللحظات نادرة.",
    moisTitre: "شهرك",
    moisCorps: "{n} لحظات تستحق النظر.",
    moisCorpsUn: "لحظة واحدة تستحق النظر.",
  },
};

/**
 * Ecrit le titre et le corps. La langue vient du jeton, elle-meme choisie dans
 * l app ; on retombe sur l anglais plutot que sur le francais, parce qu une
 * personne dont la langue nous manque a plus de chances de lire l anglais.
 */
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

  if (n.importance === "bascule") {
    return { titre: t.basculeTitre, corps: t.basculeCorps };
  }

  return { titre: t.periodeTitre, corps: t.periodeCorps };
}

/** Les langues couvertes, pour les tests. */
export const LANGUES = Object.keys(T);
