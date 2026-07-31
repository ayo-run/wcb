---
title: 使用 Shadow DOM
slug: 'zh-cn/shadow-dom'
---

添加一个类型为 `ShadowRootInit` 的静态属性 `shadowRootInit`（参见 [MDN 上的选项说明](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options)），即可为整个组件选用 Shadow DOM。

现在就试试 [在 CodePen 上体验 ↗](https://codepen.io/ayoayco-the-styleful/pen/VwRYVPv?editors=1010)，或查看实况：[Shadow DOM 演示 ↗](https://demo.webcomponent.io/examples/use-shadow/)

示例：

```js
class ShadowElement extends WebComponent {
  static shadowRootInit = {
    mode: 'open', // 可以是 'open' 或 'closed'
  }

  get template() {
    return html`
      <div>
        <p>Wow!?</p>
      </div>
    `
  }
}

customElements.define('shadow-element', ShadowElement)
```
