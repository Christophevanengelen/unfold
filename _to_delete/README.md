# _to_delete

Fichiers retires du produit mais conserves ici. On ne supprime jamais sur ce projet.

## lib/landing-mock.ts

Ce module fabriquait un faux signal (`buildMockRealSignal`) que la landing
affichait quand le moteur d ephemerides ne repondait pas dans le delai imparti.
Mesure du 26 aout 2026 : ce delai expirait a chaque fois, donc tous les visiteurs
recevaient une lecture inventee, sous une phrase qui promettait un calcul reel.

La landing dit maintenant honnetement qu elle ne peut pas calculer. Plus personne
n importe ce module. Conserve ici tant que Christophe n a pas confirme.
