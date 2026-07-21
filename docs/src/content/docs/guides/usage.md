---
title: Usage
slug: usage
---

See it live: [Kitchen sink demo ↗](https://demo.webcomponent.io/examples/demo/) puts several features together, or [Single-file pen ↗](https://demo.webcomponent.io/examples/pens/counter-toggle.html) for the smallest possible setup.

In your component class:

```js
// HelloWorld.mjs
import { WebComponent } from 'https://unpkg.com/web-component-base@latest/dist/index.js'

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

In your HTML page:

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
