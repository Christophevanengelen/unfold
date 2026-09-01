---
name: favorable-design
description: "Le langage visuel de Favorable et les regles qui le tiennent. A lire AVANT de toucher a une couleur, un contour, une ombre, un voile, un z-index ou un jeton de app/globals.css. A lire aussi des que Christophe dit que quelque chose est surcharge, moche, downgrade, ou qu un bouton est cache."
---

# Le design de Favorable

Christophe est designer de service et d interface, vingt ans de metier. Le
langage visuel est le sien. Il n est pas a redecouvrir a chaque session, et il
ne se derive pas d un chiffre.

## La regle qui prime sur toutes les autres

**Aucun controle automatique ne dicte le design.**

Un script mesure. Il ne decide pas. Quand un chiffre ne passe pas, la reponse
est de corriger LA PROPRIETE MESUREE — la couleur du texte — jamais d ajouter
une couche pour compenser.

### Ce que ca a coute le 1er septembre 2026

`scripts/verifier-contraste.mjs` appliquait un seuil unique de 4,5 a tout, y
compris au libelle d une pastille flottante. Pour l atteindre, ajoute dans
l ordre, sur quatre commits :

1. la pastille de verre teinte remplacee par du blanc franc
2. `--glass-border` pousse de 22 % a 90 % de violet
3. une ombre portee par-dessus
4. un voile degrade de 96 px au niveau du panneau

Verdict de Christophe : « on est passe de minimaliste a surcharge », « des
strokes DEGEULASSE », « la honte ».

La correction tenait en une ligne : le libelle passe de `--accent-purple` a
`--text-brand`. Meme teinte, plus sombre. Le fond de la pastille etant fait
d accent-purple a 16 %, texte et fond convergeaient par construction.

**Le motif a reconnaitre :** si une correction de contraste te fait toucher a
autre chose qu une couleur de texte, tu es en train d abimer le design.

## Les seuils, et leur perimetre

    TEXTE ................. 4,5
    GROS TEXTE ............ 3,0   (>= 24 px, ou >= 19 px en gras)
    CONTROLE / ICONE ...... 3,0   contre son fond, composant ENTIER
    DECOR, ETAT INACTIF ... aucun seuil

Pour un controle, les 3:1 se lisent sur le composant complet — sa matiere, sa
teinte, son elevation — **jamais sur l epaisseur d un trait**. Un lisere qui
n est pas necessaire pour identifier le composant est du decor : il n a aucun
seuil a respecter, et le grossir pour « faire passer » un chiffre est une
faute.

`verifier-contraste.mjs` ne mesure QUE du texte. Il n a pas d avis sur le reste.

## La matiere

Le produit est minimaliste. Ce qui detache un element flottant est sa
**matiere** et son **elevation**, jamais un cerne.

- Verre teinte translucide, liseré discret. Jamais d aplat blanc franc.
- Pas d ombre ajoutee « pour aider » : elle fait une couche de plus.
- **Jamais deux couches de verre superposees.** Apple appelle ca
  « stacked glass layers » et le deconseille pour la meme raison.

Les jetons de verre vivent dans `app/globals.css` :
`--glass-bg`, `--glass-border`, `--glass-pill`, `--glass-pill-strong`.
Leurs valeurs sont un choix de design. On ne les bouge pas pour satisfaire un
script.

## Les calques

Le z-index ne se compare **qu entre freres d un meme contexte d empilement**.
Un `z-30` imbrique ne passera jamais au-dessus d un `z-10` parent.

Cette faute s est produite ici : le voile bas etait au niveau du panneau
(z-10), les boutons flottants a l interieur des vues (z-30). Le voile passait
donc par-dessus les boutons, qui apparaissaient a moitie effaces.

**La regle :** un voile et les elements qu il doit laisser passer vivent dans
le MEME conteneur. Voir `VoileBas` dans `components/demo/MomentumTimelineV2.tsx` :

    contenu defilant (auto)  <  voile (z-20)  <  boutons (z-30)

Duplique dans les deux vues plutot que factorise plus haut, exactement pour
cette raison. Si tu es tente de le remonter d un cran, relis ce paragraphe.

## Quand Christophe dit qu un changement est un downgrade

Il ne discute pas d un chiffre, il constate un resultat. La bonne reponse :

1. Retrouver l etat d avant — `git log -L` sur la ligne fautive donne le
   commit qui l a introduite, et `git show <commit>:<fichier>` l etat d avant.
2. Y revenir integralement. Pas « ajuster », pas « adoucir ».
3. Reprendre le probleme d origine avec la correction la plus petite possible.
4. Verifier A L ECRAN, pas sur le papier.

## Verifier a l ecran

Le serveur de dev tourne sur le port 3333.

    node_modules/.bin/next dev --port 3333

Puis le navigateur, en 375x812, thème clair ET sombre. Pour peupler la timeline
sans repasser l onboarding :

    localStorage.setItem("unfold_birth_data", JSON.stringify({
      nickname:"Test", birthDate:"1985-04-12", birthTime:"08:30",
      latitude:50.8503, longitude:4.3517,
      timezone:"Europe/Brussels", placeOfBirth:"Bruxelles, Belgique"}));
    localStorage.setItem("unfold_timeline_welcomed","true");
    localStorage.setItem("unfold_first_use_done","1");

Le moteur met 30 a 120 secondes a repondre. C est normal, ne pas conclure a une
panne avant deux minutes.

**Une correction visuelle non regardee n est pas une correction.** Le
1er septembre, une journee entiere de raisonnement sur des rapports de
contraste a produit un downgrade que dix minutes de navigateur auraient evite.
