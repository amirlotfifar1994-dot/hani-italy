import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {once} from 'node:events';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require(process.argv[2]||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const directory=await mkdtemp(path.join(tmpdir(),'persia-bug-audit-'));
const probe=http.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));const origin='http://127.0.0.1:'+port;
const child=spawn(process.execPath,['tools/preview.mjs'],{cwd:root,env:{...process.env,NODE_ENV:'development',PREVIEW_PORT:String(port),PORT:String(port),HOST:'127.0.0.1',AUTH_ORIGIN:origin,SITE_URL:'',PERSIA_DATA_DIR:directory,PERSIA_DB:path.join(directory,'accounts.sqlite'),PERSIA_UPLOAD_DIR:path.join(directory,'uploads'),ADMIN_SETUP_TOKEN:'',GOOGLE_CLIENT_ID:'',GOOGLE_CLIENT_SECRET:'',SEO_INDEXING:'false'},stdio:['ignore','pipe','pipe']});
let browser;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Preview timeout')),20000);child.stdout.on('data',d=>{if(String(d).includes('Persia Market preview')){clearTimeout(timer);resolve()}});child.once('error',reject)});
 browser=await chromium.launch({headless:true,...(process.argv[3]?{channel:process.argv[3]}:{})});const context=await browser.newContext(),page=await context.newPage(),errors=[];
 await context.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));page.on('pageerror',e=>errors.push(e.message));
 for(const lang of ['it','fa','en']){
  await page.goto(origin+'/?lang='+lang,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.PersiaStoreReady);
  const issues=[];
  for(const width of [320,390,650,768,900,901,980,1024,1100,1101,1280,1440]){
   await page.setViewportSize({width,height:900});
   const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,clipped:[...document.querySelectorAll('#products .product-card')].filter(c=>[...c.querySelectorAll('.product-bottom>*')].some(n=>{const b=n.getBoundingClientRect(),r=c.getBoundingClientRect();return b.left<r.left-1||b.right>r.right+1})).length}));
   if(state.overflow||state.clipped)issues.push({width,...state});
  }
  assert.deepEqual(issues,[],'No overflowing page or clipped product price/add controls in '+lang);
 }
 await page.setViewportSize({width:390,height:844});const items=await page.evaluate(()=>window.PersiaCatalogue),first=items.find(p=>p.cents>0&&!p.stockPending),pending=items.find(p=>p.stockPending||p.cents===null);
 for(const route of ['/shop?lang=fa','/blog?lang=fa','/blog/dolmeh-vine-leaves-recipe-italy?lang=fa','/products/'+first.id+'?lang=fa','/account?lang=fa','/admin.html?lang=fa']){
  const response=await page.goto(origin+route,{waitUntil:'domcontentloaded'});await page.locator('main').waitFor();
  assert.equal(response.status(),200,route);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route);
 }
 await page.goto(origin+'/?lang=en');await page.waitForFunction(()=>window.PersiaStoreReady);
 await page.locator('#products [data-add="'+first.id+'"]').click();await page.locator('#cart-open').click();await page.locator('#checkout').click();await page.locator('#order-dialog').waitFor();
 assert.equal(await page.locator('#delivery-city').inputValue(),'','Guest checkout remains editable without a saved address');
 assert.equal(await page.locator('#delivery-postcode').inputValue(),'');await page.locator('[data-close="order-dialog"]').click();
 const response=await context.request.post(origin+'/api/auth/register',{headers:{Origin:origin},data:{name:'Audit fixture',email:'audit@example.com',phone:'',password:'Isolated audit passphrase 2026',language:'it'}});if(response.status()!==201)throw Error('Fixture registration: '+response.status());const user=(await response.json()).user;
 await context.addInitScript(({id,pendingId,buyId})=>{if(!localStorage.getItem('audit-seeded')){localStorage.setItem('persia.user.'+id+'.favorites',JSON.stringify([pendingId,buyId]));localStorage.setItem('persia.user.'+id+'.basket',JSON.stringify({[buyId]:1}));localStorage.setItem('audit-seeded','true')}},{id:user.id,pendingId:pending.id,buyId:first.id});
 await page.goto(origin+'/account?lang=it#account/saved');await page.locator('.account-saved-product').first().waitFor();
 assert.equal(await page.locator('.account-favourites [data-add="'+pending.id+'"]').isDisabled(),true,'Unavailable saved product cannot be added');
 assert.equal(await page.locator('.account-favourites [data-add="'+first.id+'"]').isEnabled(),true,'Available saved product remains purchasable');
 if(pending.cents===null)assert.equal(await page.locator('.account-saved-product').filter({has:page.locator('[data-add="'+pending.id+'"]')}).locator('.price-pending').count(),1,'Pending price uses the same truthful label as the catalogue');
 for(const lang of ['fa','en','it']){
  await page.locator('[data-account-tab="profile"]').click();await page.locator('#profile-language').selectOption(lang);await page.locator('#account-profile-form [type=submit]').click();await page.waitForFunction(l=>document.documentElement.lang===l,lang);
  assert.equal(new URL(page.url()).searchParams.get('lang'),lang,'Saved language updates the URL');
  assert.equal(new URL(page.url()).hash,'#account/profile','Language preserves the account route');
  await page.reload();await page.locator('.account-sidebar').waitFor();assert.equal(await page.locator('html').getAttribute('lang'),lang,'Saved language survives reload');
 }
 await page.locator('[data-account-tab="addresses"]').click();await page.locator('[data-new-address]').click();await page.locator('#address-label').fill('Casa');await page.locator('#address-street').fill('Via Test 1');await page.locator('#address-city').fill('Milano');await page.locator('#address-postcode').fill('20121');await page.locator('#account-address-form [type=submit]').click();await page.locator('[data-new-address]').waitFor();
 for(let attempt=0;attempt<2;attempt++){
  await page.locator('#cart-open').click();await page.locator('#checkout').click();await page.locator('#order-dialog').waitFor();
  assert.equal(await page.locator('#delivery-city').inputValue(),'Milano','Default city is filled after asynchronous catalogue refresh and form reset');
  assert.equal(await page.locator('#delivery-postcode').inputValue(),'20121');assert.ok(await page.locator('#checkout-address').inputValue());
  await page.locator('[data-close="order-dialog"]').click();
 }
 assert.deepEqual(errors,[],'No browser exceptions');
 console.log('PASS: account favourites respect availability and pending prices; saved languages retain URL/hash and survive reload; default checkout address survives repeated asynchronous initialization.');
 console.log('PASS: three-language product controls at twelve widths (320–1440px) and mobile shop/journal/product/account/admin routes, without page overflow or clipped controls.');
}finally{await browser?.close();if(child.exitCode===null){child.kill();await once(child,'exit')}if(!path.resolve(directory).startsWith(path.resolve(tmpdir())+path.sep))throw Error('Unexpected temp directory');await rm(directory,{recursive:true,force:true})}
import assert from 'node:assert/strict';
