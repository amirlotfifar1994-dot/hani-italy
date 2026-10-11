const hero=document.querySelector('.hero'),images=[...document.querySelectorAll('[data-hero-image]')];
if(hero&&images.length>1){
 const mobile=matchMedia('(max-width:650px)'),dots=[...hero.querySelectorAll('[data-hero-slide]')],status=hero.querySelector('[data-hero-status]');
 let active=0,target=0,request=0,gesture=null;
 const translations={fa:{previous:'تصویر قبلی',next:'تصویر بعدی',slide:'تصویر',of:'از'},en:{previous:'Previous image',next:'Next image',slide:'Image',of:'of'},it:{previous:'Immagine precedente',next:'Immagine successiva',slide:'Immagine',of:'di'}};
 const labels=()=>{const words=translations[document.documentElement.lang]||translations.en;hero.querySelector('[data-hero-step="-1"]').setAttribute('aria-label',words.previous);hero.querySelector('[data-hero-step="1"]').setAttribute('aria-label',words.next);dots.forEach((dot,index)=>dot.setAttribute('aria-label',`${words.slide} ${index+1} ${words.of} ${images.length}`));status.textContent=`${words.slide} ${active+1} ${words.of} ${images.length}`;};
 const select=async index=>{
  target=(index+images.length)%images.length;const next=target,ticket=++request,image=images[next];
  try{await image.decode();}catch{if(!image.complete||!image.naturalWidth){if(ticket===request)target=active;return;}}
  if(ticket!==request)return;
  image.setAttribute('data-image-ready','');active=next;
  images.forEach((node,index)=>{node.classList.toggle('is-active',index===active);node.setAttribute('aria-hidden',String(index!==active));});
  dots.forEach((dot,index)=>dot.setAttribute('aria-current',String(index===active)));labels();
 };
 hero.querySelectorAll('[data-hero-step]').forEach(button=>button.addEventListener('click',()=>select(target+Number(button.dataset.heroStep))));
 dots.forEach(dot=>dot.addEventListener('click',()=>select(Number(dot.dataset.heroSlide))));
 hero.addEventListener('pointerdown',event=>{
  if(!event.isPrimary){gesture=null;return;}
  if(!mobile.matches||event.button!==0||event.target.closest('a,button,input,select'))return;
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,dragging:false};
 });
 hero.addEventListener('pointermove',event=>{
  if(!gesture||event.pointerId!==gesture.id)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(!gesture.dragging){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){gesture=null;return;}if(Math.abs(dx)<10)return;gesture.dragging=true;hero.setPointerCapture(event.pointerId);}
 });
 hero.addEventListener('pointerup',event=>{
  if(!gesture||event.pointerId!==gesture.id)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y,dragging=gesture.dragging;gesture=null;
  if(dragging&&Math.abs(dx)>=Math.max(44,hero.clientWidth*.12)&&Math.abs(dx)>Math.abs(dy))select(target+(dx<0?1:-1)*(document.documentElement.dir==='rtl'?-1:1));
 });
 hero.addEventListener('pointercancel',()=>{gesture=null;});
 // A touch starts with implicit capture on a child. Moving capture to the
 // hero emits a bubbling lostpointercapture on that child, not a cancelled drag.
 hero.addEventListener('lostpointercapture',event=>{if(event.target===hero&&event.pointerId===gesture?.id)gesture=null;});
 labels();new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 hero.classList.add('hero-slider-ready');
}
