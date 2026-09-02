# Pour Marie-Ange — questions sur le moteur, avec les mesures

Christophe te transmet ceci. Rien ici n est un reproche : le moteur calcule
juste, et tout ce qui suit a ete mesure sur ses reponses reelles le
02/09/2026. Chaque point est ecrit pour etre repondu en une fois, sans
aller-retour. Les numeros renvoient au master plan du depot (MASTER-PLAN.md §6).

## Ce qui bloque le rapport

**Q1 — `/api/period-quality` repond 500 sur date + heure + lieu.**
Corps exact : `{"success":false,"error":"Output file not created: D:\\51.full-suite-api\\output\\calc_...json"}`.
La route existe et le calculateur se lance, mais aucun fichier de sortie n est
produit. C est le seul point d entree qui rend le rapport deja redige
(`lifeParts`, `chapters[].houseTopic`, `currentBackground`, `counselingNote`).
Cote corpus (`app.astrolearn.io/api/astrolearn/public/period-quality?personId=`)
la meme technique repond. Peux-tu la remettre en service cote moteur ?

**Nouvelle porte, sans toucher au calcul — et par ou commencer.** Mesure
faite sur les seize techniques (MOTEUR-SURFACE.md §5) : la prose deja
redigee, celle qu un humain lambda peut lire, est concentree dans six routes.
Si tu ouvres la porte naissance sur celles-la d abord, on a de quoi remplacer
Astronum avec plus, pas moins : `numerology` (494 textes, en francais),
`aspect-archetypes` (275), `planetary-periods` (145), `solar-return-timeline`
(141), `period-quality` (80 — celle qui repond 500 cote moteur),
`circumambulation` (44).

 Les seize techniques d AstroLearn
(`/api/astrolearn/public/*`) sont indexees par `personId`. Le calcul dessous
part de la naissance. Accepter `birthDate/birthTime/latitude/longitude/timezone`
en alternative a `personId` sur ces routes ouvrirait tout le moteur a l app,
sans rien recalculer ni changer de contrat.

## Ce que j ai tranche moi-meme par mesure (pour information)

**Q8 — `boudinId` n est PAS stable entre points d entree.** `tt_15` designe
« South Node conjunct natal Jupiter, 2025-02-11 » dans `toctoc-year` ;
`toctoc-boudin-detail` repond `{"error":"Boudin not found: tt_15",
"availableIds":["tt_80","tt_251",...],"totalSausages":1870}`. Question qui
reste : quelle clef designe un boudin de facon stable d un point d entree a
l autre (groupId ? un identifiant de periode ?), pour ouvrir le detail du bon
evenement des le paquet annuel ?

**Q6 — `connection-brief` : precise.** `personAFocus` est identique bit pour bit
pour A face a deux B differents, sur 3 mois. `sharedTheme` est un gabarit
(« "Carriere" pour l un et "Communication" pour l autre — une
complementarite ») ; `tierScore`, `sharedInsight` et `actionTogether` changent.
Autrement dit : deux lectures solo reliees par une phrase, pas un calcul entre
les deux themes. Est-ce voulu ? Un vrai calcul de couple est-il disponible ou
envisageable (aspects entre les deux themes, `periodHousePlacement` pour les
deux, convergence entre eux) ? Sans cela, le matching ne sera pas vendu.

**Q2 — Pour une éclipse, quelle maison compte : celle de `natalPoint` ou celle du degré (`eclipseSign`/`eclipseLongitude`) ? Mesuré : `tc` d'une éclipse contient uniquement les maisons régies par `natalPoint`, 216/216, et la maison occupée en est exclue 159/159. Pour un transit, `topics` contient la maison occupée. Est-ce voulu ?**
_Mesure jointe : 216/216, 159/159_

**Q3 — `toctoc-app-short` peut-il rendre les profections annuelles sur la vie entière, comme `toctoc-year` le fait sur 3 ans ? C'est la seule technique de classe vraiment différente disponible à coût nul ; sans elle, toute convergence viagère repose sur le ZR.**
_Mesure jointe : app-short rend 4 catégories : zr 884, transit 833, eclipse 216, station 89_

**Q4 — `convergence.overlappingEvents` compte-t-il volontairement L2 et L3 d'un même lot comme deux (`tt_895` + `tt_896` dans la même réponse) ? Et `sameHouseEvents` applique-t-il déjà un rabattement ? Existe-t-il un point d'entrée rendant `convergence` pour une liste de boudins en un appel ?**
_Mesure jointe : `overlappingEvents: 9`, `sameHouseEvents: 1` sur `tt_78_h1`_

**Q5 — Temps de réponse. `toctoc-boudin-detail` 49,9 s et 57,3 s ; `toctoc-highlights` 48,4 s et 45,2 s ; `toctoc-app-short` 66,8 s ; `toctoc-year` 1,3 s de calcul. Est-ce le régime attendu, ou un mode dégradé ? Un mode « détail sans recalcul » est-il possible ?**
_Mesure jointe : 6 appels chronométrés, 02/09_

**Q7 — Trois champs de `connection-brief` sans définition : `primarySignal.score` vaut 4 pour tout ZR (44/66) et 3 sinon — rang ou intensité ? `category: "unknown"` (3/66) ? `monthScore.transit` négatif (−8, −23, −34, −64) — que signifie le signe ?**
_Mesure jointe : 66 blocs_

**Q9 — `data.houseColors` est-il natal ou fixe ? 12 couleurs reçues sur un seul thème, elles ressemblent à une palette fixe.**
_Mesure jointe : 1 thème_

## Un geste, cote serveur

Le mot de passe Postgres d AstroLearn (`ASTROLEARN_DATABASE_URL`) a ete trouve
en clair a trois endroits d un depot public. Les trois occurrences sont
retirees, mais l historique git le garde : il est a considerer comme compromis
et a changer sur ton serveur.

## Ce que l app sait deja faire avec tes donnees, depuis aujourd hui

- lire la maison calculee (`periodHousePlacement`) au lieu de la deviner ;
- lire les vraies dates (`startDate/endDate`, `windowStart/windowEnd`) au lieu
  d arrondir au mois ;
- faire voter les 1 758 boudins d une vie (regle de silence : 101 fenetres
  d accord sur cent ans, 5,1 % du temps) ;
- charger `toctoc-highlights` (plus grande annee, annees fortes, annees dures).

Merci — Christophe et Claude.
