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
- [x] **Prix « à vie » retiré** le 01/09. Vérifié avant : zéro achat à vie en
      base, donc personne ne perd d'accès. Le statut `lifetime` reste reconnu
      par `entitlement.ts` — c'est l'offre qui disparaît, pas la reconnaissance.

## Dette, sous cliquet

- [ ] **121 couleurs figées** (156 le 31/08). L'essentiel du reste est sur le
      site vitrine, sombre par choix. Les couleurs de TEXTE qui échouaient au
      contraste sont toutes traitées, et vérifiées à chaque `npm run verifier`.
- [ ] **3 textes non traduits** (29 le 31/08), tous dans du code déjà sorti du
      build. Le français en dur a disparu du code vif : `perso-i18n.ts` porte
      142 concepts et 1 420 traductions.
- [ ] **52 erreurs ESLint** (81 le 31/08). La chute vient surtout de la
      suppression du code mort : une bonne part de la dette vivait dedans.

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

- [x] **3 661 lignes de code mort supprimées** le 01/09, par vagues, en ne
      touchant à chaque tour que les racines à zéro import.

      L'élément déclencheur : `DomainPager` ne pouvait pas être rebranché. Il
      fait `mockStructuredInsights[timeView].overall` sur un **tableau** — donc
      `undefined.overall`, une exception au premier rendu. Du code abandonné en
      cours de refonte, pas du code débranché qui marche.

      Sont partis avec lui : tout le sous-arbre de l'écran de détail par
      domaine, celui de `LifeTimeline`, et surtout **`lib/mock-data.ts`** — 739
      lignes de scores inventés, de lectures astrologiques écrites à la main, et
      d'un **thème natal fixe** servi comme contexte pour les événements de
      n'importe qui. La source des données fabriquées n'existe plus.

- [ ] **Sept composants restent, et ce sont des décisions produit :**

      | Quoi | Lignes | État réel | La question |
      |---|---|---|---|
      | `StepPremium` | 258 | **Prêt.** Branché sur les vraies phases le 01/09. | C'est le seul moment de vente. L'ajouter au tunnel change la conversion — ton appel, une ligne. |
      | `StepHabit` | 208 | **Prêt.** Vraies données aussi. | Idem. |
      | `SignalPager` | 312 | **Fonctionne.** Vraies phases, code propre. | Carrousel des signaux. Il n'a pas de place dans la navigation actuelle. |
      | `StepCompatibility`, `StepPersonalize` | 333 | Propres, pure interface. | Sortis du tunnel, sans trace de la raison. |
      | `Header` | 40 | Son lien d'évitement a été récupéré. | Remonter un en-tête collant sur une page-récit est une décision de design. |
      | `CookieConsent` | 83 | **À laisser.** | Aucun cookie non essentiel dans le produit — voir plus bas. |


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
- [x] Les textes de cet écran sont traduits, y compris `relationshipConfig`
      dont le champ s'appelait littéralement `labelFR`.

## Trouvé par les audits du 01/09 — non encore corrigé

### Ce qui affiche du FAUX

- [ ] **`StepSignalPreview` invente une vie entière.** Treize périodes codées en
      dur, 1985 à 2036, un compteur qui monte de 1985 à 2026, sous la légende
      « Ton signal est actif ». Aucune donnée de naissance n'a encore été
      demandée à ce stade du parcours.
- [ ] **`StepTimelineTeaser` : mêmes planètes actives pour tout le monde.**
      `isActive: true` figé sur Soleil/Jupiter/Saturne/Neptune.
- [ ] **`StepPreparing` affiche une réussite sur un échec moteur.** Il déstructure
      `state` du store et ne l'utilise jamais : si le calcul échoue, l'écran
      arrive quand même à « Ton signal est actif ».
- [ ] **Une panne réseau s'affiche « Calme ce mois »** (`connection-summary.ts:147`).
      Un échec devient une déclaration astrologique.
- [ ] **Domaine inconnu = Carrière**, avec son récit complet, sans rien signaler
      (`CapsuleDetailSheet.tsx:244`).
- [ ] **Le premier passage est toujours marqué « maintenant »** quand la capsule
      n'a pas d'objet `cycle`, même s'il date de plusieurs années.
- [ ] **Une phrase de repli servie comme guidance IA** (`personalize/route.ts:762`),
      sans marque distinctive.

### Modales et feuilles

- [x] **Deux feuilles empilées** — la fiche d'édition de naissance s'ouvrait
      DANS le tiroir de profil : deux poignées, celle du dessous réduite à une
      tranche de titre. Corrigé le 01/09 : le tiroir se ferme, une seule feuille
      à la fois.
- [ ] **Le reste du système de modales est à revoir** (Christophe, 01/09). Le
      sélecteur de langue est monté dans le tiroir de la même façon et souffre
      probablement du même défaut. À vérifier écran par écran : pas de feuille
      sur feuille, une poignée visible, et un retour cohérent.

### Ce qui bloque

- [ ] **Glisser au lieu de taper saute l'enregistrement des priorités.** Le
      bouton appelle `handlePrioritiesNext`, le glissement appelle `next()` qui
      n'enregistre rien — et contourne aussi la validation.
- [ ] **Le libellé du bouton désactivé est à 1,41 de contraste**, avec le jeton
      que le contrat interdit nommément pour du contenu.
- [ ] **Quatre boutons Retour sans aucune taille déclarée** (~16-20 pt).
- [ ] **`onTouchCancel` manquant** sur la suppression de connexion : un appel
      entrant pendant l'appui long supprime la connexion doigt levé.
- [ ] **L'écran de préparation n'a aucune sortie** en cas d'échec ; `reessayer()`
      existe et n'est appelé nulle part dans l'onboarding.

### Couleurs — ce que l'agent a laissé volontairement

- [x] **118 → 102 couleurs figées.** L'or « premium » valait **2,45** de
      contraste : le libellé du seul bouton menant au payant, illisible dans les
      deux thèmes. Trois jetons créés et enregistrés dans le vérificateur.
- [ ] Les 4 couleurs de `relationshipConfig.ts` restent : ce sont des couleurs
      de donnée, comme `domain-config`. Les exempter aurait baissé le compte
      sans rien corriger.

### Traductions

- [ ] **49 textes visibles en dur**, contre 3 mesurés avant. Le contrôle ne
      voyait que les propriétés, jamais le texte nu dans le JSX — il annonçait
      pourtant le couvrir. Corrigé, d'où le saut du compteur.
- [ ] **Les noms de planètes sont en français pour les dix langues**
      (`domain-config.tsx:132`). Un lecteur japonais lit « Saturne est actif ».
- [ ] **Mélange de langues dans une même phrase** : `detail-helpers.ts` compose
      un label français avec un texte anglais — « Soleil shines a light on… ».
- [ ] Vouvoiement et tutoiement alternent d'une ligne à l'autre sur l'écran de
      compatibilité.

## Notifications

- [x] **La proposition de notifications existe** depuis le 01/09. Elle arrive
      après le premier signal vu, et jamais par-dessus l'accueil ou le guide.
- [ ] Vérifier après le prochain build que `/api/push/register` est enfin
      appelé — il ne l'a jamais été une seule fois.

## Profil

- [x] **L'écran d'édition existe** depuis le 01/09 : une feuille préremplie
      depuis le profil, qui réutilise le formulaire d'onboarding.

## Thème

- [ ] **Trois palettes de domaine coexistent** : `--domaine-*`
      (personnalisation), `--dom-*` (briefing), et celle de `domain-config.tsx`.
      Les fusionner est un choix de design.
- [ ] **49 fichiers sur 108** contiennent au moins une couleur figée côté app.
      763 occurrences.
- [x] `SausageCard` a été supprimé avec le sous-arbre de `LifeTimeline`.
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
