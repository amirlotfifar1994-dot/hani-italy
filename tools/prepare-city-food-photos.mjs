// Reusable photographs of the forty foods in the city guides; resumable.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {localFoods} from '../server/italy-local-foods.mjs';
const sharp=createRequire(import.meta.url)('sharp');
const manifest=new URL('../research/city-food-photo-credits.json',import.meta.url);
const dir=new URL('../dist/assets/journal/city-foods/',import.meta.url);
await fs.mkdir(dir,{recursive:true});
let photos=[];try{photos=JSON.parse(await fs.readFile(manifest,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const overrides={
 'milan-1':'intitle:"Risotto" milanese', 'milan-2':'intitle:"Cotoletta" milanese', 'milan-3':'intitle:"Ossobuco"',
 'rome-1':'intitle:"Cacio e pepe"','rome-2':'intitle:"Spaghetti" carbonara','rome-3':'intitle:"Amatriciana"','rome-4':'intitle:"Carciofi alla romana"',
 'turin-1':'intitle:"Bicerin" drink','turin-2':'intitle:"Agnolotti" plin','turin-3':'intitle:"Bagna cauda"','turin-4':'intitle:"Gianduiotto"',
 'bologna-1':'intitle:"Tagliatelle" ragù','bologna-2':'Tortellini brodo','bologna-3':'intitle:"Lasagne verdi romagnole"','bologna-4':'intitle:"Mortadella" -turkey -Qibbla -Linnunlihamakkara -tacchino -kalkon',
 'florence-1':'intitle:"Ribollita"','florence-2':'intitle:"Pappa al pomodoro"','florence-3':'intitle:"Bistecca alla fiorentina"','florence-4':'intitle:"Lampredotto" sandwich',
 'venice-1':'intitle:"Cicchetti"','venice-2':'intitle:"Sarde in saor"','venice-3':'intitle:"Risi e bisi"','venice-4':'intitle:"Fritulis"',
 'naples-1':'intitle:"Pizza marinara"','naples-2':'intitle:"Pizza Margherita"','naples-3':'intitle:"Sfogliatella"','naples-4':'intitle:"Babà"',
 'genoa-1':'intitle:"Trofie" pesto','genoa-2':'intitle:"Focaccia" genovese','genoa-3':'intitle:"Farinata" -Piazza -Uberti -Fontana','genoa-4':'intitle:"Pansoti"',
 'palermo-1':'intitle:"Panelle"','palermo-2':'intitle:"Crocchè"','palermo-3':'intitle:"Arancine"','palermo-4':'intitle:"Cannoli"',
 'verona-1':'intitle:"Gnocchi" plate','verona-2':'intitle:"Risotto all" Amarone','verona-3':'intitle:"Pearà"','verona-4':'intitle:"Pandoro"'
};
const forcedTitles={'rome-2':'File:Spaghetti carbonara at restaurant La Famiglia.jpg','naples-2':'File:Eq it-na pizza-margherita sep2005 sml.jpg','naples-4':'File:Babà rum.jpg','genoa-3':'File:Farinata.nel piatto.jpg'};
const generated=JSON.parse(await fs.readFile(new URL('../research/city-food-generated-credits.json',import.meta.url),'utf8'));
const queries=Object.entries(localFoods).flatMap(([city,dishes])=>dishes.map((d,index)=>({key:city+'-'+(index+1),name:d.name,query:overrides[city+'-'+(index+1)]||d.name})));
const strip=v=>String(v||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
const headers={'User-Agent':'PersiaMarketCityJournal/1.0 (licensed editorial food photographs)'};
for(const {key,name,query} of queries){
 if(photos.some(p=>p.key===key)||generated.some(p=>p.key===key))continue;
 try{
  const response=await fetch('https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',format:'json',...(forcedTitles[key]?{titles:forcedTitles[key]}:{generator:'search',gsrnamespace:'6',gsrlimit:'30',gsrsearch:query}),prop:'imageinfo',iiprop:'url|extmetadata|size',iiurlwidth:'1120'}),{headers,signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();const candidates=Object.values(data.query?.pages||{}).sort((a,b)=>a.index-b.index);
  const page=candidates.find(p=>{const i=p.imageinfo?.[0],l=i?.extmetadata?.LicenseShortName?.value;return i&&i.width>=650&&i.width/i.height>.65&&i.width/i.height<2.6&&/^(CC BY(?:-SA)? [1-4]\.[05]|CC0)$/.test(l)&&/\.(jpe?g|png)(\?|$)/i.test(i.url)&&!photos.some(old=>old.title===p.title)&&!/(drawing|engraving|logo|diagram|package|packaging|iglesia|church|piazza|cattedrale|chapel|painting|Pietatella|fritole seller|turkey|Qibbla)/i.test(p.title);});
  if(!page)throw Error('No licensed candidate');
  const info=page.imageinfo[0],meta=info.extmetadata,downloaded=info.thumburl||info.url;
  const imageResponse=await fetch(downloaded,{headers,signal:AbortSignal.timeout(60000)});if(!imageResponse.ok)throw Error('Image HTTP '+imageResponse.status);
  const bytes=Buffer.from(await imageResponse.arrayBuffer());await fs.writeFile(new URL(key+'.jpg',dir),bytes);
  const output=new URL(key+'.webp',dir);await sharp(bytes).rotate().resize({width:960,withoutEnlargement:true}).webp({quality:74,effort:5}).toFile(fileURLToPath(output));
  const dimensions=await sharp(fileURLToPath(output)).metadata();
  await sharp(bytes).rotate().resize(640,420,{fit:'cover'}).webp({quality:74}).toFile(fileURLToPath(new URL(key+'-card.webp',dir)));
  photos.push({key,name,title:page.title,src:'/assets/journal/city-foods/'+key+'.webp',width:dimensions.width,height:dimensions.height,bytes:(await fs.stat(output)).size,author:strip(meta.Artist?.value),license:meta.LicenseShortName.value,licenseUrl:meta.LicenseUrl?.value||'https://creativecommons.org/publicdomain/zero/1.0/',source:info.descriptionurl,original:info.url,downloaded,description:strip(meta.ImageDescription?.value),cardImage:'/assets/journal/city-foods/'+key+'-card.webp',cardWidth:640,cardHeight:420});
  await fs.writeFile(manifest,JSON.stringify(photos,null,2)+'\n');console.log(key+': '+page.title);
 }catch(e){console.error(key+': '+e.message);if(/429/.test(e.message))break;}
 await new Promise(r=>setTimeout(r,5000));
}
const missing=queries.filter(q=>!photos.some(p=>p.key===q.key)&&!generated.some(p=>p.key===q.key));if(missing.length){console.error('Missing: '+missing.map(q=>q.key).join(', '));process.exitCode=1;}
const tiles=await Promise.all(queries.filter(q=>[...photos,...generated].some(p=>p.key===q.key)).map(async q=>{const p=[...photos,...generated].find(p=>p.key===q.key),thumb=await sharp(fileURLToPath(new URL('../dist'+p.src,import.meta.url))).resize(240,160,{fit:'cover'}).toBuffer(),label=Buffer.from('<svg width="240" height="30"><rect width="240" height="30" fill="#f7f3ea"/><text x="8" y="20" font-family="sans-serif" font-size="12">'+p.key+'</text></svg>');return sharp({create:{width:240,height:190,channels:3,background:'#f7f3ea'}}).composite([{input:thumb,top:0,left:0},{input:label,top:160,left:0}]).jpeg().toBuffer();}));
await sharp({create:{width:1200,height:Math.max(190,Math.ceil(tiles.length/5)*190),channels:3,background:'#f7f3ea'}}).composite(tiles.map((input,i)=>({input,left:i%5*240,top:Math.floor(i/5)*190}))).jpeg({quality:88}).toFile(fileURLToPath(new URL('../screenshots/city-foods-review.jpg',import.meta.url)));
