import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,readFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {once} from 'node:events';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require(process.argv[2]||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const directory=await mkdtemp(path.join(tmpdir(),'persia-checkout-audit-'));
const probe=http.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));const origin='http://127.0.0.1:'+port;
const child=spawn(process.execPath,['tools/preview.mjs'],{cwd:root,env:{...process.env,NODE_ENV:'development',PREVIEW_PORT:String(port),PORT:String(port),HOST:'127.0.0.1',AUTH_ORIGIN:origin,SITE_URL:'',PERSIA_DATA_DIR:directory,PERSIA_DB:path.join(directory,'accounts.sqlite'),PERSIA_UPLOAD_DIR:path.join(directory,'uploads'),ADMIN_SETUP_TOKEN:'',GOOGLE_CLIENT_ID:'',GOOGLE_CLIENT_SECRET:'',SEO_INDEXING:'false'},stdio:['ignore','pipe','pipe']});let browser;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Preview timeout')),20000);child.stdout.on('data',d=>{if(String(d).includes('Persia Market preview')){clearTimeout(timer);resolve()}});child.once('error',reject)});
 browser=await chromium.launch({headless:true,...(process.argv[3]?{channel:process.argv[3]}:{})});const original=await (await fetch(origin+'/api/catalogue')).json();
 const errors=[];
 async function fixture(lang='en',basket={ghormeh:2,gheimeh:3}){
  const context=await browser.newContext({acceptDownloads:true,viewport:{width:lang==='fa'?390:1280,height:900}}),state={catalogue:structuredClone(original),hold:null,requested:null,offline:false};
  Object.assign(state.catalogue.products.find(p=>p.id==='ghormeh'),{cents:349,compareAtCents:499,stock:3,stockPending:false});
  Object.assign(state.catalogue.products.find(p=>p.id==='gheimeh'),{cents:257,compareAtCents:null,stock:4,stockPending:false});
  await context.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
  await context.route('**/api/catalogue',async route=>{state.requested?.();if(state.hold)await state.hold;if(state.offline)await route.abort();else await route.fulfill({json:state.catalogue})});
  await context.addInitScript(b=>{if(!localStorage.getItem('fixture-seeded')){localStorage.setItem('persia.v1.basket',JSON.stringify(b));localStorage.setItem('fixture-seeded','1')}},basket);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/?lang='+lang);await page.waitForFunction(()=>window.PersiaStoreReady);
  return{context,page,state};
 }
 async function review(page){await page.locator('#cart-open').click();await page.locator('#checkout').click();await page.locator('#order-dialog').waitFor();await page.locator('#delivery-city').fill('Roma');await page.locator('#delivery-postcode').fill('00185');await page.locator('#delivery-form [type=submit]').click();await page.locator('#confirm-demo').waitFor()}
 for(const lang of ['fa','it','en']){
  const {context,page,state}=await fixture(lang);const amount=await page.evaluate(l=>new Intl.NumberFormat(l==='fa'?'fa-IR':l==='it'?'it-IT':'en-IE',{style:'currency',currency:'EUR'}).format(14.69),lang);
  assert.equal(await page.locator('#cart-total').textContent(),amount,'Two discounted units plus three other units total 1469 cents');
  await review(page);assert.equal(await page.locator('#order-summary .total-line b').textContent(),amount);
  await page.locator('#edit-destination').click();await page.locator('#delivery-postcode').fill('185');await page.locator('#delivery-form [type=submit]').click();assert.equal(await page.locator('#order-actions').isVisible(),false,'Invalid CAP prevents review');
  await page.locator('#delivery-postcode').fill(lang==='fa'?'۰۰۱۸۵':'00185');assert.equal(await page.locator('#delivery-postcode').inputValue(),'00185');await page.locator('#delivery-form [type=submit]').click();
  await page.locator('#confirm-demo').dblclick();await page.locator('#order-success').waitFor();assert.equal(await page.locator('#cart-count').textContent(),lang==='fa'?'۰':'0');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('persia.v1.orders')).length),1,'A repeated confirmation creates only one receipt');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Mobile invoice stays within viewport');
  if(lang==='fa'){await mkdir(path.join(root,'screenshots'),{recursive:true});await page.screenshot({path:path.join(root,'screenshots/checkout-receipt-mobile.png')});}
  const download=page.waitForEvent('download');await page.locator('#download-order').click();const file=await download,receipt=await readFile(await file.path(),'utf8');assert.ok(receipt.includes(amount)&&receipt.includes('00185'));assert.match(file.suggestedFilename(),/^PM-DEMO-[A-F0-9]{8}\.txt$/);
  const names=state.catalogue.products.filter(p=>['ghormeh','gheimeh'].includes(p.id)).map(p=>p.name[{fa:0,en:1,it:2}[lang]]);
  state.catalogue.products=state.catalogue.products.filter(p=>!['ghormeh','gheimeh'].includes(p.id));await page.reload();await page.waitForFunction(()=>window.PersiaStoreReady);await page.locator('#cart-open').click();assert.ok(await page.locator('#cart-orders').evaluate(n=>n.getBoundingClientRect().height>=44),'Receipt history has a touch-sized control');await page.locator('#cart-orders').click();await page.locator('[data-receipt]').first().click();assert.equal(await page.locator('#order-summary .total-line b').textContent(),amount,'Captured historical prices survive product removal');
  for(const name of names)assert.ok((await page.locator('#order-summary').textContent()).includes(name),'Captured historical name survives product removal');
  const historicalDownload=page.waitForEvent('download');await page.locator('#download-order').click();const historicalFile=await historicalDownload;const historicalText=await readFile(await historicalFile.path(),'utf8');assert.ok(historicalText.includes(amount)&&names.every(name=>historicalText.includes(name)),'Reopened receipt can still be downloaded after product removal');
  console.log('PASS: '+lang+' discounted multi-product total, local confirmation, download and historical receipt after product removal.');await context.close();
 }
 for(const change of ['price','stock']){
  const {context,page,state}=await fixture();await review(page);let release;state.hold=new Promise(r=>release=r);let started;const requested=new Promise(r=>started=r);state.requested=started;state.catalogue.products.find(p=>p.id==='ghormeh').cents=449;
  if(change==='stock')Object.assign(state.catalogue.products.find(p=>p.id==='ghormeh'),{cents:349,stock:1});
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await requested;await page.locator('#confirm-demo').click();
  assert.equal(await page.locator('#confirm-demo').isDisabled(),true,'Confirmation awaits the existing request');assert.equal(await page.locator('#order-success').isVisible(),false);release();await page.locator('#cart-dialog').waitFor();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('persia.v1.orders')||'[]').length),0,'Changed '+change+' prevents receipt creation');await context.close();
 }
 {
  const {context,page,state}=await fixture();await review(page);state.offline=true;await page.locator('#confirm-demo').click();await page.evaluate(()=>refreshCatalogue());assert.equal(await page.locator('#order-success').isVisible(),false,'Failed catalogue verification cannot confirm stale prices');assert.equal(await page.locator('#confirm-demo').isEnabled(),true,'Failed verification remains retryable');state.offline=false;await page.locator('#confirm-demo').click();await page.locator('#order-success').waitFor();await context.close();
 }
 {
  const {context,page,state}=await fixture();state.offline=true;await page.locator('#cart-open').click();await page.locator('#checkout').click();await page.evaluate(()=>refreshCatalogue());assert.equal(await page.locator('#order-dialog').isVisible(),false);assert.equal(await page.locator('#checkout').isEnabled(),true);assert.equal(await page.locator('#cart-count').textContent(),'5');state.offline=false;await page.locator('#checkout').click();await page.locator('#order-dialog').waitFor();await context.close();
 }
 {
  const {context,page,state}=await fixture();await review(page);let release;state.hold=new Promise(r=>release=r);await page.locator('#confirm-demo').click();await page.locator('[data-close="order-dialog"]').click();release();await page.evaluate(()=>refreshCatalogue());assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('persia.v1.orders')||'[]').length),0,'Closing a pending confirmation cancels receipt creation');await context.close();
 }
 {
  const {context,page}=await fixture('en',{ghormeh:1});const sibling=await context.newPage();await sibling.goto(origin+'/?lang=en');await sibling.waitForFunction(()=>window.PersiaStoreReady);
  const pending=await page.evaluate(()=>window.PersiaCatalogue.find(p=>p.stockPending).id);
  await sibling.evaluate(p=>localStorage.setItem('persia.v1.basket',JSON.stringify({ghormeh:99,[p]:1})),pending);
  await page.waitForFunction(()=>document.querySelector('#cart-count').textContent!=='1');await page.locator('#cart-open').click();
  assert.deepEqual(await page.locator('#cart-items .qty span').allTextContents(),['3'],'Cross-tab quantity is capped and the pending-price item is excluded');assert.equal(await page.locator('#cart-items .qty [data-change="1"]').isDisabled(),true);await page.locator('#cart-items .qty [data-change="-1"]').click();assert.deepEqual(await page.locator('#cart-items .qty span').allTextContents(),['2'],'A synchronized basket remains editable');await context.close();
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: in-flight price/stock changes, offline checkout/confirmation and retry, cancelled pending confirmation, duplicate clicks, guest receipt history and normalized cross-tab stock quantities.');
}finally{await browser?.close();if(child.exitCode===null){child.kill();await once(child,'exit')}if(!path.resolve(directory).startsWith(path.resolve(tmpdir())+path.sep))throw Error('Unexpected temp directory');await rm(directory,{recursive:true,force:true})}
