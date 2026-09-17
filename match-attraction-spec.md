# Match endpoint — Attraction & Compatibility Implementation Spec

**Status:** ready to implement  
**Target:** `calculators/match_calculator.js` → `POST /api/match`  
**Sources:**
- Theory / what to compute: [`attraction.md`](attraction.md) (§0–§1.5, §2.5 temperament, §3 synastry, §7 ranking)
- Compatibility % formula: `E:\soft\BUBBLE1.4\match_M.anatella` **idx 9018** (+ 8974 normalize, 9022 labels)
- Existing port map: [`API-MATCHING.md`](API-MATCHING.md)

**Non-goals for v1:** population KNN (legacy Fourchette), meeting/wedding charts, composite/Davison, ZR-from-Eros timing, progressions. Those stay in `timingAtMeeting` as optional later.

---

## 0. Product rules (do not violate)

1. **Compatibility % ≠ attraction.** Keep them separate fields. Never fold spark into one soulmate score.
2. **Attraction is a ranked hit list + flags**, not a 0–100. (Legacy KNN attraction % is not portable — accepted.)
3. **Longevity factors stay out of spark.** Saturn → personal, Sun–Moon–ASC → `longevityHits[]` only.
4. **Squares/oppositions still count as chemistry** for Venus–Mars and outer-to-personal (KS). Soft aspects = easier; hard = hot-and-cold — still spark.
5. **Traditional 7th rulers** (Mars Scorpio, Saturn Aquarius, Jupiter Pisces). Whole-sign houses for overlays / 7th.
6. **Backward compatible:** keep existing top-level keys (`compatibility`, `attraction`, `balance`, `generalUnderstanding`, …). Extend shapes; do not rename/remove fields the app already reads.

---

## 1. Compatibility % — Anatella 9018

### 1.1 Exact legacy formula (idx 9018)

```
order=2 (compatibility): score = (attractedTo_distance + reversedAttractedTo_distance) / 2
order=1 (equilibre):     score = abs(attractedTo_distance − reversedAttractedTo_distance)
order=3 (ressemblance):  score = distance   // perso vs perso
```

Distances are first normalized (idx 8974):

```
attractedTo_distance = 97.8 − ((raw − 9.32) × 62.8 / 75.87)
```

Then subtitle buckets (idx 9022) on the compatibility score:

| Range | `subtitle_key` |
|-------|----------------|
| `< 35` | `very_low_compatibility` |
| `35 – < 61.4` | `low_compatibility` |
| `61.4 – < 63.49…` | `average_compatibility` |
| `≥ 63.49…` | `high` / `very_high_compatibility` (legacy over-buckets; treat ≥69.2 as `very_high`) |

### 1.2 Pairwise port (already mostly done)

Keep dominant-planet Recherchées↔Perso gap (no KNN):

```
aToB = weightedGapAvg(dom1.recherchees, dom2.perso)   // A attracted to B
bToA = weightedGapAvg(dom2.recherchees, dom1.perso)   // B attracted to A
compatibility.score = clamp30_99(round((aToB + bToA) / 2))
```

### 1.3 Required shape change

```js
compatibility: {
  score: number,          // (aToB + bToA) / 2   — KEEP (UI gauge)
  aToB: number,           // NEW — mirrors attractedto_distance
  bToA: number,           // NEW — mirrors reversedattractedto_distance
  label: string,          // existing scoreLabel()
  subtitleKey: string,    // NEW — 9022 bucket
  desc: string
}
```

### 1.4 Balance — align with 9018 order=1

**Replace** Perso-gap mean with compatibility asymmetry:

```js
balance: {
  asymmetry: round(abs(aToB - bToA), 1),  // legacy equilibre raw
  score: ...,                              // invert for UI: higher = more balanced
  label / label_fr: from EQUIL_BUCKETS on asymmetry (legacy equil sheet bands),
  desc: string
}
```

Suggested UI score (keep [30,99] floor/ceiling):

```
balance.score = clamp30_99(round(99 - asymmetry))
```

Bucket labels stay on **asymmetry** (not on the inverted score):

| asymmetry | label |
|-----------|-------|
| `< 5` | Incredible balance |
| `5 – < 10` | Acceptable / quite balanced (map to existing “Acceptable balance”) |
| `10 – < 20` | Acceptable imbalance |
| `≥ 20` | Large / Extreme imbalance |

(Use current `EQUIL_BUCKETS` cut-points if they already match product copy; prefer 9026’s 5/10/20 if rewriting labels.)

`resemblance` stays as today (Perso↔Perso + `rescaleGapPercent`).

---

## 2. Attraction engine — from `attraction.md` §1.5

Rebuild `attraction` while keeping a legacy-friendly `hits[]` for any UI that lists aspects.

### 2.1 Constants

| Param | Value |
|-------|-------|
| Synastry orb (default) | **6°** (KS range 5–7; tighter = higher rank) |
| Angle orb | **3°** for planet↔ASC/DSC/MC/IC (angles are sharp) |
| Aspects | conj / sextile / square / trine / opposition only |
| House system for overlays / 7th | **whole sign** |
| Directions | always compute **both** A→B and B→A |

### 2.2 Target response shape

```js
attraction: {
  // LEGACY-COMPAT: keep a flat hits list (may be a projection of sparkHits)
  hits: [ { person1Planet, person2Planet, aspect, orb } ],
  count: number,
  desc: string,

  // NEW — dynamics layers (attraction.md §1.5)
  natalProfileA: NatalAttractionProfile,
  natalProfileB: NatalAttractionProfile,
  sparkHits: SparkHit[],
  idealizationFlags: FlagHit[],      // Neptune → personal/angles
  obsessionFlags: FlagHit[],         // Pluto → personal/angles
  electricUnstableFlags: FlagHit[],  // Uranus → personal/angles, no Saturn/earth ground
  longevityHits: FlagHit[],          // Saturn → personal/angles; Sun–Moon–ASC links
  qualityNotes: string[],            // 7th-ruler dignity, sect benefic in 7th
  temperamentCompare: TemperamentCompare
}
```

### 2.3 `NatalAttractionProfile`

Per person, before synastry:

```js
{
  sect: 'day' | 'night',
  seventhSign: string,
  seventhRuler: { planet, sign, house, dignity, combust: boolean, averseToSeventh: boolean },
  planetsInSeventh: string[],
  venus: { sign, house, dignity },
  mars: { sign, house },
  moon: { sign, house },
  angles: { asc, dsc, mc, ic },   // degrees 0–360
  temperament: TemperamentResult, // see §3
  sectBeneficInOrRulingSeventh: boolean  // Jupiter day / Venus night
}
```

Traditional dignity table already used elsewhere in the repo — reuse if present; otherwise simple rulership/exaltation/detriment/fall.

### 2.4 `SparkHit` ranking (attraction.md §7)

Sort `sparkHits` by `(priorityAsc, orbAsc)`. One row per contact.

| priority | `type` | Rule |
|----------|--------|------|
| 1 | `planet_angle` | Personal planet (esp. Venus/Mars) conjunct other’s ASC/DSC/MC/IC within 3°. Prefer DSC. Conjunction to angle beats “opp to opposite angle”. |
| 2 | `venus_mars` | VenusA–MarsB or VenusB–MarsA, any of 5 aspects, orb ≤ 6° |
| 3 | `pluto_personal` | Pluto ↔ Sun/Moon/Venus/Mars/ASC/DSC |
| 4 | `neptune_personal` | Neptune ↔ same set → also copy into `idealizationFlags` |
| 5 | `uranus_personal` | Uranus ↔ same set → also `electricUnstableFlags` unless Saturn synastry or both charts heavy earth |
| 6 | `node_personal` | Personal planet ↔ NN/SN (not outer↔node) |
| 7 | `overlay_7_or_5` | Venus / Mars / ASC-ruler / Pluto into other’s whole-sign 5th or 7th |
| 8 | `asc_dsc_reversal` | A’s ASC sign === B’s DSC sign (and/or reverse) |

```js
SparkHit = {
  type: string,
  priority: number,
  direction: 'a_to_b' | 'b_to_a' | 'mutual',
  planetA: string,   // or angle name
  planetB: string,
  aspect: string | null,  // null for overlays / sign-reversal
  orb: number | null,
  house: number | null,   // for overlays
  gloss: string           // short KS-style line, EN for now
}
```

**Deprioritize / exclude from sparkHits:** outer↔outer; Saturn↔personal (→ longevity); generic Sun–Sun soft aspects alone.

### 2.5 Gloss snippets (engine-owned, short)

Examples (expand in code table keyed by `type` + aspect):

- `planet_angle` + Mars on DSC → “Passion / desire when they meet your Descendant.”
- `venus_mars` + square → “Chemistry with hot-and-cold pacing.”
- `venus_mars` + trine/sextile/conj → “Easier sexual / romantic chemistry.”
- `pluto_personal` → “Magnetic, instant, hard-to-leave pull.”
- `neptune_personal` → “Idealizing / fairy-tale pull — slow down.”
- `uranus_personal` → “Electric, on/off; needs Saturn or earth to last.”
- `overlay_7_or_5` → “Their [planet] lands in your 5th/7th — play / partnering.”
- `asc_dsc_reversal` → “Plugged into opposite ends of the same axis.”

### 2.6 Legacy `hits[]` projection

For UI that still expects Sun/Moon/Venus/Mars aspect rows:

```
hits = sparkHits
  .filter(h => h.aspect && ['Sun','Moon','Venus','Mars'].includes(h.planetA)
                         && ['Sun','Moon','Venus','Mars'].includes(h.planetB))
  .map(…)
```

Widen orb to 6° and **include squares/oppositions** (today’s builder only does conj/sextile/trine ≤3° — that is the main bug vs attraction.md).

---

## 3. Temperament & bond — implemented in `/api/match`

### 3.1 Keep existing card

`generalUnderstanding` (element pair via Perso %) stays for the Temperament / entente_generale screen. **Now also includes** `headline`, `element1Pct`/`element2Pct`, richer `bulletPoints`, and `temperamentCompare`.

### 3.2 Greenbaum short-form (live)

Inputs per person: ASC sign, ASC ruler sign, Moon sign, Moon phase, Sun-by-season.

| Source | hot/cold | wet/dry |
|--------|----------|---------|
| Fire signs | hot | dry |
| Air signs | hot | wet |
| Earth signs | cold | dry |
| Water signs | cold | wet |
| Spring Sun | hot | wet |
| Summer Sun | hot | dry |
| Autumn Sun | cold | dry |
| Winter Sun | cold | wet |
| New/crescent Moon | hot | wet |
| First-quarter/gibbous | hot | dry |
| Full/disseminating | cold | dry |
| Third-quarter/balsamic | cold | wet |

Tally → dominant 1–2 of {choleric, sanguine, melancholic, phlegmatic}.

### 3.3 Response fields (shipped)

| Field | Screen | Contents |
|-------|--------|----------|
| `generalUnderstanding` | Temperament | elements + `temperamentCompare` + headline/bullets |
| `bond` | Do you have a bond? | same compare + comfort Moon/Venus links + overlap `score` (UI only) |
| `mutualUnderstanding` | How do you get along? | Mercury→planet `hits[]`, `headline`, gloss `bulletPoints` |
| `person1.temperament` / `person2.temperament` | (raw) | per-person hot/cold/wet/dry tallies |

`TemperamentCompare` shape:

```js
{
  person1, person2,           // TemperamentResult
  sharedQualities: ('hot'|'cold'|'wet'|'dry')[],
  wetBinding: 'both_wet' | 'both_dry' | 'mixed',
  hasMinimumOverlap: boolean, // KS: ≥1 shared quality
  score, label, note, bulletPoints
}
```

### 3.4 Implementation status

- [x] Phase C — temperament + bond + get-along enrichment (`match_calculator.js`)
- [x] Phase A — compatibility aToB/bToA/subtitleKey (9018), balance = asymmetry (2026-09-17)
- [x] Phase B — full attraction sparkHits rebuild (2026-09-17)
- [x] Docs — `API-COMPLETE-DOCUMENTATION.md` response example, `API-MATCHING.md` status rows

---

## 4. Implementation plan (ordered)

### Phase A — Compatibility / balance (small, 9018-faithful)
1. Expose `aToB`, `bToA`, `subtitleKey` on `compatibility`.
2. Rewire `balance` to `abs(aToB − bToA)`.
3. Smoke-test 3 known pairs; scores stay in [30,99].

### Phase B — Attraction rebuild (main deliverable)
1. Helpers: whole-sign house from ASC, traditional ruler, Moon phase, Sun season, dignity, combust (~8°).
2. `buildNatalAttractionProfile(chart)`.
3. `buildSparkHits(chartA, chartB)` with priority sort + gloss table.
4. Split Neptune/Pluto/Uranus/Saturn into flag arrays.
5. Project legacy `hits` / `count` / `desc` from sparkHits.
6. Replace current `buildAttraction` (≤3° soft-only).

### Phase C — Temperament
1. `computeTemperament(chart)`.
2. Wire into profiles + `attraction.temperamentCompare`.
3. Optional: enrich `generalUnderstanding.bulletPoints` with shared-quality note (keep element1/element2/score).

### Phase D — Docs
1. Update `API-MATCHING.md` Attraction + Compatibility + Balance rows.
2. Update `API-COMPLETE-DOCUMENTATION.md` → `POST /api/match` response example.
3. Point both to this spec + `attraction.md`.

**Out of scope until asked:** `timingAtMeeting[]`, composite, Lot of Eros / ZR, meeting chart.

---

## 5. File touch list

| File | Change |
|------|--------|
| `calculators/match_calculator.js` | Phases A–C |
| `knowledge/API-MATCHING.md` | Status rows |
| `knowledge/API-COMPLETE-DOCUMENTATION.md` | Response schema |
| `knowledge/match-attraction-spec.md` | this file (source of truth for the build) |

No new PHP endpoint — same `/api/match` via existing wrapper mapping.

Optional later: extract shared synastry/temperament helpers to `calculators/lib/attraction_synastry.js` if the file grows past ~900 lines.

---

## 6. Acceptance checks

- [x] `compatibility.score === round((aToB + bToA) / 2)` and both directions present — verified live (e.g. aToB=69.1, bToA=87.4 → score=78)
- [x] `balance.asymmetry === abs(aToB − bToA)` — verified live (asymmetry=18.3 → score=81 "Acceptable imbalance")
- [x] No single "attraction %" field introduced — `attraction` returns `hits[]`/`count`/`sparkHits[]`/flags, never a percentage
- [x] Real-pair fixtures (Marie Ange/Zoe Saldana, Merkel/Einstein): Venus–Mars, Pluto, Neptune, Uranus, and overlay hits all appeared in `sparkHits` with correct `type`/priority when orbs allowed
- [x] Pluto contact lands in `obsessionFlags` and `sparkHits`, not in `longevityHits` — verified
- [x] Saturn-to-Venus/Sun lands only in `longevityHits`, never in `sparkHits` — verified
- [x] Temperament: `sharedQualities.length >= 0` and note mentions wet/dry when they differ — verified
- [x] Existing keys still present; old clients that only read `compatibility.score` / `attraction.hits` keep working — both fields kept, only extended

**Known limitation (documented, not a bug):** `compatibilitySubtitleKey`'s bucket boundaries (35/61.4/63.5/69.2) were calibrated in the legacy graph against its own KNN-normalized distance scale. Our pairwise gap-score substitute for `aToB`/`bToA` tends to cluster higher (60-90+) on real pairs, so `subtitleKey` skews toward `high_compatibility`/`very_high_compatibility` more often than production likely does. The bucket cutpoints themselves are ported exactly; only the input distribution differs — same caveat as `compatibility.score` generally (see Q1 in `API-MATCHING.md`).

---

## 7. Quick reference — current vs target

| Field | Current | Target |
|-------|---------|--------|
| `compatibility` | mean gap only | + `aToB`, `bToA`, `subtitleKey` (9018) |
| `balance` | Perso-gap | asymmetry of aToB/bToA (9018 order=1) |
| `attraction` | ≤3° soft Sun/Moon/Venus/Mars | ranked spark + flags + natal profiles + temperament |
| `generalUnderstanding` | element pair | keep + optional temperament note |

Theory detail, ranking rules, and worked examples: always defer to [`attraction.md`](attraction.md). This spec only says **what `/api/match` must return and in what order to build it**.
