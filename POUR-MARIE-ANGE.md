# Marie-Ange — pas à pas

Tu as déjà les droits d'écriture sur le dépôt (compte `zebrapad`). Tu peux
commencer tout de suite.

Compte 20 minutes. Chaque étape dit quoi taper et ce qui doit s'afficher.

---

## Étape 1 — Récupérer le code

Ouvre un terminal.

```bash
git clone https://github.com/Christophevanengelen/unfold.git
cd unfold
npm install
```

**Doit s'afficher :** la liste des paquets installés, sans `ERR!`.

Si `npm install` échoue, vérifie ta version de Node :

```bash
node -v
```

Il faut **22 ou plus**. Sinon : `nvm install 22 && nvm use 22`.

---

## Étape 2 — Les clés

Elles viennent de Vercel, pas de Christophe. Aucun secret ne circule par mail
ou par chat, et quand une clé change tu refais simplement un `pull`.

Accepte d'abord l'invitation Vercel reçue à `marieangelevan@gmail.com`, puis :

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local
```

À `vercel link` : choisis l'équipe `vanengelenchristophe-6584's projects` et le
projet `unfold`.

**Doit s'afficher :** `Created .env.local file`

Vérifie :

```bash
node scripts/verifier-env-exemple.mjs
```

**Doit s'afficher :** `48 variables lues, 57 declarees, aucun secret.`

Si `vercel env pull` ne rapatrie pas `OPENAI_API_KEY` — elle n'est peut-être
définie qu'en production — demande-la à Christophe. C'est la seule qui peut
manquer.

---

## Étape 3 — Lancer

```bash
npm run dev
```

Ouvre **http://localhost:3333/app/timeline** dans ton navigateur.

Réduis la fenêtre à une taille de téléphone, ou ouvre les outils de
développement et choisis un iPhone.

**Doit s'afficher :** l'écran d'accueil de l'app — un logo, « Certaines périodes
sont plus intenses », un bouton « Montre-moi ».

Fais l'inscription en entier avec ta propre date de naissance. **Le calcul prend
30 à 120 secondes au premier appel** — c'est ton moteur, ce n'est pas une panne
avant deux minutes.

**Doit s'afficher au bout :** ta timeline, avec les capsules colorées.

---

## Étape 4 — Les contrôles

```bash
npm run verifier
```

**Doit finir par :** `Aucune regression`, suivi de ce qui reste à corriger.

```bash
npm run test:e2e
```

**Doit finir par :** `21 passed`, en moins de 60 secondes.

---

## Étape 5 — Le contrat avec ton moteur

C'est celui qui compte le plus pour toi.

```bash
node scripts/verifier-moteur.mjs
```

Il appelle ton moteur avec un thème fixe et vérifie, pour chaque champ que l'app
lit vraiment, qu'il est présent et du bon type. Il ne juge pas l'astrologie —
seulement la forme de la réponse.

**Doit s'afficher :** `Les 3 points d entree servent ce que l app attend.`

**Lance-le après chaque modification de ton moteur.** C'est ce qui manquait : le
1er septembre, une enveloppe de réponse a changé et l'app a lu un niveau trop
haut. Le briefing du jour n'a jamais fonctionné, et l'erreur affichée —
« aucun signal rapide exploitable » — se lisait comme une journée calme. Ni toi
ni Christophe ne pouviez le voir.

---

## Étape 6 — Ce que Vercel te donne

Ton rôle est **Developer** sur l'équipe `vanengelenchristophe-6584's projects`.

Tu y vois le projet `unfold`, ses déploiements, ses journaux d'exécution et ses
variables d'environnement. Les préversions se construisent toutes seules à
chaque branche que tu pousses.

---

## Étape 7 — La règle de travail à deux

Christophe et son assistant travaillent sur `main`. Deux agents qui écrivent
dans les mêmes fichiers au même moment s'écrasent.

Donc, pour chaque sujet :

```bash
git checkout -b moteur/nom-du-sujet
# ... tes modifications ...
npm run avant-build          # les 15 contrôles + les 21 parcours
git push -u origin moteur/nom-du-sujet
gh pr create
```

`npm run avant-build` doit passer **avant** d'ouvrir la pull request.

---

## Les cinq règles du dépôt

1. **Ton moteur ne se touche pas depuis ce dépôt.** L'app ne parle qu'à l'API
   que tu as construite pour elle. Si tu vois un calcul astrologique refait côté
   app, ou une donnée fabriquée, c'est un bug — dis-le.

2. **Tout appel réseau passe par `apiFetch`.** Dans l'app iOS l'origine est
   `capacitor://localhost` : un `fetch` en chemin relatif n'aboutit nulle part et
   échoue *sans erreur*. C'est le bug récurrent du dépôt.

3. **Dix langues, sans exception.** fr, en, es, de, it, pt, nl, ja, zh, ar.
   Toute phrase visible vit dans `lib/perso-i18n.ts`, `lib/i18n-demo.ts` ou
   `lib/recits-i18n.ts`. Un contrôle refuse le texte écrit en dur.

4. **Jamais de donnée inventée.** Quand une donnée manque, on n'affiche rien.
   Une valeur plausible est pire qu'un vide.

5. **Vérifie à l'écran, pas sur le papier.** Un composant qui compile peut être
   inerte.

---

## Pour ton assistant de code

Le bloc à coller dans ses instructions est la **section 5 de
`BRIEFING-MARIE-ANGE.md`**, à la racine du dépôt.

---

## Si ça bloque

Renvoie la sortie de la commande qui échoue, telle quelle. Les messages d'erreur
de ce dépôt sont écrits pour dire quoi ouvrir.
