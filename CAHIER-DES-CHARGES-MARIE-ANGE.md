# Cahier des charges pour Marie-Ange — version 0 (02/09/2026)

Ce que Favorable a besoin que le moteur expose, deduit du prototype
« Ta ligne de vie » (claude.ai/code/artifact/2f5f30a1…) construit sur une
personne du corpus. Le prototype tourne sur tes routes publiques par
`personId` ; la production tourne sur la naissance de nos utilisateurs.
Rien ici ne demande de nouveau calcul : chaque champ existe deja dans une
reponse mesuree (MOTEUR-SURFACE.md §5 et §6).

## 1. La porte : naissance en entree

Sur les six routes ci-dessous, accepter en alternative a `personId` :
`birthDate` (YYYY-MM-DD), `birthTime` (HH:MM), `timezone` (IANA),
`latitude`, `longitude` — le meme contrat que `toctoc-year.php`.

| Route publique aujourd hui | Ce que le prototype en lit |
|---|---|
| `period-quality?lot=spirit` | `chapters[] {startDate, endDate, startAge, endAge, signQuality, houseTopic, isPeakPeriod, peakType, level}`, `currentBackground {startDate, endDate, grade}`, `lifeParts.parts[] {startAge, endAge, quality, status}`, `counselingNote` |
| `planetary-periods` | `currentlyActive`, `nextMilestone`, `allMilestones[] {planet, period, activationDate, status}` |
| `solar-return-timeline` | `pivotalTop10Years`, `peakYears`, `rows[] {year, age, pivotal.score, pivotal.reasons[], profection.annual.house}` |
| `aspect-archetypes` | `presentAspects[] {activationAge, activationDate, status, archetypeTheme, archetypeKeywords}` |
| `numerology` | `objective.label`, `lifePlan.title/description`, `coreNumbers.pinacles`, `hundredYearCycles[] {year, dateStart, dateEnd, personalYear, personalYearTheme, advice.text}` |
| `profections?date=` | `annualProfection.house`, `monthlyProfection.house` |

Cote moteur, `/api/period-quality` existe et repond 500 « Output file not
created » sur ces memes parametres ; c est la seule des six deja routee sur
`ai.zebrapad.io`. Les cinq autres n y existent pas encore.

## 2. Ce que l app fait de ces donnees (pour cadrer, pas pour contraindre)

- **Le passe d abord.** Ages-cles (`activationAge`) et annees pivots
  (`pivotalTop10Years`) sont montres AVANT le present, pour que la personne
  verifie avec sa memoire. Le corpus sert d illustration, jamais de preuve.
- **Une qualite, une fenetre, un domaine par periode.** `signQuality` devient
  une etiquette (porteuse / neutre / exigeante / la plus exigeante),
  `houseTopic` devient le domaine en mots courants, `startDate → endDate` la
  fenetre. Le modele de langue reformule, il n ajoute ni date, ni chiffre.
- **On ne parle fort que quand plusieurs techniques s accordent.** Exemple
  reel sur la personne 5507 : fin 2029, `period-quality` (fin de chapitre
  2029‑12‑01), `planetary-periods` (Mars, 2029‑12‑18) et `solar-return-timeline`
  (pivot 16/16) tombent sur la meme fenetre. C est la carte-heros du prototype.

## 3. Budget de temps

Mesure : `period-quality` 1,1 s, `numerology` 1,4 s, `solar-return-timeline`
1,1 s, `aspect-archetypes` 0,8 s, `planetary-periods` 0,7 s, `profections`
1,0 s — tout est compatible avec un ecran qui s ouvre. `transit-cycles`
(11,8 s) et les `toctoc-*` lents (45 a 67 s) restent en arriere-plan.

## 4. Deux questions qui restent (deja posees dans POUR-MARIE-ANGE-QUESTIONS.md)

- Q1 : `/api/period-quality` en 500 sur naissance.
- Q8 : quelle clef designe un boudin de facon stable entre points d entree.

## 5. Ce qu on ne demande pas

Aucune interpretation en prose de plus : la traduction pour le grand public
est le travail de l app. Aucune prediction d evenement. Aucun champ que le
moteur ne calcule pas deja.
