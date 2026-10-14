import sharp from 'sharp';
import fs from 'node:fs/promises';
const input=process.argv[2];if(!input)throw Error('Pass the generated transparent logo PNG path');
const source=await sharp(input).metadata();if(!source.hasAlpha)throw Error('Logo must retain a transparent background');
await fs.mkdir('dist/assets/brand',{recursive:true});
await fs.copyFile(input,'dist/assets/brand/pasargadae-original-v1.png');
await sharp(input).resize(512,512,{fit:'inside'}).webp({lossless:true}).toFile('dist/assets/persia-pasargadae-v1.webp');
await sharp(input).resize(64,64,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile('dist/favicon-pasargadae-v1.png');
for(const file of ['dist/index.html','dist/account.js','dist/admin.js','dist/persia-theme.css','server/blog.mjs','server/local-seo.mjs','server/seo.mjs','server/seo-pages.mjs']){const text=await fs.readFile(file,'utf8');await fs.writeFile(file,text.replaceAll('persia-mark.svg','persia-pasargadae-v1.webp'));}
for(const file of ['dist/index.html','dist/admin.html','server/blog.mjs','server/seo-pages.mjs','server/seo.mjs']){const text=await fs.readFile(file,'utf8');await fs.writeFile(file,text.replaceAll('favicon.svg','favicon-pasargadae-v1.png').replace('type="image/svg+xml"','type="image/png"'));}
console.log('Saved transparent production mark, original generated PNG and favicon; updated site, account, admin and organization metadata.');
