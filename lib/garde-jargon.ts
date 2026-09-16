/**
 * GARDE-JARGON — la validation partagee du texte qu un modele rend a la
 * personne : jamais de mecanique celeste, jamais trop long.
 *
 * Extrait de app/api/openai/daily-briefing/route.ts, ou cette logique vivait
 * seule jusqu ici (compterMots/MOTIFS_JARGON/detecterJargon/validerBriefing,
 * lignes 216-322). Une regle de prompt qui n est pas verifiee est une regle
 * qui saute — c est exactement ce qui a produit « Neptune en carre avec ton
 * Neptune natal dans ta 8e maison ». Ce module est la version partagee,
 * consommee par la nouvelle route de conversation (lib/astrologue-prompt-redaction.ts)
 * et destinee a remplacer, a terme, la copie privee de daily-briefing.
 */

// Pas de \p{...} ici : les proprietes Unicode demandent une cible ES2018 et
// la cible du projet est ES2017 — la classe explicite couvre les lettres
// accentuees du francais. Les ideogrammes se comptent un a un (CJK ne separe
// pas les mots par des espaces), le reste par tokens.
export const IDEOGRAMMES = /[぀-ヿ㐀-䶿一-鿿豈-﫿]/g;

/** Compte les mots d un texte, quelle que soit son ecriture. */
export function compterMots(...textes: string[]): number {
  const texte = textes.join(" ");
  const cjk = (texte.match(IDEOGRAMMES) ?? []).length;
  const reste = texte
    .replace(IDEOGRAMMES, " ")
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
  return reste + Math.ceil(cjk / 2);
}

export interface MotifJargon {
  nom: string;
  motif: RegExp;
}

// On ne detecte que des formes qui n ont aucune raison d exister dans une
// lecture correcte, pour ne pas rejeter du texte valide.
export const MOTIFS_JARGON: MotifJargon[] = [
  { nom: "numero de maison", motif: /\b\d{1,2}\s*(?:e|è|ème|eme|er|re|ère|ere)?\s*[-–]?\s*(?:\d{1,2}\s*(?:e|è|ème|eme)?\s*)?maisons?\b/i },
  { nom: "maison numerotee", motif: /\bmaisons?\s+(?:n°\s*)?\d{1,2}\b/i },
  // Meme piege d accent que « mecanique celeste » ci-dessous, et il etait la
  // depuis l origine : ce motif finissait par `\b` apres `carr[ée]`, donc
  // « carre » etait detecte mais « carré » ne l a jamais ete — le `\b` qui suit
  // un « é » n existe pas quand le caractere suivant est une espace. Releve le
  // 16/09/2026 par scripts/verifier-garde-jargon.mjs.
  {
    nom: "nom d'aspect",
    motif: /(?<![A-Za-zÀ-ÿ])(?:carr[ée]e?s?|oppositions?|conjonctions?|trigones?|sextiles?|quinconces?)(?![A-Za-zÀ-ÿ])/i,
  },
  { nom: "reference au natal", motif: /\bnatal(?:e|es|aux)?\b/i },
  // Ajoute le 16/09/2026. Mesure du jour : « Une eclipse lunaire partielle cree
  // une periode rare d ouverture… » est passe tel quel a l ecran. Une eclipse
  // est un mecanisme celeste, exactement ce que le socle demande de traduire en
  // domaine de vie — le nom du mecanisme n apprend rien a qui ne le connait pas,
  // et impressionne qui le connait un peu. Meme raisonnement pour les trois
  // autres.
  //
  // « Ascendant » est volontairement absent : « prendre l ascendant » est du
  // francais courant, et le motif rejetterait du texte juste.
  // `\b` ne sert a rien devant un caractere accentue : pour JavaScript, « é »
  // n est pas un caractere de mot, donc /\bé/ exige une lettre AVANT le é et ne
  // matche jamais un mot qui commence par é. Mesure du 16/09 : le motif ecrit
  // avec \b laissait passer « Une eclipse lunaire partielle » en entier. On
  // borne donc avec des anti-regards sur une classe de lettres accentuees.
  {
    nom: "mecanique celeste",
    motif: /(?<![A-Za-zÀ-ÿ])(?:[ée]clipses?|r[ée]trogradations?|r[ée]trogrades?|lunaisons?)(?![A-Za-zÀ-ÿ])/i,
  },
  { nom: "phase de lune", motif: /\b(?:pleine|nouvelle)\s+lune\b/i },
  { nom: "nom de transit", motif: /\btransits?\b/i },
];

export function detecterJargon(...textes: string[]): string | null {
  const texte = textes.join(" ");
  for (const { nom, motif } of MOTIFS_JARGON) {
    if (motif.test(texte)) return nom;
  }
  return null;
}

/**
 * « Un astre, une fois maximum » (brief §4) est un COMPTE, pas une regex
 * booleenne — contrairement aux autres motifs. Noms fr + en : instructionLangue.ts:47
 * dit explicitement que les noms de planetes ne sont PAS traduits, meme en
 * sortie non-fr, donc les deux graphies peuvent apparaitre.
 */
export const NOMS_ASTRES = [
  "soleil", "sun", "lune", "moon",
  "mercure", "mercury", "vénus", "venus",
  "mars", "jupiter", "saturne", "saturn",
  "uranus", "neptune", "pluton", "pluto",
  "nœud nord", "noeud nord", "north node",
  "nœud sud", "noeud sud", "south node",
];

const MOTIF_ASTRES = new RegExp(
  `\\b(${NOMS_ASTRES.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "gi",
);

/** Renvoie le nom en trop des qu un astre apparait plus d une fois au total, sinon null. */
export function detecterAstreRepete(...textes: string[]): string | null {
  const texte = textes.join(" ");
  const trouves = texte.match(MOTIF_ASTRES) ?? [];
  if (trouves.length <= 1) return null;
  return trouves[1].toLowerCase();
}

export type ValidationTexte =
  | { valide: true }
  | { valide: false; raison: string; detail: string };

/**
 * Meme sequence de controles que validerBriefing dans daily-briefing/route.ts :
 * champs presents/non-vides -> compte de mots -> jargon -> astre repete.
 * `champs` est deja le texte final (trim), pas un objet brut a valider.
 */
export function validerTexteRedaction(
  champs: Record<string, string>,
  options: { limiteMots: number },
): ValidationTexte {
  for (const [nom, valeur] of Object.entries(champs)) {
    if (typeof valeur !== "string" || valeur.trim().length === 0) {
      return { valide: false, raison: "reponse_invalide", detail: `champ ${nom} absent ou vide` };
    }
  }

  const textes = Object.values(champs);
  const mots = compterMots(...textes);
  if (mots > options.limiteMots) {
    return { valide: false, raison: "reponse_trop_longue", detail: `${mots} mots pour une limite de ${options.limiteMots}` };
  }

  const jargon = detecterJargon(...textes);
  if (jargon) {
    return { valide: false, raison: "jargon_technique", detail: jargon };
  }

  const astreRepete = detecterAstreRepete(...textes);
  if (astreRepete) {
    return { valide: false, raison: "jargon_technique", detail: `astre cité plus d'une fois : ${astreRepete}` };
  }

  return { valide: true };
}
