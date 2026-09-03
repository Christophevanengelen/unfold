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

## Brouillon 5 — un recit en sept ecrans (02/09, soir)

Verdict de Christophe sur le brouillon 4 : bonne direction, mais « un tableau
de statistiques » — il faut etre statisticien pour en tirer l important. Il
veut une remise en main propre, pas a pas.

Brouillon 5, meme adresse : sept ecrans, UN insight par ecran, en grand, une
seule illustration au plus, on avance d un tap (ou des fleches). L ordre est
celui des regles : le fil rouge, ou tu en es (micro-anneau), ton passe avec
« tu t en souviens ? », ce que tu traverses, dans 16 jours, ta prochaine
fenetre, et aujourd hui avec les deux boutons. Verifie a l ecran : etapes 1, 2
et 5, navigation, console vide.

## Brouillons 6 → 8 — 2 septembre 2026, retours de Christophe pris un à un

**B6 — deux gestes persistants.** Barre en bas sur chaque écran : *Comparer* (me rassurer) et *Quoi faire · pourquoi* (quand · quoi · comment · pourquoi). Les fiches s'ouvrent en feuille, avec rappel et calendrier.

**B7 — les deux features côte à côte.** Onglets *Aujourd'hui* (ce qui est important aujourd'hui : silence + trois horizons datés, chacun ouvre sa fiche) et *Ton ID astral* (la cartographie, 7 écrans, qui finit par un résumé passé · présent · futur).
- Écran 2 interactif : trois parties de vie (0→41 exigeante · 41→65 mitigée, tu es ici · 65→96 la plus favorable), chacune avec ses dates, ses faits donnés par l'utilisateur (1991, 1995, 1997 / 2005, 2016, 2022 / 2029), et sa bascule (déc. 2004 = janv. 2005 dans les faits ; déc. 2028).
- Écran 3 : la réponse « c'était ça / pas vraiment » explique ce qu'elle produit — pour toi (1997 reste ou quitte la carte ; 2029 sort du même calcul), pour le calcul (le poids bouge, rien n'est effacé), ensuite (deuxième question : 2022).
- Écran 4 : la vague d'amplitude (faible avant fév. 2020, forte jusqu'à déc. 2031, faible après) + D'où ça vient / Pourquoi ça compte / L'impact.

**B8 — illustrer, sourcer, prouver.**
- Écran 1 : la chaîne de la donnée — 3 données › 16 techniques › 1 819 périodes › 3,6 % du temps on te parle.
- Écran 5 : 16 cases = 16 jours, puis la règle des chapitres à l'échelle (29 août 2024 → 18 sept. 2026 → 10 avr. 2028, « toi » dessus).
- Écran 6 : trois voies — transit, chapitre, année pivot — qui ne se recouvrent que du 8 au 22 décembre 2029 (bornes des techniques non montrées : je ne les ai pas localement, rien d'inventé).
- Comparer : « Avec Jennifer A. » (calculé pour de vrai) / « Avec la base » (vies documentées, mêmes fenêtres, faits datés — **à calculer**, c'est une demande pour Marie-Ange). Phrase de preuve : un astrologue te montre ce qui te concerne ; nous, on te dit qui d'autre ça a concerné, à quelles dates, avec la même règle. Descriptif, jamais prédictif.

Vérifié par Playwright (17 captures, 0 erreur console). Pour Marie-Ange : ce qui est marqué *à calculer* est ce qu'on lui demande — la base de vies documentées interrogeable par fenêtre (sujet + accord), avec les faits datés connus.

**B9 — Comparer répond sans demander ; les boutons portent leur contexte.**
- Retour de Christophe : imposer « Jennifer A. » et proposer « la base » en second bouton, c'est du bruit ; il faut montrer tout de suite le plus pertinent.
- Comparer devient trois lignes directes, sans choix : **Toi** (la même fenêtre dans ton propre passé : 24 fois, la dernière 31 janv. → 21 févr. 2024, la plus forte nov. 2017 à trois techniques ; ce chapitre depuis le 29 août 2024 : zéro fenêtre), **Jennifer A. · ta connexion** (pas en déc. 2029, mais sept. 2009 partagé sur ce même sujet ; 4 moments communs : juin 1995, sept. 2009, déc. 2046, sept. 2063), **La base** en une ligne grise (à calculer par le moteur). Tout est mesuré sur les 55 + 78 fenêtres réelles.
- Les deux boutons du bas ont une deuxième ligne qui change à chaque écran : « Comparer · ce chapitre », « Quoi faire · avant le 18 sept. », « Quoi faire · déc. 2029 ». On sent que le geste concerne la section où l'on est.
- Retiré : la bascule de Jennifer à 41 ans (je ne peux pas garantir que les bornes des trois parties soient les mêmes pour tout le monde).

**B10 — Comparer, l'expérience complète (voir `COMPARER-EXPERIENCE.md`).** Retour de Christophe : la force de Comparer était la base des personnalités — « X personnes concernées dans notre base » — et une comparaison à une seule personne perd la différenciation ; il faut aussi la boucle d'invitation. La fiche Comparer devient trois cercles, dans cet ordre : **1 · La base des personnalités** (carte en pointillés : « — vies documentées ont eu cette même fenêtre », chiffre moteur, route demandée ; ce qui s'y affichera : combien, et ce qui s'est passé chez trois d'entre elles à dates connues) ; **2 · Toi, et ta connexion** (les lignes contextuelles réelles + le tableau « vous deux » : 55/78 fenêtres, 3,6 %/5,0 %, prochaine déc. 2029/juil. 2029, 4 moments communs, prochain déc. 2046) ; **3 · Quelqu'un que tu choisis** (trois étapes, bouton « Envoyer le lien », la même page reçue des deux côtés, disparition à la déconnexion). Aucun chiffre inventé pour la base.

**B11 → B12 — finition « magazine », et deux corrections de parcours (02/09, soir).**
- Retour : tout était condensé, « comme un Excel ». Finition : Fraunces (serif à caractère, opsz) pour les titres et les chiffres, Manrope pour le texte ; marges 28 px ; plus de boîtes grises mais des filets ; une idée en grand par écran ; lignes qui arrivent l'une après l'autre ; l'anneau se dessine, la vague se trace, les cases et les voies poussent ; swipe entre écrans ; les fiches deviennent des pages pleines.
- Retour : dans Aujourd'hui, Comparer imposait Jennifer ; un nouvel utilisateur n'a personne, et « une personne de la base » n'est pas « la base ». Corrigé : Comparer = 1 · la base entière (N vies ont eu ta fenêtre, ce qui s'est passé chez trois d'entre elles, où tu te situes — chiffre moteur, route demandée) ; 2 · toi face à ton propre passé ; 3 · inviter quelqu'un, avec un aperçu du résultat étiqueté « exemple sur deux vies publiques ». Le parcours démo n'a aucune connexion ; Jennifer n'apparaît plus.
- Retour : les gestes perturbaient les sept écrans ; ils ne doivent venir qu'en chute. Corrigé : la barre ne vit que dans Aujourd'hui ; l'écran 7 reprend l'anneau des trois parties avec ses deux bascules datées et la fenêtre, les trois lignes passé · présent · futur, puis « Maintenant, quoi faire de ce que tu as appris ? » avec les deux gestes en grand.
- Vérifié par Playwright, 0 erreur console.

**B13 → B17 — la charte, la correspondance, Vous deux (02/09, nuit).**
- Retour : codes graphiques hors charte. Corrigé : jetons copiés de `app/globals.css` (bg/text/border/glass, clair et sombre), Uniform Rounded embarquée (5 graisses), halo et capsules flottantes de la landing, cartes de verre et pastilles de l'app, logo en haut ; grand nombre fin comme le « 89 ». Mouvement au service de la lecture : lignes qui arrivent (courbe .16 1 .3 1), anneau qui se dessine, vague qui se trace, nombres qui comptent, halo qui respire.
- Retour : l'écran 1 « KPI » (Bâtisseur + 3 données + 16 techniques + 1 819 + 3,6 %) ne se raccroche à rien. Supprimé : le parcours ouvre sur l'anneau « Où tu en es » ; six écrans ; la chaîne de calcul, avec les techniques nommées, descend dans « Comment c'est calculé » de la fiche finale.
- Retour : Comparer à la base doit livrer une correspondance (avec qui, à quel point, pourquoi, comment, quel insight). Mesuré sur les deux vies réelles : sujets en commun 58 % (recouvrement des profils de maisons : Brad 69 % échanges, Jennifer 41 % échanges puis 29 % santé/quotidien) ; calendrier 4 moments communs contre 5,4 attendus au hasard → 0,7×, écrit tel quel ; rythme 21 j / 29 j, 3,5 % / 5,1 %. Insight : « même sujet, pas le même calendrier ». Classement affiché avec une ligne calculée et « N autres — à calculer ». Comment : même règle sur chaque vie, trois axes, calendrier mesuré contre le hasard.
- Retour : quand l'utilisateur invite, il est déjà convaincu ; il veut recevoir quelque chose. La page « Vous deux » (exemple sur deux vies publiques) : l'accusé « Jennifer a accepté — la même page pour vous deux » ; une phrase qui nomme la relation ; les trois prochaines années à tour de rôle (deux voies, jamais en même temps) ; le geste (prévenir 7 jours avant la fenêtre de l'autre : « c'est son moment, pas le tien — écoute ») ; le prochain moment commun daté ; les souvenirs communs à reconnaître, chacun de son côté ; ce qui vous distingue ; deux rappels.
- Corrigés au passage : les années comptaient avec un séparateur de milliers ; la classe `duo` de la page entrait en collision avec la table ; le halo débordait du téléphone.
- Playbook des fondements : `PLAYBOOK-PARCOURS.md`. Vérifié par Playwright, 0 erreur.

**B18 — Comparer, la population avant la personne (02/09, nuit).** Feu vert de Christophe pour une trentaine de vies. Chaîne complète sur 39 personnalités de la base ouverte de Marie-Ange (30 exploitables) : voir `BASE-CORRESPONDANCE.md`. Le cercle 1 de Comparer devient « Toi, parmi les personnalités » : deux chiffres (2ᵉ plus silencieux sur 30 ; 10 % parlent surtout d'échanges comme toi), la distribution des sujets de la base en barres avec « toi » dessus, les cinq correspondances les plus fortes avec score sur 100 et la raison en une ligne (Temple Grandin 71, Almodóvar 62, Cumming 59, Giovanni 56, Osmond 49), l'insight (« tu ressembles aux gens qui parlent, pas à ceux qui brillent »), le Comment (60/20/20, calendrier à âge égal contre le hasard) et « Ce qu'on ne te dira pas » (1,0 fois le hasard : mesuré, dit). Jennifer n'apparaît plus en tête ; la ligne « Toute la base — route demandée » reste. Vérifié par Playwright, 0 erreur.

**B19 — la promesse, vérifiée point par point (état de l'art).** Demande de Christophe : si la promesse décrite dans le message à Marie-Ange n'est pas tenue, améliorer jusqu'à ce qu'elle le soit. Audit du prototype contre le message : Aujourd'hui (silence + trois horizons) ✓ ; Ton ID astral six écrans, trois parties interactives, reconnaissance qui règle le poids, décor, chapitre, fenêtre, reprise avec les gestes ✓ ; Quoi faire (quand · quoi · comment · pourquoi, rappel, calendrier) ✓ ; textes marqués « calculé » / « traduit par IA », aucun chiffre inventé ✓ ; Comparer sur 30 vies mesurées, rang de silence, correspondances, « ce qu'on ne te dira pas » ✓ ; invitation et page Vous deux ✓. Deux trous trouvés et corrigés : le **thème clair** n'avait jamais été regardé (il tient : jetons clairs du dépôt) ; sur un **vrai téléphone** le cadre 390 × 844 débordait — le prototype prend maintenant tout l'écran sous 520 px de large ou 900 px de haut, balise viewport ajoutée. Vérifié à 375 × 667 et 390 × 844, clair et sombre. Message pour Marie-Ange publié en page partageable, avec le brief « c'est un artefact, regarde le fond, pas l'intégration ».

**B20 — des visages et du réel, pas des pourcentages (02/09, nuit).** Retour de Christophe : « toi-même 23 % » ne se raccroche à rien ; il faut les têtes des personnalités, et une étape qui explique ce qui se passe avant le résultat. Fait : (1) **une étape d'explication** à l'ouverture de Comparer — « tu ne te compares pas à quelqu'un que tu connais, tu te compares à des vies » : quelle base (naissance à la minute, faits datés), pourquoi elle, ce qu'on mesure, ce qu'on va voir, puis « Voir où je me situe » ; (2) **le résultat en familles** : « tu es de la famille de ceux qui parlent » avec les trois visages (Grandin, Almodóvar, toi), puis les neuf autres familles avec leurs visages et leurs noms (ceux qui parlent d'eux-mêmes : Hawking, Winfrey, Moore, Schiffer, Jackson… ; les créateurs ; l'argent ; le partagé ; la santé ; la carrière ; les idées ; le retrait ; le foyer) ; (3) **la rareté** en 30 barres, une par vie, du plus silencieux au plus bavard, avec des repères réels (« moins qu'à Claudia Schiffer 4,2 %, Demi Moore 4,6 %, Michael Jackson 5,2 %, trois fois moins qu'à Stephen Hawking 12,3 % ») ; (4) **les visages qui te ressemblent** (cinq, avec score et raison) ; (5) **ce qu'ils ont fait d'une fenêtre comme la tienne** : Donny Osmond, 13 ans, janvier 1971 — le seul fait daté au jour dans ces 30 vies, et on le dit. Portraits : vignettes Wikimedia 112 px embarquées (crédits dans `donnees/visages-credits-wikimedia.json`) — à remplacer par les images de la base ou par des portraits licenciés avant toute mise en production. Le nombre 3,7 % (Brad, calcul validé) est gardé ; la chaîne du soir donne 4,2 % — même rang.

**B21 — le texte réécrit selon l'audit (03/09).** Voir `AUDIT-ARTEFACT.md`. Passage systématique sur les cinq défauts : (1) plus aucun mot du moteur à l'écran — « technique », « transit », « chapitre », « décor », « pivot », « 16/16 », « ++ », « variance », « Saturne », « Mars » ont disparu ; « fenêtre » est défini à sa première apparition (« deux calculs indépendants disent la même chose au même moment ») et devient « moment fort » partout ailleurs ; (2) plus de chiffres de machine — 1 819 périodes, 60/20/20, « 1,0 fois le hasard » retirés ; reste ce qui change quelque chose (16 jours, 2ᵉ sur 30, 3 vies sur 30, 3,6 %) ; (3) plus d'interprétation au-delà de la donnée — « cher payé », « Mars, l'action », « ne rien signer ni déménager », « ceux qui brillent » retirés ; l'impact de décembre 2029 devient « dis ce qui doit être dit à un proche, attends la fin des deux semaines pour trancher » ; (4) le silence dit deux fois au lieu de six ; (5) Aujourd'hui devient une veille : « on veille, la prochaine date qui compte est le 18 septembre », « on te prévient trente jours avant ». Aussi : l'intro de Comparer ramenée à deux blocs ; « ta famille » reformulée (« ta vie tourne autour des échanges et de tes proches ») ; les raisons des visages en français courant ; les années 1997 / 2029 ne comptent plus depuis 1963 ; la date d'alerte du 8 novembre retirée de la liste de l'utilisateur. Texte affiché complet dans `donnees/textes-prototype-b21.md`. Vérifié par Playwright, 0 erreur.

**B22 — un mode remarques dans le prototype (03/09).** Les commentaires d'artefact n'apparaissent pas dans la page de Christophe, et la base de données d'artefact interdirait le partage public (donc Marie-Ange). Solution sans serveur : un bouton ✎ en bas à gauche ; en mode remarques, on touche n'importe quel texte, une boîte s'ouvre avec le passage cité, on écrit, on enregistre. Un second appui sur ✎ ouvre la liste : chaque remarque avec l'écran et le passage cité, un bouton « Tout copier » qui met le tout au presse-papiers, prêt à coller dans la conversation. Tout reste dans le navigateur de l'appareil ; rien n'est envoyé. La navigation (onglets, précédent/suivant, fermer, gestes) reste libre en mode remarques. Testé par Playwright : deux remarques, export correct, 0 erreur.

**B23 — les remarques arrivent en direct (03/09).** Objectif de Christophe : traitement en temps réel. La page déclare la capacité `artifact` : à chaque remarque enregistrée, elle publie une nouvelle version d'elle-même avec la remarque embarquée dans un bloc JSON (`<script type="application/json" id="remarques">`), ce qui réveille la session de Claude (abonnement au republiage). Claude lit la page publiée, traite, et republie avec sa réponse dans le même bloc : la liste des remarques affiche « envoyée à Claude » puis « traitée » avec la réponse. Robustesse : les remarques restent en local tant qu'elles ne sont pas parties ; un conflit de publication recharge la page et les remarques locales repartent ; un lecteur sans droit d'écriture (Marie-Ange) garde « Tout copier ». Piège corrigé : la chaîne `</script>` dans le JS terminait la balise — échappée en `<\/script>`.

**B24 — première remarque en direct, traitée (03/09 13:08).** La boucle fonctionne : remarque écrite dans la page → page republiée par elle-même → session réveillée → réponse republiée dans la liste. Remarque : « comment on obtient ça ? qu'est-ce que ça apporte comme insight ? » sur les faits de l'écran 1. Réponse : les années sont calculées (années fortes, bascules), les faits sont posés par l'utilisateur (ici la vie publique de Brad) ; l'insight est la vérification (bascule calculée déc. 2004 ↔ séparation janv. 2005) et l'apprentissage. Écran 1 corrigé : titre « Tes années fortes, et ce que tu y as vécu », marqueurs « année forte » / « bascule calculée » devant chaque date, phrase « D'où ça vient / À quoi ça sert » sous la liste, et « quand la bascule de 2028 sera passée, on te demandera ce qui a changé ».

**B25 — remarque 2 (13:16) traitée en direct.** « Concrètement, est-ce que l'utilisateur va comprendre ce que ça lui apporte ? » sur le texte de la partie « expression ». Réponse : non, c'était une description, pas une clé. Les trois parties disent maintenant « ce que ça change pour toi » : fondations — « tes années les plus visibles ont été payées cher, et c'était dans la carte » ; expression — « à 2 ans et 3 mois de la bascule, c'est le moment de finir, pas d'ouvrir » ; culmination — « ce que tu finis maintenant, c'est là qu'il portera ; une date à retenir : décembre 2028 ».

**B26 — remarque 3 (13:19) et la dictée vocale.** « Comment on sait que l'utilisateur a fait un film ? » On ne le sait pas : les faits sont des souvenirs ajoutés par l'utilisateur, pas des calculs ; en démo, ce sont les faits publics de Brad tirés de la base. Rendu explicite : chaque ligne porte « souvenir · démo », la date porte « année forte » ou « bascule calculée », une phrase au-dessus explique, un bouton « + ajouter un souvenir » montre le geste. Demande de Christophe : commenter à la voix — bouton 🎙 « Dicter » dans la boîte de remarque, reconnaissance vocale du navigateur en français (Chrome, Safari) ; le bouton se cache si le navigateur ne sait pas faire.

**B27 → B29 (03/09, 13:30).** Logo retiré en haut du téléphone (il prenait de la place pour rien). Dictée : le micro est refusé dans le cadre de l'artefact ; le bouton 🎙 affiche maintenant la consigne (dictée du Mac : Fn deux fois ; iPhone : touche 🎤 du clavier). Bouton « + ajouter un souvenir » retiré à la demande de Christophe (« l'utilisateur ne comprend pas ») ; les faits de l'écran 1 restent, marqués « fait · démo », avec la phrase « les années sont calculées ; les faits en face : ceux de Brad, tirés de sa vie publique ».

**B30 — sans les capsules flottantes.** Retirées à la demande de Christophe (« pas esthétique, pas minimaliste »). Le halo qui respire reste.

**B31 — remarque 4 (13:32) : pas d'apprentissage inventé.** Christophe : le moteur de Marie-Ange n'apprend rien de l'utilisateur ; c'est l'app qui donne l'information, pas l'inverse. Retiré partout : « ta carte apprendra », « ce calcul pèse plus / moins », « règle le poids ». Nouvelle règle d'écriture : la réponse de l'utilisateur **ne change aucun calcul** ; elle règle seulement ce qu'on lui montre en premier. Bascule : « quand elle sera passée, on te dira ce qui change dans ta carte ». Écran 2 et Vous deux alignés. Les « ce que ça t'apprend » (moteur → utilisateur) restent.
