# La surface du moteur — ce qu'on utilise, ce qui dort

Releve du 02/09/2026. Deux surfaces distinctes, souvent confondues.

## 1. Le moteur — ai.zebrapad.io/full-suite-spiritual-api

Contrat d'entree : **date + heure + lieu** (`birthDate`, `birthTime`, `timezone`,
`latitude`, `longitude`, + `firstName`/`lastName`/`city`/`country`).
La cle unique d'une personne. Aucun `personId`.

Forme : `POST /api/<technique>`, reponse `{success, data}`.
Les fichiers `.php` a la racine (`toctoc-year.php`, `daily-brief.php`) sont
une surface plus ancienne qui coexiste.

| Technique | Route | Etat |
|---|---|---|
| Theme natal | `/api/chart-data` | branchee |
| Transits exacts | `/api/transits-exact`, `-short` | branchee |
| Cycles de transit | `/api/transit-cycles` | branchee |
| Zodiacal Releasing | `/api/zodiacal-releasing` | branchee, **verifiee 02/09** |
| Profections | `/api/profection` | branchee |
| Boudins de momentum | `toctoc-*.php` | branchee |
| **Qualite des periodes** | `/api/period-quality` | **routee mais en echec 500** |

`/api/period-quality` repond `{"success":false,"error":"Output file not created:
D:\\51.full-suite-api\\output\\calc_...json"}`. La route existe et le
calculateur se lance ; il ne produit pas de sortie. Question pour Marie-Ange.

## 2. Le corpus — app.astrolearn.io/api/astrolearn/public/*

Contrat d'entree : **`personId`**. Public, sans authentification.
Ne sert pas nos utilisateurs — sert la comparaison a des gens connus.

people?q= · chart-data · events · transit-cycles · zr · profections
solar-return · solar-return-timeline · progressed · eclipses
planetary-periods · aspect-archetypes · circumambulation · numerology
hd · chart-worksheet · planetary-condition · period-quality

`events` renvoie des evenements biographiques dates :
`{id_event, id_user, event_date:"19631218", category, subcategory, detail}`
La forme est deja celle de `lib/person-events.ts`.

## 3. Ce que `period-quality` produit (releve sur le corpus)

C'est le rapport, deja redige par le moteur :

- `lifeParts.parts[]` — trois parties de vie, avec `startAge`, `endAge`,
  `quality` (`-`, `±`, `++`), `qualityScore`, `status` past/current/future,
  et une `description` en clair.
- `chapters[]` — `signQuality` (`MOST_POSITIVE`/`MOST_NEGATIVE`), `houseTopic`
  en clair ("Resources, money, possessions, values"), `startDate`, `endDate`,
  `startAge`, `endAge`, `isPeakPeriod`, `peakType`.
- `currentBackground` — le chapitre de fond en cours, avec son `grade`.

## 4. Ce qui dort dans ce qu'on telecharge deja

| Donnee | Ou | Cout d'activation |
|---|---|---|
| `toctoc-highlights` : `biggestYear`, `peakYears`, `challengingYears` | client ecrit dans `lib/momentum-highlights.ts`, **zero importeur** | un import |
| `periodHousePlacement`, `periodQuality`, `periodRuler` | deja dans le paquet `toctoc-year` en cache | zero appel reseau |
| `convergence{level, overlappingEvents}` | renvoye par `toctoc-boudin-detail` | zero appel reseau |

Le `convergenceNote` est aujourd'hui demande au modele **sans lui donner le
calcul qui arrive dans la meme reponse HTTP**.

## 5. La creme — densite de prose lisible, par technique

Mesure du 02/09/2026 (apres-midi) sur une seule personne du corpus (5507),
routes `app.astrolearn.io/api/astrolearn/public/*`. « Prose » = chaines d au
moins 40 caracteres avec des espaces, hors dates. C est ce qu un humain lambda
peut lire tel quel ; le reste est de la matiere a calculer.

| Technique | Ko | Prose | Champs porteurs | Langue |
|---|---|---|---|---|
| numerology | 1 194 | **494** | hundredYearCycles[].quarters[].advice (240), personalYearTheme.theme (60), advice.text (60), lifePlan, challenges, toolbox | **francais** |
| aspect-archetypes | 73 | 275 | presentAspects[].archetypeUniversal, layerA.description, layerB.quality / experience — « meme age pour tout le monde » | anglais |
| planetary-periods (firdaria) | 51 | 145 | currentlyActive, nextMilestone, allMilestones, activationMethods[].label / note | anglais |
| solar-return-timeline | 195 | 141 | rows[].sr.angularPlanets[].meaning (81), rows[].profection.annual.description (50), pivotalTop10Years, peakYears | anglais |
| period-quality | 89 | 80 | chapters[].rulerInterpretation (60), houseTopic, lifeParts.parts[].description, summary, counselingNote | anglais |
| circumambulation | 22 | 44 | participatingTimeLords[].interpretation (« Jupiter governs this stretch of life from the 5th house… ») | anglais |
| progressed | 30 | 29 | progressedToNatalAspects[].interpretation, progressedMoonPhase | anglais |
| chart-worksheet | 30 | 12 | wshHouseLords[].label (maitres de maison) | francais, jargon |
| planetary-condition | 13 | 10 | planets.*.interpretation (grades A-C, facteurs) | anglais, jargon |
| profections | 4 | 8 | annual / monthly / daily .description, handingOverAnalysis[].verdict | anglais |
| solar-return | 7 | 6 | interpretation.ascendant / moon, angularPlanets[].meaning | anglais |
| hd (Human Design) | 4 | 2 | type, strategy, authority (+ versions Fr) | en + fr |
| zr | 1 113 | 34 | housePlacement.signification (repete) — la valeur est dans period-quality | anglais |
| transit-cycles | 99 | 50 | periodsFormatted (dates seulement) ; 11,8 s | — |
| eclipses | 7 | 0 | dates, degres | — |
| chart-data | 1 | 0 | positions | — |

Lecture : la creme est numerology, aspect-archetypes, planetary-periods,
solar-return-timeline, period-quality, circumambulation. Toutes indexees par
personId : la porte date-heure-lieu est a demander en priorite sur celles-la.
La reformulation en dix langues est le travail du modele — il traduit une
prose calculee, il n invente rien (contrat REPORTING-REGLES.md).
