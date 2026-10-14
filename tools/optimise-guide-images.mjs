import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [manifestFile,sharpModule]=process.argv.slice(2);
if(!manifestFile||!sharpModule)throw Error('Provide the generated-image manifest and installed sharp module path.');
const sharp=(await import(pathToFileURL(sharpModule).href)).default;
const manifest=JSON.parse(await fs.readFile(manifestFile,'utf8'));
const dest=path.join(root,'dist/assets/journal/guides-v1');
await fs.mkdir(dest,{recursive:true});
for(const record of manifest){
 if(!/^[a-z][a-z0-9-]*$/.test(record.id))throw Error('Invalid image ID');
 const source=sharp(record.source);
 const input=await source.metadata();
 const hero=await source.clone().resize({width:1280,withoutEnlargement:true}).webp({quality:82}).toFile(path.join(dest,record.id+'.webp'));
 const card=await source.clone().resize({width:640,withoutEnlargement:true}).webp({quality:78}).toFile(path.join(dest,record.id+'-card.webp'));
 record.input={width:input.width,height:input.height};
 record.hero={width:hero.width,height:hero.height,bytes:hero.size};
 record.card={width:card.width,height:card.height,bytes:card.size};
 console.log(record.id+': '+hero.width+'x'+hero.height+' / '+hero.size+' bytes; card '+card.size+' bytes');
}
await fs.writeFile(manifestFile,JSON.stringify(manifest,null,2)+'\n');
