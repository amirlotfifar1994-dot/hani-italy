# City comparisons and community comments — 8 October 2026

## Editorial coverage

Each of the ten city guides includes an original `iran-connections` section in Persian, English and Italian. The top summary links directly to it. Comparisons explain a concrete observation route, the Iranian reference and the differences between the places.

Journal search aliases include the Iranian city names in all three languages. Browser testing of `اصفهان` returned the Florence, Rome and Verona guides alongside the existing places-comparison article.

| Italy | Iranian references | Comparison theme |
| --- | --- | --- |
| Milan | Tehran, Tabriz | Urban rhythm, shopping passages and architecture |
| Rome | Tehran, Isfahan | Historical layers, monuments and public squares |
| Turin | Tehran, Tabriz | Palace identity, covered walking routes |
| Bologna | Tabriz, Rasht | Covered passageways, markets and food culture |
| Florence | Isfahan, Shiraz | Art in public space, gardens and slower visits |
| Venice | Shushtar | Water, movement and infrastructure; different urban systems |
| Naples | Bandar Abbas, Rasht | Coastal experience, local food and markets |
| Genoa | Bandar Abbas, Tabriz | Port experience, trade and urban buildings |
| Palermo | Tabriz, Rasht | Markets, food and street observation |
| Verona | Isfahan, Sanandaj | Public squares and music in city identity |

The analogies are explicitly attributed to the Persia Market editorial team. UNESCO sources document the Iranian sites and Creative City references; they do not claim the Italian and Iranian cities are equivalent. Existing Italian tourism sources remain linked. Research also checked the official Milan attractions page, Uffizi Boboli Garden page and Italia.it Ballarò page for the added examples.

## Comments and reviews

All article pages and independent product pages render an approved-comment thread on the server. Storefront product dialogs mount the same feature. Comments use the account SQLite database; `tools/preview.mjs` wires the module to the existing session identity and administrator authorization.

- Posting requires an authenticated account. The author display name is stored with the comment; account emails and internal user IDs are not exposed by the public comment API.
- New comments await moderation. Only their author and administrators can see unpublished comments. Approved comments and administrator replies are public.
- Products allow an optional integer rating from 1 to 5. Article comments have no rating.
- Admin → Comments supports status filtering, pagination, approval, rejection and replies. Rejection preserves the record. Version checks prevent stale moderation updates.
- Server validation, same-origin checks, per-user rate limits, idempotent retries and output escaping apply to writes and rendering.
- No invented comments, ratings or `aggregateRating` structured data are inserted.

## Verification

`npm run check` and `npm run journal:check` passed. Coverage includes all 30 translated city guides, comment sections for every public product and every article, 126 translated article pages and 279 sitemap URLs. `tools/comments-check.mjs` tests authentication, private pending comments, product ratings, admin permissions, moderation/replies, conflicts, retry behavior, rate limits, escaped HTML, archived targets and persistence after database restart.

Browser verification covered the real Florence comparison, real guest article/product comment sections and the storefront product dialog. An isolated fixture at port 4195 tested submission with a four-star rating, administrator approval/reply and subsequent public rendering. Its account and comments were stored separately from the real site. The fixture was stopped and its temporary browser tab closed after verification. The normal preview remains at port 4194.

Real-page screenshot: `screenshots/city-comparisons-proof.jpg`. Full article capture: `screenshots/florence-iran-comments-full.jpg`. The separate fixture screenshot is test evidence only.
