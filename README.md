
# Canton Bead Shop – With Banners & Scraper

## What’s included
- Short **stone banners** on `/stone/<stone>/` (about 120px high). Put a hero at `assets/img/stones/<stone-slug>.jpg` to override the default.
- **All shape pages** generated (both exact-shape and bucket shapes).
- **Image logic:** If the Google Sheet **Image** column has a URL, it's used; otherwise a **shape placeholder** SVG is shown.
- **IndiaMART scraper script** (`scripts/fetch-images.mjs`) to generate an **Image** column for your sheet.

## Deploy
- **Netlify**: Build command `npm run build`, publish `dist`, Node 18.
- The build pulls your live Google Sheet CSV and generates `/dist` fully.

## IndiaMART scraper (local)
1. Download your live sheet CSV to `data/inventory.csv`.
2. Run: `node scripts/fetch-images.mjs`
3. Paste `data/image-column.csv` into your Sheet’s **Image** column (you can start from row 700+ to roll out slowly).

## Placeholders you can redesign later
- Shapes: `assets/img/shapes/*.svg` (faceted, rondelle, round, oval, drops-briolettes, square-rectangle, coin-disc, heart-fancy, nugget-chip-tumble, other)
- Price tiles: `assets/img/price/exact.svg`, `assets/img/price/range.svg`
- Stone default: `assets/img/stones/_default.svg`

