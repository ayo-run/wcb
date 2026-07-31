---
title: 'WCB 与同类库'
slug: 'zh-cn/comparison'
---

自 v5 以来的历次发布，让 `WebComponent` 基类在遵循自定义元素规范方面更加严格，带来了体验上的提升，并通过结合 JS 组件开发的预期与稳定的 HTML 行为，整体上更加健壮。现在我们有了原地重新渲染、HTML 布尔语义以及可重写的属性转换器等多项改进。

本页将这些收益及其代价放在合适的语境中：与同类 web component 库相比，WCB 的体积如何，每个库相对于从零编写自定义元素能带来什么，以及什么时候 WCB 是正确的选择。

## 实测体积：各库实现同一组件

下表中的数字均为**实测**数据，取自在各库中分别实现的同一个最小计数器组件（一个响应式 `count` prop、一个点击处理函数、变化时重新渲染），使用 `esbuild --bundle --minify --format=esm` 打包，并分别用 gzip（level 9）和 brotli（quality 11）压缩。这就是“你的第一个组件的真实成本”：库运行时加组件代码，也就是浏览器要下载的全部内容。

查看实况：[库体积对比演示 ↗](https://demo.webcomponent.io/examples/library-comparison/) —— 所有计数器并排运行，附带各自源码，以及生成下表的 `measure.mjs` 脚本。

| 库                         | 版本    | 压缩前   | Gzip    | Brotli     |
| -------------------------- | ------- | -------- | ------- | ---------- |
| **web-component-base**     | 6.1.4   | 6.6 kB   | 2.9 kB  | **2.6 kB** |
| `@elenajs/core`            | 1.0.0   | 9.1 kB   | 3.7 kB  | 3.4 kB     |
| `lit`                      | 3.3.3   | 15.3 kB  | 5.9 kB  | 5.3 kB     |
| `@microsoft/fast-element`  | 3.0.1   | 44.8 kB  | 13.6 kB | 12.2 kB    |
| 原生 `HTMLElement`         | -       | 0.6 kB   | 0.3 kB  | 0.2 kB     |

从体量上看：即便经过了 v5.2 到 v6.1 的全部工作，WCB 的计数器组件依然**比 Elena 小约 23%，比 Lit 小约 52%，比 FAST 小约 79%**。

## 功能对比

除了直接继承 `HTMLElement` 之外，每个库还能为你带来什么、帮你省去哪些手写的样板代码：

| 能力                              | WCB 6.1                                                            | Lit 3.3                                                  | Elena 1.0                               | FAST 3.0                                         |
| --------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| 声明式模板                        | ✅ `html` 标签模板（htm）或纯字符串                                 | ✅ `lit-html` 标签模板                                    | ✅ `html` 标签模板                       | ✅ 带绑定表达式的类型化模板                        |
| 响应式 props ⇄ attributes         | ✅ `static props`，可重写转换器                                     | ✅ 带转换器的 `static properties`                          | ✅ `static props`，可选反射             | ✅ `@attr` / observables                          |
| 更新策略                          | 原地 patch（基于索引，非 keyed）                                    | 基于 part：只更新被触及的绑定，`repeat` 支持 keyed         | 批量重新渲染                             | 细粒度 observable 绑定，`repeat` 支持 keyed        |
| 重新渲染时保留 DOM 状态           | ✅ 自 v5.2 起                                                       | ✅                                                        | ✅                                       | ✅                                                 |
| 更新批处理/调度                   | ⚠️ 每次 prop 写入即渲染                                             | ✅ 异步批处理，`updateComplete`                            | ✅ 批处理，`updateComplete`               | ✅ 队列化/批处理                                   |
| 带 key 的列表协调（reconciliation）| ⚠️ 基于位置                                                        | ✅ `repeat` 指令                                          | ❌                                       | ✅ 带回收控制的 `repeat`                           |
| 默认使用 Light DOM                | ✅（通过 `static shadowRootInit` 可选启用 Shadow DOM）              | ❌ 默认 Shadow DOM                                        | ✅（Shadow 可选启用）                    | ❌ 默认 Shadow DOM                                 |
| 样式作用域                        | ✅ `static styles` + 可构造样式表（需要 shadow root）                | ✅ Shadow 作用域 CSS                                      | ✅ 无需 Shadow DOM 的作用域样式          | ✅ Shadow 作用域 + 设计令牌                        |
| SSR / 水合方案                    | ✅ 属性驱动的状态可由任意服务端渲染                                  | ✅ `@lit-labs/ssr` + 水合                                 | ✅ 服务端渲染标记 + 水合工具              | ⚠️ 实验性 SSR                                      |
| 支持零构建工具链                  | ✅ 从 CDN 导入，无需编译器                                          | ✅（可无构建使用，装饰器需要工具链）                        | ✅                                       | ⚠️ 实际使用需要工具链                              |
| 编辑器/IDE 工具支持               | ✅ 类型化 props + [CEM 分析器插件](/zh-cn/cem-plugin/)                    | ✅ 广泛支持（分析器、TS 装饰器、IDE 插件）                  | ✅ 以 CEM 为核心                         | ✅ TS 优先                                         |
| 生命周期钩子                      | `onInit`、`afterViewInit`、`onChanges`、`onDestroy`                 | 完整的响应式更新生命周期                                    | `willUpdate`、`firstUpdated`、`updated` | 完整生命周期 + 行为（behaviors）                    |
| 支持方/生态                       | 个人维护，小体量                                                    | OpenJS 基金会（2025 年由 Google 捐赠），大型生态             | 新项目（2026 年），个人作者              | 微软，为 Fluent UI 提供支持                         |

:::note[为什么这里没有 11ty WebC]
WebC 是一个编译时工具：它在 Eleventy 构建过程中解析组件，最终产出没有客户端运行时的纯 HTML。上表中的每一行讨论的都是一个库*在浏览器运行时*所做的事情，因此并排对比会是在比较两种不同的东西。如果你的组件在构建时是静态的，WebC 解决的是另一个问题。
:::

关于这些数字和能力最终意味着什么（以及什么时候不适用），参见 [为什么会有人使用 WCB？](/zh-cn/why/)。

---

_WCB 于 2026-07-24 在 v6.1.4 版本重新测量；其他库于 2026-07-19 测量，均使用 esbuild、Node zlib（gzip −9、brotli q11），版本号如上所述。方法：为每个库编写相同的计数器组件，分别打包、压缩。你可以自行重新运行——计数器和 [`measure.mjs`](https://demo.webcomponent.io/examples/library-comparison/) 脚本都在 demo 工作区中（`demo/examples/library-comparison/`）。使用上述锁定的版本号，该基准测试可轻松复现。_
