const products=[{id:1,category:"ready",name:{fa:"قرمه‌سبزی آماده هانی",en:"Hani Ghormeh Sabzi",it:"Hani Ghormeh Sabzi"},detail:{fa:"۴۸۰ گرم · آماده سرو",en:"480 g · ready to serve",it:"480 g · pronto da servire"},price:3.9,icon:"🍲",img:"ghormeh-sabzi"},{id:2,category:"nuts",name:{fa:"پسته ممتاز صدف",en:"Sadaf Pistachios",it:"Pistacchi Sadaf"},detail:{fa:"۲۵۰ گرم · شور و برشته",en:"250 g · roasted & salted",it:"250 g · tostati e salati"},price:6.9,icon:"🥜",img:"pistachios"},{id:3,category:"nuts",name:{fa:"خرمای خشک خوشپاک",en:"Khoshpak Dried Dates",it:"Datteri secchi Khoshpak"},detail:{fa:"۴۰۰ گرم · نرم و شیرین",en:"400 g · soft & sweet",it:"400 g · morbidi e dolci"},price:2.5,icon:"🌴",img:"dates"},{id:4,category:"tea",name:{fa:"چای ارل گری احمد",en:"Ahmad Tea Earl Grey",it:"Tè Earl Grey Ahmad"},detail:{fa:"۱۰۰ تی‌بگ · عطر ایرانی",en:"100 tea bags · fragrant",it:"100 bustine · profumato"},price:4.9,icon:"🍵",img:"earl-grey"},{id:5,category:"ready",name:{fa:"عدس کنسروی گیلان",en:"Gilan Canned Lentils",it:"Lenticchie Gilan"},detail:{fa:"۴۰۰ گرم · آماده مصرف",en:"400 g · ready to eat",it:"400 g · pronto da gustare"},price:1.8,icon:"🥫",img:"lentils"},{id:6,category:"spices",name:{fa:"زعفران سرگل ممتاز",en:"Premium Saffron",it:"Zafferano premium"},detail:{fa:"۴.۶ گرم · عطر خالص",en:"4.6 g · pure aroma",it:"4,6 g · aroma puro"},price:8.9,icon:"🌾",img:"saffron"},{id:7,category:"spices",name:{fa:"ادویه خورشت ایرانی",en:"Persian Stew Spice",it:"Spezie persiane"},detail:{fa:"۱۰۰ گرم · ترکیب اصیل",en:"100 g · authentic blend",it:"100 g · miscela autentica"},price:3.4,icon:"🫙",img:"spices"},{id:8,category:"tea",name:{fa:"چای سیاه احمد",en:"Ahmad Black Tea",it:"Tè nero Ahmad"},detail:{fa:"۴۰۰ گرم · مناسب دم‌کردن",en:"400 g · perfect for brewing",it:"400 g · perfetto da infondere"},price:7.5,icon:"🫖",img:"black-tea"}];const tr={en:{topline:"Delivery across Italy · Safe packing · Persian support",toplineNote:"Free delivery over €70",navHome:"Home",navShop:"Shop",navCategories:"Categories",navStory:"Our story",cart:"Cart",eyebrow:"Persian groceries, closer to home",heroTitle:"A taste of home,<br><em>in the heart of Italy.</em>",heroBody:"From pistachios and saffron to Hani ready meals — the flavors you miss, delivered in a few clicks.",shopNow:"Shop products",ourStory:"Our story",proof:"Trusted by 1,200+ families across Italy",floatingTop:"Fresh & authentic",floatingTopSmall:"Selected from Iran",floatingBottom:"Free delivery",floatingBottomSmall:"On orders over €70",serviceOne:"Fast delivery",serviceOneSmall:"Across every city in Italy",serviceTwo:"Carefully selected",serviceTwoSmall:"Authentic, fresh products",serviceThree:"Persian support",serviceThreeSmall:"From choosing to delivery",categoryKicker:"Everything for your table",categoriesTitle:"Shop by category",viewAll:"View all",catSpices:"Spices & saffron",catSpicesSmall:"Where every recipe begins",catNuts:"Nuts & dried fruit",catNutsSmall:"Pistachios, almonds and more",catReady:"Ready meals",catReadySmall:"Fast, easy, familiar",catTea:"Tea & drinks",catTeaSmall:"A better cup of tea",shopKicker:"This week’s selection",shopTitle:"Customer favourites",filterAll:"All",filterNuts:"Nuts",filterReady:"Ready meals",filterSpices:"Spices",filterTea:"Tea",storyKicker:"A shop with one simple reason",storyTitle:"So you can<br><em>miss home a little less.</em>",storyBody:"Persia Market makes finding Persian groceries in Italy simple. Every product is selected with care, and every order is packed with the feeling we would send to our own family.",discover:"Discover products",storyStatOne:"languages for a smoother experience",storyStatTwo:"hours to prepare your order",quote:"Good food is a language every home understands.",newsletterKicker:"Tasty news",newsletterTitle:"Be the first to know.",emailLabel:"Your email",join:"Subscribe",footerBody:"Persian groceries for your life in Italy.",footerShop:"Shop",footerHelp:"Help",footerContact:"Stay in touch",shipping:"Shipping & delivery",faq:"FAQs",contact:"Contact us",madeWith:"Made for homes that remember the taste",add:"Add to cart",added:"Added to your cart",empty:"Your cart is empty",subscribed:"You are on the list"},it:{topline:"Consegna in tutta Italia · Imballaggio sicuro · Supporto in persiano",toplineNote:"Spedizione gratuita sopra 70€",navHome:"Home",navShop:"Negozio",navCategories:"Categorie",navStory:"La nostra storia",cart:"Carrello",eyebrow:"Sapori persiani, più vicini a casa",heroTitle:"Il gusto di casa,<br><em>nel cuore d’Italia.</em>",heroBody:"Dai pistacchi allo zafferano, fino ai piatti pronti Hani: i sapori che ami, consegnati in pochi clic.",shopNow:"Acquista prodotti",ourStory:"La nostra storia",proof:"Scelto da oltre 1.200 famiglie in Italia",floatingTop:"Fresco e autentico",floatingTopSmall:"Selezionato in Iran",floatingBottom:"Spedizione gratuita",floatingBottomSmall:"Per ordini sopra 70€",serviceOne:"Consegna veloce",serviceOneSmall:"In ogni città italiana",serviceTwo:"Scelta con cura",serviceTwoSmall:"Prodotti autentici e freschi",serviceThree:"Supporto in persiano",serviceThreeSmall:"Dalla scelta alla consegna",categoryKicker:"Tutto per la tua tavola",categoriesTitle:"Acquista per categoria",viewAll:"Vedi tutto",catSpices:"Spezie e zafferano",catSpicesSmall:"Da qui inizia ogni ricetta",catNuts:"Frutta secca",catNutsSmall:"Pistacchi, mandorle e altro",catReady:"Piatti pronti",catReadySmall:"Veloci, facili, familiari",catTea:"Tè e bevande",catTeaSmall:"Un momento di benessere",shopKicker:"La selezione della settimana",shopTitle:"I preferiti del negozio",filterAll:"Tutto",filterNuts:"Frutta secca",filterReady:"Piatti pronti",filterSpices:"Spezie",filterTea:"Tè",storyKicker:"Un negozio con un motivo semplice",storyTitle:"Per sentire<br><em>meno la nostalgia di casa.</em>",storyBody:"Persia Market rende semplice trovare prodotti persiani in Italia. Ogni prodotto è scelto con cura e ogni ordine è preparato con lo stesso affetto che useremmo per la nostra famiglia.",discover:"Scopri i prodotti",storyStatOne:"lingue per un’esperienza più semplice",storyStatTwo:"ore per preparare il tuo ordine",quote:"Il buon cibo è una lingua che ogni casa capisce.",newsletterKicker:"Buone notizie",newsletterTitle:"Scoprilo per primo.",emailLabel:"La tua email",join:"Iscriviti",footerBody:"Prodotti persiani per la tua vita in Italia.",footerShop:"Negozio",footerHelp:"Aiuto",footerContact:"Resta in contatto",shipping:"Spedizione e consegna",faq:"Domande frequenti",contact:"Contatti",madeWith:"Creato per le case che ricordano il gusto",add:"Aggiungi al carrello",added:"Aggiunto al carrello",empty:"Il carrello è vuoto",subscribed:"Iscrizione completata"}};const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],fa={};$$("[data-i18n]").forEach(e=>fa[e.dataset.i18n]=e.innerHTML);tr.fa=fa;let lang=localStorage.getItem("persia-lang")||"fa",filter="all",cart=Number(localStorage.getItem("persia-cart")||0),t=k=>tr[lang][k]||tr.en[k]||k;function update(){$(".cart-count").textContent=cart;$(".cart-button").setAttribute("aria-label",t("cart")+" "+cart)}function toast(m){const e=$(".toast");e.textContent=m;e.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>e.classList.remove("show"),2200)}function render(){const list=filter==="all"?products:products.filter(p=>p.category===filter);$("#product-grid").innerHTML=list.map((p,i)=>"<article class=\"product-card\" style=\"animation-delay:"+i*35+"ms\"><div class=\"product-image\"><img src=\"assets/products/"+p.img+".jpg\" alt=\""+p.name[lang]+"\" loading=\"lazy\" decoding=\"async\"></div><div class=\"product-info\"><h3>"+p.name[lang]+"</h3><p>"+p.detail[lang]+"</p><div class=\"product-bottom\"><b class=\"product-price\">€"+p.price.toFixed(2)+"</b><button class=\"add-button\" data-add=\""+p.id+"\" type=\"button\">"+t("add")+" +</button></div></div></article>").join("");$$("[data-add]").forEach(b=>b.onclick=()=>{cart++;localStorage.setItem("persia-cart",cart);update();toast(t("added"))})}function apply(){document.documentElement.lang=lang;document.documentElement.dir=lang==="fa"?"rtl":"ltr";$$("[data-i18n]").forEach(e=>e.innerHTML=t(e.dataset.i18n));$(".newsletter-form input").placeholder=t("emailLabel");render();update();$$("[data-lang]").forEach(b=>b.classList.toggle("selected",b.dataset.lang===lang))}$$("[data-lang]").forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem("persia-lang",lang);apply()});$$(".filter").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));render()});$$(".category-card").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;$$(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===filter));render();$("#shop").scrollIntoView({behavior:"smooth"})});$(".cart-button").onclick=()=>toast(cart?t("cart")+": "+cart:t("empty"));$(".newsletter-form").onsubmit=e=>{e.preventDefault();toast(t("subscribed"));e.target.reset()};$(".menu-toggle").onclick=()=>document.body.classList.toggle("menu-open");$$(".main-nav a").forEach(a=>a.onclick=()=>document.body.classList.remove("menu-open"));apply();
/* v2 interaction layer: searchable catalogue and a real basket drawer */
(() => {
  Object.assign(tr.fa, {
    add: "افزودن", added: "به سبد خرید اضافه شد", empty: "سبد خرید شما خالی است", subscribed: "عضویت شما ثبت شد",
    stampTop: "از ایران", stampBottom: "برای<br />ایتالیا",
    searchPlaceholder: "جست‌وجوی محصول", promoTitle: "این هفته، حال‌وهوای خانه را به سفره‌تان برگردانید.", promoBody: "ارسال رایگان برای سفارش‌های بالای ۷۰€ در سراسر ایتالیا", promoAction: "دیدن انتخاب‌های هفته", clearSearch: "پاک‌کردن جست‌وجو", remove: "حذف", cartKicker: "سفارش شما", cartTitle: "سبد خرید", cartTotal: "جمع سفارش", checkout: "ادامه و ثبت سفارش", checkoutNote: "پرداخت آنلاین در نسخهٔ بعدی فعال می‌شود.", resultOne: "محصول", resultMany: "محصول"
  });
  Object.assign(tr.en, {
    howKicker: "How it works", howTitle: "Three steps to your table", howOne: "Choose", howOneBody: "Browse your favourites and add them to your bag.", howTwo: "Packed with care", howTwoBody: "Your order is prepared in 24–48 hours with safe packaging.", howThree: "Delivered in Italy", howThreeBody: "Your parcel ships to anywhere in Italy and reaches your door.", brandsLabel: "Brands you know and love", faqKicker: "Your questions answered", faqTitle: "Frequently asked questions", faqQ1: "How long does delivery take?", faqA1: "Orders are prepared in 24–48 hours and then shipped across Italy.", faqQ2: "Do you offer free delivery?", faqA2: "Yes, orders over €70 ship free anywhere in Italy.", faqQ3: "Which languages do you support?", faqA3: "We answer in Persian, Italian and English.", faqQ4: "How do I pay?", faqA4: "Online payment will be available soon.",
    stampTop: "From Iran", stampBottom: "to<br />Italy",
    searchPlaceholder: "Search products", promoTitle: "Bring the feeling of home back to your table.", promoBody: "Free delivery across Italy on orders over €70", promoAction: "See this week’s picks", clearSearch: "Clear search", remove: "Remove", cartKicker: "Your order", cartTitle: "Shopping bag", cartTotal: "Order total", checkout: "Continue to order", checkoutNote: "Online checkout will be connected in the next version.", resultOne: "product", resultMany: "products"
  });
  Object.assign(tr.it, {
    howKicker: "Come funziona", howTitle: "Tre passi fino alla tua tavola", howOne: "Scegli", howOneBody: "Sfoglia i tuoi preferiti e aggiungili al carrello.", howTwo: "Preparato con cura", howTwoBody: "Il tuo ordine è pronto in 24–48 ore con imballaggio sicuro.", howThree: "Consegnato in Italia", howThreeBody: "Il pacco viene spedito in tutta Italia fino a casa tua.", brandsLabel: "I marchi che conosci e ami", faqKicker: "Le risposte che cerchi", faqTitle: "Domande frequenti", faqQ1: "Quanto tempo richiede la consegna?", faqA1: "Gli ordini sono preparati in 24–48 ore e poi spediti in tutta Italia.", faqQ2: "Offrite la spedizione gratuita?", faqA2: "Sì, gli ordini sopra 70€ hanno la spedizione gratuita in tutta Italia.", faqQ3: "In quali lingue offrite supporto?", faqA3: "Rispondiamo in persiano, italiano e inglese.", faqQ4: "Come si paga?", faqA4: "Il pagamento online sarà disponibile presto.",
    stampTop: "Dall’Iran", stampBottom: "per<br />l’Italia",
    searchPlaceholder: "Cerca prodotti", promoTitle: "Riporta il calore di casa sulla tua tavola.", promoBody: "Spedizione gratuita in Italia per ordini sopra 70€", promoAction: "Scopri la selezione", clearSearch: "Cancella ricerca", remove: "Rimuovi", cartKicker: "Il tuo ordine", cartTitle: "Carrello", cartTotal: "Totale ordine", checkout: "Continua con l’ordine", checkoutNote: "Il pagamento online sarà disponibile nella prossima versione.", resultOne: "prodotto", resultMany: "prodotti"
  });

  const basket = {};
  try {
    Object.assign(basket, JSON.parse(localStorage.getItem("persia-basket") || "{}"));
  } catch {}

  const basketCount = () => Object.values(basket).reduce((sum, qty) => sum + qty, 0);
  const money = value => new Intl.NumberFormat(lang === "fa" ? "fa-IR" : lang === "it" ? "it-IT" : "en-IE", { style: "currency", currency: "EUR" }).format(value);
  const saveBasket = () => {
    localStorage.setItem("persia-basket", JSON.stringify(basket));
    cart = basketCount();
    localStorage.setItem("persia-cart", String(cart));
  };

  const drawer = $("#cart-drawer");
  const backdrop = $("#drawer-backdrop");
  const openDrawer = () => {
    drawer.classList.add("open");
    backdrop.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    renderDrawer();
  };
  const closeDrawer = () => {
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  };

  function renderDrawer() {
    const items = products.filter(product => basket[product.id]);
    const count = basketCount();
    cart = count;
    update();
    if (!items.length) {
      $("#cart-items").innerHTML = '<div class="empty-cart"><span>✦</span><p>' + t("empty") + '</p><a href="#shop" data-close-cart>' + t("shopNow") + ' ↗</a></div>';
    } else {
      $("#cart-items").innerHTML = items.map(product => {
        const quantity = basket[product.id];
        return '<div class="cart-line"><div class="cart-line-art"><img src="assets/products/' + product.img + '.jpg" alt=""></div><div><h3>' + product.name[lang] + '</h3><small>' + product.detail[lang] + '</small><div class="qty-control"><button type="button" data-cart-action="dec" data-id="' + product.id + '">−</button><span>' + quantity + '</span><button type="button" data-cart-action="inc" data-id="' + product.id + '">+</button><button type="button" class="remove-line" data-cart-action="remove" data-id="' + product.id + '">' + t("remove") + '</button></div></div><strong class="cart-line-price">' + money(product.price * quantity) + '</strong></div>';
      }).join("");
    }
    const total = items.reduce((sum, product) => sum + product.price * basket[product.id], 0);
    $("#cart-total").textContent = money(total);
  }

  function addToBasket(id) {
    basket[id] = (basket[id] || 0) + 1;
    saveBasket();
    renderDrawer();
    openDrawer();
  }

  function applySearch() {
    const input = $("#product-search");
    if (!input) return;
    input.placeholder = t("searchPlaceholder");
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    $$("#product-grid .product-card").forEach(card => {
      const matches = !query || card.textContent.toLocaleLowerCase().includes(query);
      card.classList.toggle("is-hidden", !matches);
      if (matches) visible += 1;
    });
    $("#results-count").textContent = visible + " " + (visible === 1 ? t("resultOne") : t("resultMany"));
    $("#clear-search").hidden = !query;
  }

  const originalRender = render;
  render = function enhancedRender() {
    originalRender();
    $$("[data-add]").forEach(button => {
      if (button.dataset.basketBound) return;
      button.dataset.basketBound = "true";
      button.addEventListener("click", () => addToBasket(Number(button.dataset.add)));
    });
    applySearch();
    renderDrawer();
  };

  $("#product-search").addEventListener("input", applySearch);
  $("#clear-search").addEventListener("click", () => {
    $("#product-search").value = "";
    applySearch();
    $("#product-search").focus();
  });
  $(".cart-button").addEventListener("click", openDrawer);
  $("#drawer-close").addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  $("#cart-items").addEventListener("click", event => {
    const target = event.target.closest("[data-cart-action], [data-close-cart]");
    if (!target) return;
    if (target.matches("[data-close-cart]")) {
      closeDrawer();
      return;
    }
    const id = Number(target.dataset.id);
    if (target.dataset.cartAction === "inc") basket[id] = (basket[id] || 0) + 1;
    if (target.dataset.cartAction === "dec") basket[id] = Math.max(0, (basket[id] || 0) - 1);
    if (target.dataset.cartAction === "remove") basket[id] = 0;
    if (!basket[id]) delete basket[id];
    saveBasket();
    renderDrawer();
  });
  $("#checkout-button").addEventListener("click", () => toast(t("checkoutNote")));
  renderDrawer();
  apply();
})();
