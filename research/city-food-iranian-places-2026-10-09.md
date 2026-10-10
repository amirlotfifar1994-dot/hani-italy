# City foods and Iran-related places — 9 October 2026

## Delivered

Milan, Rome, Turin, Bologna, Florence, Venice, Naples, Genoa, Palermo and Verona each have four photographed local-food cards and an Iran-related addresses section. Content, navigation shortcuts, descriptions and reading estimates are available in Persian, English and Italian. Desktop cards use two columns and a single column is specified below 760 px. Existing city comparisons, universities, sightseeing photos, itineraries and moderated comments remain in the articles.

## Primary references for the thirteen places

| City | Selected places and references |
| --- | --- |
| Milan | [Shalto](https://www.shalto.it/) — Viale Gian Galeazzo 6; described as Persian-style cooking, matching the venue’s wording. |
| Rome | [Taberna Persiana](https://tabernapersiana.com/chi-siamo/) — Via Ostiense 36/H; [Tanur](https://ristorantetanur.com/) — Via Chiana 54. |
| Turin | [Sharazad, municipal tourism listing](https://turismotorino.org/visit/where-to-eat/ristorante-persiano-sharazad) — Via dei Mercanti 3/A. |
| Bologna | [Pars, official business page](https://ristorantepars.eatbu.com/?lang=en) — Via Pietro Lianori 16 A, Bolognina. |
| Florence | [Tehran](https://ristorantetehran.com/menu/) — Via dei Cerchi 25/R; [Shisha](https://www.ristorantepersianofirenze.com/) — Via dei Benci 19r. |
| Venice | [Casa della Cultura Iraniana](https://www.casadellaculturairaniana.com/contatti.php) — Via Cecchini 9, mainland Mestre. Cultural institution, not a restaurant. |
| Naples | [Soraya](https://www.ristorantesoraya.it/?lang=en) — Via Michele Zannotti 11A. Separate from Genoa’s similarly named venue. |
| Genoa | [Soraya’s business page](https://ristorante-soraya.eatbu.com/?lang=it) lists Via Guglielmo Oberdan 20, while [the restaurant contact page](https://www.ristorantesoraya.com/contact_us.html) lists 22/R. Both are in Nervi. The discrepancy is disclosed; map search uses the venue name and street without asserting an exact entrance. |
| Palermo | [JUN](https://jun-kebab.com/en/) — Via La Lumia 94; explicitly described as Sicilian–Persian fusion. |
| Verona | [Shahmansouri](https://shahmansouri.com/contatti.html) — Stradone Arcidiacono Pacifico 14; [Akbar Ghasemi](https://www.veronatappeti.it/) — Via Interrato dell’Acqua Morta 48H. Rug and craft addresses, not grocery shops. |

The selection is not an exhaustive business directory. Iranian ownership is not inferred from a name. Ratings, present-day opening hours, prices, event dates and stock promises are omitted. Users can check the primary source and open a Google Maps search containing the venue name and address. No embedded tracking map is loaded. No exact coordinates, place IDs or ratings are invented.

An old directory entry for a Persian restaurant in Palermo was rejected because its review text referred to Florence. Samarkand’s central Asian identity was not represented as exclusively Iranian.

## Forty distinct food images

- 34 reusable Commons photographs; individual sources, authors, licences, dimensions and asset paths are in `city-food-photo-credits.json`. Credits and licence links render beside each photograph.
- Six original illustrative serving scenes produced with the built-in imagegen tool: Milan’s ossobuco, Florence’s bistecca, Palermo’s arancine and cannoli, Verona’s risotto all’Amarone and bollito con pearà. They do not depict a named restaurant or commercial product. Provenance: `city-food-generated-credits.json`. Exact final prompts: `city-food-image-prompts.json`.
- Final project assets, including preserved generated PNGs and optimized WebP/card files: `../dist/assets/journal/city-foods/`. Filenames use stable city/dish sequence keys; localized alternative text identifies each food.
- Visual review rejected a Carbonara church photograph, a Farinata square, a turkey mortadella package, non-green lasagna, a Margherita ingredient diagram, a Babà carnival picture and pumpkin farinata. Four poor food photographs were replaced with generated editorial illustrations. Acquired originals remain available locally for provenance but rejected images are not referenced by article data.
- The illustrated dishes are described as example servings. No AI marketing tagline is added beneath them.
- Contact sheet: `../screenshots/city-foods-review.jpg`. Sources and final files are distinct by SHA-256, and served WebP files remain below 400 KB.

## Validation and limits

- `npm run check` passed catalogue, accounts/Google, administrator pricing/stock/offers, SEO and moderated-comment checks.
- `npm run journal:check` passed article-depth and SEO checks for all 42 articles in 126 language variants.
- Additional checks verify four food cards/photos per city, exact map query/address correspondence, primary source relationships, readable place descriptions, summary links and BlogPosting image/word-count metadata. Publication dates are preserved; city modification dates are 2026-10-09.
- A live HTTP check confirmed all ten Persian guide URLs return 200, four food cards, at least one map link and the new modification date; thirteen place links in total.
- Preview was restarted on `http://127.0.0.1:4194` with the project’s hidden background Node process (PID 28936 at startup).
- Final browser inspection could not execute: automatic approval review reported a usage-limit failure. This was not a determination that the browser action was unsafe. No alternative browser-control mechanism was used to bypass review. Responsive CSS is implemented, but a new visual desktop/mobile proof screenshot was not captured for this change.
- The final site remains a local preview. Production deployment and indexing were not requested.
