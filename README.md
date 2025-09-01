
# Bead Storefront (Customer Portal)

Minimal, customer-facing catalog that reads your published Google Sheet CSV, includes thin filters (Stone, Shape, Size, Price), small thumbnails, and a cart‑lite **My List**. Submitting the **Send Request** form emails you via **Netlify Forms** with the selected items and customer details.

## Deploy
1. Push to a GitHub repo (e.g., `bead-storefront`).
2. Netlify → **Add new site** → **Import from GitHub** (no build command).
3. Netlify → **Forms** → enable notifications for form `request`.

## Config
- Edit CSV URL inside `index.html` under `CONFIG.SHEET_CSV_URL`.
- Shapes are auto‑derived from item names when a `Shape` column isn't present.
- Sizes are parsed like `4mm`, `6mm`, `8mm`, … from the name if a `Size` column is missing.
