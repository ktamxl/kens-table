# Ken's Table · 食單

A personal restaurant list across China. Static site — no build step needed to view it.

**Live structure:** one flagship post per restaurant; branches in other cities are one line
inside that post, linking back to it. Each restaurant carries an English name with its
Chinese name in parentheses, a status ("Want to go" / "Tried"), awards, history, and —
for full features — a top-ten dish list with Chinese names, English translations and notes.

---

## Run it locally

No dependencies, no bundler. Any static server works:

```bash
cd projects/website-96fc57460d64e0075cbcece9
python3 -m http.server 8080
# open http://localhost:8080
```

Opening `index.html` directly in a browser also works.

## File map

```
index.html                      Home: hero, current feature, reference explainer, filters, cross-city index
restaurants/index.html          All eight restaurants, grouped by city
restaurants/<slug>/index.html   One flagship post per restaurant
assets/styles.css               The whole design system (paper / ink / brass, serif display)
assets/app.js                   Status memory + city/status/search filtering
README.md                       This file
```

## How the pages are generated

The HTML is pre-rendered by a small Node script kept **outside** the published site:
`.openclaw/tmp/restaurant-build/build.mjs`. It holds all restaurant content in one
array, so adding a city or a restaurant is a data edit rather than hand-editing HTML.

To rebuild after editing the data:

```bash
NODE="/Users/CFIUSA 1/Library/Application Support/autoclaw/embedded-gateway-runtime/5128c915de85af8d/node/node"
"$NODE" .openclaw/tmp/restaurant-build/build.mjs
```

(The system `node` on this Mac is v6 — too old. Use the gateway runtime path above.)

## Adding a restaurant

1. Add an object to `RESTAURANTS` in `build.mjs` (copy the `bingsheng-pinwei` entry as the model).
2. Required: `slug`, `city`, `nameEn`, `nameZh`, `locEn`, `locZh`, `cuisine`, `cuisineZh`,
   `price`, `area`, `addressEn`, `addressZh`, `tagline`, `card`, `awards`, `story`,
   `whyFamous`, `quote`, `branches`, `sources`.
   For a full feature also add `dishes` (ten items) and `dishNote`; otherwise add
   `knownSignatures` and the page will show the "top 10 in progress" state.
3. Rebuild. New page appears at `restaurants/<slug>/index.html` and in both indexes.
4. If it introduces a new city, add it to `CITIES` (key, English name, Chinese name, accent colour).
5. Update `projects/projects.json` with the new `updatedAt` to trigger a fresh preview.

## Editing copy, colour, layout

| What | Where |
|---|---|
| Restaurant text, awards, dishes, branches | `RESTAURANTS` in `build.mjs` |
| City names and accent colours | `CITIES` in `build.mjs` |
| Colours, type scale, spacing | `:root` block at the top of `assets/styles.css` |
| Home hero and explainer copy | `buildHome()` in `build.mjs` |
| Footer text | `footer()` in `build.mjs` |
| Status behaviour | `assets/app.js` |

## The status feature

"Want to go" / "Tried it" is stored in `localStorage` under `kentable.status.v1`,
keyed by restaurant slug. It is per-browser and per-device — nothing is sent anywhere,
and there is no backend. Clearing site data resets the list to the defaults in `build.mjs`.

## Quality notes

- Responsive from 360px up; tested at 390px and 1440px.
- Empty state for filters, `aria-pressed` on all toggles, skip link, visible focus rings,
  `prefers-reduced-motion` respected, print stylesheet for the detail pages.
- No external assets at all: system font stacks, inline SVG favicon, no CDN, no web fonts,
  no remote images. Everything ships in this folder, so it works under the strict
  Content-Security-Policy of the managed static host.
- Chinese is set in the restaurant's own script: simplified for mainland China
  (炳胜品味, 点都德, 蘩楼, 福1088, 人和馆), traditional for Hong Kong (大班樓, 甘牌燒鵝,
  澳洲牛奶公司).

## Sources

Restaurant history and awards are compiled from each restaurant group's own published
material, the MICHELIN Guide, Dianping, Trip.com and press coverage. Dish lists reflect
Dianping's recurring recommendations for the named branch. Hours, prices and awards change —
verify before travelling. Per-page sources are listed at the bottom of each post.
