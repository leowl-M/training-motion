/* Timeline UI state is separate from the saved project. Times are in seconds. */
const TLD = {scale:0, zoom:1, snap:true, drag:null, marker:null, clipboard:null};
const SEGK = [['delay','Ritardo','',0],['dIn','Entrata','s-in',.05],['hold','Pausa','s-hold',0],['dOut','Uscita','s-out',.05],['tail','Coda','',0]];
const TL_LABEL = 136;
const frameTime = value => Math.round(value * S.fps) / S.fps;
const timelineDuration = () => TLD.scale || clipTotal();
const timelineWidth = () => Math.max(160, $('#tlScroll').clientWidth - TL_LABEL - 2) * TLD.zoom;
const textTracks = () => nBlocks() > 1 ? S.blocks.map((b,i) => i === S.cur ? S : b) : [S];
const safeText = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function normalizeTimeline() {
 const data = S.timeline || {};
 const total = clipTotal();
 S.timeline = {
  markers: (Array.isArray(data.markers) ? data.markers : []).filter(m => m && Number.isFinite(m.t)).map((m,i) => ({t:clamp(m.t,0,total),name:String(m.name || `Marker ${i+1}`).slice(0,60)})),
  range: {enabled:!!data.range?.enabled,start:clamp(Number(data.range?.start)||0,0,total),end:clamp(Number(data.range?.end)||0,0,total)}
 };
 if(S.timeline.range.end <= S.timeline.range.start) S.timeline.range.enabled = false;
}
function previewBounds() {
 const total = clipTotal(), r = S.timeline.range;
 const start = clamp(r.start,0,Math.max(0,total-1/S.fps));
 const end = clamp(r.end || total,start+1/S.fps,total);
 return r.enabled ? {start,end} : {start:0,end:total};
}
function timelinePoints(excludeBlock=-1, excludeLayer=-1, excludeKey=null, excludeMarker=null) {
 const points = [0,clipTotal()];
 textTracks().forEach((b,i) => {
  if(i !== excludeBlock) {const T=timing(b);points.push(T.inS,T.holdS,T.outS,T.total-(T.on?b.tail:0),T.total)}
  if(i !== excludeBlock || excludeKey) for(const k of b.block.keys||[]) if(k!==excludeKey) points.push(k.t);
 });
 S.layers.forEach((L,i) => {if(i!==excludeLayer)points.push(L.start,L.end||clipTotal())});
 S.timeline.markers.forEach(m => {if(m!==excludeMarker)points.push(m.t)});
 return points;
}
function snapTimeline(value,e,points=timelinePoints()) {
 let result = frameTime(value);
 if(!TLD.snap || e?.altKey) return result;
 const tolerance = timelineDuration()/timelineWidth()*8;
 let best = tolerance;
 for(const point of points) if(Math.abs(point-value)<best) {best=Math.abs(point-value);result=point}
 return result;
}
function setTimelineZoom(value) {
 const scroll=$('#tlScroll'), oldWidth=timelineWidth();
 const anchor=clamp((scroll.scrollLeft+(scroll.clientWidth-TL_LABEL)/2)/oldWidth);
 TLD.zoom=clamp(value,1,16);drawTimeline();
 scroll.scrollLeft=anchor*timelineWidth()-(scroll.clientWidth-TL_LABEL)/2;
}
function phaseMarkup(b,pc) {
 let acc=0, html='';
 for(const [key,name,cls] of SEGK) {
  if(key==='dOut'&&b.outMode==='none')continue;
  const start=acc;acc+=b[key];
  if(key==='delay')continue;
  html+=`<span class="tl-phase ${cls}" style="left:${pc(start)}%;width:${pc(b[key])}%" title="${name}: ${b[key].toFixed(2)} s">${name}</span>`;
 }
 return html;
}
function drawTimeline() {
 const D=timelineDuration(), width=timelineWidth(), pc=v=>v/D*100;
 const tracks=textTracks();
 const stepCandidates=[1/S.fps,2/S.fps,5/S.fps,.5,1,2,5,10,30,60,120,300,600];
 const step=stepCandidates.find(v=>v/D*width>=65)||Math.ceil(D/10);
 let ticks='';
 for(let i=0;i*step<=D+1e-6;i++) {const x=i*step;ticks+=`<span style="left:${pc(x)}%">${+x.toFixed(2)}s</span>`}
 const r=S.timeline.range, bounds=previewBounds();
 const rangeStart=clamp(r.start,0,D),rangeEnd=clamp(r.end||clipTotal(),rangeStart,D);
 let html=`<div class="tl-ruler"><div class="tl-label">TRACCE <span>${tracks.length+S.layers.length}</span></div><div class="tl-lane tl-ruler-lane"><div class="tl-ticks">${ticks}</div><div class="tl-range ${r.enabled?'enabled':''}" style="left:${pc(rangeStart)}%;width:${pc(rangeEnd-rangeStart)}%"><button data-range="start" class="tl-range-handle start" aria-label="Trascina inizio intervallo" title="Inizio anteprima"></button><button data-range="end" class="tl-range-handle end" aria-label="Trascina fine intervallo" title="Fine anteprima"></button></div></div></div>`;
 html+=`<div class="tl-marker-row"><div class="tl-label">MARKER</div><div class="tl-lane">${S.timeline.markers.map((m,i)=>`<button class="tl-marker ${TLD.marker===m?'selected':''}" data-marker="${i}" style="left:${pc(m.t)}%" title="${safeText(m.name)} · ${m.t.toFixed(2)} s" aria-label="${safeText(m.name)}"><span>◆</span>${safeText(m.name)}</button>`).join('')}</div></div>`;
 tracks.forEach((b,i)=>{
  const active=i===S.cur,T=timing(b);
  let acc=0,handles='';
  for(const [key,name] of SEGK) {if(key==='dOut'&&!T.on)continue;acc+=b[key];handles+=`<span class="tl-phase-handle" data-phase="${key}" style="left:clamp(5px,${pc(acc)}%,calc(100% - 5px))" title="Regola ${safeText(name.toLowerCase())}" aria-hidden="true"></span>`}
  const keys=b.block.mode==='keys'?(b.block.keys||[]).map((k,j)=>`<button class="tl-key ${active&&k===UI.selKey?'selected':''}" data-key="${j}" style="left:${pc(k.t)}%" title="Keyframe ${k.t.toFixed(2)} s · trascina per spostare" aria-label="Keyframe a ${k.t.toFixed(2)} secondi"></button>`).join(''):'';
  html+=`<div class="tl-track ${active?'active':''}" data-block="${i}"><button class="tl-label tl-select" title="${safeText(blockName(i))}"><span class="tl-kind">T${i+1}</span><span class="tl-name">${safeText(blockName(i))}</span></button><div class="tl-lane"><div class="tl-clip" data-move="text" style="left:${pc(b.delay)}%;width:${pc(T.total-b.delay)}%" title="Trascina per spostare il blocco con i suoi keyframe"></div>${phaseMarkup(b,pc)}${handles}<div class="tl-keys">${keys}</div></div></div>`;
 });
 S.layers.forEach((L,i)=>{
  const end=L.end||clipTotal(),name=S.images.find(im=>im.id===L.img)?.name||`Immagine ${i+1}`;
  html+=`<div class="tl-track tl-image-track" data-layer="${i}"><button class="tl-label tl-select" title="Apri i controlli di ${safeText(name)}"><span class="tl-kind">IMG</span><span class="tl-name">${safeText(name)}</span></button><div class="tl-lane"><div class="tl-image-clip" data-move="image" style="left:${pc(L.start)}%;width:${pc(Math.max(0,end-L.start))}%" title="Trascina per spostare l’immagine">${safeText(name)}${L.end?'':' · fino alla fine'}</div><span class="tl-phase-handle" data-trim="start" style="left:clamp(5px,${pc(L.start)}%,calc(100% - 5px))" title="Inizio immagine"></span><span class="tl-phase-handle" data-trim="end" style="left:clamp(5px,${pc(end)}%,calc(100% - 5px))" title="Fine immagine"></span></div></div>`;
 });
 html+='<div class="tl-playhead" id="ph"></div>';
 const tl=$('#tl');tl.style.width=`${width+TL_LABEL}px`;tl.innerHTML=html;
 $('#trackCount').textContent=`${tracks.length+S.layers.length} ${tracks.length+S.layers.length===1?'traccia':'tracce'}`;
 $('#zoomValue').textContent=`${Math.round(TLD.zoom*100)}%`;
 $('#zoomOut').disabled=TLD.zoom<=1;$('#zoomIn').disabled=TLD.zoom>=16;
 $('#rangeEnabled').checked=r.enabled;
 $('#rangeLabel').textContent=r.enabled?`${bounds.start.toFixed(2)}–${bounds.end.toFixed(2)}s`:'';
 $('#copyKey').disabled=!S.block.keys?.includes(UI.selKey);
 $('#pasteKey').disabled=!TLD.clipboard;
 $('#prevKey').disabled=$('#nextKey').disabled=S.block.mode!=='keys'||!S.block.keys.length;
 $('#markerEditor').hidden=!S.timeline.markers.includes(TLD.marker);
 if(TLD.marker&&document.activeElement!==$('#markerName'))$('#markerName').value=TLD.marker.name;
 updHead();
}
function updHead() {
 const ph=$('#ph');if(!ph)return;
 ph.style.left=`${TL_LABEL+clamp(t/timelineDuration())*timelineWidth()}px`;
 $('#tc').innerHTML=fmtTC(t)+` <span>/ ${clipTotal().toFixed(2)}s</span>`;
}
function jumpKey(direction) {
 const keys=S.block.mode==='keys'?[...S.block.keys].sort((a,b)=>a.t-b.t):[];
 const key=direction>0?keys.find(k=>k.t>t+1e-6):keys.reverse().find(k=>k.t<t-1e-6);
 if(!key)return;setPlay(false);t=clamp(key.t,0,clipTotal());UI.selKey=key;TLD.marker=null;buildBlock();drawTimeline();dirty=true;
 $('#tlScroll').scrollLeft=Math.max(0,t/timelineDuration()*timelineWidth()-($('#tlScroll').clientWidth-TL_LABEL)/2);
}
function pasteTimelineKey(source=TLD.clipboard) {
 if(!source)return;
 histCommit();const b=S.block;b.mode='keys';b.keys=b.keys||[];
 const time=frameTime(t),existing=b.keys.find(k=>Math.abs(k.t-time)<.5/S.fps);
 const key={...source,t:time};
 if(existing)Object.assign(existing,key);else b.keys.push(key);
 UI.selKey=existing||key;TLD.marker=null;buildBlock();drawTimeline();dirty=true;histMark();
 toast(existing?'Keyframe aggiornato alla testina':'Keyframe incollato alla testina');
}
function copyTimelineKey() {
 if(!S.block.keys?.includes(UI.selKey))return false;
 TLD.clipboard={...UI.selKey};drawTimeline();toast('Keyframe copiato');return true;
}
function addTimelineMarker() {
 histCommit();const time=frameTime(t);
 let marker=S.timeline.markers.find(m=>Math.abs(m.t-time)<.5/S.fps);
 if(!marker){marker={t:time,name:`Marker ${S.timeline.markers.length+1}`};S.timeline.markers.push(marker)}
 TLD.marker=marker;UI.selKey=null;drawTimeline();histMark();
 $('#markerName').focus();$('#markerName').select();
}
function setPreviewEdge(edge) {
 histCommit();const r=S.timeline.range,total=clipTotal(),value=clamp(frameTime(t),0,total);
 if(edge==='start'){r.start=Math.min(value,total-1/S.fps);if(!r.end||r.end<=r.start)r.end=total}
 else {r.end=Math.max(1/S.fps,value);if(r.start>=r.end)r.start=0}
 r.enabled=true;drawTimeline();histMark();
}
function deleteTimelineSelection() {
 if(TLD.marker&&S.timeline.markers.includes(TLD.marker)) {
  histCommit();S.timeline.markers.splice(S.timeline.markers.indexOf(TLD.marker),1);TLD.marker=null;
 } else if(UI.selKey&&S.block.keys?.includes(UI.selKey)) {
  histCommit();S.block.keys.splice(S.block.keys.indexOf(UI.selKey),1);UI.selKey=null;buildBlock();dirty=true;
 } else return false;
 drawTimeline();histMark();return true;
}
function timelineKeydown(e,editing) {
 if(editing||e.target.closest('input,textarea,select,[contenteditable=true]')||$('#help').classList.contains('on')||exporting)return false;
 const key=e.key.toLowerCase(),mod=e.metaKey||e.ctrlKey;
 let handled=true;
 if(e.key==='Escape'&&TLD.drag)finishTimelineDrag(true);
 else if(mod&&key==='c')handled=copyTimelineKey();
 else if(mod&&key==='v'){handled=!!TLD.clipboard;if(handled)pasteTimelineKey()}
 else if(mod||e.altKey)return false;
 else if(key==='m')addTimelineMarker();
 else if(key==='i')setPreviewEdge('start');
 else if(key==='o')setPreviewEdge('end');
 else if(key==='[')jumpKey(-1);
 else if(key===']')jumpKey(1);
 else if(key==='+'||key==='=')setTimelineZoom(TLD.zoom*1.5);
 else if(key==='-')setTimelineZoom(TLD.zoom/1.5);
 else if(key==='0')setTimelineZoom(1);
 else if(key==='delete'||key==='backspace')handled=deleteTimelineSelection();
 else handled=false;
 if(handled)e.preventDefault();return handled;
}
function finishTimelineDrag(cancel=false) {
 const drag=TLD.drag;if(!drag)return;
 TLD.drag=null;TLD.scale=0;
 if(cancel&&drag.before){S=JSON.parse(drag.before);UI.selKey=null;TLD.marker=null;buildInspector()}
 if(drag.kind!=='scrub') {
  if(drag.kind==='key'||drag.kind==='text'||drag.kind==='phase') {buildBlock();for(const [key] of SEGK)UI.time?.[key]?._set(S[key])}
  if(drag.kind==='image'||drag.kind==='trim')buildImages();
  relayout();histCommit();
 }else drawTimeline();
}
function initTimeline() {
 const scroll=$('#tlScroll');
 const xAt=e=>(e.clientX-$('#tl').getBoundingClientRect().left-TL_LABEL)/timelineWidth()*timelineDuration();
 $('#zoomIn').onclick=()=>setTimelineZoom(TLD.zoom*1.5);
 $('#zoomOut').onclick=()=>setTimelineZoom(TLD.zoom/1.5);
 $('#zoomFit').onclick=()=>setTimelineZoom(1);
 $('#tlSnap').onchange=e=>TLD.snap=e.target.checked;
 $('#tlAdd').onclick=()=>addBlock(false);$('#tlDuplicate').onclick=()=>addBlock(true);
 $('#prevKey').onclick=()=>jumpKey(-1);$('#nextKey').onclick=()=>jumpKey(1);
 $('#copyKey').onclick=copyTimelineKey;$('#pasteKey').onclick=()=>pasteTimelineKey();
 $('#addMarker').onclick=addTimelineMarker;
 $('#deleteMarker').onclick=deleteTimelineSelection;
 $('#markerName').oninput=e=>{if(TLD.marker){TLD.marker.name=e.target.value;drawTimeline();histMark()}};
 $('#markerName').onkeydown=e=>{if(e.key==='Enter')scroll.focus()};
 $('#rangeIn').onclick=()=>setPreviewEdge('start');$('#rangeOut').onclick=()=>setPreviewEdge('end');
 $('#rangeEnabled').onchange=e=>{const r=S.timeline.range;r.enabled=e.target.checked;if(r.end<=r.start){r.start=0;r.end=clipTotal()}drawTimeline();histMark()};
 scroll.addEventListener('click',e=>{
  if(e.detail!==0)return; // Pointer interactions are handled below; this is keyboard activation.
  const row=e.target.closest('[data-block]');
  if(row&&+row.dataset.block!==S.cur)selectBlock(+row.dataset.block);
  const key=e.target.closest('[data-key]'),marker=e.target.closest('[data-marker]');
  if(key){UI.selKey=S.block.keys[+key.dataset.key];TLD.marker=null;t=UI.selKey.t;buildBlock()}
  if(marker){TLD.marker=S.timeline.markers[+marker.dataset.marker];UI.selKey=null;t=TLD.marker.t}
  if(key||marker){setPlay(false);dirty=true;drawTimeline()}
 });
 scroll.addEventListener('pointerdown',e=>{
  if(e.button!==0||exporting)return;
  const label=e.target.closest('.tl-select'), row=e.target.closest('.tl-track');
  const blockIndex=row?.dataset.block!==undefined?+row.dataset.block:-1;
  const layerIndex=row?.dataset.layer!==undefined?+row.dataset.layer:-1;
  if(e.target.closest('.tl-label')&&!label)return;
  if(e.target===scroll)return;
  const phase=e.target.closest('[data-phase]')?.dataset.phase;
  const keyIndex=e.target.closest('[data-key]')?.dataset.key;
  const markerIndex=e.target.closest('[data-marker]')?.dataset.marker;
  const range=e.target.closest('[data-range]')?.dataset.range;
  const trim=e.target.closest('[data-trim]')?.dataset.trim;
  const move=e.target.closest('[data-move]')?.dataset.move;
  histCommit();setPlay(false);
  if(blockIndex>=0&&blockIndex!==S.cur)selectBlock(blockIndex);
  if(label){if(layerIndex>=0){UI.imgSec.d.open=true;const detail=UI.imgSec.b.querySelectorAll('details.lyr')[layerIndex];if(detail){detail.open=true;detail.scrollIntoView({block:'nearest'})}}return}
  e.preventDefault();scroll.focus({preventScroll:true});scroll.setPointerCapture(e.pointerId);
  TLD.scale=clipTotal();
  const drag={kind:'scrub',origin:xAt(e),before:JSON.stringify(S),blockIndex,layerIndex};
  if(markerIndex!==undefined){drag.kind='marker';drag.marker=S.timeline.markers[+markerIndex];drag.time=drag.marker.t;TLD.marker=drag.marker;UI.selKey=null;t=drag.marker.t}
  else if(range){drag.kind='range';drag.edge=range}
  else if(keyIndex!==undefined){drag.kind='key';drag.key=S.block.keys[+keyIndex];UI.selKey=drag.key;TLD.marker=null;t=drag.key.t}
  else if(phase){drag.kind='phase';drag.phase=phase;drag.start=0;for(const [key]of SEGK){if(key===phase)break;if(key!=='dOut'||S.outMode!=='none')drag.start+=S[key]}drag.time=drag.start+S[phase]}
  else if(trim){drag.kind='trim';drag.edge=trim;drag.layer=S.layers[layerIndex];drag.end=drag.layer.end||clipTotal();drag.time=trim==='start'?drag.layer.start:drag.end}
  else if(move==='text'){drag.kind='text';drag.delay=S.delay;drag.duration=timing(S).total-S.delay;drag.keys=S.block.keys.map(k=>({key:k,time:k.t}))}
  else if(move==='image'){drag.kind='image';drag.layer=S.layers[layerIndex];drag.start=drag.layer.start;drag.end=drag.layer.end||clipTotal()}
  else {UI.selKey=null;TLD.marker=null;t=clamp(snapTimeline(xAt(e),e),0,clipTotal())}
  TLD.drag=drag;dirty=true;drawTimeline();
 });
 scroll.addEventListener('pointermove',e=>{
  const d=TLD.drag;if(!d)return;
  const x=xAt(e),points=timelinePoints(d.blockIndex,d.layerIndex,d.key,d.marker);
  if(d.kind==='scrub')t=clamp(snapTimeline(x,e),0,clipTotal());
  else if(d.kind==='marker'){d.marker.t=clamp(snapTimeline(d.time+x-d.origin,e,points),0,clipTotal());t=d.marker.t}
  else if(d.kind==='range'){
   const r=S.timeline.range;r.enabled=true;
   if(d.edge==='start')r.start=clamp(snapTimeline(x,e,points),0,(r.end||clipTotal())-1/S.fps);
   else r.end=clamp(snapTimeline(x,e,points),r.start+1/S.fps,clipTotal());
  }else if(d.kind==='key'){
   const value=clamp(snapTimeline(x,e,points),0,clipTotal());
   if(!S.block.keys.some(k=>k!==d.key&&Math.abs(k.t-value)<.5/S.fps)){d.key.t=value;t=value}
  }else if(d.kind==='phase'){
   const min=SEGK.find(s=>s[0]===d.phase)[3];
   S[d.phase]=Math.max(Math.ceil(min*S.fps)/S.fps,snapTimeline(d.time+x-d.origin,e,points)-d.start);
   UI.time?.[d.phase]?._set(S[d.phase]);
  }else if(d.kind==='text'){
   const raw=d.delay+x-d.origin;
   let start=snapTimeline(raw,e,points);
   const endSnap=snapTimeline(raw+d.duration,e,points)-d.duration;
   if(Math.abs(endSnap-raw)<Math.abs(start-raw))start=endSnap;
   // Keys use absolute project time: move them together, without crossing zero.
   const earliest=Math.min(d.delay,...d.keys.map(k=>k.time));
   const delta=Math.max(-earliest,start-d.delay);
   S.delay=d.delay+delta;d.keys.forEach(k=>k.key.t=k.time+delta);
  }else if(d.kind==='image'){
   const delta=Math.max(-d.start,snapTimeline(d.start+x-d.origin,e,points)-d.start);
   d.layer.start=d.start+delta;d.layer.end=d.end+delta;
  }else if(d.kind==='trim'){
   if(d.edge==='start')d.layer.start=clamp(snapTimeline(d.time+x-d.origin,e,points),0,d.end-1/S.fps);
   else d.layer.end=Math.max(d.layer.start+1/S.fps,snapTimeline(d.time+x-d.origin,e,points));
  }
  dirty=true;drawTimeline();
 });
 scroll.addEventListener('pointerup',()=>finishTimelineDrag());
 scroll.addEventListener('pointercancel',()=>finishTimelineDrag(true));
 scroll.addEventListener('lostpointercapture',()=>finishTimelineDrag());
 scroll.addEventListener('dblclick',e=>{if(!e.target.closest('.tl-marker-row .tl-lane')||e.target.closest('[data-marker]'))return;t=clamp(frameTime(xAt(e)),0,clipTotal());dirty=true;addTimelineMarker()});
 new ResizeObserver(()=>{drawTimeline()}).observe(scroll);
}
