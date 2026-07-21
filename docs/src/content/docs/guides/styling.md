---
title: Styling
slug: styling
---

There are two ways we can safely have scoped styles:

1. Using style objects
2. Using the Shadow DOM and constructable stylesheets

It is highly recommended to use the second approach, as with it, browsers can assist more for performance.

## Using style objects

When using the built-in `html` function for tagged templates, a style object of type `Partial<CSSStyleDeclaration>` can be passed to any element's `style` attribute. This allows for calculated and conditional styles. Read more on style objects [on MDN](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration).

Try it now with this [example on CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/bGzXjwQ?editors=1010), or see it live: [Style objects demo ↗](https://demo.webcomponent.io/examples/style-objects/)

```js
import { WebComponent } from 'https://unpkg.com/web-component-base@latest/dist/index.js'

class StyledElement extends WebComponent {
  static props = {
    emphasize: false,
    type: 'warn',
  }

  #typeStyles = {
    warn: {
      backgroundColor: 'yellow',
      border: '1px solid orange',
    },
    error: {
      backgroundColor: 'orange',
      border: '1px solid red',
    },
  }

  get template() {
    return html`
      <div
        style=${{
          ...this.#typeStyles[this.props.type],
          padding: '1em',
        }}
      >
        <p style=${{ fontStyle: this.props.emphasize && 'italic' }}>Wow!</p>
      </div>
    `
  }
}

customElements.define('styled-elements', StyledElement)
```

## Using the Shadow DOM and Constructable Stylesheets

If you [use the Shadow DOM](/shadow-dom), you can add a `static styles` property which will be added to the `shadowRoot`'s [`adoptedStylesheets`](https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets). It accepts a string, a `CSSStyleSheet`, or an array of either.

Try it now with this [example on CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/JojmeEe?editors=1010), or see it live: [Constructable styles demo ↗](https://demo.webcomponent.io/examples/constructed-styles/)

```js
class StyledElement extends WebComponent {
  static shadowRootInit = {
    mode: 'open',
  }

  static styles = `
    div {
      background-color: yellow;
      border: 1px solid black;
      padding: 1em;

      p {
        text-decoration: underline;
      }
    }
  `

  get template() {
    return html`
      <div>
        <p>Wow!?</p>
      </div>
    `
  }
}

customElements.define('styled-elements', StyledElement)
```

### Composing several stylesheets

Pass an array to adopt more than one sheet. They are applied **in order**, so later entries win on equal specificity — put shared tokens or a base sheet first and per-component styles after it:

```js
// tokens.js — shared across every component
export const tokens = `
  :host {
    --cozy-radius: 6px;
    --cozy-accent: rebeccapurple;
  }
`

// cozy-button.js
import { tokens } from './tokens.js'

class CozyButton extends WebComponent {
  static shadowRootInit = { mode: 'open' }
  static styles = [
    tokens,
    `
      button {
        border-radius: var(--cozy-radius);
        background: var(--cozy-accent);
      }
    `,
  ]
}
```

Entries may be strings or ready-made [`CSSStyleSheet`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) objects, and the two can be mixed. A `CSSStyleSheet` is adopted as-is rather than re-created, so one shared instance can be constructed once and reused by every component that adopts it:

```js
const base = new CSSStyleSheet()
base.replaceSync(tokens)

class CozyBadge extends WebComponent {
  static shadowRootInit = { mode: 'open' }
  static styles = [base, `span { font-size: 0.8em; }`]
}
```

A single string keeps working exactly as before — the array form is additive.
