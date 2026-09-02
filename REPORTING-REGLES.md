# Le reporting — les regles

## Ce qu on vend

Pas le calcul : il est gratuit partout (Astro-Seek fait les 13 techniques).
On vend les trois gestes du middle man.

1. **Choisir** quelles techniques regarder.
2. **Lire** ce qu elles disent ensemble.
3. **Le dire** en francais courant.

Le geste qui vaut de l argent est le deuxieme.

## La regle de silence

Une technique qui pointe une maison, c est du bruit : il y en a toujours une qui
dit quelque chose. C est le probleme du faux positif — si 80 % d une vie est
couverte par une periode marquee, trouver un evenement dedans ne prouve rien.

**On ne parle que quand plusieurs techniques independantes pointent la meme
maison sur la meme fenetre.**

Consequences :
- l app se tait souvent, et c est la fonctionnalite, pas un manque ;
- ce qu elle dit est rare, donc credible ;
- on peut MONTRER l accord, donc on n a pas a etre cru sur parole.

## Le format d une carte

Quatre champs, aucun de plus.

| Champ | Source | Jamais |
|---|---|---|
| **Quoi** — le domaine en clair | `houseTopic`, `periodHousePlacement.signification` | invente |
| **Quand** — dates reelles | debut/fin de periode | approxime en silence |
| **Force** — combien de techniques d accord | `convergence.overlappingEvents` | arrondi a la hausse |
| **Quoi faire** — la cle d action | LLM, sous contrainte | une prediction |

## Le contrat du LLM

Le modele ne decide de rien. Il **reformule** ce que le moteur a calcule.

- Il recoit les valeurs calculees, jamais la question « qu est-ce qui se passe ».
- Il ne produit aucune date, aucun chiffre, aucun nom de technique.
- S il n a pas recu de valeur pour un champ, le champ ne s affiche pas.

Cette contrainte n est pas de la prudence : c est ce qui empeche la donnee
fabriquee — notre premiere classe de bug — et ce qui nous tient hors de la
categorie « fortune telling » d Apple (4.3(b)) et dans l article 50 de l AI Act.

Aujourd hui `personalize/route.ts` demande au modele une `convergenceNote`
**sans lui donner le `convergence` qui arrive dans la meme reponse HTTP**.
C est exactement l inverse du contrat.

## Ce qu on ne fait pas

- Pas de prediction d evenement.
- Pas de conseil medical, financier ou juridique.
- Pas de score global de vie.
