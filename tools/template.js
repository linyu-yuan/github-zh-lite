// ==UserScript==
// @name         GitHub 中文化 Lite (iPhone 轻量版)
// @namespace    https://github.com/linyu-yuan/github-zh-lite
// @description  为 iPhone Safari (Stay) 优化的 GitHub 界面中文化脚本：ES5、无 GM_ API、无 @require、词库内联、分片空闲翻译，不阻塞主线程。词库来自 maboloshi/github-chinese。
// @version      0.1.0
// @author       linyu-yuan (基于 沙漠之子 maboloshi / 楼教主 52cik 的 github-chinese)
// @copyright    2016-2021 楼教主 (https://github.com/52cik); 2021-present 沙漠之子 (https://github.com/maboloshi); 2026 linyu-yuan
// @license      GPL-3.0
// @homepageURL  https://github.com/linyu-yuan/github-zh-lite
// @match        https://github.com/*
// @match        https://gist.github.com/*
// @run-at       document-end
// @grant        none
// @noframes
// ==/UserScript==
/*
 * 本脚本词库 (DICT / RE) 由 maboloshi/github-chinese 的 locals.js 转换而来，
 * 原项目：https://github.com/maboloshi/github-chinese  许可证：GPL-3.0
 * 本脚本同样以 GPL-3.0 发布。https://www.gnu.org/licenses/gpl-3.0.html
 */
(function () {
  'use strict';
  if (window.__ghZhLite) return; window.__ghZhLite = 1;
  var DICT = /*DICT*/{};
  var RE_SRC = /*RE*/[];
  var hasOwn = Object.prototype.hasOwnProperty;
  var RE = null, memo = {}, memoN = 0;
  var GREET = /^Good (morning|afternoon|evening)(?:,\s*(.+?))?[!.]?$/;
  var GREET_ZH = { morning: '早上好', afternoon: '下午好', evening: '晚上好' };
  var HAS_ALPHA = /[A-Za-z]/;
  var SKIP = [
    'pre', 'code', 'kbd', 'samp', 'textarea', 'input', 'select', 'option', 'script', 'style', 'noscript', 'svg', 'math',
    '[contenteditable]', '[contenteditable=""]', '.markdown-body', '[data-testid="markdown-body"]', '.comment-body',
    '.blob-code', '.blob-wrapper', '.react-code-text', '.react-code-lines', '.react-blob-print-hide', '.js-file-line', '.highlight',
    '.commit-title', '.commit-message', '.commit-desc', '[data-testid="commit-row-item"] a', '.markdown-title', '.js-issue-title',
    '[data-testid="issue-title"]', '[data-testid="issue-pr-title-link"]', '.js-navigation-open', '.Link--primary.v-align-middle',
    '[itemprop="name"]', '[itemprop="description"]', '[itemprop="about"]', '.react-directory-filename-column', '.react-directory-truncate',
    '.react-directory-commit-message', '.Truncate-text', '.AppHeader-context-item-label', '.branch-name', '.ref-selector-button-text-container',
    '.user-mention', '.author', '.commit-author', '.vcard-names', '.p-nickname', '.p-name', '.p-note', '.user-profile-bio',
    'a[data-hovercard-type="repository"]', 'a[data-hovercard-type="user"]', 'a[data-hovercard-type="organization"]',
    '.repo', '.wb-break-word', '.f4.my-3', '.BorderGrid-cell > p', '.topic-tag', '.gist-blob-name', '.file-info', '.file-header .Link--primary',
    '.blob-num', '.js-comment-body', '.edit-comment-hide', '.release-header', '.TimelineItem-body .markdown-title',
    '.Box-title', '[data-filterable-for] .Truncate', '[translate="no"]', '.notranslate', '.zh-lite-skip'
  ].join(',');
  var ATTRS = ['placeholder', 'aria-label', 'title'];
  var ATTR_SEL = '[placeholder],[aria-label],[title]';

  function compileRE() {
    RE = [];
    for (var i = 0; i < RE_SRC.length; i++) {
      try { RE.push([new RegExp(RE_SRC[i][0], RE_SRC[i][1]), RE_SRC[i][2]]); } catch (e) {}
    }
  }

  function lookup(key) {
    if (hasOwn.call(DICT, key)) return DICT[key];
    if (hasOwn.call(memo, key)) return memo[key];
    var res = null, m;
    if (key.length < 200) {
      m = GREET.exec(key);
      if (m) res = GREET_ZH[m[1]] + (m[2] ? '，' + m[2] : '');
      else {
        if (!RE) compileRE();
        for (var i = 0; i < RE.length; i++) {
          if (RE[i][0].test(key)) { res = key.replace(RE[i][0], RE[i][1]); break; }
        }
      }
    }
    if (memoN > 5000) { memo = {}; memoN = 0; }
    memo[key] = res; memoN++;
    return res;
  }

  function translateString(s) {
    if (!s || s.length > 500 || !HAS_ALPHA.test(s)) return null;
    var key = s.replace(/\s+/g, ' ').trim();
    if (!key) return null;
    var t = lookup(key);
    if (t == null || t === key) {
      // 尝试去掉尾部冒号/省略号等
      var m = /^(.*?)([:：…]|\.\.\.)$/.exec(key);
      if (m && m[1] && hasOwn.call(DICT, m[1])) t = DICT[m[1]] + m[2];
      else return null;
    }
    var lead = /^\s*/.exec(s)[0], trail = /\s*$/.exec(s)[0];
    return lead + t + trail;
  }

  function skipped(el) {
    if (!el || el.nodeType !== 1) return true;
    try { return !!el.closest(SKIP); } catch (e) { return true; }
  }

  function doText(node) {
    var v = node.nodeValue;
    if (node.__zh === v) return; // 已翻译，避免回环
    var p = node.parentNode;
    if (!p || skipped(p)) return;
    var t = translateString(v);
    if (t != null && t !== v) { node.__zh = t; node.nodeValue = t; }
    else node.__zh = v;
  }

  function doAttrs(el) {
    if (el.__zhSkip === undefined) el.__zhSkip = skipped(el) && !(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? 1 : 0;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (!v) continue;
      var mk = '__zh_' + a;
      if (el[mk] === v) continue;
      // input/textarea 只翻译 placeholder/title，绝不碰 value
      if (el.__zhSkip && !(a === 'placeholder')) { el[mk] = v; continue; }
      var t = translateString(v);
      el[mk] = t || v;
      if (t && t !== v) el.setAttribute(a, t);
    }
  }

  // ---------- 分片队列 ----------
  var queue = [], qSet = typeof Set === 'function' ? new Set() : null, scheduled = false;
  var ric = window.requestIdleCallback ? function (f) { return window.requestIdleCallback(f, { timeout: 300 }); }
                                       : function (f) { return setTimeout(function () { f(null); }, 16); };
  function enqueue(n) {
    if (!n) return;
    if (qSet) { if (qSet.has(n)) return; qSet.add(n); }
    queue.push(n);
    if (!scheduled) { scheduled = true; ric(run); }
  }
  // 每个元素子树用 TreeWalker 迭代，可在时间片内暂停
  var walker = null;
  function budgetLeft(dl, start) {
    if (dl && dl.timeRemaining) return dl.timeRemaining() > 1;
    return Date.now() - start < 6;
  }
  function run(dl) {
    scheduled = false;
    var start = Date.now(), n;
    while (budgetLeft(dl, start)) {
      if (walker) {
        var c = 0;
        while ((n = walker.nextNode())) {
          if (n.nodeType === 3) doText(n);
          else doAttrs(n);
          if (++c > 50) break;
        }
        if (!n) walker = null;
        continue;
      }
      if (!queue.length) break;
      n = queue.shift(); if (qSet) qSet['delete'](n);
      if (!n.isConnected && n.isConnected !== undefined) continue;
      if (n.nodeType === 3) { doText(n); continue; }
      if (n.nodeType !== 1) continue;
      if (n.matches && n.matches(ATTR_SEL)) doAttrs(n);
      if (skipped(n)) continue;
      walker = document.createTreeWalker(n, 5 /* ELEMENT|TEXT */, {
        acceptNode: function (x) {
          if (x.nodeType === 1) {
            var tg = x.tagName;
            if (tg === 'SCRIPT' || tg === 'STYLE' || tg === 'PRE' || tg === 'CODE' || tg === 'TEXTAREA' || tg === 'svg' || tg === 'SVG') return 2; // REJECT 子树
            if (x.classList && (x.classList.contains('markdown-body') || x.classList.contains('blob-code') || x.classList.contains('react-code-lines'))) return 2;
            if (x.isContentEditable) return 2;
            return x.hasAttribute('placeholder') || x.hasAttribute('aria-label') || x.hasAttribute('title') ? 1 : 3; // SKIP 但继续下降
          }
          return x.nodeValue && HAS_ALPHA.test(x.nodeValue) ? 1 : 3;
        }
      }, false);
    }
    if (queue.length || walker) { scheduled = true; ric(run); }
  }

  // ---------- MutationObserver：只入队，不在回调中做翻译 ----------
  var mo = new MutationObserver(function (recs) {
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      if (r.type === 'childList') {
        for (var j = 0; j < r.addedNodes.length; j++) {
          var a = r.addedNodes[j];
          if (a.nodeType === 1 || a.nodeType === 3) enqueue(a);
        }
      } else if (r.type === 'characterData') {
        if (r.target.__zh !== r.target.nodeValue) enqueue(r.target);
      } else if (r.type === 'attributes') {
        var el = r.target;
        if (el['__zh_' + r.attributeName] !== el.getAttribute(r.attributeName)) enqueue(el);
      }
    }
  });

  function title() {
    var t = document.title, m = /^(.*?)( · GitHub)?$/.exec(t);
    if (m && m[1]) { var z = lookup(m[1]); if (z && z !== m[1]) document.title = z + (m[2] || ''); }
  }

  function full() { enqueue(document.body); setTimeout(title, 50); }

  function start() {
    if (!document.body) return setTimeout(start, 50);
    document.documentElement.lang = document.documentElement.lang || 'en';
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    full();
    // 页面级导航（Turbo / PJAX / React soft-nav / 后退）—— 每次导航最多一次全量扫描，而非每次突变
    var navT = 0;
    function onNav() { clearTimeout(navT); navT = setTimeout(full, 120); }
    ['turbo:load', 'turbo:render', 'turbo:frame-load', 'pjax:end', 'soft-nav:end', 'soft-nav:react-done', 'react-nav:end', 'popstate', 'pageshow'].forEach(function (e) {
      window.addEventListener(e, onNav, false); document.addEventListener(e, onNav, false);
    });
  }
  start();
})();
