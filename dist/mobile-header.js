// The compact selector delegates to the store's existing language action.
const selector=document.querySelector('#mobile-language');
if(selector){
 const labels={fa:'زبان سایت',en:'Site language',it:'Lingua del sito'};
 const sync=()=>{selector.value=document.documentElement.lang;selector.setAttribute('aria-label',labels[selector.value]||labels.en);};
 sync();
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 selector.addEventListener('change',()=>document.querySelector('.languages [data-lang="'+selector.value+'"]').click());
 document.querySelector('header#home')?.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&document.querySelector('header#home').classList.contains('menu-open')){
   const toggle=document.querySelector('#menu-toggle');toggle.click();toggle.focus();
  }
 });
}
