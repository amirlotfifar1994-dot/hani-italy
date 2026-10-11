import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {once} from 'node:events';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
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
    await page.goto(origin+'/?lang='+lang);
    await page.waitForFunction(()=>window.PersiaCopy&&window.PersiaSeo?.lang===document.documentElement.lang);
    const carousel=page.locator('.journal-carousel'),track=page.locator('.journal-carousel-track');
    await carousel.scrollIntoViewIfNeeded();
    assert.ok(await track.locator('.journal-card').count()>3,'There are additional stories to slide to');
    assert.equal(await track.locator('.journal-city-collection').count(),0,'City guides stay outside the slider');
    assert.equal(await page.locator('.journal-city-postcard').count(),10);
    assert.equal(await page.locator('.journal-carousel-dots button').count(),2,'Three cards are visible on desktop');
    assert.equal(await active(),'0');
    assert.equal(await page.locator('[data-story-previous]').isDisabled(),true);
    await page.locator('[data-story-next]').click();
    await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='1');
    assert.equal(await page.locator('[data-story-next]').isDisabled(),true);
    assert.equal(await track.locator('a').first().getAttribute('href').then(url=>url.endsWith('?lang='+lang)),true);
    await track.focus();await page.keyboard.press('Home');
    await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='0');
    await page.keyboard.press(lang==='fa'?'ArrowLeft':'ArrowRight');
    await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='1');
    await page.keyboard.press('Home');
    await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='0');
    if(lang==='fa') {
      await page.waitForFunction(()=>[...document.querySelectorAll('.journal-carousel-track img')].every(image=>image.complete&&image.naturalWidth&&getComputedStyle(image).opacity==='1'));
      await carousel.screenshot({path:path.join(root,'screenshots/'+(remote?'live-':'')+'journal-slider-desktop.png')});
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    console.log('PASS: '+lang+' desktop RTL/LTR arrows, keyboard, boundaries, links and city separation');
  }
  await page.goto(origin+'/?lang=fa');await page.waitForFunction(()=>window.PersiaCopy);
  await page.setViewportSize({width:850,height:1000});
  await page.waitForFunction(()=>document.querySelectorAll('.journal-carousel-dots button').length===3);
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.querySelectorAll('.journal-carousel-dots button').length===4);
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
  await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='3');
  assert.equal(await page.locator('[data-story-next]').isDisabled(),true);
  assert.equal(await page.locator('.journal-carousel-track').evaluate(node=>getComputedStyle(node).scrollBehavior),'auto');
  await page.locator('.journal-carousel-dots button').first().click();
  await page.waitForFunction(()=>document.querySelector('.journal-carousel-dots button[aria-current=true]')?.dataset.storyPage==='0');
  await page.waitForFunction(()=>{const track=document.querySelector('.journal-carousel-track');return Math.abs(track.querySelector('.journal-card').getBoundingClientRect().right-track.getBoundingClientRect().right)<2;});
  await page.waitForFunction(()=>[...document.querySelectorAll('.journal-carousel-track img')].every(image=>image.complete&&image.naturalWidth&&getComputedStyle(image).opacity==='1'));
  await page.locator('.journal-carousel').screenshot({path:path.join(root,'screenshots/'+(remote?'live-':'')+'journal-slider-mobile.png')});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log('PASS: tablet resize, native mobile swipe, pagination, reduced motion and no page overflow');
  const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),fallback=await plain.newPage();
  await fallback.goto(origin+'/?lang=fa');
  assert.ok(await fallback.locator('.journal-carousel-track .journal-card').count()>3);
  assert.equal(await fallback.locator('.journal-carousel-controls').isVisible(),false);
  assert.ok(await fallback.locator('.journal-carousel-track').evaluate(node=>node.scrollWidth>node.clientWidth));
  assert.deepEqual(errors,[]);
  console.log('PASS: server-rendered story links and native horizontal scrolling work without JavaScript');
} finally {
  await browser?.close();
  if(child?.exitCode===null){child.kill('SIGTERM');await once(child,'exit');}
  if(directory){assert.ok(path.resolve(directory).startsWith(path.resolve(tmpdir())+path.sep));await rm(directory,{recursive:true,force:true});}
}
