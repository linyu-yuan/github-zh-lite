const fs=require('fs'),vm=require('vm');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/locals.js','utf8')+';this.__I=I18N;',ctx);
const I=ctx.__I,L=I['zh-CN'];const isRe=x=>Object.prototype.toString.call(x)==='[object RegExp]';
function lit(src){let s=src.replace(/^\^/,'');let m=/^((?:[A-Za-z0-9 ,'@#&-]|\\[.()\[\]?+*\/$-])+)/.exec(s);if(!m)return '';let l=m[1].replace(/\\(.)/g,'$1');
 // drop last char if followed by quantifier
 const rest=s.slice(m[1].length);if(/^[?*{]/.test(rest))l=l.slice(0,-1);return l.trim().length>=3?l:'';}
function rules(arr){const out=[];let fn=0;for(const r of arr||[]){if(!isRe(r[0]))continue;if(typeof r[1]!=='string'){fn++;continue;}if(r[1]==='end')continue;try{new RegExp(r[0].source,r[0].flags.replace('g',''))}catch(e){continue}out.push([r[0].source,r[0].flags.replace('g',''),r[1],lit(r[0].source)]);}return [out,fn];}
const strs=o=>{const s={};for(const k in o||{})if(typeof o[k]==='string'&&o[k]!==''&&k.trim())s[k]=o[k];return s;};
const extra=JSON.parse(fs.readFileSync('extra.json','utf8'));
const pub=strs(L.public.static);for(const k in extra)if(!(k in pub))pub[k]=extra[k];
const [pubR]=rules(L.public.regexp);
const common={s:pub,r:pubR,t:strs(L.title&&L.title.static)};
fs.mkdirSync('out/dict',{recursive:true});const list={};let tot=0,fnAll=0;
for(const k of Object.keys(L)){if(['public','title'].includes(k))continue;const p=L[k];if(!p||typeof p!=='object')continue;
 const s=strs(p.static);for(const x in s)if(pub[x]===s[x])delete s[x];const [r,fn]=rules(p.regexp);fnAll+=fn;
 const t=Object.assign({},strs(p.title&&p.title.static));const name=k.replace(/\//g,'__');
 const j=JSON.stringify({s,r:r.slice(0,150),t});fs.writeFileSync('out/dict/'+name+'.json',j);list[k]=j.length;tot+=j.length;}
const conf={p:I.conf.rePagePath.source,r:I.conf.rePagePathRepo.source,o:I.conf.rePagePathOrg.source};
fs.writeFileSync('out/common.json',JSON.stringify(common));fs.writeFileSync('out/conf.json',JSON.stringify(conf));fs.writeFileSync('out/pages.json',JSON.stringify(Object.keys(list)));
console.log('common',JSON.stringify(common).length,'pages',Object.keys(list).length,'tot',tot,'fnskipped',fnAll);
console.log(Object.entries(list).sort((a,b)=>b[1]-a[1]).slice(0,8));
