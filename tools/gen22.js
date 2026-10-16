const fs=require('fs');const V=process.argv[2]||'2.2.0';const DEV=process.argv[3]==='dev';
let t=fs.readFileSync('template22.js','utf8').split('__VER__').join(V);
t=t.replace('/*CONF*/{}',()=>fs.readFileSync('out/conf.json','utf8')).replace('/*PAGES*/[]',()=>fs.readFileSync('out/pages.json','utf8'));
if(DEV){t=t.replace('function miss() {}',"function miss(k) { var M = window.__gzlMiss || (window.__gzlMiss = {}); if (k.length < 2 || k.length > 80 || !ALPHA2.test(k)) return; var g = page.type || loadingType || 'other'; (M[g] || (M[g] = {}))[k] = location.pathname; }");
 t=t.replace("var DICT_URL = 'https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/dict/';","var DICT_URL = window.__GZL_DICT_URL || 'https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/dict/';");}
fs.mkdirSync('out/dict',{recursive:true});fs.copyFileSync('out/common.json','out/dict/_common.json');
const f=DEV?'out/dev.user.js':'out/github-zh-lite.user.js';fs.writeFileSync(f,t);console.log(f,(Buffer.byteLength(t)/1024).toFixed(1)+'KB');
