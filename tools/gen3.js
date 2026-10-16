// 用法：node tools/gen3.js <upstream locals.js> <outdir>
// 把上游 locals.js 原样拆分为：内联函数表 + 按页面的 JSON 词库。不增删任何词条。
const fs=require('fs'),vm=require('vm'),path=require('path');
const babel=require('/workspace/bt/node_modules/@babel/core');
const [src,out]=process.argv.slice(2);
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(src,'utf8')+';this.I=I18N',c);
const I=c.I,L=I['zh-CN'];
const isRe=x=>Object.prototype.toString.call(x)==='[object RegExp]';
const FN=[],FNI=new Map();
function fnId(f){const s=f.toString();if(!FNI.has(s)){FNI.set(s,FN.length);FN.push(s);}return FNI.get(s);}
function rules(a){return (a||[]).map(r=>{if(!isRe(r[0])){if(typeof r[0]!=='string')throw new Error('bad '+r);return [r[0],null,typeof r[1]==='function'?{f:fnId(r[1])}:r[1]];}return [r[0].source,r[0].flags,typeof r[1]==='function'?{f:fnId(r[1])}:r[1]];});}
const files={},pageFile={},ids=new Map();
function emit(sec){if(ids.has(sec))return ids.get(sec);const name='__TMP'+ids.size;ids.set(sec,name);
 const o={s:sec.static||{},r:rules(sec.regexp)};
 if(sec.title){o.ts=sec.title.static||{};o.tr=rules(sec.title.regexp);}
 if(sec.selector)o.sel=sec.selector;
 if(sec['time-regexp'])o.tm=rules(sec['time-regexp']);
 for(const k of Object.keys(sec))if(!['static','regexp','title','selector','time-regexp'].includes(k))throw new Error('unknown key '+k);
 files[name]=o;return name;}
const common=emit(L.public);
for(const k of Object.keys(L)){if(k==='public')continue;pageFile[k]=emit(L[k]);}
// 头部补丁需要跨全部分区查找：按 Object.values 顺序先到先得（与上游 findStaticGlobalNavLabel 一致）
const nav={s:{},r:[]};
for(const sec of Object.values(L)){if(!sec)continue;const st=sec.static||{};for(const k in st){const v=st[k];if(typeof v==='string'&&v&&v!==k&&!(k in nav.s)&&k.length<=120)nav.s[k]=v;}
 nav.r.push(...rules(sec.regexp));}
files['_nav']=nav;
fs.mkdirSync(path.join(out,'dict'),{recursive:true});
for(const f of fs.readdirSync(path.join(out,'dict')))fs.unlinkSync(path.join(out,'dict',f));
const crypto=require('crypto');const rename={};let tot=0;
for(const n in files){const j=JSON.stringify(files[n]);tot+=j.length;const h=(n==='_nav'?'nav-':'d-')+crypto.createHash('sha1').update(j).digest('hex').slice(0,12);rename[n]=h;fs.writeFileSync(path.join(out,'dict',h+'.json'),j);}
const R=n=>rename[n];
// 函数表转 ES5
const fnSrc='var FN=['+FN.map(s=>/^(function|\(|[\w$]+\s*=>)/.test(s)&&!/^function/.test(s)?'('+s+')':'('+s.replace(/^function\s*[\w$]*\s*\(/,'function (')+')').join(',\n')+'];';
const es5=babel.transformSync(fnSrc,{presets:[[require.resolve('/workspace/bt/node_modules/@babel/preset-env'),{targets:{ie:'11'},modules:false}]],sourceType:'script',compact:false,comments:false}).code;
const conf={p:I.conf.rePagePath.source,r:I.conf.rePagePathRepo.source,o:I.conf.rePagePathOrg.source,
 cd:I.conf.characterDataPage,ign:I.conf.ignoreSelectorPage,ignM:I.conf.ignoreMutationSelectorPage,nav:I.conf.reactGlobalNavLabels,
 common:R(common),navFile:R('_nav'),pages:Object.fromEntries(Object.entries(pageFile).map(([k,v])=>[k,R(v)]))};
fs.writeFileSync(path.join(out,'conf.json'),JSON.stringify(conf));
fs.writeFileSync(path.join(out,'fn.js'),es5.replace(/^"use strict";\s*/,''));
console.log('files',Object.keys(files).length,'total',tot,'fns',FN.length,'confKB',(JSON.stringify(conf).length/1024).toFixed(1),'navKB',(JSON.stringify(nav).length/1024).toFixed(0),'commonKB',(JSON.stringify(files[common]).length/1024).toFixed(0));
