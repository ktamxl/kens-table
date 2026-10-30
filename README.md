# Ken's Table · 食單

A personal restaurant list across China — Guangzhou, Hong Kong, Shanghai and Shenzhen.

**Live:** https://ktamxl.github.io/kens-table/

## The idea

One flagship post per restaurant: the history, the awards, a top ten worth ordering from, and the
practical details. A restaurant that exists in several cities gets **one** post; the other branches
appear as a single line inside it that points back to the original, so the list never forks into
duplicate reviews.

Every entry carries the English name with the Chinese name in parentheses, its cuisine, its awards,
and a status: **Want to go** or **Tried**.

## Structure

```
index.html                      Home: hero, current feature, how it works, filters, cross-city index
restaurants/index.html          All restaurants, grouped by city
restaurants/<slug>/index.html   One flagship post per restaurant
assets/styles.css               Design system — paper / ink / brass, serif display
assets/app.js                   Status memory + city / status / search filtering
tools/build.mjs                 Content data + the generator that renders every page
```

## Run locally

No dependencies. Either open `index.html` directly, or:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Rebuild after editing content

All copy, awards, dishes and branches live in the `RESTAURANTS` array in `tools/build.mjs`.
Edit it, then:

```bash
node tools/build.mjs     # Node 18+
```

City names and accent colours live in `CITIES` in the same file. Type, colour and spacing live in
the `:root` block of `assets/styles.css`.

### Adding a restaurant

1. Copy the `bingsheng-pinwei` object in `RESTAURANTS` and change the data.
2. Required: `slug`, `city`, `nameEn`, `nameZh`, `locEn`, `locZh`, `cuisine`, `cuisineZh`, `price`,
   `area`, `addressEn`, `addressZh`, `tagline`, `card`, `awards`, `story`, `whyFamous`, `quote`,
   `branches`, `sources`.
3. Full feature? Add `dishes` (10) and `dishNote`. Not written up yet? Add `knownSignatures` and the
   page shows a "signatures worth ordering" state instead of inventing a top ten.
4. Rebuild, commit, push. Pages redeploys automatically.

## Status feature

"Want to go" / "Tried it" is stored in `localStorage` (`kentable.status.v1`), keyed by restaurant slug.
Per browser, per device, no backend, nothing collected.

## Notes on accuracy

Awards and history are compiled from each restaurant group's own published material, the MICHELIN
Guide, Dianping, Trip.com and press coverage. Dish lists reflect Dianping's recurring recommendations
for the named branch. Hours, prices and awards change — verify before travelling. Sources are listed
at the foot of every post.

Chinese is set in each restaurant's own script: simplified for mainland China, traditional for Hong Kong.

## Quality

Responsive from 360px up, tested at 390px and 1440px. Skip link, `aria-pressed` toggles, visible focus
rings, reduced-motion support, print styles for the detail pages, and an empty state for filters.
No external assets: system fonts, inline SVG favicon, no CDN or remote images.
