import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runtimeConfig} from '../server/runtime-config.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),origin='https://persia-host.test';
const configured=runtimeConfig({NODE_ENV:'production',RAILWAY_PUBLIC_DOMAIN:'persia-host.test',PERSIA_DATA_DIR:'/data',PORT:'8080',TRUST_PROXY_HOPS:'1'});
assert.equal(configured.host,'0.0.0.0');assert.equal(configured.origin,origin);assert.equal(configured.siteUrl,origin);
const request={socket:{remoteAddress:'10.0.0.2'},headers:{'x-forwarded-for':'192.0.2.99, 198.51.100.12'}};
assert.equal(configured.clientAddress(request),'198.51.100.12');
assert.equal(runtimeConfig({}).clientAddress(request),'10.0.0.2');
for(const env of [{NODE_ENV:'production'},{NODE_ENV:'production',AUTH_ORIGIN:'http://example.com',PERSIA_DATA_DIR:'/data'},{NODE_ENV:'production',AUTH_ORIGIN:origin},{AUTH_ORIGIN:'https://user:password@example.com'},{AUTH_ORIGIN:'https://example.com/path'},{PORT:'0'},{PORT:'NaN'},{TRUST_PROXY_HOPS:'-1'}])assert.throws(()=>runtimeConfig(env));
const probe=http.createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const tempRoot=path.resolve(tmpdir()),dir=await mkdtemp(path.join(tempRoot,'persia-host-test-'));assert.ok(path.resolve(dir).startsWith(tempRoot+path.sep));
let child;
const env={...process.env,NODE_ENV:'production',HOST:'127.0.0.1',PORT:String(port),AUTH_ORIGIN:origin,SITE_URL:'',PERSIA_DATA_DIR:dir,PERSIA_DB:path.join(dir,'accounts.sqlite'),PERSIA_UPLOAD_DIR:path.join(dir,'uploads'),SEO_INDEXING:'false',ADMIN_SETUP_TOKEN:'',GOOGLE_CLIENT_ID:'',GOOGLE_CLIENT_SECRET:'',TRUST_PROXY_HOPS:'1'};
async function start(){child=spawn(process.execPath,['tools/preview.mjs'],{cwd:root,env,stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(Error('Hosting startup timed out')),20000);child.stdout.on('data',b=>{output+=b;if(output.includes('Persia Market public server')){clearTimeout(timer);resolve();}});child.on('exit',code=>{clearTimeout(timer);reject(Error('Hosting startup exited: '+code));});child.on('error',reject);});}
async function stop(){if(child?.exitCode===null){child.kill('SIGTERM');await once(child,'exit');}child=null;}
async function hosted(route,{method='GET',body,cookie,host='persia-host.test'}={}){return await new Promise((resolve,reject)=>{const req=http.request({host:'127.0.0.1',port,path:route,method,headers:{Host:host,...(body?{'Content-Type':'application/json',Origin:origin}:{}),...(cookie?{Cookie:cookie}:{})}},res=>{const chunks=[];res.on('data',b=>chunks.push(b));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,text:Buffer.concat(chunks).toString('utf8')}));});req.on('error',reject);req.end(body?JSON.stringify(body):undefined);});}
try{
 await start();
 assert.equal((await hosted('/healthz')).text,'{"status":"ok"}');assert.equal((await hosted('/healthz',{method:'HEAD'})).text,'');assert.equal((await hosted('/healthz',{method:'POST'})).status,405);
 const home=await hosted('/?lang=fa');assert.equal(home.status,200);assert.ok(home.text.includes(origin+'/?lang=fa'));assert.match(home.headers['x-robots-tag'],/noindex/);
 assert.match(home.headers['content-security-policy'],/script-src 'self';/);assert.equal(home.headers['strict-transport-security'],'max-age=31536000');assert.match(home.text,/id="data-PersiaInitialCatalogue"/);assert.ok(!/<script>/.test(home.text));
 assert.equal((await hosted('/blog/milan-italy-city-guide?lang=fa')).status,200);
 assert.equal((await hosted('/api/auth/session',{host:'attacker.test'})).status,403);
 for(const route of ['/.local-data/accounts.sqlite','/accounts.sqlite','/admin-setup.token','/.env','/security.key','/catalogue.json'])assert.equal((await hosted(route)).status,404);
 const password='Hosted test passphrase 2026';
 const registration=await hosted('/api/auth/register',{method:'POST',body:{name:'Hosting fixture',email:'hosting@example.com',phone:'',password,language:'fa'}});
 assert.equal(registration.status,201);const setCookie=registration.headers['set-cookie'][0];assert.match(setCookie,/; Secure/);assert.match(setCookie,/; HttpOnly/);
 const cookie=setCookie.split(';')[0];
 assert.ok(cookie.startsWith('__Host-persia_session='));
 assert.equal((await hosted('/api/account/profile',{method:'PUT',cookie,body:{name:'Persisted hosting fixture',phone:'',language:'fa'}})).status,200);
 const setupToken=await readFile(path.join(dir,'admin-setup.token'),'utf8');
 await stop();await start();assert.equal(await readFile(path.join(dir,'admin-setup.token'),'utf8'),setupToken);
 const login=await hosted('/api/auth/login',{method:'POST',body:{email:'hosting@example.com',password}});assert.equal(login.status,200);assert.equal(JSON.parse(login.text).user.name,'Persisted hosting fixture');
 console.log('PASS: public HTTPS configuration, proxy IP trust, health checks, SSR origin/noindex, Secure cookies, host protection, private storage exclusion and account/setup-token persistence after restart.');
}finally{await stop();assert.ok(path.resolve(dir).startsWith(tempRoot+path.sep));await rm(dir,{recursive:true,force:true});}
