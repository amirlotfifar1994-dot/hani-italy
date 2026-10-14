import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runtimeConfig} from '../server/runtime-config.mjs';
import {randomBytes} from 'node:crypto';
try{process.loadEnvFile(fileURLToPath(new URL('../.env',import.meta.url)));}catch(e){if(e.code!=='ENOENT')throw e;}
const {database,origin}=runtimeConfig();
if(process.argv.includes('--rotate')){if(process.env.ADMIN_SETUP_TOKEN)throw Error('Rotate ADMIN_SETUP_TOKEN in the hosting environment instead');const file=path.join(path.dirname(database),'admin-setup.token');await fs.writeFile(file,randomBytes(32).toString('base64url'),{mode:0o600});console.log('Restart the server to activate the rotated token. Rotation never changes an existing administrator.');}
try{const token=process.env.ADMIN_SETUP_TOKEN||(await fs.readFile(path.join(path.dirname(database),'admin-setup.token'),'utf8')).trim();console.log('Open this private, one-time owner setup link:');console.log(origin+'/admin.html#setup='+encodeURIComponent(token));}catch(e){if(e.code==='ENOENT')console.error('Start the server first.');else throw e;process.exitCode=1;}
