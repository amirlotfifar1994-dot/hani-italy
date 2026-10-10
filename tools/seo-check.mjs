import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {createSeo} from '../server/seo.mjs';
import {posts,blogDate} from '../server/blog-content.mjs';
import {localShoppingPath,italyShoppingContent,localSeoUpdated} from '../server/local-seo.mjs';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const seed=JSON.parse(await fs.readFile(new URL('../dist/catalogue.json',import.meta.url),'utf8'));let products=structuredClone(seed);
const catalogue={publicProducts:()=>products.filter(p=>p.status==='published')};
const base='https://persia-market.example',seo=await createSeo({root,catalogue,origin:'http://127.0.0.1:4194',siteUrl:base,indexing:true});
const server=http.createServer((req,res)=>{if(!seo.handle(req,res,new URL(req.url,'http://localhost')))res.writeHead(404).end();});await new Promise(r=>server.listen(0,'127.0.0.1',r));const address='http://127.0.0.1:'+server.address().port;
try{
 for(const lang of ['it','fa','en']){const page=await (await fetch(address+'/?lang='+lang)).text();assert.ok(page.includes('<html lang="'+lang+'"'));assert.ok(page.includes('rel="canonical" href="'+base+'/?lang='+lang+'"'));assert.ok(page.includes('href="/products/'+seed[0].id+'?lang='+lang+'"'));assert.ok(!page.includes('window.PersiaSeo=undefined'));assert.match(page,/<meta name="robots" content="index,follow/);}
 const it=await (await fetch(address+'/?lang=it')).text();assert.ok(it.includes("Lontani,<br><em>ma sempre<br>insieme.</em>"));assert.ok(!it.includes('دور از خانه،<br /><em>هنوز کنار هم'));
 products[0]={...products[0],cents:600,compareAtCents:800,seoTitle:['','', 'Titolo speciale <b>'],seoDescription:['','','Descrizione " speciale'],description:['','','Visible description </script><script>alert(1)</script>'],updatedAt:'2026-10-03T12:00:00.000Z'};
 const url='/products/'+products[0].id+'?lang=it';const response=await fetch(address+url),html=await response.text();assert.equal(response.status,200);assert.ok(html.includes('<title>Titolo speciale &lt;b&gt;</title>'));assert.ok(html.includes('og:type" content="product"'));assert.ok(html.includes('hreflang="fa"'));assert.ok(html.includes('−25%'));assert.ok(!html.includes('</script><script>alert(1)</script>'));
 const schema=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));const product=schema.find(s=>s['@type']==='Product');assert.equal(product.name,products[0].name[2]);assert.equal(product.url,base+url);assert.ok(!product.offers&&!product.aggregateRating,'Demo products must not advertise commercial offers or invented reviews');
 for(const lang of ['it','fa','en']){
  const index=await (await fetch(address+'/blog?lang='+lang)).text();
  assert.ok(index.includes('<html lang="'+lang+'"'));assert.ok(index.includes('id="editorial"'));assert.equal([...index.matchAll(/<h3\b/g)].length,posts.length,'Story cards follow the listing h2');assert.ok(index.includes('<h2 id="journal-list-title">'));assert.ok(index.includes('id="journal-result-count" role="status"'));assert.ok(index.includes('id="journal-reset"'));assert.equal([...index.matchAll(/<h1\b/g)].length,1);
  assert.ok(index.includes('rel="canonical" href="'+base+'/blog?lang='+lang+'"'));
  const filteredIndex=await (await fetch(address+'/blog?lang='+lang+'&topic=food&q=Hani')).text();assert.ok(filteredIndex.includes('rel="canonical" href="'+base+'/blog?lang='+lang+'"'));assert.ok(filteredIndex.includes('id="journal-results"'));const home=await (await fetch(address+'/?lang='+lang)).text();assert.ok(home.includes('href="/blog?lang='+lang+'"'));
  for(const post of posts){
   assert.ok(index.includes('href="/blog/'+post.slug+'?lang='+lang+'"'));
   if(!post.productGuide)assert.ok(home.includes('href="/blog/'+post.slug+'?lang='+lang+'"'));else assert.ok(home.includes(post.slug));
   const articleResponse=await fetch(address+'/blog/'+post.slug+'?lang='+lang),article=await articleResponse.text();assert.equal(articleResponse.status,200);
   assert.ok(article.includes('data-comments-kind="article"'));assert.ok(article.includes('data-comments-target="'+post.slug+'"'));assert.ok(article.includes('/comments.js?v=1'));
   assert.equal([...article.matchAll(/<h1\b/g)].length,1);assert.ok(article.includes(escapeHtml(post[lang].title)));assert.ok(article.includes('<title>'+escapeHtml(post[lang].seoTitle+' | Persia Market')+'</title>'));assert.ok(article.includes('<meta name="description" content="'+escapeHtml(post[lang].description)+'">'));assert.ok(article.includes('id="article-summary"'));assert.ok(article.includes(escapeHtml(post[lang].summary.text)));for(const point of post[lang].summary.points)assert.ok(article.includes(escapeHtml(point)));
   assert.ok(article.includes('og:type" content="article"'));assert.ok(article.includes('rel="canonical" href="'+base+'/blog/'+post.slug+'?lang='+lang+'"'));
   for(const l of ['it','fa','en'])assert.ok(article.includes('hreflang="'+l+'" href="'+base+'/blog/'+post.slug+'?lang='+l+'"'));
   const ids=post[lang].sections.map(s=>s.id);assert.equal(new Set(ids).size,ids.length);
   for(const section of post[lang].sections){for(const link of section.related||[]){assert.ok(posts.some(p=>p.slug===link.slug));assert.ok(article.includes('href="/blog/'+link.slug+'?lang='+lang+'"'));assert.ok(article.includes(escapeHtml(link.label)));}assert.ok(article.includes('id="'+section.id+'"'));assert.ok(article.includes('href="#'+section.id+'"'));for(const paragraph of section.paragraphs)assert.ok(article.includes(escapeHtml(paragraph)));for(const photo of section.gallery||[]){await fs.access(root+photo.src.slice(1));assert.ok(photo.width>0&&photo.height>0);assert.ok(article.includes('alt="'+escapeHtml(photo.alt)+'"'));assert.ok(article.includes('href="'+escapeHtml(photo.source||photo.src)+'"'));if(photo.kind==='editorial'||photo.kind==='catalogue'){assert.ok(article.includes(escapeHtml(photo.credit[lang])));}else{assert.ok(article.includes('href="'+escapeHtml(photo.licenseUrl)+'"'));assert.ok(article.includes(escapeHtml(photo.author)));}}for(const item of section.profile||[]){assert.ok(article.includes('<dt>'+escapeHtml(item.label)+'</dt>'));assert.ok(article.includes('<dd>'+escapeHtml(item.value)+'</dd>'));}for(const part of section.subsections||[]){assert.ok(article.includes('<h3>'+escapeHtml(part.title)+'</h3>'));for(const paragraph of part.paragraphs)assert.ok(article.includes(escapeHtml(paragraph)));}if(section.walk){assert.ok(article.includes('<h3>'+escapeHtml(section.walk.title)+'</h3>'));for(const step of section.walk.steps)assert.ok(article.includes('<li>'+escapeHtml(step)+'</li>'));assert.ok(article.includes(escapeHtml(section.walk.note)));}for(const id of section.sources||[])assert.ok(post.sources.some(s=>s.id===id));if(section.table){assert.ok(article.includes(section.foodCards?escapeHtml(section.table.caption):'<caption>'+section.table.caption+'</caption>'));assert.ok(section.table.rows.every(row=>row.length===section.table.headers.length));for(const row of section.table.rows)for(const cell of row)assert.ok(article.includes(escapeHtml(cell)));}if(section.list)for(const point of section.list)assert.ok(article.includes(escapeHtml(point)));if(section.qa)for(const pair of section.qa){assert.ok(article.includes('<summary>'+escapeHtml(pair.q)+'</summary>'));assert.ok(article.includes(escapeHtml(pair.a)));}}
   const articleSchemas=[...article.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
   if(post.cityGuide){
    const profile=post[lang].sections.find(s=>s.id==='city-profile'),food=post[lang].sections.find(s=>s.id==='food-culture'),universities=post[lang].sections.find(s=>s.id==='universities'),sights=post[lang].sections.find(s=>s.id==='sights');
    assert.ok(profile.paragraphs.length>=2&&profile.paragraphs[0].length>150,'City identity and planning are explained');
    assert.equal(food.table.rows.length,4,'Every city introduces four local foods');
    assert.equal(food.gallery.length,4,'Each local food has its own licensed photograph');
    assert.equal([...article.matchAll(/class="journal-food-card"/g)].length,4);
    const iranPlaces=post[lang].sections.find(s=>s.id==='iranian-places');assert.ok(iranPlaces.places.length);
    for(const place of iranPlaces.places){const map=new URL(place.mapUrl);assert.equal(map.hostname,'www.google.com');assert.equal(map.pathname,'/maps/search/');assert.equal(map.searchParams.get('api'),'1');assert.equal(map.searchParams.get('query'),place.name+' '+place.address+' Italia');assert.ok(article.includes(escapeHtml(place.address)));assert.ok(article.includes(escapeHtml(place.description)));assert.ok(article.includes('href="'+escapeHtml(place.mapUrl)+'"'));assert.ok(post.sources.some(s=>s.id===place.sourceId&&s.url===place.url));}
    assert.ok(post[lang].summary.links.includes('iranian-places'));
    assert.ok(food.table.rows.every(row=>row[0]&&row[1].length>50),'Foods include names and ingredient descriptions');
    assert.ok(universities.subsections.length>0&&universities.list.length===3,'Universities include programme and campus planning');
    assert.equal(universities.sources.length,universities.subsections.length,'Every university introduction links to its official source');
    assert.equal(sights.subsections.length,4);assert.equal(sights.gallery.length,4,'Every sight has its own photograph');
    assert.equal([...article.matchAll(/class="journal-landmark"/g)].length,4,'Four photographed landmark cards are rendered');
    for(const id of ['food-culture','universities','sights'])assert.ok(post[lang].summary.links.includes(id),'New sections are accessible from article shortcuts');
    const comparison=post[lang].sections.find(s=>s.id==='iran-connections');
    assert.ok(comparison,'Every city guide includes Iranian city comparisons in every language');
    assert.ok(comparison.subsections.length>=2&&comparison.subsections.every(s=>s.paragraphs.some(p=>p.length>100)),'Comparisons explain the places and their differences');
    assert.ok(comparison.sources.length>0&&post[lang].summary.links.includes(comparison.id),'Comparisons have references and a summary shortcut');
    const cityPosting=articleSchemas.flatMap(s=>s['@graph']||[s]).find(s=>s['@type']==='BlogPosting');
    assert.equal(cityPosting.about['@type'],'City');
    assert.equal(cityPosting.about.name,post.cityName[lang]);
    assert.equal(cityPosting.about.containedInPlace['@type'],'Country');
    assert.ok(article.includes(escapeHtml(post.cityRegion[lang])));
    const numbering=[...article.matchAll(/class="journal-(?:section-index|chapter-number)" aria-hidden="true">(\d+)/g)].map(m=>Number(m[1]));
    assert.deepEqual(numbering,post[lang].sections.map((s,i)=>i+2),'City chapters follow the same sequence as the contents menu');
   }
   const posting=articleSchemas.flatMap(s=>s['@graph']||[s]).find(s=>s['@type']==='BlogPosting');assert.equal(posting.inLanguage,lang);assert.equal(posting.datePublished,post.publishedAt||blogDate);assert.equal(posting.dateModified,post.modifiedAt||blogDate);assert.equal(posting.author['@type'],'Organization');assert.ok(Number.isInteger(posting.wordCount)&&posting.wordCount>0,'Article has a computed reading word count');assert.equal(posting.abstract,post[lang].summary.text);assert.equal(posting.isPartOf.url,base+'/blog?lang='+lang);assert.equal(posting.author.url,base+'/blog?lang='+lang+'#editorial');assert.deepEqual(posting.citation,post.sources.map(s=>s.url));assert.deepEqual(posting.image,[...new Set([post.image,...post[lang].sections.flatMap(s=>(s.gallery||[]).map(photo=>photo.src))])].map(src=>base+src),'Structured data lists the article’s actual cover and inline images');assert.ok(!posting.aggregateRating&&!posting.offers);
   if(post.presentation==='visual-story'&&!post.productGuide){assert.ok(article.includes('journal-visual-story'));assert.equal([...article.matchAll(/class="journal-story-hero"/g)].length,1);assert.equal([...article.matchAll(/class="journal-city-chapter"/g)].length,post[lang].sections.filter(s=>s.chapter).length);assert.equal([...article.matchAll(/class="journal-photo-pair"/g)].length,post[lang].sections.reduce((count,s)=>count+((s.landmarks||s.foodCards)?s.gallery.length:s.gallery?.length?1:0),0));assert.ok(post[lang].sections.some(s=>s.chapter));await fs.access(root+post.image.slice(1));assert.ok(post.hero.width>0&&post.hero.height>0);if(post.hero.kind==='editorial')assert.ok(article.includes(escapeHtml(post.hero.credit[lang])));assert.ok(!article.includes('class="journal-cover"'));for(const id of post[lang].summary.links)assert.ok(post[lang].sections.some(s=>s.id===id));}if(post[lang].cta){assert.ok(article.includes('href="/blog/'+post[lang].cta.slug+'?lang='+lang+'"'));assert.ok(article.includes(escapeHtml(post[lang].cta.body)));}if(post.slug==='hani-products-italy'){assert.ok(!article.includes('hanifoods.nl'),'Brand analysis uses Iranian data rather than Netherlands references');assert.ok(article.includes('https://hogoncs.ir/hani.html'));assert.ok(article.includes('id="italy-selection"'));}
   for(const source of post.sources){assert.equal(new URL(source.url).protocol,'https:');assert.ok(article.includes('href="'+source.url+'"'));}
  }
 }

 // Each article has a distinct cover; guide files must also differ in content, not just filenames.
 assert.equal(new Set(posts.map(p=>p.image)).size,posts.length);
 assert.equal(new Set(posts.map(p=>p.cardImage||p.image)).size,posts.length);
 const cityPosts=posts.filter(p=>p.cityGuide),cityPhotos=[...JSON.parse(await fs.readFile(new URL('../research/city-photo-credits.json',import.meta.url),'utf8')),...JSON.parse(await fs.readFile(new URL('../research/city-food-photo-credits.json',import.meta.url),'utf8')),...JSON.parse(await fs.readFile(new URL('../research/city-food-generated-credits.json',import.meta.url),'utf8'))];
 const cityPhotoPaths=cityPosts.flatMap(p=>[p.image,...p.fa.sections.flatMap(s=>(s.gallery||[]).map(photo=>photo.src))]);
 assert.equal(new Set(cityPhotoPaths).size,cityPhotoPaths.length,'Each city cover and inline photograph is distinct across the collection');
 const cityHashes=[];
 for(const src of cityPhotoPaths){
  const photo=cityPhotos.find(item=>item.src===src);assert.ok(photo,'A real city photograph has a provenance record');
  if(photo.kind==='editorial'){assert.ok(photo.provenance.includes('built-in imagegen'));assert.ok(photo.source===photo.src);}else{assert.equal(new URL(photo.source).hostname,'commons.wikimedia.org');assert.ok(photo.author&&photo.license&&photo.licenseUrl);}
  const bytes=await fs.readFile(root+src.slice(1));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.equal(bytes.length,photo.bytes);assert.ok(bytes.length<400000,'City photographs remain under 400 KB');
  cityHashes.push(createHash('sha256').update(bytes).digest('hex'));await fs.access(root+photo.cardImage.slice(1));
 }
 assert.equal(new Set(cityHashes).size,cityHashes.length,'Different filenames must not hide duplicate city photographs');
 const imageHashes=[];
 for(const p of posts.filter(p=>p.productGuide)){
  const cover=await fs.readFile(root+p.image.slice(1));
  const card=await fs.readFile(root+p.cardImage.slice(1));
  assert.ok(card.length<cover.length);
  imageHashes.push(createHash('sha256').update(cover).digest('hex'));
  assert.equal(p.hero.kind,'editorial');
 }
 assert.equal(new Set(imageHashes).size,imageHashes.length);
 // A guide per current product, bidirectional links and visible structured-data references.
 const originalGuidedProducts=seed.filter(p=>!p.assortmentSource);
 assert.equal(posts.filter(p=>p.productGuide).length,originalGuidedProducts.length);
 for(const p of originalGuidedProducts){
  const guide=posts.find(post=>post.productGuide&&post.productIds.includes(p.id));assert.ok(guide);
  for(const lang of ['fa','it','en']){
   const detail=await (await fetch(address+'/products/'+p.id+'?lang='+lang)).text();
   assert.ok(detail.includes('href="/blog/'+guide.slug+'?lang='+lang+'"'));
   const guideHtml=await (await fetch(address+'/blog/'+guide.slug+'?lang='+lang)).text();
   assert.ok(guideHtml.includes('href="/products/'+p.id+'?lang='+lang+'"'));
   const hero=guideHtml.match(/<header class="journal-guide-hero">[\s\S]*?<\/header>/)[0];assert.ok(!hero.includes('<figcaption>'));assert.ok(guideHtml.indexOf('data-reading-nav')<guideHtml.indexOf('id="article-summary"'));assert.ok(guideHtml.includes('og:image" content="'+base+guide.image+'"'));assert.ok(guideHtml.includes('journal-guide-hero'));assert.ok(guideHtml.includes('id="method"'));assert.ok(guideHtml.includes('id="italy"'));
   assert.ok(!guideHtml.includes('"@type":"Recipe"')&&!guideHtml.includes('"aggregateRating"'));
   assert.equal((await fetch(address+'/blog/'+guide.slug+'?lang='+lang,{method:'HEAD'})).status,200);
  }
 }
 const savedGuideProduct=products[1];try{
  products[1]={...savedGuideProduct,status:'archived'};
  const guide=posts.find(p=>p.productIds?.includes(savedGuideProduct.id));
  const body=await (await fetch(address+'/blog/'+guide.slug+'?lang=en')).text();
  assert.ok(!body.includes('href="/products/'+savedGuideProduct.id+'?lang=en"'));
  const schema=JSON.parse([...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)][0][1]);
  assert.ok(!schema['@graph'][0].about.some(item=>item.url===base+'/products/'+savedGuideProduct.id+'?lang=en'));
 }finally{products[1]=savedGuideProduct;}
 // Whole-site coverage: every product and public section in every supported language.
 for(const lang of ['it','fa','en']){
  for(const path of ['/shop','/brands/hani','/categories/ready-meals','/categories/rice','/categories/spices','/categories/nuts','/categories/tea','/offers','/about','/help',localShoppingPath]){
   const response=await fetch(address+path+'?lang='+lang),body=await response.text();
   assert.equal(response.status,200);assert.equal((await fetch(address+path+'?lang='+lang,{method:'HEAD'})).status,200);
   assert.equal([...body.matchAll(/<h1\b/g)].length,1);assert.ok(body.includes('rel="canonical" href="'+base+path+'?lang='+lang+'"'));
   for(const l of ['it','fa','en'])assert.ok(body.includes('hreflang="'+l+'" href="'+base+path+'?lang='+l+'"'));
   assert.ok(body.includes('twitter:image:alt'));assert.equal([...body.matchAll(/og:locale:alternate/g)].length,2);
   const schemas=[...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
   assert.ok(schemas.some(s=>s['@graph']?.some(p=>p['@type']==='BreadcrumbList')));
   const noindex=['/categories/rice','/categories/spices','/categories/nuts','/categories/tea','/offers'].includes(path);
   assert.equal(body.includes('content="noindex,follow"'),noindex);assert.equal(response.headers.has('x-robots-tag'),noindex);
  }
  for(const p of seed.filter(p=>p.status==='published')){
   const body=await (await fetch(address+'/products/'+p.id+'?lang='+lang)).text();
   assert.ok(body.includes('data-comments-kind="product"'));assert.ok(body.includes('data-comments-target="'+p.id+'"'));assert.ok(body.includes('/comments.js?v=1'));
   assert.equal([...body.matchAll(/<h1\b/g)].length,1);assert.ok(body.includes('name="twitter:image:alt"'));
   assert.ok(body.includes('rel="canonical" href="'+base+'/products/'+p.id+'?lang='+lang+'"'));
   assert.equal(body.includes('content="noindex,follow"'),!!p.example);
   assert.ok(!body.includes('"@type":"Offer"')&&!body.includes('"aggregateRating"'));
  }
  const privateResponse=await fetch(address+'/account?lang='+lang),privateBody=await privateResponse.text();
  assert.equal(privateResponse.status,200);assert.match(privateResponse.headers.get('x-robots-tag'),/noindex.*nofollow/);
  assert.ok(privateBody.includes('content="noindex,nofollow"'));assert.ok(privateBody.includes('rel="canonical" href="'+base+'/account?lang='+lang+'"'));
  assert.ok(!privateBody.includes('<script type="application/ld+json">'));
 }
 const adminResponse=await fetch(address+'/admin.html?view=products'),adminBody=await adminResponse.text();assert.equal(adminResponse.status,200);assert.match(adminResponse.headers.get('x-robots-tag'),/noindex.*nofollow/);assert.ok(adminBody.includes('noindex,nofollow'));
 for(const path of [localShoppingPath+'/','/index.html','/shop/','/blog/','/products/'+seed[0].id+'/']){
  const response=await fetch(address+path+'?lang=fa',{redirect:'manual'});assert.equal(response.status,301);assert.ok(response.headers.get('location').endsWith('?lang=fa'));
 }
 for(const path of ['/categories/missing','/brands/missing','/missing-page']){const response=await fetch(address+path+'?lang=en');assert.equal(response.status,404);assert.match(response.headers.get('x-robots-tag'),/noindex/);assert.ok((await response.text()).includes('This page could not be found'));}
 const savedOffer=products[0];try{
  products[0]={...savedOffer,dailyOfferActive:true,stock:2,dailyOffer:{endDate:'2026-10-05'}};
  const active=await fetch(address+'/offers?lang=it'),body=await active.text();assert.ok(!active.headers.has('x-robots-tag'));assert.ok(body.includes('/products/'+savedOffer.id+'?lang=it'));assert.ok(body.includes('datetime="2026-10-05"'));assert.ok((await (await fetch(address+'/sitemap.xml')).text()).includes('/offers?lang=it'));
  products[0]={...products[0],stock:0};const empty=await fetch(address+'/offers?lang=it');assert.match(empty.headers.get('x-robots-tag'),/noindex/);assert.ok(!(await (await fetch(address+'/sitemap.xml')).text()).includes('/offers?lang=it'));
 }finally{products[0]=savedOffer;}
 const safeSummary=posts[0].fa.summary.text,safeLinks=posts[0].fa.sections[0].related;try{posts[0].fa.summary.text='Test & </script><img src=x onerror=alert(1)>';posts[0].fa.sections[0].related=[{slug:'../admin.html',label:'Unsafe link'}];const escaped=await (await fetch(address+'/blog/'+posts[0].slug+'?lang=fa')).text();assert.ok(escaped.includes('Test &amp; &lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;'));assert.ok(!escaped.includes('</script><img src=x'));assert.ok(!escaped.includes('/blog/../admin.html'));const parsed=[...escaped.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));assert.equal(parsed[0]['@graph'][0].abstract,posts[0].fa.summary.text);}finally{posts[0].fa.summary.text=safeSummary;posts[0].fa.sections[0].related=safeLinks;}
 for(const post of posts)await fs.access(root+post.image.slice(1));
 const missingBlog=await fetch(address+'/blog/not-a-story');assert.equal(missingBlog.status,404);assert.ok(missingBlog.headers.get('x-robots-tag').includes('noindex'));
 assert.equal((await fetch(address+'/blog/'+posts[0].slug,{method:'HEAD'})).status,200);
 assert.ok((await (await fetch(address+'/blog?lang=unknown')).text()).includes('<html lang="it"'));

 // Online-only regional targeting: national hub, shared business identity and honest coverage.
 for(const lang of ['it','fa','en']){
  const response=await fetch(address+localShoppingPath+'?lang='+lang),html=await response.text();
  const data=JSON.parse([...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)][0][1]);
  const business=data['@graph'].find(item=>item['@type']==='OnlineStore'),page=data['@graph'].find(item=>item['@type']==='WebPage');
  assert.equal(business['@id'],base+'/#organization');assert.equal(business.areaServed.identifier,'IT');assert.equal(business.areaServed['@type'],'Country');
  for(const key of ['address','geo','telephone','email','openingHoursSpecification','department','aggregateRating','hasShippingService','hasMerchantReturnPolicy'])assert.ok(!(key in business),'Unconfirmed business details must not be invented: '+key);
  assert.equal(page.mainEntity['@id'],business['@id']);assert.equal(page.about.identifier,'IT');assert.equal(page.dateModified,localSeoUpdated);
  assert.equal(page.hasPart.numberOfItems,10);assert.equal(page.hasPart.itemListElement.length,10);
  assert.ok(html.includes(escapeHtml(italyShoppingContent[lang].status)));assert.ok(!html.includes('"@type":"FAQPage"'));
  assert.ok(html.includes('id="delivery"'));assert.ok(html.includes('id="cities"'));assert.ok(html.includes('id="questions"'));
  for(const city of posts.filter(p=>p.cityGuide)){
   const linked='/blog/'+city.slug+'?lang='+lang+'#persian-groceries';assert.ok(html.includes('href="'+linked+'"'));
   const cityHtml=await (await fetch(address+'/blog/'+city.slug+'?lang='+lang)).text();
   const shopping=city[lang].sections.find(section=>section.id==='persian-groceries');assert.ok(shopping.shoppingLink);assert.ok(city[lang].summary.links.includes(shopping.id));
   assert.ok(cityHtml.includes(escapeHtml(shopping.title)));assert.ok(shopping.paragraphs.every(p=>cityHtml.includes(escapeHtml(p))));
   assert.ok(cityHtml.includes('href="'+localShoppingPath+'?lang='+lang+'"'));
  }
  for(const path of ['/','/shop','/brands/hani','/about','/help','/blog','/products/'+seed[0].id]){
   const linkedHtml=await (await fetch(address+path+'?lang='+lang)).text();assert.ok(linkedHtml.includes('href="'+localShoppingPath+'?lang='+lang+'"'),'Discoverable regional guide from '+path);
  }
  const home=await (await fetch(address+'/?lang='+lang)).text();const homeGraph=JSON.parse([...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)][0][1])['@graph'];assert.equal(homeGraph.find(item=>item['@id']===business['@id'])['@type'],'OnlineStore');assert.ok(home.includes('id="local-shopping-title"'));assert.ok(home.includes('data-t="localShopping"'));
 }
 assert.equal((await fetch(address+localShoppingPath+'/milan?lang=en')).status,404,'No manufactured city branch landing pages');

 const sitemap=await (await fetch(address+'/sitemap.xml')).text();assert.equal([...sitemap.matchAll(/<loc>/g)].length,24+posts.length*3+seed.filter(p=>p.status==='published'&&!p.example).length*3);assert.ok(sitemap.includes('2026-10-03T12:00:00.000Z'));assert.ok(!sitemap.includes('/products/'+seed.find(p=>p.example).id+'?'));for(const post of posts)assert.ok(sitemap.includes('/blog/'+post.slug+'?lang=fa'));for(const lang of ['it','fa','en'])assert.ok(sitemap.includes(localShoppingPath+'?lang='+lang));assert.ok((await (await fetch(address+'/robots.txt')).text()).includes('Sitemap: '+base+'/sitemap.xml'));
 products[0].status='archived';const archivedArticle=await (await fetch(address+'/blog/hani-products-italy?lang=it')).text();assert.ok(!archivedArticle.includes('href="/products/'+products[0].id+'?lang=it"'),'Article product links follow catalogue visibility');assert.equal((await fetch(address+url)).status,404);assert.ok(!(await (await fetch(address+'/sitemap.xml')).text()).includes('/products/'+products[0].id+'?'));
 const preview=await createSeo({root,catalogue,origin:address,indexing:true});assert.match(preview.home('fa'),/noindex,follow/);assert.match(preview.productPage(products[1],'it'),/noindex,follow/);let previewBody='';preview.handle({method:'GET'},{writeHead(){return this;},end(body){previewBody=body;}},new URL('/blog/'+posts[0].slug+'?lang=fa',address));assert.match(previewBody,/noindex,follow/);assert.equal((await fetch(address+'/products/not-a-product')).status,404);assert.equal((await fetch(address+'/products/'+products[1].id,{method:'HEAD'})).status,200);
 await assert.rejects(()=>createSeo({root,catalogue,origin:address,siteUrl:'https://persia.example/path',indexing:true}));
 console.log('PASS: multilingual server-rendered home/products/journal, '+posts.length*3+' article variants including '+posts.filter(p=>p.productGuide).length+' product guides, bidirectional product links and source links, canonical/reciprocal hreflang, BlogPosting/Breadcrumb schemas, '+[...sitemap.matchAll(/<loc>/g)].length+' sitemap entries, social previews, escaping, unavailable 404, HEAD and preview noindex.');
}finally{await new Promise(r=>server.close(r));}
