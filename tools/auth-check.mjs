import assert from 'node:assert/strict';
import http from 'node:http';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createAuth} from '../server/auth.mjs';
const dir=await mkdtemp(path.join(tmpdir(),'persia-auth-test-'));const database=path.join(dir,'test.sqlite');let auth;
const server=http.createServer(async(req,res)=>{if(!await auth.handle(req,res,new URL(req.url,'http://localhost')))res.writeHead(404).end();});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;auth=createAuth({database,origin});
const password='Sample passphrase for tests 2026';
async function req(route,{method='GET',body,cookie,expectedUser,requestOrigin=origin}={}){const result=await fetch(origin+route,{method,headers:{...(body?{'Content-Type':'application/json',Origin:requestOrigin}:{}),...(cookie?{Cookie:cookie}:{}),...(expectedUser?{'X-Persia-User':expectedUser}:{})},body:body?JSON.stringify(body):undefined,redirect:'manual'});return {status:result.status,data:await result.json().catch(()=>({})),cookie:result.headers.get('set-cookie'),location:result.headers.get('location')};}
try{
 assert.equal((await req('/api/account/profile',{method:'PUT',body:{name:'Intruder',phone:'',language:'en'}})).status,401);
 assert.equal((await req('/api/auth/register',{method:'POST',body:{email:'a@example.com',password,name:'Sample',phone:'',language:'en'},requestOrigin:'https://other.example'})).status,403);
 assert.equal((await req('/api/auth/register',{method:'POST',body:{email:'a@example.com',password:'weak',name:'Sample',phone:'',language:'en'}})).status,400);
 const a=await req('/api/auth/register',{method:'POST',body:{email:'a@example.com',password,name:'Sample A',phone:'+39 000 000 0000',language:'en'}});assert.equal(a.status,201);const cookieA=a.cookie.split(';')[0];assert.match(a.cookie,/HttpOnly/);assert.match(a.cookie,/SameSite=Strict/);assert.ok(!JSON.stringify(a.data).includes('password'));assert.equal(a.data.user.phone,'+390000000000');
 assert.equal((await req('/api/auth/login',{method:'POST',body:{email:'a@example.com',password:'Wrong passphrase for test'}})).status,401);
 assert.equal((await req('/api/auth/register',{method:'POST',body:{email:'A@example.com',password,name:'Duplicate',phone:'',language:'en'}})).status,409);
 const aAddress={id:'sample-a',label:'Test',recipient:'Sample',street:'Via Esempio 1',city:'Roma',postcode:'00185'};
 assert.equal((await req('/api/account/addresses',{method:'PUT',cookie:cookieA,body:{addresses:[aAddress],defaultId:'sample-a'}})).status,200);
 const b=await req('/api/auth/register',{method:'POST',body:{email:'b@example.com',password,name:'Sample B',phone:'',language:'it'}});assert.equal(b.status,201);const cookieB=b.cookie.split(';')[0];assert.deepEqual((await req('/api/account/addresses',{cookie:cookieB})).data.addresses,[]);
 assert.equal((await req('/api/account/profile',{method:'PUT',cookie:cookieB,expectedUser:a.data.user.id,body:{name:'Stale A',phone:'',language:'en'}})).data.error,'accountChanged');
 assert.equal((await req('/api/account/profile',{method:'PUT',cookie:cookieA,body:{name:'Updated A',phone:'123',language:'en'}})).status,400);
 assert.equal((await req('/api/account/profile',{method:'PUT',cookie:cookieA,body:{name:'Updated A',phone:'+390000000000',language:'fa'}})).status,200);
 const db=new DatabaseSync(database);const record=db.prepare('SELECT * FROM users WHERE id=?').get(a.data.user.id);assert.equal(record.password_hash.length,128);assert.ok(record.password_hash!==password);assert.equal(record.salt.length,32);db.close();
 auth.close();auth=createAuth({database,origin});assert.equal((await req('/api/auth/session',{cookie:cookieA})).data.user.name,'Updated A');assert.equal((await req('/api/account/addresses',{cookie:cookieA})).data.addresses[0].postcode,'00185');
 const changed=await req('/api/auth/password',{method:'PUT',cookie:cookieA,body:{currentPassword:password,password:password+' changed'}});assert.equal(changed.status,200);assert.equal((await req('/api/auth/session',{cookie:cookieA})).data.user,null);const changedCookie=changed.cookie.split(';')[0];assert.equal((await req('/api/auth/logout',{method:'POST',cookie:changedCookie,body:{}})).status,200);assert.equal((await req('/api/auth/session',{cookie:changedCookie})).data.user,null);
 assert.equal((await req('/api/auth/google/start')).status,503);assert.equal((await req('/api/auth/login',{method:'POST',body:{email:'a@example.com',password}})).status,401);
 let rateLimited=false;for(let i=0;i<22;i++){const result=await req('/api/auth/login',{method:'POST',body:{email:'missing@example.com',password:'x'}});if(result.status===429){rateLimited=true;break;}}assert.ok(rateLimited);
 // Exercise the OAuth flow without contacting Google or using real credentials.
 auth.close();const pair=generateKeyPairSync('rsa',{modulusLength:2048});const publicKey=pair.publicKey.export({format:'jwk'});publicKey.kid='test-key';publicKey.use='sig';publicKey.alg='RS256';
 let googleState='',claimsOverride={},googleSubject='test-google-sub',googleEmail='google@example.com',tamper=false,tokenCalls=0;
 const mockGoogle=async(url,options)=>{
  if(url.endsWith('/certs'))return Response.json({keys:[publicKey]});
  assert.equal(url,'https://oauth2.googleapis.com/token');tokenCalls++;assert.ok(options.body.get('code_verifier'));assert.equal(options.body.get('redirect_uri'),origin+'/api/auth/google/callback');
  const header=Buffer.from(JSON.stringify({alg:'RS256',kid:'test-key'})).toString('base64url');
  const claims=Buffer.from(JSON.stringify({iss:'https://accounts.google.com',aud:'test-client',sub:googleSubject,email:googleEmail,email_verified:true,name:'Google Sample',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+300,nonce:createHash('sha256').update(googleState).digest('hex'),...claimsOverride})).toString('base64url');
  const signed=header+'.'+claims,signature=sign('RSA-SHA256',Buffer.from(signed),pair.privateKey).toString('base64url');
  return Response.json({id_token:signed+'.'+(tamper?signature.slice(0,-8)+'AAAAAAAA':signature)});
 };
 auth=createAuth({database,origin,google:{clientId:'test-client',clientSecret:'test-secret'},fetchFn:mockGoogle});
 async function startGoogle(cookie){const start=await req('/api/auth/google/start',{cookie});assert.equal(start.status,302);const link=new URL(start.location);assert.equal(link.origin,'https://accounts.google.com');assert.equal(link.searchParams.get('code_challenge_method'),'S256');googleState=link.searchParams.get('state');assert.equal(link.searchParams.get('nonce'),createHash('sha256').update(googleState).digest('hex'));return start.cookie.split(';')[0];}
 const callback=(cookie,state=googleState)=>req('/api/auth/google/callback?code=test-code&state='+state,{cookie});
 let oauthCookie=await startGoogle();const callsBefore=tokenCalls;assert.match((await callback(oauthCookie,'x'.repeat(43))).location,/googleFailed/);assert.equal(tokenCalls,callsBefore);
 const success=await callback(oauthCookie);assert.match(success.location,/#account\/overview/);assert.ok(!success.location.includes('googleFailed'));const googleCookie=success.cookie.split(';')[0];assert.equal((await req('/api/auth/session',{cookie:googleCookie})).data.user.googleConnected,true);
 assert.match((await callback(oauthCookie)).location,/googleFailed/); // one-time state
 for(const invalid of [{aud:'other-client'},{nonce:'wrong-nonce'},{exp:1},{iss:'https://attacker.example'},{email_verified:false}]){claimsOverride=invalid;oauthCookie=await startGoogle();assert.match((await callback(oauthCookie)).location,/googleFailed/);}claimsOverride={};
 tamper=true;oauthCookie=await startGoogle();assert.match((await callback(oauthCookie)).location,/googleFailed/);tamper=false;
 assert.equal((await req('/api/auth/password',{method:'PUT',cookie:googleCookie,body:{currentPassword:'',password}})).status,401);
 googleEmail='b@example.com';googleSubject='test-b-sub';oauthCookie=await startGoogle();assert.match((await callback(oauthCookie)).location,/googleFailed/); // never link an email account without its signed-in owner
 oauthCookie=await startGoogle(cookieB);const linked=await callback(oauthCookie);assert.ok(!linked.location.includes('googleFailed'));assert.equal((await req('/api/auth/session',{cookie:cookieB})).data.user.googleConnected,true);
 oauthCookie=await startGoogle(cookieB);assert.equal((await req('/api/auth/logout',{method:'POST',cookie:cookieB,body:{}})).status,200);assert.match((await callback(oauthCookie)).location,/googleFailed/);
 console.log('PASS: Google state/PKCE, verified signed identity, audience/issuer/nonce/expiry, signature tampering, replay rejection, Google-only password guard, and authenticated account linking.');
 console.log('PASS: registration, password hashing, cookie sessions, wrong credentials, duplicate email, origin protection, user isolation, profile/address persistence after restart, password change/revocation, logout, rate limiting and Google setup status.');
}finally{await new Promise(resolve=>server.close(resolve));auth.close();await rm(dir,{recursive:true,force:true});}
