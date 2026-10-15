# GitHub 中文化 Lite（iPhone 轻量版）v2

专为 **iPhone Safari + Stay** 优化的 GitHub 界面中文化用户脚本。

安装：<https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/github-zh-lite.user.js>

## v2 变化
- **脚本本体约 89 KB**：加载器 + 公共词库（上游 `public`）内联；各页面词库（仓库、议题、拉取请求、操作、设置、仪表板、通知、个人主页……共 275 类，与上游分组一致）放在 `dict/<页面类型>.json`，按需用 `fetch()` 从 raw.githubusercontent.com 加载，并以版本号为键缓存在 localStorage。加载失败时只用公共词库，不影响页面。
- **查找更快**：先精确查表（页面词库 → 公共词库），未命中才跑正则；正则按“必需字面量”预筛（`indexOf` 不含就跳过），每页无字面量的规则限 30 条。
- **分片处理**：MutationObserver 只入队并防抖 80 ms，`requestIdleCallback` 每片最多约 50 个节点 / 8 ms；跳过代码、文件内容、`.markdown-body`、输入框、contenteditable、隐藏子树（展开时再补译）、以及用户内容（标题、评论、提交信息、文件名、仓库名、用户名、话题标签等）。
- **移植上游函数规则**：日期（`Jul 24, 2025`、`Updated on …`、`Joined on …`）、相对时间（`2 days ago`、`about 1 month ago`、`in 5 minutes`、`yesterday` 等）；GitHub 的 `<relative-time>` 元素直接设置 `lang="zh-CN"` 让其原生输出中文。
- **漏翻收集器**：左下角半透明小圆钮（数字为已收集条数），点开面板可“复制漏翻列表”（纯文本，按页面类型分组，每行“原文<TAB>路径”）、“清空”、“隐藏按钮”。隐藏后在任意 GitHub 网址末尾加 `#zh-lite` 即可恢复。数据只保存在本机 localStorage。

## 性能（Playwright，iPhone 13 UA/视口，CPU 6 倍降速，同一已加载页面注入脚本）
| 页面 | v1 注入耗时 | v2 注入耗时 | v1 长任务合计 | v2 长任务合计 |
|---|---|---|---|---|
| 仓库首页 | 368 ms | 31 ms | 608 ms | 0 ms |
| 议题列表 | 230 ms | 29 ms | 475 ms | 70 ms |
| 拉取请求 | 280 ms | 29 ms | 461 ms | 0 ms |
| 操作 | 241 ms | 33 ms | 760 ms | 75 ms |
| 探索 | 234 ms | 33 ms | 337 ms | 0 ms |
| 个人主页 | 263 ms | 37 ms | 482 ms | 0 ms |
完整数据见 `tools/bench-v1-vs-v2.json`。

## 已知限制
- 未登录无法测试仪表板/新版首页、通知、设置等页面（词库已包含）。
- 上游少量依赖函数的特殊规则（约 400 条中的大部分）未移植，仅移植了日期/相对时间。
- 首次访问某类页面需联网下载该页词库（之后走缓存）；若 Stay 的环境禁止跨域 fetch，则只有公共词库生效。
- React 重渲染可能把文字还原为英文，脚本会再次翻译但不与 React 对抗。
- 遵循官方中文术语；不确定的词条保持英文。

## 重新生成
下载上游 `locals.js` 到 `tools/`，执行 `node build.js && node gen.js <版本号>`。

## 致谢与许可
词库转换自 [maboloshi/github-chinese](https://github.com/maboloshi/github-chinese) 的 `locals.js`
（© 2016-2021 楼教主 52cik，© 2021-至今 沙漠之子 maboloshi），遵循 **GPL-3.0**。本项目同样以 GPL-3.0 发布，见 [LICENSE](LICENSE)。
