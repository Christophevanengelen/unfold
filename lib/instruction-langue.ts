/**
 * Faire repondre le modele dans la langue de la personne.
 *
 * Constate le 01/09/2026 : sur quatre routes qui appellent le modele, UNE SEULE
 * lui indiquait la langue. Les trois autres — dont le briefing quotidien, le
 * contenu dynamique le plus lu du produit — partaient avec un prompt systeme
 * ecrit en francais (« Tu es le moteur de briefing quotidien... »), et le
 * modele repondait donc en francais a TOUT LE MONDE.
 *
 * Le produit est traduit en dix langues. Quelqu un qui lit en japonais voyait
 * une interface japonaise remplie de texte francais — et c est precisement ce
 * texte-la qui porte la valeur du produit, pas les libellés autour.
 *
 * Le francais reste la langue SOURCE : c est celle du contenu ecrit par
 * Marie-Ange, et le modele y est le plus juste. Aucune instruction n est donc
 * ajoutee pour fr.
 */

const LANGUES: Record<string, string> = {
  en: "English",
  es: "español",
  pt: "português brasileiro",
  de: "Deutsch",
  it: "italiano",
  nl: "Nederlands",
  ja: "日本語",
  zh: "中文",
  ar: "العربية",
};

/**
 * Le bloc a coller a la fin du prompt systeme. Vide pour le francais.
 *
 * `champs` liste les cles dont le CONTENU doit etre traduit — sans quoi le
 * modele traduit parfois les cles elles-memes et casse le JSON.
 */
export function instructionLangue(locale: string | null | undefined, champs?: string): string {
  const langue = LANGUES[(locale ?? "").slice(0, 2)];
  if (!langue) return "";
  return `

--- LANGUE DE SORTIE ---
**IMPORTANT** : rédige TOUT le contenu destiné à la personne directement en ${langue}.${
    champs ? `\nLes champs concernés : ${champs}.` : ""
  }
Traduis les noms de domaines de vie et les titres de périodes.
Garde en standard astrologique les noms de planètes (Neptune, Lune, Vénus…) et
les aspects techniques (square, opposition, conjunction).
Ne traduis PAS les clés du JSON, seulement le contenu des chaînes.
--- FIN LANGUE ---
`;
}

/** Les langues pour lesquelles une instruction est produite. */
export const LANGUES_MODELE = Object.keys(LANGUES);
