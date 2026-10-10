# Customer account validation — 2026-10-03

- Header account icon opens a dedicated three-language customer surface. Direct account-tab hashes survive reload and return-to-shop restores the catalogue.
- Sample profile saved and recovered after reload; account greeting and avatar updated. English and Italian labels were checked, including footer account entry.
- Sample Italian address added, edited, marked default, deleted and restored with Undo. Address retained after reload. Three-digit CAP was rejected; Persian digits ۰۰۱۸۵ converted to 00185 without losing leading zeros.
- Saved default address automatically pre-filled Roma / 00185 at checkout. Only city and postcode were included in the demo review; recipient/street remained out of the order.
- Existing purchase repeated into a two-item basket; a new demo receipt appeared immediately in account orders and could be reopened. Remaining test basket was cleared afterward.
- Favourite added from the store, displayed in the account, removed there and reflected in the empty state.
- Italian and Persian layouts at a 480px viewport had no horizontal document overflow. Mobile account navigation scrolls horizontally. Temporary viewport reset afterward.
- Browser console reported no errors. JavaScript syntax, catalogue/source/asset/receipt checks and Git whitespace checks pass.
- Remaining production work: authenticated sign-in, server-backed profile/address/order persistence and real payment/shipping. Current panel explicitly describes itself as device-local and demo.
