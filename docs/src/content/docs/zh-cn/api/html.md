---
title: html
slug: 'zh-cn/api/html'
description: html 标签模板函数及其生成的 vnode 结构。
---

一个标签模板函数，将标记转换为一棵 vnode 树，用作组件的
[`template`](/api/web-component/#template)。

```js
import { html } from 'web-component-base'
// 或者
import { html } from 'web-component-base/html.js'
```

```js
get template() {
  return html`<p class="greeting">Hello, ${this.props.name}!</p>`
}
```

它是绑定到 hyperscript 工厂上的 [htm](https://github.com/developit/htm)，因此
完整的 htm 语法都适用：标准 HTML、自闭合标签、文本和属性位置的 `${}`
插值、展开 props（`...${obj}`），以及可选的闭合标签（`<//>`）。

## 返回值

| 标记内容           | 返回                                         |
| ------------------ | -------------------------------------------- |
| 单个根节点          | 一个 vnode 对象                               |
| 多个根节点          | 一个 vnode 数组                               |
| 无内容              | `undefined`                                  |

一个 vnode 是一个普通对象：

```js
html`<p class="a">hi</p>`
// { type: 'p', props: { class: 'a' }, children: ['hi'] }
```

| 字段       | 类型              | 说明                                                   |
| ---------- | ----------------- | ------------------------------------------------------ |
| `type`     | `string`          | 标签名                                                  |
| `props`    | `object \| null`  | 编写时的属性和特性                                       |
| `children` | `any[]`           | 子 vnode 和文本；文本以原始值形式保留                     |

因为这棵树是一个普通对象，所以它是可比较、可序列化的，这也是 `render()`
能够对相邻两次渲染做差异对比的原因。

`` html`` `` 返回 `undefined`。这是组件“渲染为空”的惯用方式，它会清空已渲染的
子树，而不是让屏幕上保留前一次的渲染结果。

查看实况：[模板化演示 ↗](https://demo.webcomponent.io/examples/templating/)

## props 是如何被应用的

`props` 中的每个条目都由 [`applyProp`](/api/utils/#applypropel-prop-value)
按以下顺序应用：

1. `style` 对象会逐条规则应用
2. 元素自身拥有的、作为 **DOM 属性（property）**存在的名称会被赋值到该属性上，
   因此事件处理函数（`onclick=${fn}`）和非字符串值都能保留其类型
3. 没有匹配 DOM 属性的布尔值会作为 HTML 布尔特性（attribute）被切换
4. 其余的一切都会被序列化并设为一个特性（attribute）

新创建的元素和被 patch 的元素遵循同一条规则，因此某个 prop 在首次渲染和
重新渲染时的行为是一致的。

`style` prop 接受一个由驼峰式 CSS 属性组成的对象：

```js
html`<div style=${{ color: 'red', padding: '1em' }}>x</div>`
```

查看实况：[样式对象演示 ↗](https://demo.webcomponent.io/examples/style-objects/)

## 重新渲染

返回一棵 vnode 树即选用了原地协调：同标签的元素会被复用，只有发生变化的
props 和文本会被更改，多余的节点会被裁剪。关于这会保留哪些内容以及非
keyed 匹配的注意事项，参见 [Template vs Render](/template-vs-render/)。
查看实况：[渲染协调演示 ↗](https://demo.webcomponent.io/examples/render-reconciliation/)
