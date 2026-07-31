---
title: 一部だけを使う
slug: 'ja/just-parts'
description: WebComponentベースクラスを継承せずに、html、createElementなどの内部機能を素のHTMLElementで使う。
---

一部の機能を使うために、ベースクラス全体を拡張する必要はありません。すべての内部機能は個別に公開・利用可能なので、自分のクラスの上で実質的にその挙動を構築することができます。

以下は、バニラの `HTMLElement` を拡張したクラスで `html` タグ付きテンプレートを使う例です。[CodePenでも見られます ↗](https://codepen.io/ayoayco-the-styleful/pen/bGzJQJg?editors=1010)、あるいは実際に動く様子はこちら: [一部だけを使うデモ ↗](https://demo.webcomponent.io/examples/just-parts/)。

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
