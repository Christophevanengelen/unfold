/**
 * La liste des conversations avec Vela, côté appareil.
 *
 * POURQUOI ELLE VIT ICI
 *
 * Le serveur sait charger UNE conversation par son identifiant
 * (`/api/astrologue/session?sessionId=…`), mais il n'expose pas la liste de
 * celles d'un appareil. Marie-Ange l'avait noté dans `CHATBOT.md` : « un titre
 * court par conversation, une liste — pas encore fait ».
 *
 * On la tient donc ici, comme `lib/connections-store.ts` tient les connexions :
 * l'appareil garde de quoi afficher la liste tout de suite, sans attendre le
 * réseau, et le serveur reste la source de vérité du contenu. C'est ce qui
 * permet à l'écran 5 de Vela de s'ouvrir instantanément.
 *
 * LE TITRE
 *
 * Il est tiré des premiers mots de ce que la personne a écrit, jamais d'un
 * appel à un modèle : un titre coûterait alors un appel de plus par
 * conversation, pour une ligne de liste. « Je n'arrive plus à décider si je
 * reste dans ce boulot » devient « Je n'arrive plus à décider ».
 */

const CLE = "unfold_vela_conversations";
/** Au-delà, la liste devient un cimetière : on garde les plus récentes. */
const MAX = 40;
/** Un titre plus long ne tient pas sur une ligne de liste, sur aucun téléphone. */
const TITRE_MAX = 34;

export interface ConversationLocale {
  id: string;
  /** Les premiers mots de la personne, coupés proprement. */
  titre: string;
  /** ISO. Date d'ouverture, celle qu'on affiche. */
  ouverteLe: string;
  /** ISO. Dernier échange, pour l'ordre de la liste. */
  vueLe: string;
  /** Nombre d'échanges, pour distinguer une conversation vide d'une vraie. */
  tours: number;
}

function lire(): ConversationLocale[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = localStorage.getItem(CLE);
    const liste = brut ? (JSON.parse(brut) as ConversationLocale[]) : [];
    return Array.isArray(liste) ? liste : [];
  } catch {
    return [];
  }
}

function ecrire(liste: ConversationLocale[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CLE, JSON.stringify(liste.slice(0, MAX)));
  } catch {
    /* stockage plein ou refusé : la conversation marche quand même, seule la liste manque */
  }
}

/** Les plus récentes d'abord. */
export function listerConversations(): ConversationLocale[] {
  return lire().sort((a, b) => (a.vueLe < b.vueLe ? 1 : -1));
}

/**
 * Coupe au dernier mot entier, sans laisser de ponctuation pendante.
 * Un titre qui se termine par « décider si » se lit mal ; « décider » se lit.
 */
export function titreDepuis(message: string): string {
  const propre = message.trim().replace(/\s+/g, " ");
  if (propre.length <= TITRE_MAX) return propre;
  const coupe = propre.slice(0, TITRE_MAX);
  const dernierEspace = coupe.lastIndexOf(" ");
  const base = dernierEspace > 12 ? coupe.slice(0, dernierEspace) : coupe;
  return `${base.replace(/[,;:.!?'’«"\s]+$/, "")}…`;
}

/** À l'ouverture d'une conversation, avec le premier message de la personne. */
export function ouvrirConversation(id: string, premierMessage: string): void {
  const liste = lire().filter((c) => c.id !== id);
  const maintenant = new Date().toISOString();
  liste.unshift({
    id,
    titre: titreDepuis(premierMessage),
    ouverteLe: maintenant,
    vueLe: maintenant,
    tours: 1,
  });
  ecrire(liste);
}

/** À chaque échange suivant. */
export function toucherConversation(id: string, tours?: number): void {
  const liste = lire();
  const c = liste.find((x) => x.id === id);
  if (!c) return;
  c.vueLe = new Date().toISOString();
  if (typeof tours === "number") c.tours = tours;
  ecrire(liste);
}

/** Retirée de la liste de l'appareil. Le serveur garde l'archive. */
export function oublierConversation(id: string): void {
  ecrire(lire().filter((c) => c.id !== id));
}
