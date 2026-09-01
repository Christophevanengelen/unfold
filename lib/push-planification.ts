/**
 * Qui prevenir, de quoi, et quand.
 *
 * Fonction pure : elle ne lit pas la base, n appelle rien, ne connait pas
 * l heure. On lui donne la reponse du moteur et une date, elle rend une liste.
 * C est ce qui permet de la mettre a l epreuve sur des annees entieres en une
 * seconde, plutot que d attendre qu une vraie periode s ouvre pour savoir si le
 * choix est bon.
 *
 * Ce que la mesure a montre, et qui a decide du reglage : en ne retenant que
 * les periodes de niveau 3 remarquables, l app se tairait pendant trois mois
 * d affilee. La regle ecrite au depart — une par semaine au maximum — protege
 * donc contre un probleme qui n existe pas. Le risque reel est le silence, pas
 * le harcelement. On descend au niveau 4 pour tenir un rythme d environ une
 * notification tous les dix jours par defaut. Mais le bon rythme n est pas le
 * meme pour tout le monde, et ce n est pas a nous d en decider : la cadence est
 * un reglage. Trois crans, du plus rare au plus dense, et le choix survit a une
 * reinstallation puisqu il vit a cote du jeton, pas dans le telephone.
 *
 * Rien ici n est collectif. L avis de debut de mois lui-meme ne part que si le
 * mois de la personne contient quelque chose, et dit combien : deux personnes
 * ouvrant l app le meme matin ne recoivent pas le meme message, et beaucoup
 * n en recoivent aucun. Une notification identique pour tout le monde serait un
 * envoi groupe deguise en attention.
 */

/** Une periode telle que le moteur la rend. */
/**
 * A quelle frequence cette personne veut etre prevenue.
 *
 *   essentiel — seulement les grands basculements. Environ 4 par an.
 *   normal    — plus les moments remarquables. Environ 25 par an. Defaut.
 *   tout      — toutes les periodes courtes. Environ 50 par an.
 */
/**
 * « aucune » coupe l envoi.
 *
 * L app permettait d ACTIVER les notifications et jamais de les arreter : une
 * fois la permission accordee, la ligne du reglage devenait inerte. iOS ne
 * permet pas de revoquer une permission depuis l app, mais rien n oblige a
 * ENVOYER. C est ce que « desactiver » veut dire pour la personne, et il fallait
 * le lui donner.
 */
export type Cadence = "aucune" | "essentiel" | "normal" | "tout";

export type PeriodeMoteur = {
  level: number;
  sign: string;
  ruler?: string;
  duration?: number;
  durationUnit?: string;
  startDate: string;
  endDate: string;
  subPeriods?: PeriodeMoteur[];
  isPeakPeriod?: boolean;
  isLoosingOfBond?: boolean;
  isCulmination?: boolean;
};

export type Notification = {
  /**
   * Identite stable de cette notification. C est elle qui rend l envoi
   * idempotent : le cron peut tourner cent fois, la personne ne recoit rien
   * deux fois. Elle ne doit donc dependre que du contenu, jamais de l heure a
   * laquelle on l a calculee.
   */
  cle: string;
  nature: "periode" | "mois";
  ecran: "timeline" | "monthly";
  /** Sujet de regroupement, pour ne pas empiler deux avis du meme genre. */
  regroupement: string;
  /** Ce qui sert a ecrire le texte, pas le texte lui-meme. */
  signe?: string;
  duree?: number;
  uniteDuree?: string;
  /** Pour l avis de debut de mois : combien de moments dans CE mois-la. */
  compte?: number;
  importance: "bascule" | "sommet" | "mois";
  /** Le jour ou la periode commence, en AAAA-MM-JJ. */
  jour: string;
};

const JOUR = 86_400_000;

/** Aplatit l arbre des periodes. */
function aplatir(periodes: PeriodeMoteur[], sortie: PeriodeMoteur[] = []): PeriodeMoteur[] {
  for (const p of periodes) {
    sortie.push(p);
    if (p.subPeriods?.length) aplatir(p.subPeriods, sortie);
  }
  return sortie;
}

/**
 * Choisit ce qu on annoncerait a cette personne le jour dit.
 *
 * `preavis` : on previent la veille du debut, pas le jour meme. Une periode
 * qu on apprend le matin ou elle commence, c est une information qu on subit ;
 * la veille, c est une information dont on peut faire quelque chose.
 */
export function planifier(
  releasing: { periods?: PeriodeMoteur[] } | null | undefined,
  aujourdHui: Date,
  options: { preavis?: number; cadence?: Cadence } = {},
): Notification[] {
  const preavis = options.preavis ?? 1;
  const cadence = options.cadence ?? "normal";
  const sorties: Notification[] = [];

  // Rien a envoyer : la personne a coupe.
  if (cadence === "aucune") return sorties;

  const toutes = releasing?.periods?.length ? aplatir(releasing.periods) : [];

  /** Ce qui merite d etre annonce, selon la cadence choisie. */
  const digneDInteret = (p: PeriodeMoteur) => {
    if (p.level !== 3 && p.level !== 4) return false;
    const remarquable = Boolean(p.isLoosingOfBond || p.isPeakPeriod || p.isCulmination);
    if (cadence === "tout") return true;
    if (cadence === "essentiel") return p.level === 3 && remarquable;
    return p.level === 3 || remarquable;
  };

  // ── Le debut du mois ───────────────────────────────────────────────────────
  // Personnel, pas collectif : on ne previent que si le mois de CETTE personne
  // contient reellement quelque chose, et on dit combien. Un mois vide ne
  // produit aucune notification — mieux vaut le silence qu un envoi groupe
  // deguise en attention.
  if (aujourdHui.getUTCDate() === 1) {
    const mois = aujourdHui.toISOString().slice(0, 7);
    const dansLeMois = toutes.filter(
      (p) => digneDInteret(p) && p.startDate.slice(0, 7) === mois,
    );
    if (dansLeMois.length > 0) {
      dansLeMois.sort((x, y) => x.startDate.localeCompare(y.startDate));
      sorties.push({
        cle: `mois:${mois}`,
        nature: "mois",
        ecran: "monthly",
        regroupement: "mois",
        signe: dansLeMois[0].sign,
        compte: dansLeMois.length,
        importance: "mois",
        jour: `${mois}-01`,
      });
    }
  }

  // ── Les periodes qui s ouvrent ─────────────────────────────────────────────
  {
    const cible = new Date(aujourdHui.getTime() + preavis * JOUR).toISOString().slice(0, 10);

    for (const p of toutes) {
      // Les niveaux 1 et 2 durent des annees : leur debut est rare et leur
      // annonce n aiderait personne a organiser sa semaine. Les niveaux 3 et 4
      // durent des jours ou des semaines, c est l echelle utile.
      if (!digneDInteret(p)) continue;
      if (p.startDate.slice(0, 10) !== cible) continue;

      sorties.push({
        cle: `zr${p.level}:${p.startDate.slice(0, 10)}:${p.sign}`,
        nature: "periode",
        ecran: "timeline",
        regroupement: "periode",
        signe: p.sign,
        duree: p.duration,
        uniteDuree: p.durationUnit,
        importance: p.isLoosingOfBond ? "bascule" : "sommet",
        jour: p.startDate.slice(0, 10),
      });
    }
  }

  // Si plusieurs choses tombent le meme jour, on n en envoie qu une : celle qui
  // compte le plus. Deux notifications le meme matin, c est une de trop.
  sorties.sort((a, b) => rang(b) - rang(a));
  return sorties.slice(0, 1);
}

function rang(n: Notification): number {
  if (n.importance === "bascule") return 3;
  if (n.importance === "sommet") return 2;
  return 1;
}

/**
 * Le plancher d espacement, en jours, selon la cadence. Meme en mode « tout »,
 * on n envoie pas deux matins de suite : deux notifications rapprochees se
 * devaluent l une l autre.
 */
export const ESPACEMENT_MINIMUM: Record<Cadence, number> = {
  aucune: Number.POSITIVE_INFINITY,
  essentiel: 20,
  normal: 6,
  tout: 2,
};
