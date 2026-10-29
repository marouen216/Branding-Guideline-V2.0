/* Brand Evolution components: coverage map, globe, component toggles */
try{
(function(){
document.querySelectorAll('#coverageMap [data-blob]').forEach(function(p){
var c = JSON.parse(p.getAttribute('data-blob'));
var s = c.seed, rand = function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; };
var ph = [rand()*6.28, rand()*6.28, rand()*6.28, rand()*6.28, rand()*6.28];
var w = c.wobble || 1, N = 72, rot = (c.rot || 0) * Math.PI / 180, pts = [];
for(var i = 0; i < N; i++){
var th = i / N * Math.PI * 2;
var n = 1
+ 0.085*w*Math.sin(2*th + ph[0])
+ 0.065*w*Math.sin(3*th + ph[1])
+ 0.045*w*Math.sin(5*th + ph[2])
+ 0.022*w*Math.sin(9*th + ph[3])
+ 0.014*w*Math.sin(17*th + ph[4]);
var x = Math.cos(th)*c.rx*n, y = Math.sin(th)*c.ry*n;
pts.push([ c.cx + x*Math.cos(rot) - y*Math.sin(rot), c.cy + x*Math.sin(rot) + y*Math.cos(rot) ]);
}
var d = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
for(var j = 0; j < N; j++){
var p0 = pts[(j-1+N)%N], p1 = pts[j], p2 = pts[(j+1)%N], p3 = pts[(j+2)%N], k = 1/6;
d += ' C ' + (p1[0]+(p2[0]-p0[0])*k).toFixed(1) + ' ' + (p1[1]+(p2[1]-p0[1])*k).toFixed(1)
+ ' ' + (p2[0]-(p3[0]-p1[0])*k).toFixed(1) + ' ' + (p2[1]-(p3[1]-p1[1])*k).toFixed(1)
+ ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
}
p.setAttribute('d', d + ' Z');
});
})();
(function(){
const map = document.getElementById('coverageMap');
if(!map) return;
const items = map.querySelectorAll('.dv-map__legend-item[data-layer]');
const layers = map.querySelectorAll('.coverage-layer');
function isolate(key){
layers.forEach(l => {
l.style.opacity = (!key || l.dataset.layer === key) ? '1' : '0.12';
});
items.forEach(it => {
it.classList.toggle('is-active', it.dataset.layer === key);
});
}
function clear(){
layers.forEach(l => { l.style.opacity = ''; });
items.forEach(it => it.classList.remove('is-active'));
}
items.forEach(it => {
it.addEventListener('mouseenter', () => isolate(it.dataset.layer));
it.addEventListener('mouseleave', clear);
it.addEventListener('click', () => {
const active = it.classList.contains('is-active');
clear();
if(!active) isolate(it.dataset.layer);
});
});
layers.forEach(l => {
l.addEventListener('mouseenter', () => isolate(l.dataset.layer));
l.addEventListener('mouseleave', clear);
});
})();
(function(){
const host = document.getElementById('cosmosStars');
if(!host) return;
const n = 40;
const frag = document.createDocumentFragment();
let seed = 42;
const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
for(let i=0; i<n; i++){
const star = document.createElement('span');
const r = rand();
const big = r > 0.92;
star.className = big ? 'star big' : 'star';
const size = big ? (2.2 + rand()*1.8) : (0.8 + rand()*1.6);
star.style.width = star.style.height = size.toFixed(1) + 'px';
star.style.left = (rand() * 100).toFixed(1) + '%';
star.style.top = (rand() * 100).toFixed(1) + '%';
star.style.animationDelay = (-rand() * 2).toFixed(2) + 's';
star.style.animationDuration = (1.0 + rand() * 1.4).toFixed(2) + 's';
frag.appendChild(star);
}
host.appendChild(frag);
})();
function makeWave(elId, count, seed, mode){
const el = document.getElementById(elId);
if(!el) return;
let s = seed;
const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
let html = "";
for(let i=0; i<count; i++){
let h;
if(mode === "sonic"){
h = (i < count*0.4) ? 10 + i * 1.2 : 28 + Math.sin(i*0.6)*6;
} else if(mode === "ui"){
h = (i % 5 === 0) ? 28 : 4 + rand()*8;
} else if(mode === "leo"){
h = 8 + Math.abs(Math.sin(i*0.32)) * 22 + rand()*4;
} else if(mode === "human"){
h = 10 + Math.abs(Math.sin(i*0.22))*20 + rand()*3;
} else {
h = 8 + Math.abs(Math.sin(i*0.25 + seed))*22 + rand()*6;
}
html += '<span style="height:'+Math.min(46, h).toFixed(0)+'px; animation-delay:'+(-(i%9)*0.09).toFixed(2)+'s;"></span>';
}
el.innerHTML = html;
}
makeWave("wave-sonic", 38, 1, "sonic"); // no-op: tier waveforms removed
document.querySelectorAll(".tracks__wave").forEach((el, idx)=>{
const seed = parseInt(el.getAttribute("data-seed"), 10) || 1;
let s = seed * 13;
const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
let html = "";
for(let i=0; i<70; i++){
const h = 6 + Math.abs(Math.sin(i*0.18 + seed))*16 + rand()*8;
html += '<span style="height:'+Math.min(28, h).toFixed(0)+'px; animation-delay:'+(-(i%11)*0.07).toFixed(2)+'s;"></span>';
}
const bars = el.querySelector(".wave-bars") || el;
bars.innerHTML = html;
});
/* ---- Shared audio controller + sticky now-playing bar ---- */
(function(){
const audio = new Audio();
audio.preload = "none";
let cur = -1; // index into items
const items = [...document.querySelectorAll("[data-audio]")].map(trigger=>({
trigger,
container: trigger.closest("[data-player]") || trigger,
src: trigger.getAttribute("data-audio"),
group: trigger.getAttribute("data-group") || "track",
title: trigger.getAttribute("data-title") || trigger.textContent.trim(),
sub: trigger.getAttribute("data-sub") || ""
}));
if(!items.length) return;
const bar = document.getElementById("nowPlaying");
const npTitle = bar.querySelector(".np__title");
const npSub = bar.querySelector(".np__sub");
const npFill = bar.querySelector(".np__fill");
const npCur = bar.querySelector(".np__cur");
const npDur = bar.querySelector(".np__dur");
const npBar = bar.querySelector(".np__bar");
const fmt = (t)=>{ if(!isFinite(t)||t<0) return "0:00"; const m=Math.floor(t/60), s=Math.floor(t%60); return m+":"+String(s).padStart(2,"0"); };
const curBars = ()=> cur<0 ? [] : [...items[cur].container.querySelectorAll(".wave-bars span, .wave-sonic span")];
function clearVisual(){
if(cur<0) return;
items[cur].container.classList.remove("is-playing");
items[cur].trigger.classList.remove("trigger-active");
curBars().forEach(b=>b.classList.remove("played"));
}
function markVisual(){
items[cur].container.classList.add("is-playing");
items[cur].trigger.classList.add("trigger-active");
}
function showBar(){
npTitle.textContent = items[cur].title;
npSub.textContent = items[cur].sub;
bar.classList.add("is-active");
bar.setAttribute("aria-hidden","false");
document.body.classList.add("np-open");
}
function play(i){
if(i<0 || i>=items.length) return;
if(i!==cur){ clearVisual(); cur=i; audio.src=items[i].src; audio.currentTime=0; npFill.style.width="0%"; }
audio.play().catch(()=>{});
markVisual(); showBar();
}
function pause(){
audio.pause();
if(cur>=0){ items[cur].container.classList.remove("is-playing"); items[cur].trigger.classList.remove("trigger-active"); }
bar.classList.remove("playing");
}
function stop(){
audio.pause(); clearVisual();
bar.classList.remove("is-active","playing"); bar.setAttribute("aria-hidden","true");
document.body.classList.remove("np-open");
cur=-1;
}
function toggle(i){ if(i===cur && !audio.paused){ pause(); } else { play(i); } }
const groupIdx = (g)=> items.reduce((a,it,idx)=>{ if(it.group===g) a.push(idx); return a; }, []);
function step(dir, wrap){
if(cur<0) return;
const g = groupIdx(items[cur].group);
const pos = g.indexOf(cur);
let np = pos + dir;
if(np >= g.length){ if(wrap) np=0; else { stop(); return; } }
if(np < 0){ np = wrap ? g.length-1 : 0; }
play(g[np]);
}
items.forEach((it,i)=>{
const h = (e)=>{ e.preventDefault(); toggle(i); };
it.trigger.addEventListener("click", h);
it.trigger.addEventListener("keydown", (e)=>{ if(e.key==="Enter"||e.key===" "){ h(e); } });
});
audio.addEventListener("play", ()=>{ bar.classList.add("playing"); if(cur>=0) markVisual(); });
audio.addEventListener("pause", ()=>{ if(audio.ended) return; bar.classList.remove("playing"); });
audio.addEventListener("timeupdate", ()=>{
if(cur<0 || !audio.duration) return;
const ratio = audio.currentTime / audio.duration;
npFill.style.width = (ratio*100).toFixed(2)+"%";
npCur.textContent = fmt(audio.currentTime);
npDur.textContent = fmt(audio.duration);
const bars = curBars(), n = bars.length;
for(let k=0;k<n;k++) bars[k].classList.toggle("played", (k/n) <= ratio);
});
audio.addEventListener("loadedmetadata", ()=>{ npDur.textContent = fmt(audio.duration); });
audio.addEventListener("ended", ()=>{ curBars().forEach(b=>b.classList.remove("played")); npFill.style.width="0%"; step(1, false); });
bar.querySelector(".np__toggle").addEventListener("click", ()=>{ if(cur>=0) toggle(cur); });
bar.querySelector(".np__next").addEventListener("click", ()=> step(1, true));
bar.querySelector(".np__prev").addEventListener("click", ()=> step(-1, true));
bar.querySelector(".np__close").addEventListener("click", stop);
function seek(clientX){
if(cur<0 || !audio.duration) return;
const r = npBar.getBoundingClientRect();
const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
audio.currentTime = ratio * audio.duration;
}
npBar.addEventListener("click", (e)=> seek(e.clientX));
npBar.addEventListener("keydown", (e)=>{
if(cur<0 || !audio.duration) return;
if(e.key==="ArrowRight"){ audio.currentTime = Math.min(audio.duration, audio.currentTime+5); }
else if(e.key==="ArrowLeft"){ audio.currentTime = Math.max(0, audio.currentTime-5); }
});
})();
const idleToggle = document.getElementById("idleToggle");
const idleMark = document.getElementById("idleMark");
if(idleToggle && idleMark){
let on = true;
function setIdle(v){
on = v;
idleToggle.classList.toggle("off", !on);
idleToggle.setAttribute("aria-checked", String(on));
idleMark.classList.toggle("pulse", on);
}
idleToggle.addEventListener("click", ()=> setIdle(!on));
idleToggle.addEventListener("keydown", (e)=>{
if(e.key === " " || e.key === "Enter"){ e.preventDefault(); setIdle(!on); }
});
}
const dSp = document.getElementById("density-spacious");
const dCp = document.getElementById("density-compact");
const dList = document.getElementById("densityList");
if(dSp && dCp && dList){
dSp.addEventListener("click", ()=>{
dSp.classList.add("active"); dCp.classList.remove("active");
dList.classList.remove("compact");
});
dCp.addEventListener("click", ()=>{
dCp.classList.add("active"); dSp.classList.remove("active");
dList.classList.add("compact");
});
}
document.querySelectorAll(".cmp-card__head .toggle").forEach(group => {
group.querySelectorAll("button").forEach(btn => {
btn.addEventListener("click", () => {
group.querySelectorAll("button").forEach(b => b.classList.remove("active"));
btn.classList.add("active");
});
});
});
}catch(e){console.warn("be block",e)}
try{
/* ============================================================
COVERAGE GLOBE — orthographic 3D render of the flat map's own
geometry (continents + the six generated coverage envelopes).
Idle drift, click-hold / touch to rotate, legend isolation.
============================================================ */
(function(){
var stage=document.getElementById('coverageGlobe'), cv=document.getElementById('coverageGlobeCanvas');
var map=document.getElementById('coverageMap');
var readout=document.getElementById('coverageGlobeReadout');
if(!stage||!cv||!map) return;
var ctx=cv.getContext('2d'), DPR=Math.min(window.devicePixelRatio||1,2), D2R=Math.PI/180;
/* ---- geometry: sample SVG path data, unproject equirectangular → unit sphere ---- */
var tmpSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');
tmpSvg.setAttribute('width','4'); tmpSvg.setAttribute('height','4');
tmpSvg.style.cssText='position:absolute;left:-9999px;top:0;opacity:0;pointer-events:none';
var tmp=document.createElementNS('http://www.w3.org/2000/svg','path');
tmpSvg.appendChild(tmp); document.body.appendChild(tmpSvg);
function build(d, step, minLen){
var out=[];
d.split(/(?=M)/).forEach(function(sp){
if(!/\d/.test(sp)) return;
tmp.setAttribute('d', sp);
var L=0; try{ L=tmp.getTotalLength(); }catch(e){ return; }
if(!L || L<minLen) return;
var n=Math.max(4, Math.min(1400, Math.ceil(L/step))), jump=step*8;
var run=[], px=null, py=null;
for(var i=0;i<=n;i++){
var pt=tmp.getPointAtLength(i/n*L);
if(px!==null && Math.abs(pt.x-px)+Math.abs(pt.y-py)>jump){ flush(run,out); run=[]; }
run.push(pt.x, pt.y); px=pt.x; py=pt.y;
}
flush(run,out);
});
return out;
}
/* map coords → unit-sphere vectors + a horizon test for cheap culling */
function flush(run, out){
var m=run.length/2; if(m<4) return;
var v=new Float32Array(m*3), mx=0, my=0, mz=0, i;
for(i=0;i<m;i++){
var lam=(run[i*2]/2000*360-180)*D2R, phi=(90-run[i*2+1]/857*180)*D2R, cp=Math.cos(phi);
var x=cp*Math.sin(lam), y=Math.sin(phi), z=cp*Math.cos(lam);
v[i*3]=x; v[i*3+1]=y; v[i*3+2]=z; mx+=x; my+=y; mz+=z;
}
var mm=Math.hypot(mx,my,mz)||1; mx/=mm; my/=mm; mz/=mm;
var lo=1;
for(i=0;i<m;i++){ var dt=v[i*3]*mx+v[i*3+1]*my+v[i*3+2]*mz; if(dt<lo) lo=dt; }
lo=Math.max(-1,Math.min(1,lo));
out.push({v:v, n:m, c:[mx,my,mz], hz:-Math.sqrt(Math.max(0,1-lo*lo))-0.03});
}
var land=[];
map.querySelectorAll('#continents path').forEach(function(p){
var d=p.getAttribute('d'); if(d) land=land.concat(build(d,5,3.5));
});
var STYLE={
'thuraya4-avail':{fill:'rgba(61,107,255,0.22)', stroke:'rgba(61,107,255,0.95)', glow:'#3D6BFF'},
'ka-primary':{fill:'rgba(255,107,53,0.24)', stroke:'#FF6B35', glow:'#FF6B35'},
'mil-ka':{stripe:['#FF6B35','rgba(255,107,53,0.05)',-45,10,1.4], stroke:'#FF6B35', glow:'#FF6B35'},
'l-band':{stripe:['#2AC0E6','rgba(42,192,230,0.06)',45,10,1.4], stroke:'#2AC0E6', glow:'#2AC0E6'},
'l-band-ext':{fill:'rgba(42,192,230,0.10)', stroke:'rgba(42,192,230,0.6)', glow:'#2AC0E6'},
'c-band':{stripe:['#E8DCC4',null,0,8,1.4], stroke:'#E8DCC4', glow:'#E8DCC4'}
};
var beams=[];
function loadBeams(){
beams=[];
map.querySelectorAll('.coverage-layer').forEach(function(p){
var d=p.getAttribute('d'), k=p.getAttribute('data-layer');
if(!d||!STYLE[k]) return;
beams.push({key:k, st:STYLE[k], polys:build(d,4,2)});
});
}
loadBeams();
if(!beams.length) requestAnimationFrame(loadBeams);
var pat={};
function stripePattern(cfg){
var key=cfg.join('|'); if(pat[key]) return pat[key];
var s=Math.round(cfg[3]*DPR), c=document.createElement('canvas'); c.width=c.height=s;
var g=c.getContext('2d');
if(cfg[1]){ g.fillStyle=cfg[1]; g.fillRect(0,0,s,s); }
g.strokeStyle=cfg[0]; g.lineWidth=cfg[4]*DPR;
g.beginPath(); g.moveTo(s*0.25,-s); g.lineTo(s*0.25,s*2); g.stroke();
var p=ctx.createPattern(c,'repeat');
try{ p.setTransform(new DOMMatrix().scaleSelf(1/DPR,1/DPR).rotateSelf(cfg[2])); }catch(e){}
pat[key]=p; return p;
}
/* ---- camera ---- */
var yaw=30, pitch=8, spin=0.035, idleAt=0, W=0, H=0, CX=0, CY=0, R=0;
var ca=1, sa=0, cb=1, sb=0;
var mask=document.createElement('canvas'), mctx=mask.getContext('2d');
function resize(){
var r=stage.getBoundingClientRect();
if(!r.width||!r.height) return false;
W=r.width; H=r.height;
cv.width=mask.width=Math.round(W*DPR); cv.height=mask.height=Math.round(H*DPR);
ctx.setTransform(DPR,0,0,DPR,0,0);
CX=W/2; CY=H/2; R=Math.min(H*0.44, W*0.42);
pat={};
return true;
}
function trace(p, c){
c=c||ctx;
var v=p.v, n=p.n;
var x1c=p.c[0]*ca+p.c[2]*sa, z1c=-p.c[0]*sa+p.c[2]*ca;
var z2c=p.c[1]*sb+z1c*cb;
if(z2c < p.hz) return false;
for(var i=0;i<n;i++){
var x=v[i*3], y=v[i*3+1], z=v[i*3+2];
var x1=x*ca+z*sa, z1=-x*sa+z*ca;
var y2=y*cb-z1*sb, z2=y*sb+z1*cb;
var sx, sy;
if(z2>=0){ sx=CX+R*x1; sy=CY-R*y2; }
else { var m=Math.hypot(x1,y2)||1; sx=CX+R*x1/m; sy=CY-R*y2/m; }
if(i===0) c.moveTo(sx,sy); else c.lineTo(sx,sy);
}
c.closePath();
return true;
}
function graticule(){
ctx.strokeStyle='rgba(255,255,255,0.055)'; ctx.lineWidth=0.7;
var lat, lon, i, first;
for(lat=-60;lat<=60;lat+=30){
ctx.beginPath(); first=true;
for(lon=-180;lon<=180;lon+=4){
var phi=lat*D2R, lam=lon*D2R, cp=Math.cos(phi);
var x=cp*Math.sin(lam), y=Math.sin(phi), z=cp*Math.cos(lam);
var x1=x*ca+z*sa, z1=-x*sa+z*ca, y2=y*cb-z1*sb, z2=y*sb+z1*cb;
if(z2<0){ first=true; continue; }
var sx=CX+R*x1, sy=CY-R*y2;
if(first){ ctx.moveTo(sx,sy); first=false; } else ctx.lineTo(sx,sy);
}
ctx.stroke();
}
for(lon=-180;lon<180;lon+=30){
ctx.beginPath(); first=true;
for(lat=-90;lat<=90;lat+=4){
var phi2=lat*D2R, lam2=lon*D2R, cp2=Math.cos(phi2);
var xa=cp2*Math.sin(lam2), ya=Math.sin(phi2), za=cp2*Math.cos(lam2);
var xb=xa*ca+za*sa, zb=-xa*sa+za*ca, yc=ya*cb-zb*sb, zc=ya*sb+zb*cb;
if(zc<0){ first=true; continue; }
var px=CX+R*xb, py=CY-R*yc;
if(first){ ctx.moveTo(px,py); first=false; } else ctx.lineTo(px,py);
}
ctx.stroke();
}
}
function draw(){
if(!R && !resize()) return;
ca=Math.cos(-yaw*D2R); sa=Math.sin(-yaw*D2R);
cb=Math.cos(pitch*D2R); sb=Math.sin(pitch*D2R);
ctx.clearRect(0,0,W,H);
/* atmosphere */
var atm=ctx.createRadialGradient(CX,CY,R*0.9,CX,CY,R*1.32);
atm.addColorStop(0,'rgba(61,107,255,0.20)'); atm.addColorStop(1,'rgba(61,107,255,0)');
ctx.fillStyle=atm; ctx.beginPath(); ctx.arc(CX,CY,R*1.32,0,6.2832); ctx.fill();
ctx.save();
ctx.beginPath(); ctx.arc(CX,CY,R,0,6.2832); ctx.clip();
/* ocean body — lit from upper-left */
var oc=ctx.createRadialGradient(CX-R*0.35,CY-R*0.4,R*0.05,CX,CY,R*1.05);
oc.addColorStop(0,'#1B1052'); oc.addColorStop(0.55,'#150B3E'); oc.addColorStop(1,'#0A0326');
ctx.fillStyle=oc; ctx.beginPath(); ctx.arc(CX,CY,R,0,6.2832); ctx.fill();
graticule();
/* landmass — merged in an offscreen buffer so overlapping country
outlines neither accumulate alpha nor cancel by winding */
mctx.setTransform(DPR,0,0,DPR,0,0);
mctx.clearRect(0,0,W,H);
mctx.fillStyle='#fff';
var i;
for(i=0;i<land.length;i++){ mctx.beginPath(); if(trace(land[i],mctx)) mctx.fill(); }
ctx.globalAlpha=0.13; ctx.drawImage(mask,0,0,W,H); ctx.globalAlpha=1;
ctx.beginPath();
for(i=0;i<land.length;i++) trace(land[i]);
ctx.strokeStyle='rgba(255,255,255,0.20)'; ctx.lineWidth=0.55; ctx.stroke();
/* coverage envelopes */
var act=map.querySelector('.dv-map__legend-item.is-active');
var key=act?act.getAttribute('data-layer'):null;
for(var b=0;b<beams.length;b++){
var bm=beams[b], st=bm.st;
var al = !key ? 1 : (bm.key===key ? 1 : 0.12);
ctx.beginPath();
var any=false;
for(var j=0;j<bm.polys.length;j++) if(trace(bm.polys[j])) any=true;
if(any){
ctx.fillStyle=st.stripe?stripePattern(st.stripe):st.fill;
ctx.save();
ctx.globalAlpha=al*0.5; ctx.shadowColor=st.glow; ctx.shadowBlur=24; ctx.fill();
ctx.restore();
ctx.globalAlpha=al; ctx.fill();
ctx.strokeStyle=st.stroke; ctx.lineWidth=1.1; ctx.stroke();
ctx.globalAlpha=1;
}
}
/* terminator shading */
var sh=ctx.createRadialGradient(CX-R*0.4,CY-R*0.45,R*0.1,CX,CY,R*1.15);
sh.addColorStop(0,'rgba(0,0,0,0)'); sh.addColorStop(0.62,'rgba(3,1,16,0.14)'); sh.addColorStop(1,'rgba(3,1,16,0.6)');
ctx.fillStyle=sh; ctx.beginPath(); ctx.arc(CX,CY,R,0,6.2832); ctx.fill();
ctx.restore();
/* limb */
ctx.strokeStyle='rgba(255,255,255,0.28)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(CX,CY,R,0,6.2832); ctx.stroke();
ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.arc(CX,CY,R*1.11,0,6.2832); ctx.stroke();
if(readout){
var lo=((yaw+540)%360)-180, la=pitch;
readout.textContent=Math.abs(la).toFixed(1)+'°'+(la>=0?'N':'S')+' · '+Math.abs(lo).toFixed(1)+'°'+(lo>=0?'E':'W');
}
}
/* ---- drag ---- */
var drag=false, lx=0, ly=0;
stage.addEventListener('pointerdown',function(e){
drag=true; lx=e.clientX; ly=e.clientY; idleAt=performance.now();
stage.classList.add('is-drag','is-touched');
if(stage.setPointerCapture) try{ stage.setPointerCapture(e.pointerId); }catch(err){}
});
stage.addEventListener('pointermove',function(e){
if(!drag) return;
yaw+=(e.clientX-lx)*0.30; pitch=Math.max(-78,Math.min(78,pitch+(e.clientY-ly)*0.25));
lx=e.clientX; ly=e.clientY; idleAt=performance.now();
if(!running) draw();
});
function end(){ if(!drag) return; drag=false; idleAt=performance.now(); stage.classList.remove('is-drag'); }
stage.addEventListener('pointerup',end); stage.addEventListener('pointercancel',end);
window.addEventListener('pointerup',end);
/* ---- loop, paused when off-screen or hidden ---- */
var running=false, visible=false, last=0;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
function frame(t){
if(!running) return;
var dt=Math.min(64, t-(last||t)); last=t;
if(!drag && !reduce && t-idleAt>1600) yaw+=spin*dt*0.06;
draw();
requestAnimationFrame(frame);
}
function start(){ if(running) return; running=true; last=0; resize(); requestAnimationFrame(frame); }
function stop(){ running=false; }
function sync(){ (visible && !document.hidden) ? start() : stop(); }
if('IntersectionObserver' in window){
new IntersectionObserver(function(es){ visible=es[0].isIntersecting; sync(); },{threshold:0.02}).observe(stage);
} else { visible=true; sync(); }
document.addEventListener('visibilitychange', sync);
function fit(){ if(resize()) draw(); }
window.addEventListener('resize', fit);
if('ResizeObserver' in window) new ResizeObserver(fit).observe(stage);
requestAnimationFrame(fit);
})();
}catch(e){console.warn("be block",e)}