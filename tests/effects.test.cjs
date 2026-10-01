// node tests/effects.test.cjs [path-to-playwright]
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(root,'script.js'),'utf8');
const extra=fs.readFileSync(path.join(root,'effects-extra.js'),'utf8');
const context=vm.createContext({console});
vm.runInContext(extra+'\n'+script.slice(0,script.indexOf('/* ============================================================ state */'))+'\n'+script.match(/function newState\(\)\{return\{[^\n]+/)[0],context);
const results=vm.runInContext(`(()=>{
 const transitions=extraTransitions(),loops=extraLoops(),failures=[];
 const check=(condition,message)=>{if(!condition)failures.push(message)};
 check(transitions.length+loops.length===20,'Exactly 20 new effects');
 check(new Set(FX.map(f=>f.id)).size===FX.length,'Unique transition ids');
 check(new Set(LOOPS.map(f=>f.id)).size===LOOPS.length,'Unique loop ids');
 const units=[{i:0,n:1,cx:0,cy:0,w:250,by0:-70,by1:10},{i:2,n:7,cx:-120,cy:30,w:65,by0:-70,by1:10}];
 const numbers=(value,label)=>{if(typeof value==='number')check(Number.isFinite(value),label);else if(value&&typeof value==='object')Object.values(value).forEach(v=>numbers(v,label))};
 for(const f of [...transitions,...loops]) {
  const defaults=Object.fromEntries(f.p.map(d=>[d.k,d.v]));
  const variants=[defaults];
  for(const d of f.p)for(const v of d.t==='r'?[d.min,d.max]:d.t==='s'?d.o.map(x=>x[0]):d.t==='b'?[true,false]:[])variants.push({...defaults,[d.k]:v});
  for(const o of variants)for(const u of units)for(const p of [-.2,0,.1,.5,.9,1,1.2]) {
   const s=newState();f.f(s,p,u,o,1);numbers(s,f.id+' finite state');
   if(s.slices)for(let j=0;j<s.slices.n;j++)numbers(s.slices.off(j),f.id+' slice offset');
   if(s.reveal){const ctx=new Proxy({},{get:()=> (...args)=>args.forEach(n=>numbers(n,f.id+' mask geometry'))});clipCreativeReveal(ctx,u,s.reveal)}
  }
  for(const u of units){const s=newState();if(transitions.includes(f))f.f(s,1,u,defaults);else f.f(s,2.5,u,defaults,0);
   for(const k of ['x','y','rot','skx','blur','mix'])check(Math.abs(s[k])<1e-8,f.id+' neutral '+k);
   for(const k of ['sx','sy','op'])check(Math.abs(s[k]-1)<1e-8,f.id+' neutral '+k);
  }
 }
 return {failures,transitions:transitions.length,loops:loops.length,total:FX.length+LOOPS.length-1};
})()`,context);
assert.deepEqual(Array.from(results.failures),[]);
console.log(`PASS ${results.transitions} transitions + ${results.loops} loops; unique ids, parameter extremes, finite geometry and neutral endpoints`);

(async()=>{
 const {chromium}=require(process.argv[2]||'playwright');
 const browser=await chromium.launch({headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765');await page.waitForFunction(()=>HIST.last!==null);
 const report=await page.evaluate(async()=>{
  setPlay(false);await loadFonts();
  const failures=[],check=(ok,msg)=>{if(!ok)failures.push(msg)};
  const canvas=document.createElement('canvas');canvas.width=400;canvas.height=180;const x=canvas.getContext('2d');
  const state=()=>({...defaults(),font:15,text:'MOTO',fs:78,fit:false,transparent:true,delay:0,dIn:1,hold:1,dOut:1,tail:0,inS:mkSlot('fade',{stagger:0,split:'all'}),outMode:'mirror'});
  const pixels=()=>{const a=x.getImageData(0,0,400,180).data;let n=0,sum=0;for(let i=3;i<a.length;i+=4){if(a[i])n++;sum+=a[i]}return {n,sum}};
  for(const f of extraTransitions()){
   check(document.querySelectorAll('.tile[data-id="'+f.id+'"]').length===1,f.id+' tile exists');
   const st=state();st.inS=mkSlot(f.id,{split:'all',stagger:0});const lay=layout(st,x,400,180);
   renderFrame(x,st,lay,0,400,180,1);check(pixels().n===0,f.id+' hidden at entry start');
   renderFrame(x,st,lay,.55,400,180,1);check(pixels().n>0,f.id+' visible mid-transition');
   const mid=canvas.toDataURL();renderFrame(x,st,lay,1,400,180,1);check(pixels().n>0,f.id+' visible at rest');
   check(mid!==canvas.toDataURL(),f.id+' animates');
   renderFrame(x,st,lay,3,400,180,1);check(pixels().n===0,f.id+' hidden at mirror exit');
   st.inS=mkSlot('fade',{split:'all',stagger:0});st.outMode='custom';st.outS=mkSlot(f.id,{split:'all',stagger:0});
   renderFrame(x,st,lay,3,400,180,1);check(pixels().n===0,f.id+' hidden at custom exit');
  }
  for(const f of extraLoops()){
   const st=state();st.dIn=.01;st.loop={fx:f.id,when:'always',prms:{}};const lay=layout(st,x,400,180);
   renderFrame(x,st,lay,.1,400,180,1);const a=canvas.toDataURL();renderFrame(x,st,lay,.65,400,180,1);
   check(pixels().n>0,f.id+' renders');check(a!==canvas.toDataURL(),f.id+' moves over time');
  }
  const rec={id:'mask-test',name:'Mask test',src:'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="red"/></svg>')};
  await loadImg(rec);
  for(const f of extraTransitions().filter(f=>f.c==='Studio · maschere')){
   const st=state();st.text='';st.images=[rec];st.layers=[{...mkLayer(rec.id),fx:f.id,dIn:1,end:3,dOut:1,size:25}];const lay=layout(st,x,400,180);
   renderFrame(x,st,lay,.4,400,180,1);const mid=pixels().n;renderFrame(x,st,lay,1.1,400,180,1);
   check(mid>0&&mid<pixels().n,f.id+' clips images');
  }
  for(const f of extraTransitions()){
   const st=state();st.inS=mkSlot(f.id);const values=prmOf(st.inS,FXMAP);const first=f.p[0];values[first.k]=first.t==='r'?first.max:first.t==='b'?!first.v:first.o.at(-1)[0];
   await applyPreset(JSON.parse(JSON.stringify(st)),true);check(S.inS.fx===f.id&&prmOf(S.inS,FXMAP)[first.k]===values[first.k],f.id+' preset round-trip');
  }
  for(const f of extraLoops()){
   const st=state();st.loop={fx:f.id,when:'always',prms:{}};const values=prmOf(st.loop,LMAP);values[f.p[0].k]=f.p[0].max;
   await applyPreset(JSON.parse(JSON.stringify(st)),true);check(S.loop.fx===f.id&&prmOf(S.loop,LMAP)[f.p[0].k]===values[f.p[0].k],f.id+' loop preset round-trip');
  }
  return failures;
 });
 assert.deepEqual(report,[]);
 console.log('PASS all 20 previews and rendered animations, transition entry/exit, image masks and preset round-trips');
 await page.evaluate(async()=>{await applyPreset(defaults(),true);setPlay(false)});
 await page.locator('.tile[data-id="iris"]').click();
 assert.equal(await page.evaluate(()=>S.inS.fx),'iris');
 await page.locator('#tgtSeg button[data-t="out"]').click();
 await page.locator('.tile[data-id="origami"]').click();
 assert.equal(await page.evaluate(()=>S.outS.fx),'origami');
 await page.locator('.tile[data-id="orbit"]').click();
 assert.equal(await page.evaluate(()=>S.loop.fx),'orbit');
 await page.locator('#q').fill('scacchiera');
 assert.equal(await page.locator('.tile:visible').count(),1);
 await page.locator('#q').fill('');
 console.log('PASS library assignment to entry/exit, continuous motion and search');
 await page.evaluate(()=>{
  const all=[...extraTransitions(),...extraLoops()];
  const gallery=document.createElement('div');gallery.id='test-gallery';gallery.style.cssText='position:fixed;inset:0;z-index:1000;background:#121212;display:grid;grid-template-columns:repeat(5,1fr);gap:12px;padding:20px;overflow:auto';
  all.forEach((f,i)=>{const card=document.createElement('div');card.style.cssText='background:#202020;border:1px solid #444;border-radius:8px;padding:10px;color:#eee;font:14px sans-serif';
   const c=document.createElement('canvas');c.width=252;c.height=104;c.style.width='100%';const loop=i>=14;drawThumb(c,f,loop,loop?.45:.5);
   const label=document.createElement('div');label.textContent=f.n;card.append(c,label);gallery.append(card)});document.body.append(gallery);
 });
 await page.screenshot({path:'/tmp/moto-extra-effects.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS browser has no errors; preview gallery saved');
 } finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
