import http from "node:http";
import {randomBytes} from 'node:crypto';
import {createSeo} from '../server/seo.mjs';
import {createCatalogue} from '../server/catalogue.mjs';
import {createAuth} from "../server/auth.mjs";
import {createComments} from '../server/comments.mjs';
import {posts} from '../server/blog-content.mjs';
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {runtimeConfig} from '../server/runtime-config.mjs';
import {protectResponse} from '../server/security.mjs';
try { process.loadEnvFile(fileURLToPath(new URL("../.env",import.meta.url))); } catch(error) {if(error.code!=="ENOENT")throw error;}
const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const {production,port,host,database,origin,privateDir,siteUrl,uploadDir,clientAddress}=runtimeConfig();
await fs.mkdir(privateDir,{recursive:true,mode:0o700});
// Railway mounts as root; lower privilege before accepting any requests.
if(production&&process.env.PERSIA_CONTAINER==='true'&&process.getuid?.()===0){
 const nodeUser=(await fs.readFile('/etc/passwd','utf8')).split('\n').find(line=>line.startsWith('node:'))?.split(':');
 if(!nodeUser)throw Error('Container node user is missing');
 const uid=Number(nodeUser[2]),gid=Number(nodeUser[3]);
 async function own(directory){await fs.chown(directory,uid,gid);await fs.chmod(directory,0o700);for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isSymbolicLink())throw Error('Private storage must not contain symlinks');if(entry.isFile()){await fs.chown(file,uid,gid);await fs.chmod(file,0o600);}else if(entry.isDirectory()&&file===uploadDir)await own(file);}}
 await own(privateDir);process.setgid(gid);process.setuid(uid);
}
const setupFile=path.join(privateDir,'admin-setup.token');let adminSetupToken=process.env.ADMIN_SETUP_TOKEN;
if(!adminSetupToken){try{adminSetupToken=(await fs.readFile(setupFile,'utf8')).trim();}catch(e){if(e.code!=='ENOENT')throw e;adminSetupToken=randomBytes(32).toString('base64url');try{await fs.writeFile(setupFile,adminSetupToken,{flag:'wx',mode:0o600});}catch(e){if(e.code!=='EEXIST')throw e;adminSetupToken=(await fs.readFile(setupFile,'utf8')).trim();}}}
if(production&&!/^[A-Za-z0-9_-]{43,128}$/.test(adminSetupToken))throw Error('Production owner setup token must be cryptographically strong');
const setupExpires=(await fs.stat(setupFile).catch(()=>({mtimeMs:Date.now()}))).mtimeMs+86400000;
const auth=createAuth({database,origin,adminSetupToken,setupExpires,requireAdminMfa:production||process.env.REQUIRE_ADMIN_MFA==='true',clientAddress,google:{clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET}});
const catalogue=await createCatalogue({database,origin,uploadDir,seed:JSON.parse(await fs.readFile(path.join(root,'catalogue.json'),'utf8')),authorize:auth.authorize});
const comments=createComments({database,origin,identify:auth.identify,authorize:auth.authorize,resolveTarget:(kind,target)=>{const item=kind==='product'?catalogue.publicProducts().find(p=>p.id===target):kind==='article'?posts.find(p=>p.slug===target):null;return item?{title:kind==='product'?item.name:{fa:item.fa.title,en:item.en.title,it:item.it.title}}:null;}});
const seo=await createSeo({root,catalogue,comments,origin,siteUrl,indexing:process.env.SEO_INDEXING==='true'});
const mime = {
  ".json": "application/json; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};
const server=http
  .createServer({maxHeaderSize:8192,requestTimeout:30000,headersTimeout:15000,keepAliveTimeout:5000},async (req, res) => {
    protectResponse(res,{production});
    try {
      if(req.url.length>4096){res.writeHead(414).end();return;}
      const requestUrl=new URL(req.url,"http://localhost");
      if(requestUrl.pathname==='/healthz'){
        res.setHeader('X-Robots-Tag','noindex, nofollow');
        if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
        res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(req.method==='HEAD'?undefined:JSON.stringify({status:'ok'}));return;
      }
      if(requestUrl.pathname.startsWith('/api/')){res.setHeader('X-Robots-Tag','noindex, nofollow');if(!auth.allowRequest(req)){res.writeHead(429,{'Content-Type':'application/json','Retry-After':'60'}).end(JSON.stringify({error:'rateLimit'}));return;}}
      if(requestUrl.pathname.startsWith('/api/admin/')&&!['GET','HEAD'].includes(req.method)){res.once('finish',()=>{if(res.statusCode>=200&&res.statusCode<300){const user=auth.identify(req);auth.audit('admin.'+req.method.toLowerCase(),user?.id,requestUrl.pathname);}});}
      if(await auth.handle(req,res,requestUrl))return;
      if(await comments.handle(req,res,requestUrl))return;
      if(await catalogue.handle(req,res,requestUrl))return;
      if(seo.handle(req,res,requestUrl))return;
      if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405).end();return;}
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if(pathname.split(/[\\/]/).some(segment=>segment.startsWith('.'))||pathname==='/catalogue.json'){res.writeHead(404,{'X-Robots-Tag':'noindex, nofollow'}).end('Not found');return;}
      const file = path.resolve(
        root,
        "." + (pathname === "/" ? "/index.html" : pathname),
      );
      if (file!==root && !file.startsWith(root+path.sep)) {
        res.writeHead(403).end();
        return;
      }
      const real=await fs.realpath(file);
      if(!real.startsWith(root+path.sep)||!mime[path.extname(file)]){res.writeHead(404).end('Not found');return;}
      const content = await fs.readFile(real);
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options":"nosniff",
        "Referrer-Policy":"same-origin",
        "X-Frame-Options":"DENY",
      });
      res.end(req.method==='HEAD'?undefined:content);
    } catch {
      res.writeHead(404,{"X-Robots-Tag":"noindex, nofollow"}).end("Not found");
    }
  })
  .listen(port, host, () =>
    console.log('Persia Market '+(production?'public server':'preview')+': '+origin),
  );
server.maxRequestsPerSocket=100;
let stopping=false;
function shutdown(){if(stopping)return;stopping=true;server.close(()=>{comments.close();catalogue.close();auth.close();});const timer=setTimeout(()=>{server.closeAllConnections();},10000);timer.unref();}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
