# Plan de finalisation de l'app — 11 septembre 2026

Ce que l'app doit devenir avant le prochain envoi TestFlight, **sans rien
attendre de Marie-Ange ni d'App Store Connect**. Ces deux dépendances ont leur
propre suivi : `messages/briefing-integration-marie-ange.html` et
`CHECKLIST-APP-STORE-CONNECT.md`. Rien ici n'en dépend.

Tout chiffre vient d'une mesure faite le 11/09/2026 et citée. Le plan se lit
par chantier : ce qui cloche, comment on le saura réglé, et par quel contrôle.

---

## L'ordre, et pourquoi celui-là

1. **La lenteur** — aucune interface ne survit à 50 s d'attente. Tout le reste
   se juge sur un écran qui s'affiche.
2. **Les 145 phrases de repli** — ce sont celles que la plupart des gens
   lisent, et elles n'existent qu'en français.
3. **La vitrine sur l'écran vide** — c'est ce qui donne envie d'inviter.
4. **Les notifications de connexion** — c'est l'accompagnement dans le temps,
   la raison pour laquelle une connexion se garde.
5. **Les sept composants débranchés** — rebrancher ou trancher, un par un.

Les chantiers 1 et 3 se croisent sur `app/app/compatibility/page.tsx`, les 2 et
3 sur `lib/perso-i18n.ts` : ils passent donc **en série**, pas en parallèle.

---

## Chantier 1 — Le premier affichage

**Mesuré.** 68 appels à `/api/toctoc` pendant une session de QA, dont plusieurs
à **42 s**, un à **50 s**. Pendant ce temps la liste des connexions est vide :
le garde affiche « Connexion perdue » au bout du délai, et l'écran ne montre
rien d'utile entre-temps.

**Ce qu'on fait.** La liste s'affiche **immédiatement** avec les connexions
connues — nom, lien, avatar — et chaque résumé arrive quand il arrive, ligne
par ligne. Aucune connexion n'attend une autre. Le squelette de chargement
existe déjà par ligne (`ConnectionRow` accepte `loading`) : ce qui manque,
c'est que la page ne retienne plus l'affichage entier.

**Fini quand.** Le premier rendu utile de `/app/compatibility` tient **sous 2 s**
avec deux connexions, résumés non chargés, mesuré à froid. Aucun écran
« Connexion perdue » tant qu'une donnée locale est disponible.

**Contrôle.** Un test Playwright qui compte le temps jusqu'à la première rangée
visible, et qui échoue au-delà de 2 s.

---

## Chantier 2 — Les phrases de repli du Match

**Mesuré.** 145 phrases dans `lib/matching-narratives.ts`, rendues en français
quelle que soit la langue. Elles s'affichent quand le modèle échoue **ou que la
personne n'est pas abonnée** — donc le cas le plus fréquent.

**Ce qu'on fait.** Les phrases passent dans `lib/perso-i18n.ts`, dix langues,
par familles (domaines, tempos, statuts). Les gabarits à variables gardent
leurs marqueurs `{n}`, `{mois}`.

**Fini quand.** `PLAFOND_MODULES` descend de 145 à 0 dans
`scripts/verifier-traductions.mjs`.

**Contrôle.** Celui qui existe, dont le plafond baisse à mesure. Il a été testé
en remettant une phrase en dur.

---

## Chantier 3 — La vitrine avant l'invitation

**Mesuré.** L'écran vide du Match montre un cadre au centre qui répète les deux
boutons placés juste dessous, et rien d'autre. Aucune promesse, aucune preuve.

**Ce qu'on fait.** Tant que l'utilisateur n'a connecté personne, il voit ce que
ça donne : les personnalités de la base, leur visage, ce qu'on lui dirait de sa
correspondance avec elles. Puis l'invitation, qui devient une suite logique et
non un formulaire. Les données de correspondance sont déjà mesurées et versées
au dépôt (`donnees/base-correspondance-2026-09-02.json`,
`donnees/base-familles-2026-09-02.json`).

**Fini quand.** L'écran sans connexion montre au moins trois visages réels de la
base et une phrase de correspondance, et l'action d'invitation reste la seule
action principale.

**Contrôle.** Capture Playwright de l'état vide, en clair et en sombre, plus le
contrôle de contraste existant.

---

## Chantier 4 — Les notifications de connexion

**Mesuré.** `lib/push-planification.ts` ne planifie que deux écrans, `timeline`
et `monthly`. Aucune notification ne naît de ce qui se passe **entre deux
personnes**, alors que `lib/push-routes.ts` sait déjà pointer vers l'écran
d'une connexion.

**Ce qu'on fait.** Pour chaque connexion gardée, on planifie sur les moments
communs : ce qui se termine, pourquoi c'est important, comment s'y préparer.
Le réglage vit dans les paramètres du compte, connexion par connexion : les
moments forts communs seulement, ou aussi les changements chez l'autre, ou tout.

**Fini quand.** La fonction pure de planification produit, pour deux vies
données, une liste datée de rendez-vous communs ; le réglage est lu et respecté.

**Contrôle.** `scripts/verifier-planification.mjs` étendu aux connexions, éprouvé
sur plusieurs années en une seconde comme il l'est déjà pour une vie seule.

---

## Chantier 5 — Les sept composants débranchés

**Mesuré.** `SignalPager`, `StepCompatibility`, `StepHabit`, `StepPersonalize`,
`StepPremium`, `Header`, `CookieConsent` : plus rien ne les importe. Le
parcours d'onboarding réellement chargé en monte six autres.

**Ce qu'on fait.** Un par un : rebrancher, ou retirer avec l'accord de
Christophe. Rien n'est supprimé sans qu'il le dise — c'est la règle.

**Fini quand.** Le cliquet `verifier-code-mort.mjs` descend de 7, et chaque
composant sorti de la liste l'est par une décision écrite ici.

---

## La boucle

Chaque chantier suit le même tour, et aucun ne se commit avant d'avoir bouclé :

1. **Mesurer** l'état de départ, chiffre à l'appui.
2. **Écrire** le contrôle qui échouera tant que ce n'est pas réglé.
3. **Implémenter.**
4. **`npm run verifier`** — les dix-huit contrôles, plus le nouveau.
5. **QA à l'écran** — Playwright, iPhone 13, clair et sombre, français et une
   langue longue, avec les débordements mesurés et non regardés à l'œil.
6. **Commit** avec le chiffre avant / après dans le message.

Quand les cinq chantiers sont bouclés : un commit portant `[testflight]` dans
son message, qui déclenche l'envoi — et seulement à ce moment-là.

---

## L'équipe

Six agents existaient déjà (`favorable-moteur`, `favorable-parcours`,
`favorable-garde-fou`, `favorable-caisse`, `favorable-juridique`,
`favorable-stores`). Trois manquaient pour ce plan, ils sont créés avec lui :

| Agent | Ce qu'il tient |
|---|---|
| `favorable-vitesse` | le temps jusqu'au premier écran utile, les caches, ce qui attend quoi |
| `favorable-langues` | les dix langues, les gabarits, ce qui échappe encore aux dictionnaires |
| `favorable-notifs` | qui prévenir, de quoi, quand — et le réglage qui le gouverne |

---

## Ce qui n'est pas dans ce plan, et pourquoi

- **La route date, heure, lieu** chez Marie-Ange : bloque l'écran d'ouverture de
  l'ID astral, pas l'app. Suivi dans le briefing.
- **App Store Connect** : entité, banque, abonnements, reprise de la fiche
  Astronum. Douze lignes ouvertes, aucune technique.
- **Le découpage des trois parties de vie** : deux définitions concurrentes,
  question posée à Marie-Ange. On n'affiche rien tant qu'elle n'a pas tranché.
