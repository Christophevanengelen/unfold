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
 *  — une TACHE d encre marque l ouverture d un chapitre (`chapitres[]`) ;
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
import { STRINGS_MATCH_DOMAINES, t, type Locale } from "@/lib/i18n-demo";
import { DOMAINE } from "@/lib/score-match";
import type { ResumeDeVie } from "@/lib/resume-vie";
import type { ChapitreDeVie } from "@/lib/chapitres-vie";
import type { MomentumPhase } from "@/types/momentum";

/* ── Le cadre de dessin ─────────────────────────────────────────────────────
   Un repere fixe : on dessine toujours dans 360 x 620, et le canvas est mis a
   l echelle de la largeur reelle. Les coordonnees restent donc lisibles, et
   rien ne bouge quand le telephone change de largeur. */
const L = 320;
const H = 440;
const MARGE_BAS = 34;
const MARGE_HAUT = 26;

/** Le sol est en bas : une branche pousse vers le haut. */
const yDe = (u: number) => H - MARGE_BAS - u * (H - MARGE_BAS - MARGE_HAUT);

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

type Teinte = { trait: string; diluee: string; papier: string; sceau: string; discret: string };

function lireLesTeintes(el: HTMLElement): Teinte {
  const s = getComputedStyle(el);
  const v = (nom: string) => s.getPropertyValue(nom).trim();
  return {
    trait: v("--encre-trait"),
    diluee: v("--encre-diluee"),
    papier: v("--bg-secondary"),
    sceau: v("--bg-brand"),
    discret: v("--text-body-subtle"),
  };
}

/** Une couleur du moteur, ou a defaut l encre discrete du theme. */
function couleurDe(phase: MomentumPhase | undefined, teinte: Teinte): string {
  const c = phase?.color ?? phase?.apiTopics?.[0]?.color;
  return typeof c === "string" && c.length > 0 ? c : teinte.discret;
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
function coup(g: Ctx, pts: Point[], largeur: (u: number) => number, col: string, graine: number, jusqua: number) {
  const n = Math.max(2, Math.min(pts.length, jusqua));
  if (n < 2) return;
  const gauche: number[][] = [];
  const droite: number[][] = [];
  for (let k = 0; k < n; k++) {
    const p = pts[k];
    const a = pts[Math.max(0, k - 1)];
    const b = pts[Math.min(pts.length - 1, k + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    let w = largeur(p.u) / 2;
    // La pointe qui avance pendant qu on peint : sans ca le trait pousse avec
    // un bout carre, ce qui ne ressemble a aucun pinceau.
    if (jusqua < pts.length && k > n - 5) w *= (n - k) / 5;
    const j1 = 0.3 * ondule(k * 0.8, graine + 5);
    const j2 = 0.3 * ondule(k * 0.8, graine + 9);
    gauche.push([p.x + nx * (w + j1), p.y + ny * (w + j1)]);
    droite.push([p.x - nx * (w + j2), p.y - ny * (w + j2)]);
  }
  const bord = gauche.concat(droite.reverse());
  g.globalAlpha = 0.94;
  g.fillStyle = col;
  g.beginPath();
  g.moveTo(bord[0][0], bord[0][1]);
  for (let i = 1; i < bord.length; i++) g.lineTo(bord[i][0], bord[i][1]);
  g.closePath();
  g.fill();
  g.globalAlpha = 1;
  // Le poil sec : on EFFACE de fines stries dans l encre, surtout vers la fin
  // du geste. Le papier reapparait — c est le « flying white », et il ne peut
  // pas s obtenir en ajoutant quelque chose par-dessus.
  g.save();
  g.globalCompositeOperation = "destination-out";
  g.lineCap = "round";
  const stries = 2 + Math.floor(Math.abs(bruit(graine + 3)) * 3);
  for (let s = 0; s < stries; s++) {
    const depart = Math.floor(n * (0.34 + 0.26 * Math.abs(bruit(graine + s * 5))));
    const decal = bruit(graine + s * 17) * 0.7;
    g.globalAlpha = 0.5 + 0.35 * Math.abs(bruit(graine + s * 11));
    g.lineWidth = 0.45 + Math.abs(bruit(graine + s * 23)) * 0.85;
    g.beginPath();
    for (let k = depart; k < n; k++) {
      const p = pts[k];
      const a = pts[Math.max(0, k - 1)];
      const b = pts[Math.min(pts.length - 1, k + 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l = Math.hypot(dx, dy) || 1;
      const w = (largeur(p.u) / 2) * decal;
      const x = p.x + (-dy / l) * w;
      const y = p.y + (dx / l) * w;
      if (k === depart) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  g.restore();
}

/** L echo dilue, pose AVANT l encre : c est lui qui donne la profondeur. */
function echo(g: Ctx, pts: Point[], largeur: (u: number) => number, col: string, graine: number) {
  const decale = pts.map((p) => ({ x: p.x + 5, y: p.y + 4, u: p.u }));
  g.save();
  g.globalAlpha = 0.16;
  g.fillStyle = col;
  const gauche: number[][] = [];
  const droite: number[][] = [];
  decale.forEach((p, k) => {
    const a = decale[Math.max(0, k - 1)];
    const b = decale[Math.min(decale.length - 1, k + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const w = (largeur(p.u) / 2) * 1.35;
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

/** Un petale, en deux courbes. `forme` va du rond a l effile. */
function petale(g: Ctx, x: number, y: number, ang: number, len: number, larg: number, col: string, a: number, forme: number) {
  g.save();
  g.translate(x, y);
  g.rotate(ang);
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
function fleur(g: Ctx, x: number, y: number, R: number, col: string, graine: number, a: number, part: number, encre: string) {
  const rot = bruit(graine) * 6.28;
  const n = 4 + Math.floor(Math.abs(bruit(graine + 41)) * 4);
  const forme = 0.7 + Math.abs(bruit(graine + 43)) * 0.6;
  const aplati = 0.74 + Math.abs(bruit(graine + 47)) * 0.26;
  const ouvre = Math.min(1, part * 1.15);
  const len = R * (0.2 + 0.8 * ouvre);
  const larg = R * 0.7 * (0.35 + 0.65 * Math.min(1, part * 1.3));
  const al = a * Math.min(1, part * 1.6);
  g.save();
  g.translate(x, y);
  g.scale(1, aplati);
  g.translate(-x, -y);
  for (let i = 0; i < n; i++) {
    const ang = rot + ((i * 6.2832) / n) * (0.25 + 0.75 * ouvre) + bruit(graine + i * 3) * 0.2 * part;
    petale(g, x, y, ang, len * (0.92 + 0.2 * bruit(graine + i * 5)), larg * (0.9 + 0.2 * bruit(graine + i * 7)), col, al, forme);
  }
  g.restore();
  touche(g, x, y, R * 0.22 * Math.min(1, 0.4 + part), col, al * 0.8);
  if (part > 0.7) {
    const s = (part - 0.7) / 0.3;
    g.strokeStyle = encre;
    g.globalAlpha = a * 0.45 * s;
    g.lineWidth = 0.5;
    for (let i = 0; i < 7; i++) {
      const ang = bruit(graine + i * 13) * 6.28;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(ang) * R * 0.32 * s, y + Math.sin(ang) * R * 0.32 * s);
      g.stroke();
    }
    g.globalAlpha = 1;
  }
}

/** Une petite fleur de grappe ; sous une certaine taille, une simple touche. */
function fleurette(g: Ctx, x: number, y: number, r: number, col: string, graine: number, a: number, part: number, encre: string) {
  const rr = r * Math.min(1, part * 1.1);
  if (rr < 2.3) {
    touche(g, x, y, rr, col, a * Math.min(1, part * 1.5));
    return;
  }
  fleur(g, x, y, rr * 1.1, col, graine, a * 1.4, part, encre);
}

/* ── Ce qui est dessine, calcule une fois ───────────────────────────────── */

type Grappe = { u: number; x: number; y: number; R: number; phase?: MomentumPhase; graine: number; age: number; compte: number; boutons: { x: number; y: number; r: number; graine: number; a: number }[] };
type Marque = {
  kind: "tache" | "fleur";
  u: number;
  x: number;
  y: number;
  /** Le point d attache sur la branche : la brindille part de la. */
  ax: number;
  ay: number;
  r: number;
  phase?: MomentumPhase;
  graine: number;
  age: number;
  /** Le libelle du domaine, quand le moteur en donne un. */
  domaine: string | null;
  /** Pour une fleur : le chapitre ouvert qui la contient, s il y en a un. */
  ouvertA: number | null;
};

export function BrancheDeVie({
  resume,
  locale,
  chapitres,
}: {
  resume: ResumeDeVie;
  locale: Locale;
  /**
   * Les grands mouvements, quand la route allegee a repondu.
   *
   * Ils changent tout pour ce dessin : `annees` ne compte que les annees que
   * le moteur documente — sur le cas de test, a partir de 39 ans seulement —
   * alors que ceux-ci portent la vie ENTIERE. Sans eux la branche n avait
   * qu une grappe et aucune tache. Absents, on retombe sur `annees` : le
   * dessin est plus pauvre, jamais faux.
   */
  chapitres?: ChapitreDeVie[];
}) {
  const fige = useReducedMotion();
  const hote = useRef<HTMLDivElement | null>(null);
  const encreRef = useRef<HTMLCanvasElement | null>(null);
  const vifRef = useRef<HTMLCanvasElement | null>(null);
  const [lu, setLu] = useState<Marque | Grappe | null>(null);
  const [theme, setTheme] = useState(0);

  // Le bas de la branche : le plus ancien age dont on ait quelque chose a
  // dire — un chapitre ou un compte. Pas zero par defaut : dessiner de zero
  // quand le calcul commence a 39 ans ferait croire a 39 annees vides.
  const depart = Math.max(
    0,
    Math.min(
      resume.premiereDocumentee ?? resume.age,
      ...(chapitres && chapitres.length > 0 ? chapitres.map((c) => c.ageDebut) : [resume.premiereDocumentee ?? resume.age]),
    ),
  );
  const noms = useMemo(() => STRINGS_MATCH_DOMAINES(locale), [locale]);

  /**
   * La branche, les grappes et les marques — en coordonnees de dessin.
   *
   * Tout est derive du resume : rien ici ne sait ce qu est un theme, une
   * couleur ou une langue. Les teintes sont appliquees au moment de peindre.
   */
  const plan = useMemo(() => {
    const span = Math.max(1, resume.age - depart);
    if (span < 2 && (!chapitres || chapitres.length === 0)) return null;
    const parAge = new Map(resume.annees.map((a) => [a.age, a.periodes]));
    const comptes = resume.annees.filter((a) => a.age >= depart).map((a) => a.periodes);
    const hautCompte = Math.max(1, ...comptes);
    const uDeAge = (age: number) => Math.min(1, Math.max(0, (age - depart) / span));
    /** Le compte de l annee, ou `null` la ou le moteur ne compte pas encore. */
    const compteA = (u: number): number | null => {
      const age = Math.round(depart + u * span);
      return parAge.get(age) ?? null;
    };

    // Le troncal : quelques coups de pinceau bout a bout, avec une cassure a
    // chaque noeud. C est ce zigzag qui fait une branche et pas une courbe.
    const segments: { pts: Point[]; u0: number; u1: number; graine: number }[] = [];
    const noeuds: { u: number; x: number; y: number }[] = [];
    const nSeg = 6;
    let x = L * 0.42;
    let cap = 0.16;
    noeuds.push({ u: 0, x, y: yDe(0) });
    for (let i = 0; i < nSeg; i++) {
      const u0 = i / nSeg;
      const u1 = (i + 1) / nSeg;
      const y0 = yDe(u0);
      const y1 = yDe(u1);
      cap += (i % 2 ? -1 : 1) * (0.3 + 0.26 * Math.abs(bruit(i * 13 + 7)));
      const x1 = Math.max(46, Math.min(L - 46, x + Math.tan(cap) * (y0 - y1) * 0.5));
      const mx = (x + x1) / 2 + bruit(i * 29 + 3) * 16;
      const my = (y0 + y1) / 2 + bruit(i * 31 + 5) * 8;
      const pts: Point[] = [];
      const N = 42;
      for (let k = 0; k <= N; k++) {
        const s = k / N;
        const v = 1 - s;
        pts.push({ x: v * v * x + 2 * v * s * mx + s * s * x1, y: v * v * y0 + 2 * v * s * my + s * s * y1, u: u0 + (u1 - u0) * s });
      }
      segments.push({ pts, u0, u1, graine: i * 7 + 1 });
      x = x1;
      noeuds.push({ u: u1, x, y: y1 });
    }
    const largeur = (u: number) => {
      const bas = 12.5 * Math.pow(1 - u, 0.8) + 1.8;
      // La ou le moteur compte, l epaisseur suit le compte. La ou il ne compte
      // pas, elle reste neutre : une branche fine ne veut pas dire « annee
      // calme », elle veut dire « rien de mesure ici ».
      const c = compteA(u);
      const charge = c === null ? 1 : 0.55 + 0.9 * (c / hautCompte);
      return bas * charge * (1 + 0.08 * ondule(u * 5, 3));
    };
    const surLaBranche = (u: number) => {
      for (const sg of segments) {
        if (u <= sg.u1 || sg === segments[segments.length - 1]) {
          const s = Math.max(0, Math.min(1, (u - sg.u0) / (sg.u1 - sg.u0 || 1)));
          const k = Math.round(s * (sg.pts.length - 1));
          const p = sg.pts[k];
          const a = sg.pts[Math.max(0, k - 1)];
          const b = sg.pts[Math.min(sg.pts.length - 1, k + 1)];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const l = Math.hypot(dx, dy) || 1;
          return { x: p.x, y: p.y, nx: -dy / l, ny: dx / l, w: largeur(u) };
        }
      }
      const p = segments[0].pts[0];
      return { x: p.x, y: p.y, nx: 1, ny: 0, w: largeur(0) };
    };

    // Les grappes : les annees les plus chargees, espacees pour que le papier
    // respire. On en garde peu et grandes — une vie n est pas un semis.
    const pics = resume.annees
      .filter((a) => a.age >= depart)
      .map((a, i) => ({ i, age: a.age, compte: a.periodes }))
      .filter((a, i, tab) => a.compte > 0 && (i === 0 || a.compte >= tab[i - 1].compte) && (i === tab.length - 1 || a.compte >= tab[i + 1].compte))
      .sort((a, b) => b.compte - a.compte);
    const grappes: Grappe[] = [];
    for (const p of pics) {
      const u = uDeAge(p.age);
      if (grappes.some((g) => Math.abs(g.u - u) < 0.1)) continue;
      if (grappes.length >= 6) break;
      const bp = surLaBranche(u);
      const gr = Math.round(u * 4000) + p.age * 17;
      const cote = bruit(gr) > 0 ? 1 : -1;
      const dist = bp.w + 12 + 20 * Math.abs(bruit(gr + 5));
      const cx = bp.x + cote * bp.nx * dist;
      const cy = bp.y + cote * bp.ny * dist;
      const force = p.compte / hautCompte;
      const R = 11 + force * 15;
      const nb = 5 + Math.round(force * 7);
      const boutons = [];
      for (let k = 0; k < nb; k++) {
        const ang = bruit(gr + k * 7) * 6.28;
        const dd = Math.pow(Math.abs(bruit(gr + k * 3)), 0.68) * R;
        boutons.push({ x: cx + Math.cos(ang) * dd, y: cy + Math.sin(ang) * dd * 0.82, r: 2.4 + Math.abs(bruit(gr + k * 11)) * 3.6, graine: gr + k * 29, a: 0.34 + 0.3 * Math.abs(bruit(gr + k * 5)) });
      }
      const chapDeLAnnee = resume.chapitres.find((c) => p.age >= c.ageDebut && (c.ageFin === null || p.age <= c.ageFin));
      grappes.push({ u, x: cx, y: cy, R, phase: chapDeLAnnee?.phase, graine: gr, age: p.age, compte: p.compte, boutons });
      void hautCompte;
    }

    // Les taches : l ouverture des chapitres. Les fleurs : les bascules du
    // moteur. Une fleur retient le chapitre qui la contient — pour le fil.
    const marques: Marque[] = [];
    const ouvertures: { ageDebut: number; ageFin: number | null; domaine: string | null; phase?: MomentumPhase }[] =
      chapitres && chapitres.length > 0
        ? chapitres.map((c) => ({ ageDebut: c.ageDebut, ageFin: c.finALHorizon ? null : c.ageFin, domaine: c.domaine }))
        : resume.chapitres.map((c) => ({
            ageDebut: c.ageDebut,
            ageFin: c.ageFin,
            domaine: c.phase.house ? (noms[DOMAINE[c.phase.house]] ?? null) : null,
            phase: c.phase,
          }));
    ouvertures.forEach((c, i) => {
      // Ni avant le premier age documente, ni APRES aujourd hui. Le moteur
      // rend des chapitres au-dela de son horizon (54 ans sur le cas de test,
      // pour quelqu un qui en a 41) ; les dessiner en haut de la branche les
      // ferait passer pour le present. Le produit est descriptif.
      if (c.ageDebut < depart || c.ageDebut > resume.age) return;
      const u = uDeAge(c.ageDebut);
      const bp = surLaBranche(u);
      const gr = i * 131 + 11;
      const cote = bruit(gr + 3) > 0 ? 1 : -1;
      marques.push({
        kind: "tache",
        u,
        ax: bp.x,
        ay: bp.y,
        x: bp.x + cote * bp.nx * (bp.w + 13 + 10 * Math.abs(bruit(gr))),
        y: bp.y + cote * bp.ny * (bp.w + 13),
        r: 7 + 3.5 * Math.abs(bruit(gr + 1)),
        phase: c.phase,
        graine: gr,
        age: c.ageDebut,
        domaine: c.domaine,
        ouvertA: null,
      });
    });
    resume.bascules.forEach((b, i) => {
      if (b.age < depart || b.age > resume.age) return;
      const u = uDeAge(b.age);
      const bp = surLaBranche(u);
      const gr = i * 197 + 23;
      const cote = bruit(gr + 3) > 0 ? -1 : 1;
      const chap = ouvertures.find((c) => b.age >= c.ageDebut && (c.ageFin === null || b.age <= c.ageFin));
      marques.push({
        kind: "fleur",
        u,
        ax: bp.x,
        ay: bp.y,
        x: bp.x + cote * bp.nx * (bp.w + 17 + 14 * Math.abs(bruit(gr))),
        y: bp.y + cote * bp.ny * (bp.w + 17),
        r: 12 + 6 * Math.abs(bruit(gr + 7)),
        phase: b.phase,
        graine: gr,
        age: b.age,
        domaine: b.phase.house ? (noms[DOMAINE[b.phase.house]] ?? null) : null,
        ouvertA: chap ? chap.ageDebut : null,
      });
    });

    return { segments, noeuds, largeur, surLaBranche, grappes, marques, uDeAge };
  }, [resume, depart, noms, chapitres]);

  /** Le fil entre une tache et sa fleur : un cheveu d encre diluee. */
  const fil = useCallback(
    (g: Ctx, de: { x: number; y: number }, vers: { x: number; y: number }, col: string, net: boolean) => {
      g.save();
      g.lineCap = "round";
      g.strokeStyle = col;
      g.globalAlpha = net ? 0.75 : 0.28;
      g.lineWidth = net ? 0.9 : 0.4;
      g.beginPath();
      const mx = (de.x + vers.x) / 2 + (vers.y - de.y) * 0.16;
      const my = (de.y + vers.y) / 2 + (de.x - vers.x) * 0.16;
      g.moveTo(de.x, de.y);
      g.quadraticCurveTo(mx, my, vers.x, vers.y);
      g.stroke();
      g.globalAlpha = 1;
      g.restore();
    },
    [],
  );

  /* ── La peinture ─────────────────────────────────────────────────────── */
  const peindre = useCallback(
    (anime: boolean) => {
      const h = hote.current;
      const cEncre = encreRef.current;
      const cVif = vifRef.current;
      if (!h || !cEncre || !cVif || !plan) return () => {};

      const teinte = lireLesTeintes(h);
      const large = h.clientWidth || L;
      const ech = large / L;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      [cEncre, cVif].forEach((c) => {
        c.width = Math.round(large * dpr);
        c.height = Math.round(H * ech * dpr);
        c.style.width = `${large}px`;
        c.style.height = `${H * ech}px`;
        const g = c.getContext("2d");
        if (g) g.setTransform(dpr * ech, 0, 0, dpr * ech, 0, 0);
      });
      const g = cEncre.getContext("2d");
      const gv = cVif.getContext("2d");
      if (!g || !gv) return () => {};
      const vider = (ctx: Ctx, c: HTMLCanvasElement) => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.restore();
      };
      vider(g, cEncre);
      vider(gv, cVif);

      // L echo d abord : c est un lavis, il passe SOUS l encre.
      plan.segments.forEach((sg) => echo(g, sg.pts, plan.largeur, teinte.diluee, sg.graine));

      const grappes = plan.grappes.map((gr) => ({ ...gr, col: couleurDe(gr.phase, teinte) }));
      const marques = plan.marques.map((m) => ({ ...m, col: couleurDe(m.phase, teinte) }));

      const finir = () => {
        plan.segments.forEach((sg, i) => {
          coup(g, sg.pts, plan.largeur, teinte.trait, sg.graine, 1e9);
          const nd = plan.noeuds[i + 1];
          if (nd && i < plan.segments.length - 1) touche(g, nd.x, nd.y, plan.largeur(nd.u) * 0.42, teinte.trait, 0.4);
        });
        grappes.forEach((gr) => {
          const bp = plan.surLaBranche(gr.u);
          fil(g, bp, gr, teinte.trait, false);
          gr.boutons.forEach((b) => fleurette(g, b.x, b.y, b.r, gr.col, b.graine, b.a, 1, teinte.trait));
        });
        marques.forEach((m) => {
          fil(g, { x: m.ax, y: m.ay }, m, teinte.trait, false);
          if (m.kind === "tache") tache(g, m.x, m.y, m.r, m.col, m.graine, 1);
          else {
            const source = m.ouvertA !== null ? marques.find((o) => o.kind === "tache" && o.age === m.ouvertA) : undefined;
            if (source) fil(g, source, m, teinte.trait, false);
            fleur(g, m.x, m.y, m.r, m.col, m.graine, 0.92, 1, teinte.trait);
          }
        });
      };

      if (!anime || fige) {
        finir();
        return () => {};
      }

      /* La pousse : un coup de pinceau apres l autre, de bas en haut. Chaque
         fleur a sa propre horloge, declenchee quand la branche l a atteinte —
         la floraison SUIT la pousse, elle ne se joue pas en parallele. */
      const PAS = 460;
      type Tache = { debut: number; duree: number; fait: boolean; faire: (q: number, fini: boolean) => void };
      const taches: Tache[] = [];
      let curseur = 0;
      plan.segments.forEach((sg, i) => {
        const nd = plan.noeuds[i + 1];
        taches.push({
          debut: curseur,
          duree: PAS,
          fait: false,
          faire: (q, fini) => {
            if (fini) {
              coup(g, sg.pts, plan.largeur, teinte.trait, sg.graine, 1e9);
              if (nd && i < plan.segments.length - 1) touche(g, nd.x, nd.y, plan.largeur(nd.u) * 0.42, teinte.trait, 0.4);
            } else {
              coup(gv, sg.pts, plan.largeur, teinte.trait, sg.graine, Math.max(2, Math.round(q * sg.pts.length)));
            }
          },
        });
        curseur += PAS * 0.8;
      });
      const quand = (u: number) => PAS * 0.8 * plan.segments.length * u;
      grappes.forEach((gr) => {
        const bp = plan.surLaBranche(gr.u);
        const t0 = quand(gr.u) + 140;
        taches.push({ debut: t0, duree: 300, fait: false, faire: (q, fini) => { void q; fil(fini ? g : gv, bp, gr, teinte.trait, false); } });
        gr.boutons.forEach((b, j) => {
          taches.push({
            debut: t0 + 300 + j * 60,
            duree: 420,
            fait: false,
            faire: (q, fini) => fleurette(fini ? g : gv, b.x, b.y, b.r, gr.col, b.graine, b.a, fini ? 1 : q, teinte.trait),
          });
        });
      });
      marques.forEach((m) => {
        const t0 = quand(m.u) + 200;
        taches.push({ debut: t0, duree: 240, fait: false, faire: (q, fini) => { void q; fil(fini ? g : gv, { x: m.ax, y: m.ay }, m, teinte.trait, false); } });
        if (m.kind === "tache") {
          taches.push({ debut: t0 + 200, duree: 700, fait: false, faire: (q, fini) => tache(fini ? g : gv, m.x, m.y, m.r, m.col, m.graine, fini ? 1 : q) });
        } else {
          const source = m.ouvertA !== null ? marques.find((o) => o.kind === "tache" && o.age === m.ouvertA) : undefined;
          if (source) taches.push({ debut: t0, duree: 400, fait: false, faire: (q, fini) => { void q; fil(fini ? g : gv, source, m, teinte.trait, false); } });
          taches.push({
            debut: t0 + 380,
            duree: 900,
            fait: false,
            faire: (q, fini) => fleur(fini ? g : gv, m.x, m.y, m.r, m.col, m.graine, 0.92, fini ? 1 : q, teinte.trait),
          });
        }
      });

      let vivant = true;
      let image = 0;
      const t0 = performance.now();
      const tour = (maintenant: number) => {
        if (!vivant) return;
        const el = maintenant - t0;
        vider(gv, cVif);
        let reste = false;
        for (const tc of taches) {
          if (tc.fait) continue;
          if (el < tc.debut) {
            reste = true;
            continue;
          }
          const q = Math.min(1, (el - tc.debut) / tc.duree);
          if (q >= 1) {
            tc.faire(1, true);
            tc.fait = true;
          } else {
            tc.faire(q, false);
            reste = true;
          }
        }
        if (reste) image = requestAnimationFrame(tour);
        else {
          vider(gv, cVif);
          image = 0;
        }
      };
      image = requestAnimationFrame(tour);
      return () => {
        vivant = false;
        if (image) cancelAnimationFrame(image);
      };
    },
    [plan, fige, fil],
  );

  // Premiere peinture, puis a chaque changement de theme ou de largeur.
  useEffect(() => {
    const stop = peindre(true);
    return stop;
  }, [peindre, theme]);

  useEffect(() => {
    const obs = new MutationObserver(() => setTheme((n) => n + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    let tm: ReturnType<typeof setTimeout>;
    const surTaille = () => {
      clearTimeout(tm);
      tm = setTimeout(() => setTheme((n) => n + 1), 200);
    };
    window.addEventListener("resize", surTaille);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", surTaille);
      clearTimeout(tm);
    };
  }, []);

  if (!plan) return null;

  /** Ce qu on lit quand on touche. Toujours des faits, jamais un jugement. */
  const lecture = (() => {
    if (!lu) return { titre: t("resume.branche_aide", locale), detail: t("resume.branche_legende", locale) };
    if ("compte" in lu) {
      return {
        titre: t("resume.branche_grappe", locale).replace("{a}", String(lu.age)).replace("{n}", String(lu.compte)),
        detail: t("resume.branche_legende", locale),
      };
    }
    const age = t("resume.vie_ans", locale).replace("{n}", String(lu.age));
    if (lu.kind === "tache") {
      return {
        titre: `${t("resume.branche_tache", locale)} — ${age}`,
        detail: lu.domaine ?? t("resume.branche_legende", locale),
      };
    }
    const ecart = lu.ouvertA !== null ? lu.age - lu.ouvertA : null;
    return {
      titre: `${t("resume.branche_fleur", locale)} — ${age}`,
      detail:
        ecart !== null
          ? t("resume.branche_relie", locale).replace("{a}", String(lu.ouvertA)).replace("{n}", String(ecart))
          : (lu.domaine ?? t("resume.branche_legende", locale)),
    };
  })();

  return (
    <div>
      <div ref={hote} className="relative -mx-5 w-[calc(100%+2.5rem)]">
        <canvas ref={encreRef} className="block w-full" />
        <canvas ref={vifRef} className="pointer-events-none absolute inset-0 h-full w-full" />

        {/* Les zones tactiles. Un canvas ne se touche pas : ce sont de vrais
            boutons posés dessus, donc atteignables au clavier et annonces par
            les lecteurs d ecran. 44 px minimum, la regle d Apple. */}
        <div className="absolute inset-0">
          {[...plan.marques, ...plan.grappes].map((m, i) => {
            const cible = "kind" in m ? m : m;
            const titre =
              "compte" in cible
                ? t("resume.branche_grappe", locale).replace("{a}", String(cible.age)).replace("{n}", String(cible.compte))
                : `${t(cible.kind === "tache" ? "resume.branche_tache" : "resume.branche_fleur", locale)} — ${t("resume.vie_ans", locale).replace("{n}", String(cible.age))}`;
            return (
              <button
                key={i}
                type="button"
                aria-label={titre}
                onClick={() => setLu((p) => (p === cible ? null : cible))}
                onMouseEnter={() => setLu(cible)}
                className="absolute rounded-full"
                style={{
                  left: `${((cible.x - 22) / L) * 100}%`,
                  top: `${((cible.y - 22) / H) * 100}%`,
                  width: `${(44 / L) * 100}%`,
                  height: `${(44 / H) * 100}%`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-2 min-h-[42px]">
        <p className="text-[12.5px] font-semibold leading-snug text-text-heading">{lecture.titre}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-text-body-subtle">{lecture.detail}</p>
      </div>
    </div>
  );
}
