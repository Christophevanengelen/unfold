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

    npx tsc --noEmit -p tsconfig.json      # types
    node scripts/verifier-contraste.mjs    # lisibilité des deux thèmes
    node scripts/verifier-couleurs.mjs     # couleurs figées (cliquet 156)
    node scripts/verifier-apns.mjs         # notifications
    node scripts/verifier-planification.mjs
    node scripts/verifier-liens-profonds.mjs
    bash scripts/build-native.sh           # le bundle de l'app

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

- [ ] **156 couleurs figées** dans l'app grand public. Le CI empêche d'en
      ajouter ; chaque correction abaisse le plafond dans
      `scripts/verifier-couleurs.mjs`.
- [ ] **81 erreurs ESLint**, dont 35 `set-state-in-effect` et 19 `refs` — la
      sévérité de React 19. Aucune n'est active aujourd'hui.
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
