// 站内跳转（Turbo / React 路由）测试：从仓库首页点击“议题”“拉取请求”“操作”标签，比较原版与 v3 的结果
const pw=require('/workspace/pw/node_modules/playwright');const fs=require('fs');const ENG=process.argv[2]||'chromium';
const src=fs.readFileSync('/workspace/t3/run.js','utf8');
const UP=fs.readFileSync('/workspace/up/locals.js','utf8'),MAIN=fs.readFileSync('/workspace/up/main.user.js','utf8'),V3=fs.readFileSync('/workspace/up/out/github-zh-lite.user.js','utf8');
const GM=`var GM_addStyle=function(c){var s=document.createElement('style');s.textContent=c;(document.head||document.documentElement).appendChild(s)},GM_getValue=function(k,d){return d},GM_setValue=function(){},GM_registerMenuCommand=function(){return 1},GM_unregisterMenuCommand=function(){},GM_notification=function(){},GM_xmlhttpRequest=function(){};`;
const ORIG='(function(){function go(){'+GM+UP+'\n'+MAIN+'\n}if(document.documentElement)go();else{var o=new MutationObserver(function(){if(document.documentElement){o.disconnect();go();}});o.observe(document,{childList:true});}})();';
const EX=()=>{const out=[];const w=document.createTreeWalker(document.body,5);let n;while((n=w.nextNode())){if(n.nodeType===3){if(/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName))continue;const t=n.data.replace(/\s+/g,' ').trim();if(t&&/[A-Za-z\u4e00-\u9fa5]/.test(t))out.push(t);}else for(const a of ['placeholder','aria-label','title'])if(n.hasAttribute(a))out.push('@'+a+'='+n.getAttribute(a).trim());}return out;};
(async()=>{const b=await pw[ENG].launch();const R={};
 for(const v of ['orig','v3']){const ctx=await b.newContext({...pw.devices['iPhone 13'],locale:'en-US',timezoneId:'Asia/Shanghai'});
  await ctx.route(/raw\.githubusercontent\.com\/linyu-yuan\/github-zh-lite\/main\/dict\/.*/,r=>{const n=r.request().url().split('/dict/')[1];const f='/workspace/up/out/dict/'+n;fs.existsSync(f)?r.fulfill({status:200,headers:{'access-control-allow-origin':'*'},body:fs.readFileSync(f)}):r.fulfill({status:404});});
  await ctx.addInitScript({content:v==='orig'?ORIG:V3});const p=await ctx.newPage();
  await p.goto('https://github.com/maboloshi/github-chinese',{waitUntil:'load'});await p.waitForTimeout(4000);
  for(const [tab,path] of [['issues','/issues'],['pulls','/pulls'],['actions','/actions'],['code','/blob/gh-pages/README.md']]){
   const ok=await p.evaluate(path=>{const a=[...document.querySelectorAll('a[href]')].find(a=>a.getAttribute('href')==='/maboloshi/github-chinese'+path);if(a){a.click();return true}return false},path);
   if(!ok){console.log(v,tab,'no link');continue;}
   await p.waitForURL('**'+path+'*',{timeout:20000}).catch(()=>{});await p.waitForTimeout(5000);
   const it=await p.evaluate(EX);(R[tab]=R[tab]||{})[v]=it;
   await p.screenshot({path:`/workspace/t3/shots/nav-${ENG}-${v}-${tab}.png`});
   await p.goBack();await p.waitForTimeout(3000);
  }await ctx.close();}
 for(const t in R){const o=R[t].orig||[],x=R[t].v3||[];const so=new Set(o),sx=new Set(x);const a=o.filter(i=>!sx.has(i)),c=x.filter(i=>!so.has(i));console.log(ENG,'nav',t,'orig',o.length,'v3',x.length,'onlyOrig',a.length,'onlyV3',c.length,'\n O:',a.slice(0,15).join(' | '),'\n V:',c.slice(0,15).join(' | '));}
 await b.close();})();
