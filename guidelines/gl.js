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


  /* sonic waveform: a clean wave packet (tallest in the middle, tapering out) that "talks":
     it swells up for a phrase, ripples with each syllable, falls flat in the pauses, then speaks again. */
  $$('.snc .snw').forEach(function(svg){
    var thick=svg.querySelector('.snw__thick'), thin=svg.querySelector('.snw__thin');
    var W=600, M=100, N=320, CEIL=72; /* CEIL: tallest peak in a 200-unit box */
    /* a short script of phrases: [speaking seconds, pause seconds, syllables per second, loudness] */
    var script=[[1.6,0.55,4.2,1],[0.9,0.35,5.0,.7],[2.1,0.9,3.6,.95],[0.7,0.4,4.6,.6],[1.4,1.1,4.0,.85]];
    var total=script.reduce(function(s,p){return s+p[0]+p[1]},0);
    function smooth(e0,e1,v){ v=Math.min(1,Math.max(0,(v-e0)/(e1-e0))); return v*v*(3-2*v); }
    /* loudness at time t: 0 in pauses, swelling in phrases, pulsing on syllables */
    function voice(t){
      var u=t%total, n=Math.floor(t/total);
      for(var p=0;p<script.length;p++){
        var s=script[p], on=s[0];
        if(u<on){
          var shape=smooth(0,0.18,u)*(1-smooth(on-0.28,on,u));            /* attack and release */
          var syl=0.55+0.45*Math.abs(Math.sin(Math.PI*u*s[2]));          /* syllable pulses */
          return {g:s[3]*shape*syl, c:0.5+0.07*Math.sin(p*2.1+n), id:p};
        }
        u-=on; if(u<s[1]) return {g:0, c:0.5, id:p}; u-=s[1];
      }
      return {g:0,c:0.5,id:0};
    }
    function packet(x,c,w){ var d=(x-c)/w; return Math.exp(-d*d); }
    function wave(t, v, cycles, speed, gain, width, phase){
      var d='';
      for(var i=0;i<=N;i++){
        var x=i/N, taper=Math.sin(Math.PI*x);                              /* ends always meet the line */
        var env=(0.16+0.84*packet(x,v.c,width))*taper;
        var y=M-CEIL*gain*v.g*env*Math.sin(2*Math.PI*cycles*x-speed*t+phase);
        d+=(i?'L':'M')+(x*W).toFixed(1)+' '+y.toFixed(1);
      }
      return d;
    }
    var lvl=0;
    function draw(t){
      var v=voice(t); lvl+=(v.g-lvl)*0.25; v.g=lvl;                        /* ease so it never snaps */
      thick.setAttribute('d',wave(t,v,15,9,1,0.2,0));
      thin.setAttribute('d',wave(t,v,9,-6,0.62,0.3,1.2));
    }
    var run=false, t0=null, still=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    function tick(now){ if(!run){ t0=null; return; } if(t0===null) t0=now-(svg._t||0)*1000; svg._t=(now-t0)/1000; draw(svg._t); requestAnimationFrame(tick); }
    if(still){ lvl=0.9; var v0={g:0.9,c:0.5}; thick.setAttribute('d',wave(0.4,v0,15,9,1,0.2,0)); thin.setAttribute('d',wave(0.4,v0,9,-6,0.62,0.3,1.2)); return; }
    lvl=0.9; draw(0.7);
    if(!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function(es){ es.forEach(function(e){ var was=run; run=e.isIntersecting; if(run&&!was) requestAnimationFrame(tick); }); },{threshold:.1}).observe(svg);
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

    /* videos: load only when near the viewport, play only on screen */
    var vo=new IntersectionObserver(function(es){ es.forEach(function(e){ var v=e.target;
      if(e.isIntersecting){ if(!v.getAttribute('src')&&v.dataset.src){ v.src=v.dataset.src+'#t=0.1'; v.load(); } var p=v.play(); if(p&&p.catch)p.catch(function(){}); }
      else if(!v.paused) v.pause(); }) },{rootMargin:'200px 0px',threshold:.15});
    $$('video[data-autoplay]').forEach(function(v){ v.muted=true; v.playsInline=true; vo.observe(v) });
  } else {
    $$('.rv').forEach(function(el){ el.classList.add('in') });
  }
})();
