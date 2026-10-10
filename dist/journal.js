// The complete journal remains readable without JavaScript.
const journalSearch=document.querySelector('#journal-search');
const journalCards=[...document.querySelectorAll('#journal-results [data-journal-card]')];
const journalFilters=[...document.querySelectorAll('[data-journal-filter]')];
const journalCount=document.querySelector('#journal-result-count');
const journalReset=document.querySelector('#journal-reset');
const journalEmpty=document.querySelector('#journal-empty');
const journalLanguageLinks=[...document.querySelectorAll('.seo-header nav a[lang]')];
const journalTopics=new Set(journalFilters.map(button=>button.dataset.journalFilter));
const journalNumber=new Intl.NumberFormat(document.documentElement.lang==='fa'?'fa-IR':document.documentElement.lang==='it'?'it-IT':'en-GB');
const journalNormalize=value=>value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f]/g,'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\u200c/g,' ').replace(/\s+/g,' ').trim();
let journalTopic='all';

function journalUrlState(url){
 if(journalTopic==='all')url.searchParams.delete('topic');else url.searchParams.set('topic',journalTopic);
 const query=journalSearch.value.trim();
 if(query)url.searchParams.set('q',query);else url.searchParams.delete('q');
 return url;
}
function filterJournal(writeUrl=true){
 const tokens=journalNormalize(journalSearch.value).split(' ').filter(Boolean);
 let visible=0;
 for(const card of journalCards){
  const text=journalNormalize(card.dataset.search||card.textContent);
  card.hidden=!(journalTopic==='all'||card.dataset.topic===journalTopic)||!tokens.every(token=>text.includes(token));
  if(!card.hidden)visible++;
 }
 journalFilters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.journalFilter===journalTopic)));
 const countFormat=visible===1?journalCount.dataset.resultSingularFormat:journalCount.dataset.resultFormat;
 journalCount.textContent=countFormat.replace('%n%',journalNumber.format(visible));
 journalEmpty.hidden=visible>0;
 journalReset.hidden=journalTopic==='all'&&!journalSearch.value;
 journalLanguageLinks.forEach(link=>{link.href=journalUrlState(new URL(link.href)).href;});
 if(writeUrl){const next=journalUrlState(new URL(location.href));if(next.href!==location.href)history.replaceState(null,'',next);}
}
function restoreJournal(){
 const params=new URL(location.href).searchParams;
 journalTopic=journalTopics.has(params.get('topic'))?params.get('topic'):'all';
 journalSearch.value=(params.get('q')||'').slice(0,100);
 filterJournal(false);
}
if(journalSearch&&journalCount&&journalReset&&journalEmpty){
 journalFilters.forEach(button=>button.addEventListener('click',()=>{journalTopic=button.dataset.journalFilter;filterJournal();}));
 journalSearch.addEventListener('input',()=>filterJournal());
 journalSearch.addEventListener('keydown',event=>{if(event.key==='Escape'){journalSearch.value='';filterJournal();}});
 journalReset.addEventListener('click',()=>{journalTopic='all';journalSearch.value='';filterJournal();journalSearch.focus();});
 window.addEventListener('popstate',restoreJournal);
 window.addEventListener('pageshow',restoreJournal);
 restoreJournal();
}
