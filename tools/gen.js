const fs=require('fs');const d=require('./dict.json');const ex=require('./extra.json');
const S={};for(const k in d.s){if(d.s[k]!=='' )S[k]=d.s[k];}for(const k in ex){if(!(k in S))S[k]=ex[k];}
const R=[["^Good (morning|afternoon|evening)(?:,\\s*(.+?))?[!.]?$","",""]].concat(d.r.filter(r=>{try{new RegExp(r[0],r[1]);return true}catch(e){return false}}));
const tpl=fs.readFileSync('template.js','utf8');
const out=tpl.replace('/*DICT*/{}',JSON.stringify(S)).replace('/*RE*/[]',JSON.stringify(R.slice(1)));
fs.writeFileSync('github-zh-lite.user.js',out);console.log(Object.keys(S).length,R.length,(out.length/1024|0)+'KB');
