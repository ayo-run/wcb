---
title: スタイリング
slug: 'ja/styling'
---

スコープ付きスタイルを安全に実現する方法は2つあります。

1. スタイルオブジェクトを使う方法
2. Shadow DOMとconstructableスタイルシートを使う方法

パフォーマンスの面でブラウザがより支援しやすくなるため、2番目の方法を強く推奨します。

## スタイルオブジェクトを使う

タグ付きテンプレート用の組み込み `html` 関数を使うとき、`Partial<CSSStyleDeclaration>` 型のスタイルオブジェクトを任意の要素の `style` 属性に渡すことができます。これにより、計算されたスタイルや条件付きスタイルが可能になります。スタイルオブジェクトについて詳しくは[MDN](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration)を参照してください。

今すぐこの[CodePenの例 ↗](https://codepen.io/ayoayco-the-styleful/pen/bGzXjwQ?editors=1010)で試すか、実際に動く様子はこちら: [スタイルオブジェクトデモ ↗](https://demo.webcomponent.io/examples/style-objects/)

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class StyledElement extends WebComponent {
  static props = {
    emphasize: false,
    type: 'warn',
  }

  #typeStyles = {
    warn: {
      backgroundColor: 'yellow',
      border: '1px solid orange',
    },
    error: {
      backgroundColor: 'orange',
      border: '1px solid red',
    },
  }

  get template() {
    return html`
      <div
        style=${{
          ...this.#typeStyles[this.props.type],
          padding: '1em',
        }}
      >
        <p style=${{ fontStyle: this.props.emphasize && 'italic' }}>Wow!</p>
      </div>
    `
  }
}

customElements.define('styled-elements', StyledElement)
```

## Shadow DOMとConstructableスタイルシートを使う

[Shadow DOMを使う](/ja/shadow-dom)場合、`static styles` プロパティを追加できます。これは `shadowRoot` の[`adoptedStylesheets`](https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets)に追加されます。文字列、`CSSStyleSheet`、またはそのいずれかの配列を受け付けます。

今すぐこの[CodePenの例 ↗](https://codepen.io/ayoayco-the-styleful/pen/JojmeEe?editors=1010)で試すか、実際に動く様子はこちら: [Constructableスタイルデモ ↗](https://demo.webcomponent.io/examples/constructed-styles/)

```js
class StyledElement extends WebComponent {
  static shadowRootInit = {
    mode: 'open',
  }

  static styles = `
    div {
      background-color: yellow;
      border: 1px solid black;
      padding: 1em;

      p {
        text-decoration: underline;
      }
    }
  `

  get template() {
    return html`
      <div>
        <p>Wow!?</p>
      </div>
    `
  }
}

customElements.define('styled-elements', StyledElement)
```

### 複数のスタイルシートを合成する

複数のシートを採用するには配列を渡します。これらは**順番どおりに**適用されるため、同じ詳細度であれば後の項目が優先されます。共有のトークンやベースシートを先に置き、コンポーネントごとのスタイルをその後に置いてください。

```js
// tokens.js: すべてのコンポーネントで共有
export const tokens = `
  :host {
    --cozy-radius: 6px;
    --cozy-accent: rebeccapurple;
  }
`

// cozy-button.js
import { tokens } from './tokens.js'

class CozyButton extends WebComponent {
  static shadowRootInit = { mode: 'open' }
  static styles = [
    tokens,
    `
      button {
        border-radius: var(--cozy-radius);
        background: var(--cozy-accent);
      }
    `,
  ]
}
```

各項目は文字列でも、あらかじめ作成された[`CSSStyleSheet`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet)オブジェクトでもよく、両者を混在させることもできます。`CSSStyleSheet` は再作成されるのではなく、そのまま採用されるため、共有インスタンスを一度だけ構築し、それを採用するすべてのコンポーネントで再利用できます。

```js
const base = new CSSStyleSheet()
base.replaceSync(tokens)

class CozyBadge extends WebComponent {
  static shadowRootInit = { mode: 'open' }
  static styles = [base, `span { font-size: 0.8em; }`]
}
```

単一の文字列は、これまでどおりそのまま機能します。配列形式は追加的なものです。
