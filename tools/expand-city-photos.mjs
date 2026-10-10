// Real, reusable landmark photos. Resumable; records creator, licence and source.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const sharp=createRequire(import.meta.url)('sharp');
const manifestUrl=new URL('../research/city-photo-credits.json',import.meta.url);
const queries=[
 ['milan-duomo-detail','intitle:"Duomo" Milano'],['milan-brera','intitle:"Brera" cortile -1844'],['milan-castello','Castello Sforzesco Milano courtyard'],
 ['rome-colosseum-detail','Colosseum Rome interior arena'],['rome-navona','Piazza Navona Rome fountain'],['rome-trastevere','Santa Maria Trastevere piazza Rome'],
 ['turin-royal','intitle:"Palazzo Reale" Torino -Caserta'],['turin-egizio','intitle:"Museo Egizio" Torino'],['turin-po','"Piazza Vittorio Veneto" Torino -Fortepan'],
 ['bologna-san-petronio','Basilica San Petronio Bologna facade'],['bologna-quadrilatero','Bologna "Pescherie"'],['bologna-towers','Bologna Due Torri Asinelli Garisenda'],
 ['florence-duomo-detail','intitle:"Santa Maria del Fiore" facciata -drawing -disegno'],['florence-uffizi','Uffizi courtyard Florence'],['florence-oltrarno','Piazza Santo Spirito Firenze'],
 ['venice-rialto','Rialto bridge Venice Grand Canal'],['venice-cannaregio','Cannaregio Venice canal'],['venice-burano','Burano coloured houses canal'],
 ['naples-spaccanapoli','Spaccanapoli Napoli street'],['naples-san-gregorio','"Via San Gregorio Armeno" -Claustro -Chiostro -church -chiesa'],['naples-mann','intitle:"Museo Archeologico Nazionale di Napoli"'],
 ['genoa-san-lorenzo','Genova Cattedrale San Lorenzo facade'],['genoa-porto-antico','"Porto Antico" "Bigo" -Bettolo'],['genoa-boccadasse-detail','Boccadasse Genova beach houses'],
 ['palermo-cathedral-detail','Palermo Cathedral facade'],['palermo-norman','Palermo Palazzo Normanni courtyard'],['palermo-ballaro','Palermo Ballaro market'],
 ['verona-arena-detail','Verona Arena interior'],['verona-erbe','Verona Piazza Erbe'],['verona-castelvecchio','Castelvecchio Verona castle']
];
const photos=JSON.parse(await fs.readFile(manifestUrl,'utf8'));
const strip=value=>String(value||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
async function json(url){const r=await fetch(url,{headers:{'User-Agent':'PersiaMarketCityJournal/1.0 (licensed editorial photos)'},signal:AbortSignal.timeout(40000)});if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
for(const [key,query] of queries){
 if(photos.some(p=>p.key===key))continue;
 const url='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',format:'json',generator:'search',gsrnamespace:'6',gsrlimit:'20',gsrsearch:query,prop:'imageinfo',iiprop:'url|extmetadata|size',iiurlwidth:'1280'});
 try{
  const data=await json(url),candidates=Object.values(data.query?.pages||{}).sort((a,b)=>a.index-b.index);
  const page=candidates.find(p=>{const i=p.imageinfo?.[0],l=i?.extmetadata?.LicenseShortName?.value;return i&&i.width>=900&&i.width/i.height>.65&&i.width/i.height<2.5&&/^(CC BY(?:-SA)? [1-4]\.0|CC0)$/.test(l)&&/\.(jpe?g|png)(\?|$)/i.test(i.url)&&!photos.some(old=>old.title===p.title)&&!/(Caserta|1844|engraving|lithograph|drawing)/i.test(p.title+' '+strip(i.extmetadata.ImageDescription?.value));});
  if(!page)throw Error('No licensed candidate');
  const info=page.imageinfo[0],meta=info.extmetadata,downloaded=info.thumburl||info.url;
  const response=await fetch(downloaded,{headers:{'User-Agent':'PersiaMarketCityJournal/1.0'},signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error('Image HTTP '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer()),base=new URL('../dist/assets/journal/cities/'+key,import.meta.url);
  await fs.writeFile(fileURLToPath(base)+'.jpg',bytes);
  const output=fileURLToPath(base)+'.webp';await sharp(bytes).rotate().resize({width:1120,withoutEnlargement:true}).webp({quality:76,effort:5}).toFile(output);
  if((await fs.stat(output)).size>=400000){const smaller=await sharp(bytes).rotate().resize({width:1000,withoutEnlargement:true}).webp({quality:67,effort:6}).toBuffer();await fs.writeFile(output,smaller);}
  const dimensions=await sharp(output).metadata();const card=fileURLToPath(base)+'-card.webp';await sharp(output).resize(640,420,{fit:'cover'}).webp({quality:74}).toFile(card);
  photos.push({key,title:page.title,src:'/assets/journal/cities/'+key+'.webp',width:dimensions.width,height:dimensions.height,bytes:(await fs.stat(output)).size,author:strip(meta.Artist?.value),license:meta.LicenseShortName.value,licenseUrl:meta.LicenseUrl?.value||'https://creativecommons.org/publicdomain/mark/1.0/',source:info.descriptionurl,original:info.url,downloaded,description:strip(meta.ImageDescription?.value),cardImage:'/assets/journal/cities/'+key+'-card.webp',cardWidth:640,cardHeight:420});
  await fs.writeFile(manifestUrl,JSON.stringify(photos,null,2)+'\n');console.log(key+': '+page.title+' ['+meta.LicenseShortName.value+']');
 }catch(error){console.error(key+': '+error.message);if(/429/.test(error.message))break;}
 await new Promise(resolve=>setTimeout(resolve,5000));
}
const missing=queries.filter(([key])=>!photos.some(p=>p.key===key));if(missing.length){console.error('Missing: '+missing.map(q=>q[0]).join(', '));process.exitCode=1;}
const tiles=await Promise.all(photos.filter(p=>queries.some(([key])=>key===p.key)).map(async p=>{const thumb=await sharp(fileURLToPath(new URL('../dist'+p.src,import.meta.url))).resize(240,160,{fit:'cover'}).toBuffer(),label=Buffer.from('<svg width="240" height="30"><rect width="240" height="30" fill="#f7f3ea"/><text x="8" y="20" font-family="sans-serif" font-size="12">'+p.key+'</text></svg>');return sharp({create:{width:240,height:190,channels:3,background:'#f7f3ea'}}).composite([{input:thumb,top:0,left:0},{input:label,top:160,left:0}]).jpeg().toBuffer();}));
await sharp({create:{width:1200,height:Math.max(190,Math.ceil(tiles.length/5)*190),channels:3,background:'#f7f3ea'}}).composite(tiles.map((input,i)=>({input,left:(i%5)*240,top:Math.floor(i/5)*190}))).jpeg({quality:88}).toFile(fileURLToPath(new URL('../screenshots/city-landmarks-review.jpg',import.meta.url)));
