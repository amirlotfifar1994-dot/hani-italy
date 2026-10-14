import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {once} from 'node:events';
import path from 'node:path';
import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {totp} from '../server/security.mjs';
import {checkHeroSlider} from './hero-slider-ui.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.argv[2]||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url)),directory=await mkdtemp(path.join(tmpdir(),'persia-security-ui-')),token=randomBytes(32).toString('base64url');
const probe=http.createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));const origin='http://127.0.0.1:'+port;
const child=spawn(process.execPath,['tools/preview.mjs'],{cwd:root,env:{...process.env,NODE_ENV:'development',PREVIEW_PORT:String(port),PORT:String(port),HOST:'127.0.0.1',AUTH_ORIGIN:origin,SITE_URL:'',PERSIA_DATA_DIR:directory,PERSIA_DB:path.join(directory,'accounts.sqlite'),PERSIA_UPLOAD_DIR:path.join(directory,'uploads'),ADMIN_SETUP_TOKEN:token,REQUIRE_ADMIN_MFA:'true',GOOGLE_CLIENT_ID:'',GOOGLE_CLIENT_SECRET:'',SEO_INDEXING:'false'},stdio:['ignore','pipe','pipe']});let browser;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Preview startup timed out')),20000);child.stdout.on('data',data=>{if(String(data).includes('Persia Market preview')){clearTimeout(timer);resolve();}});child.once('error',reject);child.once('exit',code=>{clearTimeout(timer);reject(Error('Preview exited '+code));});});
 browser=await chromium.launch({headless:true,...(process.argv[3]?{channel:process.argv[3]}:{})});const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error'&&/Content Security Policy|Refused to execute|Refused to load/.test(message.text()))errors.push(message.text());});
 // Exercise the usable system-font fallback without depending on Google's network.
 await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
 await context.route('https://fonts.gstatic.com/**',route=>route.abort());
 await mkdir(path.join(root,'screenshots'),{recursive:true});
 let releaseImage;
 const heldImage = new Promise(resolve => { releaseImage = resolve; });
 await page.route('**/assets/persia/persepolis-rome-hero-v1.webp', async route => { await heldImage; await route.continue(); });
 await page.goto(origin+'/?lang=fa',{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('.hero-food').first().evaluate(image=>getComputedStyle(image).opacity),'0','A loading photograph stays faded');
 releaseImage();
 await page.waitForFunction(()=>document.querySelector('.hero-food').hasAttribute('data-image-ready'));
 await page.waitForTimeout(180);
 const intermediateOpacity=await page.locator('.hero-food').first().evaluate(image=>Number(getComputedStyle(image).opacity));
 assert.ok(intermediateOpacity>0&&intermediateOpacity<1,'The decoded photograph fades gradually');
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.hero-food')).opacity==='1');
 assert.equal(await page.locator('.hero-image-caption').count(),0);
 await page.waitForFunction(()=>window.PersiaCopy&&window.PersiaSeo?.lang==='fa');
 assert.equal(await page.locator('.postcard-city').textContent(),'ایران ← ایتالیا');
 assert.ok(!/[،.؛]/.test(await page.locator('.hero-copy').textContent().then(text=>text.replace('SAME ROOTS.','').replace('A BRIGHTER TOMORROW.',''))));
 await page.unroute('**/assets/persia/persepolis-rome-hero-v1.webp');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.hero-food').first().evaluate(image=>getComputedStyle(image).transitionDuration),'0s');
 await page.emulateMedia({reducedMotion:'no-preference'});
 console.log('PASS: delayed image decode, gradual fade, reduced-motion preference, country direction and caption removal.');
 for(const lang of ['fa','it','en']){await page.goto(origin+'/?lang='+lang);await page.waitForFunction(()=>window.PersiaCatalogue?.length===50&&window.PersiaCopy&&window.PersiaSeo?.lang===document.documentElement.lang);await page.locator('#cart-open').waitFor();await page.waitForFunction(()=>document.documentElement.style.getPropertyValue('--home-header-height'));const layout=await page.evaluate(()=>({bottom:document.querySelector('.hero').getBoundingClientRect().bottom,viewport:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth}));assert.ok(layout.bottom>=layout.viewport-1,'Categories stay below the opening viewport');assert.ok(layout.bottom<=layout.viewport+2,'Desktop header and hero fit the viewport');assert.equal(layout.overflow,false);if(lang==='fa')await page.waitForFunction(()=>getComputedStyle(document.querySelector('.hero-food')).opacity==='1');if(lang==='fa')await page.screenshot({path:path.join(root,'screenshots/security-hero-fa.png')});}
 for(const viewport of [{width:1882,height:913},{width:618,height:895},{width:390,height:844}]){await page.setViewportSize(viewport);await page.goto(origin+'/?lang=fa');await page.waitForFunction(()=>window.PersiaCatalogue?.length===50&&window.PersiaSeo?.lang==='fa');const layout=await page.evaluate(()=>({bottom:document.querySelector('.hero').getBoundingClientRect().bottom,viewport:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth}));assert.ok(layout.bottom>=layout.viewport-1,'Categories stay below the opening view at '+viewport.width+'px');assert.equal(layout.overflow,false);if(viewport.width===390)await page.screenshot({path:path.join(root,'screenshots/security-hero-mobile.png'),fullPage:false});}
 await checkHeroSlider(page,context);
 for(const lang of ['it','en']){await page.goto(origin+'/?lang='+lang);await page.waitForFunction(()=>window.PersiaSeo?.lang===document.documentElement.lang&&window.PersiaCopy);assert.equal(await page.locator('.hero-slide-controls').isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(root,'screenshots/immersive-hero-'+lang+'.png')});}
 await page.setViewportSize({width:1440,height:900});await page.goto(origin+'/?lang=fa');await page.waitForFunction(()=>window.PersiaCopy&&window.PersiaSeo?.lang==='fa');assert.equal(await page.locator('.journal-city-postcard').count(),10);const cityImages=await page.locator('.journal-city-postcard>img').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('src')));assert.equal(new Set(cityImages).size,10);await page.locator('.journal-city-collection').scrollIntoViewIfNeeded();await page.waitForFunction(()=>Array.from(document.querySelectorAll('.journal-city-postcard>img')).every(img=>img.complete&&img.naturalWidth>0));await page.locator('.journal-city-collection').screenshot({path:path.join(root,'screenshots/city-postcards-fa.png'),style:'header#home{visibility:hidden}'});
 await page.setViewportSize({width:1280,height:900});await page.goto(origin+'/admin.html?lang=fa#setup='+token);await page.locator('#owner-name').fill('Isolated UI owner');await page.locator('#admin-email').fill('ui-owner@example.com');const password='Isolated UI passphrase 2026';await page.locator('#admin-password').fill(password);await page.locator('#admin-confirm-password').fill(password);await page.locator('#admin-auth-form button[type=submit]').click();await page.locator('#security-password').waitFor();assert.equal(await page.locator('.adm-sidebar [data-admin-list]').count(),0,'Management stays locked before MFA');await page.locator('#security-password').fill(password);await page.locator('#admin-security-form button').click();await page.locator('.adm-authenticator-key').waitFor();const secret=await page.locator('.adm-authenticator-key').textContent();await page.locator('#security-code').fill(totp(secret));await page.locator('#admin-security-form button').click();await page.locator('[data-security-done]').waitFor();const codes=await page.locator('.adm-recovery-codes code').allTextContents();assert.equal(codes.length,8);await page.locator('[data-security-done]').click();await page.locator('.adm-sidebar [data-admin-list]').waitFor();await page.locator('[data-admin-security]').click();await page.locator('#security-events table').waitFor();assert.ok((await page.locator('#security-events').textContent()).includes('mfa.enabled'));
 await page.locator('[data-admin-logout]').click();await page.locator('#admin-email').fill('ui-owner@example.com');await page.locator('#admin-password').fill(password);await page.locator('#admin-auth-form button[type=submit]').click();await page.locator('#security-code').waitFor();await page.locator('#security-code').fill(codes[0]);await page.locator('#admin-security-form button').click();await page.locator('.adm-sidebar [data-admin-list]').waitFor();await page.locator('.adm-sidebar [data-admin-list]').click();await page.locator('.adm-table').waitFor();
 assert.deepEqual(errors,[],'No script-policy violations or browser exceptions');await page.evaluate(()=>{const script=document.createElement('script');script.textContent='window.__persiaInlineCanary=true';document.head.append(script);});assert.equal(await page.evaluate(()=>window.__persiaInlineCanary),undefined,'The actual browser refuses injected inline JavaScript');console.log('PASS: three-language viewport hero, mobile overflow protection, strict-CSP storefront hydration and inline-injection rejection, private owner setup, mandatory MFA enrollment, one-time recovery display, verified management, audit UI and recovery sign-in.');
}finally{await browser?.close();if(child.exitCode===null){child.kill('SIGTERM');await once(child,'exit');}assert.ok(path.resolve(directory).startsWith(path.resolve(tmpdir())+path.sep));await rm(directory,{recursive:true,force:true});}
