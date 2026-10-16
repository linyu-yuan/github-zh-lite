const {chromium,devices}=require('playwright');const fs=require('fs');
const S={v240:fs.readFileSync('/workspace/gzl/v240.user.js','utf8'),v250:fs.readFileSync('/workspace/github-zh-lite/github-zh-lite.user.js','utf8')};const DIR='/workspace/github-zh-lite/dict/';
const VARS=[['v2.4.0','v240',''],['A vis+defer','v250',"window.__GZL_MODE='vis';window.__GZL_DEFER=1;"],['B vis','v250',"window.__GZL_MODE='vis';window.__GZL_DEFER=0;"],['C color+defer','v250',"window.__GZL_MODE='color';window.__GZL_DEFER=1;"],['D color','v250',"window.__GZL_MODE='color';window.__GZL_DEFER=0;"]];
const urls=[['repo','https://github.com/maboloshi/github-chinese'],['issues','https://github.com/maboloshi/github-chinese/issues'],['explore','https://github.com/explore'],['profile','https://github.com/maboloshi']];
const PROBE=`(function(){var seen=new Map();window.__rev=0;window.__ts=[];
function hidden(){return !!document.getElementById('gzl-hide');}
function cnt(){var w=document.createTreeWalker(document.body,4),n,c=0;while(n=w.nextNode()){if(n.__zh===n.nodeValue&&/[\\u4e00-\\u9fa5]/.test(n.nodeValue))c++;}return c;}
function tick(t){if(document.body){var h=hidden();if(!h&&!__rev)__rev=t;if(!h){var w=document.createTreeWalker(document.body,4),n,H=innerHeight;while(n=w.nextNode()){var v=n.nodeValue;if(!/[A-Za-z]{2}/.test(v)||/[\\u4e00-\\u9fa5]/.test(v))continue;var p=n.parentElement;if(!p)continue;var r=p.getBoundingClientRect();if(r.bottom<0||r.top>H||r.width===0)continue;if(!seen.has(n))seen.set(n,t);}}}
if(t<12000)requestAnimationFrame(tick);}requestAnimationFrame(tick);setInterval(function(){if(document.body)__ts.push([performance.now(),cnt()])},100);
window.__rep=function(){var f=0;seen.forEach(function(t,n){if(n.isConnected&&/[\\u4e00-\\u9fa5]/.test(n.nodeValue)&&n.__zh===n.nodeValue)f++;});var fin=__ts.length?__ts[__ts.length-1][1]:0,t90=null;for(var i=0;i<__ts.length;i++)if(__ts[i][1]>=.9*fin&&fin){t90=Math.round(__ts[i][0]);break;}var e=performance.getEntriesByName('first-contentful-paint')[0];return {fcp:e?Math.round(e.startTime):0,reveal:Math.round(__rev),t90:t90,flash:f};};})();`;
(async()=>{const b=await chromium.launch();const rows=[];const REPS=+process.env.REPS||2;
for(const [n,u] of urls)for(const [name,src,pre] of VARS)for(let rep=0;rep<REPS;rep++){
 const c=await b.newContext({...devices['iPhone 13'],locale:'en-US'});
 await c.route(/raw\.githubusercontent\.com\/linyu-yuan\/github-zh-lite\/main\/dict\/.*/,r=>{const nm=decodeURIComponent(r.request().url().split('/dict/')[1].split('?')[0]);fs.existsSync(DIR+nm)?r.fulfill({status:200,contentType:'text/plain',body:fs.readFileSync(DIR+nm)}):r.fulfill({status:404});});
 await c.addInitScript({content:pre+S[src]});await c.addInitScript({content:PROBE});
 const p=await c.newPage();const cdp=await c.newCDPSession(p);
 await p.goto(u,{waitUntil:'load'});await p.waitForTimeout(2500);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
 await p.goto(u,{waitUntil:'domcontentloaded'});await p.waitForTimeout(6000);
 const r=await p.evaluate(()=>__rep());const banner=await p.evaluate(()=>!!document.querySelector('meta[name="apple-itunes-app"]'));
 rows.push({page:n,variant:name,rep,...r,bannerMeta:banner});await c.close();}
// average
const agg={};for(const r of rows){const k=r.page+'|'+r.variant;(agg[k]=agg[k]||[]).push(r);}
const out=Object.entries(agg).map(([k,a])=>{const m=f=>Math.round(a.reduce((s,x)=>s+(x[f]||0),0)/a.length);const [page,variant]=k.split('|');return {page,variant,fcp:m('fcp'),visible:m('reveal'),t90:m('t90'),flash:a.map(x=>x.flash).join('/'),banner:a.some(x=>x.bannerMeta)}});
console.table(out);fs.writeFileSync('/workspace/gzl/reveal.json',JSON.stringify({rows,out},null,1));await b.close();})();
