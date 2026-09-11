# Les sept composants débranchés — faits, et sept questions fermées

Établi le 11 septembre 2026, chantier 5 de `PLAN-FINALISATION-APP.md`.
Liste produite par `node scripts/verifier-code-mort.mjs --liste`.

Rien n'a été supprimé. Rien n'a été rebranché non plus : après vérification,
**aucun des sept ne se rebranche sans une décision de Christophe**. Ce fichier
donne, pour chacun, ce qu'il fait, depuis quand il est débranché, ce qui le
remplace aujourd'hui, ce qu'on perd à le laisser ainsi — et une question à
laquelle on répond par oui ou par non.

Deux faits valent pour les sept : **ils sont tous encore entretenus**. Le
commit `a178584` du 11/09/2026 (« Les quatorze derniers textes en dur passent en
dix langues ») touche six des sept fichiers. Personne ne les a oubliés.

---

## 1. `components/legal/CookieConsent.tsx` — 131 lignes

**Ce qu'il fait.** Un bandeau bas de page, deux boutons (« Tout accepter » /
« Essentiels uniquement »), réponse retenue dans `localStorage` sous
`unfold-cookie-consent`, lue par `useSyncExternalStore` pour qu'elle soit juste
dès la première image. Textes en anglais, français et espagnol ; les sept autres
langues retombent sur l'anglais (`CookieConsent.tsx:9-28`).

**Depuis quand débranché.** 28 avril 2026, commit `f6b72d1`, « fix: minimal
/[locale] layout — drop Header/Footer/CookieConsent dependencies ». Quatre
composants ont été retirés d'un coup pour faire cesser un 500 dont le message de
commit dit lui-même : « One of these was the actual 500 source. » La cause n'a
jamais été identifiée. Le même message annonce le retour : « We can re-add
Header/Footer in V1.1. »

**Ce qui l'a remplacé.** Rien. Deux des quatre retirés sont revenus :
`StructuredData` et `Footer` (`22f71be`, 04/08/2026). Le bandeau est le reste.

**Ce qu'on perd.** Une phrase publiée devient fausse :
`lib/legal-content.ts:71`, politique de confidentialité anglaise, affirme
« You can manage your cookie preferences at any time through the cookie
settings banner on our website. » Il n'y a pas de bandeau. Les versions
française et espagnole (`:146`, `:215`) ne promettent pas de bandeau : elles
disent seulement que les cookies analytiques exigent un consentement explicite,
ce qui est vrai aujourd'hui.

**Pourquoi je ne l'ai pas rebranché seul.** Parce que le rebrancher **désarme le
contrôle qui protège ce sujet**. `scripts/verifier-consentement.mjs` passe
aujourd'hui en disant « aucun traceur tiers branché » : aucun traceur n'existe,
`trackEvent` dans `components/landing/Hero.tsx:36-41` ne fait qu'un
`console.log`. Le contrôle est écrit pour hurler le jour où quelqu'un branchera
Plausible ou GA sans le bandeau. Si le bandeau est monté dès maintenant, ce jour
sera silencieux : le contrôle verra « traceur + bandeau branché » et dira ok,
alors que rien ne garantit que le traceur lise la réponse — **personne ne lit
`unfold-cookie-consent` aujourd'hui**, la réponse est enregistrée et sans effet.
Le commit qui a écrit ce contrôle (`d69dd4e`, 02/09/2026, « Rendre la dette
lisible, et fermer le piège du consentement ») dit la règle : « brancher un
traceur et brancher le consentement [doivent être] le même geste. »

**Où il s'insérerait.** `app/[locale]/layout.tsx`, une ligne
`<CookieConsent locale={locale} />` après `<Footer />` — exactement la ligne
retirée en avril. Techniquement sans risque : le composant compile, il est
client, le layout est serveur, aucun autre chantier n'y touche.

> **Question 1.** Veux-tu qu'on remette le bandeau cookies sur le site
> maintenant, alors qu'aucun traceur n'est branché ?
> *(non = on laisse le bandeau en attente du jour où un traceur arrive, et on
> corrige la phrase anglaise de la politique de confidentialité pour qu'elle
> dise la même chose que les versions française et espagnole.)*

---

## 2. `components/layout/Header.tsx` — 44 lignes

**Ce qu'il fait.** Une barre collante en haut du site : lien d'évitement, logo
et mot « favorable » cliquables vers l'accueil, sélecteur de langue, sélecteur
de thème clair/sombre (`Header.tsx:17-40`).

**Depuis quand débranché.** Même commit, même jour : `f6b72d1`, 28/04/2026.

**Ce qui l'a remplacé — les trois fonctions sont revenues ailleurs.**
- Le lien d'évitement est dans `app/[locale]/layout.tsx:60-66` depuis le commit
  `29d6492` (01/09/2026), écrit précisément pour réparer cette perte.
- Le sélecteur de langue est dans le pied de page,
  `components/layout/Footer.tsx:238`, depuis `1695967` (01/09/2026).
- La marque est en haut de la page d'accueil,
  `app/[locale]/page.tsx:88-95`, sous un commentaire qui dit pourquoi : « the
  locale layout ships no Header yet ».
- Le sélecteur de thème existe dans l'app, `components/demo/ProfileDrawer.tsx:434`,
  à trois états (Système / Clair / Sombre), et il n'a jamais cessé d'exister.

**Ce qu'on perd.** Sur le site (pas dans l'app) il n'y a aucun moyen de forcer
le thème : le site suit celui du système. C'est la seule fonction que le retour
du Header restaurerait.

**Pourquoi je ne l'ai pas rebranché seul.** Parce que le remonter tel quel
produirait **trois doublons** sur la page d'accueil : deux liens d'évitement,
deux marques « favorable », deux sélecteurs de langue. Et parce que le dépôt
dit déjà que c'est ta décision, pas la mienne :
`app/[locale]/layout.tsx:56-59` — « contrairement à l'en-tête lui-même, dont le
retour serait une décision de design. »

**Où il s'insérerait.** `app/[locale]/layout.tsx`, au-dessus de `<main>`. Avec,
selon ta réponse, le retrait de la marque centrée de `page.tsx` et du sélecteur
de langue du pied de page.

> **Question 2.** Veux-tu une barre d'en-tête collante sur le site, avec logo,
> langue et thème, en échange du retrait de la marque centrée actuelle en haut
> de la page d'accueil ?

---

## 3. `components/demo/SignalPager.tsx` — 322 lignes (et 280 lignes derrière lui)

**Ce qu'il fait.** L'écran d'accueil de l'app : un carrousel de trois cartes,
Passé / Présent / Futur, ouvert sur le Présent, chaque carte portant ses
planètes, son intensité, son palier et son récit. Même donnée que la frise, autre
présentation.

**Depuis quand débranché.** 22 mars 2026, commit `2d7f3d3` (« streamline demo —
remove agenda, onboarding-first, timeline default »). `app/demo/page.tsx` a
cessé de le monter et s'est mis à rediriger vers la frise.

**Ce qui l'a remplacé.** La frise. `app/app/page.tsx` redirige vers
`/app/timeline`, et `components/demo/MomentumTimelineV2.tsx` porte sa propre
fabrication de capsules (`:328`) et sa propre fiche de détail (`:1829`).

**Ce qu'on perd, et c'est plus que 322 lignes.** SignalPager est la racine d'un
sous-bois mort que le contrôle ne voit pas (il ne suit pas la chaîne, il le dit
lui-même) : `components/demo/CapsuleCard.tsx` (213 lignes) et
`components/demo/PageDots.tsx` (66 lignes) ne sont importés que par lui, et
`getHomeCapsules` dans `lib/capsules.ts:200` n'est appelé que par lui.
**602 lignes au total.**

**Où il s'insérerait.** Soit un troisième onglet dans
`components/demo/BottomNav.tsx` (qui en porte deux : Frise et Match), soit comme
vue par défaut de `/app` à la place de la redirection vers la frise.

> **Question 3.** Veux-tu récupérer l'écran Passé / Présent / Futur en carrousel
> comme troisième onglet de l'app, à côté de la Frise et du Match ?

---

## Les quatre étapes d'onboarding

Elles ont toutes été débranchées **le même jour, par le même commit** : `1cc2762`,
21 mars 2026, « align landing + onboarding with planet-based signal system ».
Le message est explicite : « Onboarding: rewrite from 7 screens to 5 ». Ce n'est
pas un oubli, c'est une réécriture : `StepHabit`, `StepCompatibility`,
`StepPremium` et `StepPersonalize` ont été remplacés par `StepSignalPreview` et
`StepTimelineTeaser`. Le parcours est passé de 7 écrans à 5, puis à 6 avec
l'arrivée de `StepPriorities`.

Le parcours vivant est dans `app/app/onboarding/page.tsx:98-101` :
`0 Promise · 1 Signal Preview · 2 Timeline Teaser · 3 Priorities · 4 Birth Input
· 5 Preparing`.

**Un coût commun aux quatre.** Leurs titres et leurs boutons sont en **anglais
écrit en dur** — par exemple « See what flows between you. », « Back »,
« Continue » (`StepCompatibility.tsx:151`, `:128`, `:180`), « Now let's
configure your signal. », « Start » (`StepPersonalize.tsx:115`, `:146`).
`scripts/verifier-traductions.mjs` ne les compte pas aujourd'hui (il annonce
zéro texte en dur) : ce sont des angles morts de son motif, pas des textes
traduits. Rebrancher l'un de ces écrans, c'est servir de l'anglais aux dix
langues. La traduction est faisable et courte, mais elle fait partie du prix.

### 4. `StepHabit` — 210 lignes (et 3 composants derrière lui)

**Ce qu'il apporte.** « Your daily signal » : l'utilité immédiate, montrée avec
les vrais composants de l'app — l'anneau de score, les scores satellites, le
nombre animé — alimentés par les vraies phases du jour et l'écart avec la veille
(`StepHabit.tsx:26-44`).

**Sous-bois mort qu'il tient seul.** `components/demo/ScoreRing.tsx`,
`components/demo/SatelliteScores.tsx`, `components/ui/AnimatedNumber.tsx` :
aucun autre fichier vivant ne les importe.

**Où il s'insérerait.** Entre l'écran Promise et l'aperçu du signal, en position
1 du parcours, qui passerait à 7 écrans.

> **Question 4.** Veux-tu ajouter à l'onboarding un écran qui montre le score du
> jour avec les vrais composants de l'app, avant l'aperçu du signal ?

### 5. `StepCompatibility` — 186 lignes

**Ce qu'il apporte.** Une illustration de deux rythmes qui se croisent, et la
promesse du Match : voir ce qui circule entre deux personnes, où le lien est
naturel et où le timing se complique. C'est la seule mention du Match dans
l'onboarding.

**Ce qu'on perd sans lui.** Le Match est l'un des deux onglets de l'app, et
rien dans l'onboarding ne le prépare : on le découvre en arrivant dessus.

**Où il s'insérerait.** Après l'aperçu de la frise, avant les priorités.

> **Question 5.** Veux-tu que l'onboarding annonce le Match avant que la
> personne n'y arrive ?

### 6. `StepPremium` — 267 lignes

**Ce qu'il apporte.** L'écran de vente : trois promesses (pics et fenêtres à
venir, alertes de timing, carte mensuelle) et un aperçu des sept prochains jours.

**Fait important, et il change la question.** Cet écran était en quarantaine
pour une raison nommée : il montrait de faux pics (`mockForecast`, les mêmes
chiffres pour tout le monde) au moment précis où l'on demande de payer. Cette
raison **a disparu** : le commit `cf24b65` (01/09/2026) l'a mis sur les vraies
phases, et `d69dd4e` (02/09/2026) a ajouté qu'il ne s'affiche plus du tout quand
rien n'a été calculé. Le commit conclut lui-même : « L'écran est honnête et
simplement pas rebranché. Où le remettre reste une décision de Christophe. »

**Ce qui pèse contre.** `CONTEXTE-FAVORABLE.md` §3 : la v1 part gratuite,
personne ne peut payer aujourd'hui, et la chaîne de droits est à éteindre
proprement. Un écran de vente dans l'onboarding d'un produit gratuit promet un
paiement qui n'existe pas.

**Où il s'insérerait.** Avant l'écran de saisie de naissance, en fin de parcours.

> **Question 6.** Veux-tu remettre l'écran de vente dans l'onboarding
> **maintenant**, sachant que rien n'est vendable tant qu'il n'y a pas d'entité
> juridique ?

### 7. `StepPersonalize` — 152 lignes

**Ce qu'il apporte.** Un écran de transition court : « Now let's configure your
signal », une icône de réglage, puis l'explication de **pourquoi** on demande la
date, l'heure et le lieu de naissance, et que ça prend un instant
(`interface_.naissance_pourquoi`, `interface_.un_instant`, tous deux traduits en
dix langues).

**Ce qu'on perd.** C'est le seul écran qui justifie la demande de données de
naissance avant de la faire. Aujourd'hui le formulaire arrive sans préambule —
et `CONTEXTE-FAVORABLE.md` §7 rappelle que ce formulaire est déjà le point de
friction mesuré du produit.

**Où il s'insérerait.** Juste avant `StepInput`, en position 4.

> **Question 7.** Veux-tu un écran qui explique pourquoi on demande la date,
> l'heure et le lieu de naissance, juste avant de les demander ?

---

## Ce que ça donnerait si tu disais oui à tout

Le plafond de `scripts/verifier-code-mort.mjs` descendrait de 7 à 0, et
**1 982 lignes** reviendraient au produit : 1 312 dans les sept fichiers, 670
dans les cinq composants du sous-bois que le contrôle ne compte pas
(`CapsuleCard`, `PageDots`, `demo/ScoreRing`, `SatelliteScores`,
`ui/AnimatedNumber`). L'onboarding passerait de 6 à 9 écrans, ce qui est une
autre question — celle-là n'est pas fermée.

## Ce qui reste noté au passage

`components/ui/ScoreRing.tsx` n'est importé par personne et n'apparaît pas dans
la liste : `verifier-code-mort.mjs` cherche un chemin qui se termine par
`/ScoreRing`, et le trouve dans l'import de `components/demo/ScoreRing` par
`StepHabit`. Deux composants de même nom se couvrent l'un l'autre. C'est un
angle mort du contrôle, pas une décision à prendre.
