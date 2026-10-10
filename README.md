# Persia Market

An online Iranian grocery preview serving all Italy, with Italian, Persian and English storefronts, customer accounts, protected product/inventory/discount administration and a multilingual journal. The forest-green and cream design features an Iran–Italy hero, arched categories and daily offers. Hani is one brand within the wider Persia Market assortment.

The seed catalogue contains 47 Hani SKUs (44 published, three held as drafts until exact meatless versions are confirmed) and six labelled assortment examples. Newly imported packs await real price and stock entry. The journal contains 42 articles in three languages, including ten Italy city guides. Payments and checkout remain demonstrative.

## Run

- Install Node.js 24, run `npm ci`, then copy `.env.example` to `.env` and adjust the local configuration as needed.
- `npm run dev` serves http://127.0.0.1:4194. Set `PREVIEW_PORT` to override the port.
- `npm run check` validates JavaScript syntax, catalogue provenance, assets, links and account API/security flows. Requires Node 24 or a version with built-in `node:sqlite`.
- Frontend assets are in `dist/`. Server rendering, product pages, sitemap and robots require the Node server; serving the folder alone omits these features. `dist/persia-theme.css` supplies the current visual theme.

## Repository and hosting

GitHub stores the application code, catalogue seed, public images, editorial attribution and validation scripts. Local accounts, uploaded images, administrator setup tokens, environment secrets, supplier procurement extracts, screenshots and runtime caches are excluded. Back up `.local-data/` privately if moving an existing installation; it is not part of the repository.

Generated journal-detail PNG masters in `research/generated-journal-details/` remain a local design backup. Their optimized public WebP assets, generation briefs and attribution are included. Re-running `tools/optimise-journal-details.mjs` requires restoring those masters separately.

The existing GitHub Pages workflow publishes only the static `dist/` preview when `main` changes. GitHub Pages cannot execute this Node application: accounts, administration, live catalogue changes, articles and server-rendered SEO require a Node host with persistent private SQLite/upload storage. Pushing a feature branch does not activate that Pages deployment. Public hosting, domain configuration and production sales are separate from saving this project to GitHub.

## Public Node hosting

The complete Node preview is live at [Persia Market](https://persia-market-production.up.railway.app/?lang=fa) on Railway, deployed from `codex/persia-market-complete-preview`. It uses HTTPS and one instance with a 500 MB private volume mounted at `/app/.local-data`. The temporary deployment uses trial credits; continued availability depends on the account's hosting allowance. Payments remain demonstrative, Google OAuth and email delivery are unconfigured, and search indexing remains disabled.

Railway mounts volumes as root. For this image set `RAILWAY_RUN_UID=0` in the service, as documented in its volume permissions guidance, so the mounted private data directory is writable. This is specific to Railway; other hosts can run the image as its default `node` user when the data directory is owned by that user.

`Dockerfile` and `railway.json` support deploying the complete Node application, including accounts, administration and server-rendered articles. Railway can supply a temporary HTTPS domain. Before starting, mount a persistent volume at `/app/.local-data`; keep one service instance because SQLite and uploaded images share that volume. Set `NODE_ENV=production`, `PERSIA_DATA_DIR=/app/.local-data` and `TRUST_PROXY_HOPS=1` only behind Railway's controlled proxy. The server uses `PORT`, listens on `0.0.0.0`, derives its public origin from `RAILWAY_PUBLIC_DOMAIN` and serves `/healthz` for readiness. Render's `RENDER_EXTERNAL_URL` or an explicit HTTPS `AUTH_ORIGIN` are also supported.

Keep `SEO_INDEXING=false` while validating the public preview. Payment, verification/recovery email and unconfigured Google OAuth remain pending. Generate the private owner setup link inside the hosting service with `npm run admin:setup`; do not publish the setup token. Local customer databases and uploads are never deployed automatically. `npm run hosting:check` validates the public runtime, secure cookies, proxy handling and persistence with isolated test storage. CI builds the Docker image and verifies container startup, health and article rendering before publication. See `research/public-hosting-2026-10-10.md` for deployment verification and maintenance notes.

See [Railway CLI](https://docs.railway.com/cli), [volumes](https://docs.railway.com/volumes) and [trial limits](https://docs.railway.com/pricing/free-trial). Account sign-in and trial eligibility must be completed before deployment; ongoing hosting after trial credits requires a separate plan decision.

## Shopping preview

Italian, Persian RTL and English; bilingual product labels; cross-language search; category and brand filters; sorting; product details; favourites; a persistent basket; a three-step demo checkout (Italian city/postcode, review, receipt) and a downloadable summary. The last five demo receipts can be reopened from the footer after reloading. Receipt prices are captured at checkout; purchased quantities are removed from the demo basket. The homepage opens on six Hani stews. “View all 22 Hani products” expands the sourced range; the all-products filter shows 28 entries with Hani first. The hero and first navigation action open the Hani selection. Native dialogs support Escape and focus containment. Basket, preferences and demo receipts, including the test city and postcode, stay in this browser. The preview does not request a name, street address or payment details, and submits no checkout information to a server.

## Assortment and provenance

The 22 Hani products match the published aluminium foil range: supplier packaging, product links, weights and translated ingredient summaries. `research/product-sources.json` records the Hani Netherlands sources captured on 2026-10-02 and 2026-10-03. Tinplate variants are outside this selection, and published catalogue presence is not live stock confirmation. Their published ingredient lists contain no meat, poultry or fish; this is not a vegan or allergen-free certification.

Six additional rice, saffron, pistachio, rosewater, date and tea entries demonstrate the broader store structure. Their images, ingredients, weights and prices are illustrative, with no confirmed brand, supplier or saleable inventory. These entries are labelled as preview selections and explain their status in product details. All prices, including Hani prices, are demo values. Regional products, homeware and gifts open explanatory upcoming-category panels.

There are no claimed existing branches, customer counts, customer testimonials, delivery guarantees or supplier authorizations. Network cities describe the future concept. Editorial imagery is illustrative and does not show verified products, locations or customers.

## Design and images

See `research/design-brief.md` for the reference and local Italy report. See `research/visual-assets.md` for saved image paths, generation briefs and provenance. The current hero and generic product images were generated with the built-in image generation tool; official Hani packaging remains separate. WebP delivery copies reduce the three main visual assets from 7.54 MB to 0.85 MB, with the original PNGs retained.

## Before real sales

Confirm the Italian business identity, supplier agreements, approved assortment, actual product photographs, inventory, prices and full package ingredient/allergen information. Connect server-side commerce, payment, shipping and order management. Replace preview contact and shipping messages with approved business information. Confirm image usage rights and catalogue data with suppliers before commercial launch.

## Customer accounts

The person icon opens `/account?lang=LANG#account/overview`. Legacy homepage account fragments redirect to this private URL. Guests can register with name, email, optional international phone number and a password of 15–128 characters, or sign in to an existing account. The account has profile/language settings, up to 20 Italian addresses with edit/default/delete/undo, demo receipts, repeat-to-bag, favourites, sign-out and password change. Address selection pre-fills city/CAP in demo checkout. Public contact phone, email and address remain blank as requested.

Identity, phone and addresses are saved by `server/auth.mjs` in `.local-data/accounts.sqlite`, excluded from Git. Passwords use salted scrypt; sessions use random HttpOnly cookies with hashed tokens, expiration and revocation. Write requests check origin, login attempts are limited, and account records are isolated by user. Basket, favourites and demo receipts remain browser-local, keyed by authenticated user ID; guest history is separate. The public Railway preview uses a separate database; existing local customers and administrator credentials were not transferred.

Google sign-in is implemented as authorization code/PKCE with state and nonce, signed ID-token validation and one-time callbacks. Linking an existing email account requires its owner to be signed in. To enable it, copy `.env.example` to `.env`, configure a Google Cloud Web application OAuth client, and set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Register the exact redirect URI `http://127.0.0.1:4194/api/auth/google/callback` and restart the server. Secrets stay on the server. Without these credentials, the Google button explains that connection is pending. Google flows are tested with locally generated signed test tokens; live Google authentication remains unverified until credentials are configured.

Email verification and password-recovery delivery are not connected. The interface explicitly shows this; it does not claim a verification or recovery message was sent. Before public customer use, connect a mail provider, verified-domain delivery and recovery/verification flows, deploy HTTPS with production configuration, and complete operational security and privacy review. Commerce and payments remain demo-only.

## Product administration

Open `/admin.html` for protected management, or `/admin.html#preview` to review the dashboard without an administrator. Use `npm run admin:setup` once to get a private owner setup link. The generated token is kept in `.local-data/admin-setup.token`, never served through an API. The link opens an owner form; choose your email and password there. If the email already belongs to a customer account, its current password is required. After the first administrator exists, the setup API is disabled. Public registration always creates customers. Admin APIs enforce the role on the server.

Administrators can search/filter all products; add products; edit Persian/English/Italian names, descriptions and ingredients; set brand, unique SKU, category, euro price, weight/unit and stock; upload a product image; and change draft/published/archived status. Drafts and archived products are excluded from the public catalogue. Archiving is reversible through the status selector. Blank stock means unlimited demo quantity, zero disables purchase, and a positive number limits basket quantity. Demo purchases do not decrement inventory. All prices remain illustrative until real commerce is connected. Stale edits are rejected with a conflict message rather than overwriting another editor’s work.

The original 28 products are seeded from `dist/catalogue.json` into SQLite. Subsequent edits are stored on the server and survive restarts. `/api/catalogue` supplies published products to the store. The store refreshes after local management changes, focus and checkout checks; newer receipts capture names/prices so archiving a product does not lose the receipt. Backup `.local-data/accounts.sqlite` with SQLite backup tools, together with `.local-data/uploads`. These contain private customer data and local product assets, and are excluded from Git.

Uploads accept JPEG, PNG and WebP up to 5 MB. Sharp decodes and re-encodes images to WebP, strips metadata, limits input pixels and output dimensions, and rejects unsupported/invalid files. Images use random filenames and are served separately under `/media/`. The exact Sharp dependency is declared in `package.json`; this environment uses the bundled copy. In a new environment run `npm install` before starting.

`npm run check` includes isolated admin API tests for access control, owner setup, product creation/editing/publication, unique SKU, image validation, stale edits and persistence after restart. Browser verification uses a separate disposable database on port 4195; the main store is not populated with those test products or test administrators.


## Inventory and discounts

The admin overview shows actual catalogue counts and links to draft, missing-photo, out-of-stock, low-stock (1–5 units) and discounted-product lists. Product management includes brand, publication, category and inventory filters, name/price/stock/update sorting, and 15-row pagination. Selection is cleared when filters change. Selected products (up to 100) support bulk publication/draft/archive, stock assignment, percentage discounts and discount removal. The review dialog names the affected products and operation before saving. The server applies each batch in one transaction and rejects the entire batch if any product version changed.

Each product has a selling price and an optional higher discount reference price. Store cards, details and independent product pages show both prices and the calculated discount. Percentage discounts use the existing reference price, or the current price if no reference exists; repeating a discount recalculates from that base instead of stacking. Removing a discount restores the reference price. Empty stock removes the quantity limit; a bulk stock value is assigned to every selected item rather than divided between them. Discounts and stock remain demo commerce data. Product previews show unsaved form values without publishing.

## SEO and sharing

The Node server renders the home page and independent product pages before JavaScript runs, including product names, images, ingredients, current prices and crawlable links. Product URLs use /products/PRODUCT_ID?lang=it (or fa/en). Italian is the default language. Published products return 200; drafts, archived and unknown products return 404. Admin editors can set optional SEO titles and descriptions separately for each language; empty fields fall back to product details. Language-specific canonical URLs, reciprocal hreflang and x-default, Open Graph/Twitter tags, Organization, Product and BreadcrumbList JSON-LD are generated on the server. Demo Product markup intentionally omits commercial Offers and invented ratings, addresses and business contacts.

`/sitemap.xml` includes three language variants of the home, journal, articles, visible non-example products, eligible collections, about and shopping guide pages. With the initial catalogue and 28 product guides it contains 180 URLs. It follows catalogue and active-offer changes automatically. Empty collections and collections containing only illustrative examples are noindex and omitted. When production indexing is enabled, robots allows crawling so crawlers can read noindex directives; account, admin and API responses always carry noindex, nofollow, and authorization remains server-enforced. Local/demo previews block crawling and all public HTML carries noindex; search visibility has not been activated.

Before public launch, set SITE_URL to the approved HTTPS domain (origin only) and enable SEO_INDEXING=true in the server environment, then restart. Review the real assortment, translations, business details and commerce data before activation. Illustrative sample products remain noindex and are excluded from the sitemap even when the site is indexable. Domain ownership, Search Console submission and live search rankings have not been configured or verified.

Implementation references: [Google ecommerce URL guidance](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites), [localized pages / hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions), and [canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

Verification includes isolated atomic stock/discount tests, discount restoration/persistence, SEO field validation, server-rendered translations, escaped structured data, sitemap changes, archived 404 responses and preview indexing protection. Browser tests also cover bulk discounts and stock, unsaved previews, filtered lists, mobile layout and discounted checkout totals.


## Hide unavailable products

Admin → Store settings includes “Show only in-stock products”. The switch saves immediately to SQLite and applies to every visitor. It is off by default to preserve current display behavior. With the switch on, published products with stock=0 are excluded from the public catalogue, store links, related products, server-rendered home, independent product pages and sitemap. Stock=null remains unlimited/visible; positive stock remains visible. Administrators can still see and edit every product. Restocking automatically makes a product visible again; turning the switch off restores unavailable product listings. Settings use administrator authorization, origin/session checks and version conflicts, and catalogue revision changes notify open storefront tabs. The startup fallback uses the server-rendered visible catalogue rather than the original seed file. Direct preview: /admin.html?view=settings#preview (read-only until administrator sign-in).

### Inline pricing and daily offers

In Admin → Products, edit the euro price in each table row and press Save price. The narrow price endpoint preserves other product fields and checks the product version; an existing reference price must still exceed the selling price.

Admin → Daily offers manages one percentage campaign per product (1–90%), an inclusive start and end date, and an enable/pause switch. Both dates follow Europe/Rome, including daylight saving changes; the default is today only. Offers replace ordinary discounts, using the reference price when present, otherwise the ordinary price. Stored ordinary prices are never overwritten, so expiry/pause/removal restores them automatically. Changing a product's ordinary price also recalculates its active campaign.

The storefront has a separate Daily offers section with current prices, crossed-out reference prices and end dates. Only published, available products with active campaigns appear; the section remains visible with a themed coming-soon state when none qualify. It appears above the regular catalogue and its filters. Public API responses, server-rendered home/product pages, cart and demo checkout use effective prices. Open store tabs refresh on edits, focus and every 15 seconds while visible. Historical demo receipts retain captured prices.

Authenticated, same-origin, versioned PUT endpoints: /api/admin/products/:id/price (cents, version) and /api/admin/products/:id/offer (offer or null, version). A campaign contains enabled, percent, startDate and endDate. Admin previews: /admin.html?view=products#preview and /admin.html?view=offers#preview. Saving requires an administrator account. No demo campaign is inserted into the main catalogue automatically.

## Persia Journal

`/blog?lang=it` (also `fa` and `en`) opens the journal with topic filters and search. Three complete editorial articles, alongside 28 dedicated product guides, cover the Hani brand in Iran (restaurant roots, Iranian catalogue examples and editorial positioning), cultural connections around shared meals, and subjective associations between Italian and Iranian places. Each has a separate `/blog/SLUG?lang=LANG` URL, a table of contents, documented source links, with translated labels for the Iran brand analysis, an editorial byline, review date and related stories. The opening city montage is labelled conceptual. Hani content does not certify any product's import authorisation, commercial stock or agency relationship.

The three editorial articles live in `server/blog-content.mjs`, with additions in `server/blog-editorial-extensions.json` localised by `server/blog-editorial-extensions.mjs`; multilingual guide content lives in `server/product-guide-data.mjs` and `server/product-guide-extensions.json`, assembled by `server/product-guides.mjs`. Update the relevant content file and restart the server to publish local changes. This is an editorial content file, not a blog CMS in the product admin. Review sources and update the article dates and schema when changing content. The homepage, navigation and footer link to the journal; home preview cards follow language changes. All article text and links render on the server without requiring JavaScript. Search/filtering is a progressive enhancement.

Blog and article pages have unique titles/descriptions, canonical URLs, reciprocal language links, social cards, Blog/BlogPosting and breadcrumb structured data. All three language variants are in the sitemap (180 URLs across all eligible site pages with the initial 22 non-example products and all 28 guides). Local pages continue to use `noindex`; production indexing still requires the final HTTPS `SITE_URL` and `SEO_INDEXING=true`. SEO checks exercise all 93 article variants, citations, schemas, sitemap, 404/HEAD responses and preview indexing protection.

The expanded journal articles include multilingual product/cultural/location comparison tables, observation lists and native expandable FAQs. Tables scroll within the article on small screens and have captions, row/column headers and keyboard-focusable regions. Reading estimates and BlogPosting wordCount include prose, tables, lists and FAQs. After the 2026-10-05 expansion, the three editorial articles contain approximately 1,860–2,660 Persian words including these components. Product guides range from approximately 580–1,540 Persian words. These are whitespace-based reading estimates, not SEO targets.

Journal SEO editing: each translation has a descriptive visible title, concise seoTitle, meta description, direct-answer summary and contextual links to verified article slugs. Keep the established URLs. publishedAt and modifiedAt are per article; update modifiedAt only after a substantive change. The summary also supplies the BlogPosting abstract, and the author links to the journal editorial description. Visible FAQs are for readers; no FAQ rich-result claims or keyword meta tags are added. Article cards use h3 beneath the journal listing h2 and under related/home sections.


### Whole-site SEO coverage — 2026-10-05

Public collections now have server-rendered URLs: `/shop`, `/brands/hani`, `/categories/ready-meals`, `/categories/rice`, `/categories/spices`, `/categories/nuts`, `/categories/tea` and `/offers`, each with `?lang=it|fa|en`. `/about` and `/help` expose existing story, FAQs and preview contact status. These pages have translated titles/descriptions, one h1, breadcrumbs, reciprocal language links and social metadata. CollectionPage/ItemList markup links to product pages without fabricated merchant offers. The homepage footer and catalogue provide crawlable discovery links; interactive store filters remain available.

Product descriptions fall back to catalogue names, brand, package measure and existing ingredient summaries when no custom description exists. Images have translated alternative text and explicit dimensions. Account pages have their own canonical and private metadata without public structured data. Canonical path redirects remove index.html and valid trailing-slash duplicates; unknown public pages return a friendly 404 with noindex. Client language changes update canonical, metadata, public links and WebPage schema.

See `research/seo-audit-2026-10-05.md` for scope, verification and publication requirements. Automated SEO coverage includes every product/language variant, all collection/information variants, private account/admin pages, redirects, sitemap policy and available/expired or unavailable offer behavior. Demo Product markup is not a claim of merchant rich-result eligibility; actual commercial Offers remain deferred until real sales data is connected.


### Dedicated product guides — 2026-10-05

Every one of the 28 seeded catalogue entries has an original guide in Persian, Italian and English. Prepared foods cover quantities, preparation, variants, Italy substitutions and troubleshooting; ingredients cover selection, preparation and serving. Ghormeh Sabzi adds fresh/dried/frozen/pre-fried herb comparisons, an Italian shopping-name table and practical FAQs. Journal filters include Recipes and guides. The selected visual-story reading template remains, with distinct editorial food/ingredient cover scenes.

Independent product pages and the storefront detail dialog link to the matching translated guide. Articles link back to currently public products and related ingredient guides. Archived/hidden products are excluded from these links and BlogPosting about data, while editorial guides remain readable. New administrator-created products have no guide link until content and an ID association are added. This is content coverage for the current catalogue, not automatic AI article generation or a blog CMS.

Recipes are editorial home-cooking proposals, with linked references for documented variants. They have not been kitchen-tested by Persia Market and are distinct from factory formulas and pack heating instructions. Substitutions acknowledge flavour differences; Italian ingredient names are not stock guarantees. Example assortment status is explicit. Guide SEO uses BlogPosting, breadcrumb, canonical and reciprocal language metadata without Recipe rich-result claims, fabricated ratings or nutrition. Preview pages remain noindex. See `research/product-guides-2026-10-05.md` for coverage and verification.


### Unique article imagery — 2026-10-05

All 28 product guides have separate AI-created cover scenes, with localized illustration captions and descriptive alternative text. `server/product-guide-images.mjs` maps each product ID to its hero/card images and scene description. Final 1280×853 hero files and 640×427 card files live in `dist/assets/journal/guides-v1/`. The Hani brand article uses its distinct editorial image in cards. Product catalogue pack photos remain unchanged.

Exact prompts and asset provenance: `research/product-guide-image-prompts-2026-10-05.json`. Generation used the built-in image_gen tool. `tools/optimise-guide-images.mjs` creates the local WebP outputs using an installed Sharp module path passed on the command line; it does not generate images. See `research/product-guide-images-2026-10-05.md` for verification. SEO checks enforce distinct image paths/content and correct localized disclosure and social metadata.

### All-article expansion — 2026-10-05

All 31 articles were substantively expanded in all three languages. Each product guide adds ingredient roles, texture/preparation cues, meal planning and two topic-specific practical questions. The brand article adds a concrete pack-comparison worksheet and meal planning; the cultural article adds a gathering scenario and observation-versus-interpretation guidance; the places article adds three observation exercises, an inference-limits table and a comparison notebook. Existing URLs, distinct cover images, product relationships and sources remain. Article modification dates and computed reading estimates reflect the additions. See `research/article-expansion-2026-10-05.md` and its before/after count record.

### Complete Hani workbook assortment — 2026-10-05

All 47 workbook SKUs are registered, with 44 public and three meatless-confirmation drafts. The 25 new tinplate SKUs have original pack photos, independent weight/pack metadata, blank selling prices and pending received stock. Pending products cannot be purchased or discounted; admin price and inventory edits activate eligible products. Held drafts require an explicit verified meatless confirmation for the exact pack before publication. Existing catalogue edits survive seed migration. Alternate packs share food guide links and offer sibling-pack navigation. See `research/hani-listino-import-2026-10-05.md` for provenance and verification.

### Iranian city comparisons — 2026-10-08

All ten Italy city guides now include Persian, English and Italian comparisons with Iranian cities, linked from each article summary. Each comparison explains specific similarities, differences and places to observe. They are editorial interpretations with primary references for the Iranian sites. See `research/city-comparisons-comments-2026-10-08.md` for the complete mapping and validation.

### Product reviews and article comments — 2026-10-08

Authenticated users can comment on every article, product page and storefront product dialog. Products also accept an optional 1–5 rating. New comments await administrator approval; their author can see their own moderation status. Admin → Comments (`/admin.html?view=comments&lang=fa`) provides status filters, pagination, approval, rejection and public replies. Comments persist in the existing account database and approved threads are server-rendered. Public APIs omit emails and user IDs; moderation retains records and checks edit versions. The site does not insert example reviews or aggregate rating schema.

`node tools/comments-check.mjs` runs isolated API and rendering tests. `node tools/comments-ui-preview.mjs` starts an optional browser-only fixture on port 4195 with temporary storage and a test identity; use the normal `npm run dev` preview for the actual account and administrator flow.

### City food, universities and photographed sights — 2026-10-08

The ten Italy guides now introduce city character and travel/student planning, four local foods per city, and important universities with programme areas and official source links. Florence also includes a separate teaching-location entry. These additions are available in Persian, English and Italian. Each guide pairs four sightseeing descriptions with four distinct real photographs, alternating image and text on desktop and stacking on smaller screens. Together with the covers, the collection uses 50 distinct licensed photographs, including 30 new ones. Credits, licence links, dimensions and original sources are preserved in `research/city-photo-credits.json`.

Article shortcuts, localized search descriptions, SEO titles and BlogPosting image/word-count metadata reflect the expanded guides. `tools/expand-city-photos.mjs` resumes licensed-photo acquisition; photo selection still requires visual editorial review. See `research/city-enrichment-2026-10-08.md` for scope, official sources and validation.

### City food photography and Iranian connections — 2026-10-09

Each of the ten city guides now has four photographed local-food cards and a separate Iran-related places section in Persian, English and Italian. The forty food images are distinct: 34 licensed Commons photographs and six editorial illustrations generated using the built-in imagegen tool. Resized WebP assets and source files are stored in `dist/assets/journal/city-foods/`. Attribution and licences are recorded in `research/city-food-photo-credits.json`; generated-image provenance and exact prompts are in `research/city-food-generated-credits.json` and `research/city-food-image-prompts.json`. Illustrations do not depict a named restaurant or commercial product.

Thirteen selected restaurants, cultural and craft addresses have primary references and Google Maps search links containing their names and addresses. The cultural house in Venice is explicitly identified as mainland Mestre; Palermo’s JUN is described as Sicilian–Persian fusion. Genoa’s conflicting official street numbers are disclosed. This is a researched selection, not an exhaustive directory. Content lives in `server/italy-iranian-places.mjs`. No opening-hour, review-score or stock promises are inferred. SEO checks validate all thirty localized city pages, food images, map queries, source relationships, computed reading estimates and BlogPosting image metadata. See `research/city-food-iranian-places-2026-10-09.md`.

### Security and opening viewport — 2026-10-10

Production management now requires authenticator verification, with single-use recovery codes, durable rate limits, revocable expiring sessions and a security audit view. Response policies forbid executable inline scripts; homepage hydration uses inert JSON and the external bootstrap. Uploads enforce file signatures, private permissions and a storage quota. Sharp is pinned to the patched 0.35.5 release. The container drops to the node user after preparing the mounted private volume. See [SECURITY.md](SECURITY.md) for owner setup, backup and recovery requirements.

The homepage measures its announcement and navigation to size the hero to the remaining opening viewport. Categories begin below it on desktop and mobile; short screens may scroll to accommodate complete hero content. Isolated browser checks cover Persian, Italian and English, 1440×900, 1882×913, 618×895 and 390×844 layouts, CSP hydration and the entire owner MFA/recovery flow. These checks deliberately use the system-font fallback without Google's network.

### Online regional SEO — 2026-10-09

The confirmed operating model is online-only, targeting all Italy. `/iranian-groceries-italy?lang=it` (also `fa` and `en`) provides a substantive national shopping/delivery guide. Homepage, products, collections, help/about pages and the journal link to it. The ten city articles have distinct buying sections linked in both directions. A shared `OnlineStore` identity and Italy coverage are defined in `server/local-seo.mjs`; physical addresses, phones, reviews, shipping rates and return terms remain absent until confirmed. Preview checkout and production noindex protections are preserved. The new page adds three sitemap URLs; the test catalogue currently produces 282 entries. See `research/local-seo-2026-10-09.md` for the implementation, Google references, validation and launch dependencies.

### Immersive mobile hero and Pasargadae identity — 2026-10-10

The mobile hero fills its entire background with the existing scene, with horizontal touch panning, alternate arrow controls and a dark full-scene gradient behind light edge-aligned text. Vertical gestures continue to scroll the page. Desktop sizing remains header-aware. Home and journal city navigation use ten distinct photographic postcard cards and retain all translated article links. The new transparent emblem is an artistic abstraction of the stepped Tomb of Cyrus at Pasargadae, paired with the existing Persia Market wordmark; organization metadata and favicons use the new identity. Asset provenance and exact built-in imagegen prompt are in `research/home-design-2026-10-10.md`.

Browser validation includes actual horizontal/vertical touch events, arrow controls, three-language overflow checks, all ten loaded city images and the complete mandatory administrator MFA flow. Original logo artwork is retained; the generated original, optimized WebP and PNG favicon are stored in the repository.
