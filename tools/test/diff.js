const fs=require('fs');const r=JSON.parse(fs.readFileSync(process.argv[2]));
for(const n in r){const o=r[n].orig&&r[n].orig.ex.items||[],v=r[n].v3&&r[n].v3.ex.items||[],e=r[n].none&&r[n].none.ex.items||[];
 const cnt=a=>{const m=new Map();a.forEach(x=>m.set(x,(m.get(x)||0)+1));return m};const co=cnt(o),cv=cnt(v),ce=cnt(e);
 const onlyO=[],onlyV=[];for(const[k,c]of co)if((cv.get(k)||0)<c)onlyO.push(k);for(const[k,c]of cv)if((co.get(k)||0)<c)onlyV.push(k);
 const transO=o.filter(x=>!ce.has(x)).length;
 console.log(`== ${n}: orig ${o.length} items (${transO} changed vs none), v3 ${v.length}; only-orig ${onlyO.length}, only-v3 ${onlyV.length}`);
 if(process.argv[3])console.log('  O:',onlyO.slice(0,25).join(' | '),'\n  V:',onlyV.slice(0,25).join(' | '));}
