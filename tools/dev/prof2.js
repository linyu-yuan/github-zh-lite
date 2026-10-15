const {chromium,devices}=require('playwright');const fs=require('fs');
const V={none:'',v21:fs.readFileSync('/workspace/gzl/v21.user.js','utf8'),v22:fs.readFileSync('/workspace/gzl/out/github-zh-lite.user.js','utf8')};const DIR={'2.1.0':'/workspace/github-zh-lite/dict/','2.2.0':'/workspace/gzl/out/dict/'};
const urls=(process.argv[3]||'https://github.com/maboloshi/github-chinese/issues').split(',');const vers=(process.argv[2]||'none,v21,v22').split(',');const REPS=+process.env.REPS||2;
(async()=>{const b=await chromium.launch();const rows=[];
for(const u of urls)for(const w of vers)for(let rep=0;rep<REPS;rep++){const c=await b.newContext({...devices['iPhone 13'],locale:'en-US'});
await c.route(/raw\.githubusercontent\.com\/linyu-yuan\/github-zh-lite\/main\/dict\/.*/,r=>{const x=r.request().url();const nm=decodeURIComponent(x.split('/dict/')[1].split('?')[0]);const v=(x.split('v=')[1]||'').split('&')[0];const f=(DIR[v]||DIR['2.2.0'])+nm;fs.existsSync(f)?r.fulfill({status:200,contentType:'text/plain',body:fs.readFileSync(f)}):r.fulfill({status:404});});
if(V[w])await c.addInitScript({content:`document.addEventListener('DOMContentLoaded',function(){${V[w]}\n})`});
const p=await c.newPage();const cdp=await c.newCDPSession(p);let errs=0;p.on('console',m=>{if(/Hydration|#418|#423|#425|hydrat/i.test(m.text()))errs++;});
await p.goto(u,{waitUntil:'domcontentloaded'});await p.waitForTimeout(3000);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});await cdp.send('Profiler.start');
await p.goto(u,{waitUntil:'domcontentloaded'});await p.waitForTimeout(7000);
const {profile}=await cdp.send('Profiler.stop');const byId={};for(const n of profile.nodes)byId[n.id]=n;
let busy=0,gc=0;for(let i=0;i<profile.samples.length;i++){const fn=byId[profile.samples[i]].callFrame.functionName;const d=profile.timeDeltas[i]/1000;if(fn!=='(idle)'&&fn!=='(program)')busy+=d;if(fn==='(garbage collector)')gc+=d;}
const zh=await p.evaluate(()=>(document.body.innerText.match(/[\u4e00-\u9fa5]/g)||[]).length);
rows.push({page:u.replace('https://github.com/',''),ver:w,rep,jsBusyMs:Math.round(busy),gcMs:Math.round(gc),hydrationErrs:errs,zh});await c.close();}
console.table(rows);await b.close();})();
