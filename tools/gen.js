const fs=require('fs');const V=process.argv[2]||'2.0.0';
let t=fs.readFileSync('template.js','utf8').split('__VER__').join(V);
t=t.replace('/*COMMON*/{}',()=>fs.readFileSync('out/common.json','utf8')).replace('/*CONF*/{}',()=>fs.readFileSync('out/conf.json','utf8')).replace('/*PAGES*/[]',()=>fs.readFileSync('out/pages.json','utf8'));
fs.writeFileSync('out/github-zh-lite.user.js',t);console.log((Buffer.byteLength(t)/1024).toFixed(1)+'KB');
