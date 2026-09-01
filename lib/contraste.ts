/**
 * Rendre lisible un texte peint sur un fond fait de sa propre couleur.
 *
 * LE MOTIF, trouve trois fois en une journee et corrige trois fois a la main :
 *
 *     background: color-mix(in srgb, ${couleur} 15%, transparent)
 *     color:      ${couleur}
 *
 * Le texte prend la couleur pure, le fond prend LA MEME couleur diluee. Ils
 * partagent la teinte, donc ils convergent par construction — aucune palette ne
 * sauve ce motif. Mesure sur les puces du briefing : entre 2,02 et 2,78 de
 * contraste en theme clair, pour 4,5 requis.
 *
 * POURQUOI UN CALCUL ET NON DES JETONS. Les deux premieres corrections
 * passaient par des jetons CSS derives a l avance. Cela marche quand la palette
 * est connue — l ecran de personnalisation, le briefing. Cela ne marche PAS ici :
 * `capsule.color` vient du moteur, a l execution, et peut valoir n importe
 * quelle valeur. Une table ne peut pas couvrir ce qu on ne connait pas encore.
 *
 * On garde donc la couleur de base pour le fond et la bordure — c est
 * l identite du domaine, elle ne doit pas bouger — et on derive la couleur du
 * TEXTE jusqu a ce qu elle passe le seuil sur ce fond precis.
 */

const SEUIL = 4.5;

/** Les fonds de page, par theme. Doivent suivre --bg-primary de globals.css. */
const FONDS = { clair: "#F5F1FA", sombre: "#1B1535" } as const;

export type ThemeLisible = keyof typeof FONDS;

function versRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function versHex(c: number[]): string {
  return (
    "#" +
    c
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function luminosite(c: number[]): number {
  const v = c
    .map((x) => x / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}

function contraste(a: number[], b: number[]): number {
  const x = luminosite(a);
  const y = luminosite(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Le calcul est pur et se repete a chaque rendu de chaque puce : on retient.
const memo = new Map<string, string>();

/**
 * La couleur de texte lisible pour `base`, posee sur un fond fait de `base`
 * dilue a `taux` par-dessus le fond de page du theme.
 *
 * Renvoie `base` inchangee si ce n est pas un hexadecimal — une variable CSS,
 * par exemple : on ne peut pas calculer sur une valeur qu on ne connait pas, et
 * mieux vaut ne rien changer que renvoyer une couleur arbitraire.
 */
export function texteLisible(
  base: string,
  theme: ThemeLisible,
  taux = 0.15,
): string {
  const cle = `${base}|${theme}|${taux}`;
  const vu = memo.get(cle);
  if (vu) return vu;

  const c = versRgb(base);
  if (!c) return base;

  const page = versRgb(FONDS[theme]);
  if (!page) return base;

  const fond = c.map((x, i) => x * taux + page[i] * (1 - taux));
  // On tire vers le noir en theme clair, vers le blanc en theme sombre : la
  // teinte est conservee, seule la luminosite bouge.
  const vers = theme === "clair" ? [0, 0, 0] : [255, 255, 255];

  let resultat = versHex(vers);
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    // On teste la valeur ARRONDIE, pas la valeur theorique : c est elle qui
    // s affiche, et l arrondi peut faire retomber sous le seuil.
    const essai = versHex(c.map((x, j) => x * (1 - t) + vers[j] * t));
    const rgb = versRgb(essai);
    if (rgb && contraste(rgb, fond) >= SEUIL) {
      resultat = essai;
      break;
    }
  }

  memo.set(cle, resultat);
  return resultat;
}

/**
 * La couleur de texte a poser SUR un aplat fait de `base` a `taux`.
 *
 * Different de texteLisible : la, on derive la teinte de base pour la garder
 * reconnaissable sur un fond legerement teinte. Ici l aplat est dense — 80 % —
 * et le texte doit simplement etre lisible dessus, donc on choisit entre le
 * noir et le blanc.
 *
 * Ecrit apres avoir mesure les puces de priorites : elles peignaient du BLANC
 * sur un aplat a 80 %, ce qui echouait pour les neuf domaines en theme clair
 * (2,06 a 2,71) et pour cinq d entre eux en theme sombre. L etat selectionne —
 * celui qu on vient de choisir — etait le moins lisible des deux.
 */
export function texteSurAplat(base: string, theme: ThemeLisible, taux = 0.8): string {
  const c = versRgb(base);
  const page = versRgb(FONDS[theme]);
  if (!c || !page) return "#ffffff";
  const fond = c.map((x, i) => x * taux + page[i] * (1 - taux));
  const blanc = contraste([255, 255, 255], fond);
  const noir = contraste([0, 0, 0], fond);
  // On prend le meilleur des deux. Sur ces teintes moyennes, c est le noir qui
  // l emporte largement — ce que le blanc d origine ne pouvait pas donner.
  return blanc >= noir ? "#ffffff" : "#101010";
}
