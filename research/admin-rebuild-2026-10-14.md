# Admin workspace release — 2026-10-14

Persia Market now has a rebuilt green/neutral management workspace with product creation and image upload, inline price and stock editing, grouped catalogue operations, scheduled daily offers, customer comment moderation, store settings and the existing administrator MFA controls.

Newly confirmed demo checkouts are recorded on the server. Orders have captured product names/prices, server-computed integer-cent totals, search/filter/pagination, private receipt details, print layout, administrator review/cancellation and email queue state. Guest histories are not publicly exposed; signed-in customers can access only their own records. A persisted browser request key prevents a lost response followed by reload/retry from creating a duplicate order. Historical browser-only receipts are preserved without silent import.

The Connections page prepares Resend order notifications and a Meta WhatsApp Cloud API assistant. Both remain disabled until real provider accounts and server-side credentials are supplied. The email inbox and WhatsApp Business account have not been created. No production email or WhatsApp message was sent during implementation.

Validation completed with temporary databases, isolated browser profiles and mocked provider calls:

- `npm run check`: catalogue, auth, admin, new operations APIs, SEO and comments passed.
- `npm run security:check` and `npm run hosting:check`: production MFA, sessions, origin protection and persistent hosting checks passed.
- `tools/operations-check.mjs`: price/stock tampering, duplicate orders, customer isolation, restart persistence, stale admin edits, daily discounts applied once and MFA on orders/connections passed. Email retry-window safety and signed/deduplicated WhatsApp message handling passed.
- `tools/admin-workspace-check.mjs`: demo checkout → admin receipt, review, inline price/stock changes, upload/publish and active daily-offer pricing passed. Three languages at 320/390/900/1440px, receipt dialog and private-state clearing after logout passed.
- `tools/checkout-ui-check.mjs`: discounted multi-product totals, receipt download/history, in-flight catalogue changes, offline recovery, stock synchronization and lost server response followed by reload passed.

Provider acceptance is distinct from inbox delivery. Actual payment, fiscal invoicing, street-address collection, shipping calculation and stock reservation remain outside the current demo checkout mode. Provider setup instructions are in `research/admin-connections-2026-10-14.md` and `.env.example` contains variable names only.
