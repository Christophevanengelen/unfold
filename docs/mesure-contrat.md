# Contrat de mesure — tous les produits

Un seul point d'entrée, un seul tableau de bord (`/admin/kpi` de Favorable), une grammaire commune. Chaque app et chaque page envoie les mêmes événements, avec les mêmes noms.

## Point d'entrée
`POST https://favorable.day/api/events`, corps JSON (ou texte contenant du JSON : `navigator.sendBeacon` ne peut pas poser d'en-tête). Réponse `204`, jamais d'erreur bloquante côté produit : **la mesure ne doit jamais casser ni ralentir un produit**.

```json
{
  "appId": "astrolearn",
  "cle": "mk_…",
  "event": "app_ouverte",
  "installId": "uuid-généré-sur-l-appareil",
  "eventId": "uuid-unique-par-événement",
  "surface": "app",
  "locale": "fr",
  "props": { "version": "2.2.1", "plateforme": "android" }
}
```

- `appId` + `cle` : identifient le produit. La clé est publique par conception.
- `installId` : un UUID **par produit**, généré sur l'appareil, stocké localement. **Jamais partagé entre produits, jamais lié à un compte, à un e-mail ou à une IP.**
- `eventId` : un UUID par événement ; un réessai ne double pas la ligne.
- `surface` : `app` (application installée) ou `web` (page).
- `props` : quelques propriétés **courtes et plates** (chaînes, nombres, booléens), 512 caractères au total.

## Événements (liste fermée, mêmes noms partout)
`app_ouverte`, `app_installee`, `onboarding_demarre`, `onboarding_termine`, `premier_signal_vu` (ou l'acte de valeur du produit), `signal_ouvert` / `valeur_recue`, `notif_demandee`, `notif_accordee`, `notif_refusee`, `notif_echec`, `notif_ouverte`, `paywall_vu`, `achat_demarre`, `achat_reussi`, `partage_declenche`, `page_vue`, `cta_clic`, `qr_scanne`.

Propriétés recommandées : `version`, `plateforme` (`ios`/`android`/`web`), `cta_id`, `chemin`, `utm_source`, `utm_medium`, `utm_campaign`, `referrer` (nom d'hôte seul).

## Interdits (le serveur refuse l'événement)
Toute propriété dont le **nom** évoque une donnée de naissance, un e-mail, un nom, un lieu, un signe, un thème, une date ou une heure (`naissance`, `birth`, `email`, `nom`, `signe`, `theme`, `date…`, `heure`, `ville`, `lat`, `lon`…), ou dont la **valeur** ressemble à une date, un e-mail ou des coordonnées. Aucun texte libre, aucun objet imbriqué.

Pas de croyance, pas d'état émotionnel déduit, pas de santé, pas de segment de moins de 20 personnes.

## Respect de l'utilisateur
- Pas d'envoi si le suivi est refusé ou si « Ne pas suivre » est actif.
- Pas de cookie, pas de SDK publicitaire, pas d'IDFA.
- Données conservées 365 jours au plus.

## Pages web
`page_vue` au chargement (avec `utm_*` et le nom d'hôte du référent, rien d'autre) ; `cta_clic` avec un `cta_id` stable sur chaque bouton qui mène vers un store, un achat ou une inscription.

## Imprimé (QR)
Un QR par **emplacement**, jamais par exemplaire. Il pointe vers `https://favorable.day/q/<code>`, qui compte le scan côté serveur puis redirige vers la cible avec `utm_source=qr&utm_medium=offline&utm_campaign=<campagne>&utm_content=<emplacement>`.

## Produits enregistrés
`unfold` (Favorable, sans clé), `astrolearn`, `astronum`, `unfold-zebrapad`, `astrolearn-site`, `agenda2027` (voir `supabase/018_produits_mesure.sql`).
