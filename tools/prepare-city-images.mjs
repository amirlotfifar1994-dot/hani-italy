import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),sharp=require('sharp');
const manifestUrl=new URL('../research/city-photo-credits.json',import.meta.url);
const photos=JSON.parse(await fs.readFile(manifestUrl,'utf8'));
const tiles=[];
for(const photo of photos){
 const original=new URL('../dist/assets/journal/cities/'+photo.key+'.jpg',import.meta.url);
 const output=new URL('../dist/assets/journal/cities/'+photo.key+'.webp',import.meta.url);
 await sharp(fileURLToPath(original)).rotate().resize({width:1280,withoutEnlargement:true}).webp({quality:79,effort:5}).toFile(fileURLToPath(output));
 if((await fs.stat(output)).size>=400000){const smaller=await sharp(fileURLToPath(original)).rotate().resize({width:1000,withoutEnlargement:true}).webp({quality:67,effort:6}).toBuffer();await fs.writeFile(output,smaller);}
 const meta=await sharp(fileURLToPath(output)).metadata();
 photo.src='/assets/journal/cities/'+photo.key+'.webp';photo.width=meta.width;photo.height=meta.height;photo.bytes=(await fs.stat(output)).size;
 if(/This Photo was taken by Wolfgang Moroder/.test(photo.author))photo.author='Wolfgang Moroder';
 photo.cardImage='/assets/journal/cities/'+photo.key+'-card.webp';photo.cardWidth=640;photo.cardHeight=420;
 await sharp(fileURLToPath(output)).resize(640,420,{fit:'cover'}).webp({quality:76}).toFile(fileURLToPath(new URL('../dist'+photo.cardImage,import.meta.url)));
 const thumbnail=await sharp(fileURLToPath(output)).resize(240,160,{fit:'cover'}).toBuffer();
 const label=Buffer.from('<svg width="240" height="30"><rect width="240" height="30" fill="#f7f3ea"/><text x="10" y="21" font-family="sans-serif" font-size="13" fill="#173f39">'+photo.key+'</text></svg>');
 tiles.push(await sharp({create:{width:240,height:190,channels:3,background:'#f7f3ea'}}).composite([{input:thumbnail,top:0,left:0},{input:label,top:160,left:0}]).jpeg().toBuffer());
}
await fs.writeFile(manifestUrl,JSON.stringify(photos,null,2)+'\n');
await sharp({create:{width:1200,height:Math.max(190,Math.ceil(tiles.length/5)*190),channels:3,background:'#f7f3ea'}}).composite(tiles.map((input,i)=>({input,left:(i%5)*240,top:Math.floor(i/5)*190}))).jpeg({quality:88}).toFile(fileURLToPath(new URL('../screenshots/city-photo-review.jpg',import.meta.url)));
console.log('Prepared '+photos.length+' licensed WebP photographs and small card variants; '+Math.round(photos.reduce((sum,p)=>sum+p.bytes,0)/1024)+' KiB of full-size imagery.');
