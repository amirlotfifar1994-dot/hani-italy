# Homepage journal slider

The homepage editorial stories use a native horizontal scroll-snap track with three cards on desktop, two on tablet, and one with a preview of the next card on mobile. Localized previous/next buttons, group indicators and keyboard navigation follow RTL/LTR direction. No autoplay is used. City guides remain outside the slider.

All article links remain server-rendered. Without JavaScript the track remains scrollable. Reduced-motion preferences disable smooth scrolling. Existing image decoding and opacity reveals remain intact.

Validated with `tools/journal-carousel-check.mjs`: three languages, boundary buttons, Home/arrow keys, responsive resizing, native CDP touch swipe, pagination, reduced motion, no page overflow, and the no-JavaScript fallback. The existing catalogue/account/admin/comment and SEO checks also passed.
