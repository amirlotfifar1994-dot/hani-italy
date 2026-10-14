const products = window.PersiaCatalogue || [];
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const languageIndex = { fa: 0, en: 1, it: 2 };
const dictionary = window.PersiaCopy || {};
const customerStorageKey = key => {
  const privateKey = /^persia\.v1\.(basket|favorites|orders|checkoutPending)$/.test(key);
  return privateKey && window.PersiaAuth?.user ? "persia.user."+window.PersiaAuth.user.id+"."+key.split(".").pop() : key;
};
const store = {
  read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(customerStorageKey(key))) ?? fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(customerStorageKey(key), JSON.stringify(value));
    } catch {}
  },
};
let lang = new URLSearchParams(location.search).get("lang") || window.PersiaSeo?.lang || store.read("persia.v1.language", "it");
if (!Object.hasOwn(languageIndex, lang)) lang = window.PersiaSeo?.lang || "it";
let filter = "hani",
  sort = "featured",
  expandedCatalogue = false,
  currentProduct = null,
  orderSnapshot = null,
  activeInfo = null;
let checkoutStarting = false, confirmingOrder = false;
const validOrder = (order) => order && typeof order === "object" &&
  /^PM-DEMO-[A-F0-9]{8}$/.test(order.id) && Number.isFinite(Date.parse(order.date)) &&
  order.destination && typeof order.destination.city === "string" && order.destination.city.trim().length >= 2 && order.destination.city.length <= 80 && /^[0-9]{5}$/.test(order.destination.postcode) &&
  Array.isArray(order.lines) && order.lines.length > 0 && order.lines.length <= 5000 &&
  order.lines.every(line => line && /^[a-zA-Z0-9-]{1,80}$/.test(line.id) && Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= 99 && Number.isInteger(line.cents) && line.cents > 0 && line.cents <= 1000000) &&
  new Set(order.lines.map(line => line.id)).size === order.lines.length;
const storedOrders = store.read("persia.v1.orders", []);
const orderHistory = Array.isArray(storedOrders) ? storedOrders.filter(validOrder).slice(0, 5) : [];
const rawBasket = store.read("persia.v1.basket", window.PersiaAuth?.user ? {} : store.read("hani.v1.basket", {})),
  basket = {};
const rawFavorites = store.read("persia.v1.favorites", window.PersiaAuth?.user ? [] : store.read("hani.v1.favorites", []));
const favorites = new Set(
  Array.isArray(rawFavorites)
    ? rawFavorites.filter((id) => products.some((p) => p.id === id))
    : [],
);
const t = (key) =>
  dictionary[key]?.[languageIndex[lang]] || dictionary[key]?.[0] || key;
const local = (values) => values[languageIndex[lang]];
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const money = (cents) =>
  cents===null?t('pricePending'):new Intl.NumberFormat(
    lang === "fa" ? "fa-IR" : lang === "it" ? "it-IT" : "en-IE",
    { style: "currency", currency: "EUR" },
  ).format(cents / 100);
const number = (value) =>
  new Intl.NumberFormat(
    lang === "fa" ? "fa-IR" : lang === "it" ? "it-IT" : "en-IE",
  ).format(value);
const source = (p) => p.sourceUrl || t("sampleProduct");
const image = (p) => p.image;
const measure = (p) => number(p.weight) + " " + t(p.unit === "pcs" ? "pieces" : p.unit === "ml" ? "millilitres" : "grams")+(p.packaging?" · "+t(p.packaging):"");
const orderLineName=line=>line.name?.length===3?local(line.name):local(products.find(p=>p.id===line.id)?.name||[line.id,line.id,line.id]);
const canBuy=p=>p&&Number.isInteger(p.cents)&&p.cents>0&&!p.stockPending&&!p.publicationHold&&p.status!=='draft'&&p.status!=='archived'&&(p.stock===null||p.stock===undefined||p.stock>0);
function reconcileBasket(incoming) {
  const next = {};
  if (incoming && typeof incoming === "object" && !Array.isArray(incoming)) {
    for (const p of products) {
      const quantity = incoming[p.id];
      if (canBuy(p) && Number.isInteger(quantity) && quantity > 0 && quantity <= 99)
        next[p.id] = Math.min(quantity, p.stock ?? 99);
    }
  }
  for (const id of Object.keys(basket)) delete basket[id];
  Object.assign(basket, next);
}
reconcileBasket(rawBasket);
const hasDiscount=p=>Number.isInteger(p.cents)&&Number.isInteger(p.compareAtCents)&&p.compareAtCents>p.cents;
const productPrice=p=>p.cents===null?`<b class="price price-pending">${t('pricePending')}</b>`:`<b class="price">${money(p.cents)}</b>${hasDiscount(p)?`<del class="reference-price">${money(p.compareAtCents)}</del><span class="sale-percentage">−${number(Math.round((1-p.cents/p.compareAtCents)*100))}%</span>`:""}`;
const productUrl=p=>"/products/"+p.id+"?lang="+lang;
const productLabel=p=>t(p.example?'sampleProduct':p.meatless?'meatless':'marketProduct');
const productArt = (p, className) => p.example && Number.isInteger(p.sprite)
  ? `<span class="${className} sample-art sample-${p.sprite}" role="img" aria-label="${escapeHtml(local(p.name))}"></span>`
  : `<img class="${className}" src="${escapeHtml(image(p))}" alt="${escapeHtml(local(p.name))}" loading="lazy">`;
const normalize = (value) =>
  value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\u200d]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
Object.assign(dictionary,{productSource:['مشاهده منبع محصول ↗','View product source ↗','Vedi la fonte del prodotto ↗'],haniBrand:['محصولات هانی','Hani products','Prodotti Hani'],viewHani:['مشاهده همه محصولات هانی ←','View all Hani products →','Vedi tutti i prodotti Hani →'],catalogSource:["محصولات هانی بر اساس فهرست ۴۷ قلمی عرضه و کاتالوگ هلند ثبت شده‌اند. اطلاعات هر وزن و بسته‌بندی را جداگانه بررسی کنید. منبع محصولات: ","Hani products follow the 47-item assortment list and Netherlands catalogue. Check each weight and pack separately. Product source: ","I prodotti Hani seguono la lista di 47 referenze e il catalogo olandese. Consulta separatamente ogni peso e confezione. Fonte dei prodotti: "],catalogueChanged:['قیمت یا موجودی تغییر کرده است؛ سبد را دوباره بررسی کنید.','Price or availability changed; review your bag again.','Prezzo o disponibilità cambiati; controlla il carrello.'],pieces:['عدد','pieces','pezzi'],other:['سایر محصولات','Other products','Altri prodotti'],marketProduct:['پرشیا مارکت','Persia Market','Persia Market'],unavailableProduct:['ناموجود','Unavailable','Non disponibile'],managedNote:['مشخصات توسط مدیریت فروشگاه وارد شده است. پیش از خرید واقعی، اطلاعات بسته‌بندی و حساسیت‌ها را بررسی کنید.','Details entered by store management. Check packaging and allergens before real purchases.','Dettagli inseriti dalla gestione. Controlla confezione e allergeni prima di acquisti reali.']});
Object.assign(dictionary,{catalogueUnavailable:[
  'قیمت و موجودی به‌روز دریافت نشد؛ دوباره امتحان کنید',
  'Could not check current prices and stock. Please try again.',
  'Impossibile verificare prezzi e disponibilità aggiornati. Riprova.'
]});
const heart =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
function toast(message) {
  $(".toast").textContent = message;
  $(".toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $(".toast").classList.remove("show"), 2300);
}
function save() {
  store.write("persia.v1.basket", basket);
  store.write("persia.v1.favorites", [...favorites]);
  updateCounts();
}
function updateCounts() {
  const count = Object.values(basket).reduce((sum, q) => sum + q, 0);
  $("#cart-count").textContent = number(count);
  $("#cart-open").setAttribute("aria-label", t("cart") + ", " + number(count));
  $("#favorite-count").textContent = number(favorites.size);
  $("#favorites-toggle").setAttribute(
    "aria-pressed",
    String(filter === "favorites"),
  );
}
const offerEndDate=p=>new Intl.DateTimeFormat(lang==='fa'?'fa-IR':lang==='it'?'it-IT':'en-GB',{timeZone:'Europe/Rome',dateStyle:'medium'}).format(new Date(p.dailyOffer.endDate+'T12:00:00Z'));
function productCard(p){return `<article class="product-card">
          <button class="icon-button product-favorite" data-favorite="${p.id}" aria-pressed="${favorites.has(p.id)}" aria-label="${escapeHtml(t(favorites.has(p.id) ? "favoriteRemove" : "favoriteAdd") + " " + local(p.name))}">${heart}</button>
          <span class="product-tag ${p.example ? "example-tag" : ""}">${productLabel(p)}</span>
          <button class="product-photo" data-product="${p.id}" aria-label="${escapeHtml(t("details") + " " + local(p.name))}">${productArt(p, "product-art")}</button>
          <div class="product-content"><span class="product-category">${escapeHtml(p.brand || t("sampleBrand"))} · ${t(p.category)}</span>
            <h3><a class="product-title" href="${productUrl(p)}" data-product="${p.id}">${escapeHtml(local(p.name))}</a></h3>
            <span class="product-secondary" lang="${lang === "fa" ? "it" : "fa"}" dir="${lang === "fa" ? "ltr" : "rtl"}">${escapeHtml(p.name[lang === "fa" ? 2 : 0])}</span>
            <p>${measure(p)}${p.stockPending?" · "+t("stockPending"):p.stock===0?" · "+t("unavailableProduct"):""}</p>${p.dailyOfferActive?`<p class="offer-end">${t("dailyOfferUntil")} <time datetime="${p.dailyOffer.endDate}">${offerEndDate(p)}</time></p>`:""}
            <div class="product-bottom"><div class="product-prices">${productPrice(p)}</div><button class="add-button" data-add="${p.id}" aria-label="${escapeHtml(t("add") + " " + local(p.name))}" ${canBuy(p)?"":"disabled"}><span>${t("add")}</span><span aria-hidden="true">+</span></button></div>
          </div>
        </article>`;}
function renderDailyOffers(){
 const section=$('#daily-offers'),items=products.filter(p=>p.dailyOfferActive&&canBuy(p));
 section.hidden=document.body.classList.contains('account-open');
 $('#daily-offer-empty').hidden=!!items.length;
 $('#daily-offer-products').hidden=!items.length;
 $('#daily-offer-products').innerHTML=items.map(productCard).join('');
 $('#daily-offer-date').textContent=new Intl.DateTimeFormat(lang==='fa'?'fa-IR':lang==='it'?'it-IT':'en-GB',{timeZone:'Europe/Rome',dateStyle:'long'}).format(new Date());
 const link=$('#daily-offer-nav');if(link)link.hidden=false;
}
function renderProducts() {
  const catalogueLinks=document.querySelector('.seo-catalogue ul');if(catalogueLinks)catalogueLinks.innerHTML=products.map(p=>`<li><a href="${productUrl(p)}">${escapeHtml(local(p.name))}</a></li>`).join('');
  $$('[data-t="haniBrand"]').forEach(el=>el.textContent=t("haniBrand")+" · "+number(products.filter(p=>p.brand==="Hani").length));
  const query = normalize($("#search").value);
  let list = products.filter(
    (p) =>
      (filter === "all" ||
        (filter === "favorites" && favorites.has(p.id)) ||
        (filter === "offers" && hasDiscount(p)) ||
        (filter === "hani" && p.brand === "Hani") ||
        (filter === "ready" && ["stews","meals","pantry","desserts"].includes(p.category)) ||
        p.category === filter) &&
      (!query ||
        normalize([...p.name, ...p.ingredients, p.brand || "", p.id].join(" ")).includes(
          query,
        )),
  );
  if (sort === "featured") list.sort((a,b)=>Number(b.brand==="Hani")-Number(a.brand==="Hani"));
  if (sort === "low") list.sort((a, b) => (a.cents??Infinity) - (b.cents??Infinity));
  if (sort === "high") list.sort((a, b) => (b.cents??-Infinity) - (a.cents??-Infinity));
  if (sort === "name")
    list.sort((a, b) => local(a.name).localeCompare(local(b.name), lang));
  const matchedCount = list.length;
  const showFeatured = ["all", "hani"].includes(filter) && !query && sort === "featured" && !expandedCatalogue;
  $("#show-catalogue").textContent = t(filter === "hani" ? "viewHani" : "viewCatalogue");
  if (showFeatured) list = list.slice(0, 8);
  $("#show-catalogue").hidden = !showFeatured || matchedCount <= 8;
  $("#products").innerHTML = list.map(productCard).join("");
  renderDailyOffers();
  $("#results-count").textContent =
    number(list.length) +
    (showFeatured ? " " + t("of") + " " + number(matchedCount) : "") +
    " " +
    t(list.length === 1 ? "productCountOne" : "productCount") +
    (filter === "favorites" ? " · " + t("favorites") : "");
  $("#empty-results").hidden = !!list.length;
  $("#reset").hidden = !query && filter === "hani" && sort === "featured";
  $$("[data-filter]").forEach((b) => {
    b.classList.toggle("selected", b.dataset.filter === filter);
    b.setAttribute("aria-pressed", String(b.dataset.filter === filter));
  });
  updateCounts();
}
function setFilter(value, scroll = true) {
  filter = value;
  expandedCatalogue = true;
  renderProducts();
  if (scroll)
    $("#shop").scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
}
function reset() {
  filter = "hani";
  sort = "featured";
  expandedCatalogue = false;
  $("#search").value = "";
  $("#header-search").value = "";
  $("#sort").value = "featured";
  renderProducts();
}
function add(id) {
  const p=products.find(p=>p.id===id);if(!canBuy(p)){toast(t('unavailableProduct'));return;}
  if ((basket[id] || 0) >= Math.min(99,p.stock??99)) {
    toast(t("limit"));
    return;
  }
  basket[id] = (basket[id] || 0) + 1;
  save();
  renderCart();
  toast(t("added"));
}
function openDialog(id) {
  const dialog = $("#" + id);
  if (!dialog.open) dialog.showModal();
}
function productGuideLink(p){
 const guide=window.PersiaProductGuides?.[p.guideProductId||p.id];
 if(!guide)return "";
 const label={fa:"راهنمای پخت و مصرف",it:"Guida alla preparazione",en:"Cooking and serving guide"}[lang];
 return `<aside class="seo-product-guide"><p>${label}</p><a href="/blog/${escapeHtml(guide.slug)}?lang=${lang}">${escapeHtml(guide.title[lang])} ↗</a></aside>`;
}
function renderDetail() {
  const p = products.find((p) => p.id === currentProduct);
  if (!p) {if(currentProduct){currentProduct=null;$('#product-detail').innerHTML='';$('#product-dialog').close();}return;}
  $("#product-detail").innerHTML =
    `<div class="detail-layout">${productArt(p, "detail-photo")}<div class="detail-copy"><p class="eyebrow">${escapeHtml(p.brand || t("sampleBrand"))} · ${t(p.category)}</p><h2 id="product-title">${escapeHtml(local(p.name))}</h2><p>${measure(p)} · ${productLabel(p)}</p>${local(p.description||["","",""])?`<p>${escapeHtml(local(p.description))}</p>`:""}<h3>${t("mainIngredients")}</h3><p>${escapeHtml(local(p.ingredients)||t("ingredientsPending"))}</p><p class="notice">${t(p.example ? "assortmentNote" : p.managed ? "managedNote" : "ingredientNote")}</p><div class="product-prices">${productPrice(p)}</div><p>${t("priceNote")}</p>${p.dailyOfferActive?`<p class="offer-end">${t("dailyOfferUntil")} ${offerEndDate(p)} · Europe/Rome</p>`:""}<button class="button primary" data-add="${p.id}" ${canBuy(p)?"":"disabled"}>${t(canBuy(p)?"add":p.stockPending||p.cents===null?"notReady":"unavailableProduct")} +</button>${p.sourceUrl ? `<a class="text-link" href="${escapeHtml(p.sourceUrl)}" target="_blank" rel="noopener">${t(p.managed?"productSource":"source")}</a>` : ""}${productGuideLink(p)}</div></div>${window.PersiaComments.productCommentsMarkup(p.id,lang)}`;
  window.PersiaComments.mountComments(document.querySelector('#product-detail [data-comments-kind]'));
}
function basketLines() {
  return products
    .filter((p) => basket[p.id] && canBuy(p))
    .map((p) => ({ id: p.id, quantity: basket[p.id] }));
}
function total(lines = basketLines()) {
  return lines.reduce(
    (sum, line) =>
      sum + (line.cents ?? products.find((p) => p.id === line.id).cents) * line.quantity,
    0,
  );
}
function renderCart() {
  const lines = basketLines();
  $("#cart-items").innerHTML = lines.length
    ? lines
        .map((line) => {
          const p = products.find((p) => p.id === line.id);
          return `<div class="cart-row">${productArt(p, "cart-product-art")}<div><h3>${escapeHtml(local(p.name))}</h3><b class="price">${money(p.cents * line.quantity)}</b><div class="cart-row-bottom"><div class="qty"><button data-quantity="${p.id}" data-change="-1" aria-label="${escapeHtml(t("decrease") + " " + local(p.name))}">−</button><span>${number(line.quantity)}</span><button data-quantity="${p.id}" data-change="1" aria-label="${escapeHtml(t("increase") + " " + local(p.name))}" ${line.quantity >= Math.min(99,p.stock??99) ? "disabled" : ""}>+</button></div><button class="remove" data-remove="${p.id}" aria-label="${escapeHtml(t("remove") + " " + local(p.name))}">${t("remove")}</button></div></div></div>`;
        })
        .join("")
    : `<div class="empty-state"><h3>${t("emptyCart")}</h3><p>${t("emptyCartBody")}</p><button class="button primary" data-browse>${t("explore")}</button></div>`;
  $("#cart-total").textContent = money(total());
  $("#checkout").disabled = checkoutStarting || !lines.length;
  $("#cart-orders").hidden = !orderHistory.length;
  updateCounts();
}
function renderOrder() {
  if (!orderSnapshot) return;
  $("#order-summary").innerHTML =
    orderSnapshot.lines
      .map((line) => {
        const p = products.find((p) => p.id === line.id);
        return `<div class="order-line"><span>${escapeHtml(orderLineName(line))} × ${number(line.quantity)}</span><span>${money((line.cents ?? p.cents) * line.quantity)}</span></div>`;
      })
      .join("") +
    `<div class="total-line"><span>${t("subtotal")}</span><b>${money(total(orderSnapshot.lines))}</b></div><p class="muted">${t("shippingPending")}</p>` +
    (orderSnapshot.destination ? `<div class="order-destination"><span>${t("destination")}</span><strong>${escapeHtml(orderSnapshot.destination.city)} · <bdi>${orderSnapshot.destination.postcode}</bdi> · ${t("italy")}</strong></div>` : "");
  $("#order-reference").textContent = orderSnapshot.id || "";
}
function setOrderStep(step) {
  $("#delivery-form").hidden = step !== "destination";
  $("#order-summary").hidden = step === "destination";
  $("#order-actions").hidden = step !== "review";
  $("#order-success").hidden = step !== "receipt";
  $$("[data-checkout-step]").forEach(el => {
    if (el.dataset.checkoutStep === step) el.setAttribute("aria-current", "step");
    else el.removeAttribute("aria-current");
  });
}
function renderSavedOrders() {
  $("#saved-orders").innerHTML = orderHistory.length ? orderHistory.map(order => `<article class="saved-order"><div><b dir="ltr">${order.id}</b><p>${new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : lang === "it" ? "it-IT" : "en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(order.date))} · ${escapeHtml(order.destination.city)}</p><span class="price">${money(total(order.lines))}</span></div><button class="button light" data-receipt="${order.id}">${t("viewReceipt")}</button></article>`).join("") : `<div class="empty-state"><p>${t("noDemoOrders")}</p></div>`;
}
function renderInfo() {
  const keys = {
    shipping: ["shipping", "faq3a"],
    contact: ["contact", "contactBody"],
    privacy: ["privacy", "privacyBody"],
    preview: ["preview", "previewBody"],
    regional: ["regional", "regionalBody"],
    homeware: ["homeware", "homewareBody"],
    gifts: ["gifts", "giftsBody"],
  };
  if (!keys[activeInfo]) return;
  $("#info-title").textContent = t(keys[activeInfo][0]);
  $("#info-body").textContent = t(keys[activeInfo][1]);
  if(activeInfo === "contact") $("#info-body").innerHTML = `<p>${escapeHtml(t("contactBody"))}</p><div class="contact-placeholders">${["contactPhone","contactEmail","contactAddress"].map(key=>`<div class="contact-placeholder"><span>${escapeHtml(t(key))}</span>${key==='contactPhone'?`<a href="tel:${escapeHtml(t('publicPhone'))}" dir="ltr">${escapeHtml(t('publicPhone'))}</a>`:`<b aria-label="${escapeHtml(t(key))}"></b>`}</div>`).join("")}</div>`;
}

function updateSeoMetadata(){
 const privatePage=location.pathname==='/account'||/^#account(?:\/|$)/.test(location.hash);
 const base=window.PersiaSeo?.siteUrl||location.origin,path=privatePage?'/account':'/',url=base+path+'?lang='+lang;
 document.title=privatePage?({fa:'حساب کاربری | Persia Market',en:'My account | Persia Market',it:'Il mio account | Persia Market'})[lang]:window.PersiaSeo?.homeTitles?.[languageIndex[lang]]||document.title;
 if(window.PersiaSeo?.homeDescriptions)$('meta[name=description]').content=privatePage?({fa:'ورود و ثبت‌نام در حساب پرشیا مارکت و مدیریت اطلاعات شخصی.',en:'Sign in or register for a Persia Market account and manage your personal information.',it:'Accedi o registrati a Persia Market e gestisci le tue informazioni personali.'})[lang]:window.PersiaSeo.homeDescriptions[languageIndex[lang]];
 const setMeta=(selector,value)=>{const node=document.querySelector(selector);if(node)node.content=value;};
 setMeta('meta[name="robots"]',privatePage?'noindex,nofollow':window.PersiaSeo?.indexing?'index,follow,max-image-preview:large':'noindex,follow');
 setMeta('meta[property="og:title"]',document.title);setMeta('meta[property="og:description"]',$('meta[name=description]').content);setMeta('meta[property="og:url"]',url);setMeta('meta[property="og:locale"]',({it:'it_IT',fa:'fa_IR',en:'en_GB'})[lang]);
 setMeta('meta[name="twitter:title"]',document.title);setMeta('meta[name="twitter:description"]',$('meta[name=description]').content);
 const canonical=document.querySelector('link[rel=canonical]');if(canonical)canonical.href=url;
 document.querySelectorAll('link[rel=alternate][hreflang]').forEach(a=>a.href=base+path+'?lang='+(a.hreflang==='x-default'?'it':a.hreflang));
 document.querySelectorAll('.seo-catalogue a,[data-seo-page]').forEach(a=>{const next=new URL(a.href);next.searchParams.set('lang',lang);a.href=next.pathname+next.search;});
 document.querySelectorAll('script[type="application/ld+json"]').forEach(node=>{try{const schema=JSON.parse(node.textContent);for(const entity of schema['@graph']||[]){if(entity['@type']==='WebPage'){entity['@id']=url+'#page';entity.url=url;entity.inLanguage=lang;entity.name=document.title;entity.description=$('meta[name=description]').content;}}node.textContent=JSON.stringify(schema).replace(/</g,'\\u003c');}catch{}});
}
window.addEventListener('hashchange',updateSeoMetadata);
function setLanguage(next) {
  lang = next;
  store.write("persia.v1.language", lang);
  const languageUrl = new URL(location.href);
  languageUrl.searchParams.set("lang", lang);
  history.replaceState(null, "", languageUrl.pathname + languageUrl.search + languageUrl.hash);
  applyLanguage();
}
function applyLanguage() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  $$("[data-t]").forEach((el) => (el.innerHTML = t(el.dataset.t)));
  $$("[data-placeholder]").forEach(
    (el) => (el.placeholder = t(el.dataset.placeholder)),
  );
  $$("[data-lang]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.lang === lang)),
  );
  $("#navigation").setAttribute("aria-label", t("menu"));
  $(".filters").setAttribute("aria-label", t("categories"));
  $("[data-alt=heroImageAlt]").alt = t("heroImageAlt");
  document.querySelectorAll("[data-alt]").forEach(el=>el.alt=t(el.dataset.alt));
  const adminLink=document.querySelector('#store-admin-link');if(adminLink)adminLink.textContent=({fa:'مدیریت فروشگاه',en:'Store management',it:'Gestione negozio'})[lang];
  document.title =
    "Persia Market | " +
    {
      fa: "طعم خانه، هر کجا که باشید",
      en: "Taste home anywhere",
      it: "I sapori di casa, ovunque",
    }[lang];
  $("meta[name=description]").content = {
    fa: "پرشیا مارکت؛ سوپرمارکت ایرانی در ایتالیا. برنج، زعفران، خشکبار، چای و غذاهای آماده از مجموعه‌ای از برندها.",
    en: "Persia Market, a Persian supermarket in Italy. Rice, saffron, nuts, tea and ready meals from a range of brands.",
    it: "Persia Market, supermercato persiano in Italia. Riso, zafferano, frutta secca, tè e piatti pronti di diversi marchi.",
  }[lang];
  updateSeoMetadata();
  document.querySelectorAll("[data-blog-link]").forEach(a=>a.href="/blog?lang="+lang);
  const blogPreview=document.querySelector("#blog-preview");if(blogPreview&&window.PersiaBlogPreviews?.[lang])blogPreview.innerHTML=window.PersiaBlogPreviews[lang];
  renderProducts();
  renderCart();
  renderDetail();
  renderOrder();
  renderInfo();
  renderSavedOrders();
  document.dispatchEvent(new CustomEvent("persia:language"));
}
document.addEventListener("click", (event) => {
  const el = event.target.closest("button,a");
  if (!el) return;
  if (el.dataset.lang) {
    setLanguage(el.dataset.lang);
  }
  if (el.dataset.filter) {
    if (el.dataset.filter === "all") expandedCatalogue = true;
    setFilter(el.dataset.filter, false);
  }
  if (el.dataset.category) {
    $("#search").value = "";
    $("#header-search").value = "";
    setFilter(el.dataset.category);
  }
  if (el.dataset.add) add(el.dataset.add);
  if (el.dataset.favorite) {
    const id = el.dataset.favorite;
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    save();
    renderProducts();
    const replacement = $(`[data-favorite="${id}"]`);
    if (replacement) replacement.focus({ preventScroll: true });
    else $('[data-filter="favorites"]').focus({ preventScroll: true });
  }
  if (el.dataset.product) {
    if(el.tagName==="A"&&(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey))return;
    event.preventDefault();
    currentProduct = el.dataset.product;
    renderDetail();
    openDialog("product-dialog");
  }
  if (el.dataset.close) $("#" + el.dataset.close).close();
  if (el.hasAttribute("data-orders")) {
    $("#order-dialog").close();
    $("#cart-dialog").close();
    renderSavedOrders();
    openDialog("orders-dialog");
  }
  if (el.dataset.receipt) {
    orderSnapshot = orderHistory.find(order => order.id === el.dataset.receipt);
    if (!orderSnapshot) return;
    renderOrder();
    setOrderStep("receipt");
    $("#orders-dialog").close();
    openDialog("order-dialog");
  }
  if (el.dataset.info) {
    activeInfo = el.dataset.info;
    renderInfo();
    openDialog("info-dialog");
  }
  if (el.dataset.quantity) {
    const id = el.dataset.quantity;
    const q = (basket[id] || 0) + Number(el.dataset.change);
    if (q > Math.min(99,products.find(p=>p.id===id)?.stock??99)) {
      toast(t("limit"));
      return;
    }
    if (q <= 0) delete basket[id];
    else basket[id] = q;
    save();
    renderCart();
    const next = $(
      `[data-quantity="${id}"][data-change="${el.dataset.change}"]`,
    );
    if (next) next.focus({ preventScroll: true });
    else $("#cart-dialog [data-close]").focus({ preventScroll: true });
  }
  if (el.dataset.remove) {
    delete basket[el.dataset.remove];
    save();
    renderCart();
    $("#cart-dialog [data-close]").focus({ preventScroll: true });
  }
  if (el.hasAttribute("data-browse")) {
    $("#cart-dialog").close();
    $("#shop").scrollIntoView({ behavior: "smooth" });
  }
  if (el.matches("nav a, nav button")) {
    $("header").classList.remove("menu-open");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
  }
  if (el.hasAttribute("data-browse-all")) {
    expandedCatalogue = true;
    $("#search").value = "";
    $("#header-search").value = "";
    setFilter("all", false);
  }
});
$("#show-catalogue").addEventListener("click", () => {
  expandedCatalogue = true;
  renderProducts();
});
$("#search").addEventListener("input", () => {
  $("#header-search").value = $("#search").value;
  renderProducts();
});
$("#header-search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#search").value = $("#header-search").value;
  setFilter("all");
  $("#search").focus({ preventScroll: true });
});
$("#sort").addEventListener("change", (event) => {
  sort = event.target.value;
  renderProducts();
});
$("#reset").addEventListener("click", reset);
$("#empty-reset").addEventListener("click", reset);
$("#favorites-toggle").addEventListener("click", () => {
  $("#search").value = "";
  $("#header-search").value = "";
  setFilter("favorites");
});
$("#cart-open").addEventListener("click", () => {
  renderCart();
  openDialog("cart-dialog");
});
$("#checkout").addEventListener("click", async () => {
  if (checkoutStarting || confirmingOrder) return;
  checkoutStarting = true;
  $("#checkout").disabled = true;
  try {
    if (!await refreshCatalogue()) { toast(t("catalogueUnavailable")); return; }
    if (!basketLines().length || !$("#cart-dialog").open) return;
    orderSnapshot = { key: crypto.randomUUID(), lines: basketLines().map(line => ({ ...line, cents: products.find(p => p.id === line.id).cents, name:[...products.find(p=>p.id===line.id).name] })), date: new Date().toISOString() };
    $("#delivery-form").reset();
    setOrderStep("destination");
    renderOrder();
    document.dispatchEvent(new CustomEvent("persia:checkout"));
    $("#cart-dialog").close();
    openDialog("order-dialog");
  } finally {
    checkoutStarting = false;
    $("#checkout").disabled = !basketLines().length;
  }
});
$("#delivery-city").addEventListener("input", () => $("#delivery-city").setCustomValidity(""));
$("#delivery-postcode").addEventListener("input", event => {
  event.target.value = event.target.value.replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
});
$("#delivery-form").addEventListener("submit", event => {
  event.preventDefault();
  if(confirmingOrder)return;
  if (!orderSnapshot) return;
  const city = $("#delivery-city").value.trim();
  $("#delivery-city").setCustomValidity(city.length < 2 ? t("cityInvalid") : "");
  if (!$("#delivery-form").reportValidity()) return;
  orderSnapshot.destination = { city, postcode: $("#delivery-postcode").value };
  renderOrder();
  setOrderStep("review");
  $("#confirm-demo").focus();
});
$("#edit-destination").addEventListener("click", () => {
  if(confirmingOrder)return;
  setOrderStep("destination");
  $("#delivery-city").focus();
});
$("#back-to-basket").addEventListener("click", () => {
  $("#order-dialog").close();
  renderCart();
  openDialog("cart-dialog");
});
$("#confirm-demo").addEventListener("click", async () => {
  if (confirmingOrder || !orderSnapshot?.destination || orderSnapshot.id) return;
  const snapshot = orderSnapshot, destination = snapshot.destination;
  confirmingOrder = true;
  $("#confirm-demo").disabled = true;
  try {
    if (!await refreshCatalogue()) { toast(t("catalogueUnavailable")); return; }
    if (orderSnapshot !== snapshot || snapshot.destination !== destination || !$("#order-dialog").open || $("#order-actions").hidden) return;
    if(snapshot.lines.some(line=>{const p=products.find(p=>p.id===line.id);return !canBuy(p)||line.quantity>(p.stock??99)||line.cents!==p.cents;})){toast(t("catalogueChanged"));$("#order-dialog").close();renderCart();openDialog("cart-dialog");return;}
    if(!snapshot.serverOrder){
      try{
        const signature=JSON.stringify({userId:window.PersiaAuth?.user?.id||null,city:destination.city,postcode:destination.postcode,lines:snapshot.lines.map(({id,quantity,cents})=>({id,quantity,cents})).sort((a,b)=>a.id.localeCompare(b.id))});
        const pending=store.read('persia.v1.checkoutPending',null);
        if(pending?.signature===signature&&typeof pending.key==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(pending.key))snapshot.key=pending.key;
        store.write('persia.v1.checkoutPending',{signature,key:snapshot.key});
        const response=await fetch('/api/orders',{method:'POST',credentials:'same-origin',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',...(window.PersiaAuth?.user?{'X-Persia-User':window.PersiaAuth.user.id}:{})},body:JSON.stringify({key:snapshot.key,city:destination.city,postcode:destination.postcode,lines:snapshot.lines.map(({id,quantity,cents})=>({id,quantity,cents}))})});
        const data=await response.json().catch(()=>({}));
        if(!response.ok){if(data.error==='catalogueChanged'){toast(t('catalogueChanged'));$('#order-dialog').close();renderCart();openDialog('cart-dialog');}else toast(t('catalogueUnavailable'));return;}
        if(!data.order?.id||data.order.totalCents!==snapshot.lines.reduce((sum,line)=>sum+line.quantity*line.cents,0)){toast(t('catalogueUnavailable'));return;}
        snapshot.serverOrder=data.order;
        if(Array.isArray(data.order.lines))snapshot.lines=data.order.lines;
      }catch{toast(t('catalogueUnavailable'));return;}
    }
    orderSnapshot = snapshot;
    orderSnapshot.id = snapshot.serverOrder.id;
    orderSnapshot.date = snapshot.serverOrder.createdAt;
    orderHistory.unshift(orderSnapshot);
    orderHistory.splice(5);
    store.write("persia.v1.orders", orderHistory);
    store.write('persia.v1.checkoutPending',null);
    for (const line of orderSnapshot.lines) {
      const remaining = (basket[line.id] || 0) - line.quantity;
      if (remaining > 0) basket[line.id] = remaining;
      else delete basket[line.id];
    }
    save();
    renderCart();
    renderOrder();
    setOrderStep("receipt");
    $("#download-order").focus();
  } finally {
    confirmingOrder = false;
    $("#confirm-demo").disabled = false;
  }
});
$("#download-order").addEventListener("click", () => {
  if (!orderSnapshot?.id) return;
  const text = [
    document.title,
    t("orderTitle"),
    t("orderNotice"),
    orderSnapshot.id,
    orderSnapshot.date,
    t("destination") + ": " + orderSnapshot.destination.city + " · " + orderSnapshot.destination.postcode + " · " + t("italy"),
    "",
    ...orderSnapshot.lines.map((line) => {
      const p = products.find((p) => p.id === line.id);
      return (
        orderLineName(line) +
        " × " +
        line.quantity +
        " — " +
        money((line.cents ?? p.cents) * line.quantity) +
        "\n" +
        (p?source(p):t("managedNote"))
      );
    }),
    "",
    t("subtotal") + ": " + money(total(orderSnapshot.lines)),
    t("shippingPending"),
    t("samplePrices"),
  ].join("\n");
  const blob = new Blob(["\ufeff" + text], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = orderSnapshot.id + ".txt";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$$("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  }),
);
window.addEventListener("storage", (event) => {
  if (event.key === customerStorageKey("persia.v1.basket") || event.key === customerStorageKey("persia.v1.favorites")) {
    reconcileBasket(store.read("persia.v1.basket", {}));
    const f = store.read("persia.v1.favorites", []);
    favorites.clear();
    if (Array.isArray(f))
      for (const id of f)
        if (products.some((p) => p.id === id)) favorites.add(id);
    renderProducts();
    renderCart();
  }
});
applyLanguage();

let catalogueRefresh = null;
function refreshCatalogue() {
  if (catalogueRefresh) return catalogueRefresh;
  if (!window.PersiaAuth.available) return Promise.resolve(false);
  catalogueRefresh = (async () => {
    try {
      const data = await window.PersiaAuth.request('/api/catalogue');
      if (data.revision === window.PersiaCatalogueRevision && JSON.stringify(data.products) === JSON.stringify(products)) return true;
      window.PersiaCatalogueRevision = data.revision;
      products.splice(0, products.length, ...data.products);
      reconcileBasket(basket);
      for (const id of favorites) if (!products.some(p => p.id === id)) favorites.delete(id);
      save(); renderProducts(); renderCart(); renderDetail(); renderOrder(); renderSavedOrders();
      document.dispatchEvent(new CustomEvent('persia:catalogue'));
      return true;
    } catch { return false; }
  })().finally(() => { catalogueRefresh = null; });
  return catalogueRefresh;
}
window.addEventListener('storage',event=>{if(event.key==='persia.catalogue.change')refreshCatalogue();});window.addEventListener('focus',refreshCatalogue);
// Refresh across Italian calendar boundaries, even with no administrator edit.
setInterval(()=>{if(!document.hidden)refreshCatalogue();},15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshCatalogue();});

const linkedProduct=new URLSearchParams(location.search).get('product');
if(linkedProduct&&products.some(p=>p.id===linkedProduct)){filter='all';expandedCatalogue=true;$('#search').value=linkedProduct;$('#header-search').value=linkedProduct;renderProducts();currentProduct=linkedProduct;renderDetail();openDialog('product-dialog');}
