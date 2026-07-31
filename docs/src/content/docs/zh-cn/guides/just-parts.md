---
title: 只使用部分能力
slug: 'zh-cn/just-parts'
---

你不必继承整个基类才能使用其中的一些功能。所有内部实现都是单独暴露和可用的，因此你实际上可以在自己的类上自行搭建这些行为。

下面是在一个继承自原生 `HTMLElement` 的类上使用 `html` 标签模板的示例……也可以 [在 CodePen 上查看 ↗](https://codepen.io/ayoayco-the-styleful/pen/bGzJQJg?editors=1010)，或查看实况：[只使用部分能力演示 ↗](https://demo.webcomponent.io/examples/just-parts/)。

```js
import { html } from 'https://esm.sh/web-component-base@latest/html'
import { createElement } from 'https://esm.sh/web-component-base@latest/utils'

class MyQuote extends HTMLElement {
  connectedCallback() {
    const el = createElement(
      html` <button onClick=${() => alert('hey')}>hey</button>`
    )
    this.appendChild(el)
  }
}

customElements.define('my-quote', MyQuote)
```
