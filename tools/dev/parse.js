const {chromium,devices}=require('playwright');const fs=require('fs');
const a=fs.readFileSync('/workspace/github-zh-lite/dict/_common.json','utf8'),b2=fs.readFileSync('/workspace/github-zh-lite/dict/repository__issues.json','utf8');
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPhone 13']});const p=await c.newPage();await p.goto('https://github.com/robots.txt');const cdp=await c.newCDPSession(p);
await p.evaluate(([a,b])=>{localStorage.setItem('x1',a);localStorage.setItem('x2',b)},[a,b2]);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
console.log(await p.evaluate(()=>{const r=[];for(let i=0;i<5;i++){let t=performance.now();const s1=localStorage.getItem('x1'),s2=localStorage.getItem('x2');const t1=performance.now();JSON.parse(s1);const t2=performance.now();JSON.parse(s2);const t3=performance.now();r.push([t1-t,t2-t1,t3-t2].map(x=>x.toFixed(1)).join('/'))}return r.join('  ')}));await b.close();})();
