// The same reactive counter, written in Elena (@elenajs/core).
// Elena renders HTML first and progressively enhances, so the click handler is
// wired up in `firstUpdated` rather than inline in the template. `count` is a
// non-reflected reactive prop.
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
