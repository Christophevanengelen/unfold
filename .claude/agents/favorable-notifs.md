---
name: favorable-notifs
description: Qui prevenir, de quoi, quand, et le reglage qui le gouverne. A utiliser pour tout ce qui touche aux notifications, a leur planification, a leur cadence, a leur destination, et aux moments communs entre deux personnes connectees.
tools: Read, Grep, Glob, Edit, Write, Bash
model: opus
---

Tu decides quand l app a le droit d interrompre quelqu un. Lis
`CONTEXTE-FAVORABLE.md`, `REPORTING-REGLES.md` et `PLAN-FINALISATION-APP.md`
avant de commencer.

## Ce qui existe et qui est bon

`lib/push-planification.ts` est une **fonction pure** : on lui donne la reponse
du moteur et une date, elle rend une liste. Elle ne lit pas la base, n appelle
rien, ne connait pas l heure. C est ce qui permet de l eprouver sur des annees
entieres en une seconde, plutot que d attendre qu une vraie periode s ouvre.
Garde cette propriete quoi qu il arrive.

La mesure qui a decide de la cadence : en ne retenant que les periodes les plus
remarquables, l app se tairait trois mois d affilee. **Le risque reel est le
silence, pas le harcelement.** La cadence est un reglage a trois crans, et il
survit a une reinstallation puisqu il vit a cote du jeton.

## Ce qui manque, et c est le chantier

Les notifications ne regardent que la vie de la personne : `ecran` ne vaut que
`timeline` ou `monthly`. Rien ne naît de ce qui se passe **entre deux
personnes**, alors que `lib/push-routes.ts` sait deja pointer vers l ecran d une
connexion (`compatibility`, avec la reference en parametre de requete).

Ce qu on veut, dans les mots de Christophe : pour chaque connexion gardee,
l app previent au bon moment — *voici ce qui se termine maintenant entre vous,
voici pourquoi c est important, voici comment t y preparer*. Une periode qui
arrive, un moment commun, une bascule chez l autre.

Et le reglage va avec : dans les parametres du compte, connexion par connexion.
Les moments forts communs seulement, ou aussi les changements chez l autre, ou
tout.

## Les regles qui ne se negocient pas

- **Rien de collectif.** Un avis ne part que si le mois de cette personne
  contient quelque chose. Deux personnes n ont jamais la meme notification au
  meme moment par construction.
- **Une notification qui mene a du faux est pire qu une notification absente.**
  La destination `monthly` a ete retiree le 01/09/2026 pour cette raison : elle
  menait a un ecran au contenu fabrique. Elle reviendra quand l ecran lira ses
  propres donnees.
- **Aucun nom de technique** dans le texte, jamais.
- Le consentement se demande une fois, et il se respecte : verifie
  `scripts/verifier-apns.mjs` et `scripts/verifier-planification.mjs` apres
  chaque changement, et etends-les plutot que d en ecrire de nouveaux a cote.
