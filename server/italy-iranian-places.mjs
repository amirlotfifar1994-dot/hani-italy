// Primary business/institution pages checked 2026-10-09. No inferred ownership or ratings.
const place=(name,type,address,url,fa,en,it)=>({name,type,address,url,text:[fa,en,it]});
export const iranianPlaces={
 milan:[
  place('Shalto','food','Viale Gian Galeazzo 6, 20136 Milano','https://www.shalto.it/',
   'برای تجربه طعم ایرانی در میلان: این رستوران آشپزی خود را به سبک ایرانی معرفی می‌کند؛ گوشت گریل‌شده، برنج زعفرانی و نان تازه در معرفی رسمی آن آمده‌اند.',
   'An option for Persian-style cooking in Milan. Its official introduction describes grilled meat, saffron rice and freshly baked bread.',
   'Un indirizzo per la cucina in stile persiano a Milano. La presentazione ufficiale cita carne alla griglia, riso allo zafferano e pane fresco.')
 ],
 rome:[
  place('Taberna Persiana','food','Via Ostiense 36/H, 00154 Roma','https://tabernapersiana.com/chi-siamo/',
   'رستورانی با تمرکز بر آشپزی و فرهنگ ایران در محله اوستینسه. معرفی رسمی به همکاری‌های موسیقی و رویدادهای فرهنگی هم اشاره دارد؛ برای شرکت در برنامه، تقویم همان مجموعه را بررسی کنید.',
   'An Ostiense restaurant centred on Iranian food and culture. Its own introduction also mentions music collaborations and cultural events; check the venue’s programme for a specific visit.',
   'Un ristorante a Ostiense dedicato al cibo e alla cultura iraniana. La presentazione cita anche collaborazioni musicali ed eventi culturali: consulta il programma del locale.'),
  place('Tanur','food','Via Chiana 54, 00198 Roma','https://ristorantetanur.com/',
   'گزینه‌ای دیگر برای غذای ایرانی در رم؛ وب‌سایت آن خورش‌هایی مانند قرمه‌سبزی و فسنجان و پیش‌غذاهای ایرانی را معرفی می‌کند. انتخاب نهایی را از منوی فعلی انجام دهید.',
   'Another Persian dining option in Rome. Its website presents dishes including ghormeh sabzi, fesenjan and Iranian starters; use the current menu when choosing.',
   'Un altro indirizzo persiano a Roma. Il sito presenta ghormeh sabzi, fesenjan e antipasti iraniani: scegli facendo riferimento al menu attuale.')
 ],
 turin:[
  place('Sharazad','food','Via dei Mercanti 3/A, Torino','https://turismotorino.org/visit/where-to-eat/ristorante-persiano-sharazad',
   'رستوران ایرانی نزدیک محور خیابان گاریبالدی در مرکز تورین. معرفی رسمی گردشگری شهر بر آشپزی ایرانی و وجود گزینه‌های گیاهی تأکید دارد؛ جزئیات غذاها را از منوی روز بپرسید.',
   'A Persian restaurant near the central Via Garibaldi area. The city’s tourism listing describes Iranian cooking and vegetarian options; confirm individual dishes with the current menu.',
   'Un ristorante persiano vicino a Via Garibaldi. La scheda turistica cittadina descrive cucina iraniana e opzioni vegetariane: verifica i singoli piatti nel menu attuale.')
 ],
 bologna:[
  place('Pars','food','Via Pietro Lianori 16 A, 40128 Bologna','https://ristorantepars.eatbu.com/?lang=en',
   'رستورانی خانوادگی در بولونینا که صفحه رسمی آن غذاهای ایرانی و دستورهای سنتی را معرفی می‌کند. این نشانی بیرون از هسته تاریخی است؛ مسیر رفت‌وبرگشت را با محل اقامت هماهنگ کنید.',
   'A family-run Bolognina restaurant whose official page describes Persian food and traditional recipes. It lies outside the historic core, so plan the journey from your accommodation.',
   'Un ristorante familiare in Bolognina che presenta cucina persiana e ricette tradizionali. È fuori dal nucleo storico: organizza il tragitto dal tuo alloggio.')
 ],
 florence:[
  place('Tehran','food','Via dei Cerchi 25/R, 50122 Firenze','https://ristorantetehran.com/menu/',
   'یک نشانی برای آشپزی ایرانی در مرکز تاریخی فلورانس. صفحه رسمی منو نقطه شروع مناسبی برای شناخت غذاهاست؛ برای قیمت و امکان سفارش، منوی فعلی رستوران ملاک است.',
   'A Persian dining address in Florence’s historic centre. The official menu page is a useful introduction to its dishes; consult the current restaurant menu for availability and prices.',
   'Un indirizzo persiano nel centro storico di Firenze. La pagina ufficiale del menu introduce i piatti; consulta il menu attuale per disponibilità e prezzi.'),
  place('Shisha','food','Via dei Benci 19r, Firenze','https://www.ristorantepersianofirenze.com/',
   'وب‌سایت رسمی این رستوران آشپزی ایرانی و غذاهایی مثل میرزاقاسمی، کشک بادمجان و آش رشته را معرفی می‌کند. برای آشنایی با تنوع پیش‌غذاهای ایرانی در سفر گزینه قابل بررسی است.',
   'Its official website presents Persian cooking, including mirza ghasemi, kashk bademjan and ash reshteh. An address to explore Iranian starters and soups during a Florence visit.',
   'Il sito ufficiale presenta cucina persiana, mirza ghasemi, kashk bademjan e ash reshteh. Un indirizzo per conoscere antipasti e zuppe iraniane a Firenze.')
 ],
 venice:[
  place('Casa della Cultura Iraniana','culture','Via Cecchini 9, 30174 Venezia Mestre','https://www.casadellaculturairaniana.com/contatti.php',
   'خانه فرهنگ ایران در مستره، در بخش خشکی ونیز قرار دارد؛ آن را با مرکز جزیره‌ای شهر اشتباه نگیرید. برای فعالیت فرهنگی یا مراجعه، از بخش برنامه‌ها و تماس همین مؤسسه شروع کنید.',
   'The Iranian cultural house is in mainland Mestre, rather than Venice’s island centre. Use the institution’s activities and contact pages to arrange a cultural visit.',
   'La casa della cultura iraniana si trova a Mestre, sulla terraferma, non nel centro insulare. Consulta attività e contatti dell’istituzione prima di organizzare una visita.')
 ],
 naples:[
  place('Soraya · Napoli','food','Via Michele Zannotti 11A, Napoli','https://www.ristorantesoraya.it/',
   'این رستوران خود را با آشپزی ایرانی معرفی می‌کند؛ برنج زعفرانی، ته‌دیگ و کباب در معرفی آن دیده می‌شوند. سورایای ناپل مجموعه‌ای جدا از رستوران هم‌نام در جنواست.',
   'A restaurant presenting Persian cooking, with saffron rice, tahdig and kebabs in its introduction. This Naples venue is separate from the similarly named restaurant in Genoa.',
   'Un ristorante che presenta cucina persiana, riso allo zafferano, tahdig e kebab. Il locale di Napoli è distinto dall’omonimo ristorante di Genova.')
 ],
 genoa:[
  place('Soraya · Genova Nervi','food','Via Guglielmo Oberdan, Genova Nervi','https://ristorante-soraya.eatbu.com/?lang=it',
   'رستوران ایرانی در محله نِروی، خارج از مرکز تاریخی جنوا. شماره پلاک در منابع رسمی متفاوت است: وب‌سایت رستوران ۲۲/R و صفحه معرفی آن ۲۰ را نوشته‌اند؛ پیش از مراجعه ورودی دقیق را با رستوران تأیید کنید.',
   'A Persian restaurant in Nervi, outside central Genoa. Its primary pages disagree on the street number: the restaurant website gives 22/R and its listing gives 20. Confirm the entrance with the venue.',
   'Un ristorante persiano a Nervi, fuori dal centro. Le pagine ufficiali discordano sul civico: il sito indica 22/R, la scheda 20. Conferma l’ingresso con il locale.')
 ],
 palermo:[
  place('JUN · Kebab with Love','food','Via La Lumia 94, 90139 Palermo','https://jun-kebab.com/en/',
   'نمونه‌ای از پیوند ایرانی–سیسیلی: معرفی رسمی JUN از سه برادر با ریشه سیسیلی و ایرانی و ترکیب این دو سنت غذایی می‌گوید. اینجا را یک تجربه تلفیقی ببینید، با هویت مستقل از رستوران سنتی ایرانی.',
   'A Sicilian–Persian connection: JUN describes three brothers with Sicilian and Persian roots and a blend of those food traditions. Expect a fusion identity rather than a solely traditional Persian menu.',
   'Un incontro siciliano–persiano: JUN racconta tre fratelli con radici siciliane e persiane e l’unione delle due tradizioni. È un’identità fusion, non soltanto un menu persiano tradizionale.')
 ],
 verona:[
  place('Shahmansouri Tappeti Persiani','craft','Stradone Arcidiacono Pacifico 14, 37121 Verona','https://shahmansouri.com/contatti.html',
   'نزدیک دوموی ورونا، این فروشگاه فرش ایرانی و شرقی، گلیم و صنایع‌دستی ایرانی را معرفی می‌کند. برای دیدن پیوند فرهنگی شهر با ایران، هنر و بافت هم می‌تواند بخشی از مسیر باشد.',
   'Near Verona’s Duomo, this shop presents Persian and Oriental rugs, kilims and Persian handicrafts. Textile craft offers another way to encounter Iranian culture in the city.',
   'Vicino al Duomo, il negozio presenta tappeti persiani e orientali, kilim e artigianato persiano. L’arte tessile offre un’altra connessione con la cultura iraniana.'),
  place('Akbar Ghasemi · Galleria-Laboratorio','craft','Via Interrato dell’Acqua Morta 48H, 37129 Verona','https://www.veronatappeti.it/',
   'در محدوده ایزولو، گالری و کارگاهی برای فروش، شست‌وشو و مرمت فرش است؛ فرش‌های ایرانی در معرفی رسمی آن آمده‌اند. این نشانی مربوط به هنر و خدمات فرش است و فروشگاه مواد غذایی نیست.',
   'A gallery and workshop in the Isolo area offering rug sales, cleaning and restoration, with Persian rugs listed on its website. This is a textile and craft address, rather than a food shop.',
   'Una galleria-laboratorio nella zona Isolo per vendita, lavaggio e restauro, con tappeti persiani sul sito. È un indirizzo tessile e artigianale, non un negozio alimentare.')
 ]
};
const kinds={food:['رستوران و غذا','Food and restaurants','Ristorazione'],culture:['فرهنگ و جامعه','Culture and community','Cultura e comunità'],craft:['هنر و صنایع‌دستی','Art and crafts','Arte e artigianato']};
export function iranianPlacesSection(city,lang){
 const index=['fa','en','it'].indexOf(lang),items=iranianPlaces[city];
 return {id:'iranian-places',title:['ردپای ایران در شهر؛ غذا، فرهنگ و هنر','Iranian connections in the city: food, culture and craft','Presenze iraniane in città: cibo, cultura e arte'][index],paragraphs:[['چند نشانی مرتبط با ایران که در منابع رسمی بررسی شده‌اند؛ این فهرست کامل همه کسب‌وکارها نیست. لینک نقشه با نام و نشانی هر مکان باز می‌شود. پیش از مراجعه، ساعت کار و جزئیات برنامه را از همان مجموعه بررسی کنید.','Selected Iran-related addresses checked against primary sources, rather than an exhaustive directory. Map links search for each venue by name and address. Check opening hours and programme details with the operator before visiting.','Una selezione di indirizzi collegati all’Iran verificati su fonti primarie, non un elenco completo. Le mappe cercano nome e indirizzo. Verifica orari e programmi con il gestore prima della visita.'][index]],places:items.map((p,i)=>({...p,kind:kinds[p.type][index],description:p.text[index],sourceId:'iran-place-'+i,mapUrl:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.name+' '+p.address+' Italia')})),sources:items.map((p,i)=>'iran-place-'+i).concat(city==='genoa'?['iran-place-genoa-address']:[])};
}
export function iranianPlacesSources(city){return iranianPlaces[city].map((p,i)=>({id:'iran-place-'+i,name:p.name,url:p.url})).concat(city==='genoa'?[{id:'iran-place-genoa-address',name:'Soraya · restaurant contact address',url:'https://www.ristorantesoraya.com/contact_us.html'}]:[]);}
