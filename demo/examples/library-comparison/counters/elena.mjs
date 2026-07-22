// The same reactive counter, written in Elena (@elenajs/core).
// Elena's `html` has no inline event syntax, so the click handler is attached
// in `firstUpdated` (after the first render) rather than in the template.
// `count` is a non-reflected reactive prop.
import { Elena, html } from '@elenajs/core'

export class ElenaCounter extends Elena(HTMLElement) {
  static tagName = 'elena-counter'
  static props = [{ name: 'count', reflect: false }]

  count = 0

  render() {
    return html`<button type="button">${this.count}</button>`
  }

  firstUpdated() {
    this.element.addEventListener('click', () => {
      this.count++
    })
  }
}

ElenaCounter.define()
