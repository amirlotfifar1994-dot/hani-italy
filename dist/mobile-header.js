// The compact selector delegates to the store's existing language action.
// Navigation must work before slower catalogue/authentication requests finish.
const header=document.querySelector('header#home'),menu=document.querySelector('#menu-toggle');
menu?.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));});
const selector=document.querySelector('#mobile-language');
if(selector){
 const labels={fa:'زبان سایت',en:'Site language',it:'Lingua del sito'};
 const sync=()=>{selector.value=document.documentElement.lang;selector.setAttribute('aria-label',labels[selector.value]||labels.en);};
 sync();
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 selector.addEventListener('change',()=>{
  if(window.PersiaStoreReady)document.querySelector('.languages [data-lang="'+selector.value+'"]').click();
  else {const url=new URL(location.href);url.searchParams.set('lang',selector.value);location.assign(url);}
 });
 document.querySelector('header#home')?.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&document.querySelector('header#home').classList.contains('menu-open')){
   const toggle=document.querySelector('#menu-toggle');toggle.click();toggle.focus();
  }
 });
}
