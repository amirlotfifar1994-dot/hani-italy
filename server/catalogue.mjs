import {DatabaseSync} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import {validateOffer,offerPrice} from './offers.mjs';
const require=createRequire(import.meta.url);
const sharp=require(require.resolve('sharp',{paths:[fileURLToPath(new URL('..',import.meta.url)),path.dirname(process.execPath)]}));
sharp.block({operation:['VipsForeignLoadSvg']});
const categories=['stews','meals','pantry','desserts','rice','spices','nuts','tea','other'];
const failure=(status,code)=>Object.assign(new Error(code),{status,code});
const string=(value,max,required=false)=>{if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw failure(400,'invalidProduct');return value.trim();};
const translated=(value,max,required=false)=>{if(!Array.isArray(value)||value.length!==3)throw failure(400,'invalidProduct');const values=value.map(v=>string(v,max));const fallback=values.find(Boolean)||'';if(required&&!fallback)throw failure(400,'invalidProduct');return values.map(v=>v||fallback);};
export async function createCatalogue({database,uploadDir,seed,authorize,origin}){
 await fs.mkdir(uploadDir,{recursive:true,mode:0o700});
 const db=new DatabaseSync(database);db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS catalogue (id TEXT PRIMARY KEY,data TEXT NOT NULL,version INTEGER NOT NULL,updated_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS catalogue_meta (id INTEGER PRIMARY KEY CHECK(id=1),revision INTEGER NOT NULL); INSERT OR IGNORE INTO catalogue_meta VALUES(1,1); CREATE TABLE IF NOT EXISTS catalogue_media (key TEXT PRIMARY KEY,width INTEGER NOT NULL,height INTEGER NOT NULL,created_at TEXT NOT NULL);');
 if(!db.prepare('PRAGMA table_info(catalogue_media)').all().some(c=>c.name==='bytes'))db.exec('ALTER TABLE catalogue_media ADD COLUMN bytes INTEGER NOT NULL DEFAULT 0');
 for(const media of db.prepare('SELECT key FROM catalogue_media WHERE bytes=0').all()){const info=await fs.stat(path.join(uploadDir,media.key)).catch(()=>null);if(info)db.prepare('UPDATE catalogue_media SET bytes=? WHERE key=?').run(info.size,media.key);}
 db.exec('CREATE TABLE IF NOT EXISTS catalogue_settings (id INTEGER PRIMARY KEY CHECK(id=1),data TEXT NOT NULL,version INTEGER NOT NULL);');
 db.prepare('INSERT OR IGNORE INTO catalogue_settings VALUES(1,?,1)').run(JSON.stringify({hideOutOfStock:false}));
 const settingsRecord=()=>db.prepare('SELECT * FROM catalogue_settings WHERE id=1').get();
 const settingsData=()=>{const record=settingsRecord();return {settings:JSON.parse(record.data),settingsVersion:record.version};};
 const insert=db.prepare('INSERT OR IGNORE INTO catalogue VALUES(?,?,1,?)');db.exec('BEGIN');try{let changed=0;for(const p of seed){changed+=Number(insert.run(p.id,JSON.stringify({...p,status:p.status||'published',stock:p.stock??null,version:1}),new Date().toISOString()).changes);const row=db.prepare('SELECT data FROM catalogue WHERE id=?').get(p.id),current=JSON.parse(row.data);if(p.packaging&&!current.packaging&&current.sourceUrl===p.sourceUrl&&current.weight===p.weight){db.prepare('UPDATE catalogue SET data=?,version=version+1,updated_at=? WHERE id=?').run(JSON.stringify({...current,packaging:p.packaging,familyId:p.familyId||p.id}),new Date().toISOString(),p.id);changed++;}}if(changed)db.prepare('UPDATE catalogue_meta SET revision=revision+1 WHERE id=1').run();db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 const seedImages=new Set(seed.map(p=>p.image));seedImages.add('assets/product-placeholder.svg');
 const revision=()=>db.prepare('SELECT revision FROM catalogue_meta WHERE id=1').get().revision;
 const all=()=>db.prepare('SELECT * FROM catalogue ORDER BY rowid').all().map(r=>({...JSON.parse(r.data),version:r.version,updatedAt:r.updated_at}));
 const send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}).end(JSON.stringify(data));};
 async function bytes(req,max){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>max)throw failure(413,'tooLarge');chunks.push(chunk);}return Buffer.concat(chunks);}
 async function body(req){if(!String(req.headers['content-type']||'').startsWith('application/json'))throw failure(415,'contentType');try{const data=JSON.parse((await bytes(req,65536)).toString('utf8'));if(!data||typeof data!=='object'||Array.isArray(data))throw failure(400,'invalidProduct');return data;}catch(e){if(e.status)throw e;throw failure(400,'invalidProduct');}}
 function validate(input,id,previous){
  if(!input||typeof input!=='object'||Array.isArray(input))throw failure(400,'invalidProduct');
  const name=translated(input.name,160,true),ingredients=translated(input.ingredients,2000),description=translated(input.description,3000);
  const brand=string(input.brand??'',80),sku=string(input.sku??'',80)||id.toUpperCase();
  if(!categories.includes(input.category)||!['g','ml','pcs'].includes(input.unit)||!['draft','published','archived'].includes(input.status)||!Number.isFinite(input.weight)||input.weight<=0||input.weight>1000000||(input.cents!==null&&(!Number.isInteger(input.cents)||input.cents<1||input.cents>1000000))||(input.stock!==null&&(!Number.isInteger(input.stock)||input.stock<0||input.stock>1000000)))throw failure(400,'invalidProduct');
  const image=string(input.image||'assets/product-placeholder.svg',200);
  if(!seedImages.has(image)){const match=image.match(/^\/media\/([a-f0-9-]{36}\.webp)$/);if(!match||!db.prepare('SELECT 1 FROM catalogue_media WHERE key=?').get(match[1]))throw failure(400,'invalidImage');}
  let sourceUrl=string(input.sourceUrl||'',1000);if(sourceUrl){try{const url=new URL(sourceUrl);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error();sourceUrl=url.href;}catch{throw failure(400,'invalidProduct');}}
  const compareAtCents=input.compareAtCents??null;
  const stockPending=(input.stockPending??previous?.stockPending??false)===true&&input.stock===null;
  const wasHeld=previous?.publicationHold===true||input.publicationHold===true;
  const publicationHold=wasHeld&&!(input.releasePublicationHold===true&&input.meatless===true);
  if(publicationHold&&input.status==='published')throw failure(400,'publicationHold');
  const packaging=input.packaging??previous?.packaging??null;if(packaging!==null&&!['aluminium','tinplate'].includes(packaging))throw failure(400,'invalidProduct');
  const dailyOffer=validateOffer(input.dailyOffer??previous?.dailyOffer??null);
  if((compareAtCents!==null||dailyOffer!==null)&&(!Number.isInteger(input.cents)||input.cents<1))throw failure(400,'priceRequired');
  if(compareAtCents!==null&&(!Number.isInteger(compareAtCents)||compareAtCents<=input.cents||compareAtCents>1000000))throw failure(400,'invalidDiscount');
  if((input.seoTitle!==undefined&&!Array.isArray(input.seoTitle))||(input.seoDescription!==undefined&&!Array.isArray(input.seoDescription)))throw failure(400,'invalidProduct');
  const seoTitle=(input.seoTitle??['','','']).map(v=>string(v,100)),seoDescription=(input.seoDescription??['','','']).map(v=>string(v,320));
  if(seoTitle.length!==3||seoDescription.length!==3)throw failure(400,'invalidProduct');
  const example=input.example===true,meatless=input.meatless===true;
  return {id,name,ingredients,description,brand:brand||null,sku,category:input.category,unit:input.unit,weight:input.weight,cents:input.cents,compareAtCents,dailyOffer,packaging,stockPending,publicationHold,publicationHoldReason:publicationHold?(previous?.publicationHoldReason||input.publicationHoldReason||'Confirm the meatless pack before publication.'):null,...(previous?.familyId?{familyId:previous.familyId}:{}),...(previous?.guideProductId?{guideProductId:previous.guideProductId}:{}),...(previous?.assortmentSource?{assortmentSource:previous.assortmentSource,assortmentRow:previous.assortmentRow}:{}),seoTitle,seoDescription,stock:input.stock,status:input.status,image,sourceUrl,example,meatless,managed:true,...(previous?.slug?{slug:previous.slug}:{}),...(example&&Number.isInteger(previous?.sprite)&&image===previous.image?{sprite:previous.sprite}:{})};
 }
 function publicProducts(){const {settings}=settingsData(),now=new Date();return all().filter(p=>p.status==='published'&&!p.publicationHold&&(!settings.hideOutOfStock||(p.stock!==0&&!p.stockPending))).map(p=>offerPrice(p,now));}
 let imageJobs=0;const uploadLimits=new Map();
 async function handle(req,res,url){
  if(url.pathname.startsWith('/media/')){
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return true;}
   const key=url.pathname.slice(7);if(!/^[a-f0-9-]{36}\.webp$/.test(key)||!db.prepare('SELECT 1 FROM catalogue_media WHERE key=?').get(key)){res.writeHead(404).end();return true;}
   try{const data=await fs.readFile(path.join(uploadDir,key));res.writeHead(200,{'Content-Type':'image/webp','Content-Length':data.length,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}).end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404).end();}return true;
  }
  if(url.pathname==='/api/catalogue'&&req.method==='GET'){send(res,200,{products:publicProducts(),revision:revision(),...settingsData()});return true;}
  if(!url.pathname.startsWith('/api/admin/'))return false;
  try{
   const user=authorize(req);
   if(url.pathname==='/api/admin/products'&&req.method==='GET'){send(res,200,{products:all(),revision:revision(),user,...settingsData()});return true;}
   const quick=url.pathname.match(/^\/api\/admin\/products\/([a-zA-Z0-9-]{1,80})\/(price|offer|stock)$/);
   if(quick&&req.method==='PUT'){
    const data=await body(req);if(!Number.isInteger(data.version))throw failure(400,'invalidProduct');
    if(quick[2]==='price'&&(!Number.isInteger(data.cents)||data.cents<1||data.cents>1000000))throw failure(400,'invalidProduct');
    if(quick[2]==='offer')validateOffer(data.offer);
    if(quick[2]==='stock'&&data.stock!==null&&(!Number.isInteger(data.stock)||data.stock<0||data.stock>1000000))throw failure(400,'invalidProduct');
    let product,version,updatedAt=new Date().toISOString();
    db.exec('BEGIN IMMEDIATE');try{
     const record=db.prepare('SELECT * FROM catalogue WHERE id=?').get(quick[1]);if(!record)throw failure(404,'notFound');if(record.version!==data.version)throw failure(409,'conflict');
     const previous=JSON.parse(record.data),input={...previous,...(quick[2]==='price'?{cents:data.cents}:quick[2]==='stock'?{stock:data.stock,stockPending:false}:{dailyOffer:data.offer})};
     if(quick[2]==='price'&&input.compareAtCents!==null&&input.compareAtCents!==undefined&&input.compareAtCents<=input.cents)throw failure(400,'invalidDiscount');
     product=validate(input,quick[1],previous);
     // null explicitly removes a campaign rather than falling back to the old value.
     if(quick[2]==='offer')product.dailyOffer=validateOffer(data.offer);
     version=record.version+1;db.prepare('UPDATE catalogue SET data=?,version=?,updated_at=? WHERE id=?').run(JSON.stringify(product),version,updatedAt,quick[1]);db.prepare('UPDATE catalogue_meta SET revision=revision+1 WHERE id=1').run();db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e;}
    send(res,200,{product:{...product,version,updatedAt},revision:revision()});return true;
   }
   if(url.pathname==='/api/admin/settings'&&req.method==='GET'){send(res,200,{...settingsData(),revision:revision()});return true;}
   if(url.pathname==='/api/admin/settings'&&req.method==='PUT'){
    const data=await body(req),settings=data.settings;
    if(!settings||typeof settings!=='object'||Array.isArray(settings)||Object.keys(settings).length!==1||typeof settings.hideOutOfStock!=='boolean'||!Number.isInteger(data.version))throw failure(400,'invalidData');
    db.exec('BEGIN IMMEDIATE');try{
     const record=settingsRecord();if(record.version!==data.version)throw failure(409,'settingsConflict');
     db.prepare('UPDATE catalogue_settings SET data=?,version=version+1 WHERE id=1').run(JSON.stringify({hideOutOfStock:settings.hideOutOfStock}));
     db.prepare('UPDATE catalogue_meta SET revision=revision+1 WHERE id=1').run();db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e;}
    send(res,200,{...settingsData(),revision:revision()});return true;
   }
   if(url.pathname==='/api/admin/uploads'&&req.method==='POST'){
    const now=Date.now(),entry=uploadLimits.get(user.id)||{count:0,until:now+60000};if(entry.until<now){entry.count=0;entry.until=now+60000;}entry.count++;uploadLimits.set(user.id,entry);if(entry.count>20)throw failure(429,'rateLimit');
    const type=String(req.headers['content-type']||'').split(';')[0];if(!['image/jpeg','image/png','image/webp'].includes(type))throw failure(415,'imageType');
    if(Number(req.headers['content-length'])>5*1024*1024)throw failure(413,'tooLarge');if(imageJobs>=2)throw failure(503,'busy');imageJobs++;
    try{const input=await bytes(req,5*1024*1024);if(!input.length)throw failure(400,'invalidImage');
     const detected=input.length>=8&&input.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':input.length>=3&&input[0]===255&&input[1]===216&&input[2]===255?'image/jpeg':input.length>=12&&input.toString('ascii',0,4)==='RIFF'&&input.toString('ascii',8,12)==='WEBP'?'image/webp':null;
     if(detected!==type)throw failure(400,'invalidImage');
     let output;try{const metadata=await sharp(input,{limitInputPixels:20000000,animated:false}).metadata();if(!['jpeg','png','webp'].includes(metadata.format)||(metadata.pages||1)>1)throw Error();output=await sharp(input,{limitInputPixels:20000000}).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer({resolveWithObject:true});}catch{throw failure(400,'invalidImage');}
     const used=db.prepare('SELECT coalesce(sum(bytes),0) n FROM catalogue_media').get().n;if(used+output.data.length>200*1024*1024)throw failure(413,'uploadQuota');
     const key=randomUUID()+'.webp';await fs.writeFile(path.join(uploadDir,key),output.data,{flag:'wx',mode:0o600});try{db.prepare('INSERT INTO catalogue_media(key,width,height,created_at,bytes) VALUES(?,?,?,?,?)').run(key,output.info.width,output.info.height,new Date().toISOString(),output.data.length);}catch(error){await fs.unlink(path.join(uploadDir,key));throw error;}send(res,201,{image:'/media/'+key,width:output.info.width,height:output.info.height,bytes:output.data.length});
    }finally{imageJobs--;}return true;
   }
   if(url.pathname==='/api/admin/products/bulk'&&req.method==='POST'){
    const data=await body(req),items=data.items,change=data.change;
    if(!Array.isArray(items)||!items.length||items.length>100||new Set(items.map(p=>p?.id)).size!==items.length||items.some(p=>!p||typeof p.id!=='string'||!Number.isInteger(p.version)||p.version<1)||!change||typeof change!=='object'||Array.isArray(change))throw failure(400,'invalidProduct');
    const keys=Object.keys(change);if(keys.length!==1||!['status','stock','discountPercent','removeDiscount'].includes(keys[0]))throw failure(400,'invalidProduct');
    if('status' in change&&!['draft','published','archived'].includes(change.status))throw failure(400,'invalidProduct');
    if('stock' in change&&change.stock!==null&&(!Number.isInteger(change.stock)||change.stock<0||change.stock>1000000))throw failure(400,'invalidProduct');
    if('discountPercent' in change&&(!Number.isInteger(change.discountPercent)||change.discountPercent<1||change.discountPercent>90))throw failure(400,'invalidDiscount');
    if('removeDiscount' in change&&change.removeDiscount!==true)throw failure(400,'invalidDiscount');
    const updatedAt=new Date().toISOString(),updated=[];
    db.exec('BEGIN IMMEDIATE');try{
     for(const item of items){
      const record=db.prepare('SELECT * FROM catalogue WHERE id=?').get(item.id);if(!record)throw failure(404,'notFound');if(record.version!==item.version)throw failure(409,'conflict');
      const previous=JSON.parse(record.data),input={...previous,...('status' in change?{status:change.status}:{}),...('stock' in change?{stock:change.stock}:{})};
      if('stock' in change)input.stockPending=false;
      if('discountPercent' in change){if(!Number.isInteger(previous.cents)||previous.cents<1)throw failure(400,'priceRequired');const reference=previous.compareAtCents||previous.cents;input.compareAtCents=reference;input.cents=Math.max(1,Math.round(reference*(100-change.discountPercent)/100));}
      if(change.removeDiscount){input.cents=previous.compareAtCents||previous.cents;input.compareAtCents=null;}
      const product=validate(input,item.id,previous),version=record.version+1;
      db.prepare('UPDATE catalogue SET data=?,version=?,updated_at=? WHERE id=?').run(JSON.stringify(product),version,updatedAt,item.id);updated.push({...product,version,updatedAt});
     }
     db.prepare('UPDATE catalogue_meta SET revision=revision+1 WHERE id=1').run();db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e;}
    send(res,200,{products:updated,revision:revision()});return true;
   }
   const match=url.pathname.match(/^\/api\/admin\/products\/([a-zA-Z0-9-]{1,80})$/);
   if((url.pathname==='/api/admin/products'&&req.method==='POST')||(match&&req.method==='PUT')){
    const data=await body(req),id=match?match[1]:'p-'+randomUUID();const record=match?db.prepare('SELECT * FROM catalogue WHERE id=?').get(id):null;
    if(match&&!record)throw failure(404,'notFound');if(record&&data.version!==record.version)throw failure(409,'conflict');
    const product=validate(data.product,id,record?JSON.parse(record.data):null);
    if(all().some(p=>p.id!==id&&(p.sku||p.id).toLocaleLowerCase()===product.sku.toLocaleLowerCase()))throw failure(409,'skuUsed');
    if(!record&&db.prepare('SELECT COUNT(*) AS n FROM catalogue').get().n>=5000)throw failure(400,'productLimit');
    const version=(record?.version||0)+1,updatedAt=new Date().toISOString();db.exec('BEGIN IMMEDIATE');try{if(record){const updated=db.prepare('UPDATE catalogue SET data=?,version=?,updated_at=? WHERE id=? AND version=?').run(JSON.stringify(product),version,updatedAt,id,record.version);if(!updated.changes)throw failure(409,'conflict');}else db.prepare('INSERT INTO catalogue VALUES(?,?,?,?)').run(id,JSON.stringify(product),version,updatedAt);db.prepare('UPDATE catalogue_meta SET revision=revision+1 WHERE id=1').run();db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
    send(res,record?200:201,{product:{...product,version,updatedAt},revision:revision()});return true;
   }
   send(res,404,{error:'notFound'});return true;
  }catch(e){send(res,e.status||500,{error:e.code||'serverError'});return true;}
 }
 return {handle,publicProducts,settingsData,revision,close:()=>db.close()};
}
