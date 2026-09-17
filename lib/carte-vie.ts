/**
 * L affiche d une vie.
 *
 * ─── POURQUOI CET OBJET ─────────────────────────────────────────────────────
 *
 * Christophe, le 17/09 : « fais quelque chose d exceptionnel, il faut qu on se
 * demarque de la concurrence ».
 *
 * Toutes les apps d astrologie savent dire ce qui se passe aujourd hui. Aucune
 * ne peut montrer une VIE ENTIERE d un seul regard, parce qu aucune ne tient la
 * vie entiere en donnees structurees — le moteur de Marie-Ange, lui, en rend
 * pres de deux mille periodes datees.
 *
 * Cette affiche est donc la seule chose de ce produit qu un concurrent ne
 * pourrait pas copier en un trimestre : elle n est pas un effet, c est une
 * consequence de la donnee.
 *
 * ─── CE QU ELLE PORTE, ET DANS QUEL ORDRE ───────────────────────────────────
 *
 *  1. La signature de la personne — sa forme, tiree de sa seule naissance.
 *  2. La frise : une colonne par annee documentee, haute comme le nombre de
 *     periodes ouvertes cette annee-la. L annee en cours est marquee.
 *  3. Les chapitres longs, avec l age auquel ils ont commence.
 *  4. Un compte, jamais un jugement.
 *
 * ─── LES MEMES TROIS REFUS QUE LA CARTE DE COUPLE ───────────────────────────
 *
 *  - On ne capture pas le DOM : on peint. Les trois pieges iOS de la capture
 *    (premier rendu vide, canvas contamine par `capacitor://`, derive visuelle)
 *    n existent pas quand on dessine soi-meme.
 *  - Aucune image externe, donc aucun canvas contamine possible.
 *  - Rien n est predit. Une affiche de vie invite a la prophetie : il n y a ici
 *    que des comptes et des dates.
 */

import { empreinteDeNaissance, construireEmpreinte } from "@/lib/empreinte";
import type { ResumeDeVie } from "@/lib/resume-vie";

export { ANNEES_MINIMUM, afficheDisponible } from "@/lib/resume-vie";

export const LARGEUR = 1080;
export const HAUTEUR = 1350;

export interface ContenuVie {
  resume: ResumeDeVie;
  /** La naissance, sous la forme « 1977-09-27T00:00 ». */
  naissance: string;
  /** Les libellés, déjà traduits par l'écran. */
  eyebrow: string;
  titre: string;
  chapitresTitre: string;
  /** Le nom des chapitres, déjà résolus par l'écran (domaine ou titre). */
  chapitres: { nom: string; ageDebut: number; ageFin: number | null }[];
  pied: string;
}

function familleTitre(): string {
  if (typeof document === "undefined") return "sans-serif";
  const sonde = document.createElement("span");
  sonde.style.fontFamily = "var(--font-titre)";
  sonde.style.position = "absolute";
  sonde.style.visibility = "hidden";
  document.body.appendChild(sonde);
  const famille = getComputedStyle(sonde).fontFamily || "sans-serif";
  sonde.remove();
  return famille;
}

function lignes(ctx: CanvasRenderingContext2D, texte: string, largeurMax: number): string[] {
  const mots = texte.split(/\s+/);
  const sortie: string[] = [];
  let ligne = "";
  for (const mot of mots) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeurMax && ligne) {
      sortie.push(ligne);
      ligne = mot;
    } else {
      ligne = essai;
    }
  }
  if (ligne) sortie.push(ligne);
  return sortie;
}

export async function dessinerAfficheDeVie(contenu: ContenuVie): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  try {
    const { resume } = contenu;
    if (resume.vide) return null;

    const toile = document.createElement("canvas");
    toile.width = LARGEUR;
    toile.height = HAUTEUR;
    const ctx = toile.getContext("2d");
    if (!ctx) return null;

    const e = construireEmpreinte(empreinteDeNaissance(contenu.naissance));
    const famille = familleTitre();
    if (document.fonts?.ready) await document.fonts.ready;

    // ── Le fond ──
    ctx.fillStyle = "#15102b";
    ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
    const lueur = (x: number, y: number, r: number, couleur: string, alpha: number) => {
      const d = ctx.createRadialGradient(x, y, 0, x, y, r);
      d.addColorStop(0, couleur.replace("rgb(", "rgba(").replace(")", `,${alpha})`));
      d.addColorStop(1, couleur.replace("rgb(", "rgba(").replace(")", ",0)"));
      ctx.fillStyle = d;
      ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
    };
    lueur(LARGEUR * 0.72, HAUTEUR * 0.2, LARGEUR * 0.8, e.couleurs[0], 0.26);
    lueur(LARGEUR * 0.2, HAUTEUR * 0.82, LARGEUR * 0.75, e.couleurs[1], 0.2);

    // ── La signature, en fond ──
    const taille = LARGEUR * 0.88;
    ctx.save();
    ctx.translate((LARGEUR - taille) / 2, HAUTEUR * 0.42 - taille / 2);
    ctx.scale(taille / 100, taille / 100);
    ctx.lineCap = "round";
    e.chemins.forEach((d, i) => {
      ctx.strokeStyle = e.couleurs[i];
      ctx.globalAlpha = i === 0 ? 0.3 : 0.2;
      ctx.lineWidth = i === 0 ? 0.24 : 0.2;
      ctx.stroke(new Path2D(d));
    });
    ctx.restore();
    ctx.globalAlpha = 1;

    // Un voile, pour rendre au texte un fond calme sans rien flouter.
    const voile = ctx.createLinearGradient(0, 0, 0, HAUTEUR);
    voile.addColorStop(0, "rgba(21,16,43,0.9)");
    voile.addColorStop(0.3, "rgba(21,16,43,0.55)");
    voile.addColorStop(0.52, "rgba(21,16,43,0.2)");
    voile.addColorStop(1, "rgba(21,16,43,0.86)");
    ctx.fillStyle = voile;
    ctx.fillRect(0, 0, LARGEUR, HAUTEUR);

    // ── Le mot qui coiffe ──
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `600 26px ${famille}`;
    const coiffe = contenu.eyebrow.toUpperCase();
    ctx.textAlign = "left";
    let x = 88;
    for (const c of coiffe) {
      ctx.fillText(c, x, 128);
      x += ctx.measureText(c).width + 7;
    }

    // ── Le titre ──
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.font = `300 84px ${famille}`;
    const titre = lignes(ctx, contenu.titre, LARGEUR - 176);
    titre.forEach((l, i) => ctx.fillText(l, 88, 250 + i * 92));

    // ── LA FRISE ──
    //
    // C est le sujet de l affiche. Une colonne par annee documentee, haute
    // comme le nombre de periodes ouvertes cette annee-la. L annee en cours
    // porte la seule marque claire.
    const depart = resume.premiereDocumentee ?? 0;
    const annees = resume.annees.slice(depart);
    const haut = Math.max(1, ...annees.map((a) => a.periodes));
    // La frise remonte, et l espace sous elle est calcule pour trois chapitres
    // plus la signature. Mesure du 17/09 : a 760, le troisieme chapitre passait
    // sous « favorable.day » et les deux se chevauchaient.
    const friseY = 700;
    const friseH = 240;
    const friseL = LARGEUR - 176;
    // La barre est BORNEE a 26 px, et la frise se centre.
    //
    // Mesure du 17/09 sur un jeu qui ne documentait que deux annees : sans
    // borne, chaque annee occupait 450 px et l affiche montrait deux grands
    // rectangles blancs. Une frise de vie doit se lire comme une frise, quel
    // que soit le nombre d annees qu elle porte.
    const pasBrut = friseL / Math.max(1, annees.length);
    const largeurBarre = Math.min(26, Math.max(2, pasBrut * 0.72));
    const pas = Math.min(pasBrut, largeurBarre / 0.72);
    const friseX = 88 + (friseL - pas * annees.length) / 2;

    annees.forEach((a, i) => {
      const h = Math.max(4, (a.periodes / haut) * friseH);
      const courante = a.age === resume.age;
      ctx.fillStyle = courante
        ? "rgba(255,255,255,0.95)"
        : e.couleurs[0].replace("rgb(", "rgba(").replace(")", `,${0.3 + (a.periodes / haut) * 0.55})`);
      ctx.fillRect(friseX + i * pas, friseY + friseH - h, largeurBarre, h);
    });

    // Les bornes de la frise : deux ages, rien d autre.
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = `500 26px ${famille}`;
    ctx.textAlign = "left";
    ctx.fillText(String(depart), 88, friseY + friseH + 44);
    ctx.textAlign = "right";
    ctx.fillText(String(resume.age), LARGEUR - 88, friseY + friseH + 44);

    // ── Les chapitres ──
    const derniers = contenu.chapitres.slice(-3);
    if (derniers.length > 0) {
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = `600 22px ${famille}`;
      ctx.fillText(contenu.chapitresTitre.toUpperCase(), 88, friseY + friseH + 108);
    }
    derniers.forEach((c, i) => {
      const y = friseY + friseH + 150 + i * 48;
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.font = `400 32px ${famille}`;
      ctx.textAlign = "left";
      ctx.fillText(c.nom, 88, y);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = `400 28px ${famille}`;
      ctx.textAlign = "right";
      ctx.fillText(c.ageFin === null ? `${c.ageDebut} →` : `${c.ageDebut} – ${c.ageFin}`, LARGEUR - 88, y);
    });

    // ── La signature du produit ──
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = `500 26px ${famille}`;
    ctx.textAlign = "center";
    ctx.fillText("favorable.day", LARGEUR / 2, HAUTEUR - 52);

    return await new Promise<Blob | null>((resoudre) =>
      toile.toBlob((b) => resoudre(b), "image/png"),
    );
  } catch {
    return null;
  }
}
