# Matching API — where it is and how to start

Christophe — the compatibility/matching backend endpoint is ready. This doc points you to it so you (or whoever builds the matching UI) can start wiring it up without waiting on us.

## Where to find it

Full reference: [`API-COMPLETE-DOCUMENTATION.md`](API-COMPLETE-DOCUMENTATION.md) — search for `### POST /api/match` (around line 2159). That file is the complete API doc for the whole backend (Marie Ange's `full-suite-spiritual-api`), just copied into this repo so it lives next to the web platform code. If it ever looks out of date, the source of truth is `C:\Users\marie\Documents\api-doc-complete\API-COMPLETE-DOCUMENTATION.md` on Marie Ange's machine.

## The endpoint

```
POST http://ai.zebrapad.io/full-suite-spiritual-api/api/match
```

No API key needed for this one. Send two people, get back compatibility scores.

**What it returns:**
- `compatibility` — the real thing, ported from the legacy French app's actual matching algorithm (not a guess/heuristic)
- `resemblance` — how similar two people's dominant-planet makeup is
- `balance` — whether the pairing is balanced or lopsided
- `attraction`, `boss`, `exclusive`, `generalUnderstanding`, `gift`, `hugs` — original scores we built for this app (compatibility/resemblance/balance are the only ones ported 1:1 from the legacy algorithm)
- Two radar-chart arrays (10 planets each) for compatibility and similarity, ready to plug into a chart component

**What you send:** two people (`person1`, `person2`). Each one can be sent three ways — pick whichever is easiest per screen:
1. Raw birth data (name, birth date/time, lat/long, timezone)
2. Just a name — it'll fuzzy-search the database
3. A person ID, if you already have one from a previous lookup

**Quick example:**
```json
{
  "person1": { "firstName": "Alice", "birthDate": "1990-04-12", "birthTime": "08:30", "latitude": 50.8503, "longitude": 4.3517, "timezone": "Europe/Brussels" },
  "person2": { "firstName": "Bob", "birthDate": "1988-11-02", "birthTime": "21:15", "latitude": 48.8566, "longitude": 2.3522, "timezone": "Europe/Paris" }
}
```

Full request/response shapes, field-by-field notes, and the DB-lookup examples are all in the API doc linked above.

## Where this fits in Unfold

This is a backend endpoint on Marie Ange's API — it's not part of this repo's code. For the Unfold demo/app, this should be wired up the same way as other API data: add the contract to [`types/api.ts`](types/api.ts) and a mock response to [`lib/mock-data.ts`](lib/mock-data.ts) so the demo screens can show it before the real integration is live (see the "API Contract First" rule in [`CLAUDE.md`](CLAUDE.md)).
