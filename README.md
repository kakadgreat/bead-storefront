
# Bead Storefront (Customer Portal)

- Thin filters (Stone, Shape, Size, Price) + **Clear** button and visual highlight when active.
- Robust size parsing → normalized like `7mm` or `7mm to 10mm` so the Size filter is populated.
- Per-card **Qty** input + **Add** button (no images on cards).
- Shows **unit price** on cards; drawer shows **line totals** and **grand total**.
- Netlify Forms (`request`) includes JSON payload for items + totals.

## Deploy
1. Push to GitHub (e.g., `bead-storefront`).
2. Netlify → **Add new site** → **Import from GitHub** (no build step).
3. Netlify → **Forms** → enable notifications for form `request`.

## Notes
- CSV URL is set in `index.html` at `CONFIG.SHEET_CSV_URL`.
- Sizes are derived from either the `Size` column or the name (supports `7`, `7-10`, `7 to 10`, `7 10`, and appends `mm`).
