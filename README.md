
# Bead Storefront (Customer Portal)

Fixes & features:
- **Items not showing**: case-insensitive column parsing and default stock=1; no stock filter applied.
- **Filters**: thin row with Clear + highlight when active; Size now reliably parsed and normalized as `mm` or ranges like `7mm to 10mm`.
- **Cards**: qty input, Add button, unit price shown, no images.
- **My List**: line totals per item and grand total.
- **Printable summary**: buttons in header, drawer, and request section; print view shows customer info + table of items with totals.

Deploy:
1. Push to GitHub.
2. Import to Netlify (no build step).
3. Enable notifications for form `request`.

Config: edit CSV URL in `index.html` at `CONFIG.SHEET_CSV_URL`.
