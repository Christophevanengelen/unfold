/**
 * LA MAISON DE CHAQUE BOUDIN — proposition, releve du 02/09/2026.
 *
 * La regle de silence (REPORTING-REGLES.md) exige de savoir, pour CHAQUE
 * boudin, quelle maison il concerne : sans maison, pas de convergence, donc
 * pas de carte. Seuls les `zr` portent `periodHousePlacement`. Ce module
 * resout les sept autres familles SANS un seul appel reseau supplementaire.
 *
 * Aucun calcul d astrologie n est refait : on ne fait que RELIRE des valeurs
 * que le moteur de Marie-Ange a deja mises dans le paquet `toctoc-year`.
 *
 * ─── LE SEUL POSTULAT, ET SA PREUVE ─────────────────────────────────────────
 *
 * Le moteur travaille en SIGNES ENTIERS depuis le signe de l Ascendant :
 *     maison(signe) = ((indexSigne - indexAscendant + 12) % 12) + 1
 *
 * Ce n est pas une hypothese. Verifie le 02/09/2026 sur 4 themes :
 *   - `maisonDuSigne(periodSign) === periodHousePlacement.house` : 107/107 ;
 *   - `maisonDuSigne(profectedSign) === profectedHouse` : 24/24 ;
 *   - `maisonDuSigne(rulerNatalSign) === rulerNatalHouse` : 12/12 ;
 *   - maison calculee vs `nh` de toctoc-app-short : 1806 exactes, 0 fausse.
 *
 * ATTENTION : les cusps de `/api/chart-data` sont en Placidus (61.7°, 81.2°,
 * 100.6°, 120.1°, 160.6°... : espacement irregulier). Les utiliser comme
 * frontieres de maisons donnerait des maisons FAUSSES par rapport au moteur.
 * On ne lit de chart-data que `planets.As[0]`, et uniquement pour son SIGNE.
 *
 * ─── L ASCENDANT EST DEJA DANS LE PAQUET ────────────────────────────────────
 *
 * Mieux : on n a meme pas besoin de chart-data. Chaque boudin `zr` donne un
 * couple (periodSign, periodHousePlacement.house), chaque `profection_year_change`
 * un couple (profectedSign, profectedHouse), chaque `anniversary` deux couples.
 * Chaque couple resout l Ascendant :
 *     indexAscendant = (indexSigne - (maison - 1) + 12) % 12
 * Mesure sur 4 themes : 34 a 37 temoins par theme, vote UNANIME a chaque fois.
 */

export const SIGNES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

/**
 * Domiciles TRADITIONNELS. Le moteur n attribue aucune maison regie a Uranus,
 * Neptune ni Pluton — verifie sur 833 boudins de transit (`th` du paquet
 * toctoc-app-short) : `th === {maisonOccupee} ∪ maisonsRegies`, 833/833.
 */
const DOMICILES: Record<string, string[]> = {
  Sun: ["Leo"], Moon: ["Cancer"],
  Mercury: ["Gemini", "Virgo"], Venus: ["Taurus", "Libra"],
  Mars: ["Aries", "Scorpio"], Jupiter: ["Sagittarius", "Pisces"],
  Saturn: ["Capricorn", "Aquarius"],
};

/** Les 10 seuls `natalPoint` que le moteur emet (releve sur 2022 boudins). */
export type PointNatal =
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn"
  | "Uranus" | "ASC" | "MC";

export interface Referentiel {
  indexAscendant: number;
  /** Combien de couples (signe, maison) ont vote — 0 = referentiel non resolu. */
  temoins: number;
  /** Vrai si un seul index a ete propose. Un desaccord = ne rien afficher. */
  unanime: boolean;
  maisonDuSigne(signe: string): number | null;
  /** natalPoint → maison occupee. Vide tant que `nourrirPointsNatals` n a pas tourne. */
  maisonNatale: Partial<Record<string, number>>;
}

interface BoudinAnnee {
  category?: string;
  type?: string;
  natalPoint?: string | null;
  periodSign?: string | null;
  periodHousePlacement?: { house?: number; signification?: string } | null;
  profectedSign?: string | null;
  profectedHouse?: number | null;
  profectionRuler?: string | null;
  rulerNatalSign?: string | null;
  rulerNatalHouse?: number | null;
  timeLord?: string | null;
  loyNatalSign?: string | null;
  monthlySign?: string | null;
  firdariaLord?: string | null;
  eclipseSign?: string | null;
  eclipseLongitude?: number | null;
}

/**
 * Resout l Ascendant a partir du paquet `toctoc-year` SEUL. Zero appel reseau.
 * Renvoie null si le paquet ne contient aucun couple (signe, maison) — ce qui
 * n est jamais arrive sur les 4 themes mesures, mais reste possible.
 */
export function referentielDepuisAnnee(boudins: BoudinAnnee[]): Referentiel | null {
  const votes = new Map<number, number>();
  for (const b of boudins) {
    const couples: Array<[string, number]> = [];
    if (b.periodSign && b.periodHousePlacement?.house) couples.push([b.periodSign, b.periodHousePlacement.house]);
    if (b.profectedSign && b.profectedHouse) couples.push([b.profectedSign, b.profectedHouse]);
    if (b.rulerNatalSign && b.rulerNatalHouse) couples.push([b.rulerNatalSign, b.rulerNatalHouse]);
    for (const [signe, maison] of couples) {
      const i = SIGNES.indexOf(signe as typeof SIGNES[number]);
      if (i < 0 || maison < 1 || maison > 12) continue;
      const asc = ((i - (maison - 1)) % 12 + 12) % 12;
      votes.set(asc, (votes.get(asc) ?? 0) + 1);
    }
  }
  if (votes.size === 0) return null;
  const classe = [...votes.entries()].sort((a, b) => b[1] - a[1]);
  return construire(classe[0][0], [...votes.values()].reduce((a, b) => a + b, 0), votes.size === 1);
}

/**
 * Meme referentiel, depuis `/api/chart-data`. Utile en secours, ou pour
 * remplir `maisonNatale` sans toctoc-app-short. On ne lit QUE `planets.As`.
 */
export function referentielDepuisTheme(chartData: {
  planets?: Record<string, number[] | number>;
}): Referentiel | null {
  const brut = chartData?.planets?.As;
  const asc = Array.isArray(brut) ? brut[0] : brut;
  if (typeof asc !== "number") return null;
  const ref = construire(Math.floor((((asc % 360) + 360) % 360) / 30), 1, true);
  for (const [nom, v] of Object.entries(chartData.planets ?? {})) {
    const lon = Array.isArray(v) ? v[0] : v;
    if (typeof lon !== "number") continue;
    ref.maisonNatale[nom] = ((Math.floor((((lon % 360) + 360) % 360) / 30) - ref.indexAscendant + 12) % 12) + 1;
  }
  // Conventions du moteur, verifiees : ASC → 1 (coincide avec le signe entier),
  // MC → 10 TOUJOURS, meme quand son degre tombe dans une autre maison en
  // signes entiers. Sur le theme de reference, MC est a 300.07° (Capricorne),
  // soit maison 9 en signes entiers ; le moteur repond 10.
  ref.maisonNatale.ASC = 1;
  ref.maisonNatale.MC = 10;
  return ref;
}

function construire(indexAscendant: number, temoins: number, unanime: boolean): Referentiel {
  const maisonNatale: Partial<Record<string, number>> = { ASC: 1, MC: 10 };
  return {
    indexAscendant, temoins, unanime, maisonNatale,
    maisonDuSigne(signe: string) {
      const i = SIGNES.indexOf(signe as typeof SIGNES[number]);
      return i < 0 ? null : ((i - indexAscendant + 12) % 12) + 1;
    },
  };
}

/**
 * Remplit `maisonNatale` depuis les boudins de `toctoc-app-short`, que l app
 * telecharge deja en tache de fond (`fetchAppData`, lib/momentum-api.ts:335).
 * Le champ `nh` y est present sur 100 % des transits et des stations (922/922
 * mesures) et couvre les 10 `natalPoint` que le moteur emet.
 * La maison natale d une planete ne bouge pas : une seule occurrence suffit.
 */
export function nourrirPointsNatals(
  ref: Referentiel,
  boudinsCourts: Array<{ np?: string; nh?: number }>,
): number {
  let ajoutes = 0;
  for (const b of boudinsCourts) {
    if (!b.np || b.nh == null) continue;
    if (ref.maisonNatale[b.np] == null) { ref.maisonNatale[b.np] = b.nh; ajoutes++; }
  }
  return ajoutes;
}

export interface MaisonResolue {
  /** La maison a afficher. null = on se tait, conformement a la regle de silence. */
  maison: number | null;
  /** Toutes les maisons touchees (occupee + regies) — pour compter la convergence. */
  maisons: number[];
  /** D ou vient la reponse. A journaliser : c est ce qui rend l echec visible. */
  source: string;
  /** false = deduction par convention, pas une valeur du moteur. */
  donneeDuMoteur: boolean;
}

const VIDE = (source: string): MaisonResolue => ({ maison: null, maisons: [], source, donneeDuMoteur: false });

export function maisonDuBoudin(b: BoudinAnnee, ref: Referentiel | null): MaisonResolue {
  if (!ref || !ref.unanime) return VIDE("referentiel-indisponible");
  const S = (s?: string | null) => (s ? ref.maisonDuSigne(s) : null);
  const M = (p?: string | null) => (p ? ref.maisonNatale[p] ?? null : null);
  const regies = (p?: string | null) =>
    (p ? DOMICILES[p] ?? [] : []).map(S).filter((h): h is number => h != null);
  const jeu = (...h: Array<number | null>) => [...new Set(h.filter((x): x is number => x != null))];

  switch (b.category) {
    // ── zr : le moteur donne la maison. Rien a deduire. Echec attendu : 0 %.
    case "zr": {
      const h = b.periodHousePlacement?.house ?? S(b.periodSign);
      return { maison: h ?? null, maisons: jeu(h), donneeDuMoteur: !!b.periodHousePlacement?.house,
               source: b.periodHousePlacement?.house ? "periodHousePlacement" : "periodSign+ASC" };
    }

    // ── profection / anniversaire : `profectedHouse` est un ENTIER de premiere
    //    classe. Aucune regex n est necessaire, et aucune n est fiable (voir
    //    plus bas). Echec attendu : 0 %.
    case "profection_year_change":
    case "anniversary": {
      const h = b.profectedHouse ?? S(b.profectedSign) ?? null;
      const seigneur = b.rulerNatalHouse ?? M(b.profectionRuler) ?? M(b.timeLord) ?? S(b.loyNatalSign);
      return { maison: h, maisons: jeu(h, seigneur), source: "profectedHouse",
               donneeDuMoteur: b.profectedHouse != null };
    }

    // ── profection mensuelle : pas de champ maison, mais `monthlySign` suffit.
    //    Par construction cette famille dit « la profection mensuelle atteint le
    //    signe natal du seigneur de l annee », donc monthlySign === loyNatalSign
    //    et la maison est aussi la maison natale du seigneur : les deux lectures
    //    coincident (10/10 mesures). Echec attendu : 0 %.
    case "monthly_profection_loy_hit": {
      const h = S(b.monthlySign) ?? S(b.loyNatalSign);
      return { maison: h ?? null, maisons: jeu(h, M(b.timeLord)), source: "monthlySign+ASC", donneeDuMoteur: false };
    }

    // ── transit / station : `natalPoint` est un champ de premiere classe. La
    //    maison est celle de la planete natale VISEE. Echec attendu : 0 % si
    //    `maisonNatale` a ete nourri, 100 % sinon.
    case "transit":
    case "station": {
      const occupee = M(b.natalPoint);
      if (occupee == null) return VIDE("natalPoint-non-resolu:" + (b.natalPoint ?? "absent"));
      return { maison: occupee, maisons: jeu(occupee, ...regies(b.natalPoint)),
               source: "natalPoint+maisonNatale", donneeDuMoteur: true };
    }

    // ── eclipse : DEUX maisons legitimes, et le moteur ne tranche pas.
    //    1. la maison de la planete natale touchee (`natalPoint`) ;
    //    2. la maison ou tombe l eclipse (`eclipseSign`, degre `eclipseLongitude`).
    //    On prend la premiere : c est ce que le moteur privilegie ailleurs
    //    (`tc` des eclipses de toctoc-app-short ne contient QUE les maisons
    //    REGIES par `natalPoint` — 216/216 — jamais la maison du degre).
    //    N utilise PAS `eclipseAxis` : "1-7" est un axe de SIGNES dans le
    //    zodiaque naturel (Belier/Balance), PAS un axe de maisons. Sur le theme
    //    de reference, une eclipse en Belier porte `eclipseAxis: "1-7"` alors
    //    que le Belier y est la maison 11. Echec attendu : 0 %.
    case "eclipse": {
      const occupee = M(b.natalPoint);
      const degre = S(b.eclipseSign);
      const h = occupee ?? degre;
      if (h == null) return VIDE("eclipse-non-resolue");
      return { maison: h, maisons: jeu(occupee, degre, ...regies(b.natalPoint)),
               source: occupee != null ? "natalPoint+maisonNatale" : "eclipseSign+ASC",
               donneeDuMoteur: occupee != null };
    }

    // ── firdaria : AUCUN champ de maison, aucun signe. La seule voie est la
    //    maison natale du `firdariaLord` — une CONVENTION de lecture, pas une
    //    valeur du moteur. A ne pas compter dans la convergence sans arbitrage
    //    de Marie-Ange.
    case "firdaria_major_change": {
      const h = M(b.firdariaLord);
      if (h == null) return VIDE("firdariaLord-non-resolu");
      return { maison: h, maisons: jeu(h), source: "firdariaLord+maisonNatale(convention)", donneeDuMoteur: false };
    }

    default:
      return VIDE("categorie-inconnue:" + (b.category ?? "absente"));
  }
}
