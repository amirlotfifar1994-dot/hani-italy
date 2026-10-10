import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";
const root = new URL("../", import.meta.url);
const html = await fs.readFile(new URL("dist/index.html", root), "utf8");
const app = await fs.readFile(new URL("dist/app.js", root), "utf8");
const products = JSON.parse(await fs.readFile(new URL('dist/catalogue.json',root),'utf8'));
assert.equal(products.length, 53);
assert.equal(products.filter((p) => p.brand === "Hani").length, 47);
assert.equal(products.filter((p) => p.example).length, 6);
assert.ok(products.slice(0,47).every(p => p.brand === "Hani"), "Sourced Hani range has priority");
assert.equal(new Set(products.map((p) => p.id)).size, products.length);
const sources = JSON.parse(
  await fs.readFile(new URL("research/product-sources.json", root), "utf8"),
);
for (const p of products) {
  assert.equal(p.name.length, 3);
  assert.equal(p.ingredients.length, 3);
  assert.ok(p.name.every(Boolean) && (p.ingredients.every(Boolean)||p.stockPending));
  assert.ok((Number.isInteger(p.cents) && p.cents > 0)||(p.cents===null&&p.stockPending));
  assert.ok(["g", "ml"].includes(p.unit));
  await fs.access(new URL("dist/" + p.image, root));
  if (p.example) {
    assert.equal(p.brand, null, "Don't invent supplier brands for samples");
    assert.ok(!p.sourceUrl, "Samples must not masquerade as sourced products");
    assert.ok(Number.isInteger(p.sprite) && p.sprite >= 0 && p.sprite < 6);
    continue;
  }
  const source = sources.products.find((s) => s.slug === p.slug);
  assert.ok(source, "Missing source " + p.id);
  assert.equal(p.weight, source.weight);
  assert.ok(
    !/\b(beef|chicken|lamb|pork|fish|meat stock|meat broth)\b/i.test(
      source.ingredients,
    ),
    "Meat ingredient in " + p.id,
  );
  await fs.access(new URL("dist/assets/hani/" + p.id + ".webp", root));
}
assert.equal(products.filter(p=>p.brand==='Hani'&&p.status==='published').length,44);
assert.equal(products.filter(p=>p.publicationHold&&p.status==='draft').length,3);
assert.equal(products.filter(p=>p.packaging==='tinplate'&&p.cents===null&&p.stockPending).length,25);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(new Set(ids).size, ids.length, "Duplicate IDs");
for (const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)) {
  const asset = match[1].split("?")[0];
  if (/^(https?:|data:)/.test(asset)||asset==="/blog") continue;
  await fs.access(new URL("dist/" + asset, root));
}
for (const match of html.matchAll(/href="#([^"]+)"/g))
  assert.ok(ids.includes(match[1]), "Broken section link " + match[1]);
for (const match of app.matchAll(/\$\(["']#([a-z][\w-]*)["']\)/g))
  assert.ok(ids.includes(match[1]), "Missing required element " + match[1]);
assert.ok(!html.includes('href="#"'), "Placeholder links");
const helpers = vm.runInNewContext("const dictionary={};const products="+JSON.stringify(products)+";\n" + app.slice(app.indexOf("const validOrder ="), app.indexOf("const storedOrders =")) + "\n" + app.slice(app.indexOf("const normalize ="), app.indexOf("const heart =")) + "\n" + app.slice(app.indexOf("function total("), app.indexOf("function renderCart(")) + ";({validOrder, normalize, total})");
const sampleOrder = { id: "PM-DEMO-1234ABCD", date: "2026-10-03T00:00:00.000Z", destination: { city: "Roma", postcode: "00185" }, lines: [{ id: products[0].id, quantity: 2, cents: 300 }] };
assert.ok(helpers.validOrder(sampleOrder));
for (const invalid of [null, {}, { ...sampleOrder, lines: [null] }, { ...sampleOrder, lines: [...sampleOrder.lines, ...sampleOrder.lines] }, { ...sampleOrder, destination: { city: "Roma", postcode: "185" } }, { ...sampleOrder, lines: [{ ...sampleOrder.lines[0], quantity: -1 }] }]) assert.ok(!helpers.validOrder(invalid), "Reject malformed saved receipts without breaking startup");
assert.equal(helpers.total(sampleOrder.lines), 600, "Historical receipt totals use captured prices");
assert.equal(helpers.normalize("TÈ"), "te");
assert.equal(helpers.normalize("قِيمه"), "قیمه");
console.log(
  "Validated 53 products: 47 sourced Hani items and 6 labelled assortment examples; units, assets, source data, section links, saved receipt validation, captured totals and search normalization.",
);
