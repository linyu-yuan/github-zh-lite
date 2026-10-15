const fs=require('fs'),vm=require('vm');const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('locals.js','utf8')+';this.__I=I18N;',ctx);
const L=ctx.__I['zh-CN'];const G={};for(const k in L){const s=L[k]&&L[k].static;if(s)for(const a in s)if(typeof s[a]==='string'&&s[a]&&!(a in G))G[a]=s[a];}
const miss=JSON.parse(fs.readFileSync('miss-all.json'));const hit={},rest=[];
for(const m of miss){if(G[m.k])hit[m.k]=G[m.k];else rest.push(m);}
fs.writeFileSync('gap-upstream.json',JSON.stringify(hit,null,1));
rest.sort((a,b)=>b.n-a.n);fs.writeFileSync('gap-rest.txt',rest.map(m=>m.n+'\t'+m.k+'\t'+m.g).join('\n'));
console.log('upstream-fill',Object.keys(hit).length,'rest',rest.length,'rest n>=2',rest.filter(m=>m.n>=2).length);
