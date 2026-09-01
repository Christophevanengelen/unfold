Tu vas travailler sur Favorable, une app iOS de timing personnel. Christophe
l'a construite, Marie-Ange a écrit le moteur d'éphémérides qui l'alimente. Ils
sont associés à parts égales. Marie-Ange a déjà les droits d'écriture sur le
dépôt (compte GitHub `zebrapad`).

Ta mission : mettre son environnement en route, puis travailler dans ce dépôt
sans casser ce qui marche.

---

## 1. Mets l'environnement en route

```bash
git clone https://github.com/Christophevanengelen/unfold.git
cd unfold
npm install
```

Node 22 ou plus. Next.js 16, Capacitor 8.

```bash
cp .env.example .env.local
```

`.env.example` documente les 48 variables que le code lit, groupées par usage.
**Seule la section 1 est nécessaire** pour lancer l'app :

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL
OPENAI_API_KEY
```

Ces cinq valeurs sont à demander à Christophe, en main propre — 1Password Send,
Bitwarden Send ou Signal. Jamais par mail ni par chat. Marie-Ange est Viewer sur
Vercel, donc `vercel env pull` ne les rapatriera pas.

Puis :

```bash
npm run dev                              # l'app tourne sur le port 3333
node scripts/verifier-env-exemple.mjs    # doit dire « le gabarit est complet »
npm run verifier                         # 15 contrôles, doit dire « Aucune regression »
npm run test:e2e                         # doit dire « 21 passed »
node scripts/verifier-moteur.mjs         # doit dire « Les 3 points d entree servent… »
```

Ouvre `http://localhost:3333/app/timeline` en 375 × 812 et fais l'inscription en
entier. **Le moteur met 30 à 120 secondes à répondre au premier appel** — ne
conclus pas à une panne avant deux minutes.

Si une commande échoue, renvoie sa sortie telle quelle. Les messages d'erreur de
ce dépôt sont écrits pour dire quoi ouvrir.

---

## 2. Lis avant d'écrire

`CLAUDE.md`, `PLAYBOOK.md`, et les cinq fiches de `.claude/skills/`. Elles
contiennent ce qui a coûté des heures à découvrir et qu'aucun fichier ne dit.

---

## 3. Les règles, et pourquoi elles existent

**Le moteur d'éphémérides ne se touche pas depuis ce dépôt.** Il appartient à
Marie-Ange et vit ailleurs. L'app ne parle qu'à l'API construite pour elle :
aucun calcul astrologique n'est refait côté app, aucune donnée n'est fabriquée,
la forme des requêtes ne change pas. Si tu vois le contraire, c'est un bug —
signale-le, ne le contourne pas.

**Tout appel réseau passe par `apiFetch`.** Dans l'app native l'origine est
`capacitor://localhost` : un `fetch` en chemin relatif n'aboutit nulle part et
échoue *sans lever d'erreur*. C'est le bug récurrent de ce dépôt — il a coûté
les codes d'invitation, la modification de date de naissance, et le briefing
quotidien.

**Jamais de donnée inventée.** Pas de `?? "Europe/Brussels"`, pas de domaine par
défaut, pas de phrase de secours servie comme une lecture. Quand une donnée
manque, on n'affiche rien. La promesse du produit est de lire le rythme propre à
chaque personne : une valeur plausible est pire qu'un vide.

**Un échec se dit.** Une route qui échoue renvoie `{ ok: false, raison }` avec un
vrai code HTTP, jamais un objet qui ressemble à une réussite.

**Dix langues, sans exception.** fr, en, es, de, it, pt, nl, ja, zh, ar. Toute
phrase visible vit dans `lib/perso-i18n.ts`, `lib/i18n-demo.ts` ou
`lib/recits-i18n.ts`, avec ses dix traductions. Un contrôle refuse le texte en
dur.

**Le design appartient à Christophe.** Pas de contour ajouté pour faire tenir
quelque chose : la séparation se fait par les fonds. Voir
`.claude/skills/favorable-design/SKILL.md`. Aucun seuil de contraste ne justifie
de toucher à la matière, au liseré ou à l'élévation d'un composant.

---

## 4. Comment travailler

**Vérifie à l'écran, pas sur le papier.** C'est la règle qui prime. Un composant
qui compile peut être inerte : ce dépôt a livré un bouton qui n'effaçait pas la
bonne clé, un guide branché sur un événement devenu impossible, une route qui
lisait la réponse du moteur un niveau trop haut. Les trois passaient tous les
contrôles. Ouvre le navigateur, dans les deux thèmes, et regarde.

**Casse chaque contrôle que tu écris avant de lui faire confiance.** Remets le
défaut, vérifie qu'il échoue, remets-le d'aplomb. Un contrôle jamais vu échouer
ne prouve rien — trois l'ont appris ici, dont un qui lisait ses propres
commentaires comme preuve, et un autre qui comptait zéro entrée en annonçant
« complet ».

**Lance `npm run avant-build` avant chaque livraison.** Les 15 contrôles
statiques plus les 21 parcours joués dans un navigateur. Cinq contrôles
fonctionnent au cliquet : le compte actuel est un plafond, une régression le
dépasse et échoue, une correction l'abaisse. **Ne relève jamais un plafond pour
faire passer ton travail.**

**Travaille sur une branche et ouvre une pull request.**

```bash
git checkout -b moteur/nom-du-sujet
npm run avant-build
git push -u origin moteur/nom-du-sujet
gh pr create
```

Christophe et son assistant travaillent sur `main` en parallèle. Deux agents qui
écrivent dans les mêmes fichiers au même moment s'écrasent.

**Ne supprime rien sans demander.** Un écran, une route, un composant : même
mort, c'est une décision produit, pas technique.

**Ne lance jamais de build TestFlight de ta propre initiative.** Le quota Apple
est une fenêtre glissante de 24 h et le compteur est invisible jusqu'au refus.
Vingt-deux envois en une soirée ont déjà fermé le robinet — et les seules builds
bloquées ont été celles qui contenaient les corrections qui comptaient.

**Écris les commentaires en français, sans accents, et explique le POURQUOI** —
pas ce que fait le code, mais pourquoi il le fait ainsi et ce qui a été essayé
avant. Tout le dépôt est écrit comme ça.

**Un commit, un sujet.** Le message dit ce qui était faux et ce qui est fait, pas
la liste des fichiers.

---

## 5. Le contrat entre le moteur et l'app

C'est le point qui concerne Marie-Ange directement.

```bash
node scripts/verifier-moteur.mjs
```

Il appelle le moteur avec un thème fixe et vérifie, pour chaque champ que l'app
lit réellement, qu'il est présent et du bon type. Chaque attente porte le fichier
et la ligne qui la consomme. Il ne juge pas l'astrologie — seulement la forme de
la réponse.

**À lancer après chaque modification du moteur.** Le 1er septembre 2026,
`endpoints/daily-brief.php` a changé d'enveloppe : la route de l'app lisait
`briefData.signals` un niveau trop haut, sortait en 502 avant d'appeler le
modèle, et affichait « aucun signal rapide exploitable » — ce qui se lit comme
une journée calme. Le briefing du jour n'a jamais fonctionné et personne ne
pouvait le voir, ni dans l'app ni dans les journaux.

Si ce contrôle échoue, le premier réflexe est de **vérifier le contrôle
lui-même** contre le vrai service avant d'accuser le moteur. Il a déjà annoncé
deux ruptures inexistantes parce qu'il attendait le mauvais champ.

---

## 6. Ce qu'on attend de toi en retour

Une réponse contenant les sorties de `npm run verifier`, `npm run test:e2e` et
`node scripts/verifier-moteur.mjs`, plus une capture de la timeline une fois
l'inscription faite. C'est ce qui clôt la mise en route.
