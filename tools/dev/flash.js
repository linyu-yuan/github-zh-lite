const {chromium,devices}=require('playwright');const fs=require('fs');
const V={v234:fs.readFileSync('/workspace/gzl/v234.user.js','utf8'),v240:fs.readFileSync('/workspace/github-zh-lite/github-zh-lite.user.js','utf8')};const DIR='/workspace/github-zh-lite/dict/';
const urls=[['repo','https://github.com/maboloshi/github-chinese'],['issues','https://github.com/maboloshi/github-chinese/issues'],['explore','https://github.com/explore'],['profile','https://github.com/maboloshi']];
// probe: every rAF (just before a frame is painted) record visible English text nodes; at the end, keep only nodes that ended up translated
const PROBE=`(function(){var seen=new Map(),frames=0,visFrames=0;window.__fl={seen:seen};
function isHidden(){var h=document.documentElement;return getComputedStyle(h).visibility==='hidden';}
function tick(t){frames++;if(document.body&&!isHidden()){visFrames++;var w=document.createTreeWalker(document.body,4),n,H=innerHeight;while(n=w.nextNode()){var v=n.nodeValue;if(!/[A-Za-z]{2}/.test(v)||/[\\u4e00-\\u9fa5]/.test(v))continue;var p=n.parentElement;if(!p)continue;var r=p.getBoundingClientRect();if(r.bottom<0||r.top>H||r.width===0)continue;if(!seen.has(n))seen.set(n,[t,v.trim()]);}}
if(t<15000)requestAnimationFrame(tick);}requestAnimationFrame(tick);
window.__flReport=function(){var out=[];seen.forEach(function(x,n){if(n.isConnected&&/[\\u4e00-\\u9fa5]/.test(n.nodeValue)&&n.__zh===n.nodeValue)out.push([Math.round(x[0]),x[1].slice(0,30)]);});return {frames:frames,visFrames:visFrames,flashed:out.length,sample:out.slice(0,6)};};})();`;
(async()=>{const b=await chromium.launch();const rows=[];
for(const [n,u] of urls)for(const w of ['v234','v240']){
 const c=await b.newContext({...devices['iPhone 13'],locale:'en-US'});
 await c.route(/raw\.githubusercontent\.com\/linyu-yuan\/github-zh-lite\/main\/dict\/.*/,r=>{const nm=decodeURIComponent(r.request().url().split('/dict/')[1].split('?')[0]);fs.existsSync(DIR+nm)?r.fulfill({status:200,contentType:'text/plain',body:fs.readFileSync(DIR+nm)}):r.fulfill({status:404});});
 await c.addInitScript({content:V[w]});await c.addInitScript({content:PROBE});
 const p=await c.newPage();const cdp=await c.newCDPSession(p);
 await p.goto(u,{waitUntil:'load'});await p.waitForTimeout(2500); // warm cache
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
 // screencast first frames
 const shots=[];cdp.on('Page.screencastFrame',async f=>{if(shots.length<1)shots.push(f.data);await cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
 await p.goto(u,{waitUntil:'commit'});await cdp.send('Page.startScreencast',{format:'png',everyNthFrame:1}).catch(()=>{});
 await p.waitForLoadState('domcontentloaded');await p.waitForTimeout(6000);
 const r=await p.evaluate(()=>__flReport());const meta=await p.evaluate(()=>!!document.querySelector('meta[name="apple-itunes-app"]'));
 const fcp=await p.evaluate(()=>{const e=performance.getEntriesByName('first-contentful-paint')[0];return e?Math.round(e.startTime):0});
 if(shots[0])fs.writeFileSync(`/workspace/gzl/shots/first-${n}-${w}.png`,Buffer.from(shots[0],'base64'));
 // soft nav: click a tab/link and check flash on the new content
 let nav={};try{await p.evaluate(()=>{window.__fl.seen.clear()});const a=p.locator('a[href$="/pulls"], a[href="/trending"], a[href$="?tab=repositories"]').first();await a.click({timeout:8000});await p.waitForTimeout(5000);nav=await p.evaluate(()=>__flReport());}catch(e){nav={flashed:'n/a'}}
 rows.push({page:n,ver:w,fcp,frames:r.frames,visibleFrames:r.visFrames,englishFlashNodes:r.flashed,firstFlashAt:r.sample[0]?r.sample[0][0]:'',sample:r.sample.map(x=>x[1]).join(' / ').slice(0,60),navFlash:nav.flashed,bannerMeta:meta});
 await c.close();}
console.table(rows);fs.writeFileSync('/workspace/gzl/flash.json',JSON.stringify(rows,null,1));await b.close();})();
