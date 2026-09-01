/**
 * Refuse les couleurs ecrites en dur hors de app/globals.css.
 *
 * Le systeme de design existe et il est bon : pres de trois cents jetons dans
 * app/globals.css, une nomenclature semantique, un bloc `.dark` complet. Son
 * probleme n a jamais ete l absence, c est la FUITE — une valeur ecrite
 * ailleurs, qui devient une deuxieme verite et prend son propre chemin.
 *
 * Le 1er septembre 2026, deux elements de l onboarding etaient invisibles en
 * theme clair : le repere « NOW » en blanc sur fond blanc, et une pastille en
 * lilas pale sur mauve pale. Les deux avaient ete dessines en sombre, et
 * personne n avait regarde en clair.
 *
 * Corriger ces deux-la n empeche pas la troisieme. Ce fichier, si.
 *
 *   node scripts/verifier-couleurs.mjs
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CE QU IL VOIT, ET POURQUOI IL EN VOIT PLUS QU AVANT
 *
 * Jusqu au 01/09/2026 il ne regardait que `color:`, `background:`,
 * `backgroundColor:` et `borderColor:`, et une SEULE occurrence par ligne. Il
 * laissait donc passer, tranquillement :
 *
 *   const ACCENT = "#7C6BBF";                    une couleur nommee en JS
 *   border: "1px solid rgba(155,133,196,0.2)"    le raccourci, pas borderColor
 *   background: "#22c55e20", color: "#22c55e"    deux fuites sur une ligne
 *   color: "var(--text-body-subtle, #BFB6D6)"    un repli qui ne sert jamais
 *
 * Ces quatre trous ont ete refermes. Le dernier merite un mot : le repli d un
 * var() n est JAMAIS utilise, puisque le jeton est toujours declare dans
 * globals.css. Ce n est pas un filet de securite, c est une deuxieme copie de
 * la valeur — et elle avait deja diverge : `#BFB6D6` ne valait
 * --text-body-subtle dans aucun des deux themes, et le meme jeton
 * --bg-primary avait deux replis differents dans le meme fichier.
 *
 * Deux choses restent volontairement hors du champ :
 *
 *   • les attributs de presentation SVG (`fill=`, `stroke=`, `stopColor=`).
 *     Ce sont des attributs XML : ils n acceptent pas var(). Les convertir
 *     obligerait a passer par `style`, ce qui change la specificite. Et un
 *     trace decoratif ne s inverse pas avec le theme.
 *   • `boxShadow`. Les ombres animees par motion sont interpolees d une chaine
 *     a l autre ; un color-mix() au milieu casse l interpolation. Une ombre
 *     noire reste noire dans les deux themes : le risque n est pas le meme.
 *
 * Si tu elargis encore ce controle, mesure d abord ce que ca ajoute, puis
 * baisse le plafond a ce que tu as reellement corrige. Un plafond gonfle pour
 * accueillir une nouvelle detection n est pas un cliquet, c est une excuse.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

/**
 * Ce qui a le droit d etre ecrit en dur, et pourquoi.
 *
 * Ce ne sont pas des exceptions de confort : ce sont des couleurs qui portent
 * une DONNEE et non un theme, ou qui sont rendues hors du document. La couleur
 * d un domaine de vie doit rester la meme en clair et en sombre, sinon elle
 * cesse d identifier ce qu elle designe.
 */
const AUTORISES = [
  { motif: /lib\/domain-config/, raison: "couleurs des douze maisons — donnee, remplacee par l API avec le theme natal de la personne" },
  { motif: /lib\/planet-/, raison: "couleurs des planetes — donnee" },
  { motif: /StepPriorities/, raison: "couleurs des domaines, reprises du meme referentiel" },
  { motif: /StepSignalPreview/, raison: "couleurs des boudins de demonstration — donnee" },
  { motif: /opengraph-image/, raison: "image sociale rendue hors navigateur, sans theme" },
  { motif: /\.test\.|verifier-/, raison: "outils" },
  {
    motif: /compat\/relationshipConfig/,
    raison:
      "les quatre couleurs de relation sont lues par lib/contraste.ts, qui les " +
      "PARSE en rgb pour deriver un texte lisible. Un var() ne se parse pas : " +
      "le texte retomberait sur sa valeur de secours. Couleur de donnee, " +
      "identique dans les deux themes — memes valeurs que --echantillon-*",
  },
  {
    motif: /^app\/api\//,
    raison:
      "rapports HTML et PDF rendus hors navigateur : ils n ont pas de theme, " +
      "leurs couleurs sont celles du document lui-meme",
  },
  {
    motif: /^app\/app\/astro\//,
    raison:
      "AstroLearn, outil interne derriere authentification — pas l app grand " +
      "public, et pas soumis au meme exigence de theme",
  },
  {
    motif: /^app\/admin\//,
    raison: "back-office interne",
  },
];

/**
 * Une propriete CSS qui habille du TEXTE, une SURFACE ou un BORD, dont la
 * valeur contient une couleur litterale — ou une constante JavaScript qui ne
 * contient qu une couleur.
 *
 * La chaine est capturee avec son guillemet ouvrant (simple, double ou
 * arriere) et fermee par le meme, pour ne pas deborder sur la suite de la
 * ligne.
 */
const SUSPECT = new RegExp(
  "(?:^|[^a-zA-Z-])" +
    "(?:color|background|backgroundColor|backgroundImage|borderColor|border" +
    "|borderTop|borderBottom|borderLeft|borderRight|outline|outlineColor)" +
    "\\s*:\\s*([\"'`])(?:(?!\\1).)*?" +
    "(?:\\bwhite\\b|\\bblack\\b|#[0-9A-Fa-f]{3,8}\\b|rgba?\\([^)]*\\)|hsla?\\([^)]*\\))" +
    "(?:(?!\\1).)*?\\1" +
    "|(?:const|let)\\s+[A-Za-z_$][\\w$]*\\s*(?::\\s*[^=;]+)?=\\s*([\"'`])" +
    "(?:white|black|#[0-9A-Fa-f]{3,8}|rgba?\\([^)]*\\)|hsla?\\([^)]*\\))\\2",
  "g",
);

const fichiers = execFileSync("git", ["ls-files", "components", "app"], { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
  // `git ls-files` liste ce que git CONNAIT, pas ce qui existe sur le disque :
  // un fichier supprime mais pas encore indexe y figure encore. Sans ce filtre
  // le controle mourait sur un ENOENT avec une trace de pile, au lieu de dire
  // ce qu il verifiait. Un outil de verification qui plante ne verifie rien.
  .filter((f) => existsSync(f));

const fuites = [];
for (const f of fichiers) {
  const dispense = AUTORISES.find((a) => a.motif.test(f));
  if (dispense) continue;
  const texte = readFileSync(f, "utf8");
  const lignes = texte.split("\n");
  lignes.forEach((ligne, i) => {
    if (ligne.trimStart().startsWith("//") || ligne.trimStart().startsWith("*")) return;
    // TOUTES les occurrences de la ligne, pas seulement la premiere : une
    // ligne portait deux fuites et n en declarait qu une.
    for (const m of ligne.matchAll(SUSPECT)) {
      fuites.push({ f, ligne: i + 1, quoi: m[0].trim().slice(0, 120) });
    }
  });
}

/* ─────────────────────────────────────────────────────────────────────────
 * DEUXIEME CONTROLE : un jeton cite doit exister.
 *
 * `background: "var(--bg-card)"` ne provoque aucune erreur : le jeton n existe
 * pas — il s appelle --card-bg —, la declaration devient invalide au calcul, et
 * la propriete retombe a sa valeur initiale. La carte n a donc PAS de fond, en
 * silence, dans les deux themes. Deux fichiers font cette faute-la, avec la
 * meme inversion de mots.
 *
 * Ecrire un jeton qui n existe pas contourne le systeme aussi surement qu
 * ecrire une couleur en dur, et c est plus discret : rien ne s affiche en
 * rouge, ni au build, ni a l ecran.
 *
 * Les noms construits a l execution — `var(--domaine-${slug})` — sont ignores :
 * ils se terminent par un tiret ouvrant sur une interpolation.
 * ───────────────────────────────────────────────────────────────────────── */
const declares = new Set(
  [...readFileSync("app/globals.css", "utf8").matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
);

const inconnus = [];
for (const f of fichiers) {
  if (f === "app/globals.css") continue;
  readFileSync(f, "utf8")
    .split("\n")
    .forEach((ligne, i) => {
      const t = ligne.trimStart();
      if (t.startsWith("//") || t.startsWith("*")) return;
      for (const m of ligne.matchAll(/var\((--[a-z0-9-]+)/g)) {
        // un nom qui se termine par un tiret est un prefixe interpole
        if (m[1].endsWith("-")) continue;
        if (!declares.has(m[1])) inconnus.push({ f, ligne: i + 1, jeton: m[1] });
      }
    });
}

/**
 * Zero, et il n y a pas de raison que ca remonte : un jeton cite doit exister.
 *
 * La limite valait 2 le 01/09/2026, pour deux occurrences de la meme faute —
 * --bg-card pour --card-bg — dans components/demo/AuthSheet.tsx et
 * components/landing/PricingCheckout.tsx. Les deux sont corrigees, et regardees
 * a l ecran avant d etre gardees : les corriger FAISAIT APPARAITRE un fond qui
 * n existait pas, donc c etait un changement visuel, pas une retouche de nom.
 *
 * En 375x812, dans les deux themes, la carte des tarifs et le champ email
 * rendent desormais --card-bg : #ECE7F5 en clair, #15112B en sombre. Dans les
 * deux cas la surface s enfonce legerement sous la page — c est la profondeur
 * voulue, pas un cerne ajoute.
 */
const LIMITE_INCONNUS = 0;
// Le mot « limite » et non « plafond » : verifier-tout.mjs extrait le PREMIER
// « N ... plafond M » de la sortie pour son rapport, et annoncerait sinon deux
// couleurs figees au lieu de trente-sept.

if (inconnus.length > LIMITE_INCONNUS) {
  console.log(`\n  ${inconnus.length} jeton(s) cite(s) et jamais declare(s), limite ${LIMITE_INCONNUS}.\n`);
  for (const x of inconnus) console.log(`    ${x.f}:${x.ligne}  var(${x.jeton})`);
  console.log(`
  Un jeton qui n existe pas ne provoque aucune erreur : la declaration devient
  invalide au calcul et la propriete disparait. Verifie le nom dans
  app/globals.css, ou declare-le.
`);
  process.exit(1);
}
if (inconnus.length) {
  console.log(`\n  ${inconnus.length} jeton(s) cite(s) et jamais declare(s), limite ${LIMITE_INCONNUS} :`);
  for (const x of inconnus) console.log(`    ${x.f}:${x.ligne}  var(${x.jeton})`);
}

/**
 * Le cliquet.
 *
 * Cent cinquante-six couleurs figees existaient dans l app grand public au
 * 1er septembre 2026. Les corriger toutes d un coup n etait pas raisonnable, et
 * un controle qui echoue sur cent cinquante-six cas se fait desactiver le
 * lendemain — donc ne protege de rien.
 *
 * Ce nombre devient donc un PLAFOND. Une fuite de plus fait echouer le CI ; une
 * correction abaisse le plafond. La dette ne peut que decroitre, et personne
 * n a besoin d y penser.
 *
 * Le 01/09/2026 au soir, apres le chantier du site vitrine et l elargissement
 * de la detection ci-dessus : 179 fuites vues, 142 corrigees, 37 restantes.
 * components/landing/** est a ZERO — les quatre-vingt-cinq valeurs que
 * l ancien regex y voyait, et les cinquante-sept qu il ne voyait pas.
 * Les trente-sept qui restent vivent toutes hors du perimetre de ce
 * chantier — la carte de partage, les pages d erreur, le pied de page,
 * l en-tete, deux ecrans de l app — et sont pour moitie des replis morts dans
 * des var(). Elles se corrigent a la ligne.
 *
 * Quand tu corriges des couleurs, baisse ce nombre du meme compte. Le message
 * d erreur te dit lequel ecrire.
 */
const PLAFOND = 37;

if (fuites.length === 0) {
  console.log("\n  Aucune couleur ecrite en dur. Le theme tient.\n");
  process.exit(0);
}

if (fuites.length <= PLAFOND) {
  console.log(`\n  ${fuites.length} couleur(s) figee(s), plafond ${PLAFOND}. Rien de neuf.`);
  if (fuites.length < PLAFOND) {
    console.log(`\n  Le plafond peut descendre a ${fuites.length} dans scripts/verifier-couleurs.mjs.`);
  }
  console.log("");
  process.exit(0);
}

console.log(`\n  ${fuites.length} couleurs figees, plafond ${PLAFOND} : ${fuites.length - PLAFOND} de trop.\n`);
for (const x of fuites) console.log(`    ${x.f}:${x.ligne}  ${x.quoi}`);
console.log(`
  Utilise un jeton de app/globals.css plutot qu une valeur figee. Son en-tete
  liste les sept familles et dit comment en ajouter un. Les plus courants :

    texte courant .......... var(--text-body)
    titre .................. var(--text-heading)
    texte secondaire ....... var(--text-body-subtle)
    texte sur bouton colore  var(--text-on-brand)
    fond ................... var(--bg-primary) / var(--bg-secondary)
    bordure ................ var(--border-light)
    site vitrine ........... var(--site-*)        toujours sombre
    donnee de demonstration  var(--echantillon-*) / var(--element-*)

  Si la valeur n a pas de jeton, CREE le jeton avec la valeur exacte deja
  employee. Nommer n est pas redecider — et deux valeurs proches mais
  differentes restent deux jetons.

  Un repli dans un var() — var(--text-body, #BFB6D6) — n est pas un filet de
  securite : le jeton est toujours declare. C est une copie de la valeur, et
  elle ne suit pas. Supprime le repli.

  Une couleur qui porte une DONNEE — un domaine de vie, une planete — a le
  droit d etre figee : ajoute son fichier a AUTORISES, avec la raison.
`);
process.exit(1);
