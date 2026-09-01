# Checklist de mise en route — à exécuter par l'assistant de code de Marie-Ange

Chaque point a une commande et un résultat attendu. Renvoie les sorties telles
quelles : c'est ce qui permet de savoir où ça bloque sans faire d'aller-retour.

---

## 1. Accès

- [ ] `git clone https://github.com/Christophevanengelen/unfold.git` réussit
- [ ] `cd unfold && npm install` se termine sans erreur
- [ ] `node -v` renvoie **22 ou plus**

**À renvoyer :** la version de Node, et toute erreur d'installation.

---

## 2. Variables

```bash
cp .env.example .env.local
```

Remplir **uniquement la section 1** avec les cinq clés reçues en main propre.
Le reste peut rester vide.

```bash
node scripts/verifier-env-exemple.mjs
```

**Attendu :** `48 variables lues, 57 declarees, aucun secret. Le gabarit est complet.`

**À renvoyer :** cette ligne.

---

## 3. L'app démarre

```bash
npm run dev
```

Ouvrir `http://localhost:3333/app/timeline` dans un navigateur, en 375 × 812.

**Attendu :** l'onboarding s'affiche (pas d'écran blanc, pas de rond qui tourne
indéfiniment). Le moteur met 30 à 120 secondes au premier appel — ce n'est pas
une panne avant deux minutes.

**À renvoyer :** une capture de l'écran obtenu, et les erreurs de la console.

---

## 4. Les contrôles

```bash
npm run verifier
```

**Attendu :** `Aucune regression`, quinze contrôles verts, suivis du décompte de
ce qui reste à corriger.

```bash
npm run test:e2e
```

**Attendu :** `21 passed` en moins de 60 secondes.

**À renvoyer :** les deux dernières lignes de chaque commande.

---

## 5. Le contrat avec le moteur — le point le plus important

```bash
node scripts/verifier-moteur.mjs
```

Ce contrôle appelle le moteur d'éphémérides et vérifie, pour chaque champ que
l'app lit réellement, qu'il est présent et du bon type. Il ne juge pas
l'astrologie — seulement la forme de la réponse.

**Au 1er septembre 2026, il échoue sur deux points :**

| Point d'entrée | État constaté |
|---|---|
| `toctoc-app-short` | ok |
| `toctoc-year` | rend `years` / `months`, l'app lit `boudins` |
| `daily-brief` | HTTP 404 |

**À renvoyer :** la sortie complète, et la réponse à ces deux questions :

1. `toctoc-year` doit-il rendre `boudins`, ou l'app doit-elle lire
   `years`/`months` ? `lib/momentum-adapter.ts:174` lit `boudins`.
2. `endpoints/daily-brief.php` existe-t-il encore sous ce nom, et à quelle
   adresse de base ? Il répondait il y a peu, il renvoie 404 maintenant.

---

## 6. La règle de travail à deux

- [ ] Travailler sur une **branche**, jamais directement sur `main`
- [ ] Ouvrir une **pull request** pour chaque sujet
- [ ] `npm run avant-build` doit passer avant de la proposer

Christophe et son assistant travaillent sur `main` en parallèle. Deux agents qui
écrivent dans les mêmes fichiers au même moment s'écrasent.

```bash
git checkout -b moteur/nom-du-sujet
```

---

## 7. Les consignes permanentes

Le bloc à coller dans les instructions de l'assistant est la **section 5 de
`BRIEFING-MARIE-ANGE.md`**, à la racine du dépôt.

Les cinq règles qui comptent le plus :

1. **Le moteur d'éphémérides ne se touche pas depuis ce dépôt.** L'app ne parle
   qu'à l'API construite pour elle.
2. **Tout appel réseau passe par `apiFetch`.** Un `fetch` relatif échoue en
   silence sur `capacitor://localhost` — c'est le bug récurrent du dépôt.
3. **Dix langues, sans exception.** Un contrôle refuse le texte en dur.
4. **Jamais de donnée inventée.** Quand une donnée manque, on n'affiche rien.
5. **Vérifier à l'écran, pas sur le papier.** Un composant qui compile peut être
   inerte.

---

## Ce qu'on attend en retour

Une seule réponse contenant :

- les sorties des points 2, 4 et 5
- la capture du point 3
- les réponses aux deux questions du point 5

C'est ce qui clôt la mise en route.
