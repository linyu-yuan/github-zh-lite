// ==UserScript==
// @name         GitHub 中文化（iPhone 轻量版）
// @namespace    https://github.com/linyu-yuan/github-zh-lite
// @version      __VER__
// @description  GitHub 界面中文化，翻译逻辑与词库来自 maboloshi/github-chinese，适配 iPhone Safari
// @author       linyu-yuan
// @license      GPL-3.0
// @match        https://github.com/*
// @match        https://gist.github.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
/*!
 * 基于 maboloshi/github-chinese __UPVER__（https://github.com/maboloshi/github-chinese），GPL-3.0。
 * 翻译函数（transText / fetchTransResult / handleElementNode / 头部补丁等）逐行移植自 main.user.js，
 * 词库由 locals.js 原样拆分（tools/gen3.js），未增删词条。本脚本同样以 GPL-3.0 发布。
 */
(function () {
  'use strict';
  if (window.top !== window || window.__gzl3) return; window.__gzl3 = 1;
  var VER = '__VER__';
  var DICT_URL = 'https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/dict/';
  var CONF = /*CONF*/{};
  var I18N = { 'zh-CN': { 'public': { 'static': {}, 'time-regexp': [] } }, conf: {} }; // 供词库函数引用
  /*FN*/
  var hasOwn = Object.prototype.hasOwnProperty;
  var LS = (function () { try { var k = '__gzl_t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; } catch (e) { return null; } })();
  function now() { return Date.now(); }
  function safe(fn) { return function () { try { return fn.apply(this, arguments); } catch (e) { if (window.console) console.error('[GitHub 中文化]', e); } }; }

  // ---------- 词库：内存 → localStorage → 网络（raw.githubusercontent.com） ----------
  function compileRules(list) {
    var out = [];
    for (var i = 0; i < (list || []).length; i++) {
      var r = list[i], re;
      try { re = r[1] === null ? r[0] : new RegExp(r[0], r[1]); } catch (e) { continue; }
      out.push([re, (r[2] && typeof r[2] === 'object') ? FN[r[2].f] : r[2]]);
    }
    return out;
  }
  var MEM = {}, waiting = {};
  function getDict(name, cb) {
    if (MEM[name]) { cb(MEM[name]); return; }
    var key = 'gzl3:' + name, raw = null;
    if (LS) try { raw = LS.getItem(key); } catch (e) {}
    if (raw) { try { MEM[name] = JSON.parse(raw); cb(MEM[name]); return; } catch (e) {} }
    if (waiting[name]) { waiting[name].push(cb); return; }
    waiting[name] = [cb];
    function done(d) { var w = waiting[name]; delete waiting[name]; for (var i = 0; i < w.length; i++) safe(w[i])(d); }
    try {
      fetch(DICT_URL + name + '.json').then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (txt) {
        var d = JSON.parse(txt); MEM[name] = d;
        if (LS) { pruneLS(); try { LS.setItem(key, txt); LS.setItem('gzl3:_', '1'); } catch (e) {} }
        done(d);
      })['catch'](function () { done(null); });
    } catch (e) { done(null); }
  }
  function pruneLS() {
    if (pruneLS.done) return; pruneLS.done = 1;
    var keep = { _: 1 }; keep[CONF.f] = 1; keep[CONF.common] = 1; keep[CONF.navFile] = 1;
    for (var p in CONF.pages) keep[CONF.pages[p]] = 1;
    try {
      for (var i = LS.length - 1; i >= 0; i--) {
        var k = LS.key(i); if (!k) continue;
        if (k.indexOf('gzl:') === 0 || (k.indexOf('gzl3:') === 0 && !keep[k.slice(5)])) LS.removeItem(k);
      }
    } catch (e) {}
  }
  function cached(name) { if (MEM[name]) return true; try { return !!(LS && LS.getItem('gzl3:' + name) !== null); } catch (e) { return false; } }

  var COMMON = null; // { s, r(编译后) }
  function setCommon(d) {
    if (!d || COMMON) return;
    COMMON = { s: d.s || {}, r: compileRules(d.r), sel: d.sel || [] };
    I18N['zh-CN']['public']['static'] = COMMON.s;
    I18N['zh-CN']['public']['time-regexp'] = compileRules(d.tm);
  }

  // ---------- 页面类型检测（移植自上游 detectPageType） ----------
  var PAGE_MAP = { 'gist.github.com': 'gist', 'www.githubstatus.com': 'status', 'skills.github.com': 'skills', 'education.github.com': 'education' };
  var SPECIAL = { gist: 1, status: 1, skills: 1, education: 1 };
  var reP, reR, reO;
  function detectPageType() {
    var hostname = location.hostname, pathname = location.pathname, b = document.body;
    if (!b) return false;
    var site = PAGE_MAP[hostname] || 'github';
    var isLogin = b.classList.contains('logged-in');
    var meta = document.head && document.head.querySelector('meta[name="analytics-location"]');
    var metaLocation = (meta && meta.content) || '';
    var isSession = b.classList.contains('session-authentication');
    var isHomepage = pathname === '/' && site === 'github';
    var isProfile = b.classList.contains('page-profile') || metaLocation === '/<user-name>';
    var isRepository = /\/<user-name>\/<repo-name>/.test(metaLocation);
    var isOrganization = /\/<org-login>/.test(metaLocation) || /^\/(?:orgs|organizations)/.test(pathname);
    var pageType, m;
    if (isSession) pageType = 'session-authentication';
    else if (SPECIAL[site]) pageType = site;
    else if (isProfile) {
      m = /[?&]tab=([^&#]*)/.exec(location.search);
      var tab = m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
      pageType = pathname.indexOf('/stars') !== -1 ? 'page-profile/stars' : tab ? 'page-profile/' + tab : 'page-profile';
    } else if (isHomepage) pageType = isLogin ? 'dashboard' : 'homepage';
    else if (isRepository) { m = pathname.match(reR); pageType = m ? 'repository/' + m[1] : 'repository'; }
    else if (isOrganization) { m = pathname.match(reO); pageType = m ? 'orgs/' + (m[1] || m[m.length - 1]) : 'orgs'; }
    else { m = pathname.match(reP); pageType = m ? (m[1] || m[m.length - 1]) : false; }
    if (pageType === false || !hasOwn.call(CONF.pages, pageType)) return false;
    return pageType;
  }

  // ---------- 页面配置（对应上游 buildPageConfig） ----------
  var cfg = null, memo = null, memoN = 0;
  function joinSel(a, b) { return [].concat(a || [], b || []).join(', '); }
  function buildPageConfig(type, d) {
    if (!d.__r) { d.__r = compileRules(d.r); d.__tr = compileRules(d.tr); }
    memo = Object.create(null); memoN = 0;
    return {
      type: type, path: location.pathname,
      ts: d.ts || {}, tr: d.__tr, s: d.s || {},
      rules: d.__r.concat(COMMON.r),
      ignM: joinSel(CONF.ignM['*'], CONF.ignM[type]),
      ign: joinSel(CONF.ign['*'], CONF.ign[type]),
      cd: CONF.cd.indexOf(type) !== -1,
      sel: COMMON.sel.concat(d.sel || [])
    };
  }
  var pendingType = null, held = [];
  // 返回 true 表示配置已就绪（同步）；否则异步加载，期间新节点暂存，加载后按新配置处理
  function updatePageConfig() {
    var t = detectPageType();
    if (!t) { cfg = null; pendingType = null; return true; }
    if (cfg && cfg.type === t) { pendingType = null; return true; }
    if (pendingType === t) return false;
    pendingType = t;
    var sync = false, file = CONF.pages[t];
    getDict(CONF.common, function (c) {
      setCommon(c || { s: {}, r: [] });
      getDict(file, function (d) {
        if (pendingType !== t) return;
        pendingType = null; sync = true;
        cfg = buildPageConfig(t, d || { s: {}, r: [] });
        if (held.length) { var h = held; held = []; for (var i = 0; i < h.length; i++) enqueue(h[i]); kick(); }
      });
    });
    return sync;
  }

  // ---------- 翻译（逐行移植自上游） ----------
  function transText(text) {
    if (/^[\s0-9]*$/.test(text) || /^[\u4e00-\u9fa5]+$/.test(text) || !/[a-zA-Z,.]/.test(text)) return false;
    var trimmedText = text.trim();
    var cleanedText = trimmedText.replace(/\xa0|[\s]+/g, ' ');
    var result = fetchTransResult(cleanedText);
    if (result && result !== cleanedText) return text.replace(trimmedText, result);
    return false;
  }
  function fetchTransResult(text) {
    if (!cfg) return false;
    if (memo[text] !== undefined) return memo[text];
    var r = fetchRaw(text);
    if (memoN++ > 5000) { memo = Object.create(null); memoN = 0; }
    memo[text] = r;
    return r;
  }
  function fetchRaw(text) {
    var v = hasOwn.call(cfg.s, text) ? cfg.s[text] : hasOwn.call(COMMON.s, text) ? COMMON.s[text] : undefined;
    if (typeof v === 'string') return v;
    var rs = cfg.rules;
    for (var i = 0; i < rs.length; i++) {
      var result = text.replace(rs[i][0], rs[i][1]);
      if (result !== text) return result;
    }
    return false;
  }
  function transElementAttr(target, attrName) {
    var text = target[attrName];
    if (!text) return;
    var result = transText(text);
    if (result) target[attrName] = result;
  }
  function transElementAttrs(target, attrs) {
    if (typeof attrs === 'string') attrs = [attrs];
    for (var i = 0; i < attrs.length; i++) transElementAttr(target, attrs[i]);
  }
  function handleTextNode(node) {
    if (node.length > 500) return;
    transElementAttrs(node, 'data');
  }
  function transTimeElement(element) {
    var text = element.textContent;
    if (!text) return;
    var result = text.replace(/\bon\s+/gi, function (match, offset) { return offset === 0 ? ' ' : ''; });
    if (result !== text) element.textContent = result;
  }
  function handleElementNode(node) {
    var tag = node.tagName;
    if (tag === 'RELATIVE-TIME') { if (node.shadowRoot) transTimeElement(node.shadowRoot); return; }
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      if (node.type === 'button' || node.type === 'submit' || node.type === 'reset') {
        transElementAttrs(node.dataset, 'confirm');
        transElementAttrs(node, 'value');
      } else transElementAttrs(node, 'placeholder');
      return;
    }
    if (tag === 'OPTGROUP') { transElementAttrs(node, 'label'); return; }
    if (tag === 'BUTTON') {
      transElementAttrs(node, ['title', 'cancelConfirmText']);
      transElementAttrs(node.dataset, ['confirm', 'confirmText', 'confirmCancelText', 'disableWith', 'visibleText']);
    }
    if (tag === 'A' || tag === 'SPAN') {
      transElementAttrs(node, 'title');
      transElementAttrs(node.dataset, 'visibleText');
    }
    if (/tooltipped/.test(node.className)) transElementAttrs(node, 'ariaLabel');
  }
  function transTitle() {
    var text = document.title, result = cfg.ts[text] || '';
    if (!result) {
      for (var i = 0; i < cfg.tr.length; i++) { result = text.replace(cfg.tr[i][0], cfg.tr[i][1]); if (result !== text) break; }
    }
    if (result) document.title = result;
  }
  function transBySelector() {
    for (var i = 0; i < cfg.sel.length; i++) { var el = document.querySelector(cfg.sel[i][0]); if (el) el.textContent = cfg.sel[i][1]; }
  }

  // ---------- 分片遍历（上游 traverseNode 的同等语义，按时间片执行，避免长任务卡死页面） ----------
  var queue = [], qi = 0, walker = null, scheduled = false;
  var hasRIC = typeof window.requestIdleCallback === 'function';
  function filter(node) {
    if (node.nodeType === 1 && cfg.ign) { try { if (node.matches(cfg.ign)) return 2; } catch (e) {} }
    return 1;
  }
  function enqueue(n) { queue.push(n); }
  function step(limit) {
    var t0 = now(), n, c = 0;
    while (true) {
      if (walker) {
        while ((n = walker.nextNode())) {
          if (n.nodeType === 1) handleElementNode(n); else handleTextNode(n);
          if ((++c & 3) === 0 && now() - t0 > limit) return false;
        }
        walker = null;
      }
      if (qi >= queue.length) { queue = []; qi = 0; return true; }
      if (!cfg) { queue = []; qi = 0; return true; }
      n = queue[qi++];
      if (n.nodeType === 3) { handleTextNode(n); continue; }
      if (!n.isConnected) continue;
      walker = document.createTreeWalker(n, 5, filter, false);
      if (now() - t0 > limit) return false;
    }
  }
  // 自身写入引起的突变记录直接丢弃：防止“写入 → 观察器 → 再遍历”的循环（iPhone 上卡死的主因之一）
  function work(limit) {
    flushRecords();
    var done = safe(step)(limit);
    if (mo) mo.takeRecords();
    if (done === false) later();
  }
  function later() {
    if (scheduled) return; scheduled = true;
    var cb = function () { scheduled = false; work(urgent() ? 40 : 8); };
    if (urgent() || !hasRIC) setTimeout(cb, urgent() ? 0 : 16); else window.requestIdleCallback(cb, { timeout: 300 });
  }
  var urgentUntil = 0;
  function urgent() { return now() < urgentUntil; }
  function kick() { work(urgent() ? 50 : 12); }

  // ---------- MutationObserver（上游 processMutations 的同等语义） ----------
  var mo = null, previousURL = location.href;
  function isIgnoredMutationNode(node) {
    var element = node && node.nodeType === 1 ? node : node && node.parentElement;
    if (!element) return true;
    if (cfg && cfg.ignM) { try { if (element.closest(cfg.ignM)) return true; } catch (e) {} }
    return isReactGlobalNavPortalNode(element);
  }
  var mark = 0;
  function processMutations(muts) {
    var b = document.body; if (!b) return;
    var set = [], stamp = ++mark, i, j, n;
    function add(node) { if (node.__zm !== stamp && (node === b || b.contains(node)) && !isIgnoredMutationNode(node)) { node.__zm = stamp; set.push(node); } }
    for (i = 0; i < muts.length; i++) {
      var m = muts[i];
      if (m.type === 'childList' && m.addedNodes.length) { for (j = 0; j < m.addedNodes.length; j++) add(m.addedNodes[j]); }
      else if (m.type === 'attributes') add(m.target);
      else if (m.type === 'characterData' && cfg && cfg.cd) add(m.target);
    }
    for (i = 0; i < set.length; i++) {
      n = set[i]; var a = n.parentElement, top = true;
      while (a) { if (a.__zm === stamp) { top = false; break; } a = a.parentElement; }
      if (top) { if (cfg) enqueue(n); else if (pendingType) held.push(n); }
    }
  }
  function onMutations(muts) {
    if (bannerWatch) killBanner();
    var cur = location.href;
    if (cur !== previousURL || (!cfg && !pendingType && document.body) || (pageType0 === null && document.body)) {
      var first = pageType0 === null; previousURL = cur; pageType0 = 1; updatePageConfig();
      if (first) queueBody();
    }
    if (cfg || pendingType) processMutations(muts);
  }
  var pageType0 = null;
  function queueBody() { if (cfg) enqueue(document.body); else if (pendingType) held.push(document.body); }
  function flushRecords() { if (mo) { var r = mo.takeRecords(); if (r.length) safe(onMutations)(r); } }
  function observe() {
    mo = new MutationObserver(function (muts) {
      safe(onMutations)(muts);
      if (qi < queue.length || walker) kick();
      if (hideEl && (document.readyState !== 'loading' || foldDone())) reveal();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributeFilter: ['value', 'placeholder', 'aria-label', 'data-confirm'] });
  }

  // ---------- 上游 React 新版头部翻译补丁（逐段移植，ES5） ----------
  var NAV = null, navLoading = false;
  function navDict() {
    if (NAV) return NAV;
    if (!navLoading && document.querySelector('header.GlobalNav')) {
      navLoading = true;
      getDict(CONF.navFile, function (d) { if (d) { NAV = { s: d.s, r: compileRules(d.r) }; scheduleNav(0); } });
    }
    return NAV;
  }
  function closest(el, sel) { try { return el && el.closest ? el.closest(sel) : null; } catch (e) { return null; } }
  function q(el, sel) { try { return el && el.querySelector ? el.querySelector(sel) : null; } catch (e) { return null; } }
  function qa(el, sel) { try { return el && el.querySelectorAll ? el.querySelectorAll(sel) : []; } catch (e) { return []; } }
  function isReactGlobalNavPortalNode(node) {
    var element = node && node.nodeType === 1 ? node : node && node.parentElement;
    var portalRoot = closest(element, '#__primerPortalRoot__');
    if (!portalRoot) return false;
    var portal = closest(element, '[data-component="Portal"]') || q(element, '[data-component="Portal"]') || portalRoot;
    if ((portal.matches && portal.matches('#search-suggestions-dialog')) || q(portal, '#search-suggestions-dialog')) return true;
    var refAttrs = ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns'];
    var refEls = [portal].concat(Array.prototype.slice.call(qa(portal, refAttrs.map(function (a) { return '[' + a + ']'; }).join(', '))));
    var i, j, k, ids;
    for (i = 0; i < refEls.length; i++) for (j = 0; j < refAttrs.length; j++) {
      ids = (refEls[i].getAttribute && refEls[i].getAttribute(refAttrs[j]) || '').split(/\s+/);
      for (k = 0; k < ids.length; k++) { var el = ids[k] && document.getElementById(ids[k]); if (el && closest(el, 'header.GlobalNav')) return true; }
    }
    var portalIds = {}, anyId = false;
    if (portal.id) { portalIds[portal.id] = 1; anyId = true; }
    var withId = qa(portal, '[id]'); for (i = 0; i < withId.length; i++) if (withId[i].id) { portalIds[withId[i].id] = 1; anyId = true; }
    if (anyId) {
      var hr = qa(document, 'header.GlobalNav [aria-describedby], header.GlobalNav [aria-controls], header.GlobalNav [aria-owns]'), at = ['aria-describedby', 'aria-controls', 'aria-owns'];
      for (i = 0; i < hr.length; i++) for (j = 0; j < 3; j++) {
        ids = (hr[i].getAttribute(at[j]) || '').split(/\s+/);
        for (k = 0; k < ids.length; k++) if (hasOwn.call(portalIds, ids[k])) return true;
      }
    }
    var hasSurface = (portal.matches && portal.matches('[role="menu"], [role="dialog"], [role="tooltip"]')) || q(portal, '[role="menu"], [role="dialog"], [role="tooltip"]');
    return !!hasSurface && !!closest(document.activeElement, 'header.GlobalNav, qbsearch-input');
  }
  var scheduleNav = function () {};
  function setupReactGlobalNavTranslation() {
    var labels = CONF.nav || {};
    var dataContentLabelSelector = 'header.GlobalNav [data-component="text"][data-content]';
    var portalSurfaceSelector = '#__primerPortalRoot__ [role="menu"], #__primerPortalRoot__ [role="dialog"], #__primerPortalRoot__ [role="tooltip"]';
    var searchSurfaceSelector = 'qbsearch-input';
    var searchModuleSelector = 'header.GlobalNav [class*="Search-module__"]';
    var unsafeTextSelector = 'textarea, [contenteditable="true"], code, pre, kbd, svg, img, canvas, video';
    var searchSelector = searchModuleSelector + ', ' + searchSurfaceSelector + ', #__primerPortalRoot__ [role="dialog"]';
    var attrNames = ['title', 'aria-label', 'data-visible-text', 'placeholder'];
    var IDLE = 700, RETRY = 400, timer = null, headerObserver = null;
    var lastHeaderAt = now(), lastPortalAt = now(), observed = [];
    function searchActive() { return !!closest(document.activeElement, searchSelector) || !!document.querySelector('#__primerPortalRoot__ [role="dialog"]'); }
    function idle(t) { return now() - (t === 'portal' ? lastPortalAt : lastHeaderAt) >= IDLE; }
    function canHeader() { return document.readyState === 'complete' && idle('header') && !searchActive(); }
    function findStatic(source) { var d = navDict(); if (!d) return null; var v = hasOwn.call(d.s, source) ? d.s[source] : null; return (typeof v === 'string' && v && v !== source) ? v : null; }
    function findRegexp(source) {
      var d = navDict(); if (!d) return null;
      for (var i = 0; i < d.r.length; i++) {
        var p = d.r[i][0], match = source.match(p);
        if (!match || match.index !== 0 || match[0] !== source) continue;
        var label = source.replace(p, d.r[i][1]);
        if (label !== source) return label;
      }
      return null;
    }
    function resolve(source) { return (hasOwn.call(labels, source) && labels[source]) || findStatic(source) || findRegexp(source); }
    function norm(text) { return text == null ? text : text.replace(/\s+/g, ' ').trim(); }
    function tr(text) { var s = norm(text); return s ? resolve(s) : null; }
    function trElement(el, source) { var label = tr(source != null ? source : el.textContent); if (label && el.textContent !== label) el.textContent = label; }
    function skip(node) { var el = node.nodeType === 1 ? node : node.parentElement; if (!el) return true; return !!closest(el, unsafeTextSelector) || !!closest(el, searchSurfaceSelector); }
    function trAttrs(el) { for (var i = 0; i < attrNames.length; i++) { var v = el.getAttribute && el.getAttribute(attrNames[i]); var label = tr(v); if (label && v !== label) el.setAttribute(attrNames[i], label); } }
    function trText(node) { var label = tr(node.data); if (label) node.data = node.data.replace(node.data.trim(), label); }
    function trSurface(surface) {
      if (!surface || skip(surface)) return;
      if (surface.nodeType === 1) trAttrs(surface);
      var w = document.createTreeWalker(surface, 5, { acceptNode: function (n) { return skip(n) ? 2 : 1; } }, false), n;
      while ((n = w.nextNode())) { if (n.nodeType === 1) trAttrs(n); else trText(n); }
    }
    function trHeader() {
      var header = document.querySelector('header.GlobalNav');
      if (!header) return true;
      if (!canHeader()) return false;
      var els = qa(document, dataContentLabelSelector);
      for (var i = 0; i < els.length; i++) if (!skip(els[i])) trElement(els[i], els[i].getAttribute('data-content'));
      trSearchButton(); trSurface(header);
      return true;
    }
    function isSearchPortal(s) { return (s.matches && s.matches('[role="dialog"]')) || !!q(s, '#search-suggestions-dialog, qbsearch-input, [role="dialog"]'); }
    function trPortals() {
      var all = qa(document, portalSurfaceSelector), surfaces = [], i, pending = false;
      for (i = 0; i < all.length; i++) if (isReactGlobalNavPortalNode(all[i])) surfaces.push(all[i]);
      if (!surfaces.length) return true;
      for (i = 0; i < surfaces.length; i++) { if (isSearchPortal(surfaces[i]) && !idle('portal')) { pending = true; continue; } trSurface(surfaces[i]); }
      return !pending;
    }
    function trSearchButton() {
      var ph = document.querySelector('header.GlobalNav [class*="Search-module__placeholder__"]');
      if (!ph) return;
      var label = tr(ph.textContent);
      if (!label || norm(ph.textContent) === label) return;
      var groups = [[]], prot = [];
      function collect(node) {
        if (node.nodeType === 3) { groups[groups.length - 1].push(node); return; }
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches(unsafeTextSelector)) { var t = norm(node.textContent); if (t) { prot.push(t); groups.push([]); } return; }
        for (var c = node.firstChild; c; c = c.nextSibling) collect(c);
      }
      for (var c = ph.firstChild; c; c = c.nextSibling) collect(c);
      var segs = [], rem = label, i, j;
      for (i = 0; i < prot.length; i++) { var idx = rem.indexOf(prot[i]); if (idx === -1) return; segs.push(rem.slice(0, idx)); rem = rem.slice(idx + prot[i].length); }
      segs.push(rem);
      for (i = 0; i < segs.length; i++) if (norm(segs[i]) && !groups[i].length) return;
      for (i = 0; i < groups.length; i++) for (j = 0; j < groups[i].length; j++) groups[i][j].data = j === 0 ? segs[i] : '';
    }
    function trSearchDialog() {
      var dialog = document.querySelector('#search-suggestions-dialog'); if (!dialog) return;
      var h = document.getElementById('search-suggestions-dialog-header');
      if (h) { var l = tr(h.textContent); if (l) h.textContent = l; }
      var els = Array.prototype.slice.call(qa(dialog, '.ActionList-sectionDivider-title')).concat(Array.prototype.slice.call(qa(dialog, '.search-feedback-prompt a, .search-feedback-prompt button')));
      for (var i = 0; i < els.length; i++) { var x = tr(els[i].textContent); if (x) els[i].textContent = x; }
    }
    function trAll(opt) {
      opt = opt || { requireSettledHeader: true };
      observeNav(); trSearchDialog();
      var hOk = trHeader(), pOk = trPortals();
      if ((opt.requireSettledHeader && !hOk) || !pOk) schedule(RETRY, opt);
      if (mo) mo.takeRecords();
    }
    function schedule(delay, opt) { clearTimeout(timer); timer = setTimeout(safe(function () { trAll(opt); }), delay == null ? 800 : delay); }
    scheduleNav = function (d) { schedule(d, { requireSettledHeader: true }); };
    function series() { [800, 1600, 3000].forEach(function (d) { setTimeout(safe(function () { trAll(); }), d); }); }
    function record(s) { if ((s && s.id === '__primerPortalRoot__') || closest(s && s.nodeType === 1 ? s : s && s.parentElement, '#__primerPortalRoot__')) { lastPortalAt = now(); return; } lastHeaderAt = now(); }
    function observeNav() {
      if (!headerObserver) headerObserver = new MutationObserver(safe(function (ms) { for (var i = 0; i < ms.length; i++) record(ms[i].target); trPortals(); schedule(RETRY, { requireSettledHeader: true }); }));
      [document.querySelector('header.GlobalNav'), document.querySelector('#__primerPortalRoot__')].forEach(function (s) {
        if (!s || observed.indexOf(s) !== -1) return;
        observed.push(s); record(s);
        headerObserver.observe(s, { childList: true, subtree: true, characterData: true });
      });
    }
    function start() { observeNav(); series(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', safe(start), false); else start();
    window.addEventListener('turbo:load', series, false);
    ['click', 'focusin', 'focusout', 'pointerover'].forEach(function (e) { document.addEventListener(e, function () { schedule(RETRY, { requireSettledHeader: true }); }, true); });
  }

  // ---------- Safari 智能横幅（“在 App 中打开”）：移除 meta apple-itunes-app ----------
  var bannerWatch = true;
  function killBanner() { var m = document.querySelectorAll('meta[name="apple-itunes-app"]'); for (var i = 0; i < m.length; i++) if (m[i].parentNode) m[i].parentNode.removeChild(m[i]); }

  // ---------- 防英文闪烁：词库已缓存时，首屏翻译完成前隐藏页面，最长 300 ms ----------
  var hideEl = null, hideT = 0, FOLD_T = 0;
  function hide() {
    if (!cached('_')) return; // 首次使用（尚无缓存）不隐藏
    hideEl = document.createElement('style');
    hideEl.textContent = 'html{visibility:hidden!important}';
    (document.head || document.documentElement).appendChild(hideEl);
    hideT = setTimeout(reveal, 300);
  }
  function foldDone() {
    var b = document.body; if (!b) return false;
    var t = now(); if (t - FOLD_T < 25) return false; FOLD_T = t;
    var e = b.lastElementChild, d = 0;
    while (e && e.lastElementChild && d++ < 12) e = e.lastElementChild;
    for (var i = 0; e && i < 8; i++, e = e.previousElementSibling || e.parentElement) {
      if (e === b) break;
      var r = e.getBoundingClientRect();
      if (r.height || r.width) return r.top > innerHeight;
    }
    return false;
  }
  function reveal() { clearTimeout(hideT); if (hideEl) { if (hideEl.parentNode) hideEl.parentNode.removeChild(hideEl); hideEl = null; } }

  // ---------- 启动 ----------
  function initLangEnv() {
    document.documentElement.lang = 'zh-CN';
    new MutationObserver(function () { if (document.documentElement.lang === 'en') document.documentElement.lang = 'zh-CN'; })
      .observe(document.documentElement, { attributeFilter: ['lang'] });
  }
  function handleTurboLoad() { if (!cfg) return; transTitle(); transBySelector(); if (mo) mo.takeRecords(); }
  function start() {
    if (!document.documentElement) return setTimeout(start, 10);
    killBanner(); hide();
    getDict(CONF.common, function (c) { setCommon(c || { s: {}, r: [] }); }); // 缓存命中时同步
    urgentUntil = now() + 60000;
    initLangEnv();
    observe();
    if (document.body) { pageType0 = 1; updatePageConfig(); queueBody(); }
    function ready() {
      killBanner(); setTimeout(function () { killBanner(); bannerWatch = false; }, 3000);
      urgentUntil = now() + 1000;
      flushRecords();
      if (!cfg && !pendingType) { pageType0 = 1; updatePageConfig(); queueBody(); }
      work(60); // 首屏优先：同步处理最多 60 ms，其余分片完成，绝不长时间占用主线程
      reveal();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', safe(ready), false); else safe(ready)();
    document.addEventListener('turbo:load', safe(handleTurboLoad), false);
    setupReactGlobalNavTranslation();
  }
  // 页面规则配置同样按需加载并缓存，主文件保持精简
  getDict(CONF.f, function (c) {
    if (!c) return;
    for (var k in c) CONF[k] = c[k];
    reP = new RegExp(CONF.p); reR = new RegExp(CONF.r); reO = new RegExp(CONF.o);
    safe(start)();
  });
})();
