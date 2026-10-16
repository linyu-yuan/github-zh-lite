# GitHub 中文化（iPhone 轻量版）

把 GitHub 网页界面翻译成简体中文的用户脚本，专为 iPhone Safari 优化，桌面浏览器同样可用。术语采用 [GitHub 官方简体中文文档](https://docs.github.com/zh) 的译法（仓库、拉取请求、议题、复刻、星标、工作流、工件等），拿不准的词保留英文。


## 安装

脚本地址：

```
https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/github-zh-lite.user.js
```

- **iPhone / iPad**：推荐使用 App Store 中的 **Addons** 应用（Stay、Userscripts 也可以）。在 Safari 中打开上面的地址，用 Addons 安装脚本，然后在 Safari 扩展设置中允许它在 github.com 上运行。
- **电脑**：安装 Tampermonkey 或 Violentmonkey，打开上面的地址即可安装。

**更新**：脚本头部不含自动更新地址，有新版本时请重新打开上面的地址手动重新安装。词库会随脚本版本自动刷新。

## 工作原理

- **小巧的主脚本**：主文件只有翻译逻辑和页面类型规则（约 30 KB，头部字段精简，兼容 Addons）。
- **按页面加载词库**：根据当前页面类型（仓库、议题、拉取请求、个人主页、设置等）从本仓库 `dict/` 目录下载对应词库和一份通用词库，缓存在 `localStorage`，之后无需再联网。
- **只做整句翻译**：只有整段文字（一个文本节点）完全匹配词库，或完全匹配某个整句模式（如“剩余 N 个字符”、日期、相对时间）时才替换；不会把句子里的单个英文词替换掉，避免出现“artifacts, 和 logs”这类中英混杂。句中夹着链接、用户名等元素的句子，用 `{0}` 占位的整句模板翻译。
- **先翻译再显示**：词库已缓存时，页面会短暂隐藏（最长约 0.3 秒），首屏翻译完成后立即显示，避免英文一闪而过。
- **不碰用户内容**：代码、文件名、提交信息、议题和评论正文、仓库名、用户名等保持原样；语言、时区等长列表和代词选项（they/them 等）也保持英文。
- **跟随页面变化**：GitHub 是单页应用，脚本监听文档变化和站内跳转，新出现的弹出菜单、对话框会立即翻译。
- **去掉 App 横幅**：移除 Safari 顶部的“在 App 中打开”提示。

## 覆盖率检查（开发者）

`tools/crawl.js` 用 Playwright（Chromium，iPhone 视口）打开一百多个公开 GitHub 页面（仓库各页签、议题、拉取请求、Actions、洞察、个人主页、组织、探索、话题、趋势、市场、赞助、各类搜索、Gist、登录注册、404 等），注入脚本后按脚本自身的“跳过用户内容”规则，统计仍是英文的界面文字和属性（placeholder、aria-label、title、按钮文字），按出现次数排序，并找出中英混杂的句子。

```
npm i playwright && npx playwright install chromium
node tools/build-userscript.js          # 由 tools/src.user.js 生成 github-zh-lite.user.js
node tools/crawl.js                      # 输出 crawl-result.json
node tools/apply.js crawl-result.json    # 合并 tools/additions.json，并从其他页面词库补全漏翻词条
```

需要登录才能看到的页面（各类设置）无法爬取，相应词条来自上游词库和人工整理（`tools/additions.json`）。

## 已知限制

- 少数新界面或不常见页面仍可能有英文；拿不准准确译法的词条刻意保留英文。
- 首次打开某类页面需要联网下载一次词库。
- GitHub 改版后个别译文可能暂时失效。

## 致谢与许可

翻译词库与思路基于 [maboloshi/github-chinese](https://github.com/maboloshi/github-chinese)，感谢原作者及贡献者。本项目同样以 [GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.html) 许可发布。
