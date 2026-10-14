# Unique guide imagery — 2026-10-05

## Delivery

28 unique AI-created editorial food/ingredient scenes generated with the built-in image_gen tool, one prompt per subject. All final assets are saved in `dist/assets/journal/guides-v1/`. No catalogue pack photograph was replaced. Each guide card, hero and social image now uses its own scene. The Hani brand article card now uses its existing dedicated terrace illustration instead of a reused product pack.

Images are illustrations, not photographs of commercial pack contents or proof of kitchen-tested recipes. Captions identify AI imagery in FA/EN/IT, and alternative text describes each scene. Cultural and city articles retain their distinct existing editorial/location imagery.

## Assets and prompts

- 28 hero WebP files, 1280×853; individual sizes 98–301 KiB.
- 28 card WebP files, 640×427; individual sizes 32–81 KiB. Cards retain lazy loading.
- Original generated PNG files retained at their source paths.
- Exact prompt set, original locations, output dimensions and sizes: `research/product-guide-image-prompts-2026-10-05.json`.
- Gallery comparison: `screenshots/product-guide-images-contact-sheet.jpg`.
- Live journal proof: `screenshots/journal-unique-food-covers-fa.png`.

## Verification

All 28 images visually reviewed in the contact sheet for food identity and distinct framing. Automated SEO coverage now asserts unique cover/card paths across all 31 articles, unique SHA-256 image content for every guide, card existence and smaller byte size, localized illustration disclosure, and correct guide social-image URLs. `tools/seo-check.mjs` passed all 93 translated article variants and 180 sitemap entries. `tools/check.mjs` and changed module syntax checks passed. Browser verified 28 filtered guide cards, loaded assets and the full Ghormeh Sabzi hero/caption. Main catalogue data remains unchanged.
