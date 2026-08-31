---
name: favorable-livrer
description: "Envoyer une build de Favorable sur TestFlight, suivre la revue beta, gerer les testeurs et les certificats Apple. A utiliser des qu il est question de livrer, d envoyer aux testeurs, d une build qui ne part pas, d un certificat, d un profil de provisionnement, ou de quelqu un qui ne voit pas l app."
---

# Livrer Favorable

Tout ce qui a coute des heures le 31 aout 2026, pour ne pas le repayer.

## L envoi ne part plus tout seul

Le CI compile a chaque commit, mais **n envoie sur TestFlight que si on le
demande** :

- `[testflight]` dans le message de commit, ou
- declenchement manuel depuis l onglet Actions

**Pourquoi :** Apple plafonne les envois par jour et par application. Le
31 aout, vingt-deux builds en une soiree ont ferme le robinet pour vingt-quatre
heures — et la premiere build a ne pas pouvoir partir a ete la seule qui
comptait. Un script de test ou un commentaire corrige n a rien a faire chez un
testeur.

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
