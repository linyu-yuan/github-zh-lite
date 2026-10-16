# GitHub 中文化（iPhone 轻量版）v2.5

专为 **iPhone Safari + Stay** 优化的 GitHub 界面中文化用户脚本。

安装：<https://raw.githubusercontent.com/linyu-yuan/github-zh-lite/main/github-zh-lite.user.js>

## v2.5 变化
- 渐进显示：不再等 DOMContentLoaded，解析越过首屏（视口内内容已翻译）即显示页面；硬超时由 600 ms 降为 300 ms。
- 显示前只做精确查表，日期/计数等正则规则推迟到显示后补译。
- 6 倍降速实测：页面可见时间比 v2.4 提前约 0.15–0.35 s，英文闪烁仍为 0。

## v2.4 变化
- 名称改为“GitHub 中文化（iPhone 轻量版）”（仓库名与安装地址不变，更新不受影响）。
- 移除 Safari 智能 App 横幅（“在 GitHub App 中打开”）：document-start 时立即删除 `<meta name="apple-itunes-app">`，并在解析期间用 MutationObserver 持续删除。注意：Safari 可能在解析该 meta 时就已决定显示横幅，或脚本注入晚于此时，横幅仍可能出现。
- 防英文闪烁：已有缓存词库时，页面在首轮翻译完成前隐藏（最多 600 ms，超时必定显示）；首次无缓存访问不隐藏。新增节点（包括 Turbo/React 导航后换入的内容）在 MutationObserver 回调中同步翻译（每批最多 12 ms），先于绘制。

## v2.3 变化
- 下拉框 `<option>` 文本现在会翻译（提交值不变：无 value 属性的选项会先补上原文 value）；按钮型 `<input type=submit|button|reset>` 的 value、只读展示框的 value 会翻译；可编辑输入框只翻 placeholder，`reason:assign` 之类查询保持英文。
- 代词选项 they/them、she/her、he/him 保持英文，仅翻译“不指定”“自定义”。
- 改为 `@run-at document-start`：同步读取缓存词库，节点流入时即翻译，首次绘制前已大部分是中文；首轮翻译不因滚动/触摸暂停；冷启动时公共词库与页面词库并行下载；空闲时预取仓库/议题/拉取请求等常用页面词库；词库 JSON 结构精简。

## v2.2 变化
- 脚本本体约 30 KB：公共词库也移到 `dict/_common.json`，与页面词库一样按需加载，缓存在 localStorage，并在同一页面会话（Turbo/React 导航）中缓存已解析的对象。
- 用快速分类器（标签/类名/属性查表，结果缓存在元素上）代替对每个元素调用大选择器 `matches/closest`；跳过区域内的 DOM 变动直接丢弃。
- 只观察 childList、文本变化以及 `hidden`/`open` 属性，不再观察 aria-label/title/placeholder 属性变化。
- 去掉 1 秒轮询，改为包装 `history.pushState/replaceState`；未发生导航时不再重复整页扫描（之前 `pageshow` 会导致一次多余的全量扫描）。
- 每个时间片 4 ms / 50 个节点；滚动或触摸期间暂停，停止 200 ms 后继续。
- 正则预筛改为取规则中最长的必需字面量；日期/相对时间规则仅在文本含数字或 “ago” 等时才运行。
- 补充词条：从无头浏览器爬取 46 类公开页面收集的漏翻中，补入上游其他页面已有的译法 135 条、手工翻译 69 条（Watchers、Forks、Milestones、Labels、Latest commit、Footer navigation、显示密度等）。

## v2 变化
- **脚本本体约 89 KB（v2.2 起约 30 KB）**：加载器 + 公共词库（上游 `public`）内联；各页面词库（仓库、议题、拉取请求、操作、设置、仪表板、通知、个人主页……共 275 类，与上游分组一致）放在 `dict/<页面类型>.json`，按需用 `fetch()` 从 raw.githubusercontent.com 加载，并以版本号为键缓存在 localStorage。加载失败时只用公共词库，不影响页面。
- **查找更快**：先精确查表（页面词库 → 公共词库），未命中才跑正则；正则按“必需字面量”预筛（`indexOf` 不含就跳过），每页无字面量的规则限 30 条。
- **分片处理**：MutationObserver 只入队并防抖 80 ms，`requestIdleCallback` 每片最多约 50 个节点 / 8 ms；跳过代码、文件内容、`.markdown-body`、输入框、contenteditable、隐藏子树（展开时再补译）、以及用户内容（标题、评论、提交信息、文件名、仓库名、用户名、话题标签等）。
- **移植上游函数规则**：日期（`Jul 24, 2025`、`Updated on …`、`Joined on …`）、相对时间（`2 days ago`、`about 1 month ago`、`in 5 minutes`、`yesterday` 等）；GitHub 的 `<relative-time>` 元素直接设置 `lang="zh-CN"` 让其原生输出中文。

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
下载上游 `locals.js` 到 `tools/`，执行 `node build.js && node gen23.js <版本号>`（`node gen23.js <版本号> dev` 生成仅供开发的漏翻检测版，不发布）。`tools/dev/` 为测试脚本。

## 致谢与许可
词库转换自 [maboloshi/github-chinese](https://github.com/maboloshi/github-chinese) 的 `locals.js`
（© 2016-2021 楼教主 52cik，© 2021-至今 沙漠之子 maboloshi），遵循 **GPL-3.0**。本项目同样以 GPL-3.0 发布，见 [LICENSE](LICENSE)。
