import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {once} from 'node:events';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {checkHeroSlider} from './hero-slider-ui.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.argv[2]||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url)),remote=process.argv[4];
let directory,child,browser,origin=remote;
try {
  if(!remote) {
    directory=await mkdtemp(path.join(tmpdir(),'persia-carousel-'));
    const probe=http.createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));origin='http://127.0.0.1:'+port;
    child=spawn(process.execPath,['tools/preview.mjs'],{cwd:root,env:{...process.env,NODE_ENV:'development',PREVIEW_PORT:String(port),PORT:String(port),HOST:'127.0.0.1',AUTH_ORIGIN:origin,SITE_URL:'',PERSIA_DATA_DIR:directory,PERSIA_DB:path.join(directory,'accounts.sqlite'),PERSIA_UPLOAD_DIR:path.join(directory,'uploads'),ADMIN_SETUP_TOKEN:'',GOOGLE_CLIENT_ID:'',GOOGLE_CLIENT_SECRET:'',SEO_INDEXING:'false'},stdio:['ignore','pipe','pipe']});
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Preview startup timed out')),20000);child.stdout.on('data',data=>{if(String(data).includes('Persia Market preview')){clearTimeout(timer);resolve();}});child.once('error',reject);});
  }
  browser=await chromium.launch({headless:true,...(process.argv[3]?{channel:process.argv[3]}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  if(!remote)await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
  await mkdir(path.join(root,'screenshots'),{recursive:true});
  const active=()=>page.locator('.journal-carousel-dots button[aria-current=true]').getAttribute('data-story-page');
  for(const lang of ['fa','it','en']) {
    await page.goto(origin+'/?lang='+lang,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.PersiaStoreReady&&window.PersiaSeo?.lang===document.documentElement.lang);
    const carousel=page.locator('.journal-carousel'),track=page.locator('.journal-carousel-track');
    await carousel.scrollIntoViewIfNeeded();
    assert.equal(await track.locator('.journal-card').count(),6,'Six curated stories are available');
    assert.equal(await track.locator('.journal-city-collection').count(),0,'City guides stay outside the slider');
    assert.equal(await page.locator('.journal-city-postcard').count(),10);
    assert.equal(await page.locator('.journal-carousel-dots button').count(),4,'Three cards are visible on desktop');
    assert.equal(await active(),'0');
    assert.equal(await page.locator('[data-story-previous]').isDisabled(),true);
    await page.locator('[data-story-next]').click();
    await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='1');
    assert.equal(await page.locator('[data-story-next]').isDisabled(),false);
    assert.equal(await track.locator('a').first().getAttribute('href').then(url=>url.endsWith('?lang='+lang)),true);
    await track.focus();await page.keyboard.press('End');
    await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='3');
    assert.equal(await page.locator('[data-story-next]').isDisabled(),true);
    await page.keyboard.press('Home');
    await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='0');
    await page.waitForFunction(()=>{const track=document.querySelector('.journal-carousel-track'),card=track.querySelector('.journal-card'),rtl=getComputedStyle(track).direction==='rtl';return Math.abs(card.getBoundingClientRect()[rtl?'right':'left']-track.getBoundingClientRect()[rtl?'right':'left'])<2;});
    await page.keyboard.press(lang==='fa'?'ArrowLeft':'ArrowRight');
    await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='1');
    await page.keyboard.press('Home');
    await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='0');
    if(lang==='fa') {
      await page.waitForFunction(()=>{const track=document.querySelector('.journal-carousel-track');return Math.abs(track.querySelector('.journal-card').getBoundingClientRect().right-track.getBoundingClientRect().right)<2;});
      await page.waitForFunction(()=>[...document.querySelectorAll('.journal-carousel-track img')].every(image=>image.complete&&image.naturalWidth&&getComputedStyle(image).opacity==='1'));
      const image=track.locator('img').first();
      const timing=await image.evaluate(node=>{const style=getComputedStyle(node),properties=style.transitionProperty.split(',').map(s=>s.trim()),durations=style.transitionDuration.split(',').map(parseFloat);return durations[properties.indexOf('transform')]||0;});
      assert.ok(timing>=1.1,'Image fade must retain a slow transform transition');
      await carousel.screenshot({path:path.join(root,'screenshots/'+(remote?'live-':'')+'journal-slider-desktop.png')});
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    console.log('PASS: '+lang+' desktop RTL/LTR arrows, keyboard, boundaries, links and city separation');
  }
  await page.goto(origin+'/?lang=fa',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.PersiaCopy);
  await page.setViewportSize({width:850,height:1000});
  await page.waitForFunction(()=>document.querySelectorAll('.journal-carousel-dots button').length===5);
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.querySelectorAll('.journal-carousel-dots button').length===6);
  assert.ok(await page.locator('.journal-carousel-track').evaluate(node=>Math.abs(node.clientWidth-node.querySelector('.journal-card').getBoundingClientRect().width)<2),'A mobile card fills the track exactly');
  await page.locator('.journal-carousel-track').scrollIntoViewIfNeeded();
  const touch=await context.newCDPSession(page),y=await page.locator('.journal-carousel-track').evaluate(node=>node.getBoundingClientRect().top+90);
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:70,y}]});
  for(const x of [100,140,180,220,270,320])await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForFunction(()=>Number(document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage)>0);
  await page.waitForFunction(()=>{
    const position=document.querySelector('.journal-carousel-track').scrollLeft,now=performance.now();
    if(!window.__carouselSettle||window.__carouselSettle.position!==position){window.__carouselSettle={position,time:now};return false;}
    return now-window.__carouselSettle.time>200;
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.journal-carousel-dots button').last().click();
  await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='5');
  assert.equal(await page.locator('[data-story-next]').isDisabled(),true);
  assert.equal(await page.locator('.journal-carousel-track').evaluate(node=>getComputedStyle(node).scrollBehavior),'auto');
  await page.locator('.journal-carousel-dots button').first().click();
  await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='0');
  await page.waitForFunction(()=>{const track=document.querySelector('.journal-carousel-track');return Math.abs(track.querySelector('.journal-card').getBoundingClientRect().right-track.getBoundingClientRect().right)<2;});
  await page.waitForFunction(()=>{const image=document.querySelector('.journal-carousel-track img');return image.complete&&image.naturalWidth&&getComputedStyle(image).opacity==='1';});
  await page.locator('.journal-carousel').screenshot({path:path.join(root,'screenshots/'+(remote?'live-':'')+'journal-slider-mobile.png')});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log('PASS: tablet resize, native mobile swipe, pagination, reduced motion and no page overflow');
  let releaseSession,reachedSession;
  const sessionGate=new Promise(resolve=>{releaseSession=resolve;}),sessionReached=new Promise(resolve=>{reachedSession=resolve;});
  const holdSession=async route=>{reachedSession();await sessionGate;await route.continue();};
  await context.route('**/api/auth/session',holdSession);
  await page.goto(origin+'/?lang=fa',{waitUntil:'domcontentloaded'});await sessionReached;
  assert.equal(await page.evaluate(()=>Boolean(window.PersiaStoreReady)),false);
  await page.locator('#menu-toggle').click();assert.equal(await page.locator('#header-search').isVisible(),true);
  await page.locator('#menu-toggle').click();assert.equal(await page.locator('#header-search').isVisible(),false);
  releaseSession();await page.waitForFunction(()=>window.PersiaStoreReady);
  await context.unroute('**/api/auth/session',holdSession);
  console.log('PASS: navigation works while the session request is pending');
  for(const lang of ['fa','en','it'])for(const width of [320,360,390,618]){
    await page.setViewportSize({width,height:844});await page.goto(origin+'/?lang='+lang,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.PersiaStoreReady&&window.PersiaSeo?.lang===document.documentElement.lang);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No overflow at '+width+' '+lang+' '+JSON.stringify(await page.evaluate(()=>({width:document.documentElement.scrollWidth,boxes:[...document.querySelectorAll('body *')].map(node=>({tag:node.tagName,class:node.className,parent:node.parentElement.className,left:node.getBoundingClientRect().left,right:node.getBoundingClientRect().right})).filter(box=>box.right>innerWidth).slice(0,20)}))));
    const layout=await page.evaluate(()=>{const brand=document.querySelector('header#home .brand').getBoundingClientRect(),word=document.querySelector('header#home .brand-word').getBoundingClientRect(),actions=document.querySelector('.header-actions').getBoundingClientRect();return {sameRow:Math.abs((brand.top+brand.bottom)/2-(actions.top+actions.bottom)/2)<4,separate:Math.max(brand.right,word.right)<=actions.left+1};});
    assert.ok(layout.sameRow&&layout.separate,'Logo and controls share one row at '+width+' '+lang);
    assert.equal(await page.locator('[data-t=heroPanHint]').count(),0);
    assert.equal(await page.locator('.announcement-phone').getAttribute('href'),'tel:+31110000111');
    assert.equal(await page.locator('.announcement [data-info=preview]').count(),0);
    assert.equal(await page.locator('.footer-skyline svg').count(),1);
    assert.ok(!/آزمایشی|مرحله اول|preview|phase one|prima fase/i.test(await page.locator('#network').textContent()));
    assert.equal(await page.locator('#mobile-language').inputValue(),lang);
    await page.locator('#menu-toggle').click();await page.locator('#header-search').waitFor({state:'visible'});
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
    await page.locator('#header-search').focus();await page.keyboard.press('Escape');
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
    assert.equal(await page.locator('#header-search').isVisible(),false);
    if(width===390&&lang==='fa')await page.screenshot({path:path.join(root,'screenshots/'+(remote?'live-':'')+'modern-mobile-home.png')});
  }
  await page.locator('#mobile-language').selectOption('fa');
  await page.waitForFunction(()=>document.documentElement.lang==='fa');
  console.log('PASS: compact one-row header at 320–618px in all languages, expandable search, Escape and language selection');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await checkHeroSlider(page,context);
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-hero-image="0"]')).opacity==='1');
  await page.screenshot({path:path.join(root,'screenshots/'+(remote?'live-':'')+'hero-slideshow-mobile.png')});
  await page.locator('footer [data-info=contact]').click();
  assert.equal(await page.locator('#info-body a[href="tel:+31110000111"]').textContent(),'+31110000111');
  await page.locator('[data-close=info-dialog]').click();
  await page.locator('footer').screenshot({path:path.join(root,'screenshots/'+(remote?'live-':'')+'minimal-footer.png'),style:'header#home{visibility:hidden}'});
  const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),fallback=await plain.newPage();
  if(!remote)await plain.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
  await fallback.goto(origin+'/?lang=fa',{waitUntil:'domcontentloaded'});
  await fallback.waitForFunction(()=>getComputedStyle(document.querySelector('[data-hero-image="1"]')).position==='absolute');
  assert.equal(await fallback.locator('[data-hero-image="0"]').evaluate(node=>getComputedStyle(node).opacity),'1');
  assert.equal(await fallback.locator('[data-hero-image="1"]').evaluate(node=>getComputedStyle(node).opacity),'0');
  assert.equal(await fallback.locator('.hero-slide-controls').isVisible(),false);
  assert.equal(await fallback.locator('.journal-carousel-track .journal-card').count(),6);
  assert.equal(await fallback.locator('.journal-carousel-controls').isVisible(),false);
  assert.ok(await fallback.locator('.journal-carousel-track').evaluate(node=>node.scrollWidth>node.clientWidth));
  assert.deepEqual(errors,[]);
  console.log('PASS: server-rendered story links and native horizontal scrolling work without JavaScript');
} finally {
  await browser?.close();
  if(child?.exitCode===null){child.kill('SIGTERM');await once(child,'exit');}
  if(directory){assert.ok(path.resolve(directory).startsWith(path.resolve(tmpdir())+path.sep));await rm(directory,{recursive:true,force:true});}
}
