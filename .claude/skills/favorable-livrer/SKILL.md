---
name: favorable-livrer
description: "Envoyer une build de Favorable sur TestFlight, suivre la revue beta, gerer les testeurs et les certificats Apple. A utiliser des qu il est question de livrer, d envoyer aux testeurs, d une build qui ne part pas, d un certificat, d un profil de provisionnement, ou de quelqu un qui ne voit pas l app."
---

# Livrer Favorable

Tout ce qui a coute des heures le 31 aout 2026, pour ne pas le repayer.

## L envoi est deliberé, et le plafond d Apple explique pourquoi

Le CI compile a chaque commit, mais **n envoie sur TestFlight que si on le
demande** :

- `[testflight]` dans le message de commit, ou
- `gh workflow run apps.yml --ref main`

### Le test avant d envoyer

Une seule question, et elle se repond en une seconde :

> **Un testeur verrait-il la difference ?**

Si non — un script de verification, un outil de terminal, un commentaire, une
migration deja appliquee, un fichier de documentation — **on n envoie pas**. On
laisse s accumuler, et on envoie une fois, quand il y a quelque chose a voir.

### Ce que ça a coute le 31 aout 2026

Vingt-deux builds en une soiree, la plupart pour des corrections que personne
n aurait remarquees. Le plafond s est ferme, et **les seules builds a ne pas
pouvoir partir ont ete celles qui contenaient les corrections qui comptaient** :
les profils enfin enregistres, l heure et le lieu obligatoires, l aide a la
saisie reparee.

Marie-Ange a donc passe la soiree a tester une version sans aucune de ces
corrections, et a signaler des bugs deja corriges.

### Quand le plafond est atteint

    Upload limit reached. Please wait 1 day and try again.

**Ce n est pas contournable.** Verifie le 31 aout : une nouvelle tentative deux
heures apres l epuisement echoue a l identique. Il n y a ni file d attente, ni
degradation progressive, ni message d avertissement quand on approche — le
compteur est invisible jusqu au refus.

Ne relance pas « pour voir ». Attends le lendemain, et envoie tout d un coup.

### L habitude a prendre

Travailler vite et livrer vite ne sont pas la meme chose. La premiere consomme
la seconde. Corrige autant que tu veux, commite autant que tu veux — mais
**groupe les envois**.

## Avant de soupconner Apple

Trois fois de suite le 31 aout, la cause etait chez nous et pas chez eux :

- « Marie-Ange ne voit pas l app » → elle etait testeuse interne depuis le
  debut, statut `Invited`, jamais accepte. Aucun rapport avec la revue.
- « Le widget casse la signature » → il a ete retire entierement, et le CI
  echouait toujours. C etait le plafond de certificats.
- « L origine de la vue web est unfold://localhost » → faux, les types de
  Capacitor disent le contraire.

**Regle : va lire l etat reel avant de construire une explication.**
`node scripts/apple.mjs revue`, le statut du testeur dans App Store Connect, les
logs Vercel. Une theorie qui s appuie sur une capture d ecran ou un souvenir
coute plus cher que trente secondes de verification.

## Les certificats : ne jamais laisser le CI en creer

`xcodebuild archive` signe l archive en **developpement** ; c est l export qui
la re-signe en distribution. Ce n est pas un reglage a corriger, c est le
fonctionnement normal.

Le runner GitHub etant neuf a chaque passage, il fabriquait un certificat de
developpement a chaque build. **Apple en limite deux par compte.** Onze ont ete
crees avant que quiconque s en apercoive.

Le trousseau du runner recoit donc maintenant les **deux** certificats, via
`APPLE_DIST_CERT_P12` et `APPLE_DEV_CERT_P12`. Ayant deja ce qu il lui faut,
xcodebuild n en cree plus.

**Si l erreur « Choose a certificate to revoke » revient :** ne fais revoquer
personne avant d avoir verifie que les deux secrets sont bien poses et importes.
La revocation ne repare rien tant que la fuite continue.

**Ne jamais** forcer `CODE_SIGN_IDENTITY = Apple Distribution` en Release :
Xcode repond « conflicting provisioning settings » et refuse.

## Parler a Apple sans navigateur

    node scripts/apple.mjs revue          # ou en est la revue beta
    node scripts/apple.mjs certificats
    node scripts/apple.mjs profils
    node scripts/apple.mjs identifiants

Clef API dans le trousseau (`Favorable - cle API App Store Connect (suivi)`),
role App Manager. Issuer et app id sont en dur dans le script.

Deux pieges de l API, tous deux silencieux :
- trier par version **exige** `filter[app]`, sinon 409 ;
- une liste `fields[builds]` qui omet le NOM d une relation retire cette
  relation de la reponse. Tout s affiche « ? » avec un HTTP 200.

L etat qui compte est `externalBuildState` sur `buildBetaDetails`. La relation
`betaAppReviewSubmission` ne remonte pas dans une liste de builds.

## Testeurs : interne contre externe

|  | interne | externe |
|---|---|---|
| Revue Apple | aucune | oui, 24-48 h |
| Condition | compte App Store Connect | invitation ou lien public |
| Limite | 100 | 10 000 |

**Avant de soupconner Apple quand quelqu un ne voit pas l app, regarde son
statut.** Marie-Ange etait testeuse interne depuis le debut avec le statut
`Invited` — elle n avait jamais accepte. Ni la build ni la revue n y etaient
pour quelque chose. Le bouton **Reinvite** existe.

Le piege classique cote testeur : l iPhone doit etre connecte avec **le meme
identifiant Apple** que l adresse invitee.

## Une seule build en revue par version

Apple n accepte qu une build en revue beta a la fois pour une version donnee.
Tant qu une ancienne occupe la place, les autres ne sont **pas selectionnables**
— les boutons radio restent inertes sans aucune explication.

Pour liberer la place : ouvrir la build qui attend, **Remove from Review**.

## Verifications avant de dire que c est livre

    gh run list -L 1 -b main
    node scripts/apple.mjs revue

Ne jamais annoncer qu une build est chez les testeurs sans avoir vu
`Upload succeeded` **et** son etat dans `revue`.
