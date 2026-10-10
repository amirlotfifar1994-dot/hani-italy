# Home design and Pasargadae identity

The owner requested a more distinctive city-guide collection, a full-background mobile hero with touch panning and readable text, and a bespoke logo. The owner then specified Pasargadae as the logo direction.

The mobile hero preserves the original Iran–Italy scene as a cover image. Horizontal pointer gestures pan within the image bounds; vertical gestures remain available for page scrolling. Visible arrow buttons offer the same operation without dragging. A full-scene dark gradient and light text replace the separate cream text area. Desktop layout and the header-aware first viewport are retained.

The home/journal city collection now uses ten unique existing guide photographs, city/region labels, numbered postcard cards and direct links to all ten guides. Image attribution remains available in the linked articles and research/city-photo-credits.json. All links and three-language metadata remain intact. No new travel claims were added.

The Pasargadae mark was generated with the built-in imagegen tool. It is an artistic brand abstraction inspired by the stepped Tomb of Cyrus and lotus ornament, not an archaeological reconstruction or a national emblem. It appears in the home header/footer, account/admin, journal/product/information headers and organization schema. The old mark is retained as an unused original asset. The browser favicon uses a dedicated 64px transparent PNG.

Original output: dist/assets/brand/pasargadae-original-v1.png. Production mark: dist/assets/persia-pasargadae-v1.webp. Favicon: dist/favicon-pasargadae-v1.png. tools/optimise-brand.mjs resizes and converts the alpha-preserving raster; it does not generate or redraw the art.

Exact generation prompt:

> Use case: logo-brand. Design ONE distinctive premium emblem for Persia Market, a Persian grocery and cultural brand in Italy. The owner's explicit visual direction is PASARGADAE and ancient Persian architecture. Central motif: an elegant front-facing architectural abstraction of the Tomb of Cyrus at Pasargadae: a broad six-tier stepped stone plinth tapering upwards, a small rectangular chamber above it, a clear simple pitched triangular roof, one narrow dark negative-space doorway. This recognizable stepped monument is the main mark, not a Greek temple, pagoda, mosque, dome or generic star. Below the steps integrate two restrained mirrored Achaemenid lotus leaves as part of the base, evoking Persian heritage and hospitality. Refined balanced symmetry, confident clean lines and solid shapes, very few details, readable at 40px, polished luxury food-brand identity. Flat vector-like artwork in ONE solid antique gold color #c8a66b. No text or letters, no border badge, no photorealism, no texture, no gradient, no metallic shine, no shadows, no flags, no national emblems, no shopping cart. Centered compact emblem occupies 85% of square canvas with generous even margin. Actual fully transparent background, clean alpha edges, no white or green background. The silhouette should be beautifully distinctive yet architecturally recognizable.

The output was visually reviewed and retains alpha. It has slight tonal variation despite the flat-color prompt. Source and production files remain available for a later vector redraw if requested.
