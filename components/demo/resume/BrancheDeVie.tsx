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
import { houseToDomain } from "@/lib/event-labels";
import type { ResumeDeVie } from "@/lib/resume-vie";
import type { ChapitreDeVie } from "@/lib/chapitres-vie";
import type { MomentumPhase } from "@/types/momentum";

/* ── Le cadre de dessin ─────────────────────────────────────────────────────
   Un repere fixe : on dessine toujours dans 360 x 620, et le canvas est mis a
   l echelle de la largeur reelle. Les coordonnees restent donc lisibles, et
   rien ne bouge quand le telephone change de largeur. */
const L = 340;
const H = 660;
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

/**
 * La couleur d une forme : TROIS, pas douze.
 *
 * Christophe, le 17/09 : « il faut aussi les trois couleurs, comme dans
 * l artefact ». Les douze maisons donnaient douze teintes tres proches — sur
 * ses donnees, presque toutes violettes — et l oeuvre retombait en monochrome.
 *
 * Or Favorable a deja son decoupage en trois : `DomainKey = love | health |
 * work`, et `houseToDomain` (lib/event-labels.ts) dit quelle maison va dans
 * quelle famille. C est la traduction du projet, pas la mienne. Trois teintes
 * franchement distinctes, deja declarees : rose, violet, bleu.
 *
 * La MAISON reste la verite du texte ; la couleur, elle, dit la famille. Le
 * lecteur voit trois courants et lit le detail exact en touchant.
 */
const JETON_FAMILLE: Record<string, string> = {
  love: "--domaine-love",
  work: "--domaine-career",
  health: "--domaine-health-energy",
};
function couleurDe(maison: number | undefined, phase: MomentumPhase | undefined, teinte: Teinte, el: HTMLElement): string {
  const famille = houseToDomain(maison) ?? phase?.domain ?? null;
  if (famille && JETON_FAMILLE[famille]) {
    const jeton = getComputedStyle(el).getPropertyValue(JETON_FAMILLE[famille]).trim();
    if (jeton) return jeton;
  }
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

type Grappe = { u: number; x: number; y: number; R: number; maison?: number; phase?: MomentumPhase; graine: number; age: number; compte: number; libelle: string; boutons: { x: number; y: number; r: number; graine: number; a: number }[] };
type Marque = {
  kind: "tache" | "fleur";
  u: number;
  x: number;
  y: number;
  /** Le point d attache sur la branche : la brindille part de la. */
  ax: number;
  ay: number;
  r: number;
  maison?: number;
  phase?: MomentumPhase;
  graine: number;
  age: number;
  /** Quand : « 26 ans » a l echelle d une vie, « 4 mars » a celle d un mois. */
  libelle: string;
  /** Le libelle du domaine, quand le moteur en donne un. */
  domaine: string | null;
  /** Pour une fleur : le chapitre ouvert qui la contient, s il y en a un. */
  /** Pour une fleur : la position du chapitre ouvert qui la contient. */
  ouvertA: number | null;
};

export function BrancheDeVie({
  resume,
  locale,
  maintenant,
  chapitres,
  phasesAnnee,
}: {
  resume: ResumeDeVie;
  locale: Locale;
  /** L instant de lecture, fige par l appelant — jamais `Date.now()` ici. */
  maintenant: number;
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
  /**
   * Les periodes de l annee, telles que le store les tient deja.
   *
   * Elles portent des dates exactes : c est ce qui permet les echelles
   * courtes. Sans elles, seule « Vie » est proposee — on ne montre jamais un
   * onglet qui n aurait rien a dire.
   */
  phasesAnnee?: MomentumPhase[];
}) {
  const fige = useReducedMotion();
  const hote = useRef<HTMLDivElement | null>(null);
  const encreRef = useRef<HTMLCanvasElement | null>(null);
  const vifRef = useRef<HTMLCanvasElement | null>(null);
  const [lu, setLu] = useState<Marque | Grappe | null>(null);
  /**
   * Epingle ou non.
   *
   * Sans cette distinction, le clic annulait sa propre lecture : le survol
   * posait la marque, puis le clic — qui basculait — la retirait aussitot.
   * Au doigt il n y a pas de survol, donc le clic POSE ; a la souris il
   * epingle, et un second clic sur la meme marque relache.
   */
  const [fixe, setFixe] = useState(false);
  /**
   * Repeindre, mais seulement quand il y a de quoi.
   *
   * `next-themes` pose sa classe APRES le montage. L observateur voyait donc
   * une mutation a chaque ouverture, relançait la peinture, et son nettoyage
   * annulait la pousse en cours : il ne restait a l ecran que le lavis dilue
   * et le premier trait. On ne repeint donc que si l encre — ou la largeur —
   * a reellement change, et on n anime qu a la premiere peinture.
   */
  const [cle, setCle] = useState(0);
  const dejaAnime = useRef(false);
  const signature = useRef("");

  // Le bas de la branche : le plus ancien age dont on ait quelque chose a
  // dire — un chapitre ou un compte. Pas zero par defaut : dessiner de zero
  // quand le calcul commence a 39 ans ferait croire a 39 annees vides.
  const [echelle, setEchelle] = useState<"vie" | "annee" | "mois">("vie");

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
  /**
   * Les echelles courtes : « Annee » = les douze mois en cours, « Mois » = les
   * jours du mois. Memes periodes, autre fenetre — c est un ZOOM, pas une
   * autre donnee. Les libelles de date viennent d `Intl`, donc les dix langues
   * sont couvertes sans une seule chaine a traduire.
   */
  const court = useMemo(() => {
    if (echelle === "vie") return null;
    const per = (phasesAnnee ?? [])
      .map((ph) => ({ ph, d: new Date(ph.startDate).getTime(), f: ph.endDate ? new Date(ph.endDate).getTime() : null }))
      .filter((x) => Number.isFinite(x.d));
    if (per.length === 0) return null;
    const now = new Date(maintenant);
    const debut = echelle === "annee" ? new Date(now.getFullYear(), 0, 1) : new Date(now.getFullYear(), now.getMonth(), 1);
    const fin = echelle === "annee" ? new Date(now.getFullYear() + 1, 0, 1) : new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const t0 = debut.getTime();
    const t1 = fin.getTime();
    const span = t1 - t0;
    const pas = echelle === "annee" ? 12 : Math.round(span / 86400000);
    const posDe = (t: number) => Math.min(1, Math.max(0, (t - t0) / span));
    const bornes: number[] = [];
    for (let i = 0; i <= pas; i++) {
      bornes.push(echelle === "annee" ? new Date(now.getFullYear(), i, 1).getTime() : t0 + i * 86400000);
    }
    // Le compte : combien de periodes ouvertes sur chaque case.
    const comptes = bornes.slice(0, -1).map((a, i) => {
      const b = bornes[i + 1];
      return per.filter((x) => x.d < b && (x.f === null || x.f > a)).length;
    });
    const fmt = new Intl.DateTimeFormat(locale, echelle === "annee" ? { month: "short" } : { day: "numeric" });
    const reperes = bornes.slice(0, -1).map((a, i) => ({ pos: posDe(a), libelle: fmt.format(new Date(a)), i }))
      .filter((r, i) => (echelle === "annee" ? true : i % 5 === 0));
    const libelleDe = (pos: number) =>
      new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(new Date(t0 + pos * span));
    const ouvertures = per
      .filter((x) => x.d >= t0 && x.d < t1)
      .map((x) => ({ pos: posDe(x.d), domaine: x.ph.house ? (noms[DOMAINE[x.ph.house]] ?? null) : null, maison: x.ph.house, phase: x.ph }));
    return { comptes, reperes, libelleDe, ouvertures, posMaintenant: posDe(maintenant) };
  }, [echelle, phasesAnnee, maintenant, locale, noms]);

  const plan = useMemo(() => {
    /* ── La source, ramenee a une seule forme ─────────────────────────────
       Tout ce qui suit travaille en POSITION (0 = le bas, 1 = maintenant),
       jamais en ages ni en dates. C est ce qui permet aux trois echelles de
       partager exactement la meme geometrie : seule la source change. */
    type Src = {
      comptes: number[];
      ouvertures: { pos: number; domaine: string | null; maison?: number; phase?: MomentumPhase }[];
      bascules: { pos: number; maison?: number; phase?: MomentumPhase }[];
      reperes: { pos: number; libelle: string }[];
      libelleDe: (pos: number) => string;
    };
    let src: Src;

    if (court) {
      src = {
        comptes: court.comptes,
        ouvertures: court.ouvertures,
        // A l echelle courte, le moteur ne marque pas de bascule : on n en
        // invente pas. La branche et les taches suffisent.
        bascules: [],
        reperes: court.reperes,
        libelleDe: court.libelleDe,
      };
    } else {
      const span = Math.max(1, resume.age - depart);
      if (span < 2 && (!chapitres || chapitres.length === 0)) return null;
      const parAge = new Map(resume.annees.map((a) => [a.age, a.periodes]));
      const posDe = (age: number) => Math.min(1, Math.max(0, (age - depart) / span));
      const comptes: number[] = [];
      for (let age = depart; age <= resume.age; age++) comptes.push(parAge.get(age) ?? -1);
      const ouvertures = (chapitres && chapitres.length > 0
        ? chapitres.map((c) => ({ ageDebut: c.ageDebut, domaine: c.domaine, maison: c.maison, phase: undefined as MomentumPhase | undefined }))
        : resume.chapitres.map((c) => ({
            ageDebut: c.ageDebut,
            domaine: c.phase.house ? (noms[DOMAINE[c.phase.house]] ?? null) : null,
            maison: c.phase.house,
            phase: c.phase,
          }))
      )
        // Ni avant le premier age documente, ni APRES aujourd hui : le moteur
        // rend des chapitres au-dela de son horizon, et les dessiner en haut
        // les ferait passer pour le present. Le produit est descriptif.
        .filter((c) => c.ageDebut >= depart && c.ageDebut <= resume.age)
        .map((c) => ({ pos: posDe(c.ageDebut), domaine: c.domaine, maison: c.maison, phase: c.phase }));
      const bascules = resume.bascules
        .filter((b) => b.age >= depart && b.age <= resume.age)
        .map((b) => ({ pos: posDe(b.age), maison: b.phase.house, phase: b.phase }));
      const reperes: { pos: number; libelle: string }[] = [];
      const pas = span > 60 ? 20 : span > 30 ? 10 : 5;
      for (let age = depart; age <= resume.age; age += pas) reperes.push({ pos: posDe(age), libelle: String(age) });
      src = {
        comptes,
        ouvertures,
        bascules,
        reperes,
        libelleDe: (pos) => t("resume.vie_ans", locale).replace("{n}", String(Math.round(depart + pos * span))),
      };
    }

    const n = src.comptes.length;
    if (n < 2) return null;
    const connus = src.comptes.filter((c) => c >= 0);
    const hautCompte = Math.max(1, ...connus);
    /** Le compte a cette position, ou `null` la ou le moteur ne compte pas. */
    const compteA = (u: number): number | null => {
      const i = Math.round(u * (n - 1));
      const c = src.comptes[Math.min(n - 1, Math.max(0, i))];
      return c === undefined || c < 0 ? null : c;
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
        const t2 = k / N;
        const v = 1 - t2;
        pts.push({ x: v * v * x + 2 * v * t2 * mx + t2 * t2 * x1, y: v * v * y0 + 2 * v * t2 * my + t2 * t2 * y1, u: u0 + (u1 - u0) * t2 });
      }
      segments.push({ pts, u0, u1, graine: i * 7 + 1 });
      x = x1;
      noeuds.push({ u: u1, x, y: y1 });
    }
    const largeur = (u: number) => {
      const bas = 12.5 * Math.pow(1 - u, 0.8) + 1.8;
      // La ou le moteur compte, l epaisseur suit le compte. La ou il ne compte
      // pas, elle reste neutre : une branche fine ne veut pas dire « periode
      // calme », elle veut dire « rien de mesure ici ».
      const c = compteA(u);
      const charge = c === null ? 1 : 0.55 + 0.9 * (c / hautCompte);
      return bas * charge * (1 + 0.08 * ondule(u * 5, 3));
    };
    const surLaBranche = (u: number) => {
      for (const sg of segments) {
        if (u <= sg.u1 || sg === segments[segments.length - 1]) {
          const q = Math.max(0, Math.min(1, (u - sg.u0) / (sg.u1 - sg.u0 || 1)));
          const k = Math.round(q * (sg.pts.length - 1));
          const pp = sg.pts[k];
          const a = sg.pts[Math.max(0, k - 1)];
          const b = sg.pts[Math.min(sg.pts.length - 1, k + 1)];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const l = Math.hypot(dx, dy) || 1;
          return { x: pp.x, y: pp.y, nx: -dy / l, ny: dx / l, w: largeur(u) };
        }
      }
      const pp = segments[0].pts[0];
      return { x: pp.x, y: pp.y, nx: 1, ny: 0, w: largeur(0) };
    };

    // Les grappes : les cases les plus chargees, espacees pour que le papier
    // respire. Peu et grandes — une vie n est pas un semis.
    const pics = src.comptes
      .map((c, i) => ({ i, compte: c, pos: i / (n - 1) }))
      .filter((a) => a.compte > 0)
      .filter((a, i, tab) => (i === 0 || a.compte >= tab[i - 1].compte) && (i === tab.length - 1 || a.compte >= tab[i + 1].compte))
      .sort((a, b) => b.compte - a.compte);
    const grappes: Grappe[] = [];
    for (const pk of pics) {
      if (grappes.some((g) => Math.abs(g.u - pk.pos) < 0.1)) continue;
      if (grappes.length >= 6) break;
      const bp = surLaBranche(pk.pos);
      const gr = Math.round(pk.pos * 4000) + pk.compte * 17;
      const cote = bruit(gr) > 0 ? 1 : -1;
      const dist = bp.w + 12 + 20 * Math.abs(bruit(gr + 5));
      const cx = bp.x + cote * bp.nx * dist;
      const cy = bp.y + cote * bp.ny * dist;
      const force = pk.compte / hautCompte;
      const R = 11 + force * 15;
      const nb = 5 + Math.round(force * 7);
      const boutons = [];
      for (let k = 0; k < nb; k++) {
        const ang = bruit(gr + k * 7) * 6.28;
        const dd = Math.pow(Math.abs(bruit(gr + k * 3)), 0.68) * R;
        boutons.push({ x: cx + Math.cos(ang) * dd, y: cy + Math.sin(ang) * dd * 0.82, r: 2.4 + Math.abs(bruit(gr + k * 11)) * 3.6, graine: gr + k * 29, a: 0.34 + 0.3 * Math.abs(bruit(gr + k * 5)) });
      }
      const dedans = src.ouvertures.filter((ov) => ov.pos <= pk.pos).slice(-1)[0];
      grappes.push({ u: pk.pos, x: cx, y: cy, R, maison: dedans?.maison, phase: dedans?.phase, graine: gr, age: pk.compte, compte: pk.compte, boutons, libelle: src.libelleDe(pk.pos) });
    }

    const marques: Marque[] = [];
    src.ouvertures.forEach((c, i) => {
      const bp = surLaBranche(c.pos);
      const gr = i * 131 + 11;
      const cote = bruit(gr + 3) > 0 ? 1 : -1;
      marques.push({
        kind: "tache",
        u: c.pos,
        ax: bp.x,
        ay: bp.y,
        x: bp.x + cote * bp.nx * (bp.w + 13 + 10 * Math.abs(bruit(gr))),
        y: bp.y + cote * bp.ny * (bp.w + 13),
        r: 7 + 3.5 * Math.abs(bruit(gr + 1)),
        maison: c.maison,
        phase: c.phase,
        graine: gr,
        age: 0,
        libelle: src.libelleDe(c.pos),
        domaine: c.domaine,
        ouvertA: null,
      });
    });
    src.bascules.forEach((b, i) => {
      const bp = surLaBranche(b.pos);
      const gr = i * 197 + 23;
      const cote = bruit(gr + 3) > 0 ? -1 : 1;
      const ouv = src.ouvertures.filter((ov) => ov.pos <= b.pos).slice(-1)[0];
      marques.push({
        kind: "fleur",
        u: b.pos,
        ax: bp.x,
        ay: bp.y,
        x: bp.x + cote * bp.nx * (bp.w + 17 + 14 * Math.abs(bruit(gr))),
        y: bp.y + cote * bp.ny * (bp.w + 17),
        r: 12 + 6 * Math.abs(bruit(gr + 7)),
        maison: b.maison,
        phase: b.phase,
        graine: gr,
        age: 0,
        libelle: src.libelleDe(b.pos),
        domaine: ouv?.domaine ?? null,
        ouvertA: ouv ? ouv.pos : null,
      });
    });

    return { segments, noeuds, largeur, surLaBranche, grappes, marques, reperes: src.reperes };
  }, [resume, depart, noms, chapitres, court, locale]);

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

      const grappes = plan.grappes.map((gr) => ({ ...gr, col: couleurDe(gr.maison, gr.phase, teinte, h) }));
      const marques = plan.marques.map((m) => ({ ...m, col: couleurDe(m.maison, m.phase, teinte, h) }));

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

  useEffect(() => {
    const stop = peindre(!dejaAnime.current);
    dejaAnime.current = true;
    return stop;
  }, [peindre, cle]);

  useEffect(() => {
    const relire = () => {
      const h = hote.current;
      if (!h) return;
      const te = lireLesTeintes(h);
      const sig = `${te.trait}|${te.diluee}|${te.discret}|${h.clientWidth}`;
      if (sig === signature.current) return;
      const premier = signature.current === "";
      signature.current = sig;
      // La premiere lecture ne declenche rien : la peinture vient de partir.
      if (!premier) setCle((n) => n + 1);
    };
    relire();
    const obs = new MutationObserver(relire);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    let tm: ReturnType<typeof setTimeout>;
    const surTaille = () => {
      clearTimeout(tm);
      tm = setTimeout(relire, 200);
    };
    window.addEventListener("resize", surTaille);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", surTaille);
      clearTimeout(tm);
    };
  }, []);

  /* ── La brise ────────────────────────────────────────────────────────────
     Un cerisier qui s effeuille, pas une pluie de confettis.

     Quatre choses font la difference, et elles sont toutes dans la physique
     du petale, pas dans le nombre :
       — il VRILLE : son echelle horizontale oscille, donc il se montre de
         face puis de profil. C est ce qui se lit comme « il tourne » ;
       — il tombe LENTEMENT et jamais droit : le balancement lateral est plus
         ample que la vitesse de chute ;
       — le vent vient par RAFALES, partagees par tous les petales, donc ils
         derivent ensemble au lieu de faire chacun son bruit ;
       — il nait et meurt en fondu, et jamais deux ne partent ensemble.

     Elle vit sur le calque du haut, jamais sur l encre, et s arrete quand
     l onglet est cache : une animation invisible ne doit rien couter. */
  useEffect(() => {
    if (fige || !plan) return;
    const cv = vifRef.current;
    const h = hote.current;
    if (!cv || !h) return;
    const gv = cv.getContext("2d");
    if (!gv) return;
    const teinte = lireLesTeintes(h);
    const sources = [
      ...plan.grappes.flatMap((gr) => gr.boutons.map((b) => ({ x: b.x, y: b.y, r: b.r, maison: gr.maison, phase: gr.phase }))),
      ...plan.marques.filter((m) => m.kind === "fleur").map((m) => ({ x: m.x, y: m.y, r: m.r * 0.5, maison: m.maison, phase: m.phase })),
    ];
    if (sources.length === 0) return;

    type Petale = {
      x: number; y: number; col: string; len: number; forme: number;
      rot: number; vr: number;            // orientation et sa vitesse
      vrille: number; vvrille: number;    // la rotation sur lui-meme
      vy: number; bal: number; ph: number; fq: number;
      age: number; vie: number;
    };
    let petales: Petale[] = [];
    let image = 0;
    let horloge = performance.now();
    let dernier = horloge;
    let prochain = 300;
    let vivant = true;

    const naitre = (): Petale => {
      const src = sources[Math.floor(Math.random() * sources.length)];
      return {
        x: src.x + (Math.random() - 0.5) * src.r * 1.6,
        y: src.y + (Math.random() - 0.5) * src.r,
        col: couleurDe(src.maison, src.phase, teinte, h),
        len: 3.4 + Math.random() * 4.2,
        forme: 0.8 + Math.random() * 0.5,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 1.6,
        vrille: Math.random() * 6.28,
        vvrille: 1.6 + Math.random() * 2.4,
        vy: 7 + Math.random() * 7,
        bal: 9 + Math.random() * 14,
        ph: Math.random() * 6.28,
        fq: 0.5 + Math.random() * 0.7,
        age: 0,
        vie: 7 + Math.random() * 5,
      };
    };

    const tour = (now: number) => {
      if (!vivant) return;
      const dt = Math.min(0.05, (now - horloge) / 1000);
      horloge = now;
      const sec = now / 1000;
      // La rafale : lente, partagee, jamais nulle. Deux sinus de periodes
      // premieres entre elles, pour qu elle ne se repete pas a l oreille.
      const rafale = 0.55 + 0.45 * Math.sin(sec * 0.23) * Math.sin(sec * 0.07 + 1.3);

      if (now - dernier > prochain && petales.length < 26) {
        dernier = now;
        prochain = 150 + Math.random() * 420;
        petales.push(naitre());
        if (Math.random() < 0.35) petales.push(naitre());
      }

      gv.save();
      gv.setTransform(1, 0, 0, 1, 0, 0);
      gv.clearRect(0, 0, cv.width, cv.height);
      gv.restore();

      petales = petales.filter((pt) => pt.age < pt.vie && pt.y < H + 12);
      for (const pt of petales) {
        pt.age += dt;
        pt.vrille += pt.vvrille * dt;
        pt.rot += pt.vr * dt;
        // Le balancement domine la chute : un petale ne tombe pas, il flotte.
        pt.x += (Math.sin(pt.ph + pt.age * pt.fq) * pt.bal + rafale * 9) * dt;
        pt.y += pt.vy * (0.75 + 0.35 * Math.cos(pt.ph + pt.age * pt.fq)) * dt;
        const fondu = Math.min(1, pt.age * 1.6) * Math.min(1, (pt.vie - pt.age) / 2);
        petale(gv, pt.x, pt.y, pt.rot, pt.len, pt.len * 0.66, pt.col, 0.62 * fondu, pt.forme, Math.cos(pt.vrille));
      }
      image = requestAnimationFrame(tour);
    };

    const partir = () => {
      if (!image && !document.hidden) {
        horloge = performance.now();
        dernier = horloge;
        image = requestAnimationFrame(tour);
      }
    };
    const arreter = () => {
      if (image) cancelAnimationFrame(image);
      image = 0;
    };
    const surVisibilite = () => (document.hidden ? arreter() : partir());
    // On laisse la pousse finir avant que le vent se leve.
    const depart = setTimeout(partir, 2600);
    document.addEventListener("visibilitychange", surVisibilite);
    return () => {
      vivant = false;
      clearTimeout(depart);
      arreter();
      document.removeEventListener("visibilitychange", surVisibilite);
    };
  }, [plan, fige, cle]);

  if (!plan) return null;
  void maintenant;

  /** Ce qu on lit quand on touche. Toujours des faits, jamais un jugement. */
  const lecture = (() => {
    if (!lu) return { titre: t("resume.branche_aide", locale), detail: t("resume.branche_legende", locale) };
    if ("compte" in lu) {
      return {
        titre: t("resume.branche_grappe", locale).replace("{a}", lu.libelle).replace("{n}", String(lu.compte)),
        detail: t("resume.branche_legende", locale),
      };
    }
    const quoi = t(lu.kind === "tache" ? "resume.branche_tache" : "resume.branche_fleur", locale);
    return {
      titre: `${quoi} — ${lu.libelle}`,
      detail: lu.domaine ?? t("resume.branche_legende", locale),
    };
  })();

  /* Les echelles courtes n apparaissent que si le store a des periodes datees
     a montrer : on ne propose jamais un onglet qui n aurait rien a dire. */
  const echellesDispo: { clef: "vie" | "annee" | "mois"; libelle: string }[] = [
    { clef: "vie", libelle: t("resume.branche_ech_vie", locale) },
    ...((phasesAnnee?.length ?? 0) > 0
      ? ([
          { clef: "annee" as const, libelle: t("resume.branche_ech_annee", locale) },
          { clef: "mois" as const, libelle: t("resume.branche_ech_mois", locale) },
        ])
      : []),
  ];

  return (
    <div>
      {echellesDispo.length > 1 ? (
        <div
          className="mx-auto mb-2 flex w-fit gap-1 rounded-full p-1"
          style={{ background: "var(--bg-tertiary)" }}
          role="tablist"
        >
          {echellesDispo.map((e) => {
            const actif = echelle === e.clef;
            return (
              <button
                key={e.clef}
                type="button"
                role="tab"
                aria-selected={actif}
                onClick={() => {
                  setEchelle(e.clef);
                  setLu(null);
                  setFixe(false);
                }}
                className="min-h-[44px] rounded-full px-4 text-[13px] font-semibold"
                style={{
                  background: actif ? "var(--bg-secondary)" : "transparent",
                  color: actif ? "var(--text-heading)" : "var(--text-body-subtle)",
                }}
              >
                {e.libelle}
              </button>
            );
          })}
        </div>
      ) : null}

      <div ref={hote} className="relative w-full touch-manipulation">
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
                ? t("resume.branche_grappe", locale).replace("{a}", cible.libelle).replace("{n}", String(cible.compte))
                : `${t(cible.kind === "tache" ? "resume.branche_tache" : "resume.branche_fleur", locale)} — ${cible.libelle}`;
            return (
              <button
                key={i}
                type="button"
                aria-label={titre}
                onClick={() => {
                  if (fixe && lu === cible) {
                    setFixe(false);
                    setLu(null);
                  } else {
                    setFixe(true);
                    setLu(cible);
                  }
                }}
                onMouseEnter={() => {
                  if (!fixe) setLu(cible);
                }}
                onMouseLeave={() => {
                  if (!fixe) setLu(null);
                }}
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
