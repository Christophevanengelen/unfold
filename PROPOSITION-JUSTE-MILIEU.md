# Le juste milieu — ce qu on ajoute a Favorable pour remplacer Astronum

Condition de Marie-Ange (02/09/2026) : remplacer Astronum seulement si on
ajoute des fonctionnalites. Ses 10 000 installations ont eu une app tres
fournie ; on ne revient pas avec moins. Mais « plus » ne veut pas dire
« tout » : chaque ajout doit tenir nos regles (REPORTING-REGLES.md) —
descriptif, calcule par le moteur, jamais predit, aucun jargon.

Ce que promet la fiche d Astronum (`com.zebrapad`, 4,75★/16) : horoscopes
quotidiens, guidance personnalisee, matching, astrologie + numerologie.

## Ce qui tient deja dans Favorable (a mettre en avant, pas a construire)

| Promesse d Astronum | Chez nous |
|---|---|
| Horoscope quotidien | le briefing du jour, desormais oriente par les priorites declarees |
| Guidance personnalisee | les capsules, avec la vraie maison du moteur depuis ce matin |
| Matching | existe — mais deux lectures solo reliees (Q6 a Marie-Ange) |

## Les ajouts, classes par valeur pour l utilisateur ÷ cout

Legende : **donnee** = deja calculee et branchee (il ne manque que l ecran) ;
**route** = point d entree moteur sans authentification, appelable avec une
naissance ; **bloque** = demande a Marie-Ange.

| # | Fonctionnalite, dite en clair | Ce que le moteur fournit | Etat | Cout |
|---|---|---|---|---|
| 1 | **Ta plus grande annee**, tes annees fortes, tes annees dures | `toctoc-highlights` : biggestYear, peakYears, challengingYears | **donnee** (`saillants` dans le contexte) | ecran seul |
| 2 | **Ce que tu traverses** — le chapitre de fond, et la date de la prochaine fenetre ou plusieurs techniques s accordent | `lib/silence.ts` : 101 fenetres / 100 ans, 5,1 % du temps | **donnee** (`silence` dans le contexte) | ecran seul |
| 3 | **Ton annee** — le domaine de vie de l annee en cours, en mots, et celui du mois | `/api/profection` : `annualProfection.description` (« Focus on communication, learning, networking ») | **route** (le moteur repond sans cookie) | petite route + ecran |
| 4 | **Ton anniversaire astral** — l annee qui commence a ton anniversaire, ses annees de pic | `app/api/birthday-report` : `/api/solar-return-timeline` + `/api/rs-angular-peak-year`, rendu HTML, zero modele | **route** (existe, sert le site) | ouvrir dans l app |
| 5 | **Le rapport de ton Esprit** (ZR) — les chapitres de ta vie, dates | `app/api/zr-spirit-report` : `/api/zodiacal-releasing`, rendu HTML | **route** (existe, sert le site) | ouvrir dans l app |
| 6 | **Les eclipses de ton annee** — quand, et quel domaine elles touchent | route interne `eclipses` (chemin moteur : voir astrology-subject.ts) | **route** (a decoupler du cookie) | petite route + ecran |
| 7 | **Les trois parties de ta vie** — debut, fin, qualite, en une phrase chacune | `/api/period-quality` : `lifeParts.parts[]` avec description deja redigee | **bloque** : 500 cote moteur (Q1) | — |
| 8 | Numerologie, Human Design (promesses d Astronum) | routes AstroLearn par `personId` seulement | **bloque** : porte date-heure-lieu (question a Marie-Ange) | — |

## Ce que je propose de construire, dans cet ordre

1. **Lignes 1 et 2** — les donnees sont deja dans l app ; seul l ecran manque,
   et l ecran est un dessin de Christophe. Ce sont aussi les deux
   fonctionnalites qu aucun concurrent n a : « ta plus grande annee »
   (verifiable par la memoire) et « l app se tait, prochaine fenetre le … ».
2. **Ligne 3** — une route de vingt lignes sur le modele des rapports
   (naissance en entree, moteur direct, aucun cookie), et un ecran court.
3. **Lignes 4 et 5** — deja rendus ; il s agit de les ouvrir depuis l app par
   `apiFetch`, dans une feuille. Le HTML est celui du site : a verifier a
   l ecran avant d embarquer (theme, largeur), pas a reecrire.
4. **Ligne 6** — apres 3, meme modele.
5. **Lignes 7 et 8** — des que Marie-Ange repond.

Ce qu on n ajoute PAS, meme si Astronum le faisait : tout ce qui predit un
evenement, tout ce qui demande au modele d inventer, et toute technique dont
on ne sait pas dire le resultat en une phrase sans jargon.

---

## v2 — la mine : les seize techniques mesurees (02/09, apres-midi)

L API toctoc construite pour l app est etroite. La valeur est dans l outil
ouvert de Marie-Ange. Mesure sur une personne (MOTEUR-SURFACE.md §5) : six
techniques portent des phrases deja ecrites ET datees. Ce que verrait la
personne, en une ligne chacune — le modele TRADUIT et lisse, il n invente rien.

| # | Ce que voit la personne | Source (champ mesure) | Langue | Note |
|---|---|---|---|---|
| A | **Ton fil rouge** : « Le Batisseur du monde — votre vie est une construction patiente et solide » ; **ton annee** : « Travail & Fondations — batissez vos fondations durablement », avec son conseil | numerology.lifePlan, hundredYearCycles[annee].personalYearTheme / advice | francais, pret | 100 annees datees ; couvre la promesse « numerologie » d Astronum |
| B | **Tes ages-cles** : « A 20 ans : Grace et abondance — pleasure, generosity, faith in love » (passe / actif / a venir) | aspect-archetypes.presentAspects[] : activationAge, activationDate, status, archetypeTheme, archetypeUniversal | anglais | 13 ages sur une vie ; les memes ages pour tout le monde, la couleur differe — a dire honnetement |
| C | **En ce moment Saturne ; prochaine etape Mars, le 18 decembre 2029** | planetary-periods.currentlyActive, nextMilestone, allMilestones (21) | anglais | dates exactes |
| D | **Tes dix annees pivots** : 1979, 1987, 1990… 2022, **2029** ; une phrase par annee | solar-return-timeline.pivotalTop10Years, rows[].profection.annual.description, sr.angularPlanets[].meaning | anglais | 74 annees ; le passe se verifie de memoire |
| E | **Les trois parties de ta vie** : « 0-41 ans : fondations ; 41-65 : expression ; des 65 : culmination », chaque chapitre grade | period-quality.lifeParts.summary, chapters[].houseTopic / signQuality, currentBackground | anglais | route moteur en 500 sur naissance (Q1) ; le corpus repond |
| F | **Qui gouverne cette tranche de ta vie** : « Jupiter, depuis la 5e maison — enfants, creativite, plaisir ; jusqu a 66 ans » | circumambulation.primaryTimeLord.interpretation, periodStartAge/EndAge, nextParticipatingTimeLord.ageOfContact | anglais, jargon a lisser | dates par age |

**Ce qui reste matiere, pas prose** : eclipses, chart-data, transit-cycles
(dates et degres ; 11,8 s pour transit-cycles). Human Design : 2 phrases,
type + autorite, en francais — petit mais tient la promesse d Astronum.

## La porte, et ce qu on fait en attendant

Ces six routes sont indexees par personId, pas par naissance. La demande a
Marie-Ange est posee (POUR-MARIE-ANGE-QUESTIONS.md). En attendant, **on
construit contre le corpus** : `lib/astrolearn-public.ts` appelle ces routes
par personId, type sur les formes mesurees, et les ecrans se dessinent sur une
personne de demonstration. Le jour ou la porte s ouvre, seule l entree change.

Ordre propose : A (francais, pret, promesse d Astronum) → D (verifiable de
memoire, le mecanisme de credibilite) → C → B → F → E (des que Q1 est levee).

---

## Le prototype « Ta ligne de vie » — brouillons et critique (02/09, apres-midi)

Adresse : claude.ai/code/artifact/2f5f30a1-dea0-4e44-853a-3c8540a4ca42
(brouillon 1 puis 2, meme page). Donnees reelles de la personne 5507 du
corpus ; phrases ecrites a la main comme cibles pour la couche de traduction.

**Critique du brouillon 1, contre le persona et la concurrence** (etude de
marche du PLAYBOOK : les 10 % qui veulent comprendre, pas les 20 % qui
s amusent ; Co-Star vit du retour quotidien ; The Pattern declenche le
paiement sur une fenetre datee, « Time Travel ») :

| Reproche | Reponse dans le brouillon 2 |
|---|---|
| Ne repond pas a « et aujourd hui ? » en un regard — c est ce qui fait revenir | Bandeau « Aujourd hui » en tete : la regle de silence comme reponse, « rien de marquant, prochaine fenetre fin 2029, prochain chapitre le 18 septembre » |
| Le passe est passif | « Est-ce que tu te reconnais ? » oui / pas vraiment sur chaque age-cle : engagement, personnalisation, et la mesure du faux positif sur de vraies personnes |
| Rien a partager ; le matching est le levier viral nomme par Christophe | Le heros porte « Qui traverse ca avec toi ? » ; une carte de partage « Ma prochaine annee pivot : 2029 » |
| Le heros est a trois ans ; a 5 EUR il faut d abord le proche | « Les 90 prochains jours » avant tout : le 18 septembre est dans 16 jours |
| Le jargon fuit ; « la plus exigeante » frole l alarmisme ; la frontiere calcule / traduit n est pas dite | Sources repliees sous « pour qui veut verifier » ; « periode dense » ; chaque phrase traduite porte un point « traduit par IA depuis le calcul » (positionnement « calcule, pas genere » + AI Act art. 50) |

Ce que le brouillon 2 ne resout pas encore : la couche de traduction n est
pas branchee (phrases a la main) ; le persona de demonstration est une figure
publique du corpus, pas la persona a 5 EUR — des que la porte naissance est
ouverte, la meme page tourne sur une personne fictive.

## Brouillon 3 — la ligne (02/09, fin d apres-midi)

Demande de Christophe : sortir des blocs de texte, une experience interactive,
illustree, animee — et derriere chaque bouton une vraie experience.

- **La ligne de vie elle-meme** : cent ans a faire defiler, le passe en haut,
  l avenir en bas ; chaque fenetre d accord est une lueur (force 2 douce,
  force 3 vive) ; aujourd hui pulse ; ages-cles et annees pivots en marge ;
  un HUD colle en haut dit l annee sous le doigt et l etat (calme / fenetre).
- **« Qui traverse ca avec toi ? »** : la seconde ligne (Jennifer A., nee le
  11/02/1969) apparait a cote, les moments communs s allument en vert, et le
  verdict est honnete.
- **« M y preparer »** : domaine, qualite, trois actions, rappel 30 jours
  avant (mecanique existante de planification), ajout au calendrier.

**Corrections de fond, mesurees sur les paquets de Brad par naissance** (et
non plus sur le theme de test du matin) : 1 819 periodes, **55 fenetres,
3,6 %** du temps ; prochaine **2029‑12‑08 → 12‑22, maison 3, force 2** — le
« 3 techniques » du brouillon 2 venait d un comptage a la main hors de la
regle. Brad × Jennifer : **4 chevauchements en deux vies**, les prochains en
decembre 2046 et septembre 2063. La regle de silence appliquee a deux.

Ce que Christophe demande encore : voir l outil de Marie-Ange en utilisateur
CONNECTE (« add life events, and more »), au-dela de la page publique. Voie :
sa session Chrome.

## Brouillon 4 — deux resumes, cles en main (02/09, soir)

Verdict de Christophe sur le brouillon 3 : la ligne a parcourir reproduit la
navigation de la frise existante ; du scrolling et du clicking sans valeur
ajoutee. Les deux features sont des RESUMES, pas des parcours. Et le waouh ne
doit pas se payer en complexite : cles en main, l insight d abord.

Brouillon 4, meme adresse :
- **Aujourd hui** — une phrase (« Rien de marquant. Et c est une bonne
  nouvelle. »), le prochain changement dans 16 jours avec ses deux domaines et
  l action, l annee et le mois, et la promesse de silence (« on te previendra
  30 jours avant chaque fenetre »).
- **Ton ID astral** — le fil rouge (« Le Batisseur »), un anneau de vie ou l on
  lit d un regard l age, les trois parties de vie (0-41 / 41-65 / 65-96 avec
  leur qualite), les annees pivots, la prochaine fenetre qui s allume,
  aujourd hui qui pulse ; trois faits ; ce que tu traverses ; les deux boutons.
  L animation assemble l ecran une fois ; rien a parcourir.

Verifie a l ecran en local (accents, geometrie de l anneau, console vide).
Toutes les valeurs sont celles de Brad P. par naissance.
