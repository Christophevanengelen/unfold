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

if (echecs > 0) {
  console.log(`\n  ${echecs} jeton(s) sous le seuil de ${SEUIL}.`);
  console.log(`  Baisse la luminosite en gardant la teinte : la couleur reste de la
  meme famille, elle devient seulement lisible.\n`);
  process.exit(1);
}
console.log(`\n  Tous les jetons de texte passent ${SEUIL} dans les deux themes.\n`);
