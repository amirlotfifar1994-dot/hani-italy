# Article expansion — 2026-10-05

Coverage: all 31 articles, in Persian, English and Italian (93 rendered variants).

## Content added

- Every product guide: ingredient choice and roles, preparation/texture cues, serving and meal planning, two topic-specific expandable questions. 112 new guide sections per language; 56 new questions per language.
- Hani: specific pack comparison (name/purpose, net weight, ingredients/allergens, preparation) and meal planning, with links to the Ghormeh and rice guides. Iranian brand/catalogue information is not used to assert export composition, current Italian availability or import legality.
- Culture: a concrete small-gathering scenario and a framework separating observed behaviour, individual memory and documented information. National and regional differences remain explicit.
- Places: observation exercises for the three pairs, a table limiting inference and a three-column notebook method. No undocumented shared historical origin is asserted.

Additions are stored separately from the existing chapter content so original illustrations, comparison photos and source metadata are preserved. Both additions files contain full translations rather than runtime machine translation.

## Reading estimates

These counts use the renderer’s existing whitespace-based calculation, including titles, summary, steps, tables and FAQs. They are estimates, not content-quality scores or SEO word targets. Added totals: Persian 7,646; English 5,532; Italian 5,205. Exact records: article-expansion-baseline-2026-10-05.json and article-expansion-counts-2026-10-05.json.

| Article | Persian before → after | English before → after | Italian before → after |
| --- | ---: | ---: | ---: |
| hani-products-italy | 1755 → 2058 | 1717 → 1999 | 1723 → 1996 |
| iran-italy-cultural-connections | 1547 → 1863 | 1303 → 1570 | 1306 → 1553 |
| italy-places-that-feel-like-iran | 2298 → 2661 | 2440 → 2761 | 2300 → 2617 |
| ghormeh-sabzi-recipe-italy | 1250 → 1540 | 1063 → 1288 | 1011 → 1232 |
| gheimeh-recipe-italy | 483 → 747 | 416 → 605 | 411 → 588 |
| fesenjan-recipe-italy | 483 → 738 | 393 → 561 | 402 → 560 |
| gheimeh-bademjan-recipe-italy | 464 → 716 | 401 → 577 | 405 → 567 |
| celery-stew-recipe-italy | 438 → 683 | 371 → 530 | 367 → 518 |
| spinach-plum-stew-recipe-italy | 450 → 689 | 379 → 535 | 374 → 518 |
| saffron-rice-recipe-italy | 440 → 693 | 377 → 541 | 383 → 546 |
| dolmeh-vine-leaves-recipe-italy | 455 → 714 | 382 → 550 | 398 → 561 |
| ash-reshteh-recipe-italy | 439 → 686 | 378 → 543 | 380 → 536 |
| persian-pinto-beans-recipe-italy | 387 → 620 | 332 → 493 | 330 → 478 |
| soya-pasta-sauce-recipe-italy | 424 → 658 | 360 → 515 | 364 → 512 |
| okra-stew-recipe-italy | 414 → 643 | 350 → 505 | 356 → 496 |
| ghalieh-herb-stew-recipe-italy | 429 → 657 | 365 → 517 | 373 → 519 |
| kashk-bademjan-recipe-italy | 451 → 689 | 391 → 554 | 384 → 534 |
| baghali-ghatogh-recipe-italy | 409 → 630 | 348 → 512 | 350 → 502 |
| sholezard-recipe-italy | 414 → 643 | 369 → 532 | 373 → 530 |
| fried-eggplant-cooking-guide | 415 → 647 | 342 → 513 | 345 → 500 |
| baghali-polo-recipe-italy | 397 → 623 | 334 → 494 | 344 → 496 |
| ghormeh-sabzi-herb-mix-italy | 405 → 628 | 345 → 509 | 349 → 508 |
| mirza-ghasemi-recipe-italy | 412 → 641 | 339 → 507 | 334 → 487 |
| masala-sauce-cooking-guide-italy | 415 → 642 | 351 → 521 | 345 → 495 |
| pinto-beans-mushrooms-recipe-italy | 390 → 621 | 340 → 497 | 336 → 480 |
| long-grain-rice-buying-cooking-italy | 403 → 639 | 336 → 507 | 335 → 499 |
| saffron-infusion-cooking-guide | 396 → 636 | 324 → 489 | 317 → 461 |
| pistachios-persian-italian-serving-guide | 367 → 597 | 305 → 468 | 297 → 453 |
| edible-rosewater-italy-cooking-guide | 365 → 576 | 322 → 482 | 306 → 453 |
| dates-serving-guide-italy | 359 → 588 | 307 → 469 | 302 → 452 |
| persian-black-tea-brewing-italy | 400 → 634 | 323 → 491 | 325 → 483 |

## Verification

- Syntax checks passed for product-guides.mjs, blog-editorial-extensions.mjs and blog-content.mjs.
- tools/check.mjs passed for all 28 catalogue entries and their existing asset/source consistency.
- tools/seo-check.mjs passed: all 93 rendered article variants; paragraph, table and FAQ text; unique section IDs/TOC anchors; translated internal links; canonical/reciprocal hreflang; BlogPosting wordCount and modification dates; 180 sitemap entries; private-page and preview noindex protections. Test catalogue is isolated; the preview database was not edited.
- Browser: Persian Gheimeh additions visible in the page and table of contents; the new FAQ opens to show its answer. Hani’s new comparison table and paragraphs are present in the rendered DOM. Updated reading estimates appear in article headers.
- In-app screenshot/viewport capture has an oversized blank-buffer issue and viewport overrides did not affect the reported viewport. No mobile/standard-width visual approval is claimed. Screenshot of the rendered Hani opening is saved in screenshots/articles-expanded-hani-fa.png using the supported screenshot clipping API; temporary viewport override was reset.

## Editorial limits

Cooking proposals remain untested by the Persia Market kitchen and are not factory formulas or pack-heating instructions. Illustrative catalogue products remain labelled. Italy ingredient names are not stock guarantees. Existing primary recipe references were revisited for herb, rice and bean-method context; the Hani stew page was inaccessible during this pass, so no new factory, live availability or legality claim was inferred from it. Cultural and place additions are editorial observation exercises, not new historical findings.

Preview runs at http://127.0.0.1:4194 and remains noindex. Production indexing was not enabled.
