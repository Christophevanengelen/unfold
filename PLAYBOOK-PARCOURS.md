# Playbook — le parcours Aujourd'hui · Ton ID astral · Comparer · Quoi faire

Ce que les brouillons 1 → 15 (2 septembre 2026) ont fixé, pour que la suite soit pertinente, scalable et robuste. Les fondements ; on ne les rediscute pas à chaque écran.

## Pertinent — ce que l'utilisateur ressent

1. **Deux features, deux rythmes.** *Aujourd'hui* : une réponse par jour, souvent le silence, et trois horizons datés. *Ton ID astral* : un parcours en six écrans, lu une fois, relu quand la vie change.
2. **Une idée en grand par écran.** Titre, un visuel qui porte la donnée, une phrase. Le reste (D'où ça vient · Pourquoi ça compte · L'impact) vient après, dans le même écran ou derrière un geste.
3. **Le visuel au service de la donnée.** Chaque type de fait a sa forme : les trois parties de vie = l'anneau ; le décor de fond = la vague d'amplitude ; un compte à rebours = des cases, une par jour ; les chapitres = une règle à l'échelle ; un accord de techniques = des voies qui ne se recouvrent qu'à un endroit. Pas d'illustration décorative.
4. **L'animation au service de la lecture.** L'anneau se dessine dans l'ordre des parties ; la vague se trace ; les nombres comptent ; les lignes arrivent l'une après l'autre. Une courbe unique (ease-out, .16 1 .3 1), jamais de rebond. `prefers-reduced-motion` coupe tout.
5. **Les gestes viennent en chute.** Dans le parcours, aucun bouton avant la fin ; l'écran 6 reprend l'anneau et pose « Maintenant, quoi faire de ce que tu as appris ? ». Dans Aujourd'hui, les deux gestes sont toujours là, et disent de quoi ils parlent (« Quoi faire · avant le 18 sept. »).
6. **Comparer répond sans demander.** Ordre fixe : 1 · la base des personnalités (correspondance : sujets, calendrier, rythme — et ce que ça t'apprend), 2 · toi face à ton propre passé, 3 · inviter quelqu'un. Une connexion n'apparaît que si l'utilisateur l'a créée.
7. **Pas d'écran de KPI.** Les chiffres de la machine (16 techniques, 1 819 périodes, 3,6 %) vivent dans « Pourquoi » et « Comment c'est calculé », là où l'utilisateur les demande. La preuve du silence se ressent sur la fenêtre et dans Aujourd'hui, elle ne s'affiche pas en ouverture.

## Scalable — comment on ajoute sans casser

- **Le contenu est une table, pas de l'HTML.** `QUOI[k]` et `COMP[k]` par écran : `b` (le contexte du bouton), `k` (l'entête), `t` (le titre), `h` (le corps). Un nouvel écran = une clé de plus.
- **Le corps suit toujours le même squelette** : Quand · Quoi · Comment · Pourquoi, puis un rappel ou un calendrier. Le LLM ne remplit que ces cases, à partir de données calculées ; aucune date, aucun chiffre, aucun nom de technique inventé.
- **Trois cercles pour Comparer**, toujours dans le même ordre, quel que soit l'état (aucune connexion, une, plusieurs).
- **Un visuel = une fonction** qui prend des dates et rend un SVG (anneau, vague, règle, voies). Nouvelle donnée du moteur → on choisit une forme existante avant d'en dessiner une nouvelle.
- **La charte vient du dépôt** : jetons de `app/globals.css`, Uniform Rounded, halo et capsules de la landing, cartes de verre et pastilles de l'app. Aucune couleur écrite ailleurs.

## Robuste — ce qui ne se négocie pas

- **La règle de silence** : on parle quand au moins deux techniques indépendantes pointent le même sujet au même moment. Sinon rien.
- **Mesuré avant affirmé** : la correspondance de calendrier est comparée au hasard ; si elle est en dessous, on l'écrit (Brad × Jennifer : 0,7×).
- **« À calculer » est écrit** partout où le moteur n'a pas encore répondu (la base des personnalités). Jamais un nombre pour faire joli.
- **Vérifié à l'écran** : chaque brouillon passe par Playwright (captures de chaque écran et de chaque geste, 0 erreur console) avant publication.
- **Descriptif, jamais prédictif.** La base prouve que nos dates décrivent des vies réelles ; elle ne promet rien sur la tienne.

## Ce qu'il manque pour sortir du prototype

1. Route moteur « correspondance » : pour une vie, le classement des personnalités de la base par similarité (sujets, calendrier, rythme) avec leurs faits datés.
2. Route « fenêtres d'une vie » sur date + heure + lieu (six routes publiques aujourd'hui limitées à un personId).
3. Les mêmes écrans branchés sur l'utilisateur réel de l'app, avec les jetons du dépôt.
