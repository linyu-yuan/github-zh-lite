const {chromium,devices}=require('playwright');const fs=require('fs');
const js=fs.readFileSync('/workspace/gzl/out/github-zh-lite.user.js','utf8');const DIR='/workspace/gzl/out/dict/';
(async()=>{const b=await chromium.launch();
for(const w of ['none','v23'])for(const u of ['https://github.com/maboloshi/github-chinese','https://github.com/maboloshi/github-chinese/issues','https://github.com/explore','https://github.com/maboloshi']){
const c=await b.newContext({...devices['iPhone 13'],locale:'en-US'});
await c.route(/raw\.githubusercontent\.com\/linyu-yuan\/github-zh-lite\/main\/dict\/.*/,r=>{const nm=decodeURIComponent(r.request().url().split('/dict/')[1].split('?')[0]);fs.existsSync(DIR+nm)?r.fulfill({status:200,body:fs.readFileSync(DIR+nm)}):r.fulfill({status:404});});
if(w==='v23')await c.addInitScript({content:js});const p=await c.newPage();const errs=[];
p.on('console',m=>{if(m.type()==='error'||/hydrat|#418|#423|#425/i.test(m.text()))errs.push(m.text().slice(0,90));});p.on('pageerror',e=>errs.push('PE '+e.message.slice(0,90)));
await p.goto(u,{waitUntil:'load'});await p.waitForTimeout(2500);
// soft nav click
let nav='';try{const t=Date.now();await p.locator('a[href="/maboloshi/github-chinese/pulls"], a[href="/explore"], header a[href="/"]').first().click({timeout:5000});await p.waitForLoadState('domcontentloaded');await p.waitForTimeout(1500);nav=(Date.now()-t-1500)+'ms '+(await p.evaluate(()=>(document.body.innerText.match(/[\u4e00-\u9fa5]/g)||[]).length));}catch(e){nav='err'}
console.log(w,u.slice(19),'errs:',errs.filter(e=>/hydrat|#418|#423|#425|PE/i.test(e)).length,JSON.stringify(errs.slice(0,3)),'nav',nav);await c.close();}
await b.close();})();
