# Italy city guide enrichment — 8 October 2026

## Scope

Updated Milan, Rome, Turin, Bologna, Florence, Venice, Naples, Genoa, Palermo and Verona in Persian, English and Italian. All guides retain their customs, celebrations, Iranian comparisons, itinerary and moderated article comments.

- City identity and a separate travel/student planning paragraph.
- Four local foods per city: 40 preparations, each with Italian name, ingredients or texture and local context. Meat, dairy, fish or alcohol are identified where pertinent; food mentions do not change the meatless store assortment.
- 16 distinct universities, plus a separate UniFi teaching-location entry. Introductions describe programme areas and campus planning, with official references. No claims of guaranteed admission, annual fees, rankings or admission deadlines are inserted.
- Four photographed sightseeing entries per city. Desktop alternates photography and prose; a single column is used at smaller widths.
- 50 distinct photographs overall: ten covers and forty landmark photos. Thirty new photos were added. All files are WebP and below 400 KB; the largest is 382,656 bytes. Creator, licence, source, dimensions and content hashes are checked.
- Captions describe what is actually shown: e.g. Norman Palace courtyard, Farnese Atlas at MANN, details of San Petronio’s entrance and the Bigo at Porto Antico. A historical drawing of Florence, a Caserta image, a commercial Genoa port photograph, an old Turin street image and a San Gregorio cloister photograph were rejected/replaced during review.

## Official university references

| City | Institutions and primary pages |
| --- | --- |
| Milan | [Politecnico](https://www.polimi.it/en/education), [Statale](https://www.unimi.it/en/education/university-guidance/why-choose-university-milan), [Bocconi](https://www.unibocconi.it/it/corsi-di-studio) |
| Rome | [Sapienza structures](https://www.uniroma1.it/en/pagina/structures), [Roma Tre departments](https://www.uniroma3.it/ateneo/dipartimenti-e-scuole/dipartimenti/) |
| Turin | [UniTo programmes](https://www.unito.it/didattica/offerta-formativa), [Politecnico](https://www.polito.it/en/education) |
| Bologna | [UniBo multicampus](https://www.unibo.it/en/university/organisation-and-campuses/multicampus) |
| Florence | [UniFi schools](https://www.unifi.it/en/university/who-we-are/facilities/schools), [teaching locations](https://www.unifi.it/en/study-us/university-life/campuses-and-student-services/campuses-and-facilities) |
| Venice | [Ca’ Foscari](https://www.unive.it/pag/17217/), [Iuav](https://www.iuav.it/en/node/5711) |
| Naples | [Federico II departments](https://www.terzamissione.unina.it/departments/), [L’Orientale languages and cultures](https://scegli.unior.it/landing-lingue-culture.html) |
| Genoa | [UniGe student guides](https://unige.it/en/orientamento/guidestudenti) |
| Palermo | [UniPa 2025–26 student guide](https://www.unipa.it/strutture/orientamento/.content/documenti/Guide_dello_studente_2025/WEB_Guida-intera_ENG_2025-26.pdf) — used for subject areas, not current admission terms |
| Verona | [UniVR programmes](https://www.univr.it/en/web/guest/degree-programmes) |

## Food references

Existing official tourism references remain attached to the sections. New localized descriptions were checked against [YesMilano](https://www.yesmilano.it/en/articles/traditional-dishes-milano), [Turismo Torino](https://turismotorino.org/it/visita/cosa-fare-e-vedere/enogastronomia/piatti-della-tradizione), [Bologna Welcome](https://www.bolognawelcome.com/it/blog/cosa-mangiare-a-bologna), [Turismo Roma](https://www.turismoroma.it/it/pagina/sette-piatti-della-tradizione-un-vero-pranzo-romano), [Visit Tuscany](https://www.visittuscany.com/en/ideas/top-10-foods-you-must-eat-in-tuscany/), [Visit Genoa](https://www.visitgenoa.it/it/prodotti-tipici-e-ricette), [Visit Verona](https://www.visitverona.it/en/explore/taste-verona), and Italia.it’s [Naples food](https://www.italia.it/it/campania/napoli/cosa-fare/migliore-streetfood-napoli), [Sicilian street food](https://www.italia.it/it/sicilia/cosa-fare/sicilia-street-food) and [Venetian traditions](https://www.italia.it/it/veneto/venezia/cosa-fare/festa-del-bocolo-e-di-san-marco-a-venezia).

## Validation

- `npm run check`: passed catalogue, account/Google, admin, stock/offers, multilingual SEO and moderated comment tests.
- `npm run journal:check`: passed article depth and all 126 article variants. Tests also verify the new city profile, four food rows, university references/checklist, four landmark cards, unique image contents and BlogPosting image arrays.
- Browser inspected the expanded Florence content and photographed cards, then Milan’s final alternating layout. At the observed small viewport (470 CSS px, due to existing browser zoom) landmark cards stack in one column with no page overflow. Temporary viewport override was reset.
- Screenshot: `screenshots/city-enrichment-proof.jpg`; it is cropped from the actual full-page browser capture to show the article’s photographed sightseeing section.
- Preview restarted on `http://127.0.0.1:4194`. Public deployment and production indexing were not performed.
