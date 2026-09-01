/**
 * Le moteur d astrologie, simule.
 *
 * ─── POURQUOI SIMULER PLUTOT QUE D APPELER LE VRAI MOTEUR ──────────────────
 *
 * Le moteur de Marie-Ange met 30 a 120 secondes a repondre au premier appel
 * pour un theme qu il n a jamais vu, et c est un service TIERS : il tombe, il
 * ralentit, il change. Une suite de parcours branchee dessus met dix minutes
 * quand tout va bien et echoue au hasard quand tout ne va pas bien. Elle serait
 * desactivee dans la semaine, et emporterait avec elle les quatre parcours
 * qu elle protege.
 *
 * Ce qu on teste ici n est pas le moteur. C est la CHAINE qui va de ses
 * donnees jusqu a l ecran : l adaptateur, le magasin, les caches, le rendu, et
 * surtout les GESTES — le bouton qui doit declencher quelque chose. Les quatre
 * defauts du 01/09/2026 etaient tous dans cette chaine, aucun dans le moteur.
 *
 * Le vrai moteur reste teste par e2e/moteur-reel.spec.ts, hors de la suite
 * rapide (`npm run test:e2e:moteur`).
 *
 * ─── CE QUI EST ANCRE SUR QUOI, ET POURQUOI CA COMPTE ──────────────────────
 *
 * Les periodes du PASSE sont ancrees sur la DATE DE NAISSANCE (naissance + 6
 * ans, + 14 ans...). C est ce qui rend le parcours 2 possible : corriger sa
 * date de naissance doit produire une timeline differente, et pas seulement un
 * nouvel appel reseau.
 *
 * La periode EN COURS est ancree sur AUJOURD HUI. C est ce qui empeche la suite
 * de pourrir : un jeu de donnees fige a des dates absolues aurait cesse d avoir
 * une periode courante quelques mois plus tard, et le guide — dont le troisieme
 * pas designe la periode en cours — aurait commence a echouer sans que personne
 * comprenne pourquoi.
 */

const JOUR = 86_400_000;

export interface Naissance {
  nickname: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  placeOfBirth: string;
}

/** La personne de reference des tests. Bruxelles, 1985. */
export const NAISSANCE: Naissance = {
  nickname: "Test",
  birthDate: "1985-04-12",
  birthTime: "08:30",
  latitude: 50.8503,
  longitude: 4.3517,
  timezone: "Europe/Brussels",
  placeOfBirth: "Brussels",
};

function jour(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function plusJours(base: Date, n: number): Date {
  return new Date(base.getTime() + n * JOUR);
}

function plusAnnees(base: Date, n: number): Date {
  const d = new Date(base.getTime());
  d.setUTCFullYear(d.getUTCFullYear() + n);
  return d;
}

/** Minuit UTC aujourd hui — stable pendant toute la duree d un test. */
function aujourdHui(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Les boudins de la vie entiere (endpoint toctoc-app-short)
// ─────────────────────────────────────────────────────────────────────────────

interface Boudin {
  id: string;
  cat: "transit" | "zr" | "eclipse" | "station";
  s: string;
  e: string;
  sc: number;
  lbl: string;
  col: string;
  tc: string[];
  th: number[];
  nh?: number;
  asp?: string;
  tp?: string;
  np?: string;
  lvl?: number;
  pSign?: string;
  lotType?: string[];
  markers?: string[];
  gid?: string;
}

function transit(
  id: string,
  debut: Date,
  fin: Date,
  score: number,
  planete: string,
  aspect: string,
  natal: string,
): Boudin {
  return {
    id,
    cat: "transit",
    s: jour(debut),
    e: jour(fin),
    sc: score,
    // Le libelle a la forme exacte que rend le moteur : lib/event-labels.ts en
    // tire le titre affiche, et un libelle approximatif donnerait un titre de
    // repli qu aucun selecteur ne pourrait viser.
    lbl: `${planete} ${aspect} natal ${natal}`,
    gid: `${planete}_${aspect}_${natal}`,
    asp: aspect,
    tp: planete,
    np: natal,
    col: "#A697FF",
    tc: ["#A697FF"],
    th: [6],
    nh: 6,
  };
}

function zr(
  id: string,
  debut: Date,
  fin: Date,
  score: number,
  signe: string,
  marqueurs?: string[],
): Boudin {
  return {
    id,
    cat: "zr",
    s: jour(debut),
    e: jour(fin),
    sc: score,
    lbl: `ZR L2 — ${signe} (fortune)`,
    gid: `zr_fortune_L2_${signe}`,
    col: "#AAD681",
    tc: ["#AAD681"],
    th: [1],
    lvl: 2,
    pSign: signe,
    lotType: ["fortune"],
    markers: marqueurs,
  };
}

/**
 * La reponse du moteur pour la vie entiere.
 *
 * `toctoc-app-short` en rend deux mille pour un theme reel. On en pose une
 * trentaine : c est assez pour que la colonne ait de quoi montrer a toutes les
 * hauteurs ou les tests regardent, et assez peu pour que le rendu soit
 * instantane.
 */
export function reponseVie(naissance: { birthDate: string }): unknown {
  const naiss = new Date(`${naissance.birthDate}T00:00:00Z`);
  const auj = aujourdHui();

  const boudins: Boudin[] = [];

  // Le passe, ancre sur la naissance. Corriger la date de naissance deplace
  // toutes ces periodes — c est ce que le parcours 2 verifie.
  const ancres = [6, 11, 17, 23, 29, 34];
  ancres.forEach((n, i) => {
    const debut = plusAnnees(naiss, n);
    const fin = plusAnnees(naiss, n + 1);
    // Un « pivot majeur » au milieu : c est le seul titre du produit qui ne
    // depende ni de la planete ni de l aspect, donc le plus stable a viser.
    boudins.push(zr(`vie_${n}`, debut, fin, 3, "Virgo", i === 3 ? ["LB"] : undefined));
    boudins.push(
      transit(
        `vie_t_${n}`,
        plusJours(debut, 40),
        plusJours(debut, 120),
        2 + (i % 2),
        "Saturn",
        "trine",
        "Venus",
      ),
    );
  });

  // LA PERIODE EN COURS. Elle enjambe aujourd hui, donc `isCurrent` est vrai et
  // le troisieme pas du guide a une cible. Sa planete depend de la date de
  // naissance : voir planeteCourante().
  boudins.push(
    transit(
      "courant",
      plusJours(auj, -20),
      plusJours(auj, 25),
      3,
      planeteCourante(naissance.birthDate).planete,
      "conjunction",
      "Sun",
    ),
  );

  // Le passe proche et l avenir proche, pour que la colonne ne soit pas vide
  // au-dessus et au-dessous de la periode courante.
  boudins.push(
    transit("passe_1", plusJours(auj, -420), plusJours(auj, -360), 3, "Uranus", "opposition", "Mars"),
    transit("passe_2", plusJours(auj, -200), plusJours(auj, -150), 2, "Jupiter", "square", "Moon"),
    transit("futur_1", plusJours(auj, 80), plusJours(auj, 130), 2, "Jupiter", "trine", "Venus"),
    transit("futur_2", plusJours(auj, 260), plusJours(auj, 320), 3, "Pluto", "square", "Moon"),
    // Se termine AVANT aujourd hui : le jeu d essai ne doit avoir qu UNE
    // periode en cours, sinon les tests ne peuvent plus la designer sans
    // ambiguite.
    zr("zr_recent", plusJours(auj, -300), plusJours(auj, -40), 2, "Leo"),
  );

  return {
    success: true,
    data: {
      success: true,
      person: { name: "Test", birthDate: naissance.birthDate },
      houseColors: {
        "1": "#AAD681", "2": "#FED857", "3": "#FFB898", "4": "#F17E7A",
        "5": "#F375CB", "6": "#A697FF", "7": "#FF7CA4", "8": "#ECBA3B",
        "9": "#FF9040", "10": "#89A4FF", "11": "#9CEAED", "12": "#C797FF",
      },
      boudins,
      total: boudins.length,
      computeTimeSeconds: 0,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// La reponse de l annee (endpoint toctoc-year)
// ─────────────────────────────────────────────────────────────────────────────

function cleMois(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * La reponse rapide.
 *
 * DEUX CONTRAINTES, apprises en la faisant echouer.
 *
 * 1. lib/momentum-store.tsx leve « No signals found » si l adaptateur rend zero
 *    phase, et cet echec bascule l ecran entier sur « connexion perdue ».
 *    Chaque mois doit donc porter au moins un evenement.
 *
 * 2. Elle arrive AVANT la vie entiere, et la timeline s en sert en attendant.
 *    Pendant cette poignee de secondes, les capsules viennent d ICI. Si deux
 *    d entre elles enjambent aujourd hui, il y a deux periodes « en cours »
 *    pendant un instant puis une seule : un test qui designe la periode
 *    courante echoue alors une fois sur cinq, sans rien avoir a voir avec ce
 *    qu il teste. Les trois groupes ci-dessous sont donc explicitement dates :
 *    un passe, UN SEUL courant, un a venir.
 */
export function reponseAnnee(naissance: { birthDate: string }): unknown {
  const auj = aujourdHui();
  const mois: unknown[] = [];

  const passe = {
    label: "ZR L2 — Virgo (fortune) · Forecasting period · toc toc toc",
    score: 35,
    category: "zr",
    periodStart: jour(plusJours(auj, -400)),
    periodEnd: jour(plusJours(auj, -60)),
  };
  const courant = {
    label: `${planeteCourante(naissance.birthDate).planete} conjunct natal Sun`,
    score: 78,
    category: "transit",
    aspect: "conjunction",
    exactDate: jour(auj),
  };
  const aVenir = {
    label: "ZR L2 — Leo (spirit) · Forecasting period · toc toc",
    score: 26,
    category: "zr",
    lotType: "spirit",
    periodStart: jour(plusJours(auj, 60)),
    periodEnd: jour(plusJours(auj, 400)),
  };

  for (let i = -12; i <= 12; i++) {
    const d = new Date(Date.UTC(auj.getUTCFullYear(), auj.getUTCMonth() + i, 1));
    mois.push({
      month: cleMois(d),
      year: d.getUTCFullYear(),
      monthNum: d.getUTCMonth() + 1,
      isPast: i < 0,
      isCurrentMonth: i === 0,
      zrScore: 90,
      transitScore: 40,
      totalScore: 130,
      topEvents: [i < 0 ? passe : i === 0 ? courant : aVenir],
    });
  }

  return {
    success: true,
    data: {
      success: true,
      person: { name: "Test", birthDate: naissance.birthDate },
      window: { startDate: jour(plusAnnees(auj, -1)), endDate: jour(plusAnnees(auj, 1)) },
      fortuneInfo: { sign: "Virgo", isDayChart: true, angularSigns: [], natalSigns: {} },
      currentMonth: {
        month: cleMois(auj),
        totalScore: 130,
        zrScore: 90,
        transitScore: 40,
        topEvents: [courant],
      },
      peakUpcomingMonths: [],
      years: [],
      months: mois,
      computeTimeSeconds: 0,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// La periode en cours, et pourquoi elle depend de la date de naissance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le vrai moteur rend un CONTENU different pour une naissance differente. Sans
 * cela, on ne peut pas distinguer « la timeline a ete recalculee » de « le
 * cache d affichage a ete resservi » — et c est exactement la troisieme cause
 * du defaut du 01/09/2026 : les caches etaient globaux, l ancienne timeline
 * etait resservie pendant le recalcul, et definitivement si le moteur echouait.
 *
 * On fait donc la meme chose, en plus simple : la planete de la periode en
 * cours depend de l annee de naissance. Un test peut alors LIRE a l ecran de
 * quelle naissance vient ce qui est affiche.
 */
function planeteCourante(birthDate: string): { planete: string; titre: string } {
  return Number(birthDate.slice(0, 4)) < 1970
    ? { planete: "Pluto", titre: TITRE_AVANT_1970 }
    : { planete: "Saturn", titre: TITRE_APRES_1970 };
}

/**
 * Les deux titres que le produit affiche pour la periode EN COURS.
 *
 * Ils viennent de lib/event-labels.ts — Saturne et Pluton en conjonction — et
 * non de chaines inventees ici : si le produit renomme un de ces evenements, le
 * test doit echouer et non passer a cote.
 */
export const TITRE_APRES_1970 = "New foundations";
export const TITRE_AVANT_1970 = "Deep transformation";

/** Le titre attendu pour la personne de reference (1985). */
export const TITRE_PERIODE_COURANTE = TITRE_APRES_1970;
