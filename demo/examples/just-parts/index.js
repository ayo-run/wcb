import { html } from 'web-component-base/html'
import { createElement } from 'web-component-base/utils'

/**
 * You don't have to extend `WebComponent` to use its parts. The `html` tag and
 * the `createElement` util work on a plain `HTMLElement`, so you can build the
 * reactive-template behavior into your own classes.
 */
class MyQuote extends HTMLElement {
  connectedCallback() {
    let count = 0
    const el = createElement(
      html`<button
        id="quote-btn"
        onClick=${(e) => {
          e.target.textContent = `clicked ${++count}`
        }}
      >
        click me
      </button>`
    )
    this.appendChild(el)
  }
}

customElements.define('my-quote', MyQuote)
