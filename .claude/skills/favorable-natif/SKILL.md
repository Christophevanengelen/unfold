---
name: favorable-natif
description: "Les pieges de l app Capacitor de Favorable : routes, navigation, greffons, extensions, et les pannes qui ne disent rien. A utiliser des qu on touche a l app iOS, a un ecran qui s affiche mal, a un greffon Capacitor, au widget, ou a quelque chose qui marche sur le web mais pas dans l app."
---

# L app native de Favorable

Un depot, deux produits : un site Next.js et une app Capacitor. Ce fichier ne
liste que ce qui les separe et qui a deja coute une session.

## La panne muette est le defaut maison

Trois fois le meme bug en une soiree, a trois endroits differents :

- le schema `unfold://` etait declare, **personne n ecoutait** — le jeton du
  lien magique partait a la poubelle et la personne voyait l accueil, pas
  connectee, sans message ;
- la ligne « Me prevenir » **disparaissait** des que `checkPermissions()`
  echouait, faisant passer une panne pour une absence de fonctionnalite ;
- un `catch {}` silencieux avalait l echec d enregistrement du jeton.

**Regle : distinguer « cette fonction n existe pas ici » de « quelque chose a
casse ».** Le premier justifie de ne rien afficher. Le second doit se voir.
Voir `EtatPermission` dans `lib/push.ts` : `indisponible` contre `erreur`.

Un `catch` vide n est acceptable que si l appel se **repete tout seul** plus
tard. Sinon, c est une faute.

## Les routes ont une barre oblique finale

`trailingSlash: true` en natif. Un chemin vaut `/app/timeline/`, pas
`/app/timeline`. Toujours normaliser avant de comparer :

    const route = pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "") || "/";

Une egalite stricte oubliee a fait croire pendant des heures que l app etait
« dans un iframe » : la barre du bas ne se masquait pas, le contenu perdait
quarante points de large.

## Naviguer avec le routeur, jamais `location.href`

Le serveur interne de Capacitor **ne sert pas l index d un dossier**. Une
navigation dure vers `/app/timeline/` retombe sur la page racine.
`router.push()` fonctionne, parce que Next demande des fichiers avec extension.

## Une destination voyage en clef, jamais en chemin

Un chemin brut venu du reseau et pousse dans la vue web est une redirection
ouverte a l interieur de l app. Voir `lib/push-routes.ts` : le serveur envoie
`{ ecran: "timeline" }`, l app traduit.

## Apres toute installation de greffon

    npm i @capacitor/xxx && npx cap sync ios

Verifier ensuite que le greffon est bien **dans les deux endroits** :

    grep -o '"Capacitor[A-Za-z]*"' ios/App/CapApp-SPM/Package.swift | sort -u
    python3 -c "import json;print(list(json.load(open('ios/App/App/capacitor.config.json'))['plugins']))"

Un greffon present dans le JavaScript mais absent cote Swift echoue a
l execution, silencieusement.

## Le bundle natif ne tourne pas dans un navigateur

Compile avec `NEXT_PUBLIC_NATIVE=true`, il attend Capacitor : l ecran de
demarrage ne se retire jamais et la page reste blanche. Ce n est pas un banc
d essai valable — il faut le simulateur ou un appareil.

`scripts/build-native.sh` met de cote les chemins reserves au serveur avant de
compiler, puis les remet. Toute route nouvelle qui n a pas de sens dans l app
doit y etre ajoutee.

## Extensions (widget)

- Cible ajoutee avec la gemme `xcodeproj`, **jamais a la main** : une reference
  manquante dans `project.pbxproj` ne se voit pas a la lecture et casse la
  signature bien plus tard.
- `Info.plist` ecrit a la main : **`CFBundleExecutable` est obligatoire**. Sans
  lui, Apple refuse le paquet a l envoi avec trois erreurs dont une seule cause.
  `CFBundlePackageType` vaut `XPC!` (la variable ne se resout pas quand
  `GENERATE_INFOPLIST_FILE = NO`).
- Le groupe d application doit etre declare **a l identique dans les droits des
  deux cibles**, sinon `UserDefaults(suiteName:)` rend nil des deux cotes.
- Le greffon Preferences prefixe ses clefs par `CapacitorStorage.` : le code
  Swift doit lire `CapacitorStorage.favorable_widget`.

## Verification minimale avant de pousser

    npx tsc --noEmit -p tsconfig.json
    cd ios/App && xcodebuild build -project App.xcodeproj -scheme App \
      -destination 'generic/platform=iOS Simulator' -configuration Release \
      CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO
