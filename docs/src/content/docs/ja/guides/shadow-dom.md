---
title: Shadow DOMを使う
slug: 'ja/shadow-dom'
description: static shadowRootInitでコンポーネントごとにShadow DOMを有効にする方法と、ShadowRootInitのオプションによる違い。
---

コンポーネント全体でShadow DOMを使うようにオプトインするには、`ShadowRootInit` 型のオブジェクト値を持つ静的プロパティ `shadowRootInit` を追加します（[MDNのオプション一覧](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options)を参照）。

今すぐ試す: [CodePenで ↗](https://codepen.io/ayoayco-the-styleful/pen/VwRYVPv?editors=1010)、あるいは実際に動く様子はこちら: [Shadow DOMデモ ↗](https://demo.webcomponent.io/examples/use-shadow/)

例:

```js
class ShadowElement extends WebComponent {
  static shadowRootInit = {
    mode: 'open', // 'open' または 'closed' を指定できます
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
