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
try { process.loadEnvFile(fileURLToPath(new URL("../.env",import.meta.url))); } catch(error) {if(error.code!=="ENOENT")throw error;}
const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const port = Number(process.env.PREVIEW_PORT || 4194);
const database=process.env.PERSIA_DB || fileURLToPath(new URL("../.local-data/accounts.sqlite",import.meta.url));
const origin=process.env.AUTH_ORIGIN || "http://127.0.0.1:"+port;
const privateDir=path.dirname(database);await fs.mkdir(privateDir,{recursive:true});
const setupFile=path.join(privateDir,'admin-setup.token');let adminSetupToken=process.env.ADMIN_SETUP_TOKEN;
if(!adminSetupToken){try{adminSetupToken=(await fs.readFile(setupFile,'utf8')).trim();}catch(e){if(e.code!=='ENOENT')throw e;adminSetupToken=randomBytes(32).toString('base64url');try{await fs.writeFile(setupFile,adminSetupToken,{flag:'wx',mode:0o600});}catch(e){if(e.code!=='EEXIST')throw e;adminSetupToken=(await fs.readFile(setupFile,'utf8')).trim();}}}
const auth=createAuth({database,origin,adminSetupToken,google:{clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET}});
const catalogue=await createCatalogue({database,origin,uploadDir:process.env.PERSIA_UPLOAD_DIR||path.join(privateDir,'uploads'),seed:JSON.parse(await fs.readFile(path.join(root,'catalogue.json'),'utf8')),authorize:auth.authorize});
const comments=createComments({database,origin,identify:auth.identify,authorize:auth.authorize,resolveTarget:(kind,target)=>{const item=kind==='product'?catalogue.publicProducts().find(p=>p.id===target):kind==='article'?posts.find(p=>p.slug===target):null;return item?{title:kind==='product'?item.name:{fa:item.fa.title,en:item.en.title,it:item.it.title}}:null;}});
const seo=await createSeo({root,catalogue,comments,origin,siteUrl:process.env.SITE_URL||'',indexing:process.env.SEO_INDEXING==='true'});
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
http
  .createServer(async (req, res) => {
    try {
      const requestUrl=new URL(req.url,"http://localhost");
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
  .listen(port, "127.0.0.1", () =>
    console.log("Persia Market preview: http://127.0.0.1:" + port),
  );
