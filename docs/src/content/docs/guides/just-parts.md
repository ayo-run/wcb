---
title: Using Just Some Parts
slug: 'just-parts'
description: Use html, createElement and the other internals on a plain HTMLElement, without extending the WebComponent base class.
---

You don't have to extend the whole base class to use some features. All internals are exposed and usable separately so you can practically build the behavior on your own classes.

Here's an example of using the `html` tag template on a class that extends from vanilla `HTMLElement`... also [View on CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/bGzJQJg?editors=1010), or see it live: [Just the parts demo ↗](https://demo.webcomponent.io/examples/just-parts/).

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
