import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sharp=(await import(pathToFileURL(process.argv[2]).href)).default;
const files=['journal-inline-images-2026-10-08.json','journal-inline-extra-images-2026-10-08.json'];
const dest=path.join(root,'dist/assets/journal/details-v1');
const originals=path.join(root,'research/generated-journal-details');
await fs.mkdir(dest,{recursive:true});await fs.mkdir(originals,{recursive:true});
const thumbs=[];let count=0,total=0;
for(const file of files){
 const manifestPath=path.join(root,'research',file);
 const records=JSON.parse(await fs.readFile(manifestPath,'utf8'));
 for(const r of records){
  if(!/^[a-z][a-z0-9-]*$/.test(r.id)||!r.source)throw Error('Missing image: '+r.id);
  const local=path.join(originals,r.id+'.png');await fs.copyFile(r.source,local);
  r.localOriginal='research/generated-journal-details/'+r.id+'.png';
  const output=await sharp(local).resize({width:1280,withoutEnlargement:true}).webp({quality:80}).toFile(path.join(dest,r.id+'.webp'));
  r.output={src:'/assets/journal/details-v1/'+r.id+'.webp',width:output.width,height:output.height,bytes:output.size};
  if(r.id==='hani-brand'){
   const card=await sharp(local).resize({width:640,withoutEnlargement:true}).webp({quality:78}).toFile(path.join(dest,r.id+'-card.webp'));
   r.card={src:'/assets/journal/details-v1/'+r.id+'-card.webp',width:card.width,height:card.height,bytes:card.size};
  }
  const thumbnail=await sharp(local).resize(240,160,{fit:'cover'}).toBuffer();
  thumbs.push({input:thumbnail,left:count%4*240,top:Math.floor(count/4)*190});count++;total+=output.size;
 }
 await fs.writeFile(manifestPath,JSON.stringify(records,null,2)+'\n');
}
await fs.mkdir(path.join(root,'screenshots'),{recursive:true});
await sharp({create:{width:960,height:Math.ceil(count/4)*190,channels:3,background:'#f7f4ed'}}).composite(thumbs).jpeg({quality:82}).toFile(path.join(root,'screenshots/journal-details-contact-sheet.jpg'));
console.log(JSON.stringify({images:count,totalWebpBytes:total,contactSheet:'screenshots/journal-details-contact-sheet.jpg'}));
