# Decisions prises

Une decision qui vit dans une conversation n existe pas. Celles-ci sont actees.
Chacune porte sa raison : sans la raison, on la rouvre tous les trois mois.

## 02/09/2026 — le modele economique

**Achat unique. Pas d abonnement. 24,99 EUR.**

- Un rapport se vend une fois : c est un objet, pas un service.
- En Lifestyle, le renouvellement est le pire de toutes les categories
  (25 % annuel, 42 % mensuel) et l essai gratuit detruit la LTV (-21,2 %).
- Apple 3.1.2(a) exige une « ongoing value » pour un abonnement. Apres la
  mesure du 02/09 (MESURE-FAUX-POSITIF.md), on ne peut rien promettre
  quotidiennement qui soit a la fois vrai et vendable. Un abonnement serait
  donc soit malhonnete, soit refuse.
- Prix haut assume : 2,8 % de conversion contre 1,4 % pour un prix bas. Un prix
  bas signale un produit sans valeur.

**Faiblesse connue, non masquee :** aucun revenu recurrent. La croissance
dependra eternellement de nouveaux utilisateurs. C est le vrai trou de la
strategie. Il est prefere a un abonnement qu on ne saurait pas honorer.

## 02/09/2026 — ou se place le mur payant

**Juste apres la revelation du passe.**

La personne voit ses vraies periodes passees, elle les reconnait ou non, et
c est a cet instant precis qu on demande. On ne vend pas une promesse : on vend
la suite d une chose deja verifiee par le lecteur lui-meme.

Mur dur, pas de version gratuite degradee : 10,7 % de conversion contre 2,1 %.

## 02/09/2026 — les coupons

**Oui, mais nominatifs.** Presse, entourage de Marie-Ange, premiers testeurs.
Aucune mecanique de reduction publique : une remise publique sur un achat unique
detruit le prix de reference, et definitivement.

## Ce qui n est PAS a nous

**Societe ou nom propre — a Christophe.** Engage son adresse personnelle
publiee (statut professionnel DSA), son exposition juridique, sa situation
fiscale. Recommandation ferme : societe, et Zebrapad existe deja, ce qui rend la
question surtout comptable entre Marie-Ange et lui. Mais c est lui qui signe.

**Le mot de passe Postgres — a Marie-Ange.** Corrige le 02/09 : la variable est
`ASTROLEARN_DATABASE_URL`, donc la base d AstroLearn, la sienne. Il avait ete
liste par erreur comme une decision de Christophe. Le mot de passe a ete trouve
en clair dans un depot public (trois occurrences, retirees), il doit etre
considere comme compromis, et l effacer du code ne l efface pas de l historique
git. Le geste lui revient, sur son serveur.

## 02/09/2026 — les domaines de vie

**L app s adapte a la donnee, pas l inverse.** Decision de Christophe, le 02/09
vers 7h. Verification faite dans le code juste apres : c est DEJA le cas.

- La fiche d une capsule (CapsuleDetailSheet) affiche la maison calculee par
  le moteur, parmi les douze, en mots (houseConfig + maisons-i18n). C est le
  vocabulaire que Christophe voit. Depuis les corrections C5/C6, c est la bonne
  maison qui s y affiche (avant : fausse 3 fois sur 4 pour le ZR).
- Les trois domaines — amour, sante, travail — n existent que pour les trois
  scores satellites (SatelliteScores) et les compteurs d occurrence de la
  frise. C est un resume dessine par Christophe, pas une reduction de la
  donnee : la donnee complete reste sur chaque phase. Depuis la correction
  C2, ce rangement suit la maison calculee (avant : tout tombait dans travail).
- **Rien a migrer, rien a restructurer.** Le mot « migration », employe a
  tort ce matin, est retire. Toute evolution des trois cartes satellites est
  une decision de design de Christophe, quand il le voudra.

**Origine des trois domaines, verifiee le 02/09 :** l onboarding imposait trois
priorites jusqu au 31 aout 2026 (StepPriorities.tsx:7). Depuis, le choix est
libre. Les trois cartes de resume (SatelliteScores) ne sont montees que dans
StepHabit, etape morte ; domainConfig est marque @deprecated. Les trois
domaines sont un vestige. Ce qui les utilise encore a l ecran est a ameliorer
dans le sens de la donnee — inventaire dans le journal de session.
