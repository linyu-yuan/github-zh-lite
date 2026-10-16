const pw=require('/workspace/pw/node_modules/playwright');const fs=require('fs');
const V3=fs.readFileSync('/workspace/up/out/github-zh-lite.user.js','utf8'),ORIG=fs.readFileSync('/workspace/t3/orig.js','utf8');
const pages=[['repo','https://github.com/maboloshi/github-chinese'],['code','https://github.com/maboloshi/github-chinese/blob/gh-pages/README.md'],['issues','https://github.com/maboloshi/github-chinese/issues'],['pulls','https://github.com/maboloshi/github-chinese/pulls'],['actions','https://github.com/maboloshi/github-chinese/actions'],['releases','https://github.com/maboloshi/github-chinese/releases'],['profile','https://github.com/maboloshi'],['explore','https://github.com/explore'],['search','https://github.com/search?q=chinese&type=repositories'],['issue','https://github.com/maboloshi/github-chinese/issues/1'],['gist','https://gist.github.com/octocat']];
const EX=()=>{const out=[];const w=document.createTreeWalker(document.body,5);let n;while((n=w.nextNode())){if(n.nodeType===3){if(/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName))continue;const t=n.data.replace(/\s+/g,' ').trim();if(t&&/[A-Za-z\u4e00-\u9fa5]/.test(t))out.push(t);}else for(const a of ['placeholder','aria-label','title'])if(n.hasAttribute(a)&&n.getAttribute(a).trim())out.push('@'+a+'='+n.getAttribute(a).trim());}return out;};
const to=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]);
(async()=>{const b=await pw.webkit.launch();const R={};
for(const v of ['orig','v3']){const ctx=await b.newContext({...pw.devices['iPhone 13'],locale:'en-US',timezoneId:'Asia/Shanghai'});
 await ctx.route(/raw\.githubusercontent\.com\/linyu-yuan.*/,r=>{const n=r.request().url().split('/dict/')[1];const f='/workspace/up/out/dict/'+n;fs.existsSync(f)?r.fulfill({status:200,headers:{'access-control-allow-origin':'*'},body:fs.readFileSync(f)}):r.fulfill({status:404})});
 await ctx.addInitScript({content:v==='v3'?V3:ORIG});
 for(const [n,u] of pages){const p=await ctx.newPage();const t0=Date.now();let st='ok';
  try{await p.goto(u,{waitUntil:'domcontentloaded',timeout:30000});}catch(e){st='goto-timeout';}
  await p.waitForTimeout(5000);
  let probe=null;try{const t=Date.now();await to(p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>r(1)))),8000);probe=Date.now()-t;}catch(e){st+=' FROZEN';}
  let it=[];try{it=await to(p.evaluate(EX),8000);}catch(e){}
  await to(p.screenshot({path:`/workspace/t3/shots/webkit-${v}-${n}.png`}),8000).catch(()=>{});
  (R[n]=R[n]||{})[v]=it;console.log('webkit',v,n,st,'probe',probe,'items',it.length);
  await to(p.close(),5000).catch(()=>{});}
 await ctx.close().catch(()=>{});}
for(const n in R){const o=R[n].orig||[],x=R[n].v3||[];const so=new Set(o),sx=new Set(x);console.log('diff',n,'orig',o.length,'v3',x.length,'onlyO',o.filter(i=>!sx.has(i)).slice(0,6).join(' | '),'|| onlyV',x.filter(i=>!so.has(i)).slice(0,6).join(' | '));}
fs.writeFileSync('res-wk.json',JSON.stringify(R));await b.close();})();
