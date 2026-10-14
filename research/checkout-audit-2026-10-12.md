# Store, checkout and receipt audit — 12 October 2026

All purchases and catalogue changes below used isolated temporary databases,
browser profiles and mocked catalogue responses. No production order, payment,
stock change or customer record was created.

## Reproduced and corrected

| Issue | Before | After |
| --- | --- | --- |
| Guest receipt access | Only a button inside the immediately completed receipt opened history; reloading removed that route. | The cart exposes local receipt history, including when the cart is empty, with a 44px touch control. |
| Pending price or stock refresh | A second refresh returned immediately while the first request was unfinished; confirmation used the old catalogue. | Callers await the same refresh promise and validate the resulting prices and stock. |
| Failed verification | Catalogue failures were swallowed and the captured old price could still be confirmed. | Checkout and confirmation remain unconfirmed, display a retry message and preserve the basket. |
| Cross-tab basket | A storage update accepted 99 units despite stock of 3, plus a pending-price item displayed as EUR 0.00. | Initial, synchronized and refreshed baskets share availability checks and quantity limits; pending-price items are excluded. |

Pending checkout and confirmation actions also ignore repeated clicks. Closing
a pending confirmation, editing its destination or replacing its snapshot
prevents completion after a delayed response.

## Verification

`tools/checkout-ui-check.mjs` runs through `npm run checkout:ui:check` with the
Playwright module path and optional browser channel, following the existing UI
check convention.

- Two units at EUR 3.49 (discounted from EUR 4.99) plus three units at EUR 2.57
  total **EUR 14.69** in cart, review, completed receipt and downloaded UTF-8 text.
- All three languages are exercised; Persian uses a 390px mobile viewport.
- Three-digit CAP is rejected; `۰۰۱۸۵` becomes `00185`, preserving leading zeroes.
- Repeated confirmation produces exactly one local reference and clears the
  purchased quantities from the basket.
- A guest can reload, reopen and download a historical receipt. Captured unit
  prices and names remain usable after both products disappear from the current
  catalogue.
- Delayed price changes and stock reductions block stale confirmation.
- Offline initiation and confirmation create no receipt and permit retry.
- Cancelling a pending confirmation creates no receipt.
- A cross-tab update is capped to stock, excludes pending-price items and remains
  editable with quantity controls.
- Existing account UI and complete authentication, administration, offers,
  comments and SEO checks passed after the changes.

These remain browser-local demo receipts. Real payment, server-authoritative
orders, stock reservation and fiscal invoicing are not implemented by this audit.
