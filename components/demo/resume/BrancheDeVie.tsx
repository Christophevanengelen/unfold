"use client";

/**
 * « Ta vie entiere », peinte : une branche qui monte, et ce qui fleurit dessus.
 *
 * ─── D OU CA VIENT ──────────────────────────────────────────────────────────
 *
 * Christophe, le 17/09 : « il faut vraiment une oeuvre d art unique que les
 * gens veulent imprimer et mettre sur leur mur », puis « que ca pousse comme un
 * arbre et que les fleurs eclosent », sur des references de sumi-e — branche de
 * prunier, taches d encre, fleurs, sceau rouge.
 *
 * La frise juste en dessous compte ; celle-ci se regarde. Les deux lisent
 * EXACTEMENT les memes donnees, et aucune des deux n en invente.
 *
 * ─── CE QUE CHAQUE FORME EST, EN DONNEE ─────────────────────────────────────
 *
 *  — la branche monte de la premiere annee documentee jusqu a l age atteint.
 *    Elle ne va pas plus haut : le futur n est pas dessine, le produit est
 *    descriptif ;
 *  — son epaisseur suit le nombre de periodes ouvertes cette annee-la
 *    (`annees[].periodes`), un COMPTE, jamais une note ;
 *  — une grappe de petites fleurs se pose aux annees les plus chargees. Sa
 *    densite est ce meme compte ;
 *  — une TACHE d encre marque l ouverture d une periode majeure ;
 *  — une FLEUR marque une bascule, et seulement celles que le moteur marque
 *    lui-meme (`bascules[]`). On n en fabrique aucune ;
 *  — le fil qui relie une tache a une fleur relie un chapitre a une bascule
 *    QUI TOMBE DEDANS. C est un fait de calendrier, pas une causalite : le
 *    texte dit « ouvert a X ans, bascule a Y ans », il ne dit jamais que l un
 *    a produit l autre.
 *
 * ─── POURQUOI UN CANVAS, ET DEUX ────────────────────────────────────────────
 *
 * L encre s ACCUMULE : la ou deux traits se croisent, c est plus sombre. C est
 * gratuit sur un canvas, impossible a imiter en SVG sans tricher. Il en faut
 * deux : celui du bas garde l encre seche, celui du haut est efface a chaque
 * image et ne porte que ce qui est en train d eclore, plus les petales qui
 * derivent. Sans cette separation, une fleur qui grandit laisserait toutes ses
 * tailles intermediaires empilees dessous.
 *
 * ─── LES COULEURS ───────────────────────────────────────────────────────────
 *
 * Aucune n est ecrite ici. L encre vient de deux jetons (`--encre-trait`,
 * `--encre-diluee`, declares dans les deux themes) ; la couleur d une fleur
 * vient du MOTEUR (`phase.color`), et a defaut d un jeton de texte. Le canvas
 * les lit au moment de peindre, et repeint quand le theme change.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { BasculeSegmentee, BoutonFleche } from "@/components/demo/primitives";
import { VERRE_PILULE } from "@/components/demo/primitives/verre";
import { t, type Locale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";
import { toucher } from "@/lib/haptique";
import type { ResumeDeVie } from "@/lib/resume-vie";
import type { MomentumPhase } from "@/types/momentum";
import type { BirthData } from "@/lib/birth-data";
import { fetchZrPics, type LotZR, type PicZR } from "@/lib/zr-pics";

/** eros = amour, spirit = travail, fortune = sante — Marie-Ange, 19/09. */
const FAMILLE_DU_LOT: Record<LotZR, Famille> = { eros: "love", spirit: "work", fortune: "health" };

/* ── Un hasard REPRODUCTIBLE ────────────────────────────────────────────────
   Deux rendus de la meme vie doivent donner la meme image — sinon l affiche
   qu on imprime n est pas celle qu on avait a l ecran. D ou un bruit calcule
   depuis un entier, jamais Math.random() dans le dessin. */
function bruit(n: number): number {
  const x = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d) ^ n;
  const y = Math.imul(x ^ (x >>> 12), 0x297a2d39);
  return ((y ^ (y >>> 15)) >>> 0) / 2147483648 - 1;
}
function lisse(a: number, b: number, t: number): number {
  const k = t * t * (3 - 2 * t);
  return a + (b - a) * k;
}
function ondule(x: number, graine: number): number {
  const i = Math.floor(x);
  return lisse(bruit(i + graine * 1013), bruit(i + 1 + graine * 1013), x - i);
}

/* ── Les pieces du dessin ───────────────────────────────────────────────────
   Chacune prend un contexte : on peint soit sur l encre seche, soit sur le
   calque vivant, avec exactement le meme code. */

type Ctx = CanvasRenderingContext2D;

/** Un tampon doux, mis en cache par couleur : c est la brosse. */
const tampons = new Map<string, HTMLCanvasElement>();
function tampon(col: string): HTMLCanvasElement {
  const connu = tampons.get(col);
  if (connu) return connu;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  if (g) {
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, "rgba(0,0,0,1)");
    rg.addColorStop(0.5, "rgba(0,0,0,0.86)");
    rg.addColorStop(0.8, "rgba(0,0,0,0.33)");
    rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 64, 64);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = col;
    g.fillRect(0, 0, 64, 64);
  }
  tampons.set(col, c);
  return c;
}
function touche(g: Ctx, x: number, y: number, r: number, col: string, a: number) {
  if (r <= 0.08 || a <= 0.004) return;
  g.globalAlpha = Math.min(1, a);
  g.drawImage(tampon(col), x - r, y - r, r * 2, r * 2);
  g.globalAlpha = 1;
}

type Point = { x: number; y: number; u: number };

/**
 * Un coup de pinceau : contour rempli, epais a la pose, effile a la levee.
 *
 * Un trait de calligraphie n est pas une ligne d epaisseur variable — c est une
 * SURFACE. On calcule donc les deux bords le long de la normale, et on remplit.
 * `jusqua` permet de n en peindre qu une partie : c est ce qui fait pousser.
 */
function echo(g: Ctx, pts: Point[], largeur: (u: number) => number, col: string, graine: number) {
  const decale = pts.map((p) => ({ x: p.x + 1, y: p.y + 1, u: p.u }));
  g.save();
  g.globalAlpha = 0.11;
  g.fillStyle = col;
  const gauche: number[][] = [];
  const droite: number[][] = [];
  decale.forEach((p, k) => {
    const a = decale[Math.max(0, k - 1)];
    const b = decale[Math.min(decale.length - 1, k + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const w = (largeur(p.u) / 2) * 1.22;
    gauche.push([p.x - dy / l * w, p.y + dx / l * w]);
    droite.push([p.x + dy / l * w, p.y - dx / l * w]);
  });
  const bord = gauche.concat(droite.reverse());
  g.beginPath();
  g.moveTo(bord[0][0], bord[0][1]);
  for (let i = 1; i < bord.length; i++) g.lineTo(bord[i][0], bord[i][1]);
  g.closePath();
  g.fill();
  g.restore();
  void graine;
}

/** La tache : de l encre diluee qui boit dans le papier. `part` la fait s etaler. */
function tache(g: Ctx, x: number, y: number, r: number, col: string, graine: number, part: number) {
  const rr = r * (0.3 + 0.7 * part);
  const a = 0.35 + 0.65 * part;
  const N = 34;
  const base: number[][] = [];
  for (let i = 0; i < N; i++) {
    const ang = (i / N) * Math.PI * 2;
    const k = 1 + 0.17 * Math.sin(ang * 3 + graine) + 0.15 * ondule(ang * 1.7 + graine, graine);
    base.push([x + Math.cos(ang) * rr * k, y + Math.sin(ang) * rr * k * 0.9]);
  }
  g.fillStyle = col;
  for (let c = 0; c < 12; c++) {
    let p = base;
    let v = 0.26;
    for (let d = 0; d < 3; d++) {
      const o: number[][] = [];
      for (let i = 0; i < p.length; i++) {
        const pa = p[i];
        const pb = p[(i + 1) % p.length];
        o.push(pa);
        const dx = pb[0] - pa[0];
        const dy = pb[1] - pa[1];
        const l = Math.hypot(dx, dy) || 1;
        const off = bruit(graine + i * 7 + d * 211 + c * 53) * l * v;
        o.push([(pa[0] + pb[0]) / 2 - (dy / l) * off, (pa[1] + pb[1]) / 2 + (dx / l) * off]);
      }
      p = o;
      v *= 0.6;
    }
    g.globalAlpha = 0.06 * a;
    g.beginPath();
    g.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]);
    g.closePath();
    g.fill();
  }
  g.globalAlpha = 1;
  touche(g, x, y, rr * 0.6, col, 0.3 * a);
}

/**
 * Un petale, en deux courbes. `forme` va du rond a l effile.
 *
 * `tourne` (0..1) l aplatit horizontalement : c est ce qui donne l illusion
 * qu il pivote sur lui-meme en tombant. Sans elle, un petale qui descend est
 * un confetti ; avec elle, il vrille — c est toute la difference entre une
 * animation et une chute de cerisier.
 */
function petale(g: Ctx, x: number, y: number, ang: number, len: number, larg: number, col: string, a: number, forme: number, tourne = 1) {
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  if (tourne !== 1) g.scale(Math.max(0.08, Math.abs(tourne)), 1);
  const wb = larg * 0.66 * forme;
  const wt = larg * 0.52 * (2 - forme);
  g.beginPath();
  g.moveTo(0, 0);
  g.bezierCurveTo(wb, -len * 0.2, wt, -len * 0.84, 0, -len);
  g.bezierCurveTo(-wt, -len * 0.84, -wb, -len * 0.2, 0, 0);
  g.closePath();
  const rg = g.createRadialGradient(0, -len * 0.6, 0, 0, -len * 0.6, len);
  rg.addColorStop(0, col);
  rg.addColorStop(1, col);
  g.fillStyle = rg;
  g.globalAlpha = a;
  g.fill();
  g.globalAlpha = 1;
  g.restore();
}

/** La fleur. `part` va du bouton ferme a la fleur ouverte. */
function fleurette(g: Ctx, x: number, y: number, r: number, col: string, graine: number, a: number, part: number, encre: string) {
  g.save();
  g.globalAlpha = a;
  fleurDePrunier(g, x, y, r * 2, col, encre, graine, part, bruit(graine + 2), -0.6);
  g.restore();
}

/* ═══════════════════════════════════════════════════════════════════════════
   CE QUI EST DESSINE

   UNE GRAINE = UNE PERIODE QUI ABOUTIT.

   Christophe, le 17/09 : « montre les graines avec un petit cercle qui montre
   la ou il faut cliquer, pour qu on comprenne qu une graine egale une periode
   avec un aboutissement ». C est devenu la regle du dessin.

   Le moteur note chaque periode de 1 a 4 (`score`) et nomme lui-meme 3
   « Majeur » et 4 « Exceptionnel » (lib/domain-config.tsx). Une periode ainsi
   notee devient UNE BRINDILLE :
     — sa TACHE a la base, la ou elle s ouvre, cerclee d un anneau qui respire :
       c est la qu on touche ;
     — sa FLEUR a la pointe, la ou elle aboutit ;
     — et la brindille elle-meme entre les deux : sa longueur, c est la duree.
   Le lien graine -> fleur n est donc pas un fil pose dessus, c est le bois.

   La direction artistique (17/09, technique du prunier a l encre) impose :
   quatre calibres de trait avec decrochement aux noeuds ; deux valeurs
   d encre par coup, jamais d aplat ; le poil sec confine au tronc, en fin de
   geste, cote exterieur ; les fleurs SEULEMENT sur les brindilles ; 65 a 75 %
   de vide. Les chiffres ci-dessous sont les siens.

   Le temps DESCEND : la naissance en haut, aujourd hui en bas. On parcourt sa
   vie au doigt, et la branche se peint a mesure qu on avance. C est donc une
   branche retombante qui entre par le haut — un motif classique de l estampe,
   epaisse a l entree, cheveu a la pointe.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Une duree en jours, dite dans la langue : Intl s en charge, dix langues sans une chaine. */
function duree(jours: number, locale: string): string {
  const j = Math.max(1, Math.round(jours));
  const dit = (n: number, unit: "day" | "month" | "year") => new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "long" }).format(n);
  if (j >= 365) return dit(Math.round(j / 365.25), "year");
  if (j >= 30) return dit(Math.round(j / 30.44), "month");
  return dit(j, "day");
}

// Vivait ici sous son propre nom, identique au caractere pres a `PILL_STYLE`
// dans MomentumTimelineV2.tsx (Timeline) — une seule definition maintenant,
// voir components/demo/primitives/verre.ts.
const VERRE = VERRE_PILULE;

/** Le conteneur qui defile vraiment : l app fait defiler une div, pas la fenetre. */
function conteneurDefilant(el: HTMLElement | null): HTMLElement | null {
  let p = el?.parentElement ?? null;
  while (p) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight + 4) return p;
    p = p.parentElement;
  }
  return null;
}

/** Le chemin entier : cent ans de papier, vecus ou non. */
const ANS_DE_VIE = 100;

const L = 340;
const PAD_T = 60;
const PAD_B = 90;
const yDe = (pos: number, H: number) => PAD_T + pos * (H - PAD_T - PAD_B);

type Famille = "love" | "health" | "work";
const FAMILLES: Famille[] = ["love", "work", "health"];
const JETON_FAMILLE: Record<Famille, string> = {
  love: "--domaine-love",
  work: "--domaine-career",
  health: "--domaine-health-energy",
};
const CLEF_FAMILLE: Record<Famille, string> = {
  love: "resume.branche_dom_love",
  work: "resume.branche_dom_work",
  health: "resume.branche_dom_health",
};
/** Le sujet grammatical d une famille, pour les phrases branche_texte_* (docs/zr-doctrine.md). */
const SUJET_FAMILLE: Record<Famille, string> = {
  love: "resume.branche_sujet_love",
  work: "resume.branche_sujet_work",
  health: "resume.branche_sujet_health",
};
/** Majuscule sur la premiere lettre : les sujets sont ecrits en milieu de phrase. */
function majuscule(s: string): string {
  return s.length ? s[0].toLocaleUpperCase() + s.slice(1) : s;
}

/* ── Le coup de pinceau : des poils, pas une forme ────────────────────────
   Le contour rempli d une seule valeur faisait « buche ». Ici le trait est
   une poignee de POILS (Strassmann, Hairy Brushes, 1986) : chacun a sa
   position sous la touffe, sa charge d encre, sa vitesse d epuisement.
   Chaque poil pose des empreintes serrees le long du geste ; la charge
   pilote l alpha ET la largeur, et decroit de facon exponentielle sur la
   seconde moitie du geste. Le poil sec (飛白) n est pas gomme : il n est
   simplement plus depose, la ou la charge passe sous le grain du papier.
   Deux valeurs d encre par coup, comme le veut la direction artistique :
   le flanc de pression est charge (0,80), le flanc de fuite l est moins
   (0,45). `sec` reserve l epuisement aux ordres 0 et 1 — le tronc. */
function coupDePinceau(g: Ctx, pts: Point[], largeur: (u: number) => number, col: string, graine: number, jusqua: number, sec: boolean, depuis = 1) {
  const n = Math.max(2, Math.min(pts.length, jusqua));
  if (n < 2) return;
  // autant de poils que le trait est large : un cheveu en a cinq, le tronc douze
  const wMax = Math.max(largeur(0), largeur(0.5), largeur(1)) / 2;
  const N = Math.max(5, Math.min(12, Math.round(wMax / 1.5)));
  // la touffe : les poils se serrent au centre, s eclaircissent aux bords
  const poils = Array.from({ length: N }, (_, j) => {
    const u = (j / (N - 1)) * 2 - 1;
    const off = Math.sign(u) * Math.pow(Math.abs(u), 0.7) * 0.92;
    return {
      off,
      charge: (off < 0 ? 0.8 : 0.45) * (0.85 + 0.3 * Math.abs(bruit(graine + j * 7))),
      fuite: sec ? 0.55 + 0.5 * Math.abs(bruit(graine + j * 11)) : 0.3,
      phase: Math.abs(bruit(graine + j * 13)) * 400,
    };
  });
  let longueur = 0;
  for (let k = 1; k < pts.length; k++) longueur += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
  const SEC = sec ? 0.5 : 0.18; // le grain du papier qui refuse l encre
  g.save();
  g.fillStyle = col;
  let s = 0;
  let reste = 0; // l empreinte suivante, reportee d un segment a l autre
  for (let k = 1; k < n; k++) {
    const a = pts[k - 1];
    const b = pts[k];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    // le cote convexe du geste : c est la que le poil sec a le droit d etre
    const c = pts[Math.min(pts.length - 1, k + 1)];
    const convexe = Math.sign(dx * (c.y - b.y) - dy * (c.x - b.x)) || 1;
    const wA = largeur(a.u) / 2;
    const wB = largeur(b.u) / 2;
    const rayon = Math.max(0.8, ((wA + wB) / N) * 1.05);
    const pas = rayon * 0.55;
    let d = reste;
    if (k < depuis) {
      // deja pose : on avance l etat du geste sans rien deposer
      for (; d < l; d += pas) { /* rien */ }
      reste = d - l;
      s += l;
      continue;
    }
    for (; d < l; d += pas) {
      const tt = d / l;
      const sx = a.x + dx * tt;
      const sy = a.y + dy * tt;
      const w = wA + (wB - wA) * tt;
      const avancee = Math.max(0, ((s + d) / longueur - 0.5) / 0.5); // 0 avant la moitie
      for (const p of poils) {
        const exterieur = p.off * convexe > 0;
        const fuite = exterieur ? p.fuite : p.fuite * 0.3;
        const encre = p.charge * Math.exp(-avancee * fuite) * (1 + 0.12 * bruit(Math.round((s + d) / 9) + p.phase));
        // le grain du papier, lu le long du poil : des fibres, pas des briques
        const grain = 0.5 + 0.5 * bruit(Math.round((s + d) / 3) + Math.round(p.phase * 11) + graine);
        if (avancee > 0 && encre < (1 - grain) * SEC) continue; // la fibre reste blanche
        const ww = w * (0.5 + 0.5 * encre);
        const x = sx + nx * p.off * ww + 0.4 * bruit(Math.round((s + d) / 5) + p.phase * 3);
        const y = sy + ny * p.off * ww;
        g.globalAlpha = Math.min(0.6, (sec ? 0.4 : 0.5) * encre * (0.8 + 0.4 * grain));
        g.beginPath();
        g.arc(x, y, rayon * (0.65 + 0.45 * encre), 0, 6.2832);
        g.fill();
      }
    }
    reste = d - l;
    s += l;
  }
  g.restore();
}

/* ── La fleur de prunier (梅花) ────────────────────────────────────────────
   Cinq petales RONDS a 72° ± 7°, rayon ± 8 % ; coeur a 0,2 du diametre ; sept
   etamines en eventail de 160°, fines, aux antheres en encre brulee ; trois
   sepales du cote de l attache. Le trait de petale est plus CLAIR et plus fin
   que la brindille qui le porte : c est ce rapport qui fait respirer la fleur.
   Les fleurs varient par ARCHETYPES, pas par bruit : face, profil, bouton,
   dos, tombante. `part` va du bouton ferme a la fleur ouverte. */
type Archetype = "face" | "profil" | "bouton" | "dos" | "tombante";
function archetypeDe(graine: number, ouverte: boolean): Archetype {
  const r = (bruit(graine + 101) + 1) / 2;
  if (ouverte) return r < 0.7 ? "face" : r < 0.88 ? "profil" : "dos";
  return r < 0.4 ? "face" : r < 0.6 ? "profil" : r < 0.8 ? "bouton" : r < 0.9 ? "dos" : "tombante";
}
function fleurDePrunier(g: Ctx, x: number, y: number, D: number, col: string, encre: string, graine: number, part: number, versX: number, versY: number, ouverte = false) {
  const arch = archetypeDe(graine, ouverte);
  const rot = Math.atan2(versY, versX) + bruit(graine) * 0.44; // regarde vers l exterieur, ± 25°
  const ouvre = Math.min(1, part * 1.15);
  const Lp = D * 0.45 * (arch === "bouton" ? 0.33 : 1) * (0.2 + 0.8 * ouvre);
  const coeur = D * 0.2;
  const aplati = arch === "profil" ? 0.45 : arch === "tombante" ? 0.7 : 1;
  const al = Math.min(1, part * 1.6);
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.scale(1, aplati);
  const nP = arch === "profil" ? 3 : arch === "bouton" ? 2 : 5;
  for (let i = 0; i < nP; i++) {
    const ang = (i * 6.2832) / 5 * (0.3 + 0.7 * ouvre) + bruit(graine + i * 3) * 0.122;
    const len = Lp * (1 + 0.08 * bruit(graine + i * 5));
    const larg = len * (0.88 + 0.12 * Math.abs(bruit(graine + i * 7))); // rond, pas effile
    g.save();
    g.rotate(ang);
    g.beginPath();
    g.moveTo(0, -coeur * 0.5);
    g.bezierCurveTo(larg * 0.55, -coeur * 0.5 - len * 0.15, larg * 0.5, -len * 0.95, 0, -len);
    g.bezierCurveTo(-larg * 0.5, -len * 0.95, -larg * 0.55, -coeur * 0.5 - len * 0.15, 0, -coeur * 0.5);
    g.closePath();
    g.globalAlpha = 0.72 * al;
    g.fillStyle = col;
    g.fill();
    // le trait de petale : 淡墨, 1 unite, plus clair que le bois
    g.globalAlpha = 0.3 * al;
    g.lineWidth = 0.9;
    g.strokeStyle = col;
    g.stroke();
    g.restore();
  }
  // le coeur
  g.globalAlpha = 0.45 * al;
  g.fillStyle = col;
  g.beginPath();
  g.arc(0, 0, coeur * 0.5, 0, 6.2832);
  g.fill();
  // etamines et antheres, sauf de dos et en bouton
  if (arch !== "dos" && arch !== "bouton" && part > 0.65) {
    const s2 = Math.min(1, (part - 0.65) / 0.35);
    const nE = 7;
    const evt = 160 * (Math.PI / 180);
    g.strokeStyle = col;
    g.lineWidth = 0.45;
    for (let i = 0; i < nE; i++) {
      const a = -evt / 2 + (evt * i) / (nE - 1) + bruit(graine + i * 13) * 0.08 - Math.PI / 2;
      const lg = D * 0.28 * (0.85 + 0.3 * Math.abs(bruit(graine + i * 17))) * s2;
      const ex = Math.cos(a) * lg;
      const ey = Math.sin(a) * lg;
      g.globalAlpha = 0.34 * al;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(ex, ey);
      g.stroke();
      // l anthere : le seul point d encre brulee de la fleur
      g.globalAlpha = 0.8 * al * s2;
      g.fillStyle = encre;
      g.beginPath();
      g.arc(ex, ey, 0.7, 0, 6.2832);
      g.fill();
    }
  }
  // le calice : trois sepales du cote de l attache — la fleur est POSEE
  g.globalAlpha = 0.55 * al;
  g.fillStyle = encre;
  for (let i = -1; i <= 1; i++) {
    const a = Math.PI / 2 + i * 0.5;
    g.beginPath();
    g.arc(Math.cos(a) * coeur * 0.55, Math.sin(a) * coeur * 0.55, D * 0.06, 0, 6.2832);
    g.fill();
  }
  g.restore();
}

/* ── La graine : des bourgeons, pas une fleur ──────────────────────────────
   Pre-ombre d un Loosing of the Bond a venir (~8 ans) : la forme de reference
   (`branch-seeds-zr.svg`) est une brindille nue portant cinq bourgeons de
   taille decroissante — jamais une fleur ouverte, la periode n a pas encore
   fleuri, elle l annonce. Ici, le meme tampon doux que la tache et la fleur
   (`touche`), pour rester dans l encre plutot que dans l aplat SVG. */
function graineBourgeons(g: Ctx, x: number, y: number, ang: number, D: number, col: string, graine: number, a: number) {
  if (a <= 0.01) return;
  const n = 5;
  const tailles = [1, 0.84, 0.7, 0.56, 0.42];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const dd = D * 0.55 * t;
    const bx = x + Math.cos(ang) * dd + bruit(graine + i * 7) * D * 0.05;
    const by = y + Math.sin(ang) * dd + bruit(graine + i * 11) * D * 0.05;
    touche(g, bx, by, D * 0.16 * tailles[i], col, a * 0.85);
  }
}

/* ── Le lotus : un eclat de rayons, pas des petales ────────────────────────
   Loosing of the Bond : le pivot majeur de la sequence. La forme de reference
   (`lotus-zr.svg`) est un eclat de douze rayons fins depuis un seul point —
   plus fort et plus lu qu une fleur ordinaire. Rendu ici en poils d encre
   (meme brosse que `coupDePinceau`), pas en aplat, pour rester dans l unite
   du dessin. */
function eclatLotus(g: Ctx, x: number, y: number, D: number, col: string, encre: string, graine: number, a: number, part: number) {
  if (a <= 0.01 || part <= 0.01) return;
  const nR = 12;
  const long = D * 0.9 * Math.min(1, part * 1.2);
  g.save();
  g.translate(x, y);
  for (let i = 0; i < nR; i++) {
    const ang = (i / nR) * 6.2832 + bruit(graine + i * 5) * 0.14 - Math.PI / 2;
    const lg = long * (0.75 + 0.35 * Math.abs(bruit(graine + i * 9)));
    const larg = D * 0.05;
    const ex = Math.cos(ang) * lg;
    const ey = Math.sin(ang) * lg;
    const nx = -Math.sin(ang) * larg;
    const ny = Math.cos(ang) * larg;
    g.globalAlpha = 0.6 * a;
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(nx, ny);
    g.lineTo(ex, ey);
    g.lineTo(-nx, -ny);
    g.closePath();
    g.fill();
  }
  g.globalAlpha = 0.85 * a;
  g.fillStyle = encre;
  g.beginPath();
  g.arc(0, 0, D * 0.09, 0, 6.2832);
  g.fill();
  g.restore();
}

/* ── L anneau qui respire ─────────────────────────────────────────────────
   La ou il faut toucher. Un seul trait fin, jamais un disque : c est un
   repere, pas un bouton. */
function anneau(g: Ctx, x: number, y: number, r: number, col: string, phase: number) {
  const k = 0.5 + 0.5 * Math.sin(phase);
  g.save();
  g.strokeStyle = col;
  g.lineWidth = 1;
  g.globalAlpha = 0.55 - 0.3 * k;
  g.beginPath();
  g.arc(x, y, r + 3 + 5 * k, 0, 6.2832);
  g.stroke();
  g.globalAlpha = 0.85;
  g.lineWidth = 1.2;
  g.beginPath();
  g.arc(x, y, r + 2, 0, 6.2832);
  g.stroke();
  g.restore();
}

/* ── Ce qui est pose sur la branche ─────────────────────────────────────── */

/** Une periode majeure : une brindille, sa tache a la base, sa fleur a la pointe. */
type Paire = {
  famille: Famille;
  posGraine: number;
  posFleur: number;
  quandGraine: string;
  quandFleur: string;
  ecart: string;
  domaine: string | null;
  score: number;
  graine: number;
  /** Encore a venir : la fleur n est pas eclose, on ne la dessine pas ouverte. */
  aVenir: boolean;
  /**
   * Periode "peak" au sens du moteur (isPeakPeriod, angulaire au Lot de
   * Fortune — voir api-doc/zr.md). Demande par Christophe le 18/09/2026 :
   * une rafale de petales se detache quand sa fleur eclot, plutot que le
   * filet ordinaire d une fleur normale.
   */
  pic: boolean;
  /**
   * Marie-Ange, 19/09 (`files (7)/zr-page-lotus-branche.patch` + les deux
   * SVG de reference) : trois genres de marque, jamais confondus.
   *   — "fleur"  : pic ordinaire, le bouquet de prunier habituel ;
   *   — "graine" : pre-ombre d un LB a venir — des bourgeons le long de la
   *     brindille, PAS une fleur ouverte : la periode n a pas encore fleuri,
   *     elle l annonce ;
   *   — "lotus"  : Loosing of the Bond — un eclat de rayons depuis la
   *     pointe, le pivot majeur de la sequence.
   */
  genre: "fleur" | "graine" | "lotus";
  /** Uniquement sur une graine : la date du LB qu elle annonce (docs/zr-doctrine.md). */
  lbDate: string | null;
};
type PairePosee = Paire & {
  brindille: Point[];
  gx: number; gy: number; rG: number;
  fx: number; fy: number; D: number;
  vx: number; vy: number; // vers l exterieur, pour orienter la fleur
  // Au bout de la brindille, ce n est jamais une fleur seule : c est un
  // BOUQUET, comme sur une vraie branche de prunier — une principale et
  // plusieurs autres, tassees, de tailles inegales.
  bouquet: { x: number; y: number; D: number; graine: number; retard: number }[];
};
type Grappe = { pos: number; compte: number; famille: Famille | null; quand: string; graine: number };
type GrappePosee = Grappe & { x: number; y: number; R: number; brindille: Point[]; boutons: { x: number; y: number; D: number; graine: number }[] };

export function BrancheDeVie({
  resume,
  locale,
  maintenant,
  phasesAnnee,
  phasesVie,
  birthData,
}: {
  resume: ResumeDeVie;
  locale: Locale;
  /** L instant de lecture, fige par l appelant — jamais `Date.now()` ici. */
  maintenant: number;
  /** Les periodes de l annee : la densite du tronc (comptes) a l echelle annee/mois. */
  phasesAnnee?: MomentumPhase[];
  /** Les periodes de toute la vie : la densite du tronc a l echelle vie. Les FLEURS, elles, viennent de `/api/zr-pics` (voir `picsZR` plus bas), pas de ce paquet. */
  phasesVie?: MomentumPhase[];
  /** Le theme : ce qu il faut pour demander les pics ZR au moteur. */
  birthData?: BirthData | null;
}) {
  const fige = useReducedMotion();
  const hote = useRef<HTMLDivElement | null>(null);
  const encreRef = useRef<HTMLCanvasElement | null>(null);
  const vifRef = useRef<HTMLCanvasElement | null>(null);
  const [echelle, setEchelle] = useState<"vie" | "annee" | "mois">("vie");
  const [eteintes, setEteintes] = useState<Set<Famille>>(() => new Set());
  const [choix, setChoix] = useState<number | null>(null); // index de la paire
  const [cle, setCle] = useState(0);
  /** Ou le regard se trouve dans le papier, 0..1. Pour la pastille et les sauts. */
  const [ou, setOu] = useState(0);
  /** Les trois domaines sont allumes d office : le reglage reste range. */
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const signature = useRef("");

  /** Le niveau ZR que cette echelle regarde : vie -> L2, annee -> L3, mois -> L4. */
  const niveauZR: 2 | 3 | 4 = echelle === "vie" ? 2 : echelle === "annee" ? 3 : 4;
  const l4Year = useMemo(() => new Date(maintenant).getFullYear(), [maintenant]);

  /* ── Les pics reels, demandes au moteur — jamais a toctoc ─────────────────
     Marie-Ange, 19/09 : `toctoc-app-short.php` ne porte jamais `isPeakPeriod`
     (mesure sur deux themes reels, 0/642 et 0/884). Les fleurs viennent donc
     de `/api/zr-pics`, un aller-retour par niveau, jamais par echelle visitee
     deux fois (garde par ref, `fetchZrPics` porte deja son propre cache
     disque cote lib/zr-pics.ts). */
  const clefNiveau = niveauZR === 4 ? `4-${l4Year}` : String(niveauZR);
  const [picsParNiveau, setPicsParNiveau] = useState<Record<string, PicZR[]>>({});
  const demandesEnCours = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!birthData || demandesEnCours.current.has(clefNiveau)) return;
    demandesEnCours.current.add(clefNiveau);
    let abandonne = false;
    fetchZrPics(birthData, niveauZR, niveauZR === 4 ? l4Year : undefined)
      .then((pics) => { if (!abandonne) setPicsParNiveau((prev) => ({ ...prev, [clefNiveau]: pics })); })
      .catch(() => { demandesEnCours.current.delete(clefNiveau); });
    return () => { abandonne = true; };
  }, [birthData, niveauZR, l4Year, clefNiveau]);
  const picsActuels = picsParNiveau[clefNiveau] ?? [];

  /* ── La fenetre de temps ─────────────────────────────────────────────────
     Trois echelles, memes periodes datees : un ZOOM. Tout est ramene a une
     position 0 (le haut, le debut) .. 1 (le bas, maintenant). Les libelles
     viennent d Intl : dix langues sans une chaine a traduire. */
  const fen = useMemo(() => {
    const now = new Date(maintenant);
    let t0: number;
    let t1: number;
    let unites: number;
    const reperes: { pos: number; libelle: string }[] = [];
    let libelleDe: (pos: number) => string;
    let ecartDe: (a: number, b: number) => string;
    const posDe = (t: number) => Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    if (echelle === "vie") {
      const nais = resume.annees.length && resume.age > 0 ? maintenant - resume.age * 365.2425 * 86400000 : maintenant - 86400000 * 365;
      // DE ZERO A CENT ANS. Christophe, le 17/09 : « ca doit pousser de 0 a
      // 100 ans, le debut c est la naissance, plus on descend plus on avance
      // dans l age ». Le chemin entier est donc la, y compris ce qui n est pas
      // vecu : la branche s arrete a aujourd hui, le reste est du papier.
      t0 = nais;
      t1 = nais + ANS_DE_VIE * 365.2425 * 86400000;
      unites = ANS_DE_VIE;
      for (let age = 0; age <= ANS_DE_VIE; age += 10) {
        reperes.push({ pos: posDe(nais + age * 365.2425 * 86400000), libelle: String(age) });
      }
      const fl = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" });
      libelleDe = (pos) => fl.format(new Date(t0 + pos * (t1 - t0)));
      ecartDe = (a, b) => duree(((b - a) * (t1 - t0)) / 86400000, locale);
    } else if (echelle === "annee") {
      // La fenetre s arrete a MAINTENANT : le bois ne pousse pas dans le futur.
      // Ce qui est date devant est dans la liste, en bas — jamais dessine.
      t0 = new Date(now.getFullYear(), 0, 1).getTime();
      t1 = maintenant;
      unites = Math.max(1, (t1 - t0) / (30.44 * 86400000));
      const fmt = new Intl.DateTimeFormat(locale, { month: "short" });
      for (let m = 0; m <= now.getMonth(); m++) {
        const d = new Date(now.getFullYear(), m, 1).getTime();
        reperes.push({ pos: posDe(d), libelle: fmt.format(new Date(d)) });
      }
      const fl = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });
      libelleDe = (pos) => fl.format(new Date(t0 + pos * (t1 - t0)));
      ecartDe = (a, b) => duree(((b - a) * (t1 - t0)) / 86400000, locale);
    } else {
      t0 = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      t1 = maintenant;
      unites = Math.max(1, (t1 - t0) / 86400000);
      for (let d = 0; d < unites; d += 5) {
        reperes.push({ pos: posDe(t0 + d * 86400000), libelle: String(d + 1) });
      }
      const fl = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });
      libelleDe = (pos) => fl.format(new Date(t0 + pos * (t1 - t0)));
      ecartDe = (a, b) => duree(((b - a) * (t1 - t0)) / 86400000, locale);
    }
    return { t0, t1, unites, reperes, libelleDe, ecartDe, posDe, posMaintenant: posDe(maintenant) };
  }, [echelle, resume, maintenant, locale]);

  /* ── Les pics ZR -> les paires ; toutes les periodes -> la densite ────────
     Marie-Ange, 19/09 : « ne pas se soucier du toctoc pour la branche de vie,
     seulement les donnees ZR ». Toctoc ne sert plus qu a l epaisseur du tronc
     (`comptes`, une texture generale) — jamais aux fleurs. Chaque fleur vient
     de `picsActuels` (voir l effet plus haut, `/api/zr-pics`), un pic REEL du
     Releasing zodiacal, au niveau L2/L3/L4 selon l echelle, pour chacun des
     trois lots (eros/spirit/fortune -> amour/travail/sante). Aucun plafond,
     aucun tri par score : chaque pic reel du niveau et de la fenetre visibles
     doit fleurir. */
  const donnees = useMemo(() => {
    const source = echelle === "vie" ? (phasesVie ?? []) : (phasesAnnee ?? []);
    const per = source
      .map((ph) => ({ ph, d: new Date(ph.startDate).getTime(), f: ph.endDate ? new Date(ph.endDate).getTime() : null }))
      .filter((x) => Number.isFinite(x.d) && x.d < fen.t1 && (x.f === null || x.f > fen.t0));

    // La densite : combien de periodes ouvertes par unite. Reste sur toctoc —
    // une texture generale du tronc, pas une affirmation de pic.
    const comptes: number[] = [];
    const n = Math.max(2, Math.round(fen.unites));
    for (let i = 0; i < n; i++) {
      const a = fen.t0 + ((fen.t1 - fen.t0) * i) / n;
      const b = fen.t0 + ((fen.t1 - fen.t0) * (i + 1)) / n;
      comptes.push(per.filter((x) => x.d < b && (x.f === null || x.f > a)).length);
    }

    const dansLaFenetre = picsActuels
      .map((p) => ({ p, d: new Date(p.startDate).getTime(), f: new Date(p.endDate).getTime() }))
      .filter((x) => Number.isFinite(x.d) && Number.isFinite(x.f) && x.d < fen.t1 && x.f > fen.t0 && x.d >= fen.t0)
      .sort((a, b) => a.d - b.d);

    const genreDe = (p: PicZR): Paire["genre"] => (p.lb ? "lotus" : p.preLB ? "graine" : "fleur");

    const paires: Paire[] = [];
    for (const x of dansLaFenetre) {
      const pG = fen.posDe(x.d);
      const pF = fen.posDe(x.f);
      if (paires.some((p) => Math.abs(p.posGraine - pG) < 0.045)) continue;
      paires.push({
        famille: FAMILLE_DU_LOT[x.p.lot],
        posGraine: pG,
        posFleur: Math.max(pG + 0.02, pF),
        quandGraine: fen.libelleDe(pG),
        quandFleur: fen.libelleDe(pF),
        ecart: fen.ecartDe(pG, pF),
        domaine: null,
        score: 3,
        graine: Math.round(x.d / 3600000) % 100000,
        aVenir: x.f > maintenant,
        pic: true,
        genre: genreDe(x.p),
        lbDate: x.p.lbDate ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(x.p.lbDate)) : null,
      });
    }

    // Aujourd hui : ce qui est ouvert, par famille — parmi les pics ZR eux-memes.
    const ouvertes: Record<Famille, number> = { love: 0, work: 0, health: 0 };
    dansLaFenetre.forEach((x) => {
      if (x.d <= maintenant && x.f >= maintenant) ouvertes[FAMILLE_DU_LOT[x.p.lot]]++;
    });
    // Les floraisons qui viennent : les memes pics, pas encore ouverts, les
    // trois prochaines.
    const aVenir = dansLaFenetre
      .filter((x) => x.d > maintenant)
      .slice(0, 3)
      .map((x) => ({ famille: FAMILLE_DU_LOT[x.p.lot] as Famille | null, quand: new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(new Date(x.d)) }));
    return { comptes, paires, ouvertes, aVenir };
  }, [echelle, phasesVie, phasesAnnee, picsActuels, fen, maintenant, locale]);

  /* ── La geometrie : la branche retombante et ce qui s y pose ─────────────
     Hauteur du dessin selon le nombre d unites : on parcourt, on n entasse pas.
     Axe du tronc au tiers (0,34 ou 0,66 de la largeur), diagonale tenue,
     trois tournants nets, courbure aux noeuds seulement. */
  // Cent ans ne tiennent pas sur deux ecrans : on parcourt, on n entasse pas.
  // Le plafond reste sous la limite d aire d un canvas iOS (dpr plafonne a 2).
  const H = Math.max(1400, Math.min(echelle === "vie" ? 4400 : 2800, Math.round(fen.unites * (echelle === "vie" ? 42 : echelle === "annee" ? 190 : 72))));

  const plan = useMemo(() => {
    const n = donnees.comptes.length;
    const haut = Math.max(1, ...donnees.comptes);
    // le tronc : 5 noeuds, entre-noeuds inegaux, trois tournants
    const entre = [1, 0.62, 1.45, 0.78, 1.2];
    const tot = entre.reduce((a, b) => a + b, 0);
    const tournants = [27, -33, 18, -22, 12].map((d) => (d * Math.PI) / 180);
    const cote = bruit(7) > 0 ? 0.34 : 0.66;
    const segments: { pts: Point[]; u0: number; u1: number; graine: number; larg0: number; larg1: number }[] = [];
    const noeuds: { u: number; x: number; y: number }[] = [];
    let x = L * cote;
    let cap = (22 * Math.PI) / 180 * (cote < 0.5 ? 1 : -1); // la diagonale dominante
    let capAvant = cap;
    let u = 0;
    let larg = 21; // ordre 0 — 6 % de la largeur, le calibre du kakemono
    noeuds.push({ u: 0, x, y: yDe(0, H) });
    for (let i = 0; i < entre.length; i++) {
      const u0 = u;
      const u1 = i === entre.length - 1 ? 1 : u + entre[i] / tot;
      cap += tournants[i];
      const y0 = yDe(u0, H);
      const y1 = yDe(u1, H);
      const x1 = Math.max(60, Math.min(L - 60, x + Math.tan(cap) * (y1 - y0) * 0.34));
      // continuite de tangente au noeud : le geste ne casse pas, il tourne
      const capAvant0 = capAvant;
      const x0 = x;
      const lg = Math.hypot(x1 - x, y1 - y0);
      const c1x = x + Math.sin(capAvant) * lg * 0.28;
      const c1y = y0 + Math.cos(capAvant) * lg * 0.28;
      const c2x = x1 - Math.sin(cap) * lg * 0.36 + bruit(i * 29 + 3) * 5;
      const c2y = y1 - Math.cos(cap) * lg * 0.36;
      const pts: Point[] = [];
      const N = 44;
      for (let k = 0; k <= N; k++) {
        const s = k / N;
        const v = 1 - s;
        pts.push({
          x: v * v * v * x + 3 * v * v * s * c1x + 3 * v * s * s * c2x + s * s * s * x1,
          y: v * v * v * y0 + 3 * v * v * s * c1y + 3 * v * s * s * c2y + s * s * s * y1,
          u: u0 + (u1 - u0) * s,
        });
      }
      capAvant = cap;
      const larg1 = larg * 0.9; // 8-12 % de perte dans le segment
      if (i === 0) {
        // l entree : le geste vient d au-dessus du cadre
        const ex0 = Math.sin(capAvant0) * 70;
        const ey0 = Math.cos(capAvant0) * 70;
        for (let k = 8; k >= 1; k--) pts.unshift({ x: x0 - ex0 * (k / 8), y: y0 - ey0 * (k / 8), u: -0.001 * k });
      }
      segments.push({ pts, u0, u1, graine: i * 7 + 1, larg0: larg, larg1 });
      larg = larg1 * 0.85; // decrochement au noeud
      x = x1;
      u = u1;
      noeuds.push({ u: u1, x, y: y1 });
    }
    const largeurTronc = (uu: number) => {
      const sg = segments.find((s) => uu <= s.u1) ?? segments[segments.length - 1];
      const s = (uu - sg.u0) / (sg.u1 - sg.u0 || 1);
      const base = sg.larg0 + (sg.larg1 - sg.larg0) * Math.max(0, Math.min(1, s));
      // la densite, lissee d une annee a l autre : le bois grossit, il ne saute pas
      const pos = Math.max(0, Math.min(n - 1, uu * (n - 1)));
      const i0 = Math.floor(pos);
      const c = (donnees.comptes[i0] ?? 0) * (1 - (pos - i0)) + (donnees.comptes[Math.min(n - 1, i0 + 1)] ?? 0) * (pos - i0);
      return base * (0.9 + 0.2 * (c / haut)) * (1 + 0.04 * ondule(uu * 6, 3));
    };
    const surLeTronc = (uu: number) => {
      const sg = segments.find((s) => uu <= s.u1) ?? segments[segments.length - 1];
      const s = Math.max(0, Math.min(1, (uu - sg.u0) / (sg.u1 - sg.u0 || 1)));
      const k = Math.round(s * (sg.pts.length - 1));
      const p = sg.pts[k];
      const a = sg.pts[Math.max(0, k - 1)];
      const b = sg.pts[Math.min(sg.pts.length - 1, k + 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l = Math.hypot(dx, dy) || 1;
      return { x: p.x, y: p.y, nx: -dy / l, ny: dx / l, tx: dx / l, ty: dy / l, w: largeurTronc(uu) };
    };

    // les brindilles : une par paire, de la graine (base) a la fleur (pointe)
    const paires: PairePosee[] = donnees.paires.map((p, i) => {
      const bp = surLeTronc(p.posGraine);
      const dir = bruit(p.graine + 3) > 0 ? 1 : -1;
      // La pointe est a la DATE de la fleur : la longueur, c est la duree.
      // Retombante : elle s ecarte du bois en descendant, 30 a 45° du fil.
      // Une periode d un an ferait une brindille aussi longue que le tronc :
      // la longueur suit la duree jusqu a un plafond, au-dela elle le dit assez.
      const chute = Math.max(22, Math.min(150, (yDe(p.posFleur, H) - bp.y) * 0.8));
      const ey = bp.y + chute;
      const lateral = Math.max(26, Math.min(96, chute * (0.7 + 0.25 * Math.abs(bruit(p.graine + 5))) + 18));
      const marge = 34; // la place qu il faut au bouquet pour tenir entier
      const exC = Math.max(marge, Math.min(L - marge, bp.x + dir * lateral));
      const mx = bp.x + (exC - bp.x) * 0.55 + dir * 6;
      const my = bp.y + chute * 0.3 + bruit(p.graine + 11) * 4;
      const brindille: Point[] = [];
      const N = 40;
      for (let k = 0; k <= N; k++) {
        const s = k / N;
        const v = 1 - s;
        brindille.push({ x: v * v * bp.x + 2 * v * s * mx + s * s * exC, y: v * v * bp.y + 2 * v * s * my + s * s * ey, u: s });
      }
      const pal = [1, 0.82, 0.62][i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2];
      const D = 38 * pal * (p.score >= 4 ? 1.08 : 1); // ~4 % de la largeur, comme sur l image
      const vx = exC - bp.x;
      const vy = ey - bp.y;
      const lv = Math.hypot(vx, vy) || 1;
      // la tache est posee la ou la brindille quitte le bois : sur son depart
      const gx = bp.x + (vx / lv) * (bp.w * 0.5 + 4);
      const gy = bp.y + (vy / lv) * (bp.w * 0.5 + 4);

      // Le bouquet : la fleur principale au centre, 4 a 8 autres autour,
      // qui ne se chevauchent pas. Christophe, le 17/09 (image de reference) :
      // « au bout de la branche il faut un bouquet de fleurs ». Les tailles
      // suivent la meme gamme 1 / 0,82 / 0,62 que le reste de l oeuvre.
      const nBouquet = 6 + Math.round(Math.abs(bruit(p.graine + 41)) * 5); // 6 a 11 : une vraie masse
      const bouquetPal = [1, 0.85, 0.7, 0.58];
      const bouquet: PairePosee["bouquet"] = [{ x: exC, y: ey, D, graine: p.graine, retard: 0 }];
      for (let k = 0; k < nBouquet; k++) {
        let ok = false;
        for (let essai = 0; essai < 14 && !ok; essai++) {
          const a = bruit(p.graine + k * 7 + essai * 3 + 51) * 6.28;
          const dd = (0.3 + 0.85 * Math.abs(bruit(p.graine + k * 5 + essai * 7 + 61))) * D * 0.85;
          const bD0 = D * bouquetPal[Math.min(3, 1 + (k % 3))];
          const bx = Math.max(bD0 * 0.8, Math.min(L - bD0 * 0.8, exC + Math.cos(a) * dd));
          const by = ey + Math.sin(a) * dd * 0.8 - D * 0.15; // le bouquet monte un peu plus qu il ne descend
          const bD = bD0;
          if (bouquet.every((b) => Math.hypot(b.x - bx, b.y - by) >= 0.68 * (b.D + bD) / 2)) {
            bouquet.push({ x: bx, y: by, D: bD, graine: p.graine + k * 97 + 13, retard: 0.06 + 0.1 * Math.abs(bruit(p.graine + k * 11 + 71)) });
            ok = true;
          }
        }
      }
      return { ...p, brindille, gx, gy, rG: 7.5, fx: exC, fy: ey, D, vx, vy, bouquet };
    });

    // les grappes : une par 550-750 unites, aux cases les plus chargees, intervalles inegaux
    const grappes: GrappePosee[] = [];
    const pics = donnees.comptes
      .map((c, i) => ({ i, c, pos: i / (n - 1) }))
      .filter((a) => a.c > 0)
      .sort((a, b) => b.c - a.c);
    const nbG = Math.max(1, Math.round(H / 650));
    const ecarts = [1, 1.65, 1.15, 1.8];
    let dernierePos = -1;
    for (const pk of pics) {
      if (grappes.length >= nbG) break;
      const minEcart = (ecarts[grappes.length % ecarts.length] * 550) / H;
      if (dernierePos >= 0 && Math.abs(pk.pos - dernierePos) < minEcart) continue;
      if (paires.some((p) => Math.abs(p.posGraine - pk.pos) < 0.03)) continue;
      const bp = surLeTronc(pk.pos);
      const gr = Math.round(pk.pos * 4000) + pk.c * 17;
      const dir = bruit(gr) > 0 ? 1 : -1;
      const R = 30 + (pk.c / haut) * 22;
      const chute = 46 + (pk.c / haut) * 40;
      const cx = Math.max(44, Math.min(L - 44, bp.x + dir * (bp.w / 2 + chute * 0.9)));
      const cy = bp.y + chute;
      const brindille: Point[] = [];
      for (let k = 0; k <= 30; k++) {
        const t = k / 30;
        const v = 1 - t;
        const mx = bp.x + (cx - bp.x) * 0.5 + dir * 5;
        const my = bp.y + chute * 0.3;
        brindille.push({ x: v * v * bp.x + 2 * v * t * mx + t * t * cx, y: v * v * bp.y + 2 * v * t * my + t * t * cy, u: t });
      }
      const nb = 4 + Math.round((pk.c / haut) * 5); // 4 a 9, par trois et par cinq
      const boutons: GrappePosee["boutons"] = [];
      const pal = [1, 0.82, 0.62];
      for (let k = 0; k < nb; k++) {
        let ok = false;
        for (let essai = 0; essai < 12 && !ok; essai++) {
          const a = bruit(gr + k * 7 + essai) * 6.28;
          const dd = Math.pow(Math.abs(bruit(gr + k * 3 + essai * 5)), 0.6) * R;
          const D = 21 * pal[k % 3 === 0 ? 2 : k % 3 === 1 ? 1 : 0];
          // dans le papier, toujours : une fleur coupee par le bord n est pas
          // une composition
          const bx2 = Math.max(D, Math.min(L - D, cx + Math.cos(a) * dd));
          const by2 = cy + Math.sin(a) * dd * 0.85;
          if (boutons.every((b) => Math.hypot(b.x - bx2, b.y - by2) >= 1.15 * (b.D + D) / 2)) {
            boutons.push({ x: bx2, y: by2, D, graine: gr + k * 29 });
            ok = true;
          }
        }
      }
      const fam = paires.filter((p) => p.posGraine <= pk.pos).slice(-1)[0]?.famille ?? null;
      grappes.push({ pos: pk.pos, compte: pk.c, famille: fam, quand: fen.libelleDe(pk.pos), graine: gr, x: cx, y: cy, R, brindille, boutons });
      dernierePos = pk.pos;
    }
    // le tronc, d un seul geste : tous les segments bout a bout
    const tronc: Point[] = [];
    segments.forEach((sg, i) => sg.pts.forEach((p, k) => { if (i === 0 || k > 0) tronc.push(p); }));
    return { segments, noeuds, largeurTronc, surLeTronc, paires, grappes, tronc };
  }, [donnees, fen, H]);

  /* ── Les couleurs, lues du theme au moment de peindre ─────────────────────
     Aucune couleur ici : elles vivent dans globals.css, et le canvas les lit.
     Ainsi le dessin suit le theme clair/sombre sans une ligne de plus. */
  const palette = useCallback(() => {
    const el = hote.current;
    const st = el ? getComputedStyle(el) : null;
    const lit = (v: string, repli: string) => (st?.getPropertyValue(v).trim() || repli);
    const familles = {} as Record<Famille, string>;
    FAMILLES.forEach((f) => { familles[f] = lit(JETON_FAMILLE[f], lit("--encre-trait", "currentColor")); });
    return {
      encre: lit("--encre-trait", "currentColor"),
      diluee: lit("--encre-diluee", "currentColor"),
      papier: lit("--bg-primary", "transparent"),
      texte: lit("--text-body-subtle", "currentColor"),
      police: st?.fontFamily || "sans-serif",
      familles,
    };
  }, []);

  /* ── Le chevalet : deux toiles, une regle ────────────────────────────────
     L encre s accumule sur la premiere. La seconde est essuyee a chaque
     image : c est la que respirent les anneaux, que tombent les petales, que
     s ouvre ce qui est en train de naitre. On ne repeint l encre que quand
     le dessin change (echelle, familles, theme) — jamais parce que React a
     rendu. */
  const etat = useRef({
    revele: 0,        // jusqu ou la branche est peinte (0..1)
    cible: 0,         // jusqu ou l encre a le droit d aller (jamais apres aujourd hui)
    brut: 0,          // jusqu ou le doigt est descendu, lui, sans plafond
    dernierOu: -1,    // le dernier cran de pastille annonce a React
    tamponnes: new Set<string>(), // ce qui est deja sur l encre
    troncPose: 1, // jusqu ou le tronc est pose (index de point)
    naissances: new Map<string, number>(), // ce qui est en train de naitre : t0
    petales: [] as { x: number; y: number; vx: number; vy: number; ang: number; va: number; vie: number; t: number; col: string; len: number; vrille: number }[],
    /** Les bouquets "peak" dont la rafale d ouverture est deja partie — une fois chacun. */
    picsEclos: new Set<string>(),
    dernierPetale: 0,
    dernierSouffle: 0,
    souffle: 0,
    rafale: 0,
    boucle: 0,
    t0: 0,
    largeurCss: L,
  });

  const visibles = useMemo(() => plan.paires.filter((p) => !eteintes.has(p.famille)), [plan, eteintes]);

  useEffect(() => {
    const hoteEl = hote.current;
    const encreEl = encreRef.current;
    const vifEl = vifRef.current;
    if (!hoteEl || !encreEl || !vifEl) return;
    const gE = encreEl.getContext("2d");
    const gV = vifEl.getContext("2d");
    if (!gE || !gV) return;
    const pal = palette();
    const sig = JSON.stringify([echelle, [...eteintes], pal.encre, pal.familles, plan.paires.length, cle]);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    // La largeur du DESSIN, pas celle de la page : le cadre de l oeuvre sort
    // des marges du conteneur qui defile (`-mx-5`), donc on mesure ce cadre-la
    // et jamais la racine du composant, qui reste dans les marges du texte.
    const largeurCss = encreEl.parentElement?.clientWidth || hoteEl.clientWidth || L;
    const s = largeurCss / L;
    const hauteurCss = H * s;
    // Redimensionner une toile l efface et remet sa regle a zero : on ne le
    // fait que si la taille a vraiment change — et alors on repeint tout.
    const W = Math.round(largeurCss * dpr);
    const Hp = Math.round(hauteurCss * dpr);
    for (const c of [encreEl, vifEl]) {
      if (c.width !== W || c.height !== Hp) {
        c.width = W;
        c.height = Hp;
        c.style.width = `${largeurCss}px`;
        c.style.height = `${hauteurCss}px`;
        signature.current = "";
      }
    }
    const E = etat.current;
    E.largeurCss = largeurCss;
    gE.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
    if (signature.current !== sig) {
      signature.current = sig;
      gE.clearRect(0, 0, L, H);
      E.revele = fige ? 1 : 0;
      E.tamponnes.clear();
      E.troncPose = 1;
      E.naissances.clear();
      E.petales = [];
      E.picsEclos.clear();
      E.t0 = performance.now();
    }
    gV.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);

    const colDe = (f: Famille | null) => (f ? pal.familles[f] : pal.encre);
    const couleurTexte = pal.texte;
    const largeurTige = (p: PairePosee) => (u: number) => {
      // Le decrochement du kakemono : la brindille fait 40 a 45 % du bois qui
      // la porte, et sa pointe garde encore la moitie de sa base. Une tige
      // trop fine casse l unite de l ensemble — c est du fil, plus de l encre.
      const w0 = Math.max(6.5, Math.min(10, plan.largeurTronc(p.posGraine) * 0.42));
      return Math.max(3, w0 * (1 - 0.5 * u)) * (1 + 0.08 * ondule(u * 5, p.graine));
    };

    /* Ce que la personne voit de la branche : ce qu elle a fait descendre. */
    const mesurerCible = () => {
      const r = vifEl.getBoundingClientRect();
      const basVisible = window.innerHeight - r.top - 110;
      E.brut = Math.max(0, Math.min(1, basVisible / hauteurCss));
      // La pousse va jusqu'au bout de la vie, pas seulement jusqu'a
      // aujourd'hui — demande de Christophe le 18/09/2026 : "que ca aille
      // jusqu'au bout de sa vie". Les periodes a venir se peignent en
      // bouquets a demi ouverts (voir `aVenir` dans `peindrePaire`), jamais
      // pleinement ecloses.
      E.cible = E.brut;
      // Ou le regard se trouve : le milieu de l ecran, ramene dans le papier.
      const centre = Math.max(0, Math.min(1, (window.innerHeight / 2 - r.top) / hauteurCss));
      const cran = Math.round(centre * ANS_DE_VIE) / ANS_DE_VIE;
      if (cran !== E.dernierOu) {
        E.dernierOu = cran;
        setOu(cran);
      }
    };
    mesurerCible();

    /* Un objet nait sur la toile vive, puis se pose sur l encre. */
    const naissance = (id: string, duree: number, now: number, dessine: (part: number, g: Ctx) => void) => {
      if (E.tamponnes.has(id)) return true;
      let t0 = E.naissances.get(id);
      if (t0 === undefined) {
        t0 = now;
        E.naissances.set(id, t0);
      }
      const part = fige ? 1 : Math.min(1, (now - t0) / duree);
      if (part >= 1) {
        dessine(1, gE);
        E.tamponnes.add(id);
        E.naissances.delete(id);
        return true;
      }
      dessine(part, gV);
      return false;
    };

    const peindreRepere = (rp: { pos: number; libelle: string }) => {
      const y = yDe(rp.pos, H);
      const pt = plan.surLeTronc(rp.pos);
      const gauche = pt.x < L / 2;
      gE.save();
      gE.globalAlpha = 0.85;
      gE.fillStyle = couleurTexte;
      gE.font = `500 10px ${pal.police}`;
      gE.textAlign = gauche ? "right" : "left";
      gE.textBaseline = "middle";
      gE.fillText(rp.libelle, gauche ? L - 14 : 14, y);
      gE.restore();
    };

    /**
     * Une rafale de petales, tous d un coup, plutot que le filet au compte-
     * gouttes de la fleur ordinaire — pour marquer visuellement l ouverture
     * d une periode "peak". Demande par Christophe le 18/09/2026.
     */
    const rafalePetales = (p: PairePosee, col: string, now: number) => {
      const n = 14 + Math.floor(Math.random() * 6);
      for (let k = 0; k < n; k++) {
        const b = p.bouquet[Math.floor(Math.random() * p.bouquet.length)];
        E.petales.push({
          x: b.x + (Math.random() - 0.5) * b.D * 0.9,
          y: b.y + (Math.random() - 0.5) * b.D * 0.6,
          vx: (Math.random() - 0.5) * 0.7,
          vy: 0.45 + Math.random() * 0.55,
          ang: Math.random() * 6.28,
          va: (Math.random() - 0.5) * 0.09,
          vie: 4200 + Math.random() * 2600,
          t: now,
          col,
          len: b.D * 0.42 * (0.7 + Math.random() * 0.4),
          vrille: Math.random() * 6.28,
        });
      }
    };

    const peindrePaire = (p: PairePosee, g: Ctx, partTache: number, partTige: number, partFleur: number, col: string) => {
      if (partTache > 0) tache(g, p.gx, p.gy, p.rG, col, p.graine, partTache);
      if (partTige > 0) {
        const n = Math.max(2, Math.round(p.brindille.length * partTige));
        coupDePinceau(g, p.brindille, largeurTige(p), pal.encre, p.graine, n, false);
      }
      if (partFleur <= 0) return;
      if (p.genre === "graine") {
        // Pre-ombre d un LB a venir : des bourgeons, jamais une fleur ouverte.
        graineBourgeons(g, p.fx, p.fy, Math.atan2(p.vy, p.vx), p.D, col, p.graine, partFleur);
        return;
      }
      if (p.genre === "lotus") {
        // Loosing of the Bond : le pivot majeur, plus fort qu un pic ordinaire.
        eclatLotus(g, p.fx, p.fy, p.D * 1.45, col, pal.encre, p.graine, 1, partFleur);
        return;
      }
      // encore ouverte : des boutons, fermes mais bien visibles — ils attendent
      p.bouquet.forEach((b) => {
        const partLocale = Math.max(0, Math.min(1, (partFleur - b.retard) / (1 - b.retard)));
        if (partLocale <= 0) return;
        const D = p.aVenir ? b.D * 0.8 : b.D;
        fleurDePrunier(g, b.x, b.y, D, col, pal.encre, b.graine + (p.aVenir ? 1000 : 0), p.aVenir ? Math.min(partLocale, 0.5) : partLocale, p.vx + (b.x - p.fx), p.vy + (b.y - p.fy), !p.aVenir);
      });
    };

    const image = (now: number) => {
      E.boucle = requestAnimationFrame(image);
      if (document.hidden) return;
      // la branche avance vers le doigt, a la vitesse d un pinceau
      const vitesse = 0.55 / 1000; // de la hauteur par milliseconde
      const dt = Math.min(48, now - (E.t0 || now));
      E.t0 = now;
      if (E.revele < E.cible) E.revele = Math.min(E.cible, E.revele + vitesse * dt);
      const rv = E.revele;

      gV.clearRect(0, 0, L, H);

      /* 1. le tronc : un seul geste, pose sur l encre a mesure qu on descend */
      {
        const T = plan.tronc;
        const larg = (u: number) => plan.largeurTronc(u);
        const cibleIdx = rv >= 1 ? T.length : Math.max(1, T.findIndex((p) => p.u > rv));
        if (cibleIdx > E.troncPose) {
          coupDePinceau(gE, T, larg, pal.encre, 1, cibleIdx, true, E.troncPose);
          E.troncPose = cibleIdx;
        }
        plan.segments.forEach((sg, i) => {
          const id = `e${i}`;
          if (E.tamponnes.has(id) || rv < sg.u1) return;
          echo(gE, sg.pts, (u) => plan.largeurTronc(u), pal.diluee, sg.graine + 5);
          E.tamponnes.add(id);
        });
      }
      // la pointe d aujourd hui, encore humide
      if (rv >= fen.posMaintenant - 0.004) {
        const pt = plan.surLeTronc(fen.posMaintenant);
        const k = 0.5 + 0.5 * Math.sin(now / 900);
        gV.save();
        gV.globalAlpha = 0.16 + 0.1 * k;
        gV.fillStyle = pal.diluee;
        gV.beginPath();
        gV.arc(pt.x, pt.y, pt.w * 0.9 + 6 + 3 * k, 0, 6.2832);
        gV.fill();
        gV.restore();
      }

      /* 2. les reperes du temps */
      fen.reperes.forEach((rp, i) => {
        const id = `r${i}`;
        if (E.tamponnes.has(id) || E.brut < rp.pos) return;
        peindreRepere(rp);
        E.tamponnes.add(id);
      });

      /* 3. les paires : la tache boit, la brindille pousse, la fleur s ouvre */
      visibles.forEach((p, i) => {
        if (rv < p.posGraine) return;
        const col = colDe(p.famille);
        const id = `p${p.graine}`;
        if (choix === i && !E.tamponnes.has(id)) {
          // en focus : on la laisse naitre quand meme, mais sur l encre
          E.tamponnes.add(id);
          peindrePaire(p, gE, 1, 1, 1, col);
          // Une graine n a pas encore fleuri : rien ne s en detache.
          if (p.pic && p.genre !== "graine" && !p.aVenir && !E.picsEclos.has(id)) {
            E.picsEclos.add(id);
            rafalePetales(p, col, now);
          }
          return;
        }
        const eclose = naissance(id, 2600, now, (part, g) => {
          const a = Math.min(1, part / 0.28);
          const b = Math.max(0, Math.min(1, (part - 0.22) / 0.45));
          const c = Math.max(0, Math.min(1, (part - 0.62) / 0.38));
          peindrePaire(p, g, a, b, c, col);
        });
        if (eclose && p.pic && p.genre !== "graine" && !p.aVenir && !E.picsEclos.has(id)) {
          E.picsEclos.add(id);
          rafalePetales(p, col, now);
        }
      });

      /* 4. les grappes : boutons de fleurs, par trois et par cinq */
      plan.grappes.forEach((gr) => {
        if (rv < gr.pos) return;
        const col = gr.famille && !eteintes.has(gr.famille) ? colDe(gr.famille) : pal.diluee;
        naissance(`gb${gr.graine}`, 800, now, (part, g) => {
          const n = Math.max(2, Math.round(gr.brindille.length * part));
          coupDePinceau(g, gr.brindille, (u) => Math.max(3, 8 - 3.6 * u), pal.encre, gr.graine, n, false);
        });
        gr.boutons.forEach((b, k) => {
          const id = `g${gr.graine}-${k}`;
          naissance(id, 1400 + k * 160, now, (part, g) => {
            const pp = Math.max(0, Math.min(1, (part * (1400 + k * 160) - 700 - k * 160) / 700));
            if (pp > 0) fleurette(g, b.x, b.y, b.D * 0.5, col, b.graine, 0.85, pp, pal.encre);
          });
        });
      });

      /* 5. le voile du focus : tout s efface un peu, sauf la paire choisie */
      if (choix !== null && visibles[choix]) {
        const p = visibles[choix];
        gV.save();
        gV.globalAlpha = 0.8;
        gV.fillStyle = pal.papier;
        gV.fillRect(0, 0, L, H);
        gV.restore();
        peindrePaire(p, gV, 1, 1, 1, colDe(p.famille));
      }

      /* 6. les anneaux : la ou il faut toucher */
      if (!fige) {
        visibles.forEach((p, i) => {
          if (!E.tamponnes.has(`p${p.graine}`)) return;
          if (choix !== null && choix !== i) return;
          const lent = choix === i ? 0.5 : 1;
          anneau(gV, p.gx, p.gy, p.rG, colDe(p.famille), now / (1300 / lent) + i * 1.7);
        });
      }

      /* 7. les petales : une fleur eclose en laisse partir un, parfois */
      if (!fige) {
        const ecloses = visibles.filter((p) => p.genre !== "graine" && !p.aVenir && E.tamponnes.has(`p${p.graine}`) && (choix === null || visibles[choix] === p));
        if (now - E.dernierSouffle > 6000 + 6000 * Math.random()) {
          E.dernierSouffle = now;
          E.rafale = 1;
        }
        E.rafale *= 0.985;
        E.souffle = 0.35 + E.rafale * 1.2 + 0.2 * Math.sin(now / 2100);
        const cadence = 650 - E.rafale * 480;
        if (ecloses.length && now - E.dernierPetale > cadence && E.petales.length < 30) {
          E.dernierPetale = now;
          const p = ecloses[Math.floor(Math.random() * ecloses.length)];
          const b = p.bouquet[Math.floor(Math.random() * p.bouquet.length)];
          E.petales.push({
            x: b.x + (Math.random() - 0.5) * b.D * 0.7,
            y: b.y + (Math.random() - 0.5) * b.D * 0.5,
            vx: 0.15 + Math.random() * 0.3,
            vy: 0.35 + Math.random() * 0.35,
            ang: Math.random() * 6.28,
            va: (Math.random() - 0.5) * 0.06,
            vie: 5200 + Math.random() * 3000,
            t: now,
            col: colDe(p.famille),
            len: b.D * 0.42 * (0.7 + Math.random() * 0.4),
            vrille: Math.random() * 6.28,
          });
        }
        E.petales = E.petales.filter((pt) => now - pt.t < pt.vie && pt.y < H + 20);
        for (const pt of E.petales) {
          const age = (now - pt.t) / pt.vie;
          pt.vrille += 0.05 + E.rafale * 0.04;
          pt.x += (pt.vx + E.souffle * 0.55) * (dt / 16) + Math.sin(pt.vrille) * 0.5;
          pt.y += (pt.vy + Math.cos(pt.vrille * 0.6) * 0.18) * (dt / 16);
          pt.ang += pt.va + Math.sin(pt.vrille * 0.7) * 0.03;
          const al = age < 0.1 ? age / 0.1 : age > 0.75 ? (1 - age) / 0.25 : 1;
          petale(gV, pt.x, pt.y, pt.ang, pt.len, pt.len * 0.62, pt.col, 0.32 * al, 0.6 + 0.4 * Math.abs(Math.sin(pt.vrille)), Math.cos(pt.vrille * 0.8));
        }
      }
    };

    const surDefilement = () => mesurerCible();
    document.addEventListener("scroll", surDefilement, { passive: true, capture: true });
    window.addEventListener("resize", surDefilement);
    E.t0 = performance.now();
    E.boucle = requestAnimationFrame(image);
    return () => {
      cancelAnimationFrame(E.boucle);
      document.removeEventListener("scroll", surDefilement, { capture: true });
      window.removeEventListener("resize", surDefilement);
    };
  }, [plan, fen, visibles, echelle, eteintes, choix, cle, fige, palette, H]);

  /* Le theme change : les couleurs aussi. On repeint. */
  useEffect(() => {
    const obs = new MutationObserver(() => setCle((k) => k + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => obs.disconnect();
  }, []);

  /* ── Toucher : la tache ou la fleur la plus proche, sinon le vide ────────── */
  const surToucher = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const s = r.width / L;
    const x = (e.clientX - r.left) / s;
    const y = (e.clientY - r.top) / s;
    let meilleur = -1;
    let dMin = 26;
    visibles.forEach((p, i) => {
      if (!etat.current.tamponnes.has(`p${p.graine}`)) return;
      const d = Math.min(Math.hypot(p.gx - x, p.gy - y), Math.hypot(p.fx - x, p.fy - y));
      if (d < dMin) { dMin = d; meilleur = i; }
    });
    setChoix(meilleur >= 0 ? (choix === meilleur ? null : meilleur) : null);
  }, [visibles, choix]);

  const basculer = (f: Famille) => {
    setChoix(null);
    setEteintes((prev) => {
      const n = new Set(prev);
      if (n.has(f)) n.delete(f);
      else if (n.size < FAMILLES.length - 1) n.add(f);
      return n;
    });
  };

  /* ── Se deplacer dans sa vie ────────────────────────────────────────────
     Christophe, le 17/09 : « redonne-lui les memes boutons de navigation
     qu il a dans sa timeline : d une graine a une autre, un bouton maintenant,
     et la barre pour lui dire quel age il a ». Meme langage que la frise :
     une pastille de verre, la meme place sous le pouce. */
  const allerA = useCallback((pos: number) => {
    const el = vifRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const sc = conteneurDefilant(el);
    const vue = sc?.clientHeight ?? window.innerHeight;
    const decal = pos * r.height - vue * 0.42;
    if (sc) {
      const haut = r.top - sc.getBoundingClientRect().top + sc.scrollTop;
      sc.scrollTo({ top: Math.max(0, haut + decal), behavior: "smooth" });
    } else {
      window.scrollTo({ top: Math.max(0, r.top + window.scrollY + decal), behavior: "smooth" });
    }
  }, []);

  const versGraine = useCallback((sens: 1 | -1) => {
    const rang = [...visibles].sort((a, b) => a.posGraine - b.posGraine);
    if (!rang.length) return;
    const suivante = sens > 0
      ? rang.find((x) => x.posGraine > ou + 0.006)
      : [...rang].reverse().find((x) => x.posGraine < ou - 0.006);
    const cible = suivante ?? (sens > 0 ? rang[rang.length - 1] : rang[0]);
    toucher();
    setChoix(visibles.indexOf(cible));
    allerA(cible.posGraine);
  }, [visibles, ou, allerA]);

  const choisie = choix !== null ? visibles[choix] : null;
  // La pastille dit ou on se trouve : l age a l echelle d une vie, la date
  // aux deux autres. Elle ne bouge que quand le chiffre change.
  const libelleOu = echelle === "vie"
    ? t("resume.vie_ans", locale).replace("{n}", String(Math.round(ou * ANS_DE_VIE)))
    : fen.libelleDe(ou);
  const NIVEAUX: { id: typeof echelle; clef: string }[] = [
    { id: "vie", clef: "resume.branche_ech_vie" },
    { id: "annee", clef: "resume.branche_ech_annee" },
    { id: "mois", clef: "resume.branche_ech_mois" },
  ];

  return (
    <div ref={hote} className="relative w-full select-none">
      {/* ═══ 1. D ABORD, ON EXPLIQUE ═══════════════════════════════════════
          Christophe, le 17/09 : « on demarre par les explications, ensuite on
          arrive sur le sol et son arbre qui pousse ; on ne donne pas les infos
          a la fin ». Personne ne comprend une tache et une fleur si on ne les
          a pas montrees avant de les faire chercher. */}
      <section className="px-5 pt-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-body-subtle">{t("resume.branche_comment", locale)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Demo genre="tache" titre={t("resume.branche_tache_titre", locale)} texte={t("resume.branche_tache_expl", locale)} palette={palette} />
          <Demo genre="fleur" titre={t("resume.branche_fleur_titre", locale)} texte={t("resume.branche_fleur_expl", locale)} palette={palette} />
        </div>
        <p className="mt-3 max-w-[46ch] text-[12.5px] leading-snug text-text-body-subtle">{t("resume.branche_legende", locale)}</p>
      </section>

      {/* Ce qui est ouvert en ce moment, par famille. */}
      <section className="px-5 pt-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-body-subtle">{t("resume.branche_aujourdhui", locale)}</p>
        <p className="mt-1 text-[12px] text-text-body-subtle">{t("resume.branche_aujourdhui_aide", locale)}</p>
        <div className="mt-3 flex flex-col gap-2">
          {FAMILLES.map((f) => {
            const n = donnees.ouvertes[f];
            const max = Math.max(1, ...FAMILLES.map((x) => donnees.ouvertes[x]));
            return (
              <div key={f} className="flex items-center gap-3">
                <span className="w-16 text-[12px]" style={{ color: "var(--text-heading)" }}>{t(CLEF_FAMILLE[f], locale)}</span>
                <span className="h-1.5 flex-1 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                  <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${(n / max) * 100}%`, background: `var(${JETON_FAMILLE[f]})` }} />
                </span>
                <span className="w-6 text-right text-[12px] tabular-nums" style={{ color: "var(--text-heading)" }}>{n}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Les floraisons qui viennent : datees, jamais promises. */}
      <section className="px-5 pt-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-body-subtle">{t("resume.branche_prochaines", locale)}</p>
        <p className="mt-1 text-[12px] text-text-body-subtle">{t("resume.branche_prochaines_aide", locale)}</p>
        {donnees.aVenir.length ? (
          <ul className="mt-3 flex flex-col gap-2">
            {donnees.aVenir.map((v, i) => (
              <li key={i} className="flex items-center gap-2.5 text-[13px]" style={{ color: "var(--text-heading)" }}>
                <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: v.famille ? `var(${JETON_FAMILLE[v.famille]})` : "var(--bg-tertiary)" }} />
                <span className="tabular-nums">{v.quand}</span>
                <span className="text-text-body-subtle">{v.famille ? t(CLEF_FAMILLE[v.famille], locale) : ""}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[13px] text-text-body-subtle">{t("resume.branche_prochaines_rien", locale)}</p>
        )}
      </section>

      {/* ═══ 2. LE SOL ═════════════════════════════════════════════════════
          On arrive au niveau du sol : en dessous, cent ans de papier. */}
      <div className="mt-10 -mx-5 px-5">
        <div className="flex items-baseline gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-body-subtle">{t("resume.branche_naissance", locale)}</span>
          <span aria-hidden className="h-px flex-1" style={{ background: "var(--encre-diluee)", opacity: 0.45 }} />
          <span className="text-[11px] tabular-nums text-text-body-subtle">0</span>
        </div>
      </div>

      {/* ═══ 3. L ARBRE, DE ZERO A CENT ANS ════════════════════════════════ */}
      <div className="relative -mx-5 w-[calc(100%+2.5rem)]" style={{ aspectRatio: `${L} / ${H}` }}>
        <canvas ref={encreRef} aria-hidden className="encre-multiplie absolute left-0 top-0" />
        <canvas
          ref={vifRef}
          role="img"
          aria-label={t("resume.branche_legende", locale)}
          className="absolute left-0 top-0 cursor-pointer touch-manipulation"
          onPointerDown={surToucher}
        />
        {/* Les memes cibles, pour le clavier et les lecteurs d ecran. */}
        {visibles.map((p, i) => (
          <button
            key={p.graine}
            type="button"
            className="absolute h-[var(--taille-tactile-min)] w-[var(--taille-tactile-min)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 focus-visible:opacity-100 focus-visible:ring-2"
            style={{ left: `${(p.gx / L) * 100}%`, top: `${(p.gy / H) * 100}%` }}
            aria-label={`${t(CLEF_FAMILLE[p.famille], locale)} · ${p.quandGraine} → ${p.quandFleur}`}
            aria-pressed={choix === i}
            onClick={() => setChoix(choix === i ? null : i)}
          />
        ))}
        {/* Ou l on se trouve : la meme pastille que la frise, au milieu du
            regard, au bord droit. Elle suit le doigt, elle ne dit rien d autre. */}
        <span
          className="pointer-events-none absolute right-3 z-10 flex h-7 -translate-y-1/2 items-center rounded-full px-2.5 text-[11px] font-semibold tabular-nums"
          style={{ ...VERRE, top: `${ou * 100}%` }}
          aria-hidden
        >
          {libelleOu}
        </span>

        {/* Aujourd hui n est plus au bas du papier : il est a sa date. */}
        <div className="pointer-events-none absolute left-0 right-0 flex items-center gap-3 px-5" style={{ top: `${fen.posMaintenant * 100}%` }}>
          <span aria-hidden className="h-px flex-1" style={{ background: "var(--encre-diluee)", opacity: 0.5 }} />
          <span className="text-[11px] text-text-body-subtle">{t("resume.branche_ici", locale)}</span>
          <span aria-hidden className="h-px flex-1" style={{ background: "var(--encre-diluee)", opacity: 0.5 }} />
        </div>
      </div>

      {/* ═══ 4. LES AIDES, FLOTTANTES ET COLLEES EN BAS ════════════════════
          Christophe, le 17/09 : « ca doit etre exactement comme dans le langage
          de navigation qu on a deja appris sur la timeline — beaucoup plus
          minimaliste, fin et finement integre ». Donc : aucun aplat, que des
          pastilles de verre ; les trois domaines allumes d office et le reglage
          range ; les trois vues en un segment compact, pas trois gros boutons. */}
      <div className="sticky z-20 -mx-5 px-4" style={{ bottom: "var(--barre-onglets)" }}>
        <div aria-live="polite">
          {choisie ? (
            <div className="mb-2 rounded-2xl p-3.5 shadow-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--bg-tertiary)" }}>
              <div className="flex items-center gap-2">
                <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: `var(${JETON_FAMILLE[choisie.famille]})` }} />
                <p className="text-[12px] font-semibold" style={{ color: "var(--text-heading)" }}>
                  {t(CLEF_FAMILLE[choisie.famille], locale)}
                </p>
                <button type="button" onClick={() => setChoix(null)} className="ml-auto flex h-[var(--taille-tactile-min)] w-[var(--taille-tactile-min)] items-center justify-center text-[13px] text-text-body-subtle" aria-label={t("resume.branche_fermer", locale)}>
                  ✕
                </button>
              </div>
              <p className="text-[13px] leading-snug" style={{ color: "var(--text-heading)" }}>
                {majuscule(
                  (choisie.genre === "graine"
                    ? t("resume.branche_texte_graine", locale).replace("{lb}", choisie.lbDate ?? choisie.quandFleur)
                    : choisie.genre === "lotus"
                      ? t("resume.branche_texte_lotus", locale)
                      : choisie.aVenir
                        ? t("resume.branche_texte_fleur_encore", locale)
                        : t("resume.branche_texte_fleur", locale).replace("{b}", choisie.quandFleur).replace("{n}", choisie.ecart)
                  )
                    .replace("{a}", choisie.quandGraine)
                    .replace("{sujet}", t(SUJET_FAMILLE[choisie.famille], locale))
                )}
              </p>
              {choisie.genre === "fleur" ? (
                <p className="mt-1 text-[11px] leading-snug text-text-body-subtle">{t("resume.branche_tache_fleur", locale)}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Les trois domaines : ranges, et sortis seulement si on les demande. */}
        {filtresOuverts ? (
          <div className="mb-1.5 flex justify-center gap-1.5">
            {FAMILLES.map((f) => {
              const eteinte = eteintes.has(f);
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={!eteinte}
                  onClick={() => basculer(f)}
                  className="relative flex h-[var(--taille-pastille)] items-center gap-1.5 rounded-full px-2.5 text-[9px] font-semibold uppercase tracking-wider transition-opacity before:absolute before:-inset-y-2.5 before:inset-x-0 before:content-['']"
                  style={{ ...VERRE, opacity: eteinte ? 0.42 : 1 }}
                >
                  <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: `var(${JETON_FAMILLE[f]})` }} />
                  {t(CLEF_FAMILLE[f], locale)}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Une seule ligne, fine. Les fleches de graine en graine flottent
            juste au-dessus, a droite, comme sur la frise. Les zones tactiles
            font 44 points par `before:-inset-*` : le dessin reste mince. */}
        <div className="flex items-end gap-1.5 pb-2">
          {/* Le bouton "Maintenant" a ete retire ici le 18/09 : Christophe —
              « il est inutile parce que quand on clique plus haut ou plus
              bas, on saute d'une graine ou d'une fleur a l'autre, pas d'une
              annee a l'autre ». Contrairement a Timeline, ou les fleches
              haut/bas sautent par ANNEE et s eloignent vraiment d aujourd hui,
              ici elles sautent de graine en graine : le bouton ne ramenait
              nulle part d utile. Le composant BoutonMaintenant reste utilise
              par Timeline, voir components/demo/primitives/BoutonMaintenant.tsx. */}

          {/* Le reglage des domaines : trois points, et c est tout. */}
          <button
            type="button"
            onClick={() => { toucher(); setFiltresOuverts((v) => !v); }}
            aria-expanded={filtresOuverts}
            aria-label={t("resume.branche_filtres", locale)}
            className="relative flex h-[var(--taille-icone-secondaire)] items-center gap-[3px] rounded-full px-2 before:absolute before:-inset-2.5 before:content-['']"
            style={VERRE}
          >
            {FAMILLES.map((f) => (
              <span
                key={f}
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: `var(${JETON_FAMILLE[f]})`, opacity: eteintes.has(f) ? 0.28 : 1 }}
              />
            ))}
          </button>

          {/* Les trois vues : un segment mince, la vue tenue est la seule
              pleine. Composant partage avec le switcher vue d'ensemble/liste
              de Timeline, voir
              components/demo/primitives/BasculeSegmentee.tsx. */}
          <div className="mx-auto">
            <BasculeSegmentee
              role="tablist"
              ariaLabel={t("resume.branche_ech_vie", locale)}
              taille="pastille"
              valeur={echelle}
              onChange={(v) => { toucher(); setChoix(null); setEchelle(v); }}
              options={NIVEAUX.map((n) => ({ valeur: n.id, contenu: t(n.clef, locale) }))}
            />
          </div>

          {/* Le pas a pas, d une graine a l autre : empilees a droite, comme
              la frise les pose sous le pouce. Composant partage avec
              Timeline, voir components/demo/primitives/BoutonFleche.tsx —
              Christophe, le 18/09 : « ils etaient adaptes au pouce », meme
              taille partout. */}
          <div className="flex flex-col gap-1">
            <BoutonFleche sens="haut" onClick={() => versGraine(-1)} ariaLabel={t("resume.branche_graine_avant", locale)} />
            <BoutonFleche sens="bas" onClick={() => versGraine(1)} ariaLabel={t("resume.branche_graine_apres", locale)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Une petite toile qui montre un signe, et le rejoue quand on la touche ── */
function Demo({ genre, titre, texte, palette }: { genre: "tache" | "fleur"; titre: string; texte: string; palette: () => { encre: string; diluee: string; familles: Record<Famille, string> } }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [tour, setTour] = useState(0);
  const fige = useReducedMotion();
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = 120;
    const Hh = 84;
    c.width = W * dpr;
    c.height = Hh * dpr;
    c.style.width = `${W}px`;
    c.style.height = `${Hh}px`;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pal = palette();
    const col = pal.familles.love;
    const t0 = performance.now();
    let id = 0;
    const image = (now: number) => {
      const part = fige ? 1 : Math.min(1, (now - t0) / 1600);
      g.clearRect(0, 0, W, Hh);
      if (genre === "tache") {
        tache(g, W / 2, Hh / 2, 9, col, 41 + tour, part);
        anneau(g, W / 2, Hh / 2, 9, col, now / 1300);
      } else {
        const pts: Point[] = [];
        for (let k = 0; k <= 30; k++) {
          const u = k / 30;
          pts.push({ x: 18 + u * 70, y: Hh - 14 - u * 46 + Math.sin(u * 3) * 5, u });
        }
        const n = Math.max(2, Math.round(pts.length * Math.min(1, part / 0.5)));
        coupDePinceau(g, pts, (u) => 4 - 2.5 * u, pal.encre, 7, n, false);
        const pf = Math.max(0, (part - 0.45) / 0.55);
        if (pf > 0) fleurDePrunier(g, 88, 24, 30, col, pal.encre, 3, pf, 1, -0.6, true);
      }
      if (part < 1) id = requestAnimationFrame(image);
    };
    id = requestAnimationFrame(image);
    return () => cancelAnimationFrame(id);
  }, [genre, tour, fige, palette]);
  return (
    <button type="button" onClick={() => setTour((n) => n + 1)} className="flex flex-col items-center rounded-2xl p-3 text-left" style={{ background: "var(--bg-tertiary)" }}>
      <canvas ref={ref} aria-hidden />
      <span className="mt-1 self-start text-[12px] font-semibold" style={{ color: "var(--text-heading)" }}>{titre}</span>
      <span className="mt-0.5 self-start text-[11px] leading-snug text-text-body-subtle">{texte}</span>
    </button>
  );
}
