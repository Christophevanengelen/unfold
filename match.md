# Matching feature — status and what needs your call

Christophe — quick update on the 12 matching screens (the ones in your
screenshots in `match/`). Short version: **half the cards are now built on
the real algorithm from the old app, half are still a temporary stand-in**,
and there's one decision only you can make about how far to chase the rest.

## The 12 cards, screen by screen

| # | Screen (your screenshot) | Status | What that means |
|---|---|---|---|
| 1 | [Compatibility %](match/1.jpeg) | ⚠️ Placeholder | Shows a number, but not calculated the real way yet — see "the one decision" below |
| 2 | [Radar — what you're drawn to](match/2.jpeg) | ⚠️ Placeholder | Same root cause as #1 |
| 3 | [Satisfaction / balance](match/3.jpeg) | ⚠️ Placeholder | Right idea (balanced vs. lopsided), wrong math underneath — being fixed |
| 4 | [Similarity %](match/4-simil.jpeg) | ⚠️ Placeholder | Same root cause as #1, though numbers happen to land close in testing |
| 5 | [Radar — how similar you are](match/5-simil.jpeg) | ⚠️ Placeholder | Same root cause as #1 |
| 6 | [The gifts you give](match/6-gift.jpeg) | ✅ Real | Rebuilt from the old app's actual formula this round |
| 7 | [Temperament](match/7-temp.jpeg) | ✅ Real | Rebuilt from the old app's actual formula this round |
| 8 | [Who takes the initiative](match/8-boss.jpeg) | ✅ Real | Rebuilt from the old app's actual formula this round |
| 9 | [The most loyal](match/8-loyal.jpeg) | ✅ Real | Rebuilt from the old app's actual formula this round |
| 10 | [How do you get along](match/10-getalong.jpeg) | 🟡 Right idea, placeholder text | Looking at the correct thing (how you two communicate), but the wording isn't pulled from the old app yet |
| 11 | [Do you have a bond](match/9-bond.jpeg) | ⚠️ Placeholder | Not yet traced to the old app's formula |
| 12 | Hugs | ⚠️ Placeholder, partly understood | We know roughly how the old app scored this, one detail still missing |

**4 of 12 are done for real** (gifts, temperament, initiative, loyalty).
The rest still show *something* on screen — nothing is broken or blank —
but the number/text isn't the one the old app would have shown for the
same two people.

## The one decision that's actually yours

Cards #1, #2, #4, #5 (compatibility %, both radars, similarity %) turned
out to work differently than we assumed. In the old app, your score
wasn't just "you vs. this one other person" — it was **your position
among your ~400 closest matches out of every person ever in the
database**. Same idea as "you're in the top 5% of compatible pairs,"
not a fixed formula between two people.

Rebuilding that for real means standing up a system that recomputes
everyone's ranking as the user base grows — real infrastructure, not a
code tweak.

**Your call:**
- **Keep the current simplified version** (a direct two-person comparison,
  no ranking against the whole database) — it already looks and feels
  right on screen, it's just not a byte-for-byte match to the old app's
  math. Zero extra cost.
- **Ask us to build the real ranking system** — more accurate to the old
  app, but real backend work to size up first.

If you don't have a strong opinion, our recommendation is to ship with
the simplified version and revisit later if users start comparing scores
between friends and something looks off.

## One small loose end

Card #12 (Hugs) — we understand most of the old formula but one step
(how it picks which "combo" to show, out of several tied placements)
isn't pinned down yet. No decision needed from you, just flagging it's
not finished.

## For whoever's writing the code

The full technical trace — every formula, every source file from the old
app, every open question — lives in
[`API-MATCHING.md`](API-MATCHING.md). That doc is for the engineer
wiring this up, not required reading for you.
