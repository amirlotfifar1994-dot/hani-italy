import assert from 'node:assert/strict';

export async function checkHeroSlider(page,context){
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.locator('.hero-slider-ready').waitFor();
 const active=()=>page.locator('[data-hero-image].is-active').getAttribute('data-hero-image');
 const go=async index=>{await page.locator(`[data-hero-slide="${index}"]`).click();await page.waitForFunction(index=>document.querySelector('[data-hero-image].is-active')?.dataset.heroImage===String(index),index);};
 await go(0);
 const firstSource=await page.locator('[data-hero-image].is-active').getAttribute('src');
 await page.locator('[data-hero-step="1"]').click();
 await page.waitForFunction(()=>document.querySelector('[data-hero-image].is-active')?.dataset.heroImage==='1');
 assert.notEqual(await page.locator('[data-hero-image].is-active').getAttribute('src'),firstSource,'An arrow changes the image file');
 assert.equal(await page.locator('[data-hero-slide="1"]').getAttribute('aria-current'),'true');
 assert.equal(await page.locator('[data-hero-image="0"]').getAttribute('aria-hidden'),'true');
 await page.waitForTimeout(120);
 const fade=await page.locator('[data-hero-image="1"]').evaluate(node=>Number(getComputedStyle(node).opacity));
 assert.ok(fade>0&&fade<1,'A slide fades gradually');
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-hero-image="1"]')).opacity==='1');
 assert.equal(await page.locator('[data-hero-image="0"]').evaluate(node=>getComputedStyle(node).opacity),'0','Decoded inactive images remain hidden');
 await page.locator('[data-hero-step="1"]').click();await page.waitForFunction(()=>document.querySelector('[data-hero-image].is-active')?.dataset.heroImage==='0');
 await page.locator('[data-hero-step="-1"]').click();await page.waitForFunction(()=>document.querySelector('[data-hero-image].is-active')?.dataset.heroImage==='1');
 await go(0);
 const touch=await context.newCDPSession(page),y=await page.locator('.hero').evaluate(node=>node.getBoundingClientRect().top+65);
 const swipe=async points=>{await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});for(const point of points.slice(1))await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point]});await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 await swipe([250,220,190,160,130,100].map(x=>({x,y})));
 await page.waitForFunction(()=>document.querySelector('[data-hero-image].is-active')?.dataset.heroImage==='1');
 assert.equal(await page.locator('.hero').evaluate(node=>node.style.getPropertyValue('--hero-pan')),'','Touch does not change the image crop');
 await swipe([190,180,170].map(x=>({x,y})));await page.waitForTimeout(150);assert.equal(await active(),'1','A short drag does not switch images');
 await swipe([650,600,540,460,380,300].map(y=>({x:190,y})));await page.waitForFunction(()=>scrollY>0);assert.equal(await active(),'1','Vertical swiping scrolls the page without switching slides');
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.emulateMedia({reducedMotion:'reduce'});await go(0);
 assert.equal(await page.locator('[data-hero-image="0"]').evaluate(node=>getComputedStyle(node).transitionDuration),'0s');
 await page.locator('[data-hero-step="1"]').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('[data-hero-image].is-active')?.dataset.heroImage==='1');
 await go(0);await page.emulateMedia({reducedMotion:'no-preference'});await touch.detach();
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 console.log('PASS: hero changes image files with arrows, dots, keyboard and mobile swipe; wraparound, crossfade, inactive opacity, vertical scrolling, short drags and reduced motion.');
}
