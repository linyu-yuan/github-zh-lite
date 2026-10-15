const {chromium,devices}=require('playwright');const fs=require('fs');
const V={v21:fs.readFileSync('/workspace/gzl/v21.user.js','utf8'),v22:fs.readFileSync('/workspace/gzl/out/github-zh-lite.user.js','utf8')};const DIR={'2.1.0':'/workspace/github-zh-lite/dict/','2.2.0':'/workspace/gzl/out/dict/'};
const pages=[['repo','https://github.com/linyu-yuan/squoosh-zh'],['issues','https://github.com/maboloshi/github-chinese/issues'],['pulls','https://github.com/maboloshi/github-chinese/pulls'],['actions','https://github.com/maboloshi/github-chinese/actions'],['releases','https://github.com/maboloshi/github-chinese/releases'],['blob','https://github.com/maboloshi/github-chinese/blob/gh-pages/README.md'],['explore','https://github.com/explore'],['search','https://github.com/search?q=chinese&type=repositories'],['profile','https://github.com/maboloshi'],['topics','https://github.com/topics'],['marketplace','https://github.com/marketplace'],['gist','https://gist.github.com/octocat']];
const RATE=+process.env.RATE||6;
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPhone 13'],locale:'en-US'});
await c.route(/raw\.githubusercontent\.com\/linyu-yuan\/github-zh-lite\/main\/dict\/.*/,r=>{const u=r.request().url();const n=decodeURIComponent(u.split('/dict/')[1].split('?')[0]);const v=(u.split('v=')[1]||'').split('&')[0];const f=(DIR[v]||DIR['2.2.0'])+n;fs.existsSync(f)?r.fulfill({status:200,contentType:'text/plain',body:fs.readFileSync(f)}):r.fulfill({status:404});});
await c.addInitScript({content:`window.__lt=[];new PerformanceObserver(l=>{for(const e of l.getEntries())__lt.push([e.startTime,e.duration])}).observe({type:'longtask'});window.__dl=[];addEventListener('pointerdown',e=>__dl.push(performance.now()-e.timeStamp),true);`});
const p=await c.newPage();const cdp=await c.newCDPSession(p);const rows=[];
// warm v2 dict cache
for(const [n,u] of pages){await p.goto(u,{waitUntil:'domcontentloaded'}).catch(()=>{});await p.evaluate(V.v21).catch(()=>{});await p.waitForTimeout(800);await p.goto(u,{waitUntil:'domcontentloaded'}).catch(()=>{});await p.evaluate(V.v22).catch(()=>{});await p.waitForTimeout(1200);}
for(const [n,u] of pages)for(const w of ['v21','v22']){try{
 await p.goto(u,{waitUntil:'load',timeout:60000});await p.waitForTimeout(3000);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});
 await p.evaluate(()=>{window.__t0=performance.now();window.__lastMut=0;window.__nm=0;new MutationObserver(r=>{__lastMut=performance.now();__nm+=r.length}).observe(document.body,{subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});});
 const s=Date.now();await p.evaluate(V[w]);const injectWall=Date.now()-s;
 const taps=[];for(const d of [100,400,800]){await p.waitForTimeout(d===100?100:300);const pt=await p.evaluate(()=>{for(let y=200;y<800;y+=23)for(let x=4;x<390;x+=37){const e=document.elementFromPoint(x,y);if(e&&!e.closest('a,button,summary,input,textarea,select,label,[role=button],[tabindex],details,#gzl-root'))return [x,y];}return null});const t=Date.now();if(pt)await p.touchscreen.tap(pt[0],pt[1]);taps.push(Date.now()-t);}
 await p.waitForTimeout(6000);
 const r=await p.evaluate(()=>{const lt=__lt.filter(x=>x[0]>=__t0);return {ltSum:lt.reduce((a,x)=>a+x[1],0),ltMax:Math.max(0,...lt.map(x=>x[1])),settle:__lastMut?__lastMut-__t0:0,muts:__nm,zh:(document.body.innerText.match(/[\u4e00-\u9fa5]/g)||[]).length,dl:Math.max(0,...__dl.slice(-3))}});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 rows.push({page:n,ver:w,injectWall,longTaskSum:Math.round(r.ltSum),longTaskMax:Math.round(r.ltMax),settleMs:Math.round(r.settle),tapMaxMs:Math.max(...taps),inputDelay:Math.round(r.dl),zh:r.zh});
 if(w==='v22'&&process.env.SHOTS)await p.screenshot({path:`/workspace/gzl/shots/v22-${n}.png`});
}catch(e){rows.push({page:n,ver:w,err:e.message.slice(0,60)});await cdp.send('Emulation.setCPUThrottlingRate',{rate:1}).catch(()=>{});}}
console.table(rows);fs.writeFileSync('/workspace/gzl/bench'+(process.env.TAG||'')+'.json',JSON.stringify(rows,null,1));await b.close();})();
