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
try { process.loadEnvFile(fileURLToPath(new URL("../.env",import.meta.url))); } catch(error) {if(error.code!=="ENOENT")throw error;}
const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const {production,port,host,database,origin,privateDir,siteUrl,uploadDir,clientAddress}=runtimeConfig();
await fs.mkdir(privateDir,{recursive:true});
const setupFile=path.join(privateDir,'admin-setup.token');let adminSetupToken=process.env.ADMIN_SETUP_TOKEN;
if(!adminSetupToken){try{adminSetupToken=(await fs.readFile(setupFile,'utf8')).trim();}catch(e){if(e.code!=='ENOENT')throw e;adminSetupToken=randomBytes(32).toString('base64url');try{await fs.writeFile(setupFile,adminSetupToken,{flag:'wx',mode:0o600});}catch(e){if(e.code!=='EEXIST')throw e;adminSetupToken=(await fs.readFile(setupFile,'utf8')).trim();}}}
const auth=createAuth({database,origin,adminSetupToken,clientAddress,google:{clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET}});
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
  .createServer(async (req, res) => {
    try {
      const requestUrl=new URL(req.url,"http://localhost");
      if(requestUrl.pathname==='/healthz'){
        res.setHeader('X-Robots-Tag','noindex, nofollow');
        if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
        res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(req.method==='HEAD'?undefined:JSON.stringify({status:'ok'}));return;
      }
      if(requestUrl.pathname.startsWith('/api/'))res.setHeader('X-Robots-Tag','noindex, nofollow');
      if(await auth.handle(req,res,requestUrl))return;
      if(await comments.handle(req,res,requestUrl))return;
      if(await catalogue.handle(req,res,requestUrl))return;
      if(seo.handle(req,res,requestUrl))return;
      if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405).end();return;}
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const file = path.resolve(
        root,
        "." + (pathname === "/" ? "/index.html" : pathname),
      );
      if (file!==root && !file.startsWith(root+path.sep)) {
        res.writeHead(403).end();
        return;
      }
      const content = await fs.readFile(file);
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options":"nosniff",
        "Referrer-Policy":"same-origin",
        "X-Frame-Options":"DENY",
      });
      res.end(content);
    } catch {
      res.writeHead(404,{"X-Robots-Tag":"noindex, nofollow"}).end("Not found");
    }
  })
  .listen(port, host, () =>
    console.log('Persia Market '+(production?'public server':'preview')+': '+origin),
  );
let stopping=false;
function shutdown(){if(stopping)return;stopping=true;server.close(()=>{comments.close();catalogue.close();auth.close();});const timer=setTimeout(()=>{server.closeAllConnections();},10000);timer.unref();}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
