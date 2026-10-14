const hero=document.querySelector('.hero'),image=hero?.querySelector('.hero-food'),mobile=matchMedia('(max-width:650px)');
if(hero&&image){
 let position=92,gesture=null;
 const setPosition=value=>{position=Math.max(0,Math.min(100,value));hero.style.setProperty('--hero-pan',position+'%');hero.querySelector('[data-hero-pan="-1"]').disabled=position===0;hero.querySelector('[data-hero-pan="1"]').disabled=position===100;};
 const label=()=>{const lang=document.documentElement.lang;hero.querySelectorAll('[data-hero-pan]').forEach(button=>{const right=Number(button.dataset.heroPan)>0;button.setAttribute('aria-label',({fa:['نمای سمت چپ تصویر','نمای سمت راست تصویر'],en:['Explore the left of the image','Explore the right of the image'],it:['Esplora la parte sinistra','Esplora la parte destra']})[lang==='fa'||lang==='it'?lang:'en'][Number(right)]);});};
 label();new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 hero.addEventListener('pointerdown',event=>{if(!mobile.matches||!event.isPrimary||event.button!==0||event.target.closest('a,button,input'))return;gesture={id:event.pointerId,x:event.clientX,y:event.clientY,start:position,dragging:false};});
 hero.addEventListener('pointermove',event=>{if(!gesture||event.pointerId!==gesture.id)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;if(!gesture.dragging){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){gesture=null;return;}if(Math.abs(dx)<8)return;gesture.dragging=true;hero.setPointerCapture(event.pointerId);}const bounds=image.getBoundingClientRect(),ratio=image.naturalWidth/image.naturalHeight||2.5,excess=Math.max(1,Math.max(bounds.width,bounds.height*ratio)-bounds.width);setPosition(gesture.start-dx/excess*100);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])hero.addEventListener(type,()=>{gesture=null;});
 hero.querySelectorAll('[data-hero-pan]').forEach(button=>button.addEventListener('click',()=>setPosition(position+Number(button.dataset.heroPan)*20)));
 setPosition(position);
}
