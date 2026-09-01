# Playbook — Favorable

Comment on travaille, et ce qui reste à faire.

Ce fichier existe parce qu'on perd des choses en passant d'un sujet à l'autre.
Le 1er septembre 2026, Christophe a dû redemander trois fois la même
correction — non parce qu'elle était difficile, mais parce qu'elle avait été
faite à moitié puis recouverte par le sujet suivant.

**Règle : toute remarque s'écrit ici avant d'être corrigée.** Une remarque non
écrite est une remarque perdue.

---

## La boucle de travail

1. **Écrire la remarque** dans le registre ci-dessous, même si on la corrige
   dans la minute.
2. **Aller voir l'état réel** avant de construire une explication. Ouvrir la
   page, lire les journaux, interroger la base. Trois fois le 31 août, la cause
   supposée était fausse — le widget, le certificat, l'origine de la vue web.
3. **Corriger la cause, pas le symptôme.** Deux couleurs illisibles → un jeton
   mal calibré. Deux champs mal étiquetés → un écran jamais traduit.
4. **Vérifier après coup**, avec une mesure et non une lecture.
5. **Cocher dans le registre.** Une ligne cochée est une ligne qu'on ne
   redemande pas.

## Les vérifications avant de livrer

    npm run verifier          # les huit contrôles
    bash scripts/build-native.sh

`npm run verifier` enchaîne : types, contraste des deux thèmes, couleurs figées,
textes non traduits, erreurs de lint, notifications APNs, choix des
notifications, liens magiques.

**Trois fonctionnent au cliquet** — couleurs figées, textes non traduits,
erreurs de lint. Le nombre actuel est un plafond : une régression le dépasse et
échoue, une correction l'abaisse. La dette ne peut que décroître, et personne
n'a besoin d'y penser.

Les plafonds vivent dans les scripts, pas ici : `npm run verifier` dit toujours
la vérité du jour. Recopier les chiffres dans ce fichier, c'est se garantir
qu'ils seront faux dans une semaine — ce document annonçait encore 156 couleurs
alors qu'il en restait 136.

Un contrôle qui échoue sur des dizaines de cas existants se fait désactiver le
lendemain, donc ne protège de rien. Le cliquet protège dès le premier jour.

Le CI les lance toutes. **L'envoi TestFlight ne part que sur `[testflight]`**
dans le message de commit — voir le skill `favorable-livrer`, et le plafond
quotidien d'Apple qui a coûté une journée.

## Voir l'app pour de vrai

Le simulateur, pas le navigateur :

    bash scripts/build-native.sh && npx cap sync ios
    cd ios/App && xcodebuild build -project App.xcodeproj -scheme App \
      -sdk iphonesimulator -configuration Debug -derivedDataPath /tmp/build-sim \
      CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO
    D=$(xcrun simctl list devices booted | grep -oE '[0-9A-F-]{36}' | head -1)
    xcrun simctl install "$D" /tmp/build-sim/Build/Products/Debug-iphonesimulator/App.app
    xcrun simctl launch "$D" day.favorable.app
    xcrun simctl ui "$D" appearance light      # pour éprouver le thème clair
    xcrun simctl io "$D" screenshot /tmp/vue.png

**Désinstaller avant de tester un thème** : une préférence enregistrée par une
installation précédente masque le comportement réel.

---

# Registre — ce qui reste

## Bloque la publication

- [ ] **Codes d'accès : à trancher.** `NEXT_PUBLIC_CHART_COUPONS` n'est défini
      nulle part, donc les trois champs de code refusent tout depuis toujours.
      Soit on retire les champs, soit on met une vérification **côté serveur** —
      pas une variable `NEXT_PUBLIC_`, dont le contenu est lisible par
      n'importe quel visiteur dans son navigateur.
- [ ] **`app/unlock` est orpheline.** Rien n'y mène, et elle renvoie vers un
      écran absent du paquet natif. À supprimer ou à rebrancher.

- [ ] **Statut de professionnel DSA** — sans lui, retrait de l'App Store dans
      l'UE. Décision préalable : ces coordonnées deviennent publiques.
- [ ] **Questionnaire App Privacy** dans App Store Connect. Le manifeste iOS est
      correct depuis le 31/08 ; la fiche publique ne dit pas encore la même chose.
- [ ] **Partage gratuit / Pro** — l'article 3.1.2(c) exige que la personne sache
      ce qu'elle obtient avant de s'abonner. Non tranché.
- [ ] **Accord de Marie-Ange** pour figurer nommément sur la fiche.

## Produit — en cours


- [ ] **Notification : durée, type, intensité.** Les douze domaines sont traduits
      (`lib/maisons-i18n.ts`). Reste à les faire porter par le texte.
- [ ] **Charger une fois, les dates déclenchent.** `supabase/013_bascules.sql`
      est écrit et éprouvé, **pas encore appliqué**. Le cron rappelle toujours le
      moteur une fois par personne et par jour.
- [ ] **Prix « à vie » de 49 €** — incohérent avec 39,99 €/an, soit quinze mois
      d'abonnement. Le relever ou retirer l'offre.

## Dette, sous cliquet

- [ ] **136 couleurs figées** (154 le 01/09 au matin). Le gros du reste est
      dans `components/landing/` — le site vitrine, toujours sombre par choix,
      où une couleur figée ne casse rien. Côté app, il reste ~47.
- [ ] **12 textes visibles non traduits** (29 le 31/08). Il en reste 9 dans
      `StepPreparing` — étiquettes de chargement visibles 3 secondes — et 3 dans
      `MonthlyView`, qui est du contenu fabriqué déjà sorti du build : ils
      partiront avec l'écran, pas besoin de les traduire.
- [ ] **80 erreurs ESLint**, surtout la sévérité de React 19. Aucune n'est
      active aujourd'hui.

Les trois sont sous cliquet : elles ne peuvent qu'être payées, jamais
augmentées.
- [ ] **Logotype** — `public/logo/logo-dark.svg` contient « unfold » vectorisé.
      Le favicon n'y pointe plus. Livrable de design.

## Android — à ouvrir

- [ ] **Aucune configuration de signature**, donc pas de dépôt Play possible.
      **Décider d'abord** : Play App Signing (Google détient la clé, perdre la
      sienne n'est plus fatal) ou keystore propre. Un keystore perdu interdit
      toute mise à jour, définitivement.

## Propriété

- [ ] Pas de LICENSE, pas d'accord écrit avec Marie-Ange.
- [ ] Le moteur `ai.zebrapad.io` répond **sans aucune authentification** —
      vérifié depuis un terminal. Devient gênant dès que l'app rapporte.

---

# Fait le 31/08 et le 01/09

Site : pages légales qui renvoyaient 500 depuis un mois, nom, prix, contact,
référencement, page d'aide, badges morts, promesses de prédiction retirées.
App : notifications de bout en bout, liens magiques, accessibilité des
animations, manifeste de confidentialité, CORS des profils, heure et lieu
obligatoires, autocomplétion du lieu, écran de saisie traduit, thème clair
mesuré, barre du haut retirée, bascule de vue sans blocs parasites, codes
d'invitation en FAV-.

---

# Registre des audits du 01/09/2026

Sept agents, en lecture seule. Ce qui suit est ce qu'ils ont trouvé et qui
**n'est pas encore corrigé**. Corrigé le jour même : voir les commits.

## Perte de fonctionnalité — le plus grave

- [ ] **17 composants débranchés** (23 au matin du 01/09). Cinq ont été
      supprimés — quatre primitives d'interface jamais importées et un doublon
      de barre de navigation. Les autres portent une fonctionnalité, et les
      supprimer est **une décision produit, pas technique** :

      | Quoi | Lignes | La question |
      |---|---|---|
      | `DomainPager` + 6 composants | ~900 | L'écran de détail par domaine. On le rebranche ou on l'abandonne ? |
      | `StepPremium` | 226 | Le seul moment de vente de l'onboarding. Volontairement retiré ? |
      | `StepCompatibility`, `StepHabit`, `StepPersonalize` | 512 | Retirés du parcours en même temps. |
      | `DesignedForClarity` | 353 | Une section entière du site, jamais montée. |
      | `SignalPager`, `LifeTimeline` | 453 | Deux vues alternatives de la timeline. |
      | `Header` + `ThemeToggle` | 73 | Le site n'a plus d'en-tête. Voulu ? |
      | `CookieConsent` | 83 | À garder tel quel — voir plus bas. |
- [ ] **L'écran de détail par domaine** (Amour / Santé / Travail) — 1 500
      lignes, débranché. Racine : `components/demo/DomainPager.tsx`.
- [ ] **Le sélecteur de langue du SITE** — `components/LanguageSwitcher.tsx`,
      perdu avec `Header.tsx`. Ne concerne que le site : l'app a son propre
      réglage dans le tiroir de profil (`ProfileDrawer.tsx:498`). L'audit
      annonçait la perte pour les deux, c'était trop large.
- [x] **Le bandeau cookies** — vérifié le 01/09 : il ne doit PAS être monté en
      l'état. Les seuls cookies du produit sont ceux de session Supabase, donc
      strictement nécessaires, donc exemptés de consentement. Aucun traqueur,
      aucun tiers, aucune analytique. Afficher « tout accepter / essentiels
      uniquement » demanderait l'accord pour quelque chose qui n'existe pas.
      **À monter le jour où une analytique est ajoutée**, pas avant.
- [ ] **Les données structurées SEO** — `components/seo/StructuredData.tsx`,
      jamais rendues. Perte de visibilité.
- [ ] **Quatre écrans d'onboarding** hors parcours, dont `StepPremium` — le seul
      moment de vente pendant l'inscription.
- [ ] **`birthday-graph` et `spirit-wave`** partent dans le binaire iOS mais
      aucune surface de l'app n'y mène. Seuls les teasers du site y renvoient.

## Compatibilité — signalé le 01/09

- [x] **« Code introuvable » sur un code valide.** Cause trouvée : `persistInviteCode`
      passait par `postJson`, qui utilisait `fetch` en chemin relatif. Depuis
      l'app native, l'enregistrement du code partait vers
      `capacitor://localhost/api/invite/register` — une adresse qui n'existe
      pas. Le code n'arrivait donc **jamais en base**, et la recherche de
      l'autre personne échouait forcément. La recherche, elle, utilisait bien
      `apiFetch` : c'est ce décalage qui rendait le bug incompréhensible.
      Corrigé le 01/09 dans le même commit que la modification du profil.
      **Le message d'erreur mentait aussi** : « demande à la personne de rouvrir
      Favorable une fois pour synchroniser son code » décrit un contournement
      d'une synchronisation qui n'a jamais fonctionné depuis le natif.
- [x] Le champ de saisie du code était **blanc sur blanc** en thème clair : on
      tapait un code invisible. Le bouton « Connecter » était sous le seuil.
- [ ] Textes en dur dans cet écran : « Connecter », « Vous & … », `rel.labelFR`.
      Le produit a dix langues.

## Notifications

- [ ] **Rien ne propose jamais les notifications.** `dejaPropose()` et
      `marquerPropose()` ne sont appelés nulle part ; l'écran de pré-demande
      annoncé en tête de `lib/push.ts` n'existe pas. Il faut aller chercher le
      réglage dans le tiroir. C'est la raison du zéro jeton.
- [ ] Vérifier après le prochain build que `/api/push/register` est enfin
      appelé — il ne l'a jamais été une seule fois.

## Profil

- [ ] **Aucun écran d'édition des données de naissance.** « Ma naissance »
      renvoie dans l'onboarding complet, formulaire VIDE, quatre champs à
      ressaisir. Corriger sa date demande de traverser tout le parcours.

## Thème

- [ ] **Trois palettes de domaine coexistent** : `--domaine-*`
      (personnalisation), `--dom-*` (briefing), et celle de `domain-config.tsx`.
      Les fusionner est un choix de design.
- [ ] **49 fichiers sur 108** contiennent au moins une couleur figée côté app.
      763 occurrences.
- [ ] `components/demo/SausageCard.tsx` est bâti sur `bg-white/[0.08]` —
      **invisible en thème clair**. Actuellement dans du code mort.
- [ ] `app/app/astro/*` — écrans entièrement sombres en dur (outil interne).
- [ ] Le `LaunchScreen` iOS n'a qu'une seule image pour les deux thèmes :
      séquence blanc → violet foncé → clair au démarrage à froid.

## Onboarding

- [ ] `StepInput` n'a pas de défilement : sur petit écran clavier ouvert, le
      contenu peut dépasser sans qu'on puisse atteindre le bouton.
- [ ] `StepPreparing` applique `px-5` alors que l'orchestrateur le fait déjà —
      40 px de marge au lieu de 20 sur ce seul écran.

## Dette sous cliquet

- [ ] **73 erreurs ESLint.** 33 `set-state-in-effect`, 19 `refs`. Chacune
      demande d'être jugée séparément.
- [ ] **127 couleurs figées.**
- [ ] **3 textes non traduits** — dans `MonthlyView`, contenu fabriqué déjà
      sorti du build. Ils partiront avec l'écran.

## Ce qui n'est pas de mon ressort

- [ ] Prix « à vie » de 49 €, incohérent avec 39,99 €/an.
- [ ] Codes d'accès : les retirer, ou vérification côté serveur.
- [ ] Logotype `logo-dark.svg` — « unfold » vectorisé.
- [ ] Statut DSA, questionnaire App Privacy, accord de Marie-Ange.
- [ ] Android : aucune configuration de signature.
