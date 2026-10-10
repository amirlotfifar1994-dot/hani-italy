import path from 'node:path';
import {isIP} from 'node:net';
import {fileURLToPath} from 'node:url';

export function runtimeConfig(env=process.env){
 const production=env.NODE_ENV==='production';
 const port=Number(env.PORT||env.PREVIEW_PORT||4194);
 if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT must be an integer between 1 and 65535');
 const host=env.HOST||(production?'0.0.0.0':'127.0.0.1');
 const configuredOrigin=env.AUTH_ORIGIN||env.SITE_URL||env.RENDER_EXTERNAL_URL||(env.RAILWAY_PUBLIC_DOMAIN?'https://'+env.RAILWAY_PUBLIC_DOMAIN:'');
 if(production&&!configuredOrigin)throw Error('Set an HTTPS AUTH_ORIGIN or public hosting domain before starting production');
 const url=new URL(configuredOrigin||'http://127.0.0.1:'+port);
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash||(production&&url.protocol!=='https:'))throw Error('AUTH_ORIGIN must be a public HTTPS origin in production, without paths or credentials');
 if(production&&!env.PERSIA_DATA_DIR&&!env.PERSIA_DB)throw Error('Production requires PERSIA_DATA_DIR or PERSIA_DB on persistent storage');
 const directory=env.PERSIA_DATA_DIR||fileURLToPath(new URL('../.local-data/',import.meta.url));
 const database=env.PERSIA_DB||path.join(directory,'accounts.sqlite');
 const privateDir=path.dirname(database);
 const siteUrl=env.SITE_URL||(production?url.origin:'');
 const trustedProxyHops=Number(env.TRUST_PROXY_HOPS||0);
 if(!Number.isInteger(trustedProxyHops)||trustedProxyHops<0||trustedProxyHops>8)throw Error('TRUST_PROXY_HOPS must be an integer between 0 and 8');
 const clientAddress=req=>{
  const direct=req.socket.remoteAddress||'unknown';
  if(!trustedProxyHops)return direct;
  const forwarded=String(req.headers['x-forwarded-for']||'').split(',').map(s=>s.trim()).filter(Boolean);
  const candidate=[...forwarded,direct].at(-1-trustedProxyHops);
  return candidate&&isIP(candidate)?candidate:direct;
 };
 return {production,port,host,database,privateDir,origin:url.origin,siteUrl,clientAddress,uploadDir:env.PERSIA_UPLOAD_DIR||path.join(privateDir,'uploads')};
}
