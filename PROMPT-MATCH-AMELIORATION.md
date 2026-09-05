# Le texte du Match — quel point d'entree, quel prompt, et par ou l'ameliorer

Releve du 2 septembre 2026, **mis a jour le 4 septembre**. Document de travail :
la partie 1 decrit **l'existant, mesure dans le code** ; la partie 2 est **la
proposition**, a corriger librement — c'est la grille d'insight qui est a
remplir, pas le code.

---

## 0. Ce qui a change le 4 septembre 2026

**Le moteur a ete mis a jour et le blocage principal est leve.** Mesure a
nouveau (`node scripts/sonder-connection-brief.mjs`) : chaque evenement de
`connection-brief` porte maintenant `houses`, `startDate`, `endDate`,
`markers`, `lotType`, `level`, `periodSign`. `primarySignal` aussi.

```json
{"label":"ZR L2 — Virgo (fortune) · Forecasting period · toc toc toc",
 "score":78,"category":"zr","aspect":null,"date":"2025-01-12",
 "startDate":"2025-01-12","endDate":"2026-09-04","houses":[4],
 "markers":[],"lotType":"fortune","level":2,"periodSign":"Virgo"}
```

Consequences directes :

- **La comparaison entre deux personnes est calculable.** Sur la paire de test :
  septembre `communes=[7]`, octobre `communes=[1,7]`, novembre `communes=[]`.
  C'etait le blocage B0 ; il est resolu.
- **Les marqueurs arrivent** : `["Cu"]` sur un chapitre, 3 fois sur 22
  evenements. Le signal le plus fort du produit est enfin atteignable.
- **Les dates reelles arrivent** : un chapitre du 2025-01-12 au 2026-09-04, un
  passage date au 2026-10-05. Le tempo devient ecrivable.
- Ces champs **arrivaient deja au modele sans aucune modification de l'app**
  (`buildPersonPayload` recopie `events` tel quel). Le prompt etait donc devenu
  le seul goulot.

**Ce qui a ete fait dans la foulee, cote app :**

| Fichier | Changement |
|---|---|
| `connection-prompt.md` | **reecrit — prompt v2**, en francais courant, sans jargon, sans « Zodiaque Dechaine », avec les maisons, les dates et les marqueurs |
| `lib/connection-delineation.ts` | ajout de `aujourdhui` au payload ; retrait de `challenges`, `sharedTheme`, `sharedInsight`, `apiSuggestedAction` (gabarits) ; `CACHE_VERSION` v5 → **v6** |
| `app/api/openai/connection-delineation/route.ts` | `PROMPT_VERSION` v1 → **v2** |
| `lib/connection-brief-api.ts` | `RawEvent` declare les sept nouveaux champs |
| `scripts/sonder-connection-brief.mjs` | sonde : ce que le moteur envoie vraiment |
| `scripts/tester-prompt-match.mjs` | **teste le prompt sur la vraie donnee sans passer par les portes de facturation** — 3/3 correctes |

**Ce qui reste chez Marie-Ange** : une seule chose, voir §9 B0bis.

> **Mise a jour moteur — 2 septembre 2026 (meme jour).** La couche 1a et la
> couche 3 du §5 sont implementees cote moteur (`toctoc_year_calculator.js`,
> `connection_brief_calculator.js`), en reutilisant `lib/house_context.js`
> (deja utilise par `toctoc_app_calculator.js`, d'ou le rapprochement fait au
> §4). Concretement :
> - Chaque evenement (`rawData.events[]` et `primarySignal`) porte maintenant
>   `houses` (maison(s) touchee(s) — natal pour un transit/station, axe pour
>   une eclipse, signe de periode pour un ZR), `startDate`/`endDate` reels
>   (B0 resolu : `date` n'est plus `null` sur les ZR), `lotType`/`level`/
>   `periodSign` en champs explicites (plus seulement dans `label`), `markers`
>   ZR, `eclipseAxis`/`eclipseSeriesId`/`eclipseSeriesStart`/`eclipseSeriesEnd`,
>   et `cycle: {hitNumber, totalHits, pattern}` sur les transits a passages
>   multiples.
> - `category: "unknown"` est corrige a la racine : le classement ne repart
>   plus d'un regex sur `label` (qui ratait "conjunct" vs "conjonction") mais
>   lit `category` tel que pose par le moteur — donc aussi correct pour les
>   stations, qui tombaient dans la meme ornière.
> - Un objet `comparaison` (§5 couche 3) est calcule et ajoute a chaque
>   `activePeriods[]` : `memesDomaines`/`domainesA`/`domainesB` (maisons
>   touchees, via `houses` ci-dessus + la maison de profection), `memeAxeEclipse`,
>   `charge` (lit `zr`/`transit` separement, jamais `monthScore.total`),
>   `tonalite`, `tempo`, `ecart`, `techniquesAccordA/B`, `silence`. Regles de
>   derivation = celles proposees au §5, marquees "a corriger" — donc a
>   revoir a la lumiere de la grille §6 une fois remplie, pas gravees dans le
>   marbre.
> - **Non fait** : couche 2 (techniques manquantes — profection complete,
>   SR pivotal, progressions), la grille §6 (B6, toujours le vrai livrable
>   attendu de Marie-Ange), B3 (`/api/period-quality` 500), et le prompt v2 du
>   §7 (toujours un brouillon — n'a pas ete colle dans `connection-prompt.md`,
>   et `PROMPT_VERSION`/`CACHE_VERSION` n'ont pas bouge puisque le prompt
>   n'a pas change). Voir `knowledge/API-COMPLETE-DOCUMENTATION.md` →
>   `POST /api/connection-brief` pour le nouveau schema de reponse.

---

## 0bis. Prompt v3 puis v4 (Cursor, 04/09, 11h12 et 12h25) — teste sur donnee reelle

Deux commits, deja pousses sur `main` (`5cfca8a`, `dd819d4`, co-auteur Cursor) :
prompt reecrit en v3 puis v4, `pistesTechniques()` deplace cote app
(`lib/connection-delineation.ts`) pour trier par technique (annee / eclipse /
passage / fond), et le payload envoie desormais `comparaison` telle que rendue
par le moteur — **verifie en direct, elle existe reellement** :

```json
{"memesDomaines":[7],"domainesA":[6,4,7,3,1],"domainesB":[10,7],
 "memeAxeEclipse":null,"charge":{"A":"pic","B":"charge"},
 "tonalite":{"A":"neutre","B":"neutre"},"tempo":{"A":"lent","B":"lent"},
 "ecart":"decale","techniquesAccordA":1,"techniquesAccordB":1,"silence":false}
```

B1 (« aucun calcul entre les deux personnes ») est donc resolu cote moteur, pas
seulement cote app comme je le proposais au §5 couche 3.

**Teste avec `node scripts/tester-prompt-match.mjs`, deux passages complets sur
la meme paire (3 periodes x 2 = 6 appels OpenAI).** Le texte est nettement
meilleur que la v2 : plus de generique (« periode de transitions »), le format
par technique (ANNEE / MOIS / CHAPITRE) rend le tempo lisible sans le nommer,
et le bloc `EMPATHIE` fait ce qu'aucune version precedente ne faisait — dire a
chacun ce que l'autre traverse :

> « Celui qui s'occupe de sa santé et de ses routines a besoin de ne pas être
> pressé par des attentes professionnelles. Celui qui est pris par sa carrière
> a besoin de soutien pour ne pas se perdre dans les attentes extérieures. »

**Une fuite reelle et reproductible : 2 echecs sur 6.** Les deux fois sur la
meme periode (2026-10), a cause du meme evenement :

```json
{"label":"South Node conjunct natal ASC","aspect":"conjunction","houses":[1]}
```

Le modele a ecrit « le passage du Nœud Sud sur ton **ascendant** » puis, au
deuxieme essai, a laisse passer « **conjonction** » — les deux mots explicitement
bannis par le prompt (§ INTERDITS ABSOLUS). `houses:[1]` a lui seul suffit a
ecrire la phrase (« ta façon de te présenter au monde ») ; rien n'obligeait le
modele a toucher au `label` ou a l'`aspect`.

**Cause probable** : `buildPersonPayload` envoie a la fois `pistes` (deja
traduit) et `events` complet « en secours » (`lib/connection-delineation.ts`,
commentaire « ne pas tout lister dans le texte »). Le modele a acces aux
labels bruts et les cite parfois, malgre l'interdit. Deux corrections
possibles, non exclusives : (a) dans le prompt, ajouter une regle explicite —
« si `events` est fourni, il sert a verifier une date ou un score, jamais a
citer un `label` ou un `aspect` en langage naturel » ; (b) cote app, ne plus
envoyer `events` du tout, seulement `pistes` — le "secours" n'a jamais servi a
autre chose qu'a cette fuite dans les deux tests faits ici.

Le controle utilise (`scripts/tester-prompt-match.mjs`) bannit deja
`\bascendant\b` et `\bconjonctions?\b` en mots entiers — c'est lui qui a
detecte les deux echecs.

**Corrige en v5 (05/09/2026).** Regle ajoutee au prompt : `events` sert
uniquement a verifier une date ou un score, jamais a citer un `label` ou un
`aspect` en langage naturel — `pistes` + `houses` suffisent toujours.
`PROMPT_VERSION` v4 → v5, `CACHE_VERSION` v8 → v9. **Teste : 6/6 correctes sur
deux passages complets**, y compris la periode d'octobre qui echouait 2 fois
sur 2 avant le correctif.

---

## 1. La chaine — deux appels reseau, pas un

L'ecran de comparaison (`components/demo/compat/ConnectionReport.tsx`) fait
**deux** appels successifs, et c'est le second qui ecrit le texte lu a l'ecran.

```
ConnectionReport (une carte par mois)
  │
  ├─ 1. fetchConnectionBrief()            lib/connection-brief-api.ts:215
  │     POST /api/toctoc                  app/api/toctoc/route.ts
  │       { endpoint: "connection-brief", ... }
  │     └─> POST https://ai.zebrapad.io/full-suite-spiritual-api/connection-brief.php
  │         → activePeriods[]  (donnee brute : transits, ZR, profection, scores)
  │         cache L2 Supabase `connection_cache`, TTL 24 h, clef ORDONNEE (A,B)
  │
  └─ 2. getConnectionDelineation()        lib/connection-delineation.ts:77
        POST /api/openai/connection-delineation
             app/api/openai/connection-delineation/route.ts
        └─> POST https://api.openai.com/v1/chat/completions
            modele gpt-4o · temperature 0.4 · max_tokens 1200
            response_format { type: "json_object" }
            system = connection-prompt.md   (bloc "## SYSTEM PROMPT")
                     + instructionLangue(locale)
            user   = JSON.stringify(payload)
            cache L1 IndexedDB 7 j · L2 Supabase `delineation_cache`
```

**Le point d'entree a modifier pour changer le texte : `connection-prompt.md`
a la racine du depot.** Il est lu a chaud a chaque requete
(`loadSystemPrompt()`), aucun redeploiement n'est necessaire pour l'editer —
mais **deux versions de cache masquent tout changement** :

| Version | Fichier | Effet si non incrementee |
|---|---|---|
| `PROMPT_VERSION = "v1"` | `app/api/openai/connection-delineation/route.ts:61` | le texte ecrit sous l'ancien prompt continue d'etre servi depuis Supabase |
| `CACHE_VERSION = "v5"` | `lib/connection-delineation.ts:46` | idem, depuis l'IndexedDB du telephone, pendant 7 jours |

**Regle : toute modification de fond du prompt = incrementer les deux.**

### Portes avant l'appel au modele

Dans l'ordre reel (`route.ts:155-236`) : budget IA → authentification →
`FUTURE_CAPSULES` si `monthKey` est dans le futur → quota `AI_DELINEATION` →
lecture du cache → OpenAI. Un 402 est traite a part cote client
(`estMurPayant`) et ouvre le mur premium au lieu d'afficher le texte de repli.

---

## 2. Ce qui part reellement au modele (message `user`)

Construit dans `lib/connection-delineation.ts:93-119`. **Mesure sur le vrai
moteur le 02/09/2026, 1,9 s, 3 periodes** — `node scripts/sonder-connection-brief.mjs` :

```json
{
  "relationship": "partner",
  "monthKey": "2026-09",
  "tier": "PEAK",
  "sharedTheme": "...", "sharedInsight": "...", "apiSuggestedAction": "...",
  "locale": "fr",
  "personA": {
    "birthDate": "1985-04-12", "birthTime": "08:30",
    "latitude": 50.85, "longitude": 4.35,
    "primarySignal": { "category":"zr", "planetOrType":"ZR Fortune L2",
                       "natalPoint":"Virgo", "aspectOrMarker":"", "score":4 },
    "dominantDomains": ["..."],
    "profection": { "house":6, "houseName":"Santé et travail quotidien",
                    "annualTheme":"une année de santé, de routine et de service" },
    "events": [
      { "label":"ZR L2 — Virgo (fortune) · Forecasting period · toc toc toc",
        "score":78, "category":"zr", "aspect":null, "date":null },
      { "label":"Saturn conjunction natal Venus",
        "score":30, "category":"transit", "aspect":"conjunction", "date":"2026-11-18" }
    ],
    "monthScore": { "total":217, "zr":217, "transit":0 },
    "challenges": ["..."]
  },
  "personB": { "... meme forme ..." }
}
```

### Ce que le prompt demande, et ce qui est reellement la

**Correction importante par rapport a une premiere lecture : le lot et le
niveau du ZR SONT transmis** — mais dans une chaine, jamais comme des champs.
Le libelle suit une grammaire constante, verifiee sur 9 libelles ZR distincts :

```
ZR L{niveau} — {Signe} ({lot}) · {phase} · {libelle de score}
     └─ 2 ou 3     └─ Virgo    └─ fortune | spirit | eros
```

Et `primarySignal` porte la meme information autrement :
`planetOrType: "ZR Fortune L2"` et — piege — **`natalPoint` contient le SIGNE**
(`"Virgo"`), pas un point natal. Le nom du champ ment pour les ZR.

| Le prompt exige | Etat mesure | Consequence |
|---|---|---|
| lot et niveau du ZR | **presents**, dans `label` et dans `primarySignal.planetOrType` | recuperable — mais le prompt ne dit nulle part comment lire cette chaine, donc le modele devine |
| le signe de la periode | **present**, dans `label` et dans `natalPoint` | idem, avec le piege du nom de champ |
| les dates d'une periode ZR | **absentes** : `date: null` sur 19/19 evenements ZR, aucun `startDate`/`endDate` | « jusqu'a quand » est impossible a ecrire honnetement |
| LB / pic (`Cu`) | **absents** : les 9 libelles disent tous `Forecasting period` | la formule la plus forte du produit n'est jamais atteinte |
| la maison touchee par un transit ou un ZR | **absente** — seule `profection.house` existe | **rien ne permet de dire que les deux pointent le meme domaine.** C'est ce qui bloque toute vraie comparaison |
| l'axe d'une eclipse | aucune eclipse dans l'echantillon ; le type ne prevoit pas `axis` | a re-mesurer sur une paire qui en a |
| les dates d'un transit | `date` (un jour, ex. `2026-11-18`), pas la fenetre | tout est arrondi au mois |

Deux anomalies reproduites en direct, deja posees en Q7 :

- `category: "unknown"` — vu sur `South Node conjunct natal ASC`, qui est
  pourtant `category: "transit"` dans `events`. Le noeud sud n'est pas classe.
- une **cinquieme categorie non declaree** : `primarySignal.category:
  "profection"` (`planetOrType: "Maison 11"`, `natalPoint: "Projets"`,
  `aspectOrMarker: "année"`, `score: 1`). Le type client n'en connait que trois.

Enfin, `monthScore.total` est **ecrase par le ZR** : 217/217 zr / 0 transit,
puis 194 (191 zr), 221 (191 zr). Cote B : 90, 111, **0**. Une echelle qui va de
0 a 220 dont 90 % vient d'une seule technique ne peut pas servir de mesure de
« charge » telle quelle — voir la correction au §5.

### Le niveau periode — et un defaut qui part en production

Une `ActivePeriod` porte exactement dix clefs : `monthKey`, `startDate`,
`endDate`, `tier`, `tierScore`, `personAFocus`, `personBFocus`, `sharedTheme`,
`sharedInsight`, `actionTogether`. Rien de cache, rien d'inexploite.

Deux remarques sur ce niveau :

- `startDate`/`endDate` valent `2026-09-01` → `2026-09-30` : **les bornes du
  mois calendaire, pas la fenetre d'un signal.** Ce ne sont donc pas les dates
  cherchees au §5 couche 1a.
- `tierScore` vaut 307 pendant que `tier` vaut `PEAK` — comme sur 33/33
  periodes precedemment. Le palier ne distingue rien.

**Le defaut.** `constructiveDirection` — le texte affiche a l'utilisateur quand
l'IA echoue ou n'est pas payee (`lib/connection-brief-api.ts:186`, rendu par
`w.you.description`) — contient litteralement :

> « Vous êtes dans une période de transitions majeures du Lot de Fortune dans
> votre **Zodiaque Déchaîné**. »

C'est le terme que notre propre prompt interdit explicitement (« Jamais
"Zodiaque Déchaîné" ou "libération zodiacale" »). Il ne passe pas par le
modele — il court-circuite la regle et s'affiche tel quel. A corriger cote
moteur, ou a cesser d'afficher cote app.

**Les cinq champs de prose sont des gabarits**, verifies sur les deux personnes
de la meme periode :

| Champ | Gabarit observe |
|---|---|
| `challenges` | « Naviguer une transition de cycle {majeure\|secondaire} dans le registre de {profectionTheme} » |
| `constructiveDirection` | « Vous êtes dans une période de transitions {majeures\|de fond} du Lot de {lot} dans votre Zodiaque Déchaîné. Votre année de vie traverse {annualTheme} — … » |
| `sharedTheme` | « "{domaineA}" pour l'un et "{domaineB}" pour l'autre — une complémentarité à cultiver ensemble ce mois-ci. » |
| `sharedInsight` | « Des signaux rares sont actifs pour l'un ou les deux — … » |
| `actionTogether` | fonction du seul type de relation ; aucun signal n'y entre |

Consequence pour le prompt : `challenges` est envoye au modele
(`buildPersonPayload`) et le tire vers la formule generique qu'il est cense
remplacer. Le prompt lui demande par ailleurs de « partir de » `sharedTheme` et
`apiSuggestedAction`, qui sont des gabarits eux aussi. **Le modele est amorce
avec le texte generique qu'on lui demande d'eviter.**

Et `dominantDomains` (« Santé & travail », « Carrière ») derive de la seule
profection : le domaine affiche n'a aucun rapport avec le transit ou le ZR de
la periode.

### Le point dur : il n'y a pas de calcul de couple

Mesure (MASTER-PLAN Q6, 2 paires x 4 dates, 33 periodes) : **`personAFocus` est
identique bit pour bit** pour A face a deux B totalement differents.
`sharedTheme` est un gabarit (« "Carriere" pour l'un et "Communication" pour
l'autre — une complementarite »). `tier` vaut `PEAK` sur 33 periodes sur 33.

La sonde du 02/09 ne rejoue pas ce test — elle compare A a B dans une meme
paire (les deux blocs different, 0/3 identiques), ce qui ne dit rien sur la
question. Elle confirme en revanche `tier: PEAK` sur 3/3.

Autrement dit : `connection-brief` ressemble a **deux lectures solo posees cote
a cote**. Et surtout — c'est le constat mesure, celui-la sans ambiguite —
**aucun champ ne dit quelle maison un transit ou un ZR touche**, donc rien dans
la reponse ne permet de dire que les deux personnes sont prises par le meme
domaine. La question « en quoi son timing differe du mien » n'a aujourd'hui
aucune donnee pour etre repondue. **C'est le vrai chantier — et il ne se regle
pas dans le prompt seul.**

---

## 3. Le prompt actuel, mot pour mot

Source : `connection-prompt.md`, bloc `## SYSTEM PROMPT`.

````
Tu es un synthétiseur de timing astrologique. Tu reçois les données brutes d'un mois donné pour deux personnes (transits, ZR, profections), plus le résumé de l'API. Tu génères une délinéation courte, concrète et bienveillante en français.

## RÈGLE UNIQUE : nomme toujours le signal

Dans chaque phrase, nomme le signal exact qui la justifie. Exemples :
- "Uranus carré ton Ascendant" — pas "une remise en question de ton identité"
- "Saturne opposition Mercure" — pas "une période de communication difficile"
- "ZR Spirit en Scorpion" — pas "une période de transformation intérieure"
- "la profection de maison 8" — pas "un thème de transformation"

Si `events` est vide et `monthScore.total == 0` pour une personne : cette personne n'a pas de transit actif ce mois-ci. Mentionne uniquement sa profection annuelle (maison de l'année). Ne lui invente pas de transit.

## DÉCODAGE RAPIDE

**Profection (`profection.house`)** : la maison de l'année — domaine "allumé" pour toute l'année.
Maison 1=identité, 2=argent, 3=communication, 4=foyer, 5=créativité, 6=santé/routines, 7=couple/contrats, 8=transformation, 9=voyages/sens, 10=carrière, 11=amis/projets, 12=retrait.

**Transits (`category: "transit"`)** : label = "Planète aspect natal Point". Score > 30 = rare, 15–30 = significatif.
`square`/`opposition` = tension/friction. `trine`/`sextile`/`conjunction` = soutien/élan.
Uranus opposition Uranus ≈ mi-vie (~42 ans) — tournant de liberté, pas crise.

**ZR (`category: "zr"`)** : Zodiacal Releasing — un système de timing qui divise la vie en chapitres thématiques. L2 = grande période (mois→années), L3 = sous-chapitre en cours.
- Spirit = boussole vocationnelle / ce qu'on construit délibérément
- Fortune = circonstances extérieures, corps, ressources
- Eros = désirs, attachements
- Nécessité = contraintes, obligations
Formule : "ZR L3 Scorpion (Spirit)" → "ta boussole vocationnelle traverse un chapitre Scorpion en ce moment — thèmes de profondeur et transformation dans ta direction de vie."
LB = fin naturelle d'un chapitre. Ne pas dramatiser.
Jamais "Zodiaque Déchaîné" ou "libération zodiacale".

**`sharedTheme`, `sharedInsight`, `apiSuggestedAction`** : résumés déjà calculés par l'API. Utilise-les comme point de départ, mais reformule en nommant les signaux exacts.

## FORMAT DE SORTIE (JSON strict)

{
  "personA": {
    "titre": "3-5 mots (ex: 'Remise en question identitaire')",
    "corps": "2-3 phrases. Chaque phrase nomme un signal précis (transit, ZR, ou profection) et ce qu'il implique concrètement.",
    "defi": "1 phrase : le défi principal, avec le signal qui le génère nommé explicitement."
  },
  "personB": {
    "titre": "3-5 mots",
    "corps": "2-3 phrases. Même règle : nomme le signal précis.",
    "defi": "1 phrase."
  },
  "ensemble": {
    "titre": "3-5 mots (ex: 'Deux rythmes contrastés')",
    "pourquoiCeMois": "1-2 phrases : pourquoi CE mois est particulier pour les deux — en nommant les signaux actifs des deux personnes.",
    "dynamique": "1 phrase : la nature exacte de la dynamique (ex: 'L'un est sous friction Saturne pendant que l'autre traverse une mi-vie Uranus — deux transitions simultanées.').",
    "aFaireEnsemble": "Commence obligatoirement par : 'Avec [signal A] pour l'un et [signal B] pour l'autre, ...' Puis 1-2 phrases d'action concrète adaptée à ces signaux précis et au type de relation. Jamais de conseil générique non ancré dans un signal."
  }
}

Contraintes : pas de markdown dans les valeurs JSON. Pas de retour à la ligne dans les valeurs. Répondre uniquement avec le JSON.
````

### Ou ce texte atterrit dans l'ecran

| Champ JSON | Emplacement | Repli si le modele echoue |
|---|---|---|
| `ensemble.titre` | titre de la carte | `w.title` (« Alignement Septembre ») |
| `ensemble.pourquoiCeMois` | encart teinte, en haut | `w.sharedTheme` |
| `ensemble.dynamique` | italique sous l'encart | **rien** — la ligne disparait |
| `personA.titre` / `personB.titre` | micro-libelle a droite de « Vous » / du prenom | rien |
| `personA.corps` / `personB.corps` | corps de chaque bloc | `constructiveDirection` du moteur |
| `personA.defi` / `personB.defi` | italique, sous le corps | rien |
| `ensemble.aFaireEnsemble` | encart « Ensemble », bas de carte | `w.action` |

Contrainte de place reelle : les blocs personne sont en `text-xs`, la carte tient
dans un telephone. **2-3 phrases est deja le maximum lisible** — l'amelioration
doit augmenter la justesse, pas la longueur.

### Trois defauts du prompt actuel, independamment de la donnee

1. **Il contredit `REPORTING-REGLES.md`.** Le contrat du LLM dit : « il ne
   produit aucune date, aucun chiffre, aucun nom de technique ». Le prompt du
   match dit l'inverse : « nomme toujours le signal ». La lecture qui reconcilie
   les deux : **le modele ne peut nommer que ce qui est present dans l'entree,
   verbatim.** Ce n'est pas ecrit dans le prompt, il faut l'ecrire.
2. **Aucune regle de silence.** Le prompt produit toujours les 7 champs, meme
   quand les deux personnes sont plates. Le produit se vend sur le fait qu'il se
   tait souvent.
3. **La comparaison est laissee au modele.** « L'un est sous friction Saturne
   pendant que l'autre traverse une mi-vie Uranus » : c'est le modele qui
   decide que ce sont « deux transitions simultanees ». Rien ne l'a calcule.

---

## 4. Les techniques de timing disponibles, et leur etat

Ce que le moteur sait faire (contrat d'entree : **date + heure + lieu**, donc
utilisable pour les deux personnes d'un match), face a ce que le match recoit :

| Technique | Route moteur | Dans le match ? | Ce qu'elle apporterait a une comparaison |
|---|---|---|---|
| Profection annuelle | `/api/profection` | **oui**, house + theme | maison de l'annee des deux ; maitre de l'annee ; `handingOverAnalysis` |
| Profection mensuelle / journaliere | `/api/profection` | non | le grain fin — quel mois exactement bascule |
| Transits exacts | `toctoc` / `/api/transits-exact` | **oui**, en `events[]` | dates de debut/fin reelles, passages multiples |
| Cycles de transit | `/api/transit-cycles` | non | `periods[] {startDate, endDate, bestHit}` — le « 3e passage sur 4 » |
| Stations retrogrades | categorie `station` | **non** (le type client declare 3 categories, le moteur en envoie 7 — defaut M7) | les seuls evenements ponctuels vraiment datables |
| Eclipses sur axe | `/api/eclipses`, `/api/eclipse-life-pattern` | partiellement (`category:"eclipse"` sans axe) | `axis`, `seriesStart/End`, `lastAxisTouch`, `natalHits[]` — **deux personnes peuvent partager le meme axe** |
| Zodiacal Releasing | `/api/zodiacal-releasing` | **oui** mais ampute (ni lot, ni niveau, ni dates, ni LB) | `periods[].subPeriods[].housePlacement`, `loosingOfBond`, `foreshadowing` |
| Qualite des periodes | `/api/period-quality` | non — **500 en panne** | `signQuality MOST_POSITIVE/MOST_NEGATIVE`, `houseTopic`, `isPeakPeriod` : c'est litteralement le « facile / moins facile » demande |
| Planetes progressees | `/api/secondary-progressions` | non | Lune progressee (phase, signe, maison, prochains changements de signe), changement de signe du Soleil progresse |
| Revolution solaire | `/api/solar-return` | non | ASC de RS, MC, planetes angulaires, `srAscNatalHouse` |
| Timeline de RS | `/api/solar-return-timeline` | non | `pivotal {score, isPivotal, reasons[]}`, `peakYears` — **une annee pivot pour l'un et pas pour l'autre, c'est exactement l'ecart cherche** |
| Periodes planetaires (firdaria) | `/api/planetary-periods` | non | seigneur en cours, `nextMilestone`, `daysFromToday` |
| Circumambulation | `/circumambulations.php` | non | `primaryTimeLord` + `activityLevel` |
| Synastrie | `/api/synastry-chart` | non | **rend du HTML**, pas du JSON — inutilisable tel quel |
| Requete relationnelle | `/api/query/relationships` | non | `analysis: ['synastry','composite']` — **a tester, c'est la seule porte JSON possible vers un vrai calcul de couple** |

Trois avertissements pratiques mesures le 02/09 :

- **Le cout en temps.** `toctoc-boudin-detail` 50-57 s, `toctoc-highlights`
  45-48 s, `toctoc-app-short` 67 s. Un match qui appellerait cinq techniques
  x deux personnes en direct est impossible. Tout enrichissement passe par un
  cache (le `connection_cache` 24 h existe deja) ou par un pre-calcul.
- **Les routes riches sont indexees par `personId`**, pas par date-heure-lieu :
  `period-quality`, `planetary-periods`, `solar-return-timeline`,
  `aspect-archetypes`, `circumambulation` ne sont accessibles aujourd'hui que
  sur le corpus de personnes connues. **La porte date-heure-lieu sur ces
  routes-la est la demande n°1 a Marie-Ange** pour ce chantier.
- `/api/period-quality` repond 500 (Q1). C'est la route qui porte le
  « facile / moins facile » deja calcule. Sans elle, ce jugement est a produire
  ailleurs — voir §6.

---

## 5. Le plan — quatre couches, dans cet ordre

Le prompt est la **derniere** couche. Le retravailler avant les trois autres ne
change que le style.

### Couche 1 — Le contrat d'evenement (c'est ici que se joue tout le reste)

**Le fait qui commande la suite : les champs ajoutes cote moteur arrivent au
modele SANS aucune modification de l'app.** `buildPersonPayload`
(`lib/connection-delineation.ts:93`) recopie `focus.rawData.events` tel quel
dans le corps envoye a OpenAI ; le type TypeScript ne filtre rien a
l'execution. Donc toute clef posee sur un evenement par `connection-brief.php`
est lisible par le prompt le jour meme.

#### 1a. Ce que le moteur devrait poser sur chaque evenement

Par ordre de valeur — le premier est le seul dont l'information soit
**irrecuperable autrement** :

| # | Champ | Sur quelles categories | Pourquoi il est le plus utile |
|---|---|---|---|
| 1 | `startDate` / `endDate` (`YYYY-MM-DD`) | **toutes** | aujourd'hui `date` est `null` sur 19/19 ZR. Sans fenetre, ni « jusqu'a quand », ni tempo, ni « c'est le debut » vs « ca se termine ». Rien ne remplace ce champ |
| 2 | `houses: number[]` — les maisons touchees | **toutes** | c'est le champ qui rend deux personnes comparables. Sans lui, « meme domaine » est indecidable. `toctoc-app.php` sait deja le faire (`topics`) |
| 3 | `markers: string[]` — `LB`, `Cu`, `pre-LB` | zr | les 9 libelles ZR disent tous `Forecasting period` : les pics et les fins de chapitre sont invisibles |
| 4 | `lotType` (`fortune`\|`spirit`\|`eros`), `level` (2\|3), `periodSign` | zr | deja lisibles dans `label`, mais en les extrayant d'une chaine. En champs, c'est sur |
| 5 | `cycle: { hitNumber, allHits }` | transit | « 3e passage sur 4 » — le seul moyen de ne pas dramatiser un premier passage |
| 6 | `axis`, `seriesId` | eclipse | seul signal qui peut etre **litteralement partage** par deux personnes |
| 7 | corriger `category: "unknown"` | — | `South Node conjunct natal ASC` est classe `unknown` dans `primarySignal` et `transit` dans `events` |

Forme cible d'un evenement ZR, a cote de la forme actuelle :

```json
// aujourd'hui
{ "label":"ZR L2 — Virgo (fortune) · Forecasting period · toc toc toc",
  "score":78, "category":"zr", "aspect":null, "date":null }

// souhaite — le label ne change pas, on ajoute a cote
{ "label":"ZR L2 — Virgo (fortune) · Forecasting period · toc toc toc",
  "score":78, "category":"zr", "aspect":null, "date":null,
  "lotType":"fortune", "level":2, "periodSign":"Virgo",
  "startDate":"2025-11-30", "endDate":"2027-03-14",
  "markers":[], "houses":[6] }
```

Rien n'est retire : les champs actuels restent, l'app continue de tourner
pendant la transition.

#### 1b. En attendant — ce que le prompt peut lire des aujourd'hui

Sans toucher au moteur, le prompt peut cesser d'inventer le lot et le niveau,
puisqu'ils sont dans la chaine. A ajouter au bloc DECODAGE :

```
Un événement `category:"zr"` a un `label` de grammaire fixe :
  "ZR L{niveau} — {Signe} ({lot}) · {phase} · {libellé de score}"
Lis le niveau (2 ou 3), le signe et le lot (fortune | spirit | eros) DANS cette
chaîne. Ne les déduis jamais d'autre chose.
`primarySignal.planetOrType` porte la même chose sous la forme "ZR Fortune L2",
et pour un ZR `primarySignal.natalPoint` contient LE SIGNE — pas un point natal.
`date` vaut null sur les ZR : tu n'as aucune date de période. N'en écris aucune.
```

#### 1c. Cote app

- Elargir `ConnectionBriefSignal["category"]` : les valeurs observees en direct
  incluent `profection` et `unknown`, absentes du type
  (`lib/connection-brief-api.ts:17`, defaut M7).
- Declarer les nouveaux champs dans `RawEvent` — pour la lisibilite ; le
  transport, lui, fonctionne deja.

### Couche 2 — Ajouter les techniques manquantes, par personne

Une seule regle : **pre-calculer et cacher**, jamais en direct dans le rendu.

| Priorite | Technique | Pourquoi elle en premier |
|---|---|---|
| 1 | Profection **complete** (`ruler`, `rulerLocation`, `monthlyProfection`) | 4 Ko, deja branchee, la moins chere ; le maitre de l'annee donne le « ton » de l'annee |
| 2 | ZR complet (lot, niveau, dates, LB) | deja a moitie la ; c'est le squelette narratif du produit |
| 3 | Eclipses avec axe et serie | seul signal qui peut etre **litteralement partage** entre deux personnes |
| 4 | Revolution solaire (`pivotal`, `peakYears`) | dit « annee pivot ou non » pour chacun — la comparaison la plus lisible |
| 5 | Lune progressee | donne un rythme lent et doux, contrepoint utile aux transits durs |
| 6 | `period-quality` | quand la 500 est reparee : il rend le jugement de qualite tout fait |

### Couche 3 — Calculer la comparaison NOUS-MEMES

**C'est le coeur du chantier.** Une fonction pure, testable, cote client ou
serveur, qui prend les deux `PersonFocus` enrichis et produit un objet
`comparaison` injecte dans le payload. Le modele ne compare plus : **il
reformule une comparaison calculee.**

Forme proposee — a discuter :

```ts
interface Comparaison {
  memesDomaines: number[];        // maisons pointees par LES DEUX ce mois
  domainesA: number[];            // pointees par A seul
  domainesB: number[];
  memeAxeEclipse: string | null;  // "2/8" si les deux sont touches par la meme serie
  charge: { A: "vide" | "leger" | "charge" | "pic",
            B: "vide" | "leger" | "charge" | "pic" };
  tonalite: { A: "soutien" | "mixte" | "friction" | "neutre",
              B: "soutien" | "mixte" | "friction" | "neutre" };
  tempo:   { A: "lent" | "moyen" | "rapide",   // ZR = lent, profection = an, transit = mois
             B: "lent" | "moyen" | "rapide" };
  ecart: "synchrone" | "decale" | "asymetrique" | "aucun";
  techniquesAccordA: number;      // combien de techniques independantes pointent la meme maison
  techniquesAccordB: number;
  silence: boolean;               // vrai = la carte doit se taire
}
```

Regles de derivation (premiere version, a corriger) :

- `charge` : **surtout pas depuis `monthScore.total`.** Mesure du 02/09 : 217
  dont 217 de ZR, 194 dont 191 de ZR, 221 dont 191 de ZR. Le total est le
  score ZR a 90 %, et le ZR est un fond de decor permanent — tout le monde est
  toujours dans un chapitre. Un total de 217 ne veut pas dire « mois charge »,
  il veut dire « cette personne est vivante ». Lire `monthScore.zr` et
  `monthScore.transit` **separement** : le transit est ce qui bouge (0, 3, 21,
  30 sur l'echantillon), le ZR est ce qui dure. Et le seul zero observe
  (personne B en novembre, `{total:0, zr:0, transit:0}`) est un vrai « vide » —
  c'est ce cas-la qui doit declencher le silence.
- `tonalite` : majorite d'aspects `square`/`opposition` = friction ;
  `trine`/`sextile` = soutien ; les deux = mixte ; aucun aspect = neutre.
- `tempo` : la technique la plus lente qui porte le signal dominant.
- `ecart` : `synchrone` si `memesDomaines` non vide **et** charges comparables ;
  `decale` si memes domaines mais charges opposees ; `asymetrique` si l'un est
  a `pic` et l'autre a `vide` ; `aucun` si les deux sont vides.
- `silence` : vrai quand aucune personne n'a 2 techniques d'accord et que
  `memesDomaines` est vide. **Regle de silence de `REPORTING-REGLES.md`.**

Effet secondaire important : `comparaison` est **affichable sans le modele**.
Une carte peut montrer « meme domaine : maison 7 · 2 techniques d'accord »
comme une donnee, pas comme une phrase — ce qui repond a « on peut MONTRER
l'accord, donc on n'a pas a etre cru sur parole ».

### Couche 4 — Le prompt v2

Voir §7. Il ne fait plus qu'une chose : mettre en francais l'objet
`comparaison` et les signaux nommes, avec un conseil par type de timing.

---

## 6. La grille d'insight — a remplir par Marie-Ange

**C'est ici que se joue la qualite du texte.** Le tableau ci-dessous est le
squelette : une ligne par technique, et pour chacune ce qu'on sait dire.
Les cellules marquees `?` sont a ecrire ou a corriger.

### 6a. Par technique — ce qu'elle est, comment on juge, quoi conseiller

| Technique | Duree ressentie | « Facile » quand | « Moins facile » quand | Conseil type | Ce qu'on ne dit jamais |
|---|---|---|---|---|---|
| Profection annuelle | 1 an, bascule a l'anniversaire | maitre de l'annee bien place / non afflige `?` | maitre en chute, en maison 6/8/12 `?` | orienter l'annee vers le domaine de la maison | ? |
| Profection mensuelle | ~1 mois | ? | ? | ? | ? |
| Transit rapide (Mars, Venus, Mercure) | jours a semaines | sextile / trigone | carre / opposition | agir dans la fenetre, elle est courte | ? |
| Transit lent (Saturne, Uranus, Neptune, Pluton) | mois a annees, 1 a 5 passages | trigone / sextile ; dernier passage | carre / opposition ; 1er passage | ne pas trancher au 1er passage `?` | « crise », « epreuve » |
| Station retrograde | quelques jours, exacte | ? | ? | ? | ? |
| Eclipse sur axe | 6 mois +, par serie | ? | ? | ? | prediction d'evenement |
| ZR L1/L2 (chapitre) | annees | signe bien qualifie `?` | `MOST_NEGATIVE` `?` | lire le chapitre, pas le jour | « destin », « karma » |
| ZR L3/L4 (sous-chapitre) | semaines a mois | ? | ? | ? | ? |
| ZR — LB (fin de lien) | bascule | — | — | fin naturelle, ne pas dramatiser | « rupture » |
| ZR — pic (Cu) | fenetre rare | pic | pic | c'est la fenetre a saisir | ? |
| Lune progressee | ~2,5 ans par signe | ? | ? | ? | ? |
| Soleil progresse (chgt de signe) | une fois tous les ~30 ans | — | — | ? | ? |
| Revolution solaire | 1 an | `pivotal.isPivotal` faux `?` | `isPivotal` vrai `?` | ? | ? |
| Firdaria | annees | ? | ? | ? | ? |

### 6b. Par croisement — ce qu'on dit du COUPLE

C'est la grille qui manque completement aujourd'hui. Une ligne par valeur de
`ecart`, croisee avec le type de relation.

| `ecart` | Ce que ca veut dire | partner | friend | family | colleague |
|---|---|---|---|---|---|
| `synchrone` — memes maisons, charges comparables | les deux sont pris par le meme domaine en meme temps | ? | ? | ? | ? |
| `decale` — memes maisons, charges opposees | meme sujet, pas la meme intensite | ? | ? | ? | ? |
| `asymetrique` — l'un a un pic, l'autre est vide | l'un traverse, l'autre est disponible | « tu peux etre l'appui » `?` | ? | ? | ? |
| `aucun` — les deux plats | rien a dire | **se taire** | se taire | se taire | se taire |

Et le croisement des **tonalites** :

| A | B | Formulation possible | Conseil |
|---|---|---|---|
| friction | friction | deux tensions simultanees | ? |
| friction | soutien | l'un porte, l'autre encaisse | ? |
| soutien | soutien | fenetre rare a deux | ? |
| friction | neutre | ? | ? |

### 6c. Les tempos

Un point que le texte actuel ne fait jamais : **dire a quelle vitesse ca bouge.**
Un carre de Mars dure trois jours ; un chapitre ZR dure quatre ans. Aujourd'hui
les deux se lisent avec le meme ton d'urgence.

| Tempo | Techniques | Ton juste | Verbe |
|---|---|---|---|
| lent (annees) | ZR L1/L2, firdaria, Soleil progresse | fond de decor | « traverse », « depuis » |
| moyen (mois) | transits lents, eclipses, profection, Lune progressee | cadre de l'annee | « ouvre », « travaille » |
| rapide (jours) | transits rapides, stations, profection journaliere | fenetre a saisir | « cette semaine », « d'ici le X » |

---

## 7. Prompt v2 — brouillon a corriger

Non fige. Il suppose la couche 3 faite (`comparaison` dans le payload).
A coller dans `connection-prompt.md` **une fois la grille §6 remplie**, en
incrementant `PROMPT_VERSION` et `CACHE_VERSION`.

````
Tu es un traducteur de timing astrologique. Tu reçois, pour un mois donné, les
signaux CALCULÉS de deux personnes et une comparaison DÉJÀ CALCULÉE entre elles.
Tu ne calcules rien et tu ne compares rien : tu mets en français ce qui t'est
donné.

## RÈGLE 1 — n'invente aucun signal
Tu ne peux nommer qu'un signal présent dans l'entrée, avec le libellé de
l'entrée. Aucune date, aucun chiffre, aucun nom de technique qui ne vienne pas
du payload. Si un champ manque, tu n'écris pas la phrase qui en dépend.

## RÈGLE 2 — le silence est une réponse
Si `comparaison.silence` est vrai, réponds exactement :
{"silence": true}
Rien d'autre. Une carte vide vaut mieux qu'une lecture fabriquée.

## RÈGLE 3 — le tempo commande le ton
`comparaison.tempo` dit à quelle vitesse chaque personne bouge.
- lent   → fond de décor : « traverse », « depuis ». Pas d'urgence.
- moyen  → cadre du mois : « ouvre », « travaille ».
- rapide → fenêtre courte : « cette semaine ».
Ne jamais parler d'un chapitre de plusieurs années comme d'une urgence.

## RÈGLE 4 — la comparaison est donnée, pas déduite
`comparaison.ecart` vaut :
- "synchrone"   : les deux sont pris par le même domaine en même temps.
- "decale"      : même domaine, intensités différentes.
- "asymetrique" : l'un est chargé, l'autre est disponible.
- "aucun"       : voir RÈGLE 2.
`comparaison.memesDomaines` liste les maisons pointées par LES DEUX. S'il est
vide, tu ne dis pas que le thème est partagé.
`comparaison.techniquesAccordA/B` compte les techniques indépendantes d'accord.
À 1, tu restes prudent. À 2 ou plus, tu peux affirmer.

## DÉCODAGE
[reprendre ici la §6a une fois remplie : une ligne par technique, sa durée,
son critère facile / moins facile, son verbe]

Maisons : 1 identité · 2 argent · 3 communication · 4 foyer · 5 création
6 santé et routines · 7 couple et contrats · 8 transformation · 9 sens et
voyages · 10 métier · 11 amis et projets · 12 retrait.

Interdits de vocabulaire : destin, karma, épreuve, crise, prédiction,
« Zodiaque Déchaîné », « libération zodiacale ». Aucun conseil médical,
financier ou juridique. Aucune prédiction d'événement.

## SORTIE (JSON strict, pas de markdown, pas de retour à la ligne)
{
  "personA": {
    "titre": "3-5 mots",
    "corps": "2 phrases. Chacune nomme un signal du payload et dit ce qu'il ouvre concrètement, au tempo de RÈGLE 3.",
    "defi":  "1 phrase, le point dur, avec son signal nommé.",
    "tempo": "lent | moyen | rapide — recopié de comparaison.tempo.A"
  },
  "personB": { "... même forme, tempo recopié de comparaison.tempo.B" },
  "ensemble": {
    "titre": "3-5 mots",
    "pourquoiCeMois": "1-2 phrases. Si memesDomaines est non vide, nomme la maison partagée. Sinon, dis ce que chacun traverse séparément.",
    "dynamique": "1 phrase qui met en mots comparaison.ecart, sans le nommer.",
    "aFaireEnsemble": "1-2 phrases d'action, adaptées au type de relation et à comparaison.ecart. Commence par 'Avec [signal A] pour l'un et [signal B] pour l'autre, '."
  }
}
````

Deux consequences de code a prevoir :

- **`{"silence": true}` est un nouveau contrat de sortie.** Le client
  (`lib/connection-delineation.ts:144`) rejette aujourd'hui toute reponse sans
  `personA`/`personB`/`ensemble` — il faut ajouter ce cas, et un rendu de carte
  silencieuse cote UI.
- Le champ `tempo` recopie permet de **verifier** que le modele a bien lu la
  comparaison : s'il differe de l'entree, la reponse est fausse et on peut la
  jeter avant de l'afficher. C'est un test gratuit.

---

## 8. Comment savoir si c'est mieux

Sans mesure, une reecriture de prompt est une opinion.

1. **Un jeu de cas fige.** 8 a 10 paires reelles couvrant : les deux vides,
   un pic / un vide, memes maisons, tonalites opposees, un LB, une eclipse
   partagee. Payload enregistre en JSON dans `donnees/`.
2. **Trois controles automatiques** sur chaque sortie : (a) tout signal nomme
   existe-t-il verbatim dans l'entree ? (b) `tempo` correspond-il ? (c) aucun
   mot de la liste d'interdits ?
3. **Le taux de silence.** S'il est nul, la regle n'est pas branchee.
4. **Comparaison v1 / v2 en aveugle** par Christophe et Marie-Ange sur les
   memes 10 cas.

---

## 8bis. Le profection boudin dans `toctoc-year` — oui, il est la

Question du 04/09 : « est-ce que je vois le boudin de profection en appelant
toctoc-year ? » **Oui.** Appel direct, 3,3 s :

```bash
curl -X POST "https://ai.zebrapad.io/full-suite-spiritual-api/toctoc-year.php" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1985-04-12","birthTime":"08:30","timezone":"Europe/Brussels",
       "latitude":50.8503,"longitude":4.3517}'
```

La reponse porte une clef **`boudins`** (55 entrees sur la fenetre de 3 ans) que
la doc `API-COMPLETE-DOCUMENTATION.md` §`/api/toctoc-year` **ne mentionne pas** —
sa section « Response Structure » s'arrete a `months`. La doc est en retard sur
le moteur.

Categories mesurees dans `boudins` : `zr` 28, `transit` 13, `eclipse` 4,
`station` 3, **`profection_year` 3**, **`monthly_profection_loy_hit` 3**,
`firdaria_major_change` 1.

Un boudin `profection_year` porte, en clair :

| Champ | Exemple |
|---|---|
| `profectedHouse` / `profectedSign` | `5` / `Libra` |
| `houseTheme` | « creativity, romance, children, pleasure » |
| `timeLord`, `loyNatalSign`, `loyNatalHouse` | `Venus`, `Aries`, `11` |
| `yearQuality` | `{outcome:"neutral", srRating:"moderate", natalRating:"challenged", interpretation:"…"}` |
| `isDestinyYear` + `destinyExplanation` | `false` + le paragraphe qui l'explique |
| **`ksHighlightedDomains`** | les 5 regles Kelly Surtees, chacune avec ses `houses` et son `reasoning`, plus `allHighlightedHouses: [5,7,10,11,12]` |
| `explanation` | le paragraphe complet, deja redige |

C'est **exactement** le « facile / moins facile » que la grille §6 cherchait, et
il est deja calcule. `yearQuality.outcome` et `natalRating` donnent le jugement,
`ksHighlightedDomains.allHighlightedHouses` donne les domaines de l'annee —
plusieurs, pas un seul.

Deux reserves avant de s'en servir : la prose est **en anglais** (a reformuler
par le modele, pas a afficher), et `connection-brief` **ne renvoie pas ces
boudins** — c'est `toctoc-year`, mono-personne. Les brancher sur le Match veut
dire soit un appel `toctoc-year` par personne (3,3 s, cachable), soit demander a
Marie-Ange de poser `profection_year` dans les `events` de `connection-brief`.

---

## 9. Ce qui bloque, et pour qui

| # | Blocage | Chez qui |
|---|---|---|
| **B0** | ~~Aucun evenement ne porte la maison qu'il touche, ni ses dates de debut/fin~~ **Resolu le 02/09/2026** (moteur) : `houses` + `startDate`/`endDate` reels sur chaque evenement, voir la mise a jour en tete de document | — |
| **B0bis** | **« Zodiaque Déchaîné » part en production.** `constructiveDirection` dit « Vous êtes dans une période de transitions majeures du **Lot de Fortune** dans votre **Zodiaque Déchaîné** ». Traduction litterale et fautive de *Zodiacal Releasing* : ca ne veut rien dire en francais, et ca fait peur. Ce texte **ne passe pas par le modele** — il s'affiche tel quel des que l'IA echoue ou que la personne n'est pas payante. C'est ce que montrait la capture du 02/09. Deux phrases a reecrire en francais courant, sans nommer la technique. Le vouvoiement y est aussi incoherent : tout le reste de l'app tutoie | **Marie-Ange — la derniere chose qui bloque** |
| B1 | `connection-brief` ne calcule rien entre les deux personnes (`personAFocus` identique bit pour bit). Un vrai calcul de couple est-il possible ? `/api/query/relationships` rend-il du JSON exploitable ? | Marie-Ange (Q6) |
| B2 | Echelles de score sans definition : `primarySignal.score`, `monthScore.transit` negatif, `category:"unknown"` (reproduit sur `South Node conjunct natal ASC`), et une categorie `profection` non documentee | Marie-Ange (Q7) |
| B3 | `/api/period-quality` repond 500 — c'est la route qui porte le « facile / moins facile » | Marie-Ange (Q1) |
| B4 | Les routes riches (period-quality, planetary-periods, solar-return-timeline) n'acceptent que `personId`, pas date-heure-lieu | Marie-Ange |
| B5 | Temps de reponse 45-67 s sur plusieurs routes : tout enrichissement doit etre pre-calcule | architecture |
| B6 | La grille §6 est vide : sans elle, le prompt v2 n'est qu'une reorganisation | **Marie-Ange — c'est le vrai livrable attendu** |
| B7 | Contradiction entre `REPORTING-REGLES.md` (« aucun nom de technique ») et le prompt du match (« nomme toujours le signal ») | Christophe — trancher |

---

## 10. Ordre de travail propose

**Tout de suite, sans dependre de personne** (cote app, 1 h) : ajouter au prompt
le bloc §5.1b qui apprend au modele a lire le lot, le niveau et le signe dans la
chaine `label`, et a ne produire aucune date sur un ZR. Incrementer
`PROMPT_VERSION` et `CACHE_VERSION`. Ca supprime la donnee inventee. Ca
n'apporte rien de neuf — mais ca arrete de mentir.

**Ensuite, dans l'ordre :**

1. ~~**Moteur** : `startDate`/`endDate` et `houses` sur chaque evenement~~ **Fait
   le 02/09/2026**, avec en prime les points 3-7 (markers, lotType/level/
   periodSign, cycle, axis) et la couche 3 (`comparaison`) — voir la mise a
   jour en tete de document. Aucune modification de l'app n'a ete necessaire.
2. Remplir la grille §6 (Marie-Ange) — rien d'autre ne compte avant. Les
   regles de derivation de `comparaison` (charge/tonalite/ecart/silence) sont
   une premiere version a revoir a la lumiere de cette grille, pas figees.
3. Trancher B7 (Christophe).
4. Prompt v2 + les deux versions de cache incrementees — `comparaison` est
   deja dans le payload, §7 peut etre ecrit contre les vraies donnees.
5. Mesurer (§8).
6. Couche 2 : les techniques supplementaires, une par une, chacune derriere son
   cache, dans l'ordre de priorite du §5.

---

### Fichiers a connaitre

| Role | Fichier |
|---|---|
| Le prompt | `connection-prompt.md` |
| Route OpenAI + caches + portes de facturation | `app/api/openai/connection-delineation/route.ts` |
| Construction du payload + cache client | `lib/connection-delineation.ts` |
| Appel moteur + types + adaptation | `lib/connection-brief-api.ts` |
| Proxy moteur + cache 24 h | `app/api/toctoc/route.ts` |
| Rendu des cartes | `components/demo/compat/ConnectionReport.tsx` |
| Textes de repli (sans IA) | `lib/matching-narratives.ts` |
| Resume de la ligne de liste | `lib/connection-summary.ts` |
| Le contrat du LLM | `REPORTING-REGLES.md` |
| Ce que le moteur sait faire | `MOTEUR-SURFACE.md` |
| Le prompt solo, plus mature — a lire comme modele | `toctoc-delineation-prompt.md` |
| La sonde qui a produit les mesures du §2 | `scripts/sonder-connection-brief.mjs` |
