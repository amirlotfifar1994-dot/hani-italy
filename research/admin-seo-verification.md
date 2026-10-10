# Admin, inventory, discounts and SEO verification

Verified on 2026-10-04 in the local Windows preview.

- All checks in npm run check pass: syntax, original catalogue/assets, account security, Google mock flows, management access control, uploads, persistence, bulk transaction rollback, discount calculations and SEO rendering.
- Isolated browser testing on port 4195 verified 20% discounts on two products, stock assignment to 3 units, low-stock filtering, unsaved previews and editable SEO titles/descriptions. The storefront showed 3.92 EUR and 4.72 EUR with reference prices; three Gheimeh units totalled 11.76 EUR, and increasing beyond stock was disabled.
- Product pages and admin filters were checked at a 480px browser viewport in Persian RTL and Italian; no document overflow.
- Main preview on port 4194 retains the original 28 published products and has no test administrator or test discounts. First-owner setup is pending user entry.
- Main product pages connect to the demo cart, and changing language synchronizes title, description, canonical and Open Graph URL. Browser console had no errors during these checks.
- Local/demo indexing remains disabled. Live domain, Search Console, live payments, live Google credentials and real commercial offers are not configured.
- Disposable browser test database removed after stopping the test server; the main database and uploads were retained.

Screenshots: screenshots/persia-admin-complete.png and screenshots/persia-product-seo.png.
