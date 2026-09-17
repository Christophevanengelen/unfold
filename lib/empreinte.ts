/**
 * L empreinte : une image propre a deux personnes, tiree de leurs vrais chiffres.
 *
 * ─── CE QUE C EST, ET CE QUE CE N EST PAS ───────────────────────────────────
 *
 * Ce n est pas un graphique : on ne peut pas y lire une valeur. C est une
 * SIGNATURE — la meme idee que le Year in Sport de Strava ou l identite du MIT
 * Media Lab : un systeme de dessin dont les parametres viennent des donnees, de
 * sorte que deux couples n ont jamais la meme image, et que le meme couple a
 * toujours exactement la sienne.
 *
 * Elle est posee en fond du rapport, derriere le score. Elle ne remplace aucune
 * mesure : tout ce qui se lit se lit ailleurs, en clair.
 *
 * ─── POURQUOI DES COURBES HARMONIQUES ───────────────────────────────────────
 *
 * Une figure de Lissajous est le trace de deux mouvements sinusoidaux
 * perpendiculaires. Son interet ici tient a trois proprietes :
 *
 *  1. **Elle ne peut pas etre laide.** Quelle que soit la combinaison de
 *     parametres, on obtient une courbe continue et equilibree. Un systeme
 *     generatif qui produit une image ratee une fois sur dix est inutilisable
 *     dans un produit : on n a pas de directeur artistique derriere chaque
 *     ecran.
 *  2. **Elle reagit fort a de petits ecarts.** Deux couples aux scores voisins
 *     donnent deux figures nettement differentes — c est ce qui fait qu on
 *     reconnait la sienne.
 *  3. **Elle coute deux sinus par point.** Deux cents points par courbe, deux
 *     courbes : quatre cents sinus par rendu, calcules une fois et mis en
 *     cache. Aucune bibliotheque, aucun canvas, aucun WebGL.
 *
 * ─── D OU VIENT CHAQUE PARAMETRE ────────────────────────────────────────────
 *
 * Rien n est decoratif : chaque nombre du dessin vient d une mesure du moteur.
 *
 *   score        → le nombre de lobes, donc la densite de la figure
 *   ressemblance → l ecart de frequence entre les deux courbes : plus ils se
 *                  ressemblent, plus les deux traces se superposent
 *   equilibre    → la symetrie de la figure
 *   attraction   → le dephasage entre les deux courbes, avec son asymetrie :
 *                  la courbe de celui qui cherche le plus est en avance
 *   porteurs     → les micro-ondulations, une par terrain qui porte vraiment
 *
 * ─── LE DETERMINISME ────────────────────────────────────────────────────────
 *
 * Les memes naissances doivent toujours rendre la meme image, sur tous les
 * appareils et dans tous les sens. On n appelle donc jamais `Math.random()` :
 * la part aleatoire vient d un generateur ensemence par les deux naissances
 * (mulberry32). Une graine identique, une suite identique.
 */

/**
 * Hachage 32 bits d une chaine (FNV-1a). Simple, rapide, suffisant pour une
 * graine de dessin.
 */
export function graineDepuis(texte: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < texte.length; i += 1) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** La version de l algorithme, dans la graine. Voir `construireGraine`. */
const VERSION = "sig-v1";

/**
 * La graine d un couple, a partir des deux naissances.
 *
 * TROIS PRECAUTIONS, chacune corrige un defaut reel :
 *
 *  1. **Les deux naissances sont TRIEES.** Sans tri, l empreinte de Christophe
 *     et Alex differe de celle d Alex et Christophe : la signature du couple
 *     changerait selon qui ouvre le rapport. C est la premiere chose que tous
 *     les systemes de signature a deux entrees corrigent.
 *  2. **La version est dans la graine.** Le jour ou l on modifie le generateur,
 *     les images deja vues changeraient silencieusement. En versionnant, une
 *     empreinte gardee reste celle de son algorithme.
 *  3. **Les naissances, pas les prenoms.** Un prenom se corrige ; une naissance
 *     est la donnee du calcul. Renommer une connexion ne doit pas changer son
 *     empreinte.
 */
export function construireGraine(naissanceA: string, naissanceB: string): string {
  const [a, b] = [naissanceA, naissanceB].sort();
  return `${VERSION}|${a}|${b}`;
}

/**
 * mulberry32 : un generateur pseudo-aleatoire de 32 bits, tenant en cinq
 * lignes, de qualite largement suffisante pour du dessin. L essentiel est
 * qu il soit ENSEMENCE — donc reproductible — la ou `Math.random()` ne l est
 * jamais.
 */
export function alea(graine: number): () => number {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


/**
 * OKLCH vers sRGB, en code plutot qu en CSS.
 *
 * POURQUOI ON NE LAISSE PAS LE NAVIGATEUR LE FAIRE
 *
 * Mesure du 16/09/2026, iPhone 13, theme clair : avec `stroke="oklch(...)"`,
 * des fragments de la seconde courbe se rendaient en jaune-vert — la couleur
 * COMPLEMENTAIRE — la ou les traits se superposent le plus. Le defaut ne se
 * voyait qu en theme clair, et seulement dans la zone dense. Le groupe des
 * courbes porte une animation de rotation, donc une couche composee : la
 * conversion de couleur y passe par un autre chemin, et elle derape.
 *
 * On calcule donc la couleur nous-memes et on rend du `rgb()`. Trois gains :
 * le resultat est identique sur tous les moteurs, il ne depend d aucune
 * fonctionnalite CSS, et il est deterministe comme le reste de l empreinte.
 *
 * On garde OKLCH comme ESPACE DE TRAVAIL : c est lui qui garantit qu une
 * rotation de teinte ne change pas la luminosite percue — ce que TSL ne sait
 * pas faire, et qui est la raison meme pour laquelle la teinte peut suivre le
 * score sans que le contraste bouge.
 *
 * La conversion suit la definition d Oklab de Bjorn Ottosson.
 */
export function oklchVersRgb(L: number, C: number, Hdeg: number): string {
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lin = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  // Gamma sRGB, puis ecretage. L ecretage est volontaire et sans surprise :
  // les teintes de l empreinte restent dans une plage de chroma basse, donc il
  // ne se declenche quasiment jamais.
  const canal = (v: number) => {
    const g = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(1, g)) * 255);
  };
  return `rgb(${canal(lin[0])}, ${canal(lin[1])}, ${canal(lin[2])})`;
}

export interface ParametresEmpreinte {
  /** 0-100. Le score d ensemble. */
  score: number;
  /** 0-100. */
  ressemblance: number;
  /** 0-100. */
  equilibre: number;
  /** 0-100, chacun. L ecart cree le dephasage. */
  attractionVersLui: number;
  attractionVersElle: number;
  /** Combien de terrains portent vraiment. */
  porteurs: number;
  /** Ce qui rend l empreinte unique a ce couple precis. */
  graine: string;
}

export interface Empreinte {
  /** Deux traces SVG, prets a poser dans un `d`. */
  chemins: [string, string];
  /** La teinte de la figure, en degres. Derivee du score. */
  teinte: number;
  /** Les deux couleurs de trait, deja converties en sRGB. */
  couleurs: [string, string];
  /** Longueur approchee de chaque trace, pour l animation de dessin. */
  longueurs: [number, number];
}

const TAILLE = 100;
const CENTRE = TAILLE / 2;
/** Assez de points pour que la courbe soit lisse, assez peu pour rester legere. */
const POINTS = 900;
/** Combien de fois le pendule repasse : c est ce qui construit la trame. */
const TOURS = 5;

function borne(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Construit une courbe harmonique.
 *
 * `a` et `b` sont les frequences des deux sinus ; leur RAPPORT fait la forme.
 * Des entiers voisins (3 et 4, 5 et 6) donnent des figures fermees et lisibles ;
 * c est pour ca qu on les arrondit plutot que de laisser des reels, qui
 * produisent des enchevetrements illisibles.
 */
function courbe(
  a: number,
  b: number,
  dephasage: number,
  rayon: number,
  ondulation: number,
  /** L amortissement : ce qui transforme une Lissajous en harmonographe. */
  amorti: number,
  hasard: () => number,
): { chemin: string; longueur: number } {
  const pts: string[] = [];
  let longueur = 0;
  let px = 0;
  let py = 0;
  // Un leger desordre, fige par la graine : sans lui deux couples aux memes
  // arrondis auraient exactement le meme trace.
  const bruitA = (hasard() - 0.5) * 0.06;
  const bruitB = (hasard() - 0.5) * 0.06;

  for (let i = 0; i <= POINTS; i += 1) {
    const t = (i / POINTS) * Math.PI * 2 * TOURS;
    // L ondulation ajoute une harmonique rapide de faible amplitude : c est ce
    // qui donne le grain de la figure, pas sa forme.
    //
    // L amortissement, lui, fait la difference entre une Lissajous — une boucle
    // fermee qui se referme exactement sur elle-meme — et un harmonographe, qui
    // se resserre en spirale vers le centre. C est ce que trace un vrai
    // pendule, et c est de la que vient la sensation de dessin a la main plutot
    // que de courbe calculee.
    const decroissance = Math.exp(-amorti * i);
    const r = rayon * decroissance * (1 + ondulation * Math.sin(t * 9));
    const x = CENTRE + r * Math.sin((a + bruitA) * t + dephasage);
    const y = CENTRE + r * Math.sin((b + bruitB) * t);
    if (i > 0) longueur += Math.hypot(x - px, y - py);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
    px = x;
    py = y;
  }
  return { chemin: pts.join(" "), longueur };
}

/**
 * La teinte. Elle tourne avec le score, sur une plage volontairement ETROITE —
 * du violet de la marque vers le bleu profond quand l accord est haut, vers le
 * rose quand il est bas. Une rotation complete de la roue chromatique donnerait
 * des verts et des jaunes qui n ont rien a faire dans cette app : un systeme
 * generatif se tient par ses contraintes, pas par sa liberte.
 */
function teinteDe(score: number): number {
  const DEPART = 330; // rose
  const ARRIVEE = 255; // violet-bleu
  return DEPART + ((ARRIVEE - DEPART) * borne(score, 0, 100)) / 100;
}

export function construireEmpreinte(p: ParametresEmpreinte): Empreinte {
  // DEUX FLUX SEPARES, un par courbe. Avec un flux unique, ajouter un seul
  // tirage dans la premiere courbe decalerait tous les tirages de la seconde :
  // toutes les empreintes deja vues changeraient. C est le defaut de
  // determinisme le plus courant, et le plus penible a rattraper apres coup.
  const hasardUn = alea(graineDepuis(p.graine));
  const hasardDeux = alea(graineDepuis(`${p.graine}|2`));

  // Le score fixe la densite : de 3 lobes quand tout est calme a 8 quand tout
  // se repond. Au-dela de 8 la figure devient une pelote.
  const base = 3 + Math.round((borne(p.score, 0, 100) / 100) * 5);

  // La ressemblance rapproche les deux frequences. Deux personnes qui reagissent
  // pareil ont deux traces qui se suivent ; deux personnes tres differentes ont
  // deux traces qui se croisent en biais.
  const ecart = 1 + Math.round(((100 - borne(p.ressemblance, 0, 100)) / 100) * 3);

  // L equilibre ouvre ou resserre le second rayon : une figure parfaitement
  // equilibree est ronde, une figure desequilibree est etiree.
  //
  // ENCRE CONSTANTE : le rayon ne descend jamais sous 80 % du rayon utile. Un
  // couple aux chiffres bas doit donner une image AUTREMENT dense, jamais une
  // image vide — sinon le produit punit visuellement ceux dont le score est
  // bas, ce qui est exactement ce qu on refuse de faire.
  const rayonA = 38;
  const rayonB = 38 * (0.8 + (borne(p.equilibre, 0, 100) / 100) * 0.2);

  // Le dephasage vient de l attraction, et son ASYMETRIE decale les deux
  // courbes l une par rapport a l autre. C est la seule chose du dessin qui ne
  // serait pas la si le moteur ne mesurait pas les deux sens separement.
  const moyenne = (p.attractionVersLui + p.attractionVersElle) / 2;
  const asymetrie = (p.attractionVersElle - p.attractionVersLui) / 100;
  const dephasage = (borne(moyenne, 0, 100) / 100) * Math.PI;

  // Une micro-ondulation par terrain porteur, plafonnee : au-dela de cinq elle
  // mange la forme au lieu de la texturer.
  const ondulation = Math.min(p.porteurs, 5) * 0.012;

  // L amortissement vient du score : un accord haut donne une figure qui se
  // resserre doucement et reste ample ; un accord bas se resserre plus vite,
  // donc une figure plus concentree — pas plus pauvre.
  const amorti = 0.0016 - (borne(p.score, 0, 100) / 100) * 0.0011;

  const un = courbe(base, base + ecart, dephasage, rayonA, ondulation, amorti, hasardUn);
  const deux = courbe(
    base + ecart,
    base,
    dephasage + asymetrie * Math.PI * 0.5,
    rayonB,
    ondulation,
    amorti,
    hasardDeux,
  );

  const teinte = teinteDe(p.score);
  return {
    chemins: [un.chemin, deux.chemin],
    teinte,
    couleurs: [oklchVersRgb(0.74, 0.17, teinte), oklchVersRgb(0.63, 0.13, teinte + 18)],
    longueurs: [un.longueur, deux.longueur],
  };
}

/* ─── L EMPREINTE D UNE SEULE PERSONNE ──────────────────────────────────────
 *
 * Le systeme ci-dessus dessine un LIEN : il lui faut deux naissances et les
 * chiffres du moteur. Celui-ci dessine quelqu un, a partir de sa seule
 * naissance.
 *
 * ─── CE QUE C EST, ET SURTOUT CE QUE CE N EST PAS ───────────────────────────
 *
 * C est une SIGNATURE, au sens d un monogramme : une forme qui n appartient
 * qu a une personne et qui ne change jamais. Ce n est PAS une lecture. Aucune
 * valeur ne s y lit, et on ne pretend nulle part le contraire.
 *
 * C est une distinction de fond, pas une precaution de langage. Le produit
 * interdit d inventer un signal ; deriver des « scores » d un hachage de date
 * pour les dessiner reviendrait exactement a ca. Les parametres viennent donc
 * de la graine et ne sont presentes comme rien d autre qu un dessin.
 *
 * La lignee est celle des identicons : une image unique tiree
 * deterministiquement d une donnee, rendue toujours belle par une contrainte
 * de forme — ici les memes bornes etroites que l empreinte de couple.
 *
 * ─── POURQUOI CA VAUT LE COUP ───────────────────────────────────────────────
 *
 * Une personne a la meme forme partout dans l app, et pour toujours : dans son
 * profil, dans la liste des connexions, sur la carte qu on partage. C est un
 * bien du produit, pas une decoration d ecran — et c est ce qu aucune app
 * d astrologie ne fait.
 */

/** La graine d une personne. Meme precaution de version que pour un couple. */
export function graineDeNaissance(naissance: string): string {
  return `${VERSION}|solo|${naissance}`;
}

/**
 * Les parametres du dessin d une personne.
 *
 * Ils sont tires de la graine, dans les memes plages que l empreinte de
 * couple — c est ce qui fait que les deux se ressemblent sans se confondre, et
 * qu aucune combinaison ne peut produire une forme ratee.
 *
 * `porteurs` est fixe a trois : il ne represente rien ici, il donne seulement
 * la meme texture qu ailleurs.
 */
export function empreinteDeNaissance(naissance: string): ParametresEmpreinte {
  const graine = graineDeNaissance(naissance);
  const hasard = alea(graineDepuis(graine));
  const entre = (min: number, max: number) => Math.round(min + hasard() * (max - min));
  return {
    // La plage est resserree vers le haut : une signature personnelle doit
    // etre dense et tenue, jamais famelique. Personne ne doit se retrouver
    // avec une forme plus pauvre que celle de son voisin.
    score: entre(45, 92),
    ressemblance: entre(20, 95),
    equilibre: entre(55, 100),
    attractionVersLui: entre(25, 85),
    attractionVersElle: entre(25, 85),
    porteurs: 3,
    graine,
  };
}
