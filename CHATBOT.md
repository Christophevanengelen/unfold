# "Parle avec un astrologue" (Vela) — comment ça marche, et comment le tester

Christophe, ceci répond à ton briefing (`messages/briefing-astrologue-marie-ange.html`).
J'ai construit le côté "nous" — la conversation, la répartition, l'écriture —
tel que tu l'as proposé. Ce document explique ce qui existe, avec des exemples
concrets, sans code.

Entre-temps tu as posé `messages/vela-astrologue.html` — le nom (Vela),
l'avatar, et surtout le déroulé écran par écran. Bonne nouvelle : les deux
côtés se recoupent presque exactement. J'ai déjà réaligné la réponse en 4
temps sur ton écran 4 (voir plus bas) ; le reste de ce document tient compte
de ta version, pas seulement du briefing initial.

## En une phrase

Quelqu'un écrit ce qu'il vit → une IA comprend et classe ce qu'il raconte →
du code (pas une IA) décide quoi demander à ton moteur → une seconde IA
écrit la réponse en français courant, sans jamais dire "maison 8" ou "carré".
Deux appels à un modèle par message, jamais quatre — pour rester rapide et
ne pas faire exploser la facture.

## Les trois étapes, dans tes mots

Ton briefing proposait une répartition en 5 lignes (§2). Voici ce que chacune
est devenue :

| Ta ligne | Ce qui l'exécute aujourd'hui |
|---|---|
| Comprendre ce que la personne raconte, poser la question qui manque | Une IA (`lib/astrologue-comprehension.ts`) — un seul appel, jamais deux |
| Décider quoi demander au moteur, pour quelle période | Du code, pas une IA (`lib/astrologue-routeur.ts`) — plus rapide, plus prévisible, gratuit |
| Calculer les signaux, les dates, les domaines | Ton moteur, inchangé — `toctoc-year`, `daily-briefing-context`, `connection-brief` |
| Hiérarchiser ce qui compte le plus | Ta règle des 4 niveaux (`daily-briefing-context`) + la règle de silence déjà écrite dans le dépôt (`lib/silence.ts`) — utilisée pour de vrai pour la première fois aujourd'hui |
| Écrire la réponse en français courant | Une seconde IA (`lib/astrologue-prompt-redaction.ts`), avec le même contrôle automatique anti-jargon que le briefing quotidien |

## Un exemple qui marche déjà

Repris de ton propre dialogue (§1 du briefing) :

> **Toi :** « Je n'arrive plus à décider si je reste dans ce boulot. Ça fait
> trois mois que ça tourne en rond. »
>
> **L'app :** « Depuis quand exactement ça tourne en rond ? Et est-ce que
> c'est le travail lui-même, ou plutôt ce que tu y vaux ? »
>
> **Toi :** « Depuis juin. C'est plus… ce que je vaux. »
>
> **L'app :** *(ici, le code va chercher les vraies dates dans ton moteur,
> fait voter la règle de silence, et une IA rédige à partir de faits réels —
> jamais inventés)*
>
> **Ce que rédige la seconde IA, en 4 temps** — réaligné sur ton écran 4
> (`vela-astrologue.html`) : *ce qui se passe* / *d'où ça vient* (sans jamais
> nommer une technique) / *ce que ça change* / *la prochaine date* — cette
> dernière étant une vraie date calculée par ton moteur, jamais inventée,
> avec la même promesse que ton mock ("je te préviendrai avant" — voir plus
> bas, ce morceau-là n'est pas encore construit).

Si rien de fort ne converge sur le sujet, l'app le dit clairement et le
présente comme une bonne nouvelle — jamais comme une panne. C'est ta règle
"le silence est une réponse" (§4), maintenant du vrai code.

## Ce que ton écran 5 (l'historique) demande, et qui n'est pas encore fait

Ton mock montre chaque conversation avec un titre ("Rester ou partir"), une
date d'ouverture, et sa prochaine échéance — et Vela qui "revient d'elle-même
le 3 février". Ce chantier-ci pose la table qui stocke les conversations,
mais ne fait pas encore : un titre court par conversation, une liste de
toutes les conversations d'un appareil, ni le rappel automatique le jour de
l'échéance (ça, c'est une notification programmée — le terrain de
`favorable-notifs`, un autre chantier). À prévoir pour la suite, pas oublié.

## Ce qui décline poliment, plutôt que de mal répondre

En construisant ça, j'ai confronté le système à une banque de 100 questions
réellement posées à des astrologues (podcasts, cours). Deux cas où l'app dit
honnêtement "je ne sais pas encore faire ça" au lieu de répondre à côté :

- **Une autre pratique** — numérologie, Human Design, thème chinois... L'app
  le remarque et le dit, sans faire semblant.
- **"Quand devrais-je...?"** — signer, déménager, se marier. C'est choisir
  une bonne date future (electionnel), différent de décrire ce qui se passe
  déjà. Pas construit aujourd'hui — c'est 1 question sur 5 dans la banque de
  100, donc à voir avec toi si ça vaut la peine d'être ajouté. Détail complet :
  `ASTROLOGUE-COUVERTURE-QUESTIONS.md`.

Ce que l'app couvre bien : ce qui bouge en ce moment, les éclipses, les
grands transits, les périodes difficiles (sans jamais dire "difficile" —
volontaire, ton moteur ne donne pas cette information), et les questions sur
une autre personne (avec une réserve honnête : ton moteur ne calcule pas
encore un vrai accord à deux, voir plus bas).

## Réponses à tes 4 questions (§5 du briefing)

1. **La porte date/heure/lieu sans `username`** — j'ai supposé que oui
   (`daily-briefing-context` s'en sert déjà ainsi ailleurs dans le dépôt). Si
   c'est faux, le code bascule automatiquement sur `toctoc-year` à la place —
   rien ne casse, juste un peu moins précis.
2. **Une fenêtre, pas un jour** — pas besoin en fait : `toctoc-year` donne
   déjà les vraies dates de chaque événement, le code les compare lui-même à
   la période demandée.
3. **Ce qu'un modèle ne doit jamais affirmer** — j'ai posé une liste de
   départ (jamais de date inventée, jamais "difficile/facile", jamais une
   force en pourcentage...). À remplacer par la tienne dès que tu l'as.
4. **La répartition proposée** — c'est celle qui tourne. Si tu préfères que
   ton moteur écrive directement le texte final, c'est un seul fichier à
   remplacer (`lib/astrologue-prompt-redaction.ts`), rien d'autre à
   redessiner.

## Une réserve à connaître : les questions sur une autre personne

Ton moteur ne calcule pas un vrai accord entre deux thèmes (`connection-brief`
recolle deux lectures individuelles). L'app ne dit donc jamais "votre relation
traverse..." — seulement "voici ce qui bouge pour toi, voici ce qui bouge
pour {nom}", côte à côte. Honnête, mais moins riche que ce qu'on pourrait
vendre. C'était déjà noté dans `POUR-MARIE-ANGE-QUESTIONS.md` (Q6).

## Comment le tester, concrètement

Deux choses restent à faire avant qu'on puisse vraiment discuter avec :

1. **La base de données** — trois nouvelles tables (les conversations, les
   messages, l'attente d'un calcul lent) doivent être créées sur Supabase.
   Marie-Ange s'en occupe.
2. **Un écran de conversation** — aujourd'hui, tout ça se parle par le code
   uniquement, il n'y a pas encore de bulle de discussion dans l'app. C'est
   la suite naturelle, mais ce n'était pas dans ce chantier-ci.

En attendant l'écran, deux façons de voir que ça marche vraiment :

- **Le test automatique** (`e2e/astrologue-reel.spec.ts`) rejoue ton propre
  dialogue contre le vrai moteur et le vrai modèle, et vérifie qu'aucun mot
  technique ne fuite dans la réponse.
- **Marie-Ange peut te faire une démo** en quelques échanges depuis son
  poste, le temps qu'on ait un écran — dis-lui si tu veux voir ça.

---

Des questions, des désaccords sur ce qui est décrit ici : dis-le, comme pour
ton briefing. Rien n'est figé.
