// ==UserScript==
// @name         GitHub 中文化 Lite (iPhone 轻量版)
// @namespace    https://github.com/linyu-yuan/github-zh-lite
// @description  为 iPhone Safari (Stay) 优化的 GitHub 界面中文化脚本：ES5、无 GM_ API、公共词库内联、页面词库按需加载并缓存、分片空闲翻译。词库来自 maboloshi/github-chinese。
// @version      2.3.4
// @author       linyu-yuan (基于 沙漠之子 maboloshi / 楼教主 52cik 的 github-chinese)
// @copyright    2016-2021 楼教主 (https://github.com/52cik); 2021-present 沙漠之子 (https://github.com/maboloshi); 2026 linyu-yuan
// @license      GPL-3.0
// @homepageURL  https://github.com/linyu-yuan/github-zh-lite
// @supportURL   https://github.com/linyu-yuan/github-zh-lite/issues
// @downloadURL  https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/github-zh-lite.user.js
// @updateURL    https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/github-zh-lite.user.js
// @match        https://github.com/*
// @match        https://gist.github.com/*
// @run-at       document-start
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
  var VER = '2.3.4';
  var DICT_URL = 'https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/dict/';
  var COMMON = { s: {}, r: [], t: {} };
  var CONF = {"p":"^\\/($|home|dashboard|feed|copilot|spark|signup|account_verifications|login\\/oauth|login|logout|sessions?|password_reset|orgs|explore|topics|notifications\\/subscriptions|notifications|watching|stars|issues|pulls|repos|search|trending|showcases|new\\/(import|project)|new|import|settings\\/(profile|admin|appearance|accessibility|notifications|billing|emails|security_analysis|security-log|security|auth|sessions|keys|ssh|gpg|organizations|enterprises|blocked_users|interaction_limits|code_review_limits|repositories|codespaces|models|codespaces\\/allow_permissions|deleted_repositories|packages|copilot|pages|replies|installations|apps\\/authorizations|reminders|sponsors-log|apps|(?:personal-access-|)tokens|developers|applications\\/new|applications|connections\\/applications|education\\/benefits|credentials)|settings|installations\\/new|marketplace|apps|account\\/(organizations\\/new|choose|upgrade|billing\\/history)|projects|redeem|discussions|collections|sponsors|sponsoring|github-copilot\\/(signup|free_signup|code-review-waitlist|pro)|codespaces|developer\\/register|features|security|sitemap|education|mcp)|^\\/users\\/[^\\/]+\\/(projects|packages|succession\\/invitation)","r":"^\\/[^\\/]+\\/[^\\/]+\\/(issues|pulls|pull|tree|watchers|stargazers|new|edit|delete|upload|find|models|wiki|branches|discussions|activity|rules|releases|packages|tags|labels|milestones?|compare|commit|blob|blame|actions(\\/metrics\\/(usage|performance))?|runs|deployments|security|pulse|community|forks|fork|import|graphs\\/(contributors|community|traffic|commit-activity|code-frequency)|network$|network\\/(dependencies|dependents|updates|members)|settings\\/(access|code_review_limits|interaction_limits|branches|branch_protection_rules|tag_protection|rules|actions|models\\/access-policy|hooks|copilot\\/(code_review|coding_agent)|environments|codespaces|pages|security_analysis|dependabot_rules|keys|secrets|variables|installations|notifications|key_links)|settings|transfer|projects\\/new|projects|pkgs|contribute|subscription|invitations|codespaces|attestations|custom-properties|reported_content|agents|tasks)","o":"^\\/[^\\/]+\\/[^\\/]+\\/(repositories\\/new|repositories|sponsoring|discussions|projects|packages|teams|new-team|people|outside-collaborators|pending_collaborators|dashboard|billing_managers\\/new|invitations?|settings\\/(profile|billing|roles|member_privileges|teams|import-export|blocked_users|interaction_limits|code_review_limits|moderators|repository-defaults|rules|codespaces|copilot|actions|hooks|discussions|packages|pages|projects|security_analysis|security|dependabot_rules|domains|secrets|variables|oauth_application_policy|installations|personal-access-token|reminders|sponsors-log|audit-log|deleted_repositories|applications\\/new|applications|apps\\/new|apps|publisher|policies\\/repositories|custom-properties|issue-fields|sandboxes)|topics|domain\\/new|audit-log\\/event_settings|billing\\/(history|plans)|policies\\/applications)|^\\/[^\\/]+\\/(enterprise_plan|sponsoring)"};
  var PAGES = ["orgs-public","page-dashboard","dashboard","feed","orgs/dashboard","page-profile-public","page-profile/achievements","page-profile/followers","page-profile/following","page-profile","page-profile/overview","page-profile/repositories","page-profile/projects","page-profile/sponsoring","page-profile/packages","page-profile/sponsors","page-profile/stars","confirm-access","payment-module","settings-menu","orgs-settings-menu","settings/profile","settings","settings/admin","succession/invitation","settings/appearance","settings/accessibility","settings/notifications","settings/billing","account/billing/history","orgs/settings/billing","orgs/billing_managers/new","orgs/billing/history","orgs/billing/plans","settings/education/benefits","settings/emails","settings/security","settings/auth","settings/sessions","settings/keys","settings/ssh","settings/gpg","settings/organizations","settings/enterprises","settings/blocked_users","settings/interaction_limits","settings/code_review_limits","settings/repositories","settings/deleted_repositories","settings/codespaces","settings/models","settings/packages","orgs/settings/packages","settings/copilot","settings/pages","orgs/settings/pages","settings/replies","settings/security_analysis","settings/installations","settings/apps/authorizations","settings/applications","settings/connections/applications","orgs/settings/installations","orgs/policies/applications","settings/reminders","settings/security-log","settings/sponsors-log","settings/apps","orgs/settings/apps/new","settings/developers","settings/applications/new","orgs/settings/applications/new","settings/personal-access-tokens","settings/tokens","settings/credentials","repository-public","page-new-repo","new","new/import","repository/import","repository/fork","orgs/repositories/new","repository","repository/tree","repository/milestones","repository/milestone","repository/pull_issue_public","repository/issues","repository/labels","repository/pulls","repository/pull","repository/compare","repository/commit","repository/blob","repository/blame","repository/discussions","repository/orgs/discussions","repository/actions","repository/runs","repository/deployments","repository/attestations","repository/watchers","repository/stargazers","repository/new","repository/edit","repository/delete","repository/upload","repository/find","repository/models","repository/wiki","repository/branches","repository/activity","repository/releases","repository/tags","repository/packages","repository/pkgs","packages","repository/security","repository/contribute","repository/subscription","repository/invitations","repository/tasks","repository-insights-menu","repository/pulse","repository/graphs/contributors","repository/graphs/community","repository/community","repository/graphs/traffic","repository/graphs/commit-activity","repository/graphs/code-frequency","repository/network/dependencies","repository/network/dependents","repository/network/updates","repository/network","repository/network/members","repository/forks","repository-settings-menu","repository/settings","repository/settings/access","repository/settings/interaction_limits","repository/settings/code_review_limits","repository/settings/branches","repository/settings/branch_protection_rules","repository/settings/tag_protection","repository/settings/rules","orgs/settings/rules","repository/rules","repository/settings/actions","repository/settings/models/access-policy","repository/settings/hooks","orgs/settings/hooks","repository/settings/copilot/code_review","repository/settings/copilot/coding_agent","repository/settings/environments","repository/settings/codespaces","repository/settings/pages","repository/settings/security_analysis","repository/settings/keys","repository/settings/secrets","repository/settings/variables","repository/settings/installations","repository/settings/notifications","repository/settings/key_links","repository/transfer","repository/codespaces","repository/custom-properties","homepage","home","session-authentication","login","logout","session","sessions","password_reset","signup","account_verifications","notifications","watching","notifications/subscriptions","stars","issues","pulls","repos","search","repository/search","discussions","gist","login/oauth","explore","topics","trending","collections","sponsors","showcases","account/organizations/new","account/choose","account/upgrade","marketplace","apps","orgs","orgs/repositories","orgs/projects","orgs/packages","orgs/people","orgs/outside-collaborators","orgs/pending_collaborators","orgs/teams","orgs/new-team","orgs/invitations","orgs/invitation","orgs/domain/new","orgs/settings/profile","orgs/settings/policies/repositories","orgs/settings/roles","orgs/settings/member_privileges","orgs/settings/teams","orgs/settings/import-export","orgs/settings/blocked_users","orgs/settings/interaction_limits","orgs/settings/code_review_limits","orgs/settings/moderators","orgs/settings/repository-defaults","orgs/topics","orgs/settings/codespaces","orgs/settings/sandboxes","orgs/settings/custom-properties","orgs/settings/issue-fields","orgs/settings/copilot","orgs/settings/actions","orgs/settings/discussions","orgs/settings/projects","orgs/settings/security","orgs/settings/security_analysis","orgs/settings/dependabot_rules","repository/settings/dependabot_rules","orgs/settings/domains","orgs/settings/secrets","orgs/settings/variables","orgs/settings/oauth_application_policy","orgs/settings/personal-access-token","orgs/settings/reminders","orgs/settings/sponsors-log","orgs/settings/audit-log","orgs/audit-log/event_settings","orgs/settings/deleted_repositories","orgs/settings/applications","orgs/settings/apps","orgs/settings/publisher","projects","new/project","repository/projects/new","repository/projects","redeem","github-copilot/signup","github-copilot/free_signup","github-copilot/pro","orgs/enterprise_plan","codespaces","codespaces/allow_permissions","developer/register","features","status","skills","orgs/sponsoring","organizations/plan","repo-actions-merics-public","repository/actions/metrics/usage","repository/actions/metrics/performance","copilot","github-copilot/code-review-waitlist","spark","sitemap","education","mcp","repository/agents"];
  var LS = (function () { try { var k = '__gzl_t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; } catch (e) { return null; } })();
  var hasOwn = Object.prototype.hasOwnProperty;
  var HAS_DIGIT = /\d/, HAS_ALPHA = /[A-Za-z]/, ALPHA2 = /[A-Za-z]{2}/, HAS_CJK = /[\u4e00-\u9fa5]/;
  var CHUNK = 50, BUDGET = 4;

  // ---------- 规则编译：按必需字面量预筛 ----------
  function compile(list, cap) {
    var withLit = [], noLit = [];
    for (var i = 0; i < list.length; i++) {
      var r = list[i], re;
      try { re = new RegExp(r[0], r[3] || ''); } catch (e) { continue; }
      if (r[2]) withLit.push([re, r[1], r[2]]); else if (noLit.length < cap) noLit.push([re, r[1]]);
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
    if (k.length > 45 || (!HAS_DIGIT.test(k) && k.indexOf(' ago') === -1 && k.indexOf('an ') === -1 && k.indexOf('a ') === -1)) return null;
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

  // ---------- 跳过区域（快速分类器，结果缓存在元素上，代替大选择器 matches/closest） ----------
  function set(a) { var o = {}; for (var i = 0; i < a.length; i++) o[a[i]] = 1; return o; }
  var SKIP_TAG = set(['PRE', 'CODE', 'KBD', 'SAMP', 'TEXTAREA', 'INPUT', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'svg', 'SVG', 'MATH', 'math', 'IFRAME', 'CANVAS', 'VIDEO']);
  var SKIP_CLASS = set(['markdown-body', 'comment-body', 'js-comment-body', 'blob-code', 'blob-wrapper', 'react-code-text', 'react-code-lines', 'react-blob-print-hide',
    'js-file-line', 'highlight', 'blob-num', 'diff-table', 'js-diff-progressive-container', 'file-info', 'gist-blob-name', 'commit-title', 'commit-message', 'commit-desc',
    'markdown-title', 'js-issue-title', 'js-navigation-open', 'react-directory-filename-column', 'react-directory-truncate', 'react-directory-commit-message',
    'AppHeader-context-item-label', 'branch-name', 'ref-selector-button-text-container', 'user-mention', 'author', 'commit-author', 'vcard-names', 'p-nickname',
    'p-name', 'p-note', 'user-profile-bio', 'styled-input-container', 'search-match', 'repo', 'topic-tag', 'IssueLabel', 'Label--color', 'notranslate']);
  var SKIP_CLASS_SUB = ['contextCrumb', 'Breadcrumbs-Item', 'IssueTitle', 'markdownBody'];
  var SKIP_ITEMPROP = set(['name', 'description', 'about', 'programmingLanguage']);
  var SKIP_TESTID = set(['markdown-body', 'issue-title', 'issue-pr-title-link', 'author-filter-link', 'issue-body']);
  // 指向用户内容的链接（提交、分支/文件、Wiki 页、发行版、工作流运行、话题）
  var SKIP_HREF = ['/topics/', '/commit/', '/tree/', '/blob/', '/wiki/', '/releases/tag/', '/actions/runs/', '/actions/workflows/'];
  var DESC_TAG = set(['H1', 'H2', 'H3', 'P', 'BDI', 'EM']);
  var DESC_SEL = 'h1 bdi,article h1,article h3,article p,.Box-row h2,.Box-row p,[data-testid="results-list"] h3,[data-testid="results-list"] [class*="Text"] em';
  function classify(x) {
    var tg = x.tagName;
    if (SKIP_TAG[tg]) return 1;
    if (!x.attributes.length) return DESC_TAG[tg] ? descSkip(x) : 0;
    if (x.hasAttribute('contenteditable') || x.hasAttribute('data-hovercard-type') || x.id === 'gzl-root') return 1;
    var v = x.getAttribute('itemprop'); if (v && SKIP_ITEMPROP[v]) return 1;
    v = x.getAttribute('data-testid'); if (v && (SKIP_TESTID[v] || v.indexOf('title-link') !== -1 || v.indexOf('markdown') !== -1)) return 1;
    if (x.getAttribute('translate') === 'no') return 1;
    var cl = x.classList, n = cl ? cl.length : 0;
    if (n) {
      for (var i = 0; i < n; i++) if (SKIP_CLASS[cl[i]]) return 1;
      if (cl.contains('f4') && (cl.contains('my-3') || cl.contains('tmp-my-3'))) return 1;
      var cn = x.getAttribute('class');
      for (i = 0; i < SKIP_CLASS_SUB.length; i++) if (cn.indexOf(SKIP_CLASS_SUB[i]) !== -1) return 1;
    }
    if (tg === 'A') { v = x.getAttribute('href'); if (v) for (i = 0; i < SKIP_HREF.length; i++) if (v.indexOf(SKIP_HREF[i]) !== -1) return 1; }
    if (DESC_TAG[tg]) { try { if (x.matches(DESC_SEL)) return 1; } catch (e) {} }
    return 0;
  }
  function descSkip(x) { try { return x.matches(DESC_SEL) ? 1 : 0; } catch (e) { return 0; } }
  function isSkip(x) { var c = x.__zs; if (c === undefined) c = x.__zs = classify(x); return c === 1; }
  // 等价于 closest(SKIP)：沿祖先向上，命中缓存即停
  function inSkip(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentNode) {
      var a = e.__za; if (a !== undefined) return a === 1;
      if (isSkip(e)) { e.__za = 1; return true; }
    }
    return false;
  }
  var ATTRS = ['placeholder', 'aria-label', 'title'];

  var HDR = {'Pull requests':'拉取请求','Issues':'议题','Notifications':'通知','Dashboard':'仪表板','Explore':'探索','Marketplace':'市场','Codespaces':'代码空间','Settings':'设置','Repositories':'仓库','Projects':'项目','Stars':'星标','Gists':'代码片段','Organizations':'组织','Sponsors':'赞助','Discussions':'讨论','Your repositories':'您的仓库','Your stars':'您的星标','Your projects':'您的项目','Trending':'趋势','Topics':'主题','Collections':'集合','Search':'搜索','New repository':'新建仓库','Import repository':'导入仓库','Copilot':'Copilot'};
  function doText(node, checked) {
    var v = node.nodeValue;
    if (node.__zh === v && node.__zg === gen) return;
    node.__zg = gen;
    if (!checked) { var p = node.parentNode; if (!p || p.nodeType !== 1 || inSkip(p)) { var hz = HDR[v.replace(/^\s+|\s+$/g, '')]; if (hz && p && p.closest && p.closest('.AppHeader-context-item-label, .AppHeader-context')) { node.__zh = node.nodeValue = v.replace(/\S[\s\S]*\S|\S/, hz); } else node.__zh = v; return; } }
    if (HAS_CJK.test(v) && !ALPHA2.test(v)) { node.__zh = v; return; }
    var pp = node.parentNode;
    if (pp && pp.tagName === 'OPTION' && pp.getAttribute('value') && pp.parentNode && pp.parentNode.options && pp.parentNode.options.length > 30) { node.__zh = v; return; } // 语言/时区等长列表保持原文
    var t = translateString(v, true);
    if (t != null && t !== v) {
      var po = node.parentNode;
      if (po && po.tagName === 'OPTION' && !po.hasAttribute('value')) po.setAttribute('value', po.value); // 保持提交值不变
      node.__zh = t; node.nodeValue = t;
    } else node.__zh = v;
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
  // 输入框：只翻 placeholder；按钮型 input 的 value；只读展示框的 value。绝不改用户可编辑的值
  var BTN_TYPE = { submit: 1, button: 1, reset: 1 };
  function doInput(x) {
    if (x.hasAttribute('placeholder')) doAttrs(x, true);
    var ty = (x.getAttribute('type') || '').toLowerCase();
    if (!(x.tagName === 'INPUT' && BTN_TYPE[ty]) && !(x.readOnly && !x.isContentEditable)) return;
    var v = x.value;
    if (!v || x.__zh_value === v) return;
    if (/^[\w-]+:\S/.test(v)) { x.__zh_value = v; return; } // reason:assign 这类查询保持英文
    var t = translateString(v, false);
    if (t && t !== v) { x.__zh_value = t; if (BTN_TYPE[ty]) x.setAttribute('value', t); x.value = t; } else x.__zh_value = v;
  }
  function accept(x) {
    if (x.nodeType === 3) return HAS_ALPHA.test(x.nodeValue) ? 1 : 3;
    var tg = x.tagName;
    if (tg === 'RELATIVE-TIME' || tg === 'TIME-AGO' || tg === 'LOCAL-TIME') {
      if (x.getAttribute('lang') !== 'zh-CN') { x.setAttribute('lang', 'zh-CN'); if (x.getAttribute('prefix') == null) x.setAttribute('prefix', ''); }
      return 2;
    }
    if (isSkip(x)) {
      if (tg === 'INPUT' || tg === 'TEXTAREA') doInput(x);
      return 2;
    }
    if (x.hidden) return 2;
    return (x.hasAttribute('aria-label') || x.hasAttribute('title') || x.hasAttribute('placeholder')) ? 1 : 3;
  }

  // ---------- 分片队列：4 ms 时间片，滚动/触摸期间暂停 ----------
  var queue = [], qi = 0, scheduled = false, walker = null, busyUntil = 0, urgentUntil = 0, URGENT_BUDGET = 30;
  function urgentFor(ms) { var u = now() + ms; if (u > urgentUntil) urgentUntil = u; }
  var hasRIC = typeof window.requestIdleCallback === 'function';
  function now() { return Date.now(); }
  function schedule(delay) {
    if (scheduled) return; scheduled = true;
    if (delay) setTimeout(function () { scheduled = false; schedule(); }, delay);
    else if (now() < urgentUntil) setTimeout(run, 0);
    else if (hasRIC) window.requestIdleCallback(run, { timeout: 1000 });
    else setTimeout(run, 16);
  }
  function enqueue(n) { if (n && !n.__zq) { n.__zq = 1; queue.push(n); } }
  function run(dl) {
    scheduled = false;
    var t0 = now();
    var urgent = t0 < urgentUntil;
    if (!urgent && t0 < busyUntil) { schedule(busyUntil - t0 + 30); return; }
    var lim = urgent ? URGENT_BUDGET : BUDGET;
    if (!urgent && dl && dl.timeRemaining) { var tr = dl.timeRemaining(); if (tr < lim) lim = tr < 1 ? 1 : tr; }
    var budget = urgent ? 100000 : CHUNK, n;
    while (budget > 0 && now() - t0 < lim) {
      if (walker) {
        while (budget > 0 && (n = walker.nextNode())) { budget--; if (n.nodeType === 3) doText(n, true); else doAttrs(n, false); }
        if (!n) walker = null;
        continue;
      }
      if (qi >= queue.length) { queue = []; qi = 0; break; }
      n = queue[qi++]; n.__zq = 0; budget--;
      if (!n.isConnected) continue;
      if (n.nodeType === 3) { doText(n, false); continue; }
      if (n.nodeType === 1 && (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA') && !n.parentNode.closest('[contenteditable]')) { doInput(n); continue; }
      if (n.nodeType !== 1 || n.hidden || inSkip(n)) continue;
      if (n.hasAttribute('aria-label') || n.hasAttribute('title') || n.hasAttribute('placeholder')) doAttrs(n, false);
      if (!n.firstChild) continue;
      walker = document.createTreeWalker(n, 5, { acceptNode: accept }, false);
    }
    if (qi < queue.length || walker) schedule(); else { queue = []; qi = 0; flushTitle(); }
  }
  function onBusy() { busyUntil = now() + 200; }

  // ---------- MutationObserver：只观察 childList + 文本；只入队 + 防抖；跳过区域内的变动直接丢弃 ----------
  var pending = [], debT = 0;
  var mo = new MutationObserver(function (recs) {
    pending.push(recs);
    if (now() < urgentUntil) { if (debT) { clearTimeout(debT); debT = 0; } drain(); if (qi < queue.length || walker) { scheduled = false; run(null); } return; } // 首屏：节点流入即翻译，赶在首次绘制前
    if (!debT) debT = setTimeout(drain, 100);
  });
  function drain() {
    debT = 0;
    if (!pageTried && document.body) loadPage();
    var batches = pending; pending = [];
    for (var b = 0; b < batches.length; b++) {
      var recs = batches[b];
      for (var i = 0; i < recs.length; i++) {
        var r = recs[i], tg = r.target;
        if (r.type === 'childList') {
          if (!r.addedNodes.length || inSkip(tg)) continue;
          for (var j = 0; j < r.addedNodes.length; j++) { var a = r.addedNodes[j]; if (a.nodeType === 1 || (a.nodeType === 3 && HAS_ALPHA.test(a.nodeValue))) enqueue(a); }
        } else if (r.type === 'characterData') {
          if (tg.__zh !== tg.nodeValue && HAS_ALPHA.test(tg.nodeValue)) enqueue(tg);
        } else if (!tg.hidden && !inSkip(tg)) enqueue(tg); // hidden / open 变化：展开时补译
      }
    }
    if (qi < queue.length) schedule();
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
  // ---------- 词库加载：内存缓存 → localStorage → 网络 ----------
  var MEM = {};
  function getDict(name, cb) {
    if (MEM[name]) { cb(MEM[name]); return; }
    var key = 'gzl:' + VER + ':' + name, raw = null, d;
    if (LS) try { raw = LS.getItem(key); } catch (e) {}
    if (raw) { try { d = JSON.parse(raw); MEM[name] = d; cb(d); return; } catch (e) {} }
    try {
      fetch(DICT_URL + name.replace(/\//g, '__') + '.json?v=' + VER, { cache: 'force-cache' }).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (txt) {
        d = JSON.parse(txt); MEM[name] = d;
        if (LS) { try { pruneLS(); LS.setItem(key, txt); } catch (e) {} }
        cb(d);
      })['catch'](function () { cb(null); });
    } catch (e) { cb(null); }
  }
  function pruneLS() {
    if (pruneLS.done) return; pruneLS.done = 1;
    for (var i = LS.length - 1; i >= 0; i--) { var k = LS.key(i); if (k && k.indexOf('gzl:') === 0 && k.indexOf('gzl:' + VER + ':') !== 0) LS.removeItem(k); }
  }
  function setPage(type, d) {
    page = { type: type, s: d.s || {}, t: d.t || {}, rules: d.__c || (d.__c = compile(d.r || [], 30)) };
    gen++; memo = {}; memoN = 0;
    enqueue(document.body); schedule();
  }
  var loadingType = null, commonReady = false, pageTried = false;
  function loadCommon() {
    if (commonReady || loadCommon.busy) return; loadCommon.busy = 1;
    getDict('_common', function (d) { commonReady = true; if (d) { if (!d.t) d.t = {}; if (!d.r) d.r = []; if (!d.s) d.s = {}; COMMON = d; commonRules = null; gen++; memo = {}; memoN = 0; if (document.body) { enqueue(document.body); schedule(); } } });
  }
  function loadPage() {
    loadCommon(); // 缓存命中时同步完成；冷启动时与页面词库并行下载
    if (!document.body) return;
    pageTried = true;
    var type = detect();
    if (!has(type)) type = '';
    if (type === page.type) { enqueue(document.body); schedule(); return; }
    if (type === loadingType) return;
    if (!type) { setPage('', {}); return; }
    loadingType = type;
    var got = false;
    getDict(type, function (d) { got = true; if (loadingType !== type) return; loadingType = null; setPage(type, d || {}); });
    if (!got) { page = { type: '', s: {}, t: {}, rules: { lit: [], any: [] } }; enqueue(document.body); schedule(); }
  }
  // 空闲时预取常用页面词库（只存 localStorage，不解析）
  function prefetch() {
    if (!LS || !window.fetch) return;
    var names = ['repository', 'repository/issues', 'repository/pulls', 'repository/pull', 'repository/blob', 'repository/tree'], i = 0;
    (function next() {
      if (i >= names.length) return;
      var n = names[i++], key = 'gzl:' + VER + ':' + n;
      try { if (LS.getItem(key) !== null) return next(); } catch (e) { return; }
      fetch(DICT_URL + n.replace(/\//g, '__') + '.json?v=' + VER, { cache: 'force-cache' }).then(function (r) { if (!r.ok) throw 0; return r.text(); })
        .then(function (txt) { try { pruneLS(); LS.setItem(key, txt); } catch (e) {} setTimeout(next, 500); })['catch'](function () {});
    })();
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

  function miss() {}
  if (LS) try { LS.removeItem('gzl:miss'); LS.removeItem('gzl:hidebtn'); } catch (e) {}

  // ---------- 启动与导航 ----------
  var MO_OPT = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'open'] };
  var lastBody = null;
  function observe() { mo.disconnect(); mo.observe(document.documentElement, MO_OPT); }
  function start() {
    if (!document.documentElement) return setTimeout(start, 10);
    urgentFor(60000); // 直到 DOMContentLoaded 后再缩短
    observe();
    loadCommon(); // document-start：同步读取缓存的公共词库
    if (document.body) loadPage();
    function ready() {
      urgentUntil = 0; urgentFor(800);
      if (!pageTried) loadPage(); else { enqueue(document.body); schedule(); }
      lastBody = document.body;
      setTimeout(function () { (window.requestIdleCallback || setTimeout)(prefetch, 3000); }, 4000);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, false); else ready();
    var navT = 0, lastHref = location.href;
    function onNav() {
      var ev = arguments[0];
      if (location.href === lastHref && document.body === lastBody && !(ev && ev.type === 'pageshow' && ev.persisted)) return; // 未导航：不重扫
      clearTimeout(navT);
      navT = setTimeout(function () {
        lastBody = document.body; lastHref = location.href; urgentFor(1500); loadPage(); // 导航后的首轮不因滚动/触摸暂停
      }, 150);
    }
    var evs = ['turbo:load', 'turbo:render', 'pjax:end', 'soft-nav:end', 'soft-nav:react-done', 'popstate', 'pageshow'];
    for (var i = 0; i < evs.length; i++) { window.addEventListener(evs[i], onNav, false); document.addEventListener(evs[i], onNav, false); }
    // React 路由用 pushState/replaceState：包装一次（替代 1 秒轮询）
    var H = window.history;
    ['pushState', 'replaceState'].forEach(function (m) {
      var orig = H[m]; if (typeof orig !== 'function' || orig.__gzl) return;
      var w = function () { var r = orig.apply(this, arguments); if (location.href !== lastHref) onNav(); return r; };
      w.__gzl = 1; H[m] = w;
    });
    var po = { passive: true, capture: true };
    try { window.addEventListener('scroll', onBusy, po); window.addEventListener('touchstart', onBusy, po); window.addEventListener('touchmove', onBusy, po); window.addEventListener('wheel', onBusy, po); }
    catch (e) { window.addEventListener('scroll', onBusy, true); window.addEventListener('touchstart', onBusy, true); }
  }
  start();
})();
