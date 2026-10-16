// 用法：node tools/build3.js <gen3 输出目录> <版本> <上游版本>
const fs=require('fs'),path=require('path');const [o,V,UP]=process.argv.slice(2);
let t=fs.readFileSync(path.join(__dirname,'template3.js'),'utf8').split('__VER__').join(V).split('__UPVER__').join(UP);
const cj=fs.readFileSync(path.join(o,'conf.json'),'utf8');const cf='conf-'+require('crypto').createHash('sha1').update(cj).digest('hex').slice(0,12);fs.writeFileSync(path.join(o,'dict',cf+'.json'),cj);
t=t.replace('/*CONF*/{}',()=>JSON.stringify({f:cf})).replace('/*COMMON*/{}',()=>{const c=JSON.parse(fs.readFileSync(path.join(o,'conf.json'),'utf8')).common;return fs.readFileSync(path.join(o,'dict',c+'.json'),'utf8');}).replace('/*FN*/',()=>fs.readFileSync(path.join(o,'fn.js'),'utf8').split('\n').join('\n  '));
const hi=t.indexOf('// ==/UserScript==')+18;const head=t.slice(0,hi);
const min=require('/workspace/bt/node_modules/terser').minify_sync?null:null;
const {execFileSync}=require('child_process');fs.writeFileSync('/tmp/gzl-body.js',t.slice(hi));
const body=execFileSync('/workspace/bt/node_modules/.bin/terser',['/tmp/gzl-body.js','--ecma','5','-c','-m','--comments','/^!/','--format','max_line_len=500,ascii_only=false']).toString();
t=head+'\n'+body;fs.writeFileSync(path.join(o,'github-zh-lite.user.js'),t);console.log((Buffer.byteLength(t)/1024).toFixed(1)+'KB');
