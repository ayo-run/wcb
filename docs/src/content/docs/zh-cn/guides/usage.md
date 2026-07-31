---
title: 用法
slug: 'zh-cn/usage'
---

查看实况：[综合功能演示 ↗](https://demo.webcomponent.io/examples/demo/) 将多个功能组合在一起，或查看 [单文件 pen ↗](https://demo.webcomponent.io/examples/pens/counter-toggle.html) 了解最简配置。

在你的组件类中：

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

在你的 HTML 页面中：

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
