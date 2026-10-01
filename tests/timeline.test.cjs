// Start `python3 -m http.server 8765`, then run with Playwright available in NODE_PATH.
const {chromium}=require(process.argv[2]||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765');
 await page.waitForFunction(()=>typeof HIST!=='undefined'&&HIST.last!==null);
 await page.evaluate(async()=>{await loadFonts();setPlay(false)});
 const reset=async()=>page.evaluate(async()=>{
  await applyPreset(defaults(),true);setPlay(false);clearTimeout(HIST.tm);
  HIST.u=[];HIST.r=[];HIST.last=snap();TLD.zoom=1;TLD.clipboard=null;drawTimeline();
 });
 const seek=async(value)=>page.evaluate(value=>{t=value;setPlay(false);dirty=true;updHead()},value);
 const drag=async(selector,seconds,{cancel=false}={})=>{
  const box=await page.locator(selector).boundingBox();
  const px=await page.evaluate(seconds=>seconds/timelineDuration()*timelineWidth(),seconds);
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();await page.mouse.move(box.x+box.width/2+px,box.y+box.height/2,{steps:8});
  if(cancel)await page.keyboard.press('Escape');
  await page.mouse.up();
 };
 await reset();
 assert.equal(await page.locator('.tl-track').count(),1);
 await page.locator('#tlAdd').click();assert.equal(await page.locator('.tl-track').count(),2);
 await page.locator('#tlDuplicate').click();assert.equal(await page.locator('.tl-track').count(),3);
 await page.locator('[data-block="0"] .tl-select').click();
 assert.equal(await page.evaluate(()=>S.cur),0);
 console.log('PASS text track creation, duplication and selection');

 await reset();
 await page.evaluate(()=>{S.block.mode='keys';S.block.keys=[{t:.5,x:0,y:0,s:1,r:0,op:1,ease:'linear'},{t:1.5,x:20,y:0,s:1,r:0,op:1,ease:'linear'}];buildBlock();relayout();histCommit();TLD.snap=false});
 const before=await page.evaluate(()=>({delay:S.delay,keys:S.block.keys.map(k=>k.t)}));
 await drag('[data-block="0"] [data-move="text"]',.5);
 let moved=await page.evaluate(()=>({delay:S.delay,keys:S.block.keys.map(k=>k.t)}));
 assert.ok(Math.abs(moved.delay-before.delay-.5)<=1/30);
 assert.ok(Math.abs(moved.keys[0]-before.keys[0]-(moved.delay-before.delay))<.001);
 assert.ok(Math.abs(moved.keys[1]-before.keys[1]-(moved.delay-before.delay))<.001);
 await page.evaluate(()=>undo());
 assert.ok(Math.abs(await page.evaluate(()=>S.delay)-before.delay)<.001);
 await page.evaluate(()=>redo());
 assert.ok(Math.abs(await page.evaluate(()=>S.delay)-moved.delay)<.001);
 const cancelBefore=await page.evaluate(()=>JSON.stringify(pickText(S)));
 await drag('[data-block="0"] [data-move="text"]',.3,{cancel:true});
 assert.equal(await page.evaluate(()=>JSON.stringify(pickText(S))),cancelBefore);
 console.log('PASS clip + keys move together; undo, redo and drag cancellation');

 const originalIn=await page.evaluate(()=>S.dIn);
 await drag('[data-block="0"] [data-phase="dIn"]',.4);
 assert.ok(Math.abs(await page.evaluate(()=>S.dIn)-originalIn-.4)<.02);
 await page.locator('#zoomIn').click();await page.locator('#zoomIn').click();
 assert.ok(await page.evaluate(()=>TLD.zoom>2));
 await page.locator('#tlScroll').evaluate(el=>el.scrollLeft=120);
 const delayZoom=await page.evaluate(()=>S.delay);
 await drag('[data-block="0"] [data-phase="delay"]',.1);
 assert.ok(Math.abs(await page.evaluate(()=>S.delay)-delayZoom-.1)<.02);
 await page.locator('#zoomFit').click();
 assert.equal(await page.evaluate(()=>TLD.zoom),1);
 console.log('PASS phase duration editing and zoomed/scrolled coordinates');

 await seek(1.2);await page.locator('#addMarker').click();
 await page.locator('#markerName').fill('Titolo <intro>');await page.keyboard.press('Enter');
 assert.equal(await page.locator('.tl-marker').innerText(),'◆Titolo <intro>');
 await drag('[data-marker="0"]',.3);
 assert.ok(Math.abs(await page.evaluate(()=>S.timeline.markers[0].t)-1.5)<.001);
 await page.evaluate(()=>{TLD.snap=true});
 const snapping=await page.evaluate(()=>({on:snapTimeline(1.501,{}),off:snapTimeline(1.501,{altKey:true})}));
 assert.equal(snapping.on,1.5);
 await page.keyboard.press('Backspace');
 assert.equal(await page.locator('.tl-marker').count(),0);
 await page.evaluate(()=>undo());assert.equal(await page.locator('.tl-marker').count(),1);
 console.log('PASS marker add, rename, drag, snap, deletion and undo');

 const keyBefore=await page.evaluate(()=>S.block.keys[0].t);
 await drag('[data-key="0"]',.2);
 assert.ok(Math.abs(await page.evaluate(()=>S.block.keys[0].t)-keyBefore-.2)<=1/30);
 await page.locator('[data-key="0"]').click();
 await page.locator('#copyKey').click();
 await seek(2.5);await page.locator('#pasteKey').click();
 assert.equal(await page.evaluate(()=>S.block.keys.filter(k=>Math.abs(k.t-2.5)<.001).length),1);
 await page.locator('#pasteKey').click();
 assert.equal(await page.evaluate(()=>S.block.keys.filter(k=>Math.abs(k.t-2.5)<.001).length),1);
 await seek(0);await page.locator('#nextKey').click();
 assert.ok(await page.evaluate(()=>t===Math.min(...S.block.keys.map(k=>k.t))));
 await page.locator('#tlScroll').focus();await page.keyboard.press('Delete');
 assert.equal(await page.evaluate(()=>S.block.keys.length),2);
 console.log('PASS keyframe copy/paste, collision replacement, navigation and delete');

 await seek(.5);await page.locator('#rangeIn').click();
 await seek(1);await page.locator('#rangeOut').click();
 await seek(0);await page.locator('#bPlay').click();
 await page.waitForTimeout(750);
 assert.ok(await page.evaluate(()=>t>=.5&&t<=1&&playing));
 await page.locator('#cLoop').uncheck();
 await page.waitForFunction(()=>!playing);
 assert.ok(Math.abs(await page.evaluate(()=>t)-1)<.001);
 assert.ok(await page.evaluate(()=>clipTotal()>previewBounds().end));
 console.log('PASS preview range loop, playback stop and full project duration');

 await page.evaluate(()=>{histCommit();autosave()});
 const saved=await page.evaluate(()=>JSON.stringify(S.timeline));
 await page.reload();await page.waitForFunction(()=>HIST.last!==null);await page.evaluate(()=>setPlay(false));
 assert.equal(await page.evaluate(()=>JSON.stringify(S.timeline)),saved);
 await page.evaluate(async()=>{const legacy=defaults();delete legacy.timeline;await applyPreset(legacy,true)});
 assert.equal(await page.evaluate(()=>S.timeline.markers.length),0);
 console.log('PASS autosave restore and legacy preset compatibility');

 await reset();
 await page.evaluate(async()=>{
  const rec={id:'test-image',name:'Immagine test',src:'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="red"/></svg>')};
  S.images.push(rec);await loadImg(rec);S.layers.push({...mkLayer(rec.id),start:1,end:6});buildImages();relayout();histCommit();TLD.snap=false;
 });
 assert.equal(await page.evaluate(()=>clipTotal()),6);
 assert.equal(await page.locator('.tl-image-track').count(),1);
 await drag('[data-layer="0"] [data-move="image"]',.5);
 assert.ok(Math.abs(await page.evaluate(()=>S.layers[0].start)-1.5)<.001);
 assert.ok(Math.abs(await page.evaluate(()=>S.layers[0].end)-6.5)<.001);
 await drag('[data-layer="0"] [data-trim="end"]',-.5);
 assert.ok(Math.abs(await page.evaluate(()=>clipTotal())-6)<.001);
 await page.evaluate(()=>{renderExport(5);dirty=true});
 console.log('PASS image track movement, trim and export duration beyond text');

 await page.locator('#tlAdd').click();await seek(1.5);
 await page.screenshot({path:'/tmp/moto-timeline.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'/tmp/moto-timeline-mobile.png'});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);
 console.log('PASS desktop/mobile layout and no browser errors');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
