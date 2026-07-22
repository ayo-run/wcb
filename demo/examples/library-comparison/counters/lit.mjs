// The same reactive counter, written in Lit.
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
