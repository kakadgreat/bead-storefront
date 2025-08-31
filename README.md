
# Bead Storefront (Netlify-ready)

A single-file storefront that reads your published Google Sheet CSV, auto-selects **Featured** fast movers, and provides a **Netlify Forms** quote flow.

## Deploy
1. Push this folder to a new GitHub repo (e.g., `bead-storefront`).
2. In Netlify: **Add new site → Import from GitHub**. No build command needed.
3. After deploy, go to **Netlify → Forms** and enable notifications for the `quote` form.

## Config
- The CSV URL is set inside `index.html` at `CONFIG.SHEET_CSV_URL`.
- Adjust fast-mover logic via the `POPULARITY` map and `scoreItem()`.
