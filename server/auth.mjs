import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomUUID,createHash,scrypt,timingSafeEqual,createPublicKey,verify} from 'node:crypto';
import {promisify} from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import {securityStore} from './security.mjs';
const derive=promisify(scrypt), ttl=7*24*60*60*1000;
const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const digits=v=>v.replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
const emailOK=v=>typeof v==='string'&&v.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneValue=v=>digits(clean(v,40)).replace(/[\s()-]/g,'');
const phoneOK=v=>v===''||/^\+?[0-9]{7,15}$/.test(v);
const passwordOK=v=>typeof v==='string'&&v.length>=15&&v.length<=128;
const hashToken=v=>createHash('sha256').update(v).digest('hex');
const addressOK=a=>a&&typeof a.id==='string'&&/^[a-zA-Z0-9-]{1,40}$/.test(a.id)&&typeof a.label==='string'&&a.label.trim().length>0&&a.label.length<=40&&typeof a.recipient==='string'&&a.recipient.length<=80&&typeof a.street==='string'&&a.street.trim().length>0&&a.street.length<=160&&typeof a.city==='string'&&a.city.trim().length>=2&&a.city.length<=80&&typeof a.postcode==='string'&&/^[0-9]{5}$/.test(a.postcode);
async function passwordHash(password,salt=randomBytes(16).toString('hex')) {
 const result=await derive(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024});return {salt,hash:result.toString('hex')};
}
export function createAuth({database,origin,google={},fetchFn=fetch,adminSetupToken="",setupExpires=Infinity,requireAdminMfa=false,clientAddress=req=>req.socket.remoteAddress}) {
 if(database!==':memory:')fs.mkdirSync(path.dirname(database),{recursive:true});
 const db=new DatabaseSync(database);if(database!==':memory:'&&process.platform!=='win32')fs.chmodSync(database,0o600);db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
 db.exec('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,phone TEXT NOT NULL DEFAULT "",language TEXT NOT NULL DEFAULT "it",salt TEXT NOT NULL,password_hash TEXT NOT NULL,created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS address_books (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,data TEXT NOT NULL DEFAULT "[]",default_id TEXT NOT NULL DEFAULT "");');
 const cols=db.prepare('PRAGMA table_info(users)').all().map(c=>c.name);if(!cols.includes('email_verified'))db.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0');if(!cols.includes('google_sub'))db.exec('ALTER TABLE users ADD COLUMN google_sub TEXT');db.exec('CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub ON users(google_sub); CREATE TABLE IF NOT EXISTS oauth_pending (hash TEXT PRIMARY KEY,verifier TEXT NOT NULL,expires INTEGER NOT NULL)');
 const pendingCols=db.prepare("PRAGMA table_info(oauth_pending)").all().map(c=>c.name);if(!pendingCols.includes("link_user"))db.exec("ALTER TABLE oauth_pending ADD COLUMN link_user TEXT");
 if(!pendingCols.includes('link_session'))db.exec('ALTER TABLE oauth_pending ADD COLUMN link_session TEXT');
 if(!cols.includes('role'))db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'");
 const sessionColumns=db.prepare('PRAGMA table_info(sessions)').all().map(c=>c.name);
 for(const column of ['created','last_seen','mfa_verified'])if(!sessionColumns.includes(column))db.exec('ALTER TABLE sessions ADD COLUMN '+column+' INTEGER NOT NULL DEFAULT 0');
 const security=securityStore(db,{database});
 const setupRequired=()=>!db.prepare("SELECT 1 FROM users WHERE role='admin' LIMIT 1").get();
 const authorize=(req)=>{if(req.headers.host!==new URL(origin).host||(req.method!=='GET'&&req.method!=='HEAD'&&req.headers.origin!==origin)||req.headers['sec-fetch-site']==='cross-site')throw Object.assign(new Error(),{status:403,code:'origin'});const u=session(req);if(!u)throw Object.assign(new Error(),{status:401,code:'sessionExpired'});if(req.headers['x-persia-user']&&req.headers['x-persia-user']!==u.id)throw Object.assign(new Error(),{status:401,code:'accountChanged'});if(u.role!=='admin')throw Object.assign(new Error(),{status:403,code:'adminOnly'});if((requireAdminMfa||security.enabled(u.id))&&!u.mfa_verified)throw Object.assign(new Error(),{status:403,code:'mfaRequired'});return rowToUser(u);};
 const googleReady=!!google.clientId&&!!google.clientSecret;const redirectUri=origin+'/api/auth/google/callback';
 // Validate the identity assertion with Google's public keys, audience and one-time nonce.
 async function googleIdentity(idToken,nonce){
  if(typeof idToken!=='string'||idToken.length>16384)throw Error('Invalid identity token');
  const parts=idToken.split('.');if(parts.length!==3||parts.some(p=>!/^[-_A-Za-z0-9]+$/.test(p)))throw Error('Invalid identity token');
  const header=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'));
  const claims=JSON.parse(Buffer.from(parts[1],'base64url').toString('utf8'));
  if(header.alg!=='RS256'||typeof header.kid!=='string')throw Error('Invalid identity token');
  const keysResponse=await fetchFn('https://www.googleapis.com/oauth2/v3/certs',{signal:AbortSignal.timeout(10000),redirect:'error'});
  if(!keysResponse.ok)throw Error('Unavailable signing keys');const keys=await keysResponse.json();
  const jwk=keys.keys?.find(k=>k.kid===header.kid&&k.kty==='RSA'&&(!k.alg||k.alg==='RS256')&&(!k.use||k.use==='sig'));
  if(!jwk||!verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),createPublicKey({key:jwk,format:'jwk'}),Buffer.from(parts[2],'base64url')))throw Error('Invalid signature');
  const now=Math.floor(Date.now()/1000),audience=Array.isArray(claims.aud)?claims.aud:[claims.aud];
  if(!['https://accounts.google.com','accounts.google.com'].includes(claims.iss)||!audience.includes(google.clientId)||(claims.azp&&claims.azp!==google.clientId)||(audience.length>1&&claims.azp!==google.clientId)||!Number.isFinite(claims.exp)||claims.exp<=now||!Number.isFinite(claims.iat)||claims.iat>now+60||claims.nonce!==nonce||typeof claims.sub!=='string'||!claims.sub||claims.sub.length>255)throw Error('Invalid claims');
  return claims;
 }
 let inFlight=0;
 const cookieName=origin.startsWith('https:')?'__Host-persia_session':'persia_session';
 const rowToUser=u=>u?{id:u.id,email:u.email,name:u.name,phone:u.phone,language:u.language,createdAt:u.created_at,emailVerified:!!u.email_verified,hasPassword:!!u.password_hash,googleConnected:!!u.google_sub,role:u.role,mfaEnabled:security.enabled(u.id),mfaRequired:u.role==='admin'&&(requireAdminMfa||security.enabled(u.id))&&!u.mfa_verified}:null;
 const session=req=>{const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!token||!/^[A-Za-z0-9_-]{43}$/.test(token))return null;const u=db.prepare('SELECT u.*,s.hash AS session_hash,s.created AS session_created,s.last_seen,s.mfa_verified FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.hash=? AND s.expires>?').get(hashToken(token),Date.now());if(!u)return null;const idle=u.role==='admin'?1800000:86400000;if(!u.session_created||Date.now()-u.last_seen>idle||(u.role==='admin'&&Date.now()-u.session_created>28800000)){db.prepare('DELETE FROM sessions WHERE hash=?').run(u.session_hash);security.audit('session.expired',u.id);return null;}if(Date.now()-u.last_seen>60000)db.prepare('UPDATE sessions SET last_seen=? WHERE hash=?').run(Date.now(),u.session_hash);return u;};
 const send=(res,status,data,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow',...headers});res.end(JSON.stringify(data));};
 const cookie=(token,maxAge=ttl/1000)=>cookieName+'='+token+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+maxAge+(origin.startsWith('https:')?'; Secure':'');
 const issueSession=(u,verified=false)=>{const token=randomBytes(32).toString('base64url'),time=Date.now(),lifetime=u.role==='admin'?28800000:ttl;db.prepare('DELETE FROM sessions WHERE expires<=?').run(time);db.prepare('DELETE FROM sessions WHERE user_id=? AND hash NOT IN (SELECT hash FROM sessions WHERE user_id=? ORDER BY created DESC,rowid DESC LIMIT 4)').run(u.id,u.id);db.prepare('INSERT INTO sessions(hash,user_id,expires,created,last_seen,mfa_verified) VALUES(?,?,?,?,?,?)').run(hashToken(token),u.id,time+lifetime,time,time,verified?1:0);return {token,maxAge:lifetime/1000};};
 const newSession=(res,u,status=200,verified=false,extra={})=>{const issued=issueSession(u,verified);send(res,status,{user:rowToUser({...u,mfa_verified:verified?1:0}),...extra},{'Set-Cookie':cookie(issued.token,issued.maxAge)});};
 const throttle=(req,type)=>security.limit(type,clientAddress(req),type==='register'?8:20);
 async function body(req){if(!String(req.headers['content-type']||'').startsWith('application/json'))throw Object.assign(new Error(),{code:'contentType',status:415});let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>32768)throw Object.assign(new Error(),{code:'tooLarge',status:413});chunks.push(chunk);}try{const b=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!b||Array.isArray(b)||typeof b!=='object')throw Error();return b;}catch{throw Object.assign(new Error(),{code:'invalidData',status:400});}}
 async function hashWork(fn){if(inFlight>=2)throw Object.assign(new Error(),{code:'busy',status:503});inFlight++;try{return await fn();}finally{inFlight--;}}
 async function handle(req,res,url){
  if(!url.pathname.startsWith('/api/auth/')&&!url.pathname.startsWith('/api/account/')&&url.pathname!=='/api/admin/setup')return false;
  try {
   if(req.headers.host!==new URL(origin).host){send(res,403,{error:'origin'});return true;}
   if(url.pathname==='/api/auth/google/start'&&req.method==='GET'){
    if(!googleReady){send(res,503,{error:'googleSetup'});return true;}
    if(!throttle(req,'google')){send(res,429,{error:'rateLimit'});return true;}
    const signedIn=session(req);if(signedIn&&rowToUser(signedIn).mfaRequired){send(res,403,{error:'mfaRequired'});return true;}
    const state=randomBytes(32).toString('base64url'),verifier=randomBytes(32).toString('base64url');db.prepare('DELETE FROM oauth_pending WHERE expires<=?').run(Date.now());db.prepare('INSERT INTO oauth_pending(hash,verifier,expires,link_user,link_session) VALUES(?,?,?,?,?)').run(hashToken(state),verifier,Date.now()+10*60*1000,signedIn?.id||null,signedIn?.session_hash||null);
    const link=new URL('https://accounts.google.com/o/oauth2/v2/auth');link.search=new URLSearchParams({client_id:google.clientId,redirect_uri:redirectUri,response_type:'code',scope:'openid email profile',state,nonce:hashToken(state),code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256'});
    res.writeHead(302,{Location:link.href,'Cache-Control':'no-store','Set-Cookie':'persia_oauth='+state+'; Path=/api/auth/google; HttpOnly; SameSite=Lax; Max-Age=600'+(origin.startsWith('https:')?'; Secure':'')}).end();return true;
   }
   if(url.pathname==='/api/auth/google/callback'&&req.method==='GET'){
    const fail=()=>res.writeHead(302,{Location:'/?authError=googleFailed#account/overview','Cache-Control':'no-store','Set-Cookie':'persia_oauth=; Path=/api/auth/google; HttpOnly; SameSite=Lax; Max-Age=0'}).end();
    const state=url.searchParams.get('state')||'',cookieState=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('persia_oauth='))?.slice(13)||'';
    if(!googleReady||!/^[A-Za-z0-9_-]{43}$/.test(state)||state!==cookieState||url.searchParams.get('error')||!url.searchParams.get('code')){fail();return true;}
    const pending=db.prepare('SELECT * FROM oauth_pending WHERE hash=? AND expires>?').get(hashToken(state),Date.now());db.prepare('DELETE FROM oauth_pending WHERE hash=?').run(hashToken(state));if(!pending){fail();return true;}
    try {
     const tokenResponse=await fetchFn('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({code:url.searchParams.get('code'),client_id:google.clientId,client_secret:google.clientSecret,redirect_uri:redirectUri,grant_type:'authorization_code',code_verifier:pending.verifier}),signal:AbortSignal.timeout(10000),redirect:'error'});const tokens=await tokenResponse.json();if(!tokenResponse.ok||!tokens.id_token)throw Error();
     const info=await googleIdentity(tokens.id_token,hashToken(state));const email=clean(info.email,255).toLowerCase();if(!emailOK(email)||!(info.email_verified===true||info.email_verified==='true'))throw Error();
     if(pending.link_user){const linked=db.prepare('SELECT user_id,last_seen,created FROM sessions WHERE hash=? AND expires>?').get(pending.link_session,Date.now());if(!linked||linked.user_id!==pending.link_user||Date.now()-linked.last_seen>1800000)throw Error();}
     let user=db.prepare('SELECT * FROM users WHERE google_sub=?').get(info.sub);if(!user){user=db.prepare('SELECT * FROM users WHERE email=?').get(email);if(user?.google_sub&&user.google_sub!==info.sub)throw Error();if(user){if(user.id!==pending.link_user)throw Error();db.prepare('UPDATE users SET google_sub=?,email_verified=1 WHERE id=?').run(info.sub,user.id);}else{const id=randomUUID();db.prepare('INSERT INTO users(id,email,name,phone,language,salt,password_hash,created_at,email_verified,google_sub) VALUES(?,?,?,?,?,?,?,?,1,?)').run(id,email,clean(info.name,80)||email.split('@')[0],'','it','','',new Date().toISOString(),info.sub);db.prepare('INSERT INTO address_books(user_id) VALUES(?)').run(id);user={id};}user=db.prepare('SELECT * FROM users WHERE id=?').get(user.id);}
     const issued=issueSession(user);security.audit('login.google',user.id);res.writeHead(302,{Location:'/?theme=persia-market#account/overview','Cache-Control':'no-store','Set-Cookie':[cookie(issued.token,issued.maxAge),'persia_oauth=; Path=/api/auth/google; HttpOnly; SameSite=Lax; Max-Age=0'+(origin.startsWith('https:')?'; Secure':'')]}).end();
    }catch{fail();}return true;
   }
   if(req.method!=='GET'&&req.headers.origin!==origin){send(res,403,{error:'origin'});return true;}
   if(req.headers['sec-fetch-site']==='cross-site'){send(res,403,{error:'origin'});return true;}
   if(url.pathname==='/api/auth/session'&&req.method==='GET'){send(res,200,{user:rowToUser(session(req)),emailDelivery:false,googleEnabled:googleReady,adminSetupRequired:setupRequired()});return true;}
   if(url.pathname==='/api/admin/setup'&&req.method==='GET'){send(res,200,{required:setupRequired()});return true;}
   if(url.pathname==='/api/admin/setup'&&req.method==='POST'){
    if(!throttle(req,'setup')){send(res,429,{error:'rateLimit'});return true;}
    if(!setupRequired()){send(res,409,{error:'setupComplete'});return true;}
    const b=await body(req);if(Date.now()>setupExpires||!adminSetupToken||typeof b.token!=='string'||!timingSafeEqual(Buffer.from(hashToken(b.token),'hex'),Buffer.from(hashToken(adminSetupToken),'hex'))){security.audit('owner.setup_denied');send(res,403,{error:'setupToken'});return true;}
    const email=clean(b.email,255).toLowerCase(),name=clean(b.name,81);if(!emailOK(email)||name.length<2||name.length>80||!passwordOK(b.password)){send(res,400,{error:'invalidData'});return true;}
    const existing=db.prepare('SELECT * FROM users WHERE email=?').get(email);
    const secret=await hashWork(()=>passwordHash(b.password,existing?.salt||undefined));
    if(existing&&(!existing.password_hash||!timingSafeEqual(Buffer.from(secret.hash,'hex'),Buffer.from(existing.password_hash,'hex')))){send(res,401,{error:'credentials'});return true;}
    db.exec('BEGIN IMMEDIATE');let id=existing?.id||randomUUID();
    try{if(!setupRequired()){db.exec('ROLLBACK');send(res,409,{error:'setupComplete'});return true;}
     if(existing){if(db.prepare('SELECT password_hash FROM users WHERE id=?').get(id)?.password_hash!==existing.password_hash)throw Object.assign(Error(),{status:401,code:'credentials'});db.prepare("UPDATE users SET role='admin' WHERE id=?").run(id);}
     else{db.prepare("INSERT INTO users(id,email,name,phone,language,salt,password_hash,created_at,role) VALUES(?,?,?,?,?,?,?,?, 'admin')").run(id,email,name,'','fa',secret.salt,secret.hash,new Date().toISOString());db.prepare('INSERT INTO address_books(user_id) VALUES(?)').run(id);}
     db.exec('COMMIT');
    }catch(error){db.exec('ROLLBACK');throw error;}
    db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);security.audit('owner.created',id);newSession(res,db.prepare('SELECT * FROM users WHERE id=?').get(id),201);return true;
   }
   if(['/api/auth/register','/api/auth/login'].includes(url.pathname)&&req.method==='POST'){
    const type=url.pathname.endsWith('register')?'register':'login';if(!throttle(req,type)){send(res,429,{error:'rateLimit'},{'Retry-After':'900'});return true;}
    const b=await body(req);const email=clean(b.email,255).toLowerCase();if(!emailOK(email)||typeof b.password!=='string'||b.password.length>128){send(res,400,{error:'invalidData'});return true;}
    if(type==='login'&&!security.limit('login.account',email,10)){security.audit('login.rate_limited');send(res,429,{error:'rateLimit'},{'Retry-After':'900'});return true;}
    const existing=db.prepare('SELECT * FROM users WHERE email=?').get(email);
    if(type==='register'){
     const name=clean(b.name,81),phone=phoneValue(b.phone);if(name.length<2||name.length>80||!phoneOK(phone)||!passwordOK(b.password)){send(res,400,{error:'invalidData'});return true;}
     if(existing){send(res,409,{error:'emailUsed'});return true;}
     const secret=await hashWork(()=>passwordHash(b.password));const id=randomUUID();const language=['fa','en','it'].includes(b.language)?b.language:'it';
     try {db.prepare('INSERT INTO users(id,email,name,phone,language,salt,password_hash,created_at) VALUES(?,?,?,?,?,?,?,?)').run(id,email,name,phone,language,secret.salt,secret.hash,new Date().toISOString());}catch(error){if(error.message.includes('UNIQUE')){send(res,409,{error:'emailUsed'});return true;}throw error;}
     db.prepare('INSERT INTO address_books(user_id) VALUES(?)').run(id);newSession(res,db.prepare('SELECT * FROM users WHERE id=?').get(id),201);
    }else{
     const secret=await hashWork(()=>passwordHash(b.password,existing?.salt||'b0d947b891cc114137a6c88c159e7508'));const expected=Buffer.from(existing?.password_hash||'0'.repeat(128),'hex');
     if(!timingSafeEqual(Buffer.from(secret.hash,'hex'),expected)||!existing?.password_hash){security.audit('login.denied',existing?.id);send(res,401,{error:'credentials'});return true;}
     const fresh=db.prepare('SELECT * FROM users WHERE id=?').get(existing.id);if(!fresh||fresh.password_hash!==existing.password_hash||fresh.salt!==existing.salt){send(res,401,{error:'credentials'});return true;}
     security.clear('login.account',email);security.audit('login.password',fresh.id);const old=session(req);if(old)db.prepare('DELETE FROM sessions WHERE hash=?').run(old.session_hash);newSession(res,fresh);
    }return true;
   }
   const user=session(req);if(!user){send(res,401,{error:'sessionExpired'});return true;}
   if(req.headers['x-persia-user']&&req.headers['x-persia-user']!==user.id){send(res,401,{error:'accountChanged'});return true;}
   if(rowToUser(user).mfaRequired&&!url.pathname.startsWith('/api/auth/mfa/')&&!['/api/auth/logout','/api/auth/logout-all','/api/account/security'].includes(url.pathname)){send(res,403,{error:'mfaRequired'});return true;}
   if(url.pathname.startsWith('/api/auth/mfa/')&&req.method==='POST'){
    if(user.role!=='admin'){send(res,403,{error:'adminOnly'});return true;}
    if(!security.limit('mfa.ip',clientAddress(req),20)||!security.limit('mfa.user',user.id,10)){send(res,429,{error:'rateLimit'},{'Retry-After':'900'});return true;}
    const b=await body(req);if(!session(req)){send(res,401,{error:'sessionExpired'});return true;}
    if(url.pathname==='/api/auth/mfa/enroll'){
     if(typeof b.password!=='string'||b.password.length>128||!user.password_hash){send(res,401,{error:'credentials'});return true;}
     const proof=await hashWork(()=>passwordHash(b.password,user.salt));if(!timingSafeEqual(Buffer.from(proof.hash,'hex'),Buffer.from(user.password_hash,'hex'))){send(res,401,{error:'credentials'});return true;}
     const current=session(req);if(!current||current.password_hash!==user.password_hash){send(res,401,{error:'sessionExpired'});return true;}
     send(res,200,security.begin(current));return true;
    }
    if(url.pathname==='/api/auth/mfa/enable'){
     const codes=security.enable(user.id,b.code);if(!codes){security.audit('mfa.denied',user.id);send(res,401,{error:'mfaCode'});return true;}
     db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);newSession(res,user,200,true,{recoveryCodes:codes});return true;
    }
    if(url.pathname==='/api/auth/mfa/verify'){
     if(!security.consume(user.id,b.code)){security.audit('mfa.denied',user.id);send(res,401,{error:'mfaCode'});return true;}
     security.audit('mfa.verified',user.id);db.prepare('DELETE FROM sessions WHERE hash=?').run(user.session_hash);newSession(res,user,200,true);return true;
    }
    send(res,404,{error:'notFound'});return true;
   }
   if(url.pathname==='/api/account/security'&&req.method==='GET'){send(res,200,{mfaEnabled:security.enabled(user.id),events:user.role==='admin'&&!rowToUser(user).mfaRequired?security.events():[],sessions:db.prepare('SELECT created,last_seen FROM sessions WHERE user_id=? ORDER BY created DESC').all(user.id)});return true;}
   if(url.pathname==='/api/auth/logout-all'&&req.method==='POST'){db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);db.prepare('DELETE FROM oauth_pending WHERE link_user=?').run(user.id);security.audit('session.revoked_all',user.id);send(res,200,{ok:true},{'Set-Cookie':cookie('',0)});return true;}
   if(url.pathname==='/api/auth/logout'&&req.method==='POST'){db.prepare('DELETE FROM oauth_pending WHERE link_user=?').run(user.id);db.prepare('DELETE FROM sessions WHERE hash=?').run(user.session_hash);security.audit('session.logout',user.id);send(res,200,{ok:true},{'Set-Cookie':cookie('',0)});return true;}
   if(url.pathname==='/api/account/profile'&&req.method==='PUT'){
    const b=await body(req);const name=clean(b.name,81),phone=phoneValue(b.phone);if(name.length<2||name.length>80||!phoneOK(phone)||!['fa','it','en'].includes(b.language)){send(res,400,{error:'invalidData'});return true;}
    db.prepare('UPDATE users SET name=?,phone=?,language=? WHERE id=?').run(name,phone,b.language,user.id);send(res,200,{user:rowToUser(db.prepare('SELECT * FROM users WHERE id=?').get(user.id))});return true;
   }
   if(url.pathname==='/api/account/addresses'&&req.method==='GET'){const book=db.prepare('SELECT * FROM address_books WHERE user_id=?').get(user.id);send(res,200,{addresses:JSON.parse(book?.data||'[]'),defaultId:book?.default_id||''});return true;}
   if(url.pathname==='/api/account/addresses'&&req.method==='PUT'){
    const b=await body(req);if(!Array.isArray(b.addresses)||b.addresses.length>20||!b.addresses.every(addressOK)||new Set(b.addresses.map(a=>a.id)).size!==b.addresses.length||typeof b.defaultId!=='string'||(b.defaultId&&!b.addresses.some(a=>a.id===b.defaultId))){send(res,400,{error:'invalidData'});return true;}
    const addresses=b.addresses.map(a=>({id:a.id,label:a.label.trim(),recipient:a.recipient.trim(),street:a.street.trim(),city:a.city.trim(),postcode:a.postcode}));db.prepare('INSERT INTO address_books(user_id,data,default_id) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data,default_id=excluded.default_id').run(user.id,JSON.stringify(addresses),b.defaultId);send(res,200,{addresses,defaultId:b.defaultId});return true;
   }
   if(url.pathname==='/api/auth/password'&&req.method==='PUT'){
    if(!throttle(req,'password')){send(res,429,{error:'rateLimit'});return true;}const b=await body(req);if(!user.password_hash){send(res,401,{error:'credentials'});return true;}if(typeof b.currentPassword!=='string'||b.currentPassword.length>128||!passwordOK(b.password)){send(res,400,{error:'invalidData'});return true;}
    const verified=await hashWork(()=>passwordHash(b.currentPassword,user.salt));if(!timingSafeEqual(Buffer.from(verified.hash,'hex'),Buffer.from(user.password_hash,'hex'))){send(res,401,{error:'credentials'});return true;}
    const next=await hashWork(()=>passwordHash(b.password));if(!session(req)){send(res,401,{error:'sessionExpired'});return true;}const changed=db.prepare('UPDATE users SET salt=?,password_hash=? WHERE id=? AND password_hash=? AND salt=?').run(next.salt,next.hash,user.id,user.password_hash,user.salt);if(!changed.changes){send(res,409,{error:'accountChanged'});return true;}db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);db.prepare('DELETE FROM oauth_pending WHERE link_user=?').run(user.id);security.audit('password.changed',user.id);newSession(res,db.prepare('SELECT * FROM users WHERE id=?').get(user.id));return true;
   }
   send(res,404,{error:'notFound'});return true;
  }catch(error){send(res,error.status||500,{error:error.code||'serverError'});return true;}
 }
 return {handle,authorize,identify:req=>rowToUser(session(req)),setupRequired,audit:security.audit,allowRequest:req=>security.limit('api.request',clientAddress(req),600,60000),allowOrderRequest:req=>security.limit('orders.create',clientAddress(req),10,900000),close:()=>db.close()};
}
