"use client";

/**
 * Le centre de messages.
 *
 * ─── POURQUOI CE FICHIER EXISTE ────────────────────────────────────────────
 *
 * Le briefing quotidien s affichait en DEUX cartes superposees a la timeline,
 * montees en `absolute inset-0 z-30 flex items-center justify-center` — donc
 * centrees par-dessus le produit entier, chacune avec sa croix.
 *
 * Verdict de Christophe, le 01/09/2026 :
 *
 *   « foutre 25 fenetres a cliquer pour les closer, c est pas de l UX, c est de
 *     la punition pour user et un killing de l entrepreneur. Tu veux ajouter et
 *     conserver ca, tu me crees un VRAI systeme de notification qui vient pas
 *     par dessus tout et mal implemente. »
 *
 * Les trois regles qui en decoulent, et qui gouvernent ce fichier :
 *
 *   1. RIEN NE SE SUPERPOSE AU PRODUIT. Un message attend qu on vienne le
 *      chercher. Il ne s invite pas par-dessus la timeline.
 *   2. RIEN A FERMER. Il n y a pas de rejet, seulement un etat lu. Fermer
 *      vingt fois la meme chose est une corvee ; lire l est moins.
 *   3. UN SEUL ENDROIT. Les briefings d aujourd hui, ceux de la periode, et
 *      demain ce qui arrive par notification poussee, tombent tous ici.
 *      Un produit n a pas deux boites aux lettres.
 *
 * ─── POURQUOI useSyncExternalStore ─────────────────────────────────────────
 *
 * La liste vit dans localStorage, donc HORS de React. Le motif est celui de
 * lib/use-locale.ts, pour la meme raison : un `useState` + `useEffect` fait
 * rendre une premiere fois a vide puis se corriger, ce que React 19 signale
 * a juste titre. Ici cela ferait clignoter la pastille de non-lus.
 */

import { useSyncExternalStore } from "react";

const CLE = "favorable_messages";
const EVENEMENT = "unfold:messages-changed";

/** Au-dela, un message n interesse plus personne et encombre le stockage. */
const RETENTION_JOURS = 30;

/**
 * D ou vient un message.
 *
 * Le type sert a l affichage (quel bandeau) et au dedoublonnage : un meme type
 * ne peut avoir qu un message par jour, ce qui evite d empiler dix copies du
 * briefing quand l ecran se remonte.
 */
export type TypeMessage = "briefing_jour" | "briefing_periode" | "notification";

export interface Message {
  /** `${type}_${AAAA-MM-JJ}` — stable, donc reecrire le meme jour remplace. */
  id: string;
  type: TypeMessage;
  /** ISO. Sert au tri et a la purge. */
  date: string;
  corps: string;
  /** La phrase d action, quand il y en a une. Jamais obligatoire. */
  action?: string;
  /** Les domaines de vie touches, pour les pastilles. */
  domaines?: string[];
  lu: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Le magasin
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Memoise.
 *
 * useSyncExternalStore appelle `lire` a chaque rendu et compare le resultat par
 * IDENTITE. Rendre un tableau frais a chaque appel ferait une boucle de rendu
 * infinie — c est le piege classique de ce hook. On ne recalcule donc que
 * lorsque quelque chose a reellement change.
 */
let cache: Message[] | null = null;

const VIDE: Message[] = [];

function chargerDepuisStockage(): Message[] {
  if (typeof window === "undefined") return VIDE;
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return VIDE;
    const analyse: unknown = JSON.parse(brut);
    if (!Array.isArray(analyse)) return VIDE;

    const limite = Date.now() - RETENTION_JOURS * 24 * 60 * 60 * 1000;
    return (analyse as Message[])
      .filter(
        (m) =>
          m &&
          typeof m.id === "string" &&
          typeof m.corps === "string" &&
          typeof m.date === "string" &&
          new Date(m.date).getTime() > limite,
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    // Stockage refuse, quota plein, JSON abime : on rend une boite vide plutot
    // que de faire tomber l ecran. Un message perdu n est pas un incident.
    return VIDE;
  }
}

function lire(): Message[] {
  if (cache === null) cache = chargerDepuisStockage();
  return cache;
}

function lireServeur(): Message[] {
  // Le serveur n a pas de stockage. La boite est vide, le client la remplit des
  // la premiere image. Renvoyer une constante et non `[]` : voir `cache`.
  return VIDE;
}

function abonner(prevenir: () => void): () => void {
  const surChangement = () => {
    cache = null;
    prevenir();
  };
  window.addEventListener(EVENEMENT, surChangement);
  // Un autre onglet peut avoir lu un message.
  window.addEventListener("storage", surChangement);
  return () => {
    window.removeEventListener(EVENEMENT, surChangement);
    window.removeEventListener("storage", surChangement);
  };
}

function ecrire(liste: Message[]): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(liste));
  } catch (e) {
    // Quota plein ou stockage refuse. Le cache memoire garde la liste pour
    // cette session, donc le message S AFFICHE — et disparait au rechargement,
    // sans que personne sache pourquoi. On ne peut rien faire de mieux ici,
    // mais on le dit en developpement plutot que de l avaler.
    if (process.env.NODE_ENV !== "production") {
      console.error("[messages] ecriture refusee, la boite ne survivra pas au rechargement", e);
    }
  }
  cache = null;
  try {
    window.dispatchEvent(new CustomEvent(EVENEMENT));
  } catch {
    /* pas de fenetre */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// L API publique
// ─────────────────────────────────────────────────────────────────────────────

/** La cle du jour, en heure locale — surtout pas en UTC : a 1 h du matin a */
/** Bruxelles, toISOString() rendrait encore la veille. */
export function cleDuJour(type: TypeMessage, quand = new Date()): string {
  const a = quand.getFullYear();
  const m = String(quand.getMonth() + 1).padStart(2, "0");
  const j = String(quand.getDate()).padStart(2, "0");
  return `${type}_${a}-${m}-${j}`;
}

/**
 * Depose un message, ou met a jour celui du meme jour et du meme type.
 *
 * Idempotent par construction : l ecran peut se remonter autant de fois qu il
 * veut, la boite ne grossit pas. C est ce qui remplace le rejet manuel.
 *
 * L etat `lu` d un message deja present est CONSERVE : recevoir une version
 * rafraichie du briefing du jour ne doit pas rallumer la pastille alors que la
 * personne l a deja lu.
 */
export function deposer(
  entree: Omit<Message, "id" | "date" | "lu"> & { id?: string; date?: string },
): void {
  const id = entree.id ?? cleDuJour(entree.type);
  const liste = lire();
  const existant = liste.find((m) => m.id === id);

  // Rien de neuf : ne pas reecrire, sinon chaque montage declenche un rendu
  // dans tous les composants abonnes.
  if (existant && existant.corps === entree.corps && existant.action === entree.action) return;

  // L identifiant porte le jour LOCAL, la date porte l instant ABSOLU.
  //
  // Ce n est pas une incoherence, c est deux questions differentes :
  //   — « est-ce le briefing d aujourd hui ? » se juge sur le calendrier de la
  //     personne, donc en heure locale, sinon a 00 h 30 a Bruxelles on
  //     redeposerait celui de la veille ;
  //   — « dans quel ordre, et quand purger ? » se juge sur un instant absolu,
  //     seule grandeur comparable entre deux fuseaux.
  //
  // Les deux ne doivent JAMAIS etre compares l un a l autre. `quand()` dans
  // CentreMessages reconvertit la date en heure locale avant de dire
  // « aujourd hui », ce qui est le seul rapprochement correct entre les deux.
  const message: Message = {
    id,
    type: entree.type,
    date: entree.date ?? new Date().toISOString(),
    corps: entree.corps,
    action: entree.action,
    domaines: entree.domaines,
    lu: existant?.lu ?? false,
  };

  ecrire([message, ...liste.filter((m) => m.id !== id)].sort((a, b) => b.date.localeCompare(a.date)));
}

/** Marque un message comme lu. Pas de suppression : on ne ferme rien ici. */
export function marquerLu(id: string): void {
  const liste = lire();
  if (!liste.some((m) => m.id === id && !m.lu)) return;
  ecrire(liste.map((m) => (m.id === id ? { ...m, lu: true } : m)));
}

/** Marque tout comme lu — le geste d ouverture de la boite. */
export function marquerToutLu(): void {
  const liste = lire();
  if (!liste.some((m) => !m.lu)) return;
  ecrire(liste.map((m) => (m.lu ? m : { ...m, lu: true })));
}

// ─────────────────────────────────────────────────────────────────────────────
// Les hooks
// ─────────────────────────────────────────────────────────────────────────────

export function useMessages(): Message[] {
  return useSyncExternalStore(abonner, lire, lireServeur);
}

export function useNonLus(): number {
  const messages = useMessages();
  return messages.reduce((n, m) => n + (m.lu ? 0 : 1), 0);
}
