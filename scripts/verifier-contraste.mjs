/**
 * Mesure le contraste des jetons de texte, dans les deux themes.
 *
 * L app a ete dessinee en sombre et le theme clair derive sans jamais etre
 * mesure. Resultat, le 1er septembre 2026 : `--text-body-subtle` affichait un
 * contraste de 3,27 sur fond clair — sous le seuil lisible de 4,5. Ce seul
 * jeton habille les dates, les etiquettes et les en-tetes de section : tout ce
 * qui etait illisible en theme clair venait de lui. Le meme jeton en sombre
 * etait a 7,10.
 *
 * Le probleme n etait pas d avoir choisi une mauvaise couleur, c est que
 * PERSONNE NE L AVAIT MESUREE. Un oeil s habitue a son propre theme.
 *
 * Seuil retenu : 4,5 pour le texte, la recommandation d accessibilite pour du
 * texte de taille courante. Les bordures et le texte desactive en sont exclus —
 * une bordure n est pas du texte, et un element desactive doit justement se
 * distinguer par sa faiblesse.
 *
 *   node scripts/verifier-contraste.mjs
 */

import { readFileSync } from "node:fs";

// ─────────────────────────────────────────────────────────────────────────────
// CE CONTROLE NE MESURE QUE DU TEXTE. Il n a rien a dire sur un contour, une
// icone, une bordure ou une surface.
//
// Le 01/09/2026 il appliquait ce seuil de 4,5 a la pastille flottante de la
// timeline. Pour l atteindre j ai blanchi la pastille, pousse son lisere a
// 90 % de violet, ajoute une ombre puis un voile de 96 px. Le produit est passe
// de minimaliste a surcharge, et la cause etait ce chiffre applique la ou il
// n avait pas cours.
//
// La regle, une fois pour toutes :
//
//   TEXTE ................. 4,5   (ce fichier, et rien d autre)
//   GROS TEXTE ............ 3,0   (>= 24 px, ou >= 19 px en gras)
//   CONTROLE / ICONE ...... 3,0   contre son fond, composant ENTIER —
//                                 matiere, teinte et elevation comprises,
//                                 jamais l epaisseur d un trait
//   DECOR, ETAT INACTIF ... aucun seuil
//
// Si un libelle ne passe pas : on assombrit LE LIBELLE. On ne touche ni a la
// matiere, ni au lisere, ni a l elevation. Ajouter une couche pour sauver un
// chiffre est toujours la mauvaise reponse — voir la skill favorable-design.
// ─────────────────────────────────────────────────────────────────────────────
const SEUIL = 4.5;

/** Ce qui doit etre lisible. Le reste porte du decor ou un etat. */
const JETONS = ["text-heading", "text-body", "text-body-subtle", "text-brand", "text-brand-strong",
  // L or du Lifetime Chart pose en TEXTE sur le fond de page. Sa valeur
  // d origine y valait 2,45 en clair, sur la page d acces au produit paye.
  "text-premium"];

const css = readFileSync("app/globals.css", "utf8");

function bloc(depart) {
  const i = css.indexOf(depart);
  if (i === -1) return {};
  const j = css.indexOf("}", i);
  const out = {};
  for (const m of css.slice(i, j).matchAll(/--([a-z-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

function rgb(v) {
  const h = /^#([0-9A-Fa-f]{6})$/.exec(v ?? "");
  if (h) return [0, 2, 4].map((i) => parseInt(h[1].slice(i, i + 2), 16));
  // Les voiles des pastilles sont ecrits en rgba(). On ignore l alpha : ces
  // couches sont posees sur un fond opaque, et c est la teinte qui nous
  // interesse.
  const r = /^rgba?\(([^)]+)\)$/.exec((v ?? "").trim());
  if (r) {
    const n = r[1].split(",").map((x) => parseFloat(x));
    if (n.length >= 3 && n.slice(0, 3).every((x) => Number.isFinite(x))) {
      return n.slice(0, 3);
    }
  }
  return null;
}

function luminosite(c) {
  const f = (x) => {
    x /= 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}

function contraste(a, b) {
  const la = luminosite(a);
  const lb = luminosite(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const themes = [
  { nom: "clair", jetons: bloc(":root {") },
  { nom: "sombre", jetons: bloc(".dark {") },
];

let echecs = 0;
for (const t of themes) {
  const fond = rgb(t.jetons["bg-primary"]);
  if (!fond) {
    console.log(`  ${t.nom} : fond introuvable, ignore`);
    continue;
  }
  console.log(`\n  Theme ${t.nom} — fond ${t.jetons["bg-primary"]}`);
  for (const k of JETONS) {
    const c = rgb(t.jetons[k]);
    if (!c) continue;
    const r = contraste(c, fond);
    const ok = r >= SEUIL;
    if (!ok) echecs++;
    console.log(`    ${k.padEnd(20)} ${t.jetons[k].padEnd(9)} ${r.toFixed(2).padStart(6)}  ${ok ? "ok" : "SOUS LE SEUIL"}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Les couleurs des domaines de vie.
//
// Elles ne se verifient pas contre le fond de la page mais contre LEUR PROPRE
// fond teinte : la puce selectionnee peint son libelle sur un melange fait a
// 18 % de la couleur de base. C est ce qui rendait les neuf domaines illisibles
// avant le 01/09 — texte et fond partageaient la teinte et convergeaient, avec
// des contrastes tombant a 1,65 en clair.
//
// Sans ce controle, retoucher une couleur de domaine casserait la lisibilite
// sans que rien ne le dise.
// ─────────────────────────────────────────────────────────────────────────────
const DOMAINES = [
  "love", "career", "money", "family", "health-energy",
  "creativity", "home", "friends-network", "meaning-spirituality",
];

for (const t of themes) {
  // Le theme sombre ne redefinit que le texte : la base vient de :root.
  const jetons = t.nom === "sombre" ? { ...themes[0].jetons, ...t.jetons } : t.jetons;
  const fondBase = rgb(jetons["bg-secondary"]);
  if (!fondBase) continue;
  console.log(`\n  Domaines, theme ${t.nom} — sur leur fond teinte`);
  for (const d of DOMAINES) {
    const base = rgb(jetons[`domaine-${d}`]);
    const texte = rgb(jetons[`domaine-${d}-texte`]);
    if (!base || !texte) {
      console.log(`    ${d.padEnd(22)} jeton manquant`);
      echecs++;
      continue;
    }
    const fond = base.map((c, i) => c * 0.18 + fondBase[i] * 0.82);
    const r = contraste(texte, fond);
    const ok = r >= SEUIL;
    if (!ok) echecs++;
    console.log(`    ${d.padEnd(22)} ${r.toFixed(2).padStart(6)}  ${ok ? "ok" : "SOUS LE SEUIL"}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Deuxieme palette : les domaines du briefing.
//
// Elle se verifie sur un fond teinte a 12 % — la puce de DailyBriefing —, et
// non a 18 % comme les puces de personnalisation. Le motif etait le meme et la
// faute aussi : les onze domaines etaient entre 2,02 et 2,78 en theme clair,
// sur l ecran principal.
// ─────────────────────────────────────────────────────────────────────────────
const DOMAINES_BRIEF = [
  "carriere", "amour", "sante", "argent", "famille", "creativite",
  "communication", "foyer", "spiritualite", "voyage", "transformation",
];

for (const t of themes) {
  const jetons = t.nom === "sombre" ? { ...themes[0].jetons, ...t.jetons } : t.jetons;
  const fondBase = rgb(jetons["bg-primary"]);
  if (!fondBase) continue;
  console.log(`\n  Domaines du briefing, theme ${t.nom}`);
  for (const d of DOMAINES_BRIEF) {
    const base = rgb(jetons[`dom-${d}`]);
    const texte = rgb(jetons[`dom-${d}-texte`]);
    if (!base || !texte) {
      console.log(`    ${d.padEnd(22)} jeton manquant`);
      echecs++;
      continue;
    }
    const fond = base.map((c, i) => c * 0.12 + fondBase[i] * 0.88);
    const r = contraste(texte, fond);
    const ok = r >= SEUIL;
    if (!ok) echecs++;
    console.log(`    ${d.padEnd(22)} ${r.toFixed(2).padStart(6)}  ${ok ? "ok" : "SOUS LE SEUIL"}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Les paires « texte sur aplat ».
//
// Le controle ne verifiait que des textes poses sur le FOND DE PAGE. Or le
// libelle d un bouton principal est pose sur --bg-brand, pas sur --bg-primary,
// et cette paire-la n etait donc verifiee par personne : elle valait 4,46 en
// theme clair, sous le seuil, sur chaque bouton du produit.
// ─────────────────────────────────────────────────────────────────────────────
/** Resout `color-mix(in srgb, var(--x) N%, rgba(...))` en couleur concrete. */
function resoudreMelange(valeur, jetons) {
  if (!valeur) return null;
  const m = valeur.match(
    /color-mix\(in srgb,\s*var\(--([a-z-]+)\)\s*(\d+)%,\s*(rgba?\([^)]*\)|#[0-9A-Fa-f]{6})\s*\)/,
  );
  if (!m) return null;
  const teinte = rgb(jetons[m[1]]);
  const socle = rgb(m[3]);
  if (!teinte || !socle) return null;
  const p = Number(m[2]) / 100;
  return teinte.map((c, i) => c * p + socle[i] * (1 - p));
}

const PAIRES = [
  { texte: "text-on-brand", fond: "bg-brand", nom: "bouton principal" },
  // La pastille « Now » et les fleches de navigation. Leur fond est fait de la
  // couleur de marque a 16 % : peindre le texte avec cette meme couleur les
  // faisait converger, 3,33 en clair et 4,02 en sombre.
  { texte: "text-brand", fond: "glass-pill", nom: "pastille Now / fleches" },
  // Le bouton de confirmation de SUPPRESSION et la pastille de notification.
  // Ils peignaient du blanc sur --accent-pink : 3,85 en clair, 3,03 en sombre.
  // Sur une action irreversible, le libelle doit se lire sans effort.
  { texte: "text-on-alerte", fond: "bg-alerte", nom: "bouton d alerte" },
  // Le bouton d activation du Lifetime Chart. Il peignait du blanc sur l or,
  // soit 2,73 : le seul bouton menant a un produit paye avait le libelle le
  // moins lisible du produit. Du noir dessus donne 6,70.
  { texte: "text-on-premium", fond: "bg-premium", nom: "bouton premium" },
];

for (const t of themes) {
  const jetons = t.nom === "sombre" ? { ...themes[0].jetons, ...t.jetons } : t.jetons;
  console.log(`\n  Paires, theme ${t.nom}`);
  for (const p of PAIRES) {
    const fg = rgb(jetons[p.texte]);
    // Certains fonds sont des color-mix, pas des hexadecimaux : --glass-pill
    // vaut « la couleur de marque a 16 % sur un voile ». On le resout ici,
    // sinon le controle se tait au lieu de mesurer.
    const bg = rgb(jetons[p.fond]) ?? resoudreMelange(jetons[p.fond], jetons);
    if (!fg || !bg) {
      console.log(`    ${p.nom.padEnd(22)} jeton manquant`);
      echecs++;
      continue;
    }
    const r = contraste(fg, bg);
    const ok = r >= SEUIL;
    if (!ok) echecs++;
    console.log(`    ${p.nom.padEnd(22)} ${r.toFixed(2).padStart(6)}  ${ok ? "ok" : "SOUS LE SEUIL"}`);
  }
}

if (echecs > 0) {
  console.log(`\n  ${echecs} jeton(s) sous le seuil de ${SEUIL}.`);
  console.log(`  Assombris LE TEXTE en gardant sa teinte : la couleur reste de la
  meme famille, elle devient seulement lisible.

  Ne touche pas a la matiere, au lisere ni a l elevation du composant. Ce
  controle mesure du texte ; il n a pas d avis sur le design, et un chiffre
  d ici ne justifie jamais d ajouter une couche.\n`);
  process.exit(1);
}
console.log(`\n  Tous les jetons de texte passent ${SEUIL} dans les deux themes.\n`);
