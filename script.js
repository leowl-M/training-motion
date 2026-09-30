"use strict";
/* ============================================================ utils */
const $=(s,r=document)=>r.querySelector(s);
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const D2R=Math.PI/180, TAU=Math.PI*2;
function hash(n){n=(n|0)^0x9e3779b9;n=Math.imul(n^(n>>>16),0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);n^=n>>>16;return (n>>>0)/4294967296}
const G={E:100,F:0,W:1920,H:1080,seed:7,t:0,lh:100,capH:70,res:1,wght:600};
const R=(u,k)=>hash(u.i*7919+k*104729+G.seed*15485863);
const RS=(u,k)=>R(u,k)*2-1;
const HAS_FILTER=typeof CanvasRenderingContext2D!=='undefined'&&'filter' in CanvasRenderingContext2D.prototype;
function hexRGB(h){h=(h||'#000').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16)||0;return[(n>>16)&255,(n>>8)&255,n&255]}
function mixRGB(a,b,t){if(t<=0)return`rgb(${a[0]},${a[1]},${a[2]})`;return`rgb(${Math.round(lerp(a[0],b[0],t))},${Math.round(lerp(a[1],b[1],t))},${Math.round(lerp(a[2],b[2],t))})`}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2200)}

/* ============================================================ easing */
const bOut=t=>{const n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+.75;if(t<2.5/d)return n*(t-=2.25/d)*t+.9375;return n*(t-=2.625/d)*t+.984375};
const EZ={
 linear:t=>t,
 inSine:t=>1-Math.cos(t*Math.PI/2),outSine:t=>Math.sin(t*Math.PI/2),inOutSine:t=>-(Math.cos(Math.PI*t)-1)/2,
 inQuad:t=>t*t,outQuad:t=>1-(1-t)**2,inOutQuad:t=>t<.5?2*t*t:1-(-2*t+2)**2/2,
 inCubic:t=>t**3,outCubic:t=>1-(1-t)**3,inOutCubic:t=>t<.5?4*t**3:1-(-2*t+2)**3/2,
 inQuart:t=>t**4,outQuart:t=>1-(1-t)**4,inOutQuart:t=>t<.5?8*t**4:1-(-2*t+2)**4/2,
 inQuint:t=>t**5,outQuint:t=>1-(1-t)**5,inOutQuint:t=>t<.5?16*t**5:1-(-2*t+2)**5/2,
 inExpo:t=>t===0?0:2**(10*t-10),outExpo:t=>t===1?1:1-2**(-10*t),inOutExpo:t=>t===0?0:t===1?1:t<.5?2**(20*t-10)/2:(2-2**(-20*t+10))/2,
 inCirc:t=>1-Math.sqrt(1-t*t),outCirc:t=>Math.sqrt(1-(t-1)**2),inOutCirc:t=>t<.5?(1-Math.sqrt(1-(2*t)**2))/2:(Math.sqrt(1-(-2*t+2)**2)+1)/2,
 inBack:t=>2.70158*t**3-1.70158*t*t,outBack:t=>1+2.70158*(t-1)**3+1.70158*(t-1)**2,
 inOutBack:t=>{const c=1.70158*1.525;return t<.5?((2*t)**2*((c+1)*2*t-c))/2:((2*t-2)**2*((c+1)*(t*2-2)+c)+2)/2},
 inElastic:t=>t===0?0:t===1?1:-(2**(10*t-10))*Math.sin((t*10-10.75)*(TAU/3)),
 outElastic:t=>t===0?0:t===1?1:2**(-10*t)*Math.sin((t*10-.75)*(TAU/3))+1,
 inBounce:t=>1-bOut(1-t),outBounce:bOut,
};
const EZ_LIST=[['fx','Consigliata dall\'effetto'],['linear','Lineare'],['outSine','Out Sine'],['inOutSine','In-Out Sine'],['outQuad','Out Quad'],['inOutQuad','In-Out Quad'],['outCubic','Out Cubic'],['inOutCubic','In-Out Cubic'],['outQuart','Out Quart'],['inOutQuart','In-Out Quart'],['outQuint','Out Quint'],['inOutQuint','In-Out Quint'],['outExpo','Out Expo'],['inOutExpo','In-Out Expo'],['outCirc','Out Circ'],['inOutCirc','In-Out Circ'],['outBack','Out Back (rimbalzo leggero)'],['inOutBack','In-Out Back'],['outElastic','Out Elastic'],['outBounce','Out Bounce'],['inSine','In Sine'],['inCubic','In Cubic'],['inQuart','In Quart'],['inExpo','In Expo'],['inBack','In Back'],['inElastic','In Elastic'],['inBounce','In Bounce']];

/* ============================================================ fonts */
const FONTS=[
 {n:'Inter Tight',g:'Variabili',min:100,max:900},{n:'Archivo',g:'Variabili',min:100,max:900},{n:'Space Grotesk',g:'Variabili',min:300,max:700},
 {n:'Syne',g:'Variabili',min:400,max:800},{n:'Unbounded',g:'Variabili',min:200,max:900},{n:'Bricolage Grotesque',g:'Variabili',min:200,max:800},
 {n:'Big Shoulders Display',g:'Variabili',min:100,max:900},{n:'Fraunces',g:'Variabili',min:100,max:900},{n:'Playfair Display',g:'Variabili',min:400,max:900},
 {n:'JetBrains Mono',g:'Variabili',min:100,max:800},
 {n:'Archivo Black',g:'Statici',min:400,max:400},{n:'Anton',g:'Statici',min:400,max:400},{n:'Instrument Serif',g:'Statici',min:400,max:400},
 {n:'DM Serif Display',g:'Statici',min:400,max:400},{n:'IBM Plex Mono',g:'Statici',min:300,max:700},
 {n:'Helvetica',g:'Sistema',css:'"Helvetica Neue",Helvetica,Arial,sans-serif',min:100,max:900},
 {n:'Georgia',g:'Sistema',css:'Georgia,"Times New Roman",serif',min:400,max:700},
];
FONTS.forEach(f=>{if(!f.css)f.css=`"${f.n}",system-ui,sans-serif`});
const fontPool=()=>FONTS.filter(f=>f.g!=='Sistema').map(f=>f.css);
function fontCss(i){return (FONTS[i]||FONTS[0]).css}
function fontStr(S,fam,w){return`${S.italic?'italic ':''}${Math.round(w??S.wght)} ${S.fs}px ${fam||fontCss(S.font)}`}

/* ============================================================ params helpers */
const rng=(k,l,min,max,v,st=.01,un='')=>({k,l,t:'r',min,max,v,st,un});
const sel=(k,l,o,v)=>({k,l,t:'s',o,v});
const bool=(k,l,v)=>({k,l,t:'b',v});
const col=(k,l,v)=>({k,l,t:'c',v});
const DIRS=[['B','Dal basso'],['T','Dall\'alto'],['L','Da sinistra'],['R','Da destra'],['TL','Alto sinistra'],['TR','Alto destra'],['BL','Basso sinistra'],['BR','Basso destra'],['ALT','Alternata'],['RND','Casuale']];
const DIR4=[['B','Dal basso'],['T','Dall\'alto'],['L','Da sinistra'],['R','Da destra']];
function dv(d,u){const s=.70710678;switch(d){case'L':return[-1,0];case'R':return[1,0];case'T':return[0,-1];case'B':return[0,1];case'TL':return[-s,-s];case'TR':return[s,-s];case'BL':return[-s,s];case'BR':return[s,s];case'ALT':return u.i%2?[0,-1]:[0,1];default:{const a=R(u,91)*TAU;return[Math.cos(a),Math.sin(a)]}}}
function pivot(s,w,u){switch(w){case'B':s.py=u.by1;break;case'T':s.py=u.by0;break;case'L':s.px=-u.w/2;break;case'R':s.px=u.w/2;break}}
const PIV=[['C','Centro'],['B','Base'],['T','Alto'],['L','Sinistra'],['R','Destra']];
const CHARSETS={AZ:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',n09:'0123456789',sym:'!<>-_\\/[]{}=+*^?#%&',bin:'01',blk:'░▒▓█▚▞▙▟'};
function rChar(set,seed,orig){const c=set[Math.floor(hash(seed)*set.length)];return (orig&&orig===orig.toLowerCase()&&orig!==orig.toUpperCase())?c.toLowerCase():c}

/* ============================================================ physics helpers */
function fall(tt,v0,g,d,rest){let t=tt,y=0,v=v0,first=-1,lastI=-1,lastV=0;if(g<=0||d===Infinity)return{y:v*t+.5*g*t*t,first,lastI,lastV};
 for(let k=0;k<30;k++){const th=(-v+Math.sqrt(Math.max(0,v*v+2*g*(d-y))))/g;if(t<=th)return{y:y+v*t+.5*g*t*t,first,lastI,lastV};
  const vi=v+g*th;y=d;t-=th;lastI=tt-t;lastV=vi;if(first<0)first=lastI;v=-vi*rest;if(Math.abs(v)<g*.012)return{y:d,first,lastI,lastV}}return{y:d,first,lastI,lastV}}
function floorD(u,o){return o.floor==='none'?Infinity:Math.max(0,G.H*o.fl/100-(u.fy+u.by1))}
const PIECES=new Map();
function pieces(u,n){n=Math.round(n);const key=`${u.i}|${n}|${u.w.toFixed(1)}|${u.by0.toFixed(1)}|${u.by1.toFixed(1)}|${G.seed}`;let P=PIECES.get(key);if(P)return P;
 const x0=-u.w/2-G.E*.06,x1=u.w/2+G.E*.06,y0=u.by0,y1=u.by1,w=x1-x0,h=y1-y0;const cols=Math.max(1,Math.round(Math.sqrt(n/2*w/h))),rows=Math.max(1,Math.round(n/2/cols));
 const V=[];for(let r=0;r<=rows;r++){V[r]=[];for(let c=0;c<=cols;c++){let x=x0+w*c/cols,y=y0+h*r/rows;if(c>0&&c<cols)x+=(hash(u.i*97+r*31+c*7+G.seed)-.5)*w/cols*.75;if(r>0&&r<rows)y+=(hash(u.i*89+r*13+c*17+G.seed+5)-.5)*h/rows*.75;V[r][c]=[x,y]}}
 P=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=V[r][c],b=V[r][c+1],cc=V[r+1][c+1],d=V[r+1][c];const tr2=hash(u.i*5+r*3+c+G.seed)<.5?[[a,b,cc],[a,cc,d]]:[[a,b,d],[b,cc,d]];for(const tr of tr2)P.push({poly:tr,cx:(tr[0][0]+tr[1][0]+tr[2][0])/3,cy:(tr[0][1]+tr[1][1]+tr[2][1])/3,k:P.length})}
 if(PIECES.size>3000)PIECES.clear();PIECES.set(key,P);return P}

/* ============================================================ effects: transitions
   f(s,p,u,o): p = 0 nascosto/inizio → 1 posizione di riposo (può superare 1 con easing back/elastic) */
const FX=[
/* --- Movimento --- */
{id:'slide',n:'Scorrimento',c:'Movimento',d:'Entra scorrendo da una direzione, con o senza dissolvenza.',rec:{split:'char',stagger:.45,ease:'outExpo'},
 p:[sel('dir','Provenienza',DIRS,'B'),rng('dist','Distanza',0,6,.7,.01,'em'),bool('fade','Dissolvenza',true)],
 f(s,p,u,o){const q=1-p,[x,y]=dv(o.dir,u);s.x+=x*o.dist*G.E*q;s.y+=y*o.dist*G.E*q;if(o.fade)s.op*=clamp(p)}},
{id:'traverse',n:'Attraversamento',c:'Movimento',d:'Arriva da fuori dal fotogramma, anche in diagonale. In uscita scegli il lato opposto per farlo attraversare tutto.',rec:{split:'word',stagger:.12,ease:'inOutExpo'},
 p:[sel('dir','Provenienza',DIRS.slice(0,8),'L'),rng('m','Margine extra',0,4,.2,.01,'em'),bool('fade','Dissolvenza',false)],
 f(s,p,u,o){const q=1-p,m=o.m*G.E,d=o.dir;let x=0,y=0;if(d.includes('L'))x=-(u.fx+u.w/2+m);if(d.includes('R'))x=G.W-u.fx+u.w/2+m;if(d.includes('T'))y=-(u.fy+u.by1+m);if(d.includes('B'))y=G.H-u.fy-u.by0+m;s.x+=x*q;s.y+=y*q;if(o.fade)s.op*=clamp(p)}},
{id:'fade',n:'Dissolvenza',c:'Movimento',d:'Dissolvenza pulita, con una leggera deriva opzionale.',rec:{split:'word',stagger:.3,ease:'outCubic'},
 p:[sel('dir','Deriva da',DIRS,'B'),rng('dist','Deriva',0,2,.12,.01,'em')],
 f(s,p,u,o){const q=1-p,[x,y]=dv(o.dir,u);s.x+=x*o.dist*G.E*q;s.y+=y*o.dist*G.E*q;s.op*=clamp(p)}},
{id:'skew',n:'Inclinazione',c:'Movimento',d:'Scivola con i caratteri inclinati che si raddrizzano all\'arrivo.',rec:{split:'char',stagger:.35,ease:'outQuart'},
 p:[sel('dir','Provenienza',[['L','Da sinistra'],['R','Da destra']],'L'),rng('dist','Distanza',0,6,1.4,.01,'em'),rng('ang','Inclinazione',-70,70,-32,1,'°'),bool('fade','Dissolvenza',true)],
 f(s,p,u,o){const q=1-p,v=o.dir==='L'?-1:1;s.x+=v*o.dist*G.E*q;s.skx+=o.ang*q*-v;if(o.fade)s.op*=clamp(p)}},
{id:'drop',n:'Caduta',c:'Movimento',d:'Cade con rimbalzo e una piccola rotazione casuale.',rec:{split:'char',stagger:.5,ease:'outBounce'},
 p:[sel('from','Da',[['T','Dall\'alto'],['B','Dal basso']],'T'),rng('h','Altezza',0,12,2.6,.01,'em'),rng('rot','Rotazione',0,90,10,1,'°')],
 f(s,p,u,o){const q=1-p;s.y+=(o.from==='T'?-1:1)*o.h*G.E*q;s.rot+=RS(u,7)*o.rot*q;s.op*=clamp(p*6)}},
{id:'wavein',n:'Onda d\'ingresso',c:'Movimento',d:'I caratteri arrivano seguendo una sinusoide.',rec:{split:'char',stagger:.55,ease:'outCubic'},
 p:[rng('amp','Ampiezza',0,4,.8,.01,'em'),rng('freq','Frequenza',0,2,.55,.01),rng('cyc','Cicli',0,4,1,.05),bool('fade','Dissolvenza',true)],
 f(s,p,u,o){const q=1-p;s.y+=Math.sin(u.i*o.freq+q*Math.PI*o.cyc*2)*o.amp*G.E*q;s.x+=0;if(o.fade)s.op*=clamp(p)}},
{id:'track',n:'Spaziatura',c:'Movimento',d:'Le lettere si stringono o si allargano fino alla spaziatura finale.',rec:{split:'char',stagger:0,ease:'outExpo'},
 p:[rng('spread','Apertura',-1,6,1.6,.01,'×'),bool('fade','Dissolvenza',true),rng('blur','Sfocatura',0,40,0,1,'px')],
 f(s,p,u,o){const q=1-p;s.x+=u.cx*o.spread*q;if(o.fade)s.op*=clamp(p);s.blur+=o.blur*q}},
/* --- Maschere --- */
{id:'mask',n:'Maschera',c:'Maschere',d:'Il testo sale da dietro una linea invisibile. Il classico dei titoli puliti.',rec:{split:'char',stagger:.35,ease:'outQuart'},
 p:[sel('dir','Provenienza',DIR4,'B'),rng('skew','Inclinazione',-40,40,0,1,'°'),rng('rot','Rotazione',-40,40,0,1,'°')],
 f(s,p,u,o){const q=1-p;s.clip=1;const hh=(u.by1-u.by0)*1.02;switch(o.dir){case'B':s.y+=hh*q;break;case'T':s.y-=hh*q;break;case'L':s.x-=(u.w+G.E*.1)*q;break;default:s.x+=(u.w+G.E*.1)*q}s.skx+=o.skew*q;s.rot+=o.rot*q;if(o.rot)pivot(s,'B',u)}},
{id:'wipe',n:'Rivelazione',c:'Maschere',d:'Una tendina scopre il testo senza muoverlo.',rec:{split:'word',stagger:.3,ease:'inOutQuart'},
 p:[sel('dir','Direzione',[['L','Da sinistra'],['R','Da destra'],['T','Dall\'alto'],['B','Dal basso'],['C','Dal centro']],'L'),rng('edge','Bordo morbido',0,1,0,.01)],
 f(s,p,u,o){s.wipe={d:o.dir,a:clamp(p),soft:o.edge}}},
{id:'split',n:'Taglio a metà',c:'Maschere',d:'Metà superiore e inferiore arrivano da lati opposti e si ricompongono.',rec:{split:'word',stagger:.25,ease:'outExpo'},
 p:[rng('dist','Distanza',0,8,1.4,.01,'em'),bool('fade','Dissolvenza',true),bool('flip','Inverti lati',false)],
 f(s,p,u,o){const q=1-p,d=o.dist*G.E*q*(o.flip?-1:1);s.slices={n:2,off:j=>j?d:-d};if(o.fade)s.op*=clamp(p)}},
{id:'slices',n:'Fette',c:'Maschere',d:'Il testo è tagliato in fette orizzontali che scivolano al loro posto.',rec:{split:'word',stagger:.25,ease:'outQuart'},
 p:[rng('n','Numero fette',2,20,6,1),rng('dist','Distanza',0,8,1.2,.01,'em'),sel('mode','Modalità',[['alt','Alternate'],['rnd','Casuali'],['cas','A cascata']],'alt'),bool('fade','Dissolvenza',true)],
 f(s,p,u,o){const q=1-p,d=o.dist*G.E,n=Math.round(o.n);s.slices={n,off:j=>o.mode==='alt'?(j%2?1:-1)*d*q:o.mode==='rnd'?RS(u,50+j)*d*q:-d*EZ.outCubic(clamp(q*1.6-(j/n)*.6))};if(o.fade)s.op*=clamp(p*1.4)}},
{id:'slot',n:'Rullo slot',c:'Maschere',d:'Ogni carattere gira come un rullo di slot machine prima di fermarsi.',rec:{split:'char',stagger:.35,ease:'outCubic'},
 p:[rng('spins','Giri',1,30,7,1),sel('dir','Verso',[['U','Verso l\'alto'],['D','Verso il basso']],'U'),sel('set','Caratteri',[['AZ','Lettere'],['n09','Numeri'],['sym','Simboli']],'AZ')],
 f(s,p,u,o){s.clip=1;const r=clamp(1-p,0,1)*o.spins,k=Math.floor(r);s.roll={k,frac:r-k,dir:o.dir==='U'?1:-1,set:o.set};s.op*=p>0?1:0}},
{id:'marker',n:'Evidenziatore',c:'Maschere',d:'Una barra piena copre la parola e, ritirandosi, lascia il testo.',rec:{split:'word',stagger:.25,ease:'inOutQuart'},
 p:[sel('dir','Direzione',[['L','Da sinistra'],['R','Da destra'],['T','Dall\'alto'],['B','Dal basso']],'L'),sel('bc','Colore barra',[['B','Colore B'],['A','Colore testo']],'B'),rng('pad','Margine',0,.4,.06,.01,'em')],
 f(s,p,u,o){const a=clamp(p);s.bar={d:o.dir,a:a<.5?0:(a-.5)*2,b:a<.5?a*2:1,c:o.bc,pad:o.pad};s.op*=a>=.5?1:0}},
/* --- Scala e rotazione --- */
{id:'pop',n:'Pop',c:'Scala e rotazione',d:'Cresce da zero con un leggero rimbalzo.',rec:{split:'char',stagger:.45,ease:'outBack'},
 p:[rng('from','Scala iniziale',0,1,0,.01),rng('rot','Rotazione casuale',0,90,0,1,'°'),sel('piv','Perno',PIV,'C')],
 f(s,p,u,o){const k=lerp(o.from,1,p);s.sx*=k;s.sy*=k;s.rot+=RS(u,8)*o.rot*(1-p);pivot(s,o.piv,u);s.op*=clamp(p*4)}},
{id:'zoom',n:'Zoom dall\'alto',c:'Scala e rotazione',d:'Arriva grande e sfocato verso la camera, poi si posa.',rec:{split:'word',stagger:.25,ease:'outExpo'},
 p:[rng('from','Scala iniziale',1,10,3,.01,'×'),rng('blur','Sfocatura',0,60,14,1,'px'),bool('fade','Dissolvenza',true)],
 f(s,p,u,o){const q=1-p,k=lerp(o.from,1,p);s.sx*=k;s.sy*=k;s.blur+=o.blur*q;if(o.fade)s.op*=clamp(p)}},
{id:'depth',n:'Profondità',c:'Scala e rotazione',d:'Emerge dalla profondità o arriva dal primo piano, con sfocatura di campo.',rec:{split:'char',stagger:.4,ease:'outQuart'},
 p:[sel('orig','Origine',[['back','Da dietro'],['front','Da davanti']],'back'),rng('depth','Profondità',0,12,3,.1),rng('blur','Sfocatura',0,60,10,1,'px'),rng('lift','Deriva verticale',-2,2,.2,.01,'em')],
 f(s,p,u,o){const q=1-p,k=o.orig==='back'?lerp(1/(1+o.depth),1,p):lerp(1+o.depth,1,p);s.sx*=k;s.sy*=k;s.blur+=o.blur*q;s.y+=o.lift*G.E*q;s.op*=clamp(p)}},
{id:'stretch',n:'Allungamento',c:'Scala e rotazione',d:'Si stira da una linea sottile fino alla forma piena.',rec:{split:'char',stagger:.35,ease:'outBack'},
 p:[sel('ax','Asse',[['Y','Verticale'],['X','Orizzontale']],'Y'),sel('piv','Perno',PIV,'B'),rng('from','Scala iniziale',0,3,0,.01),rng('comp','Compensazione',0,1,.3,.01)],
 f(s,p,u,o){const k=lerp(o.from,1,p),c=1+(1-k)*o.comp*(o.from<1?1:-1);if(o.ax==='Y'){s.sy*=k;s.sx*=c}else{s.sx*=k;s.sy*=c}pivot(s,o.piv,u);s.op*=clamp(p*5)}},
{id:'rot',n:'Rotazione',c:'Scala e rotazione',d:'Ruota su un perno fino alla posizione dritta.',rec:{split:'char',stagger:.4,ease:'outExpo'},
 p:[rng('ang','Angolo',-360,360,-90,1,'°'),sel('piv','Perno',PIV,'B'),bool('alt','Alterna verso',false),bool('fade','Dissolvenza',true)],
 f(s,p,u,o){s.rot+=o.ang*(1-p)*(o.alt&&u.i%2?-1:1);pivot(s,o.piv,u);if(o.fade)s.op*=clamp(p*1.5)}},
{id:'flipx',n:'Ribalta',c:'Scala e rotazione',d:'Ruota in 3D sull\'asse orizzontale, come una paletta che si gira.',rec:{split:'char',stagger:.4,ease:'outCubic'},
 p:[rng('ang','Angolo',0,360,90,1,'°'),sel('piv','Perno',[['C','Centro'],['B','Base'],['T','Alto']],'C'),rng('shade','Ombra',0,1,.6,.01)],
 f(s,p,u,o){const c=Math.cos(o.ang*(1-p)*D2R);s.sy*=Math.abs(c)<.002?.002:c;pivot(s,o.piv,u);s.op*=1-(1-Math.abs(c))*o.shade;s.op*=p>0?1:0}},
{id:'flipy',n:'Giro',c:'Scala e rotazione',d:'Ruota in 3D sull\'asse verticale, come una carta che si volta.',rec:{split:'char',stagger:.4,ease:'outCubic'},
 p:[rng('ang','Angolo',0,720,180,1,'°'),sel('piv','Perno',[['C','Centro'],['L','Sinistra'],['R','Destra']],'C'),rng('shade','Ombra',0,1,.5,.01)],
 f(s,p,u,o){const c=Math.cos(o.ang*(1-p)*D2R);s.sx*=Math.abs(c)<.002?.002:c;pivot(s,o.piv,u);s.op*=1-(1-Math.abs(c))*o.shade;s.op*=p>0?1:0}},
{id:'spin',n:'Vortice',c:'Scala e rotazione',d:'Gira su se stesso crescendo fino alla posizione.',rec:{split:'char',stagger:.4,ease:'outExpo'},
 p:[rng('turns','Giri',-4,4,1,.05),rng('from','Scala iniziale',0,3,0,.01),bool('fade','Dissolvenza',true)],
 f(s,p,u,o){const k=lerp(o.from,1,p);s.rot+=o.turns*360*(1-p);s.sx*=k;s.sy*=k;if(o.fade)s.op*=clamp(p*2)}},
{id:'swing',n:'Pendolo',c:'Scala e rotazione',d:'Oscilla appeso al perno e si smorza fino a fermarsi.',rec:{split:'char',stagger:.3,ease:'linear'},
 p:[rng('amp','Ampiezza',0,150,70,1,'°'),rng('sw','Oscillazioni',.5,8,2.5,.05),rng('damp','Smorzamento',.5,5,2,.05),sel('piv','Perno',[['T','Alto'],['B','Base']],'T')],
 f(s,p,u,o){const c=clamp(p);s.rot+=o.amp*Math.pow(1-c,o.damp)*Math.cos(c*o.sw*TAU);pivot(s,o.piv,u);s.op*=clamp(c*8)}},
{id:'jelly',n:'Gelatina',c:'Scala e rotazione',d:'Schiacciamento e allungamento elastico, poggiato sulla base.',rec:{split:'char',stagger:.35,ease:'linear'},
 p:[rng('amt','Intensità',0,1.2,.55,.01),rng('wob','Oscillazioni',.5,8,3,.05),rng('damp','Smorzamento',.5,5,1.6,.05)],
 f(s,p,u,o){const c=clamp(p),g=EZ.outCubic(clamp(c*2.2)),d=o.amt*Math.pow(1-c,o.damp)*Math.sin(c*o.wob*TAU);s.sx*=g*(1+d);s.sy*=g*(1-d);pivot(s,'B',u);s.op*=c>0?1:0}},
/* --- Esplosioni --- */
{id:'explode',n:'Esplosione',c:'Esplosioni',d:'Si ricompone dai frammenti. In uscita (specchio) esplode verso l\'esterno.',rec:{split:'char',stagger:.15,ease:'outExpo'},
 p:[rng('rad','Raggio',0,20,4,.1,'em'),rng('rand','Casualità',0,1,.45,.01),rng('rot','Rotazione',0,720,200,1,'°'),rng('sc','Scala frammenti',0,3,.6,.01),rng('blur','Sfocatura',0,40,0,1,'px'),bool('fade','Dissolvenza',true)],
 f(s,p,u,o){const q=1-p;let a=Math.atan2(u.cy,u.cx);if(Math.hypot(u.cx,u.cy)<1)a=R(u,2)*TAU;a+=RS(u,3)*Math.PI*o.rand;const r=o.rad*G.E*(.55+R(u,4)*.9)*q;s.x+=Math.cos(a)*r;s.y+=Math.sin(a)*r;s.rot+=RS(u,5)*o.rot*q;const k=lerp(o.sc,1,clamp(p));s.sx*=k;s.sy*=k;s.blur+=o.blur*q;if(o.fade)s.op*=clamp(p*1.6)}},
{id:'scatter',n:'Dispersione',c:'Esplosioni',d:'I pezzi partono da punti casuali del fotogramma e si ordinano.',rec:{split:'char',stagger:.3,ease:'inOutExpo'},
 p:[rng('area','Area',0,1.5,.8,.01),rng('rot','Rotazione',0,360,60,1,'°'),rng('blur','Sfocatura',0,40,0,1,'px'),bool('fade','Dissolvenza',true)],
 f(s,p,u,o){const q=1-p;s.x+=(RS(u,6)*G.W*.5*o.area)*q;s.y+=(RS(u,16)*G.H*.5*o.area)*q;s.rot+=RS(u,17)*o.rot*q;s.blur+=o.blur*q;if(o.fade)s.op*=clamp(p*2)}},
{id:'spiral',n:'Spirale',c:'Esplosioni',d:'Arriva girando a spirale verso la posizione finale.',rec:{split:'char',stagger:.35,ease:'outCubic'},
 p:[rng('turns','Giri',0,4,1.2,.05),rng('r','Raggio',0,14,3,.1,'em'),bool('orient','Orienta sul percorso',true),rng('sc','Scala iniziale',0,2,.3,.01)],
 f(s,p,u,o){const q=1-p,a=u.i/Math.max(1,u.n)*TAU+o.turns*TAU*q,r=o.r*G.E*q;s.x+=Math.cos(a)*r;s.y+=Math.sin(a)*r;if(o.orient)s.rot+=o.turns*360*q;const k=lerp(o.sc,1,clamp(p));s.sx*=k;s.sy*=k;s.op*=clamp(p*2)}},
{id:'circle',n:'Cerchio',c:'Esplosioni',d:'Parte disposto in cerchio attorno al centro e si srotola in riga.',rec:{split:'char',stagger:.1,ease:'inOutQuart'},
 p:[rng('r','Raggio',.5,14,2.4,.1,'em'),rng('phase','Rotazione cerchio',0,360,-90,1,'°'),bool('follow','Orienta sul cerchio',true),bool('fade','Dissolvenza',false)],
 f(s,p,u,o){const q=1-p,ad=o.phase+u.i/Math.max(1,u.n)*360,a=ad*D2R,r=o.r*G.E;s.x+=(Math.cos(a)*r-u.cx)*q;s.y+=(Math.sin(a)*r-u.cy)*q;if(o.follow)s.rot+=(ad+90)*q;if(o.fade)s.op*=clamp(p)}},
/* --- Glifi --- */
{id:'type',n:'Macchina da scrivere',c:'Glifi',d:'Carattere per carattere, con cursore opzionale che lampeggia a fine riga.',rec:{split:'char',stagger:.97,ease:'linear',order:'start'},
 p:[bool('cursor','Cursore',true),sel('cur','Forma cursore',[['bar','Barra'],['block','Blocco'],['under','Trattino']],'bar'),bool('blink','Lampeggio a riposo',true),sel('cc','Colore cursore',[['B','Colore B'],['A','Colore testo']],'B')],
 f(s,p,u,o){s.op*=p>1e-4?1:0},
 post(ctx,arr,o,S,Lay,t,cols){if(!o.cursor||!arr.length)return;let last=null,typing=false;for(const[u,s]of arr){if(s.op>.01)last=u;else typing=true}
  let x,y;if(last){x=last.cx+last.w/2+G.E*.05;y=last.cy}else{x=arr[0][0].cx-arr[0][0].w/2;y=arr[0][0].cy}
  if(o.blink&&!typing&&Math.floor(t*1.8)%2)return;
  ctx.save();ctx.globalAlpha=1;ctx.fillStyle=o.cc==='A'?cols.A:cols.B;const b=y+Lay.base,h=Lay.capH;
  if(o.cur==='bar')ctx.fillRect(x,b-h*1.12,Math.max(1,G.E*.06),h*1.3);else if(o.cur==='block')ctx.fillRect(x,b-h*1.1,G.E*.5,h*1.26);else ctx.fillRect(x,b+G.E*.04,G.E*.5,Math.max(1,G.E*.07));ctx.restore()}},
{id:'scramble',n:'Decodifica',c:'Glifi',d:'Caratteri casuali che si risolvono nel testo, da sinistra a destra.',rec:{split:'word',stagger:.4,ease:'linear'},
 p:[sel('set','Caratteri',[['AZ','Lettere'],['n09','Numeri'],['sym','Simboli'],['bin','Binario'],['blk','Blocchi']],'AZ'),rng('rate','Cambio ogni',1,8,2,1,'frame'),bool('colB','Caratteri casuali in colore B',true),bool('fade','Dissolvenza',false)],
 f(s,p,u,o){if(p<1)s.hooks.push({fn:scrHook,p,o});s.op*=o.fade?clamp(p*2):(p>1e-4?1:0)}},
{id:'fontcycle',n:'Cambio font',c:'Glifi',d:'Ogni lettera passa rapidamente tra i font della libreria prima di fermarsi su quello scelto.',rec:{split:'char',stagger:.5,ease:'linear'},
 p:[rng('rate','Cambio ogni',1,10,3,1,'frame'),rng('hold','Assestamento',0,.9,.15,.01),bool('fade','Dissolvenza',false)],
 f(s,p,u,o){if(p<1)s.hooks.push({fn:fontHook,p,o});s.op*=o.fade?clamp(p*2):(p>1e-4?1:0)}},
{id:'weight',n:'Peso variabile',c:'Glifi',d:'Il peso del carattere scorre fino al valore finale. Funziona con i font variabili.',rec:{split:'char',stagger:.5,ease:'inOutCubic'},
 p:[rng('from','Peso iniziale',100,900,100,1),bool('fade','Dissolvenza',true),rng('lift','Deriva verticale',-1,1,0,.01,'em')],
 f(s,p,u,o){s.wght=lerp(o.from,G.wght,clamp(p));s.y+=o.lift*G.E*(1-p);if(o.fade)s.op*=clamp(p*1.5)}},
/* --- Colore e stile --- */
{id:'colorsweep',n:'Onda colore',c:'Colore e stile',d:'Il colore B attraversa il testo e lascia il colore finale, con un piccolo sollevamento.',rec:{split:'char',stagger:.6,ease:'inOutCubic'},
 p:[rng('lift','Sollevamento',-.5,.5,.08,.01,'em'),rng('sc','Pulsazione scala',0,.5,0,.01),bool('fade','Parte invisibile',false)],
 f(s,p,u,o){const q=clamp(1-p),b=Math.sin(Math.PI*clamp(p));s.mix+=q;s.y-=o.lift*G.E*b;const k=1+o.sc*b;s.sx*=k;s.sy*=k;if(o.fade)s.op*=clamp(p*3)}},
{id:'blur',n:'Messa a fuoco',c:'Colore e stile',d:'Dal fuori fuoco al nitido, con una lieve variazione di scala.',rec:{split:'word',stagger:.3,ease:'outCubic'},
 p:[rng('blur','Sfocatura',0,80,26,1,'px'),rng('sc','Scala iniziale',.5,2,1.08,.01),rng('sp','Spaziatura iniziale',0,2,0,.01,'×')],
 f(s,p,u,o){const q=1-p,k=lerp(o.sc,1,p);s.blur+=o.blur*q;s.sx*=k;s.sy*=k;s.x+=u.cx*o.sp*q;s.op*=clamp(p)}},
{id:'glitch',n:'Glitch',c:'Colore e stile',d:'Sfarfallio digitale con separazione RGB e fette sfalsate, poi si stabilizza.',rec:{split:'word',stagger:.25,ease:'linear'},
 p:[rng('int','Intensità',0,1,.7,.01),rng('rgb','Separazione RGB',0,60,12,1,'px'),rng('sl','Fette',0,16,6,1),rng('rate','Cambio ogni',1,6,2,1,'frame'),col('ca','Canale 1','#ff2a55'),col('cb','Canale 2','#00e1ff')],
 f(s,p,u,o){const q=clamp(1-p);if(q<.002)return;const k=Math.floor(G.F/o.rate);const h=j=>hash(u.i*131+k*977+j*53+G.seed);s.x+=(h(1)*2-1)*o.int*.35*G.E*q;s.rgb=o.rgb*q*o.int;s.rgbA=o.ca;s.rgbB=o.cb;if(o.sl>0&&h(2)<.75)s.slices={n:Math.round(o.sl),off:j=>(h(10+j)*2-1)*o.int*.5*G.E*q};if(h(3)<.4*q*o.int)s.op*=h(4)<.5?0:.35;s.op*=p>1e-4?1:0}},
/* --- Fisica --- (L = durata in secondi del singolo pezzo) */
{id:'gravity',n:'Gravità',c:'Fisica',exit:true,d:'Le lettere si staccano, cadono e rimbalzano sul fondo del fotogramma.',rec:{split:'char',stagger:.35,ease:'linear'},
 p:[rng('g','Gravità',2,120,34,1,'em/s²'),rng('bounce','Rimbalzo',0,.9,.42,.01),rng('kick','Spinta iniziale',0,6,1,.05,'em/s'),rng('spin','Rotazione',0,720,140,1,'°/s'),sel('floor','Pavimento',[['on','Bordo del fotogramma'],['none','Nessuno, escono']],'on'),rng('fl','Altezza pavimento',40,100,96,.5,'%')],
 f(s,p,u,o,inf){const tt=(1-p)*inf.L,g=o.g*G.E,d=floorD(u,o);const r=fall(tt,-R(u,61)*o.kick*G.E,g,d,o.bounce);s.y+=r.y;const k=d===Infinity?.05:1.4,dm=(1-Math.exp(-tt*k))/k;s.x+=RS(u,60)*o.kick*G.E*.6*dm;s.rot+=RS(u,62)*o.spin*dm}},
{id:'shatter',n:'Cade e si rompe',c:'Fisica',exit:true,d:'Cade, colpisce il fondo e si frantuma in schegge che rimbalzano.',rec:{split:'char',stagger:.3,ease:'linear'},
 p:[rng('g','Gravità',2,120,40,1,'em/s²'),rng('n','Schegge',4,80,18,1),rng('spread','Forza impatto',0,8,2.2,.05,'em/s'),rng('spin','Rotazione schegge',0,1440,420,1,'°/s'),rng('life','Durata schegge',.1,4,1.1,.05,'s'),rng('jit','Attesa casuale',0,1.5,.25,.01,'s'),rng('fl','Altezza pavimento',40,100,94,.5,'%')],
 f(s,p,u,o,inf){const tt=(1-p)*inf.L-R(u,63)*o.jit;if(tt<=0)return;const g=o.g*G.E,d=Math.max(0,G.H*o.fl/100-(u.fy+u.by1)),th=Math.sqrt(2*d/g);
  if(tt<th){s.y+=.5*g*tt*tt;s.rot+=RS(u,64)*6*clamp(tt/.3);return}
  s.y+=d;const dt=tt-th,E=G.E,hw=u.w/2+1;
  s.frag={pieces:pieces(u,o.n),fn:pc=>{const k=pc.k,h=j=>hash(u.i*131+k*71+j*13+G.seed),sp=o.spread*E;const vx=(pc.cx/hw)*sp*(.3+h(1)*.9)+(h(2)-.5)*sp*.7,vy=-(.2+h(3))*sp*1.2;const r=fall(dt,vy,g,Math.max(0,u.by1-pc.cy),.28);const ta=r.first>=0?r.first+(1-Math.exp(-(dt-r.first)*4))/4:dt;return{x:vx*ta,y:r.y,r:(h(4)-.5)*o.spin*ta,op:1-clamp((dt-o.life)/.6)}}}}},
{id:'crumble',n:'Sgretolamento',c:'Fisica',exit:true,d:'Il testo si sbriciola in tanti frammenti che cadono come sabbia.',rec:{split:'word',stagger:.25,ease:'linear'},
 p:[sel('dir','Parte da',[['L','Sinistra'],['R','Destra'],['T','Alto'],['B','Basso'],['RND','Casuale']],'L'),rng('n','Frammenti',8,160,70,1),rng('g','Gravità',2,120,30,1,'em/s²'),rng('sweep','Durata spazzata',0,3,.8,.01,'s'),rng('drift','Deriva',0,3,.5,.01,'em/s'),rng('spin','Rotazione',0,1080,260,1,'°/s'),rng('life','Dissolvenza',.1,4,1,.05,'s')],
 f(s,p,u,o,inf){const tt=(1-p)*inf.L,g=o.g*G.E,E=G.E,w=u.w||1,h0=(u.by1-u.by0)||1;
  s.frag={pieces:pieces(u,o.n),fn:pc=>{const k=pc.k,h=j=>hash(u.i*97+k*53+j*11+G.seed);const nx=(pc.cx+w/2)/w,ny=(pc.cy-u.by0)/h0;const pos=o.dir==='L'?nx:o.dir==='R'?1-nx:o.dir==='T'?ny:o.dir==='B'?1-ny:h(9);const dt=tt-(pos*o.sweep+h(1)*.15);if(dt<=0)return{x:0,y:0,r:0,op:1};return{x:(h(2)-.5)*o.drift*E*dt*2,y:-h(3)*.15*E*dt+.5*g*dt*dt,r:(h(4)-.5)*o.spin*dt,op:1-clamp(dt/o.life)}}}}},
{id:'zerog',n:'Assenza di gravità',c:'Fisica',exit:true,d:'Le lettere si staccano e fluttuano lentamente verso l\'alto, ruotando.',rec:{split:'char',stagger:.4,ease:'linear'},
 p:[rng('rise','Salita',-3,3,.5,.01,'em/s'),rng('acc','Accelerazione',-3,3,.25,.01),rng('spread','Dispersione',0,3,.35,.01,'em/s'),rng('drift','Ondeggiamento',0,1,.12,.005,'em'),rng('spin','Rotazione',0,360,40,1,'°/s'),rng('life','Visibile per',.1,10,1.4,.05,'s'),rng('fadeT','Dissolvenza',.05,4,.8,.05,'s')],
 f(s,p,u,o,inf){const tt=(1-p)*inf.L,E=G.E,v=.6+R(u,65)*.8;s.y-=(o.rise*tt+.5*o.acc*tt*tt)*E*v;s.x+=RS(u,66)*o.spread*E*tt+Math.sin(tt*1.7+R(u,67)*TAU)*o.drift*E*clamp(tt*2);s.rot+=RS(u,68)*o.spin*tt;s.op*=1-clamp((tt-o.life)/o.fadeT)}},
{id:'wind',n:'Vento',c:'Fisica',exit:true,d:'Una raffica porta via le lettere come fogli, con svolazzo e rotazione.',rec:{split:'char',stagger:.45,ease:'linear'},
 p:[sel('dir','Verso',[['R','Verso destra'],['L','Verso sinistra']],'R'),rng('str','Forza',0,80,18,.5,'em/s²'),rng('lift','Portanza',-10,20,3,.1,'em/s²'),rng('turb','Turbolenza',0,1,.25,.01,'em'),rng('spin','Rotazione',0,1080,300,1,'°/s'),rng('flip','Svolazzo',0,1,.6,.01)],
 f(s,p,u,o,inf){const tt=(1-p)*inf.L,E=G.E,d=o.dir==='L'?-1:1,v=.6+R(u,70)*.8;s.x+=d*.5*o.str*v*tt*tt*E;s.y+=(Math.sin(tt*4+R(u,71)*TAU)*o.turb*clamp(tt*3)-.5*o.lift*v*tt*tt)*E;s.rot+=d*o.spin*(.5+R(u,72))*tt*.5*tt;s.sx*=lerp(1,Math.cos(tt*(3+R(u,73)*4)),clamp(tt*2)*o.flip)}},
{id:'hinge',n:'Cerniera',c:'Fisica',exit:true,d:'La lettera perde un chiodo: resta appesa a un angolo, oscilla e poi cade.',rec:{split:'char',stagger:.5,ease:'linear'},
 p:[sel('side','Angolo che tiene',[['RND','Casuale'],['L','Sinistro'],['R','Destro']],'RND'),rng('hang','Resta appeso',0,4,.9,.01,'s'),rng('damp','Smorzamento',.5,8,2.4,.05),rng('freq','Oscillazione',.2,4,1.2,.05,'Hz'),rng('g','Gravità',2,120,36,1,'em/s²')],
 f(s,p,u,o,inf){const tt=(1-p)*inf.L,side=o.side==='L'?-1:o.side==='R'?1:(R(u,74)<.5?-1:1);s.px=side*u.w/2;s.py=u.by0+G.E*.08;const td=o.hang+R(u,75)*.3;const th=x=>90*(1-Math.exp(-o.damp*x)*Math.cos(o.freq*TAU*x));
  if(tt<td){s.rot+=-side*th(tt)}else{const tf=tt-td;s.rot+=-side*(th(td)+tf*tf*40);s.y+=.5*o.g*G.E*tf*tf}}},
{id:'land',n:'Atterraggio',c:'Fisica',d:'Cade dall\'alto sulla propria base, rimbalza e si schiaccia all\'impatto.',rec:{split:'char',stagger:.45,ease:'linear'},
 p:[rng('h','Altezza',.5,15,3.5,.05,'em'),rng('g','Gravità',2,160,55,1,'em/s²'),rng('rest','Rimbalzo',0,.8,.38,.01),rng('sq','Schiacciamento',0,.8,.35,.01),rng('rot','Rotazione in volo',0,90,0,1,'°')],
 f(s,p,u,o,inf){const el=clamp(p)*inf.L,g=o.g*G.E,h=o.h*G.E;const r=fall(el,0,g,h,o.rest);s.y+=-h+r.y;if(r.first<0)s.rot+=RS(u,76)*o.rot*(1-r.y/h);if(r.lastI>=0){const since=el-r.lastI,sq=o.sq*clamp(r.lastV/Math.sqrt(2*g*h))*Math.exp(-since*11)*Math.cos(since*22);s.sy*=1-sq;s.sx*=1+sq*.7;pivot(s,'B',u)}s.op*=p>1e-4?1:0}},
{id:'burst',n:'Detonazione',c:'Fisica',exit:true,d:'Esplode dal centro con traiettorie a parabola che ricadono fuori campo.',rec:{split:'char',stagger:.05,ease:'linear'},
 p:[rng('pow','Potenza',0,40,12,.1,'em/s'),rng('up','Spinta verso l\'alto',0,30,6,.1,'em/s'),rng('g','Gravità',0,120,30,1,'em/s²'),rng('rand','Casualità',0,1,.4,.01),rng('spin','Rotazione',0,1440,500,1,'°/s'),rng('zoom','Verso la camera',0,3,.4,.01)],
 f(s,p,u,o,inf){const tt=(1-p)*inf.L,E=G.E;let a=Math.atan2(u.cy,u.cx);if(Math.hypot(u.cx,u.cy)<1)a=R(u,77)*TAU;a+=RS(u,78)*Math.PI*o.rand;const v=o.pow*E*(.6+R(u,79)*.8);const dm=(1-Math.exp(-tt*.9))/.9;s.x+=Math.cos(a)*v*dm;s.y+=(Math.sin(a)*v-o.up*E)*dm+.5*o.g*E*tt*tt;s.rot+=RS(u,80)*o.spin*tt;const k=1+o.zoom*tt*R(u,81);s.sx*=k;s.sy*=k}},
{id:'melt',n:'Scioglimento',c:'Fisica',exit:true,d:'Il testo cola verso il basso a strisce, come vernice fresca.',rec:{split:'word',stagger:.3,ease:'linear'},
 p:[rng('n','Strisce',4,120,40,1),rng('len','Colatura',0,12,3,.05,'em'),rng('sink','Affondamento',0,6,.6,.05,'em'),rng('blur','Sfocatura',0,20,0,.5,'px'),bool('fade','Dissolvenza finale',true)],
 f(s,p,u,o,inf){const pr=clamp(1-p),n=Math.round(o.n),e=EZ.inCubic(pr);s.vs={n,off:j=>{const r=hash(u.i*29+j*7+G.seed);return(r*r*.85+.15)*o.len*G.E*e}};s.y+=o.sink*G.E*EZ.inQuad(pr);s.blur+=o.blur*pr;if(o.fade)s.op*=1-clamp((pr-.65)/.35)}},
/* --- Trend 2026 --- */
{id:'blurlift',n:'Salita sfocata',c:'Trend 2026',d:'Sale dal basso uscendo dallo sfocato, morbido e pulito come le presentazioni prodotto.',rec:{split:'char',stagger:.3,ease:'outQuart'},
 p:[rng('dist','Salita',0,3,.35,.01,'em'),rng('blur','Sfocatura',0,60,18,1,'px'),rng('sc','Scala iniziale',.5,1.5,.92,.01)],
 f(s,p,u,o){const q=1-p,k=lerp(o.sc,1,p);s.y+=o.dist*G.E*q;s.blur+=o.blur*q;s.sx*=k;s.sy*=k;s.op*=clamp(p*1.4)}},
{id:'flap',n:'Tabellone',c:'Trend 2026',d:'Le palette di un tabellone da stazione girano su caratteri casuali fino a quello giusto.',rec:{split:'char',stagger:.4,ease:'outCubic'},
 p:[rng('flips','Giri',1,20,6,1),sel('set','Caratteri',[['AZ','Lettere'],['n09','Numeri'],['sym','Simboli']],'AZ'),rng('shade','Ombra',0,1,.5,.01)],
 f(s,p,u,o){const r=clamp(1-p)*o.flips,k=Math.floor(r),fr=r-k,c=Math.abs(Math.cos(fr*Math.PI));s.sy*=Math.max(.02,c);s.op*=(1-(1-c)*o.shade)*(p>1e-4?1:0);const kk=k+(fr>.5?1:0);if(kk>0)s.hooks.push({fn:flapHook,p:kk,o})}},
{id:'dolly',n:'Carrellata 3D',c:'Trend 2026',d:'Ogni lettera arriva da una profondità diversa verso il punto di fuga, come una camera che avanza.',rec:{split:'char',stagger:.2,ease:'outExpo'},
 p:[rng('depth','Profondità',0,10,4,.1),rng('var','Varietà',0,1,.6,.01),rng('blur','Sfocatura',0,40,6,1,'px')],
 f(s,p,u,o){const q=1-p,z=Math.max(0,o.depth*(1-o.var+o.var*R(u,101)*2)*q),k=1/(1+z);s.x+=u.cx*(k-1);s.y+=u.cy*(k-1);s.sx*=k;s.sy*=k;s.blur+=o.blur*q;s.op*=clamp(p*2)}},
{id:'ripple',n:'Increspatura',c:'Trend 2026',d:'Un\'onda circolare parte dal centro e si propaga sulle lettere, come un sasso nell\'acqua.',rec:{split:'char',stagger:.4,ease:'outCubic',order:'center'},
 p:[rng('amp','Ampiezza',0,3,.6,.01,'em'),rng('freq','Frequenza',0,3,1,.01),rng('cyc','Onde',0,6,2,.1)],
 f(s,p,u,o){const q=1-p,d=Math.hypot(u.cx,u.cy)/G.E,w=Math.sin(d*o.freq-q*o.cyc*TAU)*q;s.y+=w*o.amp*G.E;const k=1+w*.12;s.sx*=k;s.sy*=k;s.op*=clamp(p*2)}},
{id:'liquid',n:'Liquido',c:'Trend 2026',d:'Il testo si ricompone da strisce ondulate, come un riflesso sull\'acqua che si calma.',rec:{split:'word',stagger:.25,ease:'outCubic'},
 p:[rng('n','Strisce',4,120,36,1),rng('amp','Ampiezza',0,4,1.2,.01,'em'),rng('freq','Frequenza',0,2,.35,.01),rng('blur','Sfocatura',0,20,2,.5,'px')],
 f(s,p,u,o){const q=clamp(1-p),n=Math.round(o.n);s.vs={n,off:j=>Math.sin(j*o.freq+q*6+u.i)*o.amp*G.E*q*q};s.blur+=o.blur*q;s.op*=clamp(p*2)}},
{id:'mosaic',n:'Mosaico',c:'Trend 2026',d:'Il testo si compone a tessere che appaiono in ordine casuale.',rec:{split:'word',stagger:.3,ease:'linear'},
 p:[rng('n','Tessere',8,200,60,1),rng('soft','Morbidezza',0,1,.3,.01),rng('lift','Sollevamento',0,.5,.06,.01,'em')],
 f(s,p,u,o){const w=Math.max(.02,o.soft);s.frag={pieces:pieces(u,o.n),fn:pc=>{const h=hash(u.i*37+pc.k*101+G.seed),a=clamp((p-h*(1-w))/w);return{x:0,y:(1-a)*o.lift*G.E,r:0,op:a}}}}},
{id:'shards',n:'Vetro',c:'Trend 2026',d:'Schegge di vetro volano da tutte le direzioni e si incastrano a formare le lettere.',rec:{split:'char',stagger:.3,ease:'outExpo'},
 p:[rng('n','Schegge',4,80,24,1),rng('dist','Distanza',0,10,2.5,.05,'em'),rng('rot','Rotazione',0,720,180,1,'°'),rng('jit','Casualità tempo',0,1,.4,.01)],
 f(s,p,u,o){s.frag={pieces:pieces(u,o.n),fn:pc=>{const h=j=>hash(u.i*53+pc.k*71+j*17+G.seed),d0=h(5)*o.jit*.5,a=clamp((p-d0)/(1-d0)),qq=1-a,an=Math.atan2(pc.cy,pc.cx)+(h(1)-.5)*1.5,r=o.dist*G.E*(.4+h(2))*qq;return{x:Math.cos(an)*r,y:Math.sin(an)*r,r:(h(3)-.5)*2*o.rot*qq,op:clamp(a*3)}}}}},
{id:'chroma',n:'Aberrazione cromatica',c:'Trend 2026',d:'Canali colore separati che convergono mentre il testo va a fuoco.',rec:{split:'word',stagger:.25,ease:'outExpo'},
 p:[rng('rgb','Separazione',0,120,40,1,'px'),rng('blur','Sfocatura',0,40,8,1,'px'),rng('sc','Scala iniziale',.8,2,1.15,.01),col('ca','Canale 1','#ff2a55'),col('cb','Canale 2','#00e1ff')],
 f(s,p,u,o){const q=clamp(1-p),k=lerp(o.sc,1,p);s.rgb=o.rgb*q;s.rgbA=o.ca;s.rgbB=o.cb;s.blur+=o.blur*q;s.sx*=k;s.sy*=k;s.op*=clamp(p*1.5)}},
{id:'echo',n:'Eco',c:'Trend 2026',d:'Scorre lasciando una scia di copie che si raccolgono all\'arrivo.',rec:{split:'char',stagger:.35,ease:'outExpo'},
 p:[sel('dir','Provenienza',DIRS.slice(0,8),'B'),rng('dist','Distanza',0,8,2,.01,'em'),rng('n','Copie',1,12,5,1),rng('gap','Scia',0,2,.35,.01,'em'),rng('a','Opacità scia',0,1,.5,.01)],
 f(s,p,u,o){const q=1-p,[x,y]=dv(o.dir,u);s.x+=x*o.dist*G.E*q;s.y+=y*o.dist*G.E*q;s.echo={n:Math.round(o.n),dx:x*o.gap*G.E*q,dy:y*o.gap*G.E*q,a:o.a*clamp(q*4)};s.op*=clamp(p*3)}},
{id:'flicker',n:'Accensione neon',c:'Trend 2026',d:'Le lettere si accendono a scatti come un\'insegna al neon che parte.',rec:{split:'char',stagger:.6,ease:'linear'},
 p:[rng('hz','Frequenza',1,30,16,1,'Hz'),rng('dim','Luminosità spenta',0,1,.08,.01),bool('colB','Parte dal colore B',false)],
 f(s,p,u,o){const k=Math.floor(G.t*o.hz),on=hash(u.i*191+k*37+G.seed)<p*p;s.op*=p>1e-4?(on?1:o.dim):0;if(o.colB)s.mix+=clamp(1-p)}},
{id:'cube',n:'Cubo 3D',c:'Trend 2026',d:'Il testo ruota come la faccia di un cubo, dentro una maschera.',rec:{split:'word',stagger:.2,ease:'outQuart'},
 p:[sel('dir','Verso',[['U','Verso l\'alto'],['D','Verso il basso']],'U'),rng('depth','Profondità',0,2,1,.01),rng('shade','Ombra',0,1,.6,.01),bool('mask','Maschera',true)],
 f(s,p,u,o){const th=clamp(1-p,-.5,1)*Math.PI/2,c=Math.cos(th),hh=u.by1-u.by0;if(o.mask)s.clip=1;s.sy*=Math.max(.002,c);s.y+=(o.dir==='U'?1:-1)*Math.sin(th)*hh*.5*o.depth;s.op*=1-(1-c)*o.shade}},
{id:'smear',n:'Scatto con scia',c:'Trend 2026',d:'Arriva di scatto, allungato dalla velocità, poi torna alla forma normale.',rec:{split:'char',stagger:.3,ease:'outExpo'},
 p:[sel('dir','Provenienza',DIR4,'L'),rng('dist','Distanza',0,10,3,.05,'em'),rng('amt','Allungamento',0,4,1.5,.01),rng('blur','Sfocatura',0,30,4,1,'px')],
 f(s,p,u,o){const q=1-p,[x,y]=dv(o.dir,u),c=clamp(p),st=o.amt*4*c*(1-c);s.x+=x*o.dist*G.E*q;s.y+=y*o.dist*G.E*q;if(x){s.sx*=1+st;s.sy*=1/(1+st*.3)}else{s.sy*=1+st;s.sx*=1/(1+st*.3)}s.blur+=o.blur*clamp(q);s.op*=clamp(p*3)}},
{id:'outline',n:'Dal contorno',c:'Trend 2026',d:'Appare solo il contorno, poi le lettere si riempiono.',rec:{split:'char',stagger:.5,ease:'inOutCubic'},
 p:[rng('w','Spessore',.2,10,1.5,.1,'% em'),rng('sc','Scala iniziale',.8,1.3,1,.01),rng('blur','Sfocatura',0,20,0,1,'px')],
 f(s,p,u,o){const q=clamp(1-p),k=lerp(o.sc,1,p);s.outl=q;s.outlW=Math.max(.5,o.w/100*G.E);s.sx*=k;s.sy*=k;s.blur+=o.blur*q;s.op*=clamp(p*6)}},
{id:'hop',n:'Salto',c:'Trend 2026',d:'Ogni lettera salta al suo posto con un arco e si schiaccia all\'atterraggio.',rec:{split:'char',stagger:.4,ease:'linear'},
 p:[sel('dir','Da',[['L','Da sinistra'],['R','Da destra']],'L'),rng('dist','Distanza',0,6,1,.01,'em'),rng('h','Altezza salto',0,6,1.2,.01,'em'),rng('sq','Schiacciamento',0,.6,.2,.01),rng('rot','Rotazione',0,360,0,1,'°')],
 f(s,p,u,o){const c=clamp(p),v=o.dir==='L'?-1:1;s.x+=v*o.dist*G.E*(1-c);s.y-=o.h*G.E*4*c*(1-c);s.rot+=v*o.rot*(1-c);if(c>.85){const sq=o.sq*Math.sin((c-.85)/.15*Math.PI);s.sy*=1-sq;s.sx*=1+sq*.6;pivot(s,'B',u)}s.op*=clamp(c*5)}},
{id:'rain',n:'Pioggia digitale',c:'Trend 2026',d:'Caratteri casuali cadono dall\'alto e si trasformano nel testo all\'arrivo.',rec:{split:'char',stagger:.7,ease:'outCubic',order:'random'},
 p:[rng('h','Caduta',0,20,4,.1,'em'),sel('set','Caratteri',[['bin','Binario'],['AZ','Lettere'],['n09','Numeri'],['blk','Blocchi'],['sym','Simboli']],'bin'),rng('rate','Cambio ogni',1,8,2,1,'frame'),bool('colB','Colore B in caduta',true)],
 f(s,p,u,o){s.y-=o.h*G.E*(1-p);if(p<1)s.hooks.push({fn:rainHook,p,o});s.op*=clamp(p*3)}},
{id:'vortex',n:'Risucchio',c:'Trend 2026',d:'Le lettere escono da un vortice al centro e si srotolano in riga.',rec:{split:'char',stagger:.15,ease:'outCubic'},
 p:[rng('turns','Giri',-3,3,.75,.05),rng('sc','Scala iniziale',0,1,0,.01),rng('blur','Sfocatura',0,30,0,1,'px')],
 f(s,p,u,o){const q=1-p,a=o.turns*TAU*q,c=Math.cos(a),sn=Math.sin(a),k=lerp(o.sc,1,p);s.x+=(u.cx*c-u.cy*sn)*p-u.cx;s.y+=(u.cx*sn+u.cy*c)*p-u.cy;s.rot+=a/D2R;s.sx*=k;s.sy*=k;s.blur+=o.blur*clamp(q);s.op*=clamp(p*3)}},
{id:'stamp',n:'Timbro',c:'Trend 2026',d:'Cala dall\'alto come un timbro e fa tremare il fotogramma all\'impatto.',rec:{split:'word',stagger:.3,ease:'linear'},
 p:[rng('from','Scala iniziale',1,6,2.6,.01,'×'),rng('rot','Rotazione',-45,45,-8,1,'°'),rng('shake','Scossa',0,1,.35,.01,'em'),rng('blur','Sfocatura',0,30,6,1,'px')],
 f(s,p,u,o){const c=clamp(p),pre=Math.min(1,c/.55),k=lerp(o.from,1,EZ.inQuad(pre));s.sx*=k;s.sy*=k;s.rot+=o.rot*(1-pre);s.blur+=o.blur*(1-pre);if(c>=.55){const z=(c-.55)/.45,e=Math.exp(-z*6);s.x+=Math.sin(z*50)*o.shake*G.E*e*.3;s.y+=Math.cos(z*43)*o.shake*G.E*e*.2}s.op*=clamp(pre*3)}},
{id:'counter',n:'Contatore',c:'Trend 2026',d:'Numeri e lettere scorrono in sequenza (0-9, A-Z) fino al carattere finale.',rec:{split:'char',stagger:.3,ease:'outCubic'},
 p:[rng('spins','Giri',0,10,2,1)],
 f(s,p,u,o){if(p<1)s.hooks.push({fn:cntHook,p,o});s.op*=p>1e-4?1:0}},
{id:'scan',n:'Scansione',c:'Trend 2026',d:'Una linea di scansione attraversa il testo e lo rivela, con un leggero disturbo.',rec:{split:'word',stagger:.2,ease:'linear'},
 p:[sel('dir','Direzione',[['T','Dall\'alto'],['B','Dal basso'],['L','Da sinistra'],['R','Da destra']],'T'),rng('jit','Disturbo',0,1,.3,.01),bool('line','Linea di scansione',true),bool('colB','Parte dal colore B',true)],
 f(s,p,u,o){const q=clamp(1-p),a=clamp(p);s.wipe={d:o.dir,a,soft:0};if(o.colB)s.mix+=clamp(q*1.5);s.x+=(hash(u.i*7+G.F*13+G.seed)-.5)*o.jit*G.E*.2*q;if(o.line&&a>0&&a<1)s.bar={d:o.dir,a:Math.max(0,a-.025),b:a,c:'B',pad:0}}},
{id:'blocks',n:'Pixel a blocchi',c:'Trend 2026',d:'Ogni lettera passa da blocchi pieni a sfumati (█▓▒░) prima di apparire, in stile Y2K.',rec:{split:'char',stagger:.5,ease:'linear'},
 p:[rng('steps','Passaggi',1,4,4,1),bool('colB','Blocchi in colore B',false)],
 f(s,p,u,o){if(p<1)s.hooks.push({fn:blkHook,p,o});s.op*=p>1e-4?1:0}},
];

/* ============================================================ effects: loops
   f(s,t,u,o,env) — applicati sopra la transizione */
const LOOPS=[
{id:'none',n:'Nessuno',p:[],f(){}},
{id:'wave',n:'Onda continua',d:'Ondulazione continua lungo il testo.',p:[rng('amp','Ampiezza',0,1,.1,.005,'em'),rng('hz','Velocità',0,4,.7,.01,'Hz'),rng('ph','Sfasamento',0,2,.35,.01),sel('ax','Asse',[['y','Verticale'],['x','Orizzontale'],['r','Rotazione']],'y')],
 f(s,t,u,o,e){const v=Math.sin(TAU*o.hz*t-u.i*o.ph)*e;if(o.ax==='y')s.y+=v*o.amp*G.E;else if(o.ax==='x')s.x+=v*o.amp*G.E;else s.rot+=v*o.amp*60}},
{id:'float',n:'Galleggiamento',d:'Movimento organico lento, ogni pezzo con la sua fase.',p:[rng('amp','Ampiezza',0,.5,.04,.005,'em'),rng('sp','Velocità',0,2,.35,.01,'Hz'),rng('rot','Rotazione',0,20,2,.1,'°')],
 f(s,t,u,o,e){const w=TAU*o.sp*t;s.x+=Math.sin(w*.7+R(u,20)*TAU)*o.amp*G.E*.6*e;s.y+=Math.sin(w+R(u,21)*TAU)*o.amp*G.E*e;s.rot+=Math.sin(w*.8+R(u,22)*TAU)*o.rot*e}},
{id:'jitter',n:'Tremolio',d:'Micro vibrazione a scatti, effetto disegnato a mano.',p:[rng('amp','Ampiezza',0,10,1.2,.05,'%em'),rng('hz','Frequenza',1,30,10,1,'Hz'),rng('rot','Rotazione',0,10,.8,.1,'°')],
 f(s,t,u,o,e){const k=Math.floor(t*o.hz);s.x+=RS(u,k*3+31)*o.amp*G.E*.01*e;s.y+=RS(u,k*3+32)*o.amp*G.E*.01*e;s.rot+=RS(u,k*3+33)*o.rot*e}},
{id:'breathe',n:'Respiro',d:'La scala pulsa lentamente come un respiro.',p:[rng('amp','Ampiezza',0,.5,.04,.005),rng('sp','Velocità',0,3,.5,.01,'Hz'),rng('ph','Sfasamento',0,2,.2,.01)],
 f(s,t,u,o,e){const k=1+o.amp*Math.sin(TAU*o.sp*t-u.i*o.ph)*e;s.sx*=k;s.sy*=k}},
{id:'wobble',n:'Oscillazione',d:'Leggera rotazione avanti e indietro.',p:[rng('deg','Angolo',0,45,4,.1,'°'),rng('sp','Velocità',0,3,.6,.01,'Hz'),rng('ph','Sfasamento',0,2,.3,.01),sel('piv','Perno',PIV,'B')],
 f(s,t,u,o,e){s.rot+=o.deg*Math.sin(TAU*o.sp*t-u.i*o.ph)*e;if(!s.px&&!s.py)pivot(s,o.piv,u)}},
{id:'cpulse',n:'Pulsazione colore',d:'Il colore B scorre ciclicamente lungo il testo.',p:[rng('amt','Intensità',0,1,1,.01),rng('sp','Velocità',0,3,.5,.01,'Hz'),rng('ph','Sfasamento',0,2,.25,.01),rng('sharp','Nitidezza',1,12,1,.1)],
 f(s,t,u,o,e){const v=.5-.5*Math.cos(TAU*o.sp*t-u.i*o.ph);s.mix+=o.amt*Math.pow(v,o.sharp)*e}},
{id:'wpulse',n:'Pulsazione peso',d:'Il peso del font respira tra due valori (font variabili).',p:[rng('min','Peso minimo',100,900,200,1),rng('max','Peso massimo',100,900,900,1),rng('sp','Velocità',0,3,.5,.01,'Hz'),rng('ph','Sfasamento',0,2,.3,.01)],
 f(s,t,u,o,e){const v=.5-.5*Math.cos(TAU*o.sp*t-u.i*o.ph);s.wght=lerp(s.wght??G.wght,lerp(o.min,o.max,v),e)}},
{id:'neon',n:'Neon',d:'Qualche lettera sfarfalla ogni tanto, come un\'insegna.',p:[rng('prob','Probabilità',0,.5,.06,.005),rng('hz','Frequenza',1,30,14,1,'Hz'),rng('dim','Luminosità spenta',0,1,.15,.01)],
 f(s,t,u,o,e){const k=Math.floor(t*o.hz);if(R(u,k*13+41)<o.prob*e)s.op*=o.dim}},
{id:'tglitch',n:'Glitch testuale',d:'Ogni tanto un carattere viene sostituito per un istante.',p:[rng('prob','Probabilità',0,.5,.04,.005),rng('hz','Frequenza',1,30,12,1,'Hz'),sel('set','Caratteri',[['AZ','Lettere'],['sym','Simboli'],['bin','Binario'],['blk','Blocchi']],'sym')],
 f(s,t,u,o,e){s.hooks.push({fn:tgHook,p:e,o})}},
];
function scrHook(c,j,len,p,u,o){if(c===' ')return;const settle=len<=1?.9:.1+.85*(j/(len-1));if(p>=settle)return;const k=Math.floor(G.F/o.rate);return{g:rChar(CHARSETS[o.set],u.i*977+j*131+k*7+G.seed*3,c),b:o.colB}}
function fontHook(c,j,len,p,u,o){if(p>=1-o.hold)return;const k=Math.floor(G.F/o.rate),pool=fontPool();return{font:pool[Math.floor(hash(u.i*31+j*17+k*11+G.seed)*pool.length)]}}
function flapHook(c,j,len,kk,u,o){if(c===' ')return;return{g:rChar(CHARSETS[o.set],u.i*613+j*29+kk*47+G.seed,c)}}
function rainHook(c,j,len,p,u,o){if(c===' '||p>.9)return;const k=Math.floor(G.F/o.rate);return{g:rChar(CHARSETS[o.set],u.i*419+j*61+k*13+G.seed,c),b:o.colB}}
function cntHook(c,j,len,p,u,o){const st=Math.round(clamp(1-p)*(o.spins*10+j));if(!st)return;if(/[0-9]/.test(c))return{g:String((((+c-st)%10)+10)%10)};const up=/[A-Z]/.test(c);if(!up&&!/[a-z]/.test(c))return;const b=up?65:97;return{g:String.fromCharCode(b+(((c.charCodeAt(0)-b-st)%26)+26)%26)}}
function blkHook(c,j,len,p,u,o){if(c===' ')return;const st=Math.round(o.steps),kk=Math.floor(clamp(1-p+(hash(u.i*11+j*7+G.seed)-.5)*.3)*(st+1));if(kk<=0)return;return{g:'░▒▓█'[Math.min(3,kk-1+4-st)],b:o.colB}}
function tgHook(c,j,len,e,u,o){const k=Math.floor(G.t*o.hz);if(hash(u.i*71+j*13+k*29+G.seed)<o.prob*e)return{g:rChar(CHARSETS[o.set],u.i*3+j*7+k,c)}}
const FXMAP=Object.fromEntries(FX.map(f=>[f.id,f])),LMAP=Object.fromEntries(LOOPS.map(f=>[f.id,f]));
const CATS=[...new Set(FX.map(f=>f.c))];

/* ============================================================ state */
const FMT={'16:9':[1920,1080],'9:16':[1080,1920],'1:1':[1080,1080],'4:5':[1080,1350]};
const mkSlot=(fx,extra={})=>({fx,split:'char',stagger:.4,order:'start',ease:'fx',invert:false,prms:{},...extra});
function defaults(){return{
 v:2,fmt:'16:9',res:1,fps:30,
 text:'Ogni dettaglio\nconta',font:0,wght:600,italic:false,fs:170,fit:true,fitW:74,track:-20,lh:1.02,align:'center',tcase:'none',
 color:'#efece6',colorB:'#ff4d00',bg:'#121212',transparent:false,stroke:false,strokeW:2,colorIn:false,
 anchor:'mm',margin:8,offX:0,offY:0,
 block:{keys:[],mode:'none',fx:0,fy:0,tx:0,ty:0,s0:1,s1:1.06,r0:0,r1:0,ease:'inOutSine',from:'tl',to:'br',rotm:'none',rang:0,spin:0,pace:'lin',pow:3,hold:.35,drift:4,arc:0,m:2},
 delay:.25,dIn:1.1,hold:1.4,dOut:.7,tail:.35,
 seed:7,
 inS:mkSlot('mask',{stagger:.35,ease:'fx'}),
 outMode:'mirror',
 outS:mkSlot('fade',{split:'word',stagger:.25,ease:'inCubic'}),
 loop:{fx:'none',when:'hold',prms:{}},
 images:[],layers:[],imgH:1.25,imgTint:false,
 blocks:[],cur:0,
}}
let S=defaults();
function prmOf(slot,list){const fx=list[slot.fx]||list[Object.keys(list)[0]];if(!slot.prms)slot.prms={};if(!slot.prms[slot.fx])slot.prms[slot.fx]={};const o=slot.prms[slot.fx];for(const d of fx.p)if(o[d.k]===undefined)o[d.k]=d.v;return o}
// campi che appartengono a un singolo blocco di testo; il resto di S è globale (formato, fps, sfondo, immagini, livelli)
const TEXTK=['text','font','wght','italic','fs','fit','fitW','track','lh','align','tcase','color','colorB','stroke','strokeW','colorIn','anchor','margin','offX','offY','block','delay','dIn','hold','dOut','tail','inS','outMode','outS','loop','imgH','imgTint'];
const GLOBALK=['fmt','res','fps','bg','transparent','seed','images','layers'];
const pickText=o=>{const r={};for(const k of TEXTK)r[k]=o[k];return r};
function clipTotal(st=S){let m=timing(st).total;if(st.blocks&&st.blocks.length>1)st.blocks.forEach((b,i)=>{if(i!==st.cur)m=Math.max(m,timing({...st,...b}).total)});return m}
function timing(S){const inS=S.delay,outS=S.delay+S.dIn+S.hold,on=S.outMode!=='none';return{inS,holdS:S.delay+S.dIn,outS,total:outS+(on?S.dOut:0)+S.tail,on}}

/* ============================================================ images */
const IMGS={};
function loadImg(rec){return new Promise(r=>{const im=new Image();im.onload=()=>{IMGS[rec.id]=im;r(im)};im.onerror=()=>r(null);im.src=rec.src})}
const TINT=new Map();
// ponytail: colori animati (mixRGB) quantizzati a passi di 8 per non creare una canvas per frame
const qcol=c=>{const m=/^rgb\((\d+),(\d+),(\d+)\)$/.exec(c);return m?`rgb(${m.slice(1).map(v=>Math.min(255,Math.round(v/8)*8)).join(',')})`:c};
function tinted(id,color){color=qcol(color);const k=id+'|'+color;let c=TINT.get(k);if(c)return c;const im=IMGS[id];const nw=im.naturalWidth||512,nh=im.naturalHeight||512,sc=Math.min(1,1024/Math.max(nw,nh));c=document.createElement('canvas');c.width=Math.max(1,Math.round(nw*sc));c.height=Math.max(1,Math.round(nh*sc));const x=c.getContext('2d');x.drawImage(im,0,0,c.width,c.height);x.globalCompositeOperation='source-in';x.fillStyle=color;x.fillRect(0,0,c.width,c.height);if(TINT.size>24)TINT.clear();TINT.set(k,c);return c}
const imgAR=id=>{const im=IMGS[id];return im&&im.naturalWidth?im.naturalHeight/im.naturalWidth:1};

/* ============================================================ layout */
function layout(S,ctx,W,H){
 if(S.fit){const L0=layout({...S,fit:false},ctx,W,H);const hl=S.fitW>100?Infinity:.86*H/Math.max(1,L0.bh);const k=Math.min(S.fitW/100*W/Math.max(1,L0.bw),hl);S.fs=Math.max(4,Math.round(S.fs*k*10)/10)}
 ctx.font=fontStr(S);if('letterSpacing' in ctx)ctx.letterSpacing='0px';
 let txt=S.text||'';if(S.tcase==='upper')txt=txt.toUpperCase();else if(S.tcase==='lower')txt=txt.toLowerCase();
 const lines=txt.split('\n'),tr=S.track/1000*S.fs,lh=S.fs*S.lh;
 const mH=ctx.measureText('H'),capH=mH.actualBoundingBoxAscent||S.fs*.7;
 const fm=ctx.measureText('Hgjpqy');const asc=fm.fontBoundingBoxAscent||S.fs*.92,desc=fm.fontBoundingBoxDescent||S.fs*.26;
 const imgs=S.images||[];
 const LD=lines.map(l=>{const a=[],xs=[],ws=[];let x=0,gi=0;
  l.split(/(\{\d+\})/).forEach(part=>{if(!part)return;const m=part.match(/^\{(\d+)\}$/),rec=m&&imgs[+m[1]-1];
   if(rec&&IMGS[rec.id]){const ih=capH*S.imgH,iw=ih/imgAR(rec.id);a.push({img:rec.id,iw,ih});xs.push(x+gi*tr);ws.push(iw);x+=iw;gi++;return}
   const arr=Array.from(part);let pre='';for(const ch of arr){xs.push(x+ctx.measureText(pre).width+gi*tr);ws.push(ctx.measureText(ch).width);a.push(ch);pre+=ch;gi++}x+=ctx.measureText(part).width});
  return{a,xs,ws,w:gi?x+(gi-1)*tr:0}});
 const bw=Math.max(1,...LD.map(l=>l.w)),bh=Math.max(1,lines.length)*lh;
 const base=capH/2,padY=S.fs*.06;
 const chars=[];
 LD.forEach((l,k)=>{const x0=S.align==='left'?-bw/2:S.align==='right'?bw/2-l.w:-l.w/2,cy=-bh/2+lh*(k+.5);let wi=0,inW=false;l.a.forEach((e,i)=>{const im=typeof e==='object';const sp=!im&&/\s/.test(e);if(sp){if(inW)wi++;inW=false}else inW=true;chars.push({ch:im?'':e,img:im?e.img:null,iw:im?e.iw:0,ih:im?e.ih:0,x:x0+l.xs[i],w:l.ws[i],cy,line:k,word:k*10000+wi,sp})})});
 const vis=chars.filter(c=>!c.sp);
 const groups={char:vis.map(c=>[c]),word:[],line:[],all:vis.length?[vis]:[]};
 const gb=(key,arr)=>{const m=new Map();for(const c of vis){const k=c[key];if(!m.has(k))m.set(k,[]);m.get(k).push(c)}arr.push(...m.values())};
 gb('word',groups.word);gb('line',groups.line);
 const mg=S.margin/100*Math.min(W,H),ay=S.anchor[0],ax=S.anchor[1];
 const ox=(ax==='l'?mg+bw/2:ax==='r'?W-mg-bw/2:W/2)+S.offX/100*W;
 const oy=(ay==='t'?mg+bh/2:ay==='b'?H-mg-bh/2:H/2)+S.offY/100*H;
 const units={};
 for(const key in groups){const arr=groups[key].map((cs,i)=>{let mn=Infinity,mx=-Infinity,cyMin=Infinity,cyMax=-Infinity,ihm=0;for(const c of cs){mn=Math.min(mn,c.x);mx=Math.max(mx,c.x+c.w);cyMin=Math.min(cyMin,c.cy);cyMax=Math.max(cyMax,c.cy);if(c.img)ihm=Math.max(ihm,c.ih)}const cx=(mn+mx)/2,cy=(cyMin+cyMax)/2;
   const by0=Math.min(cyMin-cy+base-asc-padY,cyMin-cy-ihm/2-padY),by1=Math.max(cyMax-cy+base+desc+padY,cyMax-cy+ihm/2+padY);
   return{i,cx,cy,w:mx-mn,line:cs[0].line,chars:cs.map((c,j)=>({ch:c.ch,img:c.img,iw:c.iw,ih:c.ih,j,rx:c.x+c.w/2-cx,ry:c.cy-cy})),by0,by1,fx:ox+cx,fy:oy+cy}});
   arr.forEach(u=>u.n=arr.length);arr.maxX=Math.max(1,...arr.map(u=>Math.abs(u.cx)));units[key]=arr}
 return{units,bw,bh,ox,oy,lh,base,asc,desc,capH,font:fontStr(S),nl:lines.length}
}
function order(mode,u,arr,nl){const n=arr.length;switch(mode){case'end':return n>1?1-u.i/(n-1):0;case'center':return Math.abs(u.cx)/arr.maxX;case'edges':return 1-Math.abs(u.cx)/arr.maxX;case'random':return R(u,77);case'lines':return nl>1?u.line/(nl-1):0;default:return n>1?u.i/(n-1):0}}

/* ============================================================ render */
function newState(){return{x:0,y:0,sx:1,sy:1,rot:0,skx:0,op:1,blur:0,mix:0,px:0,py:0,clip:0,wipe:null,slices:null,vs:null,frag:null,roll:null,bar:null,rgb:0,wght:null,hooks:[],echo:null,outl:0,outlW:0}}
function unitP(slot,tp,D,u,arr,nl,E){const Sg=clamp(slot.stagger,0,.99),Lx=D*(1-Sg),off=order(slot.order,u,arr,nl)*D*Sg;const l=Lx>1e-6?clamp((tp-off)/Lx):(tp>=off?1:0);return E(l)}
function easeOf(slot,list){const e=slot.ease==='fx'?(list[slot.fx]?.rec?.ease||'outCubic'):slot.ease;return EZ[e]||EZ.outCubic}
function pathProg(x,b){switch(b.pace){case'lin':return x;case'ease':return EZ.inOutSine(x);case'slow':{const y=2*x-1;return .5+.5*Math.sign(y)*Math.abs(y)**b.pow}
 default:{const h=clamp(b.hold,0,.95),a=(1-h)/2,d=b.drift/100;if(h<1e-3)return EZ.inOutCubic(x);if(x<a)return EZ.outCubic(x/a)*(.5-d/2);if(x>1-a)return .5+d/2+EZ.inCubic((x-(1-a))/a)*(.5-d/2);return .5-d/2+d*(x-a)/h}}}
function pathPt(code,W,H,hw,hh){return{x:code[1]==='l'?-hw:code[1]==='r'?W+hw:W/2,y:code[0]==='t'?-hh:code[0]==='b'?H+hh:H/2}}
function keyAt(keys,t){const K=[...keys].sort((a,b)=>a.t-b.t);if(!K.length)return{x:0,y:0,s:1,r:0,op:1};if(t<=K[0].t)return K[0];const L=K[K.length-1];if(t>=L.t)return L;let i=1;while(K[i].t<t)i++;const a=K[i-1],b=K[i],e=(EZ[b.ease]||EZ.linear)((t-a.t)/Math.max(1e-6,b.t-a.t));return{x:lerp(a.x,b.x,e),y:lerp(a.y,b.y,e),s:lerp(a.s,b.s,e),r:lerp(a.r,b.r,e),op:lerp(a.op,b.op,e)}}
function blockXf(S,Lay,t,T,W,H){const b=S.block;let bx=Lay.ox,by=Lay.oy,bs=1,br=0,op=1;
 if(b.mode==='keys'){const k=keyAt(b.keys||[],t);bx+=k.x/100*W;by+=k.y/100*H;bs=k.s;br=k.r;op=clamp(k.op)}
 if(b.mode==='free'){const e=(EZ[b.ease]||EZ.linear)(clamp(t/T.total));bx+=lerp(b.fx,b.tx,e)/100*W;by+=lerp(b.fy,b.ty,e)/100*H;bs=lerp(b.s0,b.s1,e);br=lerp(b.r0,b.r1,e)}
 else if(b.mode==='path'){const e=pathProg(clamp(t/T.total),b);const A0=pathPt(b.from,W,H,0,0),B0=pathPt(b.to,W,H,0,0);let ang=Math.atan2(B0.y-A0.y,B0.x-A0.x)/D2R;if(b.from===b.to)ang=0;
  let rot=0;if(b.rotm==='follow'){rot=ang;if(rot>90)rot-=180;if(rot<-90)rot+=180}else if(b.rotm==='v')rot=-90;else if(b.rotm==='v2')rot=90;else if(b.rotm==='custom')rot=b.rang;
  const sc=Math.max(b.s0,b.s1),c=Math.abs(Math.cos(rot*D2R)),sn=Math.abs(Math.sin(rot*D2R)),m=b.m/100*Math.min(W,H);
  const hw=(c*Lay.bw+sn*Lay.bh)/2*sc+m,hh=(sn*Lay.bw+c*Lay.bh)/2*sc+m;const A=pathPt(b.from,W,H,hw,hh),B=pathPt(b.to,W,H,hw,hh);
  bx=lerp(A.x,B.x,e)+S.offX/100*W;by=lerp(A.y,B.y,e)+S.offY/100*H;
  if(b.arc){const dx=B.x-A.x,dy=B.y-A.y,l=Math.hypot(dx,dy)||1,o=Math.sin(Math.PI*e)*b.arc/100*Math.min(W,H);bx+=-dy/l*o;by+=dx/l*o}
  bs=lerp(b.s0,b.s1,e);br=rot+b.spin*e}
 return{bx,by,bs,br,op}}

function renderFrame(ctx,S,Lay,t,W,H,res,opts={}){
 ctx.setTransform(res,0,0,res,0,0);ctx.globalAlpha=1;if(HAS_FILTER)ctx.filter='none';
 ctx.clearRect(0,0,W,H);
 if(!S.transparent){ctx.fillStyle=opts.bg||S.bg;ctx.fillRect(0,0,W,H)}else if(opts.checker)checker(ctx,W,H);
 G.E=S.fs;G.F=Math.floor(t*S.fps+1e-6);G.W=W;G.H=H;G.seed=S.seed;G.lh=Lay.lh;G.capH=Lay.capH;G.res=res;G.wght=S.wght;G.t=t;
 const cA=hexRGB(S.color),cB=hexRGB(S.colorB),TL={...timing(S),total:clipTotal(S)};
 if(S.layers&&S.layers.length)drawLayers(ctx,S,Lay,t,W,H,'below',cA,cB,TL);
 for(const[st,ly]of blockList(S,Lay))drawText(ctx,st,ly,t,W,H);
 if(S.layers&&S.layers.length)drawLayers(ctx,S,Lay,t,W,H,'above',cA,cB,TL);
 if(opts.guides)guides(ctx,W,H,res);
}
// blocchi non attivi: stato + layout calcolati in relayout() (BL); quello attivo è S stesso
let BL=[];
function blockList(st,Lay){if(!st.blocks||st.blocks.length<2)return[[st,Lay]];return st.blocks.map((b,i)=>{if(i===st.cur)return[st,Lay];const e=BL[i];if(!e)return null;for(const k of GLOBALK)e.st[k]=st[k];return[e.st,e.lay]}).filter(Boolean)}
function drawText(ctx,S,Lay,t,W,H){
 G.E=S.fs;G.lh=Lay.lh;G.capH=Lay.capH;G.wght=S.wght;
 const T=timing(S),cA=hexRGB(S.color),cB=hexRGB(S.colorB);
 ctx.save();
 const X=blockXf(S,Lay,t,T,W,H);
 ctx.translate(X.bx,X.by);if(X.br)ctx.rotate(X.br*D2R);if(X.bs!==1)ctx.scale(X.bs,X.bs);
 const out=T.on&&t>=T.outS,custom=out&&S.outMode==='custom';
 const slot=custom?S.outS:S.inS,fx=FXMAP[slot.fx]||FX[0],o=prmOf(slot,FXMAP),E=easeOf(slot,FXMAP);
 const arr=Lay.units[slot.split]||Lay.units.char;
 const D=out?S.dOut:S.dIn,inf={L:D*(1-clamp(slot.stagger,0,.99))};
 const lf=LMAP[S.loop.fx]||LOOPS[0],lo=prmOf(S.loop,LMAP);
 let env=1;if(S.loop.when==='hold'){const r=.35;env=clamp((t-T.holdS)/r)*(T.on?clamp((T.outS-t)/r):1)}
 const cols={A:S.color,B:S.colorB};
 const list=[];
 for(const u of arr){const s=newState();let p;
  if(!out)p=unitP(slot,t-T.inS,S.dIn,u,arr,Lay.nl,E);
  else if(!custom)p=unitP(slot,S.dOut-(t-T.outS),S.dOut,u,arr,Lay.nl,E);
  else p=1-unitP(slot,t-T.outS,S.dOut,u,arr,Lay.nl,E);
  if(Math.abs(p-1)>1e-6)fx.f(s,p,u,o,inf);
  if(custom&&slot.invert){s.x=-s.x;s.y=-s.y;s.rot=-s.rot;s.skx=-s.skx}
  if(S.colorIn)s.mix+=clamp(1-p);
  if(lf.id!=='none'&&env>0)lf.f(s,t,u,lo,env);
  list.push([u,s])}
 if(X.op!==1)for(const e of list)e[1].op*=X.op;
 for(const[u,s]of list)drawUnit(ctx,S,Lay,u,s,cA,cB);
 if(fx.post)fx.post(ctx,list,o,S,Lay,t,cols);
 ctx.restore();
}
function drawLayers(ctx,S,Lay,t,W,H,z,cA,cB,T){const E0=G.E;
 S.layers.forEach((L,li)=>{if(L.z!==z||L.hidden)return;const im=IMGS[L.img];if(!im||!im.naturalWidth)return;
  const end=L.end>0?L.end:T.total;if(t<L.start-1e-6)return;if(L.outMode!=='none'&&t>end+1e-6)return;
  const nw=im.naturalWidth,nh=im.naturalHeight;let dw,dh;if(L.mode==='cover'){const k=Math.max(W/nw,H/nh)*L.size/100;dw=nw*k;dh=nh*k}else{dw=W*L.size/100;dh=dw*nh/nw}
  const x=W*L.x/100,y=H*L.y/100;
  const u={i:li+500,n:1,cx:0,cy:0,w:dw,by0:-dh/2,by1:dh/2,fx:x,fy:y,line:0,chars:[{img:L.img,j:0,rx:0,ry:0,iw:dw,ih:dh,tint:L.tint}]};
  G.E=Math.max(dw,dh)*.5;
  const fx=FXMAP[L.fx]||FXMAP.fade,o=prmOf(L,FXMAP),E=easeOf(L,FXMAP);let p=1,LL=L.dIn;const ti=t-L.start;
  if(ti<L.dIn)p=E(clamp(ti/Math.max(1e-4,L.dIn)));else if(L.outMode!=='none'&&t>end-L.dOut){LL=L.dOut;p=fx.exit?1-E(clamp((t-(end-L.dOut))/Math.max(1e-4,L.dOut))):E(clamp((end-t)/Math.max(1e-4,L.dOut)))}
  const s=newState();if(Math.abs(p-1)>1e-6)fx.f(s,p,u,o,{L:LL});
  if(L.lp&&L.lp.fx!=='none'){const lf=LMAP[L.lp.fx];if(lf)lf.f(s,t,u,prmOf(L.lp,LMAP),1)}
  s.op*=L.op;
  ctx.save();ctx.translate(x,y);if(L.rot)ctx.rotate(L.rot*D2R);drawUnit(ctx,S,{base:0,capH:Lay.capH,font:Lay.font},u,s,cA,cB);ctx.restore()});
 G.E=E0}
function checker(ctx,W,H){const z=24;ctx.fillStyle='#1a1a1a';ctx.fillRect(0,0,W,H);ctx.fillStyle='#222';for(let y=0;y<H;y+=z)for(let x=(y/z)%2?z:0;x<W;x+=z*2)ctx.fillRect(x,y,z,z)}
function guides(ctx,W,H,res){ctx.save();ctx.setTransform(res,0,0,res,0,0);ctx.lineWidth=1.5;ctx.strokeStyle='rgba(255,77,0,.7)';ctx.setLineDash([8,6]);ctx.strokeRect(W*.05,H*.05,W*.9,H*.9);ctx.strokeStyle='rgba(255,255,255,.25)';ctx.strokeRect(W*.1,H*.1,W*.8,H*.8);ctx.setLineDash([]);ctx.strokeStyle='rgba(255,255,255,.14)';ctx.beginPath();for(const f of[1/3,2/3]){ctx.moveTo(W*f,0);ctx.lineTo(W*f,H);ctx.moveTo(0,H*f);ctx.lineTo(W,H*f)}ctx.stroke();ctx.strokeStyle='rgba(255,77,0,.9)';ctx.beginPath();ctx.moveTo(W/2-14,H/2);ctx.lineTo(W/2+14,H/2);ctx.moveTo(W/2,H/2-14);ctx.lineTo(W/2,H/2+14);ctx.stroke();ctx.restore()}

function drawUnit(ctx,S,Lay,u,s,cA,cB){
 if(s.op<=.003||Math.abs(s.sx)<1e-4||Math.abs(s.sy)<1e-4)return;
 ctx.save();ctx.globalAlpha=Math.min(1,s.op);
 if(s.blur>.15&&HAS_FILTER)ctx.filter=`blur(${(s.blur*G.res).toFixed(2)}px)`;
 const padX=G.E*.08,x0=u.cx-u.w/2-padX,w0=u.w+padX*2,y0=u.cy+u.by0,h0=u.by1-u.by0;
 if(s.clip){ctx.beginPath();ctx.rect(x0,y0,w0,h0);ctx.clip()}
 if(s.wipe){const a=s.wipe.a;if(a<=0){ctx.restore();return}ctx.beginPath();switch(s.wipe.d){case'L':ctx.rect(x0,y0,w0*a,h0);break;case'R':ctx.rect(x0+w0*(1-a),y0,w0*a,h0);break;case'T':ctx.rect(x0,y0,w0,h0*a);break;case'B':ctx.rect(x0,y0+h0*(1-a),w0,h0*a);break;default:ctx.rect(x0+w0*(1-a)/2,y0,w0*a,h0)}ctx.clip();if(s.wipe.soft>0)ctx.globalAlpha*=clamp(a/(s.wipe.soft*.6+1e-3))}
 ctx.translate(u.cx+s.x,u.cy+s.y);
 const pv=s.px||s.py;if(pv)ctx.translate(s.px,s.py);
 if(s.rot)ctx.rotate(s.rot*D2R);
 if(s.skx)ctx.transform(1,0,Math.tan(clamp(s.skx,-85,85)*D2R),1,0,0);
 if(s.sx!==1||s.sy!==1)ctx.scale(s.sx,s.sy);
 if(pv)ctx.translate(-s.px,-s.py);
 if(s.bar){const b=s.bar,bx0=-u.w/2-b.pad*G.E,bw=u.w+b.pad*2*G.E,by0=u.by0,bh=u.by1-u.by0;let r;switch(b.d){case'R':r=[bx0+bw*(1-b.b),by0,bw*(b.b-b.a),bh];break;case'T':r=[bx0,by0+bh*b.a,bw,bh*(b.b-b.a)];break;case'B':r=[bx0,by0+bh*(1-b.b),bw,bh*(b.b-b.a)];break;default:r=[bx0+bw*b.a,by0,bw*(b.b-b.a),bh]}
  const ga=ctx.globalAlpha;ctx.globalAlpha=1;ctx.fillStyle=b.c==='A'?S.color:S.colorB;if(r[2]>0&&r[3]>0)ctx.fillRect(...r);ctx.globalAlpha=ga}
 const main=mixRGB(cA,cB,clamp(s.mix));
 const paint=(dx,dy,colr,gl,copy)=>drawChars(ctx,S,Lay,u,s,colr,dx,dy,gl,copy);
 const body=(dx,dy,gl)=>{if(s.echo&&s.echo.a>.003){const e=s.echo,ga=ctx.globalAlpha;for(let k=e.n;k>=1;k--){ctx.globalAlpha=ga*e.a*(1-k/(e.n+1));paint(dx+e.dx*k,dy+e.dy*k,main,gl,false)}ctx.globalAlpha=ga}if(s.rgb>.3){const ga=ctx.globalAlpha;ctx.globalAlpha=ga*.9;paint(dx-s.rgb,dy,s.rgbA,gl,true);paint(dx+s.rgb,dy,s.rgbB,gl,true);ctx.globalAlpha=ga}paint(dx,dy,main,gl,false)};
 const L=-u.w/2-G.E*.2,Wd=u.w+G.E*.4;
 if(s.frag){const F=s.frag,moving=[];ctx.beginPath();let still=0;
  for(const pc of F.pieces){const r=F.fn(pc);if(r.op<=.003)continue;if(!r.x&&!r.y&&!r.r&&r.op>=.999){const q=pc.poly;ctx.moveTo(q[0][0],q[0][1]);ctx.lineTo(q[1][0],q[1][1]);ctx.lineTo(q[2][0],q[2][1]);ctx.closePath();still++}else moving.push([pc,r])}
  if(still){ctx.save();ctx.clip();body(0,0);ctx.restore()}
  for(const[pc,r]of moving){ctx.save();ctx.globalAlpha*=r.op;ctx.translate(pc.cx+r.x,pc.cy+r.y);if(r.r)ctx.rotate(r.r*D2R);ctx.translate(-pc.cx,-pc.cy);const q=pc.poly;ctx.beginPath();ctx.moveTo(q[0][0],q[0][1]);ctx.lineTo(q[1][0],q[1][1]);ctx.lineTo(q[2][0],q[2][1]);ctx.closePath();ctx.clip();body(0,0);ctx.restore()}}
 else if(s.vs){const n=s.vs.n,bw=Wd/n;for(let j=0;j<n;j++){ctx.save();ctx.beginPath();ctx.rect(L+bw*j-.5,u.by0-G.E*20,bw+1,u.by1-u.by0+G.E*40);ctx.clip();body(0,s.vs.off(j));ctx.restore()}}
 else if(s.slices){const n=s.slices.n,top=u.by0,hh=(u.by1-u.by0)/n;for(let j=0;j<n;j++){ctx.save();ctx.beginPath();ctx.rect(-u.w/2-G.E,top+hh*j-.5,u.w+G.E*2,hh+1);ctx.clip();body(s.slices.off(j),0);ctx.restore()}}
 else if(s.roll){const r=s.roll,hh=(u.by1-u.by0);const gk=k=>(c)=>k===0?c.ch:rChar(CHARSETS[r.set],u.i*53+c.j*7+k*101+G.seed,c.ch);body(0,r.frac*hh*r.dir,gk(r.k));body(0,(r.frac-1)*hh*r.dir,gk(r.k+1))}
 else body(0,0);
 ctx.restore();
}
function drawChars(ctx,S,Lay,u,s,colr,dx,dy,gl,copy){
 ctx.textAlign='center';ctx.textBaseline='alphabetic';
 let cur='';const len=u.chars.length;
 for(const c of u.chars){
  if(c.img){const im=IMGS[c.img];if(!im)continue;const tm=c.tint!=null?c.tint:(S.imgTint?'A':'none');const tc=copy?colr:tm==='A'?colr:tm==='B'?S.colorB:null;
   ctx.drawImage(tc?tinted(c.img,tc):im,c.rx+dx-c.iw/2,c.ry+dy-c.ih/2,c.iw,c.ih);continue}
  let g=gl?gl(c):c.ch,fam=null,w=s.wght,alt=false;
  for(const h of s.hooks){const r=h.fn(g,c.j,len,h.p,u,h.o);if(r){if(r.g!=null)g=r.g;if(r.font)fam=r.font;if(r.b)alt=true}}
  const f=(fam||w!=null)?fontStr(S,fam,w):Lay.font;if(f!==cur){ctx.font=f;cur=f}
  const col=alt&&!copy?S.colorB:colr,x=c.rx+dx,y=Lay.base+c.ry+dy;
  if(S.stroke){ctx.strokeStyle=col;ctx.lineWidth=S.strokeW;ctx.lineJoin='round';ctx.strokeText(g,x,y)}else if(s.outl>0){const ga=ctx.globalAlpha;ctx.strokeStyle=col;ctx.lineWidth=s.outlW;ctx.lineJoin='round';ctx.globalAlpha=ga*clamp(s.outl*3);ctx.strokeText(g,x,y);ctx.globalAlpha=ga*(1-s.outl);ctx.fillStyle=col;ctx.fillText(g,x,y);ctx.globalAlpha=ga}else{ctx.fillStyle=col;ctx.fillText(g,x,y)}}
}

/* ============================================================ main canvas */
const cv=$('#cv'),ctx=cv.getContext('2d');
let Lay=null,t=0,playing=true,dirty=true,exporting=false;
function dims(){return FMT[S.fmt]}
function relayout(){const[W,H]=dims();const want=[W*S.res,H*S.res];if(cv.width!==want[0]||cv.height!==want[1]){cv.width=want[0];cv.height=want[1];fitStage()}
 const before=S.fs;Lay=layout(S,ctx,W,H);if(S.fit&&before!==S.fs&&UI.fs)UI.fs._set(S.fs);
 BL=S.blocks&&S.blocks.length>1?S.blocks.map((b,i)=>{if(i===S.cur)return null;const st={...S,...b};return{st,lay:layout(st,ctx,W,H)}}):[];dirty=true;drawTimeline()}
function draw(){const[W,H]=dims();renderFrame(ctx,S,Lay,t,W,H,S.res,{checker:true,guides:$('#cGuide').checked})}
function fitStage(){const wrap=$('#stageWrap'),r=wrap.getBoundingClientRect(),[W,H]=dims();const aw=Math.max(50,r.width-44),ah=Math.max(50,r.height-44),k=Math.min(aw/W,ah/H);cv.style.width=Math.floor(W*k)+'px';cv.style.height=Math.floor(H*k)+'px';$('#stageInfo').textContent=`${W*S.res}×${H*S.res} · ${Math.round(k*100/S.res)}%`}
new ResizeObserver(fitStage).observe($('#stageWrap'));

let lastNow=performance.now();
function tick(now){requestAnimationFrame(tick);const dt=Math.min(.1,(now-lastNow)/1000);lastNow=now;
 if(!exporting){const T={total:clipTotal()};if(playing){t+=dt;if(t>=T.total){if($('#cLoop').checked)t%=T.total;else{t=T.total;setPlay(false)}}dirty=true}
  if(t>T.total){t=T.total;dirty=true}
  if(dirty||S.loop.fx!=='none'&&playing){dirty=false;draw();updHead()}}}

/* ============================================================ timeline */
function fmtTC(t){const f=Math.floor(t*S.fps+1e-6),sec=Math.floor(f/S.fps),fr=f%S.fps;return`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}<span>:${String(fr).padStart(2,'0')}</span>`}
// ponytail: durante un trascinamento la scala è congelata (TLD.scale), altrimenti la timeline "scappa" sotto il puntatore
const TLD={scale:0};
const SEGK=[['delay','Ritardo','',0],['dIn','Entrata','s-in',.05],['hold','Pausa','s-hold',0],['dOut','Uscita','s-out',.05],['tail','Coda','',0]];
function drawTimeline(){const T=timing(S),D=TLD.scale||clipTotal(),pc=v=>v/D*100;
 let acc=0,sh='',hh='';for(const[k,n,c]of SEGK){if(k==='dOut'&&!T.on)continue;const d=S[k];acc+=d;sh+=`<div class="${c}" style="width:${pc(d)}%"><b>${n}</b>${d.toFixed(2)}s</div>`;hh+=`<span class="hd" data-k="${k}" style="left:${pc(acc)}%"></span>`}
 $('#segs').innerHTML=sh;$('#hds').innerHTML=hh;
 const step=1/S.fps,every=D>6?S.fps:Math.max(1,Math.round(S.fps/5)),lab=D<=3?.5:D<=12?1:D<=30?2:5;let h='';
 for(let f=0;f*step<=D;f+=every){h+=`<i class="${f%S.fps===0?'big':''}" style="left:${pc(f*step)}%"></i>`}
 for(let x=0;x<=D+1e-6;x+=lab)h+=`<b style="left:${pc(x)}%">${+x.toFixed(1)}s</b>`;$('#ticks').innerHTML=h;
 $('#kfs').innerHTML=S.block.mode==='keys'?(S.block.keys||[]).map((k,i)=>`<i data-i="${i}" class="${k===UI.selKey?'sel':''}" style="left:${clamp(k.t/D)*100}%" title="Keyframe ${(+k.t).toFixed(2)} s · trascina per spostarlo"></i>`).join(''):'';
 updHead()}
function updHead(){const T={total:clipTotal()},D=TLD.scale||T.total;$('#ph').style.left=(clamp(t/D)*100)+'%';$('#tc').innerHTML=fmtTC(t)+` <span>/ ${T.total.toFixed(2)}s</span>`}
(function(){const tl=$('#tl');let mode=null,info=null;
 const xAt=e=>{const r=tl.getBoundingClientRect();return(e.clientX-r.left)/r.width*(TLD.scale||clipTotal())};
 const snapF=v=>Math.round(v*S.fps)/S.fps;
 const scrub=e=>{const tot=clipTotal(),r=tl.getBoundingClientRect();t=clamp(xAt(e),0,tot);if(S.block.mode==='keys')for(const k of S.block.keys||[])if(Math.abs(k.t/tot*r.width-(e.clientX-r.left))<6){t=clamp(k.t,0,tot);break}dirty=true};
 tl.addEventListener('pointerdown',e=>{tl.setPointerCapture(e.pointerId);setPlay(false);const hd=e.target.closest('.hd'),kd=e.target.closest('.kfs i');
  if(hd){const key=hd.dataset.k,on=timing(S).on;let start=0;for(const[k]of SEGK){if(k===key)break;if(k!=='dOut'||on)start+=S[k]}info={key,start,min:SEGK.find(x=>x[0]===key)[3],el:hd};hd.classList.add('on');mode='seg';TLD.scale=clipTotal()}
  else if(kd){const key=S.block.keys[+kd.dataset.i];if(!key)return;info={key};UI.selKey=key;t=clamp(key.t,0,clipTotal());dirty=true;mode='key';TLD.scale=clipTotal();drawTimeline()}
  else{mode='scrub';scrub(e)}});
 tl.addEventListener('pointermove',e=>{if(!mode)return;if(mode==='scrub')return scrub(e);
  if(mode==='seg'){const v=+Math.max(info.min,snapF(xAt(e)-info.start)).toFixed(4);if(v!==S[info.key]){S[info.key]=v;UI.time?.[info.key]?._set(v);drawTimeline();tl.querySelector(`.hd[data-k="${info.key}"]`)?.classList.add('on');dirty=true}}
  else{const v=+clamp(snapF(xAt(e)),0,clipTotal()).toFixed(4);if(v!==info.key.t){info.key.t=v;t=v;drawTimeline();dirty=true}}});
 const end=()=>{if(!mode)return;const m=mode;mode=null;TLD.scale=0;drawTimeline();if(m==='key')buildBlock();if(m!=='scrub')histMark()};
 tl.addEventListener('pointerup',end);tl.addEventListener('pointercancel',end)})();
function setPlay(v){playing=v;$('#bPlay').classList.toggle('on',v)}
const stepF=n=>{setPlay(false);t=clamp(Math.round(t*S.fps+n)/S.fps,0,clipTotal());dirty=true};
$('#bPlay').onclick=()=>{if(!playing&&t>=clipTotal()-1e-6)t=0;setPlay(!playing)};
$('#bStart').onclick=()=>{t=0;dirty=true};$('#bPrev').onclick=()=>stepF(-1);$('#bNext').onclick=()=>stepF(1);
$('#cGuide').onchange=()=>dirty=true;
addEventListener('keydown',e=>{const mod=e.metaKey||e.ctrlKey,k=e.key.toLowerCase(),txt=e.target.closest('textarea,input[type=text],input[type=search],input[type=number],input.hex');
 if(mod&&k==='z'&&!txt){e.preventDefault();e.shiftKey?redo():undo();return}
 if(mod&&k==='y'&&!txt){e.preventDefault();redo();return}
 if(mod&&k==='s'){e.preventDefault();$('#bSave').click();return}
 if(e.key==='Escape'){$('#help').classList.remove('on');menu.classList.remove('on');return}
 if(e.target.closest('input,textarea,select')||mod||e.altKey)return;
 if(e.key==='?'){e.preventDefault();$('#help').classList.toggle('on');return}
 if(k==='e'){e.preventDefault();$('#bExport').click();return}
 if(e.code==='Space'){e.preventDefault();$('#bPlay').click()}else if(e.key==='ArrowLeft'){e.preventDefault();stepF(e.shiftKey?-10:-1)}else if(e.key==='ArrowRight'){e.preventDefault();stepF(e.shiftKey?10:1)}else if(e.key==='Home'){t=0;dirty=true}else if(e.key==='End'){t=clipTotal();dirty=true}else if(k==='k'){addKey()}else if(k==='g'){const c=$('#cGuide');c.checked=!c.checked;dirty=true}});

/* ============================================================ controls */
const UI={};
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function field(d,obj,cb){
 if(obj[d.k]===undefined)obj[d.k]=d.v;
 const row=el('div','row'),lab=el('label');lab.textContent=d.l;row.appendChild(lab);
 const fire=()=>cb&&cb(d.k,obj[d.k]);
 if(d.t==='r'){row.style.gridTemplateColumns='';const r=el('input'),nm=el('input','num');r.type='range';nm.type='number';for(const x of[r,nm]){x.min=d.min;x.max=d.max;x.step=d.st}
  const show=v=>{r.value=v;nm.value=+(+v).toFixed(3)};show(obj[d.k]);
  r.oninput=()=>{obj[d.k]=+r.value;nm.value=+(+r.value).toFixed(3);fire()};
  nm.onchange=()=>{const v=+nm.value;if(isNaN(v))return show(obj[d.k]);obj[d.k]=v;r.value=v;fire()};
  lab.classList.add('rs');lab.title='Trascina per regolare (⇧ fine, ⌥ finissimo) · doppio clic per ripristinare'+(d.un?` · unità: ${d.un}`:'');lab.ondblclick=()=>{obj[d.k]=d.v;show(d.v);fire()};
  lab.addEventListener('pointerdown',e=>{if(r.disabled||e.button!==0)return;const x0=e.clientX,v0=+obj[d.k];let moved=false;lab.setPointerCapture(e.pointerId);
   const mv=ev=>{const dx=ev.clientX-x0;if(!moved&&Math.abs(dx)<3)return;moved=true;document.body.classList.add('scrubbing');const lo=+r.min,hi=+r.max,k=(hi-lo)/400*(ev.altKey?.05:ev.shiftKey?.2:1);
    let v=clamp(v0+dx*k,Math.min(lo,v0),Math.max(hi,v0));v=+(Math.round(v/d.st)*d.st).toFixed(6);if(v!==obj[d.k]){obj[d.k]=v;show(v);fire()}};
   const up=()=>{lab.removeEventListener('pointermove',mv);lab.removeEventListener('pointerup',up);lab.removeEventListener('pointercancel',up);document.body.classList.remove('scrubbing')};
   lab.addEventListener('pointermove',mv);lab.addEventListener('pointerup',up);lab.addEventListener('pointercancel',up)});
  row.append(r,nm);row._set=v=>{obj[d.k]=v;show(v)};row._range=(a,b)=>{r.min=nm.min=a;r.max=nm.max=b};row._dis=v=>{r.disabled=nm.disabled=v;row.style.opacity=v?.45:1}}
 else if(d.t==='s'){row.classList.add('w2');const s=el('select');s.innerHTML=d.o.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');s.value=obj[d.k];s.onchange=()=>{obj[d.k]=s.value;fire()};row.appendChild(s);row._set=v=>{obj[d.k]=v;s.value=v};row._sel=s}
 else if(d.t==='b'){row.classList.add('w2');const w=el('label','sw'),c=el('input');c.type='checkbox';c.checked=!!obj[d.k];w.append(c,el('span'));c.onchange=()=>{obj[d.k]=c.checked;fire()};row.appendChild(w);row._set=v=>{obj[d.k]=v;c.checked=v}}
 else if(d.t==='c'){row.classList.add('w2');const w=el('div','colw'),c=el('input'),h=el('input','hex');c.type='color';c.value=obj[d.k];h.value=obj[d.k];
  c.oninput=()=>{obj[d.k]=c.value;h.value=c.value;fire()};h.onchange=()=>{let v=h.value.trim();if(!v.startsWith('#'))v='#'+v;if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)){if(v.length===4)v='#'+[...v.slice(1)].map(x=>x+x).join('');obj[d.k]=v.toLowerCase();c.value=obj[d.k];fire()}else h.value=obj[d.k]};
  w.append(c,h);row.appendChild(w);row._set=v=>{obj[d.k]=v;c.value=v;h.value=v}}
 return row}
function segRow(label,opts,obj,key,cb){const row=el('div','row w2'),lab=el('label');lab.textContent=label;const sg=el('div','seg');opts.forEach(([v,l])=>{const b=el('button',obj[key]===v?'on':'',l);b.type='button';b.onclick=()=>{obj[key]=v;[...sg.children].forEach(x=>x.classList.toggle('on',x===b));cb&&cb()};sg.appendChild(b)});row.append(lab,sg);row._set=v=>{obj[key]=v;[...sg.children].forEach((x,i)=>x.classList.toggle('on',opts[i][0]===v))};return row}
function section(title,open=true){const d=el('details');d.open=open;const s=el('summary',null,title);const b=el('div','body');d.append(s,b);$('#insp').appendChild(d);return{d,s,b}}
const onL=()=>{relayout()};
const onR=()=>{dirty=true;drawTimeline()};

function buildInspector(){
 const ins=$('#insp');ins.innerHTML='';buildBlocksUI();
 /* Testo */
 {const{b}=section('Testo');const ta=el('textarea','ta');ta.value=S.text;ta.placeholder='Scrivi il testo. Invio per andare a capo.';ta.oninput=()=>{S.text=ta.value;relayout();refreshBlocks()};b.appendChild(ta);UI.text=ta;
  const fr=el('div','row w2');fr.appendChild(el('label',null,'Font'));const fs=el('select');UI.fontSel=fs;fillFonts();fs.onchange=()=>{S.font=+fs.value;syncWeight();loadFonts().then(relayout);relayout()};fr.appendChild(fs);b.appendChild(fr);
  const up=el('div','bline');const ub=el('button','btn sm','Carica un font (.ttf .otf .woff)');ub.type='button';const fi=el('input');fi.type='file';fi.accept='.ttf,.otf,.woff,.woff2';fi.hidden=true;ub.onclick=()=>fi.click();fi.onchange=()=>uploadFont(fi.files[0]);up.append(ub,fi);b.appendChild(up);
  UI.wght=field(rng('wght','Peso',100,900,600,1),S,onL);b.appendChild(UI.wght);syncWeight();
  b.appendChild(field(bool('italic','Corsivo',false),S,onL));
  UI.fs=field(rng('fs','Dimensione',8,2400,170,1,'px'),S,onL);b.appendChild(UI.fs);
  UI.fit=field(bool('fit','Adatta al formato',false),S,()=>{UI.fs._dis(S.fit);UI.fitW.style.display=S.fit?'':'none';relayout()});b.appendChild(UI.fit);
  UI.fitW=field(rng('fitW','Larghezza',10,400,74,1,'%'),S,onL);b.appendChild(UI.fitW);UI.fitW.style.display=S.fit?'':'none';UI.fs._dis(S.fit);
  b.appendChild(field(rng('track','Spaziatura',-200,800,-20,1,'‰ em'),S,onL));
  b.appendChild(field(rng('lh','Interlinea',.6,3,1.02,.01,'×'),S,onL));
  b.appendChild(segRow('Allineamento',[['left','Sinistra'],['center','Centro'],['right','Destra']],S,'align',onL));
  b.appendChild(segRow('Maiuscole',[['none','Come scritto'],['upper','AA'],['lower','aa']],S,'tcase',onL));}
 /* Colore */
 {const{b}=section('Colore');b.appendChild(field(col('color','Testo','#efece6'),S,onR));b.appendChild(field(col('colorB','Colore B','#ff4d00'),S,onR));b.appendChild(field(col('bg','Sfondo','#121212'),S,onR));
  b.appendChild(field(bool('transparent','Sfondo trasparente',false),S,onR));
  b.appendChild(field(bool('colorIn','Entra dal colore B',false),S,onR));
  const sw=field(rng('strokeW','Spessore',.5,20,2,.1,'px'),S,onR);b.appendChild(field(bool('stroke','Solo contorno',false),S,()=>{sw.style.display=S.stroke?'':'none';onR()}));sw.style.display=S.stroke?'':'none';b.appendChild(sw);
  b.appendChild(el('div','note','Il colore B è usato dagli effetti di colore, dal cursore e dall\'evidenziatore.'))}
 /* Posizione */
 {const{b}=section('Posizione');const ar=el('div','row w2');ar.appendChild(el('label',null,'Ancoraggio'));const an=el('div','anchor');['tl','tm','tr','ml','mm','mr','bl','bm','br'].forEach(k=>{const bt=el('button',S.anchor===k?'on':'');bt.type='button';bt.title=k;bt.onclick=()=>{S.anchor=k;[...an.children].forEach(x=>x.classList.toggle('on',x===bt));relayout()};an.appendChild(bt)});ar.appendChild(an);b.appendChild(ar);
  b.appendChild(field(rng('margin','Margine',0,40,8,.5,'%'),S,onL));b.appendChild(field(rng('offX','Spost. X',-100,100,0,.1,'%'),S,onL));b.appendChild(field(rng('offY','Spost. Y',-100,100,0,.1,'%'),S,onL));
  const sub=el('div','sub');UI.blockSub=sub;b.appendChild(sub);buildBlock()}
 /* Tempo */
 {const{b}=section('Tempo');UI.time={};[rng('delay','Ritardo',0,5,.25,.01,'s'),rng('dIn','Entrata',.05,10,1.1,.01,'s'),rng('hold','Pausa',0,20,1.4,.01,'s'),rng('dOut','Uscita',.05,10,.7,.01,'s'),rng('tail','Coda',0,5,.35,.01,'s')].forEach(d=>{const r=field(d,S,onR);UI.time[d.k]=r;b.appendChild(r)});
  const sr=el('div','row w2');sr.appendChild(el('label',null,'Casualità'));const bl=el('div','bline');const rb=el('button','btn sm','Nuova variazione');rb.type='button';rb.onclick=()=>{S.seed=(S.seed*48271+11)%99991;dirty=true;buildThumbs()};bl.appendChild(rb);sr.appendChild(bl);b.appendChild(sr)}
 /* Entrata */
 {const sec=section('Entrata');UI.inSec=sec;buildSlot(sec,S.inS,'in')}
 /* Uscita */
 {const sec=section('Uscita');UI.outSec=sec;buildOut()}
 /* Loop */
 {const sec=section('Movimento continuo',false);UI.loopSec=sec;buildLoop()}
 {const sec=section('Immagini',S.images.length>0);UI.imgSec=sec;buildImages()}
}
function slotCommon(b,slot,withInvert){
 const fr=el('div','row w2');fr.appendChild(el('label',null,'Effetto'));const s=el('select');CATS.forEach(c=>{const g=el('optgroup');g.label=c;FX.filter(f=>f.c===c).forEach(f=>{const o=el('option',null,f.n);o.value=f.id;g.appendChild(o)});s.appendChild(g)});s.value=slot.fx;s.onchange=()=>setFx(slot,s.value);fr.appendChild(s);b.appendChild(fr);
 b.appendChild(el('div','fxdesc',FXMAP[slot.fx].d));
 b.appendChild(segRow('Scomponi',[['char','Lettere'],['word','Parole'],['line','Righe'],['all','Tutto']],slot,'split',onR));
 b.appendChild(field(rng('stagger','Sfalsamento',0,.98,.4,.01),slot,onR));
 b.appendChild(field(sel('order','Ordine',[['start','Dal primo'],['end','Dall\'ultimo'],['center','Dal centro'],['edges','Dai bordi'],['lines','Per riga'],['random','Casuale']],'start'),slot,onR));
 b.appendChild(field(sel('ease','Curva',EZ_LIST,'fx'),slot,onR));
 if(withInvert)b.appendChild(field(bool('invert','Inverti direzione',false),slot,onR));
 const sub=el('div','sub');const o=prmOf(slot,FXMAP);FXMAP[slot.fx].p.forEach(d=>sub.appendChild(field(d,o,onR)));
 const bl=el('div','bline');const rr=el('button','btn sm','Ripristina parametri');rr.type='button';rr.onclick=()=>{slot.prms[slot.fx]={};rebuildSlots();dirty=true};bl.appendChild(rr);sub.appendChild(bl);b.appendChild(sub)}
function buildSlot(sec,slot,which){sec.b.innerHTML='';sec.s.innerHTML=`${which==='in'?'Entrata':'Uscita'} <span class="fxn">${FXMAP[slot.fx].n}</span>`;slotCommon(sec.b,slot,which==='out')}
function buildOut(){const sec=UI.outSec;sec.b.innerHTML='';const lbl=S.outMode==='none'?'nessuna':S.outMode==='mirror'?'specchio di '+FXMAP[S.inS.fx].n.toLowerCase():FXMAP[S.outS.fx].n;sec.s.innerHTML=`Uscita <span class="fxn">${lbl}</span>`;
 sec.b.appendChild(segRow('Modalità',[['none','Nessuna'],['mirror','Specchio'],['custom','Altra']],S,'outMode',()=>{buildOut();onR();markTiles()}));
 if(S.outMode==='mirror')sec.b.appendChild(el('div','note','L\'entrata riprodotta al contrario, con gli stessi parametri. Scegli "Altra" per un\'uscita indipendente.'));
 if(S.outMode==='none')sec.b.appendChild(el('div','note','Il testo resta fermo fino alla fine della clip.'));
 if(S.outMode==='custom')slotCommon(sec.b,S.outS,true)}
function buildLoop(){const sec=UI.loopSec;sec.b.innerHTML='';const L=S.loop;sec.s.innerHTML=`Movimento continuo <span class="fxn">${LMAP[L.fx].id==='none'?'':LMAP[L.fx].n}</span>`;
 const fr=el('div','row w2');fr.appendChild(el('label',null,'Effetto'));const s=el('select');s.innerHTML=LOOPS.map(l=>`<option value="${l.id}">${l.n}</option>`).join('');s.value=L.fx;s.onchange=()=>{L.fx=s.value;buildLoop();onR();markTiles()};fr.appendChild(s);sec.b.appendChild(fr);
 if(L.fx==='none'){sec.b.appendChild(el('div','note','Aggiunge un movimento continuo sopra l\'animazione: onda, respiro, tremolio, neon.'));return}
 sec.b.appendChild(el('div','fxdesc',LMAP[L.fx].d));
 sec.b.appendChild(segRow('Attivo',[['hold','Solo in pausa'],['always','Sempre']],L,'when',onR));
 const sub=el('div','sub');const o=prmOf(L,LMAP);LMAP[L.fx].p.forEach(d=>sub.appendChild(field(d,o,onR)));sec.b.appendChild(sub)}
function rebuildSlots(){buildSlot(UI.inSec,S.inS,'in');buildOut();buildLoop();markTiles()}
function setFx(slot,id){slot.fx=id;const r=FXMAP[id].rec||{};if(r.split)slot.split=r.split;if(r.stagger!=null)slot.stagger=r.stagger;slot.order=r.order||slot.order;slot.ease='fx';rebuildSlots();dirty=true;drawTimeline()}
function syncWeight(){const f=FONTS[S.font]||FONTS[0];UI.wght._range(f.min,f.max);S.wght=clamp(S.wght,f.min,f.max);UI.wght._set(S.wght)}
function fillFonts(){const fs=UI.fontSel;fs.innerHTML='';const gs=[...new Set(FONTS.map(f=>f.g))];gs.forEach(g=>{const og=el('optgroup');og.label=g;FONTS.forEach((f,i)=>{if(f.g===g){const o=el('option',null,f.n+(f.g==='Variabili'?`  ${f.min}–${f.max}`:''));o.value=i;og.appendChild(o)}});fs.appendChild(og)});fs.value=S.font}
async function uploadFont(file){if(!file)return;try{const buf=await file.arrayBuffer();const name='U-'+file.name.replace(/\.[^.]+$/,'').replace(/[^\w-]/g,'');const ff=new FontFace(name,buf);await ff.load();document.fonts.add(ff);FONTS.push({n:file.name.replace(/\.[^.]+$/,''),g:'Caricati',css:`"${name}",sans-serif`,min:100,max:900});S.font=FONTS.length-1;fillFonts();syncWeight();relayout();histMark();toast('Font caricato: '+file.name)}catch(e){toast('Font non leggibile. Prova un file .ttf, .otf o .woff')}}
function loadFonts(){const js=FONTS.map(f=>document.fonts.load(`${f.min===f.max?f.min:400} 40px ${f.css}`).catch(()=>{}));js.push(document.fonts.load(fontStr({...S,fs:40})).catch(()=>{}));return Promise.all(js)}


/* ============================================================ block / trajectory UI */
function gridPick(label,obj,key,cb,cls){const w=el('div');w.appendChild(el('span',null,label));const an=el('div','anchor');['tl','tm','tr','ml','mm','mr','bl','bm','br'].forEach(k=>{const bt=el('button',obj[key]===k?'on '+(cls||''):'');bt.type='button';bt.title=k;bt.onclick=()=>{obj[key]=k;[...an.children].forEach(x=>x.className=x===bt?'on '+(cls||''):'');cb()};an.appendChild(bt)});w.appendChild(an);return w}
const PATHS=[
 ['Diagonale ↘','tl','br','follow','lin'],['Diagonale dritta ↘','tl','br','none','lin'],['Diagonale ↗','bl','tr','follow','lin'],
 ['Orizzontale →','ml','mr','none','lin'],['Orizzontale ←','mr','ml','none','lin'],['Verticale ↑','bm','tm','v','lin'],['Verticale ↓','tm','bm','v2','lin'],
 ['Sosta al centro','ml','mr','none','hold'],['Rallenta al centro ↘','tl','br','follow','slow'],['Entra e resta','ml','mm','none','ease']];
function applyPath(pr){const b=S.block;Object.assign(b,{mode:'path',from:pr[1],to:pr[2],rotm:pr[3],pace:pr[4],spin:0,arc:0,s0:1,s1:1});
 S.fit=true;S.fitW=Math.max(S.fitW,150);S.outMode='none';S.inS=mkSlot('fade',{split:'all',stagger:0,ease:'linear'});S.delay=0;S.dIn=.12;S.tail=0;S.hold=Math.max(3.5,S.hold);S.loop.fx='none';
 buildInspector();relayout();markTiles();t=0;setPlay(true);toast('Traiettoria: '+pr[0])}
function buildBlock(){const sub=UI.blockSub;if(!sub)return;sub.innerHTML='';const bm=S.block;
 sub.appendChild(segRow('Movimento blocco',[['none','Fermo'],['free','Libero'],['path','Traiettoria'],['keys','Keyframe']],bm,'mode',()=>{if(bm.mode==='keys'&&!(bm.keys&&bm.keys.length))bm.keys=[{t:0,x:-20,y:0,s:1,r:0,op:0,ease:'linear'},{t:Math.min(1.2,clipTotal()),x:0,y:0,s:1,r:0,op:1,ease:'outExpo'}];buildBlock();onR()}));
 if(bm.mode==='keys'){buildKeys(sub,bm);return}
 if(bm.mode==='none'){sub.appendChild(el('div','note','Muove l\'intero testo lungo tutta la clip. Con "Traiettoria" il testo attraversa il fotogramma da un bordo all\'altro, anche inclinato o in verticale.'));return}
 if(bm.mode==='free'){[rng('fx','Da X',-150,150,0,.5,'%'),rng('fy','Da Y',-150,150,0,.5,'%'),rng('tx','A X',-150,150,0,.5,'%'),rng('ty','A Y',-150,150,0,.5,'%'),rng('s0','Scala da',.05,6,1,.01,'×'),rng('s1','Scala a',.05,6,1.06,.01,'×'),rng('r0','Rotaz. da',-360,360,0,.5,'°'),rng('r1','Rotaz. a',-360,360,0,.5,'°'),sel('ease','Curva',EZ_LIST.slice(1),'inOutSine')].forEach(d=>sub.appendChild(field(d,bm,onR)));return}
 const pl=el('div','bline');PATHS.forEach(pr=>{const x=el('button','btn sm',pr[0]);x.type='button';x.onclick=()=>applyPath(pr);pl.appendChild(x)});sub.appendChild(pl);
 sub.appendChild(el('div','note','I preset impostano anche testo gigante e uscita nessuna. Poi regola tutto da qui.'));
 const gr=el('div','grids');gr.appendChild(gridPick('Entra da',bm,'from',onR));gr.appendChild(gridPick('Esce da',bm,'to',onR,'to'));sub.appendChild(gr);
 const ang=field(rng('rang','Angolo',-180,180,0,.5,'°'),bm,onR);
 sub.appendChild(field(sel('rotm','Orientamento',[['none','Dritto'],['follow','Inclinato sul percorso'],['v','Verticale ↑'],['v2','Verticale ↓'],['custom','Angolo libero']],'none'),bm,()=>{ang.style.display=bm.rotm==='custom'?'':'none';onR()}));
 ang.style.display=bm.rotm==='custom'?'':'none';sub.appendChild(ang);
 const pw=field(rng('pow','Rallentamento',1,7,3,.1),bm,onR),hd=field(rng('hold','Durata sosta',0,.9,.35,.01),bm,onR),dr=field(rng('drift','Deriva in sosta',0,30,4,.1,'%'),bm,onR);
 const vis=()=>{pw.style.display=bm.pace==='slow'?'':'none';hd.style.display=dr.style.display=bm.pace==='hold'?'':'none'};
 sub.appendChild(field(sel('pace','Andatura',[['lin','Costante'],['ease','Morbida'],['slow','Rallenta al centro'],['hold','Sosta al centro']],'lin'),bm,()=>{vis();onR()}));
 sub.append(pw,hd,dr);vis();
 [rng('arc','Arco',-60,60,0,.5,'%'),rng('spin','Rotazione extra',-720,720,0,1,'°'),rng('s0','Scala in entrata',.05,6,1,.01,'×'),rng('s1','Scala in uscita',.05,6,1,.01,'×'),rng('m','Margine fuori campo',0,30,2,.5,'%')].forEach(d=>sub.appendChild(field(d,bm,onR)));
 sub.appendChild(el('div','note','Il percorso dura tutta la clip: allunga la Pausa nella sezione Tempo per rallentarlo.'))}

/* ============================================================ blocchi di testo */
function blockName(i){const tx=(i===S.cur?S.text:S.blocks[i]?.text)||'';return tx.split('\n')[0].trim()||'(vuoto)'}
function nBlocks(){return S.blocks&&S.blocks.length>1?S.blocks.length:1}
function ensureBlocks(){if(!S.blocks||S.blocks.length<2){S.blocks=[pickText(S)];S.cur=0}}
function selectBlock(j){if(j===S.cur&&nBlocks()>1)return;ensureBlocks();S.blocks[S.cur]=pickText(S);Object.assign(S,S.blocks[j]);S.cur=j;UI.selKey=null;buildInspector();relayout();markTiles()}
function addBlock(copy){ensureBlocks();S.blocks[S.cur]=pickText(S);const base=copy?JSON.parse(JSON.stringify(pickText(S))):pickText({...defaults(),text:'Nuovo testo',fs:80,fit:false,anchor:'bm',delay:+(S.delay+S.dIn*.6).toFixed(2),inS:mkSlot('blurlift',{stagger:.3,ease:'fx'})});
 if(copy)base.offY=clamp(base.offY+10,-100,100);S.blocks.push(base);selectBlock(S.blocks.length-1);toast(copy?'Blocco duplicato':'Nuovo blocco di testo')}
function delBlock(){if(nBlocks()<2)return;S.blocks.splice(S.cur,1);const j=Math.max(0,S.cur-1);Object.assign(S,S.blocks[j]);S.cur=j;if(S.blocks.length<2){S.blocks=[];S.cur=0}UI.selKey=null;buildInspector();relayout();markTiles();toast('Blocco eliminato. ⌘Z per annullare')}
function moveBlock(d){const j=S.cur+d;if(nBlocks()<2||j<0||j>=S.blocks.length)return;S.blocks[S.cur]=pickText(S);[S.blocks[S.cur],S.blocks[j]]=[S.blocks[j],S.blocks[S.cur]];S.cur=j;buildInspector();relayout()}
function refreshBlocks(){const box=UI.blkList;if(!box)return;box.innerHTML='';const n=nBlocks();
 for(let i=0;i<n;i++){const b=el('button','blk'+(i===S.cur?' on':''));b.type='button';const num=el('span','bn');num.textContent=i+1;const nm=el('span','bt');nm.textContent=blockName(i);b.append(num,nm);b.title=blockName(i);b.onclick=()=>selectBlock(i);box.appendChild(b)}
 UI.blkSec.s.innerHTML='Blocchi di testo <span class="fxn"></span>';UI.blkSec.s.querySelector('.fxn').textContent=n>1?n:'';
 UI.blkDel.disabled=n<2;UI.blkUp.disabled=n<2||S.cur===0;UI.blkDn.disabled=n<2||S.cur===n-1}
function buildBlocksUI(){const sec=section('Blocchi di testo',true);UI.blkSec=sec;const b=sec.b;
 const list=el('div','blks');UI.blkList=list;b.appendChild(list);
 const bl=el('div','bline');const mk=(txt,fn,tip)=>{const x=el('button','btn sm',txt);x.type='button';x.onclick=fn;if(tip)x.title=tip;bl.appendChild(x);return x};
 mk('+ Nuovo',()=>addBlock(false),'Aggiunge un blocco di testo');mk('Duplica',()=>addBlock(true),'Copia il blocco selezionato');
 UI.blkUp=mk('↑',()=>moveBlock(-1),'Porta dietro');UI.blkDn=mk('↓',()=>moveBlock(1),'Porta davanti');UI.blkDel=mk('Elimina',delBlock,'Elimina il blocco selezionato');b.appendChild(bl);
 b.appendChild(el('div','note','Ogni blocco ha testo, stile, posizione, tempi ed effetti propri. Le sezioni sotto e la timeline modificano il blocco selezionato. L\'ultimo della lista sta davanti.'));
 refreshBlocks()}

/* ============================================================ keyframes UI */
function addKey(){const b=S.block;if(b.mode!=='keys'){b.mode='keys';b.keys=b.keys||[]}const ex=b.keys.find(k=>Math.abs(k.t-t)<.5/S.fps);
 if(ex)UI.selKey=ex;else{const c=keyAt(b.keys,t),k={t:+t.toFixed(3),x:c.x,y:c.y,s:c.s,r:c.r,op:c.op,ease:'inOutCubic'};b.keys.push(k);UI.selKey=k}
 const sec=UI.blockSub&&UI.blockSub.closest('details');if(sec)sec.open=true;buildBlock();onR();toast('Keyframe a '+t.toFixed(2)+' s')}
function buildKeys(sub,bm){
 const bl=el('div','bline'),add=el('button','btn sm','+ Keyframe alla testina'),clr=el('button','btn sm','Elimina tutti');add.type=clr.type='button';add.onclick=addKey;clr.onclick=()=>{bm.keys=[];buildBlock();onR()};bl.append(add,clr);sub.appendChild(bl);
 sub.appendChild(el('div','note','Ogni keyframe fissa posizione, scala, rotazione e opacità del blocco in un istante. Tra due keyframe il testo si muove con la curva del keyframe di arrivo. Tasto K: aggiungi alla testina. I rombi sulla timeline sono i keyframe.'));
 [...bm.keys].sort((a,b)=>a.t-b.t).forEach((k,i)=>{const d=el('details','lyr');d.open=k===UI.selKey;const sm=el('summary',null,`Keyframe ${i+1} `),sn=el('span','fxn');const lbl=()=>sn.textContent=(+k.t).toFixed(2)+' s';lbl();sm.appendChild(sn);d.appendChild(sm);const lb=el('div','body');d.appendChild(lb);
  const cb=kk=>{if(kk==='t')lbl();onR()};
  [rng('t','Tempo',0,30,0,.01,'s'),rng('x','Spost. X',-150,150,0,.5,'%'),rng('y','Spost. Y',-150,150,0,.5,'%'),rng('s','Scala',0,6,1,.01,'×'),rng('r','Rotazione',-720,720,0,.5,'°'),rng('op','Opacità',0,1,1,.01),sel('ease','Curva in arrivo',EZ_LIST.slice(1),'inOutCubic')].forEach(x=>lb.appendChild(field(x,k,cb)));
  const bb=el('div','bline'),go=el('button','btn sm','Vai qui'),dup=el('button','btn sm','Duplica alla testina'),del=el('button','btn sm','Elimina');go.type=dup.type=del.type='button';
  go.onclick=()=>{setPlay(false);t=clamp(k.t,0,clipTotal());dirty=true;UI.selKey=k};
  dup.onclick=()=>{const n={...k,t:+t.toFixed(3)};bm.keys.push(n);UI.selKey=n;buildBlock();onR()};
  del.onclick=()=>{bm.keys.splice(bm.keys.indexOf(k),1);buildBlock();onR()};
  bb.append(go,dup,del);lb.appendChild(bb);sub.appendChild(d)})}

/* ============================================================ images UI */
async function fileToSrc(f){const url=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)});if(/svg/.test(f.type))return url;
 const im=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=url});if(!im)return url;const k=Math.min(1,2400/Math.max(im.naturalWidth,im.naturalHeight));if(k===1)return url;
 const c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);return c.toDataURL(/jpe?g/.test(f.type)?'image/jpeg':'image/png',.92)}
async function addImages(files){let n=0;for(const f of files){if(!/^image\//.test(f.type))continue;const rec={id:'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:f.name,src:await fileToSrc(f)};if(await loadImg(rec)){S.images.push(rec);n++}}
 if(n){buildImages();relayout();histMark();toast(n===1?'Immagine aggiunta':n+' immagini aggiunte')}else toast('Nessuna immagine leggibile')}
function mkLayer(img){return{id:'l'+Math.random().toString(36).slice(2,8),img,mode:'free',x:50,y:50,size:30,rot:0,op:1,z:'above',tint:'none',start:0,end:0,fx:'pop',dIn:.7,dOut:.5,outMode:'mirror',ease:'fx',prms:{},lp:{fx:'none',prms:{}}}}
function insertToken(n){const ta=UI.text,tok=`{${n}}`,a=ta.selectionStart??ta.value.length,b=ta.selectionEnd??a;ta.value=ta.value.slice(0,a)+tok+ta.value.slice(b);S.text=ta.value;ta.focus();ta.selectionStart=ta.selectionEnd=a+tok.length;relayout()}
function buildImages(){const sec=UI.imgSec;if(!sec)return;const b=sec.b;b.innerHTML='';sec.s.innerHTML=`Immagini <span class="fxn">${S.images.length?S.images.length:''}</span>`;
 const bl=el('div','bline');const ub=el('button','btn sm','Carica immagini');ub.type='button';const fi=el('input');fi.type='file';fi.accept='image/*';fi.multiple=true;fi.hidden=true;ub.onclick=()=>fi.click();fi.onchange=()=>{addImages([...fi.files]);fi.value=''};bl.append(ub,fi);b.appendChild(bl);
 if(!S.images.length){b.appendChild(el('div','note','Loghi, icone, foto. Puoi metterle dentro il testo, dove si animano come una lettera, oppure come livelli liberi con la loro animazione.'));return}
 const list=el('div','imgs');S.images.forEach((rec,i)=>{const r=el('div','imgrow');const th=el('div','th');th.style.backgroundImage=`url("${rec.src}")`;const nm=el('div','nm');nm.innerHTML=`<b>{${i+1}}</b>`;nm.appendChild(document.createTextNode(rec.name));nm.title=rec.name;
  const ac=el('div','acts');const t1=el('button','btn sm','Nel testo');t1.type='button';t1.title=`Inserisce {${i+1}} nel testo`;t1.onclick=()=>insertToken(i+1);const t2=el('button','btn sm','Livello');t2.type='button';t2.onclick=()=>{S.layers.push(mkLayer(rec.id));buildImages();onR()};const t3=el('button','btn sm','×');t3.type='button';t3.title='Elimina immagine';t3.onclick=()=>{S.images.splice(i,1);S.layers=S.layers.filter(l=>l.img!==rec.id);delete IMGS[rec.id];TINT.clear();const rn=tx=>tx.replace(/\{(\d+)\}/g,(m,k)=>+k===i+1?'':+k>i+1?`{${k-1}}`:m);S.text=rn(S.text);(S.blocks||[]).forEach((b,bi)=>{if(bi!==S.cur&&typeof b.text==='string')b.text=rn(b.text)});UI.text.value=S.text;buildImages();relayout()};
  ac.append(t1,t2,t3);r.append(th,nm,ac);list.appendChild(r)});b.appendChild(list);
 b.appendChild(el('div','note','Nel testo scrivi {1}, {2}… dove vuoi l\'immagine: segue lettere, parole ed effetti come un carattere.'));
 b.appendChild(field(rng('imgH','Altezza nel testo',.2,5,1.25,.01,'× maiuscola'),S,onL));
 b.appendChild(field(bool('imgTint','Colora come il testo',false),S,onR));
 S.layers.forEach((L,li)=>{const d=el('details','lyr');d.open=li===S.layers.length-1;const rec=S.images.find(x=>x.id===L.img);const sm=el('summary',null,`Livello ${li+1} `),sn=el('span','fxn');sn.textContent=rec?rec.name:'';sm.appendChild(sn);d.appendChild(sm);const lb=el('div','body');d.appendChild(lb);
  lb.appendChild(segRow('Modo',[['free','Libero'],['cover','Sfondo pieno']],L,'mode',()=>{if(L.mode==='cover'){L.size=Math.max(L.size,100);L.x=50;L.y=50;L.z='below'}buildImages();onR()}));
  [rng('x','Posizione X',-50,150,50,.1,'%'),rng('y','Posizione Y',-50,150,50,.1,'%'),rng('size',L.mode==='cover'?'Zoom':'Larghezza',1,400,30,.5,'%'),rng('rot','Rotazione',-180,180,0,.5,'°'),rng('op','Opacità',0,1,1,.01)].forEach(x=>lb.appendChild(field(x,L,onR)));
  lb.appendChild(segRow('Livello',[['below','Sotto il testo'],['above','Sopra']],L,'z',onR));
  lb.appendChild(field(sel('tint','Colore',[['none','Originale'],['A','Colore testo'],['B','Colore B']],'none'),L,onR));
  const sub=el('div','sub');
  [rng('start','Appare a',0,30,0,.01,'s'),rng('end','Sparisce a',0,30,0,.01,'s (0 = fine)')].forEach(x=>sub.appendChild(field(x,L,onR)));
  const fr=el('div','row w2');fr.appendChild(el('label',null,'Animazione'));const se=el('select');CATS.forEach(c=>{const g=el('optgroup');g.label=c;FX.filter(f=>f.c===c).forEach(f=>{const o=el('option',null,f.n);o.value=f.id;g.appendChild(o)});se.appendChild(g)});se.value=L.fx;se.onchange=()=>{L.fx=se.value;L.ease='fx';buildImages();onR()};fr.appendChild(se);sub.appendChild(fr);
  [rng('dIn','Durata entrata',.01,10,.7,.01,'s'),rng('dOut','Durata uscita',.01,10,.5,.01,'s')].forEach(x=>sub.appendChild(field(x,L,onR)));
  sub.appendChild(segRow('Uscita',[['mirror','Con animazione'],['none','Resta']],L,'outMode',onR));
  sub.appendChild(field(sel('ease','Curva',EZ_LIST,'fx'),L,onR));
  const o=prmOf(L,FXMAP);FXMAP[L.fx].p.forEach(x=>sub.appendChild(field(x,o,onR)));lb.appendChild(sub);
  const s2=el('div','sub');const lr=el('div','row w2');lr.appendChild(el('label',null,'Continuo'));const ls=el('select');ls.innerHTML=LOOPS.map(l=>`<option value="${l.id}">${l.n}</option>`).join('');ls.value=L.lp.fx;ls.onchange=()=>{L.lp.fx=ls.value;buildImages();onR()};lr.appendChild(ls);s2.appendChild(lr);
  if(L.lp.fx!=='none'){const lo=prmOf(L.lp,LMAP);LMAP[L.lp.fx].p.forEach(x=>s2.appendChild(field(x,lo,onR)))}lb.appendChild(s2);
  const bb=el('div','bline');const del=el('button','btn sm','Rimuovi livello');del.type='button';del.onclick=()=>{S.layers.splice(li,1);buildImages();onR()};const dup=el('button','btn sm','Duplica');dup.type='button';dup.onclick=()=>{S.layers.push(JSON.parse(JSON.stringify({...L,id:'l'+Math.random().toString(36).slice(2,8)})));buildImages();onR()};bb.append(dup,del);lb.appendChild(bb);
  b.appendChild(d)})}

/* ============================================================ library + thumbnails */
let TGT='in';
$('#tgtSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;TGT=b.dataset.t;[...$('#tgtSeg').children].forEach(x=>x.classList.toggle('on',x===b))};
function buildLib(){const lib=$('#lib');lib.innerHTML='';
 CATS.forEach(c=>{const list=FX.filter(f=>f.c===c);lib.appendChild(el('div','cat',`${c}<em>${list.length}</em>`));const g=el('div','tiles');list.forEach(f=>g.appendChild(tile(f,false)));lib.appendChild(g)});
 lib.appendChild(el('div','cat',`Movimento continuo<em>${LOOPS.length-1}</em>`));const g=el('div','tiles');LOOPS.slice(1).forEach(f=>g.appendChild(tile(f,true)));lib.appendChild(g);
 buildThumbs();markTiles()}
function tile(f,isLoop){const b=el('button','tile');b.type='button';b.dataset.id=f.id;b.dataset.loop=isLoop?1:'';b.title=f.d||'';b.dataset.q=(f.n+' '+(f.d||'')).toLowerCase();
 const c=el('canvas');c.width=252;c.height=104;b.append(c,el('span','nm',f.n),el('span','bd'));
 b.onclick=()=>{if(isLoop){S.loop.fx=S.loop.fx===f.id?'none':f.id;UI.loopSec.d.open=true;buildLoop();markTiles();onR()}else if(TGT==='in'&&!f.exit)setFx(S.inS,f.id);else{S.outMode='custom';setFx(S.outS,f.id);UI.outSec.d.open=true;if(TGT==='in')toast('Effetto di uscita: assegnato all\'uscita. Dal menu Entrata puoi usarlo al contrario')}};
 b.onpointerenter=()=>startHover(b,f,isLoop);b.onpointerleave=()=>stopHover(b);b.onfocus=()=>startHover(b,f,isLoop);b.onblur=()=>stopHover(b);return b}
function markTiles(){document.querySelectorAll('.tile').forEach(b=>{const id=b.dataset.id,isL=!!b.dataset.loop;const iin=!isL&&S.inS.fx===id,iout=!isL&&S.outMode==='custom'&&S.outS.fx===id,il=isL&&S.loop.fx===id;b.classList.toggle('in',iin||il);b.classList.toggle('out',iout&&!iin);b.querySelector('.bd').innerHTML=(iin?'<i class="i">IN</i>':'')+(iout?'<i class="o">OUT</i>':'')+(il?'<i class="l">LOOP</i>':'')})}
$('#q').oninput=()=>{const q=$('#q').value.trim().toLowerCase();document.querySelectorAll('.tile').forEach(b=>b.style.display=!q||b.dataset.q.includes(q)?'':'none');document.querySelectorAll('#lib .tiles').forEach(g=>{const v=[...g.children].some(x=>x.style.display!=='none');g.style.display=v?'':'none';g.previousElementSibling.style.display=v?'':'none'})};
function thumbState(f,isLoop){const r=f.rec||{};const T={...defaults(),text:'Aa',font:0,wght:700,fs:40,fit:false,track:-10,lh:1,color:'#ebe8e3',colorB:'#ff4d00',bg:'#0d0d0d',margin:0,seed:S.seed,fps:30,delay:0,dIn:1,hold:.7,dOut:.8,tail:.3,outMode:'mirror'};
 if(isLoop){T.inS=mkSlot('fade',{split:'char',stagger:0});T.dIn=.01;T.delay=0;T.hold=3;T.outMode='none';T.tail=0;T.loop={fx:f.id,when:'always',prms:{}};const o=prmOf(T.loop,LMAP);if(o.amp!=null&&f.id==='wave')o.amp=.18;if(f.id==='jitter')o.amp=4;if(f.id==='neon')o.prob=.25;if(f.id==='tglitch')o.prob=.2;if(f.id==='breathe')o.amp=.12;if(f.id==='float')o.amp=.12}
 else if(f.exit){T.inS=mkSlot('fade',{split:'all',stagger:0});T.dIn=.15;T.hold=.35;T.outMode='custom';T.outS=mkSlot(f.id,{split:'char',stagger:Math.min(.5,r.stagger??.3),order:'start'});T.dOut=1.8;T.tail=.4}
 else{T.inS=mkSlot(f.id,{split:r.split==='word'||r.split==='line'?'char':(r.split||'char'),stagger:r.stagger??.4,order:r.order||'start'});if(f.id==='type'||f.id==='scramble'){T.inS.stagger=.9}}
 return T}
const tctxCache=new WeakMap();
function drawThumb(c,f,isLoop,tt){let ctx2=tctxCache.get(c);if(!ctx2){ctx2=c.getContext('2d');tctxCache.set(c,ctx2)}const T=c._T||(c._T=thumbState(f,isLoop));T.seed=S.seed;const W=126,H=52;if(!c._L)c._L=layout(T,ctx2,W,H);renderFrame(ctx2,T,c._L,tt,W,H,2)}
function buildThumbs(){document.querySelectorAll('.tile').forEach(b=>{const c=b.querySelector('canvas');c._L=null;const isL=!!b.dataset.loop,f=isL?LMAP[b.dataset.id]:FXMAP[b.dataset.id];drawThumb(c,f,isL,thumbT(f,isL))})}
let hov=null;
function startHover(b,f,isLoop){hov={b,f,isLoop,t0:performance.now()};const loop=()=>{if(!hov||hov.b!==b)return;const c=b.querySelector('canvas'),T=c._T,tot=timing(T).total;drawThumb(c,f,isLoop,((performance.now()-hov.t0)/1000)%(isLoop?3:tot));requestAnimationFrame(loop)};requestAnimationFrame(loop)}
function stopHover(b){if(hov&&hov.b===b){hov=null;const c=b.querySelector('canvas'),isL=!!b.dataset.loop;const f=isL?LMAP[b.dataset.id]:FXMAP[b.dataset.id];drawThumb(c,f,isL,thumbT(f,isL))}}
function thumbT(f,isL){return isL?.45:f.exit?1.25:f.id==='land'?.62:.5}

/* ============================================================ top bar */
function buildTop(){const fs=$('#fmtSeg');fs.innerHTML='';Object.keys(FMT).forEach(k=>{const b=el('button',S.fmt===k?'on':'',k);b.type='button';b.title=FMT[k].join('×');b.onclick=()=>{S.fmt=k;[...fs.children].forEach(x=>x.classList.toggle('on',x===b));relayout();fitStage()};fs.appendChild(b)});
 const rs=$('#resSeg');rs.innerHTML='';[[1,'HD'],[2,'4K']].forEach(([v,l])=>{const b=el('button',S.res===v?'on':'',l);b.type='button';b.title=v===1?'1920 px sul lato lungo':'3840 px sul lato lungo';b.onclick=()=>{S.res=v;[...rs.children].forEach(x=>x.classList.toggle('on',x===b));relayout();fitStage()};rs.appendChild(b)});
 const fp=$('#fpsSel');fp.innerHTML=[24,25,30,50,60].map(v=>`<option ${v===S.fps?'selected':''}>${v}</option>`).join('');fp.onchange=()=>{S.fps=+fp.value;drawTimeline();dirty=true}}

/* ============================================================ save / export */
let DLNS=null,dlP=null;
function dlReady(){if(!dlP)dlP=(async()=>{try{if(window.claude&&typeof claude.use==='function')DLNS=await claude.use('downloads')}catch(e){DLNS=null}return DLNS})();return dlP}
async function saveBlob(name,blob){
 if(window.claude&&typeof claude.use==='function'){await dlReady();if(DLNS){try{await DLNS.save({filename:name,data:blob});toast('Salvato: '+name)}catch(e){const c=e&&e.code;toast(c==='declined'?'Salvataggio annullato':c==='rate_limited'?'C\'è già un salvataggio in attesa':c==='too_large'?'File troppo grande: prova HD o meno frame':'Salvataggio non disponibile in questa vista')}return}}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);toast('Scaricato: '+name)}
const fname=ext=>`moto_${(S.text||'testo').split('\n')[0].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,24)||'clip'}_${S.fmt.replace(':','x')}.${ext}`;
$('#bSave').onclick=()=>{const data={...S};data.fontName=FONTS[S.font]?.n;saveBlob(fname('json'),new Blob([JSON.stringify(data,null,2)],{type:'application/json'}))};
$('#bLoad').onclick=()=>$('#fLoad').click();
$('#fLoad').onchange=()=>{const f=$('#fLoad').files[0];$('#fLoad').value='';if(f)loadPreset(f)};
async function loadPreset(f){try{await applyPreset(JSON.parse(await f.text()))}catch(e){toast('File preset non valido')}}
async function applyPreset(d,quiet){{const base=defaults();if(d.block&&d.block.on&&!d.block.mode)d.block.mode='free';const N=Object.assign(base,d,{block:{...base.block,...(d.block||{})},loop:{...base.loop,...(d.loop||{})},inS:{...base.inS,...(d.inS||{})},outS:{...base.outS,...(d.outS||{})}});const fi=FONTS.findIndex(x=>x.n===d.fontName);N.font=fi>=0?fi:0;if(!FXMAP[N.inS.fx])N.inS.fx='mask';if(!FXMAP[N.outS.fx])N.outS.fx='fade';if(!LMAP[N.loop.fx])N.loop.fx='none';delete N.fontName;
  if(!FMT[N.fmt])N.fmt=base.fmt;if(N.res!==1&&N.res!==2)N.res=1;if(![24,25,30,50,60].includes(+N.fps))N.fps=30;N.fps=+N.fps;
  N.images=Array.isArray(N.images)?N.images.filter(x=>x&&typeof x.id==='string'&&typeof x.src==='string'&&x.src.startsWith('data:image/')):[];N.layers=Array.isArray(N.layers)?N.layers:[];N.block.keys=Array.isArray(N.block.keys)?N.block.keys.filter(k=>k&&['t','x','y','s','r','op'].every(f=>typeof k[f]==='number')):[];
  if(Array.isArray(d.blocks)&&d.blocks.length>1){N.blocks=d.blocks.filter(b=>b&&typeof b==='object').map(b=>{const o=Object.assign(pickText(base),b,{block:{...base.block,...(b.block||{})},loop:{...base.loop,...(b.loop||{})},inS:{...base.inS,...(b.inS||{})},outS:{...base.outS,...(b.outS||{})}});
   if(typeof o.text!=='string')o.text='';if(!FXMAP[o.inS.fx])o.inS.fx='mask';if(!FXMAP[o.outS.fx])o.outS.fx='fade';if(!LMAP[o.loop.fx])o.loop.fx='none';o.block.keys=Array.isArray(o.block.keys)?o.block.keys.filter(k=>k&&['t','x','y','s','r','op'].every(f=>typeof k[f]==='number')):[];if(typeof o.font!=='number'||!FONTS[o.font])o.font=0;return o});
   N.cur=clamp(Math.round(+N.cur||0),0,N.blocks.length-1);if(N.blocks.length<2){N.blocks=[];N.cur=0}}else{N.blocks=[];N.cur=0}
  await Promise.all(N.images.map(loadImg));S=N;buildTop();buildInspector();loadFonts().then(relayout);relayout();markTiles();buildThumbs();t=0;histMark();if(!quiet)toast(d.fontName&&fi<0?'Preset caricato. Font "'+d.fontName+'" non trovato, sostituito':'Preset caricato')}}

/* ============================================================ history + autosave */
// ponytail: snapshot JSON dell'intero stato, immagini escluse (restano in IMGS). Tetto 80 passi.
const HIST={u:[],r:[],last:null,busy:false,tm:0},AUTOSAVE='moto:autosave';
// il render riempie i parametri di default (prmOf) e ricalcola fs con "Adatta": normalizzo prima del confronto
function snapNorm(){prmOf(S.inS,FXMAP);prmOf(S.outS,FXMAP);prmOf(S.loop,LMAP);(S.blocks||[]).forEach(b=>{if(b.inS)prmOf(b.inS,FXMAP);if(b.outS)prmOf(b.outS,FXMAP);if(b.loop)prmOf(b.loop,LMAP)});S.layers.forEach(L=>{prmOf(L,FXMAP);if(L.lp)prmOf(L.lp,LMAP)})}
const snap=()=>{snapNorm();return JSON.stringify({...S,images:S.images.map(x=>({id:x.id,name:x.name})),fontName:FONTS[S.font]?.n})};
const snapKey=j=>{const o=JSON.parse(j);if(o.fit)delete o.fs;return JSON.stringify(o)};
function histMark(){clearTimeout(HIST.tm);HIST.tm=setTimeout(histCommit,350)}
function histCommit(){if(HIST.busy||exporting)return;const cur=snap();if(HIST.last!==null&&snapKey(cur)===snapKey(HIST.last)){HIST.last=cur;return}if(HIST.last!==null){HIST.u.push(HIST.last);if(HIST.u.length>80)HIST.u.shift();HIST.r.length=0}HIST.last=cur;histUI();autosave()}
function histUI(){$('#bUndo').disabled=!HIST.u.length;$('#bRedo').disabled=!HIST.r.length}
async function histGo(from,to,msg){clearTimeout(HIST.tm);histCommit();if(!from.length)return;to.push(HIST.last);const st=from.pop();HIST.busy=true;
 try{const d=JSON.parse(st);d.images=d.images.filter(x=>IMGS[x.id]).map(x=>({...x,src:IMGS[x.id].src}));await applyPreset(d,true)}finally{HIST.busy=false}
 HIST.last=snap();histUI();autosave();toast(msg)}
const undo=()=>histGo(HIST.u,HIST.r,'Annullato'),redo=()=>histGo(HIST.r,HIST.u,'Ripristinato');
function autosave(){const full=JSON.stringify({...S,fontName:FONTS[S.font]?.n});try{localStorage.setItem(AUTOSAVE,full)}catch(e){try{localStorage.setItem(AUTOSAVE,snap());if(!autosave.warned){autosave.warned=1;toast('Salvataggio automatico senza immagini: troppo pesanti per il browser')}}catch(e2){}}}
['input','change','click','dblclick','drop','paste','keyup','pointerup'].forEach(ev=>document.addEventListener(ev,histMark,true));
$('#bUndo').onclick=undo;$('#bRedo').onclick=redo;
$('#bNew').onclick=async()=>{clearTimeout(HIST.tm);histCommit();await applyPreset(defaults(),true);toast('Nuovo progetto. ⌘Z per tornare indietro')};
$('#bKey').onclick=()=>addKey();
$('#bHelp').onclick=()=>$('#help').classList.add('on');$('#helpClose').onclick=()=>$('#help').classList.remove('on');
$('#help').onclick=e=>{if(e.target.id==='help')$('#help').classList.remove('on')};

/* ============================================================ export estimates */
const EST_LIMIT=1.5e9;
const mb=b=>b>=1e9?(b/1e9).toFixed(1)+' GB':Math.max(1,Math.round(b/1e6))+' MB';
async function estimate(){const T={total:clipTotal()},n=Math.max(1,Math.round(T.total*S.fps));renderExport(t);const b=await new Promise(r=>cv.toBlob(r,'image/png'));dirty=true;
 const png=(b?b.size:cv.width*cv.height*.5)*1.15*n,vid=(S.res===2?60e6:24e6)/8*T.total;return{n,png,vid,total:T.total}}

const menu=$('#expMenu');$('#bExport').onclick=async e=>{e.stopPropagation();menu.classList.toggle('on');if(!menu.classList.contains('on'))return;const m=pickMime();loadMuxer().catch(()=>{});const fc=await fastCfg().catch(()=>null);
 $('#vidHint').textContent=fc?'MP4 H.264 · codifica veloce':(m?.ext.toUpperCase()||'Video')+' in tempo reale'+(S.transparent?'. La trasparenza può non essere mantenuta: usa la sequenza PNG':'');$('#seqHint').textContent='Calcolo peso…';$('#seqHint').classList.remove('warn');
 const E=await estimate();$('#vidHint').textContent+=` · ${E.total.toFixed(1)} s · circa ${mb(fc?fastRate()/8*E.total:E.vid)}`;
 const sh=$('#seqHint');sh.textContent=`${E.n} frame ${cv.width}×${cv.height} · circa ${mb(E.png)}`+(E.png>EST_LIMIT?' · troppo pesante: riduci durata, FPS o usa HD':'. Ideale per After Effects');sh.classList.toggle('warn',E.png>EST_LIMIT)};
addEventListener('click',e=>{if(!e.target.closest('#expMenu'))menu.classList.remove('on')});
menu.onclick=e=>{const b=e.target.closest('button');if(!b)return;menu.classList.remove('on');({video:exportVideo,seq:exportSeq,frame:exportFrame})[b.dataset.x]()};
function pickMime(){if(typeof MediaRecorder==='undefined')return null;const c=[['video/mp4;codecs=avc1.640033','mp4'],['video/mp4;codecs=avc1','mp4'],['video/mp4','mp4'],['video/webm;codecs=vp9','webm'],['video/webm;codecs=vp8','webm'],['video/webm','webm']];if(S.transparent)c.unshift(['video/webm;codecs=vp9','webm']);for(const[m,ext]of c)if(MediaRecorder.isTypeSupported(m))return{m,ext};return null}
let cancel=false;
function modal(on,title,note){$('#modal').classList.toggle('on',on);if(title)$('#mTitle').textContent=title;if(note!=null)$('#mNote').textContent=note;$('#mBar').style.width='0%'}
$('#mCancel').onclick=()=>{cancel=true};
const frameAt=f=>f/S.fps;
function renderExport(tt){const[W,H]=dims();renderFrame(ctx,S,Lay,tt,W,H,S.res,{})}
async function exportFrame(){exporting=true;let b=null;try{renderExport(t);b=await new Promise(r=>cv.toBlob(r,'image/png'))}catch(e){}finally{exporting=false;dirty=true}if(!b)return toast('Frame non esportato: canvas troppo grande o non leggibile');await saveBlob(fname('png').replace('.png',`_f${Math.round(t*S.fps)}.png`),b)}
async function exportSeq(){const E=await estimate();if(E.n>65535)return toast('Troppi frame per uno ZIP: accorcia la clip o abbassa gli FPS');if(E.png>EST_LIMIT&&!confirm(`L'archivio peserà circa ${mb(E.png)} e potrebbe bloccare il browser. Continuare?`))return;const n=E.n;cancel=false;exporting=true;setPlay(false);modal(true,'Sequenza PNG',`${n} frame a ${cv.width}×${cv.height}`);const files=[];
 try{for(let f=0;f<n;f++){if(cancel)break;renderExport(frameAt(f));const b=await new Promise(r=>cv.toBlob(r,'image/png'));files.push({name:`moto_${String(f).padStart(5,'0')}.png`,data:new Uint8Array(await b.arrayBuffer())});$('#mBar').style.width=((f+1)/n*100)+'%';if(f%4===0)await new Promise(r=>setTimeout(r))}
  if(!cancel){$('#mNote').textContent='Compressione archivio…';await new Promise(r=>setTimeout(r,30));const z=zip(files);modal(false);exporting=false;dirty=true;await saveBlob(fname('zip'),z);return}}
 catch(e){toast('Esportazione interrotta: '+e.message)}
 modal(false);exporting=false;dirty=true}
async function exportRealtime(){const mm=pickMime();if(!mm||!cv.captureStream){toast('Questo browser non registra video: usa la sequenza PNG');return}
 const n=Math.max(1,Math.round(clipTotal()*S.fps));cancel=false;exporting=true;setPlay(false);modal(true,'Video '+mm.ext.toUpperCase(),`${n} frame, ${clipTotal().toFixed(2)} s in tempo reale. Lascia la scheda in primo piano.`);
 let stream,track,manual=true,chunks=[];try{try{stream=cv.captureStream(0);track=stream.getVideoTracks()[0];if(!track.requestFrame){stream=cv.captureStream(S.fps);track=stream.getVideoTracks()[0];manual=false}}catch(e){stream=cv.captureStream(S.fps);track=stream.getVideoTracks()[0];manual=false}
 const rec=new MediaRecorder(stream,{mimeType:mm.m,videoBitsPerSecond:S.res===2?60e6:24e6});rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};const done=new Promise(r=>rec.onstop=r);
 renderExport(0);rec.start(250);const t0=performance.now(),fd=1000/S.fps;
 for(let f=0;f<n;f++){if(cancel)break;renderExport(frameAt(f));if(manual)track.requestFrame();$('#mBar').style.width=((f+1)/n*100)+'%';const wait=t0+(f+1)*fd-performance.now();await new Promise(r=>setTimeout(r,Math.max(0,wait)))}
 rec.stop();await done}catch(e){toast('Registrazione non riuscita: '+e.message);cancel=true}finally{track?.stop();modal(false);exporting=false;dirty=true}
 if(cancel)return;if(!chunks.length)return toast('Il video è vuoto: prova la sequenza PNG');await saveBlob(fname(mm.ext),new Blob(chunks,{type:mm.m.split(';')[0]}))}
/* ============================================================ export video veloce (WebCodecs + mp4-muxer) */
const MUX_URL='https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.2/build/mp4-muxer.min.js';let MUX=null;
function loadMuxer(){return MUX||(MUX=new Promise((ok,ko)=>{if(window.Mp4Muxer)return ok(window.Mp4Muxer);const sc=document.createElement('script');sc.src=MUX_URL;sc.onload=()=>window.Mp4Muxer?ok(window.Mp4Muxer):ko(new Error('libreria MP4 non valida'));sc.onerror=()=>{MUX=null;ko(new Error('libreria MP4 non raggiungibile'))};document.head.appendChild(sc)}))}
const fastRate=()=>S.res===2?40e6:16e6;
async function fastCfg(){if(S.transparent||typeof VideoEncoder==='undefined'||typeof VideoFrame==='undefined')return null;
 for(const codec of['avc1.640033','avc1.4d0033','avc1.42003e']){const c={codec,width:cv.width,height:cv.height,bitrate:fastRate(),framerate:S.fps,avc:{format:'avc'}};try{if((await VideoEncoder.isConfigSupported(c)).supported)return c}catch(e){}}return null}
async function exportFast(cfg){const M=await loadMuxer(),n=Math.max(1,Math.round(clipTotal()*S.fps)),us=1e6/S.fps;
 cancel=false;exporting=true;setPlay(false);modal(true,'Video MP4',`${n} frame ${cv.width}×${cv.height} · codifica veloce, puoi cambiare scheda`);
 const muxer=new M.Muxer({target:new M.ArrayBufferTarget(),video:{codec:'avc',width:cv.width,height:cv.height,frameRate:S.fps},fastStart:'in-memory'});
 let err=null,enc=null;
 try{enc=new VideoEncoder({output:(c,m)=>muxer.addVideoChunk(c,m),error:e=>{err=e}});enc.configure(cfg);
  for(let f=0;f<n;f++){if(cancel||err)break;renderExport(frameAt(f));const vf=new VideoFrame(cv,{timestamp:Math.round(f*us),duration:Math.round(us)});enc.encode(vf,{keyFrame:f%(S.fps*2)===0});vf.close();
   $('#mBar').style.width=((f+1)/n*100)+'%';while(enc.encodeQueueSize>6&&!err)await new Promise(r=>setTimeout(r,2));if(f%8===0)await new Promise(r=>setTimeout(r))}
  if(!cancel&&!err){$('#mNote').textContent='Finalizzazione…';await enc.flush();if(err)throw err;muxer.finalize()}}
 catch(e){err=err||e}finally{try{if(enc&&enc.state!=='closed')enc.close()}catch(e){}modal(false);exporting=false;dirty=true}
 if(err)throw err;if(cancel)return;
 const buf=muxer.target.buffer;if(!buf||!buf.byteLength)throw new Error('file vuoto');await saveBlob(fname('mp4'),new Blob([buf],{type:'video/mp4'}))}
async function exportVideo(){const cfg=await fastCfg().catch(()=>null);if(cfg){try{return await exportFast(cfg)}catch(e){toast('Codifica veloce non riuscita ('+(e.message||e)+'): registro in tempo reale');await new Promise(r=>setTimeout(r,900))}}return exportRealtime()}

/* minimal ZIP (store) */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=0xffffffff;for(let i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return(c^0xffffffff)>>>0}
function zip(files){const enc=new TextEncoder(),parts=[],cen=[];let off=0;
 for(const f of files){const nm=enc.encode(f.name),crc=crc32(f.data),sz=f.data.length;
  const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(8,0,true);h.setUint16(10,0,true);h.setUint16(12,33,true);h.setUint32(14,crc,true);h.setUint32(18,sz,true);h.setUint32(22,sz,true);h.setUint16(26,nm.length,true);
  parts.push(h.buffer,nm,f.data);
  const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(12,0,true);c.setUint16(14,33,true);c.setUint32(16,crc,true);c.setUint32(20,sz,true);c.setUint32(24,sz,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
  cen.push(c.buffer,nm);off+=30+nm.length+sz}
 const cs=cen.reduce((a,b)=>a+b.byteLength,0);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
 return new Blob([...parts,...cen,e.buffer],{type:'application/zip'})}

/* ============================================================ boot */
addEventListener('dragover',e=>{if([...e.dataTransfer.items].some(i=>i.kind==='file'))e.preventDefault()});
addEventListener('drop',e=>{const all=[...e.dataTransfer.files];if(!all.length)return;e.preventDefault();const fs=all.filter(f=>/^image\//.test(f.type)),js=all.find(f=>/\.json$/i.test(f.name)||f.type==='application/json');if(fs.length){UI.imgSec.d.open=true;addImages(fs)}else if(js)loadPreset(js);else toast('Formato non supportato: trascina immagini o un preset .json')});
addEventListener('paste',e=>{if(e.target.closest('input,textarea'))return;const fs=[...(e.clipboardData?.files||[])].filter(f=>/^image\//.test(f.type));if(fs.length){UI.imgSec.d.open=true;addImages(fs)}});
buildTop();buildInspector();buildLib();relayout();fitStage();setPlay(true);requestAnimationFrame(tick);
if(window.lucide)lucide.createIcons();
(async()=>{let d=null;try{d=JSON.parse(localStorage.getItem(AUTOSAVE)||'null')}catch(e){}
 if(d){try{await applyPreset(d,true);toast('Progetto ripristinato dall\'ultima sessione')}catch(e){S=defaults();buildInspector();relayout()}}
 HIST.last=snap();histUI()})();
loadFonts().then(()=>{relayout();buildThumbs()});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{relayout();buildThumbs()});
