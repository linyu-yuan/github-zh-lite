const {chromium,devices}=require('playwright');const fs=require('fs');
const V={v22:fs.readFileSync('/workspace/gzl/v22.user.js','utf8'),v23:fs.readFileSync('/workspace/gzl/out/github-zh-lite.user.js','utf8')};const DIR={v22:'/workspace/github-zh-lite/dict/',v23:'/workspace/gzl/out/dict/'};
const urls=[['repo','https://github.com/maboloshi/github-chinese'],['issues','https://github.com/maboloshi/github-chinese/issues'],['explore','https://github.com/explore'],['profile','https://github.com/maboloshi']];
const PROBE=`(function(){window.__ts=[];var t0=0;function cnt(){if(!document.body)return 0;var w=document.createTreeWalker(document.body,4),n,c=0;while(n=w.nextNode()){if(n.__zh===n.nodeValue&&/[\\u4e00-\\u9fa5]/.test(n.nodeValue))c++;}return c;}
setInterval(function(){__ts.push([performance.now(),cnt()]);},100);window.__fcp=0;try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){if(e.name==='first-contentful-paint')__fcp=e.startTime;});}).observe({type:'paint',buffered:true});}catch(e){}})();`;
(async()=>{const b=await chromium.launch();const rows=[];
for(const [n,u] of urls)for(const w of ['v22','v23'])for(const mode of ['cold','cached']){
 const c=await b.newContext({...devices['iPhone 13'],locale:'en-US'});
 await c.route(/raw\.githubusercontent\.com\/linyu-yuan\/github-zh-lite\/main\/dict\/.*/,async r=>{const nm=decodeURIComponent(r.request().url().split('/dict/')[1].split('?')[0]);await new Promise(s=>setTimeout(s,150));fs.existsSync(DIR[w]+nm)?r.fulfill({status:200,contentType:'text/plain',body:fs.readFileSync(DIR[w]+nm)}):r.fulfill({status:404});});
 await c.addInitScript({content:PROBE});
 await c.addInitScript({content:w==='v22'?`document.addEventListener('DOMContentLoaded',function(){${V.v22}\n})`:V.v23});
 const p=await c.newPage();const cdp=await c.newCDPSession(p);
 if(mode==='cached'){await p.goto(u,{waitUntil:'load'});await p.waitForTimeout(3000);}
 else{await p.goto('https://github.com/robots.txt');} // same origin, empty storage
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
 await p.goto(u,{waitUntil:'domcontentloaded',timeout:60000});await p.waitForTimeout(7000);
 const r=await p.evaluate(()=>{const ts=__ts,fin=ts.length?ts[ts.length-1][1]:0;const f=x=>{for(const [t,c] of ts)if(c>=x*fin&&c>0)return Math.round(t);return null};const dcl=performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd;let atF=0;for(const [t,c] of ts)if(t<=__fcp+100)atF=c;return {fin,t50:f(.5),t90:f(.9),fcp:Math.round(__fcp),dcl:Math.round(dcl),atFcp:atF}});
 rows.push({page:n,ver:w,mode,...r});await c.close();}
console.table(rows);fs.writeFileSync('/workspace/gzl/ttt.json',JSON.stringify(rows,null,1));await b.close();})();
