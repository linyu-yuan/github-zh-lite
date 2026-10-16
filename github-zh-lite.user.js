// ==UserScript==
// @name         GitHub 中文化（iPhone 轻量版）
// @namespace    https://github.com/linyu-yuan/github-zh-lite
// @description  maboloshi/github-chinese 的 iPhone Safari（Stay / Userscripts）兼容版：翻译逻辑与词库保持原样，仅优化性能与兼容性。
// @version      3.0.0
// @author       linyu-yuan（翻译逻辑与词库：沙漠之子 maboloshi、楼教主 52cik 及 github-chinese 贡献者）
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
 * 基于 maboloshi/github-chinese 1.9.4.4-2026-09-27（https://github.com/maboloshi/github-chinese），GPL-3.0。
 * 翻译函数（transText / fetchTransResult / handleElementNode / 头部补丁等）逐行移植自 main.user.js，
 * 词库由 locals.js 原样拆分（tools/gen3.js），未增删词条。本脚本同样以 GPL-3.0 发布。
 */
(function () {
  'use strict';
  if (window.__gzl3) return; window.__gzl3 = 1;
  var VER = '3.0.0';
  var DICT_URL = 'https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/dict/';
  var CONF = {"p":"^\\/($|home|dashboard|feed|copilot|spark|signup|account_verifications|login\\/oauth|login|logout|sessions?|password_reset|orgs|explore|topics|notifications\\/subscriptions|notifications|watching|stars|issues|pulls|repos|search|trending|showcases|new\\/(import|project)|new|import|settings\\/(profile|admin|appearance|accessibility|notifications|billing|emails|security_analysis|security-log|security|auth|sessions|keys|ssh|gpg|organizations|enterprises|blocked_users|interaction_limits|code_review_limits|repositories|codespaces|models|codespaces\\/allow_permissions|deleted_repositories|packages|copilot|pages|replies|installations|apps\\/authorizations|reminders|sponsors-log|apps|(?:personal-access-|)tokens|developers|applications\\/new|applications|connections\\/applications|education\\/benefits|credentials)|settings|installations\\/new|marketplace|apps|account\\/(organizations\\/new|choose|upgrade|billing\\/history)|projects|redeem|discussions|collections|sponsors|sponsoring|github-copilot\\/(signup|free_signup|code-review-waitlist|pro)|codespaces|developer\\/register|features|security|sitemap|education|mcp)|^\\/users\\/[^\\/]+\\/(projects|packages|succession\\/invitation)","r":"^\\/[^\\/]+\\/[^\\/]+\\/(issues|pulls|pull|tree|watchers|stargazers|new|edit|delete|upload|find|models|wiki|branches|discussions|activity|rules|releases|packages|tags|labels|milestones?|compare|commit|blob|blame|actions(\\/metrics\\/(usage|performance))?|runs|deployments|security|pulse|community|forks|fork|import|graphs\\/(contributors|community|traffic|commit-activity|code-frequency)|network$|network\\/(dependencies|dependents|updates|members)|settings\\/(access|code_review_limits|interaction_limits|branches|branch_protection_rules|tag_protection|rules|actions|models\\/access-policy|hooks|copilot\\/(code_review|coding_agent)|environments|codespaces|pages|security_analysis|dependabot_rules|keys|secrets|variables|installations|notifications|key_links)|settings|transfer|projects\\/new|projects|pkgs|contribute|subscription|invitations|codespaces|attestations|custom-properties|reported_content|agents|tasks)","o":"^\\/[^\\/]+\\/[^\\/]+\\/(repositories\\/new|repositories|sponsoring|discussions|projects|packages|teams|new-team|people|outside-collaborators|pending_collaborators|dashboard|billing_managers\\/new|invitations?|settings\\/(profile|billing|roles|member_privileges|teams|import-export|blocked_users|interaction_limits|code_review_limits|moderators|repository-defaults|rules|codespaces|copilot|actions|hooks|discussions|packages|pages|projects|security_analysis|security|dependabot_rules|domains|secrets|variables|oauth_application_policy|installations|personal-access-token|reminders|sponsors-log|audit-log|deleted_repositories|applications\\/new|applications|apps\\/new|apps|publisher|policies\\/repositories|custom-properties|issue-fields|sandboxes)|topics|domain\\/new|audit-log\\/event_settings|billing\\/(history|plans)|policies\\/applications)|^\\/[^\\/]+\\/(enterprise_plan|sponsoring)","cd":["repository/new","repository/edit","new","new/import","orgs/repositories/new","repository/blob","repository/pull","marketplace","homepage","repository/issues","repository/commit","copilot","spark","repository/settings/rules","pulls"],"ign":{"page-profile":["span.p-nickname","span.p-name"],"page-profile/followers":["span.f4.Link--primary","span.Link--secondary.pl-1"],"page-profile/repositories":["a[itemprop=\"name codeRepository\"]"],"page-profile/stars":[".mb-1.d-inline-block > h3"],"repository":[".AppHeader-context-full","strong[itemprop=\"name\"]","div[data-testid=\"latest-commit\"]","tr.react-directory-row","p.f4.my-3","#translate-me",".my-3.d-flex.flex-items-center","article.markdown-body","li.mt-2"],"repository/tree":[".AppHeader-context-full","div.react-tree-show-tree-items","span.PRIVATE_TreeView-item-content-text","article.markdown-body","nav[data-testid=\"breadcrumbs\"]","div[data-testid=\"breadcrumbs-filename\"]","tr.react-directory-row"],"repository/blob":[".AppHeader-context-full","article.markdown-body","div.react-tree-show-tree-items","[id^=\"offset\"]","#highlighted-line-menu-positioner","#filter-results",".Text__StyledText-sc-17v1xeu-0","nav[data-testid=\"breadcrumbs\"]","div[data-testid=\"breadcrumbs-filename\"]"],"repository/issues":["div[aria-live=\"polite\"]>div.markdown-body",".markdown-body[data-team-hovercards-enabled=\"true\"]"],"repository/commit":["td.blob-code","span.ws-pre-wrap","h4[class^='Title-module__heading']","span.PRIVATE_TreeView-item-content-text"],"repository/pull":["td.blob-code",".js-full-logs-container","span.PRIVATE_TreeView-item-content-text","span.ActionList-item-label","div.commit-title","div.commit-desc","span.ws-pre-wrap","h4[class^='Title-module__heading']","div[class^=\"CommitHeader-module__commitMessageContainer\"]"],"repository/compare":["td.blob-code","span.PRIVATE_TreeView-item-content-text"],"repository/edit":[".cm-scroller","table"],"repository/new":[".cm-scroller","table"],"repository/actions":["table.highlight",".js-full-logs-container"],"repository/releases":["div.Box-body>div.markdown-body"],"repository/wiki":["#wiki-body","ul.list-style-none.mx-4.px-1"],"repository/security":["td.blob-code"],"orgs":["a[itemprop=\"name codeRepository\"]"],"search":["span.search-match","div.code-list","optgroup > option"],"dashboard":[".js-notice-dismiss",".TimelineItem","section.comment-body"],"gist":[".gist-content[itemprop=\"about\"]","div.js-blob-code-container","table.js-diff-table"],"topics":["h3.f3.color-fg-muted.text-normal.lh-condensed"],"marketplace":[".markdown-body"],"copilot":[".cm-line"],"spark":[".Table",".monaco-editor"],"*":["header.GlobalNav","header.GlobalNav [class*=\"Search-module__\"]","qbsearch-input","#__primerPortalRoot__",".comment-body",".js-preview-body",".markdown-title","span.ActionListItem-descriptionWrap","CODE","SCRIPT","STYLE","LINK","IMG","MARKED-TEXT","PRE","KBD","SVG","MARK",".highlight",".notranslate","[translate=\"no\"]","input","textarea","[contenteditable=\"\"]","[contenteditable=\"true\"]","[contenteditable=\"plaintext-only\"]","div.styled-input-content"]},"ignM":{"repository/new":[".cm-scroller"],"repository/edit":[".cm-scroller","table"],"repository/pull":["td.blob-code",".js-full-logs-container","span.PRIVATE_TreeView-item-content-text","span.ActionList-item-label","div.commit-title","div.commit-desc","span.ws-pre-wrap","h4[class^='Title-module__heading']","div[class^=\"CommitHeader-module__commitMessageContainer\"]"],"repository/compare":["tbody",".js-preview-body","span.PRIVATE_TreeView-item-content-text"],"repository/commit":["td.blob-code","div.diff-text-inner","span.PRIVATE_TreeView-item-content-text"],"repository/blob":["#highlighted-line-menu-positioner","#repos-sticky-header","nav[data-testid=\"breadcrumbs\"]","div[data-testid=\"breadcrumbs-filename\"]"],"repository/blame":["#highlighted-line-menu-positioner"],"repository":[".AppHeader-context","table","article.markdown-body"],"repository/tree":["article.markdown-body","nav[data-testid=\"breadcrumbs\"]","div[data-testid=\"breadcrumbs-filename\"]","tr.react-directory-row"],"repository/releases":[".Box-footer"],"repository/issues":["div[aria-live=\"polite\"]>div.markdown-body",".markdown-body[data-team-hovercards-enabled=\"true\"]"],"repository/actions":["table.highlight",".js-full-logs-container"],"repository/security":["td.blob-code"],"copilot":[".cm-line"],"spark":[".cm-line"],"*":["header.GlobalNav","header.GlobalNav [class*=\"Search-module__\"]","qbsearch-input",".highlight",".notranslate","[translate=\"no\"]","input","textarea","[contenteditable=\"\"]","[contenteditable=\"true\"]","[contenteditable=\"plaintext-only\"]","div.QueryBuilder-StyledInputContainer","#qb-input-query span","div.styled-input-content"]},"nav":{"Overview":"概况","Repositories":"仓库","Code":"代码","Issues":"议题","Pull requests":"拉取请求","Discussions":"讨论","Actions":"操作","Projects":"项目","Wiki":"Wiki","Security":"安全","Security and quality":"安全和质量","Insights":"洞察","Settings":"设置","Packages":"软件包","Releases":"发行版","Stars":"星标","Agents":"智能体","Models":"模型","Set status":"状态设置","Profile":"个人资料","Gists":"代码片段","Copilot settings":"Copilot 设置","Feature preview":"功能预览","Appearance":"外观","Accessibility":"无障碍","Try Enterprise":"试用企业版","Sign out":"退出","Free":"免费","Type / to search":"输入 / 搜索","Search code, repositories, users, issues, pull requests...":"搜索代码、仓库、用户、议题、拉取请求...","Search":"搜索","Clear":"清除","Search syntax tips":"搜索语法提示","Give feedback":"反馈","Saved searches":"保存搜索","Use saved searches to filter your results more quickly":"使用保存的搜索快速筛选结果","Create saved search":"创建保存的搜索","Provide feedback":"提供反馈","Submit feedback":"提交反馈","Cancel":"取消","Name":"名称","Query":"查询","0 suggestions.":"0 条建议。","To see all available qualifiers, see our documentation.":"要查看全部可用限定符，请参阅文档。","People":"成员","Teams":"团队","Sponsoring":"赞助","Followers":"关注者","Following":"正在关注","Activity":"活动","Branches":"分支","Tags":"标签","Codespaces":"代码空间","Dashboard":"仪表板","Explore":"探索","Marketplace":"市场","Sponsors":"赞助者","Organizations":"组织","Enterprises":"企业版","Billing":"账单","Copilot":"GitHub Copilot"},"common":"d-75c504999307","navFile":"nav-9f62d465e1e8","pages":{"title":"d-687114886b1a","orgs-public":"d-653f7adcfc82","page-dashboard":"d-bdff1a5a8731","dashboard":"d-bdff1a5a8731","feed":"d-bdff1a5a8731","orgs/dashboard":"d-bdff1a5a8731","page-profile-public":"d-34b0c4279341","page-profile/achievements":"d-34b0c4279341","page-profile/followers":"d-34b0c4279341","page-profile/following":"d-34b0c4279341","page-profile":"d-c76abe6eb8af","page-profile/overview":"d-c76abe6eb8af","page-profile/repositories":"d-d12f741a47fa","page-profile/projects":"d-b0169ce5f69f","page-profile/sponsoring":"d-6757c923efb1","page-profile/packages":"d-a177420188a1","page-profile/sponsors":"d-a13bef892522","page-profile/stars":"d-fdff14feca66","confirm-access":"d-6b3ce908b8a6","payment-module":"d-6e4ae9ed0274","settings-menu":"d-8d998a177b83","orgs-settings-menu":"d-cf1d3eb9befe","settings/profile":"d-56d223322449","settings":"d-56d223322449","settings/admin":"d-919770ead176","succession/invitation":"d-7246788d7d39","settings/appearance":"d-2cc6f1597337","settings/accessibility":"d-953102478fa1","settings/notifications":"d-2dad171f1758","settings/billing":"d-e841289d8e1b","account/billing/history":"d-e841289d8e1b","orgs/settings/billing":"d-e841289d8e1b","orgs/billing_managers/new":"d-e841289d8e1b","orgs/billing/history":"d-e841289d8e1b","orgs/billing/plans":"d-e841289d8e1b","settings/education/benefits":"d-297178ec8cae","settings/emails":"d-8a839a55cce4","settings/security":"d-01f42c0cecc0","settings/auth":"d-8dcf5c4faad7","settings/sessions":"d-6401da37d718","settings/keys":"d-347f080406ac","settings/ssh":"d-88edb0a042c5","settings/gpg":"d-3c3104596c10","settings/organizations":"d-e291d885c637","settings/enterprises":"d-f7470082ca1e","settings/blocked_users":"d-3cc0ea64ab1a","settings/interaction_limits":"d-8557ea49a035","settings/code_review_limits":"d-b6196a5612a6","settings/repositories":"d-01fe5f8268d6","settings/deleted_repositories":"d-97e12dfd435e","settings/codespaces":"d-0e883e74ded8","settings/models":"d-a0d6154abd46","settings/packages":"d-f4af8507d30c","orgs/settings/packages":"d-f4af8507d30c","settings/copilot":"d-1bc1f67e6070","settings/pages":"d-878541d2c1f4","orgs/settings/pages":"d-878541d2c1f4","settings/replies":"d-7b9022f9d28c","settings/security_analysis":"d-75501fefcda7","settings/installations":"d-da1cc4bb084a","settings/apps/authorizations":"d-da1cc4bb084a","settings/applications":"d-da1cc4bb084a","settings/connections/applications":"d-da1cc4bb084a","orgs/settings/installations":"d-da1cc4bb084a","orgs/policies/applications":"d-da1cc4bb084a","settings/reminders":"d-1c791ae43556","settings/security-log":"d-3e0d0c0de43b","settings/sponsors-log":"d-1dea42dba40f","settings/apps":"d-5e3dfa965907","orgs/settings/apps/new":"d-5e3dfa965907","settings/developers":"d-ca362c19790d","settings/applications/new":"d-734c6dd68e97","orgs/settings/applications/new":"d-734c6dd68e97","settings/personal-access-tokens":"d-064e4aa6b1e3","settings/tokens":"d-064e4aa6b1e3","settings/credentials":"d-238893c80ffe","repository-public":"d-5b8496214531","page-new-repo":"d-44222bb33024","new":"d-44222bb33024","new/import":"d-44222bb33024","repository/import":"d-44222bb33024","repository/fork":"d-44222bb33024","orgs/repositories/new":"d-44222bb33024","repository":"d-cb3c04e1c9bf","repository/tree":"d-cb3c04e1c9bf","repository/milestones":"d-43a18520d6af","repository/milestone":"d-43a18520d6af","repository/pull_issue_public":"d-100b9750335b","repository/issues":"d-a41dae9e30af","repository/labels":"d-a41dae9e30af","repository/pulls":"d-e52d1169a28c","repository/pull":"d-7f09f6fa9b7f","repository/compare":"d-80395744051a","repository/commit":"d-5f061ccf2fa9","repository/blob":"d-a1317b1b8757","repository/blame":"d-a1317b1b8757","repository/discussions":"d-d4160bf4db08","repository/orgs/discussions":"d-d4160bf4db08","repository/actions":"d-7cc661387c7b","repository/runs":"d-7cc661387c7b","repository/deployments":"d-94c1fa25fa29","repository/attestations":"d-375a7b308aad","repository/watchers":"d-60bb6fee40f8","repository/stargazers":"d-bbb7ab461290","repository/new":"d-1e842c13ded3","repository/edit":"d-1e842c13ded3","repository/delete":"d-1e842c13ded3","repository/upload":"d-1e842c13ded3","repository/find":"d-0e67f9103607","repository/models":"d-c4f906ffd4f7","repository/wiki":"d-0e72c77b6621","repository/branches":"d-90c6b1590f00","repository/activity":"d-bc3806a99a1a","repository/releases":"d-010b00ddc3f1","repository/tags":"d-010b00ddc3f1","repository/packages":"d-2ae3be52ba66","repository/pkgs":"d-17f6f9ca17fa","packages":"d-3e5f4357cec9","repository/security":"d-54e35ea71f9b","repository/contribute":"d-473302ab0a38","repository/subscription":"d-44235cfcb22d","repository/invitations":"d-aadab89b9c95","repository/tasks":"d-ef1304090f0e","repository-insights-menu":"d-370b9a63e5a4","repository/pulse":"d-ffad5a0e6913","repository/graphs/contributors":"d-578d3c4bf279","repository/graphs/community":"d-ab3d5f7b9ed0","repository/community":"d-1ba5ef21e837","repository/graphs/traffic":"d-ca0404b0c681","repository/graphs/commit-activity":"d-fd1130d20873","repository/graphs/code-frequency":"d-8be2ca3ade39","repository/network/dependencies":"d-1476a29817a4","repository/network/dependents":"d-6a8611865879","repository/network/updates":"d-9e66ca8668a5","repository/network":"d-7af0dd1371b2","repository/network/members":"d-0efbc148e5cd","repository/forks":"d-24254fcbdd9a","repository-settings-menu":"d-8f9f58252917","repository/settings":"d-0f3cdd99dae9","repository/settings/access":"d-0a8f006929c4","repository/settings/interaction_limits":"d-df4507a583b2","repository/settings/code_review_limits":"d-1a7c7dac7484","repository/settings/branches":"d-eb4d9ae6f3ce","repository/settings/branch_protection_rules":"d-71bf63f7a4d4","repository/settings/tag_protection":"d-9c453c4f5900","repository/settings/rules":"d-360c7f291dd5","orgs/settings/rules":"d-360c7f291dd5","repository/rules":"d-360c7f291dd5","repository/settings/actions":"d-826ab60adec7","repository/settings/models/access-policy":"d-5aeba4d5ec4d","repository/settings/hooks":"d-74a7a9c3ac5b","orgs/settings/hooks":"d-74a7a9c3ac5b","repository/settings/copilot/code_review":"d-21015ac02252","repository/settings/copilot/coding_agent":"d-0282a921e970","repository/settings/environments":"d-6effde97c88c","repository/settings/codespaces":"d-8adfcfff0b45","repository/settings/pages":"d-ae0d31e6cbaf","repository/settings/security_analysis":"d-35b425fb1f6f","repository/settings/keys":"d-12c51d407129","repository/settings/secrets":"d-be27d9b346e1","repository/settings/variables":"d-be27d9b346e1","repository/settings/installations":"d-601152eda0d9","repository/settings/notifications":"d-7af6d964116e","repository/settings/key_links":"d-72c4de1950ac","repository/transfer":"d-1eb8c1939143","repository/codespaces":"d-0da7cbd32621","repository/custom-properties":"d-1a20ff894193","homepage":"d-ea82a7c25107","home":"d-ea82a7c25107","session-authentication":"d-787be666b593","login":"d-787be666b593","logout":"d-787be666b593","session":"d-787be666b593","sessions":"d-787be666b593","password_reset":"d-787be666b593","signup":"d-5597cb4f2113","account_verifications":"d-b71cabcc891c","notifications":"d-14015f1ab659","watching":"d-d369bafbbdeb","notifications/subscriptions":"d-6ca4759a974d","stars":"d-70a2b6554395","issues":"d-62d3f8dbb7bd","pulls":"d-0442b060fb80","repos":"d-304b5288d870","search":"d-9050837b4c2b","repository/search":"d-9050837b4c2b","discussions":"d-0f5c1643f739","gist":"d-8cbcec26853e","login/oauth":"d-b4c75f235ea7","explore":"d-259f0fc7c717","topics":"d-10d671f462ad","trending":"d-f5bab606045a","collections":"d-a9ec4d8f51ea","sponsors":"d-6c67d2867f26","showcases":"d-a69cd5e615a1","account/organizations/new":"d-78f0f8c69896","account/choose":"d-7f3797da9f16","account/upgrade":"d-278a05c93d29","marketplace":"d-ddf965260ef5","apps":"d-56bc672010a0","orgs":"d-80b92166b494","orgs/repositories":"d-d12f741a47fa","orgs/projects":"d-b0169ce5f69f","orgs/packages":"d-a177420188a1","orgs/people":"d-98fb050b1877","orgs/outside-collaborators":"d-98fb050b1877","orgs/pending_collaborators":"d-98fb050b1877","orgs/teams":"d-c71109123c88","orgs/new-team":"d-c71109123c88","orgs/invitations":"d-7e8acf122610","orgs/invitation":"d-477d639481b1","orgs/domain/new":"d-2dec17455170","orgs/settings/profile":"d-ca5fa19834b6","orgs/settings/policies/repositories":"d-250bac7ef5ea","orgs/settings/roles":"d-1c9762b1ce70","orgs/settings/member_privileges":"d-ec1767a03099","orgs/settings/teams":"d-271cb73d6fec","orgs/settings/import-export":"d-ca2af2eede80","orgs/settings/blocked_users":"d-064a6a6d53f0","orgs/settings/interaction_limits":"d-d33045842e02","orgs/settings/code_review_limits":"d-b04671fc2526","orgs/settings/moderators":"d-d51fc4c59503","orgs/settings/repository-defaults":"d-82c477966a07","orgs/topics":"d-2552ff423074","orgs/settings/codespaces":"d-c27b768b5668","orgs/settings/sandboxes":"d-a3cdd333e033","orgs/settings/custom-properties":"d-5f5bef8429fc","orgs/settings/issue-fields":"d-7d0adaaf9933","orgs/settings/copilot":"d-fb8cf892ec3e","orgs/settings/actions":"d-030dca45dc78","orgs/settings/discussions":"d-34da351cbd89","orgs/settings/projects":"d-2893be737805","orgs/settings/security":"d-7ba552a9cba5","orgs/settings/security_analysis":"d-2fff34e36b95","orgs/settings/dependabot_rules":"d-56ca7ee20ece","repository/settings/dependabot_rules":"d-56ca7ee20ece","orgs/settings/domains":"d-ebb856e0313b","orgs/settings/secrets":"d-c53ae7fd7a18","orgs/settings/variables":"d-c53ae7fd7a18","orgs/settings/oauth_application_policy":"d-db713c9688d8","orgs/settings/personal-access-token":"d-c90510d73f6c","orgs/settings/reminders":"d-74bf1628a2b7","orgs/settings/sponsors-log":"d-e5fd33c2f1f0","orgs/settings/audit-log":"d-48ec34e1d398","orgs/audit-log/event_settings":"d-48ec34e1d398","orgs/settings/deleted_repositories":"d-e0fe876adae7","orgs/settings/applications":"d-013647ca0131","orgs/settings/apps":"d-121b5c3e2b5a","orgs/settings/publisher":"d-e5724bcecfcd","projects":"d-788b99771071","new/project":"d-788b99771071","repository/projects/new":"d-788b99771071","repository/projects":"d-788b99771071","redeem":"d-f69253eda13f","github-copilot/signup":"d-df5e51ac9da2","github-copilot/free_signup":"d-5c2358fc07ff","github-copilot/pro":"d-a23c26e215ef","orgs/enterprise_plan":"d-3507962fdb6e","codespaces":"d-12245d717aba","codespaces/allow_permissions":"d-ccb59a542a4c","developer/register":"d-2886d3d4eb13","features":"d-dae420daa7b4","status":"d-5e5c9880c9c8","skills":"d-d082bcf353dd","orgs/sponsoring":"d-090e408b2312","organizations/plan":"d-37f72b87b72f","repo-actions-merics-public":"d-210e95d56098","repository/actions/metrics/usage":"d-c3955bdc84fb","repository/actions/metrics/performance":"d-9b3e533e9f57","copilot":"d-c6cef2b1a117","github-copilot/code-review-waitlist":"d-5b08c79b1b41","spark":"d-27087a73be2f","sitemap":"d-7a1ab5c6f05d","education":"d-aa0e604fe4c3","mcp":"d-fa2df9608433","repository/agents":"d-6f49fcce0a32"}};
  var I18N = { 'zh-CN': { 'public': { 'static': {}, 'time-regexp': [] } }, conf: {} }; // 供词库函数引用
  function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
  function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
  function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
  function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
  var FN = [function (all, prefix, week, date1, month, date2, year) {
    var prefixKey = {
      "Updated ": "更新于 ",
      "Commits on ": "提交于 ",
      "Joined on ": "加入于 "
    };
    var weekKey = {
      "Sun": "周日",
      "Mon": "周一",
      "Tue": "周二",
      "Wed": "周三",
      "Thu": "周四",
      "Fri": "周五",
      "Sat": "周六"
    };
    var monthKey = {
      "Jan": "1月",
      "Feb": "2月",
      "Mar": "3月",
      "Apr": "4月",
      "May": "5月",
      "Jun": "6月",
      "Jul": "7月",
      "Aug": "8月",
      "Sep": "9月",
      "Oct": "10月",
      "Nov": "11月",
      "Dec": "12月"
    };
    var date = date1 ? date1 : date2;
    var formattedDate = (year ? year + '年' : '') + monthKey[month.substring(0, 3)] + (date ? date + '日' : '');
    var formattedWeek = week ? '，' + weekKey[week.substring(0, 3)] : '';
    return (prefixKey[prefix] ? prefixKey[prefix] : '') + formattedDate + formattedWeek;
  }, function (all, prefix, count, unit, suffix) {
    if (all === 'now') {
      return '现在';
    }
    if (all === 'just now') {
      return '刚刚';
    }
    if (all === 'last month') {
      return '上个月';
    }
    if (all === 'yesterday') {
      return '昨天';
    }
    if (count[0] === 'a') {
      count = '1';
    }
    var unitKey = {
      second: '秒',
      minute: '分钟',
      hour: '小时',
      day: '天',
      month: '个月',
      year: '年'
    };
    if (suffix) {
      return (prefix === 'about' || prefix === 'almost' ? '大约 ' : prefix === 'less than' ? '不到 ' : '') + count + ' ' + unitKey[unit] + (prefix === 'over' ? '多之前' : '之前');
    } else {
      return count + ' ' + unitKey[unit] + (prefix === 'in' ? '之内' : '之前');
    }
  }, function (all, prefix, minute, second) {
    all = minute ? minute + '分' + second + '秒' : second + '秒';
    return prefix ? all + '之内' : all;
  }, function (all, date1, week, month, year1, date2, year2) {
    var weekKey = {
      "Sun": "周日",
      "Mon": "周一",
      "Tue": "周二",
      "Wed": "周三",
      "Thu": "周四",
      "Fri": "周五",
      "Sat": "周六"
    };
    var monthKey = {
      "Jan": "1月",
      "Feb": "2月",
      "Mar": "3月",
      "Apr": "4月",
      "May": "5月",
      "Jun": "6月",
      "Jul": "7月",
      "Aug": "8月",
      "Sep": "9月",
      "Oct": "10月",
      "Nov": "11月",
      "Dec": "12月"
    };
    var date = date1 ? date1 : date2;
    var year = year1 ? year1 : year2;
    return (year ? year + '年' : '') + monthKey[month.substring(0, 3)] + (date ? date + '日' : '') + (week ? ', ' + weekKey[week.substring(0, 3)] : '');
  }, function (all, prefix, count, unit, suffix) {
    if (all === 'now') {
      return '现在';
    }
    if (all === 'just now') {
      return '刚刚';
    }
    if (all === 'last year') {
      return '最近 1 年';
    }
    if (all === 'last month') {
      return '上个月';
    }
    if (all === 'last week') {
      return '上周';
    }
    if (all === 'yesterday') {
      return '昨天';
    }
    if (count[0] === 'a') {
      count = '1';
    }
    var unitKey = {
      second: '秒',
      minute: '分钟',
      hour: '小时',
      day: '天',
      month: '个月',
      year: '年',
      week: '周'
    };
    if (suffix) {
      return (prefix === 'about' || prefix === 'almost' ? '大约 ' : prefix === 'less than' ? '不到 ' : '') + count + ' ' + unitKey[unit] + (prefix === 'over' ? '多之前' : '之前');
    } else {
      return count + ' ' + unitKey[unit] + (prefix === 'in' ? '之内' : '之前');
    }
  }, function (all, count, suffix) {
    var suffixKey = {
      y: '年',
      h: '小时',
      d: '天',
      w: '周',
      m: '个月'
    };
    return count + ' ' + suffixKey[suffix] + '之前';
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        pattern = _ref2[0],
        replacement = _ref2[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u8BE5\u7EC4\u7EC7\u5DF2\u7531\u7BA1\u7406\u5458\u4E8E ".concat(translatedDate, " \u5B58\u6863\u3002\u4E0D\u518D\u7EF4\u62A4\u3002");
  }, function (all, reacted) {
    var reactedKey = {
      'thumbs up': "点赞",
      'thumbs down': "点踩",
      laugh: "大笑",
      hooray: "欢呼",
      confused: "表示困惑",
      heart: "比心",
      rocket: "发送火箭",
      eyes: "表示关注"
    };
    return '您' + reactedKey[reacted];
  }, function (all, number, reacted) {
    var reactedKey = {
      'thumbs up': "点赞",
      'thumbs down': "点踩",
      laugh: "大笑",
      hooray: "欢呼",
      confused: "表示困惑",
      heart: "比心",
      rocket: "发送火箭",
      eyes: "表示关注"
    };
    return number + ' 人' + reactedKey[reacted];
  }, function (all, num, compare) {
    var compareKey = {
      ahead: '早',
      behind: '晚'
    };
    return '- ' + compareKey[compare] + num + '小时';
  }, function (match, number, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
        pattern = _ref4[0],
        replacement = _ref4[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return number === 'No' ? "".concat(translatedDate, "\uFF0C\u65E0\u8D21\u732E") : "".concat(translatedDate, "\uFF0C") + number + " \u6B21\u8D21\u732E";
  }, function (all, m, d) {
    var mKey = {
      "Jan": "1月",
      "Feb": "2月",
      "Mar": "3月",
      "Apr": "4月",
      "May": "5月",
      "Jun": "6月",
      "Jul": "7月",
      "Aug": "8月",
      "Sep": "9月",
      "Oct": "10月",
      "Nov": "11月",
      "Dec": "12月"
    };
    return mKey[m] + d + "日";
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
        pattern = _ref6[0],
        replacement = _ref6[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u8D5E\u52A9\u81EA ".concat(translatedDate);
  }, function (match, p1, p2) {
    var _I18N;
    var dateRegExp = ((_I18N = I18N) === null || _I18N === void 0 || (_I18N = _I18N["zh-CN"]) === null || _I18N === void 0 || (_I18N = _I18N["public"]) === null || _I18N === void 0 ? void 0 : _I18N["time-regexp"]) || [];
    var translatedDate = p2;
    if (Array.isArray(dateRegExp)) {
      translatedDate = dateRegExp.reduce(function (acc, _ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
          pattern = _ref8[0],
          replacement = _ref8[1];
        if (pattern instanceof RegExp) {
          return acc.replace(pattern, replacement);
        }
        return acc;
      }, p2);
    }
    return "".concat(p1, " \u5929\u540E\uFF08").concat(translatedDate, "\uFF09\u91CD\u7F6E");
  }, function (match, p1, p2) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedP1 = dateRegExp.reduce(function (acc, _ref9) {
      var _ref0 = _slicedToArray(_ref9, 2),
        pattern = _ref0[0],
        replacement = _ref0[1];
      return acc.replace(pattern, replacement);
    }, p1);
    var translatedP2 = dateRegExp.reduce(function (acc, _ref1) {
      var _ref10 = _slicedToArray(_ref1, 2),
        pattern = _ref10[0],
        replacement = _ref10[1];
      return acc.replace(pattern, replacement);
    }, p2);
    return "".concat(translatedP1, "-").concat(translatedP2);
  }, function (match, p1, p2, p3) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedP1 = dateRegExp.reduce(function (acc, _ref11) {
      var _ref12 = _slicedToArray(_ref11, 2),
        pattern = _ref12[0],
        replacement = _ref12[1];
      return acc.replace(pattern, replacement);
    }, p1);
    var translatedP2 = dateRegExp.reduce(function (acc, _ref13) {
      var _ref14 = _slicedToArray(_ref13, 2),
        pattern = _ref14[0],
        replacement = _ref14[1];
      return acc.replace(pattern, replacement);
    }, p2);
    return "\u7EDF\u8BA1\u65F6\u95F4\u6BB5\uFF1A".concat(translatedP1, "-").concat(translatedP2, "\u3002\u672C\u6708\u914D\u989D\u5C06\u5728").concat(p3, "\u5929\u5185\u91CD\u7F6E\u3002");
  }, function (match, p1, p2, p3) {
    switch (p1) {
      case 'Today':
        return '时间段：今天';
      case 'Current month':
        return '时间段：本月';
      case 'Last month':
        return '时间段：上个月';
      case "This year (".concat(p2, ")"):
        return "\u65F6\u95F4\u6BB5\uFF1A\u4ECA\u5E74\uFF08".concat(p2, "\uFF09");
      case "Last year (".concat(p3, ")"):
        return "\u65F6\u95F4\u6BB5\uFF1A\u53BB\u5E74\uFF08".concat(p3, "\uFF09");
      default:
        return match;
    }
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref15) {
      var _ref16 = _slicedToArray(_ref15, 2),
        pattern = _ref16[0],
        replacement = _ref16[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "".concat(translatedDate, "\uFF08UTC\u65F6\u95F4\uFF09");
  }, function (match, s1, p1) {
    var s1Key = {
      'Usage': '用量',
      'actions': '操作',
      'codespaces': '代码空间',
      'Codespaces storage': '代码空间存储',
      'Codespaces compute 2-core': '代码空间 - 双核',
      'Actions Windows': '操作 Windows',
      'Actions Linux': '操作 Linux',
      'Actions macOS 3-core': '操作 macOS 三核',
      'Actions storage': "操作存储",
      'All other': '其他'
    };
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref17) {
      var _ref18 = _slicedToArray(_ref17, 2),
        pattern = _ref18[0],
        replacement = _ref18[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "".concat(translatedDate) + s1Key[s1];
  }, function (match, p1, p2) {
    var hour = parseInt(p1, 10);
    if (p2 === "PM" && hour !== 12) {
      hour += 12;
    } else if (p2 === "AM" && hour === 12) {
      hour = 0;
    }
    return "".concat(hour, ":00");
  }, function (all, num, time) {
    var numKey = {
      "three": "三",
      "four": "四",
      "five": "五"
    };
    var timeKey = {
      "today": "今天",
      "this month": "这个月",
      "last month": "上个月",
      "this year": "今年",
      "last year": "去年"
    };
    return timeKey[time] + "排名前" + numKey[num] + "的仓库";
  }, function (all, group) {
    var groupKey = {
      'None': '无',
      'Product': '产品',
      'SKU': 'SKU',
      'Repository': '仓库',
      'Models': '模型'
    };
    return '分组：' + groupKey[group];
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref19) {
      var _ref20 = _slicedToArray(_ref19, 2),
        pattern = _ref20[0],
        replacement = _ref20[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "".concat(translatedDate);
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref21) {
      var _ref22 = _slicedToArray(_ref21, 2),
        pattern = _ref22[0],
        replacement = _ref22[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u76F4\u5230 ".concat(translatedDate, "\u3002");
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref23) {
      var _ref24 = _slicedToArray(_ref23, 2),
        pattern = _ref24[0],
        replacement = _ref24[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u63D0\u4EA4\u4E8E ".concat(translatedDate);
  }, function (match, p1, p2) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var dateAdded = dateRegExp.reduce(function (acc, _ref25) {
      var _ref26 = _slicedToArray(_ref25, 2),
        pattern = _ref26[0],
        replacement = _ref26[1];
      return acc.replace(pattern, replacement);
    }, p1);
    var dateLastUsed = dateRegExp.reduce(function (acc, _ref27) {
      var _ref28 = _slicedToArray(_ref27, 2),
        pattern = _ref28[0],
        replacement = _ref28[1];
      return acc.replace(pattern, replacement);
    }, p2);
    return "\u6DFB\u52A0\u4E8E ".concat(dateAdded, " | \u6700\u540E\u4F7F\u7528 ").concat(dateLastUsed);
  }, function (all, week, month, day, year) {
    var weekKey = {
      "Sun": "周日",
      "Mon": "周一",
      "Tue": "周二",
      "Wed": "周三",
      "Thu": "周四",
      "Fri": "周五",
      "Sat": "周六"
    };
    var monthKey = {
      "Jan": "1月",
      "Feb": "2月",
      "Mar": "3月",
      "Apr": "4月",
      "May": "5月",
      "Jun": "6月",
      "Jul": "7月",
      "Aug": "8月",
      "Sep": "9月",
      "Oct": "10月",
      "Nov": "11月",
      "Dec": "12月"
    };
    return '有效期至 ' + year + '年' + monthKey[month] + day + '日，' + weekKey[week];
  }, function (match, d, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref29) {
      var _ref30 = _slicedToArray(_ref29, 2),
        pattern = _ref30[0],
        replacement = _ref30[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return d + "\u5929\uFF08".concat(translatedDate, "\uFF09");
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref31) {
      var _ref32 = _slicedToArray(_ref31, 2),
        pattern = _ref32[0],
        replacement = _ref32[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u6B64\u4ED3\u5E93\u5DF2\u7531\u6240\u6709\u8005\u4E8E".concat(translatedDate, "\u5B58\u6863\u3002\u5B83\u73B0\u5728\u662F\u53EA\u8BFB\u7684\u3002");
  }, function (all, reacted) {
    var reactedKey = {
      'thumbs up': "点赞",
      'thumbs down': "点踩",
      laugh: "大笑",
      hooray: "欢呼",
      confused: "表示困惑",
      heart: "比心",
      rocket: "发送火箭",
      eyes: "表示关注"
    };
    return reactedKey[reacted];
  }, function (all, lic, num) {
    var licKey = {
      'Unknown': '未知'
    };
    return licKey[lic] + '和另外' + num + '个许可证';
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref33) {
      var _ref34 = _slicedToArray(_ref33, 2),
        pattern = _ref34[0],
        replacement = _ref34[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u63D0\u4EA4\u4E8E".concat(translatedDate);
  }, function (all, stat) {
    var statKey = {
      Open: '打开',
      Closed: '关闭',
      Locked: '锁定',
      Unlocked: '未锁定',
      Answered: '已答复',
      Unanswered: '未答复',
      " ,": "，"
    };
    return '筛选：' + statKey[stat];
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref35) {
      var _ref36 = _slicedToArray(_ref35, 2),
        pattern = _ref36[0],
        replacement = _ref36[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u53D1\u5E03\u4E8E ".concat(translatedDate, " \xB7 \u6458\u8981");
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref37) {
      var _ref38 = _slicedToArray(_ref37, 2),
        pattern = _ref38[0],
        replacement = _ref38[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u521D\u6B21\u68C0\u6D4B ".concat(translatedDate);
  }, function (all, user, cont) {
    var contKey = {
      Commits: '提交',
      Additions: '添加数量',
      Deletions: '删除数量'
    };
    return user + ' 的' + contKey[cont];
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref39) {
      var _ref40 = _slicedToArray(_ref39, 2),
        pattern = _ref40[0],
        replacement = _ref40[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "".concat(translatedDate, "\u5F53\u5468");
  }, function (match, p1, p2, p3) {
    var translatedP1 = I18N["zh-CN"]["public"]["static"][p1] || p1;
    var translatedP2 = I18N["zh-CN"]["public"]["static"][p2] || p2;
    return "".concat(p3, "\u5E74 ").concat(translatedP1, "-").concat(translatedP2);
  }, function (all, d, m) {
    var mKey = {
      "Jan": "1月",
      "Feb": "2月",
      "Mar": "3月",
      "Apr": "4月",
      "May": "5月",
      "Jun": "6月",
      "Jul": "7月",
      "Aug": "8月",
      "Sep": "9月",
      "Oct": "10月",
      "Nov": "11月",
      "Dec": "12月"
    };
    return mKey[m] + d + "日";
  }, function (all, month, day) {
    var monthKey = {
      "Jan": "1月",
      "Feb": "2月",
      "Mar": "3月",
      "Apr": "4月",
      "May": "5月",
      "Jun": "6月",
      "Jul": "7月",
      "Aug": "8月",
      "Sep": "9月",
      "Oct": "10月",
      "Nov": "11月",
      "Dec": "12月"
    };
    return '次提交本周，' + monthKey[month] + day + '日';
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref41) {
      var _ref42 = _slicedToArray(_ref41, 2),
        pattern = _ref42[0],
        replacement = _ref42[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "".concat(translatedDate, "\u5F53\u5468");
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref43) {
      var _ref44 = _slicedToArray(_ref43, 2),
        pattern = _ref44[0],
        replacement = _ref44[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\xB7 \u81EA\u52A8\u68C0\u6D4B\u4E8E ".concat(translatedDate);
  }, function (all, type, num) {
    var typeKey = {
      "Active": "活跃",
      "Inactive": "不活跃",
      "Network": "网络",
      "Archived": "存档",
      "Starred": "星标"
    };
    return typeKey[type] + ' ' + num;
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref45) {
      var _ref46 = _slicedToArray(_ref45, 2),
        pattern = _ref46[0],
        replacement = _ref46[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u9080\u8BF7\u4E8E".concat(translatedDate);
  }, function (match, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref47) {
      var _ref48 = _slicedToArray(_ref47, 2),
        pattern = _ref48[0],
        replacement = _ref48[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u6700\u540E\u4F7F\u7528".concat(translatedDate);
  }, function (all, day, month, year) {
    var monthKey = {
      "Jan": "1月",
      "Feb": "2月",
      "Mar": "3月",
      "Apr": "4月",
      "May": "5月",
      "Jun": "6月",
      "Jul": "7月",
      "Aug": "8月",
      "Sep": "9月",
      "Oct": "10月",
      "Nov": "11月",
      "Dec": "12月"
    };
    return year + '年' + monthKey[month] + parseInt(day) + '日';
  }, function (all, type, scope, period) {
    var typeKey = {
      'minutes': '总分钟数',
      'job runs': '作业运行总数'
    };
    var scopeKey = {
      'organization': '该组织',
      'repository': '该仓库'
    };
    var periodKey = {
      "current week (mon-sun)": "本周（周一 ~ 周日）",
      "current month": "本月",
      "last month": "上个月",
      "last 30 days": "最近 30 天",
      "last 90 days": "最近 90 天",
      "last year": "最近一年",
      "custom": "自定义时间段"
    };
    return periodKey[period] + scopeKey[scope] + '所有工作流的' + typeKey[type];
  }, function (all, period) {
    var periodKey = {
      "Current week (Mon-Sun)": "本周（周一 ~ 周日）",
      "Current month": "本月",
      "Last month": "上个月",
      "Last 30 days": "最近 30 天",
      "Last 90 days": "最近 90 天",
      "Last year": "最近一年",
      "Custom": "自定义"
    };
    return '范围：' + periodKey[period];
  }, function (all, type, period) {
    var typeKey = {
      'Average run time of': '平均运行时长',
      'Average queue time of': '平均等待时长',
      'Failure rate across': '作业失败率',
      'Total minutes used across failed': '作业失败次数'
    };
    var periodKey = {
      "current week (mon-sun)": "本周（周一 ~ 周日）",
      "current month": "本月",
      "last month": "上个月",
      "last 30 days": "最近 30 天",
      "last 90 days": "最近 90 天",
      "last year": "最近一年",
      "custom": "自定义时间段"
    };
    return periodKey[period] + '该仓库所有工作流程的' + typeKey[type];
  }, function (match, p1, p2, min, p3) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref49) {
      var _ref50 = _slicedToArray(_ref49, 2),
        pattern = _ref50[0],
        replacement = _ref50[1];
      return acc.replace(pattern, replacement);
    }, p1);
    var hour = parseInt(p2, 10);
    if (p3 === "PM" && hour !== 12) {
      hour += 12;
    } else if (p3 === "AM" && hour === 12) {
      hour = 0;
    }
    return "".concat(translatedDate).concat(hour, ":").concat(min);
  }, function (match, user, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref51) {
      var _ref52 = _slicedToArray(_ref51, 2),
        pattern = _ref52[0],
        replacement = _ref52[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u60A8\u597D\uFF0C" + user + "\uFF01\u60A8\u6700\u8FD1\u4E8E".concat(translatedDate, "\u9A8C\u8BC1\u3002\u60A8\u73B0\u5728\u65E0\u9700\u91CD\u65B0\u9A8C\u8BC1\u3002\u4ECE\u9A8C\u8BC1\u5230\u4EAB\u53D7\u5B66\u4E1A\u798F\u5229\u4E4B\u95F4\u53EF\u80FD\u4F1A\u6709\u4E00\u6BB5\u7B49\u5F85\u65F6\u95F4\u3002");
  }, function (match, user, p1) {
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref53) {
      var _ref54 = _slicedToArray(_ref53, 2),
        pattern = _ref54[0],
        replacement = _ref54[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return "\u60A8\u597D\uFF0C" + user + "\uFF01\u60A8\u6700\u8FD1\u4E8E".concat(translatedDate, "\u5B66\u751F\u9A8C\u8BC1\u3002\u60A8\u73B0\u5728\u65E0\u9700\u91CD\u65B0\u9A8C\u8BC1\u3002\u4ECE\u9A8C\u8BC1\u5230\u4EAB\u53D7\u5B66\u4E1A\u798F\u5229\u4E4B\u95F4\u53EF\u80FD\u4F1A\u6709\u4E00\u6BB5\u7B49\u5F85\u65F6\u95F4\u3002");
  }, function (match, opt, p1) {
    var optKey = {
      "Submitted": "提交于",
      "Verified since": "验证自"
    };
    var dateRegExp = I18N["zh-CN"]["public"]["time-regexp"];
    var translatedDate = dateRegExp.reduce(function (acc, _ref55) {
      var _ref56 = _slicedToArray(_ref55, 2),
        pattern = _ref56[0],
        replacement = _ref56[1];
      return acc.replace(pattern, replacement);
    }, p1);
    return optKey[opt] + "".concat(translatedDate);
  }];
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
  MEM[CONF.common] = {"s":{"Find code, projects, and people on GitHub:":"在 GitHub 上查找代码、项目和人员：","Access has been restricted":"访问被限制","You have triggered a rate limit.":"您已触发速率限制。","Please wait a few minutes before you try again;":"请稍等几分钟再重试；","in some cases this may take up to an hour.":"在某些情况下，这可能最多需要一个小时。","No server is currently available to service your request.":"当前服务器无法为您的请求提供服务。","This page is taking too long to load.":"此页面加载时间过长。","We had issues producing the response to your request.":"我们在响应您的请求时遇到了问题。","Sorry about that. Please try refreshing and contact us if the problem persists.":"对此我们很抱歉。请尝试刷新，如果问题仍然存在，请联系我们。","Error":"错误","Looks like network is down!":"看起来网络未连接！","Failed to fetch data,":"加载数据失败","click here to reload the page.":"点击此处刷新页面。","Contact Support":"联系 GitHub 支持","GitHub Status":"GitHub 状态","You can’t perform that action at this time.":"此时无法执行该操作。","Whoa there!":"请停一下！","You have exceeded a secondary rate limit.":"您已经超出次要速率限制。","You opened this issue":"您打开了这个议题","You opened this pull request":"您打开了这个拉取请求","You commented on this issue":"您对此议题发表了评论","You commented on and opened this issue":"您打开了这个议题并发表评论","You commented on this pull request":"您对此拉取请求发表了评论","You commented on and opened this pull request":"您打开了这个拉取请求并发表评论","You were mentioned on and commented on this issue":"您在此议题上被提及并发表评论","You were mentioned on and commented on this pull request":"您在此拉取请求上被提及并发表评论","You were mentioned on and opened this pull request":"您被提及并打开了此拉取请求","You are assigned to this pull request":"您被指派处理此拉取请求","You are assigned to and opened this pull request":"您打开并被指派处理此拉取请求","You left a review":"您发表了审查意见","Changes requested":"请求更改","Review required":"需要审查","Approved":"已批准","replied":"已回复","Platform":"平台","AI CODE CREATION":"AI 代码生成","Write better code with AI":"借助 AI 写出更好的代码","GitHub Copilot app":"GitHub Copilot 应用","Direct agents from issue to merge":"让智能体从议题直达合并","Build and deploy intelligent apps":"构建和部署智能应用","GitHub Models":"GitHub 模型","Manage and compare prompts":"管理和比较提示词","MCP Registry":"MCP 互联","Integrate external tools":"集成外部工具","DEVELOPER WORKFLOWS":"开发者工作流","Automate any workflow":"自动化任何工作流程","Instant dev environments":"即时开发环境","Plan and track work":"计划和追踪工作","Code Review":"代码审查","Manage code changes":"管理代码更改","Code Quality":"代码质量","Enforce quality at merge":"在合并时强制检查质量","APPLICATION SECURITY":"应用安全","GitHub Advanced Security":"GitHub 高级安全","Find and fix vulnerabilities":"查找并修复漏洞","Code security":"代码安全","Secure your code as you build":"边开发边保障代码安全","Secret protection":"密钥保护","Stop leaks before they start":"在泄露发生前就阻止它们","EXPLORE":"探索","Why GitHub":"为什么选择 GitHub","Changelog":"更新日志","GitHub Marketplace":"GitHub 市场","View all features":"查看全部功能","Solutions":"解决方案","BY COMPANY SIZE":"企业规模","Enterprises":"企业","Small and medium teams":"中小团队","Startups":"初创公司","Nonprofits":"非营利组织","BY USE CASE":"使用案例","App Modernization":"应用现代化","DevSecOps":"开发安全运维","DevOps":"开发运维","CI/CD":"持续集成/持续部署","View all use cases":"查看全部使用案例","BY INDUSTRY":"行业","Healthcare":"医疗健康","Financial services":"金融服务","Manufacturing":"制造业","Government":"政府","View all industries":"查看所有行业","View all solutions":"查看全部解决方案","Resources":"资源","EXPLORE BY TOPIC":"按主题探索","Software Development":"软件开发","View all topics":"查看所有主题","EXPLORE BY TYPE":"按类型探索","Customer Stories":"客户案例","Customer stories":"客户案例","Events & webinars":"活动与网络研讨会","Ebooks & reports":"电子书与报告","Business insights":"商业洞察","GitHub Skills":"GitHub 技能课程","SUPPORT & SERVICES":"支持与服务","Partners":"合作洽谈","Customer support":"客户支持","Community forum":"社区论坛","Trust center":"信任中心","View all resources":"查看全部资源","Open Source":"开源","COMMUNITY":"社区","GitHub Sponsors":"GitHub 赞助者","Fund open source developers":"资助开源开发人员","PROGRAMS":"项目","Security Lab":"安全实验室","Maintainer Community":"维护者社区","Accelerator":"加速器计划","Archive Program":"存档计划","REPOSITORIES":"仓库","Topics":"主题","Trending":"趋势","Collections":"集合","Enterprise":"企业","ENTERPRISE SOLUTIONS":"企业级解决方案","Enterprise platform":"企业平台","AI-powered developer platform":"AI 驱动的开发者平台","AVAILABLE ADD-ONS":"可选附加组件","Enterprise-grade security features":"企业级安全功能","Copilot for Business":"Copilot 企业版","Enterprise-grade AI features":"企业级 AI 功能","Premium Support":"高级支持","Enterprise-grade 24/7 support":"企业级 24 小时全天候支持","Pricing":"定价","Search":"搜索","Sign in":"登录","Sign up":"注册","Search or jump to...":"搜索或跳转到…","Type":"请键入","to search":"去搜索","Command palette":"命令面板","Saved queries":"已保存的搜索","All of GitHub":"整个 GitHub","Autocomplete":"自动完成","Search all of GitHub":"搜索整个 GitHub","Search in this directory":"在文件夹中搜索","Search in this repository":"在该仓库中搜索","Search in this owner":"在该所有者中搜索","Search in this organization":"在该组织中搜索","Owners":"所有者","Languages":"语言","Search syntax tips":"搜索语法提示","Jump to":"跳转到","Ask Copilot":"询问 Copilot","Start a new Copilot thread":"启动新的 Copilot 对话","Security":"安全","Open menu":"打开菜单","Close menu":"关闭菜单","Homepage":"主页","Home":"主页","Feed":"动态","Issues":"议题","All issues":"所有议题","Pull requests":"拉取请求","All pull requests":"所有拉取请求","Projects":"项目","Discussions":"讨论","Codespaces":"代码空间","Explore":"探索","Marketplace":"市场","MCP registry":"MCP 互联","Top repositories":"热门仓库","Search for repositories":"搜索仓库","Close search":"关闭搜索","Search for teams":"搜索团队","Teams have moved to":"团队已迁移至","Don't get locked out of your account.":"不要被锁定在您的账户之外。","Download your recovery codes":"下载您的恢复码","add a passkey":"添加通行密钥","so you don't lose access when you get a new device.":"这样您在登录新设备时就不会失去访问权限。","GitHub users are":"GitHub 用户","now required":"现在被要求","Enable 2FA":"启用 2FA","You only have a single verified email address. We recommend verifying at least one more email address to ensure you can recover your account if you lose access to your primary email.":"您只有一个经过验证的电子邮件地址。我们建议您至少再验证一个电子邮件地址，以确保在失去主邮箱访问权限时可以恢复账户。","Email settings":"电子邮件设置","Your recovery codes have not been saved in the past year. Make sure you still have them stored somewhere safe by viewing and downloading them again.":"如果您在过去一年中没有保存恢复密码。请确保将其保存在安全的地方，并再次查看和下载。","View recovery codes":"查看恢复码","You can also":"您也可以","view this object as it appeared at the time of the comment":"查看此对象在评论时的状态","On April 24 we'll start using GitHub Copilot interaction data for AI model training unless you opt out.":"除非您选择退出，否则我们将于 4 月 24 日开始使用 GitHub Copilot 的交互数据来训练 AI 模型。","Review this update":"查看此更新","and manage your preferences in your":"并管理您的偏好在","GitHub account settings":"GitHub 账户设置","Your issues":"您的议题","Your pull requests":"您的拉取请求","You have no unread notifications":"您没有未读通知","You have unread notifications":"您有未读通知","Create new...":"新建…","Create new…":"新建…","New repository":"新建仓库","Import repository":"导入仓库","New spark":"新建 spark","New agent task":"新建智能体任务","New codespace":"新建代码空间","New gist":"新建代码片段","New organization":"新建组织","New project":"新建项目","This organization":"本组织","New team":"新建团队","Create new issue":"新建议题","Copy link":"复制链接","Templates and forms":"模板和表单","Blank issue":"空白议题","Create a new issue from scratch":"从头开始创建新议题","Agents":"智能体","Chat with Copilot":"与 Copilot 聊天","Learn more about Copilot coding agent":"了解有关 Copilot 编程智能体的更多信息","Start a new task with Copilot":"使用 Copilot 启动新任务","Describe a coding task to work on":"描述要完成的编程任务","Open Copilot…":"打开 Copilot…","Start a pull request":"创建拉取请求","New conversation in":"新聊天","New conversation":"新聊天","Assistive":"小窗","Spaces":"空间","Immersive":"全屏","Download for":"下载插件","Select a branch":"选择分支","Find a branch...":"查找分支…","Create a custom agent":"创建自定义智能体","Navigate to Copilot":"导航到 Copilot","Open agents panel":"打开智能体面板","Start a task with Copilot coding agent":"使用 Copilot 编程智能体开始任务","Describe your task in natural language. Copilot will work in the background and open a pull request for your review.":"请用自然语言描述您的任务。Copilot 会在后台工作，并创建一个拉取请求供您审查。","Agent tasks":"智能体任务","Switch branches":"切换分支","Filter branches":"查找分支","default":"默认","Recent tasks":"近期任务","Ask Copilot…":"询问 Copilot…","About this page":"关于此页面","In immersive chat":"在沉浸式聊天中","In a space":"在空间","Download for…":"下载插件…","Open user navigation menu":"打开用户导航菜单","Account switcher":"账户切换","Add account":"添加账户","Switch account":"切换账户","Sign out...":"登出…","Set status":"状态设置","Create new repository":"新建仓库","Profile":"个人资料","Gists":"代码片段","Settings":"设置","Copilot settings":"Copilot 设置","Feature preview":"功能预览","Feature Preview":"功能预览","Get early access to new features and give feedback":"测试新功能并提交反馈","Help us improve this and make your experience even better.":"帮我们改进此功能，提升您的体验。","On":"开","Off":"关","Feature preview dialog":"功能预览对话框","Enable":"启用","Enabled":"启用","Disable":"禁用","Disabled":"禁用","Documentation":"文档","Colorblind themes":"色盲主题","Varying by gender and geography, color blindness can affect on average 8% of men and up to 0.5% of women. Our previous colorblind theme has been split into two new themes:":"色盲会因性别和地域的不同而有所不同，平均而言，色盲会影响约 8% 的男性和约 0.5% 的女性。我们之前的色盲主题被分为两个新主题：","Light/dark Protanopia & Deuteranopia for red/green color blindness.":"明/暗 - 红绿色盲主题适用于红绿色盲。","Light/dark Tritanopia for blue/yellow color blindness.":"明/暗 - 蓝色盲主题适用于蓝黄色盲。","Command Palette":"命令面板","Quickly navigate and jump between your organizations or repositories and search recent issues, pull requests, projects and more with the new command palette. You can also execute time saving commands all without lifting your fingers off the keyboard!":"使用新的命令面板，可以快速导航并跳转到您所在的组织或仓库，并搜索最近的议题、拉取请求、项目等等。您还可以执行节省时间的命令，而无需将手指从键盘上移开！","To open the command palette:":"打开命令面板：","other:":"其他：","Organization Custom Instructions":"组织自定义指令","Organization administrators can apply custom instructions across all Copilot chats in github.com.":"组织管理员可以在 GitHub.com 的所有 Copilot 聊天中应用自定义指令。","New Pull Requests Dashboard":"新版拉取请求仪表板","The updated pull requests overview (github.com/pulls) introduces saved views, smart default filters, and enhanced search, making it easier to organize and find pull requests across your repos, teams, and orgs. Once enabled, please refresh to see the changes.":"更新后的拉取请求概览（github.com/pulls）引入了保存的视图、智能默认过滤器和增强的搜索功能，使您更轻松地组织并查找仓库、团队和组织中的拉取请求。启用后，请刷新以查看更改。","New Dashboard Experience":"新仪表板体验","The updated home dashboard introduces enhanced agent workflows, making it easier to create and manage agent sessions, issues, and pull requests directly from your personalized dashboard. Once enabled, please refresh to see the changes.":"更新后的主页仪表板引入了增强的智能体工作流，使您可以更轻松地直接从个性化仪表板创建和管理智能体会话、议题和拉取请求。启用后，请刷新以查看更改。","Rich Jupyter Notebook Diffs":"Jupyter Notebook 的丰富差异视图","Enables rich diffs of Jupyter Notebooks in pull requests":"在拉取请求中启用 Jupyter Notebook 的丰富差异视图","Note: commenting on rich diff views of notebooks is not yet supported":"注意：尚不支持对 Jupyter Notebook 的丰富差异视图进行评论","Semantic issue search":"语义议题搜索","Find issues using the new semantic search. Enter natural language queries on a repo’s Issues page to discover relevant, semantically-indexed results. You can also combine filters and keywords for traditional searches.":"使用新的语义议题搜索功能查找议题。在仓库的议题页面输入自然语言查询，即可发现语义索引的相关结果。您还可以结合过滤器和关键词进行传统搜索。","New Files Changed Experience":"新版文件更改体验","Feature enabling the new Files Changed Page":"启用新版更改的文件页","New Files Changed Perf Experiment":"新版更改的文件性能优化","Performance improvement for reviewing large pull requests in the New Files Changed experience. When enabled, the new experience uses virtualization to reduces the number of DOM elements and event listeners the browser has to manage. This can significantly improve memory utilization and the responsiveness of the page.":"这项性能优化针对“新版文件更改体验”中审查大型拉取请求的场景。启用后，新体验将采用虚拟化技术，减少浏览器需要管理的 DOM 元素数量和事件监听器数量，从而显著改善内存占用并提升页面响应速度。","Note: this features only works when the New Files Changed Experience feature preview is enabled.":"注意：此功能仅在启用“新版文件更改体验”功能预览时才生效。","Slash Commands":"斜杠命令","Slash commands make it easier to type more complex Markdown, such as tables, tasklists, and code blocks.":"斜线命令可以让您更轻松地输入更复杂的 Markdown，如表格、任务列表和代码块。","Simply type":"只需在议题、拉取请求和讨论中键入","on Issues, PRs and Discussions to check out a list of available commands!":"，即可查看可用命令的列表！","Feature disabled.":"功能已禁用。","Please":"请","give feedback":"提交反馈","so we can improve it!":"以便我们加以改进！","Sorry, something went wrong and we were not able to fetch the feature previews":"对不起，出了点问题，我们无法获取功能预览","Changes saved! Please":"更改已保存！请","reload":"刷新","the page to view the changes.":"页面以查看更改。","Appearance":"外观","Accessibility":"无障碍","Upgrade":"升级","Try Enterprise":"试用企业版","Free":"免费","Sign out":"退出","Edit status":"编辑状态","What's happening":"发生了什么","What's happening?":"发生了什么？","Suggestions":"建议","On vacation":"在度假","Out sick":"生病","Working from home":"在家工作","Focusing":"专注中","Busy":"繁忙中","When others mention you, assign you, or request your review, GitHub will let them know that you have limited availability.":"当其他人提及您、指派您或请求您审查时，GitHub 会告知他们您忙不过来了。","I may be slow to respond.":"我的回复可能比较慢。","Clear status":"清除状态","Expiration":"有效期","Never":"永不","in 30 minutes":"30 分钟","in 1 hour":"1 小时","in 4 hours":"4 小时","after today":"今日之后","after this week":"本周之后","after a month":"本月之后","How long until this status will automatically clear.":"多久后状态自动清除。","Your status will be cleared after the selected time.":"在所选时间后，您的状态将被清除。","Visible to":"可见","Everyone":"任何人","Limit status visibility to a single organization.":"将状态可见范围限制为单个组织。","Scope status visibility to a single organization.":"将状态可视范围扩大到单个组织。","Filter emoji":"筛选表情符号","Search results":"筛选结果","Terms":"服务条款","Privacy":"隐私","Status":"状态监测","Community":"社区","Docs":"文档","Contact":"联系我们","Manage cookies":"管理 Cookies","Do not share my personal information":"请勿分享我的个人信息","About":"关于","Blog":"博客","Manage Cookies":"管理 Cookies","Contact GitHub":"联系 GitHub","Training":"培训","Add a comment":"添加评论","Add a body":"添加内容","Write":"撰写","Use Markdown to format your comment":"使用 Markdown 格式编写评论","Add your comment here...":"在此添加您的评论…","Add your answer here...":"在此添加您的答复…","Text field is empty":"文本框为空","Preview":"预览","Nothing to preview":"没有什么可预览","This file is empty.":"这是一个空文件。","Try again with a file that’s not empty.":"使用非空文件重试。","Leave a comment":"发表评论","Write a reply":"发表回复","Write a comment":"发表评论","Suggest an answer":"提出答复","Ask a question, start a conversation, or make an announcement":"提出问题、开始讨论或发布公告","This repository has been archived.":"此仓库已存档。","Add review comment":"添加审查意见","Failed to save comment: Body can't be blank":"保存评论失败：正文内容不能为空","Start a review":"开始审查","Are you sure you want to discard your unsaved changes?":"您确定要放弃未保存的更改吗？","Apply Suggestion":"添加建议","Add a title":"添加标题","Title":"标题","Add a description":"添加描述","Add your description here...":"在此添加您的描述…","Add an optional description...":"添加可选描述…","There was an error trying to commit changes: Failed to submit suggested changes":"提交更改时出错：提交建议更改失败","There was a problem saving your comment. Please try again.":"保存您的评论时出现问题。请再试一次。","Add a suggestion, <Ctrl+g>":"添加建议, <Ctrl+g>","Heading":"标题","Bold":"粗体","Italic":"斜体","Quote":"摘引","Link":"链接","Menu":"菜单","Numbered list":"有序列表","Unordered list":"无序列表","Task list":"任务列表","Attach files":"附件","Mention":"提及","Reference":"引用","Saved replies":"快速回复","Select a reply":"选择回复","Create a new saved reply":"创建新的快速回复","Slash commands":"斜杠命令","Alerts":"警示","Add a markdown alert to emphasize important information":"添加 MarkDown 警示标记，强调重要信息","Code block":"代码块","Insert a code block formatted for a chosen syntax":"插入针对所选语法格式化的代码块","Details":"详细信息","Add a details tag to hide content behind a visible heading":"添加详情标签，将内容隐藏在可见标题后面","Insert one of your saved replies":"插入您快速回复","Table":"表格","Add markdown table":"添加 Markdown 表格","Templates":"模板","Insert one of your issue templates":"插入您的议题模板","Slash":"斜杠","No Syntax":"无语法","No saved replies":"尚无快速回复","You can create one in your":"您可以创建一个在您的","settings":"设置","Columns":"列","1 column":"1 列","2 columns":"2 列","3 columns":"3 列","4 columns":"4 列","5 columns":"5 列","Rows":"行","1 row":"1 行","2 rows":"2 行","3 rows":"3 行","4 rows":"4 行","5 rows":"5 行","No issue templates":"尚无议题模板","Learn more about":"了解更多关于","issue templates":"议题模板","Insert Link":"插入链接","Link Text":"链接文本","Add":"添加","Attach files by":"通过","dragging & dropping,":"拖放，","selecting or pasting them.":"选择或粘贴来附加文件。","Markdown is supported":"支持 Markdown 语法","is supported":"语法支持","Styling with Markdown is supported.":"支持 Markdown 语法。","Paste, drop, or click to add files":"粘贴、拖放或点击添加文件","Write with Copilot":"使用 Copilot 撰写","Type your description here…":"在此输入描述…","Assignee":"受理人","Label":"标签","Create more":"添加更多","Start typing to create an item, or type # to select a repository":"开始输入以创建项目，或输入 # 选择仓库","Uploading your files…":"正在上传您的文件…","This video is too big.":"该影片过大。","Try again":"请上传","with a file size less than 10MB.":"体积小于10MB的文件","Close issue":"关闭议题","Close as completed":"完成后关闭","Done, closed, fixed, resolved":"已完成、已关闭、已修复、已解决","Close as not planned":"非计划中关闭","Won't fix, can't repro, duplicate, stale":"不会修复，无法重现，重复，陈旧","Won't fix, can't repro, stale":"不会修复，无法重现，陈旧","Duplicate of another issue":"重复议题","Close with comment":"评论并关闭","Close pull request":"关闭拉取请求","Reopen discussion":"重新打开讨论","Close discussion":"关闭讨论","Close as resolved":"因解决而关闭","The discussion has been resolved":"讨论已解决","Close as outdated":"因过时而关闭","The discussion is no longer relevant":"讨论不再相关","Close as duplicate":"因重复而关闭","The discussion is a duplicate of another":"讨论与另一个讨论重复","Comment":"评论","comment":"评论","Submit new issue":"提交新议题","Comment on this commit":"评论","Close and comment":"提交并关闭","Reopen and comment":"提交并重新打开","Reopen issue":"重新打开议题","Reopen with comment":"重新打开评论","Reopen pull request":"重新打开拉取请求","Add single comment":"评论","Reply":"回复","Answer":"答复","Start discussion":"开始讨论","discussion":"讨论","discussions":"讨论","Spammy":"仅自己可见","This user is marked as spammy. Their comments will onlyshow in staff mode.":"该用户已被封号，评论仅自己可见。","Add to list":"添加到清单","You don't have any lists yet.":"您尚无任何清单。","Lists":"清单","Search lists":"搜索清单","🔮 Future ideas":"🔮 超前想法","🚀 My stack":"🚀 技术栈","✨ Inspiration":"✨ 灵感","No results found.":"未找到结果。","Create list":"创建清单","Create a list to organize your starred repositories.":"创建一个清单来组织您的星标仓库。","⭐️ Name this list":"⭐️ 清单名称","Write a description":"简单描述","type":"输入","to add emoji to the name or description.":"在名称或描述中添加表情符号","Lists are currently in beta.":"清单目前处于测试阶段。","Share feedback and report bugs.":"分享反馈意见和报告错误。","Creating...":"创建中…","Enabling this makes the list visible only to you.":"启用此选项将使该列表仅对您可见。","Keyboard shortcuts":"键盘快捷键","Site-wide shortcuts":"全局快捷键","Open command palette":"打开命令面板","Open command palette in command mode":"在命令模式下打开命令面板","Focus search bar":"聚焦搜索栏","Open search bar":"打开搜索栏","Go to notifications":"跳转到通知","Go to dashboard":"跳转到仪表板","Go to your issues":"跳转到议题","Go to your pull requests":"跳转到拉取请求","Bring up this help dialog":"弹出这个帮助对话框","Move selection down":"向下移动选择","Move selection up":"向上移动选择","Toggle selection":"切换选择","Open selection":"打开选择","Expand and move focus into focused link's hovercard":"展开并将焦点移至聚焦链接的悬浮卡","Show keyboard shortcuts dialog":"显示键盘快捷键对话框","Copilot Chat":"Copilot 聊天","Open Copilot Chat (assistive mode)":"打开 Copilot 聊天（辅助模式）","Open Copilot Chat (immersive mode)":"打开 Copilot 聊天（沉浸模式）","View all keyboard shortcuts":"查看所有键盘快捷键","Clear Command Palette":"清除命令面板","Tip:":"小贴士：","Go to your accessibility settings to change your keyboard shortcuts":"跳转到您的无障碍设置，以更改您的键盘快捷键","to search discussions":"搜索讨论","to search issues":"搜索议题","to search pull requests":"搜索拉取请求","to search projects":"搜索项目","to search people and organizations":"搜索成员和组织","to search teams":"搜索团队","to activate command mode":"激活命令模式","Type is:issue to filter to issues":"键入 is:issue 以筛选议题","Type is:pr to filter to pull requests":"键入 is:pr 以筛选拉取请求","Type is:open to filter to open content":"键入 is:open 以筛选打开的内容","Type author:@me to search your content":"键入 author:@me 以筛选您的内容","for help and tips":"寻求帮助和提示","Pages":"GitHub Pages","Dashboard":"仪表板","Notifications":"通知","Actions":"操作","Insights":"洞察","Organizations":"组织","Repositories":"仓库","Packages":"软件包","Users":"用户","to jump to":"去跳转","Top result":"最佳结果","No results matched your search":"没有与您的搜索相符的结果","Try a different search query.":"请尝试其他搜索查询。","Learn more about searching and filtering issues and pull requests.":"了解有关搜索和筛选议题及拉取请求的更多信息。","Search issues and pull requests":"搜索议题和拉取请求","Search issues, pull requests, discussions, and projects":"搜索议题、拉取请求、讨论和项目","Issues, pull requests, and discussions":"议题、拉取请求和讨论","Search projects":"搜索项目","Search or jump to a repository":"搜索或跳转到仓库","Search or jump to a user, organization, or repository":"搜索或跳转到用户、组织或仓库","Search files":"搜索文件","Files":"文件","Run a command":"运行命令","Run command":"运行命令","Commands":"命令","Global Commands":"全局命令","Type > to filter":"键入 > 去筛选","– New repository":"- 新建仓库","– Import repository":"- 导入仓库","– New project":"- 新建项目","– New discussion":"- 新建讨论","– New organization":"- 新建组织","– New gist":"- 新建代码片段","– New issue":"- 新建议题","– New file":"- 新建文件","– Change tab size rendering":"- 切换制表符尺寸","– Switch theme":"- 切换主题","New issue":"新建议题","New discussion":"新建讨论","New file":"新建文件","Change tab size rendering":"切换制表符尺寸","Change tab size r...":"切换制表符尺寸","2 spaces":"2 个空格","3 spaces":"3 个空格","4 spaces":"4 个空格","5 spaces":"5 个空格","6 spaces":"6 个空格","7 spaces":"7 个空格","8 spaces":"8 个空格","9 spaces":"9 个空格","10 spaces":"10 个空格","12 spaces":"12 个空格","Switch theme":"切换主题","Default dark":"暗 - 默认","Default light":"亮 - 默认","Dark dimmed":"昏暗","Switch theme to dark high contrast":"切换主题为 暗 - 高对比","Sync with system settings":"与系统设置同步","Modes":"模式","Search for":"搜索","across all of GitHub":"在整个 GitHub 中","issues, pull requests, discussions,":"议题、拉取请求、讨论","organizations, repositories,":"组织、仓库","projects":"项目","files":"文件","issues":"议题","pull requests":"拉取请求","organizations":"组织","repositories":"仓库","users":"用户","Activate":"激活","command mode":"命令模式","Use filters in issues, pull requests, discussions, and projects":"在议题、拉取请求、讨论和项目中使用过滤器","Search your issues, pull requests, and discussions":"搜索您的议题、拉取请求和讨论","Filter to pull requests":"筛选拉取请求","Filter to issues":"筛选议题","Filter to discussions":"筛选讨论","Filter to projects":"筛选项目","Filter to open issues, pull requests, and discussions":"筛选打开的议题、拉取请求和讨论","Edit issue title":"编辑议题标题","Edit issue body":"编辑议题内容","Transfer issue…":"转移议题…","Delete issue…":"删除议题…","Follow":"关注","Unfollow":"取消关注","Star":"星标","Stars":"星标","Unstar":"已加星标","Starred":"已加星标","Fork":"复刻","Save":"保存","Saving…":"保存中…","Saving...":"保存中…","Save changes":"保存更改","Update":"更新","Updating":"更新中","Updating…":"更新中…","Updating...":"更新中…","Delete":"删除","Cancel":"取消","Edit":"编辑","Added on":"添加于","Loading":"加载中","Loading…":"载入中…","Loading...":"载入中…","Copy":"复制","Copied!":"复制成功！","Copy to clipboard":"复制到剪切板","Give feedback":"反馈","Give us your feedback":"向我们提供反馈意见","Download":"下载","View":"查看","Create":"创建","Close":"关闭","Closed":"已关闭","Open":"打开","Reopen":"重新打开","and":"和",", and":"，和","or":"或",", or":"，或","to":"到","by":"由","on":"于","Use":"使用","New":"新","Learn more":"了解更多","Learn More":"了解更多","Learn more.":"了解更多。",",":"，",".":"。","Prev":"上一页","Previous":"上一页","Next":"下一页","Less":"更少","More":"更多","Show more":"显示更多","Show less":"显示更少","Load more…":"载入更多…","Loading more…":"载入更多…","Loading more...":"载入更多…","Public":"公共","Private":"私有","Public archive":"公共存档","Private archive":"私有存档","Public template":"公共模板","Public mirror":"公共镜像","Code":"代码","Overview":"概况","Followers":"关注者","Collaborators":"协作者","collaborators":"协作者","Sponsors":"赞助者","Sponsoring":"赞助者","commit":"提交","commits":"提交","Organization":"组织","People":"成员","Teams":"团队","just now":"刚刚","now":"当前","yesterday":"昨天","last month":"上个月","This commit was created on GitHub.com and signed with GitHub’s":"此提交在 GitHub.com 上创建并签名，使用 GitHub 的","This commit was created on GitHub.com and signed with GitHub's":"此提交在 GitHub.com 上创建并签名，使用 GitHub 的","This commit was created on GitHub.com and signed with GitHub’s verified signature":"此提交在 GitHub.com 上创建并签名，使用 GitHub 的","This commit was signed with the committer's":"此提交已签名，使用提交者的","This tag was signed with the committer's":"此标签已签署，使用提交者的","This commit was signed with the committer’s":"此提交已签名，使用提交者的","This tag was signed with the committer’s":"此标签已签署，使用提交者的","This commit is signed with the committer’s":"此提交已签名，使用提交者的","’s contribution has been verified via GPG key.":"的贡献已通过 GPG 密钥验证。","verified signature":"已验证签名","The key has expired":"密钥已过期","This commit is not signed, but one or more authors requires that any commit attributed to them is signed.":"此提交未签名，但一位或多位作者要求对归属于他们的任何提交进行签名。","We had a problem verifying this signature. Please try again later.":"我们在验证此签名时遇到问题。请稍后再试。","We were unable to verify this signature.":"我们无法验证此签名。","This user has not yet uploaded their public signing key.":"此用户尚未上传其公共签名密钥。","GPG key ID:":"GPG 密钥 ID：","GPG Key ID:":"GPG 密钥 ID：","SSH key Fingerprint:":"SSH 密钥指纹：","SSH Key Fingerprint:":"SSH 密钥指纹：","Learn about vigilant mode":"了解警戒模式","The email in this signature doesn’t match the committer email.":"此签名中的电子邮箱与提交者的电子邮箱不相符。","No user is associated with the committer email.":"提交者的电子邮箱未与用户相关联。","Verified":"已验证","Expired":"已过期","Partially verified":"部分验证","We cannot verify signatures from co-authors, and some of the co-authors attributed to this commit require their commits to be signed.":"我们无法验证来自共同作者的签名，并且此提交的某些共同作者要求对其提交进行签名。","Unverified":"未验证","Upload your public signing GPG key":"上传您的公共签名 GPG 密钥","to verify your signature.":"以验证您的签名。","Please verify your email address to access all of GitHub's features.":"请验证您的电子邮箱地址以便开启所有 GitHub 功能。","Configure email settings":"修改电子邮箱设置","Your email was verified.":"您的电子邮箱地址验证成功！","New feature or request":"新功能或要求","Don't get locked out - if you get a new phone this season, be sure to transfer your authenticator app data to the new phone. Enable cloud back up if your authenticator app supports it and consider":"不要被锁在门外——如果您在这个季节买了一部新手机，请务必将您的身份验证器应用数据传输到新手机。如果您的身份验证器应用支持云备份，请启用它并考虑","redownloading your recovery codes":"重新下载您的恢复码",", just to be safe.":"，以确保安全。","You signed in with another tab or window.":"您使用其他标签页或窗口登录。","Reload":"重新加载","to refresh your session.":"以刷新您的会话","Manage cookie preferences":"管理 Cookie 偏好设置","Most GitHub websites use cookies. Cookies are small text files placed on your device to store data so web servers can use it later. GitHub and our third-party partners use cookies to remember your preferences and settings, help you sign in, show you personalized ads, and analyze how well our websites are working. For more info, see the Cookies and similar technologies section of the":"大多数 GitHub 网站都使用 Cookie。Cookie 是保存在您的设备上的小型文本文件，用于存储数据，以便 Web 服务器稍后使用。GitHub 和我们的第三方合作伙伴使用 Cookie 来记住您的偏好和设置、帮助您登录、向您显示个性化广告以及分析我们网站的运行情况。有关更多信息，请参阅隐私声明中的","Privacy Statement":"Cookie 和类似技术部分","Accept":"接受","Reject":"拒绝","Reset all":"重置全部","Required":"必要的","GitHub uses required cookies to perform essential website functions and to provide the services. For example, cookies are used to log you in, save your language preferences, provide a shopping cart experience, improve performance, route traffic between web servers, detect the size of your screen, determine page load times, improve user experience, and for audience measurement. These cookies are necessary for our websites to work.":"GitHub 使用必需的 Cookie 来执行基本网站功能并提供服务。例如，Cookie 用于登录、保存您的语言偏好、提供购物车体验、提高性能、在 Web 服务器之间路由流量、检测屏幕大小、确定页面加载时间、改善用户体验以及用于受众测量。这些 Cookie 是我们网站正常运行所必需的。","Analytics":"分析","We allow third parties to use analytics cookies to understand how you use our websites so we can make them better. For example, cookies are used to gather information about the pages you visit and how many clicks you need to accomplish a task. We also use some analytics cookies to provide personalized advertising.":"我们允许第三方使用分析性 Cookie 来了解您如何使用我们的网站，以便我们改进网站。例如，Cookie 用于收集有关您访问的页面以及完成任务所需的点击次数的信息。我们还使用一些分析性 Cookie 来提供个性化广告。","Social Media":"社交媒体","GitHub and third parties use social media cookies to show you ads and content based on your social media profiles and activity on GitHub's websites. This ensures that the ads and content you see on our websites and on social media will better reflect your interests. This also enables third parties to develop and improve their products, which they may use on websites that are not owned or operated by GitHub.":"GitHub 和第三方使用社交媒体 Cookie 根据您的社交媒体个人资料和 GitHub 网站上的活动向您显示广告和内容。这可以确保您在我们的网站和社交媒体上看到的广告和内容将更好地反映您的兴趣。还使第三方能够开发和改进它们的产品，它们可能会在不由 GitHub 拥有或运营的网站上使用这些产品。","Advertising":"广告","In addition, GitHub and third parties use advertising cookies to show you new ads based on ads you've already seen. Cookies also track which ads you click or purchases you make after clicking an ad. This is done to show you ads that are more relevant to you and for business purposes with our advertising partners. For example, cookies are used to detect when you click an ad and to show you ads based on your social media interests and website browsing history.":"此外，GitHub 和第三方使用广告 Cookie 根据您已经看过的广告向您显示新广告。Cookie 还会跟踪您点击的广告或点击广告后进行的购买。这样做是为了向您显示与您更相关的广告，并用于与我们的广告合作伙伴开展业务。例如，Cookie 用于检测您何时点击广告，并根据您的社交媒体兴趣和网站浏览历史记录向您显示广告。","Jan":"1月","Feb":"2月","Mar":"3月","Apr":"4月","May":"5月","Jun":"6月","Jul":"7月","Aug":"8月","Sep":"9月","Oct":"10月","Nov":"11月","Dec":"12月","January":"1月","February":"2月","March":"3月","April":"4月","June":"6月","July":"7月","August":"8月","September":"9月","October":"10月","November":"11月","December":"12月","Sun":"周日","Mon":"周一","Tue":"周二","Wed":"周三","Thu":"周四","Fri":"周五","Sat":"周六","Arabic":"阿拉伯文","Chinese":"中文","English":"英文","French":"法文","German":"德文","Greek, Modern":"希腊文","Italian":"意大利文","Japanese":"日文","Korean":"韩文","Latin":"拉丁文","Portuguese":"葡萄牙文","Russian":"俄文","Sichuan Yi, Nuosu":"彝文","Spanish, Castilian":"西班牙文","Thai":"泰文","Tibetan":"藏文","Vietnamese":"越南文","Zhuang, Chuang":"壮文","All repositories":"所有仓库","Back":"返回","Conversation options":"选项","Enable custom instructions":"启用个人指导","Disable custom instructions":"禁用个人指导","Personal instructions":"个人指导","Set up Copilot to align with your workflows and preferences. These instructions will only impact your personal conversation.":"设置 Copilot 以符合您的工作流程和偏好。这些指导仅影响您的个人对话。","Your instructions":"您的指导","Role":"角色","Communication":"通信","Code preferences":"代码偏好","characters":"字符","Delete conversation":"删除对话","View all conversations":"查看全部对话","There are no conversations at the moment.":"目前没有对话。","Start a new conversation":"开始新对话","Active conversations":"最近对话","All conversations":"所有对话","Are you sure? This can’t be undone.":"您确定吗？此操作无法撤销。","Continue in immersive":"全屏对话","Close chat":"关闭","public":"公共","repository":"仓库","Select a repository to get started. Ask questions about your codebase to get answers fast and learn your way around.":"选择一个仓库即可开始。询问有关代码库的问题，以快速获得答案并了解相关知识。","uses AI. Check for mistakes.":"使用 AI。请检查错误。","Search repositories to chat about":"搜索要讨论的仓库","Recent repositories":"最近访问","General purpose chat":"普通对话","Loading Conversation":"加载中","Chatting about code and programming":"讨论关于代码和编程","Ask about the repository:":"询问关于此仓库的信息：","Ask about the tree comparison:":"询问关于比较的信息：","How can I help you?":"有什么可以帮忙？","Attach":"附件","Attach files or symbols":"附加文件或符号","Fetching files, folders, and symbols…":"正在获取文件（夹）和符号…","Add an extension":"添加扩展","Files, folders, and symbols":"文件（夹）和符号…","First attach a repository":"请先附加仓库","Select files, folders, and symbols":"选择文件（夹）和符号","Choose a repository to browse for files, folders, and symbols.":"选择仓库以浏览文件（夹）和符号。","Choose what you want to chat about. Use fewer references for more accurate responses.":"选择您想要讨论的内容。使用较少的参考资料即可获得更准确的回复。","Search files and symbols":"搜索文件和符号","Current attachments":"当前附件","Symbols":"符号","Repository…":"仓库…","Attach a repository":"附加仓库","Search repositories":"搜索仓库","Fetching repositories…":"正在获取仓库","Repository":"仓库","Repositories…":"仓库…","Select a repository":"选择仓库","Select repositories":"选择仓库","Choose repositories to chat about.":"选择以聊天","Choose a repository to chat about.":"选择以聊天","Remove topic":"移除主题","Add repositories, files, and spaces":"添加仓库、文件和空间","Add files, and spaces":"添加文件和空间","Upload from computer":"上传本机文件","Files and folders":"文件和文件夹","Spaces…":"空间…","Select a space":"选择一个空间","Recent spaces":"最近使用的空间","Filter items":"筛选项目","No spaces found":"未找到空间","You can create a new space to get started.":"您可以创建一个新空间以开始使用。","Create a new space":"创建新空间","Create your first space":"创建您的第一个空间","Extensions…":"扩展…","Extensions":"扩展","Chat with your favorite tools and services":"使用您最喜欢的工具和服务聊天","Browse the marketplace to find extensions for the tools and services you rely on":"浏览市场以查找您所依赖的工具和服务的扩展","Browse marketplace":"前往市场","Add attachment":"添加附件","Convert to file":"转成文件","Remove":"移除","Attachments options":"附件选项","Remove attachments":"移除附件","Send now":"发送","Stop response":"停止响应","Rate your experience":"反馈","Give feedback on Issues":"反馈议题意见","Hate":"很差","Dislike":"差","Neutral":"一般","Like":"好","Love":"很好","Message":"留言","Tell us what you liked or what could be better":"请告诉我们您喜欢什么，或者哪里可以改进","Please don't include sensitive, confidential, or personal data. Your feedback helps us improve our services in line with our":"请不要包含敏感、机密或个人数据。您的反馈有助于我们改进服务，相关处理遵循我们的","Privacy Policy":"隐私政策","Send":"发送","View token usage":"查看词元消耗","Included credits":"包含额度","Learn more about Included credits":"了解有关包含额度的更多信息","Refresh for latest usage":"刷新以获取最新用量","Copilot is responding…":"Copilot 响应中…","creating plan":"创建计划中","getting data":"获取数据中","Using the GitHub API to search pull requests":"正在使用 GitHub API 搜索拉取请求","Using the GitHub API to get latest release":"正在使用 GitHub API 获取最新发行版","Copilot used the":"Copilot 已使用","Issue API":"议题 API","tool":"工具","Are you sure?":"您确定吗？","Are you sure you wish to execute the \"Create pull request with Copilot coding agent\" tool?":"您确定要执行“使用 Copilot 编程智能体创建拉取请求”工具吗？","Allow":"允许","Dismiss":"拒绝","accepted":"允许","the action":"此操作","More reference options":"更多引用选项","Attach to chat":"附加至聊天","Raw":"源码","Show content":"显示内容","above":"上方","below":"下方","Reference details":"引用信息","contributor":"贡献者","contributors":"贡献者","updated":"更新于","Copilot was interrupted before it could finish this message.":"Copilot 在完成此消息之前被中断。","Please don’t include sensitive, confidential, or personal data. Your anonymous feedback helps us improve our services in line with our":"请不要包含敏感、机密或个人数据。您的匿名反馈有助于我们改进服务，根据","Task":"任务","Create task":"创建任务","Copy code":"复制代码","Good response":"点赞","positive feedback submitted":"已提交正面反馈","Bad response":"点踩","Retry":"重试","Give additional feedback":"提交额外反馈","Would you like to participate in our research?":"您愿意参与我们的研究吗？","You will be compensated for your time":"您的时间将得到补偿。","Book a session":"预约","No, thanks":"不，谢谢","Chats":"聊天","No chats yet":"还没有聊天","Ask Copilot anything on the right to start your first chat.":"在右侧询问 Copilot 任何问题，开始您的第一次聊天。","Agent sessions":"智能体任务","New agent session":"新智能体任务","No agents running":"没有智能体任务运行","You can now ask Copilot to work on a task for you in the background, creating a pull request which you can review.":"您现在可以请求 Copilot 在后台处理任务，创建一个拉取请求供您审查。","Explore the latest Copilot launches from Universe ’25":"探索 Universe ’25 的最新 Copilot 启动","See what’s new":"查看最新内容","Explore GitHub’s latest tools shaping agentic software and developer choice.":"探索 GitHub 最新的工具，塑造智能化的软件和开发者选择。","Select a custom agent":"选择自定义智能体","Create an agent":"新建智能体","Start task":"开始任务","Recent agent sessions":"最近智能体任务","Recent sessions":"最近任务","No sessions found. Create one by sending a prompt above.":"没有找到任务。通过发送提示来创建一个。","Duplicate":"复制","Duplicate Space":"复制空间","Spaces are now available through the GitHub MCP in VSCode.":"空间现在可以通过 VSCode 的 GitHub MCP 使用。","Install":"安装","Spaces organize your files, pull requests, issues, and standards so Copilot can give more relevant help for your work.":"空间组织您的文件、拉取请求、议题和标准，以便 Copilot 为您的工作提供更相关的帮助。","Create space":"创建空间","Search...":"搜索…","Shared with me":"与我共享的空间","Start your first space":"开始您的第一个空间","Need help? Read the docs":"需要帮助？阅读文档","Generate code":"生成代码","Produce code that follows your team's patterns.":"生成符合团队规范的代码。","Share knowledge":"分享知识","Centralize docs so your team can quickly find answers.":"集中管理文档，让团队快速找到答案。","Plan projects":"规划项目","Create requirements and issues your team can ship.":"创建团队可交付的需求与议题。","New Space":"新空间","Space name":"空间名称","Choose a name that describes your project or use case":"选择一个描述您的项目或用例的名称","Only you will be able to see this space.":"只有您可以看到此空间。","Create Space":"创建空间","Install MCP":"安装 MCP","Add a short description to explain this space's purpose (e.g., 'Frontend design system' or 'API docs hub').":"添加一个简短的描述，解释此空间的用途（例如，'前端设计系统'或'API 文档中心'）。","Add files":"添加文件","Define Copilot’s role, focus, and what to avoid in this space. Ex. “You are a [role]. Follow our [framework/patterns] to [type of task]. Avoid [practices or tools] unless specified”.":"定义 Copilot 的角色、焦点和在此空间中避免的内容。例如，“您是 [角色]。遵循我们的 [框架/规范] 来 [任务类型]。除非另有说明，否则避免 [实践或工具]。”","Sources":"来源","Conversations":"对话","Add sources":"添加来源","Add repository":"添加仓库","Add files from repository":"从仓库添加文件","Link files, pull requests, and issues":"链接文件、拉取请求和议题","Local":"本地","Upload a file":"上传文件","Add text content":"添加文本内容","Add sources to get started":"添加来源以开始","Provide files, docs, issues, or repositories so Copilot can give more relevant answers.":"提供文件、文档、议题或仓库，以便 Copilot 为您提供更相关的答案。","Start a new conversation in this space by typing in the input box at the top.":"通过在顶部输入框中输入，开始在此空间中的新对话。","Space not found":"空间未找到","This URL may be incorrect, you're signed out of your organization, or the Space may have been deleted.":"此 URL 可能不正确，您已退出组织，或空间可能已被删除。","Manage session":"管理会话","View pull request":"查看拉取请求","View verbose logs":"查看详细日志","More actions":"更多操作","Copilot started work":"Copilot 开始工作","Summary":"摘要","Copy head branch name to clipboard":"复制头分支名称到剪贴板","Edit title":"编辑标题","Dismiss banner":"关闭"},"r":[["Chatting about ([^ ]+)","","关于 $1 的对话"],["Chatting with (\\d+) attachments?","","附加 $1 个附件"],["Public code references from (\\d+) repositor(y|ies)","","公共代码，引用自 $1 个仓库"],["(\\d+) references?","","$1 条引用"],["(\\d+) lines? \\((\\d+) loc\\) ·","","$1 行（$2 非空行）·"],["Using the GitHub API to search for issues assigned to user ([^ ]+)","","使用 GitHub API 搜索分配给用户 $1 的议题"],["Chatting with (\\d+) attachments?","","附件 $1 个"],["Choose items from ([^ ]+) to chat about. Use fewer references for more accurate responses.","","从 $1 中选择项目来进行交流。使用较少的引用以获得更准确的回答。"],["Choose files, folders, and symbols from ([^ ]+) to chat about. Use fewer references for more accurate responses.","","选择 $1 中的文件（夹）和符号进行聊天。引用越少，回复越准确。"],["Delete conversation: \\\"(.+)\\\"","","删除对话：“$1”"],["Branch: (.+)","","分支：$1"],["Agent: (.+)","","智能体：$1"],["Resets on ","","重置于 "],["^AI credits$","","AI 额度"],["(^Updated (?:on )?|^Commits on |^Joined on |on )?(?:(Sun(?:day)?|Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?)?,? )?(?:(\\d{1,2})(?:st.|nd.|rd.|th.)?)? ?(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?) ?(\\d{1,2})?,? (\\d{4})?","g",{"f":0}],["^just now|^now|^last month|^yesterday|(?:(over|about|almost|in) |)(an?|\\d+)(?: |)(second|minute|hour|day|month|year)s?( ago|)","",{"f":1}],["^(?:(in) |)(?:(\\d+)m |)(\\d+)s","",{"f":2}],["to enable two-factor authentication as an additional security measure. Your activity on GitHub includes you in this requirement. You will need to enable two-factor authentication on your account before ?(.+?), or be restricted from account actions.","","启用双因素身份验证（2FA）作为额外安全措施。您在 GitHub 上的活动让您接收到此要求。您将需要在 $1 前启用双因素身份验证，否则会被限制账户操作。"]],"ts":{"GitHub · Where software is built":"GitHub · 软件构建的地方","Page not found · GitHub":"找不到页面 · GitHub"},"tr":[],"tm":[["(?:on |)(?:(\\d{1,2}) |)(?:(Sun(?:day)?|Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?), |)(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May(?:)??|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:,? |$))(\\d{4}|)(\\d{1,2}|)(?:,? (\\d{4})|)","g",{"f":3}],["^just now|^now|^last year|^last month|^last week|^yesterday|(?:(over|about|almost|in) |)(an?|\\d+)(?: |)(second|minute|hour|day|month|year|week)s?( ago|)","",{"f":4}],["(\\d+)(y|h|d|w|m)","",{"f":5}]]}; // 公共词库内联：即使页面 CSP 禁止联网也能翻译公共部分
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
    var keep = { _: 1 }; keep[CONF.common] = 1; keep[CONF.navFile] = 1;
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
  var reP = new RegExp(CONF.p), reR = new RegExp(CONF.r), reO = new RegExp(CONF.o);
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
  safe(start)();
})();
