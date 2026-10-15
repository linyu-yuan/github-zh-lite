const fs=require('fs');const vm=require('vm');
const src=fs.readFileSync('locals.js','utf8')+';this.__I=I18N;';
const ctx={};vm.createContext(ctx);vm.runInContext(src,ctx);
const L=ctx.__I['zh-CN'];const S={};const R=[];const seen=new Set();let fn=0;
for(const k of Object.keys(L)){const p=L[k];if(!p||seen.has(p))continue;seen.add(p);
 if(p.static)for(const [a,b] of Object.entries(p.static)){if(typeof b==='string'&&a.trim()&&!(a in S))S[a]=b;}
 for(const key of ['regexp']) if(Array.isArray(p[key]))for(const r of p[key]){if(!(Object.prototype.toString.call(r[0])==="[object RegExp]"))continue;if(typeof r[1]!=='string'){fn++;continue;}if(r[1]==='end')continue;R.push([r[0].source,r[0].flags.replace('g',''),r[1]]);}
}
const time=(L.public['time-regexp']||[]).filter(r=>Object.prototype.toString.call(r[0])==="[object RegExp]"&&typeof r[1]==='string').map(r=>[r[0].source,r[0].flags,r[1]]);
const ru=[];const rs=new Set();for(const r of time.concat(R)){const k=r.join('\u0000');if(!rs.has(k)){rs.add(k);ru.push(r);}}
fs.writeFileSync('dict.json',JSON.stringify({s:S,r:ru}));
console.log(Object.keys(S).length,ru.length,'fnskipped',fn,fs.statSync('dict.json').size);
