/**
 * Où mène une notification.
 *
 * Règle : une notification qui ouvre l'accueil est une notification ratée. La
 * personne doit chercher ce qu'on vient de lui annoncer.
 *
 * Deux principes portent ce fichier.
 *
 * 1. **Le serveur envoie une clé, jamais un chemin.** Un chemin brut venu du
 *    réseau et poussé dans la vue web est une redirection ouverte à l'intérieur
 *    de l'app. Et les chemins diffèrent déjà entre le web et le natif dans ce
 *    dépôt — `lib/connection-href.ts` en est la preuve. Une notification restée
 *    en file d'attente survit ainsi à un renommage de route.
 *
 * 2. **On navigue avec le routeur, jamais avec `location.href`.** Le serveur
 *    interne de Capacitor sur iOS ne sert pas l'index d'un dossier : toute
 *    adresse sans extension retombe sur la page racine. Une navigation dure
 *    vers `/app/timeline/` casse ; `router.push("/app/timeline/")` fonctionne,
 *    parce que le routeur de Next demande des fichiers avec extension.
 *    Ce piège est documenté dans CLAUDE.md, il a déjà coûté une session.
 */

/** Les seules destinations qu'une notification peut ouvrir. */
export type EcranNotification = "timeline" | "monthly" | "lifetime" | "compatibility";

const ECRANS: Record<EcranNotification, (ref?: string) => string> = {
  timeline: () => "/app/timeline/",
  monthly: () => "/app/monthly/",
  lifetime: () => "/app/lifetime-chart/",
  // Forme requête et non segment d'adresse : l'export statique ne produit pas
  // un fichier par identifiant de connexion. Voir le commentaire en tête de
  // app/app/compatibility/[connectionId]/page.tsx.
  compatibility: (ref) =>
    ref ? `/app/compatibility/view/?c=${encodeURIComponent(ref)}` : "/app/compatibility/",
};

/**
 * Traduit la charge utile d'une notification en chemin interne.
 * Renvoie null si la destination est inconnue : dans ce cas on ne bouge pas,
 * plutôt que de deviner.
 */
export function cheminDepuisNotification(donnees: unknown): string | null {
  if (typeof donnees !== "object" || donnees === null) return null;
  const d = donnees as Record<string, unknown>;

  const cle = typeof d.ecran === "string" ? d.ecran : null;
  if (!cle || !(cle in ECRANS)) return null;

  const ref = typeof d.ref === "string" && d.ref.length <= 128 ? d.ref : undefined;
  return ECRANS[cle as EcranNotification](ref);
}
