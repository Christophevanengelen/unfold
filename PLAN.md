# Plan de reprise — 1er septembre 2026

Écrit après un constat simple : Christophe voyait les défauts avant moi. Je
corrigeais au fil de l'eau, il découvrait les trous un par un. Ce document
existe pour que ça n'arrive plus.

---

## Ce qui n'allait pas dans la méthode

Trois fautes, toutes les miennes.

**Je corrigeais avant d'auditer.** Chaque correction partait d'un symptôme
signalé, jamais d'un état des lieux. Résultat : on ne savait jamais combien il
restait de cas du même type.

**Je vérifiais l'intention, pas le résultat.** Un commit nommé « corrige les
blocs parasites » me suffisait à considérer le point clos. Personne n'avait
regardé l'app.

**Je perdais des fonctionnalités entières sans le voir.** Le sélecteur de thème
existe depuis toujours dans `components/ThemeToggle.tsx`. Il est monté dans
`components/layout/Header.tsx`, un fichier qu'**aucune page n'importe**. La
fonctionnalité est là, écrite, testable — et invisible. Rien dans le dépôt ne
signalait sa disparition.

---

## La méthode, maintenant

Pour chaque domaine, trois temps, dans cet ordre, sans en sauter :

### 1. Auditer

Un agent en lecture seule parcourt le domaine et rend une liste de constats
avec `fichier:ligne`. Il doit dire ce qu'il a **vérifié** et ce qu'il
**suppose** — la confusion des deux est ce qui m'a fait affirmer trois fois des
choses fausses.

### 2. Corriger

Un domaine à la fois. On ne passe pas au suivant tant que le précédent n'est
pas bouclé. Pas de correction opportuniste en chemin : ce qu'on trouve ailleurs
va dans le registre, pas dans le commit en cours.

### 3. Verrouiller

Toute correction qui peut se défaire silencieusement reçoit un contrôle
automatique dans `npm run verifier`. Le contrôle doit être **testé en cassant
volontairement le code** — sinon on ne sait pas s'il mord.

Cette règle a déjà servi aujourd'hui :

- Les clés de traduction : contrôle testé avec `perso("phase.stbale")`, attrapé.
- Le contraste des domaines : contrôle testé en remettant la couleur illisible,
  tombé à 1,92, échec déclenché.

---

## Les domaines, dans l'ordre

L'ordre suit une règle : **ce qui trompe la personne d'abord, ce qui la gêne
ensuite, ce qui nous gêne en dernier.**

### 1. Thème clair / sombre

*Ce qu'on sait déjà :* `next-themes` fonctionne et suit le système. Les jetons
existent pour les deux thèmes. Mais le seul sélecteur du produit est monté dans
un en-tête mort — **on ne peut pas choisir son thème dans l'app**. Et
`capacitor.config` fixe un fond `#1B1535` en dur, sombre, quel que soit le thème.

*À verrouiller :* un contrôle qui échoue si un composant d'interface utilise une
couleur qui ne suit pas le thème.

### 2. Notifications

*Ce qu'on sait déjà :* zéro jeton, zéro bascule, alors que l'app est utilisée.
Quatre événements de mesure viennent d'être posés pour distinguer « personne n'a
demandé » de « tout le monde échoue ».

*À verrouiller :* un contrôle de bout en bout de la chaîne — permission, jeton,
bascule, cron.

### 3. Onboarding

*Ce qu'on sait déjà :* le bloc du bouton vaut `mt-auto pt-6` sur trois écrans et
`pt-6` sur `StepPersonalize`. Le bouton saute donc d'une étape à l'autre.

*À verrouiller :* un contrôle de la cohérence de mise en page entre les onze
écrans.

### 4. Timeline et transitions

*Ce qu'on sait déjà :* les blocs parasites au changement de vue ont un commit,
mais personne n'a vérifié le résultat.

### 5. Code mort

*Ce qu'on sait déjà :* un en-tête entier non importé, une route `/unlock`
orpheline, un écran mensuel au contenu fabriqué.

*À verrouiller :* un contrôle qui signale tout composant d'interface non importé.
C'est celui-ci qui aurait attrapé le sélecteur de thème.

### 6. Saisie du lieu de naissance

*Ce qu'on sait déjà :* « très dur à utiliser » (Christophe, 01/09). Champ
obligatoire, en tête du parcours, au doigt sur iPhone — donc l'un des premiers
gestes de quelqu'un qui découvre le produit. Audit en cours contre le motif
ARIA « combobox » et les règles de touche d'Apple.

### 7. Modification du profil

*Ce qu'on sait déjà :* changer sa date de naissance dans les paramètres ne
fonctionne pas (Christophe, 01/09). Audit en cours.

---

## La pièce qui manquait : des tests de bout en bout

Voici pourquoi les défauts arrivaient jusqu'à Christophe avant d'arriver à moi.

`npm run verifier` contrôle huit choses. Les huit sont des **propriétés
statiques** : un rapport de contraste, une clé de traduction présente, un
nombre de couleurs figées, un type qui compile. Aucune n'ouvre l'app. Aucune ne
clique.

Or les trois derniers défauts signalés sont tous des défauts de **parcours** :

| Signalé | Ce qu'un contrôle statique voit | La réalité |
|---|---|---|
| « le guide n'est pas fonctionnel » | Le composant existe, ses cibles existent, tout compile | Le bouton de relance n'efface pas la bonne clé, l'événement qui monte le guide ne peut plus se produire |
| « modifier sa date ne marche pas » | Le champ existe, la route existe | Audit en cours |
| « deux blocs parasites » | Rien à voir | Un état transitoire d'une demi-seconde |

Aucun de ces trois n'était détectable sans exercer l'application. Un contrôle
statique ne peut pas voir un bouton qui ne déclenche rien : le code est
syntaxiquement parfait, il est simplement inerte.

**Ce qu'il faut donc ajouter**, par ordre de valeur :

1. **Les parcours critiques**, joués pour de vrai dans un navigateur :
   onboarding complet jusqu'à la première timeline ; modification du profil et
   vérification que la timeline change ; ouverture du guide depuis le profil ;
   bascule liste ↔ timeline ; activation des notifications.

2. **L'assertion qui compte n'est jamais « le bouton existe »** mais toujours
   « après le clic, l'état a changé ». C'est exactement la différence entre ce
   que je vérifiais et ce que Christophe testait.

3. **Chaque défaut signalé devient un test.** Le guide, la date de naissance,
   les blocs parasites : trois tests à écrire, qui échoueront aujourd'hui et
   passeront une fois corrigés. C'est la seule preuve honnête qu'une correction
   corrige.

---

## Le registre

`PLAYBOOK.md` porte ce qui reste. Les chiffres n'y sont plus recopiés — ils
vivent dans les scripts, et `npm run verifier` dit la vérité du jour.

---

## Ce qui n'est pas de mon ressort

À trancher par Christophe, pas par moi :

- Le prix « à vie » de 49 €, incohérent avec 39,99 €/an.
- Les codes d'accès : les retirer, ou les vérifier côté serveur.
- Le logotype `logo-dark.svg`, qui contient « unfold » vectorisé. Relettrer une
  courbe sans la police d'origine ne se fait pas proprement.
- Le statut de professionnel DSA, le questionnaire App Privacy, l'accord de
  Marie-Ange pour figurer sur la fiche.
