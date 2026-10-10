// Reading navigation enhances native anchors; the article also works without JavaScript.
const readingNav=document.querySelector('[data-reading-nav]');
if(readingNav){
 const menu=readingNav.querySelector('details');
 const menuTrigger=menu.querySelector('summary');
 const currentLabel=readingNav.querySelector('[data-reading-current]');
 const progress=readingNav.querySelector('[data-reading-progress]');
 const links=[...menu.querySelectorAll('a[href^="#"]')];
 const entries=links.map(link=>({link,section:document.getElementById(link.hash.slice(1))})).filter(entry=>entry.section);
 let scheduled=false;
 const update=()=>{
  scheduled=false;
  const threshold=readingNav.getBoundingClientRect().height+48;
  let active=entries[0];
  for(const entry of entries){if(entry.section.getBoundingClientRect().top<=threshold)active=entry;}
  if(active){
   for(const entry of entries){
    if(entry===active)entry.link.setAttribute('aria-current','location');
    else entry.link.removeAttribute('aria-current');
   }
   currentLabel.textContent=active.link.querySelector('[data-reading-title]').textContent;
  }
  const articleEnd=document.querySelector('.journal-reading-layout').getBoundingClientRect().bottom+window.scrollY;
  const articleStart=entries[0]?.section.getBoundingClientRect().top+window.scrollY||0;
  const fraction=Math.max(0,Math.min(1,(window.scrollY-articleStart+threshold)/Math.max(1,articleEnd-articleStart-window.innerHeight)));
  progress.style.transform='scaleX('+fraction+')';
 };
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}};
 for(const {link} of entries)link.addEventListener('click',()=>{menu.open=false;schedule();});
 document.addEventListener('click',event=>{if(menu.open&&!readingNav.contains(event.target))menu.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menuTrigger.focus();}});
 menu.addEventListener('toggle',schedule);
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule);
 window.addEventListener('hashchange',schedule);
 update();
}
