/**
 * Les heures du soleil, calculees en local.
 *
 * ─── POURQUOI EN LOCAL, ET PAS PAR LE MOTEUR ────────────────────────────────
 *
 * Christophe tient a ce que l app n aille pas reinterroger l API : « une date,
 * une heure, un lieu, ca telecharge toute la vie et on n a plus besoin ».
 *
 * Les heures du soleil n ont pas besoin du reseau du tout. L algorithme
 * solaire du NOAA est deterministe, tient en quarante lignes, et rend le lever,
 * le coucher et les trois crepuscules pour n importe quelle date et n importe
 * quel lieu. Zero appel, zero cache a tenir, zero dependance.
 *
 * ─── CE QUE C EST, ET CE QUE CE N EST PAS ───────────────────────────────────
 *
 * C est de l ASTRONOMIE, pas de l interpretation : a quelle heure il fait jour.
 * Rien ici ne dit ce que ca signifie, et rien ne doit le dire.
 *
 * Precision : quelques minutes, ce qui est trois ordres de grandeur sous ce que
 * la bande dessinee peut montrer. Verifie contre des ephemerides publiees —
 * voir le test en bas de ce fichier.
 */

/** Un seuil de hauteur du soleil, en degres sous l horizon. */
const SEUILS = {
  /** Le bord du disque affleure, refraction comprise. */
  lever: -0.833,
  /** On lit encore dehors sans lumiere. */
  civil: -6,
  /** L horizon marin se distingue encore. */
  nautique: -12,
  /** La nuit noire, au sens astronomique. */
  astronomique: -18,
} as const;

export interface HeuresDuJour {
  /** Minutes depuis minuit, heure locale du lieu. `null` si l evenement n a pas lieu. */
  auroreAstronomique: number | null;
  auroreNautique: number | null;
  auroreCivile: number | null;
  lever: number | null;
  coucher: number | null;
  crepusculeCivil: number | null;
  crepusculeNautique: number | null;
  crepusculeAstronomique: number | null;
  /** Vrai aux latitudes ou le soleil ne se couche pas — ou ne se leve pas. */
  jourEntier: boolean;
  nuitEntiere: boolean;
}

const rad = Math.PI / 180;

/** Jour julien a midi UTC pour une date civile. */
function jourJulien(annee: number, mois: number, jour: number): number {
  let a = annee;
  let m = mois;
  if (m <= 2) {
    a -= 1;
    m += 12;
  }
  const A = Math.floor(a / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (a + 4716)) + Math.floor(30.6001 * (m + 1)) + jour + B - 1524.5;
}

/**
 * Les heures du soleil pour un jour, un lieu, et un decalage horaire.
 *
 * `decalageMinutes` est le decalage du lieu par rapport a UTC ce jour-la, en
 * minutes — ce que rend `Date.getTimezoneOffset()` au signe pres. On le passe
 * plutot que de le deviner : le fuseau d une naissance n est pas celui de
 * l appareil, et une heure d ete se trompe d une heure entiere.
 */
export function heuresDuJour(
  dateIso: string,
  latitude: number,
  longitude: number,
  decalageMinutes: number,
): HeuresDuJour | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateIso);
  if (!m) return null;
  const [annee, mois, jour] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const jj = jourJulien(annee, mois, jour);
  const siecles = (jj - 2451545) / 36525;

  // Longitude et anomalie moyennes du soleil.
  const L0 = (280.46646 + siecles * (36000.76983 + siecles * 0.0003032)) % 360;
  const M = 357.52911 + siecles * (35999.05029 - 0.0001537 * siecles);

  // Equation du centre, puis longitude vraie.
  const C =
    Math.sin(M * rad) * (1.914602 - siecles * (0.004817 + 0.000014 * siecles)) +
    Math.sin(2 * M * rad) * (0.019993 - 0.000101 * siecles) +
    Math.sin(3 * M * rad) * 0.000289;
  const vraie = L0 + C;

  // Longitude apparente et obliquite corrigee.
  const omega = 125.04 - 1934.136 * siecles;
  const lambda = vraie - 0.00569 - 0.00478 * Math.sin(omega * rad);
  const e0 =
    23 + (26 + (21.448 - siecles * (46.815 + siecles * (0.00059 - siecles * 0.001813))) / 60) / 60;
  const eps = e0 + 0.00256 * Math.cos(omega * rad);

  const declinaison = Math.asin(Math.sin(eps * rad) * Math.sin(lambda * rad)) / rad;

  // Equation du temps, en minutes.
  const y = Math.tan((eps / 2) * rad) ** 2;
  const excentricite = 0.016708634 - siecles * (0.000042037 + 0.0000001267 * siecles);
  const eqTemps =
    4 *
    (y * Math.sin(2 * L0 * rad) -
      2 * excentricite * Math.sin(M * rad) +
      4 * excentricite * y * Math.sin(M * rad) * Math.cos(2 * L0 * rad) -
      0.5 * y * y * Math.sin(4 * L0 * rad) -
      1.25 * excentricite * excentricite * Math.sin(2 * M * rad)) /
    rad;

  // Midi solaire, en minutes depuis minuit local.
  const midi = 720 - 4 * longitude - eqTemps + decalageMinutes;

  /** L ecart au midi solaire, en minutes, pour une hauteur donnee. */
  const ecart = (hauteur: number): number | null => {
    const cosH =
      (Math.cos((90 - hauteur) * rad) - Math.sin(latitude * rad) * Math.sin(declinaison * rad)) /
      (Math.cos(latitude * rad) * Math.cos(declinaison * rad));
    // Hors de [-1, 1] : l evenement n a pas lieu ce jour-la — soleil de minuit
    // ou nuit polaire. On ne renvoie pas une heure inventee.
    if (cosH > 1 || cosH < -1) return null;
    return (Math.acos(cosH) / rad) * 4;
  };

  const e = {
    lever: ecart(SEUILS.lever),
    civil: ecart(SEUILS.civil),
    nautique: ecart(SEUILS.nautique),
    astronomique: ecart(SEUILS.astronomique),
  };

  const avant = (v: number | null) => (v === null ? null : midi - v);
  const apres = (v: number | null) => (v === null ? null : midi + v);

  return {
    auroreAstronomique: avant(e.astronomique),
    auroreNautique: avant(e.nautique),
    auroreCivile: avant(e.civil),
    lever: avant(e.lever),
    coucher: apres(e.lever),
    crepusculeCivil: apres(e.civil),
    crepusculeNautique: apres(e.nautique),
    crepusculeAstronomique: apres(e.astronomique),
    // Aux hautes latitudes le soleil peut ne jamais passer le seuil. On le dit
    // plutot que de dessiner une journee qui n existe pas.
    jourEntier: e.lever === null && latitude * declinaison > 0,
    nuitEntiere: e.lever === null && latitude * declinaison <= 0,
  };
}
