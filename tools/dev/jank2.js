const {chromium,devices}=require('playwright');const fs=require('fs');
const V={none:'',v21:fs.readFileSync('/workspace/gzl/v21.user.js','utf8'),v22:fs.readFileSync('/workspace/gzl/out/github-zh-lite.user.js','utf8')};const DIR={'2.1.0':'/workspace/github-zh-lite/dict/','2.2.0':'/workspace/gzl/out/dict/'};
const urls=[['issues-list','https://github.com/maboloshi/github-chinese/issues'],['issue-long','https://github.com/microsoft/vscode/issues/519'],['explore','https://github.com/explore']];
(async()=>{const b=await chromium.launch();const rows=[];
for(const [n,u] of urls)for(const w of ['none','v21','v22'])for(let rep=0;rep<2;rep++){const c=await b.newContext({...devices['iPhone 13'],locale:'en-US'});
await c.route(/raw\.githubusercontent\.com\/linyu-yuan\/github-zh-lite\/main\/dict\/.*/,r=>{const x=r.request().url();const nm=decodeURIComponent(x.split('/dict/')[1].split('?')[0]);const v=(x.split('v=')[1]||'').split('&')[0];const f=(DIR[v]||DIR['2.2.0'])+nm;fs.existsSync(f)?r.fulfill({status:200,contentType:'text/plain',body:fs.readFileSync(f)}):r.fulfill({status:404});});
if(V[w])await c.addInitScript({content:`document.addEventListener('DOMContentLoaded',function(){${V[w]}})`});
const p=await c.newPage();const cdp=await c.newCDPSession(p);
await p.goto(u,{waitUntil:'domcontentloaded'});await p.waitForTimeout(2500); // warm dict cache
await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
await p.goto(u,{waitUntil:'load'});await p.waitForTimeout(6000);
await p.evaluate(()=>{window.__f=[];let l=performance.now();(function f(t){__f.push(t-l);l=t;requestAnimationFrame(f)})(performance.now());});
const t0=Date.now();for(let i=0;i<30;i++){await p.touchscreen?null:null;await p.mouse.wheel(0,250);await p.waitForTimeout(60);}
const f=await p.evaluate(()=>__f.slice(2));const s=[...f].sort((a,b)=>a-b);
rows.push({page:n,ver:w,rep,frames:f.length,p50:Math.round(s[s.length>>1]),p95:Math.round(s[Math.floor(s.length*.95)]),max:Math.round(s[s.length-1]),over50:f.filter(x=>x>50).length,over100:f.filter(x=>x>100).length,scrollWall:Date.now()-t0});
await c.close();}
console.table(rows);fs.writeFileSync('/workspace/gzl/jank-steady.json',JSON.stringify(rows,null,1));await b.close();})();
