// 覆盖率爬虫：用 iPhone 视口加载大量公开 GitHub 页面，注入脚本后统计仍为英文的界面文字与中英混杂句子。
// 用法：npm i playwright && npx playwright install chromium
//       node tools/crawl.js [脚本路径] [词库目录] [输出.json] [截图目录]
// 词库请求（raw.githubusercontent.com/.../dict/*.json）被拦截并改用本地 dict/ 目录，方便在推送前验证。
const path = require('path'), fs = require('fs');
const { chromium, devices } = require(process.env.PW || 'playwright');
const ROOT = path.join(__dirname, '..');
const SCRIPT = process.argv[2] || path.join(ROOT, 'github-zh-lite.user.js');
const DICT = process.argv[3] || path.join(ROOT, 'dict');
const OUT = process.argv[4] || 'crawl-result.json';
const SHOTS = process.argv[5] || '';
const G = 'https://github.com';
const repos = ['microsoft/vscode', 'facebook/react', 'torvalds/linux', 'cli/cli'];
const urls = [];
const [V, R, L, C] = repos.map(r => G + '/' + r);
urls.push(V, V + '/tree/main/src', V + '/blob/main/README.md', V + '/blame/main/README.md', V + '/commits/main', V + '/commit/HEAD',
  V + '/branches', V + '/tags', V + '/releases', V + '/issues', V + '/issues/1', V + '/pulls', V + '/pulls?q=is%3Apr+is%3Aclosed',
  V + '/labels', V + '/milestones', V + '/actions', V + '/projects', V + '/wiki', V + '/security', V + '/security/policy',
  V + '/pulse', V + '/graphs/contributors', V + '/graphs/commit-activity', V + '/graphs/code-frequency', V + '/network/dependencies',
  V + '/forks', V + '/stargazers', V + '/watchers', V + '/activity', V + '/discussions', V + '/compare', V + '/deployments',
  R, R + '/pull/1', R + '/pull/1/files', R + '/pull/1/commits', R + '/pull/1/checks', R + '/issues?q=is%3Aissue+is%3Aclosed', R + '/releases/latest',
  R + '/community', R + '/network', R + '/graphs/community', R + '/actions/workflows', R + '/packages', R + '/contribute',
  L, L + '/tree/master/kernel', L + '/blob/master/README', L + '/commits/master', L + '/pulls',
  C, C + '/discussions', C + '/actions', C + '/releases/tag/v2.0.0', C + '/issues/new/choose', C + '/security/advisories', C + '/pull/1',
  G + '/torvalds', G + '/torvalds?tab=repositories', G + '/torvalds?tab=stars', G + '/torvalds?tab=followers', G + '/torvalds?tab=following',
  G + '/gaearon?tab=projects', G + '/sindresorhus?tab=packages', G + '/sindresorhus/sponsoring', G + '/users/torvalds/projects',
  G + '/microsoft', G + '/orgs/microsoft/repositories', G + '/orgs/microsoft/people', G + '/orgs/microsoft/teams', G + '/orgs/github/projects',
  G + '/explore', G + '/topics', G + '/topics/javascript', G + '/trending', G + '/trending/developers', G + '/collections', G + '/collections/machine-learning',
  G + '/marketplace', G + '/marketplace?type=actions', G + '/marketplace/actions/setup-node-js-environment', G + '/sponsors', G + '/sponsors/explore', G + '/sponsors/sindresorhus',
  G + '/search?q=react&type=repositories', G + '/search?q=react&type=code', G + '/search?q=react&type=issues', G + '/search?q=react&type=pullrequests',
  G + '/search?q=react&type=discussions', G + '/search?q=react&type=users', G + '/search?q=react&type=commits', G + '/search?q=react&type=topics',
  G + '/search?q=react&type=wikis', G + '/search?q=react&type=marketplace', G + '/search/advanced',
  G + '/login', G + '/signup', G + '/password_reset', G + '/notifications', G + '/settings/profile', G + '/new', G + '/features', G + '/features/copilot',
  G + '/pricing', G + '/enterprise', G + '/security', G + '/team', G + '/about', G + '/readme', G + '/sitemap', G + '/education',
  'https://gist.github.com/', 'https://gist.github.com/discover', 'https://gist.github.com/torvalds', G + '/this-page-does-not-exist-404x');
const CJK = /[\u4e00-\u9fa5]/;
(async () => {
  const js = fs.readFileSync(SCRIPT, 'utf8');
  const b = await chromium.launch();
  const c = await b.newContext({ ...devices['iPhone 13'], locale: 'en-US' });
  await c.route(/raw\.githubusercontent\.com\/[^/]+\/github-zh-lite\/main\/dict\/.*/, r => {
    const n = decodeURIComponent(r.request().url().split('/dict/')[1].split('?')[0]), f = path.join(DICT, n);
    fs.existsSync(f) ? r.fulfill({ status: 200, contentType: 'application/json', body: fs.readFileSync(f) }) : r.fulfill({ status: 404, body: '' });
  });
  if (!SHOTS) await c.route(/\.(png|jpe?g|gif|webp|svg|woff2?|mp4)(\?|$)/, r => r.abort()); // 不截图时不加载图片字体，加快速度
  await c.route(/(collector|api)\.github\.com|google-analytics/, r => r.abort());
  await c.addInitScript({ content: 'window.__gzlDebug=1;' });
  // 在 DOMContentLoaded 时注入（与 document-start 的翻译结果相同；本机负载高时 document-start 注入会显著拖慢 Chromium 解析）
  await c.addInitScript({ content: process.env.EARLY ? js : 'document.addEventListener("DOMContentLoaded",function(){' + js + '\n});' });
  const all = {}, mixed = {}, perPage = [];
  const CONC = +process.env.CONC || 2; let next = 0;
  await Promise.all(Array.from({ length: CONC }, async () => { const p = await c.newPage(); while (next < urls.length) { const u = urls[next++]; await visit(p, u); } }));
  async function visit(p, u) {
    try {
      for (let i = 0; ; i++) { // 网络不稳时重试一次（含 Fastly 错误页）
        try { await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 90000 }); } catch (e) { if (i) throw e; await p.waitForTimeout(3000); continue; }
        if (!/Fastly error|Unicorn!/.test(await p.evaluate(() => document.body ? document.body.innerText.slice(0, 300) : '')) || i) break;
        await p.waitForTimeout(3000);
      }
      await p.waitForTimeout(3500);
            const r = await p.evaluate(() => {
        const D = window.__gzlDbg, miss = {}, mix = {}, ALPHA2 = /[A-Za-z]{2}/, CJK = /[\u4e00-\u9fa5]/;
        const vis = e => { try { return e.checkVisibility ? e.checkVisibility({ visibilityProperty: true }) : e.getClientRects().length > 0; } catch (x) { return false; } };
        const add = (o, k) => { k = k.replace(/\s+/g, ' ').trim(); if (k && ALPHA2.test(k) && k.length < 400) o[k] = 1; };
        // 中英混杂：有中文，同时残留 ≥2 个连续英文小写单词，或中文紧挨常见英文虚词
        const isMixed = s => CJK.test(s) && (/\b[a-z]{2,}\s+[a-z]{2,}\b/.test(s) || /[\u4e00-\u9fa5]\s?(and|or|the|of|to|for|with|select|non)\b/.test(s) || /\b(and|or|the|of|to|for|with|is|are)\s?[\u4e00-\u9fa5]/.test(s));
        const w = document.createTreeWalker(document.body, 4);
        let n;
        while ((n = w.nextNode())) {
          const pa = n.parentElement, v = n.nodeValue;
          if (!pa || !ALPHA2.test(v)) continue;
          if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(pa.tagName) || !vis(pa)) continue;
          if (D && D.inSkip(pa)) continue;
          if (pa.tagName === 'OPTION' && pa.parentNode && pa.parentNode.options && pa.parentNode.options.length > 30) continue;
          if (CJK.test(v)) { if (isMixed(v)) add(mix, v); continue; }
          add(miss, v);
          // 父元素整句混杂（拼接型错误）：父元素文字含中文且自身含英文句段
          const t = pa.textContent; if (t.length < 300 && CJK.test(t) && isMixed(t)) add(mix, t);
        }
        for (const e of document.querySelectorAll('[placeholder],[aria-label],[title],input[type=submit],input[type=button]')) {
          if (!vis(e) || (D && D.inSkip(e.parentElement || e))) continue;
          for (const a of ['placeholder', 'aria-label', 'title', 'value']) {
            if (a === 'value' && !/^(submit|button)$/i.test(e.type || '')) continue;
            const v = e.getAttribute(a); if (!v || CJK.test(v)) continue; add(miss, '@' + a + ': ' + v);
          }
        }
        return { miss: Object.keys(miss), mix: Object.keys(mix), hook: !!D };
      });
      for (const k of r.miss) { (all[k] = all[k] || { n: 0, pages: [] }).n++; if (all[k].pages.length < 3) all[k].pages.push(u); }
      for (const k of r.mix) { (mixed[k] = mixed[k] || { n: 0, pages: [] }).n++; if (mixed[k].pages.length < 3) mixed[k].pages.push(u); }
      perPage.push({ u, t: Date.now(), miss: r.miss.length, mix: r.mix.length, hook: r.hook });
      if (SHOTS && /vscode$|vscode\/issues\/1$|react\/pull\/1$|\/explore$|torvalds\?tab=repositories/.test(u)) {
        fs.mkdirSync(SHOTS, { recursive: true });
        await p.screenshot({ path: path.join(SHOTS, u.replace(/^https:\/\/(gist\.)?github\.com\//, '').replace(/[^\w]+/g, '_') + '.png') });
      }
      process.stderr.write('.');
    } catch (e) { perPage.push({ u, err: String(e).slice(0, 100) }); process.stderr.write('x'); }
  }
  const rank = o => Object.entries(o).map(([k, v]) => ({ k, n: v.n, pages: v.pages })).sort((a, b) => b.n - a.n);
  const res = { script: SCRIPT, pages: perPage, untranslated: rank(all), mixed: rank(mixed) };
  fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
  const occ = res.untranslated.reduce((s, x) => s + x.n, 0);
  console.log('\npages', urls.length, 'unique untranslated', res.untranslated.length, 'occurrences', occ, 'mixed', res.mixed.length);
  await b.close();
})();
