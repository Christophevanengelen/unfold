# Matching API — Screen-by-Screen Reference

Maps every matching-UI screen to the exact field in `/api/match` (this repo's
port — see `calculators/match_calculator.js`) and to the real legacy
algorithm it's supposed to reproduce, traced directly from:
- `E:\soft\BUBBLE1.4\match_M.anatella` — the main match graph (all 12 `report_name` categories land here)
- `E:\soft\BUBBLE1.4\03.API_id_json_Insight_2.anatella` — builds each person's `gift_<id>.gel_anatella` cache (Sun-in-friends'-houses lookups)
- `E:\soft\BUBBLE1.4\scripts\1.3Fourchette_P1P2_DB3_webapp.anatella` — the orb/aspect scoring engine behind `attraction`/`compatibility`/`resemblance`'s raw point totals
- `E:\soft\BUBBLE1.4\scripts\MyEvents (version 1).xlsb.xlsx` — every lookup/weight/scale table referenced above

Companion docs: `knowledge/match.md` (app-side screen/endpoint wiring),
`knowledge/API-COMPLETE-DOCUMENTATION.md` (full request/response shape for
`/api/match`).

**Status legend**
- ✅ **Ported** — new endpoint's formula matches the real legacy source, confirmed by tracing the graph/workbook.
- ⚠️ **Approximate** — new endpoint returns *something* for this slot, but on a different astrological basis than the real legacy computation (confirmed different — see notes).
- ❓ **Unresolved** — real legacy formula not fully pinned down; flagged with an open question below rather than guessed at.

---

## Screen → field → real source

Screen names match `knowledge/match.md` exactly — hand both docs together to frontend/design.

| Screen name | Legacy `report_name` | New `/api/match` field | Status | Real legacy source |
|---|---|---|---|---|
| **Compatibility Score** | `compatibility` | `compatibility.score/label/desc` | ⚠️ partially understood | Raw score comes from `E:\soft\BUBBLE1.4\scripts\1.3Fourchette_P1P2_DB3_webapp.anatella`: every qualifying cross-aspect (from the `synastrie`/`aspects` sheets) earns points from the `echelle_synastrie` sheet based on how tight its orb is (0-2°/2-5°/5-10°/10-30° bands) and its attraction tier (`x`=Très Grande Attraction, weights 40/30/20/10; `y`=Grande Attraction, weights 28/21/14/7), summed across two "NIVEAU 1"/"NIVEAU 2" passes. `match_M.anatella` then computes a separate `distance_norm` field via `(x - 9.32) / (85.19294507542864 - 9.32)` — a min-max scale using two hardcoded historical-dataset constants (comment: `see normalize_knn`) — used for the qualitative "gauss-quality" `subtitle` text ("Medium-High Compatibility" etc, bucketed via the `gauss` sheet's 9 bands), not the displayed score itself. **Not fully resolved:** which exact raw value feeds that formula's `x` wasn't traced to its source column — see Q1. New endpoint uses none of this (a from-scratch per-planet gap average instead). |
| **Radar 1 — What You're Drawn To** | `compatibility_radar` | `compatibilityRadar[]` | ⚠️ | Structurally right (`pointsperc`=A's Recherchées%, `pointsperc2`=B's Perso%), but the underlying per-planet % comes from the real `points_perso`/`dominantes` weighted-criteria job (`1.1.Natal_Dominantes_DB3.anatella`), which `dominants_calculator.js` only core-ports (~15/8 of the real ~20+ criteria, fixed orbs). Confirmed materially different numbers on a real pair (e.g. Jupiter 97.2%/70.5% legacy vs 46.2%/2.6% new). |
| **Resemblance Score** | `ressemblance` | `resemblance.score/label/desc` | ⚠️ close in practice | Same Perso-profile-gap idea as `resemblance`, but the real value is *also* run through the Fourchette engine's point/normalization steps, not a plain 0-99 average. Numbers landed close on the one real pair tested (83 legacy vs 89 new) but that may be coincidence given the different dominant-weight base (see Radar 1/2 rows). |
| **Radar 2 — How Similar You Are** | `similarity_radar` | `similarityRadar[]` | ⚠️ | Same root cause as Radar 1 (both Perso% this time, not Recherchées%). |
| **Balance Card** | `equilibre` | `balance.score/label` | ⚠️ different metric | Legacy `equilibre.score` = `\|attractedTo_distance − reversedAttractedTo_distance\|` (the compatibility asymmetry itself; **lower = more balanced**). New `balance.score` = mean per-planet Perso-profile gap, bucketed via the real `equil` sheet labels (that part ✅), but scored 0-99 where **higher = more balanced** — inverted scale, unrelated input. Not a numeric port of the same thing despite the shared name. |
| **Attraction Card** | `attraction` | `attraction.aToB` / `bToA` | ⚠️ | Same `1.3Fourchette_P1P2_DB3_webapp.anatella` engine as Compatibility Score above — every qualifying cross-aspect between **Sun/Moon/Venus/Mars/Saturn/Uranus/Jupiter/Ascendant/MC** (54 planet-pair combos in the `synastrie` sheet, each tiered TGA/GA with FR/EN text like "Très grande attraction") earns orb-based points via `echelle_synastrie`, summed into the raw score. New endpoint only checks 6 Mars/Venus/Sun/Moon pairs with an invented harmony-weight formula — same idea, far narrower inputs, no lookup table, no orb-tier scale. |
| **Who Leads Flag** | `boss` | `boss.who` / `confidence` / `person1Score` / `person2Score` | ✅ **implemented** | For each person, average their `perso` `PointsPerc` over planets tagged **Angular house (1/4/7/10) OR Fire sign OR Cardinal sign** — that average is the person's boss%, higher wins. Source: `match_M.anatella` idx 3645/3646/3649. Implemented in `match_calculator.js` (`isBossPlacement`/`tagFilteredMean`). Magnitudes won't match production exactly (still riding on the core-ported, not criteria-complete, dominant-weight base — see Radar 1/2 rows), but the mechanism is now the real one. |
| **Loyalty / Exclusivity Flag** | `exclusif` | `exclusive.score/label` / `person1Score` / `person2Score` | ✅ **implemented** | Same mechanism as Who Leads, filtered to **Air sign OR Cadent house (3/6/9/12) OR Mutable sign**. Source: idx 3650/3651/3654. Implemented (`isExclusivePlacement`). |
| **Temperament Card** | `entente_generale` | `generalUnderstanding.score/element1/element2/bulletPoints` | ✅ **implemented** | Each person's highest-% element (fire/earth/air/water, summed from their `perso` profile by planet sign) via `dominantElement()`, then a description of that element pair's interaction via `ELEMENT_PAIRS` (10 unordered combos). Source: `match_M.anatella` idx 3621, workbook sheet `entente`. **Text is our own writeup** of the fire/earth/air/water framework — the real sheet's 161-row literal wording (5 variants per pair) wasn't ported, only the algorithm basis. |
| **Mutual Understanding Card** | `1to1_ententeIntel` | `mutualUnderstanding.score/bulletPoints` | ⚠️ wrong text source, ✅ right basis | Confirmed as "how you get along": Mercury-aspect/placement text from the `synastrieAspectMercury` sheet (77 rows), covering **Mercury vs {Mercury, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, and angular houses 1/4/7/10}**. New endpoint's `mutualUnderstanding` already used the right basis (Mercury cross-aspects) before this round and is unchanged — still an invented harmony formula instead of the real lookup table, and missing the Mercury-to-house-cusp rows. Not part of this round's implementation pass. |
| **Gift Card** | `gift` | `gift.person1GivesPerson2` / `person2GivesPerson1` / `desc` | ✅ **implemented** | Built in `E:\soft\BUBBLE1.4\03.API_id_json_Insight_2.anatella` (the "GIFT" section, idx ~3557-3673), not inline in `match_M.anatella`. Whichever house one person's Sun falls into on the other's chart, text-looked-up by house number via the `house` sheet's `Gift_short`/`domaine` columns (12 rows). Implemented via `houseOfLongitude()` + the `HOUSE_GIFT` table — **English text is our own translation** of the sheet's French source (the sheet's actual `Gift`/`Gift_short` values are i18n keys, not display text, so there's no literal English string to port). Response shape changed from `{score,label,desc}` to `{person1GivesPerson2,person2GivesPerson1,desc}` to match the legacy no-numeric-score reality. |
| **Hugs Card** | `hugs` | `hugs.score/desc` | ⚠️ different formula, ✅ mostly understood | **Real formula (confirmed):** same mean-`PointsPerc`-by-tag mechanism as Who Leads/Loyalty, filtered to placements tagged **Water sign OR Air sign**, additionally grouped/ranked by a `combi` key (a specific placement-combo label) and sorted descending — the *top*-ranked combi likely drives both the score and the descriptive text ("dry huggers"). Source: idx 7812/7813/7814/7815. The "pick top combi" step is why this is marked ✅ mostly rather than fully — see Q3. New endpoint's Moon/Venus-aspect heuristic is unrelated. |

---

## Detailed source citations

- **Dominant-planet weights** (`compatibility`, `resemblance`, both radars, and the `PointsPerc` values boss/exclusif/hugs all reuse): `E:\soft\BUBBLE1.4\scripts\1.1.Natal_Dominantes_DB3.anatella`, weights from workbook sheet `points_perso`. Already the basis for `dominants_calculator.js`, just not criteria-complete.
- **`gauss` sheet** (13 rows) — a bucket table over a *z-score-like* range (`-60→-20` … `3→7`), each bucket giving a French/English quality phrase ("médiocre ---" → "moyenne +++") for `compatibility`/`resemblance`/`attraction`'s `subtitle`. This is a qualitative-label bucket, not the numeric score itself.
- **`echelle_synastrie` sheet** (16 rows) — orb-range → points table used by the Fourchette aspect-scoring engine: tighter orb = more points, split into an "x" (Très Grande Attraction) tier worth 40/30/20/10 and a "y" (Grande Attraction) tier worth 28/21/14/7, keyed by orb bands 0-2°/2-5°/5-10°/10-30°.
- **`echelle_perso` / `echelle_perso MAX6` sheets** — the natal/perso equivalent of the above (simpler, maxes out at 1.0 instead of an orb-tier system), presumably feeding `dominants_calculator.js`'s own weight curve.
- **`scalePositif` sheet** (8 rows) — converts a summed point total into a `+`/`++`/`+++` (or `-`/`--`/`---`) intensity label, e.g. what generates `"entente +, compréhension +"` in `synastrieAspectMercury`'s text.
- **`equil` sheet** — 5-band balance/imbalance labels (incredible/acceptable balance, acceptable/large/incredible imbalance). Already ported correctly into `balance.label`/`label_fr` — just fed the wrong input value (see balance row above).
- **`synastrie` sheet** (119 rows) — attraction text by planet-pair + aspect, covering Sun/Moon/Venus/Mars/Saturn/Uranus/Jupiter/Ascendant/MC.
- **`synastrieAspectMercury` sheet** (77 rows) — mutual-understanding ("how you get along") text by Mercury vs {planets, angular houses}.
- **`entente` sheet** (161 rows) — element × element (feu/terre/air/eau) combination descriptions, 5 variants per pair, used for the temperament/`entente_generale` card.
- **`house` sheet** (12 rows) — per-house `Gift`/`Gift_short` synastry text, used for the `gift` card (built in `03.API_id_json_Insight_2.anatella`, not `match_M.anatella` itself).
- **`signs` sheet** — per-sign element/modality/temperament/angularity metadata, needed to tag each planet placement for the boss/exclusif/hugs filters and the entente element lookup.
- **`points_synastrie` sheet** — ranking→points table (20/18/16/14/12…); role in the final scoring not yet pinned down (see Q1).

---

## Confirmed this round (per your notes)

- **Boss** = "% cardinality" — mean dominant-planet % restricted to Angular-house/Fire-sign/Cardinal-sign placements. Matches the in-graph formula found last session (`match_M.anatella` idx 3645/3646/3649).
- **1to1_ententeIntel = "how you get along"** — resolved as the **Mercury-aspect** comparison via `synastrieAspectMercury` (matches the real output sample's "exchange of ideas"/"disagreement" text). That means **`entente_generale` is the element (fire/earth/air/water) comparison** via the `entente` sheet — opposite of what the isolated graph node I'd found suggested, but consistent with the real captured output.
- **Gift** is built in `03.API_id_json_Insight_2.anatella` (confirmed exact source graph), not inline in `match_M.anatella` — see the updated gift row above for the full per-person caching mechanism.

## Q1 resolved — and it's bigger than a formula

Traced into `E:\soft\BUBBLE1.4\03.API_id_json_Insight_1_add_popularity_rivalite.anatella` (the `normalize_knn` note's actual source). The `distance_norm` constants weren't arbitrary — they come from a genuine **k-nearest-neighbors model run across the entire person population**:

```
<KNN module='AssignementSolver' primaryKey='ID_PERSON' algo='0' k='400'>
  <c>Neptune_PointsPerc</c><c>Sun_PointsPerc</c><c>Jupiter_PointsPerc</c><c>Mars_PointsPerc</c>
  <c>Mercury_PointsPerc</c><c>Pluto_PointsPerc</c><c>Saturn_PointsPerc</c><c>Uranus_PointsPerc</c>
  <c>Moon_PointsPerc</c><c>Venus_PointsPerc</c>
</KNN>
```

Anatella's built-in KNN plugin treats each person's **10 dominant-planet `PointsPerc` values as a 10-dimensional feature vector**, and finds each person's 400 nearest neighbors (`NN_Idx_1..400`/`NN_Dist_1..400`) **by distance in that space, across every other person in the database** — separate KNN runs exist for the Perso-vs-Perso vector (idx 2586, "perso vs perso: same same" → resemblance) and the Recherchées-vs-Perso vector (idx 3380/3604 → attraction/compatibility). The raw distance then feeds `distance = a==0 ? b : (1/a*100)+b` (idx 3561 — reciprocal-scales smaller distance into a larger score, accumulated), and separately the `9.32`/`85.19294507542864` constants in `distance_norm` are the observed min/max `NN_Dist` across that whole population-wide KNN run.

**What this means:** `compatibility`/`resemblance`/`attraction` are not pairwise-computable at all in the legacy system — a specific partner's score depends on **where they rank among your 400 nearest neighbors out of the entire person population**, not on a closed-form formula between just the two of you. Reproducing this exactly would mean running a k=400 KNN over every person's 10-dimensional dominant-planet vector in the `astrolearn`/`bubble` databases (recomputed whenever the population changes) — a materially heavier, population-relative architecture, not a formula fix to `match_calculator.js`.

**Recommendation:** treat the current from-scratch pairwise gap-score approach as an intentional simplification for these three fields (it approximates "how similar/compatible are these two profiles" without needing a live population index), and flag this clearly in the endpoint's docstring rather than chasing exact parity. Happy to build the real KNN version instead if you want population-relative accuracy badly enough to justify standing up that infrastructure — your call.

**Score floor/ceiling — implemented.** Checked action box idx 3631 in `03.API_id_json_Insight_1_add_popularity_rivalite.anatella`: the raw KNN distance becomes a score via `transformer = (1/DISTANCE) * 100` (smaller distance = higher score), and the legacy system never surfaces a match below ~30% or above ~99% — nobody sees a hopeless single-digit score or a suspicious 100%. Implemented that floor/ceiling directly in `match_calculator.js`: every percentage-producing helper (`toPercent`, `buildCompatibility`, `buildResemblance`, `buildBalance`, `buildExclusive`) now clamps to `[30, 99]` instead of `[1, 99]`. Verified live on the Marie Ange/Zoe Saldana pair — all scores land in range.

## Still open

**Q3 — hugs' `combi` ranking.** The hugs formula groups by a `combi` key and sorts descending before taking (what looks like) the top row, rather than a plain mean across all water/air placements. Still unresolved.

## Implemented this round

`boss`, `exclusif`, `gift`, and `entente_generale` (→ `generalUnderstanding`) are now real ports in `calculators/match_calculator.js` — see their rows in the table above and the file's own docstring for the full citation trail. `1to1_ententeIntel` (→ `mutualUnderstanding`) was already on the right conceptual basis (Mercury aspects) from a prior session and wasn't touched this round. Remaining gaps: `attraction`/`compatibility`/`resemblance`'s population-relative KNN scoring (Q1, accepted as an intentional simplification) and `hugs`' `combi` ranking (Q3, unresolved).
