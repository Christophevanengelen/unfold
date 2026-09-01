# Rejoindre le développement de Favorable

Tout ce qu'il faut pour avoir le code qui tourne chez toi, et pour livrer sans
casser ce qui marche. Compte une demi-heure.

---

## 1. Ce que Christophe doit t'ouvrir

À faire de son côté avant que tu commences.

- **GitHub** — invitation en *write* sur `Christophevanengelen/unfold`.
  Il lui faut ton identifiant GitHub.
- **Vercel** — invitation sur l'équipe qui héberge le projet `unfold`.
  Il lui faut ton adresse mail.
- **Les variables d'environnement** — un fichier `.env.local` qu'il t'envoie
  **en main propre**, jamais par le dépôt. Il contient les clés Supabase,
  OpenAI, Stripe et RevenueCat.

---

## 2. Installer

### Étape 1 — Récupérer le code

```bash
git clone https://github.com/Christophevanengelen/unfold.git
cd unfold
npm install
```

Node 22 ou plus récent. Next.js 16, Capacitor 8.

### Étape 2 — Poser les variables

```bash
cp .env.example .env.local
```

`.env.example` est dans le dépôt et documente **les 48 variables** que le code
lit, groupées par usage, chacune avec ce à quoi elle sert et le fichier qui la
lit. Il ne contient aucune vraie clé — un contrôle le vérifie.

**Tu n'as besoin que de la section 1** pour lancer l'app : trois clés Supabase,
`SUPABASE_DB_URL` et `OPENAI_API_KEY`. Christophe te les envoie en main propre.
Tout le reste (Stripe, RevenueCat, APNs, App Store) sert à la production et peut
rester vide.

`.env.local` est ignoré par git, tu ne risques pas de le pousser.

### Étape 3 — Lancer

```bash
npm run dev
```

L'app est sur `localhost:3333`. Le site public est à la racine, l'app sous
`/app/timeline`.

Ton moteur met 30 à 120 secondes à répondre au premier appel. C'est normal,
ce n'est pas une panne.

### Étape 4 — Vérifier que tout passe

```bash
npm run verifier
```

Quinze contrôles statiques : les types, les dix langues, les cibles tactiles,
la planification des notifications, la prévision de la semaine, les liens
profonds, la complétude du gabarit d'environnement. Deux minutes, et ils disent
ce qui reste à corriger, chiffré.

**Aucun de ces quinze n'ouvre l'app.** C'est leur limite, et elle a coûté cher :
un bouton branché sur une clé qu'il n'effaçait pas, une route qui lisait la
réponse du moteur un niveau trop haut — tout ça compilait et passait les quinze.

Avant de livrer, lance plutôt :

```bash
npm run avant-build
```

Les quinze contrôles **plus** les 21 parcours joués pour de vrai dans un
navigateur. Comptez 40 secondes de plus. Ils ne doivent jamais reculer.

---

## 3. Les règles du dépôt

Cinq choses qui ont chacune coûté une soirée à découvrir.

### Le plus important

**Le moteur d'éphémérides est le tien, et rien dans ce dépôt ne le modifie.**
L'app ne parle qu'à l'API que tu as construite pour elle. Aucun calcul n'est
refait côté app, aucune donnée astrologique n'est fabriquée. Si tu vois le
contraire quelque part, c'est un bug — dis-le.

### Les quatre autres

**Tout appel réseau passe par `apiFetch`.**
Dans l'app native, l'origine est `capacitor://localhost` : un `fetch` en chemin
relatif n'aboutit nulle part et échoue *en silence*. C'est le bug récurrent de
ce dépôt — il a coûté les codes d'invitation, la modification de date de
naissance, et le briefing quotidien.

**Dix langues, sans exception.**
fr, en, es, de, it, pt, nl, ja, zh, ar. Toute phrase visible vit dans
`lib/perso-i18n.ts`, `lib/i18n-demo.ts` ou `lib/recits-i18n.ts`, avec ses dix
traductions. Un contrôle refuse le texte écrit en dur.

**Jamais de donnée inventée.**
Pas de `?? "Europe/Brussels"`, pas de domaine par défaut, pas de phrase de
secours servie comme une lecture. Quand une donnée manque, on n'affiche rien.
La promesse du produit est de lire le rythme propre à chaque personne : une
valeur plausible est pire qu'un vide.

**Un échec se dit.**
Une route qui échoue renvoie `{ ok: false, raison }` avec un vrai code HTTP,
jamais un objet qui ressemble à une réussite.

**Le design appartient à Christophe.**
Pas de contour ajouté pour faire tenir quelque chose : la séparation se fait
par les fonds. C'est écrit dans `.claude/skills/favorable-design/SKILL.md`.

---

## 4. Livrer

| Geste | Effet | Coût |
|---|---|---|
| `git push` | Vercel déploie le site et l'API. Le CI compile l'app iOS sans l'envoyer. | Aucun |
| `[testflight]` dans le message de commit | Envoie la build aux testeurs. | Quota Apple |
| `npm run db:migrate` | Applique les migrations Supabase. | Production |

### Le quota Apple

Apple plafonne les envois TestFlight sur une **fenêtre glissante de 24 heures**,
et le compteur est invisible jusqu'au refus.

Le 31 août, vingt-deux envois en une soirée ont fermé le robinet — et les seules
builds bloquées ont été celles qui contenaient les corrections qui comptaient.

D'où la règle : **on groupe**. On commite autant qu'on veut, on envoie une fois,
quand il y a quelque chose à voir.

---

## 5. Consignes pour ton assistant de code

À coller tel quel dans ses instructions, avant qu'il touche une ligne.

> **Avant d'écrire quoi que ce soit**, lis `CLAUDE.md`, `PLAYBOOK.md` et les
> cinq fiches de `.claude/skills/`. Elles contiennent ce qui a coûté des heures
> à découvrir et qu'aucun fichier ne dit.
>
> **Le moteur d'éphémérides ne se touche pas.** Il appartient à Marie-Ange. Tu
> n'as accès qu'à l'API construite pour l'app. Aucun calcul astrologique n'est
> refait côté app, aucune donnée n'est fabriquée, la forme des requêtes ne
> change pas.
>
> **Vérifie à l'écran, pas sur le papier.** C'est la règle qui prime. Un
> composant qui compile peut être inerte : ce dépôt a livré un bouton qui
> n'effaçait pas la bonne clé, un guide branché sur un événement devenu
> impossible, un réglage qui n'enregistrait rien. Les trois passaient tous les
> contrôles. Ouvre le navigateur sur `localhost:3333`, dans les deux thèmes,
> et regarde.
>
> **Casse chaque contrôle que tu écris**, avant de lui faire confiance. Remets
> le défaut, vérifie qu'il échoue, remets-le d'aplomb. Un contrôle jamais vu
> échouer ne prouve rien — deux l'ont appris ici, dont un qui lisait ses propres
> commentaires comme preuve.
>
> **Lance `npm run verifier` avant chaque commit.** Cinq contrôles fonctionnent
> au cliquet : le compte actuel est un plafond. Une régression le dépasse et
> échoue, une correction l'abaisse. Ne relève jamais un plafond pour faire
> passer ton travail.
>
> **Ne supprime rien sans demander.** Un écran, une route, un composant : même
> mort, c'est une décision produit, pas technique.
>
> **Ne lance jamais de build TestFlight de ta propre initiative.** Le quota
> Apple est une fenêtre glissante de 24 h et le compteur est invisible jusqu'au
> refus.
>
> **Écris les commentaires en français, sans accents, et explique le POURQUOI.**
> Pas ce que fait le code — pourquoi il le fait ainsi, et ce qui a été essayé
> avant. Le dépôt entier est écrit comme ça.
>
> **Un commit, un sujet.** Le message dit ce qui était faux et ce qui est fait,
> pas la liste des fichiers.
>
> **Travaille sur une branche et ouvre une pull request.** Christophe et son
> assistant travaillent sur `main` en parallèle ; deux agents qui écrivent dans
> les mêmes fichiers au même moment se marchent dessus.

---

## 6. Un point à trancher

**Le dépôt est public.** Le code du produit est lisible par n'importe qui, et
l'API du moteur y est appelée à découvert. Les clés n'y sont pas. À décider
ensemble : le passer en privé, ou l'assumer.

---

Le reste vit dans le dépôt : `CLAUDE.md` pour les pièges du natif,
`PLAYBOOK.md` pour ce qui reste à faire, `.claude/skills/` pour la livraison,
la base et le design.
