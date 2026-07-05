import { html, WebComponent } from 'web-component-base'

export class Counter extends WebComponent {
  static props = {
    count: 123,
  }
  get template() {
    return html`<button onclick=${() => ++this.props.count} id="btn">
      ${this.props.count}
    </button>`
  }
}

customElements.define('my-counter', Counter)
