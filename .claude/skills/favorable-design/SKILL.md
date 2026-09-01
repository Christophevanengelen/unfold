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

---

# La passe minimaliste

Une procedure, pas un principe. A rejouer telle quelle sur un ecran, un
composant, ou le produit entier. Elle a ete etablie le 1er septembre 2026 et
Christophe a valide le resultat : « tres propre ta passe minimaliste, t as
reussi ».

## La doctrine, en une phrase

**Un contour est un aveu.** Il dit qu on n a pas su faire tenir l element par sa
matiere. Christophe, mot pour mot :

> « les strokes sont nos ennemis, un bon design minimaliste ne les utilise pas,
>   il gere bien les couleurs des bg et des fonds de cellules »

## Les quatre moyens de separer, dans cet ordre

Quand deux choses doivent se distinguer, on prend le premier moyen qui suffit.
On ne descend au suivant que si le precedent ne suffit pas, et on n en empile
jamais deux.

**1. L ESPACE.** Deux blocs separes par du vide n ont besoin de rien d autre.
C est presque toujours la bonne reponse pour une liste. Un filet entre deux
lignes deja separees par 32 px de vide n ajoute rien qu il faille regarder.

**2. LE FOND.** Une cellule se detache de sa page par une surface d un cran
differente : plus claire en theme sombre, plus foncee en theme clair. C est la
reponse que Christophe decrit, et celle qui vaut pour toutes les cartes,
feuilles, cellules et panneaux.

**3. L ELEVATION.** Une ombre, et seulement pour ce qui FLOTTE reellement
au-dessus du contenu : un bouton flottant, une feuille, un menu. Deux couches —
une courte et dense qui pose le bord, une longue et douce qui donne la hauteur.
Jamais d ombre sur ce qui ne flotte pas.

**4. LE CONTOUR.** En dernier recours, et seulement dans trois cas :
   - un champ de saisie VIDE — le contour dit ou taper, sans lui le champ
     n existe pas pour la personne ;
   - l anneau de `:focus-visible` — c est de l accessibilite, il ne s affiche
     qu au clavier ;
   - un lisere deja present dans le design d origine, qu on ne renforce pas.

## La procedure

1. **Inventorier.** `grep -rn --include='*.tsx' -E "border: ?\"?1(\.5)?px solid"`
   sur le perimetre. Compter avant de commencer.

2. **Pour chaque contour, choisir son remplacant** dans la liste ci-dessus. Un
   contour retire doit etre REMPLACE, jamais seulement supprime. Une carte sans
   contour et sans fond distinct disparait dans la page.

3. **Ne creer un jeton de fond que s il n en existe pas deja un.** Regarder
   `--bg-secondary`, `--bg-tertiary`, `--surface-*`, `--glass-*` AVANT d en
   ajouter. Si un fond intermediaire manque, le deriver des jetons existants par
   `color-mix`, jamais choisir une nouvelle couleur.

4. **Regarder a l ecran, dans les deux themes.** Si un element devient
   indistinguable de son fond, la passe a echoue sur cet element : on
   recommence, on ne remet pas le contour.

5. **Verifier** : `npx tsc --noEmit`, puis `npm run verifier`.

## Les deux erreurs symetriques

Elles ont ete commises toutes les deux dans la meme journee.

**Ajouter pour sauver.** Un bouton flottant est devenu illisible ; au lieu de
revenir en arriere, j ai ajoute un cerne a 90 % de violet, puis une ombre, puis
un voile degrade de 96 px. Quatre couches pour un probleme de couleur de texte.
Verdict : « on est passe de minimaliste a surcharge », « la honte ».

**Retirer sans remplacer.** L erreur inverse : effacer tous les contours et
rendre l interface plate, ou chaque carte se noie dans la page.

Entre les deux, la question a se poser sur chaque element est toujours la meme :
**qu est-ce qui, dans la MATIERE de cet element, le detache deja ?** Si la
reponse est « rien », c est le fond qu il faut regler, pas un trait a ajouter
autour.

## Ce qui ne se discute pas

- **Aucune valeur de couleur decidee ne change.** Nommer n est pas redecider.
- **Aucun rayon, aucun espacement, aucune taille** ne bouge pendant une passe de
  contours. Un chantier a la fois.
- **Le seuil de 3:1 d un controle** se lit sur le composant ENTIER — matiere,
  teinte, elevation comprises — jamais sur l epaisseur d un trait. Voir la
  section sur les seuils plus haut.
