// The same reactive counter, written in Lit.
// Justified deviation from the README: lit's README shows the decorator form
// (`@customElement` / `@property`), which needs decorator tooling this
// benchmark deliberately does not use — everything is bundled with plain
// esbuild. This is Lit's documented plain-JS equivalent: a `static properties`
// field, initial values assigned in the constructor (lit.dev is explicit that
// they must not be class fields), and a manual `customElements.define`.
import { LitElement, html } from 'lit'

export class LitCounter extends LitElement {
  static properties = { count: { type: Number } }

  constructor() {
    super()
    this.count = 0
  }

  render() {
    return html`<button @click=${() => this.count++}>${this.count}</button>`
  }
}

customElements.define('lit-counter', LitCounter)
