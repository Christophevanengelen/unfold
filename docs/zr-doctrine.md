# Zodiacal Releasing — comment lire un pic, une graine, un lotus

Doctrine de lecture (Valens / Demetra George / Chris Brennan), transmise par
Marie-Ange le 19/09/2026 pour ecrire le texte de la branche de vie. Ce fichier
garde le RAISONNEMENT ; l implementation technique (comment les pics sont
extraits du moteur) vit dans `lib/zr-pics.ts`.

## La geometrie du pic ne change jamais — son SUJET, oui

Un pic est toujours la meme chose geometriquement : un signe angulaire au Lot
de Fortune (maison 1, 4, 7 ou 10 depuis la Fortune), quel que soit le lot dont
on relache. Ce qui change, c est le THEME du pic — et c est le lot qui le
donne :

| Lot | Thème du pic | Signal |
|---|---|---|
| **Spirit** (actions, esprit, ce qu on poursuit) | Vocation, carrière, "que fais-je de ma vie" | Le pic de Spirit sur Fortune elle-meme ou sa 10e est la fenetre classique d eminence de Valens — visibilite, reconnaissance publique. Si la maison natale correspondante est abimee, le pic reste bruyant mais devient probleme : scandale, surcharge, conflit public qui change quand meme l histoire. |
| **Fortune** (corps, circonstance, ce qui arrive) | Sante, accident, argent, corps, environnement | Ce n est PAS un "pic de richesse" sauf si la maison natale de Fortune le promet deja — c est un pic de CIRCONSTANCE. |
| **Eros** (extension de Brennan, absente de Valens) | Amour, désir, mise en couple | Rencontre, mariage, devenir un couple public, ou une relation qui devient le centre de la vie. Pic ≠ heureux en amour : la qualite vient toujours des benefiques/malefiques sur le signe, pas du pic lui-meme. |

**Loud ≠ good.** Un pic dit "cette periode compte, on la remarquera" — jamais
"cette periode est bonne." La qualite vient de la condition natale du signe et
de son maitre, jamais du pic seul.

## Le triptyque autour d un pic (angular triad — Schmidt, pas Valens)

Autour de chaque signe angulaire :

1. **Signe d avant — préparation.** Debuts naissants, souvent en retard sur
   les faits (on rencontre la personne, on visite la maison avant de l acheter).
2. **Le signe angulaire — le pic.** Le plus actif, le plus important.
3. **Signe d apres — suite / accomplissement.** Ce qui a ete decide au pic se
   vit ou se rend visible (la tournee televisee de ce qui a ete restaure au pic).

Demetra est stricte : ne jamais lire le SIGNE comme un theme ("Capricorne =
travail dur"). Le theme vient de la maison natale du signe et de son maitre.

## L1 a L4 : meme grammaire, echelle differente

| Niveau | Echelle | Ce qu un pic y fait |
|---|---|---|
| **L1** | Chapitre de vie (8-30 ans) | L ere entiere. Premiere question a poser : "ou tombe ton pic L1 ?" |
| **L2** | Sous-chapitre (mois a quelques annees) | Ce dont les gens se souviennent comme "cette annee-la". Un pic L2 dans un L1 pic = pic-dans-un-pic. |
| **L3** | Semaines | Ou les evenements se datent le plus souvent. Ne jamais lire L3 seul — il est la SCENE, L1-L2 sont la piece. |
| **L4** | Jours / heures | Le declencheur. Utile une fois l histoire deja connue — jamais promu seul au rang de "pic de ma vie". |

Ordre de lecture : L1+L2 d abord (quel chapitre, est-ce un pic, y a-t-il un
LB), puis L3 pour la scene, L4 en dernier comme horodatage.

## Pre-ombre (graine) vs Loosing of the Bond (lotus) — deux moments distincts

**Loosing of the Bond (LB).** Un cycle complet de 12 signes dure ~17 ans et
7 mois. Les signes plus courts que ca (Belier, Taureau, Balance, Scorpion,
Sagittaire, Poissons) ne "relachent" jamais a ce niveau. Les signes plus
longs (Gemeaux, Cancer, Lion, Vierge, Capricorne, Verseau) terminent les douze
signes avec du temps restant : au lieu de recommencer le cycle, la sequence
SAUTE au signe oppose. Ce saut est le LB — un tournant majeur, rare (un ou
deux LB de niveau L2 dans une vie), qui ne se refait pas a l identique.

**Pre-ombre (pre-LB, "graine").** Parce que le LB revisite un signe deja
occupe une fois dans le tour precedent, ce signe apparait une premiere fois
environ 8 ans avant le LB. Cette premiere activation est la graine : on
COMMENCE quelque chose, ou on l effleure, sans le mener a terme — et c est au
LB, ~8 ans plus tard, que ca se fait vraiment (ou parfois se renverse). Si on
peut nommer ce qui a failli se passer a la graine, on sait de quoi le LB parle.

Le lotus (LB) qui tombe EN PLUS sur un angle de Fortune (pic + LB) est le
tournant le plus fort du systeme.

## Une phrase a garder

> Un pic dit : ce chapitre-la, angulaire a la Fortune, compte pour Spirit
> (ce que tu fais), Fortune (ce qui t arrive) ou Eros (qui tu aimes).
> L1 a L4 : la meme grammaire, du siecle au jour.
> Une graine : tu rencontres l intrigue une premiere fois.
> Un lotus (LB) : l intrigue casse l ancienne contrainte et n y revient pas.

## Ou ca vit dans le code

- Extraction des pics (peak/lb/preLB, lien graine -> date du lotus) :
  `lib/zr-pics.ts`.
- Texte de la branche de vie, par genre et par lot : cles `resume.branche_texte_*`
  et `resume.branche_sujet_*` dans `lib/i18n-demo.ts`.
- Dessin (fleur / graine / lotus) : `components/demo/resume/BrancheDeVie.tsx`
  (`fleurDePrunier`, `graineBourgeons`, `eclatLotus`).
