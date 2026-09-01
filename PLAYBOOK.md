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
