/**
 * La carte qu on envoie, peinte a la main.
 *
 * ─── POURQUOI ON NE CAPTURE PAS LE DOM ──────────────────────────────────────
 *
 * La facon habituelle de partager un bout d interface est de le photographier
 * avec `html-to-image` ou `html2canvas`. Sur iOS, trois pieges bien documentes
 * attendent :
 *
 *  1. **Le premier appel rend une image vide** ou sans polices sur Safari
 *     mobile. Le contournement communautaire est d appeler deux ou trois fois
 *     et de ne garder que le dernier resultat — autrement dit, de s en
 *     remettre au hasard.
 *  2. **Le canvas est « contamine »** des qu une image chargee sans accord
 *     d origine y entre, et l export devient impossible. Il existe en plus une
 *     regression iOS 18 sur `crossorigin` avec un schema personnalise —
 *     c est-a-dire exactement `capacitor://`, le notre.
 *  3. La bibliotheque reconstruit le DOM et **derive visuellement** : ce qu on
 *     partage n est jamais tout a fait ce qu on voyait.
 *
 * Or on n a pas besoin de photographier quoi que ce soit : cette carte est
 * ENTIEREMENT dessinee par nous. Deux traces, deux aplats, quatre lignes de
 * texte. On la peint donc directement au Canvas 2D. Aucune dependance, aucune
 * image externe, aucun risque de contamination, et un resultat identique a
 * chaque appel.
 *
 * `Path2D` accepte telle quelle la chaine `d` d un trace SVG : les courbes de
 * l empreinte passent du rapport a la carte sans etre recalculees.
 *
 * ─── LE FORMAT ──────────────────────────────────────────────────────────────
 *
 * 1080 x 1350, le portrait 4:5 des recits partages. Un cadre constant, un
 * contenu unique : c est ce qui rend une serie reconnaissable dans un fil tout
 * en laissant chaque exemplaire singulier.
 *
 * ─── CE QUI N Y FIGURE PAS ──────────────────────────────────────────────────
 *
 * Le score. On partage le terrain que les deux ont en commun, vrai quel que
 * soit le chiffre. Un produit dont l objet partageable est une note devient un
 * produit qui flatte, et une note basse est structurellement impartageable.
 */

import { construireEmpreinte, type ParametresEmpreinte } from "@/lib/empreinte";

export const LARGEUR = 1080;
export const HAUTEUR = 1350;

export interface ContenuCarte {
  parametres: ParametresEmpreinte;
  /** Le terrain commun, deja traduit. */
  titre: string;
  /** Sa phrase d explication, deja traduite. */
  aide: string;
  /** Le mot qui coiffe la carte, deja traduit. */
  eyebrow: string;
  initialeMoi: string;
  initialeAutre: string;
}

/**
 * La famille de police reellement chargee, lue sur le document.
 *
 * `next/font/local` fabrique un nom de famille hache a la compilation : on ne
 * peut pas l ecrire en dur. On le demande donc au navigateur, via un element
 * qui porte deja le jeton. Sans police chargee, le canvas retomberait sur une
 * police systeme et la carte ne ressemblerait plus a l app.
 */
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

/** Coupe un texte en lignes qui tiennent dans une largeur donnee. */
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

function pastille(
  ctx: CanvasRenderingContext2D,
  lettre: string,
  x: number,
  y: number,
  r: number,
  pleine: boolean,
  famille: string,
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = pleine ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.16)";
  ctx.fill();
  ctx.fillStyle = pleine ? "rgba(20,14,40,0.92)" : "rgba(255,255,255,0.86)";
  ctx.font = `600 ${Math.round(r * 0.95)}px ${famille}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(lettre.slice(0, 1).toUpperCase(), x, y + r * 0.04);
}

/**
 * Peint la carte et la rend en fichier PNG.
 *
 * Rend `null` plutot que de jeter : un partage qui echoue ne doit jamais
 * casser l ecran d ou il part.
 */
export async function dessinerCarte(contenu: ContenuCarte): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  try {
    const toile = document.createElement("canvas");
    toile.width = LARGEUR;
    toile.height = HAUTEUR;
    const ctx = toile.getContext("2d");
    if (!ctx) return null;

    const e = construireEmpreinte(contenu.parametres);
    const famille = familleTitre();

    // Les polices doivent etre PRETES avant le premier `fillText` : le canvas
    // ne re-dessine pas quand une police finit de charger, contrairement au
    // DOM. C est la seule attente de cette fonction.
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
    lueur(LARGEUR * 0.5, HAUTEUR * 0.3, LARGEUR * 0.82, e.couleurs[0], 0.3);
    lueur(LARGEUR * 0.18, HAUTEUR * 0.86, LARGEUR * 0.7, e.couleurs[1], 0.2);

    // ── L empreinte ──
    //
    // Elle occupe presque toute la carte, en fond. Mesure du 16/09 : centree a
    // mi-hauteur et a forte opacite, elle passait SOUS la phrase d explication
    // et la rendait illisible — un trace dense derriere du texte de 34 px ne
    // pardonne pas. Elle descend donc, elle s etale, et elle s efface.
    //
    // Le trace vit dans un repere de 100 : on le met a l echelle de la carte.
    const taille = LARGEUR * 0.96;
    ctx.save();
    ctx.translate((LARGEUR - taille) / 2, HAUTEUR * 0.56 - taille / 2);
    ctx.scale(taille / 100, taille / 100);
    ctx.lineCap = "round";
    e.chemins.forEach((d, i) => {
      ctx.strokeStyle = e.couleurs[i];
      ctx.globalAlpha = i === 0 ? 0.46 : 0.3;
      ctx.lineWidth = i === 0 ? 0.26 : 0.22;
      ctx.stroke(new Path2D(d));
    });
    ctx.restore();
    ctx.globalAlpha = 1;

    // ── Le voile ──
    // Un fondu vertical qui rend au texte un fond calme, sans rien flouter. Le
    // haut redevient lisible, le bas garde la figure entiere.
    const voile = ctx.createLinearGradient(0, 0, 0, HAUTEUR);
    voile.addColorStop(0, "rgba(21,16,43,0.92)");
    voile.addColorStop(0.34, "rgba(21,16,43,0.62)");
    voile.addColorStop(0.52, "rgba(21,16,43,0)");
    voile.addColorStop(0.88, "rgba(21,16,43,0)");
    voile.addColorStop(1, "rgba(21,16,43,0.8)");
    ctx.fillStyle = voile;
    ctx.fillRect(0, 0, LARGEUR, HAUTEUR);

    // ── Le mot qui coiffe ──
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `600 26px ${famille}`;
    const coiffe = contenu.eyebrow.toUpperCase();
    // L approche s ecrit a la main : le canvas ignore `letter-spacing`.
    let x = LARGEUR / 2 - (ctx.measureText(coiffe).width + (coiffe.length - 1) * 7) / 2;
    for (const c of coiffe) {
      ctx.textAlign = "left";
      ctx.fillText(c, x, 132);
      x += ctx.measureText(c).width + 7;
    }
    ctx.textAlign = "center";

    // ── Le terrain commun ──
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.font = `300 108px ${famille}`;
    const titre = lignes(ctx, contenu.titre, LARGEUR * 0.82);
    titre.forEach((l, i) => ctx.fillText(l, LARGEUR / 2, 300 + i * 116));

    // ── Sa phrase ──
    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.font = `400 34px ${famille}`;
    const aide = lignes(ctx, contenu.aide, LARGEUR * 0.74);
    const hautAide = 300 + titre.length * 116 + 28;
    aide.forEach((l, i) => ctx.fillText(l, LARGEUR / 2, hautAide + i * 46));

    // ── Les deux initiales ──
    pastille(ctx, contenu.initialeMoi, LARGEUR / 2 - 46, HAUTEUR - 214, 42, true, famille);
    pastille(ctx, contenu.initialeAutre, LARGEUR / 2 + 46, HAUTEUR - 214, 42, false, famille);

    // ── La signature ──
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = `500 28px ${famille}`;
    ctx.fillText("favorable.day", LARGEUR / 2, HAUTEUR - 92);

    return await new Promise<Blob | null>((resoudre) =>
      toile.toBlob((b) => resoudre(b), "image/png"),
    );
  } catch {
    // Canvas refuse, memoire insuffisante, police introuvable : on rend null et
    // l appelant retombe sur le partage en texte.
    return null;
  }
}
