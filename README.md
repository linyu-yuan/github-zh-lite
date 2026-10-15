# GitHub 中文化 Lite（iPhone 轻量版）

专为 **iPhone Safari + Stay** 优化的 GitHub 界面中文化用户脚本。

安装：<https://github.com/linyu-yuan/github-zh-lite/raw/main/github-zh-lite.user.js>

## 特点
- 纯 ES5，`@grant none`，不使用任何 `GM_` API，无 `@require`，词库内联（约 1.37 万条静态词条 + 约 1100 条正则规则）。
- 覆盖 github.com 全站（仪表板/首页、仓库代码/议题/拉取请求/操作/发行版/Wiki/洞察/设置、个人主页、通知、探索、搜索、市场、设置页）及 gist.github.com：上游各页面词库合并为一张查找表。
- 补充新版仪表板常用词条（早上好/下午好/晚上好、"询问任何问题或输入 @ 来添加上下文"、调试、代理、创建议题等）。
- 性能优先：MutationObserver 只把新增节点入队，由 `requestIdleCallback`（不支持时退化为 `setTimeout`）按时间片分批翻译；从不在每次突变时全文重扫；只修改 `nodeValue` 与 `placeholder`/`aria-label`/`title`，从不改 `innerHTML`；已翻译节点会被标记，避免反馈循环。
- 跳过代码块、文件内容、`.markdown-body`、输入框/文本域、contenteditable 以及用户内容（评论、提交信息、文件名、仓库名、用户名等）。
- 支持 Turbo / PJAX / React 软导航（`turbo:load`、`popstate`、`soft-nav:end` 等），每次导航最多一次扫描。

## 已知限制
- 词库来自上游多个页面合并，同一英文在不同页面译法不同时取首个，个别词可能不够贴切；上游使用函数的 278 条动态正则规则未移植。
- React 渲染的文字可能在重渲染时被还原为英文，脚本会再次翻译，但不会与 React 对抗。
- 未翻译任何用户生成内容，也不提供在线机翻。

## 致谢与许可
词库转换自 [maboloshi/github-chinese](https://github.com/maboloshi/github-chinese) 的 `locals.js`
（© 2016-2021 楼教主 52cik，© 2021-至今 沙漠之子 maboloshi），遵循 **GPL-3.0**。本项目同样以 GPL-3.0 发布，见 [LICENSE](LICENSE)。
