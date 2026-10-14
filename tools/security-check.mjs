import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createAuth} from '../server/auth.mjs';
import {base32,totp,securityStore,protectResponse} from '../server/security.mjs';

const rfcSecret=base32(Buffer.from('12345678901234567890'));
for(const [seconds,expected] of [[59,'94287082'],[1111111109,'07081804'],[1111111111,'14050471'],[1234567890,'89005924'],[2000000000,'69279037'],[20000000000,'65353130']])assert.equal(totp(rfcSecret,Math.floor(seconds/30),8),expected);
const headers=new Map();protectResponse({setHeader:(key,value)=>headers.set(key,value)},{production:true});assert.match(headers.get('Content-Security-Policy'),/script-src 'self';/);assert.match(headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);assert.ok(!headers.get('Content-Security-Policy').split(';').find(s=>s.trim().startsWith('script-src ')).includes('unsafe'));assert.equal(headers.get('Strict-Transport-Security'),'max-age=31536000');
const directory=await mkdtemp(path.join(tmpdir(),'persia-security-')),database=path.join(directory,'security.sqlite');
let auth;const server=http.createServer(async(req,res)=>{if(await auth.handle(req,res,new URL(req.url,'http://localhost')))return;try{auth.authorize(req);res.writeHead(200).end('{}');}catch(error){res.writeHead(error.status||500).end(JSON.stringify({error:error.code||'serverError'}));}});
// Windows may allocate a Fetch-forbidden low ephemeral port. Use a safe range.
for(let attempt=0;;attempt++){try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(20000+Math.floor(Math.random()*10000),'127.0.0.1',()=>{server.removeListener('error',reject);resolve();});});break;}catch(error){if(error.code!=='EADDRINUSE'||attempt>=20)throw error;}}
const origin='http://127.0.0.1:'+server.address().port,password='Isolated security administrator 2026',setupToken='private-owner-test-code';
const initialize=()=>{auth=createAuth({database,origin,adminSetupToken:setupToken,requireAdminMfa:true});};initialize();
async function request(route,{method='GET',body,cookie,requestOrigin=origin}={}){const response=await fetch(origin+route,{method,headers:{...(body?{'Content-Type':'application/json',Origin:requestOrigin}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};}
try{
 const customer=await request('/api/auth/register',{method:'POST',body:{name:'Security customer',email:'customer@example.com',password,phone:'',role:'admin',mfa_verified:1}});assert.equal(customer.data.user.role,'customer');assert.equal((await request('/api/admin/private',{cookie:customer.cookie})).status,403);
 const owner=await request('/api/admin/setup',{method:'POST',body:{token:setupToken,name:'Security owner',email:'owner@example.com',password}});assert.equal(owner.status,201);assert.equal(owner.data.user.mfaRequired,true);assert.equal((await request('/api/admin/private',{cookie:owner.cookie})).data.error,'mfaRequired');assert.equal((await request('/api/account/addresses',{cookie:owner.cookie})).status,403);
 assert.equal((await request('/api/auth/mfa/enroll',{method:'POST',cookie:customer.cookie,body:{password}})).status,403);
 assert.equal((await request('/api/auth/mfa/enroll',{method:'POST',cookie:owner.cookie,body:{password:'wrong'}})).status,401);
 const enrollment=await request('/api/auth/mfa/enroll',{method:'POST',cookie:owner.cookie,body:{password}});assert.equal(enrollment.status,200);assert.equal(enrollment.data.secret.length,32);assert.ok(enrollment.data.uri.startsWith('otpauth://totp/'));
 const inspector=new DatabaseSync(database);const encrypted=inspector.prepare('SELECT secret FROM security_mfa').get().secret;assert.ok(!encrypted.includes(enrollment.data.secret));assert.equal(inspector.prepare('SELECT enabled FROM security_mfa').get().enabled,0);
 assert.equal((await request('/api/auth/mfa/enable',{method:'POST',cookie:owner.cookie,body:{code:'abcdef'}})).status,401);
 const code=totp(enrollment.data.secret),enabled=await request('/api/auth/mfa/enable',{method:'POST',cookie:owner.cookie,body:{code}});assert.equal(enabled.status,200);assert.equal(enabled.data.recoveryCodes.length,8);assert.equal(enabled.data.user.mfaRequired,false);assert.equal(enabled.data.user.mfaEnabled,true);assert.notEqual(enabled.cookie,owner.cookie);assert.equal((await request('/api/admin/private',{cookie:owner.cookie})).status,401);assert.equal((await request('/api/admin/private',{cookie:enabled.cookie})).status,200);
 assert.equal((await request('/api/admin/private',{method:'POST',cookie:enabled.cookie,body:{},requestOrigin:'https://attacker.example'})).status,403);
 assert.equal((await request('/api/admin/setup',{method:'POST',body:{token:setupToken,name:'Intruder',email:'other@example.com',password}})).status,409);
 await request('/api/auth/logout',{method:'POST',cookie:enabled.cookie,body:{}});
 let login=await request('/api/auth/login',{method:'POST',body:{email:'owner@example.com',password}});assert.equal(login.data.user.mfaRequired,true);assert.equal((await request('/api/auth/mfa/verify',{method:'POST',cookie:login.cookie,body:{code}})).status,401,'Authenticator codes cannot be replayed');
 const verified=await request('/api/auth/mfa/verify',{method:'POST',cookie:login.cookie,body:{code:enabled.data.recoveryCodes[0]}});assert.equal(verified.status,200);assert.equal((await request('/api/admin/private',{cookie:verified.cookie})).status,200);
 auth.close();initialize();assert.equal((await request('/api/admin/private',{cookie:verified.cookie})).status,200,'MFA and verified sessions survive restart');
 login=await request('/api/auth/login',{method:'POST',body:{email:'owner@example.com',password}});assert.equal((await request('/api/auth/mfa/verify',{method:'POST',cookie:login.cookie,body:{code:enabled.data.recoveryCodes[0]}})).status,401,'Recovery codes are single-use after restart');
 const device=await request('/api/auth/mfa/verify',{method:'POST',cookie:login.cookie,body:{code:enabled.data.recoveryCodes[1]}});assert.equal(device.status,200);
 const report=await request('/api/account/security',{cookie:device.cookie});assert.ok(report.data.events.some(e=>e.event==='mfa.enabled'));const serialized=JSON.stringify(report.data.events);for(const value of [password,enrollment.data.secret,enabled.data.recoveryCodes[0],'owner@example.com'])assert.ok(!serialized.includes(value),'Audit must not contain credentials or emails');
 assert.equal((await request('/api/auth/logout-all',{method:'POST',cookie:device.cookie,body:{}})).status,200);assert.equal((await request('/api/admin/private',{cookie:verified.cookie})).status,401);assert.equal((await request('/api/admin/private',{cookie:device.cookie})).status,401);
 login=await request('/api/auth/login',{method:'POST',body:{email:'owner@example.com',password}});inspector.prepare('UPDATE sessions SET last_seen=? WHERE user_id=?').run(Date.now()-1800001,owner.data.user.id);assert.equal((await request('/api/auth/session',{cookie:login.cookie})).data.user,null,'Administrator idle timeout is server enforced');
 for(let i=0;i<10;i++)assert.equal((await request('/api/auth/login',{method:'POST',body:{email:'missing@example.com',password}})).status,401);auth.close();initialize();assert.equal((await request('/api/auth/login',{method:'POST',body:{email:'missing@example.com',password}})).status,429,'Account throttling survives server restart');
 const limits=inspector.prepare('SELECT key FROM security_limits').all();assert.ok(limits.every(r=>/^[a-f0-9]{64}$/.test(r.key)),'Rate-limit identities are keyed digests');
 let time=Date.now();const store=securityStore(inspector,{database,now:()=>time});assert.equal(store.limit('isolated.window','fixture',2,1000),true);assert.equal(store.limit('isolated.window','fixture',2,1000),true);assert.equal(store.limit('isolated.window','fixture',2,1000),false);time+=1001;assert.equal(store.limit('isolated.window','fixture',2,1000),true);
 const expiring=store.begin({id:'expiry-fixture',email:'expiry@example.com'});time+=600001;assert.equal(store.enable('expiry-fixture',totp(expiring.secret,Math.floor(time/30000))),null,'Expired enrollment cannot be enabled with a valid fresh code');
 inspector.close();
 console.log('PASS: RFC 6238 vectors, strict script policy, HSTS, customer/admin isolation, mandatory admin MFA, encrypted secrets, one-time/replay protection, recovery persistence, session rotation/revocation/idle expiry, durable throttling and redacted audit events.');
}finally{await new Promise(resolve=>server.close(resolve));auth.close();assert.ok(path.resolve(directory).startsWith(path.resolve(tmpdir())+path.sep));await rm(directory,{recursive:true,force:true});}
