// @ts-check
import { html, WebComponent } from 'web-component-base'

export class Toggle extends WebComponent {
  static props = {
    toggle: false,
  }
  handleToggle() {
    this.props.toggle = !this.props.toggle
  }
  get template() {
    return html`
      <button onclick=${() => this.handleToggle()} id="toggle">
        ${this.props.toggle ? 'On' : 'Off'}
      </button>
    `
  }
}

customElements.define('my-toggle', Toggle)
