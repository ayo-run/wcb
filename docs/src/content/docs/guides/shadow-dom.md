---
title: Using the Shadow DOM
slug: shadow-dom
---

Add a static property `shadowRootInit` with object value of type `ShadowRootInit` (see [options on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options)) to opt-in to using shadow dom for the whole component.

Try it now [on CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/VwRYVPv?editors=1010), or see it live: [Shadow DOM demo ↗](https://demo.webcomponent.io/examples/use-shadow/)

Example:

```js
class ShadowElement extends WebComponent {
  static shadowRootInit = {
    mode: 'open', // can be 'open' or 'closed'
  }

  get template() {
    return html`
      <div>
        <p>Wow!?</p>
      </div>
    `
  }
}

customElements.define('shadow-element', ShadowElement)
```
