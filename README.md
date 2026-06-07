# 🧠 Daily Trivia Challenge

A daily, head-to-head trivia game. Every day there's **one shared 10-question
challenge** — the same questions for everyone — that **resets at midnight US
Eastern time**. Play, get a shareable scorecard, and text it to friends to see
who tops the score.

It's a **zero-dependency static web app**: just HTML, CSS, and vanilla
JavaScript. No build step, no server-side code, no API keys.

## How it plays

The 10 questions ramp up in difficulty and point value:

| Questions | Type | Points (per Q) |
|-----------|------|----------------|
| 1–3 | Multiple choice | 5 / 10 / 15 |
| 4–6 | Written answer (typo-forgiving) | 5 / 10 / 15 |
| 7–9 | Flag picking & map-location (GeoGuessr-style) | 5 / 10 / 15 |
| 10  | Number estimate | 25 |

**Max score: 115 points** (5+10+15 ×3 blocks, plus 25 for the finale).

Within each three-question block the difficulty climbs (easy → medium → hard),
and across the whole round the formats get more demanding.

### Partial credit
- **Question 10 (number estimate):** points scale with how close you are.
  Being over or under both count — 0% error = full marks, 50%+ error = 0.
- **Map questions:** points scale with distance from the target. Land near
  the city for full marks; you still earn a **bonus floor (40%)** for putting
  your pin in the **correct country** even if it's far from the exact spot.

### Categories
Sports, general knowledge, geography/maps, flags, politics, pop culture, and
history — pitched for a player base of roughly 25–75 (with a lean toward
35–45).

### Sharing
After finishing you get an emoji scorecard (Wordle-style) plus a link back to
the game. Share via the native share sheet, a prefilled **text message**, or
copy to clipboard.

## Why everyone gets the same questions
The day's questions are chosen deterministically from a seed derived from the
**Eastern calendar date** (`js/daily.js`). No backend needed — every player on
the same Eastern day computes the identical 10 questions. Your result is saved
locally so the day can't be replayed for a higher score.

## Running it

Because browsers restrict some features over `file://`, serve the folder over
HTTP:

```bash
# Python 3 (built in on most systems)
python3 -m http.server 8000
# then open http://localhost:8000
```

or any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3, …).
Just publish the repository root.

### External services used at runtime (all free, in-browser)
- **Leaflet + OpenStreetMap** tiles for the map questions.
- **flagcdn.com** for flag images.
- **OpenStreetMap Nominatim** reverse geocoding for the map "correct country"
  bonus (best-effort — distance scoring still works if it's unavailable).

## Project layout

```
index.html          App shell + screens (start / game / results)
css/styles.css      Styling (mobile-first)
js/
  questions.js      The question bank (pools by type + difficulty)
  daily.js          Eastern-date seeding + deterministic daily selection
  scoring.js        Graders for every question type (incl. partial credit)
  flags.js          Flag names + image URLs
  storage.js        LocalStorage: name, daily result, running stats
  mapq.js           Leaflet map question (drop a pin, distance + country)
  share.js          Scorecard text + share/SMS/clipboard
  game.js           Screen flow & rendering
```

## Adding questions
Edit `js/questions.js`. Add entries to the matching pool (`mc1/2/3`,
`written1/2/3`, `visual1/2/3`, `number`) following the shapes documented at the
top of that file. A larger bank means more day-to-day variety.

## Roadmap ideas
- Optional shared backend leaderboard (currently scores are shared via text).
- More questions per pool for greater variety.
- Daily streak tracking and badges.
