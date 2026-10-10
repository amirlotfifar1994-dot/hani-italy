import {createHmac,createCipheriv,createDecipheriv,randomBytes,timingSafeEqual} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32(buffer){let bits=0,value=0,result='';for(const byte of buffer){value=(value<<8)|byte;bits+=8;while(bits>=5){result+=alphabet[(value>>>(bits-5))&31];bits-=5;}}if(bits)result+=alphabet[(value<<(5-bits))&31];return result;}
function decode32(text){let bits=0,value=0,out=[];for(const char of text){const n=alphabet.indexOf(char);if(n<0)throw Error('Invalid authenticator secret');value=(value<<5)|n;bits+=5;if(bits>=8){out.push((value>>>(bits-8))&255);bits-=8;}}return Buffer.from(out);}
export function totp(secret,step=Math.floor(Date.now()/30000),digits=6){const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(step));const hash=createHmac('sha1',decode32(secret)).update(counter).digest();const offset=hash.at(-1)&15;return String((hash.readUInt32BE(offset)&0x7fffffff)%10**digits).padStart(digits,'0');}

export function securityStore(db,{database,now=Date.now}={}){
 db.exec(`CREATE TABLE IF NOT EXISTS security_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,until INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS security_events(id INTEGER PRIMARY KEY,event TEXT NOT NULL,actor TEXT NOT NULL,target TEXT NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS security_mfa(user_id TEXT PRIMARY KEY,secret TEXT NOT NULL,enabled INTEGER NOT NULL DEFAULT 0,expires INTEGER NOT NULL,last_step INTEGER NOT NULL DEFAULT -1);
 CREATE TABLE IF NOT EXISTS security_recovery(user_id TEXT NOT NULL,hash TEXT NOT NULL,PRIMARY KEY(user_id,hash));`);
 let key;
 if(database===':memory:')key=randomBytes(32);
 else{const file=path.join(path.dirname(database),'security.key');try{key=fs.readFileSync(file);}catch(error){if(error.code!=='ENOENT')throw error;try{fs.writeFileSync(file,randomBytes(32),{flag:'wx',mode:0o600});}catch(e){if(e.code!=='EEXIST')throw e;}key=fs.readFileSync(file);}if(key.length!==32)throw Error('Invalid private security key');}
 const digest=text=>createHmac('sha256',key).update(text).digest('hex');
 let lastCleanup=0;
 function audit(event,actor='',target=''){db.prepare('INSERT INTO security_events(event,actor,target,created) VALUES(?,?,?,?)').run(event,String(actor).slice(0,80),String(target).slice(0,160),now());db.prepare('DELETE FROM security_events WHERE id <= (SELECT max(id)-10000 FROM security_events)').run();}
 function limit(scope,value,max,windowMs=900000){const time=now();if(time-lastCleanup>=60000){db.prepare('DELETE FROM security_limits WHERE until<=?').run(time);lastCleanup=time;}const id=digest(scope+':'+value);const record=db.prepare('SELECT * FROM security_limits WHERE key=?').get(id);if(!record&&db.prepare('SELECT count(*) n FROM security_limits').get().n>=10000)return false;const row=db.prepare(`INSERT INTO security_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN until<=? THEN 1 ELSE count+1 END,until=CASE WHEN until<=? THEN excluded.until ELSE until END RETURNING count`).get(id,time+windowMs,time,time);return row.count<=max;}
 function clear(scope,value){db.prepare('DELETE FROM security_limits WHERE key=?').run(digest(scope+':'+value));}
 function seal(secret,userId){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from(userId));const encrypted=Buffer.concat([cipher.update(secret,'utf8'),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('base64url');}
 function open(record){const data=Buffer.from(record.secret,'base64url'),decipher=createDecipheriv('aes-256-gcm',key,data.subarray(0,12));decipher.setAAD(Buffer.from(record.user_id));decipher.setAuthTag(data.subarray(12,28));return Buffer.concat([decipher.update(data.subarray(28)),decipher.final()]).toString();}
 const enabled=id=>!!db.prepare('SELECT enabled FROM security_mfa WHERE user_id=?').get(id)?.enabled;
 function begin(user){if(enabled(user.id))throw Object.assign(Error(),{status:409,code:'mfaEnabled'});const secret=base32(randomBytes(20));db.prepare('INSERT INTO security_mfa(user_id,secret,expires) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET secret=excluded.secret,expires=excluded.expires,last_step=-1').run(user.id,seal(secret,user.id),now()+600000);audit('mfa.enrollment_started',user.id);return {secret,uri:'otpauth://totp/'+encodeURIComponent('Persia Market:'+user.email)+'?'+new URLSearchParams({secret,issuer:'Persia Market',algorithm:'SHA1',digits:'6',period:'30'})};}
 function consume(id,code,{enrollment=false}={}){if(typeof code!=='string'||code.length>40)return false;const record=db.prepare('SELECT * FROM security_mfa WHERE user_id=?').get(id);if(!record||(enrollment?(record.enabled||record.expires<=now()):!record.enabled))return false;
  const value=code.trim().replace(/\s/g,'').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))),step=Math.floor(now()/30000);
  if(/^\d{6}$/.test(value)){const secret=open(record);for(const candidate of [step,step-1,step+1]){if(candidate>record.last_step&&timingSafeEqual(Buffer.from(value),Buffer.from(totp(secret,candidate)))){const result=db.prepare('UPDATE security_mfa SET last_step=? WHERE user_id=? AND last_step<?').run(candidate,id,candidate);return !!result.changes;}}}
  if(!enrollment&&/^[a-f0-9-]{19}$/i.test(value)){return !!db.prepare('DELETE FROM security_recovery WHERE user_id=? AND hash=?').run(id,digest(id+':'+value.toLowerCase().replace(/-/g,''))).changes;}
  return false;
 }
 function enable(id,code){if(!consume(id,code,{enrollment:true}))return null;const codes=Array.from({length:8},()=>randomBytes(8).toString('hex').match(/.{4}/g).join('-'));db.exec('BEGIN IMMEDIATE');try{db.prepare('UPDATE security_mfa SET enabled=1,expires=0 WHERE user_id=?').run(id);db.prepare('DELETE FROM security_recovery WHERE user_id=?').run(id);for(const code of codes)db.prepare('INSERT INTO security_recovery VALUES(?,?)').run(id,digest(id+':'+code.replace(/-/g,'')));db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}audit('mfa.enabled',id);return codes;}
 return {limit,clear,audit,enabled,begin,consume,enable,events:()=>db.prepare('SELECT event,actor,target,created FROM security_events ORDER BY id DESC LIMIT 100').all()};
}

export function protectResponse(res,{production=false}={}){
 const policy="default-src 'self'; script-src 'self'; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; frame-src 'none'"+(production?'; upgrade-insecure-requests':'');
 for(const [name,value] of Object.entries({'Content-Security-Policy':policy,'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()','Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Resource-Policy':'same-origin','X-Permitted-Cross-Domain-Policies':'none',...(production?{'Strict-Transport-Security':'max-age=31536000'}:{})}))res.setHeader(name,value);
}
