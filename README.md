
# Bead Storefront – Multi‑page (SEO‑friendly)

New in this build:
- **Recently Viewed** carousel on every page
- **Share My List** (URL hash) and **Export CSV**
- Card content: Full Name, Stone tag, combined Shape, Size, Price, Qty + Add
- All earlier fixes: Price parsing from `$ 35.00`, Size1/Size2 → `mm`, Add‑to‑List, per‑stone pages

## Deploy
1. Push this repo to GitHub.
2. Netlify → Add new site → Import from GitHub (runs `npm run build`).
3. It publishes `dist/` with `/` and `/stone/<stone>/` pages.

CSV source is in `scripts/build.mjs` (`CSV_URL`).
