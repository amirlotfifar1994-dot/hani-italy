const host = document.querySelector('#blog-preview');
let dispose = () => {};
const copy = {
  fa: {previous:'داستان‌های قبلی',next:'داستان‌های بعدی',page:'گروه',of:'از',slide:'داستان'},
  en: {previous:'Previous stories',next:'Next stories',page:'Group',of:'of',slide:'Story'},
  it: {previous:'Storie precedenti',next:'Storie successive',page:'Gruppo',of:'di',slide:'Storia'},
};
function initialize() {
  dispose();
  const carousel = host?.querySelector('[data-journal-carousel]');
  if (!carousel) return;
  const track = carousel.querySelector('.journal-carousel-track');
  const cards = [...track.querySelectorAll('.journal-card')];
  const controls = carousel.querySelector('.journal-carousel-controls');
  const previous = carousel.querySelector('[data-story-previous]');
  const next = carousel.querySelector('[data-story-next]');
  const dots = carousel.querySelector('.journal-carousel-dots');
  const status = carousel.querySelector('.journal-carousel-status');
  const lang = document.documentElement.lang;
  const text = copy[lang] || copy.en;
  const rtl = getComputedStyle(track).direction === 'rtl';
  const number = value => new Intl.NumberFormat(lang).format(value);
  const controller = new AbortController();
  const options = {signal:controller.signal};
  let last = 0, frame = 0;
  previous.setAttribute('aria-label',text.previous);
  next.setAttribute('aria-label',text.next);
  previous.textContent = rtl ? '→' : '←';
  next.textContent = rtl ? '←' : '→';
  cards.forEach((card,index) => {
    card.setAttribute('aria-roledescription',text.slide);
    card.setAttribute('aria-label',number(index+1)+' '+text.of+' '+number(cards.length));
  });
  const offset = card => {
    const box = card.getBoundingClientRect(), viewport = track.getBoundingClientRect();
    return rtl ? box.right-viewport.right : box.left-viewport.left;
  };
  const current = () => {
    let nearest = 0, distance = Infinity;
    for (let index=0; index<=last; index++) {
      const candidate = Math.abs(offset(cards[index]));
      if (candidate < distance) { nearest=index; distance=candidate; }
    }
    return nearest;
  };
  const announce = index => {
    const value=number(index+1)+' / '+number(last+1);
    if(status.textContent!==value) status.textContent=value;
    status.setAttribute('aria-label',text.page+' '+number(index+1)+' '+text.of+' '+number(last+1));
  };
  const update = () => {
    const index=current();
    previous.disabled=index===0;
    next.disabled=index===last;
    [...dots.children].forEach((dot,i) => dot.setAttribute('aria-current',String(i===index)));
    announce(index);
  };
  const go = index => {
    const target=Math.max(0,Math.min(last,index));
    track.scrollBy({left:offset(cards[target]),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
  const measure = () => {
    if (!cards.length || !track.clientWidth) { controls.hidden=true; return; }
    const gap=parseFloat(getComputedStyle(track).columnGap)||0;
    const visible=Math.max(1,Math.floor((track.clientWidth+gap+1)/(cards[0].getBoundingClientRect().width+gap)));
    last=Math.max(0,cards.length-visible);
    controls.hidden=track.scrollWidth<=track.clientWidth+2;
    dots.replaceChildren(...Array.from({length:last+1},(_,index) => {
      const button=document.createElement('button');
      button.type='button';
      button.dataset.storyPage=String(index);
      button.setAttribute('aria-controls',track.id);
      button.setAttribute('aria-label',text.page+' '+number(index+1)+' '+text.of+' '+number(last+1));
      return button;
    }));
    update();
    announce(current());
  };
  previous.addEventListener('click',()=>go(current()-1),options);
  next.addEventListener('click',()=>go(current()+1),options);
  dots.addEventListener('click',event=>{
    const button=event.target.closest('[data-story-page]');
    if(button) go(Number(button.dataset.storyPage));
  },options);
  track.addEventListener('scroll',()=>{
    if(frame) return;
    frame=requestAnimationFrame(()=>{frame=0;update();});
  },{...options,passive:true});
  track.addEventListener('keydown',event=>{
    if(event.target!==track) return;
    const step=event.key==='ArrowRight'?(rtl?-1:1):event.key==='ArrowLeft'?(rtl?1:-1):0;
    if(!step && !['Home','End'].includes(event.key)) return;
    event.preventDefault();
    go(event.key==='Home'?0:event.key==='End'?last:current()+step);
  },options);
  const resize=new ResizeObserver(measure);
  resize.observe(track);
  measure();
  dispose=()=>{controller.abort();resize.disconnect();cancelAnimationFrame(frame);};
}
if(host) {
  initialize();
  new MutationObserver(initialize).observe(host,{childList:true});
}
