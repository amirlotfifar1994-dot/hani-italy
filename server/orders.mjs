import {DatabaseSync} from 'node:sqlite';
import {createHash,randomUUID} from 'node:crypto';

const failure=(status,code)=>Object.assign(Error(code),{status,code});
const send=(res,status,data)=>res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}).end(JSON.stringify(data));
export function createOrders({database,origin,products,identify,authorize,allowRequest=()=>true,audit=()=>{},communications}){
 const db=new DatabaseSync(database);
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS store_orders(id TEXT PRIMARY KEY,request_key TEXT UNIQUE NOT NULL,fingerprint TEXT NOT NULL,user_id TEXT,customer_email TEXT NOT NULL,city TEXT NOT NULL,postcode TEXT NOT NULL,lines TEXT NOT NULL,total_cents INTEGER NOT NULL,status TEXT NOT NULL CHECK(status IN ('demo','reviewed','cancelled')),version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS store_orders_created_idx ON store_orders(created_at DESC);`);
 async function body(req){if(!String(req.headers['content-type']||'').startsWith('application/json'))throw failure(415,'contentType');let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>16384)throw failure(413,'tooLarge');chunks.push(chunk);}try{const value=JSON.parse(Buffer.concat(chunks));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw failure(400,'invalidOrder');}}
 function sameOrigin(req){if(req.headers.host!==new URL(origin).host||req.headers['sec-fetch-site']==='cross-site'||(!['GET','HEAD'].includes(req.method)&&req.headers.origin!==origin))throw failure(403,'origin');}
 function customer(req){sameOrigin(req);const user=identify(req);if(req.headers['x-persia-user']&&req.headers['x-persia-user']!==user?.id)throw failure(401,'accountChanged');return user;}
 const present=row=>({id:row.id,ownerId:row.user_id,customerEmail:row.customer_email,city:row.city,postcode:row.postcode,lines:JSON.parse(row.lines),totalCents:row.total_cents,status:row.status,version:row.version,createdAt:row.created_at,updatedAt:row.updated_at,email:communications?.notificationStatus(row.id)||'unconfigured'});
 const receipt=row=>({id:row.id,status:row.status,createdAt:row.created_at,totalCents:row.total_cents,lines:JSON.parse(row.lines)});
 async function handle(req,res,url){
  if(!['/api/orders','/api/admin/orders'].includes(url.pathname)&&!/^\/api\/admin\/orders\/PM-DEMO-[A-F0-9]{8}$/.test(url.pathname))return false;
  try{
   if(url.pathname==='/api/orders'){
    const user=customer(req);
    if(req.method==='GET'){if(!user)throw failure(401,'sessionExpired');send(res,200,{orders:db.prepare('SELECT * FROM store_orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100').all(user.id).map(present)});return true;}
    if(req.method!=='POST')throw failure(405,'method');
    const input=await body(req);
    if(typeof input.key!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(input.key)||typeof input.city!=='string'||input.city.trim().length<2||input.city.length>80||/[\u0000-\u001f]/.test(input.city)||typeof input.postcode!=='string'||!/^\d{5}$/.test(input.postcode)||!Array.isArray(input.lines)||!input.lines.length||input.lines.length>40)throw failure(400,'invalidOrder');
    const seen=new Set();
    for(const line of input.lines){if(!line||typeof line.id!=='string'||!/^[a-z0-9-]{1,80}$/.test(line.id)||seen.has(line.id)||!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>99||!Number.isInteger(line.cents)||line.cents<1)throw failure(400,'invalidOrder');seen.add(line.id);}
    const fingerprint=createHash('sha256').update(JSON.stringify({userId:user?.id||null,city:input.city.trim(),postcode:input.postcode,lines:input.lines.map(({id,quantity,cents})=>({id,quantity,cents})).sort((a,b)=>a.id.localeCompare(b.id))})).digest('hex');
    let row=db.prepare('SELECT * FROM store_orders WHERE request_key=?').get(input.key);
    if(row){if(row.fingerprint!==fingerprint)throw failure(409,'orderChanged');communications?.enqueueOrder(present(row));send(res,200,{order:receipt(row)});return true;}
    if(!allowRequest(req))throw failure(429,'rateLimit');
    const current=new Map(products().map(p=>[p.id,p])),lines=[];let total=0;
    for(const line of input.lines){const p=current.get(line.id);if(!p||p.publicationHold||p.stockPending||!Number.isInteger(p.cents)||p.cents<1||p.cents!==line.cents||line.quantity>(p.stock??99))throw failure(409,'catalogueChanged');total+=p.cents*line.quantity;if(!Number.isSafeInteger(total)||total>100000000)throw failure(400,'invalidOrder');lines.push({id:p.id,name:p.name,sku:p.sku||p.id,quantity:line.quantity,cents:p.cents});}
    const id='PM-DEMO-'+randomUUID().replaceAll('-','').slice(0,8).toUpperCase(),now=new Date().toISOString();
    db.exec('BEGIN IMMEDIATE');try{db.prepare('INSERT INTO store_orders VALUES(?,?,?,?,?,?,?,?,?,?,1,?,?)').run(id,input.key,fingerprint,user?.id||null,user?.email||'',input.city.trim(),input.postcode,JSON.stringify(lines),total,'demo',now,now);db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}
    row=db.prepare('SELECT * FROM store_orders WHERE id=?').get(id);communications?.enqueueOrder(present(row));audit('order.demo_created',user?.id||null,id);send(res,201,{order:receipt(row)});return true;
   }
   const admin=authorize(req);
   if(url.pathname==='/api/admin/orders'&&req.method==='GET'){
    const query=(url.searchParams.get('q')||'').trim().slice(0,80),status=url.searchParams.get('status')||'all';let page=Math.max(1,Math.min(100000,Number(url.searchParams.get('page'))||1));if(!['all','demo','reviewed','cancelled'].includes(status)||!Number.isInteger(page))throw failure(400,'invalidOrder');
    const where=[],args=[];if(status!=='all'){where.push('status=?');args.push(status);}if(query){where.push('(id LIKE ? OR city LIKE ? OR postcode LIKE ? OR customer_email LIKE ?)');args.push(...Array(4).fill('%'+query.replace(/[\\%_]/g,'')+'%'));}
    const clause=where.length?' WHERE '+where.join(' AND '):'',total=db.prepare('SELECT COUNT(*) count FROM store_orders'+clause).get(...args).count;
    page=Math.min(page,Math.max(1,Math.ceil(total/25)));
    const orders=db.prepare('SELECT * FROM store_orders'+clause+' ORDER BY created_at DESC,rowid DESC LIMIT 25 OFFSET ?').all(...args,(page-1)*25).map(present);
    const counts=db.prepare("SELECT COUNT(*) total,COALESCE(SUM(status='demo'),0) demo,COALESCE(SUM(status='reviewed'),0) reviewed,COALESCE(SUM(status='cancelled'),0) cancelled FROM store_orders").get();
    send(res,200,{orders,counts,total,page,pages:Math.max(1,Math.ceil(total/25))});return true;
   }
   if(req.method==='PATCH'&&url.pathname!=='/api/admin/orders'){
    const input=await body(req);if(!['reviewed','cancelled'].includes(input.status)||!Number.isInteger(input.version))throw failure(400,'invalidOrder');const id=url.pathname.split('/').at(-1),now=new Date().toISOString();
    const changed=db.prepare("UPDATE store_orders SET status=?,version=version+1,updated_at=? WHERE id=? AND version=? AND status='demo'").run(input.status,now,id,input.version);if(!changed.changes)throw failure(409,'orderChanged');audit('order.'+input.status,admin.id,id);send(res,200,{order:present(db.prepare('SELECT * FROM store_orders WHERE id=?').get(id))});return true;
   }
   throw failure(405,'method');
  }catch(error){send(res,error.status||500,{error:error.code||'serverError'});return true;}
 }
 return {handle,close:()=>db.close()};
}
