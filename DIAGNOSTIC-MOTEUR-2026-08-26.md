# Pourquoi le site sert une fausse lecture a 100 % des visiteurs

Mesure faite le 26 aout 2026, en appelant l API de Marie-Ange directement,
depuis le navigateur, sur son propre domaine (donc sans CORS, sans proxy).

## Le fait

`app/api/landing/signal/route.ts` ligne 29 accorde **25 secondes** au moteur
(`TOCTOC_TIMEOUT_MS = 25_000`) et appelle, ligne 319, `toctoc-app-short.php`.

Chronometrage reel des trois points d entree, memes donnees de naissance
(1985-06-15, 14:30, Bruxelles) :

| Point d entree | Duree | Taille | Statut |
|---|---|---|---|
| `toctoc-app.php` | **53 620 ms** | 18 467 718 octets | 200, donnee reelle |
| `toctoc-app-short.php` (celui qu on appelle) | **43 804 ms** | 641 773 octets | 200, donnee reelle |
| `toctoc-year.php` | **2 324 ms** | 25 997 octets | 200, donnee reelle |

Le moteur **n est pas en panne**. Il repond correctement, a chaque fois.
Il est simplement **1,75 fois plus lent que le delai qu on lui accorde**.

Consequence : le `fetchWithTimeout` echoue **systematiquement**, on tombe dans le
`catch` ligne 337, et on renvoie `503 { error: "toctoc_unavailable", fallback: "mock" }`.
Le client suit l instruction et affiche une lecture **fabriquee**, sans rien dire,
sous une phrase qui promet le contraire.

Ce n est pas intermittent. C est deterministe. **Tous les visiteurs, toujours.**

## Ce qu il faut faire

1. **Ne jamais fabriquer.** Supprimer les trois chemins de repli de
   `components/landing/Hero.tsx` (lignes ~108-113, ~144-145, ~180-181) et afficher
   un message honnete. C est vrai independamment du reste.

2. **Changer de point d entree.** `toctoc-year.php` repond en **2,4 secondes** et
   renvoie deja ce que la landing affiche :
   `currentMonth` (le signal du jour), `peakUpcomingMonths` (la prochaine fenetre),
   `years` et `months` (l historique). Cles completes de `data` :
   `success, person, window, fortuneInfo, currentMonth, peakUpcomingMonths, years, months, computeTimeSeconds`.
   Ce n est pas un echange d une ligne : la forme differe de `boudins`, il faut
   ecrire la correspondance. Mais c est 19 fois plus rapide que le budget actuel.

3. **Mettre en cache par donnee de naissance.** Un thème natal ne change pas.
   Recalculer 641 Ko (ou 18 Mo) a chaque visite est intenable pour le serveur de
   Marie-Ange comme pour la facture.

4. **Poser `maxDuration`** sur les routes qui appellent le moteur. Le projet n en
   declare aucune (`grep maxDuration` = 0 resultat), donc le plafond par defaut de
   Vercel s applique et personne ne l a choisi.

## Ce qu il ne faut pas conclure

Le moteur de Marie-Ange fonctionne. Le defaut est entierement du cote du site.
