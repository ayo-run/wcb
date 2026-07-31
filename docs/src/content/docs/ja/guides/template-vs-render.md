---
title: template vs render()
slug: 'ja/template-vs-render'
description: 読み取り専用のtemplateゲッターとrender()の関係、render()が自動で呼ばれるタイミング、他のテンプレートライブラリ用に上書きする方法。
---

このメンタルモデルは、コンポーネントを作成する際の認知的な複雑さを減らすことを目指しています。

1. `template` は読み取り専用のプロパティ（`get` キーワードで初期化される）で、コンポーネントのビューが_どのように_レンダリングされるかを表します。
1. ビューのレンダリングを引き起こす `render()` メソッドがあります。
1. この `render()` メソッドは、属性値が変更されるたびに、内部で_自動的に_呼び出されます。
1. 必要であれば、任意のタイミングでこの `render()` メソッドを_任意で_呼び出し、レンダリングを引き起こすこともできます（例えば、手動でレンダリングをトリガーする必要のある、観測対象外のprivateプロパティがある場合など）。
1. カスタムの `template` を扱うために `render()` 関数をオーバーライドすることも可能です。`lit-html` を使った例はこちらです: [CodePenで見る ↗](https://codepen.io/ayoayco-the-styleful/pen/ZEwNJBR?editors=1010)

実際に動く様子はこちら: [テンプレート化デモ ↗](https://demo.webcomponent.io/examples/templating/)は2種類のテンプレートを示し、[レンダリング調整デモ ↗](https://demo.webcomponent.io/examples/render-reconciliation/)はインプレースの再レンダリングが何を保持するか（フォーカス、キャレット位置、未確定の入力値がすべて保持されます）を示します。

## コンポーネントの合成

コンポーネントの `template` は、他のコンポーネントを好きなだけ深くネストして含めることができます。

```js
class CounterBoard extends WebComponent {
  static props = { title: 'Board' }
  get template() {
    return html`
      <h3>${this.props.title}</h3>
      <counter-row name="alpha"></counter-row>
      <counter-row name="bravo"></counter-row>
    `
  }
}
```

ネストされた各コンポーネントは、**自身がレンダリングするDOMを自分で所有します**。外側のコンポーネントが再レンダリングされるとき、reconcilerはネストされた要素に渡すpropをパッチします（これが親から子へデータが流れる仕組みです）が、その要素自身の子は決して触れません。そのため、ネストされたコンポーネントは、祖先が無関係な理由で再レンダリングされても、自身のレンダリング内容や内部状態を保持し続けます。データはattributeとして下方向に流れるため、ネストされたコンポーネントがattributeから読み戻せる値（プリミティブ、あるいはJSONラウンドトリップを生き延びるオブジェクト/配列）を渡すようにしてください。実際に動く様子はこちら: [ネストされた合成デモ ↗](https://demo.webcomponent.io/examples/nested-composition/)。

唯一の例外は**slotプロジェクション**です。shadow-DOMコンポーネントのタグの_内側_に書く子要素はあなたのコンテンツであり、そのコンポーネントの `<slot>` に投影されるため、親が引き続きそれらを調整し続けます。対照的に、light-DOMコンポーネントは自身の子要素の上にレンダリングするため、投影された子要素としてではなく、attribute経由でデータを渡すようにしてください。
