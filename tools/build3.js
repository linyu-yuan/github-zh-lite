// 用法：node tools/build3.js <gen3 输出目录> <版本> <上游版本>
const fs=require('fs'),path=require('path');const [o,V,UP]=process.argv.slice(2);
let t=fs.readFileSync(path.join(__dirname,'template3.js'),'utf8').split('__VER__').join(V).split('__UPVER__').join(UP);
t=t.replace('/*CONF*/{}',()=>fs.readFileSync(path.join(o,'conf.json'),'utf8')).replace('/*COMMON*/{}',()=>{const c=JSON.parse(fs.readFileSync(path.join(o,'conf.json'),'utf8')).common;return fs.readFileSync(path.join(o,'dict',c+'.json'),'utf8');}).replace('/*FN*/',()=>fs.readFileSync(path.join(o,'fn.js'),'utf8').split('\n').join('\n  '));
fs.writeFileSync(path.join(o,'github-zh-lite.user.js'),t);console.log((Buffer.byteLength(t)/1024).toFixed(1)+'KB');
