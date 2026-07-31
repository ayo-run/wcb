---
title: サンプル
slug: 'ja/examples'
---

## ライブデモギャラリー

以下の各サンプルは、[demo.webcomponent.io ↗](https://demo.webcomponent.io/)上で単体のページとして動作します。ここは各デモとそのソースを並べて見られるライブギャラリーです。

| デモ | 内容 |
| ---- | ----- |
| [Boolean props ↗](https://demo.webcomponent.io/examples/boolean-props/) | 有無による反映、`toggleAttribute`、`[flag]` セレクター |
| [カスタム属性コンバーター ↗](https://demo.webcomponent.io/examples/attribute-converters/) | `Date`と配列propのための`toAttribute`/`fromAttribute` |
| [Propsブループリント ↗](https://demo.webcomponent.io/examples/props-blueprint/) | デフォルト値と型の単一の情報源としての`static props` |
| [Prop型の強制 ↗](https://demo.webcomponent.io/examples/strict-props/) | `static strictProps`と、デフォルトのログ出力（例外を投げない）動作 |
| [コンパイル時のprop型 ↗](https://demo.webcomponent.io/examples/typed-props/) | TypeScriptでの`this.props`の型付け |
| [型付きprops ↗](https://demo.webcomponent.io/examples/type-restore/) | 宣言された型を復元する属性のラウンドトリップ |
| [テンプレート化 ↗](https://demo.webcomponent.io/examples/templating/) | 文字列 vs `html` タグ付きテンプレートのレンダリング |
| [レンダリング調整 ↗](https://demo.webcomponent.io/examples/render-reconciliation/) | フォーカス、キャレット、入力状態を保持するインプレースパッチ |
| [スタイルオブジェクト ↗](https://demo.webcomponent.io/examples/style-objects/) | `style` propによる計算・条件付きスタイル |
| [Shadow DOM ↗](https://demo.webcomponent.io/examples/use-shadow/) | `static shadowRootInit` |
| [Constructableスタイル ↗](https://demo.webcomponent.io/examples/constructed-styles/) | `static styles`、複数シートの合成を含む |
| [ライフサイクルの順序 ↗](https://demo.webcomponent.io/examples/lifecycle-order/) | 発火するたびにログされる各フック |
| [属性のライフサイクル ↗](https://demo.webcomponent.io/examples/attribute-lifecycle/) | 属性の変更がどのようにフックを駆動するか |
| [onChangesのペイロード ↗](https://demo.webcomponent.io/examples/on-changes/) | camelCaseの`property`とkebab-caseの`attribute` |
| [部分だけを使う ↗](https://demo.webcomponent.io/examples/just-parts/) | ベースクラスを使わずに`html`/`createElement`を使う |
| [Kitchen sink ↗](https://demo.webcomponent.io/examples/demo/) | 複数の機能を組み合わせたもの |
| [単一ファイルのpen ↗](https://demo.webcomponent.io/examples/pens/counter-toggle.html) | 1つのHTMLファイルにカウンターとトグル |

## CodePenの例

### 1. Todoアプリ

タスクの追加・完了ができるシンプルなアプリです。
[CodePenで見る ↗](https://codepen.io/ayoayco-the-styleful/pen/GRegyVe?editors=1010)

![Todoアプリの画面録画](https://raw.githubusercontent.com/ayoayco/web-component-base/main/assets/todo-app.gif)

### 2. 単一HTMLファイルの例

1つの.htmlファイル内でカスタム要素を使う例です。

```html
<!doctype html>
<html lang="en">
  <head>
    <title>WC Base Test</title>
    <script type="module">
      import { WebComponent } from 'https://esm.sh/web-component-base@latest'

      class HelloWorld extends WebComponent {
        static props = {
          myName: 'World',
        }
        get template() {
          return `<h1>Hello ${this.props.myName}!</h1>`
        }
      }

      customElements.define('hello-world', HelloWorld)
    </script>
  </head>
  <body>
    <hello-world my-name="Ayo"></hello-world>
    <script>
      const helloWorld = document.querySelector('hello-world')
      setTimeout(() => {
        helloWorld.props.myName = 'Ayo zzzZzzz'
      }, 2500)
    </script>
  </body>
</html>
```

### 3. 機能別デモ

いくつかの機能に特化したデモです。

1. [文脈を認識するポストアポカリプスの人間](https://codepen.io/ayoayco-the-styleful/pen/WNqJMNG?editors=1010)
1. [シンプルなリアクティブプロパティ](https://codepen.io/ayoayco-the-styleful/pen/ZEwoNOz?editors=1010)
1. [カウンター & トグル](https://codepen.io/ayoayco-the-styleful/pen/PoVegBK?editors=1010)
1. [カスタムテンプレート化（lit-html）を使う](https://codepen.io/ayoayco-the-styleful/pen/ZEwNJBR?editors=1010)
1. [動的なスタイルオブジェクトを使う](https://codepen.io/ayoayco-the-styleful/pen/bGzXjwQ?editors=1010)
1. [Shadow DOMを使う](https://codepen.io/ayoayco-the-styleful/pen/VwRYVPv?editors=1010)
1. [バニラなカスタム要素でタグ付きテンプレートを使う](https://codepen.io/ayoayco-the-styleful/pen/bGzJQJg?editors=1010)
