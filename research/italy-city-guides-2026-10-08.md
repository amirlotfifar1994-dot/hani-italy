# Italy city guides — editorial and implementation record

Reviewed: 8 October 2026.

## Initial collection

Ten city guides: Milan, Rome, Turin, Bologna, Florence, Venice, Naples, Genoa, Palermo and Verona. Each has Persian, Italian and English content, local etiquette, recurring traditions, four sightseeing starting points, local food, an editorial itinerary, practical planning, FAQs and onward reading. This is an initial collection, not coverage of every Italian municipality.

The journal has a dedicated city category and collection navigation, also available from the home page. Search accepts the three localized city names. Each article retains the visual story template, top contents menu, one-column reading sections and paired photography/text at wider widths.

## Research and currency

Primary sources are embedded in the article data and rendered beside the relevant sections: official municipal and tourism websites, museum/monument operators, festival organizers and UNESCO where relevant. Source records are maintained in `server/italy-city-data-{north,south,coast}.mjs`.

Travel routes and suggested choices are editorial proposals. The guides do not invent transport fares, ticket prices, opening hours or future festival programmes.

Two current conditions are dated explicitly in all three languages:

- Venice: the official entry-contribution portal reported the end of its 2026 trial, with no payment or exemption request required from 27 July for that period. Later years require new municipal decisions. Source: https://cda.ve.it/en/
- Bologna: Bologna Welcome reported the Asinelli Tower closed because of works around the towers. A climb requires an official reopening notice.

Religious observances are described as traditions and beliefs. Traditional dishes containing meat, fish, dairy or alcohol are identified without implying they are vegetarian or offered in the store. The product assortment is unchanged.

## Photographs

Twenty distinct real photographs, two per city, from Wikimedia Commons. File pages, original authors and license URLs are stored in `research/city-photo-credits.json` and credited beside the displayed images. No generated image is presented as a real landmark.

The optimized full images are WebP, at most 1,280 pixels wide; the largest is 332,380 bytes and all twenty together are 4,012,496 bytes. Separate 640 × 420 card versions avoid sending full-size article photographs to listing cards. Original downloaded JPEGs and provenance remain available. The contact sheet `screenshots/city-photo-review.jpg` was reviewed to confirm location and subject; misleading initial search results were replaced before publication in the local preview.

## SEO and validation

`npm run journal:check` passed after the final renderer change. The suite checks all 126 article language variants (42 articles), canonical links, reciprocal hreflang, metadata, BlogPosting/Breadcrumb markup, actual image references, source links, internal reading links, sitemap coverage and safe HTML escaping. City-specific assertions verify localized City/Country schema, consistent section numbering and unique photo bytes with provenance and an image-size budget.

Browser checks verified city filtering (10 results), a Persian-page search for “Milano” (one Milan result), Persian/English/Italian navigation, image loading, the top contents menu and anchor navigation. Responsive DOM checks at an effective 470-pixel viewport showed one photo column and no horizontal overflow; wider checks showed paired image and text columns. Screenshot capture at scrolled positions in the in-app browser intermittently returned a blank canvas, so those captures are not treated as visual evidence. The successful desktop article hero screenshot is retained as `screenshots/italy-city-article-proof.jpg`.

The localhost preview deliberately remains noindex. The test site's example origin is not a production domain and no public deployment was performed.

## Extending the collection

Add researched localized city data to the appropriate data module, register its key in the ordered collection in `server/italy-city-guides.mjs`, and add licensed photographs with their full provenance. The shared builder creates language versions and connects listing, home navigation, article metadata and sitemap automatically. Run the journal checks and review every new photograph's actual location before delivery.
