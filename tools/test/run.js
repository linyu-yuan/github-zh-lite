const pw=require('/workspace/pw/node_modules/playwright');const fs=require('fs');
const ENG=process.argv[2]||'chromium', ONLY=process.argv[3];
const UP=fs.readFileSync('/workspace/up/locals.js','utf8'),MAIN=fs.readFileSync('/workspace/up/main.user.js','utf8'),V3raw=fs.readFileSync('/workspace/up/out/github-zh-lite.user.js','utf8');const V3='(function(){var __t=performance.now();'+V3raw+'\n;window.__gzlStart=performance.now()-__t;})();\n//# sourceURL=gzl-v3.js';
const GM=`var GM_addStyle=function(c){var s=document.createElement('style');s.textContent=c;(document.head||document.documentElement).appendChild(s)},GM_getValue=function(k,d){return d},GM_setValue=function(){},GM_registerMenuCommand=function(){return 1},GM_unregisterMenuCommand=function(){},GM_notification=function(){},GM_xmlhttpRequest=function(){};`;
const ORIG='(function(){function go(){var __t=performance.now();'+GM+UP+'\n'+MAIN+'\n;window.__gzlStart=performance.now()-__t;}if(document.documentElement)go();else{var o=new MutationObserver(function(){if(document.documentElement){o.disconnect();go();}});o.observe(document,{childList:true});}})();\n//# sourceURL=gzl-orig.js';
const pages=[['repo','https://github.com/maboloshi/github-chinese'],['code','https://github.com/maboloshi/github-chinese/blob/gh-pages/README.md'],['tree','https://github.com/maboloshi/github-chinese/tree/gh-pages'],['issues','https://github.com/maboloshi/github-chinese/issues'],['pulls','https://github.com/maboloshi/github-chinese/pulls'],['actions','https://github.com/maboloshi/github-chinese/actions'],['releases','https://github.com/maboloshi/github-chinese/releases'],['profile','https://github.com/maboloshi'],['explore','https://github.com/explore'],['search','https://github.com/search?q=chinese&type=repositories'],['issue','https://github.com/maboloshi/github-chinese/issues/1'],['gist','https://gist.github.com/octocat'],['topics','https://github.com/topics'],['notfound','https://github.com/this/does-not-exist-zz']].filter(p=>!ONLY||ONLY.split(',').includes(p[0]));
const EXTRACT=()=>{const out=[];const w=document.createTreeWalker(document.body,5);let n;while((n=w.nextNode())){if(n.nodeType===3){if(n.parentNode&&/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName))continue;const t=n.data.replace(/\s+/g,' ').trim();if(t&&/[A-Za-z\u4e00-\u9fa5]/.test(t))out.push(t);}else for(const a of ['placeholder','aria-label','title','value','data-confirm','label'])if(n.hasAttribute(a)&&n.getAttribute(a).trim())out.push('@'+a+'='+n.getAttribute(a).replace(/\s+/g,' ').trim());}return {items:out,title:document.title,banner:!!document.querySelector('meta[name="apple-itunes-app"]')};};
(async()=>{
 const b=await pw[ENG].launch();const dev=pw.devices['iPhone 13'];
 const res={};
 for(const variant of (process.env.VARS||'none,orig,v3').split(',')){
  const ctx=await b.newContext({...(ENG==='webkit'?dev:{...dev,defaultBrowserType:undefined}),locale:'en-US',timezoneId:'Asia/Shanghai'});
  await ctx.route(/raw\.githubusercontent\.com\/linyu-yuan\/github-zh-lite\/main\/dict\/.*/,r=>{const n=r.request().url().split('/dict/')[1].split('?')[0];const f='/workspace/up/out/dict/'+n;fs.existsSync(f)?r.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:'text/plain',body:fs.readFileSync(f)}):r.fulfill({status:404});});
  await ctx.addInitScript({content:`window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())__lt.push(e.duration)}).observe({type:'longtask'})}catch(e){};window.__err=[];addEventListener('error',e=>__err.push(String(e.message)));window.__gzlT=0;window.__gzlMax=0;window.__gzlN=0;(function(){function mine(){return String(new Error().stack).indexOf('gzl-')!==-1}function wrap(f){if(typeof f!=='function')return f;return function(){var t=performance.now();try{return f.apply(this,arguments)}finally{var d=performance.now()-t;__gzlT+=d;__gzlN++;if(d>__gzlMax)__gzlMax=d;}}}
var MO=window.MutationObserver;window.MutationObserver=function(cb){return new MO(mine()?wrap(cb):cb)};window.MutationObserver.prototype=MO.prototype;
var st=window.setTimeout;window.setTimeout=function(f,d){return st.call(window,mine()?wrap(f):f,d)};
if(window.requestIdleCallback){var ric=window.requestIdleCallback;window.requestIdleCallback=function(f,o){return ric.call(window,mine()?wrap(f):f,o)}}
var ael=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(t,f,o){return ael.call(this,t,(typeof f==='function'&&mine())?wrap(f):f,o)};
var pt=Promise.prototype.then;Promise.prototype.then=function(a,b){if(mine()){a=wrap(a);b=wrap(b)}return pt.call(this,a,b)};})();`});
  if(variant==='orig')await ctx.addInitScript({content:ORIG});
  if(variant==='v3')await ctx.addInitScript({content:V3});
  const p=await ctx.newPage();let cdp=null;
  if(ENG==='chromium'){cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});}
  // 预热（v3 词库缓存 / HTTP 缓存）
  for(const [n,u] of pages){await p.goto(u,{waitUntil:'domcontentloaded',timeout:90000}).catch(()=>{});await p.waitForTimeout(1500);}
  for(const [n,u] of pages){
   const t0=Date.now();await p.goto(u,{waitUntil:'load',timeout:90000}).catch(e=>console.log('goto',n,e.message));
   await p.waitForTimeout(6000);
   // 点击响应：在页面中部空白处点击并测量事件延迟
   const lat=await p.evaluate(()=>new Promise(r=>{let t;addEventListener('pointerdown',e=>{t=performance.now()-e.timeStamp},{once:true,capture:true});setTimeout(()=>r(t),1500)})).catch(()=>null);
   const ex=await p.evaluate(EXTRACT).catch(e=>({err:e.message}));
   const m=await p.evaluate(()=>({st:window.__gzlStart||0,js:__gzlT+(window.__gzlStart||0),jsmax:Math.max(__gzlMax,window.__gzlStart||0),lt:__lt.reduce((a,b)=>a+b,0),ltn:__lt.length,tbt:__lt.reduce((a,b)=>a+Math.max(0,b-50),0),max:Math.max(0,...__lt),err:__err.slice(0,5),lang:document.documentElement.lang})).catch(()=>({}));
   if(ENG==='chromium'||variant!=='none'){fs.mkdirSync('/workspace/t3/shots',{recursive:true});await p.screenshot({path:`/workspace/t3/shots/${ENG}-${variant}-${n}.png`}).catch(()=>{});}
   (res[n]=res[n]||{})[variant]={...m,ex};
   console.log(ENG,variant,n,JSON.stringify({start:Math.round(m.st),js:Math.round(m.js),jsmax:Math.round(m.jsmax),lt:Math.round(m.lt),tbt:Math.round(m.tbt),max:Math.round(m.max),items:ex.items&&ex.items.length,title:ex.title,banner:ex.banner,err:m.err}));
  }
  await ctx.close();
 }
 fs.writeFileSync(`/workspace/t3/res-${ENG}${process.env.VARS?'-'+process.env.VARS:''}.json`,JSON.stringify(res));await b.close();
})();
