// The same reactive counter, written in web-component-base.
// One reactive `count` prop, a click handler, a re-render on change.
import { WebComponent, html } from 'web-component-base'

export class WcbCounter extends WebComponent {
  static props = { count: 0 }

  get template() {
    return html`
      <button onClick=${() => ++this.props.count}>${this.props.count}</button>
    `
  }
}

customElements.define('wcb-counter', WcbCounter)
