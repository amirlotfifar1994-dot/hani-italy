import extensions from './blog-editorial-extensions.json' with {type:'json'};

// Localise the authored additions without changing existing chapters or images.
export function expandEditorialPosts(posts){
 for(const [slug,extension] of Object.entries(extensions)){
  const post=posts.find(item=>item.slug===slug);
  if(!post)throw new Error('Missing editorial article: '+slug);
  for(const [lang,index] of Object.entries({fa:0,en:1,it:2})){
   const sections=post[lang].sections;
   const position=sections.findIndex(section=>section.id===extension.before);
   if(position<0)throw new Error('Missing insertion point for '+slug+'/'+lang);
   const additions=extension.sections.map(section=>({
    id:section.id,title:section.title[index],paragraphs:section.paragraphs[index],
    ...(section.list?{list:section.list[index]}:{}),
    ...(section.table?{table:{caption:section.table.caption[index],headers:section.table.headers[index],rows:section.table.rows[index]}}:{}),
    ...(section.related?{related:section.related.map(link=>({slug:link.slug,label:link.label[index]}))}:{})
   }));
   for(const section of additions)if(!section.title||!section.paragraphs?.length||sections.some(existing=>existing.id===section.id))throw new Error('Invalid editorial addition: '+slug+'/'+lang+'/'+section.id);
   sections.splice(position,0,...additions);
  }
  post.modifiedAt='2026-10-05';
 }
}
