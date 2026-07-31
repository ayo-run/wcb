---
title: 使い方
slug: 'ja/usage'
---

実際に動く様子はこちら: [Kitchen sinkデモ ↗](https://demo.webcomponent.io/examples/demo/)は複数の機能を組み合わせたもの、[単一ファイルのpen ↗](https://demo.webcomponent.io/examples/pens/counter-toggle.html)は最小構成の例です。

コンポーネントクラス内:

```js
// HelloWorld.mjs
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class HelloWorld extends WebComponent {
  static props = {
    myName: 'World',
    emotion: 'sad',
  }
  get template() {
    return `
      <h1>Hello ${this.props.myName}${this.props.emotion === 'sad' ? '. 😭' : '! 🙌'}</h1>
    `
  }
}

customElements.define('hello-world', HelloWorld)
```

HTMLページ内:

```html
<head>
  <script type="module" src="HelloWorld.mjs"></script>
</head>
<body>
  <hello-world my-name="Ayo" emotion="sad">
  <script>
      const helloWorld = document.querySelector('hello-world');

      setTimeout(() => {
        helloWorld.setAttribute('emotion', 'excited');
      }, 2500)
  </script>
</body>
```
