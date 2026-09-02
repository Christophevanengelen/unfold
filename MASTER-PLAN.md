# MASTER PLAN — Favorable

État au 02/09/2026. Tout chiffre ci-dessous vient d'une mesure citée ; ce qui n'est pas mesuré est marqué **[non mesuré]**. Racine du dépôt : `…/27b77449-e8c3-4136-8304-de0369947c67/scratchpad/w/`.

---

## 1. Ce qu'on vend

On ne vend pas le calcul : Astro-Seek fait les 13 techniques gratuitement.
On vend le deuxième geste du middle man — **lire ce que plusieurs techniques indépendantes disent ensemble**, et se taire le reste du temps.
Ce qui est payé : les fenêtres à venir. Ce qui est donné : les fenêtres passées, que la personne peut vérifier dans sa propre mémoire.

---

## 2. L'état réel aujourd'hui

### Ce qui marche

| Fait | Mesure |
|---|---|
| Le moteur répond et est complet | `toctoc-year` 58–63 boudins de 20 à 38 clefs ; `toctoc-app-short` 2 022 boudins, 100 ans ; `toctoc-boudin-detail` rend `convergence{level, overlappingEvents, sameHouseEvents, events[]}` |
| La maison de chaque boudin est résoluble sans réseau | `lib/maison-du-boudin.ts` : 107/107 ZR, 24/24 profections, 12/12 seigneurs, 1 806 exactes / 0 fausse sur une vie |
| L'Ascendant se déduit du paquet lui-même | 34 à 37 témoins par thème, vote unanime sur 4/4 thèmes — `chart-data` devient un secours |
| 16 contrôles statiques mordent | vérifiés en cassant le code, un par un ; `npm run verifier` vert |
| Le mur temporel existe déjà | `app/api/openai/connection-delineation/route.ts:213-219` calcule `isFuture` **côté serveur** ; `lib/billing/features.ts:42-45` `FUTURE_CAPSULES.freeQuota = 0` ; la timeline floute au lieu de retirer (`MomentumTimelineV2.tsx:797-798`, `:1197`, `:1274`) |
| Origine native propre sur le chemin LLM | `openai-personalize.ts:123`, `connection-delineation.ts:116`, `DailyBriefing.tsx:113` passent tous par `apiFetch` |

### Ce qui est cassé

| # | Fait | Mesure |
|---|---|---|
| C1 | La fiche décrit un autre boudin que celui touché | `momentum-adapter.ts:135-156` ne pose pas `boudinId` et envoie `boudinIndex = phaseIndex++`, un compteur local ; le moteur l'interprète comme un rang dans `allSausages[]` (2 133 entrées). `boudinIndex: 0` rend `tt_78_h1`, `age: 0`. Fenêtre : les **67 s** avant réponse de `toctoc-app-short`, et **définitivement** si elle échoue |
| C2 | Toutes les périodes ZR sont classées « travail » | `momentum-adapter.ts:65` passe `ev.lotType`, jamais envoyé (8 clefs reçues sur 17 déclarées) → `event-labels.ts:98` `return "work"` |
| C3 | Les dates ZR sont arrondies au mois | `momentum-adapter.ts:87` cherche `periodStart/periodEnd`, absents 146/146 ; les vraies bornes sont dans `startDate`/`endDate`, présentes 118/118 |
| C4 | Les fenêtres de transit sont fabriquées | `momentum-adapter.ts:91-98` : ±21 ou ±45 j. Saturne carré Uranus : réel 14 j, affiché 42 j — rapport 3 |
| C5 | La maison du premier topic est fausse pour 663 périodes sur 884 | `momentum-adapter.ts:276` lit `th[idx]` ; `pH ∈ th` 884/884 mais `pH` en première position **221/884** |
| C6 | Un numéro de maison est fabriqué à partir d'un indice de tableau | `momentum-adapter.ts:276`, repli `idx + 1` |
| C7 | Les échelles de score sont mélangées | `momentum-adapter.ts:69-72` et `:146` : seuils 40/60/80 pour toutes catégories. `intensityScore` mesuré : zr 20…60, transit −58 500…+29 400, eclipse 94…187, profection 10 |
| C8 | Silence = panne | `momentum-store.tsx:71` `throw new Error("No signals found")` → écran « connexion perdue » |
| C9 | Liste sans « en cours » : ouverture sur 2100, aucun bouton retour | `MomentumTimelineV2.tsx:983-1000` (`currentIndex = -1`, jamais de `scrollToIndex`), `:1041-1046` (`isAwayFromNow` derrière `currentIndex >= 0`) |
| C10 | Deux lois de palier contradictoires | `capsules.ts:32-36` seuils 85/70 ; `MomentumTimelineV2.tsx:118-123` seuils 3/2 |
| C11 | Suppression d'une connexion qui revient | `supabase-store.ts:234` `await fetch(url, {method:"DELETE"})` — seul `fetch` nu du fichier ; échoue en silence sous `capacitor://localhost`, `connections-store.ts:159-175` réinsère au démarrage |
| C12 | Le mur payant n'est jamais montré | `connection-delineation.ts:124` `if (!res.ok) return null` — un 402 est avalé comme un 502 |
| C13 | Le cache de brief inverse les rôles | `app/api/toctoc/route.ts:23-25` trie `[a,b]` alors que `personAFocus` = « Vous » ; `relationship`, `months` et `locale` hors clef ; `:110` met en cache un `{success:false}` |
| C14 | Le moteur ne calcule rien entre deux personnes | `personAFocus` identique bit pour bit pour A face à deux B totalement différents, 3 mois sur 3. `tier` = PEAK **33/33** périodes |
| C15 | Le LLM affirme une convergence qu'il n'a pas reçue | `personalize/route.ts:356` demande `convergenceNote` ; `detail.convergence` arrive dans la même réponse HTTP et n'est pas lu |
| C16 | Achat unique encaissé puis ignoré | `webhook/revenuecat/route.ts:280-281` `NON_RENEWING_PURCHASE — skipped` ; `supabase/005_billing.sql:23-24` `CHECK` sans `lifetime` |
| C17 | Rien à vendre sur iOS | `lib/achats.ts:14-25` produits non créés dans App Store Connect, clé RevenueCat absente → `ios_bloque` |

### Ce qui est mort

| Objet | Mesure |
|---|---|
| `data.boudins` de `toctoc-year` | 58–63 boudins de 20 à 38 clefs, **zéro lecteur**. On lit 8 clefs de `months[].topEvents` |
| `periodHousePlacement` | 28/28 sur les ZR de `toctoc-year`, **zéro occurrence dans le code** |
| `periodQuality`, `periodRuler`, `periodSect`, `periodPlanetsAspecting` | reçus, zéro lecteur |
| `convergence` | reçu à chaque `boudin-detail`, zéro lecteur |
| `lib/silence.ts` (586 l.) et `lib/maison-du-boudin.ts` | écrits, `tsc` passe, **zéro importeur** |
| `lib/momentum-highlights.ts` | rebranché sur `callProxy`, **toujours zéro importeur** |
| `matching-narratives.ts` | `compareTimelines` sans importateur ; contient `Pluto→"neptune"`, `zr→"jupiter"`, inconnu→`"sun"`, `house ?? 7` |
| 7 lignes de `CapsuleDetailSheet` | `isVipTransit`, `isReturn`, `windowStart/End`, `parileDate`, `exactDates`, `cycle.pattern` — aucun écrivain |
| `scripts/verifier-moteur.mjs` | 17e script, enchaîné par rien ; son commentaire `:84` (« ne rend PAS de boudins ») est faux |
| Les 23 parcours Playwright | ne tournent nulle part en CI (`.github/workflows/apps.yml:24` = `npm run verifier` seul) ; ont tourné 36 s sur le serveur d'**une autre copie de travail** (port 3333, `reuseExistingServer: true`) et annoncé `23 passed` sur du code non chargé |

**Aucun contrôle ne voit** : un `fetch("/api/…")` relatif embarqué (16/16 ok sur injection), un champ inventé ajouté à un prompt LLM (16/16 ok), un plafond de dette remonté d'une ligne.

---

## 3. Le durcissement de l'existant

Ordre = valeur ÷ coût. Chaque ligne : fichier:ligne · ce qui casse · le correctif. Aucune suppression de fichier.

### 3.1 Timeline et liste

| # | Fichier:ligne | Ce qui casse | Correctif |
|---|---|---|---|
| D1 | `lib/momentum-adapter.ts:135-156` | `boudinIndex` local envoyé au moteur comme rang viager → la fiche décrit un événement de la petite enfance | Poser `boudinId` depuis `data.boudins[]` de `toctoc-year`. Tant qu'il manque : refuser l'appel, afficher la fiche sans texte IA. **Ne jamais apparier par `tt_NN`** — `tt_21` est un ZR 2025 dans `year` et un transit 1994 dans `app-short` |
| D2 | `lib/momentum-adapter.ts:87` | dates ZR arrondies au mois, en silence | Lire `ev.startDate` / `ev.endDate` (118/118). Règle « Quand — jamais approximé » réparée par une ligne |
| D3 | `lib/momentum-adapter.ts:91-98` | ±21/±45 j inventés | Lire `windowStart`/`windowEnd` des `boudins` (transit 13/13, anniversary 3/3, profection 3/3) ; sinon `s`/`e` du paquet court (2 022/2 022) ; sinon porter `datesApproximees: true` et **afficher le mois**, pas le jour |
| D4 | `lib/momentum-adapter.ts:276` | `th[idx]` faux pour 663/884 ZR ; repli `idx + 1` fabrique une maison | Maison = `pH` pour les zr, `nh` pour transit/station, `maisonDuBoudin` pour le reste. Inconnu → `house: 0`, que `maisonConnue` écarte déjà |
| D5 | `lib/event-labels.ts:98` et `:40-51` | `return "work"` et `return "mercury"` : domaine et planète fabriqués pour 9 boudins sur 63 | Rendre `null`. `getDomainNarrative:123`, `getPlanetNarrative:166`, `getTopicsNarrative:479` rendent déjà `""` sur `null`. Donner une entrée propre aux 3 catégories profection/anniversaire dans `getEventMeta` |
| D6 | `lib/momentum-adapter.ts:65` | `lotType` jamais reçu → tout ZR en « travail » | Lire `boudins[].lotType`, et `markers` (`LB` 42, `Cu` 66, `pre-LB` 35 sur une vie — les deux textes les plus forts du produit, jamais atteints) |
| D7 | `lib/momentum-store.tsx:71` | zéro signal = écran de panne réseau | Trois états disjoints : `parle` / `silence` / `erreur`. Le silence est la fonctionnalité |
| D8 | `MomentumTimelineV2.tsx:983-1000`, `:1041-1046`, `:1081-1088` | liste ouverte sur 2100, bouton MAINTENANT jamais affiché, flèche « année suivante » morte | Si `currentIndex === -1`, viser le premier signal futur ; sortir `setIsAwayFromNow` de la garde ; `findIndex` sur liste décroissante → viser janvier, pas décembre |
| D9 | `lib/openai-personalize.ts:39-41` | cache IA `ai_v11_${capsuleId}_…` où `capsuleId = phase-${i}` : je change ma date de naissance, je relis le texte d'avant pendant 30 jours | `cacheKey(boudinId ?? capsuleId, birthHash, profile)` — `momentum-store.tsx:37-50` l'a déjà fait pour les phases |
| D10 | `app/api/openai/personalize/route.ts:659-661` | `convergence` reçu et jeté ; `:356` demande la note au modèle | Lire `detail.convergence`, l'injecter dans `llmPayload`, et **afficher le compte** plutôt que de le faire écrire |
| D11 | `app/api/openai/personalize/route.ts:802` | `intensite` produite par le LLM alors que `llmPayload.score` est en main | `intensite: llmPayload.score` |
| D12 | `lib/instruction-langue.ts` | autorise « square, opposition, conjunction » que les autres prompts interdisent | Retirer la phrase |
| D13 | `app/api/openai/daily-brief/route.ts:236-249` | `detecterJargon` 100 % français, la route répond en 10 langues | Motifs EN/ES/DE/IT/NL/PT + un motif « chiffre nu / date » |
| D14 | `app/api/openai/daily-briefing/route.ts:536-541` | `activeEvents === allEvents` toujours ; `:566` affiche « intensité 120/4 » | Filtrer sur `startDate`/`endDate` ; ne jamais fabriquer la phrase « Signal actif : … (intensité N/4) » — pas de signal exploitable = 502 |
| D15 | `MomentumTimelineV2.tsx:188-200`, `:514`, `:749-836` | `getLaneX` reconstruit une Map sur tout le tableau à chaque appel ≈ 5,7 M itérations par recalcul ; `OverviewView` rend 2 000+ capsules non virtualisées, chacune avec `backdropFilter: blur(8px)` | Mémoïser la table `lane → tier` hors boucle ; n'insérer que `topY ∈ scrollRange ± 1000` — le mécanisme existe 3 lignes plus haut pour les mois. **Aucun changement de dessin** |
| D16 | `MomentumTimelineV2.tsx:112`, `:281-283` | `let LANE_COUNT`, `let birthDate` : état global muté pendant le rendu, `|| 1200` en repli muet | Passer en props/contexte. Aucun changement visuel |
| D17 | `CapsuleDetailSheet.tsx` (17 chaînes, `:681`→`:1070`) | français en dur servi aux 10 locales | Passer par `perso()`. Corriger `${durationWeeks} semaines` → « 1 semaines » pour une éclipse de 0 jour |

### 3.2 Matching

| # | Fichier:ligne | Ce qui casse | Correctif |
|---|---|---|---|
| M1 | `lib/supabase-store.ts:234` | `fetch` nu : la connexion supprimée revient au redémarrage, les données de naissance restent en base | `apiFetch`, comme ses quatre voisines (`:217`, `:242`, `:248`) |
| M2 | `lib/connection-delineation.ts:124` | 402 avalé : aucun mur payant montré, dégradation silencieuse vers un texte moteur qui dit « Zodiaque Déchaîné » | Traiter `res.status === 402` à part, lire `RequiresPlanError.toJSON()`, ouvrir le paywall. **Le seul correctif de ce plan qui rapporte de l'argent le jour où il est posé** |
| M3 | `app/api/toctoc/route.ts:23-25`, `:90-93`, `:110` | clef triée → panneaux inversés entre deux comptes ; `relationship`/`months`/`locale` hors clef ; échec mis en cache 24 h | Rôle explicite dans la clef, ajouter les trois champs, `if (cacheKey && res.ok && data.success)` |
| M4 | `app/api/openai/connection-delineation/route.ts:220` vs `:256` | `enforceQuota` avant la lecture du cache L2 : un retour de cache brûle le quota hebdomadaire | Déplacer la porte après la lecture L2 |
| M5 | `connection-delineation.ts:87-101` + `:88-91` | `constructiveDirection` — la prose que le moteur a écrite — n'est pas envoyée au modèle, mais `birthDate/birthTime/lat/lng` le sont | Envoyer `constructiveDirection`, retirer les 4 champs de naissance du message utilisateur (ils ne servent qu'à la clef de cache) |
| M6 | `connection-prompt.md:13`, `:28`, `:30` | ordonne de nommer la technique dans chaque phrase, donne un seuil de rareté inapplicable (tout ZR L2 = 51 à 74 = « rare »), et parle de « ~42 ans » | Réécrire sur la règle du domaine ; le palier est calculé serveur et passé en clair ; retirer la ligne d'âge. Hacher le fichier au lieu de `PROMPT_VERSION = "v1"` |
| M7 | `lib/connection-brief-api.ts:17` | type déclare 3 catégories, le moteur en envoie 7 dont `unknown` (3/66) | Élargir le type ; un test qui refuse une catégorie non déclarée |
| M8 | `lib/connection-summary.ts:147` | trie sur `primarySignal.score` qui vaut 4 pour tout ZR (44/66) et 3 sinon : la ligne affiche « Chapitre ZR » pour presque toute connexion | Ne pas trier sur ce champ tant que Marie-Ange n'a pas dit ce qu'il est |
| M9 | `lib/connections-store.ts:200-219`, `:132-139` | naissance en clair dans une query string ; codes d'invitation 32⁴ tirés sans vérification d'unicité (collision attendue ~1 200 utilisateurs) | Jeton opaque côté serveur ; unicité vérifiée à la création |
| M10 | `lib/matching-narratives.ts` (en tête) | 380 lignes débranchées portant `Pluto→neptune`, `zr→jupiter`, inconnu→`sun`, maison 7 par défaut — rebranchables par erreur | **Marquer le fichier en tête** (`@deprecated` + pourquoi). Ne rien retirer. Étendre `verifier-code-mort.mjs` aux exports morts |
| M11 | `app/app/compatibility/test/page.tsx` | route publique de l'export statique, deux naissances en dur, appelle la route OpenAI payante ; `verifier-pages-jetables.mjs` ne l'attrape pas (cherche un aveu textuel) | La sortir du build (`scripts/build-native.sh`) et élargir le contrôle aux pages `/test/` |

### 3.3 Verrous à poser (écrits, éprouvés, non installés — dans `…/scratchpad/`)

| Ordre | Script | État au premier lancement | Ce qu'il ferme |
|---|---|---|---|
| V1 | `verifier-origine-native.mjs` | **vert** (17 chemins écartés, 126 fichiers embarqués) | le bug signature : 16/16 contrôles actuels ne le voient pas |
| V2 | `verifier-serveur-local.mjs` | **rouge** — attrape le port 3333 tenu par `/Users/jhondoe/Documents/unfold` | un vert qui ment ; sans lui tout le reste peut mentir |
| V3 | `verifier-plafonds.mjs` | **vert** | desserrage silencieux des 5 cliquets et retrait d'un contrôle du tableau |
| V4 | `verifier-contrat-llm.mjs` | **rouge, 7 ruptures** dont `convergenceNote` sans `convergence` | le contrat de reporting |
| V5 | `verifier-silence.mjs` | **rouge, 3 manques** | la règle de silence — devient vert quand §4 est branché |
| V6 | — | `.github/workflows/apps.yml` après `:24` : les 23 parcours coûtent 36 s et ne tournent jamais | |

---

## 4. Le reporting

### 4.1 L'algorithme de convergence retenu

**Une seule loi de convergence dans le dépôt : `lib/silence.ts`.** Elle existe, elle est typée, `tsc` passe. Ce qui change après contradiction :

| Point | Proposition | Contradiction | Décision |
|---|---|---|---|
| Seuil | `SEUIL_TECHNIQUES = 2` | 128/138 fenêtres ont Force = 2 : le champ est constant, il « ne montre » rien | **Gardé à 2.** À 3 : 10 fenêtres en 100 ans, première en 2047 — ce n'est plus du silence, c'est l'absence de produit. Mais Force ne s'affiche **pas comme un nombre** (§4.3) |
| Fond ≥ 60 j / déclencheur ≤ 45 j | seuils « structurels », bandes vides 44-50 et 52-60 | les bandes sont une propriété de **ce thème** : durée L3 = L2/12, les L2 de 751 et 811 j donneraient des L3 de 64 et 69 j, donc des fonds | **Gardé, requalifié en choix**, pas en structure. Sensibilité à republier sur 8 thèmes avant d'annoncer un chiffre |
| Lots ZR | 3 lots = 3 familles (« souple », 7,8 %) | 138/138 fenêtres ont un fond ZR ; 46/138 n'ont **que** du ZR ; les 3 prochaines fenêtres sont ZR-seul, même maison, **même signe** — c'est une technique lue deux fois | **Changé : lecture stricte.** Une fenêtre dont tous les participants tiennent dans une seule classe de technique est refusée. Mesuré : 88–92 fenêtres, 4,4–4,5 % |
| Éclipses | famille `nodal` autonome | la maison retenue est celle que le moteur **exclut** : 159/159, `tc` d'une éclipse ne contient que les maisons régies par `np` | **Changé : `nodal` ne vote pas** jusqu'à réponse de Marie-Ange (§6, Q2). Coût : les ~20 fenêtres `nodal+zr`. Reste de l'ordre de 70 fenêtres sur 100 ans **[à remesurer]** |
| Maisons régies | interdites de vote | 4 maisons sur 12 (2, 3, 5, 12) inatteignables à vie : l'app ne peut jamais parler d'argent à cette personne | **Non tranché — question fermée à Christophe (§7 Q3).** En l'état l'interdit tient, et le trou est signalé |
| « Le moteur a le dernier mot à la baisse » | règle du §7 | `silence.ts:495` retourne `entree.force` sans `min()`, et l'appliquer coûterait un `boudin-detail` (50 s) par participant | **Retirée.** Le rabattement ne s'applique qu'au boudin ouvert par l'utilisateur |
| Fenêtre affichée | intersection des bornes élémentaires | 21/138 fenêtres affichent une date fausse en silence, `approximee: false` | **Corrigé** : recouvrement calculé sur `max(debut)`/`min(fin)` des participants |
| Exécutabilité | « lancé sur les captures réelles » | `votesDepuisBoudins` rend **0 vote** sur `appshort.json` : `cat` vs `category`, `np` vs `natalPoint`, `pH` vs `periodHousePlacement` | **Corrigé** : adaptateur de clefs court→long en entrée (~12 lignes). Sans lui rien ne tourne |
| États vides | 3 branches annoncées | 2 seulement atteignables ; `ref = null` rend « aucun-accord » | **Corrigé** : `etatDuJour(fenetres, votes, jour, ref)`, `ref == null || !ref.unanime` → `referentiel-indisponible`, `votes.length === 0` → `donnees-absentes` |

**Ce qui ne bouge pas** : jamais d'addition d'`intensityScore` (4 échelles, une signée) ; le seul champ comparable est `score`/`sc` 1-4, en bijection mesurée avec `w` (thin/medium/large) ; l'ordre est force ↓ → largeur de fenêtre ↑ → niveau ↓ → date ↑ ; aucun appel réseau ajouté ; aucun calcul d'astrologie refait au-delà de `maisonDuBoudin`, dont le postulat est vérifié 1 806/1 806 contre les sorties du moteur.

**Ce que la contradiction laisse ouvert et que ce plan ne referme pas** : à 4,4 %, une fenêtre glissante de 7 jours croise un accord dans **9,8 %** des cas en lecture souple — moins en stricte. Un essai de 7 jours se termine sans que l'app ait parlé, presque toujours. Conséquence retenue au §5 : l'essai est supprimé et **l'écran de silence doit lui-même porter la valeur** (chapitres passés + fond en cours + date de la prochaine fenêtre). Ce n'est pas un correctif d'algorithme, c'est une décision de produit, prise ici et assumée.

### 4.2 Correction à porter dans les règles

`REPORTING-REGLES.md:35` nomme `convergence.overlappingEvents` comme source de **Force**. Mesuré sur `tt_78_h1` : `overlappingEvents = 9` (dont `tt_895` et `tt_896`, le L2 et le L3 du même lot), `sameHouseEvents = 1`. **Le champ juste est `sameHouseEvents`.** À corriger dans le document de règles.

### 4.3 La structure du rapport

Troisième onglet (`components/demo/BottomNav.tsx:88`, `navItems` n'a aujourd'hui que 2 entrées), route `app/app/rapport/page.tsx`. Écran défilant d'un seul tenant, pas de carrousel, aucun appel réseau depuis l'écran : il lit le magasin déjà rempli par `fetchAppData` / `fetchYearData` (`callProxy`).

| # | Section | Payant | Contenu | Source |
|---|---|---|---|---|
| 1 | En-tête | non | « X ans lus. N moments retenus. Sur M mois, on n'en signale que N. » | âge depuis `birthData` ; N et M comptés par `silence.ts` |
| 2 | Les chapitres du passé | non | une carte par fenêtre, du plus ancien au plus récent | `fenetresDeConvergence` |
| 3 | Ce que le rapport ne dit pas | non | la part de mois où rien ne se recoupe, chiffrée | même comptage |
| 4 | Aujourd'hui | non | fenêtre en cours, sinon fond ZR L2 en cours + date de la prochaine | `etatDuJour` |
| 5 | Les fonds en cours | oui | ZR L2 actifs, triés par fin croissante, domaine par `pH` | `toctoc-app-short` |
| 6 | La prochaine fois | oui | fenêtres futures + bloc distinct « quand le fond change » | idem |
| 7 | Quoi faire | oui | une phrase LLM sous contrainte, marquée comme générée (AI Act art. 50) | `llmPayload` |

**Anatomie d'une carte — quatre champs, aucun de plus** :

| Champ | Ce qui s'affiche | Source | Jamais |
|---|---|---|---|
| **Quand** | le mois, et le jour seulement si toutes les bornes viennent du moteur | `min(s)` / `max(e)` des participants | approximé en silence — `datesApproximees` fait retomber sur `moisAnnee()` |
| **Quoi** | le domaine en clair | `nomMaison(h, locale)` (`lib/maisons-i18n.ts:47`, 10 langues), glosé par `houseConfig[h]`. `periodHousePlacement.signification` sert de **contrôle**, pas d'affichage : elle est en anglais et absente du paquet court | inventé — pas de maison, pas de carte |
| **Force** | **le dessin, pas le nombre** : deux ou trois barres horizontales alignées sur un axe commun, chacune avec sa durée et ses dates réelles | `s` / `e` de chaque participant | arrondi à la hausse ; et pas de nombre, puisqu'il vaut 2 dans 93 % des cas |
| **Quoi faire** | passé : une question (« tu te souviens ? », 3 boutons, `localStorage` seul, **aucun agrégat envoyé** — RGPD art. 9) ; présent/futur : la phrase LLM | `FeedbackThumb.tsx` étendu à 3 états | une prédiction ; si le modèle ne répond pas, le bloc n'existe pas |

**Aucun texte de LLM dans les chapitres du passé.** La crédibilité de la section vient de ce que rien n'y est rédigé.

**Les familles ne sont jamais nommées côté utilisateur.** `zr` → *le fond*, `transit`+`station` → *le passage*. `eclipse` → question fermée §7 Q4 (le mot est connu de tous mais ouvre la porte aux onze autres).

### 4.4 Ce que voit l'utilisateur

- **Ouverture** : un rapport de sa vie, gratuit, complet, sans compte. Deux à cinq chapitres datés qu'il peut confronter à sa mémoire. **[Densité à mesurer sur 8 thèmes avant de dessiner — c'est la condition de lancement du lot 3.]**
- **Le reste du temps** : l'app se tait. L'écran de silence affiche le chapitre de fond en cours (maison + signification, en décor : ni Force, ni clé d'action, ni texte de modèle) et la date de la prochaine fenêtre. Un « rien avant deux ans » est un résultat, pas un chargement qui n'aboutit pas.
- **Quand ça parle** : quatre champs, dont un dessin qui montre l'accord au lieu de le faire croire.

---

## 5. Le modèle économique

**Abonnement annuel, 39,99 €, plan unique, aucun essai, mur sur la ligne d'aujourd'hui.**

| Terme | Décision | Ce que la contradiction reprochait / ce que j'en fais |
|---|---|---|
| Annuel 39,99 € | valeur déjà dans `lib/billing/features.ts:94` | Reproche : le prix affiché sur iOS vient de StoreKit (`lib/achats.ts:91-103`), pas de nos constantes, et les produits n'existent pas. **Retenu quand même** : c'est le palier à créer dans App Store Connect. Le chiffre reste à confirmer par Christophe |
| Mensuel retiré de l'offre | code laissé en place | Reproche : les LTV 10,33 € / 53,32 € sont fausses — `1/(1−r)` est réfutée par le fichier dont elle tire son entrée (42 %/mois donnerait 0,002 % à 12 mois, mesuré 17,0 %). **Chiffres abandonnés.** Le retrait tient sur un autre motif : plan unique = pas de bascule à comprendre. Coût réel, à assumer : `economieAnnuelle()` (`features.ts:122-126`), la bascule (`pricing/page.tsx:721`) et les « −44 % » en dur des 4 fiches deviennent sans objet |
| Aucun essai | `checkout/route.ts:97` `trial_period_days` | La phrase « annulable à tout moment » vit dans `pricing/page.tsx` clés `engagement`/`engagement_an` (10 locales) et dans `APP_STORE_METADATA.md:57,123,185`, **pas** dans `lib/billing/copy.ts:52` qui n'est importé par personne. Chantier i18n + fiche magasin, pas une ligne |
| Mur sur aujourd'hui | **existe déjà** | Reproche fondé : `FUTURE_CAPSULES.freeQuota = 0` + contrôle serveur `connection-delineation/route.ts:213-219` + flou sur la timeline. Le §6 de la proposition **décrivait l'existant comme une décision**. Ce qui reste à faire : fermer la même porte sur `personalize`, où le quota tombe **avant** de connaître les dates (`:581-604` avant le `fetch` `:645`) → résoudre `boudinId → startDate` côté serveur depuis `toctoc-year` (2,3 s, cacheable 30 j) |
| `AI_DELINEATION.freeQuota` | **inchangé** | La proposition le passait à 0. Mesuré : `personalize/route.ts:595` enforce ce quota pour **toute** capsule, passé compris → à 0, le rapport gratuit sur le passé n'a plus de champ « Quoi faire ». La proposition supprimait son propre appât en sa seule ligne de code |
| Force gratuite sur les fenêtres futures | **abandonné** | `convergence` vient de `boudin-detail`, 50 s par boudin, derrière la porte de quota. Ce qui reste gratuit derrière le flou : **Quand** (le mois) seulement |
| Matching | gratuit, limité à 1, **non vendu** | Reproche : `personAFocus` est un champ mono-personne, sa constance ne prouve pas l'absence de calcul de couple ; `tier`, `tierScore`, `sharedTheme`, `actionTogether` n'ont pas été testés sur (A,B1) vs (A,B2). **Décision maintenue mais requalifiée** : ne pas vendre tant que le test n'est pas fait (§8, lot 4) — pas « parce que c'est fabriqué », mais « parce qu'on ne sait pas encore » |
| Une seule vérité sur le partage | à écrire dans `lib/billing/features.ts` | Aujourd'hui trois : `features.ts:63-66` (`freeQuota: -1`), `premium-gate.ts:33` (`freeLimit: 1`), `APP_STORE_METADATA.md:54` vs `:62`. Le relecteur Apple lit la troisième |

**Bloqueurs d'encaissement, indépendants du modèle** : produits iOS non créés (C17) ; `NON_RENEWING_PURCHASE` ignoré et `lifetime` absent du `CHECK` (C16, vérifié dans le fichier, **pas en production**) ; `checkout.stripe.com` autorisé dans la vue web native (`capacitor.config.ts`) = risque 3.1.1 ; **aucune entité juridique, encaissement sous Zebrapad, Inc. (`JG9V6PMN8T`), aucun accord écrit avec Marie-Ange dont le moteur est le produit**. Ce dernier point n'est pas un réglage de prix : c'est un préalable, il est au lot 0.

**Conformité 3.1.2(a) / 3.1.2(c)** : la valeur continue s'argumente par `profection_year_change` (365 j, nouvelle `profectedHouse` et nouveau `profectionRuler` chaque année — une cadence calculée, pas marketée) et par le renouvellement continu des transits. **Ne pas s'appuyer sur les notifications** : aucune n'est jamais arrivée sur un vrai téléphone, et l'annoncer déclenche 2.3.1.

**Conformité 4.3(b)** : ce qui nous sépare de la catégorie refusée est produit, pas commercial — la règle de silence branchée et le contrat du LLM refermé. **Le mur ne se pose pas avant que la carte payée porte ses quatre champs depuis des valeurs calculées.**

---

## 6. À demander à Marie-Ange

Une seule fois, avec les mesures. Chaque ligne est répondable sans aller-retour.

| # | Demande | Mesure jointe |
|---|---|---|
| Q1 | **`/api/period-quality` répond 500.** Corps exact : `{"success":false,"error":"Output file not created: D:\\51.full-suite-api\\output\\calc_...json"}`. La route existe, le calculateur se lance, il ne produit pas de fichier. C'est le seul point d'entrée qui rend le rapport déjà rédigé (`lifeParts`, `chapters[].houseTopic`, `currentBackground`). Peux-tu le remettre en service ? | corps d'erreur ci-contre, relevé 02/09 |
| Q2 | **Pour une éclipse, quelle maison compte** : celle de `natalPoint` ou celle du degré (`eclipseSign`/`eclipseLongitude`) ? Mesuré : `tc` d'une éclipse contient **uniquement les maisons régies** par `natalPoint`, 216/216, et la maison occupée en est **exclue 159/159**. Pour un transit, `topics` contient la maison occupée. Est-ce voulu ? | 216/216, 159/159 |
| Q3 | **`toctoc-app-short` peut-il rendre les profections annuelles sur la vie entière**, comme `toctoc-year` le fait sur 3 ans ? C'est la seule technique de classe vraiment différente disponible à coût nul ; sans elle, toute convergence viagère repose sur le ZR. | app-short rend 4 catégories : zr 884, transit 833, eclipse 216, station 89 |
| Q4 | **`convergence.overlappingEvents` compte-t-il volontairement L2 et L3 d'un même lot comme deux** (`tt_895` + `tt_896` dans la même réponse) ? Et **`sameHouseEvents` applique-t-il déjà un rabattement** ? Existe-t-il un point d'entrée rendant `convergence` pour une **liste** de boudins en un appel ? | `overlappingEvents: 9`, `sameHouseEvents: 1` sur `tt_78_h1` |
| Q5 | **Temps de réponse.** `toctoc-boudin-detail` 49,9 s et 57,3 s ; `toctoc-highlights` 48,4 s et 45,2 s ; `toctoc-app-short` 66,8 s ; `toctoc-year` 1,3 s de calcul. Est-ce le régime attendu, ou un mode dégradé ? Un mode « détail sans recalcul » est-il possible ? | 6 appels chronométrés, 02/09 |
| Q6 | **`connection-brief` calcule-t-il quelque chose entre les deux personnes** hors `tierScore` ? Mesuré : `personAFocus` identique bit pour bit pour A face à deux B totalement différents, sur 3 mois. Et **`tier` vaut `PEAK` sur 33 périodes sur 33** (`tierScore` 256 à 629) — quels sont les seuils ? Peut-il rendre `periodHousePlacement` pour les deux personnes, et un `convergence` entre elles ? | 33/33, 2 paires × 4 dates |
| Q7 | **Trois champs de `connection-brief` sans définition** : `primarySignal.score` vaut 4 pour tout ZR (44/66) et 3 sinon — rang ou intensité ? `category: "unknown"` (3/66) ? `monthScore.transit` négatif (−8, −23, −34, −64) — que signifie le signe ? | 66 blocs |
| Q8 | **`boudinId` est-il une identité stable entre points d'entrée ?** Mesuré : `tt_21` est un ZR de 2025 dans `toctoc-year` et un transit de 1994 dans `toctoc-app-short`. Si ce sont des index de charge utile, quelle clef utiliser pour désigner un boudin dans `toctoc-boudin-detail` ? | `tt_21`, deux endpoints |
| Q9 | **`data.houseColors` est-il natal ou fixe ?** 12 couleurs reçues sur un seul thème, elles ressemblent à une palette fixe. | 1 thème |

---

## 7. Décisions de Christophe — questions fermées

| # | Question | Ce que ça déclenche |
|---|---|---|
| Q1 | Les trois lots ZR (Fortune/Spirit/Eros) comptent-ils pour **une seule** technique ? **[recommandé : oui]** | Oui → 88 fenêtres/vie, prochaine dans 8 ans pour le thème de référence, mais aucune fausse convergence. Non → 138 fenêtres dont 46 ZR-seul, la première carte du produit est un faux positif |
| Q2 | Publie-t-on avec un rapport qui, sur certains thèmes, peut n'avoir **aucun** chapitre passé ? | Oui → l'app le dit et s'arrête, gratuitement. Non → il faut une deuxième source de volume (Q3 de Marie-Ange) avant de dessiner |
| Q3 | Les **maisons régies** votent-elles dans la convergence ? **[recommandé : non, et on affiche le trou]** | Non → 4 maisons sur 12 (argent, communication, création, retrait) ne sortent jamais pour ce thème. Oui → le volume triple et la preuve s'affaiblit |
| Q4 | Le mot « **éclipse** » apparaît-il à l'écran ? **[recommandé : non]** | Non → « le point de bascule ». Oui → un mot d'astrologie ouvre la recherche des onze autres |
| Q5 | Retire-t-on le **mensuel** de l'offre ? | Oui → réécrire `economieAnnuelle()`, la bascule, et les « −44 % » des 4 fiches magasin |
| Q6 | Supprime-t-on l'**essai 7 jours** ? **[recommandé : oui]** | Oui → chantier i18n (10 locales) + 4 fiches. Corrige aussi une affirmation fausse sur l'annulation |
| Q7 | Le **matching** reste-t-il gratuit et limité à 1, non vendu ? | Oui → une seule vérité à écrire dans `features.ts`, et la fiche cesse de promettre « Unlimited connections » |
| Q8 | Couleur d'un domaine : `data.houseColors` du moteur ou ta palette (`houseConfig`) ? **[ton domaine]** | Le moteur rend `#AAD681`, `#FED857`, `#F375CB` ; `domain-config.tsx:44` décrit la palette du produit comme « muted, never loud » |
| Q9 | Le **Rapport** prend-il la 3e place de la nav (aujourd'hui 2 entrées) ? | Oui → `BottomNav.tsx:88` + clef `nav.rapport` × 10 locales |
| Q10 | La question « tu te souviens ? » reste-t-elle **strictement locale** (aucun agrégat envoyé) ? **[recommandé : oui]** | Un envoi lierait une lecture astrologique à un événement de vie déclaré : RGPD art. 9 |
| Q11 | On mesure sur **8 thèmes** avant de dessiner le rapport, ou on dessine sur celui de référence ? **[recommandé : 8]** | Tous les chiffres de densité de ce plan valent pour 1985-04-12 08:30 Bruxelles |

---

## 8. Ordre d'exécution

| Lot | Contenu | Bloque | Bloqué par |
|---|---|---|---|
| **0 — Le sol** | V1 origine native · V2 serveur local · V3 plafonds · V6 parcours en CI · `scripts/verifier-moteur.mjs` enchaîné et son commentaire `:84` corrigé · préalable juridique : accord écrit Marie-Ange + entité d'encaissement | tout le reste (sans V2, tout vert peut mentir) | rien |
| **1 — La vérité de la donnée** | D2 dates ZR · D3 fenêtres réelles · D4 maison · D5 domaine/planète `null` · D6 lotType + markers · D1 `boudinId` · D9 clef de cache IA · D7 trois états · C7 échelles de score | lots 2, 3, 5 | lot 0 |
| **2 — Le contrat du LLM** | D10 `convergence` lu et passé · D11 `intensite` · D12 · D13 · D14 · V4 vert · marque AI Act art. 50 | lot 3 §7, lot 5 (4.3(b)) | lot 1 (D1) |
| **3 — La convergence** | adaptateur de clefs court→long · lecture stricte · `nodal` ne vote pas · recouvrement sur participants · `etatDuJour` à 4 branches · **mesure sur 8 thèmes** (couverture, maisons jamais atteintes, chapitres passés médians) · V5 vert | lot 4 | lots 1 et 2 ; Q1/Q3 Christophe |
| **4 — Le rapport** | onglet, 7 sections, carte à 4 champs, barres d'accord, question « tu te souviens », `PremiumBlur` sur 5-7, i18n 10 langues | lot 6 | lot 3 + Q2/Q4/Q8/Q9/Q11 Christophe |
| **5 — Le matching** | M1 `apiFetch` · M2 mur payant visible · M3 clefs de cache · M4 quota après cache · M5 `constructiveDirection` · M6 prompt réécrit · M7/M8 types · M9 invitations · M10 marquage · M11 page de test hors build · **le test (A,B1) vs (A,B2) sur `sharedTheme`/`actionTogether`** | Q7 Christophe, décision « vendu ou non » | lot 0 (V1) ; Q6/Q7 Marie-Ange |
| **6 — L'argent** | palier 39,99 créé dans App Store Connect · essai retiré (10 locales + 4 fiches) · mensuel retiré de l'offre + `economieAnnuelle()` · porte de date côté serveur sur `personalize` · C16 webhook + `CHECK` vérifié en production · `checkout.stripe.com` hors vue native · une seule vérité de partage dans `features.ts` | mise en vente | lots 2, 4 ; Q5/Q6/Q7 Christophe ; préalable juridique du lot 0 |
| **7 — La dette** | D8 navigation liste · D15 perf overview · D16 état global · D17 i18n fiche · C10 deux lois de palier | — | rien (peut avancer en parallèle) |

**Chemin critique** : lot 0 → lot 1 → lot 2 → lot 3 (+ mesure 8 thèmes) → lot 4 → lot 6. Les lots 5 et 7 sont parallèles.
**Aucun build TestFlight avant la fin du lot 4**, et jamais sans le demander.

---

## Écarté, et pourquoi

| Écarté | Motif, mesuré |
|---|---|
| `lib/rapport-fenetres.ts` + `lib/rapport-familles.ts` | Créeraient une **deuxième loi de convergence** contradictoire avec `lib/silence.ts` — exactement le défaut reproché à `capsules.ts` vs `MomentumTimelineV2.tsx:329`. Le rapport consomme `votesDepuisBoudins` + `fenetresDeConvergence` |
| Les « 22 fenêtres / 9 chapitres du passé » du rapport | Obtenues en comptant **toutes** les maisons de `th` (occupée + régies) — la règle que le même document interdit trois pages plus loin. Sous sa propre règle : 6 fenêtres, 2 passées, la dernière en 2010. Et son contrôle `periodHousePlacement` **contredit 13 de ses 22 fenêtres**, dont la carte-vitrine « Couple nov. 2002 », portée par des boudins dont le moteur dit maison 2 et maison 4 |
| Le §0.d du rapport (« 11 fenêtres au lieu de 22 sans les éclipses ») | Arithmétiquement impossible : sans la famille éclipse le maximum atteignable est 2 < 3, donc 0 fenêtre |
| La lecture souple (fenêtres ZR-seul) | Les 3 prochaines fenêtres sont ZR-seul, même maison, **même signe**, à deux niveaux d'emboîtement. « Deux techniques indépendantes » y désigne une technique lue deux fois |
| `AI_DELINEATION.freeQuota` → 0 | `personalize/route.ts:595` enforce ce quota pour toute capsule, passé compris. Cette ligne supprimerait le rapport gratuit qu'elle sert à vendre |
| Toucher `MomentumTimelineV2.tsx:1372` | Ce n'est pas un filtre d'affichage mais le `useEffect` de préchauffage IA. Le retirer ferait générer trois délinéations à un compte gratuit sur des capsules qu'il ne peut pas ouvrir. Et le mur visible est déjà dessiné par Christophe |
| Achat unique / offre « à vie » à 49 € | `webhook/revenuecat/route.ts:280-281` ignore `NON_RENEWING_PURCHASE` : encaissé par Apple, sans effet. Et à 49 € contre 39,99 €/an, elle rend l'annuel invendable |
| Les espérances de LTV 10,33 € / 53,32 € | `1/(1−r)` réfutée par sa propre source : 42 %/mois donnerait 0,002 % de rétention à 12 mois, mesuré 17,0 % |
| Force affichée en nombre | 2 sur 128 des 138 fenêtres. Un champ constant ne montre rien — remplacé par le dessin des barres |
| Force gratuite sur les fenêtres futures | Vient de `boudin-detail` : un appel de 50 s par capsule, offert |
| « Le moteur a le dernier mot à la baisse » sur les fenêtres | La ligne n'existe pas (`silence.ts:495` retourne sans `min()`), et l'écrire coûterait un `boudin-detail` par participant |
| `toctoc-highlights` comme contenu | `isBusy` vrai pour 37 années sur 47 ; les « années difficiles » sont en fait **calmes** (`sumNegative = 0` sur 21/47). Titrer dessus serait une donnée fabriquée. 45 s d'appel pour rien |
| `periodQuality` affichée | Une qualité posée sur un chapitre du passé se lit comme un jugement sur la vie ; `REPORTING-REGLES.md:57` interdit le score global de vie |
| `constructiveDirection` comme texte de repli | Contient littéralement « votre Zodiaque Déchaîné » — du jargon brut servi comme filet |
| `/api/profection` comme 4e famille sur le passé | La mesure annoncée (« 5 variantes de paramètre, toutes `age: 41` ») n'existe pas dans la capture citée : `prof.out` contient 2 appels et une seule variante. L'affirmation est retirée, la question passe à Marie-Ange (Q3) |
| Les cusps Placidus de `/api/chart-data` comme frontières de maisons | Donneraient des maisons fausses par rapport au moteur, qui travaille en signes entiers (1 806/1 806). À corriger aussi dans `APP_STORE_METADATA.md:66` et `:132`, qui annoncent « maisons Placidus » |
| `eclipseAxis: "1-7"` comme axe de maisons | Axe de **signes** dans le zodiaque naturel (`types/api.ts:429`). Faux positif garanti |
| Empiler espace + fond teinté sur les cartes | `favorable-design/SKILL.md:138-142` : on prend le premier moyen qui suffit, on n'en empile jamais deux. Un seul sera choisi — par Christophe |

**Aucune suppression de fichier n'est proposée dans ce plan.** `lib/matching-narratives.ts`, `lib/momentum-highlights.ts`, `buildSmartSystemPrompt` et `app/app/compatibility/test/page.tsx` sont **marqués** ou **sortis du build**, pas retirés.