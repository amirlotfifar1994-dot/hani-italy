import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
try{process.loadEnvFile(fileURLToPath(new URL('../.env',import.meta.url)));}catch(e){if(e.code!=='ENOENT')throw e;}
const database=process.env.PERSIA_DB||fileURLToPath(new URL('../.local-data/accounts.sqlite',import.meta.url));
try{const token=process.env.ADMIN_SETUP_TOKEN||(await fs.readFile(path.join(path.dirname(database),'admin-setup.token'),'utf8')).trim();console.log('Open this private, one-time owner setup link locally:');console.log((process.env.AUTH_ORIGIN||'http://127.0.0.1:'+(process.env.PREVIEW_PORT||4194))+'/admin.html#setup='+encodeURIComponent(token));}catch(e){if(e.code==='ENOENT')console.error('Start npm run dev first.');else throw e;process.exitCode=1;}
