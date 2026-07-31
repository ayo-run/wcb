---
title: WebComponent
slug: 'ja/api/web-component'
description: 'WebComponentベースクラス: 静的設定、インスタンスメンバー、ライフサイクルフック、attributeコンバーター。'
---

すべてのコンポーネントが拡張するベースクラスです。パッケージのルート、またはそれ自身のモジュールからインポートします。

```js
import { WebComponent } from 'web-component-base'
// または
import { WebComponent } from 'web-component-base/WebComponent.js'
```

`WebComponent` は `HTMLElement` を拡張しているため、サブクラスは他のカスタム要素と同様に
`customElements.define()` で登録します。

TypeScriptでは、`static props` の形状を型引数として渡すことで、型付きの
`this.props` を得られます。

```ts
type CozyButtonProps = {
  variant: 'primary' | 'ghost'
  disabled: boolean
}

class CozyButton extends WebComponent<CozyButtonProps> {
  static props: CozyButtonProps = {
    variant: 'primary',
    disabled: false,
  }
}
```

## 静的プロパティ

### `static props`

宣言されたprop名とそのデフォルト値のオブジェクトです。

```js
static props = { count: 0, label: 'hi', disabled: false }
```

これは同時に3つのことを決定します。

- **観測対象attribute。** 各キーはkebab-caseに変換されるため、`maxCount` は
  `max-count` を観測します。
- **実行時の型ガード。** 各デフォルト値の `typeof` がそのpropの宣言された型になります。異なる型の書き込みは拒否されます（[`strictProps`](#static-strictprops)を参照）。
- **`this.props` のコンパイル時の型。** このオブジェクトがクラスの型引数として渡された場合です。

デフォルト値はインスタンスごとに `structuredClone` でコピーされるため、オブジェクトや配列のデフォルト値がインスタンス間で共有されることはありません。クローンできない値（関数、クラスインスタンス）は、例外をスローする代わりに参照として保持されます。

各クラスが最初に使用される際、attributeに反映できないデフォルト値は `console.warn` で報告されます。

| デフォルト値          | 警告                                                 |
| ------------------ | --------------------------------------------------- |
| 関数またはsymbol     | 反映不可能: 代わりにハンドラーやrefを使ってください     |
| `true`             | booleanのデフォルトは `false` にすべきです: 名前を反転してください |

`true` のbooleanデフォルト値が推奨されないのは、HTMLには真がデフォルトのboolean属性が存在しないためです。つまり不在は「false」と「デフォルト」の両方を意味しなければなりません。そのpropの `false` の状態にちなんで名前を付けてください（`enabled` ではなく `disabled`）。

実際に動く様子はこちら: [Propsブループリントデモ ↗](https://demo.webcomponent.io/examples/props-blueprint/)

### `static styles`

constructableスタイルシートとしてシャドウルートに採用されるCSSです。

```js
static shadowRootInit = { mode: 'open' }
static styles = `p { color: red; }`
```

文字列、`CSSStyleSheet`、またはその両方を混在させた配列を受け付けます。配列は宣言された順序で採用されるため、共有のトークンシートを先に、コンポーネントごとのルールをその後に置くことができます。文字列は一度だけ `CSSStyleSheet` にコンパイルされます。既存の `CSSStyleSheet` インスタンスはそのまま採用され、複数のコンポーネント間で共有できます。

採用はレンダリングごとではなく、要素が構築される際に**インスタンスごとに一度だけ**行われます。

[`shadowRootInit`](#static-shadowrootinit) が必要です。シャドウルートがなければ採用先が存在せず、その失敗はスローされるのではなく `console.error` で報告されます。

実際に動く様子はこちら: [Constructableスタイルデモ ↗](https://demo.webcomponent.io/examples/constructed-styles/)

### `static shadowRootInit`

[`ShadowRootInit`](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options)
オブジェクトです。これが存在することが、コンポーネントをシャドウDOMにオプトインさせます。シャドウルートは構築時にアタッチされ、レンダリング対象になります。

```js
static shadowRootInit = { mode: 'open' }
```

これがない場合、コンポーネントは自身のlight DOMにレンダリングします。

実際に動く様子はこちら: [Shadow DOMデモ ↗](https://demo.webcomponent.io/examples/use-shadow/)

### `static strictProps`

`true` の場合、宣言された型と一致しない値を代入すると `TypeError` がスローされます。

```js
static strictProps = true
```

デフォルトでは違反を `console.error` で報告し、その書き込みをスキップします。これにより、誤った代入が `render()` や `onChanges()` を止めてしまうことはありません。

いずれの場合も、`null` と `undefined` は常に許可されます。

実際に動く様子はこちら: [Prop型の強制デモ ↗](https://demo.webcomponent.io/examples/strict-props/)

### `static get observedAttributes`

[`static props`](#static-props)のkebab-caseに変換されたキーを返します。ベースクラスによって提供されるため、通常は自分で定義する必要はありません。

## インスタンスプロパティ

### `props`

コンポーネントのprop値に対する `Proxy` を返す、読み取り専用のアクセサーです。camelCaseのキーを直接読み書きできます。

```js
this.props.count += 1
```

値を変更する書き込みは、[`toAttribute()`](#toattributename-value)を通して対応するattributeに反映され、それがレンダリングをトリガーします。すでに保持している値を代入しても何も起こりません。

### `template`

コンポーネントがレンダリングする内容を返す、読み取り専用のgetterです。2種類がサポートされています。

- [`html`](/ja/api/html/)タグ付きテンプレート: vnodeツリーで、再レンダリング時にその場で調整されます
- **文字列**: レンダリング対象の `innerHTML` に代入されます

どちらも同じ対象にレンダリングされます。`shadowRootInit` が設定されている場合はシャドウルート、そうでなければ要素自身です。`` html`` ``（これは `undefined` になります）または
`''` を返すと、レンダリングされたサブツリーが空になります。これは、消費者がslotで挿入したlight-DOMの子要素を乱すことなく、コンポーネントが何もレンダリングしない方法です。

2種類の間を切り替えるのはどちらの方向でも安全です。文字列でのレンダリングはvnodeの記録をリセットするため、次のvnodeレンダリングはゼロから再構築されます。

ベースの実装は `''` を返します。

実際に動く様子はこちら: [テンプレート化デモ ↗](https://demo.webcomponent.io/examples/templating/)

### `render()`

`template` をレンダリング対象にレンダリングします。接続時、およびprop・attributeが変更されるたびに自動的に呼び出されるため、自分で呼び出すことはめったにありません。

vnodeテンプレートの場合、新しいツリーは前のツリーと比較され、再レンダリングは**既存のDOMをその場でパッチします**。それが何を保持するか、そして非キーマッチングの注意点については、[Template vs Render](/ja/template-vs-render/)を参照してください。

## ライフサイクルフック

これらのいずれもオーバーライドできます。すべてデフォルトでは何もしません。

| フック              | 実行タイミング                                          |
| ----------------- | ----------------------------------------------------- |
| `onInit()`        | 接続時、最初のレンダリングの前                            |
| `afterViewInit()` | 接続時、最初のレンダリングの後                            |
| `onChanges(changes)` | 観測対象のattributeが変更された後                       |
| `onDestroy()`     | 要素が切断されたとき                                     |

接続時、順序は常に次のとおりです: デフォルト値の反映 → `onInit()` → `render()` →
`afterViewInit()`。プラットフォームが接続*前*に発火するattribute駆動のレンダリングと `onChanges()` の呼び出しはバッファリングされるため、マークアップに書かれたattributeであっても、`onInit()` は必ず最初のレンダリングより前に実行されることが保証されます。

`onChanges()` は次を受け取ります。

| フィールド        | 型       | 説明                                        |
| --------------- | -------- | -------------------------------------------- |
| `property`      | `string` | `props` へのアクセスに一致するcamelCaseのpropキー |
| `attribute`     | `string` | 変更されたkebab-caseのattribute名             |
| `previousValue` | `any`    | 変更前の値                                    |
| `currentValue`  | `any`    | 変更後の値                                    |

具体的な使用例は[ライフサイクルフック](/ja/life-cycle-hooks/)を参照してください。実際に動く様子はこちら: [ライフサイクルの順序デモ ↗](https://demo.webcomponent.io/examples/lifecycle-order/)と[onChangesのペイロードデモ ↗](https://demo.webcomponent.io/examples/on-changes/)

## Attributeコンバーター

1つのpropがprop/attributeの境界をどのように横断するかを制御するには、これらをオーバーライドし、扱わないpropについては `super` を呼び出してください。

デフォルトの変換は、値をJSONを介してラウンドトリップします。JSONが復元できない型（`Date`、`Map`、`Set`、`URL`、クラスインスタンス）を `static props` に置くには、オーバーライドされたコンバーターが必要です。シリアライズ不可能なケースを含む実例については、[カスタムattribute変換](/ja/prop-access/#カスタムattribute変換)を参照してください。

### `toAttribute(name, value)`

prop値を、それを反映するattribute値に変換します。

| パラメータ | 型     | 説明                              |
| --------- | -------- | ---------------------------------------- |
| `name`    | `string` | camelCaseのpropキー                       |
| `value`   | `any`    | 反映されるprop値           |
| **戻り値** | `string \| null` | attribute値、またはattributeを削除する場合は `null` |

`null` を返すとattributeが**削除されます**。これは `false` のbooleanがattribute不在になる仕組みであり、どのpropに対しても機能します。

```js
toAttribute(name, value) {
  if (name === 'point') return `${value.x},${value.y}`
  return super.toAttribute(name, value)
}
```

### `fromAttribute(name, value)`

attribute値を、それが表すprop値に変換します。`toAttribute()` の逆です。

| パラメータ | 型     | 説明                                   |
| --------- | -------- | -------------------------------------------- |
| `name`    | `string` | camelCaseのpropキー                            |
| `value`   | `string` | attribute値。決して `null` にはならない             |
| **戻り値** | `any`  | `this.props[name]` に保存される値      |

**存在する**attributeに対してのみ呼び出されます。削除は代わりに宣言されたデフォルト値へのリセットで処理されるため、コンバーターが `null` を扱う必要は決してありません。

型付きpropに対する不正な値は、スローされるのではなく生の文字列にフォールバックするため、`render()` と `onChanges()` が飛ばされることはありません。

実際に動く様子はこちら: [カスタムattributeコンバーターデモ ↗](https://demo.webcomponent.io/examples/attribute-converters/)と[型付きpropsデモ ↗](https://demo.webcomponent.io/examples/type-restore/)

## Boolean props

Boolean propsは両方向でHTMLの慣習に従います。**存在すれば
`true`、存在しなければ `false` です**。

| 状態    | Attribute            | `toAttribute` の戻り値 |
| ------- | -------------------- | --------------------- |
| `true`  | 存在、値は空 | `''`                  |
| `false` | 不在               | `null`                |

存在する値はどれも、リテラルな `flag="false"` を含めて `true` と読み取られます。これはネイティブの `disabled="false"` が依然として無効状態を意味するのと同じです。attributeの削除は常に `false` になり、宣言されたデフォルト値になることは決してありません。

設定するには `toggleAttribute(name, bool)` を使ってください。
`setAttribute(name, String(bool))` を書くと常に `true` を意味します。wcbは、boolean属性が `"true"` や `"false"` として書かれたのを検知するとコンソールに警告を出すため、この反転が静かに失敗することはありません。

`"false"` が意味を持つattribute（`aria-*`、`contenteditable`）は
**string** のpropとして宣言すべきです。

実際に動く様子はこちら: [Boolean propsデモ ↗](https://demo.webcomponent.io/examples/boolean-props/)
