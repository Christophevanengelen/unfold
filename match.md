# Matching — à tirer, puis à brancher (17 sept. 2026)

Christophe — Marie-Ange a **corrigé `POST /api/match`**. Les trois cartes qui
manquaient (lien, entente, tempérament) arrivent maintenant du moteur.
**Tire le dépôt, puis fais brancher le matching sur ce nouvel endpoint.**
Ne recalcule rien côté app.

```
git pull origin main
```

La carte écran → champ, avec la forme JSON exacte, est dans
[`API-MATCHING.md`](API-MATCHING.md). C’est le document à donner à l’agent
qui écrit le code. `MATCHING-CONTRAT.md` décrit **l’ancienne** réponse
mesurée le matin du 17 : ne plus s’en servir comme source de vérité.

## Ce qui est prêt à afficher

Quatre questions distinctes. **Ne les fusionne pas en un seul score.**

| Carte (tes captures) | Champ moteur | État |
|---|---|---|
| Compatibilité % | `compatibility` | déjà lu — le % reste une comparaison à deux, pas le classement des 400 plus proches |
| Radar « ce qui t’attire » | `compatibilityRadar` | déjà lu |
| Ressemblance % | `resemblance` | déjà lu |
| Radar « à quel point vous vous ressemblez » | `similarityRadar` | **jamais lu** — c’est le détail par axe de la ressemblance, à ouvrir |
| Équilibre | `balance` | déjà lu |
| Attraction / étincelle | `attraction` | **forme changée** : plus un % dans les deux sens, une liste d’aspects. Sans mise à jour, la carte affichera 0 |
| **Avez-vous un lien ?** | **`bond`** | **nouveau** — tempérament + éléments + liens de confort |
| Tempérament (jauges Feu / Terre) | `generalUnderstanding` | **enrichi** — mêmes jauges, plus `headline`, `element1Pct` / `element2Pct`, `temperamentCompare` |
| **Comment vous entendez-vous ?** | **`mutualUnderstanding`** | **enrichi** — `headline` + `hits` + `bulletPoints` |
| Qui mène | `boss` | déjà lu (on se tait sous 60 % de confiance) |
| Le plus loyal | `exclusive` | déjà lu |
| Les dons | `gift` | le moteur envoie maintenant les deux sens en champs, plus seulement un score |
| Câlins | `hugs` | encore approximatif — ne bloque pas le reste |

## Ce que tu (ou l’agent) dois faire, dans l’ordre

1. `git pull origin main`
2. Lire [`API-MATCHING.md`](API-MATCHING.md) — surtout les trois champs
   détaillés du 17 sept. (`bond`, `generalUnderstanding`, `mutualUnderstanding`)
3. Brancher `lib/match-lecture.ts` + l’écran du rapport sur **cette** forme,
   pas sur l’ancienne
4. **Casser le cache** `unfold_match_cache` (renommer la clé). Sans ça, un
   rapport déjà ouvert garde l’ancienne réponse pour toujours
5. Vérifier les 12 cartes, couple de test :
   `1977-09-27 00:00` / `1980-10-24 01:41`, Bruxelles

## Garde-fous (ne pas les relâcher)

- L’app **ne recalcule rien**. Tout chiffre vient du moteur.
- Les `bulletPoints` et `headline` arrivent en anglais et nomment encore la
  technique (`Mercury`, `sextile`, `orb`). Le garde-fou jargon les rejettera
  s’ils passent tels quels à l’écran. Afficher les jauges, les scores, les
  codes ; les phrases se traduisent dans le dictionnaire, en dix langues.
- Spark, lien, entente et compatibilité répondent à quatre questions
  différentes. Un seul pourcentage pour les quatre serait un mensonge.

## Ce qui n’est pas à toi de trancher aujourd’hui

Le % de compatibilité de l’ancienne app classait la personne parmi tes
~400 plus proches dans toute la base. On garde la comparaison à deux,
moins chère, déjà à l’écran. On y reviendra si les gens comparent leurs
scores entre amis et que ça sonne faux.
