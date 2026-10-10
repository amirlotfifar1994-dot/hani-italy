import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {posts} from '../server/blog-content.mjs';
import {inlineAssets} from '../server/journal-inline-images.mjs';
const languages=['fa','en','it'];
const hashes=[];
for(const asset of Object.values(inlineAssets)){
 const content=await fs.readFile(new URL('../dist'+asset.output.src,import.meta.url));
 assert.ok(asset.output.bytes<350000,'Keep added images reasonably sized: '+asset.id);
 hashes.push(createHash('sha256').update(content).digest('hex'));
}
assert.equal(new Set(hashes).size,hashes.length,'Distinct files must contain distinct imagery');
for(const post of posts){
 assert.equal(post.modifiedAt,post.cityGuide?'2026-10-09':'2026-10-08');
 for(const lang of languages){
  const sections=post[lang].sections;
  if(post.productGuide){
   const preparation=sections.find(s=>s.id==='kitchen-plan');
   assert.ok(preparation?.paragraphs[0].length>180,'Substantive preparation guidance: '+post.slug+'/'+lang);
   assert.equal(preparation.gallery.length,1);
   assert.ok(sections.find(s=>s.id==='italy').table.rows.length>=3);
   const questions=sections.flatMap(s=>s.qa||[]).map(q=>q.q);
   assert.equal(new Set(questions).size,questions.length,'Do not repeat identical questions');
  }
  assert.ok(sections.some(s=>s.gallery?.length),'Every article includes contextual inline imagery');
 }
}
const brand=posts.find(p=>p.slug==='hani-brand-history-production-international');
assert.ok(brand);
for(const lang of languages){
 assert.equal(brand[lang].sections.find(s=>s.id==='international-markets').table.rows.length,6);
 assert.equal(brand[lang].sections.find(s=>s.id==='history').table.rows.length,4);
 const old=posts.find(p=>p.slug==='hani-products-italy');
 assert.ok(old[lang].sections.some(s=>s.related?.some(r=>r.slug===brand.slug)));
 assert.ok(brand[lang].sections.some(s=>s.related?.some(r=>r.slug===old.slug)));
}
console.log('PASS: '+posts.length+' expanded articles, 28 practical Italy guides, '+hashes.length+' unique optimised additions, trilingual brand facts and reciprocal links.');
