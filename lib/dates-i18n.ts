/**
 * Les dates, dans la langue de la personne.
 *
 * ─── POURQUOI CE FICHIER EXISTE ────────────────────────────────────────────
 *
 * Il y avait CINQ tables de mois abreges dans le depot, et elles ne disaient
 * pas la meme chose :
 *
 *   CapsuleDetailSheet.tsx:103   ["Jan","Fév","Mar","Avr","Mai",…]   francais
 *   ShareSignalCard.tsx:83       ["Jan","Fev","Mar","Avr","Mai",…]   francais sans accents
 *   CapsuleCard.tsx:9            ["Jan","Feb","Mar","Apr","May",…]   anglais
 *   MomentumTimelineV2.tsx:309   ["Jan","Feb","Mar","Apr","May",…]   anglais
 *   SignalPager.tsx:112          ["Jan","Feb","Mar","Apr","May",…]   anglais
 *
 * Les cinq etaient servies aux DIX langues du produit. Sur le meme ecran, une
 * capsule pouvait afficher « Fév » et la carte de partage « Fev ». Un lecteur
 * japonais lisait « Avr ».
 *
 * ─── POURQUOI Intl ET NON UNE SIXIEME TABLE ────────────────────────────────
 *
 * Une table de dix langues devrait etre tenue a la main, et surtout elle ne
 * regle que la moitie du probleme : l ORDRE des elements change d une langue a
 * l autre. « 22 Oct 2026 » se dit « 2026年10月22日 » en japonais et
 * « ٢٢ أكتوبر ٢٠٢٦ » en arabe. Une concatenation `jour + mois + annee` produit
 * du charabia dans ces langues, quelle que soit la qualite de la table.
 *
 * `Intl.DateTimeFormat` connait l ordre, la ponctuation et les chiffres de
 * chaque langue. Il est dans le navigateur, il ne coute rien, et il n a pas
 * besoin d etre traduit.
 *
 * ─── LE COUT, ET POURQUOI ON LE PAIE ───────────────────────────────────────
 *
 * Construire un formateur est l operation chere d Intl ; l appeler ensuite est
 * bon marche. Ces fonctions sont utilisees dans des listes qui defilent, donc
 * les formateurs sont gardes en memoire par couple (langue, forme).
 */

/** Le cache des formateurs. La clef est `${locale}|${forme}`. */
const formateurs = new Map<string, Intl.DateTimeFormat>();

function formateur(locale: string, forme: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat | null {
  const cle = `${locale}|${forme}`;
  const connu = formateurs.get(cle);
  if (connu) return connu;
  try {
    const f = new Intl.DateTimeFormat(locale, options);
    formateurs.set(cle, f);
    return f;
  } catch {
    // Locale inconnue de l environnement. On renvoie null et l appelant
    // retombe sur une forme neutre plutot que de faire tomber l ecran.
    return null;
  }
}

/** Une date invalide ne doit jamais s afficher comme « Invalid Date ». */
function valide(d: Date): boolean {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/**
 * « 22 Oct 2026 », dans l ordre de la langue.
 * Rend une chaine vide sur une date invalide — mieux vaut un trou qu un
 * « NaN undefined NaN », qui est ce que produisait la concatenation.
 */
export function jourMoisAnnee(d: Date, locale: string): string {
  if (!valide(d)) return "";
  const f = formateur(locale, "jma", { day: "numeric", month: "short", year: "numeric" });
  return f ? f.format(d) : d.toISOString().slice(0, 10);
}

/** « Oct 2026 » — sans le jour, pour les axes et les en-tetes. */
export function moisAnnee(d: Date, locale: string): string {
  if (!valide(d)) return "";
  const f = formateur(locale, "ma", { month: "short", year: "numeric" });
  return f ? f.format(d) : d.toISOString().slice(0, 7);
}

/** « Oct » seul — pour un axe ou une pastille ou l annee est deja dite. */
export function moisCourt(d: Date, locale: string): string {
  if (!valide(d)) return "";
  const f = formateur(locale, "m", { month: "short" });
  return f ? f.format(d) : "";
}

/**
 * Forme compacte pour les listes denses : « 22 oct. 26 ».
 *
 * Remplace le gabarit `MMM DD 'YY` ecrit a la main, qui plaquait une
 * apostrophe anglaise devant l annee dans les dix langues.
 */
export function jourMoisAnneeCourt(d: Date, locale: string): string {
  if (!valide(d)) return "";
  const f = formateur(locale, "jmac", { day: "numeric", month: "short", year: "2-digit" });
  return f ? f.format(d) : d.toISOString().slice(0, 10);
}
