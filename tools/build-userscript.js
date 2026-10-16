// 由 tools/src.user.js（带注释的可读源码）生成发布用的 github-zh-lite.user.js：去掉注释行与行尾注释，检查行长与体积。
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'src.user.js'), 'utf8');
const i = src.indexOf('// ==/UserScript==') + '// ==/UserScript=='.length;
const body = src.slice(i).split('\n').filter(l => !/^\s*\/\//.test(l)).map(l => l.replace(/([;{}])\s+\/\/\s.*$/, '$1').replace(/\s+$/, '')).join('\n');
const out = src.slice(0, i) + body;
new Function(out); // 语法检查
const long = out.split('\n').filter(l => l.length > 500).length;
fs.writeFileSync(path.join(__dirname, '..', 'github-zh-lite.user.js'), out);
console.log('bytes', Buffer.byteLength(out), 'lines>500', long);
