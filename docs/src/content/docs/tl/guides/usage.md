---
title: Paggamit
slug: 'tl/usage'
description: Ideklara ang static props at ang template getter, tapos patakbuhin ang component mula sa HTML — ang mga attribute ang reactive state.
---

Tingnan ito nang live: [Kitchen sink demo ↗](https://demo.webcomponent.io/examples/demo/) na pinagsasama ang ilang feature, o [Single-file pen ↗](https://demo.webcomponent.io/examples/pens/counter-toggle.html) para sa pinakamaliit na posibleng setup.

Sa iyong component class:

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

Sa iyong HTML page:

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
