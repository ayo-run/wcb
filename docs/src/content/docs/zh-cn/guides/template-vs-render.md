---
title: template 与 render()
slug: 'zh-cn/template-vs-render'
---

这一心智模型旨在降低编写组件时的认知复杂度：

1. `template` 是一个只读属性（用 `get` 关键字初始化），表示组件视图*如何*被渲染。
1. 有一个 `render()` 方法会触发视图渲染。
1. 每当属性值发生变化，这个 `render()` 方法就会在底层*自动*被调用。
1. 如果需要，你可以在任意时刻*可选地*调用这个 `render()` 方法来触发渲染（例如，当你有私有的、未被观察的属性需要手动触发渲染时）
1. 也可以重写 `render()` 函数来处理自定义 `template`。这里有一个使用 `lit-html` 的示例：[在 CodePen 上查看 ↗](https://codepen.io/ayoayco-the-styleful/pen/ZEwNJBR?editors=1010)

查看实况：[模板化演示 ↗](https://demo.webcomponent.io/examples/templating/) 展示了两种模板类型，[渲染协调演示 ↗](https://demo.webcomponent.io/examples/render-reconciliation/) 展示了原地重新渲染能保留哪些内容：焦点、光标位置和尚未提交的输入值都会被保留。

## 组合组件

一个组件的 `template` 可以包含其他组件，并可以嵌套至任意深度：

```js
class CounterBoard extends WebComponent {
  static props = { title: 'Board' }
  get template() {
    return html`
      <h3>${this.props.title}</h3>
      <counter-row name="alpha"></counter-row>
      <counter-row name="bravo"></counter-row>
    `
  }
}
```

每个嵌套组件都**自行拥有它所渲染的 DOM**。当外层组件重新渲染时，
协调器会 patch 它传递给嵌套元素的 props（这正是数据从父到子流动的方式），
但绝不会触碰该元素自身的子节点，因此即使祖先组件因无关原因重新渲染，
嵌套组件也会保留其已渲染的内容及任何内部状态。数据以属性形式向下流动，
因此传递的值应当是嵌套组件能够从属性中读回的：原始值，或是能经过
JSON 往返转换而保持不变的对象/数组。查看实况：[嵌套组合演示 ↗](https://demo.webcomponent.io/examples/nested-composition/)。

唯一的例外是**插槽投影（slot projection）**：你写在一个 shadow-DOM
组件标签*内部*的子元素属于你的内容，会被投影到它的 `<slot>` 中，因此
父组件会继续协调这些内容。相比之下，light-DOM 组件会渲染覆盖其自身的子节点，
因此应当通过属性而不是通过投影子元素向它传递数据。
