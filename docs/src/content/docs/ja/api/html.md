---
title: html
slug: 'ja/api/html'
description: html タグ付きテンプレート関数と、それが生成するvnodeの形状。
---

マークアップをvnodeツリーに変換するタグ付きテンプレート関数で、コンポーネントの[`template`](/ja/api/web-component/#template)として使用します。

```js
import { html } from 'web-component-base'
// または
import { html } from 'web-component-base/html.js'
```

```js
get template() {
  return html`<p class="greeting">Hello, ${this.props.name}!</p>`
}
```

これは[htm](https://github.com/developit/htm)をhyperscriptファクトリーに束縛したものであるため、htmの構文がすべてそのまま使えます。標準的なHTML、自己終了タグ、テキストおよびattribute位置での `${}` 補間、スプレッドprop（`...${obj}`）、そしてオプションの閉じタグ（`<//>`）です。

## 戻り値

| マークアップ         | 戻り値                                     |
| ----------------- | ------------------------------------------- |
| 単一のルート       | 1つのvnodeオブジェクト                            |
| 複数のルート       | vnodeの配列                          |
| 何もない           | `undefined`                                 |

vnodeはプレーンなオブジェクトです。

```js
html`<p class="a">hi</p>`
// { type: 'p', props: { class: 'a' }, children: ['hi'] }
```

| フィールド  | 型              | 説明                                          |
| ---------- | ----------------- | ---------------------------------------------------- |
| `type`     | `string`          | タグ名                                         |
| `props`    | `object \| null`  | 書かれたとおりのattributeとproperty                 |
| `children` | `any[]`           | 子のvnodeとテキスト。テキストは生の値のまま保持される     |

ツリーはプレーンなオブジェクトであるため、比較可能かつシリアライズ可能であり、これによって `render()` はある回のレンダリングを次のレンダリングと比較できます。

`` html`` `` は `undefined` を返します。これはコンポーネントが何もレンダリングしないための慣用的な方法で、以前のレンダリング内容をそのまま画面に残すのではなく、レンダリングされたサブツリーを空にします。

実際に動く様子はこちら: [テンプレート化デモ ↗](https://demo.webcomponent.io/examples/templating/)

## propの適用方法

`props` の各エントリは、[`applyProp`](/ja/api/utils/#applypropel-prop-value)によって、次の順序で適用されます。

1. `style` オブジェクトはルールごとに適用される
2. 要素がその名前を**DOMプロパティ**として持っている場合は、そのプロパティに代入される。これにより、イベントハンドラー（`onclick=${fn}`）や文字列以外の値もその型を保つ
3. 対応するDOMプロパティを持たないboolean値は、HTMLのboolean属性としてトグルされる
4. それ以外はすべてシリアライズされ、attributeとして設定される

同じルールが新規作成された要素とパッチされた要素の両方に適用されるため、propは初回レンダリングと再レンダリングとで同じように振る舞います。

`style` propは、camelCaseのCSSプロパティのオブジェクトを受け付けます。

```js
html`<div style=${{ color: 'red', padding: '1em' }}>x</div>`
```

実際に動く様子はこちら: [スタイルオブジェクトデモ ↗](https://demo.webcomponent.io/examples/style-objects/)

## 再レンダリング

vnodeツリーを返すことで、インプレースな調整をオプトインします。同じタグの要素は再利用され、変更されたpropとテキストのみが操作され、余った子要素は削除されます。それが何を保持するか、そして非キーマッチングの注意点については、[Template vs Render](/ja/template-vs-render/)を参照してください。実際に動く様子はこちら: [レンダリング調整デモ ↗](https://demo.webcomponent.io/examples/render-reconciliation/)
