/* Space42 · Brand Guidelines V2 — page behaviour */
(function(){
var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
/* toast */
var toast=document.createElement('div'); toast.className='toast'; document.body.appendChild(toast);
var tt; function say(msg){ toast.textContent=msg; toast.classList.add('is-on'); clearTimeout(tt); tt=setTimeout(function(){toast.classList.remove('is-on')},1600); }
function copy(text){
if(navigator.clipboard&&window.isSecureContext){ return navigator.clipboard.writeText(text); }
var t=document.createElement('textarea'); t.value=text; t.style.position='fixed'; t.style.opacity='0'; document.body.appendChild(t); t.select();
try{document.execCommand('copy')}catch(e){} document.body.removeChild(t); return Promise.resolve();
}
/* copy buttons: [data-copy] copies its value, or the text of [data-copy-target] */
document.addEventListener('click',function(e){
var b=e.target.closest('[data-copy],[data-copy-target]'); if(!b) return;
var txt=b.getAttribute('data-copy');
if(txt===null){ var tgt=document.getElementById(b.getAttribute('data-copy-target')); txt=tgt?tgt.innerText.trim():''; }
copy(txt).then(function(){
say('Copied · '+(txt.length>40?txt.slice(0,40)+'…':txt));
if(b.classList.contains('copybtn')){ var o=b.textContent; b.textContent='Copied'; b.classList.add('is-done'); setTimeout(function(){b.textContent=o;b.classList.remove('is-done')},1400); }
});
});
document.addEventListener('click',function(e){ var a=e.target.closest('[data-soon]'); if(!a) return; e.preventDefault(); say('This file is being prepared — available soon'); });
/* tabs */
$$('[data-tabs]').forEach(function(g){
var tabs=$$('.tab',g), panes=$$('.tabpane',g);
tabs.forEach(function(t,i){ t.addEventListener('click',function(){
tabs.forEach(function(x,j){ x.classList.toggle('is-on',j===i); x.setAttribute('aria-selected',j===i) });
panes.forEach(function(p,j){ p.hidden=j!==i });
})});
});
/* segmented toggles: icon grid light/dark */
$$('[data-seg]').forEach(function(seg){
var target=document.getElementById(seg.getAttribute('data-seg'));
$$('button',seg).forEach(function(b){ b.addEventListener('click',function(){
$$('button',seg).forEach(function(x){x.classList.toggle('is-on',x===b)});
var dark=b.getAttribute('data-v')==='dark';
target.classList.toggle('is-dark',dark);
$$('img[data-blue]',target).forEach(function(im){ im.src=dark?im.getAttribute('data-white'):im.getAttribute('data-blue') });
})});
});
/* side nav: mobile menu + scroll spy */
var nav=$('.side'), menu=$('.side__menu');
if(menu) menu.addEventListener('click',function(){ var o=nav.classList.toggle('is-open'); menu.setAttribute('aria-expanded',o); document.body.style.overflow=o?'hidden':'' });
$$('.side a').forEach(function(a){ a.addEventListener('click',function(){ nav.classList.remove('is-open'); document.body.style.overflow='' }) });
var links=$$('.side__links a[href^="#"]'), map={};
links.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a });
if('IntersectionObserver' in window){
var spy=new IntersectionObserver(function(es){
es.forEach(function(e){ if(e.isIntersecting){ links.forEach(function(a){a.classList.remove('is-on')}); var a=map[e.target.id]; if(a){ a.classList.add('is-on'); var p=a.parentNode; if(p.scrollHeight>p.clientHeight){ var t=a.offsetTop-p.offsetTop, y=p.scrollTop; if(t<y||t+a.offsetHeight>y+p.clientHeight) p.scrollTo({top:t-p.clientHeight/2,behavior:'smooth'}); } } } });
},{rootMargin:'-45% 0px -50% 0px'});
Object.keys(map).forEach(function(id){ var s=document.getElementById(id); if(s) spy.observe(s) });
/* reveal */
var rv=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); rv.unobserve(e.target) } }) },{rootMargin:'0px 0px -10% 0px',threshold:.05});
$$('.rv').forEach(function(el){ rv.observe(el) });
/* videos play only on screen */
var vo=new IntersectionObserver(function(es){ es.forEach(function(e){ var v=e.target; if(e.isIntersecting){ var p=v.play(); if(p&&p.catch)p.catch(function(){}) } else v.pause() }) },{threshold:.25});
$$('video[data-autoplay]').forEach(function(v){ v.muted=true; vo.observe(v) });
} else {
$$('.rv').forEach(function(el){ el.classList.add('in') });
}
})();