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

  if (n.importance === "bascule") {
    return { titre: t.basculeTitre, corps: t.basculeCorps };
  }

  return { titre: t.periodeTitre, corps: t.periodeCorps };
}

/** Les langues couvertes, pour les tests. */
export const LANGUES = Object.keys(T);
