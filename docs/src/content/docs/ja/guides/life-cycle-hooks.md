---
title: ライフサイクルフック
slug: 'ja/life-cycle-hooks'
---

フックメソッドを提供することで、コンポーネントのライフサイクル内で特定のイベントが発生したときの挙動を定義できます。

実際に動く様子はこちら: [ライフサイクルの順序デモ ↗](https://demo.webcomponent.io/examples/lifecycle-order/)は各フックが発火するたびにログを出力し、[属性のライフサイクルデモ ↗](https://demo.webcomponent.io/examples/attribute-lifecycle/)は属性の変更がどのようにそれらを駆動するかを示します。

### onInit()

- コンポーネントがDOMに接続されたときにトリガーされます
- コンポーネントのセットアップに最適です

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class ClickableText extends WebComponent {
  // コンポーネントがHTMLドキュメント内で使われたときに呼び出される
  onInit() {
    this.onclick = () => console.log('>>> click!')
  }

  get template() {
    return `<span style="cursor:pointer">Click me!</span>`
  }
}
```

### afterViewInit()

- ビューが最初に初期化された後にトリガーされます

```js
class ClickableText extends WebComponent {
  // コンポーネントのinnerHTMLが最初に埋められたときに呼び出される
  afterViewInit() {
    const footer = this.querySelector('footer')
    // ビューが初期化された後、footerに対して何か処理を行う
  }

  get template() {
    return `<footer>Awesome site &copy; 2023</footer>`
  }
}
```

### onDestroy()

- コンポーネントがDOMから切断されたときにトリガーされます
- `onInit()` で行ったセットアップを元に戻すのに最適です

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class ClickableText extends WebComponent {
  clickCallback() {
    console.log('>>> click!')
  }

  onInit() {
    this.onclick = this.clickCallback
  }

  onDestroy() {
    console.log('>>> removing event listener')
    this.removeEventListener('click', this.clickCallback)
  }

  get template() {
    return `<span style="cursor:pointer">Click me!</span>`
  }
}
```

### onChanges()

- attribute値が変更されたときにトリガーされます
- `changes` オブジェクトは**property**と**attribute**をきれいに分離します。
  - `property`: `props` へのアクセス方法に一致する**camelCase**のpropキー（例: `myName`）
  - `attribute`: 変更された**kebab-case**のattribute名（例: `my-name`）
  - `previousValue` / `currentValue`: 変更前と変更後の値

`props` から直接値を読み取るには `property` を使い（`this.props[property]`）、生のattribute名が必要なときは `attribute` を使ってください。

実際に動く様子はこちら: [onChangesのペイロードデモ ↗](https://demo.webcomponent.io/examples/on-changes/)

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class ClickableText extends WebComponent {
  // attribute値が変更されたときに呼び出される
  onChanges(changes) {
    const { property, attribute, previousValue, currentValue } = changes
    console.log('>>> ', { property, attribute, previousValue, currentValue })
  }

  get template() {
    return `<span style="cursor:pointer">Click me!</span>`
  }
}
```

:::caution[破壊的変更]
`onChanges` のペイロードは、**attributeとproperty**を明確に区別するようになりました。以前は `property` にkebab-caseの_attribute_名が入っていました。現在は（`props` へのアクセスに一致する）camelCaseの_prop_キーが入り、kebab-caseのattribute名は新しい `attribute` フィールドに移動しました。

```js
// 変更前
onChanges({ property /* 'my-name' */, previousValue, currentValue }) {}

// 変更後
onChanges({ property /* 'myName' */, attribute /* 'my-name' */, previousValue, currentValue }) {}
```

以前attribute名を得るために `changes.property` を読んでいた場合は、`changes.attribute` に切り替えてください。
:::

## アップグレードの順序とバッファリングの保証

Custom Elements仕様によると、マークアップにすでにattributeが存在する状態（例: `<my-el my-name="Zoe">`）で要素がアップグレードされるとき、ブラウザは `attributeChangedCallback` を `connectedCallback` **より前**に発火します。文字どおりに受け取ると、これは `render()` と `onChanges()` が `onInit()` より前に実行される可能性があることを意味し、そのため `onInit` で行うセットアップ（イベントの配線、外部状態の読み取りなど）は、最初のレンダリングの時点ではまだ行われていないことになります。happy-dom/jsdomのようなテスト環境はこの順序を再現しないため、コンポーネントはテストでは通過しても、実際のブラウザでは誤動作することがあります。

`WebComponent` はこの落とし穴を取り除きます。要素が接続される**前**に届くattributeの変更はバッファリングされます。

- **prop値は即座に適用される**ため、`onInit()` の内部ですでに `this.props` は正しい状態になっています。
- **`render()` と `onChanges()` の副作用は延期され**、`onInit()` が実行された後に行われます。

接続時、順序は常に次のとおりです。

1. `onInit()`: `this.props` はすでにマークアップで指定されたattributeを反映済み
2. 単一の `render()`: バッファリングされたすべてのpropを一度に反映する
3. `afterViewInit()`

**`onChanges()` は `onInit()` より前に発火することは決してありません。** 接続前のattribute変更は `onChanges()` を通して再生される**ことはありません**。最初の `render()` がすでにそれらを反映しているため、`onChanges()` は接続後の正真正銘の変更のためだけに予約されています。要素が接続された後は、attributeの変更は通常どおりに振る舞います。各変更が即座に `render()` と `onChanges()` をトリガーします。
