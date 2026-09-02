# La base des personnalités — mesure de la correspondance (2 septembre 2026, soir)

Accord de Christophe pour une trentaine de vies. Ce qui a été fait, ce qui en sort, ce qu'il faut demander à Marie-Ange.

## La base

L'outil ouvert `app.astrolearn.io` expose, par `personId`, une base de type Astro-Databank : nom, naissance complète (date, heure, ville, fuseau, latitude, longitude) via `chart-data`, et des **faits datés** via `events` (Brad Pitt : 77 entrées, catégorisées travail, relations, santé…). Sondage de 160 identifiants (5400 → 5559) : 153 avec l'heure, mêlant personnalités publiques, anonymes et cas cliniques (jumeaux, quadruplés). **39 personnalités reconnaissables retenues**, 30 avec un référentiel complet (9 sans : le vote d'Ascendant n'a pas abouti sur leur paquet annuel — à regarder).

## La chaîne

Pour chaque vie : naissance → `toctoc-app-short` + `toctoc-year` (moteur zebrapad, ~2 000 boudins) → `maison-du-boudin` (référentiel par vote) → `silence` (deux techniques d'accord, sinon rien) → fenêtres `{du, au, maison, force, familles}`. Scripts : `scripts/echantillonner-base.mjs`, `scripts/mesurer-correspondance.py`. Données : `donnees/base-correspondance-2026-09-02.json`.

## La correspondance (Brad face à chaque vie)

Trois axes, un score sur 100 :
- **Sujets** (60 %) : recouvrement des profils de maisons des fenêtres (Brad : échanges 69 %, retrait 13 %, santé 7 %).
- **Rythme** (20 %) : durée médiane des fenêtres.
- **Rareté** (20 %) : part du temps où l'on parle.
- **Calendrier** (affiché, pas noté) : fenêtres superposées **à âge égal**, comptées contre l'attendu au hasard.

Résultats sur 29 vies : Temple Grandin 71 (sujets 74 %), Pedro Almodóvar 62, Alan Cumming 59, Nikki Giovanni 56 (3 fois le même sujet au même âge), Donny Osmond 49 (4 fois ; a démarré en groupe familial pendant une fenêtre d'échanges, 1971), Irvine Welsh 48 (5 fois). Puis Lloyd Webber, Hartman, Simmons, Moore, Eastwood, Schiffer, Gandhi, Jackson, Lanzoni, Rae, Rushdie, Collins, O'Brien, Winfrey, Mercury, Junger, Oxenberg, Goodman, Gayle, E. O'Brien, Hawking, J. Osmond, Grant (22 à 47).

## La population (30 vies)

Sujet dominant : toi-même 23 %, création 13 %, échanges 10 %, argent 10 %, partagé 10 %, santé 10 %, carrière 10 %, idées 7 %, retrait 3 %, foyer 3 %. **10 % parlent surtout d'échanges, comme Brad.** Rareté : médiane 8,1 % du temps ; Brad 3,7 %, **2ᵉ plus silencieux sur 30**.

## Ce qu'on dit, ce qu'on ne dit pas

- **Calendrier contre le hasard : 1,00 en médiane** (0,40 → 1,63 ; 4 vies sur 29 au-dessus de 1,3). Les fenêtres ne tombent pas aux mêmes âges d'une vie à l'autre plus que le hasard. On l'écrit dans l'écran : c'est la mesure qui rend le reste crédible, et c'est cohérent avec `MESURE-FAUX-POSITIF.md` (descriptif, jamais prédictif).
- **Faits datés dans les fenêtres** : rares avec les fenêtres actuelles (3,7 % du temps chez Brad ; les faits de la base sont datés au mois, parfois à l'année). Donny Osmond est le seul cas net sur le sujet de Brad. Pour « ce qu'ils ont fait de fenêtres comme la tienne », il faut soit des faits datés au jour, soit une fenêtre élargie — à mesurer avant de promettre.

## Écarts à noter

Brad recalculé par la chaîne ce soir : 68 fenêtres (75 % échanges) contre 55 (69 %) dans le calcul validé de l'après-midi — 54 en commun, 14 fenêtres d'août en plus, toutes « échanges ». Cause probable : le paquet annuel (référentiel) n'est pas le même. Le prototype garde les 55 validées ; le classement utilise la chaîne pour tout le monde. À trancher avec Marie-Ange : quelle année de référence pour le vote d'Ascendant.

## À demander à Marie-Ange (route « correspondance »)

Entrée : une naissance. Sortie : pour toute la base, le score sur trois axes, le classement, la distribution des sujets dominants, le rang de rareté, et pour les N plus proches, leurs faits datés tombés dans des fenêtres du même sujet. Même règle de silence côté moteur, ou nos fenêtres envoyées en entrée.
