# Decisions prises

Une decision qui vit dans une conversation n existe pas. Celles-ci sont actees.
Chacune porte sa raison : sans la raison, on la rouvre tous les trois mois.

## 02/09/2026 — le modele economique

**Abonnement annuel, plan unique, sans essai. Prix a fixer par Christophe.**
Decision verrouillee le 02/09 apres le master plan ; elle REMPLACE l achat
unique envisage le meme jour.

- Ce que le benchmark (RevenueCat, Adapty) a tranche et qui n a pas bouge :
  pas d essai gratuit (LTV -21,2 % en Lifestyle), mur dur et non freemium
  (10,7 % contre 2,1 %), plan unique sans bascule, prix haut (2,8 % contre 1,4 %).
- Ce que le benchmark n a jamais tranche : abonnement contre achat unique. Ses
  donnees portent sur des apps a abonnement ; un achat unique n y figure pas.
  L argument qui a fait pencher : Apple 3.1.2(a) exige une « ongoing value »,
  et `profection_year_change` en fournit une CALCULEE — une nouvelle maison
  profectee chaque annee — sans rien promettre que la mesure du faux positif
  interdit.
- Le mensuel est retire de l offre ; les LTV avancees pour le justifier
  (10,33 / 53,32 EUR) etaient fausses et sont abandonnees.

**Faiblesse connue :** aucun revenu tant que les produits iOS ne sont pas
crees dans App Store Connect (defaut C17) — geste de Christophe, pas du code.

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

**Faiblesse connue, 02/09 :** le CI (.github/workflows/apps.yml) lance les
controles statiques et `next build`, jamais les 23 parcours Playwright. Ils ne
tournent que localement, par `npm run avant-build`. A ajouter au CI quand un
executeur avec navigateurs sera decide.
