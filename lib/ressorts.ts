/**
 * Le mouvement de l app, en un seul endroit.
 *
 * ─── POURQUOI UN FICHIER PLUTOT QUE DES VALEURS EPARSES ─────────────────────
 *
 * Le defaut le plus cite des interfaces qui « font web » n est pas d animer
 * trop : c est d animer PAREIL partout. Un meme « 300 ms ease-in-out » applique
 * a un appui de bouton, a l ouverture d une feuille et a l arrivee d un chiffre
 * decrit exactement ce que produit un outil qu on n a pas calibre. Quatre
 * reglages nommes, utilises a bon escient, se remarquent tout de suite.
 *
 * ─── POURQUOI DES RESSORTS, ET AVEC CES VALEURS-LA ──────────────────────────
 *
 * SwiftUI exprime ses ressorts en `duration` + `bounce` ; `motion` expose
 * exactement la meme paire, `visualDuration` + `bounce`. On peut donc viser la
 * sensation iOS sans la deviner :
 *
 *   `.spring()` par defaut de SwiftUI ≈ duree 0,55 / rebond 0,175
 *   `.smooth`   ≈ 0,5 / 0      `.snappy` ≈ 0,5 / 0,15     `.bouncy` ≈ 0,5 / 0,3
 *
 * Le reglage que tout le web recopie — `stiffness: 300, damping: 30` — est
 * SUR-amorti : il n arrive pas, il s eteint. C est ce qui fait qu une animation
 * correcte sur le papier se ressent molle sur l appareil.
 *
 * ─── LA REGLE DE FREQUENCE ──────────────────────────────────────────────────
 *
 * Un geste fait cent fois par jour ne s anime jamais. Un ecran qu on ouvre
 * rarement — un rapport de compatibilite — a le droit d etre un moment. C est
 * la seule justification acceptable d une choregraphie d ouverture : elle se
 * paie en attente, et cette attente doit etre rare.
 *
 * ─── MOUVEMENT REDUIT ───────────────────────────────────────────────────────
 *
 * `<MotionConfig reducedMotion="user">` est pose a la racine de l app : les
 * animations de `transform` et de mise en page se desactivent, celles
 * d `opacity` restent. C est la bonne semantique — on REMPLACE le mouvement par
 * un fondu, on ne supprime pas l animation. Un fondu n est pas du mouvement au
 * sens des regles d accessibilite, et garder la cascade preserve l ordre de
 * lecture.
 */

/** Cartes, sections, le score : ce qui arrive. Cale sur le ressort par defaut d iOS. */
export const ENTREE = { type: "spring" as const, visualDuration: 0.55, bounce: 0.15 };

/** Tout le reste des transitions d interface. */
export const STANDARD = { type: "spring" as const, visualDuration: 0.4, bounce: 0.12 };

/** Un appui, une bascule : la reponse doit precoder la pensee. */
export const REACTIF = { type: "spring" as const, visualDuration: 0.25, bounce: 0 };

/**
 * Le remplissage d une barre. `bounce: 0` n est pas un gout : une barre qui
 * depasse sa valeur puis revient AFFICHE UN FAUX CHIFFRE pendant deux dixiemes
 * de seconde. Sur une mesure entre deux personnes, ca se remarque.
 */
export const BARRE = { type: "spring" as const, visualDuration: 0.5, bounce: 0 };

/** Le trace d une courbe, plus long par nature. Une courbe ne rebondit pas. */
export const TRACE = { duration: 2.4, ease: [0.22, 1, 0.36, 1] as const };

/** Un fondu simple, quand rien ne doit bouger. */
export const FONDU = { duration: 0.3, ease: [0.23, 1, 0.32, 1] as const };

/**
 * Le decalage entre deux elements d une meme serie. Entre 30 et 80 ms : en
 * dessous la cascade ne se voit pas, au-dessus elle se subit.
 */
export const CASCADE = 0.055;
