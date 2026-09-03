# Audit du prototype — ce que l'utilisateur lit (brouillon 20, 3 septembre 2026)

Méthode : extraction du texte réellement affiché, écran par écran et fiche par fiche (3 630 mots). Trois notes sur 5 : **P** pertinent (ça le concerne, maintenant), **U** utile (il sait quoi en faire), **C** clair (un non-initié comprend du premier coup). Verdict, puis la correction.

| Partie | P | U | C | Verdict |
|---|---|---|---|---|
| Aujourd'hui (écran) | 5 | 4 | 3 | La bonne réponse, mais « fenêtre d'accord », « techniques », « décor de fond », « 2 techniques » sont du jargon dès la première phrase. |
| Aujourd'hui · Quoi faire | 4 | 3 | 3 | « Puis on se tait jusqu'au 8 novembre 2029 » : trois ans de silence annoncés, ça se lit « l'app ne sert à rien ». « 1 819 périodes » : chiffre machine, inutile. |
| Comparer · intro | 5 | 4 | 3 | Bonne idée, trop long : quatre blocs avant le résultat. « Seule, ta carte ne dit rien de rare ou de banal » et « on compare au hasard » sont abstraits avant d'avoir vu quoi que ce soit. |
| Comparer · résultat (familles, rareté, visages) | 5 | 4 | 2 | Le plus fort et le moins clair. « Ceux qui parlent » se lit « les bavards ». « 74 % de sujets en commun », « même sujet au même âge », « 60 % du score », « 1,0 fois le hasard » : langage de statisticien. Familles « ce qui est partagé, hérité », « le retrait » : incompréhensibles. |
| Comparer · cercle 2 (toi) | 3 | 3 | 3 | Redit le silence déjà dit trois fois. À fondre dans la rareté. |
| Comparer · cercle 3 (inviter) | 5 | 5 | 4 | Clair. Une phrase de trop (« Un astrologue te montre… ») déjà lue plus haut. |
| Vous deux | 5 | 4 | 3 | Très bon fond. « Moins que le hasard » encore ; « ça n'a pas de prix, et ça coûte une notification » : mignon, inutile ; « toi sur le quotidien, elle sur elle-même » : obscur ; tableau « puis : retrait / quotidien » : illisible. |
| Écran 1 · trois parties | 4 | 4 | 3 | Le visuel porte. « MITIGÉE » seul est sec ; « année 16/16 », « notée ++ », « Mars, l'action » : jargon. « Exigeant ne veut pas dire vide, ça veut dire cher payé » : interprétation qui n'est pas dans la donnée — hors contrat. |
| Écran 2 · 1997 / 2029 | 4 | 4 | 3 | Les années **comptent depuis 1963** à l'écran (on lit 1992 puis 2019 pendant une seconde) : à supprimer. « Révolutions solaires » fuit dans la réponse. « On choisit mieux quoi te montrer » : abstrait. |
| Écran 3 · décor | 4 | 4 | 3 | « Complexe, à forte variance », « période planétaire, celle de Saturne » : jargon. Le reste est bon (« rien n'est moyen pendant ces onze ans », « décider plus lentement »). |
| Écran 4 · 18 septembre | 5 | 5 | 4 | Le meilleur écran. Un mot à retirer : « marqués pic ». |
| Écran 5 · déc. 2029 | 4 | 4 | 3 | « Transit », « chapitre », « année pivot » dans le visuel. « Ne rien signer ni déménager » n'est pas dans la donnée (le sujet est « échanges, entourage ») — hors contrat. |
| Écran 6 · reprise + 3 dates | 4 | 4 | 4 | Bon. « 8 novembre 2029 — alerte » n'est pas une date pour lui, c'est la nôtre : à retirer de sa liste. |

## Les cinq défauts qui traversent tout

1. **Le jargon interne est devenu le vocabulaire de l'app.** Fenêtre, technique, chapitre, décor, transit, pivot, 16/16, ++, force. Aucun n'est expliqué à sa première apparition. Règle : un mot du moteur n'apparaît jamais à l'écran ; on dit ce que c'est (« un moment où deux calculs indépendants disent la même chose », « une période de ta vie », « une année forte »).
2. **Les chiffres de la machine sont montrés comme des preuves.** 1 819 périodes, 60 %/20 %/20 %, 1,0 fois le hasard, 16/16. Ils rassurent le concepteur, pas l'utilisateur. Règle : un chiffre n'apparaît que s'il change ce que l'utilisateur fait ou comprend (2ᵉ sur 30, 3 vies sur 30, 16 jours : oui ; 1 819 : non).
3. **Des interprétations qui dépassent la donnée.** « Cher payé », « Mars, l'action », « ne rien signer ni déménager », « tu ressembles aux gens qui parlent, pas à ceux qui brillent ». C'est exactement ce que le contrat LLM interdit : reformuler, pas interpréter. À ramener au sujet calculé.
4. **Le silence est répété six fois** (Aujourd'hui, Quoi faire, cercle 2, rareté, écran 5, Comment c'est calculé). Une fois en grand, une fois en preuve (la rareté), et c'est tout.
5. **La promesse du quotidien est fragile.** « Rien à faire… on se tait jusqu'en 2029 » : vrai, mais nu. Aujourd'hui doit dire ce que l'app fait quand même chaque jour : elle veille, elle compte les jours jusqu'au 18, elle prévient trente jours avant. Le silence est une veille, pas une absence.

## Ce qui est déjà bon, à ne pas toucher

L'ordre des écrans ; les visuels (anneau, cases, règle, voies) ; l'écran du 18 septembre ; la rareté en trente barres avec des noms réels ; la page Vous deux dans sa structure ; la reconnaissance et son effet expliqué ; l'étape d'explication avant Comparer (à raccourcir, pas à retirer).

## Réécritures proposées (les principales)

- Aujourd'hui, première phrase : « Rien de marquant aujourd'hui. On ne te parle que quand **deux calculs indépendants disent la même chose au même moment** — et aujourd'hui, ils se taisent. Prochaine date qui compte : le 18 septembre. »
- Quoi faire · aujourd'hui : « Aujourd'hui, rien à décider. **Une chose à régler avant le 18 septembre** : ce qui est en commun avec quelqu'un. On veille ; on te prévient trente jours avant chaque moment fort. »
- Comparer · intro, en deux blocs : « Tu te compares à des vies réelles — des personnalités publiques dont on connaît la naissance à la minute et les faits datés. » / « On regarde trois choses : de quoi parle ta vie, à quel rythme, et si c'est rare. Puis on te montre qui te ressemble. »
- Famille : « **Ta vie tourne autour des échanges et de tes proches.** 3 vies sur 30, avec Temple Grandin et Pedro Almodóvar. »
- Visages : « Temple Grandin — sa vie tourne aussi autour des échanges » ; « Nikki Giovanni — a vécu trois fois la même chose que toi, au même âge ».
- Rareté : garder ; retirer « ce qu'on te dit est rare parce que chez toi, c'est rare ».
- Ce qu'on ne te dira pas : « que vos grands moments tombent aux mêmes âges. On l'a vérifié sur 29 vies : pas plus souvent qu'au hasard. On préfère te le dire. »
- Écran 1, partie 0 : retirer « cher payé » ; garder « notée exigeante par le calcul » + les faits.
- Écran 2 : années sans animation ; « année forte » à la place de « 16/16 » ; réponse : « 2029 sort du même calcul : ta prochaine date gagne en confiance ».
- Écran 5 : « **Dis ce qui doit être dit** à un proche pendant ces deux semaines ; attends qu'elles soient passées pour trancher une décision. »
- Vous deux : « quand l'un parle, l'autre écoute » garder ; retirer « ça n'a pas de prix » ; souvenirs : « juin 1995 — un moment fort pour vous deux, pas sur le même sujet ».

Prochaine étape si Christophe valide : brouillon 21 = ces réécritures, plus un passage systématique sur les cinq défauts (jargon, chiffres machine, interprétations, répétitions, promesse du quotidien).
