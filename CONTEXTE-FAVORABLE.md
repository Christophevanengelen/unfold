# Favorable, le dossier que tout agent doit lire avant de toucher a quoi que ce soit

Derniere verification complete : **26 aout 2026**. Tout ce qui suit a ete
mesure, ouvert ou lu. Ce qui n a pas ete verifie est marque comme tel.

---

## 1. Le produit et les gens

- **Favorable** (anciennement *unfold*) : lecture de timing personnel calculee
  depuis un theme natal. Site en production : **https://favorable.day**
- **Christophe Van Engelen**, Bruxelles. Designer **service / UX / UI**, il n est
  **pas developpeur**. Ne lui demande jamais de lancer une commande dans un
  terminal ni de coller une sortie. Explique le resultat et la decision, pas
  l implementation.
- **Marie-Ange** (`zebrapad` sur GitHub) : co-associee **50/50**, membre du depot.
  Elle a ecrit le moteur d ephemerides sur lequel tout repose. **Ses commits
  comptent autant que ceux de Christophe et ne sont jamais ecrases.** La tete de
  `main` est souvent un de ses commits.
- Depot : `Christophevanengelen/unfold`, **public**. Branche par defaut `main`.
- Hebergement : Vercel. Base : Supabase (projet `jvpdpjqidxtavmaaeudn`).
- Il n a **aucune entite juridique**. Il publie en son nom propre.

## 2. Le moteur, ce qu il faut absolument savoir

L API appartient a Marie-Ange : `https://ai.zebrapad.io/full-suite-spiritual-api`
Documentation complete dans `TOCTOC-API-DEVELOPER-HANDOFF.md` a la racine.
Appelee **sans aucune authentification**. Corps commun a tous les points d entree :
`{ birthDate, birthTime, latitude, longitude, timezone }`. Reponse enveloppee
dans `{ success, data, timestamp }`.

**Chronometrage reel du 26 aout 2026, memes donnees (1985-06-15, 14:30, Bruxelles) :**

| Point d entree | Duree | Taille |
|---|---|---|
| `toctoc-app.php` | 53 620 ms | 18,4 Mo |
| `toctoc-app-short.php` | 43 804 ms | 642 Ko |
| `toctoc-year.php` | **2 324 ms** | 26 Ko |

**Le moteur n est pas en panne. Il est plus lent que le delai qu on lui accorde.**
`app/api/landing/signal/route.ts` lui donne 25 s (`TOCTOC_TIMEOUT_MS`) et appelle
`toctoc-app-short.php`, qui met 43,8 s. Le delai expirait donc **systematiquement**
et le site basculait sur une lecture fabriquee, en silence. Corrige cote client le
26 aout (commit `a871c19`), **pas encore cote serveur**.

Structure de `toctoc-year.php`, mesuree (`data`) :
`success, person, window, fortuneInfo, currentMonth, peakUpcomingMonths, years, months, computeTimeSeconds`
- `currentMonth` : `{ month "2026-08", totalScore, zrScore, transitScore, topEvents[5] }`
- `peakUpcomingMonths` : 3 elements · `years` : 3 · `months` : 36
- `computeTimeSeconds` renvoye par le serveur : 1,8

**Ce qui reste a faire sur ce sujet** : passer la landing sur `toctoc-year.php`
et ecrire la correspondance des donnees (la forme differe de `boudins`), puis
mettre en cache par donnee de naissance. Un theme natal ne change pas.

## 3. L argent : etat reel

- **Personne ne peut payer aujourd hui**, et la v1 part **gratuite** par decision
  prise le 26 aout. On ne vend rien tant qu il n y a pas d entite juridique.
- **Polar et Paddle interdisent tous deux l astrologie**, dans des termes presque
  identiques (`pseudo-science, clairvoyance, horoscopes, fortune-telling`). Ce n est
  pas une lubie de Polar, c est une regle du secteur acquereur. Changer de
  prestataire ne resout rien. Les deux seules sorties : achat integre via les
  magasins, ou ne pas vendre.
- Le compte Polar de Christophe est **approuve**, identite verifiee, compte de
  versement connecte. Il porte 9 produits (AtHOMI, Launch Your Idea, Lucida,
  MissionPilot). **Aucun produit d astrologie**, et il ne faut pas en creer avant
  la reponse de Polar sur le sujet.
- Il ne peut pas utiliser Stripe : Stripe exige une entreprise.
- La chaine de droits existe dans le code (session de caisse, verification de
  signature des webhooks, idempotence, table `subscriptions`, `getEntitlement`).
  Elle est a **eteindre proprement**, jamais a supprimer.
- **Soupcon fort, pas prouve** : `supabase/005_billing.sql` n autorise ni le statut
  `lifetime` ni la source `polar`, et les webhooks n y lisent jamais l erreur, donc
  un paiement serait encaisse sans rien ouvrir. Les migrations ont ete passees a la
  main, la contrainte reelle en production n a jamais ete lue. **30 secondes dans
  l editeur SQL de Supabase tranchent.**

## 4. Les fuites connues

- Une cle Supabase `service_role` de production etait en clair dans
  `e2e/free-to-paid.spec.ts`, sur un depot public. **La rotation est le clic de
  Christophe** et n avait pas encore ete faite au 26 aout. Supprimer la ligne ne
  suffit pas : la cle reste dans l historique git, et on ne reecrit pas l historique.
- `app/api/openai/daily-brief/route.ts` et `daily-briefing/route.ts` appellent
  OpenAI avec la cle serveur **sans authentification, sans quota, sans limite de
  debit**. Le depot etant public, les adresses sont connues.
- Le seul limiteur du projet est un `new Map()` en memoire : sur Vercel il ne
  limite rien. Le projet documente lui-meme ce piege dans `lib/billing/entitlement.ts`.
- **La facture OpenAI est celle de Christophe.** Le code appelle `api.openai.com`
  directement par `fetch`, sans SDK, donc invisible dans `package.json`. Ne pas
  reconclure l inverse.

## 5. Les deux systemes de traduction

Ils ne se parlent pas, ne les confonds jamais :
- **La landing** lit `lib/landing-copy.ts` : un bloc `EN` complet qui sert de base,
  plus un bloc d override par langue fusionne par `getLandingCopy`. 10 locales.
- **L app et la demo** lisent `lib/i18n-demo.ts` : map `STRINGS`, detection via
  `navigator.language`, persistance `localStorage` sous `unfold_locale`.

**Le francais est la langue de lancement.** `/fr` est coherent de bout en bout.
`/en` fuit massivement : contenu personnalise en francais, libelles du formulaire
en dur en francais, page tarifs entierement en francais.

## 6. Les magasins

Ni l une ni l autre app n est deposable. Points bloquants verifies :
- Le binaire ne contient **aucune ligne d application** : `capacitor.config.ts`
  charge une URL distante, `/out/` est dans `.gitignore`, aucune ressource
  embarquee, **aucune CI** (`.github` absent). Regles Apple 4.2 et surtout 2.5.2.
- Projet Xcode signe **au nom de Zebrapad** (`DEVELOPMENT_TEAM = JG9V6PMN8T`,
  bundle `com.zebrapad.unfold`). Un bundle ID ne se transfere pas entre equipes.
- **La PR #3 ne doit pas etre fusionnee** : elle figerait l `applicationId` Android
  a `com.zebrapad.unfold`, **definitif des le premier envoi**.
- Aucun `signingConfig`, aucune cle : aucun `.aab` signable.
- `capacitor.config.ts` autorise `checkout.stripe.com` dans la vue web native :
  violation directe de la politique de paiement de Play.
- Suppression de compte : `app/api/profile/forget/route.ts` est complete et
  **aucun ecran ne l appelle**. Obligatoire chez Apple depuis le 30 juin 2022 et
  chez Google avec en plus une adresse web publique.
- Les 20 captures du depot sont au rapport 2,16 ; Play impose 2,0 au maximum.
- La fiche promet des notifications : aucun greffon push, aucun `google-services.json`.
- Compte Play personnel : **12 testeurs en continu pendant 14 jours, par app**,
  avant d acceder a la production. L horloge n a pas commence.
- `strings.xml` declare `app_name = Unfold`, alors qu Unfold de Squarespace depasse
  dix millions d installations sur Play.

## 7. Ce qui est mesure sur le produit vecu

- Bouton « See my signal » **desactive au chargement**, trois champs obligatoires
  dont l heure de naissance. Decision prise : **l heure devient facultative**.
- Apres le formulaire, **aucun lien vers l application** (`Hero.tsx` : ni router,
  ni Link, ni `/app`).
- `/app/pricing` rend **15 caracteres** en production.
- Etape 4/5 de l onboarding : contenu present dans le DOM, tous les elements a
  `opacity: 0`, animation d entree qui ne demarre jamais. Aucun filet.
- Gels mesures par l outil Vercel : 3 199 ms, 3 092 ms et **8 105 ms**.
- Le suivi d evenements se termine par un `console.log`. **Le chiffre qui decide de
  la suite, la part d utilisateurs qui reviennent en semaine 2, n existe pas.**

## 8. Regles de travail, non negociables

1. Branche uniquement. Jamais de commit direct sur `main`. **Jamais de force push,
   jamais de reecriture d historique.**
2. **Jamais de suppression de fichier** : ce qui doit disparaitre va dans `_to_delete/`.
3. Aucun secret en clair. Variables d environnement uniquement. **On ne saisit
   jamais une cle a la place de Christophe**, il la colle lui-meme.
4. Les commits de `zebrapad` ne sont jamais ecrases.
5. **Pas de tiret cadratin** dans les textes visibles.
6. **Ne conclus jamais d un nom de variable ou de fichier a un fait.** Lis le code,
   obtiens un code HTTP, ouvre la page officielle. Cette erreur a ete commise
   plusieurs fois sur ce projet, dans les deux sens.
7. Le francais d abord, et tout texte utilisateur passe par le systeme de
   traduction, jamais en dur.
8. Deux choses seulement demandent le feu vert de Christophe : une migration de
   base contre la production, et une suppression irreversible.

## 9. Ce qui n est pas connu

- La contrainte `status` reellement en production (voir 3).
- Si un paiement a deja ete encaisse : la session Stripe n a pas pu etre ouverte.
  A verifier **avant** de retirer le paywall, car un paiement pris sans rien ouvrir
  doit etre rembourse.
- Quel modele tourne derriere le moteur de Marie-Ange, et combien coute un appel.
- Aucun titre ecrit : pas de LICENSE, pas de cession de droits, pas d accord de
  partage. Sur 210 commits, Christophe 197, zebrapad 13, parce que son apport est
  ailleurs, sur son serveur.
