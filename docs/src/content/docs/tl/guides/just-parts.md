---
title: Paggamit lang ng Ilang Bahagi
slug: 'tl/just-parts'
---

Hindi mo kailangang palawigin ang buong base class para gamitin ang ilang feature. Lahat ng internals ay exposed at magagamit nang hiwa-hiwalay kaya praktikal mong maibubuo ang behavior sa sarili mong mga class.

Narito ang halimbawa ng paggamit ng `html` tag template sa isang class na nagpapalawig mula sa vanilla na `HTMLElement`... [Tingnan din sa CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/bGzJQJg?editors=1010), o tingnan ito nang live: [Just the parts demo ↗](https://demo.webcomponent.io/examples/just-parts/).

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
