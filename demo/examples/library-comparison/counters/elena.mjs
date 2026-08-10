// The same reactive counter, written in Elena (@elenajs/core).
// Uses Elena's documented `static events` pattern: the framework
// delegates the listed events from the inner element and re-binds
// them if a re-render replaces it; the handler listens on the host,
// which is stable across renders. `count` is a non-reflected
// reactive prop.
import { Elena, html } from '@elenajs/core'

export class ElenaCounter extends Elena(HTMLElement) {
  static tagName = 'elena-counter'
  static props = [{ name: 'count', reflect: false }]
  static events = ['click']

  count = 0

  render() {
    return html`<button type="button">${this.count}</button>`
  }

  constructor() {
    super()
    this.addEventListener('click', () => {
      this.count++
    })
  }
}

ElenaCounter.define()
