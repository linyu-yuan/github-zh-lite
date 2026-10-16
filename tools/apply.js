// 整理词库：1) 删除会造成中英混杂的单词/片段词条；2) 合并 tools/additions.json；
// 3) 可选：传入爬虫结果，把其他页面词库里已有译文的漏翻词条补进 _common（跨页面补全）。
// 用法：node tools/apply.js [crawl-result.json]
const fs = require('fs'), path = require('path');
const D = path.join(__dirname, '..', 'dict');
const add = JSON.parse(fs.readFileSync(path.join(__dirname, 'additions.json'), 'utf8')).groups;
const STOP = new Set(['and', 'or', 'to', 'by', 'on', 'of', 'in', 'for', 'with', 'the', 'from', 'at', 'as', 'is', 'a', 'an', 'not', 'are', 'was', 'be', 'if', 'than', 'this', 'that', 'into', 'via', 'per']);
// 只匹配句子片段（以标点/小写虚词开头或结尾、靠捕获组拼接英文）的正则规则
const FRAG = [/^\^?,/, /^\^?\(\[\^ \]\+\) and/, /^\^?to \(\[\^ \]\+\) and$/, /^\^?You and$/, /^\^?(and|or|by|to|on|in|of|with|for) /];
const files = fs.readdirSync(D).filter(f => f.endsWith('.json'));
const load = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
let delS = 0, delR = 0, addN = 0;
const dicts = {};
for (const f of files) {
  const d = dicts[f] = load(f), s = d.s || {};
  for (const k in s) if (STOP.has(k.trim().toLowerCase())) { delete s[k]; delS++; }
  if (d.r) { const n = d.r.length; d.r = d.r.filter(r => !FRAG.some(re => re.test(r[0]))); delR += n - d.r.length; if (!d.r.length) delete d.r; }
}
for (const g in add) {
  const G = add[g], re = new RegExp(G.pages);
  for (const f of files) {
    if (!re.test(f.replace(/\.json$/, ''))) continue;
    const d = dicts[f]; d.s = d.s || {};
    for (const k in G.s || {}) if (d.s[k] !== G.s[k]) { d.s[k] = G.s[k]; addN++; }
    if (G.r) { d.r = d.r || []; for (const r of G.r) if (!d.r.some(x => x[0] === r[0])) { d.r.unshift(r.length > 2 ? r : [r[0], r[1], (/^[A-Za-z][A-Za-z ,'-]{3,}/.exec(r[0]) || [''])[0]]); addN++; } }
    if (G.x) { d.x = Object.assign(d.x || {}, G.x); addN += Object.keys(G.x).length; }
  }
}
const crawl = process.argv[2];
let filled = 0;
if (crawl) {
  const all = {}; for (const f of files) { const s = dicts[f].s || {}; for (const k in s) if (!(k in all) && s[k] && /[\u4e00-\u9fa5]/.test(s[k])) all[k] = s[k]; }
  const c = dicts['_common.json'];
  for (const m of JSON.parse(fs.readFileSync(crawl, 'utf8')).untranslated) {
    const k = m.k.replace(/^@[\w-]+: /, '');
    if (all[k] && !c.s[k] && !STOP.has(k.toLowerCase())) { c.s[k] = all[k]; filled++; }
  }
}
for (const f of files) fs.writeFileSync(path.join(D, f), JSON.stringify(dicts[f]));
console.log({ removedStatic: delS, removedFragmentRules: delR, added: addN, filledFromOtherPages: filled });
