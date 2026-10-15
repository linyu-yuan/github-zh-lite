const {chromium,devices}=require('playwright');const fs=require('fs');
const file=process.argv[2],url=process.argv[3]||'https://github.com/maboloshi/github-chinese/issues';
const js=fs.readFileSync(file,'utf8')+'\n//# sourceURL=gzl.js';
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPhone 13'],locale:'en-US'});const DIR={'2.1.0':'/workspace/github-zh-lite/dict/','2.2.0':'/workspace/gzl/out/dict/'};await c.route(/raw\.githubusercontent\.com\/linyu-yuan\/github-zh-lite\/main\/dict\/.*/,r=>{const x=r.request().url();const nm=decodeURIComponent(x.split('/dict/')[1].split('?')[0]);const v=(x.split('v=')[1]||'').split('&')[0];const f=(DIR[v]||DIR['2.2.0'])+nm;fs.existsSync(f)?r.fulfill({status:200,contentType:'text/plain',body:fs.readFileSync(f)}):r.fulfill({status:404});});const p=await c.newPage();const cdp=await c.newCDPSession(p);
await p.goto(url,{waitUntil:'load'});await p.evaluate(js);await p.waitForTimeout(3000);
await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(3000);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});await cdp.send('Profiler.start');
await p.evaluate(js);
for(let i=0;i<10;i++){await p.mouse.wheel(0,400);await p.waitForTimeout(250);}
await p.waitForTimeout(3000);
const {profile}=await cdp.send('Profiler.stop');
const byId={};for(const n of profile.nodes)byId[n.id]=n;const dt={};
for(let i=0;i<profile.samples.length;i++){dt[profile.samples[i]]=(dt[profile.samples[i]]||0)+(profile.timeDeltas[i]||0);}
const parent={};for(const n of profile.nodes)for(const ch of n.children||[])parent[ch]=n.id;
const incl={},self={};let tot=0;for(const id in dt){let cur=+id,seen=new Set(),g=false;while(cur!=null){const cf=byId[cur].callFrame;if(cf.url.endsWith('gzl.js')){g=true;const k=(cf.functionName||'(top)')+':'+cf.lineNumber;if(!seen.has(k)){incl[k]=(incl[k]||0)+dt[id]/1000;seen.add(k);}}cur=parent[cur];}
if(g){tot+=dt[id]/1000;const cf=byId[id].callFrame;const k=(cf.functionName||'(top)')+(cf.url.endsWith('gzl.js')?':'+cf.lineNumber:' [native]');self[k]=(self[k]||0)+dt[id]/1000;}}
const f=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,14).map(e=>e[1].toFixed(1)+'  '+e[0]).join('\n');
const zh=await p.evaluate(()=>(document.body.innerText.match(/[\u4e00-\u9fa5]/g)||[]).length);console.log('GZL total ms',tot.toFixed(1),'zh',zh);console.log('--inclusive\n'+f(incl));console.log('--self\n'+f(self));
await b.close();})();
