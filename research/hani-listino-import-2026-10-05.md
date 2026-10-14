# Hani assortment import — 2026-10-05

The authorized import now contains all 47 SKUs from Listino_Hani_Organized.xlsx: 22 existing aluminium packs and 25 newly added tinplate packs. Every workbook row matches exactly one live catalogue record by official source URL, package material and weight. Twelve additions are alternate packs of existing foods; thirteen are new food families. Original official pack images were saved separately for every new SKU.

## Publication and sale readiness

44 Hani SKUs are public. Ash Shole Ghalamkar 480 g, Haleem 480 g and Kufteh Tabrizi 460 g remain private drafts, per the user's instruction, until a confirmed meatless version is available. The hold cannot be bypassed by ordinary publish or bulk publish: the editor requires an explicit verified meatless confirmation for that exact pack.

All 25 new SKUs have blank selling price and pending received stock. Workbook requested purchase units were not converted into inventory. The public 22 additions display pending-price/stock labels and cannot be added to the basket. Admin price and inventory edits can make an eligible SKU purchasable. Scheduled offers and bulk discounts reject missing prices. No unverified ingredient formula was copied from another pack.

The 28 previous product records (22 Hani and six other example products) retain names, images, prices, ingredients and inventory. Seed migration only fills missing packaging/family metadata where source and weight match; later admin changes are preserved. A product-only pre-import backup is stored locally at .local-data/catalogue-backups/before-listino-47-2026-10-05.json.

## Connections and SEO

Alternate pack product pages link to the corresponding existing food guide and sibling packs. Distinct product URLs and localized titles include package details. Public Hani collections show 44 entries. Held products are excluded from public API, pages and sitemap. Preview indexing remains disabled; there are 246 localized public sitemap URLs. Product structured data contains no invented price Offers.

## Verification

Passed catalogue/assets check, JavaScript syntax checks, authentication checks, admin/API suite (including readiness, bulk operations, hold release and seed persistence), and the complete multilingual SEO suite. Live SQLite verification: 53 total records, 47 Hani, 44 public Hani, three held drafts, 25 pending prices and 25 pending stock. All 47 workbook rows match exactly one record. UI verified new Samanoo 600 g and Ghormeh Sabzi tinplate 480 g, original photos, pack labels and disabled purchase.

Original audit plan remains a historical pre-import snapshot. Imported IDs and image provenance are recorded in research/listino-audit/imported-products.json and import-image-assets.json.
