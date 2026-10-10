window.PersiaAuth={user:null,googleEnabled:false,available:false,async request(path,{method='GET',body}={}){const response=await fetch(path,{method,credentials:'same-origin',signal:AbortSignal.timeout(10000),headers:{...(body?{'Content-Type':'application/json'}:{}),...(this.user?{'X-Persia-User':this.user.id}:{})},body:body?JSON.stringify(body):undefined});let data;try{data=await response.json();}catch{throw Object.assign(new Error('unavailable'),{code:'unavailable'});}if(!response.ok)throw Object.assign(new Error(data.error||'serverError'),{code:data.error||'serverError',status:response.status});return data;},async initialize(){try{const data=await this.request('/api/auth/session');this.user=data.user;this.googleEnabled=data.googleEnabled;this.available=true;}catch{} }};
await window.PersiaAuth.initialize();
window.PersiaAuth.signalChange=()=>{try{localStorage.setItem('persia.auth.change',Date.now()+'.'+Math.random());}catch{}document.dispatchEvent(new CustomEvent('persia:auth'));};
window.addEventListener('storage',event=>{if(event.key==='persia.auth.change')location.reload();});
let sessionCheck=false;
window.addEventListener('focus',async()=>{if(sessionCheck)return;sessionCheck=true;try{const data=await window.PersiaAuth.request('/api/auth/session');if((data.user?.id||null)!==(window.PersiaAuth.user?.id||null))location.reload();}catch{}finally{sessionCheck=false;}});
async function loadScript(src){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script);});}
try{const data=await window.PersiaAuth.request('/api/catalogue');window.PersiaCatalogue=data.products;window.PersiaCatalogueRevision=data.revision;}catch{window.PersiaCatalogue=window.PersiaInitialCatalogue?.products||[];window.PersiaCatalogueRevision=window.PersiaInitialCatalogue?.revision;}
window.PersiaCopy=await (await fetch('/store-copy.json')).json();
window.PersiaComments=await import('./comments.js?v=1');
await loadScript('/app.js?v=comments-1');
await loadScript('account.js?v=seo-1');
