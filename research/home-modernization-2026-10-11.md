# Homepage visual update — 11 October 2026

The homepage features six existing articles: Hani products, Hani brand history,
Iran/Italy cultural connections, comparisons of Italian places with Iran,
Ghormeh Sabzi, and saffron rice. Mobile slides occupy the full track width;
desktop keeps three cards and tablet keeps two. No autoplay is enabled.

The mobile header places the wordmark, language selector, account, cart and
menu in one row. Opening the menu reveals product search and navigation.
Escape closes it. Language selection uses the existing store action. The
menu is initialized before authentication/catalogue loading, so it also works
on slower connections. Early language changes use a normal server navigation.
The static search form remains visible when JavaScript is disabled. Hero touch
panning and its arrow alternatives remain, with the visible swipe instruction
removed. Rounded buttons and article cards retain the green/gold palette.

## Hani brand artwork

Mode: built-in image generation, using actual Ghormeh and Mirza tray cutouts
as packaging references. This is editorial artwork; original catalogue pack
photographs remain in the article's product-family section. No article facts
or production claims were changed. The collage treatment was replaced with
a full photographic composition on cards and the article cover.

Published assets:

- `/assets/journal/hani-brand-editorial-v2.webp`: 1280 × 853, 246,572 bytes.
- `/assets/journal/hani-brand-editorial-v2-card.webp`: 640 × 427, 76,310 bytes.

Only resizing and WebP encoding were performed with Sharp after generation.

Generation prompt:

> Create a premium photographic editorial cover for a Persian food brand profile on Persia Market. Landscape 3:2 composition, high-end food magazine photography, realistic natural textures, softly directional studio daylight, restrained emerald green and warm travertine palette. Use the two supplied HANI ready-meal trays as packaging identity references: gold oval trays, black photographic sleeves, red HANI wordmark; preserve the authentic package design and readable HANI branding, remove the white cutout backgrounds and the corrupted stretched edge artifacts visible in the reference files. Do not invent new labels, certifications, origin claims, or a factory. Compose two clean HANI trays toward the back/side and one small ceramic bowl of herb-and-bean stew with a modest plate of saffron rice in front, a linen napkin and a few fresh herbs. A minimal refined pantry tabletop, no people, no busy collage, no text overlay or watermark, no oversized HANI title or border, no meat pieces. Products and food must remain entirely within the central 85% of the frame so the image crops gracefully to a web card. Photoreal, sophisticated depth and appetizing food styling. This is an editorial illustration using packaging references, not a documentary factory image.

## Verification

The Edge carousel check covers six unique links, desktop/tablet/mobile card
counts, native swiping, RTL/LTR arrows, keyboard boundaries, reduced motion,
JavaScript-free links and scrolling, and mobile header layout at 320, 360,
390 and 618 pixels in all three languages. Header checks include the text's
actual box to detect logo/control overlap even with fallback fonts.
The browser check also holds the session request and exercises menu/search
before storefront hydration to protect that loading behavior.
