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

const SEUIL = 4.5;

/** Ce qui doit etre lisible. Le reste porte du decor ou un etat. */
const JETONS = ["text-heading", "text-body", "text-body-subtle", "text-brand", "text-brand-strong"];

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
  const m = /^#([0-9A-Fa-f]{6})$/.exec(v ?? "");
  if (!m) return null;
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
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

if (echecs > 0) {
  console.log(`\n  ${echecs} jeton(s) sous le seuil de ${SEUIL}.`);
  console.log(`  Baisse la luminosite en gardant la teinte : la couleur reste de la
  meme famille, elle devient seulement lisible.\n`);
  process.exit(1);
}
console.log(`\n  Tous les jetons de texte passent ${SEUIL} dans les deux themes.\n`);
