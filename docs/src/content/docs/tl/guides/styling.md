---
title: Pag-istilo
slug: 'tl/styling'
description: 'Dalawang paraan para i-scope ang styles sa isang wcb component: style objects sa html template, o constructable stylesheets na may shadow root.'
---

May dalawang paraan tayo para ligtas na magkaroon ng scoped styles:

1. Paggamit ng style objects
2. Paggamit ng Shadow DOM at constructable stylesheets

Lubos na inirerekomenda ang paggamit ng ikalawang paraan, dahil dito, mas nakakatulong ang mga browser para sa performance.

## Paggamit ng style objects

Kapag ginagamit ang built-in na `html` function para sa tagged templates, maaaring ipasa ang style object ng uri `Partial<CSSStyleDeclaration>` sa `style` attribute ng kahit anong element. Nagbibigay-daan ito para sa calculated at conditional na mga istilo. Magbasa pa tungkol sa style objects [sa MDN](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration).

Subukan ito ngayon gamit ang [halimbawang ito sa CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/bGzXjwQ?editors=1010), o tingnan ito nang live: [Style objects demo ↗](https://demo.webcomponent.io/examples/style-objects/)

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

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

## Paggamit ng Shadow DOM at Constructable Stylesheets

Kung [ginagamit mo ang Shadow DOM](/tl/shadow-dom), maaari kang magdagdag ng `static styles` property na idaragdag sa [`adoptedStylesheets`](https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets) ng `shadowRoot`. Tumatanggap ito ng string, isang `CSSStyleSheet`, o isang array ng alinman sa mga ito.

Subukan ito ngayon gamit ang [halimbawang ito sa CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/JojmeEe?editors=1010), o tingnan ito nang live: [Constructable styles demo ↗](https://demo.webcomponent.io/examples/constructed-styles/)

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

### Pagsasama-sama ng ilang stylesheet

Magpasa ng array para mag-adopt ng higit sa isang sheet. Ina-apply ang mga ito **ayon sa pagkakasunod-sunod**, kaya ang mga huling entry ang nananalo kapag pantay ang specificity. Ilagay muna ang shared tokens o isang base sheet at ilagay ang mga per-component na istilo pagkatapos nito:

```js
// tokens.js: shared across every component
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

Ang mga entry ay maaaring string o mga ready-made [`CSSStyleSheet`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) object, at maaaring pagsamahin ang dalawa. Ang isang `CSSStyleSheet` ay ina-adopt as-is sa halip na muling gawin, kaya ang isang shared instance ay maaaring buuin nang isang beses lang at muling gamitin ng bawat component na nag-a-adopt nito:

```js
const base = new CSSStyleSheet()
base.replaceSync(tokens)

class CozyBadge extends WebComponent {
  static shadowRootInit = { mode: 'open' }
  static styles = [base, `span { font-size: 0.8em; }`]
}
```

Ang isang solong string ay patuloy na gumagana nang eksakto tulad ng dati. Ang array form ay additive.
