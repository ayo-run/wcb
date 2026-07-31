---
title: Paggamit ng Shadow DOM
slug: 'tl/shadow-dom'
description: Paganahin ang Shadow DOM sa isang component gamit ang static shadowRootInit, at kung ano ang binabago ng mga opsyon ng ShadowRootInit.
---

Magdagdag ng static property na `shadowRootInit` na may object value ng uri `ShadowRootInit` (tingnan ang [mga option sa MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options)) para mag-opt-in sa paggamit ng shadow dom para sa buong component.

Subukan ito ngayon [sa CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/VwRYVPv?editors=1010), o tingnan ito nang live: [Shadow DOM demo ↗](https://demo.webcomponent.io/examples/use-shadow/)

Halimbawa:

```js
class ShadowElement extends WebComponent {
  static shadowRootInit = {
    mode: 'open', // can be 'open' or 'closed'
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
