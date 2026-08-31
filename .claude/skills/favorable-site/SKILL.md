---
name: favorable-site
description: "Le site favorable.day : rendu dynamique, adresse de base, pages legales, prix, marque, referencement. A utiliser des qu on touche a la vitrine, a une page /[locale]/*, aux metadonnees, ou avant toute soumission a Apple."
---

# Le site de Favorable

Ce que la soirée du 31 août 2026 a coûté à découvrir. Presque rien ici ne se
voit en lisant le code — tout s'est trouvé en **ouvrant les pages**.

## La règle qui prime sur toutes les autres

**Ouvre les pages avant de conclure quoi que ce soit.**

`/privacy` et `/terms` ont renvoyé **HTTP 500 pendant un mois**, dans les dix
langues. Personne ne l'avait vu — ni l'auteur, ni moi après des heures dans ce
dépôt. Le code de `privacy/page.tsx` est parfaitement correct à la lecture : ce
qui manquait était une ligne **absente**, et une absence ne se lit pas.

    for u in /fr /fr/privacy /fr/terms /fr/support /fr/pricing; do
      printf "%-14s " "$u"; curl -s -o /dev/null -w "%{http_code}\n" "https://favorable.day$u"
    done

À faire avant toute soumission, et après tout déploiement touchant `app/[locale]/`.

Les erreurs réelles se lisent chez Vercel, pas dans le code : `get_runtime_errors`
sur le projet donne le `digest` exact.

## `force-dynamic` est obligatoire sur toute page localisée

Le layout racine lit `headers()` pour connaître la langue. Toute page sous
`app/[locale]/` doit donc porter, en première ligne :

    export const dynamic = "force-dynamic";

Sans elle : `DYNAMIC_SERVER_USAGE`, donc 500. C'est exactement ce qui est arrivé
à `/privacy` et `/terms`, oubliées par un commit qui avait pourtant fait le
travail sur `/pricing` et la page d'accueil.

## L'adresse de base

`NEXT_PUBLIC_BASE_URL` doit valoir `https://favorable.day` sur Vercel, en
production **et** en préproduction. Quand elle manque, quatre fichiers appliquent
chacun leur propre repli sans se concerter : `lib/metadata.ts`, `app/sitemap.ts`,
`app/robots.ts`, `components/seo/StructuredData.tsx`.

Conséquence constatée en production : `robots.txt` annonçait le plan de site de
**`unfold.app`**, domaine d'une autre application, et le lien canonique désignait
une préproduction Vercel.

**Sans schéma ni barre finale** : `new URL(BASE_URL)` échoue au build sur toutes
les pages localisées.

## Les prix : une seule source

`lib/billing/features.ts` → `PLANS`. **5,99 €/mois, 39,99 €/an, 7 jours d'essai.**

Tout le reste le lit, jamais ne le recopie. Le 31 août, quatre sources se
contredisaient : le code (9,99 €), la vitrine ($4/$29), les conditions générales
($4/$29), et les données structurées lues par Google (4,00 $/29,00 $). Un prix
faux dans un résultat de recherche est trompeur même si le site affiche le bon.

Le prix « à vie » de 49 € n'a jamais été décidé et reste incohérent : quinze mois
d'abonnement annuel. Décision produit en attente.

## Ne jamais promettre ce qui n'existe pas

- Les badges de téléchargement sont masqués par `APP_PUBLIEE` dans
  `components/landing/AppStoreBadges.tsx`. Ils pointaient vers `id6740000000`,
  un bouchon jamais remplacé. Le vrai identifiant est **6807001088**.
- « 7 jours d'essai sans carte bancaire » était faux : un essai App Store exige
  un moyen de paiement enregistré.
- Ne pas mentionner les notifications tant qu'aucune n'est arrivée sur un vrai
  téléphone. Annoncer une fonction non livrée relève de l'article 2.3.1, qu'Apple
  sanctionne par le retrait de l'app.

## Renommer sans casser

Trois choses portent le mot « unfold » et **ne doivent jamais être renommées** —
elles effaceraient les données des personnes déjà installées :

1. Les 25 clés `localStorage` `unfold_*` (profil, naissance, connexions, série,
   plan payant). Les nouvelles clés s'écrivent `favorable_*` ; on ne mélange pas.
2. Le préfixe `UNFOLD-` des codes d'invitation. Si on le change : **assouplir la
   regex serveur d'abord**, déployer, puis seulement toucher au générateur.
   Jamais de réécriture en base — un code partagé par capture d'écran doit
   marcher indéfiniment.
3. Le schéma `unfold://` des liens magiques. Le changer rompt les liens déjà
   envoyés par mail.

Et **`"the rest unfolds"`** est le verbe anglais, pas la marque : un remplacement
global écrirait « the rest favorables ». Toujours lister les exceptions avant
d'écrire la substitution.

## Vocabulaire : un calendrier, jamais un oracle

L'article 4.3(b) d'Apple nomme la voyance comme catégorie saturée et refuse les
nouvelles entrées sauf expérience « significativement différente ». Le relecteur
**ouvre l'URL marketing**.

À bannir : horoscope, prédiction, avenir, ce qui t'attend, révèle.
À garder : période, cycle, ouverture, fermeture, transit, calendrier, moment.

Ce qui prouve la différence : des périodes avec date de début, date de fin et
durée en jours ; les passages successifs d'un cycle, datés ; un widget système.

## Contacts

Centralisés sur **hi-def.be** — Favorable est une production Hi-def.

⚠️ Les anciens textes pointaient vers `privacy@unfold.app` et `legal@unfold.app`.
Ce domaine ne nous appartient pas et **n'a aucun enregistrement MX** : toute
demande RGPD partait dans le vide. Créer et tester la boîte **avant** de la citer
dans un document contractuel. Ne jamais remplacer un contact mort par un autre.
