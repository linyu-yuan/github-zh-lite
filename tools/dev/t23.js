const {chromium,devices}=require('playwright');const fs=require('fs');
const js=fs.readFileSync('/workspace/gzl/out/github-zh-lite.user.js','utf8');const DIR='/workspace/gzl/out/dict/';
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPhone 13'],locale:'en-US'});
await c.route(/raw\.githubusercontent\.com\/linyu-yuan\/github-zh-lite\/main\/dict\/.*/,r=>{const nm=decodeURIComponent(r.request().url().split('/dict/')[1].split('?')[0]);fs.existsSync(DIR+nm)?r.fulfill({status:200,body:fs.readFileSync(DIR+nm)}):r.fulfill({status:404});});
await c.addInitScript({content:`document.addEventListener('DOMContentLoaded',function(){${js}\n})`});const p=await c.newPage();
await p.goto('https://github.com/trending',{waitUntil:'domcontentloaded'});await p.waitForTimeout(2500);
await p.evaluate(()=>{const d=document.createElement('div');d.innerHTML=`<select id=s1><option value="1m">1 month</option><option value="3m">3 months</option><option value="1y">1 year</option></select>
<select id=s2><option value="">Don't specify</option><option>they/them</option><option>she/her</option><option>he/him</option><option value="custom">Custom</option></select>
<select id=s3><option>Select a verified email to display</option></select><select id=s4><option>No Preference</option></select>
<input id=i1 type=submit value="Save Trending settings"><input id=i2 type=text value="Name"><input id=i3 readonly value="Assigned"><input id=i4 readonly value="reason:assign"><input id=i5 placeholder="Filter by…">
<input id=i6 readonly value="Participating"><input id=i7 readonly value="Team mentioned"><input id=i8 readonly value="Review requested">`;document.body.appendChild(d);});
await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(()=>({opts:[...document.querySelectorAll('#s1 option,#s2 option,#s3 option,#s4 option')].map(o=>o.text+'|'+o.value),inp:[...document.querySelectorAll('input[id^=i]')].map(i=>i.id+':'+i.value+'|ph='+(i.placeholder||''))})),null,1));await b.close();})();
