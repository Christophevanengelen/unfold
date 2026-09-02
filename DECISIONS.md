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
