# Bead Storefront (Modular Refactor)

This is a modular refactor scaffold to make the storefront easier to update and extend.

## Goals

- Split runtime code into small, testable ES modules
- Keep a simple static hosting model (Netlify-ready)
- Add a light build step for dev ergonomics (Vite)
- Separate the **data pipeline** (CSV → JSON) from the **UI**

## Quick start

```sh
npm install
# 1) Fetch and convert your Google Sheet CSV → public/data/products.json
CSV_URL="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv" npm run build:data

# 2) Start dev server
npm run dev

# 3) Production build
npm run build
```

## Structure

```
public/                 # static files served as-is (Netlify publish=dist after build)
  assets/
  data/products.json    # generated from your Google Sheet
src/
  modules/
    core/               # storage, format helpers
    cart/               # cart logic
    catalog/            # catalog list, filters, paging
  main.js               # app entrypoint
scripts/
  build-data.mjs        # CSV download → JSON normalize (runs before vite build)
```

## Notes

- The UI uses Tailwind via CDN for speed; you can remove it later and add a Tailwind build if desired.
- The cart is stored in `localStorage` keyed by `canton_bead_cart_v2`.
- The pager and filters are generic and can be reused on other pages.
- Next phases: image gallery, product detail routes, serverless checkout, caching, tests.
