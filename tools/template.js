// ==UserScript==
// @name         GitHub 中文化 Lite (iPhone 轻量版)
// @namespace    https://github.com/linyu-yuan/github-zh-lite
// @description  为 iPhone Safari (Stay) 优化的 GitHub 界面中文化脚本：ES5、无 GM_ API、公共词库内联、页面词库按需加载并缓存、分片空闲翻译、漏翻收集。词库来自 maboloshi/github-chinese。
// @version      __VER__
// @author       linyu-yuan (基于 沙漠之子 maboloshi / 楼教主 52cik 的 github-chinese)
// @copyright    2016-2021 楼教主 (https://github.com/52cik); 2021-present 沙漠之子 (https://github.com/maboloshi); 2026 linyu-yuan
// @license      GPL-3.0
// @homepageURL  https://github.com/linyu-yuan/github-zh-lite
// @supportURL   https://github.com/linyu-yuan/github-zh-lite/issues
// @downloadURL  https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/github-zh-lite.user.js
// @updateURL    https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/github-zh-lite.user.js
// @match        https://github.com/*
// @match        https://gist.github.com/*
// @run-at       document-end
// @grant        none
// @noframes
// ==/UserScript==
/*
 * 词库（COMMON 及 dict/*.json）由 maboloshi/github-chinese 的 locals.js 转换而来，
 * 原项目：https://github.com/maboloshi/github-chinese  许可证：GPL-3.0
 * 本脚本同样以 GPL-3.0 发布。https://www.gnu.org/licenses/gpl-3.0.html
 */
(function () {
  'use strict';
  if (window.__ghZhLite) return; window.__ghZhLite = 1;
  var VER = '__VER__';
  var DICT_URL = 'https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/dict/';
  var COMMON = /*COMMON*/{};
  var CONF = /*CONF*/{};
  var PAGES = /*PAGES*/[];
  var LS = (function () { try { var k = '__gzl_t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; } catch (e) { return null; } })();
  var hasOwn = Object.prototype.hasOwnProperty;
  var HAS_ALPHA = /[A-Za-z]/, ALPHA2 = /[A-Za-z]{2}/, HAS_CJK = /[\u4e00-\u9fa5]/;
  var CHUNK = 50;

  // ---------- 规则编译：按必需字面量预筛 ----------
  function compile(list, cap) {
    var withLit = [], noLit = [];
    for (var i = 0; i < list.length; i++) {
      var r = list[i], re;
      try { re = new RegExp(r[0], r[1]); } catch (e) { continue; }
      if (r[3]) withLit.push([re, r[2], r[3]]); else if (noLit.length < cap) noLit.push([re, r[2]]);
    }
    return { lit: withLit, any: noLit };
  }
  var commonRules = null, page = { type: '', s: {}, t: {}, rules: { lit: [], any: [] } }, gen = 1, memo = {}, memoN = 0;

  // ---------- 移植的上游函数规则：日期 / 相对时间 ----------
  var MON = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  var WEEK = { Sun: '周日', Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六' };
  var PREFIX = { 'Updated ': '更新于 ', 'Updated on ': '更新于 ', 'Commits on ': '提交于 ', 'Joined on ': '加入于 ', 'on ': '', 'Created ': '创建于 ', 'Last updated ': '最后更新于 ' };
  var MONTHS = '(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
  var DATE_A = new RegExp('^(Updated on |Updated |Commits on |Joined on |Created |Last updated |on )?(?:(Sun|Mon|Tue|Wed|Thu|Fri|Sat)[a-z]*,? )?' + MONTHS + ' (\\d{1,2})(?:st|nd|rd|th)?(?:,? (\\d{4}))?\\.?$');
  var DATE_B = new RegExp('^(Updated on |Updated |Commits on |Joined on |Created |on )?(\\d{1,2}) ' + MONTHS + '(?:,? (\\d{4}))?$');
  var MON_YEAR = new RegExp('^' + MONTHS + ' (\\d{4})$');
  var REL = /^(Updated |Created |Last updated |Opened |Closed |Merged |Pushed |Released |Published |Started |Edited )?(?:(over|about|almost|less than|in) )?(an?|\d+) (second|minute|hour|day|week|month|year)s?( ago)?$/;
  var RELP = { 'Updated ': '更新于 ', 'Created ': '创建于 ', 'Last updated ': '最后更新于 ', 'Opened ': '打开于 ', 'Closed ': '关闭于 ', 'Merged ': '合并于 ', 'Pushed ': '推送于 ', 'Released ': '发布于 ', 'Published ': '发布于 ', 'Started ': '开始于 ', 'Edited ': '编辑于 ' };
  var UNIT = { second: '秒', minute: '分钟', hour: '小时', day: '天', week: '周', month: '个月', year: '年' };
  var SIMPLE_T = { 'now': '现在', 'just now': '刚刚', 'yesterday': '昨天', 'last week': '上周', 'last month': '上个月', 'last year': '去年' };
  var GREET = /^Good (morning|afternoon|evening)(?:,\s*(.+?))?[!.]?$/, GREET_ZH = { morning: '早上好', afternoon: '下午好', evening: '晚上好' };
  function fmtDate(pre, wk, mon, d, y) {
    var s = (y ? y + '年' : '') + MON[mon.substring(0, 3)] + '月' + (d ? d + '日' : '');
    return (pre ? PREFIX[pre] : '') + s + (wk ? '，' + WEEK[wk] : '');
  }
  function builtin(k) {
    var m, c0 = k.charCodeAt(0);
    if (hasOwn.call(SIMPLE_T, k)) return SIMPLE_T[k];
    if (c0 === 71 && (m = GREET.exec(k))) return GREET_ZH[m[1]] + (m[2] ? '，' + m[2] : '');
    if (k.length > 45) return null;
    if ((m = REL.exec(k))) {
      var n = m[3].charAt(0) === 'a' ? '1' : m[3], p = m[2];
      if (m[5]) return (m[1] ? RELP[m[1]] : '') + (p === 'about' || p === 'almost' ? '大约 ' : p === 'less than' ? '不到 ' : '') + n + ' ' + UNIT[m[4]] + (p === 'over' ? '多之前' : '之前');
      if (p === 'in') return (m[1] ? RELP[m[1]] : '') + n + ' ' + UNIT[m[4]] + '之内';
      return null;
    }
    if ((m = DATE_A.exec(k))) return fmtDate(m[1], m[2], m[3], m[4], m[5]);
    if ((m = DATE_B.exec(k))) return fmtDate(m[1], null, m[3], m[2], m[4]);
    if ((m = MON_YEAR.exec(k))) return m[2] + '年' + MON[m[1].substring(0, 3)] + '月';
    return null;
  }
  function runRules(rs, k) {
    var i, r;
    for (i = 0; i < rs.lit.length; i++) { r = rs.lit[i]; if (k.indexOf(r[2]) !== -1 && r[0].test(k)) return k.replace(r[0], r[1]); }
    for (i = 0; i < rs.any.length; i++) { r = rs.any[i]; if (r[0].test(k)) return k.replace(r[0], r[1]); }
    return null;
  }
  // 返回 [译文|null, 是否属于“精确未命中”]
  function lookup(k) {
    if (hasOwn.call(page.s, k)) return page.s[k];
    if (hasOwn.call(COMMON.s, k)) return COMMON.s[k];
    if (hasOwn.call(memo, k)) return memo[k];
    var res = builtin(k);
    if (res == null && k.length < 200) {
      res = runRules(page.rules, k);
      if (res == null) { if (!commonRules) commonRules = compile(COMMON.r, 40); res = runRules(commonRules, k); }
    }
    if (memoN > 4000) { memo = {}; memoN = 0; }
    memo[k] = res; memoN++;
    return res;
  }
  function translateString(s, collect) {
    if (!s || s.length > 300 || !HAS_ALPHA.test(s)) return null;
    var k = s.replace(/\s+/g, ' ').trim();
    if (!k) return null;
    var t = lookup(k);
    if (t == null) {
      var m = /^(.*?)([:：…]|\.\.\.)$/.exec(k);
      if (m && m[1] && (t = page.s[m[1]] || COMMON.s[m[1]])) t += m[2];
    }
    if (t == null || t === k) { if (collect) miss(k); return null; }
    return /^\s*/.exec(s)[0] + t + /\s*$/.exec(s)[0];
  }

  // ---------- 跳过区域 ----------
  var SKIP = [
    'pre', 'code', 'kbd', 'samp', 'textarea', 'input', 'select', 'script', 'style', 'noscript', 'template', 'svg', 'math',
    '[contenteditable]', '.markdown-body', '[data-testid="markdown-body"]', '.comment-body', '.js-comment-body',
    '.blob-code', '.blob-wrapper', '.react-code-text', '.react-code-lines', '.react-blob-print-hide', '.js-file-line', '.highlight', '.blob-num',
    '.diff-table', '.js-diff-progressive-container', '.file-info', '.gist-blob-name',
    '.commit-title', '.commit-message', '.commit-desc', '.markdown-title', '.js-issue-title', '[data-testid="issue-title"]', '[data-testid="issue-pr-title-link"]',
    '.js-navigation-open', '[itemprop="name"]', '[itemprop="description"]', '[itemprop="about"]',
    '.react-directory-filename-column', '.react-directory-truncate', '.react-directory-commit-message',
    '.AppHeader-context-item-label', '.branch-name', '.ref-selector-button-text-container',
    '.user-mention', '.author', '.commit-author', '.vcard-names', '.p-nickname', '.p-name', '.p-note', '.user-profile-bio',
    'a[data-hovercard-type="repository"]', 'a[data-hovercard-type="user"]', 'a[data-hovercard-type="organization"]',
    '.repo', '.f4.my-3', '.f4.tmp-my-3', '.topic-tag', '.IssueLabel', '.Label--color', '[translate="no"]', '.notranslate', '#gzl-root'
  ].join(',');
  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, PRE: 1, CODE: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, NOSCRIPT: 1, TEMPLATE: 1, svg: 1, SVG: 1, KBD: 1 };
  var ATTRS = ['placeholder', 'aria-label', 'title'];
  function inSkip(el) { try { return !!el.closest(SKIP); } catch (e) { return true; } }

  function doText(node, checked) {
    var v = node.nodeValue;
    if (node.__zh === v && node.__zg === gen) return;
    node.__zg = gen;
    if (!checked) { var p = node.parentNode; if (!p || p.nodeType !== 1 || inSkip(p)) { node.__zh = v; return; } }
    if (HAS_CJK.test(v) && !ALPHA2.test(v)) { node.__zh = v; return; }
    var t = translateString(v, true);
    if (t != null && t !== v) { node.__zh = t; node.nodeValue = t; } else node.__zh = v;
  }
  function doAttrs(el, skipped) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (!v) continue;
      var mk = '__zh_' + a;
      if (el[mk] === v && el.__zga === gen) continue;
      if (skipped && a !== 'placeholder') { el[mk] = v; continue; }
      var t = translateString(v, false);
      el[mk] = t || v;
      if (t && t !== v) el.setAttribute(a, t);
    }
    el.__zga = gen;
  }
  function accept(x) {
    if (x.nodeType === 3) return HAS_ALPHA.test(x.nodeValue) ? 1 : 3;
    if (SKIP_TAG[x.tagName]) {
      if ((x.tagName === 'INPUT' || x.tagName === 'TEXTAREA') && x.hasAttribute('placeholder')) doAttrs(x, true);
      return 2;
    }
    if (x.tagName === 'RELATIVE-TIME' || x.tagName === 'TIME-AGO' || x.tagName === 'LOCAL-TIME') {
      if (x.getAttribute('lang') !== 'zh-CN') x.setAttribute('lang', 'zh-CN');
      return 2;
    }
    if (x.hasAttribute('hidden') || x.isContentEditable) return 2;
    try { if (x.matches(SKIP)) return 2; } catch (e) {}
    return (x.hasAttribute('aria-label') || x.hasAttribute('title') || x.hasAttribute('placeholder')) ? 1 : 3;
  }

  // ---------- 分片队列 ----------
  var queue = [], scheduled = false, walker = null;
  var ric = window.requestIdleCallback ? function (f) { window.requestIdleCallback(f, { timeout: 500 }); } : function (f) { setTimeout(f, 30); };
  function schedule() { if (!scheduled) { scheduled = true; ric(run); } }
  function enqueue(n) { if (n && !n.__zq) { n.__zq = 1; queue.push(n); } }
  function run() {
    scheduled = false;
    var budget = CHUNK, n, t0 = Date.now();
    while (budget > 0 && Date.now() - t0 < 8) {
      if (walker) {
        while (budget > 0 && (n = walker.nextNode())) { budget--; if (n.nodeType === 3) doText(n, true); else doAttrs(n, false); }
        if (!n) walker = null;
        continue;
      }
      if (!queue.length) break;
      n = queue.shift(); n.__zq = 0; budget--;
      if (!n.parentNode || !document.contains(n)) continue;
      if (n.nodeType === 3) { doText(n, false); continue; }
      if (n.nodeType !== 1 || inSkip(n) || n.hidden) continue;
      if (n.hasAttribute('aria-label') || n.hasAttribute('title') || n.hasAttribute('placeholder')) doAttrs(n, false);
      walker = document.createTreeWalker(n, 5, { acceptNode: accept }, false);
    }
    if (queue.length || walker) schedule(); else { flushTitle(); saveMissSoon(); }
  }

  // ---------- MutationObserver：只入队 + 防抖 ----------
  var pending = [], debT = 0;
  var mo = new MutationObserver(function (recs) {
    for (var i = 0; i < recs.length; i++) pending.push(recs[i]);
    if (!debT) debT = setTimeout(drain, 80);
  });
  function drain() {
    debT = 0;
    var recs = pending; pending = [];
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i], tg = r.target;
      if (r.type === 'childList') {
        for (var j = 0; j < r.addedNodes.length; j++) { var a = r.addedNodes[j]; if (a.nodeType === 1 || a.nodeType === 3) enqueue(a); }
      } else if (r.type === 'characterData') {
        if (tg.__zh !== tg.nodeValue) enqueue(tg);
      } else if (r.attributeName === 'hidden' || r.attributeName === 'open') {
        if (!tg.hidden) enqueue(tg);
      } else if (tg['__zh_' + r.attributeName] !== tg.getAttribute(r.attributeName)) enqueue(tg);
    }
    if (queue.length) schedule();
  }

  // ---------- 页面类型检测（移植自上游 detectPageType） ----------
  var reP = new RegExp(CONF.p), reR = new RegExp(CONF.r), reO = new RegExp(CONF.o);
  function has(t) { return PAGES.indexOf(t) !== -1; }
  function detect() {
    var host = location.hostname, path = location.pathname, b = document.body, m;
    if (host === 'gist.github.com') return 'gist';
    var meta = document.querySelector('meta[name="analytics-location"]'); meta = meta ? meta.content : '';
    if (b.classList.contains('session-authentication')) return 'session-authentication';
    if (b.classList.contains('page-profile') || meta === '/<user-name>') {
      m = /[?&]tab=([^&]+)/.exec(location.search);
      return path.indexOf('/stars') !== -1 ? 'page-profile/stars' : m ? 'page-profile/' + m[1] : 'page-profile';
    }
    if (path === '/') return b.classList.contains('logged-in') ? 'dashboard' : 'homepage';
    if (/\/<user-name>\/<repo-name>/.test(meta)) { m = path.match(reR); return m ? 'repository/' + m[1] : 'repository'; }
    if (/\/<org-login>/.test(meta) || /^\/(?:orgs|organizations)/.test(path)) { m = path.match(reO); return m ? 'orgs/' + (m[1] || m[m.length - 1]) : 'orgs'; }
    m = path.match(reP);
    return m ? (m[1] || m[m.length - 1]) : '';
  }
  function setPage(type, d) {
    page = { type: type, s: d.s || {}, t: d.t || {}, rules: compile(d.r || [], 30) };
    gen++; memo = {}; memoN = 0;
    enqueue(document.body); schedule();
  }
  var loadingType = '';
  function loadPage() {
    var type = detect();
    if (!has(type)) type = '';
    if (type === page.type || type === loadingType) { enqueue(document.body); schedule(); return; }
    if (!type) { setPage('', {}); return; }
    var key = 'gzl:' + VER + ':' + type, raw = null;
    if (LS) try { raw = LS.getItem(key); } catch (e) {}
    if (raw) { try { setPage(type, JSON.parse(raw)); return; } catch (e) {} }
    loadingType = type;
    // 先用公共词库翻译，页面词库到达后再增量补译
    page = { type: '', s: {}, t: {}, rules: { lit: [], any: [] } }; enqueue(document.body); schedule();
    var url = DICT_URL + type.replace(/\//g, '__') + '.json?v=' + VER;
    try {
      fetch(url, { cache: 'force-cache' }).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (txt) {
        if (loadingType !== type) return;
        loadingType = '';
        if (LS) { try { pruneLS(); LS.setItem(key, txt); } catch (e) {} }
        setPage(type, JSON.parse(txt));
      })['catch'](function () { loadingType = ''; });
    } catch (e) { loadingType = ''; }
  }
  function pruneLS() {
    for (var i = LS.length - 1; i >= 0; i--) { var k = LS.key(i); if (k && k.indexOf('gzl:') === 0 && k.indexOf('gzl:' + VER + ':') !== 0 && k !== 'gzl:miss' && k !== 'gzl:hidebtn') LS.removeItem(k); }
  }

  // ---------- 标题 ----------
  var lastTitle = '';
  function flushTitle() {
    var t = document.title; if (t === lastTitle) return;
    var m = /^(.*?)( · GitHub)?$/.exec(t), s = m && m[1], z = null;
    if (s) z = page.t[s] || COMMON.t[s] || page.s[s] || COMMON.s[s] || null;
    if (z) document.title = z + (m[2] || '');
    lastTitle = document.title;
  }

  // ---------- 漏翻收集器 ----------
  var MISS = {}, missN = 0, missDirty = false, missT = 0;
  if (LS) try { MISS = JSON.parse(LS.getItem('gzl:miss') || '{}') || {}; } catch (e) { MISS = {}; }
  for (var mt in MISS) if (hasOwn.call(MISS, mt)) for (var mk in MISS[mt]) missN++;
  function miss(k) {
    if (k.length < 2 || k.length > 80 || !ALPHA2.test(k) || missN > 3000) return;
    if (/^[\w.-]+\/[\w.-]+$/.test(k) || /^@?[\w-]+$/.test(k) && !/^[A-Z][a-z]+$/.test(k) && k.indexOf('-') !== -1) return; // 像 owner/repo、user-name
    var g = (page.type || loadingType || detect() || 'other');
    var bucket = MISS[g] || (MISS[g] = {});
    if (hasOwn.call(bucket, k)) return;
    bucket[k] = location.pathname.slice(0, 80); missN++; missDirty = true; updateCount();
  }
  function saveMissSoon() { if (missDirty && !missT) missT = setTimeout(function () { missT = 0; missDirty = false; if (LS) try { LS.setItem('gzl:miss', JSON.stringify(MISS)); } catch (e) {} }, 2000); }
  function missText() {
    var out = ['GitHub 中文化 Lite ' + VER + ' 漏翻列表（' + missN + ' 条）'];
    for (var g in MISS) if (hasOwn.call(MISS, g)) {
      out.push('', '## ' + g);
      for (var k in MISS[g]) if (hasOwn.call(MISS[g], k)) out.push(k + '\t' + MISS[g][k]);
    }
    return out.join('\n');
  }

  // ---------- 浮动按钮与面板 ----------
  var ui = null, countEl = null;
  function updateCount() { if (countEl) countEl.textContent = String(missN); }
  function el(tag, css, text) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (text) e.textContent = text; return e; }
  function buildUI() {
    if (ui || !document.body) return;
    var hide = false; if (LS) try { hide = LS.getItem('gzl:hidebtn') === '1'; } catch (e) {}
    if (location.hash === '#zh-lite') { hide = false; if (LS) try { LS.removeItem('gzl:hidebtn'); } catch (e) {} }
    if (hide) return;
    ui = el('div', 'position:fixed;left:8px;bottom:8px;z-index:2147483646;width:0;height:0;');
    ui.id = 'gzl-root'; ui.setAttribute('translate', 'no');
    var btn = el('button', 'position:absolute;left:0;bottom:0;width:30px;height:30px;border-radius:15px;border:0;padding:0;background:rgba(36,41,47,.35);color:#fff;font:11px/30px -apple-system,sans-serif;text-align:center;cursor:pointer;-webkit-tap-highlight-color:transparent;');
    btn.type = 'button'; btn.setAttribute('aria-label', '中文化漏翻收集');
    countEl = btn; updateCount();
    var panel = el('div', 'display:none;position:absolute;left:0;bottom:38px;width:250px;max-width:calc(100vw - 16px);box-sizing:border-box;padding:10px;border-radius:10px;background:rgba(255,255,255,.97);color:#1f2328;border:1px solid #d0d7de;box-shadow:0 6px 20px rgba(0,0,0,.2);font:13px/1.5 -apple-system,sans-serif;');
    var info = el('div', 'margin-bottom:8px;');
    var ta = el('textarea', 'width:100%;height:110px;box-sizing:border-box;font:11px/1.4 ui-monospace,monospace;margin-bottom:8px;border:1px solid #d0d7de;border-radius:6px;');
    ta.readOnly = true;
    var bs = 'margin:0 6px 6px 0;padding:5px 9px;border:1px solid #d0d7de;border-radius:6px;background:#f6f8fa;color:#1f2328;font:13px -apple-system,sans-serif;';
    var copy = el('button', bs, '复制漏翻列表'), clear = el('button', bs, '清空'), hideB = el('button', bs, '隐藏按钮'), close = el('button', bs, '关闭');
    copy.type = clear.type = hideB.type = close.type = 'button';
    var tip = el('div', 'font-size:11px;color:#59636e;', '隐藏后，在任意 GitHub 网址后加 #zh-lite 可恢复按钮。');
    function refresh() { info.textContent = '当前页面类型：' + (page.type || '（仅公共词库）') + '，已收集 ' + missN + ' 条未翻译文本。'; ta.value = missText(); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); if (panel.style.display === 'none') { saveMissSoon(); refresh(); panel.style.display = 'block'; } else panel.style.display = 'none'; }, false);
    close.addEventListener('click', function () { panel.style.display = 'none'; }, false);
    copy.addEventListener('click', function () {
      var txt = missText(), done = function () { copy.textContent = '已复制 ✓'; setTimeout(function () { copy.textContent = '复制漏翻列表'; }, 1500); };
      function fallback() { ta.value = txt; ta.readOnly = false; ta.focus(); ta.select(); ta.setSelectionRange(0, txt.length); try { document.execCommand('copy'); done(); } catch (e) { copy.textContent = '请手动复制上方文本'; } ta.readOnly = true; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
    }, false);
    clear.addEventListener('click', function () { if (!confirm('确定清空漏翻列表？')) return; MISS = {}; missN = 0; if (LS) try { LS.removeItem('gzl:miss'); } catch (e) {} updateCount(); refresh(); }, false);
    hideB.addEventListener('click', function () { if (LS) try { LS.setItem('gzl:hidebtn', '1'); } catch (e) {} ui.parentNode && ui.parentNode.removeChild(ui); ui = null; countEl = null; }, false);
    panel.appendChild(info); panel.appendChild(ta); panel.appendChild(copy); panel.appendChild(clear); panel.appendChild(hideB); panel.appendChild(close); panel.appendChild(tip);
    ui.appendChild(panel); ui.appendChild(btn);
    document.documentElement.appendChild(ui); // 挂在 <html> 而非 body，避免被 React/Turbo 替换 body 时卷入
  }

  // ---------- 启动与导航 ----------
  function observe() { mo.disconnect(); mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title', 'hidden', 'open'] }); mo.__b = document.body; }
  function start() {
    if (!document.body) return setTimeout(start, 50);
    observe();
    loadPage(); buildUI();
    var navT = 0, lastHref = location.href;
    function onNav() {
      clearTimeout(navT);
      navT = setTimeout(function () {
        if (document.body && mo.__b !== document.body) observe();
        lastHref = location.href; loadPage(); buildUI();
      }, 150);
    }
    var evs = ['turbo:load', 'turbo:render', 'pjax:end', 'soft-nav:end', 'soft-nav:react-done', 'popstate', 'pageshow'];
    for (var i = 0; i < evs.length; i++) { window.addEventListener(evs[i], onNav, false); document.addEventListener(evs[i], onNav, false); }
    // React 路由 pushState 不一定派发事件：低频轮询 URL（仅比较字符串）
    setInterval(function () { if (location.href !== lastHref) onNav(); }, 1000);
  }
  start();
})();
