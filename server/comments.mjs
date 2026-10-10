import {DatabaseSync} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
export function createComments({database,origin,identify,authorize,resolveTarget}){
 const db=new DatabaseSync(database);
 db.exec(`PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS comments(id TEXT PRIMARY KEY,kind TEXT NOT NULL,target TEXT NOT NULL,user_id TEXT NOT NULL,author TEXT NOT NULL,body TEXT NOT NULL,rating INTEGER,language TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',reply TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,request_id TEXT NOT NULL,UNIQUE(user_id,request_id));
 CREATE INDEX IF NOT EXISTS comments_thread ON comments(kind,target,status,created_at);
 CREATE INDEX IF NOT EXISTS comments_user_time ON comments(user_id,created_at);`);
 const fail=(code,status)=>{throw Object.assign(new Error(code),{code,status});};
 const send=(res,status,data)=>res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex,nofollow'}).end(JSON.stringify(data));
 const clean=s=>s.replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').trim();
 const publicRow=r=>({id:r.id,author:r.author,body:r.body,rating:r.rating,language:r.language,reply:r.reply,createdAt:r.created_at});
 const pageInfo=url=>{const page=Number(url.searchParams.get('page')||1);if(!Number.isSafeInteger(page)||page<1||page>10000)fail('invalidData',400);return {page,offset:(page-1)*20};};
 const thread=(kind,target,page=1)=>{const total=db.prepare("SELECT count(*) n FROM comments WHERE kind=? AND target=? AND status='approved'").get(kind,target).n;return {items:db.prepare("SELECT * FROM comments WHERE kind=? AND target=? AND status='approved' ORDER BY created_at DESC,id DESC LIMIT 20 OFFSET ?").all(kind,target,(page-1)*20).map(publicRow),total,page,pages:Math.ceil(total/20)};};
 async function body(req){if(!String(req.headers['content-type']||'').startsWith('application/json'))fail('contentType',415);let size=0,parts=[];for await(const chunk of req){size+=chunk.length;if(size>16384)fail('tooLarge',413);parts.push(chunk);}try{const value=JSON.parse(Buffer.concat(parts).toString());if(!value||typeof value!=='object'||Array.isArray(value))fail('invalidData',400);return value;}catch(error){fail(error.code||'invalidData',400);}}
 const adminRow=r=>({...publicRow(r),kind:r.kind,target:r.target,status:r.status,version:r.version,updatedAt:r.updated_at,targetTitle:resolveTarget(r.kind,r.target)?.title||r.target});
 async function handle(req,res,url){
  if(url.pathname!=='/api/comments'&&!url.pathname.startsWith('/api/admin/comments'))return false;
  try{
   if(req.headers.host!==new URL(origin).host||req.headers['sec-fetch-site']==='cross-site'||(!['GET','HEAD'].includes(req.method)&&req.headers.origin!==origin))fail('origin',403);
   if(url.pathname.startsWith('/api/admin/comments')){
    authorize(req);
    if(url.pathname==='/api/admin/comments'&&req.method==='GET'){
     const status=url.searchParams.get('status')||'pending';if(!['all','pending','approved','rejected'].includes(status))fail('invalidData',400);
     const {page,offset}=pageInfo(url),where=status==='all'?'':' WHERE status=?',args=status==='all'?[]:[status];
     const total=db.prepare('SELECT count(*) n FROM comments'+where).get(...args).n;
     send(res,200,{items:db.prepare('SELECT * FROM comments'+where+' ORDER BY created_at DESC,id DESC LIMIT 20 OFFSET ?').all(...args,offset).map(adminRow),total,page,pages:Math.ceil(total/20),pending:db.prepare("SELECT count(*) n FROM comments WHERE status='pending'").get().n});return true;
    }
    const match=url.pathname.match(/^\/api\/admin\/comments\/([a-f0-9-]{36})$/);
    if(match&&req.method==='PUT'){
     const b=await body(req),row=db.prepare('SELECT * FROM comments WHERE id=?').get(match[1]);if(!row)fail('notFound',404);
     if(!Number.isInteger(b.version)||b.version!==row.version)fail('conflict',409);
     if(!['pending','approved','rejected'].includes(b.status)||typeof b.reply!=='string'||b.reply.length>2000)fail('invalidData',400);
     const reply=clean(b.reply),now=new Date().toISOString();
     const result=db.prepare('UPDATE comments SET status=?,reply=?,updated_at=?,version=version+1 WHERE id=? AND version=?').run(b.status,reply,now,row.id,b.version);if(!result.changes)fail('conflict',409);
     send(res,200,{item:adminRow(db.prepare('SELECT * FROM comments WHERE id=?').get(row.id))});return true;
    }
    fail('notFound',404);
   }
   if(!['GET','POST'].includes(req.method))fail('method',405);
   if(req.method==='GET'){
    const kind=url.searchParams.get('kind'),target=url.searchParams.get('target');if(!resolveTarget(kind,target))fail('notFound',404);
    const user=identify(req),{page}=pageInfo(url);
    const mine=user?db.prepare("SELECT * FROM comments WHERE user_id=? AND kind=? AND target=? AND status!='approved' ORDER BY created_at DESC LIMIT 10").all(user.id,kind,target).map(r=>({...publicRow(r),status:r.status})):[];
    send(res,200,{...thread(kind,target,page),mine});return true;
   }
   const user=identify(req);if(!user)fail('sessionExpired',401);if(req.headers['x-persia-user']&&req.headers['x-persia-user']!==user.id)fail('accountChanged',401);
   const b=await body(req);if(!resolveTarget(b.kind,b.target))fail('notFound',404);
   if(typeof b.body!=='string'||b.body.length>3000||!['fa','it','en'].includes(b.language)||typeof b.requestId!=='string'||!/^[a-f0-9-]{36}$/.test(b.requestId))fail('invalidData',400);
   const text=clean(b.body);if(text.length<5)fail('invalidData',400);
   const rating=b.rating??null;if(rating!==null&&(b.kind!=='product'||!Number.isInteger(rating)||rating<1||rating>5))fail('invalidData',400);
   const existing=db.prepare('SELECT * FROM comments WHERE user_id=? AND request_id=?').get(user.id,b.requestId);
   if(existing){if(existing.kind!==b.kind||existing.target!==b.target||existing.body!==text||existing.rating!==rating)fail('conflict',409);send(res,200,{item:{...publicRow(existing),status:existing.status}});return true;}
   if(db.prepare('SELECT count(*) n FROM comments WHERE user_id=? AND created_at>?').get(user.id,new Date(Date.now()-3600000).toISOString()).n>=10)fail('rateLimit',429);
   if(db.prepare('SELECT 1 FROM comments WHERE user_id=? AND created_at>?').get(user.id,new Date(Date.now()-30000).toISOString()))fail('rateLimit',429);
   const id=randomUUID(),now=new Date().toISOString();db.prepare('INSERT INTO comments(id,kind,target,user_id,author,body,rating,language,created_at,updated_at,request_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,b.kind,b.target,user.id,user.name,text,rating,b.language,now,now,b.requestId);
   send(res,201,{item:{id,status:'pending'}});return true;
  }catch(error){send(res,error.status||500,{error:error.code||'serverError'});return true;}
 }
 return {handle,thread,close:()=>db.close()};
}
